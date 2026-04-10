/**
 * Cloudflare Worker - SenYao System API
 *
 * Routes:
 *   POST /upload      - Upload file to R2
 *   GET  /files       - List all files
 *   GET  /files/:key  - Get single file info
 *   DELETE /files/:key - Delete file
 */

interface Env {
  IMG_BUCKET: R2Bucket
  CF_ACCOUNT_ID?: string
  CUSTOM_DOMAIN?: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

function getFileCategory(key: string): 'image' | 'document' | 'other' {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv']

  const ext = key.split('.').pop()?.toLowerCase() || ''

  if (imageExts.includes(ext)) return 'image'
  if (docExts.includes(ext)) return 'document'
  return 'other'
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get('Content-Type') || ''

  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse({ success: false, error: 'Invalid content type' }, 400)
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return jsonResponse({ success: false, error: 'No file provided' }, 400)
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return jsonResponse({ success: false, error: 'File too large (max 10MB)' }, 400)
  }

  // Generate unique key
  const ext = file.name.split('.').pop() || 'bin'
  const key = `${crypto.randomUUID()}.${ext}`

  // Upload to R2
  const bucket = env.IMG_BUCKET
  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    },
  })

  // Build URL using the request origin (Worker URL)
  const url = new URL(request.url)
  const baseUrl = env.CUSTOM_DOMAIN || `${url.protocol}//${url.host}`
  const fileUrl = `${baseUrl}/${key}`

  return jsonResponse({
    success: true,
    data: {
      key,
      url: fileUrl,
      filename: file.name,
      size: file.size,
      type: getFileCategory(key),
      createdAt: new Date().toISOString(),
    },
  })
}

async function handleListFiles(request: Request, env: Env): Promise<Response> {
  const bucket = env.IMG_BUCKET
  const url = new URL(request.url)
  const baseUrl = env.CUSTOM_DOMAIN || `${url.protocol}//${url.host}`

  const files = []
  let cursor: string | undefined

  do {
    const list = await bucket.list({
      prefix: '',
      cursor,
      limit: 100,
    })

    for (const obj of list.objects) {
      files.push({
        key: obj.key,
        url: `${baseUrl}/${obj.key}`,
        filename: obj.customMetadata?.filename || obj.key,
        size: obj.size,
        type: getFileCategory(obj.key),
        createdAt: obj.customMetadata?.uploadedAt || obj.uploaded || new Date().toISOString(),
      })
    }

    cursor = list.truncated ? list.cursor : undefined
  } while (cursor)

  // Sort by date, newest first
  files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return jsonResponse({ success: true, data: files })
}

async function handleGetFile(key: string, request: Request, env: Env): Promise<Response> {
  const bucket = env.IMG_BUCKET
  const url = new URL(request.url)
  const baseUrl = env.CUSTOM_DOMAIN || `${url.protocol}//${url.host}`

  const obj = await bucket.head(key)

  if (!obj) {
    return jsonResponse({ success: false, error: 'File not found' }, 404)
  }

  return jsonResponse({
    success: true,
    data: {
      key: obj.key,
      url: `${baseUrl}/${obj.key}`,
      filename: obj.customMetadata?.filename || obj.key,
      size: obj.size,
      type: getFileCategory(obj.key),
      createdAt: obj.customMetadata?.uploadedAt || obj.uploaded || new Date().toISOString(),
    },
  })
}

async function handleDeleteFile(key: string, env: Env): Promise<Response> {
  const bucket = env.IMG_BUCKET

  const obj = await bucket.head(key)
  if (!obj) {
    return jsonResponse({ success: false, error: 'File not found' }, 404)
  }

  await bucket.delete(key)

  return jsonResponse({ success: true, data: { key, deleted: true } })
}

async function handleGetFileContent(key: string, env: Env): Promise<Response> {
  const bucket = env.IMG_BUCKET

  const obj = await bucket.get(key)

  if (!obj) {
    return new Response('File not found', { status: 404 })
  }

  const headers = new Headers()
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream')
  headers.set('Cache-Control', 'public, max-age=31536000')
  headers.set('Access-Control-Allow-Origin', '*')

  return new Response(obj.body, { headers })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    try {
      let response: Response

      if (path === '/upload' && request.method === 'POST') {
        response = await handleUpload(request, env)
      } else if (path === '/files' && request.method === 'GET') {
        response = await handleListFiles(request, env)
      } else if (path.startsWith('/files/') && request.method === 'GET') {
        const key = decodeURIComponent(path.replace('/files/', ''))
        response = await handleGetFile(key, request, env)
      } else if (path.startsWith('/files/') && request.method === 'DELETE') {
        const key = decodeURIComponent(path.replace('/files/', ''))
        response = await handleDeleteFile(key, env)
      } else if (request.method === 'GET') {
        // Serve files directly from R2
        const key = decodeURIComponent(path.replace('/', ''))
        if (key) {
          response = await handleGetFileContent(key, env)
        } else {
          response = new Response('Not Found', { status: 404 })
        }
      } else {
        // Serve static files or return 404 for API routes
        response = new Response('Not Found', { status: 404 })
      }

      // Add CORS headers
      const newHeaders = new Headers(response.headers)
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        newHeaders.set(key, value)
      })

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      })
    } catch (err) {
      return jsonResponse(
        { success: false, error: (err as Error).message || 'Internal Server Error' },
        500
      )
    }
  },
}

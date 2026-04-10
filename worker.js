/**
 * Cloudflare Worker - Image Bed API
 *
 * Routes:
 *   POST /upload      - Upload image to R2
 *   GET  /images      - List all images
 *   GET  /images/:key - Get single image info
 *   DELETE /images/:key - Delete image
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      if (path === '/upload' && request.method === 'POST') {
        response = await handleUpload(request, env);
      } else if (path === '/images' && request.method === 'GET') {
        response = await handleListImages(request, env);
      } else if (path.startsWith('/images/') && request.method === 'GET') {
        const key = path.replace('/images/', '');
        response = await handleGetImage(key, env);
      } else if (path.startsWith('/images/') && request.method === 'DELETE') {
        const key = path.replace('/images/', '');
        response = await handleDeleteImage(key, env);
      } else if (path === '/' || path === '/index.html') {
        // Serve the frontend
        const html = await fetch(`${url.origin}/index.html`);
        response = new Response(html.body, {
          headers: { 'Content-Type': 'text/html;charset=utf-8' },
        });
      } else {
        // Serve static assets from R2 or return 404
        response = new Response('Not Found', { status: 404 });
      }

      // Add CORS headers to response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (err) {
      return jsonResponse({ success: false, error: err.message || 'Internal Server Error' }, 500);
    }
  },
};

// Handle image upload
async function handleUpload(request, env) {
  const contentType = request.headers.get('Content-Type') || '';

  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse({ success: false, error: 'Invalid content type' }, 400);
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return jsonResponse({ success: false, error: 'No file provided' }, 400);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return jsonResponse({ success: false, error: 'Invalid file type' }, 400);
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return jsonResponse({ success: false, error: 'File too large (max 10MB)' }, 400);
  }

  // Generate unique key
  const ext = file.name.split('.').pop() || getExtensionFromMime(file.type);
  const key = `${crypto.randomUUID()}.${ext}`;

  // Upload to R2
  const bucket = env.IMG_BUCKET;
  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Build URL
  const baseUrl = env.CUSTOM_DOMAIN || `https://${env.CF_ACCOUNT_ID}.r2.dev`;
  const imageUrl = `${baseUrl}/images/${key}`;

  return jsonResponse({
    success: true,
    data: {
      key,
      url: imageUrl,
      filename: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
    },
  });
}

// Handle listing images
async function handleListImages(request, env) {
  const bucket = env.IMG_BUCKET;
  const baseUrl = env.CUSTOM_DOMAIN || `https://${env.CF_ACCOUNT_ID}.r2.dev`;

  const images = [];
  let cursor;

  do {
    const list = await bucket.list({
      prefix: '',
      cursor,
      limit: 100,
    });

    for (const obj of list.objects) {
      // Skip non-image files
      if (!isImageKey(obj.key)) continue;

      images.push({
        key: obj.key,
        url: `${baseUrl}/images/${obj.key}`,
        filename: obj.customMetadata?.filename || obj.key,
        size: obj.size,
        createdAt: obj.customMetadata?.uploadedAt || obj.uploaded || new Date().toISOString(),
      });
    }

    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor);

  // Sort by date, newest first
  images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return jsonResponse({ success: true, data: images });
}

// Handle getting single image info
async function handleGetImage(key, env) {
  const bucket = env.IMG_BUCKET;
  const baseUrl = env.CUSTOM_DOMAIN || `https://${env.CF_ACCOUNT_ID}.r2.dev`;

  const obj = await bucket.head(key);

  if (!obj) {
    return jsonResponse({ success: false, error: 'Image not found' }, 404);
  }

  return jsonResponse({
    success: true,
    data: {
      key: obj.key,
      url: `${baseUrl}/images/${obj.key}`,
      filename: obj.customMetadata?.filename || obj.key,
      size: obj.size,
      createdAt: obj.customMetadata?.uploadedAt || obj.uploaded || new Date().toISOString(),
    },
  });
}

// Handle deleting image
async function handleDeleteImage(key, env) {
  const bucket = env.IMG_BUCKET;

  const obj = await bucket.head(key);
  if (!obj) {
    return jsonResponse({ success: false, error: 'Image not found' }, 404);
  }

  await bucket.delete(key);

  return jsonResponse({ success: true, data: { key, deleted: true } });
}

// Helper: JSON response
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Helper: Check if key is an image
function isImageKey(key) {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
  return imageExts.some((ext) => key.toLowerCase().endsWith(ext));
}

// Helper: Get extension from MIME type
function getExtensionFromMime(mimeType) {
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  return mimeToExt[mimeType] || 'bin';
}

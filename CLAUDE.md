# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SenYao 资源管理系统 - A resource management system with image bed and resource center features, built on Cloudflare R2 storage.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Cloudflare Workers + R2
- **State**: Zustand with persistence
- **Routing**: React Router 6 (protected routes)
- **Icons**: Lucide React

## Commands

```bash
# Frontend development
npm run dev          # Start Vite dev server on port 3000
npm run build        # Build for production (runs tsc first)
npm run preview      # Preview production build

# Cloudflare Worker
npm run worker:dev   # Local Worker dev server
npm run worker:deploy # Deploy Worker

# Deploy both (frontend to Pages, worker to Workers)
wrangler deploy      # Deploy Worker
npx wrangler pages deploy dist --project-name=senyao-system  # Deploy frontend
```

## Architecture

### Frontend (`src/`)

- **App.tsx** - Root component with React Router, handles theme via Zustand
- **Layout component** - Collapsible sidebar navigation + header with theme toggle and logout
- **ProtectedRoute** - Wraps routes requiring authentication; redirects to `/login`
- **Pages**: Home (dashboard), ImageBed (images only), ResourceCenter (images + documents)
- **Components**: UploadZone, ImageCard, FileCard, Lightbox, Toast
- **Hooks**: useFiles, useUpload, useToast
- **Services**: api.ts - All API calls to Worker

### Backend (`worker/index.ts`)

Cloudflare Worker with REST API:
- `POST /upload` - Upload file to R2, returns `{ success, data: { key, url, filename, size, type, createdAt } }`
- `GET /files` - List all files with metadata
- `GET /files/:key` - Get single file info
- `DELETE /files/:key` - Delete file
- `GET /<key>` - Serve file directly from R2 (Content-Type auto-detected)

File type detection by extension: images (jpg, png, gif, webp, avif, svg), documents (pdf, doc, xls, etc.), others

### Deployment

- Worker deployed to: `https://senyao-system.<username>.workers.dev`
- Frontend deployed to: `https://senyao-system.pages.dev`
- R2 bucket: `senyao` (bound to Worker as `IMG_BUCKET`)

### Authentication

Simple credential-based auth (username: `senyao`, password: `senyao`). Stored in `localStorage` under key `auth`. The `useAppStore` Zustand store manages `authenticated` state with persistence.

## CSS Architecture

Global CSS variables in `src/styles/globals.css`:
- Light theme: warm white (#f8f7f4), orange accent (#e85d04)
- Dark theme: dark (#0f0f0f), orange accent
- Sidebar width: 260px (expanded), 72px (collapsed)
- Border radius: 16px (lg), 12px (md), 8px (sm)

CSS files are co-located with components (e.g., `ImageCard/ImageCard.css`).

## Important Notes

- The Worker uses request origin to build file URLs - no hardcoded domains
- File URLs are: `{origin}/{key}` where key is `uuid.ext`
- 10MB max file size
- The frontend API base defaults to `https://senyao-system.xiangyu97-wang.workers.dev` if env var not set

# Uploads

## Overview

Shopfinity uses **Cloudinary** for image upload and management. Only authenticated admin users can upload and delete images.

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌────────────┐
│  Client  │     │  Next.js     │     │ Cloudinary │
│  Browser │     │  Server      │     │  API       │
└────┬─────┘     └──────┬───────┘     └─────┬──────┘
     │                  │                    │
     │  1. Select Image │                    │
     │  (client-side    │                    │
     │   validation)    │                    │
     │                  │                    │
     │  2. POST /api/uploads                │
     │  FormData (image) │                    │
     │─────────────────►│                    │
     │                  │  3. Server-side    │
     │                  │  validation        │
     │                  │  4. upload()       │
     │                  │───────────────────►│
     │                  │  5. { url, pubId } │
     │                  │◄───────────────────│
     │  6. { url,       │                    │
     │  publicId }      │                    │
     │◄─────────────────│                    │
     │                  │                    │
     │  7. DELETE /api/uploads               │
     │  { publicId }    │                    │
     │─────────────────►│                    │
     │                  │  8. destroy()      │
     │                  │───────────────────►│
     │                  │  9. success        │
     │                  │◄───────────────────│
     │  10. success     │                    │
     │◄─────────────────│                    │
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Production | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Production | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Production | Cloudinary API secret |

### Lazy Initialization

```typescript
let configured = false

function ensureConfigured(): void {
  if (!configured) {
    cloudinary.v2.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    })
    configured = true
  }
}
```

## Image Validation

### Client-Side (`components/ImageUpload.tsx`)

- **File types accepted:** JPEG, PNG, WebP
- **Max file size:** 5MB
- **UI feedback:** Drag-and-drop zone with visual feedback on hover
- **Error display:** Toast notification for invalid files

### Server-Side (`lib/cloudinary.ts`)

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function validateImage(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError(["Invalid file type. Allowed: JPEG, PNG, WebP"])
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(["File too large. Maximum size: 5MB"])
  }
}
```

## API Endpoints

### POST /api/uploads

Upload an image to Cloudinary.

- **Auth:** Admin required
- **Rate Limited:** 20 requests per 60 seconds
- **Content-Type:** `multipart/form-data`
- **Body field:** `image` (file)
- **Response:** `{ "success": true, "data": { "url": "...", "publicId": "..." } }`

### DELETE /api/uploads

Delete an image from Cloudinary.

- **Auth:** Admin required
- **Body:** `{ "publicId": "cloudinary_public_id" }`
- **Note:** Uses JSON body (not query params) for sensitive data
- **Response:** `{ "success": true, "message": "Image deleted successfully" }`

## Client-Side Upload Hook

### useUpload()

```typescript
// hooks/useUpload.ts
const { uploadImage, isUploading, error } = useUpload()

// Usage:
const result = await uploadImage(file)
// result = { url: "https://res.cloudinary.com/...", publicId: "abc123" }
```

## ImageUpload Component

The `ImageUpload` component (`components/ImageUpload.tsx`):

- **Drag-and-drop interface** with visual feedback
- **Click to browse** fallback
- **Preview** of selected/uploaded image
- **Loading state** during upload
- **Error handling** with toast notifications
- **URL output** for use in product/category forms

## Cloudinary Configuration

### Recommended Upload Settings (Cloudinary Dashboard)

| Setting | Value |
|---------|-------|
| Upload preset | Optional (can use unsigned) |
| Allowed formats | JPEG, PNG, WebP |
| Image transformation | `q_auto,f_auto` (automatic quality and format) |
| Delivery | CDN with automatic optimization |

## Usage in Admin Panel

1. **Product creation/editing** — Upload product images, then use the returned URL in the product form
2. **Category creation/editing** — Upload category header images
3. **Homepage banners** — Upload promotional banners (if implemented)

## Security

- **Admin-only endpoints** — Only authenticated admin users can upload/delete
- **Rate limited** — Prevents abuse (20 requests per minute)
- **File validation** — Both client and server check file type and size
- **No direct upload** — Images go through the server, not directly to Cloudinary from the client
- **No arbitrary URLs** — Image URLs come from Cloudinary, never from user input

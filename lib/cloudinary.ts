import { v2 as cloudinary } from "cloudinary"

let _configured = false

function ensureCloudinary() {
  if (!_configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    _configured = true
  }
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Invalid file type. Allowed: jpg, jpeg, png, webp"
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File too large. Maximum size is 5 MB"
  }
  return null
}

export async function uploadImage(buffer: Buffer, folder = "shopfinity"): Promise<{ url: string; publicId: string }> {
  ensureCloudinary()
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"))
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureCloudinary()
  await cloudinary.uploader.destroy(publicId)
}

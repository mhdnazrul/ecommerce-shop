import { NextRequest, NextResponse } from "next/server"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"
import { validateImage, uploadImage, deleteImage } from "@/lib/cloudinary"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { z } from "zod"

const deleteSchema = z.object({
  publicId: z.string().min(1, "publicId is required"),
})

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
    const { allowed, resetIn } = rateLimit(`upload:${ip}`, { interval: 60_000, maxRequests: 20 })
    if (!allowed) return rateLimitResponse(resetIn)

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      )
    }

    const error = validateImage(file)
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadImage(buffer)

    return NextResponse.json({
      success: true,
      data: { url: result.url, publicId: result.publicId },
    })
  }, { requireAdmin: true })
}

export async function DELETE(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => ({}))
    const { publicId } = validateSchema(deleteSchema, body)
    await deleteImage(publicId)
    return NextResponse.json({ success: true, message: "Image deleted" })
  }, { requireAdmin: true })
}

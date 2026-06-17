import { NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/services/product-service"
import { updateProductSchema } from "@/lib/validations/product"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const { id } = await params
    const product = await productService.getById(id)
    return NextResponse.json({ success: true, data: product })
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const { id } = await params
    const body = await req.json()
    const data = validateSchema(updateProductSchema, body)
    const product = await productService.update(id, data)
    return NextResponse.json({ success: true, data: product })
  }, { requireAdmin: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const { id } = await params
    await productService.delete(id)
    return NextResponse.json({ success: true, message: "Product deleted" })
  }, { requireAdmin: true })
}

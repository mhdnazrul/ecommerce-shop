import { NextRequest, NextResponse } from "next/server"
import { categoryService } from "@/lib/services/category-service"
import { updateCategorySchema } from "@/lib/validations/category"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const { id } = await params
    const category = await categoryService.getById(id)
    return NextResponse.json({ success: true, data: category })
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const { id } = await params
    const body = await req.json()
    const data = validateSchema(updateCategorySchema, body)
    const category = await categoryService.update(id, data)
    return NextResponse.json({ success: true, data: category })
  }, { requireAdmin: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const { id } = await params
    await categoryService.delete(id)
    return NextResponse.json({ success: true, message: "Category deleted" })
  }, { requireAdmin: true })
}

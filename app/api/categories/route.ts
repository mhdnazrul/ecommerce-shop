import { NextRequest, NextResponse } from "next/server"
import { categoryService } from "@/lib/services/category-service"
import { createCategorySchema } from "@/lib/validations/category"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function GET() {
  return apiHandler(async () => {
    const categories = await categoryService.list()
    return NextResponse.json({ success: true, data: categories })
  })
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json()
    const data = validateSchema(createCategorySchema, body)
    const category = await categoryService.create(data)
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  }, { requireAdmin: true })
}

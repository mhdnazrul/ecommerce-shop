import { NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/services/product-service"
import { createProductSchema, productQuerySchema } from "@/lib/validations/product"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
    const query = validateSchema(productQuerySchema, searchParams)
    const result = await productService.search(query)
    return NextResponse.json({ success: true, data: result })
  })
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json()
    const data = validateSchema(createProductSchema, body)
    const product = await productService.create(data)
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  }, { requireAdmin: true })
}

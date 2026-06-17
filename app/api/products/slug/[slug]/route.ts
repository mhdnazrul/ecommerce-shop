import { NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/services/product-service"
import { apiHandler } from "@/lib/errors/api-handler"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return apiHandler(async () => {
    const { slug } = await params
    const product = await productService.getBySlug(slug)
    return NextResponse.json({ success: true, data: product })
  })
}

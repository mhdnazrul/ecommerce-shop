import { NextRequest, NextResponse } from "next/server"
import { categoryService } from "@/lib/services/category-service"
import { apiHandler } from "@/lib/errors/api-handler"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return apiHandler(async () => {
    const { slug } = await params
    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 12
    const result = await categoryService.getProductsBySlug(slug, page, limit)
    return NextResponse.json({ success: true, data: result })
  })
}

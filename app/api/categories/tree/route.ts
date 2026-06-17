import { NextResponse } from "next/server"
import { categoryService } from "@/lib/services/category-service"
import { apiHandler } from "@/lib/errors/api-handler"

export async function GET() {
  return apiHandler(async () => {
    const tree = await categoryService.getTree()
    return NextResponse.json({ success: true, data: tree })
  })
}

import { NextResponse } from "next/server"
import { wishlistService } from "@/lib/services/wishlist-service"
import { apiHandler } from "@/lib/errors/api-handler"

export async function GET() {
  return apiHandler(async (session) => {
    const items = await wishlistService.getItems(session.user.id)
    return NextResponse.json({ success: true, data: items })
  }, { requireAuth: true })
}

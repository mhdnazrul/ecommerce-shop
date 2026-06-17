import { NextRequest, NextResponse } from "next/server"
import { wishlistService } from "@/lib/services/wishlist-service"
import { apiHandler } from "@/lib/errors/api-handler"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  return apiHandler(async (session) => {
    const { itemId } = await params
    await wishlistService.removeItem(session.user.id, itemId)
    return NextResponse.json({ success: true, message: "Item removed from wishlist" })
  }, { requireAuth: true })
}

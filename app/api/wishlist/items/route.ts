import { NextRequest, NextResponse } from "next/server"
import { wishlistService } from "@/lib/services/wishlist-service"
import { addWishlistItemSchema } from "@/lib/validations/cart"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function POST(req: NextRequest) {
  return apiHandler(async (session) => {
    const body = await req.json()
    const data = validateSchema(addWishlistItemSchema, body)
    const item = await wishlistService.addItem(session.user.id, data.productId)
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  }, { requireAuth: true })
}

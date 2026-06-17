import { NextRequest, NextResponse } from "next/server"
import { cartService } from "@/lib/services/cart-service"
import { updateCartItemSchema } from "@/lib/validations/cart"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  return apiHandler(async (session) => {
    const { itemId } = await params
    const body = await req.json()
    const data = validateSchema(updateCartItemSchema, body)
    const result = await cartService.updateQuantity(session.user.id, itemId, data)
    return NextResponse.json({ success: true, data: result })
  }, { requireAuth: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  return apiHandler(async (session) => {
    const { itemId } = await params
    await cartService.removeItem(session.user.id, itemId)
    return NextResponse.json({ success: true, message: "Item removed" })
  }, { requireAuth: true })
}

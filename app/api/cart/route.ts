import { NextResponse } from "next/server"
import { cartService } from "@/lib/services/cart-service"
import { apiHandler } from "@/lib/errors/api-handler"

export async function GET() {
  return apiHandler(async (session) => {
    const cart = await cartService.getCart(session.user.id)
    return NextResponse.json({ success: true, data: cart })
  }, { requireAuth: true })
}

export async function DELETE() {
  return apiHandler(async (session) => {
    const cart = await cartService.clearCart(session.user.id)
    return NextResponse.json({ success: true, data: cart })
  }, { requireAuth: true })
}

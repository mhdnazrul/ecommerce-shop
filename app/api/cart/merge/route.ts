import { NextRequest, NextResponse } from "next/server"
import { cartService } from "@/lib/services/cart-service"
import { mergeCartSchema } from "@/lib/validations/cart"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function POST(req: NextRequest) {
  return apiHandler(async (session) => {
    const body = await req.json()
    const data = validateSchema(mergeCartSchema, body)
    const cart = await cartService.mergeCart(session.user.id, data)
    return NextResponse.json({ success: true, data: cart })
  }, { requireAuth: true })
}

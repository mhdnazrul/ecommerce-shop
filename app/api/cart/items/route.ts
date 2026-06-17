import { NextRequest, NextResponse } from "next/server"
import { cartService } from "@/lib/services/cart-service"
import { addCartItemSchema } from "@/lib/validations/cart"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function POST(req: NextRequest) {
  return apiHandler(async (session) => {
    const body = await req.json()
    const data = validateSchema(addCartItemSchema, body)
    const item = await cartService.addItem(session.user.id, data)
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  }, { requireAuth: true })
}

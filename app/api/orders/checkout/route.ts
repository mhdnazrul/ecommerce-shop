import { NextRequest, NextResponse } from "next/server"
import { orderService } from "@/lib/services/order-service"
import { checkoutSchema } from "@/lib/validations/order"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function POST(req: NextRequest) {
  return apiHandler(async (session) => {
    const body = await req.json().catch(() => ({}))
    const data = validateSchema(checkoutSchema, body)
    const order = await orderService.checkout(session.user.id, data)
    return NextResponse.json({ success: true, data: order }, { status: 201 })
  }, { requireAuth: true })
}

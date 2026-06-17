import { NextRequest, NextResponse } from "next/server"
import { orderService } from "@/lib/services/order-service"
import { updateOrderStatusSchema } from "@/lib/validations/order"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params
    const body = await req.json()
    const { status } = validateSchema(updateOrderStatusSchema, body)
    const order = await orderService.updateStatus(id, status)
    return NextResponse.json({ success: true, data: order })
  }, { requireAdmin: true })
}

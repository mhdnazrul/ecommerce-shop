import { NextResponse } from "next/server"
import { orderService } from "@/lib/services/order-service"
import { apiHandler } from "@/lib/errors/api-handler"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async (session) => {
    const { id } = await params
    const order = await orderService.getOrder(session.user.id, id)
    return NextResponse.json({ success: true, data: order })
  }, { requireAuth: true })
}

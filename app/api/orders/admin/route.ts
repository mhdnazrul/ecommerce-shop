import { NextRequest, NextResponse } from "next/server"
import { orderService } from "@/lib/services/order-service"
import { orderQuerySchema } from "@/lib/validations/order"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
    const query = validateSchema(orderQuerySchema, searchParams)
    const result = await orderService.getAllOrders(query)
    return NextResponse.json({ success: true, data: result })
  }, { requireAdmin: true })
}

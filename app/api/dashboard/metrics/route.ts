import { NextResponse } from "next/server"
import { prisma } from "@/prisma/client"
import { apiHandler } from "@/lib/errors/api-handler"

export async function GET() {
  return apiHandler(async () => {
    const [totalUsers, totalProducts, totalOrders, orderAgg] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ])

    const [recentOrders, lowStockProducts] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          items: {
            take: 3,
            include: { product: { select: { name: true } } },
          },
        },
      }),
      prisma.product.findMany({
        where: { isDeleted: false, stockQuantity: { lte: 10 } },
        take: 10,
        orderBy: { stockQuantity: "asc" },
        select: { id: true, name: true, sku: true, stockQuantity: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: orderAgg._sum.totalAmount ? Number(orderAgg._sum.totalAmount) : 0,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: Number(o.totalAmount),
          customer: o.user
            ? `${o.user.firstName ?? ""} ${o.user.lastName ?? ""}`.trim() || o.user.email
            : "Unknown",
          createdAt: o.createdAt.toISOString(),
        })),
        lowStockProducts,
      },
    })
  }, { requireAdmin: true })
}

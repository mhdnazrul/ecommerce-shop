import { NextRequest, NextResponse } from "next/server"
import { reviewService } from "@/lib/services/review-service"
import { createReviewSchema, reviewQuerySchema } from "@/lib/validations/review"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
    const query = validateSchema(reviewQuerySchema, searchParams)
    const reviews = await reviewService.getByProduct(query)
    return NextResponse.json({ success: true, data: reviews })
  })
}

export async function POST(req: NextRequest) {
  return apiHandler(async (session) => {
    const body = await req.json()
    const data = validateSchema(createReviewSchema, body)
    const name = `${session.user.name ?? session.user.email}`
    const review = await reviewService.create(session.user.id, name, data)
    return NextResponse.json({ success: true, data: review }, { status: 201 })
  }, { requireAuth: true })
}

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { handleApiError, ValidationError } from "@/lib/errors"
import { z } from "zod"

interface HandlerOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
}

export async function apiHandler(
  handler: (session?: any) => Promise<NextResponse>,
  options?: HandlerOptions
): Promise<NextResponse> {
  try {
    if (options?.requireAuth || options?.requireAdmin) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
      }
      if (options?.requireAdmin && !session.user.roles?.includes("admin")) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
      }
      return await handler(session)
    }
    return await handler()
  } catch (error) {
    const { message, statusCode, errors } = handleApiError(error)
    return NextResponse.json({ success: false, message, errors }, { status: statusCode })
  }
}

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message))
  }
  return parsed.data
}

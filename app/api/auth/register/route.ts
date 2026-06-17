import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/prisma/client"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/email/resend"
import { apiHandler } from "@/lib/errors/api-handler"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

const registerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^a-zA-Z0-9]/, "Must include a special character"),
})

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
    const { allowed, resetIn } = rateLimit(`register:${ip}`, { interval: 60_000, maxRequests: 5 })
    if (!allowed) return rateLimitResponse(resetIn)

    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.issues.map((e) => e.message),
        },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password, 12)

    const customerRole = await prisma.role.findUnique({
      where: { slug: "customer" },
    })

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        isActive: true,
        roles: customerRole
          ? {
              create: {
                roleId: customerRole.id,
                assignedBy: "system",
              },
            }
          : undefined,
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    })

    // Fire welcome email asynchronously (non-blocking)
    sendWelcomeEmail(user.email, user.firstName ?? user.email).catch((err) => {
      logger.error("Failed to send welcome email", { userId: user.id, email: user.email }, err)
    })

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map((r) => r.role.slug),
        },
      },
      { status: 201 }
    )
  })
}

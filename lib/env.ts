import { z } from "zod"

const isProduction = process.env.NODE_ENV === "production"

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // NextAuth
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: isProduction ? z.string().url() : z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Google OAuth
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Stripe (required in production)
  STRIPE_SECRET_KEY: isProduction ? z.string().min(1) : z.string().optional(),
  STRIPE_WEBHOOK_SECRET: isProduction ? z.string().min(1) : z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: isProduction ? z.string().min(1) : z.string().optional(),

  // Cloudinary (required in production)
  CLOUDINARY_CLOUD_NAME: isProduction ? z.string().min(1) : z.string().optional(),
  CLOUDINARY_API_KEY: isProduction ? z.string().min(1) : z.string().optional(),
  CLOUDINARY_API_SECRET: isProduction ? z.string().min(1) : z.string().optional(),

  // Resend (required in production)
  RESEND_API_KEY: isProduction ? z.string().min(1) : z.string().optional(),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email address"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
})

export const env = envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>

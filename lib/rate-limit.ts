import { NextResponse } from "next/server"

interface RateLimitConfig {
  interval: number  // milliseconds
  maxRequests: number
}

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, 60_000)

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.interval })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.interval }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetAt - now }
}

export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { success: false, message: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } }
  )
}

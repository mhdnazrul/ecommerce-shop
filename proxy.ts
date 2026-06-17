import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const pathname = nextUrl.pathname

  // Public routes — always allowed
  const publicRoutes = [
    "/login",
    "/register",
    "/",
    "/products",
    "/categories",
    "/search",
    "/api/auth",
    "/api/webhooks",
    "/api/products",
    "/api/categories",
    "/_next",
    "/images",
    "/favicon",
  ]
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route) || pathname === route)
  if (isPublic) return NextResponse.next()

  // API routes — return 401 instead of redirect
  if (pathname.startsWith("/api/") && !isLoggedIn) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", statusCode: 401 },
      { status: 401 }
    )
  }

  // Admin routes — require Admin role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), nextUrl))
    }
    const isAdmin = req.auth?.user?.roles?.includes("admin")
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/?error=forbidden", nextUrl))
    }
    return NextResponse.next()
  }

  // Protected user routes
  const protectedRoutes = ["/cart", "/checkout", "/orders", "/wishlist", "/profile"]
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|favicon.ico).*)",
  ],
}

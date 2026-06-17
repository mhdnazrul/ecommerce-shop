"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user ?? null
  const isAdmin = user?.roles?.includes("Admin") ?? false

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error("Invalid email or password")
    }

    router.refresh()
    return true
  }

  const loginWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.refresh()
    router.push("/")
    toast.success("Logged out successfully")
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    loginWithGoogle,
    logout,
    updateSession: update,
  }
}

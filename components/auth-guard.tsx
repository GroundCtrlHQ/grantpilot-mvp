"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getUser } from "@/lib/storage"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push("/login")
      setIsAuthenticated(false)
    } else {
      if (!user.onboardingCompleted && pathname !== "/onboarding") {
        router.push("/onboarding")
        setIsAuthenticated(false)
        return
      }
      setIsAuthenticated(true)
    }
  }, [router, pathname])

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

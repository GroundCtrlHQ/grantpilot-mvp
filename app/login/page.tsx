"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setUser } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)

    // Simulate a brief loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Store user in localStorage (fake auth)
    const user = {
      email: email.trim(),
      name: email.split("@")[0] || "User",
      onboardingCompleted: false, // New users need onboarding
      subscriptionStatus: "free" as const,
    }

    setUser(user)

    toast({
      title: "Welcome to GrantPilot!",
      description: "Let's set up your profile to find the best grants for you.",
    })

    router.push("/onboarding")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-foreground text-lg font-bold">GP</span>
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">GrantPilot</CardTitle>
          </div>
          <CardDescription>Sign in to manage your grants</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            This is a prototype. Enter any email to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

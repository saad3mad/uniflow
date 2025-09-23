"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Card from "@/components/Card"
import Brand from "@/components/Brand"
import { useAuth } from "@/hooks/useAuth"

export default function SignUpPage() {
  const { signUpWithEmail } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUpWithEmail(email, password, fullName)
      // After successful sign up, redirect to dashboard or sign in
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <Brand size="lg" />
          <h1 className="font-heading text-3xl">Create your account</h1>
          <p className="text-text-secondary text-sm">Start your journey with Uniflow</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className="pill-input border w-full"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              className="pill-input border w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              className="pill-input border w-full"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="text-sm text-text-secondary mt-4 text-center">
          Already have an account? {""}
          <Link href="/auth/signin" className="text-accent-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

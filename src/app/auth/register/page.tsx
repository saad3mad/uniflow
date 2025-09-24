"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Card from "@/components/Card"
import Brand from "@/components/Brand"
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { signUpWithEmail } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit'
  })

  async function onSubmit(values: FormData) {
    setError(null)
    setLoading(true)
    try {
      const data = await signUpWithEmail(values.email, values.password, values.fullName)
      // If email confirmations are enabled, Supabase returns no session until verification
      if (!data.session) {
        router.push(`/auth/check-email?email=${encodeURIComponent(values.email)}`)
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pt-24 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated blurry background (brand aesthetic) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-accent-primary/20 to-accent-warm/20 dark:from-accent-primary/25 dark:to-accent-warm/25 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-[#6e10e0]/20 to-[#136aed]/20 dark:from-[#6e10e0]/25 dark:to-[#136aed]/25 rounded-full blur-2xl animate-float-rev" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-24 left-1/4 w-28 h-28 bg-gradient-to-br from-[#0fbed9]/20 to-[#34d399]/20 dark:from-[#0fbed9]/25 dark:to-[#34d399]/25 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-[#136aed]/20 to-[#0fbed9]/20 dark:from-[#136aed]/25 dark:to-[#0fbed9]/25 rounded-full blur-xl animate-float" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-8 right-10 w-48 h-24 bg-gradient-to-br from-[#edbd1f]/15 to-[#6e10e0]/15 dark:from-[#edbd1f]/20 dark:to-[#6e10e0]/20 rounded-full blur-3xl animate-float-rev" style={{ animationDelay: '4.5s' }}></div>
      </div>

      <Card className="relative w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <Brand size="lg" />
          <h1 className="font-heading text-3xl">Create your account</h1>
          <p className="text-text-secondary text-sm">Start your journey with Uniflow</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className="pill-input border w-full"
              type="text"
              placeholder="Jane Doe"
              {...register('fullName')}
              required
            />
            {errors.fullName && (<p className="text-red-600 text-xs">{errors.fullName.message}</p>)}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              className="pill-input border w-full"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              required
            />
            {errors.email && (<p className="text-red-600 text-xs">{errors.email.message}</p>)}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              className="pill-input border w-full"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              required
              minLength={6}
            />
            {errors.password && (<p className="text-red-600 text-xs">{errors.password.message}</p>)}
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


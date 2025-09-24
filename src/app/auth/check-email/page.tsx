"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import Card from "@/components/Card"
import Brand from "@/components/Brand"
import { supabase } from "@/lib/supabase"

export default function CheckEmailPage() {
  const params = useSearchParams()
  const email = params.get("email") || ""
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" })
  const [loading, setLoading] = useState(false)

  async function resend() {
    if (!email) return
    setLoading(true)
    setStatus({ type: "idle" })
    const { error } = await supabase.auth.resend({ type: "signup", email })
    if (error) {
      setStatus({ type: "error", message: error.message })
    } else {
      setStatus({ type: "success", message: `Verification email sent to ${email}.` })
    }
    setLoading(false)
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
          <h1 className="font-heading text-3xl">Check your email</h1>
          <p className="text-text-secondary text-sm">
            We sent a verification link to {email ? <strong>{email}</strong> : "your email"}. Click the link to verify and finish creating your account.
          </p>
        </div>

        {status.type === "success" && (
          <p className="text-green-600 text-sm mb-3">{status.message}</p>
        )}
        {status.type === "error" && (
          <p className="text-red-600 text-sm mb-3">{status.message}</p>
        )}

        <button className="btn-primary w-full" onClick={resend} disabled={loading || !email}>
          {loading ? "Resending..." : "Resend verification email"}
        </button>

        <div className="text-sm text-text-secondary mt-4 text-center">
          Already verified? {" "}
          <Link href="/auth/signin" className="text-accent-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

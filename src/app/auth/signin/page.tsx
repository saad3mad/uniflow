'use client'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Brand from '@/components/Brand'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignInPage() {
  const { signInWithEmail } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const schema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit'
  })

  async function onSubmit(values: FormData) {
    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(values.email, values.password)
      // Redirect after successful sign-in
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <Brand size="lg" />
          <h1 className="font-heading text-3xl">Welcome back</h1>
          <p className="text-text-secondary text-sm">Sign in to continue your flow</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              className="pill-input border w-full"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
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
              {...register('password')}
              placeholder="••••••••"
              required
            />
            {errors.password && (<p className="text-red-600 text-xs">{errors.password.message}</p>)}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-sm text-text-secondary mt-4 text-center">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-accent-primary hover:underline">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  )
}

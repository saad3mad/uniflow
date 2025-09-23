'use client'
import { supabase } from '@/lib/supabase'
import { ReactNode, useEffect } from 'react'

export default function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle auth state changes here
      }
    )
    
    return () => authListener.subscription.unsubscribe()
  }, [])

  return <>{children}</>
}

'use client'

import { useState, useEffect } from 'react'
import type { User, User as DatabaseUser } from '../lib/supabase'

interface AuthState {
  user: User | null
  profile: DatabaseUser | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: false
  })

  // Placeholder authentication hook - ready for new auth provider integration
  useEffect(() => {
    console.log('Authentication system not configured')
    setState({
      user: null,
      profile: null,
      loading: false
    })
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    throw new Error('Authentication provider not configured')
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    throw new Error('Authentication provider not configured')
  }

  const signInWithGoogle = async () => {
    throw new Error('Authentication provider not configured')
  }

  const signOut = async () => {
    throw new Error('Authentication provider not configured')
  }

  const updateProfile = async (updates: Partial<DatabaseUser>) => {
    throw new Error('Authentication provider not configured')
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    updateProfile
  }
}
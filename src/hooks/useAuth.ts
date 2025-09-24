'use client'

import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react'

interface AuthState {
  user: User | null
  profile: any | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true
  })

  useEffect(() => {
    // Load current session on mount to prevent redirect flashes/loops
    supabase.auth.getSession().then(({ data }) => {
      setState((prev) => ({
        ...prev,
        user: data.session?.user ?? null,
        loading: false,
      }))
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        user: session?.user || null,
        profile: null,
        loading: false,
      })
    })

    return () => authListener.subscription.unsubscribe();
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass profile data so your DB trigger can use raw_user_meta_data->>'full_name'
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    throw new Error('Authentication provider not configured')
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: any) => {
    if (!state.user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
    if (error) throw error
  };

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
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
    loading: false
  })

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState({
          user: session?.user || null,
          profile: null,
          loading: false
        })
      }
    );

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
    });
    if (error) throw error;

    // Persist basic profile data
    const userId = data.user?.id
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: fullName, email })
        .single()
      if (profileError) {
        // Not fatal for sign up, but surface to caller
        throw profileError
      }
    }
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
'use client'

import { User } from '@supabase/supabase-js';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const { user, loading } = useAuthContext();

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

  return {
    user: user as User | null,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}
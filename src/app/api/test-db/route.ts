import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Placeholder API route - ready for new database provider integration
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(1)
    
    if (error) throw error
    return NextResponse.json({ connected: true, data })
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
  }
}
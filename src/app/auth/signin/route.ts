import { type NextRequest, NextResponse } from 'next/server'

// Placeholder auth signin route - ready for new authentication provider integration
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Sign in attempt - authentication provider not configured')
    
    return NextResponse.json(
      { error: 'Authentication provider not configured' }, 
      { status: 503 }
    )
  } catch (error: any) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Authentication provider not configured' }, 
      { status: 503 }
    )
  }
}
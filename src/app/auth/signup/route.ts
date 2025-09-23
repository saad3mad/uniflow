import { type NextRequest, NextResponse } from 'next/server'

// Placeholder auth signup route - ready for new authentication provider integration
export async function GET(request: NextRequest) {
  return NextResponse.redirect('/auth/register', 302)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Sign up attempt - authentication provider not configured')
    
    return NextResponse.json(
      { error: 'Authentication provider not configured' }, 
      { status: 503 }
    )
  } catch (error: any) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Authentication provider not configured' }, 
      { status: 503 }
    )
  }
}
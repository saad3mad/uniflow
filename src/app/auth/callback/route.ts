import { NextRequest, NextResponse } from 'next/server'

// Placeholder auth callback route - ready for new authentication provider integration
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  console.log('Auth callback called - authentication provider not configured')
  
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/signin?error=auth_not_configured&error_description=Authentication provider not configured`
  )
}
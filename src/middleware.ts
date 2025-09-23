import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/auth']

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/notes', '/courses', '/calendar', '/semesters', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user is authenticated (this would typically check for a JWT token)
  // For development, we'll allow access to all routes
  const isAuthenticated = request.cookies.has('auth-token') || 
                          request.cookies.has('demo-auth') ||
                          request.headers.get('authorization') ||
                          true // Set to true for development - allows access to all routes
  
  // Always allow the public landing page
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login for protected routes
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Handle login/signup redirects for authenticated users
  if ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
}
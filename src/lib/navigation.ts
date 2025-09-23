/**
 * Navigation routing utilities for UNIFLOW
 * Handles authentication-based navigation flow
 */

// Route definitions
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  NOTES: '/notes',
  COURSES: '/courses',
  CALENDAR: '/calendar',
  SEMESTERS: '/semesters',
  SETTINGS: '/settings',
} as const

// Navigation configuration
export const NAVIGATION_CONFIG = {
  // Default route for authenticated users
  DEFAULT_AUTHENTICATED_ROUTE: PROTECTED_ROUTES.DASHBOARD,
  // Default route for non-authenticated users
  DEFAULT_PUBLIC_ROUTE: PUBLIC_ROUTES.HOME,
  // Route after successful login
  POST_LOGIN_ROUTE: PROTECTED_ROUTES.DASHBOARD,
  // Route after logout
  POST_LOGOUT_ROUTE: PUBLIC_ROUTES.HOME,
}

// Navigation items for different contexts
export const MAIN_NAVIGATION = [
  {
    name: 'Dashboard',
    href: PROTECTED_ROUTES.DASHBOARD,
    icon: 'Home',
    description: 'Your academic overview'
  },
  {
    name: 'Notes',
    href: PROTECTED_ROUTES.NOTES,
    icon: 'FileText',
    description: 'Capture and organize thoughts'
  },
  {
    name: 'Courses',
    href: PROTECTED_ROUTES.COURSES,
    icon: 'BookOpen',
    description: 'Manage your classes'
  },
  {
    name: 'Calendar',
    href: PROTECTED_ROUTES.CALENDAR,
    icon: 'Calendar',
    description: 'Track deadlines and events'
  },
  {
    name: 'Semesters',
    href: PROTECTED_ROUTES.SEMESTERS,
    icon: 'BookOpen',
    description: 'Academic periods'
  },
]

export const SETTINGS_NAVIGATION = [
  {
    name: 'Settings',
    href: PROTECTED_ROUTES.SETTINGS,
    icon: 'Settings',
    description: 'App preferences'
  },
]

// Utility functions
export function isPublicRoute(pathname: string): boolean {
  return Object.values(PUBLIC_ROUTES).includes(pathname as any)
}

export function isProtectedRoute(pathname: string): boolean {
  return Object.values(PROTECTED_ROUTES).some(route => pathname.startsWith(route))
}

export function getRedirectPath(isAuthenticated: boolean, currentPath: string): string | null {
  // If user is on root path
  if (currentPath === '/') {
    return isAuthenticated ? NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE : null
  }
  
  // If authenticated user tries to access login/signup
  if (isAuthenticated && [PUBLIC_ROUTES.LOGIN, PUBLIC_ROUTES.SIGNUP].includes(currentPath as any)) {
    return NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE
  }
  
  // If non-authenticated user tries to access protected routes
  if (!isAuthenticated && isProtectedRoute(currentPath)) {
    return `${PUBLIC_ROUTES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`
  }
  
  return null
}

export function getPostLoginRedirect(searchParams: URLSearchParams): string {
  const redirect = searchParams.get('redirect')
  if (redirect && isProtectedRoute(redirect)) {
    return redirect
  }
  return NAVIGATION_CONFIG.POST_LOGIN_ROUTE
}

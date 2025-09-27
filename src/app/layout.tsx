import type { Metadata } from 'next'
import { Inter, Montserrat_Alternates, Manrope, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import QueryProvider from '../providers/QueryProvider'
import Navbar from '../components/Navbar'
import AuthProvider from '../components/AuthProvider'
import Toaster from '../components/UI/Toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const brand = Montserrat_Alternates({
  subsets: ['latin'],
  weight: '900',
  variable: '--font-brand',
  display: 'swap',
})

const heading = Manrope({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-heading',
  display: 'swap',
})

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UNIFLOW - Academic Management Platform',
  description: 'Transform your academic journey with UNIFLOW. Manage courses, assignments, notes, and schedules in one powerful platform.',
  keywords: 'academic management, student platform, course management, assignment tracker, note taking',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${brand.variable} ${heading.variable} ${body.variable} font-body antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            {/* Add top padding to offset fixed navbar height (h-20 => ~80px) */}
            <main className="min-h-screen pt-20">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

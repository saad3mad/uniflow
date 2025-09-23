import { NextResponse } from 'next/server'

// Placeholder API route - ready for new database provider integration
export async function GET(request: Request) {
  return NextResponse.json({
    success: false,
    message: 'Database provider not configured',
    error: 'No database connection available'
  }, { status: 503 })
}
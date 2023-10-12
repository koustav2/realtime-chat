import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.rewrite(new URL('/dashboard', request.url))
}



export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}


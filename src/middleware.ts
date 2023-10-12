import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// export default withAuth(
  async function middleware(req: NextRequest) {
    return NextResponse.rewrite(new URL('/dashboard', req.url))
  }
// )

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}


import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname

    // Manage route protection
    const isAuth = await getToken({ req })
  

    if (!isAuth ) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (isAuth){
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      async authorized() {
        return false
      },
    },
  }
)

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}


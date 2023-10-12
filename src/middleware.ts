import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // Manage route protection
    const token = await getToken({ req });
    const isLoginPage = pathname.startsWith('/login');

    const sensitiveRoutes = ['/dashboard'];
    const isAccessingSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isLoginPage) {
      if (token) {
        return NextResponse.redirect('/dashboard');
      }

      return NextResponse.next();
    }

    if (!token && isAccessingSensitiveRoute) {
      return NextResponse.redirect('/login');
    }

    if (pathname === '/') {
      return NextResponse.redirect('/dashboard');
    }
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};

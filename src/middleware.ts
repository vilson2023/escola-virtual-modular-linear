import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  const isOnDashboard = path.startsWith('/dashboard');
  const isOnAdmin = path.startsWith('/admin');
  const isOnAuthPage = path.startsWith('/login') || path.startsWith('/register');

  if ((isOnDashboard || isOnAdmin) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isOnAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

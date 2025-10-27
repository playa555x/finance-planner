import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session-token')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // API routes are handled by their own authentication
  const isApiRoute = pathname.startsWith('/api/');

  // If it's a public route or API route, allow access
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next();
  }

  // If no session token and trying to access protected route, redirect to signin
  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }

  // If has session token, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

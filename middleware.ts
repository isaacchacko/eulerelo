// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/practice',
  '/leaderboard',
  '/matchmaking',
  '/room',
];

// Define public routes that should redirect to home if user is authenticated
const publicRoutes = [
  '/login',
  '/signup',
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAuthenticated = !!req.nextauth.token;

    // If user is authenticated and tries to access public routes, redirect to home
    if (isPublicRoute && isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

        // Allow access to public routes
        if (isPublicRoute) {
          return true;
        }

        // Require authentication for protected routes
        if (isProtectedRoute) {
          return !!token;
        }

        return true;
      },
    },
  }
);

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

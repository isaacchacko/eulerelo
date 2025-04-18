/**
 * Next.js Middleware Configuration
 * This middleware handles authentication and route protection for the application.
 * It intercepts all requests and ensures proper authentication for protected routes.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Configuration for the middleware
 * Specifies which routes should be protected and which should be public
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const pathname = request.nextUrl.pathname;

  // Define protected routes that require authentication
  const protectedRoutes = ["/profile", "/duel"];

  // Define auth-only routes that should redirect to profile if authenticated
  const authOnlyRoutes = ["/login", "/signup"];

  // Define public routes that should always be accessible
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/problems",
    "/leaderboard",
    "/api/problems",
    "/api/leaderboard",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth-only route
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If the route is protected and user is not authenticated,
  // redirect to the login page
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the route is auth-only (login/signup) and user is authenticated,
  // redirect to the profile page
  if (isAuthOnlyRoute && token) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Allow the request to proceed if no redirects are needed
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 * This is a performance optimization to avoid running the middleware
 * on static files and other non-API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 

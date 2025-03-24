/**
 * Next.js Middleware Configuration
 * This middleware handles authentication and route protection for the application.
 * It intercepts all requests and ensures proper authentication for protected routes.
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Configuration for the middleware
 * Specifies which routes should be protected and which should be public
 */
export default withAuth(
  // Middleware function that runs on every request
  function middleware(req) {
    // Get the pathname from the request URL
    const pathname = req.nextUrl.pathname;

    // Define protected routes that require authentication
    const protectedRoutes = [
      "/dashboard",
      "/profile",
      "/settings",
      "/api/protected",
      "/api/profile",
    ];

    // Define auth-only routes that should redirect to profile if authenticated
    const authOnlyRoutes = ["/login", "/signup"];

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Check if the current path is an auth-only route
    const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // If the route is protected and user is not authenticated,
    // redirect to the login page
    if (isProtectedRoute && !req.nextauth.token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // If the route is auth-only (login/signup) and user is authenticated,
    // redirect to the profile page
    if (isAuthOnlyRoute && req.nextauth.token) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }

    // Allow the request to proceed if no redirects are needed
    return NextResponse.next();
  },
  {
    // Configuration options for the middleware
    callbacks: {
      // Function to determine if the user is authorized
      authorized: ({ token }) => !!token,
    },
    // Pages that should be accessible without authentication
    pages: {
      signIn: "/login",
    },
  }
);

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
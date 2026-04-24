import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { AUTH_SECRET } from "@/lib/auth-secret";

const protectedRoutes = [
  "/profile",
  "/practice",
  "/duel",
  "/leaderboard",
  "/matchmaking",
  "/room",
];

const publicRoutes = ["/login", "/signup"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    const isAuthenticated = !!req.nextauth.token;

    if (isPublicRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: AUTH_SECRET,
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
        const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

        if (isPublicRoute) return true;
        if (isProtectedRoute) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

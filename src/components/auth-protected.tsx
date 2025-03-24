/**
 * AuthProtected Component
 * A higher-order component that protects routes and components from unauthorized access.
 * It handles authentication state and redirects unauthenticated users to the login page.
 */

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

/**
 * Props interface for the AuthProtected component
 * @property children - React components to be rendered when user is authenticated
 */
interface AuthProtectedProps {
  children: ReactNode;
}

/**
 * AuthProtected Component
 * Wraps content that requires authentication and handles authentication state
 * 
 * @param props - Component props containing children to be rendered
 * @returns Protected content if authenticated, redirects to login if not
 */
export default function AuthProtected({ children }: AuthProtectedProps) {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return <>{children}</>;
}

/**
 * Application Providers Component
 * This component wraps the application with necessary context providers
 * for authentication, error handling, and other global state management.
 */

"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/app/providers";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Error Fallback Component
 * Displays a user-friendly error message when an error occurs
 * 
 * @param props - Component props containing error information
 * @returns Error display component
 */
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Providers Component
 * Wraps the application with necessary context providers
 * 
 * @param props - Component props containing children to be wrapped
 * @returns Wrapped application with all necessary providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children}
        </ErrorBoundary>
      </ThemeProvider>
    </SessionProvider>
  );
} 
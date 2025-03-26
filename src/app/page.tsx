/**
 * Home Page Component
 * The main landing page of the application.
 * Showcases the platform's features and provides quick access to key functionality.
 */

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Feature Card Component
 * Displays a feature with an icon, title, and description
 * 
 * @param props - Component props containing feature information
 * @returns A feature card component
 */
function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

/**
 * Home Page Component
 * Displays the main landing page with features and call-to-action
 * 
 * @returns The home page component
 */
export default function HomePage() {
  // Get the current session state from NextAuth
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Welcome to Eulerelo
            </h1>
            <p className="mt-6 text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Practice competitive programming problems, track your progress, and
              compete with others in a fun and engaging way.
            </p>
            <div className="mt-10">
              {session ? (
                <Link
                  href="/problems"
                  className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 transition-colors"
                >
                  Start Practicing
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose Eulerelo?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Everything you need to improve your competitive programming skills
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature cards */}
            <FeatureCard
              title="Curated Problems"
              description="Access a wide range of carefully selected programming problems from various difficulty levels."
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />

            <FeatureCard
              title="Progress Tracking"
              description="Monitor your improvement with detailed statistics and performance analytics."
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />

            <FeatureCard
              title="Competitive Spirit"
              description="Compete with others on the leaderboard and challenge yourself to improve."
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Join thousands of programmers who are improving their skills with
              Eulerelo.
            </p>
            <div className="mt-8">
              {session ? (
                <Link
                  href="/problems"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  View Problems
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

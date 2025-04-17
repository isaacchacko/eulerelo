/**
 * Home Page Component
 * The main landing page of the application.
 * Showcases the platform's features and provides quick access to key functionality.
 */

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

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

export default function HomePage() {
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
              Challenge your math skills in real-time duels, climb the leaderboard, and master topics from arithmetic to calculus. Compete with others, solve problems faster, and see how you rank among math enthusiasts worldwide!
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
              Everything you need to sharpen your math skills and compete with others
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Duel Mode"
              description="Face off against other users in real-time math duels. Solve problems faster to win and boost your rank!"
              icon={
                <svg stroke="none" fill="currentColor" width="48px" height="48px" viewBox="0 0 36 36" version="1.1">
                  <path d="M15.4439 4.95181C15.2986 4.69144 14.9592 4.61525 14.7166 4.78854L14.3313 5.06374C13.8819 5.38475 13.2574 5.28066 12.9363 4.83125C12.6153 4.38184 12.7194 3.75729 13.1688 3.43628L13.5541 3.16108C14.7672 2.2946 16.4642 2.67557 17.1904 3.97743L17.6982 4.88763L19.293 3.29289C19.6835 2.90237 20.3167 2.90237 20.7072 3.29289C21.0977 3.68342 21.0977 4.31658 20.7072 4.70711L18.7111 6.70319L19.504 8.12444C19.6553 8.39561 20.0145 8.46476 20.2557 8.2691L20.62 7.97349C21.0488 7.6255 21.6786 7.69106 22.0266 8.11992C22.3746 8.54878 22.309 9.17854 21.8802 9.52653L21.5159 9.82214C20.3102 10.8004 18.5138 10.4547 17.7574 9.09883L17.241 8.17325L15.7072 9.70711C15.3167 10.0976 14.6835 10.0976 14.293 9.70711C13.9024 9.31658 13.9024 8.68342 14.293 8.29289L16.2282 6.35769L15.4439 4.95181Z"/>
                  <path d="M8.39624 14.1375C6.98014 14.4139 5.3938 14.4829 3.86566 14.4969C3.59315 15.6072 3.70616 16.3952 3.96369 16.9266C4.26563 17.5497 4.84844 17.9908 5.67151 18.1962C7.37045 18.62 9.84555 17.9475 11.4979 16.0622C11.8619 15.6469 12.4937 15.6053 12.9091 15.9693C13.3244 16.3333 13.366 16.9651 13.002 17.3805C10.9043 19.7738 7.68213 20.759 5.18742 20.1367C3.91368 19.8189 2.77557 19.0611 2.16388 17.7988C1.5568 16.546 1.55223 14.9704 2.17505 13.1726C3.01458 10.7494 4.29261 9.23163 5.58113 8.28683C6.85981 7.34925 8.09587 7.01446 8.79925 6.87036C10.4251 6.53729 11.8839 6.99511 12.699 8.06514C13.5274 9.15248 13.5 10.632 12.6068 11.852C11.6271 13.19 10.0271 13.8192 8.39624 14.1375ZM9.20064 8.82967C8.65402 8.94165 7.72508 9.19483 6.76376 9.89971C6.04297 10.4282 5.27312 11.2331 4.63331 12.4839C5.84139 12.4539 6.994 12.3735 8.01311 12.1746C9.46869 11.8905 10.4587 11.4003 10.9931 10.6705C11.424 10.0819 11.3394 9.58081 11.1081 9.27712C10.8635 8.95613 10.2603 8.61259 9.20064 8.82967Z"/>
                </svg>
              }
            />
            <FeatureCard
              title="Math for Everyone"
              description="Practice problems from basic arithmetic and algebra to geometry, trigonometry, and calculus. There's something for every level!"
              icon={
                <svg stroke="none" fill="currentColor" width="48px" height="48px" viewBox="0 0 36 36" version="1.1">
                  <path className="clr-i-outline clr-i-outline-path-1" d="M17.9,17.3c2.7,0,4.8-2.2,4.8-4.9c0-2.7-2.2-4.8-4.9-4.8c-2.7,0-4.8,2.2-4.8,4.8C13,15.1,15.2,17.3,17.9,17.3z M17.8,9.6C17.9,9.6,17.9,9.6,17.8,9.6c1.6,0,2.9,1.3,2.9,2.9s-1.3,2.8-2.9,2.8c-1.6,0-2.8-1.3-2.8-2.8C15,10.9,16.3,9.6,17.8,9.6z"></path>
                  <path className="clr-i-outline clr-i-outline-path-2" d="M32.7,16.7c-1.9-1.7-4.4-2.6-7-2.5c-0.3,0-0.5,0-0.8,0c-0.2,0.8-0.5,1.5-0.9,2.1c0.6-0.1,1.1-0.1,1.7-0.1c1.9-0.1,3.8,0.5,5.3,1.6V25h2v-8L32.7,16.7z"></path>
                  <path className="clr-i-outline clr-i-outline-path-3" d="M23.4,7.8c0.5-1.2,1.9-1.8,3.2-1.3c1.2,0.5,1.8,1.9,1.3,3.2c-0.4,0.9-1.3,1.5-2.2,1.5c-0.2,0-0.5,0-0.7-0.1c0.1,0.5,0.1,1,0.1,1.4c0,0.2,0,0.4,0,0.6c0.2,0,0.4,0.1,0.6,0.1c2.5,0,4.5-2,4.5-4.4c0-2.5-2-4.5-4.4-4.5c-1.6,0-3,0.8-3.8,2.2C22.5,6.8,23,7.2,23.4,7.8z"></path>
                  <path className="clr-i-outline clr-i-outline-path-4" d="M12,16.4c-0.4-0.6-0.7-1.3-0.9-2.1c-0.3,0-0.5,0-0.8,0c-2.6-0.1-5.1,0.8-7,2.4L3,17v8h2v-7.2c1.6-1.1,3.4-1.7,5.3-1.6C10.9,16.2,11.5,16.3,12,16.4z"></path>
                  <path className="clr-i-outline clr-i-outline-path-5" d="M10.3,13.1c0.2,0,0.4,0,0.6-0.1c0-0.2,0-0.4,0-0.6c0-0.5,0-1,0.1-1.4c-0.2,0.1-0.5,0.1-0.7,0.1c-1.3,0-2.4-1.1-2.4-2.4c0-1.3,1.1-2.4,2.4-2.4c1,0,1.9,0.6,2.3,1.5c0.4-0.5,1-1,1.5-1.4c-1.3-2.1-4-2.8-6.1-1.5c-2.1,1.3-2.8,4-1.5,6.1C7.3,12.3,8.7,13.1,10.3,13.1z"></path>
                  <path className="clr-i-outline clr-i-outline-path-6" d="M26.1,22.7l-0.2-0.3c-2-2.2-4.8-3.5-7.8-3.4c-3-0.1-5.9,1.2-7.9,3.4L10,22.7v7.6c0,0.9,0.7,1.7,1.7,1.7c0,0,0,0,0,0h12.8c0.9,0,1.7-0.8,1.7-1.7c0,0,0,0,0,0V22.7z M24.1,30H12v-6.6c1.6-1.6,3.8-2.4,6.1-2.4c2.2-0.1,4.4,0.8,6,2.4V30z"></path>
</svg>
              }
            />
            <FeatureCard
              title="Live Leaderboard"
              description="Track your progress and see how you stack up against other mathletes. Climb the ranks as you solve more problems and win duels."
              icon={
                <svg fill="currentColor" width="48px" height="48px" viewBox="0 0 36 36">
                  <path d="M22,7H16.333V4a1,1,0,0,0-1-1H8.667a1,1,0,0,0-1,1v7H2a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V8A1,1,0,0,0,22,7ZM7.667,19H3V13H7.667Zm6.666,0H9.667V5h4.666ZM21,19H16.333V9H21Z"/>
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
              Ready to Duel and Climb the Ranks?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Join a vibrant community of math competitors. Solve, duel, and rise to the top!
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

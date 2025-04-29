
/**
 * Duel Page Component
 * Allows users to find and participate in math duels.
 * Protected by authentication middleware.
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { connectSocket, getSocket } from "@/lib/socket";
import AuthProtected from "@/components/auth-protected";

/**
 * Duel Page Component
 * Displays duel information and provides a button to find matches
 * 
 * @returns The duel page component
 */
export default function DuelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  const handleFindMatch = () => {
    router.push(`/matchmaking`);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProtected>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {/* Hero section similar to home page */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white px-6 py-8">
              <h1 className="text-3xl font-bold">Math Duels</h1>
              <p className="mt-2 text-blue-100 dark:text-blue-200">
                Challenge your skills in real-time mathematics competitions
              </p>
            </div>

            {/* Main content */}
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    What is a Math Duel?
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    A Math Duel is a real-time competition between two players, testing both mathematical 
                    knowledge and speed. You'll be matched with an opponent of similar skill level for 
                    a fast-paced battle of mathematical prowess.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Duel Rules
                  </h2>
                  <div className="mt-2 space-y-3 text-gray-600 dark:text-gray-300">
                    <p>Each duel follows a standard format:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>5 minutes total time limit</li>
                      <li>5 problems of varying difficulty</li>
                      <li>Score is primarily based on accuracy (correct answers)</li>
                      <li>In case of a tie, speed determines the winner</li>
                      <li>Both participants see the same problems</li>
                      <li>Results are revealed after both players complete the duel or time expires</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Tips for Success
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Focus on accuracy first, then speed. A wrong answer earns no points, so it's better 
                    to take your time and get it right. Practice regularly to improve both your knowledge 
                    and solving speed.
                  </p>
                </div>

                <div className="pt-4">
                  <div className="flex justify-center">
                    <button
                      onClick={handleFindMatch}
                      disabled={isSearching}
                      className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white 
                        ${isSearching 
                          ? 'bg-blue-400 dark:bg-blue-700 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        } transition-colors`}
                    >
                      {isSearching ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                          Finding Match...
                        </>
                      ) : (
                        "Find Match"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional info section */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Duel Rankings
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Every duel affects your Eulerelo rating. Win duels to climb the leaderboard and 
              earn your place among the top mathematicians. Your rating will be updated after 
              each duel based on the result and your opponent's rating.
            </p>
            <div className="mt-4">
              <a 
                href="/leaderboard" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Current Leaderboard →
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthProtected>
  );
}

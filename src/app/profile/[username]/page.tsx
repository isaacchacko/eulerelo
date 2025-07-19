
'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

// refreshing from error
import { useRouter } from "next/navigation";

interface Data {
  name: string;
  createdAt: Date,
  updatedAt: Date,
  elo: number,
  problemsSolved: number
}

const DefaultData: Data = {
  name: "",
  createdAt: new Date("2025-03-01"),
  updatedAt: new Date("2025-02-01"),
  elo: 0,
  problemsSolved: 0
}

type Status = "loading" | "failed-500" | "failed-404" | "ready";

const ProfilePage = () => {

  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<Data>(DefaultData);
  const [status, setStatus] = useState<Status>("loading");

  // for refreshing given an error
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const response = await fetch("/api/profile/" + username);
      if (!response.ok) {
        console.warn("Error fetching profile, status:", response.status);

        if (response.status === 404) setStatus("failed-404");
        if (response.status === 500) setStatus("failed-500");
      }

      const data = await response.json();
      setData(data);
      setStatus("ready");
    }

    getProfile();
  }, []);


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }


  if (status.includes('failed')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-xl mb-4">Error</div>
            <p className="text-gray-600 dark:text-gray-300">{status === "failed-404" ? "No user found." : "An unknown error occurred."}</p>
            <button
              onClick={() => router.refresh()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {data.name || "Not set"}
              </p>
            </div>

            {/* Account Creation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Member Since
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* Last Updated */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Updated
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {data.updatedAt
                  ? new Date(data.updatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">{data.elo}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Problems Solved</label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">{data.problemsSolved}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

/**
 * Footer Component
 * Provides the footer section of the application with navigation links,
 * social media links, and copyright information.
 */

"use client";

import Link from "next/link";

/**
 * Footer Component
 * Displays the footer section with navigation and social links
 * 
 * @returns The footer component
 */
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-3 gap-4 place-items-center ">
          {/* Brand section */}
          <div className="col-span-1 max-w-xs">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eulerelo</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Compete head to head in math problems and track your progress.
            </p>
          </div>


          {/* Resources */}
          <div className="max-w-md">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="https://www.isaacchacko.co/about"
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social links */}
          <div className="max-w-md">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="https://github.com/isaacchacko/eulerelo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  GitHub
                </a>
              </li>
              {/*
              <li>
                <a
                  href="https://twitter.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Twitter
                </a>
              </li>
              */}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-base text-gray-500 dark:text-gray-400 text-center">
            © {new Date().getFullYear()} Eulerelo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 

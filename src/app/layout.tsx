/**
 * Root Layout Component
 * This is the root layout that wraps all pages in the application.
 * It provides the basic HTML structure and includes global components
 * like the navigation bar and footer.
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Providers } from "@/components/providers";

// Initialize the Inter font from Google Fonts
const inter = Inter({ subsets: ["latin"] });

/**
 * Metadata configuration for the application
 * Defines SEO-related information and document properties
 */
export const metadata: Metadata = {
  title: "Eulerelo - Competitive Programming Platform",
  description: "A platform for competitive programming practice and rating",
  keywords: ["competitive programming", "algorithms", "data structures", "coding practice"],
  authors: [{ name: "Isaac Chacko" }],
};

/**
 * Viewport configuration for the application
 * Defines viewport-related properties and theme color
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb", // blue-600
};

/**
 * Root Layout Component
 * Provides the base structure for all pages in the application
 * 
 * @param props - Component props containing children to be rendered
 * @returns The root layout with navigation, main content, and footer
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

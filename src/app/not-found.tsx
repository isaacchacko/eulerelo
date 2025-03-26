import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900 dark:text-white">404</h1>
        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Page Not Found</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="mt-8">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 
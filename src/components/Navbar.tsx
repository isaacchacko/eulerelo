
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">Eulerelo</h1>
          </div>

          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600">Leaderboard</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">About</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Practice</a>
          </div>

          <div className="flex items-center space-x-4">
            <a 
              href="/api/auth/signin"
              className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/api/auth/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

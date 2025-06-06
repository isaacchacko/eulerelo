import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 dark:from-blue-950 to-white dark:to-gray-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Prove Your Math Mastery in
          <span className="text-blue-600 dark:text-blue-400 block mt-2">Live Competitions</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Race head-to-head against opponents in a wide range of math topics, from addition and multiplication, to calculus, differential equations, and more. 
          Climb the ranks and become the ultimate math champion!
        </p>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4">
          <a 
            href="/match" 
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Start a Duel
          </a>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md inline-block">
          <p className="text-gray-600 dark:text-gray-300 font-mono">
            ∫<sub>0</sub><sup>π</sup> sin(x) dx = ?
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;

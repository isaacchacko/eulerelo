// app/leaderboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type SortKey = 'elo' | 'wins' | 'losses' | 'winrate' | 'gamesPlayed' | 'rank';

export default function Leaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDescending, setSortDescending] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const entriesOptions = [5, 10, 15, 20];

  // Base data with ranks precomputed based on ELO
  const baseData = [
    { id: 1, username: 'ChessMaster3000', wins: 42, losses: 5, elo: 1850 },
    { id: 2, username: 'PawnStorm', wins: 38, losses: 12, elo: 1725 },
    { id: 3, username: 'EndgameExpert', wins: 29, losses: 8, elo: 1680 },
    { id: 4, username: 'MathMagician', wins: 35, losses: 15, elo: 1620 },
    { id: 5, username: 'PrimeTime', wins: 27, losses: 10, elo: 1595 },
    { id: 6, username: 'TheIntegral', wins: 45, losses: 20, elo: 1575 },
    { id: 7, username: 'DerivativeDiva', wins: 33, losses: 18, elo: 1540 },
    { id: 8, username: 'VectorVixen', wins: 28, losses: 12, elo: 1510 },
    { id: 9, username: 'MatrixMaster', wins: 19, losses: 5, elo: 1495 },
    { id: 10, username: 'CalcQueen', wins: 22, losses: 8, elo: 1475 },
    { id: 11, username: 'AlgebraAce', wins: 17, losses: 6, elo: 1450 },
    { id: 12, username: 'TrigTitan', wins: 14, losses: 3, elo: 1435 },
    { id: 13, username: 'GeoGenius', wins: 25, losses: 10, elo: 1410 },
    { id: 14, username: 'StatsSavant', wins: 30, losses: 15, elo: 1395 },
    { id: 15, username: 'ProbProdigy', wins: 12, losses: 4, elo: 1370 },
  ];

  // Precompute ranks based on ELO once
  const dummyData = [...baseData]
    .sort((a, b) => b.elo - a.elo)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const sortedData = [...dummyData].sort((a, b) => {
    const multiplier = sortDescending ? -1 : 1;
    
    if (sortKey === 'winrate') {
      const winRateA = (a.wins / (a.wins + a.losses)) || 0;
      const winRateB = (b.wins / (b.wins + b.losses)) || 0;
      return (winRateA - winRateB) * multiplier;
    }
    
    if (sortKey === 'gamesPlayed') {
      return ((a.wins + a.losses) - (b.wins + b.losses)) * multiplier;
    }

    // For rank sorting, use ELO value as the sort key
    return (a.elo - b.elo) * multiplier;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + entriesPerPage);
   
  // for setting the number of entries per page on mount
  useEffect(() => {
    const storedEntries = getCookie('entriesPerPage');
    if (storedEntries) {
      setEntriesPerPage(Number(storedEntries));
    }
  }, []);

  // for setting the number of entries per page when changed by the element
  const handleEntriesChange = (value: number) => {
    setEntriesPerPage(value);
    setCookie('entriesPerPage', value.toString(), { maxAge: 30 * 24 * 60 * 60 }); // 30 days
    setCurrentPage(1);
  };
  // for changing the number of entries per page
  useEffect(() => {
    const newTotalPages = Math.ceil(sortedData.length / entriesPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [entriesPerPage, sortedData.length, currentPage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDescending(!sortDescending);
    } else {
      setSortKey(key);
      setSortDescending(key === 'rank' ? true : true);
    }
    setCurrentPage(1);
  };

  const SortArrow = ({ isActive }: { isActive: boolean }) => (
    <span className="ml-2">
      {isActive ? (sortDescending ? '▼' : '▲') : ''}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-8 px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Leaderboard</h1>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Rank', 'Player', 'Wins', 'Losses', 'Win Rate', 'Games Played', 'ELO'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => handleSort(
                          header === 'Win Rate' ? 'winrate' :
                          header === 'Games Played' ? 'gamesPlayed' :
                          header === 'Rank' ? 'rank' :
                          header.toLowerCase() as SortKey
                        )}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        {header}
                        <SortArrow isActive={
                          (header === 'ELO' && sortKey === 'elo') ||
                          (header === 'Wins' && sortKey === 'wins') ||
                          (header === 'Losses' && sortKey === 'losses') ||
                          (header === 'Win Rate' && sortKey === 'winrate') ||
                          (header === 'Games Played' && sortKey === 'gamesPlayed') ||
                          (header === 'Rank' && sortKey === 'rank')
                        } />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.map((entry) => {
                  const gamesPlayed = entry.wins + entry.losses;
                  const winRate = gamesPlayed > 0 
                    ? (entry.wins / gamesPlayed) * 100 
                    : 0;

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{entry.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {entry.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">
                        {entry.wins}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                        {entry.losses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-purple-600">
                        {winRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {gamesPlayed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-semibold">
                        {entry.elo}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
          
          {/* number of entries on page controls */}
          <div className="mt-4 flex flex-row justify-end items-center gap-2">
            Entries Per Page:
            <select
              value={entriesPerPage}
              onChange={(e) => handleEntriesChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {entriesOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

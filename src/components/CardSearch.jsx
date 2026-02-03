import React, { useState } from 'react';
import { useCards } from '../hooks/useCards.js';
import CardCard from './CardCard.jsx';

const CardSearch = () => {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { cards, loading, error, search } = useCards();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTerm(query);
      search(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Card Search</h1>
        <p className="text-gray-500 mt-1">Search for sports cards and compare prices</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search by player name, card name, or set
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., LeBron James 2003 Topps"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Search Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Include player name and year for better results</li>
              <li>Try specific card names or set names</li>
              <li>Use brand names like "Topps", "Panini", "Upper Deck"</li>
              <li>Add condition like "PSA 10" or "Graded" if needed</li>
            </ul>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Search Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Searching cards...</p>
        </div>
      )}

      {/* Results */}
      {!loading && searchTerm && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {cards.length > 0 ? (
                <>Results for "{searchTerm}" ({cards.length})</>
              ) : (
                <>No results found for "{searchTerm}"</>
              )}
            </h2>
          </div>

          {cards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map((card, index) => (
                <CardCard key={`${card.id || card.name}-${index}`} card={card} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cards Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or using different keywords
              </p>
              <button
                onClick={handleClear}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Start a new search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!loading && !searchTerm && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏀</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Searching</h3>
          <p className="text-gray-600">
            Enter a player name, card name, or set to find sports cards
          </p>
        </div>
      )}
    </div>
  );
};

export default CardSearch;

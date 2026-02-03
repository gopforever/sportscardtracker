import React, { useState } from 'react';
import { findDeals } from '../utils/api.js';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';
import { MIN_ROI_OPTIONS, SPORTS } from '../utils/constants.js';
import CardCard from './CardCard.jsx';

const DealFinder = () => {
  const [formData, setFormData] = useState({
    query: '',
    min_roi: 20,
    max_purchase_price: 50,
    sport: ''
  });
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'min_roi' || name === 'max_purchase_price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = {
        query: formData.query,
        min_roi: formData.min_roi,
        max_purchase_price: formData.max_purchase_price * 100, // Convert to cents
        ...(formData.sport && { sport: formData.sport })
      };

      const results = await findDeals(params);
      setDeals(results);
    } catch (err) {
      setError(err.message || 'Failed to find deals');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      query: '',
      min_roi: 20,
      max_purchase_price: 50,
      sport: ''
    });
    setDeals([]);
    setSearched(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deal Finder</h1>
        <p className="text-gray-500 mt-1">Discover profitable card opportunities</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Query */}
            <div className="md:col-span-2">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Search Query *
              </label>
              <input
                type="text"
                id="query"
                name="query"
                value={formData.query}
                onChange={handleChange}
                placeholder="e.g., Rookie cards, LeBron James"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Minimum ROI */}
            <div>
              <label htmlFor="min_roi" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum ROI (%)
              </label>
              <select
                id="min_roi"
                name="min_roi"
                value={formData.min_roi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MIN_ROI_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Purchase Price */}
            <div>
              <label htmlFor="max_purchase_price" className="block text-sm font-medium text-gray-700 mb-2">
                Max Purchase Price ($)
              </label>
              <input
                type="number"
                id="max_purchase_price"
                name="max_purchase_price"
                value={formData.max_purchase_price}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sport Filter */}
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                Sport (Optional)
              </label>
              <select
                id="sport"
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sports</option>
                {SPORTS.map(sport => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Find Deals'}
            </button>
            {searched && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> The deal finder searches for cards where the expected selling price 
              minus fees and costs meets your minimum ROI threshold.
            </p>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Finding deals...</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {deals.length > 0 ? (
                <>Found {deals.length} Deal{deals.length !== 1 ? 's' : ''}</>
              ) : (
                <>No Deals Found</>
              )}
            </h2>
          </div>

          {deals.length > 0 ? (
            <div className="space-y-4">
              {deals.map((deal, index) => (
                <div key={`${deal.name}-${index}`} className="bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Card Info */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{deal.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {deal.player_name && <p>Player: {deal.player_name}</p>}
                        {deal.year && <p>Year: {deal.year}</p>}
                        {deal.brand && <p>Brand: {deal.brand}</p>}
                        {deal.sport && <p>Sport: {deal.sport}</p>}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          Purchase: <span className="font-semibold text-gray-900">{formatCurrency(deal.purchase_price)}</span>
                        </p>
                        <p className="text-gray-600">
                          Sell: <span className="font-semibold text-gray-900">{formatCurrency(deal.expected_sale_price)}</span>
                        </p>
                        <p className="text-gray-600">
                          Profit: <span className="font-semibold text-green-600">{formatCurrency(deal.profit)}</span>
                        </p>
                      </div>
                    </div>

                    {/* ROI */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">ROI</h4>
                      <div className="text-3xl font-bold text-green-600">
                        {formatPercentage(deal.roi)}
                      </div>
                      {deal.ebay_url && (
                        <a
                          href={deal.ebay_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          View on eBay →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deals Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search query to find more opportunities
              </p>
              <button
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Start a new search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">💎</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Your Next Deal</h3>
          <p className="text-gray-600">
            Configure your filters above and click "Find Deals" to discover profitable opportunities
          </p>
        </div>
      )}
    </div>
  );
};

export default DealFinder;

import React, { useState } from 'react';
import { calculateProfit } from '../utils/api.js';
import { formatCurrency, formatPercentage, dollarsToCents } from '../utils/formatters.js';
import { DEFAULT_EBAY_FEE_PERCENT, DEFAULT_EBAY_TRANSACTION_FEE, DEFAULT_SHIPPING_COST } from '../utils/constants.js';

const ProfitCalculator = () => {
  const [formData, setFormData] = useState({
    purchase_price: '',
    sale_price: '',
    ebay_fee_percent: DEFAULT_EBAY_FEE_PERCENT,
    ebay_transaction_fee: DEFAULT_EBAY_TRANSACTION_FEE,
    shipping_cost: DEFAULT_SHIPPING_COST,
    additional_costs: 0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.purchase_price || formData.purchase_price <= 0) {
      setError('Please enter a valid purchase price');
      return;
    }

    if (!formData.sale_price || formData.sale_price <= 0) {
      setError('Please enter a valid sale price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        purchase_price: dollarsToCents(formData.purchase_price),
        sale_price: dollarsToCents(formData.sale_price),
        ebay_fee_percent: formData.ebay_fee_percent,
        ebay_transaction_fee: dollarsToCents(formData.ebay_transaction_fee),
        shipping_cost: dollarsToCents(formData.shipping_cost),
        additional_costs: dollarsToCents(formData.additional_costs)
      };

      const data = await calculateProfit(params);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to calculate profit');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      purchase_price: '',
      sale_price: '',
      ebay_fee_percent: DEFAULT_EBAY_FEE_PERCENT,
      ebay_transaction_fee: DEFAULT_EBAY_TRANSACTION_FEE,
      shipping_cost: DEFAULT_SHIPPING_COST,
      additional_costs: 0
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profit Calculator</h1>
        <p className="text-gray-500 mt-1">Calculate your potential profit with accurate fee estimates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Purchase Price */}
            <div>
              <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price ($) *
              </label>
              <input
                type="number"
                id="purchase_price"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder="25.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sale Price */}
            <div>
              <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Sale Price ($) *
              </label>
              <input
                type="number"
                id="sale_price"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder="50.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* eBay Fee Percent */}
            <div>
              <label htmlFor="ebay_fee_percent" className="block text-sm font-medium text-gray-700 mb-2">
                eBay Fee Percentage (%)
              </label>
              <input
                type="number"
                id="ebay_fee_percent"
                name="ebay_fee_percent"
                value={formData.ebay_fee_percent}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 13%</p>
            </div>

            {/* Transaction Fee */}
            <div>
              <label htmlFor="ebay_transaction_fee" className="block text-sm font-medium text-gray-700 mb-2">
                eBay Transaction Fee ($)
              </label>
              <input
                type="number"
                id="ebay_transaction_fee"
                name="ebay_transaction_fee"
                value={formData.ebay_transaction_fee}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Default: $0.30</p>
            </div>

            {/* Shipping Cost */}
            <div>
              <label htmlFor="shipping_cost" className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost ($)
              </label>
              <input
                type="number"
                id="shipping_cost"
                name="shipping_cost"
                value={formData.shipping_cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Default: $5.00</p>
            </div>

            {/* Additional Costs */}
            <div>
              <label htmlFor="additional_costs" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Costs ($)
              </label>
              <input
                type="number"
                id="additional_costs"
                name="additional_costs"
                value={formData.additional_costs}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">e.g., grading fees, supplies</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating...' : 'Calculate'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> This calculator includes eBay seller fees, payment processing fees, 
              and shipping costs to give you an accurate profit estimate.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-3">⚠️</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Estimated Profit</p>
                <p className="text-4xl font-bold mb-2">{formatCurrency(result.profit)}</p>
                <p className="text-lg">
                  ROI: <span className="font-semibold">{formatPercentage(result.roi)}</span>
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Breakdown</h3>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Sale Price</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.sale_price)}</span>
                </div>

                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">eBay Fees ({result.ebay_fee_percent}%)</span>
                    <span className="text-red-600">-{formatCurrency(result.ebay_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction Fee</span>
                    <span className="text-red-600">-{formatCurrency(result.ebay_transaction_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Cost</span>
                    <span className="text-red-600">-{formatCurrency(result.shipping_cost)}</span>
                  </div>
                  {result.additional_costs > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Additional Costs</span>
                      <span className="text-red-600">-{formatCurrency(result.additional_costs)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Purchase Price</span>
                    <span className="text-red-600">-{formatCurrency(result.purchase_price)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-t-2 border-gray-300 font-semibold">
                  <span className="text-gray-900">Net Profit</span>
                  <span className={result.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(result.profit)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="text-gray-900">Total Fees</span>
                  <span className="text-gray-600">{formatCurrency(result.total_fees)}</span>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`rounded-lg p-4 ${
                result.roi >= 20 
                  ? 'bg-green-50 border border-green-200' 
                  : result.roi >= 10 
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  result.roi >= 20 
                    ? 'text-green-900' 
                    : result.roi >= 10 
                    ? 'text-yellow-900'
                    : 'text-red-900'
                }`}>
                  {result.roi >= 20 
                    ? '✓ Great Deal!' 
                    : result.roi >= 10 
                    ? '⚠ Marginal Deal'
                    : '✗ Not Recommended'}
                </p>
                <p className={`text-sm mt-1 ${
                  result.roi >= 20 
                    ? 'text-green-800' 
                    : result.roi >= 10 
                    ? 'text-yellow-800'
                    : 'text-red-800'
                }`}>
                  {result.roi >= 20 
                    ? 'This looks like a profitable opportunity with good ROI.'
                    : result.roi >= 10 
                    ? 'The ROI is acceptable but not ideal. Consider if it\'s worth your time.'
                    : 'The profit margin is too low. Look for better opportunities.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧮</div>
              <p className="text-gray-600">
                Fill out the form and click "Calculate" to see your profit estimate
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Examples */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setFormData({
                purchase_price: 25,
                sale_price: 50,
                ebay_fee_percent: DEFAULT_EBAY_FEE_PERCENT,
                ebay_transaction_fee: DEFAULT_EBAY_TRANSACTION_FEE,
                shipping_cost: DEFAULT_SHIPPING_COST,
                additional_costs: 0
              });
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <p className="font-semibold text-gray-900">Example 1</p>
            <p className="text-sm text-gray-600 mt-1">Buy: $25 → Sell: $50</p>
          </button>
          <button
            onClick={() => {
              setFormData({
                purchase_price: 100,
                sale_price: 150,
                ebay_fee_percent: DEFAULT_EBAY_FEE_PERCENT,
                ebay_transaction_fee: DEFAULT_EBAY_TRANSACTION_FEE,
                shipping_cost: DEFAULT_SHIPPING_COST,
                additional_costs: 0
              });
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <p className="font-semibold text-gray-900">Example 2</p>
            <p className="text-sm text-gray-600 mt-1">Buy: $100 → Sell: $150</p>
          </button>
          <button
            onClick={() => {
              setFormData({
                purchase_price: 10,
                sale_price: 30,
                ebay_fee_percent: DEFAULT_EBAY_FEE_PERCENT,
                ebay_transaction_fee: DEFAULT_EBAY_TRANSACTION_FEE,
                shipping_cost: DEFAULT_SHIPPING_COST,
                additional_costs: 0
              });
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <p className="font-semibold text-gray-900">Example 3</p>
            <p className="text-sm text-gray-600 mt-1">Buy: $10 → Sell: $30</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;

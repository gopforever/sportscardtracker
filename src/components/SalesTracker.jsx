import React, { useState, useEffect } from 'react';
import { useSales } from '../hooks/useSales.js';
import { useInventory } from '../hooks/useInventory.js';
import { formatCurrency, formatDate, dollarsToCents } from '../utils/formatters.js';
import { INVENTORY_STATUS } from '../utils/constants.js';

const SalesTracker = () => {
  const { loading: salesLoading, error: salesError, success, addSale, clearSuccess } = useSales();
  const { items, updateItem } = useInventory(INVENTORY_STATUS.AVAILABLE);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    inventory_id: '',
    sale_price: '',
    sale_date: new Date().toISOString().split('T')[0],
    platform: 'ebay',
    buyer_info: '',
    notes: ''
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        clearSuccess();
      }, 3000);
    }
  }, [success, clearSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      inventory_id: '',
      sale_price: '',
      sale_date: new Date().toISOString().split('T')[0],
      platform: 'ebay',
      buyer_info: '',
      notes: ''
    });
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.inventory_id) {
      setFormError('Please select a card from inventory');
      return;
    }

    if (!formData.sale_price || parseFloat(formData.sale_price) <= 0) {
      setFormError('Please enter a valid sale price');
      return;
    }

    try {
      const saleData = {
        inventory_id: formData.inventory_id,
        sale_price: dollarsToCents(parseFloat(formData.sale_price)),
        sale_date: formData.sale_date,
        platform: formData.platform,
        buyer_info: formData.buyer_info,
        notes: formData.notes
      };

      await addSale(saleData);
      
      // Update inventory item status to sold
      await updateItem(formData.inventory_id, { status: 'sold' });

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Failed to record sale');
    }
  };

  const availableItems = items.filter(item => item.status === 'available');
  const selectedItem = availableItems.find(item => item.id === formData.inventory_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Tracker</h1>
          <p className="text-gray-500 mt-1">Record and track your card sales</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          disabled={availableItems.length === 0}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          + Record Sale
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-3">✓</span>
            <p className="text-sm text-green-800">Sale recorded successfully!</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {salesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-3">⚠️</span>
            <p className="text-sm text-red-700">{salesError}</p>
          </div>
        </div>
      )}

      {/* No Available Items */}
      {availableItems.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 text-xl mr-3">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-900">No Available Items</p>
              <p className="text-sm text-yellow-800 mt-1">
                Add items to your inventory before recording sales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-2xl mr-3">1️⃣</span>
            <div>
              <h3 className="font-medium text-gray-900">Select an Item</h3>
              <p className="text-sm text-gray-600">Choose a card from your available inventory</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">2️⃣</span>
            <div>
              <h3 className="font-medium text-gray-900">Enter Sale Details</h3>
              <p className="text-sm text-gray-600">Add the sale price, date, and platform</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">3️⃣</span>
            <div>
              <h3 className="font-medium text-gray-900">Track Your Profit</h3>
              <p className="text-sm text-gray-600">View profit calculations and ROI automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales - Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sales</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600">
            Your sales history will appear here
          </p>
        </div>
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Sale</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                {/* Select Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Card from Inventory *
                  </label>
                  <select
                    name="inventory_id"
                    value={formData.inventory_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose a card --</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.card_name} - {formatCurrency(item.purchase_price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show selected item details */}
                {selectedItem && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Selected Card</h3>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p><strong>Name:</strong> {selectedItem.card_name}</p>
                      {selectedItem.player_name && <p><strong>Player:</strong> {selectedItem.player_name}</p>}
                      <p><strong>Purchase Price:</strong> {formatCurrency(selectedItem.purchase_price)}</p>
                      {selectedItem.purchase_date && <p><strong>Purchase Date:</strong> {formatDate(selectedItem.purchase_date)}</p>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sale Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price ($) *
                    </label>
                    <input
                      type="number"
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {selectedItem && formData.sale_price && (
                      <p className="text-xs text-gray-500 mt-1">
                        Profit: {formatCurrency(
                          dollarsToCents(parseFloat(formData.sale_price)) - selectedItem.purchase_price
                        )}
                      </p>
                    )}
                  </div>

                  {/* Sale Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Date *
                    </label>
                    <input
                      type="date"
                      name="sale_date"
                      value={formData.sale_date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ebay">eBay</option>
                      <option value="comc">COMC</option>
                      <option value="facebook">Facebook Marketplace</option>
                      <option value="instagram">Instagram</option>
                      <option value="local">Local Sale</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Buyer Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buyer Info (Optional)
                    </label>
                    <input
                      type="text"
                      name="buyer_info"
                      value={formData.buyer_info}
                      onChange={handleChange}
                      placeholder="Username or name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any additional details about the sale"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={salesLoading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400"
                  >
                    {salesLoading ? 'Recording...' : 'Record Sale'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTracker;

/**
 * Netlify Blob Storage Helpers
 */
import { getStore } from '@netlify/blobs';

/**
 * Get the inventory store
 * @returns {Promise<Object>} - Blob store instance
 */
export async function getInventoryStore() {
  return getStore('inventory');
}

/**
 * Get all inventory items
 * @returns {Promise<Object>} - Inventory data
 */
export async function getAllInventory() {
  try {
    const store = await getInventoryStore();
    const data = await store.get('items', { type: 'json' });
    return data || {};
  } catch (error) {
    console.error('Error getting inventory:', error);
    return {};
  }
}

/**
 * Save inventory data
 * @param {Object} inventory - Inventory data to save
 * @returns {Promise<void>}
 */
export async function saveInventory(inventory) {
  const store = await getInventoryStore();
  await store.setJSON('items', inventory);
}

/**
 * Get sales store
 * @returns {Promise<Object>} - Blob store instance
 */
export async function getSalesStore() {
  return getStore('sales');
}

/**
 * Get all sales data
 * @returns {Promise<Object>} - Sales data
 */
export async function getAllSales() {
  try {
    const store = await getSalesStore();
    const data = await store.get('items', { type: 'json' });
    return data || {};
  } catch (error) {
    console.error('Error getting sales:', error);
    return {};
  }
}

/**
 * Save sales data
 * @param {Object} sales - Sales data to save
 * @returns {Promise<void>}
 */
export async function saveSales(sales) {
  const store = await getSalesStore();
  await store.setJSON('items', sales);
}

/**
 * Get price history store
 * @returns {Promise<Object>} - Blob store instance
 */
export async function getPriceHistoryStore() {
  return getStore('price-history');
}

/**
 * Get price history for a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} - Price history data
 */
export async function getPriceHistory(cardId) {
  try {
    const store = await getPriceHistoryStore();
    const data = await store.get(cardId, { type: 'json' });
    return data || [];
  } catch (error) {
    console.error('Error getting price history:', error);
    return [];
  }
}

/**
 * Save price history for a card
 * @param {string} cardId - Card ID
 * @param {Array} history - Price history data
 * @returns {Promise<void>}
 */
export async function savePriceHistory(cardId, history) {
  const store = await getPriceHistoryStore();
  await store.setJSON(cardId, history);
}

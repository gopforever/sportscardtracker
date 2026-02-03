/**
 * Frontend API Client
 */
import axios from 'axios';

const API_BASE = '/.netlify/functions';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Search cards
export const searchCards = async (query, limit = 50) => {
  const response = await api.get('/search-cards', {
    params: { q: query, limit }
  });
  return response.data;
};

// Get single card
export const getCard = async (id) => {
  const response = await api.get('/get-card', {
    params: { id }
  });
  return response.data;
};

// Find deals
export const findDeals = async (params) => {
  const response = await api.post('/find-deals', params);
  return response.data;
};

// Calculate profit
export const calculateProfit = async (params) => {
  const response = await api.post('/calculate-profit', params);
  return response.data;
};

// Inventory operations
export const getInventory = async (status = 'all') => {
  const response = await api.get('/inventory', {
    params: status !== 'all' ? { status } : {}
  });
  return response.data;
};

export const addInventoryItem = async (item) => {
  const response = await api.post('/inventory', item);
  return response.data;
};

export const updateInventoryItem = async (id, updates) => {
  const response = await api.put('/inventory', { id, ...updates });
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  const response = await api.delete('/inventory', {
    params: { id }
  });
  return response.data;
};

// Sales operations
export const recordSale = async (sale) => {
  const response = await api.post('/record-sale', sale);
  return response.data;
};

// Reports
export const getReport = async (month) => {
  const response = await api.get('/reports', {
    params: month ? { month } : {}
  });
  return response.data;
};

export default api;

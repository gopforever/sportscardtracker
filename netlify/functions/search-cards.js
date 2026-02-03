/**
 * Search Cards Function
 * 
 * Endpoint: /.netlify/functions/search-cards
 * Method: GET
 * Query Params: q (search query)
 */
import { callSportsCardsProAPI, parseProductData } from './utils/api-client.js';

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { q, limit } = event.queryStringParameters || {};

    if (!q) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Query parameter "q" is required' })
      };
    }

    // Call SportsCardsPro API
    const response = await callSportsCardsProAPI('/api/products', {
      search: q,
      limit: limit || 50
    });

    // Parse products
    const products = response.products || [];
    const parsedProducts = products.map(parseProductData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        products: parsedProducts,
        count: parsedProducts.length
      })
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to search cards'
      })
    };
  }
}

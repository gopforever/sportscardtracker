/**
 * Get Card Function
 * 
 * Endpoint: /.netlify/functions/get-card
 * Method: GET
 * Query Params: id (card ID)
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
    const { id } = event.queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Query parameter "id" is required' })
      };
    }

    // Call SportsCardsPro API
    const response = await callSportsCardsProAPI('/api/product', { id });

    // Parse product data
    const card = parseProductData(response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        card
      })
    };
  } catch (error) {
    console.error('Get card error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to get card'
      })
    };
  }
}

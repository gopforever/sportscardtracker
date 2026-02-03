/**
 * Calculate Profit Function
 * 
 * Endpoint: /.netlify/functions/calculate-profit
 * Method: POST
 */
import { calculateProfit } from './utils/calculator.js';

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      purchasePriceCents, 
      salePriceCents, 
      shippingCostCents = 500,
      otherCostsCents = 0
    } = body;

    if (purchasePriceCents === undefined || salePriceCents === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'purchasePriceCents and salePriceCents are required' 
        })
      };
    }

    const calculation = calculateProfit(
      purchasePriceCents,
      salePriceCents,
      shippingCostCents,
      otherCostsCents
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        calculation
      })
    };
  } catch (error) {
    console.error('Calculate profit error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to calculate profit'
      })
    };
  }
}

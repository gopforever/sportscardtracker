/**
 * Find Deals Function
 * 
 * Endpoint: /.netlify/functions/find-deals
 * Method: POST
 */
import { callSportsCardsProAPI, parseProductData } from './utils/api-client.js';
import { calculateProfit, isProfitable } from './utils/calculator.js';

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
      query = '', 
      minRoi = 20,
      maxPrice,
      genre
    } = body;

    // Search for cards
    const params = { search: query, limit: 100 };
    const response = await callSportsCardsProAPI('/api/products', params);
    
    const products = response.products || [];
    const deals = [];

    for (const product of products) {
      const card = parseProductData(product);
      
      // Filter by genre if specified
      if (genre && card.genre && !card.genre.toLowerCase().includes(genre.toLowerCase())) {
        continue;
      }

      // Use ungraded price as market value
      const marketValueCents = card.loosePriceCents || 0;
      
      if (marketValueCents === 0) continue;
      
      // Calculate potential buy price (80% of market value)
      const recommendedBuyPriceCents = Math.round(marketValueCents * 0.8);
      
      // Filter by max price if specified
      if (maxPrice && recommendedBuyPriceCents > maxPrice * 100) {
        continue;
      }

      // Calculate profit potential
      const profitCalc = calculateProfit(recommendedBuyPriceCents, marketValueCents);
      
      // Filter by minimum ROI
      if (profitCalc.roi >= minRoi) {
        deals.push({
          card,
          marketValueCents,
          recommendedBuyPriceCents,
          potentialProfitCents: profitCalc.netProfitCents,
          roi: profitCalc.roi
        });
      }
    }

    // Sort by ROI descending
    deals.sort((a, b) => b.roi - a.roi);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        deals,
        count: deals.length
      })
    };
  } catch (error) {
    console.error('Find deals error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to find deals'
      })
    };
  }
}

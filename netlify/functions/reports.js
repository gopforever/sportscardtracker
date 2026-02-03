/**
 * Reports Function
 * 
 * Endpoint: /.netlify/functions/reports
 * Method: GET
 * Query Params: month (YYYY-MM format)
 */
import { getAllSales } from './utils/storage.js';

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
    const { month } = event.queryStringParameters || {};
    
    // Default to current month if not specified
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const salesData = await getAllSales();
    const allSales = Object.values(salesData);

    // Filter sales for the specified month
    const monthlySales = allSales.filter(sale => {
      return sale.soldDate && sale.soldDate.startsWith(targetMonth);
    });

    // Calculate totals
    let totalSalesCents = 0;
    let totalProfitCents = 0;
    let totalCostsCents = 0;
    
    const cardProfits = {};
    const dailyBreakdown = {};

    for (const sale of monthlySales) {
      totalSalesCents += sale.soldPriceCents || 0;
      totalProfitCents += sale.netProfitCents || 0;
      totalCostsCents += sale.purchasePriceCents || 0;

      // Track profit by card
      if (sale.cardName) {
        if (!cardProfits[sale.cardName]) {
          cardProfits[sale.cardName] = {
            cardName: sale.cardName,
            profitCents: 0,
            count: 0
          };
        }
        cardProfits[sale.cardName].profitCents += sale.netProfitCents || 0;
        cardProfits[sale.cardName].count += 1;
      }

      // Daily breakdown
      const date = sale.soldDate;
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          salesCents: 0,
          profitCents: 0,
          count: 0
        };
      }
      dailyBreakdown[date].salesCents += sale.soldPriceCents || 0;
      dailyBreakdown[date].profitCents += sale.netProfitCents || 0;
      dailyBreakdown[date].count += 1;
    }

    // Sort top cards by profit
    const topCards = Object.values(cardProfits)
      .sort((a, b) => b.profitCents - a.profitCents)
      .slice(0, 10);

    // Convert daily breakdown to array and sort by date
    const dailyBreakdownArray = Object.values(dailyBreakdown)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate averages
    const numberOfSales = monthlySales.length;
    const averageProfitCents = numberOfSales > 0 
      ? Math.round(totalProfitCents / numberOfSales) 
      : 0;

    // Goal tracking (default $100/month = 10000 cents)
    const goalCents = 10000;
    const progressPercent = goalCents > 0 
      ? Math.round((totalProfitCents / goalCents) * 100) 
      : 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        report: {
          month: targetMonth,
          goalCents,
          totalSalesCents,
          totalProfitCents,
          totalCostsCents,
          numberOfSales,
          averageProfitCents,
          progressPercent,
          topCards,
          dailyBreakdown: dailyBreakdownArray
        }
      })
    };
  } catch (error) {
    console.error('Reports error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate report'
      })
    };
  }
}

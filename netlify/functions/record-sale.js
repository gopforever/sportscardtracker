/**
 * Record Sale Function
 * 
 * Endpoint: /.netlify/functions/record-sale
 * Method: POST
 */
import { getAllInventory, saveInventory, getAllSales, saveSales } from './utils/storage.js';

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
      inventoryId,
      soldDate,
      soldPrice,
      actualFees,
      notes = ''
    } = body;

    if (!inventoryId || soldPrice === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'inventoryId and soldPrice are required' 
        })
      };
    }

    const inventoryData = await getAllInventory();
    
    if (!inventoryData[inventoryId]) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, error: 'Inventory item not found' })
      };
    }

    const item = inventoryData[inventoryId];
    
    if (item.sold) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Item already sold' })
      };
    }

    const soldPriceCents = Math.round(soldPrice * 100);
    const ebayFeesCents = actualFees !== undefined 
      ? Math.round(actualFees * 100)
      : Math.round((soldPriceCents * 0.13) + 30); // Default eBay fees
    
    const netProfitCents = soldPriceCents - item.purchasePriceCents - ebayFeesCents;
    const roi = item.purchasePriceCents > 0 
      ? ((netProfitCents / item.purchasePriceCents) * 100).toFixed(2)
      : 0;

    // Update inventory item
    inventoryData[inventoryId] = {
      ...item,
      sold: true,
      soldDate: soldDate || new Date().toISOString().split('T')[0],
      soldPriceCents,
      ebayFeesCents,
      netProfitCents,
      roi: parseFloat(roi),
      saleNotes: notes,
      updatedAt: new Date().toISOString()
    };

    await saveInventory(inventoryData);

    // Record sale in sales history
    const salesData = await getAllSales();
    const saleId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    salesData[saleId] = {
      id: saleId,
      inventoryId,
      cardId: item.cardId,
      cardName: item.cardName,
      consoleName: item.consoleName,
      purchaseDate: item.purchaseDate,
      soldDate: soldDate || new Date().toISOString().split('T')[0],
      purchasePriceCents: item.purchasePriceCents,
      soldPriceCents,
      ebayFeesCents,
      netProfitCents,
      roi: parseFloat(roi),
      notes,
      createdAt: new Date().toISOString()
    };

    await saveSales(salesData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sale: salesData[saleId],
        updatedItem: inventoryData[inventoryId]
      })
    };
  } catch (error) {
    console.error('Record sale error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to record sale'
      })
    };
  }
}

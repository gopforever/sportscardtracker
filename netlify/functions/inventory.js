/**
 * Inventory Function
 * 
 * Endpoint: /.netlify/functions/inventory
 * Methods: GET, POST, PUT, DELETE
 */
import { getAllInventory, saveInventory } from './utils/storage.js';
import { callSportsCardsProAPI, parseProductData } from './utils/api-client.js';

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const method = event.httpMethod;

    if (method === 'GET') {
      return await handleGet(event, headers);
    } else if (method === 'POST') {
      return await handlePost(event, headers);
    } else if (method === 'PUT') {
      return await handlePut(event, headers);
    } else if (method === 'DELETE') {
      return await handleDelete(event, headers);
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ success: false, error: 'Method not allowed' })
      };
    }
  } catch (error) {
    console.error('Inventory error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
}

async function handleGet(event, headers) {
  const { status } = event.queryStringParameters || {};
  
  const inventoryData = await getAllInventory();
  const inventoryArray = Object.values(inventoryData);
  
  // Filter by status if specified
  let filteredInventory = inventoryArray;
  if (status === 'available') {
    filteredInventory = inventoryArray.filter(item => !item.sold);
  } else if (status === 'sold') {
    filteredInventory = inventoryArray.filter(item => item.sold);
  }
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      inventory: filteredInventory,
      total: filteredInventory.length
    })
  };
}

async function handlePost(event, headers) {
  const body = JSON.parse(event.body || '{}');
  const {
    cardId,
    purchasePrice,
    purchaseDate,
    condition = 'ungraded',
    quantity = 1,
    notes = ''
  } = body;

  if (!cardId || purchasePrice === undefined) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'cardId and purchasePrice are required' 
      })
    };
  }

  // Get card details from API
  let cardData;
  try {
    const response = await callSportsCardsProAPI('/api/product', { id: cardId });
    cardData = parseProductData(response);
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch card details' 
      })
    };
  }

  const inventoryData = await getAllInventory();
  
  // Generate unique ID
  const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const purchasePriceCents = Math.round(purchasePrice * 100);
  const currentValueCents = cardData.loosePriceCents || 0;
  
  const newItem = {
    id,
    cardId,
    cardName: cardData.productName,
    consoleName: cardData.consoleName,
    genre: cardData.genre,
    purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
    purchasePriceCents,
    condition,
    quantity,
    notes,
    sold: false,
    soldDate: null,
    soldPriceCents: null,
    ebayFeesCents: null,
    netProfitCents: null,
    currentValueCents,
    createdAt: new Date().toISOString()
  };

  inventoryData[id] = newItem;
  await saveInventory(inventoryData);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      item: newItem
    })
  };
}

async function handlePut(event, headers) {
  const body = JSON.parse(event.body || '{}');
  const { id, ...updates } = body;

  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'id is required' })
    };
  }

  const inventoryData = await getAllInventory();
  
  if (!inventoryData[id]) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Inventory item not found' })
    };
  }

  // Convert purchasePrice to cents if provided
  if (updates.purchasePrice !== undefined) {
    updates.purchasePriceCents = Math.round(updates.purchasePrice * 100);
    delete updates.purchasePrice;
  }

  // Update item
  inventoryData[id] = {
    ...inventoryData[id],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveInventory(inventoryData);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      item: inventoryData[id]
    })
  };
}

async function handleDelete(event, headers) {
  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'id is required' })
    };
  }

  const inventoryData = await getAllInventory();
  
  if (!inventoryData[id]) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Inventory item not found' })
    };
  }

  delete inventoryData[id];
  await saveInventory(inventoryData);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Inventory item deleted'
    })
  };
}

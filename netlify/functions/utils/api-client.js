/**
 * SportsCardsPro API Client for Netlify Functions
 */

/**
 * Call the SportsCardsPro API
 * @param {string} endpoint - API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - API response data
 */
export async function callSportsCardsProAPI(endpoint, params = {}) {
  const baseUrl = 'https://www.sportscardspro.com';
  const token = process.env.SPORTSCARDSPRO_API_TOKEN;
  
  if (!token) {
    throw new Error('SPORTSCARDSPRO_API_TOKEN environment variable not set');
  }
  
  const url = new URL(endpoint, baseUrl);
  url.searchParams.append('t', token);
  
  // Add other parameters
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  }
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API error status
    if (data.status === 'error') {
      throw new Error(data['error-message'] || 'API error');
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Parse price value to cents (integer)
 * @param {any} priceValue - Price value from API
 * @returns {number} - Price in cents
 */
export function parsePriceToCents(priceValue) {
  if (priceValue === null || priceValue === undefined || priceValue === '') {
    return 0;
  }
  
  try {
    // If already in cents (integer)
    if (typeof priceValue === 'number' && Number.isInteger(priceValue)) {
      return priceValue;
    }
    
    // If float or string, convert to cents
    const priceFloat = parseFloat(priceValue);
    if (isNaN(priceFloat)) {
      return 0;
    }
    
    // If value is less than 1000, assume it's in dollars and convert to cents
    return priceFloat < 1000 ? Math.round(priceFloat * 100) : Math.round(priceFloat);
  } catch (error) {
    return 0;
  }
}

/**
 * Parse and normalize product data from API
 * @param {Object} product - Raw product data from API
 * @returns {Object} - Normalized product data
 */
export function parseProductData(product) {
  return {
    id: product.id || product['id'],
    productName: product['product-name'] || product.productName || '',
    consoleName: product['console-name'] || product.consoleName || '',
    genre: product.genre || '',
    releaseDate: product['release-date'] || product.releaseDate || '',
    loosePriceCents: parsePriceToCents(product['loose-price'] || product.loosePriceCents),
    psa10PriceCents: parsePriceToCents(product['manual-only-price'] || product.psa10PriceCents),
    grade9PriceCents: parsePriceToCents(product['graded-price'] || product.grade9PriceCents),
    grade8PriceCents: parsePriceToCents(product['new-price'] || product.grade8PriceCents),
    grade7PriceCents: parsePriceToCents(product['cib-price'] || product.grade7PriceCents),
    bgs10PriceCents: parsePriceToCents(product['bgs-10-price'] || product.bgs10PriceCents),
    cgc10PriceCents: parsePriceToCents(product['condition-17-price'] || product.cgc10PriceCents),
    sgc10PriceCents: parsePriceToCents(product['condition-18-price'] || product.sgc10PriceCents),
    salesVolume: product['sales-volume'] || product.salesVolume || 0
  };
}

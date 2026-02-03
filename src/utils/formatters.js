/**
 * Formatting utilities
 */

/**
 * Format cents as currency
 * @param {number} cents - Amount in cents
 * @returns {string} - Formatted currency (e.g., "$12.34")
 */
export const formatCurrency = (cents) => {
  if (cents === null || cents === undefined) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
};

/**
 * Format date
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date (e.g., "Jan 1, 2026")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @returns {string} - Formatted percentage (e.g., "25.5%")
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(1)}%`;
};

/**
 * Parse dollars to cents
 * @param {number} dollars - Amount in dollars
 * @returns {number} - Amount in cents
 */
export const dollarsToCents = (dollars) => {
  return Math.round(parseFloat(dollars) * 100);
};

/**
 * Parse cents to dollars
 * @param {number} cents - Amount in cents
 * @returns {number} - Amount in dollars
 */
export const centsToDollars = (cents) => {
  return cents / 100;
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

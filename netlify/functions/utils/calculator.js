/**
 * Profit Calculation Utilities
 */

const DEFAULT_EBAY_FEE_PERCENT = 13.0;
const DEFAULT_EBAY_TRANSACTION_FEE_CENTS = 30; // $0.30
const DEFAULT_SHIPPING_COST_CENTS = 500; // $5.00

/**
 * Calculate eBay fees
 * @param {number} salePriceCents - Sale price in cents
 * @param {number} feePercent - Fee percentage (default: 13.0)
 * @param {number} transactionFeeCents - Transaction fee in cents (default: 30)
 * @returns {number} - Total eBay fees in cents
 */
export function calculateEbayFees(
  salePriceCents, 
  feePercent = DEFAULT_EBAY_FEE_PERCENT,
  transactionFeeCents = DEFAULT_EBAY_TRANSACTION_FEE_CENTS
) {
  const salePriceDollars = salePriceCents / 100.0;
  const finalValueFee = salePriceDollars * (feePercent / 100.0);
  const totalFeesDollars = finalValueFee + (transactionFeeCents / 100.0);
  return Math.round(totalFeesDollars * 100);
}

/**
 * Calculate profit for a potential purchase
 * @param {number} purchasePriceCents - Purchase price in cents
 * @param {number} salePriceCents - Expected sale price in cents
 * @param {number} shippingCostCents - Shipping cost in cents
 * @param {number} otherCostsCents - Other costs in cents
 * @returns {Object} - Profit calculation details
 */
export function calculateProfit(
  purchasePriceCents,
  salePriceCents,
  shippingCostCents = DEFAULT_SHIPPING_COST_CENTS,
  otherCostsCents = 0
) {
  const ebayFeeCents = calculateEbayFees(salePriceCents);
  const ebayTransactionFeeCents = DEFAULT_EBAY_TRANSACTION_FEE_CENTS;
  
  const totalCostsCents = purchasePriceCents + shippingCostCents + otherCostsCents + ebayFeeCents;
  const grossProfitCents = salePriceCents - purchasePriceCents;
  const netProfitCents = salePriceCents - totalCostsCents;
  
  const roi = purchasePriceCents > 0 
    ? (netProfitCents / purchasePriceCents) * 100 
    : 0;
  
  return {
    purchasePriceCents,
    salePriceCents,
    ebayFeeCents: ebayFeeCents - ebayTransactionFeeCents,
    ebayTransactionFeeCents,
    shippingCostCents,
    otherCostsCents,
    totalCostsCents,
    grossProfitCents,
    netProfitCents,
    roi: Math.round(roi * 100) / 100
  };
}

/**
 * Check if a purchase is profitable
 * @param {number} purchasePriceCents - Purchase price in cents
 * @param {number} marketValueCents - Market value in cents
 * @param {number} minRoi - Minimum ROI percentage (default: 10.0)
 * @returns {boolean} - True if profitable above minimum ROI
 */
export function isProfitable(purchasePriceCents, marketValueCents, minRoi = 10.0) {
  const profit = calculateProfit(purchasePriceCents, marketValueCents);
  return profit.roi >= minRoi;
}

/**
 * Format cents as currency string
 * @param {number} cents - Amount in cents
 * @returns {string} - Formatted currency (e.g., "$12.34")
 */
export function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

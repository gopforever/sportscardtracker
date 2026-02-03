/**
 * App constants
 */

export const SPORTS = [
  'Basketball Card',
  'Football Card',
  'Baseball Card',
  'Hockey Card',
  'Soccer Card',
  'Other'
];

export const CONDITIONS = [
  { value: 'ungraded', label: 'Ungraded' },
  { value: 'psa-10', label: 'PSA 10' },
  { value: 'psa-9', label: 'PSA 9' },
  { value: 'psa-8', label: 'PSA 8' },
  { value: 'bgs-10', label: 'BGS 10' },
  { value: 'cgc-10', label: 'CGC 10' },
  { value: 'sgc-10', label: 'SGC 10' },
];

export const DEFAULT_EBAY_FEE_PERCENT = 13.0;
export const DEFAULT_EBAY_TRANSACTION_FEE = 0.30;
export const DEFAULT_SHIPPING_COST = 5.00;
export const MONTHLY_GOAL_CENTS = 10000; // $100

export const INVENTORY_STATUS = {
  ALL: 'all',
  AVAILABLE: 'available',
  SOLD: 'sold'
};

export const MIN_ROI_OPTIONS = [
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
  { value: 25, label: '25%' },
  { value: 30, label: '30%' },
  { value: 40, label: '40%' },
  { value: 50, label: '50%' },
];

export const ROUTES = {
  DASHBOARD: '/',
  SEARCH: '/search',
  DEALS: '/deals',
  INVENTORY: '/inventory',
  CALCULATOR: '/calculator',
  SALES: '/sales',
  REPORTS: '/reports'
};

"""
Profit Calculator

This module provides utilities for calculating profits and ROI.
"""

from typing import Dict, Any, Optional


class ProfitCalculator:
    """Calculator for profit and ROI calculations."""

    def __init__(
        self,
        ebay_fee_percent: float = 13.0,
        ebay_transaction_fee: float = 0.30,
        default_shipping_cost: float = 5.00
    ):
        """
        Initialize profit calculator.

        Args:
            ebay_fee_percent: eBay final value fee percentage (default: 13.0)
            ebay_transaction_fee: eBay per-transaction fee in dollars (default: 0.30)
            default_shipping_cost: Default shipping cost in dollars (default: 5.00)
        """
        self.ebay_fee_percent = ebay_fee_percent
        self.ebay_transaction_fee = ebay_transaction_fee
        self.default_shipping_cost = default_shipping_cost

    def calculate_ebay_fees(self, sale_price_cents: int) -> int:
        """
        Calculate total eBay fees.

        Args:
            sale_price_cents: Sale price in cents

        Returns:
            Total eBay fees in cents
        """
        sale_price_dollars = sale_price_cents / 100.0
        
        # Final value fee (percentage of sale price)
        final_value_fee = sale_price_dollars * (self.ebay_fee_percent / 100.0)
        
        # Total fees in dollars
        total_fees_dollars = final_value_fee + self.ebay_transaction_fee
        
        # Convert to cents
        return int(total_fees_dollars * 100)

    def calculate_profit(
        self,
        purchase_price_cents: int,
        market_value_cents: int,
        shipping_cost_cents: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculate potential profit for a card purchase.

        Args:
            purchase_price_cents: Purchase price in cents
            market_value_cents: Expected sale price (market value) in cents
            shipping_cost_cents: Shipping cost in cents (uses default if None)

        Returns:
            Dictionary with profit calculation details
        """
        if shipping_cost_cents is None:
            shipping_cost_cents = int(self.default_shipping_cost * 100)

        # Calculate eBay fees based on market value
        ebay_fees = self.calculate_ebay_fees(market_value_cents)

        # Calculate net profit
        gross_profit = market_value_cents - purchase_price_cents
        total_costs = ebay_fees + shipping_cost_cents
        net_profit = market_value_cents - purchase_price_cents - total_costs

        # Calculate ROI
        roi_percent = 0.0
        if purchase_price_cents > 0:
            roi_percent = (net_profit / purchase_price_cents) * 100

        return {
            'purchase_price': purchase_price_cents,
            'market_value': market_value_cents,
            'shipping_cost': shipping_cost_cents,
            'ebay_fees': ebay_fees,
            'gross_profit': gross_profit,
            'total_costs': total_costs,
            'net_profit': net_profit,
            'roi_percent': round(roi_percent, 2)
        }

    def calculate_actual_profit(
        self,
        purchase_price_cents: int,
        sold_price_cents: int,
        ebay_fees_cents: int,
        shipping_cost_cents: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculate actual profit from a completed sale.

        Args:
            purchase_price_cents: Original purchase price in cents
            sold_price_cents: Actual sale price in cents
            ebay_fees_cents: Actual eBay fees in cents
            shipping_cost_cents: Actual shipping cost in cents (uses default if None)

        Returns:
            Dictionary with actual profit details
        """
        if shipping_cost_cents is None:
            shipping_cost_cents = int(self.default_shipping_cost * 100)

        gross_profit = sold_price_cents - purchase_price_cents
        total_costs = ebay_fees_cents + shipping_cost_cents
        net_profit = sold_price_cents - purchase_price_cents - total_costs

        # Calculate ROI
        roi_percent = 0.0
        if purchase_price_cents > 0:
            roi_percent = (net_profit / purchase_price_cents) * 100

        return {
            'purchase_price': purchase_price_cents,
            'sold_price': sold_price_cents,
            'shipping_cost': shipping_cost_cents,
            'ebay_fees': ebay_fees_cents,
            'gross_profit': gross_profit,
            'total_costs': total_costs,
            'net_profit': net_profit,
            'roi_percent': round(roi_percent, 2)
        }

    def is_profitable(
        self,
        purchase_price_cents: int,
        market_value_cents: int,
        min_profit_margin_percent: float = 10.0
    ) -> bool:
        """
        Check if a purchase would be profitable above minimum margin.

        Args:
            purchase_price_cents: Purchase price in cents
            market_value_cents: Market value in cents
            min_profit_margin_percent: Minimum profit margin percentage (default: 10.0)

        Returns:
            True if profitable above minimum margin, False otherwise
        """
        profit_calc = self.calculate_profit(purchase_price_cents, market_value_cents)
        roi_percent = profit_calc['roi_percent']
        
        return roi_percent >= min_profit_margin_percent

    def format_currency(self, cents: int) -> str:
        """
        Format cents as currency string.

        Args:
            cents: Amount in cents

        Returns:
            Formatted currency string (e.g., "$12.34")
        """
        return f"${cents / 100:.2f}"

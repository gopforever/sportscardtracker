"""Tests for profit calculator."""

import unittest
from src.calculator.profit_calculator import ProfitCalculator


class TestProfitCalculator(unittest.TestCase):
    """Test cases for profit calculator."""

    def setUp(self):
        """Set up test fixtures."""
        self.calculator = ProfitCalculator(
            ebay_fee_percent=13.0,
            ebay_transaction_fee=0.30,
            default_shipping_cost=5.00
        )

    def test_calculate_ebay_fees(self):
        """Test eBay fee calculation."""
        # $100 sale = $13 (13%) + $0.30 = $13.30
        fees = self.calculator.calculate_ebay_fees(10000)
        self.assertEqual(fees, 1330)

        # $50 sale = $6.50 (13%) + $0.30 = $6.80
        fees = self.calculator.calculate_ebay_fees(5000)
        self.assertEqual(fees, 680)

    def test_calculate_profit(self):
        """Test profit calculation."""
        # Purchase: $50, Sell: $100, Shipping: $5 (default)
        # Fees: $13.30, Profit: $100 - $50 - $13.30 - $5 = $31.70
        result = self.calculator.calculate_profit(5000, 10000)
        
        self.assertEqual(result['purchase_price'], 5000)
        self.assertEqual(result['market_value'], 10000)
        self.assertEqual(result['net_profit'], 3170)
        self.assertAlmostEqual(result['roi_percent'], 63.4, places=1)

    def test_calculate_profit_with_shipping(self):
        """Test profit calculation with custom shipping."""
        result = self.calculator.calculate_profit(5000, 10000, 1000)
        
        self.assertEqual(result['shipping_cost'], 1000)
        self.assertEqual(result['net_profit'], 3670)

    def test_calculate_actual_profit(self):
        """Test actual profit calculation."""
        # Purchase: $50, Sold: $90, Fees: $12, Shipping: $5
        result = self.calculator.calculate_actual_profit(5000, 9000, 1200, 500)
        
        self.assertEqual(result['sold_price'], 9000)
        self.assertEqual(result['ebay_fees'], 1200)
        self.assertEqual(result['net_profit'], 2300)

    def test_is_profitable(self):
        """Test profitability check."""
        # Should be profitable (> 10% margin)
        self.assertTrue(
            self.calculator.is_profitable(5000, 10000, min_profit_margin_percent=10.0)
        )

        # Should not be profitable
        self.assertFalse(
            self.calculator.is_profitable(9000, 10000, min_profit_margin_percent=10.0)
        )

    def test_format_currency(self):
        """Test currency formatting."""
        self.assertEqual(self.calculator.format_currency(1234), "$12.34")
        self.assertEqual(self.calculator.format_currency(0), "$0.00")
        self.assertEqual(self.calculator.format_currency(9999), "$99.99")


if __name__ == '__main__':
    unittest.main()

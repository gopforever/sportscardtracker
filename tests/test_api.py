"""Tests for SportsCardsPro API client."""

import unittest
from unittest.mock import Mock, patch
from src.api.sportscardspro import SportsCardsProAPI, APIError


class TestSportsCardsProAPI(unittest.TestCase):
    """Test cases for SportsCardsPro API client."""

    def setUp(self):
        """Set up test fixtures."""
        self.api = SportsCardsProAPI("test_token", "https://test.example.com")

    def test_init(self):
        """Test API client initialization."""
        self.assertEqual(self.api.api_token, "test_token")
        self.assertEqual(self.api.base_url, "https://test.example.com")
        self.assertEqual(self.api.max_retries, 3)

    @patch('src.api.sportscardspro.requests.Session.get')
    def test_get_product_by_id(self, mock_get):
        """Test fetching product by ID."""
        mock_response = Mock()
        mock_response.json.return_value = {
            'status': 'success',
            'product': {
                'id': 12345,
                'product-name': 'Test Card',
                'loose-price': 1000
            }
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        result = self.api.get_product(product_id=12345)
        
        self.assertEqual(result['status'], 'success')
        mock_get.assert_called_once()

    @patch('src.api.sportscardspro.requests.Session.get')
    def test_api_error_handling(self, mock_get):
        """Test API error handling."""
        mock_response = Mock()
        mock_response.json.return_value = {
            'status': 'error',
            'error-message': 'Invalid token'
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        with self.assertRaises(APIError):
            self.api.get_product(product_id=12345)

    def test_parse_price(self):
        """Test price parsing."""
        self.assertEqual(self.api._parse_price(10.50), 1050)
        self.assertEqual(self.api._parse_price(1050), 1050)
        self.assertEqual(self.api._parse_price(None), 0)
        self.assertEqual(self.api._parse_price(''), 0)
        self.assertEqual(self.api._parse_price('invalid'), 0)

    def test_parse_product_data(self):
        """Test product data parsing."""
        product = {
            'id': 12345,
            'product-name': 'Michael Jordan Rookie',
            'console-name': 'Basketball Cards 1986 Fleer',
            'loose-price': 50000,
            'manual-only-price': 500000,
            'sales-volume': 100
        }

        parsed = self.api.parse_product_data(product)

        self.assertEqual(parsed['id'], 12345)
        self.assertEqual(parsed['product_name'], 'Michael Jordan Rookie')
        self.assertEqual(parsed['console_name'], 'Basketball Cards 1986 Fleer')
        self.assertEqual(parsed['loose_price'], 50000)
        self.assertEqual(parsed['psa_10_price'], 500000)
        self.assertEqual(parsed['sales_volume'], 100)

    def test_get_product_validation(self):
        """Test get_product parameter validation."""
        with self.assertRaises(ValueError):
            self.api.get_product()


if __name__ == '__main__':
    unittest.main()

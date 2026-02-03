"""Tests for price tracker."""

import unittest
import tempfile
import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from database.models import Database
from tracker.price_tracker import PriceTracker
from api.sportscardspro import SportsCardsProAPI


class TestPriceTracker(unittest.TestCase):
    """Test cases for price tracker."""

    def setUp(self):
        """Set up test fixtures."""
        # Create temporary database
        self.db_fd, self.db_path = tempfile.mkstemp()
        self.db = Database(self.db_path)
        self.db.initialize_schema()

        # Mock API
        self.mock_api = Mock(spec=SportsCardsProAPI)
        
        self.tracker = PriceTracker(self.db, self.mock_api)

    def tearDown(self):
        """Clean up test fixtures."""
        self.db.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_track_card_success(self):
        """Test successful card tracking."""
        # Mock API response
        self.mock_api.get_product.return_value = {
            'status': 'success',
            'product': {
                'id': 12345,
                'product-name': 'Test Card',
                'console-name': 'Test Set',
                'genre': 'Baseball Card',
                'loose-price': 1000
            }
        }
        
        self.mock_api.parse_product_data.return_value = {
            'id': 12345,
            'product_name': 'Test Card',
            'console_name': 'Test Set',
            'genre': 'Baseball Card',
            'loose_price': 1000,
            'psa_10_price': 5000,
            'grade_9_price': 0,
            'grade_8_price': 0,
            'bgs_10_price': 0,
            'cgc_10_price': 0,
            'sgc_10_price': 0,
            'sales_volume': 10
        }

        result = self.tracker.track_card(12345)
        
        self.assertTrue(result)
        self.mock_api.get_product.assert_called_once_with(product_id=12345)

    def test_update_card_prices(self):
        """Test price update."""
        # First track the card
        self.mock_api.get_product.return_value = {
            'product': {
                'id': 12345,
                'product-name': 'Test Card',
                'loose-price': 1000
            }
        }
        
        self.mock_api.parse_product_data.return_value = {
            'id': 12345,
            'product_name': 'Test Card',
            'console_name': 'Test Set',
            'genre': 'Baseball Card',
            'loose_price': 1000,
            'psa_10_price': 5000,
            'grade_9_price': 0,
            'grade_8_price': 0,
            'bgs_10_price': 0,
            'cgc_10_price': 0,
            'sgc_10_price': 0,
            'sales_volume': 10
        }
        
        self.tracker.track_card(12345)
        
        # Update prices
        self.mock_api.parse_product_data.return_value['loose_price'] = 1200
        result = self.tracker.update_card_prices(12345)
        
        self.assertTrue(result)


if __name__ == '__main__':
    unittest.main()

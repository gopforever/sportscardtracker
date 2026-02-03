"""
Price Tracker

This module manages price tracking functionality.
"""

from datetime import datetime
from typing import Dict, List, Any
from database.models import Database
from database.operations import CardOperations, PriceHistoryOperations
from api.sportscardspro import SportsCardsProAPI


class PriceTracker:
    """Manages price tracking for sports cards."""

    def __init__(self, db: Database, api: SportsCardsProAPI):
        """
        Initialize price tracker.

        Args:
            db: Database instance
            api: SportsCardsPro API client
        """
        self.db = db
        self.api = api
        self.card_ops = CardOperations(db)
        self.price_ops = PriceHistoryOperations(db)

    def track_card(self, card_id: int) -> bool:
        """
        Start tracking a card by fetching its data and storing it.

        Args:
            card_id: Card ID to track

        Returns:
            True if successful, False otherwise
        """
        try:
            # Fetch card data from API
            response = self.api.get_product(product_id=card_id)
            
            # Parse the product data
            if isinstance(response, dict) and 'product' in response:
                product = response['product']
            else:
                product = response
            
            card_data = self.api.parse_product_data(product)
            
            # Add or update card in database
            self.card_ops.add_card(card_data)
            
            # Add initial price snapshot
            self.price_ops.add_price_snapshot(card_id, card_data)
            
            return True
            
        except Exception as e:
            print(f"Error tracking card {card_id}: {str(e)}")
            return False

    def update_card_prices(self, card_id: int) -> bool:
        """
        Update prices for a specific card.

        Args:
            card_id: Card ID to update

        Returns:
            True if successful, False otherwise
        """
        try:
            # Fetch latest data from API
            response = self.api.get_product(product_id=card_id)
            
            # Parse the product data
            if isinstance(response, dict) and 'product' in response:
                product = response['product']
            else:
                product = response
            
            card_data = self.api.parse_product_data(product)
            
            # Update card info
            self.card_ops.update_card_timestamp(card_id)
            
            # Add new price snapshot
            self.price_ops.add_price_snapshot(card_id, card_data)
            
            return True
            
        except Exception as e:
            print(f"Error updating card {card_id}: {str(e)}")
            return False

    def update_all_prices(self) -> Dict[str, Any]:
        """
        Update prices for all tracked cards.

        Returns:
            Dictionary with update statistics
        """
        cards = self.card_ops.get_all_cards()
        
        successful = 0
        failed = 0
        
        for card in cards:
            if self.update_card_prices(card['id']):
                successful += 1
            else:
                failed += 1
        
        return {
            'total': len(cards),
            'successful': successful,
            'failed': failed,
            'timestamp': datetime.now().isoformat()
        }

    def get_price_changes(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        Get cards with significant price changes.

        Args:
            days: Number of days to look back (default: 7)

        Returns:
            List of cards with price change information
        """
        cards = self.card_ops.get_all_cards()
        changes = []
        
        for card in cards:
            trend = self.price_ops.get_price_trend(card['id'])
            
            if trend is not None and abs(trend) > 5:  # More than 5% change
                latest_price = self.price_ops.get_latest_price(card['id'])
                
                changes.append({
                    'card_id': card['id'],
                    'product_name': card['product_name'],
                    'console_name': card['console_name'],
                    'trend_percent': trend,
                    'latest_price': latest_price.get('loose_price', 0) if latest_price else 0
                })
        
        # Sort by absolute trend percentage (descending)
        changes.sort(key=lambda x: abs(x['trend_percent']), reverse=True)
        
        return changes

    def search_and_track(self, search_query: str) -> List[Dict[str, Any]]:
        """
        Search for cards and optionally track them.

        Args:
            search_query: Search query string

        Returns:
            List of found products
        """
        try:
            products = self.api.get_products(search_query)
            
            results = []
            for product in products:
                parsed = self.api.parse_product_data(product)
                results.append(parsed)
            
            return results
            
        except Exception as e:
            print(f"Error searching: {str(e)}")
            return []

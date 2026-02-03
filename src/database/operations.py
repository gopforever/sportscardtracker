"""
Database Operations

This module provides CRUD operations for the sports card tracker database.
"""

import sqlite3
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from .models import Database


class CardOperations:
    """Operations for managing cards in the database."""

    def __init__(self, db: Database):
        """
        Initialize card operations.

        Args:
            db: Database instance
        """
        self.db = db

    def add_card(self, card_data: Dict[str, Any]) -> int:
        """
        Add a new card to the database or update if exists.

        Args:
            card_data: Dictionary containing card information

        Returns:
            Card ID
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT OR REPLACE INTO cards 
            (id, product_name, console_name, genre, release_date, first_tracked, last_updated)
            VALUES (?, ?, ?, ?, ?, COALESCE((SELECT first_tracked FROM cards WHERE id = ?), CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
        """, (
            card_data['id'],
            card_data['product_name'],
            card_data.get('console_name', ''),
            card_data.get('genre', ''),
            card_data.get('release_date', ''),
            card_data['id']
        ))

        conn.commit()
        return card_data['id']

    def get_card(self, card_id: int) -> Optional[Dict[str, Any]]:
        """
        Get card by ID.

        Args:
            card_id: Card ID

        Returns:
            Card data dictionary or None if not found
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,))
        row = cursor.fetchone()

        if row:
            return dict(row)
        return None

    def get_all_cards(self) -> List[Dict[str, Any]]:
        """
        Get all tracked cards.

        Returns:
            List of card data dictionaries
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM cards ORDER BY last_updated DESC")
        rows = cursor.fetchall()

        return [dict(row) for row in rows]

    def update_card_timestamp(self, card_id: int):
        """
        Update the last_updated timestamp for a card.

        Args:
            card_id: Card ID
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE cards SET last_updated = CURRENT_TIMESTAMP WHERE id = ?
        """, (card_id,))

        conn.commit()


class PriceHistoryOperations:
    """Operations for managing price history."""

    def __init__(self, db: Database):
        """
        Initialize price history operations.

        Args:
            db: Database instance
        """
        self.db = db

    def add_price_snapshot(self, card_id: int, price_data: Dict[str, int]):
        """
        Add a price snapshot to history.

        Args:
            card_id: Card ID
            price_data: Dictionary containing price information
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO price_history 
            (card_id, loose_price, psa_10_price, grade_9_price, grade_8_price, 
             bgs_10_price, cgc_10_price, sgc_10_price, sales_volume)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            card_id,
            price_data.get('loose_price', 0),
            price_data.get('psa_10_price', 0),
            price_data.get('grade_9_price', 0),
            price_data.get('grade_8_price', 0),
            price_data.get('bgs_10_price', 0),
            price_data.get('cgc_10_price', 0),
            price_data.get('sgc_10_price', 0),
            price_data.get('sales_volume', 0)
        ))

        conn.commit()

    def get_price_history(self, card_id: int, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get price history for a card.

        Args:
            card_id: Card ID
            days: Number of days of history to retrieve

        Returns:
            List of price history records
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM price_history 
            WHERE card_id = ? 
            AND timestamp >= datetime('now', '-' || ? || ' days')
            ORDER BY timestamp DESC
        """, (card_id, days))

        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    def get_latest_price(self, card_id: int) -> Optional[Dict[str, Any]]:
        """
        Get the most recent price snapshot for a card.

        Args:
            card_id: Card ID

        Returns:
            Latest price data or None if no history exists
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM price_history 
            WHERE card_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 1
        """, (card_id,))

        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

    def get_price_trend(self, card_id: int, field: str = 'loose_price') -> Optional[float]:
        """
        Calculate price trend (percentage change) over the last 30 days.

        Args:
            card_id: Card ID
            field: Price field to analyze (default: 'loose_price')

        Returns:
            Percentage change (positive for increase, negative for decrease) or None
        """
        history = self.get_price_history(card_id, days=30)
        
        if len(history) < 2:
            return None

        oldest_price = history[-1].get(field, 0)
        latest_price = history[0].get(field, 0)

        if oldest_price == 0:
            return None

        change_percent = ((latest_price - oldest_price) / oldest_price) * 100
        return round(change_percent, 2)


class InventoryOperations:
    """Operations for managing inventory."""

    def __init__(self, db: Database):
        """
        Initialize inventory operations.

        Args:
            db: Database instance
        """
        self.db = db

    def add_inventory_item(self, inventory_data: Dict[str, Any]) -> int:
        """
        Add an item to inventory.

        Args:
            inventory_data: Dictionary containing inventory information

        Returns:
            Inventory item ID
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO inventory 
            (card_id, purchase_date, purchase_price, condition, quantity, cost_basis, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            inventory_data['card_id'],
            inventory_data['purchase_date'],
            inventory_data['purchase_price'],
            inventory_data['condition'],
            inventory_data.get('quantity', 1),
            inventory_data['cost_basis'],
            inventory_data.get('notes', '')
        ))

        conn.commit()
        return cursor.lastrowid

    def get_inventory_item(self, inventory_id: int) -> Optional[Dict[str, Any]]:
        """
        Get inventory item by ID.

        Args:
            inventory_id: Inventory item ID

        Returns:
            Inventory data or None if not found
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM inventory WHERE id = ?", (inventory_id,))
        row = cursor.fetchone()

        if row:
            return dict(row)
        return None

    def get_inventory(self, sold: Optional[bool] = None) -> List[Dict[str, Any]]:
        """
        Get inventory items.

        Args:
            sold: Filter by sold status (None for all, True for sold, False for available)

        Returns:
            List of inventory items
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        if sold is None:
            cursor.execute("""
                SELECT i.*, c.product_name, c.console_name 
                FROM inventory i 
                JOIN cards c ON i.card_id = c.id
                ORDER BY i.purchase_date DESC
            """)
        else:
            cursor.execute("""
                SELECT i.*, c.product_name, c.console_name 
                FROM inventory i 
                JOIN cards c ON i.card_id = c.id
                WHERE i.sold = ?
                ORDER BY i.purchase_date DESC
            """, (1 if sold else 0,))

        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    def record_sale(
        self,
        inventory_id: int,
        sold_date: str,
        sold_price: int,
        ebay_fees: int
    ) -> bool:
        """
        Record a sale for an inventory item.

        Args:
            inventory_id: Inventory item ID
            sold_date: Date of sale
            sold_price: Sale price in cents
            ebay_fees: eBay fees in cents

        Returns:
            True if successful, False otherwise
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        # Get the item to calculate profit
        item = self.get_inventory_item(inventory_id)
        if not item:
            return False

        net_profit = sold_price - item['cost_basis'] - ebay_fees

        cursor.execute("""
            UPDATE inventory 
            SET sold = 1, sold_date = ?, sold_price = ?, ebay_fees = ?, net_profit = ?
            WHERE id = ?
        """, (sold_date, sold_price, ebay_fees, net_profit, inventory_id))

        conn.commit()
        return True

    def get_monthly_report(self, year: int, month: int) -> Dict[str, Any]:
        """
        Generate a monthly sales report.

        Args:
            year: Year
            month: Month (1-12)

        Returns:
            Dictionary with report data
        """
        conn = self.db.connect()
        cursor = conn.cursor()

        # Get sales for the month
        cursor.execute("""
            SELECT 
                COUNT(*) as total_sales,
                SUM(sold_price) as total_revenue,
                SUM(cost_basis) as total_cost,
                SUM(ebay_fees) as total_fees,
                SUM(net_profit) as total_profit
            FROM inventory
            WHERE sold = 1
            AND strftime('%Y', sold_date) = ?
            AND strftime('%m', sold_date) = ?
        """, (str(year), f"{month:02d}"))

        row = cursor.fetchone()
        
        return {
            'total_sales': row['total_sales'] or 0,
            'total_revenue': row['total_revenue'] or 0,
            'total_cost': row['total_cost'] or 0,
            'total_fees': row['total_fees'] or 0,
            'total_profit': row['total_profit'] or 0
        }

"""
Database Models

This module defines the SQLite database schema for the sports card tracker.
"""

import sqlite3
from datetime import datetime
from typing import Optional


class Database:
    """Database connection and schema management."""

    def __init__(self, db_path: str = "sportscards.db"):
        """
        Initialize database connection.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.conn: Optional[sqlite3.Connection] = None

    def connect(self) -> sqlite3.Connection:
        """
        Connect to the database.

        Returns:
            SQLite connection object
        """
        if self.conn is None:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row
        return self.conn

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None

    def initialize_schema(self):
        """Create all database tables if they don't exist."""
        conn = self.connect()
        cursor = conn.cursor()

        # Create cards table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cards (
                id INTEGER PRIMARY KEY,
                product_name TEXT NOT NULL,
                console_name TEXT,
                genre TEXT,
                release_date TEXT,
                first_tracked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create price_history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                card_id INTEGER NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                loose_price INTEGER DEFAULT 0,
                psa_10_price INTEGER DEFAULT 0,
                grade_9_price INTEGER DEFAULT 0,
                grade_8_price INTEGER DEFAULT 0,
                bgs_10_price INTEGER DEFAULT 0,
                cgc_10_price INTEGER DEFAULT 0,
                sgc_10_price INTEGER DEFAULT 0,
                sales_volume INTEGER DEFAULT 0,
                FOREIGN KEY (card_id) REFERENCES cards(id)
            )
        """)

        # Create inventory table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                card_id INTEGER NOT NULL,
                purchase_date DATE NOT NULL,
                purchase_price INTEGER NOT NULL,
                condition TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                cost_basis INTEGER NOT NULL,
                notes TEXT,
                sold BOOLEAN DEFAULT 0,
                sold_date DATE,
                sold_price INTEGER,
                ebay_fees INTEGER,
                net_profit INTEGER,
                FOREIGN KEY (card_id) REFERENCES cards(id)
            )
        """)

        # Create indexes for better query performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_price_history_card_id 
            ON price_history(card_id)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_price_history_timestamp 
            ON price_history(timestamp)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_inventory_card_id 
            ON inventory(card_id)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_inventory_sold 
            ON inventory(sold)
        """)

        conn.commit()

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

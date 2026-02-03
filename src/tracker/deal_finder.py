"""
Deal Finder

This module identifies profitable buying opportunities.
"""

from typing import Dict, List, Any, Optional
from database.models import Database
from database.operations import PriceHistoryOperations
from calculator.profit_calculator import ProfitCalculator


class DealFinder:
    """Finds profitable card deals."""

    def __init__(
        self,
        db: Database,
        calculator: ProfitCalculator,
        min_roi_percent: float = 15.0
    ):
        """
        Initialize deal finder.

        Args:
            db: Database instance
            calculator: Profit calculator instance
            min_roi_percent: Minimum ROI percentage to consider (default: 15.0)
        """
        self.db = db
        self.calculator = calculator
        self.min_roi_percent = min_roi_percent
        self.price_ops = PriceHistoryOperations(db)

    def find_deals(
        self,
        sport: Optional[str] = None,
        min_roi: Optional[float] = None,
        price_range: Optional[tuple] = None
    ) -> List[Dict[str, Any]]:
        """
        Find cards that are good buying opportunities.

        Args:
            sport: Filter by sport/genre
            min_roi: Minimum ROI percentage (overrides default)
            price_range: Tuple of (min_price, max_price) in cents

        Returns:
            List of deal opportunities
        """
        min_roi_threshold = min_roi if min_roi is not None else self.min_roi_percent
        
        conn = self.db.connect()
        cursor = conn.cursor()

        # Build query
        query = """
            SELECT c.*, ph.loose_price, ph.psa_10_price, ph.grade_9_price
            FROM cards c
            JOIN price_history ph ON c.id = ph.card_id
            WHERE ph.id IN (
                SELECT id FROM price_history ph2 
                WHERE ph2.card_id = c.id 
                ORDER BY ph2.timestamp DESC 
                LIMIT 1
            )
        """
        
        params = []
        
        if sport:
            query += " AND c.genre LIKE ?"
            params.append(f"%{sport}%")
        
        if price_range:
            min_price, max_price = price_range
            query += " AND ph.loose_price BETWEEN ? AND ?"
            params.extend([min_price, max_price])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        deals = []
        for row in rows:
            card_data = dict(row)
            
            # Simulate a potential purchase at current market price
            market_price = card_data['loose_price']
            
            if market_price == 0:
                continue
            
            # Look for cards where you could buy below market
            # (In real scenario, you'd compare with actual eBay listings)
            
            # Get price trend
            trend = self.price_ops.get_price_trend(card_data['id'])
            
            # If price is decreasing, it might be a good buy opportunity
            if trend and trend < -5:  # Price dropped more than 5%
                # Calculate potential profit
                # Assume you can buy at 85% of current market (15% discount)
                potential_purchase_price = int(market_price * 0.85)
                
                profit_calc = self.calculator.calculate_profit(
                    potential_purchase_price,
                    market_price
                )
                
                if profit_calc['roi_percent'] >= min_roi_threshold:
                    deals.append({
                        'card_id': card_data['id'],
                        'product_name': card_data['product_name'],
                        'console_name': card_data['console_name'],
                        'genre': card_data['genre'],
                        'market_price': market_price,
                        'potential_buy_price': potential_purchase_price,
                        'price_trend': trend,
                        'expected_profit': profit_calc['net_profit'],
                        'roi_percent': profit_calc['roi_percent']
                    })

        # Sort by ROI (descending)
        deals.sort(key=lambda x: x['roi_percent'], reverse=True)
        
        return deals

    def analyze_deal(
        self,
        market_value_cents: int,
        asking_price_cents: int,
        shipping_cost_cents: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Analyze a specific deal opportunity.

        Args:
            market_value_cents: Market value in cents
            asking_price_cents: Asking price in cents
            shipping_cost_cents: Shipping cost in cents

        Returns:
            Dictionary with deal analysis
        """
        # Calculate total purchase cost
        total_cost = asking_price_cents
        if shipping_cost_cents:
            total_cost += shipping_cost_cents
        
        # Calculate profit
        profit_calc = self.calculator.calculate_profit(
            total_cost,
            market_value_cents,
            shipping_cost_cents
        )
        
        # Determine discount percentage
        discount_percent = 0.0
        if market_value_cents > 0:
            discount_percent = ((market_value_cents - asking_price_cents) / market_value_cents) * 100
        
        # Recommendation
        recommendation = "PASS"
        if profit_calc['roi_percent'] >= self.min_roi_percent * 1.5:
            recommendation = "STRONG BUY"
        elif profit_calc['roi_percent'] >= self.min_roi_percent:
            recommendation = "BUY"
        elif profit_calc['roi_percent'] >= self.min_roi_percent * 0.5:
            recommendation = "MAYBE"
        
        return {
            'market_value': market_value_cents,
            'asking_price': asking_price_cents,
            'discount_percent': round(discount_percent, 2),
            'profit_calculation': profit_calc,
            'recommendation': recommendation,
            'meets_minimum_roi': profit_calc['roi_percent'] >= self.min_roi_percent
        }

    def compare_conditions(self, card_id: int) -> Dict[str, Any]:
        """
        Compare profit potential across different card conditions.

        Args:
            card_id: Card ID

        Returns:
            Dictionary with profit analysis for each condition
        """
        latest_price = self.price_ops.get_latest_price(card_id)
        
        if not latest_price:
            return {}
        
        conditions = {
            'ungraded': latest_price.get('loose_price', 0),
            'psa_10': latest_price.get('psa_10_price', 0),
            'grade_9': latest_price.get('grade_9_price', 0),
            'grade_8': latest_price.get('grade_8_price', 0),
            'bgs_10': latest_price.get('bgs_10_price', 0),
            'cgc_10': latest_price.get('cgc_10_price', 0),
            'sgc_10': latest_price.get('sgc_10_price', 0)
        }
        
        results = {}
        for condition, price in conditions.items():
            if price > 0:
                # Assume you can buy at 15% discount
                buy_price = int(price * 0.85)
                profit_calc = self.calculator.calculate_profit(buy_price, price)
                
                results[condition] = {
                    'market_value': price,
                    'potential_buy_price': buy_price,
                    'expected_profit': profit_calc['net_profit'],
                    'roi_percent': profit_calc['roi_percent']
                }
        
        return results

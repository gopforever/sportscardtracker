"""
Command-Line Interface for Sports Card Tracker

This module provides a CLI for interacting with the sports card tracker.
"""

import os
import sys
from datetime import datetime, date
from pathlib import Path
from typing import Optional

import click
import yaml
from tabulate import tabulate

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from api.sportscardspro import SportsCardsProAPI, APIError
from database.models import Database
from database.operations import CardOperations, PriceHistoryOperations, InventoryOperations
from tracker.price_tracker import PriceTracker
from tracker.deal_finder import DealFinder
from calculator.profit_calculator import ProfitCalculator


def load_config(config_path: str = "config.yaml") -> dict:
    """Load configuration from YAML file."""
    if not os.path.exists(config_path):
        click.echo(f"Error: Configuration file '{config_path}' not found.")
        click.echo("Please create a config.yaml file based on config.yaml.example")
        sys.exit(1)
    
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def get_api_client(config: dict) -> SportsCardsProAPI:
    """Create and return API client from config."""
    api_config = config.get('api', {})
    token = api_config.get('token', '')
    base_url = api_config.get('base_url', 'https://www.sportscardspro.com')
    
    if not token or token == 'YOUR_TOKEN_HERE':
        click.echo("Error: Please set your API token in config.yaml")
        sys.exit(1)
    
    return SportsCardsProAPI(token, base_url)


def get_calculator(config: dict) -> ProfitCalculator:
    """Create and return profit calculator from config."""
    business = config.get('business', {})
    return ProfitCalculator(
        ebay_fee_percent=business.get('ebay_fee_percent', 13.0),
        ebay_transaction_fee=business.get('ebay_transaction_fee', 0.30),
        default_shipping_cost=business.get('default_shipping_cost', 5.00)
    )


@click.group()
@click.pass_context
def cli(ctx):
    """Sports Card Price Tracker - Track prices and find profitable deals."""
    ctx.ensure_object(dict)
    
    # Load config
    ctx.obj['config'] = load_config()
    
    # Initialize database
    db = Database()
    db.initialize_schema()
    ctx.obj['db'] = db


@cli.command()
@click.argument('query')
@click.option('--limit', default=10, help='Maximum number of results')
@click.pass_context
def search(ctx, query: str, limit: int):
    """Search for cards by name or player."""
    config = ctx.obj['config']
    db = ctx.obj['db']
    
    try:
        api = get_api_client(config)
        tracker = PriceTracker(db, api)
        
        click.echo(f"Searching for: {query}")
        results = tracker.search_and_track(query)
        
        if not results:
            click.echo("No results found.")
            return
        
        # Display results
        table_data = []
        for i, card in enumerate(results[:limit], 1):
            table_data.append([
                i,
                card['id'],
                card['product_name'][:50],
                card['console_name'][:30],
                ProfitCalculator().format_currency(card['loose_price']),
                ProfitCalculator().format_currency(card['psa_10_price'])
            ])
        
        headers = ['#', 'ID', 'Product Name', 'Set', 'Ungraded', 'PSA 10']
        click.echo(tabulate(table_data, headers=headers, tablefmt='grid'))
        
    except APIError as e:
        click.echo(f"API Error: {str(e)}", err=True)
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


@cli.command()
@click.option('--id', 'card_id', required=True, type=int, help='Card ID to track')
@click.pass_context
def track(ctx, card_id: int):
    """Add a card to tracking database."""
    config = ctx.obj['config']
    db = ctx.obj['db']
    
    try:
        api = get_api_client(config)
        tracker = PriceTracker(db, api)
        
        click.echo(f"Tracking card ID: {card_id}")
        
        if tracker.track_card(card_id):
            click.echo("✓ Card added to tracking database")
            
            # Show card info
            card_ops = CardOperations(db)
            card = card_ops.get_card(card_id)
            
            if card:
                click.echo(f"\nCard: {card['product_name']}")
                click.echo(f"Set: {card['console_name']}")
                click.echo(f"Genre: {card['genre']}")
        else:
            click.echo("✗ Failed to track card", err=True)
            
    except APIError as e:
        click.echo(f"API Error: {str(e)}", err=True)
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


@cli.command()
@click.option('--id', 'card_id', required=True, type=int, help='Card ID')
@click.option('--price', required=True, type=float, help='Purchase price in dollars')
@click.option('--condition', required=True, help='Card condition (e.g., ungraded, psa-10)')
@click.option('--quantity', default=1, help='Quantity purchased')
@click.option('--notes', default='', help='Additional notes')
@click.pass_context
def add_inventory(ctx, card_id: int, price: float, condition: str, quantity: int, notes: str):
    """Add a card to inventory."""
    db = ctx.obj['db']
    
    try:
        inv_ops = InventoryOperations(db)
        card_ops = CardOperations(db)
        
        # Check if card exists
        card = card_ops.get_card(card_id)
        if not card:
            click.echo(f"Error: Card ID {card_id} not found. Please track it first.", err=True)
            return
        
        # Convert price to cents
        price_cents = int(price * 100)
        cost_basis = price_cents * quantity
        
        # Add to inventory
        inventory_data = {
            'card_id': card_id,
            'purchase_date': date.today().isoformat(),
            'purchase_price': price_cents,
            'condition': condition,
            'quantity': quantity,
            'cost_basis': cost_basis,
            'notes': notes
        }
        
        inv_id = inv_ops.add_inventory_item(inventory_data)
        
        click.echo(f"✓ Added to inventory (ID: {inv_id})")
        click.echo(f"Card: {card['product_name']}")
        click.echo(f"Condition: {condition}")
        click.echo(f"Quantity: {quantity}")
        click.echo(f"Cost: ${price:.2f} each (${cost_basis/100:.2f} total)")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


@cli.command()
@click.option('--sport', help='Filter by sport/genre')
@click.option('--min-roi', type=float, help='Minimum ROI percentage')
@click.option('--min-price', type=float, help='Minimum price in dollars')
@click.option('--max-price', type=float, help='Maximum price in dollars')
@click.pass_context
def find_deals(ctx, sport: Optional[str], min_roi: Optional[float], 
               min_price: Optional[float], max_price: Optional[float]):
    """Find profitable card deals."""
    config = ctx.obj['config']
    db = ctx.obj['db']
    
    try:
        calculator = get_calculator(config)
        min_roi_config = config.get('business', {}).get('min_profit_margin', 15.0)
        
        deal_finder = DealFinder(db, calculator, min_roi_config)
        
        # Convert price range to cents
        price_range = None
        if min_price or max_price:
            min_cents = int(min_price * 100) if min_price else 0
            max_cents = int(max_price * 100) if max_price else 999999999
            price_range = (min_cents, max_cents)
        
        click.echo("Searching for deals...")
        deals = deal_finder.find_deals(
            sport=sport,
            min_roi=min_roi,
            price_range=price_range
        )
        
        if not deals:
            click.echo("No deals found matching criteria.")
            return
        
        # Display deals
        table_data = []
        for deal in deals[:20]:  # Show top 20
            table_data.append([
                deal['card_id'],
                deal['product_name'][:40],
                calculator.format_currency(deal['market_price']),
                calculator.format_currency(deal['potential_buy_price']),
                f"{deal['price_trend']:.1f}%",
                calculator.format_currency(deal['expected_profit']),
                f"{deal['roi_percent']:.1f}%"
            ])
        
        headers = ['ID', 'Card', 'Market', 'Buy At', 'Trend', 'Profit', 'ROI']
        click.echo(tabulate(table_data, headers=headers, tablefmt='grid'))
        click.echo(f"\nFound {len(deals)} potential deals")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


@cli.command()
@click.option('--purchase-price', required=True, type=float, help='Purchase price in dollars')
@click.option('--market-value', required=True, type=float, help='Market value in dollars')
@click.option('--shipping', type=float, help='Shipping cost in dollars')
@click.pass_context
def calc_profit(ctx, purchase_price: float, market_value: float, shipping: Optional[float]):
    """Calculate potential profit for a purchase."""
    config = ctx.obj['config']
    calculator = get_calculator(config)
    
    # Convert to cents
    purchase_cents = int(purchase_price * 100)
    market_cents = int(market_value * 100)
    shipping_cents = int(shipping * 100) if shipping else None
    
    result = calculator.calculate_profit(purchase_cents, market_cents, shipping_cents)
    
    click.echo("\n=== Profit Calculation ===")
    click.echo(f"Purchase Price:  {calculator.format_currency(result['purchase_price'])}")
    click.echo(f"Market Value:    {calculator.format_currency(result['market_value'])}")
    click.echo(f"Shipping Cost:   {calculator.format_currency(result['shipping_cost'])}")
    click.echo(f"eBay Fees:       {calculator.format_currency(result['ebay_fees'])}")
    click.echo(f"─────────────────────────")
    click.echo(f"Gross Profit:    {calculator.format_currency(result['gross_profit'])}")
    click.echo(f"Total Costs:     {calculator.format_currency(result['total_costs'])}")
    click.echo(f"Net Profit:      {calculator.format_currency(result['net_profit'])}")
    click.echo(f"ROI:             {result['roi_percent']:.2f}%")
    click.echo()


@cli.command()
@click.option('--status', type=click.Choice(['all', 'available', 'sold']), default='all',
              help='Filter by status')
@click.pass_context
def inventory(ctx, status: str):
    """View inventory items."""
    db = ctx.obj['db']
    
    try:
        inv_ops = InventoryOperations(db)
        
        sold_filter = None
        if status == 'available':
            sold_filter = False
        elif status == 'sold':
            sold_filter = True
        
        items = inv_ops.get_inventory(sold=sold_filter)
        
        if not items:
            click.echo(f"No {status} inventory items.")
            return
        
        # Display inventory
        table_data = []
        calculator = ProfitCalculator()
        
        for item in items:
            status_icon = "✓" if item['sold'] else "○"
            profit = calculator.format_currency(item['net_profit']) if item['sold'] else '-'
            
            table_data.append([
                status_icon,
                item['id'],
                item['product_name'][:40],
                item['condition'],
                item['quantity'],
                calculator.format_currency(item['purchase_price']),
                item['purchase_date'],
                profit
            ])
        
        headers = ['', 'ID', 'Card', 'Condition', 'Qty', 'Cost', 'Date', 'Profit']
        click.echo(tabulate(table_data, headers=headers, tablefmt='grid'))
        click.echo(f"\nTotal items: {len(items)}")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


@cli.command()
@click.option('--inventory-id', required=True, type=int, help='Inventory item ID')
@click.option('--sold-price', required=True, type=float, help='Sale price in dollars')
@click.option('--date', help='Sale date (YYYY-MM-DD, default: today)')
@click.option('--shipping', type=float, help='Actual shipping cost in dollars')
@click.pass_context
def record_sale(ctx, inventory_id: int, sold_price: float, date: Optional[str], 
                shipping: Optional[float]):
    """Record a sale for an inventory item."""
    config = ctx.obj['config']
    db = ctx.obj['db']
    
    try:
        inv_ops = InventoryOperations(db)
        calculator = get_calculator(config)
        
        # Get inventory item
        item = inv_ops.get_inventory_item(inventory_id)
        if not item:
            click.echo(f"Error: Inventory item {inventory_id} not found.", err=True)
            return
        
        if item['sold']:
            click.echo("Error: Item already marked as sold.", err=True)
            return
        
        # Convert to cents
        sold_cents = int(sold_price * 100)
        
        # Calculate eBay fees
        ebay_fees = calculator.calculate_ebay_fees(sold_cents)
        
        # Use provided date or today
        sale_date = date if date else datetime.now().date().isoformat()
        
        # Record the sale
        if inv_ops.record_sale(inventory_id, sale_date, sold_cents, ebay_fees):
            # Calculate and display profit
            shipping_cents = int(shipping * 100) if shipping else int(calculator.default_shipping_cost * 100)
            net_profit = sold_cents - item['cost_basis'] - ebay_fees - shipping_cents
            
            click.echo("✓ Sale recorded successfully")
            click.echo(f"\nSold Price:      {calculator.format_currency(sold_cents)}")
            click.echo(f"Cost Basis:      {calculator.format_currency(item['cost_basis'])}")
            click.echo(f"eBay Fees:       {calculator.format_currency(ebay_fees)}")
            click.echo(f"Shipping:        {calculator.format_currency(shipping_cents)}")
            click.echo(f"─────────────────────────")
            click.echo(f"Net Profit:      {calculator.format_currency(net_profit)}")
            
            if item['cost_basis'] > 0:
                roi = (net_profit / item['cost_basis']) * 100
                click.echo(f"ROI:             {roi:.2f}%")
        else:
            click.echo("✗ Failed to record sale", err=True)
            
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


@cli.command()
@click.option('--month', required=True, help='Month in format YYYY-MM')
@click.pass_context
def report(ctx, month: str):
    """Generate monthly sales report."""
    config = ctx.obj['config']
    db = ctx.obj['db']
    
    try:
        # Parse month
        year, month_num = map(int, month.split('-'))
        
        inv_ops = InventoryOperations(db)
        report_data = inv_ops.get_monthly_report(year, month_num)
        calculator = ProfitCalculator()
        
        # Get goal from config
        goal = config.get('goals', {}).get('march_2026_target', 100.0) * 100  # Convert to cents
        
        click.echo(f"\n=== Monthly Report: {month} ===\n")
        click.echo(f"Total Sales:     {report_data['total_sales']}")
        click.echo(f"Revenue:         {calculator.format_currency(report_data['total_revenue'])}")
        click.echo(f"Cost:            {calculator.format_currency(report_data['total_cost'])}")
        click.echo(f"eBay Fees:       {calculator.format_currency(report_data['total_fees'])}")
        click.echo(f"─────────────────────────")
        click.echo(f"Net Profit:      {calculator.format_currency(report_data['total_profit'])}")
        click.echo(f"Goal:            {calculator.format_currency(int(goal))}")
        
        if goal > 0:
            progress = (report_data['total_profit'] / goal) * 100
            click.echo(f"Progress:        {progress:.1f}%")
            
            if progress >= 100:
                click.echo("\n🎉 Goal achieved!")
            else:
                remaining = goal - report_data['total_profit']
                click.echo(f"Remaining:       {calculator.format_currency(int(remaining))}")
        
        click.echo()
        
    except ValueError:
        click.echo("Error: Invalid month format. Use YYYY-MM (e.g., 2026-03)", err=True)
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


@cli.command()
@click.pass_context
def update_prices(ctx):
    """Update prices for all tracked cards."""
    config = ctx.obj['config']
    db = ctx.obj['db']
    
    try:
        api = get_api_client(config)
        tracker = PriceTracker(db, api)
        
        click.echo("Updating prices for all tracked cards...")
        
        result = tracker.update_all_prices()
        
        click.echo(f"\n✓ Update complete")
        click.echo(f"Total cards: {result['total']}")
        click.echo(f"Successful: {result['successful']}")
        click.echo(f"Failed: {result['failed']}")
        click.echo(f"Timestamp: {result['timestamp']}")
        
    except APIError as e:
        click.echo(f"API Error: {str(e)}", err=True)
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)


if __name__ == '__main__':
    cli(obj={})

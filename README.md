# Sports Card Price Tracker

A comprehensive tool for tracking sports card prices, managing inventory, and finding profitable deals for eBay reselling. Available as both a Python CLI tool and a modern web application.

## 🌐 Web Application

**NEW!** Now available as a web application that deploys to Netlify!

- 🚀 **Live Dashboard** - Visual overview of your inventory and profits
- 🔍 **Card Search** - Search thousands of cards with real-time pricing
- 💡 **Deal Finder** - Automatically identify profitable opportunities
- 📦 **Inventory Manager** - Track purchases and current values
- 💰 **Profit Calculator** - Calculate eBay fees and ROI
- 📊 **Sales Tracker** - Record sales and track performance
- 📈 **Monthly Reports** - Charts and analytics for your business
- 📱 **Mobile-Responsive** - Works on desktop, tablet, and mobile

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gopforever/sportscardtracker)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Features

### Python CLI Tool
- 🔍 **SportsCardsPro API Integration** - Fetch real-time card prices and data
- 💾 **SQLite Database** - Track price history and inventory
- 💰 **Profit Calculator** - Calculate potential and actual profits including eBay fees
- 🎯 **Deal Finder** - Identify profitable buying opportunities
- 📊 **Monthly Reports** - Track progress toward sales goals
- 🖥️ **CLI Interface** - Easy-to-use command-line tools

## Installation

### Web Application

The easiest way to get started is to deploy the web application to Netlify:

1. **Deploy to Netlify** (see [DEPLOYMENT.md](DEPLOYMENT.md))
   - Connect your GitHub repository
   - Add your SportsCardsPro API token as an environment variable
   - Deploy!

2. **Local Development**
   ```bash
   # Clone the repository
   git clone https://github.com/gopforever/sportscardtracker.git
   cd sportscardtracker
   
   # Install dependencies
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env and add your API token
   
   # Run development server
   npm run functions:dev
   ```

### Python CLI Tool

If you prefer the command-line interface:

#### Prerequisites

- Python 3.9 or higher
- pip (Python package installer)

#### Setup

1. Clone the repository:
```bash
git clone https://github.com/gopforever/sportscardtracker.git
cd sportscardtracker
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create configuration file:
```bash
cp config.yaml.example config.yaml
```

4. Edit `config.yaml` and add your SportsCardsPro API token:
```yaml
api:
  token: "YOUR_TOKEN_HERE"  # Replace with your actual token
```

### Getting a SportsCardsPro API Token

1. Visit [SportsCardsPro.com](https://www.sportscardspro.com)
2. Create an account or log in
3. Navigate to your account settings
4. Find the API section and generate a token
5. Copy the token to your `config.yaml` file

## Usage

### Web Application

Once deployed, access your web application at your Netlify URL:

**Dashboard (`/`)**
- View total inventory value
- See month-to-date profit
- Track progress toward monthly goal
- Quick stats and charts

**Card Search (`/search`)**
- Search for any sports card
- View all grade prices (PSA 10, BGS 10, Ungraded, etc.)
- Add cards to inventory directly

**Deal Finder (`/deals`)**
- Set minimum ROI threshold
- Filter by sport/genre
- See recommended buy prices
- Calculate potential profits

**Inventory Manager (`/inventory`)**
- View all your cards
- Track purchase prices and current values
- See potential profits
- Edit or delete items

**Profit Calculator (`/calculator`)**
- Enter purchase and sale prices
- Calculate eBay fees automatically
- See net profit and ROI
- Compare multiple scenarios

**Sales Tracker (`/sales`)**
- Record completed sales
- View sales history
- Track actual profits
- See ROI for each sale

**Monthly Reports (`/reports`)**
- Select any month
- View sales performance
- See charts and analytics
- Track goal progress

### Python CLI Quick Start

```bash
# Search for cards
python tracker.py search "michael jordan rookie"

# Track a card (start monitoring its price)
python tracker.py track --id 72584

# Add a card to your inventory
python tracker.py add-inventory --id 72584 --price 50.00 --condition ungraded --quantity 1

# Find profitable deals
python tracker.py find-deals --sport basketball --min-roi 25

# Calculate profit for a potential purchase
python tracker.py calc-profit --purchase-price 50.00 --market-value 75.00

# View your inventory
python tracker.py inventory --status available

# Record a sale
python tracker.py record-sale --inventory-id 1 --sold-price 75.00

# Generate monthly report
python tracker.py report --month 2026-03

# Update all tracked card prices (run daily)
python tracker.py update-prices
```

### Detailed Command Reference

#### Search for Cards

Search the SportsCardsPro database for specific cards:

```bash
python tracker.py search "tom brady rookie"
python tracker.py search "1986 fleer jordan" --limit 20
```

#### Track a Card

Add a card to your tracking database to monitor price changes:

```bash
python tracker.py track --id 72584
```

This will:
- Fetch card data from the API
- Store it in the database
- Create an initial price snapshot

#### Add to Inventory

Record a card purchase in your inventory:

```bash
python tracker.py add-inventory \
  --id 72584 \
  --price 50.00 \
  --condition "ungraded" \
  --quantity 1 \
  --notes "Bought from local card shop"
```

Conditions: `ungraded`, `psa-10`, `psa-9`, `bgs-10`, `cgc-10`, `sgc-10`, etc.

#### Find Deals

Identify profitable buying opportunities:

```bash
# All sports with default minimum ROI
python tracker.py find-deals

# Basketball only, 25% minimum ROI
python tracker.py find-deals --sport basketball --min-roi 25

# Price range filter
python tracker.py find-deals --min-price 10.00 --max-price 100.00
```

#### Calculate Profit

Estimate profit for a potential purchase:

```bash
python tracker.py calc-profit \
  --purchase-price 50.00 \
  --market-value 75.00 \
  --shipping 4.00
```

Output includes:
- eBay fees (13% + $0.30)
- Shipping costs
- Net profit
- ROI percentage

#### View Inventory

List your inventory items:

```bash
# All items
python tracker.py inventory --status all

# Available items only
python tracker.py inventory --status available

# Sold items only
python tracker.py inventory --status sold
```

#### Record a Sale

Mark an inventory item as sold:

```bash
python tracker.py record-sale \
  --inventory-id 1 \
  --sold-price 75.00 \
  --date 2026-03-15 \
  --shipping 4.50
```

#### Generate Reports

Create monthly sales reports:

```bash
python tracker.py report --month 2026-03
```

Shows:
- Total sales
- Revenue
- Costs
- eBay fees
- Net profit
- Progress toward monthly goal

#### Update Prices

Refresh prices for all tracked cards:

```bash
python tracker.py update-prices
```

**Tip:** Automate this with a cron job to run daily:
```bash
# Run daily at 6 AM
0 6 * * * cd /path/to/sportscardtracker && python tracker.py update-prices
```

## Configuration

Edit `config.yaml` to customize settings:

```yaml
api:
  token: "YOUR_TOKEN_HERE"
  base_url: "https://www.sportscardspro.com"

business:
  ebay_fee_percent: 13.0          # eBay final value fee
  ebay_transaction_fee: 0.30      # Per-transaction fee
  default_shipping_cost: 5.00     # Default shipping estimate
  min_profit_margin: 10.0         # Minimum profit % to consider

tracking:
  update_interval_hours: 24       # How often to update prices
  price_drop_alert_percent: 10.0  # Alert threshold

goals:
  march_2026_target: 100.00       # Monthly profit goal
  monthly_growth_percent: 20.0    # Growth target
```

## Example Workflows

### Workflow 1: Finding and Buying a Card

1. **Search for cards:**
   ```bash
   python tracker.py search "patrick mahomes rookie"
   ```

2. **Track interesting cards:**
   ```bash
   python tracker.py track --id 72584
   ```

3. **Check for deals:**
   ```bash
   python tracker.py find-deals --sport football --min-roi 20
   ```

4. **Calculate profit before buying:**
   ```bash
   python tracker.py calc-profit --purchase-price 45.00 --market-value 70.00
   ```

5. **Add to inventory after purchase:**
   ```bash
   python tracker.py add-inventory --id 72584 --price 45.00 --condition ungraded --quantity 1
   ```

### Workflow 2: Selling a Card

1. **Check inventory:**
   ```bash
   python tracker.py inventory --status available
   ```

2. **List on eBay** (outside this tool)

3. **Record sale after it sells:**
   ```bash
   python tracker.py record-sale --inventory-id 1 --sold-price 70.00
   ```

4. **Check monthly progress:**
   ```bash
   python tracker.py report --month 2026-03
   ```

### Workflow 3: Daily Price Monitoring

1. **Update all prices:**
   ```bash
   python tracker.py update-prices
   ```

2. **Check for price changes:**
   ```bash
   python tracker.py find-deals
   ```

3. **Review inventory values** to see if you should adjust eBay prices

## Business Strategy Tips

### Finding Profitable Cards

1. **Track Popular Players**: Focus on rookie cards of star players
2. **Monitor Price Trends**: Look for cards with recent price drops
3. **Buy Below Market**: Target listings 15-20% below SportsCardsPro values
4. **Consider Condition**: Ungraded cards can be good value if you can grade them
5. **Volume vs. Margin**: Balance quick sales (lower margin) with big wins (higher margin)

### Pricing Strategy

- **Quick Sale**: Price at 90-95% of market value
- **Patient Sale**: Price at 100-105% of market value
- **Rare Cards**: Can go higher if low supply

### eBay Fees

Current eBay fees (as of 2026):
- 13% final value fee on sale price
- $0.30 per transaction
- Additional fees may apply for promoted listings

### Monthly Goal Planning

To reach $100 profit in March 2026:

**Option 1: Low Volume, High Margin**
- 5 cards at $20 profit each
- Focus on $50-$200 cards with 25%+ ROI

**Option 2: High Volume, Low Margin**  
- 20 cards at $5 profit each
- Focus on $10-$50 cards with quick turnover

**Option 3: Mixed Strategy** (Recommended)
- 3 big wins ($25 profit each = $75)
- 5 small wins ($5 profit each = $25)
- Balances risk and reward

## Database Schema

### Tables

**cards** - Tracked cards
- `id` - SportsCardsPro product ID
- `product_name` - Full card name
- `console_name` - Set name
- `genre` - Sport/category
- `first_tracked` - When tracking started
- `last_updated` - Last price update

**price_history** - Historical prices
- `card_id` - Foreign key to cards
- `timestamp` - When price was recorded
- `loose_price` - Ungraded price (cents)
- `psa_10_price` - PSA 10 price (cents)
- Additional grading company prices

**inventory** - Your card inventory
- `card_id` - Foreign key to cards
- `purchase_date` - When you bought it
- `purchase_price` - What you paid (cents)
- `condition` - Card condition
- `sold` - Whether it's been sold
- `sold_price` - Sale price (cents)
- `net_profit` - Profit after fees (cents)

## Development

### Running Tests

```bash
python -m unittest discover tests
```

### Project Structure

```
sportscardtracker/
├── src/
│   ├── api/
│   │   └── sportscardspro.py      # API client
│   ├── database/
│   │   ├── models.py               # Database schema
│   │   └── operations.py           # CRUD operations
│   ├── tracker/
│   │   ├── price_tracker.py        # Price tracking
│   │   └── deal_finder.py          # Deal finding
│   ├── calculator/
│   │   └── profit_calculator.py    # Profit calculations
│   └── cli.py                       # CLI interface
├── tests/                           # Test suite
├── tracker.py                       # Entry point
├── config.yaml.example              # Config template
├── requirements.txt                 # Dependencies
└── README.md                        # This file
```

## Troubleshooting

### "API token not found"
Make sure you've created `config.yaml` from the example and added your token.

### "Card not found"
The card ID might be invalid. Search first to find valid IDs.

### "Database locked"
Only one process can write to the database at a time. Close other instances.

### Import errors
Make sure you've installed all dependencies: `pip install -r requirements.txt`

### API rate limits
SportsCardsPro may have rate limits. Space out your requests if you get errors.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is for personal use. Always verify prices independently before making purchases. Past price trends do not guarantee future performance. eBay fees and policies subject to change.

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## Technology Stack

### Web Application
- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Netlify Functions (Node.js)
- **Storage:** Netlify Blob Storage
- **Routing:** React Router
- **Charts:** Recharts
- **API Client:** Axios
- **Deployment:** Netlify

### Python CLI
- **Language:** Python 3.9+
- **Database:** SQLite
- **API Client:** Requests
- **CLI Framework:** Click
- **Data Processing:** Pandas

## Project Structure

```
sportscardtracker/
├── netlify/
│   └── functions/          # Serverless functions
│       ├── search-cards.js
│       ├── get-card.js
│       ├── find-deals.js
│       ├── inventory.js
│       ├── calculate-profit.js
│       ├── record-sale.js
│       ├── reports.js
│       └── utils/          # Shared utilities
├── src/
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Frontend utilities
│   ├── api/                # Python API client
│   ├── calculator/         # Python profit calculator
│   ├── database/           # Python database models
│   ├── tracker/            # Python tracking logic
│   ├── App.jsx             # Main React app
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── tests/                  # Python tests
├── netlify.toml            # Netlify configuration
├── vite.config.js          # Vite build config
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

## Roadmap

Completed:
- [x] Web interface
- [x] Advanced analytics and charts
- [x] Real-time profit tracking
- [x] Mobile-responsive design
- [x] Cloud deployment (Netlify)

Future enhancements:
- [ ] Price alerts via email
- [ ] eBay API integration for automatic listing
- [ ] Mobile app (PWA)
- [ ] Multi-user support
- [ ] Automated grading cost analysis
- [ ] Integration with other marketplaces
- [ ] Advanced AI-powered deal recommendations

---

**Good luck with your sports card business! 📈🏀⚾🏈**

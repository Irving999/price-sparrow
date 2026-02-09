# Price Sparrow

A full-stack price tracking app that monitors product prices across major retailers and alerts you via email when it drops to or below your target price.

## Features

- **Track prices** across 9 supported stores: Amazon, Best Buy, Target, Walmart, Macy's, Zara, Uniqlo, Nordstrom, and Nike
- **Set target prices** and receive email alerts when prices drop
- **Price history charts** to visualize price trends over time

## Tech Stack

**Frontend:** React, React Router, Tailwind CSS, Chart.js, Swiper, Vite

**Backend:** Express, PostgreSQL, JWT, bcrypt, Playwright, Postmark

**Deployment:** Vercel (frontend), Render (backend), Neon (database)

## How Price Tracking Works

- Product pages are scraped using Playwright for supported stores
- Prices are checked on a scheduled cron job
- Historical prices are stored per product
- Alerts are triggered when target prices are met

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Clone the repo

```sh
git clone https://github.com/Irving999/price-sparrow.git
cd price-sparrow
```

2. Install dependencies

```sh
cd server && npm install
cd ../client && npm install
```

3. Set up the database

Run the schema in `server/db/schema.sql` against your PostgreSQL database.

4. Configure environment variables

**server/.env**
```
DB_URL=your_postgres_connection_string
JWT_SECRET=your_random_secret
JWT_EXPIRES_IN=7d
POSTMARK_API_KEY=your_postmark_key
FROM_EMAIL=your_verified_email
CORS_ORIGIN=http://localhost:5173
```

**client/.env**
```
VITE_API_URL=http://localhost:3000
```

5. Start the app

```sh
# Terminal 1 — backend
cd server && npm start

# Terminal 2 — frontend
cd client && npm run dev
```

The app will be running at `http://localhost:5173`.

## Testing

```sh
cd server && npm test
```

Runs 49 tests across 6 suites covering auth, watches, products, alerts, stores, and middleware. All tests use mocked dependencies — no database or external services required.

## API Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |

### Watches (auth required)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/me` | Get current user |
| GET | `/api/me/watches` | List tracked products |
| GET | `/api/me/watches/:id` | Get watch with price history |
| POST | `/api/me/watches` | Track a new product |
| PATCH | `/api/me/watches/:id` | Update target price |
| DELETE | `/api/me/watches/:id` | Stop tracking |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products/:id` | Get product details |
| GET | `/api/products/:id/watchers` | Get watcher count |
| POST | `/api/products/:id/price` | Scrape and update price |

### Other
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/alerts` | Get triggered price alerts (auth required) |
| GET | `/api/stores` | List supported stores |

## Notes

- Price checks are rate-limited
- Scraping is designed to minimize load on retailers
- No user data is shared with third parties
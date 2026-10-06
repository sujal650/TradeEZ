# TradeEZ — Full-Stack MERN Stock Trading & Portfolio Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-61dafb.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mentor](https://img.shields.io/badge/Mentor-Syed%20Abul%20Arshad-blue.svg)](mailto:arshad+mentor@thesmartbridge.com)
[![SmartBridge](https://img.shields.io/badge/SmartBridge-MERN%20Project-green.svg)](https://thesmartbridge.com)

A real-world full-stack MERN (MongoDB, Express.js, React.js, Node.js) financial application that empowers users to explore global stocks, inspect live market trends with interactive charts, execute simulated buy/sell orders with **$50,000 in virtual capital**, track investment portfolios marked-to-market, and moderate market entities via a dedicated administrator control center.

---

## 🌟 Project Highlights

- **Real-Time Market Ticker Engine:** Dynamic polling with realistic price volatility simulation and order-book momentum.
- **Interactive Chart.js Visualizations:** Multi-timeframe line charts (1D, 1W, 1M, ALL) with color-shifting gradients (Emerald Bull / Rose Bear) and fundamental metrics (P/E ratio, 52-week ranges, dividend yield).
- **Risk-Free Simulated Trading:** Instant BUY and SELL order tickets with strict balance validation, holding verification, and real-time transaction logging.
- **Portfolio & Asset Allocation:** Marked-to-market net worth calculations, individual position P&L badges, and Doughnut asset distribution visualization.
- **Role-Based JWT Security:** Route-level authentication and authorization for **TRADER** and **ADMIN** roles with password hashing via bcrypt.
- **Admin Moderation Portal:** Platform statistics, user balance adjustment, account suspension/activation, new stock listing creation, and market halt/resume toggles.
- **Zero-Config Dual-Mode Storage:** Connects automatically to local MongoDB or MongoDB Atlas; also includes an embedded in-memory fallback for instant evaluator execution.

---

## 👥 Project & Mentor Attribution

- **Institution:** SmartBridge / SmartInternz
- **Mentor:** Syed Abul Arshad (`arshad+mentor@thesmartbridge.com`)
- **Total Epics:** 6
- **Total Tasks:** 19

---

## 🏗️ System Architecture

```
d:/smartbridge/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback manager
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile, balance reset
│   │   ├── stockController.js    # Market browsing, filters, search, tickers
│   │   ├── tradeController.js    # BUY & SELL execution, transaction history
│   │   ├── portfolioController.js# Real-time portfolio valuation & holdings
│   │   └── adminController.js    # Stock moderation, user control, platform metrics
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role protection
│   │   └── errorHandler.js       # Centralized error handling & logging
│   ├── models/
│   │   ├── User.js               # Credentials, roles, virtual balance
│   │   ├── Stock.js              # Symbols, prices, fundamentals, history
│   │   ├── Transaction.js        # Executed trade audit records
│   │   └── Portfolio.js          # User holdings & performance summary
│   ├── routes/                   # Express REST API endpoints
│   ├── seeds/
│   │   └── seedData.js           # Seed stocks (AAPL, NVDA, TSLA, etc.) & default accounts
│   ├── services/
│   │   ├── marketSimulator.js    # Background live market tick engine
│   │   └── store.js              # Unified data store abstraction
│   ├── .env                      # Environment config
│   └── server.js                 # Express server entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation, live cash pill, demo logins
│   │   │   ├── TickerTape.jsx    # Continuous real-time price marquee
│   │   │   ├── StockCard.jsx     # Equities grid card with quick trade
│   │   │   ├── StockChart.jsx    # Interactive Chart.js canvas with gradient
│   │   │   ├── TradeModal.jsx    # Quick BUY/SELL interactive ticket
│   │   │   ├── ProtectedRoute.jsx# Auth & admin route guards
│   │   │   └── Footer.jsx        # Fintech footer with mentor attribution
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state & 1-click accounts
│   │   │   └── MarketContext.jsx # Live 3.5s market polling state
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing hero, index summary, top gainers/losers
│   │   │   ├── Market.jsx        # Search, sector filter, sort, grid/table view
│   │   │   ├── StockDetail.jsx   # In-depth chart, fundamentals & trade ticket
│   │   │   ├── Portfolio.jsx     # Net worth, P&L, Doughnut chart, holdings table
│   │   │   ├── Transactions.jsx  # Trade audit log with type filters
│   │   │   ├── AdminDashboard.jsx# Stock listing, user balance control, moderation
│   │   │   ├── Login.jsx         # Sign-in with 1-click demo buttons
│   │   │   └── Register.jsx      # Sign-up with $50k credit allocation
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── App.jsx               # Router & route definitions
│   │   ├── index.css             # Obsidian & emerald fintech design tokens
│   │   └── main.jsx              # React 18 DOM mount
│   ├── index.html
│   └── vite.config.js
│
├── package.json                  # Root runner with concurrently scripts
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (verified on Node v24)
- **npm**: v9+ (verified on npm v11)
- **MongoDB** *(Optional)*: Local mongod or MongoDB Atlas URI (if not running, the platform automatically utilizes its high-speed in-memory store so you can evaluate immediately without setup friction).

### 2. Installation
From the project root directory:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```
Or individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Launch Development Servers
From the project root:
```bash
npm run dev
```
This runs both:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

## 🔑 Default Credentials & 1-Click Access

For evaluator convenience, the login page and navigation bar include **1-Click Demo Buttons**:

| Role | Email | Password | Initial Virtual Funds |
| :--- | :--- | :--- | :--- |
| **Demo Trader** | `trader@stockez.com` | `Password123!` | **$50,000.00** |
| **Admin Moderator** | `admin@stockez.com` | `Password123!` | **$100,000.00** |
| **Mentor Account** | `arshad+mentor@thesmartbridge.com` | `Password123!` | **$250,000.00** |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user & credit $50k virtual funds | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/auth/me` | Retrieve active user profile & balance | Private |
| `POST` | `/api/auth/reset-balance` | Reset virtual balance back to $50,000 | Private |

### Stocks & Market (`/api/stocks`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stocks` | Get all stocks with search, sector, & sorting | Public |
| `GET` | `/api/stocks/featured` | Curated featured equities for landing page | Public |
| `GET` | `/api/stocks/market/overview`| Composite index, total volume, top gainers/losers | Public |
| `GET` | `/api/stocks/:symbol` | Detailed stock metrics & historical price series | Public |

### Trading & Orders (`/api/trades`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/trades/execute` | Execute BUY or SELL order with balance check | Private |
| `GET` | `/api/trades/history` | User transaction history with audit details | Private |

### Portfolio (`/api/portfolio`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portfolio` | Real-time net worth, marked-to-market holdings, & allocation | Private |

### Admin Moderation (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Platform metrics (Users, Stocks, Trades, Volume) | Admin |
| `GET` | `/api/admin/users` | List all registered user accounts | Admin |
| `PATCH`| `/api/admin/users/:id` | Adjust balance, suspend or activate user | Admin |
| `POST` | `/api/admin/stocks` | Create new stock listing | Admin |
| `PATCH`| `/api/admin/stocks/:id`| Update stock details or toggle market halt | Admin |
| `DELETE`| `/api/admin/stocks/:id`| Delist stock from market | Admin |
| `GET` | `/api/admin/transactions` | Full platform trade ledger | Admin |

---

## 🧪 Testing & Verification

Integration and functionality tests confirm:
- [x] User registration, password encryption with bcrypt, JWT authorization.
- [x] Live ticker polling and Brownian market price engine updates.
- [x] Interactive Chart.js charts across multiple timeframes.
- [x] Instant simulated BUY trade execution with virtual balance deduction.
- [x] Instant simulated SELL trade execution with portfolio update.
- [x] Portfolio marked-to-market calculations and Doughnut allocation breakdown.
- [x] Administrator dashboard stock creation, trading halt, user moderation, and trade audits.

---

## 📜 License
Distributed under the MIT License. Developed for the SmartBridge MERN Stack Internship Program.

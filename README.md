# ♻️ Treasure to Trash

**AI-Powered Waste Management & Gamified Recycling Platform**

[![React](https://img.shields.io/badge/Frontend-React%2018-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Framework-Express%204-lightgrey?logo=express)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-yellow)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20PostgreSQL-blue?logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-teal?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

**Treasure to Trash** is a full-stack, gamified environmental web platform designed to incentivize community waste recycling and smart urban waste management. Users report waste, submit photos for verification, locate nearby recycling smart bins on an interactive map, earn eco-reward points, level up, and redeem accumulated points for direct cash transfers to their bank accounts.

Administrators are provided with a dedicated management portal to verify waste reports, assign waste collectors, manage smart bin locations and capacities, broadcast system-wide notifications, process redemption payouts, and monitor live environmental analytics (waste collected, CO2 offset, active users, and token distribution).

---

## ✨ Key Features

### 👤 User Features
- 📸 **Waste Reporting**: Submit reports specifying location, waste category (*Food Waste, Electronic Waste, Plastic, Paper, Glass, Metal, etc.*), and estimated weight.
- 🪙 **Smart Rewards Calculation**: Automatically earn eco-points based on waste multipliers, bulk quantity bonuses (10% bonus for 50kg+), and submission frequency bonuses (5% bonus per 5 reports).
- 🏆 **Gamified Progress & Levels**: Level up from Tier 1 to Tier 5 based on accumulated reward points.
- 💳 **Cash/Coin Redemption**: Submit redemption requests with bank details (*Bank Name, Account Number, Account Holder*) to exchange eco-coins for direct financial rewards.
- 🗺️ **Interactive Smart Bin Locator**: View active recycling bins on an interactive Leaflet map, complete with real-time location details and fill capacity metrics.
- 📜 **Transaction & Reward History**: Track earned points, redemption statuses, and detailed verification breakdowns.

### 🛡️ Admin Features
- 📊 **Real-time Analytics Dashboard**: Monitor total registered users, verified reports, total waste collected (kg), CO2 offset estimation, and active tokens.
- 🔍 **Report Verification & Dispatch**: Review user reports, verify submitted waste data, and assign waste collectors to pending locations.
- 📍 **Smart Bin Management**: Add, update, and remove smart recycling bins with precise latitude/longitude coordinates and capacity metrics.
- 💸 **Redemption Request Approval**: Review cash redemption requests, approve payouts with automatic point deduction and transaction logging, or reject with custom feedback.
- 📢 **System Notifications**: Send targeted notifications to individual users or broadcast announcements to all users across the platform.
- 👥 **User Management**: View and audit user activity, submission totals, and reward balances.

---

## 🏗️ System Architecture & Class Diagram

The core architecture follows a decoupled Client-Server model built with Express.js, TypeScript, Drizzle ORM, and PostgreSQL.

```mermaid
classDiagram
    %% Interfaces / core classes
    class IStorage {
      <<interface>>
      +getUser(id)
      +getUserByEmail(email)
      +getAllUsers()
      +createUser(user)
      +getAllReports()
      +getReport(id)
      +createReport(report)
      +updateReport(id, data)
      +getAllRewards()
      +createReward(reward)
      +updateReward(id, data)
      +deleteReward(id)
      +getAllBins()
      +createBin(bin)
      +updateBin(id, data)
      +deleteBin(id)
      +createTransaction(tx)
      +createNotification(n)
      +createRedemptionRequest(req)
      +getDashboardStats()
    }

    class DatabaseStorage {
      +getUser(id)
      +getUserByEmail(email)
      +getAllUsers()
      +createUser(insertUser)
      +getAllReports()
      +getReport(id)
      +createReport(insertReport)
      +updateReport(id, data)
      +getAllRewards()
      +createReward(insertReward)
      +updateReward(id, data)
      +deleteReward(id)
      +getAllBins()
      +createBin(insertBin)
      +updateBin(id, data)
      +deleteBin(id)
      +createTransaction(insertTransaction)
      +createNotification(insertNotification)
      +createRedemptionRequest(insertRequest)
      +getDashboardStats()
    }

    DatabaseStorage --|> IStorage

    class ServerApp {
      +start()
      +setupVite(httpServer, app)
      +serveStatic()
    }

    class ServerRoutes {
      +registerRoutes(httpServer, app)
      +seedAdmin()
      +(endpoint handlers: /api/users/*, /api/admin/*, /api/bins, /api/stats)
    }

    ServerApp --> ServerRoutes
    ServerRoutes --> DatabaseStorage

    class RewardsCalculator {
      +calculateRewardPoints(params)
      +calculateLevel(points)
    }
    ServerRoutes --> RewardsCalculator

    %% Domain entities (from shared/schema.ts)
    class User {
      +id: number
      +email: string
      +name: string
      +createdAt: timestamp
    }

    class Admin {
      +id: number
      +email: string
      +password: string
      +name: string
      +createdAt: timestamp
    }

    class Report {
      +id: number
      +userId: number
      +location: text
      +wasteType: string
      +amount: string
      +imageUrl: text?
      +verificationResult: jsonb?
      +status: string
      +createdAt: timestamp
      +collectorId: number?
    }

    class Reward {
      +id: number
      +userId: number
      +points: number
      +level: number
      +isAvailable: boolean
      +name: string
      +description: text?
      +collectionInfo: text
      +createdAt: timestamp
      +updatedAt: timestamp
    }

    class Transaction {
      +id: number
      +userId: number
      +type: string
      +amount: number
      +description: text
      +date: timestamp
    }

    class Bin {
      +id: number
      +location: text
      +latitude: text
      +longitude: text
      +capacity: string
      +status: string
      +createdAt: timestamp
    }

    class RedemptionRequest {
      +id: number
      +userId: number
      +points: number
      +bankName: string
      +accountNumber: string
      +accountHolder: string
      +status: string
      +reason: text?
      +rejectionReason: text?
      +createdAt: timestamp
      +approvedAt: timestamp?
    }

    class Notification {
      +id: number
      +userId: number
      +message: text
      +type: string
      +isRead: boolean
      +createdAt: timestamp
    }

    class CollectedWaste {
      +id: number
      +reportId: number
      +collectorId: number
      +collectionDate: timestamp
      +status: string
    }

    %% Relationships
    User "1" --> "*" Report : "submits"
    User "1" --> "*" Reward : "has"
    User "1" --> "*" Transaction : "has"
    User "1" --> "*" Notification : "receives"
    User "1" --> "*" RedemptionRequest : "requests"
    Report "0..1" --> "1" User : "collector"
    Report "1" --> "0..1" CollectedWaste : "collected_as"
    Bin "1" --> "*" CollectedWaste : "used_by"
```

---

## 🧮 Reward Points Calculation Engine

Points earned per waste submission are calculated dynamically using the following formula:

$$\text{Total Points} = \text{Base Points} + \text{Quantity Bonus} + \text{Frequency Bonus}$$

1. **Base Points Multipliers**:
   - **Electronic Waste**: 15 points / kg
   - **Metal Waste**: 12 points / kg
   - **Food / Organic Waste**: 10 points / kg
   - **Plastic / Paper / Glass**: 8 points / kg
   - **Other Waste**: 6 points / kg

2. **Quantity Bonus**:
   - $10\%$ bonus added to base points if submission is $\ge 50\text{ kg}$.

3. **Frequency Bonus**:
   - $5\%$ bonus per 5 verified reports ($5\%$ for 5 reports, $10\%$ for 10 reports, etc.).

4. **User Level Thresholds**:
   - **Level 1**: $< 500$ points
   - **Level 2**: $500 - 1,499$ points
   - **Level 3**: $1,500 - 2,999$ points
   - **Level 4**: $3,000 - 4,999$ points
   - **Level 5**: $\ge 5,000$ points

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Radix UI primitives (shadcn UI style components)
- **State & Data Fetching**: TanStack Query (React Query)
- **Routing**: Wouter
- **Maps**: Leaflet & React-Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React & React Icons

### **Backend**
- **Runtime**: Node.js
- **Server**: Express.js
- **Database**: Neon PostgreSQL Serverless
- **ORM**: Drizzle ORM with Drizzle Kit
- **Validation**: Zod & Drizzle-Zod
- **Authentication**: Bcrypt.js password hashing

---

## 📂 Project Structure

```
treasure-to-trash/
├── client/                      # Frontend Application
│   ├── src/
│   │   ├── components/         # UI & Shared Components
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── lib/                # Query Client & Utilities
│   │   ├── pages/              # App Routes & Pages
│   │   │   ├── admin/          # Admin Dashboard Views (Bins, Users, Reports, Rewards, etc.)
│   │   │   └── user/           # User Portal Views (Report, History, Bins, Redeem)
│   │   ├── App.tsx             # Main App & Router
│   │   └── main.tsx            # React Entry Point
│   └── index.html
├── server/                      # Backend Express Application
│   ├── db.ts                   # Neon PostgreSQL Drizzle Connection
│   ├── index.ts                # Express Server Startup
│   ├── rewards-calculator.ts   # Points & Level Calculation Logic
│   ├── routes.ts               # REST API Routes & Controllers
│   ├── storage.ts              # Data Access Layer & Drizzle Queries
│   └── vite.ts                 # Vite SSR & Dev Server Integration
├── shared/                      # Shared Code Base
│   └── schema.ts               # Drizzle Database Schemas & Zod Validation
├── script/                      # Build & Utility Scripts
│   └── build.ts                # Production Bundler Script
├── drizzle.config.ts            # Drizzle ORM Configuration
├── package.json                 # Node Dependencies & Scripts
├── tsconfig.json                # TypeScript Configuration
└── README.md                    # Project Documentation
```

---

## 📡 REST API Reference

### 🔐 Authentication API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users/login` | Authenticate or auto-register user via Gmail |
| `POST` | `/api/admin/login` | Admin authentication with bcrypt password verification |

### 📋 User API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users/reports` | Submit a new waste report |
| `GET` | `/api/users/:userId/reports` | Get reports submitted by a specific user |
| `GET` | `/api/users/:userId/rewards` | Get user reward balance and level |
| `GET` | `/api/users/:userId/transactions` | Get transaction history for a user |
| `POST` | `/api/users/:userId/redemption-requests` | Submit cash redemption request |
| `GET` | `/api/users/:userId/redemption-requests` | Get user redemption requests |

### 🛠️ Admin API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Fetch live dashboard metrics & CO2 calculations |
| `GET` | `/api/admin/users` | List all registered users |
| `GET` | `/api/admin/reports` | List all waste reports with user metadata |
| `PATCH` | `/api/admin/reports/:id` | Update report status (*verified, rejected*) |
| `PATCH` | `/api/admin/reports/:id/assign` | Assign waste collector to report |
| `GET` | `/api/admin/bins` | List smart recycling bins |
| `POST` | `/api/admin/bins` | Add a new smart bin |
| `PATCH` | `/api/admin/bins/:id` | Update smart bin status or capacity |
| `DELETE` | `/api/admin/bins/:id` | Remove a smart bin |
| `GET` | `/api/admin/redemption-requests` | View all user redemption requests |
| `PATCH` | `/api/admin/redemption-requests/:id/approve` | Approve redemption payout & deduct points |
| `PATCH` | `/api/admin/redemption-requests/:id/reject` | Reject redemption request |
| `POST` | `/api/admin/notifications` | Send individual or bulk user notifications |

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **yarn**
- **PostgreSQL Database** (e.g., [Neon DB](https://neon.tech/))

### 2️⃣ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rameez-hub125/treasure-to-trash.git
cd treasure-to-trash
npm install
```

### 3️⃣ Environment Setup

Create a `.env` file in the project root (or copy `.env.example`):

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
PORT=5000
NODE_ENV=development
```

### 4️⃣ Database Migration

Push database schemas to your Neon PostgreSQL database:

```bash
npm run db:push
```

### 5️⃣ Run Application

Start the development server (runs frontend Vite & backend Express concurrently):

```bash
npm run dev
```

Open your browser at `http://localhost:5000`.

---

## 📜 NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the development server with live reload |
| `npm run build` | Builds client and server for production output in `dist/` |
| `npm run start` | Starts production Express server from `dist/index.cjs` |
| `npm run check` | Runs TypeScript type checking (`tsc`) |
| `npm run db:push` | Pushes Drizzle schema updates to PostgreSQL |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Developed by **[Rameez Raza](https://github.com/rameez-hub125)**  
*Full-Stack & Machine Learning Developer*

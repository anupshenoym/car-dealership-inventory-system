# 🚗 AutoVault — Car Dealership Inventory System

A full-stack **Car Dealership Inventory System** built with **Test-Driven Development (TDD)**.
It combines a RESTful Node.js/TypeScript API, a persistent SQLite database, JWT
authentication, role-based access control, and a premium dark-mode React SPA.

![AutoVault dashboard](docs/screenshots/dashboard.png)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [Demo Accounts & Seed Data](#-demo-accounts--seed-data)
- [API Reference](#-api-reference)
- [Test Report](#-test-report)
- [TDD Approach](#-tdd-approach)
- [Deployment Notes](#-deployment-notes)
- [My AI Usage](#-my-ai-usage)

---

## 🏎️ Project Overview

AutoVault is a dealership inventory platform where:

- **Customers** can register, log in, browse the inventory, search/filter vehicles, and purchase a vehicle while stock lasts.
- **Admins** can add, edit, delete, and restock vehicles.
- **Every inventory mutation** is protected by JWT authentication, and admin-only routes are guarded by role checks.

The database is a **file-backed SQLite database** (`backend/data/dealership.db`). The API uses
`sql.js` so the project works on any machine without native C++ build tools, while still
persisting data to disk after every write.

---

## 📸 Screenshots

| Login | Inventory dashboard |
|-------|---------------------|
| ![Login screen](docs/screenshots/login.png) | ![Inventory dashboard](docs/screenshots/dashboard.png) |

| Admin add-vehicle form | Search / filter results |
|------------------------|-------------------------|
| ![Add vehicle modal](docs/screenshots/add-vehicle-modal.png) | ![SUV search results](docs/screenshots/search-filter.png) |

---

## 🛠 Tech Stack

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js + TypeScript | Runtime & language |
| Express.js | HTTP framework |
| sql.js (SQLite) | Persistent file-backed database |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| Jest + Supertest | Unit and integration testing |
| ts-jest | TypeScript test runner |

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| React Router v7 | Client-side routing |
| Zustand | Auth and toast state management |
| Axios | HTTP client |
| Lucide React | Icon library |

---

## ✨ Features

### Authentication
- ✅ Registration with email validation and bcrypt password hashing
- ✅ JWT login with a 24-hour token expiry
- ✅ Roles: `user` and `admin`
- ✅ Protected API routes and protected frontend routes
- ✅ Automatic logout on `401` responses

### Vehicle Inventory
- ✅ Create, read, update, and delete vehicles
- ✅ Search by make, model, category, and price range
- ✅ Pagination support
- ✅ Purchase flow that decrements stock
- ✅ Purchase button disabled when stock is zero
- ✅ Admin-only restock and delete operations
- ✅ Stock badges: In Stock, Low Stock, Out of Stock

### UI/UX
- ✅ Premium dark mode with glassmorphism and animated gradients
- ✅ Skeleton loading states
- ✅ Toast notifications for every action
- ✅ Inventory stats dashboard
- ✅ Responsive layout for desktop, tablet, and mobile
- ✅ Local SVG vehicle artwork so the demo works offline

---

## 📁 Project Structure

```text
TDD Kata Car Dealership Inventory System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts              # sql.js connection, schema, persistence helpers
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── vehicleController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts                  # JWT authenticate + requireAdmin
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── vehicles.ts
│   │   │   └── __tests__/
│   │   │       └── api.test.ts          # HTTP integration tests
│   │   ├── scripts/
│   │   │   └── seed.ts                  # Demo users + inventory
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── vehicleService.ts
│   │   │   └── __tests__/
│   │   │       ├── authService.test.ts
│   │   │       └── vehicleService.test.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── app.ts                       # Express app
│   │   └── server.ts                    # Entry point
│   ├── .env.example
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── cars/                        # Local SVG car illustrations
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/client.ts                # Axios API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ToastContainer.tsx
│   │   │   ├── VehicleCard.tsx
│   │   │   └── VehicleForm.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── store/index.ts               # Zustand stores
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── index.css                    # Design system + responsive rules
│   │   └── main.tsx
│   ├── .env.example
│   ├── vite.config.ts
│   └── package.json
├── docs/
│   ├── ai-logs/                         # Raw AI transcripts
│   └── screenshots/
├── .gitignore
├── PROMPTS.md                           # Raw AI chat logs
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js v20.19+ (tested on Node 24)
- npm v9+
- Git

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "TDD Kata Car Dealership Inventory System"
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the environment template and adjust the secret if you like:

```bash
cp .env.example .env
```

```env
PORT=3001
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:3001`.

### 3. Seed demo data (recommended)

In a second terminal:

```bash
cd backend
npm run seed
```

This creates the demo accounts and eight vehicles. The script is idempotent —
running it again will not duplicate users or vehicles.

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. Vite proxies `/api` requests to
`http://localhost:3001`.

### 5. Production build (optional)

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

---

## 🔑 Demo Accounts & Seed Data

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dealership.com` | `Admin@123` |
| User | `user@dealership.com` | `User@123` |

The login screen has **Demo User** and **Demo Admin** buttons that fill these
credentials automatically.

> **Security note:** this kata allows choosing the `admin` role at registration so
> reviewers can exercise admin features without a separate provisioning step. In a
> production system, public registration would always create a `user`, and admin
> accounts would be created by an invite-only process or a CLI script.

---

## 📡 API Reference

Base URL: `http://localhost:3001/api`

### Auth Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user and receive a JWT |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/health` | Health check |

**Register**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "new@example.com",
  "password": "secret123",
  "role": "user"
}
```

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dealership.com",
  "password": "Admin@123"
}
```

Both endpoints return:

```json
{
  "message": "Login successful.",
  "user": { "id": "...", "email": "...", "role": "admin", "createdAt": "..." },
  "token": "eyJhbGciOi..."
}
```

### Vehicle Endpoints (Protected)

Send the token on every request:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/vehicles?page=1&limit=20` | List all vehicles (paginated) | Any |
| GET | `/api/vehicles/search` | Search with filters | Any |
| GET | `/api/vehicles/:id` | Get a single vehicle | Any |
| POST | `/api/vehicles` | Add a new vehicle | Any authenticated |
| PUT | `/api/vehicles/:id` | Update a vehicle | Any authenticated |
| DELETE | `/api/vehicles/:id` | Delete a vehicle | **Admin** |
| POST | `/api/vehicles/:id/purchase` | Purchase (decrement stock) | Any authenticated |
| POST | `/api/vehicles/:id/restock` | Restock (increment stock) | **Admin** |

### Search Parameters

```http
GET /api/vehicles/search?make=Toyota&model=Camry&category=SUV&minPrice=20000&maxPrice=50000&page=1&limit=12
```

All filters are optional and can be combined.

### Vehicle Payload

```json
{
  "make": "Toyota",
  "model": "Camry XSE",
  "year": 2024,
  "category": "Sedan",
  "price": 28500,
  "quantity": 12,
  "color": "Midnight Black",
  "mileage": 1200,
  "description": "A dependable mid-size sedan.",
  "imageUrl": "/cars/sedan.svg"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Missing/invalid token or bad credentials |
| 403 | Authenticated but not an admin |
| 404 | Vehicle or route not found |
| 409 | Duplicate email or out-of-stock purchase |
| 500 | Unexpected server error |

---

## 🧪 Test Report

The backend has **57 passing tests** across 3 suites.

```text
Test Suites: 3 passed, 3 total
Tests:       57 passed, 57 total
Snapshots:   0 total
Time:        ~6.4s

File                   | % Stmts | % Branch | % Funcs | % Lines
-----------------------|---------|----------|---------|--------
All files              |   88.32 |    70.94 |   88.23 |   88.17
 src                   |   94.11 |       50 |      50 |   94.11
  app.ts               |   94.11 |       50 |      50 |   94.11
 src/config            |   72.22 |       10 |   77.77 |   73.58
  database.ts          |   72.22 |       10 |   77.77 |   73.58
 src/controllers       |   76.54 |    35.48 |      90 |   76.54
  authController.ts    |     100 |    66.66 |     100 |     100
  vehicleController.ts |   70.31 |       28 |    87.5 |   70.31
 src/middleware        |      95 |      100 |     100 |      95
  auth.ts              |      95 |      100 |     100 |      95
 src/routes            |     100 |      100 |     100 |     100
  auth.ts              |     100 |      100 |     100 |     100
  vehicles.ts          |     100 |      100 |     100 |     100
 src/services          |    99.2 |    86.59 |     100 |     100
  authService.ts       |     100 |      100 |     100 |     100
  vehicleService.ts    |   98.86 |     84.7 |     100 |     100
```

Run the suite:

```bash
cd backend
npm test
```

### Test Coverage Breakdown

| Test Suite | Tests | Focus |
|-----------|-------|-------|
| `authService.test.ts` | 11 | Registration validation, password hashing, login, duplicate emails |
| `vehicleService.test.ts` | 27 | CRUD, search, pagination, stock, purchase, restock, validation |
| `api.test.ts` | 19 | Full HTTP flows, JWT protection, admin authorization, status codes |
| **Total** | **57** | |

---

## 🔄 TDD Approach

The backend was built test-first:

1. **RED** — Wrote failing tests for the expected service behaviour and HTTP contracts.
2. **GREEN** — Implemented the minimum service/controller/route code to make them pass.
3. **REFACTOR** — Extracted the database helpers, centralized error mapping, and kept the suite green.

The tests cover happy paths, validation failures, authorization failures, duplicate
emails, unknown IDs, out-of-stock purchases, and invalid restock amounts.

> The original build session was completed in a separate environment. The raw
> Antigravity transcript is preserved in [`PROMPTS.md`](PROMPTS.md) and
> `docs/ai-logs/antigravity-transcript.jsonl` so the test-first sequence can be
> inspected directly.

---

## ☁️ Deployment Notes

The app is deployment-ready. A typical setup:

### Backend (Render, Railway, Fly.io, etc.)

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables:
  - `PORT` (provided by the platform)
  - `JWT_SECRET` (long random string)
  - `FRONTEND_URL` (your deployed frontend origin, for CORS)
  - `NODE_ENV=production`

The SQLite file lives at `backend/data/dealership.db`. On platforms with ephemeral
filesystems, mount a persistent disk or switch the database layer to a managed
PostgreSQL instance.

### Frontend (Vercel, Netlify, Cloudflare Pages, etc.)

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:

```env
VITE_API_URL=https://your-api.example.com/api
```

When `VITE_API_URL` is not set, the frontend uses `/api`, which works with the
Vite dev proxy locally.

---

## 🤖 My AI Usage

### Tools Used

- **Antigravity IDE (Google DeepMind)** — primary assistant for the original build.
  The model selected for that session was **Claude Sonnet 4.6 (Thinking)**.
- **OpenCode** — completion and verification session, using **DeepSeek V4.1 Flash Free**.

### How I Used AI

1. **Architecture and planning** — I used Antigravity to brainstorm the layered
   structure (`routes → controllers → services → database`) and to choose a
   stack that would run without native build tools.

2. **Test generation (TDD)** — I described the intended behaviour of each service
   and asked the assistant to draft tests covering happy paths, validation, and
   error cases. I reviewed each test before running it and kept the red/green
   cycle visible in the transcript.

3. **Boilerplate reduction** — Auth middleware, CORS setup, Express route wiring,
   and the initial React component shells were generated as boilerplate, then
   reviewed and customized.

4. **Debugging** — When `better-sqlite3` failed because Visual Studio C++ build
   tools were missing, the assistant helped me pivot to `sql.js`, a pure-JS
   SQLite build that still persists to a real database file.

5. **UI and design system** — I specified the visual direction (dark mode,
   glassmorphism, indigo/violet gradients) and iterated on the React components,
   CSS custom properties, responsive rules, and SVG vehicle artwork.

6. **Completion pass** — In OpenCode I used the assistant to find missing frontend
   dependencies, fix TypeScript `verbatimModuleSyntax` errors, add demo seeding,
   capture screenshots, and assemble this README and `PROMPTS.md`.

### Reflection

AI was a genuine force multiplier, especially for test scaffolding and for
recovering from environment-specific problems (native modules, missing npm
packages, TypeScript configuration). It was not a replacement for judgement:
the first frontend build failed because runtime dependencies were missing, the
initial SQLite choice needed a fallback, and the AI-generated UI still required
manual layout, responsiveness, and copy decisions.

The biggest lesson was to keep AI output on a short leash: review every test,
run the suite after every change, and treat generated code as a draft rather
than a finished artifact.

### Raw Logs

The complete raw AI conversation logs are in:

- [`PROMPTS.md`](PROMPTS.md) — readable transcript of both sessions
- [`docs/ai-logs/antigravity-transcript.jsonl`](docs/ai-logs/antigravity-transcript.jsonl) — original build session
- [`docs/ai-logs/opencode-session.jsonl`](docs/ai-logs/opencode-session.jsonl) — completion session chat export

# Finance OS — React Frontend

A premium, data-dense financial intelligence dashboard built with React 18 + TypeScript. Designed to feel like "Bloomberg Terminal meets Stripe Dashboard" — dark, precise, institutional-grade.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v3 |
| **Routing** | React Router v6 |
| **HTTP** | Axios (with interceptors) |
| **State** | TanStack Query v5 |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Notifications** | react-hot-toast |
| **Dates** | date-fns |

## Quick Start

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:8080`

### Installation

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@finance.dev | Admin@123 | Full access — manage records & users |
| **Analyst** | analyst@finance.dev | Analyst@123 | View + create financial records |
| **Viewer** | viewer@finance.dev | Viewer@123 | Read-only dashboard access |

## Features

- 🔐 **JWT Authentication** with role-based routing and guards
- 📊 **Animated KPI Cards** with live data and count-up animations
- 📈 **3 Chart Types** — Area (trends), Donut (categories), Bar (monthly comparison)
- 📋 **Filterable Paginated Records Table** with search, type, category, and date range
- 💰 **High-Value Transaction Monitor** with adjustable threshold
- 👥 **Admin User Management Panel** with inline role editing and status toggles
- 🎨 **Premium Dark Theme** with noise texture, glow effects, and glassmorphism
- ⚡ **Framer Motion** page transitions and stagger animations
- 🦴 **Skeleton Loading States** with shimmer effects across all pages
- 🔔 **Toast Notifications** for all CRUD operations

## Connecting to Backend

The Vite dev server proxies all `/api` requests to `http://localhost:8080`.

If your backend runs on a different port, update:
1. `vite.config.ts` → `server.proxy` target
2. `src/api/axios.ts` → `baseURL`
3. `.env` → `VITE_API_URL`

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready to deploy to any static host.

## Project Structure

```
src/
├── api/            # Axios instance + endpoint functions
├── components/
│   ├── ui/         # Reusable UI primitives (Badge, Button, Card, Input, etc.)
│   ├── layout/     # AppShell, Sidebar, Topbar, PrivateRoute
│   ├── charts/     # Recharts wrappers (Area, Donut, Bar)
│   ├── dashboard/  # KpiCard, RecentActivity
│   └── records/    # RecordForm, RecordFilters, RecordsTable
├── context/        # AuthContext (JWT persistence, role checks)
├── hooks/          # React Query hooks + useAuth
├── pages/          # Route-level page components
├── types/          # TypeScript interfaces matching backend API
└── utils/          # Currency formatting, date formatting, cn utility
```

# TrustMark - Store Rating Platform

TrustMark is a production-style store discovery and rating platform with role-based dashboards for administrators, customers, and store owners.

## Project structure

- `backend/` - Express API, Prisma, PostgreSQL configuration
- `frontend/` - React, Vite, React Router, Axios, and Lucide interface

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 15 or newer

## Phase 1 setup

From the project root:

```powershell
cd backend
npm install
npx prisma generate

cd ..\frontend
npm install
```

Copy each `.env.example` to `.env` and update the PostgreSQL connection string before running Prisma commands. The local `.env` files are ignored by Git.

## Run the foundation

Backend:

```powershell
cd backend
npm run dev
```

Frontend, in a second terminal:

```powershell
cd frontend
npm run dev
```

The backend health check is available at `http://localhost:5000/api/health`. The Vite app is available at `http://localhost:5173`.

The API includes JWT authentication, role authorization, store discovery, reviews, favorites, administration, and owner analytics.

## Phase 2 database setup

The PostgreSQL schema includes users, stores, ratings with comments, and persisted favorites. Create the database first using PostgreSQL's `createdb` command or your preferred PostgreSQL client:

```powershell
createdb ratehub
```

Then run the migration and seed from `backend/`:

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

The seed is idempotent and creates 11 users, 43 stores including the original records, 150+ ratings, reviews, and favorites. Local assessment credentials are:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ratehub.local` | `Admin@1234` |
| User | `user@ratehub.local` | `User@1234` |
| Owner | `rohan@ratehub.local` | `Owner@1234` |
| Owner | `nisha@ratehub.local` | `Owner@1234` |

Requested role-testing aliases:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@storerating.com` | `Admin@1234` |
| Normal user | `user@storerating.com` | `User@1234` |
| Shopkeeper / Store owner | `owner@storerating.com` | `Owner@1234` |

Change these credentials before using the project outside local development.

## Upgrade API highlights

- `GET /api/user/stores` supports search, category, city, rated-status, sorting, and pagination.
- `GET /api/user/stores/:id` returns rating distribution and public reviews.
- `POST`, `PUT`, and `DELETE /api/user/ratings/:id` manage the authenticated user's ratings.
- `GET /api/user/favorites` and `POST`/`DELETE /api/user/favorites/:storeId` persist favorites in PostgreSQL.
- Admin and owner dashboards expose expanded analytics while retaining server-side role checks.

The frontend provides responsive discovery cards, store detail pages, review comments, favorites, rating history, confirmation before deletion, and dashboard recommendations.

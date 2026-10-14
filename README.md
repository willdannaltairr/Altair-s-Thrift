# Altair's Thrift

**Discover Fashion. Empower Local Business.**

Digital Commerce & Marketplace Platform for Indonesian Fashion UMKM.

Seller Management → Product → Inventory → Instant Storefront → Marketplace → Cart → Checkout → Payment → Shipping → Analytics.

## Monorepo

```
altairs-thrift/
  backend/   # Express + TypeScript + Prisma + Zod + JWT HttpOnly
  frontend/  # Next.js App Router + TypeScript + Tailwind
```

## Quick start (local)

Requirements: Node 20+, PostgreSQL 15+, npm.

```bash
# 1. env
cp .env.example backend/.env
cp backend/.env.example frontend/.env.local
# edit DATABASE_URL, JWT_SECRET

# 2. install
npm install
npm install -w backend
npm install -w frontend

# 3. db
npm run db:migrate -w backend
npm run db:seed -w backend

# 4. dev (2 terminals)
npm run dev -w backend    # :4000
npm run dev -w frontend   # :3000
```

Demo accounts (seed):
- admin `admin@altairs.local` / `Admin123!`
- seller `seller1@altairs.local` / `Seller123!` (5 sellers)
- customer `customer1@altairs.local` / `Customer123!` (15 customers)

## Docs

- `docs/API.md` — REST contract + examples
- `docs/ERD.md` — entities, relations, constraints
- `docs/SETUP.md` — setup, test, deploy
- `backend/README.md`, `frontend/README.md`

## Security notes

- JWT in HttpOnly SameSite cookie, bcrypt hash (12 rounds).
- RBAC + ownership checks on every protected route.
- Zod validation, rate-limit auth/payment, idempotent webhooks.
- No card data stored. Payment = sandbox simulation clearly labelled, Midtrans/Xendit-ready via webhook verifier abstraction.
- Simulated tracking is labelled as such in UI.

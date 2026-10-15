# Backend — Altair's Thrift

Express.js + TypeScript + Prisma + Zod. JWT in HttpOnly cookie, bcrypt-12, RBAC.

Default DB: **SQLite** (`file:./dev.db`) — tinggal `migrate`, tanpa Postgres.
Lihat `docs/SQLITE_MIGRATE.md` untuk pindah ke PostgreSQL.

## Scripts
```bash
npm run dev / build / start / test / db:migrate / db:seed
```

## Env
Lihat `.env.example`. Jangan commit `.env`.

## Notes
- Transactions for checkout/inventory; `updateMany({where:{stock:{gte:qty}}})` prevents oversell.
- Payments sandbox-labelled; webhook HMAC + amount + idempotency.
- Reservations expire via interval worker in `server.ts`.
- SQLite: `tags` disimpan sebagai JSON string; filter `contains` tanpa
  `mode: 'insensitive'` (lihat komentar di `products.ts` / `admin.ts`).

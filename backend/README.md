# Backend — Altair's Thrift

Express + TypeScript + Prisma + Zod. JWT in HttpOnly cookie, bcrypt-12, RBAC.

## Scripts
```bash
npm run dev / build / start / test / db:migrate / db:seed
```

## Env
See `.env.example`. Never commit `.env`.

## Notes
- Transactions for checkout/inventory; `updateMany({where:{stock:{gte:qty}}})` prevents oversell.
- Payments sandbox-labelled; webhook HMAC + amount + idempotency.
- Reservations expire via interval worker in `server.ts`.

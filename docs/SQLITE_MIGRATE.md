# SQLite → PostgreSQL Migration Guide

Backend Express ini default memakai **SQLite** (`DATABASE_URL="file:./dev.db"`)
agar jalan lokal tanpa install Postgres. Semua fungsi API sama.

## Jalan lokal (SQLite)
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name sqlite_init
npm run db:seed
npm run dev
```

## Pindah ke PostgreSQL nanti
1. Di `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Kembalikan `tags` di model `Product`:
   ```prisma
   tags String[] @default([])
   ```
3. Di `backend/src/controllers/products.ts` (create/update) dan `seed.ts`:
   ganti `JSON.stringify(tags)` kembali ke array biasa.
4. Tambahkan lagi `mode: 'insensitive'` pada filter `contains`
   di `products.ts` dan `admin.ts` (Postgres mendukung, SQLite tidak).
5. Set `DATABASE_URL="postgresql://user:pass@host:5432/altairs_thrift"` di `backend/.env`.
6. Jalankan:
   ```bash
   npx prisma migrate dev --name pg_init
   npm run db:seed
   ```

Tidak ada perubahan route/controller lain — seluruh
auth, store, cart, order, payment, seller, admin tetap sama.

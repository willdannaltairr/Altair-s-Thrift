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
2. Kembalikan `enum` blocks dari git history (`git log -p backend/prisma/schema.prisma`)
   dan ubah field-field ini kembali:
   - status/theme/condition/type → tipe `enum` semula
   - `tags` → `String[] @default([])` (ganti `JSON.stringify(tags)` ke array biasa
     di `products.ts` dan `seed.ts`)
   - `socials` / `payload` / `metadata` → `Json?` (ganti `JSON.stringify(...)`
     ke object biasa di `stores.ts`, `payments.ts`, `admin.ts`)
3. Tambahkan lagi `mode: 'insensitive'` pada filter `contains`
   di `products.ts` dan `admin.ts` (Postgres mendukung, SQLite tidak).
5. Set `DATABASE_URL="postgresql://user:pass@host:5432/altairs_thrift"` di `backend/.env`.
6. Jalankan:
   ```bash
   npx prisma migrate dev --name pg_init
   npm run db:seed
   ```

Tidak ada perubahan route/controller lain — seluruh
auth, store, cart, order, payment, seller, admin tetap sama.

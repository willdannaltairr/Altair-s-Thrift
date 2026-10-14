# Setup / Test / Deploy

## Local
```bash
cp .env.example backend/.env
# edit DATABASE_URL + JWT_SECRET (min 32 chars)
npm install
npm install -w backend
npm install -w frontend
npm run db:migrate -w backend
npm run db:seed -w backend
npm run dev -w backend
npm run dev -w frontend
```

## Test
```bash
npm run test -w backend   # vitest: auth, marketplace, security, concurrency guards
# Manual QA checklist in README + docs/API.md via Thunder Client
# Concurrent last-item: open 2 sessions, checkout same 1-stock product → exactly 1 succeeds (updateMany where stock>=qty)
```

## Deploy
- Frontend: Vercel, `NEXT_PUBLIC_API_URL=https://api.yourdomain`
- Backend: Node host (Railway/Render/Fly), `prisma migrate deploy`, set all secrets, `COOKIE secure=true`
- DB: managed PostgreSQL (Neon/Supabase), `DATABASE_URL` pooled
- Storage: S3-compatible for product images (URLs in seed use picsum for demo only)

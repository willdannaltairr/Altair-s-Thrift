# Frontend — Altair's Thrift

Next.js App Router + TS + Tailwind. Editorial theme: cream `#F8F7F4`, ink `#111111`, accent `#6D28D9`.

## Env
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Routes
`/ /shop /shop/[slug] /store/[slug] /stores /cart /checkout /login /register /account /seller /admin /about`

All marketplace data comes from backend REST with credentials `include` (HttpOnly cookie). Loading skeletons, empty states, and error states on every page. No hardcoded production stats.

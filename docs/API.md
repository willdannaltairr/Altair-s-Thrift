# API — Altair's Thrift (REST, `{success,message,data}`)

Base: `http://localhost:4000`

Auth cookie: `altair_session` HttpOnly.

```
POST /api/auth/register {email,password,fullName,phone?}
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me (auth)
PATCH /api/auth/me (auth)

GET  /api/stores
GET  /api/stores/mine (seller)
GET  /api/stores/:slug
POST /api/stores (auth)
PATCH /api/stores/:id (owner|admin)

GET  /api/products?q=&category=&minPrice=&maxPrice=&size=&condition=&brand=&location=&inStock=&sort=newest|price_asc|price_desc&page=&limit=
GET  /api/products/:slug
GET  /api/products/seller/mine (auth)
POST /api/products (auth, store owner)
PATCH /api/products/:id (owner|admin)
DELETE /api/products/:id → ARCHIVED

GET  /api/categories
POST /api/categories (admin)

GET  /api/cart (auth)
POST /api/cart/items {productId,qty}
PATCH /api/cart/items/:id {qty}
DELETE /api/cart/items/:id

GET  /api/addresses (auth)
POST /api/addresses
GET  /api/orders (auth, customer)
GET  /api/orders/:id (customer|seller|admin)
POST /api/orders {addressId,courier?,notes?} → split per store
PATCH /api/orders/:id/status {status,trackingNumber?,courier?}

POST /api/payments/create {orderId,method?} → {sandbox:true}
POST /api/payments/simulate {orderId,succeed?} (dev only)
POST /api/payments/webhook {providerRef,amount,status} + X-Signature HMAC

GET /api/seller/dashboard (auth seller)
GET /api/seller/analytics
GET /api/seller/orders
GET /api/seller/inventory
PATCH /api/seller/inventory/:id {stock}
POST /api/seller/verify

GET /api/admin/dashboard (admin)
GET /api/admin/users?q=
PATCH /api/admin/users/:id {status}
GET /api/admin/sellers
PATCH /api/admin/sellers/:id/verify {action:APPROVE|REJECT,reason?}
GET /api/admin/products/pending
PATCH /api/admin/products/:id/moderate {action:APPROVE|REJECT|ARCHIVE}
GET /api/admin/orders
GET /api/admin/reports
PATCH /api/admin/reports/:id

POST /api/reviews {orderItemId,rating,comment?} (delivered/completed only)
POST /api/reports {targetType,targetId,reason,description?}
POST /api/ai/suggest {nameHint,brand?,categoryHint?,colorHint?} (server-side, manual fallback)
```

Test with Thunder Client: login → cookie auto-sent → call protected routes.

# ERD — Altair's Thrift

> PostgreSQL via Prisma. See `backend/prisma/schema.prisma`.

```
users 1—N user_roles N—1 roles
users 1—N stores (owner)
users 1—1 carts 1—N cart_items N—1 products
users 1—N shipping_addresses 1—N orders
stores 1—N products 1—N product_images
products 1—1 inventory
products 1—N inventory_movements
products 1—N inventory_reservations (orderId string, expiresAt, ACTIVE→RELEASED/CONVERTED/EXPIRED)
stores 1—N orders 1—N order_items (snapshotName/Price/Image preserved)
orders 1—1 payments (providerRef unique, idempotencyKey unique)
orders 1—1 shipments (isSimulated=true for MVP manual tracking)
order_items 1—0/1 reviews (orderItemId unique → no duplicate reviews, only DELIVERED/COMPLETED)
users 1—N seller_verifications (PENDING→APPROVED/REJECTED, store.isVerified on approve)
categories 1—N products
users 1—N reports, notifications, audit_logs
```

Key constraints:
- `stores.slug @unique`, `products @@unique([storeId, slug])`
- Stock guarded in service: `updateMany where stock >= qty`, `available/reserved` kept in sync, `stock < 0` rejected by Zod + tx.
- Orders split per-seller (one shipment per store).
- Payments: never trust frontend; HMAC webhook, amount+ref check, idempotent PAID short-circuit.
- Reviews require eligible purchase; `reviews.orderItemId @unique`.

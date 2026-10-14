/* Clearly labeled DEMO seed — no real personal data. IDR prices, Indonesian cities. */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { slugify } from '../src/utils/slug.js';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Shirts', slug: 'shirts' },
  { name: 'Jackets', slug: 'jackets' },
  { name: 'Hoodies', slug: 'hoodies' },
  { name: 'Pants', slug: 'pants' },
  { name: 'Denim', slug: 'denim' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Accessories', slug: 'accessories' },
];

const STORES = [
  { name: 'Altair Vintage', slug: 'altair-vintage', location: 'Bandung, Jawa Barat', theme: 'STREETWEAR' },
  { name: 'Kala Second', slug: 'kala-second', location: 'Yogyakarta, DIY', theme: 'MINIMAL' },
  { name: 'Ruang Denim', slug: 'ruang-denim', location: 'Jakarta Selatan, DKI Jakarta', theme: 'CLASSIC' },
  { name: 'Svara Thrift', slug: 'svara-thrift', location: 'Surabaya, Jawa Timur', theme: 'STREETWEAR' },
  { name: 'Nusa Archive', slug: 'nusa-archive', location: 'Denpasar, Bali', theme: 'MINIMAL' },
] as const;

const PRODUCTS: Array<{ name: string; brand: string; price: number; category: string; size: string; condition: 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'NEW'; color: string; material: string; stock: number }> = [
  { name: 'Vintage Denim Jacket', brand: 'Levis', price: 285000, category: 'jackets', size: 'L', condition: 'GOOD', color: 'Washed Blue', material: 'Denim', stock: 1 },
  { name: 'Oversized Graphic Tee', brand: 'Uniqlo', price: 85000, category: 't-shirts', size: 'XL', condition: 'LIKE_NEW', color: 'Black', material: 'Cotton', stock: 5 },
  { name: 'Classic Flannel Shirt', brand: 'H&M', price: 120000, category: 'shirts', size: 'M', condition: 'GOOD', color: 'Red Check', material: 'Flannel', stock: 3 },
  { name: 'Straight Cut Jeans', brand: 'Levis', price: 195000, category: 'denim', size: '30', condition: 'GOOD', color: 'Dark Indigo', material: 'Denim', stock: 2 },
  { name: 'Retro Windbreaker', brand: 'Nike', price: 225000, category: 'jackets', size: 'M', condition: 'LIKE_NEW', color: 'Navy', material: 'Nylon', stock: 1 },
  { name: 'Canvas Tote Bag', brand: 'Local', price: 65000, category: 'accessories', size: 'OS', condition: 'NEW', color: 'Natural', material: 'Canvas', stock: 12 },
  { name: 'Corduroy Pants', brand: 'Dockers', price: 140000, category: 'pants', size: '29', condition: 'GOOD', color: 'Brown', material: 'Corduroy', stock: 2 },
  { name: 'Hoodie Boxy Fit', brand: 'Erigo', price: 165000, category: 'hoodies', size: 'L', condition: 'LIKE_NEW', color: 'Grey', material: 'Fleece', stock: 4 },
  { name: 'Sneakers Retro Low', brand: 'Vans', price: 350000, category: 'footwear', size: '42', condition: 'GOOD', color: 'White', material: 'Canvas', stock: 1 },
  { name: 'Linen Shirt White', brand: 'Muji', price: 135000, category: 'shirts', size: 'M', condition: 'LIKE_NEW', color: 'White', material: 'Linen', stock: 3 },
];

async function main() {
  console.log('[seed] demo data only');
  const passAdmin = await bcrypt.hash('Admin123!', 12);
  const passSeller = await bcrypt.hash('Seller123!', 12);
  const passCust = await bcrypt.hash('Customer123!', 12);

  await prisma.role.upsert({ where: { name: 'CUSTOMER' }, update: {}, create: { name: 'CUSTOMER' } });
  await prisma.role.upsert({ where: { name: 'SELLER' }, update: {}, create: { name: 'SELLER' } });
  await prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN' } });
  const roles = Object.fromEntries((await prisma.role.findMany()).map((r) => [r.name, r.id]));

  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: { name: c.name, slug: c.slug, description: `${c.name} curated thrift` } });
  }
  const catMap = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));

  const admin = await prisma.user.upsert({
    where: { email: 'admin@altairs.local' },
    update: {},
    create: { email: 'admin@altairs.local', passwordHash: passAdmin, fullName: 'Altair Admin' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: roles.ADMIN } }, update: {}, create: { userId: admin.id, roleId: roles.ADMIN } });

  // Sellers + stores
  const sellerUsers = [];
  for (let i = 0; i < 5; i++) {
    const email = `seller${i + 1}@altairs.local`;
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: passSeller, fullName: `Seller ${i + 1}`, phone: `0812000000${i + 1}` },
    });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: u.id, roleId: roles.SELLER } }, update: {}, create: { userId: u.id, roleId: roles.SELLER } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: u.id, roleId: roles.CUSTOMER } }, update: {}, create: { userId: u.id, roleId: roles.CUSTOMER } });
    const s = STORES[i];
    const store = await prisma.store.upsert({
      where: { slug: s.slug },
      update: { isVerified: true },
      create: {
        ownerId: u.id, name: s.name, slug: s.slug, location: s.location,
        description: `${s.name} — curated thrift dari ${s.location}.`,
        theme: s.theme as never, isVerified: true, status: 'ACTIVE',
        logoUrl: `https://picsum.photos/seed/${s.slug}-logo/200/200`,
        bannerUrl: `https://picsum.photos/seed/${s.slug}-banner/1200/400`,
      },
    });
    await prisma.sellerVerification.upsert({
      where: { id: `seed-verify-${i + 1}` },
      update: {},
      create: { id: `seed-verify-${i + 1}`, userId: u.id, storeId: store.id, identityName: `Seller ${i + 1}`, businessName: s.name, businessDesc: 'UMKM fashion demo', status: 'APPROVED' },
    });
    sellerUsers.push({ user: u, store });
  }

  // Customers
  const customers = [];
  const cities: Array<[string, string, string]> = [
    ['Jakarta', 'DKI Jakarta', '10110'], ['Bandung', 'Jawa Barat', '40111'], ['Surabaya', 'Jawa Timur', '60211'],
    ['Yogyakarta', 'DIY', '55111'], ['Semarang', 'Jawa Tengah', '50111'], ['Denpasar', 'Bali', '80111'],
    ['Medan', 'Sumatera Utara', '20111'], ['Makassar', 'Sulawesi Selatan', '90111'],
  ];
  for (let i = 0; i < 15; i++) {
    const email = `customer${i + 1}@altairs.local`;
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: passCust, fullName: `Customer ${i + 1}`, phone: `082100000${String(i + 1).padStart(2, '0')}` },
    });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: u.id, roleId: roles.CUSTOMER } }, update: {}, create: { userId: u.id, roleId: roles.CUSTOMER } });
    await prisma.cart.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id } });
    const [city, prov, postal] = cities[i % cities.length];
    await prisma.shippingAddress.create({
      data: { userId: u.id, label: 'Home', recipient: `Customer ${i + 1}`, phone: `082100000${i + 1}`, address: `Jl. Demo No. ${i + 1}`, city, province: prov, postalCode: postal, isDefault: true },
    });
    customers.push(u);
  }

  // 30 products (10 base x 3 variants across stores)
  let n = 0;
  for (let s = 0; s < 5; s++) {
    for (let k = 0; k < 6; k++) {
      const base = PRODUCTS[(s * 6 + k) % PRODUCTS.length];
      n++;
      const slug = `${slugify(base.name)}-${STORES[s].slug}`;
      const price = base.price + (s * 5000);
      const p = await prisma.product.upsert({
        where: { storeId_slug: { storeId: sellerUsers[s].store.id, slug } },
        update: {},
        create: {
          storeId: sellerUsers[s].store.id,
          categoryId: catMap[base.category],
          name: `${base.name} — ${STORES[s].name}`,
          slug,
          brand: base.brand,
          description: `${base.name} original thrift, kondisi ${base.condition}. LD/PB tercantum. Defect dicantumkan jujur bila ada.`,
          price,
          size: base.size,
          chestMeasurement: 'LD 110cm',
          lengthMeasurement: 'P 70cm',
          material: base.material,
          color: base.color,
          condition: base.condition,
          defects: base.condition === 'GOOD' ? 'Fading ringan, jahitan aman.' : undefined,
          stock: base.stock,
          status: 'PUBLISHED',
          tags: [base.category, base.brand.toLowerCase(), 'thrift'],
        },
      });
      await prisma.productImage.upsert({
        where: { id: `seed-img-${s}-${k}` },
        update: {},
        create: { id: `seed-img-${s}-${k}`, productId: p.id, url: `https://picsum.photos/seed/${slug}/800/1000`, alt: p.name, position: 0 },
      });
      await prisma.inventory.upsert({
        where: { productId: p.id },
        update: {},
        create: { productId: p.id, available: base.stock, reserved: 0, sold: (n % 4) * 2 },
      });
    }
  }

  // Sample orders + reviews (eligible completed purchases only)
  const allProducts = await prisma.product.findMany({ take: 10, include: { store: true } });
  for (let i = 0; i < 8; i++) {
    const cust = customers[i];
    const prod = allProducts[i % allProducts.length];
    const addr = await prisma.shippingAddress.findFirst({ where: { userId: cust.id } });
    const orderNumber = `AT-2026-SEED${String(i + 1).padStart(3, '0')}`;
    const order = await prisma.order.upsert({
      where: { orderNumber },
      update: {},
      create: {
        orderNumber,
        customerId: cust.id,
        storeId: prod.storeId,
        shippingAddressId: addr?.id,
        subtotal: prod.price,
        shippingCost: 15000,
        total: prod.price + 15000,
        paymentStatus: 'PAID',
        orderStatus: i < 5 ? 'COMPLETED' : 'DELIVERED',
        items: { create: [{ productId: prod.id, snapshotName: prod.name, snapshotPrice: prod.price, qty: 1, subtotal: prod.price }] },
      },
    });
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {},
      create: { orderId: order.id, provider: 'sandbox', providerRef: `SBX-${orderNumber}`, idempotencyKey: `seed-${orderNumber}`, amount: order.total, status: 'PAID', paidAt: new Date() },
    });
    await prisma.shipment.upsert({
      where: { orderId: order.id },
      update: {},
      create: { orderId: order.id, courier: 'JNE', trackingNumber: `JNE${100000 + i}`, shippingCost: 15000, status: 'DELIVERED', isSimulated: true, deliveredAt: new Date() },
    });
    if (i < 5) {
      const item = await prisma.orderItem.findFirst({ where: { orderId: order.id } });
      if (item) {
        await prisma.review.upsert({
          where: { orderItemId: item.id },
          update: {},
          create: { orderItemId: item.id, productId: prod.id, customerId: cust.id, storeId: prod.storeId, rating: 4 + (i % 2), comment: 'Barang sesuai deskripsi, pengiriman cepat.', isVerifiedPurchase: true },
        });
      }
    }
  }

  console.log(`[seed] done: 1 admin, 5 sellers, 15 customers, ${n} products`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

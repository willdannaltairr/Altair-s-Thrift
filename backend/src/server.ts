import { buildApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';

/** Release expired unpaid reservations so stock cannot get stuck. */
async function releaseExpiredReservations() {
  try {
    const expired = await prisma.inventoryReservation.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
      take: 100,
    });
    for (const r of expired) {
      const order = await prisma.order.findUnique({ where: { id: r.orderId ?? '' } });
      if (order && order.paymentStatus === 'PAID') {
        await prisma.inventoryReservation.update({ where: { id: r.id }, data: { status: 'CONVERTED' } });
        continue;
      }
      await prisma.$transaction(async (tx) => {
        await tx.inventoryReservation.update({ where: { id: r.id }, data: { status: 'EXPIRED' } });
        await tx.product.update({ where: { id: r.productId }, data: { stock: { increment: r.qty } } });
        await tx.inventory.update({
          where: { productId: r.productId },
          data: { reserved: { decrement: r.qty }, available: { increment: r.qty } },
        });
        await tx.inventoryMovement.create({ data: { productId: r.productId, type: 'RELEASE', qty: r.qty, refOrderId: r.orderId, note: 'reservation expired' } });
      });
    }
    if (expired.length) console.log(`[reservations] released ${expired.length}`);
  } catch (e) {
    console.error('[reservations]', e);
  }
}

const app = buildApp();
app.listen(env.PORT, () => {
  console.log(`[backend] listening on :${env.PORT} (${env.NODE_ENV})`);
  setInterval(releaseExpiredReservations, 5 * 60 * 1000);
  void releaseExpiredReservations();
});

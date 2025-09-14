import cron from 'node-cron';
import { prisma } from './prisma.js';
import { syncProducts, syncCustomers, syncOrders, syncAbandonedCheckouts } from './syncService.js';

export function startScheduler() {
  cron.schedule('*/15 * * * *', async () => {
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    for (const t of tenants) {
      try {
        await syncProducts(t.id);
        await syncCustomers(t.id);
        await syncOrders(t.id);
        await syncAbandonedCheckouts(t.id);   
        console.log(`[cron] synced tenant ${t.id}`);
      } catch (e) {
        console.error(`[cron] tenant ${t.id} failed:`, e.message);
      }
    }
  });
}

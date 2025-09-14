import { Router } from 'express';
import { tenantGuard } from './middleware.js';
import { syncProducts, syncCustomers, syncOrders, syncAbandonedCheckouts } from './syncService.js';

const r = Router();

r.post('/products', tenantGuard, async (req, res) => res.json({ synced: await syncProducts(req.tenantId) }));
r.post('/customers', tenantGuard, async (req, res) => res.json({ synced: await syncCustomers(req.tenantId) }));
r.post('/orders',   tenantGuard, async (req, res) => res.json({ synced: await syncOrders(req.tenantId) }));

r.post('/abandoned-checkouts', tenantGuard, async (req, res) => {
  const n = await syncAbandonedCheckouts(req.tenantId);
  res.json({ inserted: n });
});

export default r;

import { Router } from 'express';
import { tenantGuard } from './middleware.js';
import { prisma } from './prisma.js';

const r = Router();

r.get('/summary', tenantGuard, async (req, res) => {
  const t = req.tenantId;
  const [customers, orders, revenueAgg] = await Promise.all([
    prisma.customer.count({ where: { tenantId: t }}),
    prisma.order.count({ where: { tenantId: t }}),
    prisma.order.aggregate({ where: { tenantId: t }, _sum: { total: true }})
  ]);
  const revenue = Number(revenueAgg._sum.total || 0);
  const averageOrderValue = orders > 0 ? revenue / orders : 0;
  res.json({ customers, orders, revenue, averageOrderValue });
});


r.get('/orders-by-date', tenantGuard, async (req, res) => {
  const t = req.tenantId; const { from, to } = req.query;
  const where = { tenantId: t, ...(from||to ? { orderDate: { ...(from?{ gte: new Date(from) }:{}), ...(to?{ lte: new Date(to) }:{}) } } : {}) };
  const rows = await prisma.order.findMany({ where, select: { orderDate: true, total: true }});
  res.json(rows.map(r => ({
    orderDate: r.orderDate,        
    total: Number(r.total)         
  })));
});


r.get('/top-customers', tenantGuard, async (req, res) => {
  const t = req.tenantId;
  const rows = await prisma.$queryRawUnsafe(`
    SELECT c.id, c.name, COALESCE(SUM(o.total),0) as spend
    FROM Customer c
    LEFT JOIN \`Order\` o ON o.customerId=c.id AND o.tenantId=c.tenantId
    WHERE c.tenantId=${t}
    GROUP BY c.id, c.name
    ORDER BY spend DESC
    LIMIT 5;
  `);
  res.json(rows.map(r => ({
    id: Number(r.id),
    name: r.name,
    spend: Number(r.spend)
  })));
});

r.get('/top-products', tenantGuard, async (req, res) => {
  const t = req.tenantId;
  const rows = await prisma.orderItem.groupBy({
    by: ['title'],
    where: { tenantId: t },
    _sum: { lineTotal: true, quantity: true },
    orderBy: { _sum: { lineTotal: 'desc' } },
    take: 5
  });
  const top = rows.map(r => ({
    title: r.title,
    revenue: Number(r._sum.lineTotal || 0),
    units: Number(r._sum.quantity || 0)
  }));
  res.json(top);
});
r.get('/new-vs-repeat', tenantGuard, async (req, res) => {
  const t = req.tenantId;
  const perCustomer = await prisma.order.groupBy({
    by: ['customerId'],
    where: { tenantId: t, customerId: { not: null } },
    _count: { _all: true }
  });

  let newCount = 0, repeatCount = 0;
  for (const row of perCustomer) {
    if (row._count._all > 1) repeatCount++;
    else newCount++;
  }

  res.json({ new: newCount, repeat: repeatCount });
});

r.get('/abandoned-summary', tenantGuard, async (req, res) => {
  const tenantId = req.tenantId;

  const count = await prisma.abandonedCheckout.count({ where: { tenantId } });
  const total = await prisma.abandonedCheckout.aggregate({
    where: { tenantId },
    _sum: { total: true }
  });

  res.json({
    abandonedCount: count,
    abandonedValue: total._sum.total || 0
  });
});

export default r;

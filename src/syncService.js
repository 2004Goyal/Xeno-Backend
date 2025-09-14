import { prisma } from './prisma.js';
import { getAdmin } from './shopify.js';

export async function syncProducts(tenantId) {
  const admin = await getAdmin(tenantId);
  const { data } = await admin.get('/products.json?limit=250');
  const items = data.products || [];

  for (const p of items) {
    const price = Number(p.variants?.[0]?.price || 0);
    await prisma.product.upsert({
      where: { tenantId_shopifyId: { tenantId, shopifyId: String(p.id) } },
      update: { title: p.title, price },
      create: { tenantId, shopifyId: String(p.id), title: p.title, price },
    });
  }
  return items.length;
}

export async function syncCustomers(tenantId) {
  const admin = await getAdmin(tenantId);
  const { data } = await admin.get('/customers.json?limit=250');
  const items = data.customers || [];

  for (const c of items) {
    const name = `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown';
    await prisma.customer.upsert({
      where: { tenantId_shopifyId: { tenantId, shopifyId: String(c.id) } },
      update: { name, email: c.email ?? null },
      create: { tenantId, shopifyId: String(c.id), name, email: c.email ?? null },
    });
  }
  return items.length;
}

export async function syncOrders(tenantId) {
  const admin = await getAdmin(tenantId);
  const { data } = await admin.get('/orders.json?limit=250&status=any');
  const items = data.orders || [];

  for (const o of items) {
    let customerId = null;
    if (o.customer?.id) {
      const name = `${o.customer.first_name || ''} ${o.customer.last_name || ''}`.trim() || 'Unknown';
      const c = await prisma.customer.upsert({
        where: { tenantId_shopifyId: { tenantId, shopifyId: String(o.customer.id) } },
        update: { name, email: o.customer.email ?? null },
        create: { tenantId, shopifyId: String(o.customer.id), name, email: o.customer.email ?? null },
      });
      customerId = c.id;
    }

    const order = await prisma.order.upsert({
      where: { tenantId_shopifyId: { tenantId, shopifyId: String(o.id) } },
      update: { total: Number(o.total_price ?? 0), orderDate: new Date(o.created_at), customerId },
      create: { tenantId, shopifyId: String(o.id), total: Number(o.total_price ?? 0), orderDate: new Date(o.created_at), customerId },
    });

    for (const li of o.line_items || []) {
      await prisma.orderItem.upsert({
        where: { tenantId_shopifyId: { tenantId, shopifyId: String(li.id) } },
        update: {
          orderId: order.id,
          title: li.title || li.name || 'Unknown',
          quantity: Number(li.quantity || 0),
          lineTotal: Number(li.price || 0) * Number(li.quantity || 0),
        },
        create: {
          tenantId,
          orderId: order.id,
          shopifyId: String(li.id),
          title: li.title || li.name || 'Unknown',
          quantity: Number(li.quantity || 0),
          lineTotal: Number(li.price || 0) * Number(li.quantity || 0),
        },
      });
    }
  }
  return items.length;
}

export async function syncAbandonedCheckouts(tenantId) {
  const admin = await getAdmin(tenantId);
  const { data } = await admin.get('/checkouts.json?status=abandoned&limit=50');
  const items = data.checkouts || [];

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const shopDomain = tenant?.shopDomain || '';

  let inserted = 0;
  for (const c of items) {
    const checkoutId = String(c.id || c.token || c.checkout_token || c.cart_token || Math.random());
    const subtotal = Number(c.subtotal_price || 0);

    try {
      await prisma.checkoutEvent.upsert({
        where: {
          tenantId_checkoutId_status: {
            tenantId,
            checkoutId,
            status: 'abandoned'
          }
        },
        update: {
          email: c.email || null,
          subtotal,
          raw: c
        },
        create: {
          tenantId,
          shopDomain,
          checkoutId,
          email: c.email || null,
          status: 'abandoned',
          subtotal,
          raw: c
        }
      });
      inserted++;
    } catch (_) {
    }
  }

  return inserted;
}

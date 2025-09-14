import crypto from 'crypto';
import express from 'express';
import { prisma } from './prisma.js';

const router = express.Router();

router.post('/shopify', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const hmac = req.get('X-Shopify-Hmac-Sha256') || '';
    const topic = (req.get('X-Shopify-Topic') || '').toLowerCase();
    const shopDomain = req.get('X-Shopify-Shop-Domain') || '';

    const computed = crypto
      .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET || '')
      .update(req.body) 
      .digest('base64');
    if (computed !== hmac) {
      return res.status(401).send('Invalid HMAC');
    }

    const tenant = await prisma.tenant.findUnique({ where: { shopDomain } });
    if (!tenant) return res.status(404).send('Unknown shop');

    const payload = JSON.parse(req.body.toString('utf8'));

    if (topic === 'checkouts/create') {
      const checkoutId = String(payload.id || payload.token || payload.checkout_token || Math.random());
      await prisma.checkoutEvent.upsert({
        where: {
          tenantId_checkoutId_status: {
            tenantId: tenant.id,
            checkoutId,
            status: 'created'
          }
        },
        update: { email: payload.email || null, subtotal: Number(payload.subtotal_price || 0), raw: payload },
        create: {
          tenantId: tenant.id,
          shopDomain,
          checkoutId,
          email: payload.email || null,
          status: 'created',
          subtotal: Number(payload.subtotal_price || 0),
          raw: payload
        }
      });
    }

    if (topic === 'carts/update') {
      const cartToken = String(payload.token || payload.cart_token || Math.random());
      await prisma.cartEvent.upsert({
        where: {
          tenantId_cartToken_event: {
            tenantId: tenant.id,
            cartToken,
            event: 'updated'
          }
        },
        update: { raw: payload },
        create: {
          tenantId: tenant.id,
          shopDomain,
          cartToken,
          event: 'updated',
          raw: payload
        }
      });
    }

    res.sendStatus(200);
  } catch (e) {
    console.error('[webhook] error', e);
    res.sendStatus(500);
  }
});

export default router;

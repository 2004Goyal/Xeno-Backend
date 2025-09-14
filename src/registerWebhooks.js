import { getAdmin } from './shopify.js';

export async function registerWebhooks(tenantId, baseUrl) {
  const admin = await getAdmin(tenantId);
  const topics = ['checkouts/create', 'carts/update'];

  for (const topic of topics) {
    await admin.post('/webhooks.json', {
      webhook: {
        topic,
        address: `${baseUrl}/webhooks/shopify`,
        format: 'json'
      }
    });
  }
}

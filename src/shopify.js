import axios from 'axios';
import { prisma } from './prisma.js';

export async function getAdmin(tenantId){
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }});
  if(!t) throw new Error('Tenant not found');
  const base = `https://${t.shopDomain}/admin/api/${process.env.SHOPIFY_API_VERSION}`;
  return axios.create({
    baseURL: base,
    headers: { 'X-Shopify-Access-Token': t.accessToken, 'Content-Type':'application/json' },
    timeout: 15000
  });
}

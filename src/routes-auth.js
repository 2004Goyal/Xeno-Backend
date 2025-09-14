import { Router } from 'express';
import { prisma } from './prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const r = Router();

r.post('/register-tenant', async (req, res) => {
  const { name, shopDomain, accessToken, adminEmail, adminPassword } = req.body;
  if (!shopDomain || !accessToken) return res.status(400).json({ error: 'shopDomain & accessToken required' });

  const tenant = await prisma.tenant.create({ data: { name, shopDomain, accessToken }});
  const hash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({ data: { tenantId: tenant.id, email: adminEmail, password: hash }});
  res.json({ tenantId: tenant.id });
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, tenantId: user.tenantId });
});

export default r;

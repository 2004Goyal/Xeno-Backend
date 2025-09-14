import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './prisma.js';
import auth from './routes-auth.js';
import sync from './routes-sync.js';
import insights from './routes-insights.js';
import { startScheduler } from './scheduler.js';
import webhookRouter from './webhooks.js';

const app = express();
app.use(cors());

app.use('/webhooks', webhookRouter);

app.use(express.json());

app.get('/health', async (_req, res) => {
  const rows = await prisma.$queryRaw`SELECT 1 as ok`;
  res.json({ ok: Number(rows?.[0]?.ok ?? 0) });
});

app.use('/auth', auth);
app.use('/sync', sync);
app.use('/insights', insights);

startScheduler();

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`API on ${port}`);
});

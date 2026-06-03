import Fastify from 'fastify';
import cors from '@fastify/cors';
import { tickRoutes } from './routes/tick.js';
import { parseRoutes } from './routes/parse.js';
import { stateRoutes } from './routes/state.js';

const PORT = Number(process.env.PORT ?? 3001);

const app = Fastify({ logger: { level: 'info' } });

await app.register(cors, { origin: true });
await app.register(tickRoutes);
await app.register(parseRoutes);
await app.register(stateRoutes);

app.get('/api/health', async () => ({ ok: true, timestamp: new Date().toISOString() }));

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Backend läuft auf http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

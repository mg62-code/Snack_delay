import { FastifyInstance } from 'fastify';
import { LifeState, createInitialState } from '@snack/engine';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SAVES_DIR = path.resolve(process.cwd(), '../../saves');

async function ensureSavesDir() {
  if (!existsSync(SAVES_DIR)) await mkdir(SAVES_DIR, { recursive: true });
}

export async function stateRoutes(app: FastifyInstance) {
  app.get('/api/state/new', async (_req, reply) => {
    return reply.send(createInitialState());
  });

  app.get<{ Params: { slot: string } }>('/api/state/:slot', async (req, reply) => {
    await ensureSavesDir();
    const file = path.join(SAVES_DIR, `save_${req.params.slot}.json`);
    if (!existsSync(file)) return reply.status(404).send({ error: 'Save not found' });
    const data = await readFile(file, 'utf-8');
    return reply.send(JSON.parse(data));
  });

  app.post<{ Params: { slot: string }; Body: LifeState }>('/api/state/:slot', async (req, reply) => {
    await ensureSavesDir();
    const file = path.join(SAVES_DIR, `save_${req.params.slot}.json`);
    await writeFile(file, JSON.stringify(req.body, null, 2));
    return reply.send({ ok: true, slot: req.params.slot });
  });

  app.get('/api/state/slots/list', async (_req, reply) => {
    await ensureSavesDir();
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(SAVES_DIR);
    const slots = files
      .filter((f) => f.startsWith('save_') && f.endsWith('.json'))
      .map((f) => f.replace('save_', '').replace('.json', ''));
    return reply.send({ slots });
  });
}

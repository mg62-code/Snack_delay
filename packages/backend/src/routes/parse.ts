import { FastifyInstance } from 'fastify';
import { LifeState } from '@snack/engine';
import { parseFreetextAction, coachReflection } from '../llm/client.js';

export async function parseRoutes(app: FastifyInstance) {
  app.post<{ Body: { text: string; state: LifeState } }>('/api/parse', async (req, reply) => {
    const { text, state } = req.body;
    if (!text || !state) return reply.status(400).send({ error: 'text and state required' });

    const action = await parseFreetextAction(text, state);
    if (!action) {
      return reply.status(422).send({ error: 'Konnte Aktion nicht parsen. LM Studio läuft?' });
    }
    return reply.send({ action });
  });

  app.post<{ Body: { auditSummary: string; state: LifeState } }>('/api/coach', async (req, reply) => {
    const { auditSummary, state } = req.body;
    if (!auditSummary || !state) return reply.status(400).send({ error: 'auditSummary and state required' });

    const reflection = await coachReflection(auditSummary, state);
    return reply.send({ reflection: reflection ?? 'LM Studio nicht erreichbar.' });
  });
}

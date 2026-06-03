import { FastifyInstance } from 'fastify';
import { simulateTick, LifeState, Action } from '@snack/engine';
import { narrateEvent } from '../llm/client.js';

export async function tickRoutes(app: FastifyInstance) {
  app.post<{ Body: { state: LifeState; action: Action } }>('/api/tick', async (req, reply) => {
    const { state, action } = req.body;

    if (!state || !action) {
      return reply.status(400).send({ error: 'state and action required' });
    }

    try {
      const result = simulateTick(state, action);

      // Enrich events with LLM narration (non-blocking — fallback to original description)
      const enrichedEvents = await Promise.all(
        result.events.map(async (event) => {
          const narration = await narrateEvent(
            event.title,
            event.explanation.trigger,
            result.newState,
          );
          return narration ? { ...event, description: narration } : event;
        }),
      );

      return reply.send({ ...result, events: enrichedEvents });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Simulation error', detail: String(err) });
    }
  });
}

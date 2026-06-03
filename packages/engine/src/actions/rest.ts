import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';

export function applyRest(state: LifeState, action: Extract<Action, { type: 'REST' }>): AuditDelta[] {
  const { hours } = action;
  const factor = Math.min(hours / 4, 2); // normalized to 4h

  return applyDeltas(state, [
    { path: 'vitals.energy', delta: 8 * factor, clamp: [0, 100], reason: `REST(${hours}h)` },
    { path: 'vitals.stress', delta: -(5 * factor), clamp: [0, 100], reason: `REST_stress_relief` },
    { path: 'vitals.mood', delta: 3 * factor, clamp: [0, 100], reason: `REST_mood` },
    { path: 'emotions.anxiety', delta: -(4 * factor), clamp: [0, 100], reason: `REST_calm` },
  ]);
}

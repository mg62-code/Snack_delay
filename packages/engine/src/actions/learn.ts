import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas, skillGain } from '../utils.js';

export function applyLearn(state: LifeState, action: Extract<Action, { type: 'LEARN' }>): AuditDelta[] {
  const { skill, hours, budget } = action;
  const current = state.skills[skill] ?? 0;

  // Diminishing returns — harder to improve at high levels
  const rawGain = hours * 2.5;
  const gain = skillGain(current, rawGain);

  // Budget boosts learning (courses, books)
  const budgetBonus = budget ? Math.min(budget / 100, 1.5) : 0;

  const deltas: AuditDelta[] = applyDeltas(state, [
    { path: `skills.${skill}`, delta: gain * (1 + budgetBonus), clamp: [0, 100], reason: `LEARN(${skill},${hours}h)` },
    {
      path: 'vitals.energy',
      delta: -(hours * 3),
      clamp: [0, 100],
      reason: `LEARN_energy_cost`,
    },
    { path: 'vitals.stress', delta: hours * 1.5, clamp: [0, 100], reason: `LEARN_cognitive_load` },
    { path: 'emotions.pride', delta: 3, clamp: [0, 100], reason: 'LEARN_achievement' },
  ]);

  if (budget) {
    deltas.push(...applyDeltas(state, [{ path: 'finance.cash', delta: -(budget), reason: `LEARN_budget(${budget}€)` }]));
  }

  // Init skill if new
  if (!(skill in state.skills)) {
    state.skills[skill] = 0;
  }

  return deltas;
}

import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';

export function applyMeditate(state: LifeState, action: Extract<Action, { type: 'MEDITATE' }>): AuditDelta[] {
  const { minutes } = action;
  const factor = Math.min(minutes / 20, 2); // normalized to 20min

  const habit = state.habits.find((h) => h.actionType === 'MEDITATE');
  const habitBonus = habit ? habit.efficiencyBonus : 0;

  return applyDeltas(state, [
    { path: 'vitals.stress', delta: -(8 * factor * (1 + habitBonus)), clamp: [0, 100], reason: `MEDITATE(${minutes}min)` },
    { path: 'vitals.mood', delta: 5 * factor, clamp: [0, 100], reason: `MEDITATE_mood` },
    { path: 'emotions.anxiety', delta: -(7 * factor), clamp: [0, 100], reason: `MEDITATE_calm` },
    { path: 'vitals.energy', delta: 2 * factor, clamp: [0, 100], reason: `MEDITATE_clarity` },
    // Meditation builds focus over time
    {
      path: 'skills.focus',
      delta: habit && habit.streak > 7 ? 0.5 : 0.1,
      clamp: [0, 100],
      reason: `MEDITATE_focus_training`,
    },
  ]);
}

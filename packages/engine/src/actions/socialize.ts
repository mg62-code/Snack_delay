import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';

export function applySocialize(state: LifeState, action: Extract<Action, { type: 'SOCIALIZE' }>): AuditDelta[] {
  const { targetRelId, mode, hours } = action;
  const relIndex = state.relationships.findIndex((r) => r.id === targetRelId);

  if (relIndex === -1) return [];

  const rel = state.relationships[relIndex];
  const modeBonus = mode === 'MEET' ? 1.5 : 1.0;
  const closenessGain = Math.min(hours * 3 * modeBonus, 15);
  const conflictReduction = mode === 'MEET' ? -(hours * 2) : -(hours * 0.5);
  const moodGain = rel.closeness > 60 ? hours * 3 : hours * 1.5;

  // Update lastContactTick
  state.relationships[relIndex].lastContactTick = state.meta.tick;

  return applyDeltas(state, [
    {
      path: `relationships.${relIndex}.closeness`,
      delta: closenessGain,
      clamp: [0, 100],
      reason: `SOCIALIZE(${rel.name},${mode})`,
    },
    {
      path: `relationships.${relIndex}.conflict`,
      delta: conflictReduction,
      clamp: [0, 100],
      reason: `SOCIALIZE_conflict_reduction`,
    },
    {
      path: `relationships.${relIndex}.trust`,
      delta: mode === 'MEET' ? 2 : 1,
      clamp: [0, 100],
      reason: `SOCIALIZE_trust`,
    },
    { path: 'vitals.mood', delta: moodGain, clamp: [0, 100], reason: `SOCIALIZE_mood` },
    { path: 'vitals.energy', delta: -(hours * 2), clamp: [0, 100], reason: `SOCIALIZE_energy_cost` },
    { path: 'emotions.loneliness', delta: -(8 * modeBonus), clamp: [0, 100], reason: `SOCIALIZE_loneliness` },
  ]);
}

import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';

const INTENSITY_MAP = { LOW: 0.5, MED: 1.0, HIGH: 1.5 };

export function applyExercise(state: LifeState, action: Extract<Action, { type: 'EXERCISE' }>): AuditDelta[] {
  const { intensity, minutes } = action;
  const factor = INTENSITY_MAP[intensity];
  const durationFactor = Math.min(minutes / 45, 2); // normalized to 45min

  const habit = state.habits.find((h) => h.actionType === 'EXERCISE');
  const habitBonus = habit ? habit.efficiencyBonus : 0;

  return applyDeltas(state, [
    {
      path: 'vitals.health',
      delta: factor * durationFactor * 4 * (1 + habitBonus),
      clamp: [0, 100],
      reason: `EXERCISE(${intensity},${minutes}min)`,
    },
    {
      path: 'vitals.stress',
      delta: -(factor * durationFactor * 6),
      clamp: [0, 100],
      reason: `EXERCISE_stress_relief`,
    },
    {
      path: 'vitals.mood',
      delta: factor * durationFactor * 5,
      clamp: [0, 100],
      reason: `EXERCISE_endorphins`,
    },
    // Initial energy dip, net positive for next tick
    {
      path: 'vitals.energy',
      delta: intensity === 'HIGH' ? -(durationFactor * 10) : durationFactor * 3,
      clamp: [0, 100],
      reason: `EXERCISE_energy`,
    },
    { path: 'emotions.pride', delta: 4, clamp: [0, 100], reason: 'EXERCISE_achievement' },
    { path: 'emotions.anxiety', delta: -(factor * 4), clamp: [0, 100], reason: 'EXERCISE_anxiety_relief' },
  ]);
}

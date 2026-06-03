import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas, clampVital } from '../utils.js';

const INTENSITY_MAP = { LOW: 0.5, MED: 1.0, HIGH: 1.6 };

export function applyWork(state: LifeState, action: Extract<Action, { type: 'WORK' }>): AuditDelta[] {
  const { intensity, hours } = action;
  const factor = INTENSITY_MAP[intensity];

  // Habit bonus
  const habit = state.habits.find((h) => h.actionType === 'WORK');
  const habitBonus = habit ? habit.efficiencyBonus : 0;

  const stressDelta = clampVital(factor * hours * 1.5) * (1 - habitBonus);
  const energyDelta = -(factor * hours * 2.5);
  const performanceDelta = factor * 0.8 * (1 + habitBonus);
  const sleepDebtDelta = intensity === 'HIGH' ? hours * 0.3 : 0;

  // Kognitive Verzerrung: bei hohem Optimismus-Bias unterschätzt man Konsequenzen
  const stressMultiplier = 1 - state.person.cognitiveProfile.optimismBias * 0.2;

  return applyDeltas(state, [
    { path: 'vitals.energy', delta: energyDelta, clamp: [0, 100], reason: `WORK(${intensity},${hours}h)` },
    {
      path: 'vitals.stress',
      delta: stressDelta * stressMultiplier,
      clamp: [0, 100],
      reason: `WORK(${intensity},${hours}h)`,
    },
    { path: 'career.performance', delta: performanceDelta, clamp: [0, 100], reason: `WORK_output` },
    ...(sleepDebtDelta > 0
      ? [{ path: 'vitals.sleepDebt', delta: sleepDebtDelta, reason: `WORK_HIGH_sleepDebt` }]
      : []),
    ...(intensity === 'HIGH' ? [{ path: 'career.riskOfLayoff', delta: -2, clamp: [0, 100] as [number, number], reason: 'visible_effort' }] : []),
  ]);
}

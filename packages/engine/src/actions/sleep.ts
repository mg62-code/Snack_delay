import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';

export function applySleep(state: LifeState, action: Extract<Action, { type: 'SLEEP' }>): AuditDelta[] {
  const { hours } = action;
  const optimalSleep = 8;
  const qualityFactor = hours >= optimalSleep ? 1.0 : hours / optimalSleep;

  const energyGain = Math.min(hours * 8, 80) * qualityFactor;
  const sleepDebtReduction = Math.min(state.vitals.sleepDebt, hours * 0.8);
  const stressReduction = hours >= 7 ? -(hours - 6) * 2 : 0;
  const healthGain = hours >= 7 ? 1 : 0;
  const moodDelta = hours >= 7 ? 3 : hours < 5 ? -5 : 0;

  return applyDeltas(state, [
    { path: 'vitals.energy', delta: energyGain, clamp: [0, 100], reason: `SLEEP(${hours}h)` },
    { path: 'vitals.sleepDebt', delta: -sleepDebtReduction, clamp: [0, 999], reason: `SLEEP_debt_reduction` },
    ...(stressReduction < 0
      ? [{ path: 'vitals.stress', delta: stressReduction, clamp: [0, 100] as [number, number], reason: 'SLEEP_stress_relief' }]
      : []),
    ...(healthGain > 0 ? [{ path: 'vitals.health', delta: healthGain, clamp: [0, 100] as [number, number], reason: 'SLEEP_health' }] : []),
    ...(moodDelta !== 0
      ? [{ path: 'vitals.mood', delta: moodDelta, clamp: [0, 100] as [number, number], reason: `SLEEP_mood_${hours >= 7 ? 'good' : 'poor'}` }]
      : []),
  ]);
}

import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';

const EAT_CONFIG = {
  CHEAP:   { healthDelta: -1, moodDelta: -2,  energyDelta: 3,  costBase: 5  },
  NORMAL:  { healthDelta:  1, moodDelta:  1,  energyDelta: 5,  costBase: 15 },
  HEALTHY: { healthDelta:  3, moodDelta:  3,  energyDelta: 8,  costBase: 30 },
};

export function applyEat(state: LifeState, action: Extract<Action, { type: 'EAT' }>): AuditDelta[] {
  const { quality } = action;
  const cfg = EAT_CONFIG[quality];
  const cost = cfg.costBase * state.location.costIndex;

  return applyDeltas(state, [
    { path: 'vitals.health', delta: cfg.healthDelta, clamp: [0, 100], reason: `EAT(${quality})` },
    { path: 'vitals.mood', delta: cfg.moodDelta, clamp: [0, 100], reason: `EAT_satisfaction` },
    { path: 'vitals.energy', delta: cfg.energyDelta, clamp: [0, 100], reason: `EAT_energy` },
    { path: 'finance.cash', delta: -cost, reason: `EAT_cost(${cost.toFixed(0)}€)` },
  ]);
}

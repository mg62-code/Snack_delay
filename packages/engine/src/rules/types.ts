import { LifeState, Action, GameEvent, AuditDelta } from '../types.js';

export interface RuleDelta {
  path: string;
  delta: number;
  clamp?: [number, number];
  reason: string;
}

export interface RuleResult {
  deltas: RuleDelta[];
  event?: GameEvent;
}

export interface Rule {
  id: string;
  description: string;
  priority: number; // higher runs first
  cooldown?: number; // min ticks between triggers (uses flags)
  when(state: LifeState, action: Action, rng: () => number): boolean;
  apply(state: LifeState, action: Action, rng: () => number): RuleResult;
}

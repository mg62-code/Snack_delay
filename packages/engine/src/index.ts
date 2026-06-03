export { simulateTick } from './engine.js';
export { createInitialState } from './state.js';
export { clamp, clampVital, deepClone, makeRng } from './utils.js';
export { ALL_RULES } from './rules/index.js';
export type {
  LifeState,
  Action,
  TickResult,
  AuditEntry,
  AuditDelta,
  GameEvent,
  EventEffect,
  Vitals,
  Emotions,
  Finance,
  CareerState,
  Relationship,
  Habit,
  Asset,
  CognitiveProfile,
  Intensity,
  InvestmentInstrument,
  JobStrategy,
  SocializeMode,
  EatQuality,
} from './types.js';

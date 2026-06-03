import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';

const STRATEGY = {
  SAFE:       { incomeMultiplier: 0.10, riskDelta: -10, performanceReset: 60, stressCost: 15 },
  BALANCED:   { incomeMultiplier: 0.20, riskDelta:  10, performanceReset: 55, stressCost: 20 },
  AGGRESSIVE: { incomeMultiplier: 0.40, riskDelta:  25, performanceReset: 45, stressCost: 30 },
};

const TITLES: Record<string, string[]> = {
  SAFE: ['Senior Developer', 'Lead Developer', 'Tech Lead'],
  BALANCED: ['Principal Engineer', 'Engineering Manager', 'CTO'],
  AGGRESSIVE: ['Co-Founder', 'VP Engineering', 'Director of Engineering'],
};

export function applyJobChange(state: LifeState, action: Extract<Action, { type: 'JOB_CHANGE' }>): AuditDelta[] {
  const { strategy } = action;
  const cfg = STRATEGY[strategy];
  const incomeIncrease = state.finance.incomeMonthly * cfg.incomeMultiplier;
  const titles = TITLES[strategy];
  const newTitle = titles[Math.floor(Math.random() * titles.length)];

  // Apply state changes
  state.career.jobTitle = newTitle;
  state.career.employer = `NewCorp ${new Date().getFullYear()}`;
  state.career.performance = cfg.performanceReset;
  state.career.monthsInRole = 0;
  state.flags['changed_job'] = true;

  // Reset habits (new environment disrupts habits)
  state.habits = state.habits.map((h) => ({ ...h, streak: Math.floor(h.streak / 2) }));

  return applyDeltas(state, [
    { path: 'finance.incomeMonthly', delta: incomeIncrease, reason: `JOB_CHANGE(${strategy}) +${incomeIncrease.toFixed(0)}€` },
    { path: 'career.riskOfLayoff', delta: cfg.riskDelta, clamp: [0, 100], reason: `JOB_CHANGE(${strategy})` },
    { path: 'vitals.stress', delta: cfg.stressCost, clamp: [0, 100], reason: `JOB_CHANGE_transition` },
    { path: 'emotions.anxiety', delta: cfg.stressCost * 0.5, clamp: [0, 100], reason: `JOB_CHANGE_anxiety` },
    { path: 'emotions.pride', delta: 10, clamp: [0, 100], reason: `JOB_CHANGE_excitement` },
    // Tax adjusts if income bracket changes
    ...(strategy === 'AGGRESSIVE' ? [{ path: 'finance.taxRate', delta: 0.03, clamp: [0, 0.5] as [number, number], reason: 'higher_bracket' }] : []),
  ]);
}

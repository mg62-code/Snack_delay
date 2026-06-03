import { describe, it, expect } from 'vitest';
import { simulateTick } from '../src/engine.js';
import { createInitialState } from '../src/state.js';

describe('simulateTick', () => {
  it('erhöht tick um 1', () => {
    const s = createInitialState();
    const { newState } = simulateTick(s, { type: 'SLEEP', hours: 8 });
    expect(newState.meta.tick).toBe(1);
  });

  it('SLEEP reduziert Schlafmangel', () => {
    const s = createInitialState();
    s.vitals.sleepDebt = 5;
    const { newState } = simulateTick(s, { type: 'SLEEP', hours: 8 });
    expect(newState.vitals.sleepDebt).toBeLessThan(5);
  });

  it('SLEEP stellt Energie wieder her', () => {
    const s = createInitialState();
    s.vitals.energy = 20;
    const { newState } = simulateTick(s, { type: 'SLEEP', hours: 8 });
    expect(newState.vitals.energy).toBeGreaterThan(20);
  });

  it('WORK(HIGH) erhöht Stress', () => {
    const s = createInitialState();
    const { newState } = simulateTick(s, { type: 'WORK', intensity: 'HIGH', hours: 8 });
    expect(newState.vitals.stress).toBeGreaterThan(s.vitals.stress);
  });

  it('EXERCISE verbessert Gesundheit', () => {
    const s = createInitialState();
    const { newState } = simulateTick(s, { type: 'EXERCISE', intensity: 'MED', minutes: 45 });
    expect(newState.vitals.health).toBeGreaterThan(s.vitals.health);
  });

  it('MEDITATE reduziert Stress', () => {
    const s = createInitialState();
    s.vitals.stress = 50;
    const { newState } = simulateTick(s, { type: 'MEDITATE', minutes: 20 });
    expect(newState.vitals.stress).toBeLessThan(50);
  });

  it('Vitals bleiben zwischen 0 und 100', () => {
    let s = createInitialState();
    s.vitals.stress = 99;
    s.vitals.energy = 1;
    for (let i = 0; i < 20; i++) {
      const result = simulateTick(s, { type: 'WORK', intensity: 'HIGH', hours: 10 });
      s = result.newState;
    }
    expect(s.vitals.stress).toBeLessThanOrEqual(100);
    expect(s.vitals.energy).toBeGreaterThanOrEqual(0);
    expect(s.vitals.health).toBeGreaterThanOrEqual(0);
    expect(s.vitals.mood).toBeGreaterThanOrEqual(0);
  });

  it('Audit enthält ruleHits und deltas', () => {
    const s = createInitialState();
    const { audit } = simulateTick(s, { type: 'WORK', intensity: 'HIGH', hours: 8 });
    expect(audit.deltas.length).toBeGreaterThan(0);
    expect(audit.action.type).toBe('WORK');
  });

  it('deterministische Ergebnisse mit fixem Seed', () => {
    const s1 = createInitialState(42);
    const s2 = createInitialState(42);
    const r1 = simulateTick(s1, { type: 'WORK', intensity: 'MED', hours: 6 });
    const r2 = simulateTick(s2, { type: 'WORK', intensity: 'MED', hours: 6 });
    expect(r1.newState.vitals.stress).toBe(r2.newState.vitals.stress);
    expect(r1.newState.vitals.energy).toBe(r2.newState.vitals.energy);
  });

  it('INVEST fügt Asset hinzu', () => {
    const s = createInitialState();
    const { newState } = simulateTick(s, { type: 'INVEST', instrument: 'ETF', amount: 500, risk: 0.3 });
    expect(newState.finance.assets.length).toBe(1);
    expect(newState.finance.cash).toBe(s.finance.cash - 500);
  });

  it('JOB_CHANGE(SAFE) erhöht Gehalt', () => {
    const s = createInitialState();
    const before = s.finance.incomeMonthly;
    const { newState } = simulateTick(s, { type: 'JOB_CHANGE', strategy: 'SAFE' });
    expect(newState.finance.incomeMonthly).toBeGreaterThan(before);
  });

  it('Habit-Streak wird aufgebaut', () => {
    let s = createInitialState();
    for (let i = 0; i < 5; i++) {
      const r = simulateTick(s, { type: 'EXERCISE', intensity: 'LOW', minutes: 30 });
      s = r.newState;
    }
    const exerciseHabit = s.habits.find((h) => h.actionType === 'EXERCISE');
    expect(exerciseHabit).toBeDefined();
    expect(exerciseHabit!.streak).toBeGreaterThan(1);
  });
});

import { describe, it, expect } from 'vitest';
import { simulateTick } from '../src/engine.js';
import { createInitialState } from '../src/state.js';

describe('Threshold Rules', () => {
  it('burnout_warning triggert bei Stress > 80 und sleepDebt > 8', () => {
    const s = createInitialState();
    s.vitals.stress = 85;
    s.vitals.sleepDebt = 10;
    const { events, audit } = simulateTick(s, { type: 'REST', hours: 1 });
    const hasBurnout = events.some((e) => e.explanation.ruleId === 'burnout_warning')
      || audit.ruleHits.includes('burnout_warning');
    expect(hasBurnout).toBe(true);
  });

  it('broke_stress triggert bei cash < 0', () => {
    const s = createInitialState();
    s.finance.cash = -100;
    const { events } = simulateTick(s, { type: 'REST', hours: 1 });
    expect(events.some((e) => e.explanation.ruleId === 'broke_stress')).toBe(true);
  });

  it('Monatliches Gehalt nach 30 Ticks', () => {
    let s = createInitialState();
    const initialCash = s.finance.cash;
    for (let i = 0; i < 30; i++) {
      const r = simulateTick(s, { type: 'SLEEP', hours: 8 });
      s = r.newState;
    }
    // Nach 30 Ticks: Gehalt rein, Kosten raus
    const net = s.finance.incomeMonthly * (1 - s.finance.taxRate) - s.finance.expensesMonthly * s.location.costIndex;
    expect(s.finance.cash).toBeCloseTo(initialCash + net, 0);
  });

  it('Beziehung decayed bei langem kein Kontakt', () => {
    let s = createInitialState();
    const initialCloseness = s.relationships[1].closeness; // Jonas
    s.relationships[1].lastContactTick = 0;
    // Simulate 20 ticks with no contact
    for (let i = 0; i < 20; i++) {
      const r = simulateTick(s, { type: 'WORK', intensity: 'LOW', hours: 4 });
      s = r.newState;
    }
    expect(s.relationships[1].closeness).toBeLessThan(initialCloseness);
  });
});

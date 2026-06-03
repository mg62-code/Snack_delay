import { Rule } from './types.js';
import { GameEvent } from '../types.js';

const TICKS_PER_MONTH = 30;
const TICKS_PER_YEAR = 365;

export const scheduledRules: Rule[] = [
  {
    id: 'salary_payment',
    description: 'Monatliches Nettogehalt (nach Steuern)',
    priority: 200,
    when: (s) => s.meta.tick > 0 && s.meta.tick % TICKS_PER_MONTH === 0,
    apply: (s) => {
      const net = s.finance.incomeMonthly * (1 - s.finance.taxRate);
      return {
        deltas: [{ path: 'finance.cash', delta: net, reason: `salary_net (${net.toFixed(0)}€)` }],
        event: {
          id: `salary_${s.meta.tick}`,
          title: 'Gehalt eingegangen',
          description: `${net.toFixed(0)}€ Nettogehalt (brutto: ${s.finance.incomeMonthly.toFixed(0)}€, Steuer: ${(s.finance.taxRate * 100).toFixed(0)}%)`,
          severity: 'info',
          domain: 'finance',
          effects: [],
          explanation: { ruleId: 'salary_payment', trigger: `tick % ${TICKS_PER_MONTH} === 0` },
        } satisfies GameEvent,
      };
    },
  },
  {
    id: 'expenses_payment',
    description: 'Monatliche Fixkosten',
    priority: 195,
    when: (s) => s.meta.tick > 0 && s.meta.tick % TICKS_PER_MONTH === 0,
    apply: (s) => {
      const adjusted = s.finance.expensesMonthly * s.location.costIndex;
      return {
        deltas: [{ path: 'finance.cash', delta: -adjusted, reason: `expenses (${adjusted.toFixed(0)}€)` }],
        event: {
          id: `expenses_${s.meta.tick}`,
          title: 'Fixkosten abgebucht',
          description: `${adjusted.toFixed(0)}€ Fixkosten (Miete, Versicherung, Lebenshaltung in ${s.location.city})`,
          severity: 'info',
          domain: 'finance',
          effects: [],
          explanation: { ruleId: 'expenses_payment', trigger: `tick % ${TICKS_PER_MONTH} === 0` },
        } satisfies GameEvent,
      };
    },
  },
  {
    id: 'debt_interest',
    description: 'Monatliche Zinsen auf Schulden (1%)',
    priority: 190,
    when: (s) => s.meta.tick > 0 && s.meta.tick % TICKS_PER_MONTH === 0 && s.finance.debt > 0,
    apply: (s) => {
      const interest = s.finance.debt * 0.01;
      return {
        deltas: [{ path: 'finance.debt', delta: interest, reason: `debt_interest (${interest.toFixed(0)}€)` }],
      };
    },
  },
  {
    id: 'asset_appreciation',
    description: 'ETF wächst monatlich ~0.7% (≈ 8%/Jahr)',
    priority: 185,
    when: (s) => s.meta.tick > 0 && s.meta.tick % TICKS_PER_MONTH === 0 && s.finance.assets.some((a) => a.type === 'etf'),
    apply: (s) => {
      // We modify asset values directly here (not via path delta system)
      // Return empty deltas — engine handles assets separately
      const totalEtf = s.finance.assets.filter((a) => a.type === 'etf').reduce((sum, a) => sum + a.value, 0);
      const gain = totalEtf * 0.007;
      // Apply to each ETF proportionally
      s.finance.assets.forEach((a) => {
        if (a.type === 'etf') a.value = Math.round((a.value * 1.007) * 100) / 100;
      });
      return {
        deltas: [{ path: 'emotions.pride', delta: gain > 50 ? 2 : 0, clamp: [0, 100], reason: 'etf_gain' }],
      };
    },
  },
  {
    id: 'age_birthday',
    description: 'Jährlicher Geburtstag — Charakter wird älter',
    priority: 180,
    when: (s) => s.meta.tick > 0 && s.meta.tick % TICKS_PER_YEAR === 0,
    apply: (s) => ({
      deltas: [{ path: 'person.age', delta: 1, reason: 'birthday' }],
      event: {
        id: `birthday_${s.meta.tick}`,
        title: `Geburtstag — Du wirst ${s.person.age + 1}`,
        description: 'Ein weiteres Jahr ist vergangen. Zeit für Reflexion.',
        severity: 'info',
        domain: 'personal',
        effects: [],
        explanation: { ruleId: 'age_birthday', trigger: `tick % ${TICKS_PER_YEAR} === 0` },
      } satisfies GameEvent,
    }),
  },
];

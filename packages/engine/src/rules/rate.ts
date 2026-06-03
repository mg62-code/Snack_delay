import { Rule } from './types.js';

const V: [number, number] = [0, 100];

// Rate/Drift rules — passive regeneration and decay each tick
export const rateRules: Rule[] = [
  {
    id: 'mood_baseline_drift',
    description: 'Stimmung driftet langsam Richtung 50',
    priority: 20,
    when: (s) => s.vitals.mood !== 50,
    apply: (s) => {
      const delta = s.vitals.mood > 50 ? -1 : 1;
      return { deltas: [{ path: 'vitals.mood', delta, clamp: V, reason: 'mood_baseline_drift' }] };
    },
  },
  {
    id: 'health_natural_recovery',
    description: 'Gesundheit erholt sich wenn Energie hoch und Stress niedrig',
    priority: 15,
    when: (s) => s.vitals.health < 100 && s.vitals.energy > 60 && s.vitals.stress < 50,
    apply: () => ({
      deltas: [{ path: 'vitals.health', delta: 1, clamp: V, reason: 'health_natural_recovery' }],
    }),
  },
  {
    id: 'anxiety_dampening',
    description: 'Angst sinkt langsam wenn Stress < 40',
    priority: 18,
    when: (s) => s.emotions.anxiety > 10 && s.vitals.stress < 40,
    apply: () => ({
      deltas: [{ path: 'emotions.anxiety', delta: -2, clamp: V, reason: 'anxiety_dampening' }],
    }),
  },
  {
    id: 'pride_decay',
    description: 'Stolz sinkt langsam ohne Erfolge',
    priority: 10,
    when: (s) => s.emotions.pride > 30,
    apply: () => ({
      deltas: [{ path: 'emotions.pride', delta: -1, clamp: V, reason: 'pride_natural_decay' }],
    }),
  },
  {
    id: 'credit_score_slow_improve',
    description: 'Kreditwürdigkeit verbessert sich langsam wenn cash > 0 und Schulden sinken',
    priority: 10,
    when: (s) => s.finance.cash > 0 && s.finance.creditScore < 850 && s.finance.debt < s.finance.incomeMonthly * 3,
    apply: () => ({
      deltas: [{ path: 'finance.creditScore', delta: 1, clamp: [300, 850], reason: 'credit_slow_improve' }],
    }),
  },
];

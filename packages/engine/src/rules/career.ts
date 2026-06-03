import { Rule } from './types.js';
import { GameEvent } from '../types.js';

const V: [number, number] = [0, 100];

export const careerRules: Rule[] = [
  {
    id: 'layoff_event',
    description: 'Hohe Entlassungsgefahr + Pech → Jobverlust',
    priority: 150,
    cooldown: 30,
    when: (s, _a, rng) => s.career.riskOfLayoff > 80 && rng() < 0.1,
    apply: (s) => ({
      deltas: [
        { path: 'vitals.stress', delta: 25, clamp: V, reason: 'layoff' },
        { path: 'emotions.anxiety', delta: 20, clamp: V, reason: 'layoff' },
        { path: 'vitals.mood', delta: -20, clamp: V, reason: 'layoff' },
        { path: 'finance.incomeMonthly', delta: -s.finance.incomeMonthly, reason: 'layoff (no income)' },
        { path: 'career.riskOfLayoff', delta: -s.career.riskOfLayoff, clamp: V, reason: 'layoff (reset)' },
      ],
      event: {
        id: `layoff_${s.meta.tick}`,
        title: 'Entlassen!',
        description: `${s.career.employer} hat dich entlassen. Dein letzter Tag ist heute.`,
        severity: 'critical',
        domain: 'career',
        effects: [],
        explanation: {
          ruleId: 'layoff_event',
          trigger: `riskOfLayoff=${s.career.riskOfLayoff.toFixed(0)} > 80 && random < 0.1`,
        },
      } satisfies GameEvent,
    }),
  },
  {
    id: 'promotion_chance',
    description: 'Gute Performance alle 90 Ticks → Beförderungs-Chance',
    priority: 60,
    when: (s, _a, rng) =>
      s.meta.tick > 0 && s.meta.tick % 90 === 0 && s.career.performance > 75 && s.career.seniority < 90 && rng() < 0.4,
    apply: (s) => {
      const raise = s.finance.incomeMonthly * 0.08;
      return {
        deltas: [
          { path: 'career.seniority', delta: 5, clamp: V, reason: 'promotion' },
          { path: 'finance.incomeMonthly', delta: raise, reason: `promotion (+${raise.toFixed(0)}€)` },
          { path: 'emotions.pride', delta: 15, clamp: V, reason: 'promotion' },
          { path: 'vitals.mood', delta: 10, clamp: V, reason: 'promotion' },
        ],
        event: {
          id: `promotion_${s.meta.tick}`,
          title: 'Beförderung!',
          description: `Deine Leistung wurde anerkannt. +${raise.toFixed(0)}€/Monat und mehr Verantwortung.`,
          severity: 'info',
          domain: 'career',
          effects: [],
          explanation: {
            ruleId: 'promotion_chance',
            trigger: `performance=${s.career.performance.toFixed(0)} > 75, tick % 90 === 0`,
          },
        } satisfies GameEvent,
      };
    },
  },
  {
    id: 'skill_career_boost',
    description: 'Relevante Skills > 70 → Performance-Boost',
    priority: 40,
    when: (s) => Object.values(s.skills).some((v) => v > 70),
    apply: (s) => {
      const topSkill = Math.max(...Object.values(s.skills));
      const boost = topSkill > 85 ? 2 : 1;
      return {
        deltas: [{ path: 'career.performance', delta: boost, clamp: V, reason: `skill_boost (top=${topSkill.toFixed(0)})` }],
      };
    },
  },
  {
    id: 'months_in_role',
    description: 'Zählt Monate im aktuellen Job',
    priority: 5,
    when: (s) => s.meta.tick > 0 && s.meta.tick % 30 === 0,
    apply: () => ({
      deltas: [{ path: 'career.monthsInRole', delta: 1, reason: 'time_passes' }],
    }),
  },
  {
    id: 'performance_decay_stress',
    description: 'Hoher Stress über Zeit → Performance sinkt',
    priority: 55,
    when: (s) => s.vitals.stress > 70,
    apply: (s) => ({
      deltas: [
        {
          path: 'career.performance',
          delta: -1,
          clamp: V,
          reason: `stress_penalty (stress=${s.vitals.stress.toFixed(0)})`,
        },
      ],
    }),
  },
];

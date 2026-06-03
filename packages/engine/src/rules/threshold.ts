import { Rule } from './types.js';
import { GameEvent } from '../types.js';

const VITALS_CLAMP: [number, number] = [0, 100];

export const thresholdRules: Rule[] = [
  {
    id: 'burnout_warning',
    description: 'Stress > 80 und Schlafmangel > 8h → Burnout-Warnung',
    priority: 100,
    cooldown: 10,
    when: (s) => s.vitals.stress > 80 && s.vitals.sleepDebt > 8,
    apply: (s) => ({
      deltas: [
        { path: 'emotions.anxiety', delta: 8, clamp: VITALS_CLAMP, reason: 'burnout_warning' },
        { path: 'vitals.mood', delta: -5, clamp: VITALS_CLAMP, reason: 'burnout_warning' },
      ],
      event: {
        id: `burnout_warning_${s.meta.tick}`,
        title: 'Burnout-Warnung',
        description:
          'Dein Körper sendet Alarmsignale. Du schläfst schlecht, arbeitest zu viel und dein Geist ist erschöpft.',
        severity: 'warn',
        domain: 'health',
        effects: [],
        explanation: {
          ruleId: 'burnout_warning',
          trigger: `stress=${s.vitals.stress.toFixed(0)} > 80 && sleepDebt=${s.vitals.sleepDebt.toFixed(1)}h > 8h`,
        },
        choices: [
          { label: 'Arzt aufsuchen', action: { type: 'REST', hours: 24 } },
          { label: 'Weitermachen', action: { type: 'WORK', intensity: 'LOW', hours: 4 } },
        ],
      } satisfies GameEvent,
    }),
  },
  {
    id: 'burnout_critical',
    description: 'Stress > 90 und Schlafmangel > 15h → akuter Burnout',
    priority: 110,
    cooldown: 20,
    when: (s) => s.vitals.stress > 90 && s.vitals.sleepDebt > 15,
    apply: (s) => ({
      deltas: [
        { path: 'vitals.health', delta: -10, clamp: VITALS_CLAMP, reason: 'burnout_critical' },
        { path: 'vitals.mood', delta: -15, clamp: VITALS_CLAMP, reason: 'burnout_critical' },
        { path: 'emotions.anxiety', delta: 15, clamp: VITALS_CLAMP, reason: 'burnout_critical' },
        { path: 'career.performance', delta: -10, clamp: VITALS_CLAMP, reason: 'burnout_critical' },
      ],
      event: {
        id: `burnout_critical_${s.meta.tick}`,
        title: 'Akuter Burnout',
        description:
          'Du bist am Limit. Dein Arzt empfiehlt sofortige Auszeit. Weiterzuarbeiten wäre fahrlässig.',
        severity: 'critical',
        domain: 'health',
        effects: [],
        explanation: {
          ruleId: 'burnout_critical',
          trigger: `stress=${s.vitals.stress.toFixed(0)} > 90 && sleepDebt=${s.vitals.sleepDebt.toFixed(1)}h > 15h`,
        },
      } satisfies GameEvent,
    }),
  },
  {
    id: 'low_energy_performance',
    description: 'Energie < 20 → Performance sinkt stark',
    priority: 80,
    when: (s) => s.vitals.energy < 20,
    apply: (s) => ({
      deltas: [
        {
          path: 'career.performance',
          delta: -5,
          clamp: VITALS_CLAMP,
          reason: `low_energy (energy=${s.vitals.energy.toFixed(0)})`,
        },
      ],
      event: {
        id: `low_energy_${s.meta.tick}`,
        title: 'Energiemangel beeinträchtigt Arbeit',
        description: 'Du kannst kaum die Augen offen halten. Deine Leistung leidet deutlich sichtbar.',
        severity: 'warn',
        domain: 'career',
        effects: [],
        explanation: { ruleId: 'low_energy_performance', trigger: `energy=${s.vitals.energy.toFixed(0)} < 20` },
      } satisfies GameEvent,
    }),
  },
  {
    id: 'high_stress_health',
    description: 'Stress > 75 → Gesundheit sinkt langsam',
    priority: 70,
    when: (s) => s.vitals.stress > 75,
    apply: (s) => ({
      deltas: [
        {
          path: 'vitals.health',
          delta: -2,
          clamp: VITALS_CLAMP,
          reason: `chronic_stress (stress=${s.vitals.stress.toFixed(0)})`,
        },
      ],
    }),
  },
  {
    id: 'poor_sleep_mood',
    description: 'Schlafmangel > 10h → Stimmung sinkt',
    priority: 60,
    when: (s) => s.vitals.sleepDebt > 10,
    apply: (s) => ({
      deltas: [
        {
          path: 'vitals.mood',
          delta: -5,
          clamp: VITALS_CLAMP,
          reason: `sleep_debt=${s.vitals.sleepDebt.toFixed(1)}h`,
        },
        {
          path: 'emotions.anxiety',
          delta: 3,
          clamp: VITALS_CLAMP,
          reason: `sleep_debt=${s.vitals.sleepDebt.toFixed(1)}h`,
        },
      ],
    }),
  },
  {
    id: 'broke_stress',
    description: 'Konto im Minus → Stress-Schub',
    priority: 90,
    cooldown: 5,
    when: (s) => s.finance.cash < 0,
    apply: (s) => ({
      deltas: [
        { path: 'vitals.stress', delta: 10, clamp: VITALS_CLAMP, reason: 'negative_cash' },
        { path: 'emotions.anxiety', delta: 12, clamp: VITALS_CLAMP, reason: 'negative_cash' },
      ],
      event: {
        id: `broke_${s.meta.tick}`,
        title: 'Konto im Minus',
        description: `Dein Konto zeigt ${s.finance.cash.toFixed(0)}€. Die finanzielle Unsicherheit setzt dir zu.`,
        severity: 'critical',
        domain: 'finance',
        effects: [],
        explanation: { ruleId: 'broke_stress', trigger: `cash=${s.finance.cash.toFixed(0)} < 0` },
      } satisfies GameEvent,
    }),
  },
  {
    id: 'debt_spiral_warning',
    description: 'Schulden > 6 Monatsgehälter → Kreditwürdigkeits-Warnung',
    priority: 75,
    cooldown: 30,
    when: (s) => s.finance.debt > s.finance.incomeMonthly * 6,
    apply: (s) => ({
      deltas: [
        { path: 'finance.creditScore', delta: -5, clamp: [300, 850], reason: 'high_debt_ratio' },
        { path: 'emotions.anxiety', delta: 5, clamp: VITALS_CLAMP, reason: 'high_debt_ratio' },
      ],
      event: {
        id: `debt_spiral_${s.meta.tick}`,
        title: 'Schulden-Warnung',
        description: `Deine Schulden (${s.finance.debt.toFixed(0)}€) überschreiten das Sechsfache deines Monatseinkommens.`,
        severity: 'warn',
        domain: 'finance',
        effects: [],
        explanation: {
          ruleId: 'debt_spiral_warning',
          trigger: `debt=${s.finance.debt.toFixed(0)} > income*6=${(s.finance.incomeMonthly * 6).toFixed(0)}`,
        },
      } satisfies GameEvent,
    }),
  },
  {
    id: 'high_performance_bonus',
    description: 'Performance > 85 → Ruf steigt',
    priority: 50,
    cooldown: 15,
    when: (s) => s.career.performance > 85,
    apply: (s) => {
      const domain = Object.keys(s.career.reputation)[0] ?? 'general';
      return {
        deltas: [
          {
            path: `career.reputation.${domain}`,
            delta: 2,
            clamp: VITALS_CLAMP,
            reason: `high_performance=${s.career.performance.toFixed(0)}`,
          },
          { path: 'emotions.pride', delta: 5, clamp: VITALS_CLAMP, reason: 'high_performance' },
        ],
      };
    },
  },
  {
    id: 'layoff_risk_warning',
    description: 'Entlassungsrisiko > 70 → Warnung',
    priority: 85,
    cooldown: 20,
    when: (s) => s.career.riskOfLayoff > 70,
    apply: (s) => ({
      deltas: [
        { path: 'vitals.stress', delta: 8, clamp: VITALS_CLAMP, reason: 'high_layoff_risk' },
        { path: 'emotions.anxiety', delta: 10, clamp: VITALS_CLAMP, reason: 'high_layoff_risk' },
      ],
      event: {
        id: `layoff_risk_${s.meta.tick}`,
        title: 'Job in Gefahr',
        description: `Dein Entlassungsrisiko liegt bei ${s.career.riskOfLayoff.toFixed(0)}%. Gerüchte machen die Runde.`,
        severity: 'warn',
        domain: 'career',
        effects: [],
        explanation: {
          ruleId: 'layoff_risk_warning',
          trigger: `riskOfLayoff=${s.career.riskOfLayoff.toFixed(0)} > 70`,
        },
      } satisfies GameEvent,
    }),
  },
  {
    id: 'loneliness_spiral',
    description: 'Einsamkeit > 70 → Stimmung und Angst verschlechtern sich',
    priority: 65,
    when: (s) => s.emotions.loneliness > 70,
    apply: (s) => ({
      deltas: [
        {
          path: 'vitals.mood',
          delta: -3,
          clamp: VITALS_CLAMP,
          reason: `loneliness=${s.emotions.loneliness.toFixed(0)}`,
        },
        {
          path: 'emotions.anxiety',
          delta: 3,
          clamp: VITALS_CLAMP,
          reason: `loneliness=${s.emotions.loneliness.toFixed(0)}`,
        },
      ],
    }),
  },
];

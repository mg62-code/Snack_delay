import { Rule } from './types.js';

const V: [number, number] = [0, 100];

export const socialRules: Rule[] = [
  {
    id: 'relationship_decay',
    description: 'Kein Kontakt > 15 Ticks → Beziehung schwächt sich ab',
    priority: 30,
    when: (s) => s.relationships.some((r) => s.meta.tick - r.lastContactTick > 15),
    apply: (s) => {
      const deltas: Array<{ path: string; delta: number; clamp: [number, number]; reason: string }> = [];
      s.relationships.forEach((r, i) => {
        const gap = s.meta.tick - r.lastContactTick;
        if (gap > 15) {
          deltas.push({
            path: `relationships.${i}.closeness`,
            delta: -2,
            clamp: V,
            reason: `no_contact_${gap}ticks`,
          });
        }
        if (gap > 30) {
          deltas.push({
            path: `relationships.${i}.trust`,
            delta: -1,
            clamp: V,
            reason: `long_absence_${gap}ticks`,
          });
        }
      });
      return { deltas };
    },
  },
  {
    id: 'conflict_stress',
    description: 'Hochkonflikt-Beziehungen erzeugen chronischen Stress',
    priority: 35,
    when: (s) => s.relationships.some((r) => r.conflict > 50),
    apply: (s) => {
      const highConflict = s.relationships.filter((r) => r.conflict > 50);
      const stressDelta = highConflict.length * 2;
      return {
        deltas: [
          {
            path: 'vitals.stress',
            delta: stressDelta,
            clamp: V,
            reason: `conflict_stress (${highConflict.map((r) => r.name).join(', ')})`,
          },
          { path: 'emotions.resentment', delta: 2, clamp: V, reason: 'conflict_relationships' },
        ],
      };
    },
  },
  {
    id: 'strong_relationships_mood',
    description: 'Enge Beziehungen (closeness > 70) heben Stimmung',
    priority: 25,
    when: (s) => s.relationships.some((r) => r.closeness > 70 && r.conflict < 30),
    apply: (s) => {
      const count = s.relationships.filter((r) => r.closeness > 70 && r.conflict < 30).length;
      return {
        deltas: [
          { path: 'vitals.mood', delta: count * 2, clamp: V, reason: 'strong_relationships' },
          { path: 'emotions.loneliness', delta: -3, clamp: V, reason: 'strong_relationships' },
        ],
      };
    },
  },
  {
    id: 'isolation_penalty',
    description: 'Alle Beziehungen schwach → Einsamkeit steigt',
    priority: 40,
    when: (s) => s.relationships.every((r) => r.closeness < 30),
    apply: () => ({
      deltas: [
        { path: 'emotions.loneliness', delta: 5, clamp: V, reason: 'social_isolation' },
        { path: 'vitals.mood', delta: -3, clamp: V, reason: 'social_isolation' },
      ],
    }),
  },
  {
    id: 'resentment_decay',
    description: 'Groll lässt mit der Zeit nach',
    priority: 8,
    when: (s) => s.emotions.resentment > 5 && s.relationships.every((r) => r.conflict < 30),
    apply: () => ({
      deltas: [{ path: 'emotions.resentment', delta: -1, clamp: V, reason: 'resentment_natural_decay' }],
    }),
  },
];

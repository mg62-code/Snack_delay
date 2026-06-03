import { LifeState, AuditDelta } from './types.js';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampVital(v: number): number {
  return clamp(v, 0, 100);
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

// Seeded PRNG (mulberry32) — for deterministic events when seed is set
export function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Apply a numeric delta to a nested path in LifeState.
// Returns the audit delta record.
export function applyPathDelta(
  state: LifeState,
  path: string,
  delta: number,
  reason: string,
  clampRange?: [number, number],
): AuditDelta {
  const parts = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let obj: any = state;
  for (let i = 0; i < parts.length - 1; i++) {
    obj = obj[parts[i]];
  }
  const key = parts[parts.length - 1];
  const before = obj[key] as number;
  let after = before + delta;
  if (clampRange) {
    after = clamp(after, clampRange[0], clampRange[1]);
  }
  obj[key] = round2(after);
  return { path, before, after: round2(after), actualDelta: round2(after - before), reason };
}

// Convenience: apply multiple deltas at once
export function applyDeltas(
  state: LifeState,
  deltas: Array<{ path: string; delta: number; clamp?: [number, number]; reason: string }>,
): AuditDelta[] {
  return deltas.map((d) => applyPathDelta(state, d.path, d.delta, d.reason, d.clamp));
}

// Skill learning with diminishing returns: higher skill → slower gain
export function skillGain(currentLevel: number, rawGain: number): number {
  const factor = 1 - currentLevel / 150; // slows above 67
  return Math.max(0.1, rawGain * factor);
}

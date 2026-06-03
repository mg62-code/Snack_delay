export interface CognitiveProfile {
  lossAversion: number;          // 0.5–2.5, default 1.0
  optimismBias: number;          // 0–1
  hyperbolicDiscounting: number; // 0–1, Kurzfristbelohnung > Zukunft
  sunkCostSensitivity: number;   // 0–1
}

export interface Vitals {
  health: number;    // 0–100
  energy: number;    // 0–100
  stress: number;    // 0–100
  mood: number;      // 0–100
  sleepDebt: number; // hours (unbounded positive)
}

export interface Emotions {
  anxiety: number;   // 0–100
  pride: number;     // 0–100
  loneliness: number; // 0–100
  resentment: number; // 0–100
}

export interface Asset {
  id: string;
  type: 'etf' | 'stock' | 'crypto' | 'real_estate' | 'other';
  value: number;
  purchaseTick: number;
  purchasePrice: number;
}

export interface Finance {
  cash: number;
  incomeMonthly: number;
  expensesMonthly: number;
  debt: number;
  creditScore: number; // 300–850
  assets: Asset[];
  taxRate: number; // 0–1, effective rate
}

export interface CareerState {
  jobTitle: string;
  employer: string;
  seniority: number;    // 0–100
  performance: number;  // 0–100
  riskOfLayoff: number; // 0–100
  monthsInRole: number;
  reputation: Record<string, number>; // domain → 0–100
}

export interface Relationship {
  id: string;
  name: string;
  type: 'family' | 'friend' | 'colleague' | 'romantic';
  closeness: number;      // 0–100
  trust: number;          // 0–100
  conflict: number;       // 0–100
  lastContactTick: number;
}

export interface Habit {
  actionType: string;
  streak: number;
  lastTick: number;
  efficiencyBonus: number; // 0–0.5
}

export interface HistoryEntry {
  eventId: string;
  summary: string;
  tick: number;
  domain: string;
}

export interface LifeState {
  meta: {
    version: string;
    tick: number;
    timestamp: string;
    seed?: number;
  };
  person: {
    age: number;
    education: 'none' | 'highschool' | 'bachelor' | 'master' | 'phd';
    traits: string[];
    cognitiveProfile: CognitiveProfile;
  };
  vitals: Vitals;
  emotions: Emotions;
  finance: Finance;
  career: CareerState;
  skills: Record<string, number>; // 0–100
  habits: Habit[];
  relationships: Relationship[];
  location: {
    country: string;
    city: string;
    costIndex: number;
  };
  inventory: Record<string, number>;
  flags: Record<string, boolean>;
  history: HistoryEntry[];
}

// ── Actions ─────────────────────────────────────────────

export type Intensity = 'LOW' | 'MED' | 'HIGH';
export type InvestmentInstrument = 'ETF' | 'STOCK' | 'CRYPTO';
export type JobStrategy = 'SAFE' | 'BALANCED' | 'AGGRESSIVE';
export type SocializeMode = 'CALL' | 'MEET';
export type EatQuality = 'CHEAP' | 'NORMAL' | 'HEALTHY';

export type Action =
  | { type: 'WORK'; intensity: Intensity; hours: number }
  | { type: 'SLEEP'; hours: number }
  | { type: 'LEARN'; skill: string; hours: number; budget?: number }
  | { type: 'EXERCISE'; intensity: Intensity; minutes: number }
  | { type: 'SOCIALIZE'; targetRelId: string; mode: SocializeMode; hours: number }
  | { type: 'JOB_CHANGE'; strategy: JobStrategy }
  | { type: 'INVEST'; instrument: InvestmentInstrument; amount: number; risk: number }
  | { type: 'REST'; hours: number }
  | { type: 'EAT'; quality: EatQuality }
  | { type: 'MEDITATE'; minutes: number };

// ── Events ──────────────────────────────────────────────

export interface EventEffect {
  path: string;
  delta: number;
  clamp?: [number, number];
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warn' | 'critical';
  domain: 'health' | 'finance' | 'career' | 'social' | 'personal';
  effects: EventEffect[];
  explanation: {
    ruleId: string;
    trigger: string;
  };
  choices?: Array<{ label: string; action: Action }>;
}

// ── Audit ────────────────────────────────────────────────

export interface AuditDelta {
  path: string;
  before: number;
  after: number;
  actualDelta: number;
  reason: string;
}

export interface AuditEntry {
  tick: number;
  action: Action;
  ruleHits: string[];
  deltas: AuditDelta[];
  eventIds: string[];
  timestamp: string;
}

export interface TickResult {
  newState: LifeState;
  events: GameEvent[];
  audit: AuditEntry;
}

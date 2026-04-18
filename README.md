# Interaktive Lebens- & Unternehmenssimulation (Demo-Konzept)

## 1) Produktvision (Zielbild)

Eine interaktive Lebens- und Unternehmenssimulation als **Text+Dashboard-App**, inspiriert von BitLife, aber wesentlich realistischer und systemischer:

- **Keine reine Zufalls-Event-Lotterie**: Events entstehen primär aus Zustand, Schwellenwerten, Kontext und Regeln.
- **Nachvollziehbare Konsequenzen**: Jede Entscheidung wirkt über mehrere Dimensionen (Geld, Zeit, Energie, Stress, Gesundheit, Skills, Beziehungen, Reputation).
- **Auditierbarkeit**: Jede Zustandsänderung ist erklärbar (Regel, Inputs, Deltas).
- **Dynamik statt starrer Menüs**: Aktionen via Buttons **und** Freitext/Kommandos (strukturiert interpretiert).
- **Plugin-/Modul-System**: Jobs, Märkte, Länder/Regionen, Lebensbereiche als Erweiterungen.

## 2) Kernprinzipien (Nicht verhandelbar)

- **State-first**: Alles ist Zustand → Regeln → Konsequenzen.
- **Determinismus bevorzugt**: Gleiche Inputs → gleiche Outputs (Seed optional).
- **Kausalität & Erklärbarkeit**: Jede Änderung hat einen Grund; Log mit Rule-ID + Delta.
- **Zeit kostet**: Jede Aktion hat Dauer + Opportunitätskosten.
- **Trade-offs** statt „Free Lunch“.
- **Erweiterbarkeit** ohne Core-Änderung (Daten + Regeln).
- **Kostenbewusst**: Minimaler Stack, testbar, kein Overengineering.

## 3) Spiel-/Simulationsloop

**Action-driven** statt „Runde würfeln“.

**Step A: Input**
- Button-Aktionen (z. B. *Arbeite*, *Lerne*, *Sport*, *Schlaf*, *Investiere*, *Beziehung pflegen*)
- Freitext (z. B. „ich will job wechseln und 20% gehalt mehr, bin risikoarm“)

**Step B: Interpretation (Action Parsing)**
Freitext → strukturierte Action:
- `intent`
- `intensity` (LOW/MED/HIGH)
- `riskTolerance` (0..1)
- `constraints` (Budget-/Zeitlimit)
- `targets` (Person/Job/Skill)

**Step C: Simulation Tick**
Aktion verbraucht Zeit, verändert Energie/Stress/etc. Danach laufen Regeln:
- Schwellenregeln (z. B. `stress > 80`)
- Kontextregeln (z. B. Montag + Deadline)
- Finanzregeln (Fixkosten, Gehalt)
- Beziehungen (Kontaktfrequenz, Konflikte)

**Step D: Output**
- Dashboard-Update (KPIs)
- Event Feed (1–5 relevante Events)
- Erklärung ("Warum?" → Audit Log)
- Empfehlungen (nächst sinnvolle Aktionen)

## 4) Datenmodell (State)

Zentrales **LifeState**-Objekt (persistierbar als JSON). **Normierte 0–100 Skalen**.

**Pflichtfelder (Minimal):**

```ts
interface LifeState {
  meta: { version: string; tick: number; timestamp: string; seed?: number };
  person: { age: number; education: string; traits?: string[] };
  vitals: { health: number; energy: number; stress: number; mood: number; sleepDebt: number };
  finance: {
    cash: number;
    incomeMonthly: number;
    expensesMonthly: number;
    debt: number;
    creditScore?: number;
    assets: Array<{ type: string; value: number }>;
  };
  career: { jobTitle: string; seniority: number; performance: number; riskOfLayoff: number };
  skills: Record<string, number>;
  relationships: Array<{
    id: string;
    name: string;
    type: string;
    closeness: number;
    trust: number;
    conflict: number;
    lastContact: string;
  }>;
  location: { country: string; city: string; costIndex: number };
  inventory?: Record<string, number>;
  flags: Record<string, boolean>;
  history: Array<{ eventId: string; summary: string; tick: number }>;
}
```

## 5) Actions (DSL)

```ts
type Action =
  | { type: "WORK"; intensity: "LOW" | "MED" | "HIGH"; hours: number }
  | { type: "SLEEP"; hours: number }
  | { type: "LEARN"; skill: string; hours: number; budget?: number }
  | { type: "EXERCISE"; intensity: "LOW" | "MED" | "HIGH"; minutes: number }
  | { type: "SOCIALIZE"; targetRelId: string; mode: "CALL" | "MEET"; hours: number }
  | { type: "JOB_CHANGE"; strategy: "SAFE" | "BALANCED" | "AGGRESSIVE" }
  | { type: "INVEST"; instrument: "ETF" | "STOCK" | "CRYPTO"; amount: number; risk: number };
```

**Ziel**: 10–15 Actions reichen fürs MVP.

## 6) Event-System

Events sind **Regelergebnisse**:

```ts
interface Event {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warn" | "critical";
  domain: "health" | "finance" | "career" | "social";
  effects: Array<{ path: string; delta: number }>;
  explanation: { ruleId: string; trigger: string };
  choices?: Array<{ label: string; action: Action }>;
}
```

**Beispiel**: *Burnout-Warnung*
- Trigger: `stress > 85 && sleepDebt > 10 && workIntensity = HIGH`

## 7) Regel-Engine (Besser als BitLife)

**Regeltypen**
- Threshold Rules
- Rate Rules (Trends/Drift/Regeneration)
- Scheduled Rules (Monatskosten, Gehalt)
- Interaction Rules (Beziehungen)
- Shock Rules (selten, erklärbar, optional Seed)

**Regeln** = Daten + Funktionen
- `ruleId`
- `when(state, action, context) -> boolean`
- `apply(state) -> { deltas, event }`

**Priorisierung**
- `priority`, `cooldown`

## 8) Audit Log & Explainability (Pflichtfeature)

Jeder Tick erzeugt:
- `ActionLog`
- `RuleHits[]`
- `Deltas[]` (vorher/nachher, inkl. Clamping)
- `EventIds[]`

UI: **„Warum ist Stress gestiegen?“**
```
WORK(HIGH, 8h) → Stress +12, Energy -18
RULE: sleepDebt_penalty → Stress +5
RULE: relationship_neglect → conflict +3
```

## 9) UI/UX Anforderungen (MVP)

**Frontend: React + TSX**

Screens:
- Dashboard (Health/Energy/Stress/Mood Bars)
- Finance (Cash, Monthly Net, Debt)
- Career (Job, Performance, Layoff Risk)
- Action Panel (Buttons + Freitext)
- Event Feed (Cards mit Severity/Domain + „Why“)
- History/Logs (Filter: Domain/Severity)
- Export JSON (Debug/Audit)

## 10) Persistenz & Save/Load

- `state.json` lokal
- Mehrere Saves optional
- Autosave pro Tick
- Import/Export

## 11) Erweiterbarkeit (Plugin-Konzept)

Inhalte als Module:

```
/actions/*.ts
/rules/*.ts
/events/*.ts
/content/jobs.json
/content/skills.json
```

Plugin registriert:
- zusätzliche Actions
- neue Rules
- neue Content-Sets

## 12) MVP Umfang (konkret)

**Lieferumfang**
- Core Engine
- 10 Actions
- 25 Regeln
- 50 Event-Templates
- Dashboard + Event Feed + Explain/Logs
- Save/Load
- Deterministisch (Seed optional)

**Nicht im MVP**
- Multiplayer
- komplexe Grafik
- echte Marktpreise live
- KI-Dialoge mit NPCs

## 13) Qualitätsanforderungen (Engineering)

- TypeScript strict
- Unit Tests:
  - 10 Kernregeln
  - Action Parsing
  - deterministische Replays
- Linting/Formatting
- Keine magischen Zahlen ohne Konstanten
- Clamping aller 0–100 Werte

## 14) Deliverables für Code-Agent

**Repo-Struktur (Vorschlag)**
```
/packages
  /engine
  /frontend
```

**Engine**
- `simulateTick(state, action) => { newState, events, audit }`

**UI**
- Dashboard
- Action Panel (Buttons + Text)
- Events + Why

**Content**
- initial skills/jobs/events

**Tests + README**
- Starten
- Erweitern

## 15) Definition of Done

- 30 Minuten Simulation ohne Crash
- Jede Veränderung auditierbar
- Plausible Dynamik bei Zeit/Finanzen/Stress/Health
- Save/Load funktioniert
- Neue Regel ohne Core-Änderung (Plugin-Pattern)

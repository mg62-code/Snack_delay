import { LifeState, Action, TickResult, AuditEntry, GameEvent, AuditDelta } from './types.js';
import { deepClone, makeRng, applyPathDelta } from './utils.js';
import { applyAction } from './actions/index.js';
import { ALL_RULES } from './rules/index.js';

// ── Habit tracking ───────────────────────────────────────

function updateHabits(state: LifeState, action: Action): void {
  const existing = state.habits.find((h) => h.actionType === action.type);

  if (existing) {
    const consecutive = state.meta.tick - existing.lastTick <= 2;
    existing.streak = consecutive ? existing.streak + 1 : 1;
    existing.lastTick = state.meta.tick;
    existing.efficiencyBonus = Math.min(existing.streak / 60, 0.5); // max +50% at streak 30
  } else {
    state.habits.push({
      actionType: action.type,
      streak: 1,
      lastTick: state.meta.tick,
      efficiencyBonus: 0,
    });
  }
}

// ── Rule application ─────────────────────────────────────

function applyRules(
  state: LifeState,
  action: Action,
  audit: AuditEntry,
  rng: () => number,
): GameEvent[] {
  const events: GameEvent[] = [];

  for (const rule of ALL_RULES) {
    // Cooldown check via flags
    if (rule.cooldown) {
      const flagKey = `_cooldown_${rule.id}`;
      const lastTick = (state.flags[flagKey] as unknown as number) ?? -999;
      if (state.meta.tick - lastTick < rule.cooldown) continue;
    }

    if (!rule.when(state, action, rng)) continue;

    audit.ruleHits.push(rule.id);

    const result = rule.apply(state, action, rng);

    // Apply rule deltas to state
    for (const d of result.deltas) {
      const auditDelta = applyPathDelta(state, d.path, d.delta, d.reason, d.clamp);
      audit.deltas.push(auditDelta);
    }

    if (result.event) {
      events.push(result.event);
      // Set cooldown
      if (rule.cooldown) {
        const flagKey = `_cooldown_${rule.id}`;
        (state.flags as Record<string, unknown>)[flagKey] = state.meta.tick;
      }
    }
  }

  return events;
}

// ── Main export ──────────────────────────────────────────

export function simulateTick(state: LifeState, action: Action): TickResult {
  const newState = deepClone(state);
  newState.meta.tick += 1;
  newState.meta.timestamp = new Date().toISOString();

  const rng = newState.meta.seed != null ? makeRng(newState.meta.seed + newState.meta.tick) : Math.random;

  const audit: AuditEntry = {
    tick: newState.meta.tick,
    action,
    ruleHits: [],
    deltas: [] as AuditDelta[],
    eventIds: [],
    timestamp: newState.meta.timestamp,
  };

  // 1. Update habits before applying action
  updateHabits(newState, action);

  // 2. Apply action effects
  const actionDeltas = applyAction(newState, action);
  audit.deltas.push(...actionDeltas);

  // 3. Apply rules → events
  const events = applyRules(newState, action, audit, rng);

  // 4. Apply event effects to state (separate from rule deltas)
  for (const event of events) {
    audit.eventIds.push(event.id);
    newState.history.push({
      eventId: event.id,
      summary: event.title,
      tick: newState.meta.tick,
      domain: event.domain,
    });
    for (const effect of event.effects) {
      const d = applyPathDelta(newState, effect.path, effect.delta, `event:${event.id}`, effect.clamp);
      audit.deltas.push(d);
    }
  }

  // Keep history trimmed to last 100 entries
  if (newState.history.length > 100) {
    newState.history = newState.history.slice(-100);
  }

  return { newState, events, audit };
}

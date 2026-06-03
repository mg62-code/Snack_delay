import { create } from 'zustand';
import { LifeState, Action, GameEvent, AuditEntry } from '@snack/engine';

interface SimStore {
  state: LifeState | null;
  events: GameEvent[];
  auditLog: AuditEntry[];
  isLoading: boolean;
  llmOnline: boolean;
  error: string | null;

  initNew: () => Promise<void>;
  tick: (action: Action) => Promise<void>;
  parseText: (text: string) => Promise<Action | null>;
  save: (slot?: string) => Promise<void>;
  load: (slot?: string) => Promise<void>;
  clearError: () => void;
}

const API = '/api';

export const useSimStore = create<SimStore>((set, get) => ({
  state: null,
  events: [],
  auditLog: [],
  isLoading: false,
  llmOnline: false,
  error: null,

  clearError: () => set({ error: null }),

  initNew: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/state/new`);
      const state: LifeState = await res.json();
      set({ state, events: [], auditLog: [], isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  tick: async (action: Action) => {
    const { state } = get();
    if (!state) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/tick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, action }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: { newState: LifeState; events: GameEvent[]; audit: AuditEntry } = await res.json();
      set((s) => ({
        state: data.newState,
        events: [...data.events, ...s.events].slice(0, 50),
        auditLog: [data.audit, ...s.auditLog].slice(0, 100),
        isLoading: false,
      }));
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  parseText: async (text: string) => {
    const { state } = get();
    if (!state) return null;
    try {
      const res = await fetch(`${API}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, state }),
      });
      if (!res.ok) {
        set({ llmOnline: false });
        return null;
      }
      const { action } = await res.json();
      set({ llmOnline: true });
      return action as Action;
    } catch {
      set({ llmOnline: false });
      return null;
    }
  },

  save: async (slot = 'auto') => {
    const { state } = get();
    if (!state) return;
    await fetch(`${API}/state/${slot}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  },

  load: async (slot = 'auto') => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/state/${slot}`);
      if (!res.ok) throw new Error('Save nicht gefunden');
      const state: LifeState = await res.json();
      set({ state, events: [], auditLog: [], isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },
}));

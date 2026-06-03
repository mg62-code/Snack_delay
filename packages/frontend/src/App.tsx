import { useEffect, useState } from 'react';
import { useSimStore } from './store.js';
import { Dashboard } from './components/Dashboard.js';
import { FinancePanel } from './components/FinancePanel.js';
import { CareerPanel } from './components/CareerPanel.js';
import { ActionPanel } from './components/ActionPanel.js';
import { EventFeed } from './components/EventFeed.js';
import { AuditLog } from './components/AuditLog.js';
import { SkillsPanel } from './components/SkillsPanel.js';

type Tab = 'events' | 'audit' | 'skills';

export default function App() {
  const { state, events, auditLog, isLoading, llmOnline, error, initNew, tick, parseText, save, load, clearError } =
    useSimStore();
  const [activeTab, setActiveTab] = useState<Tab>('events');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    initNew();
  }, []);

  async function handleSave() {
    await save('slot1');
    setSaveMsg('Gespeichert!');
    setTimeout(() => setSaveMsg(''), 2000);
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-2">⚙️</div>
          <p className="text-gray-400">Simulation wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">Life Sim</span>
          <span className="text-xs text-gray-500 font-mono">Tick {state.meta.tick}</span>
          {isLoading && (
            <span className="text-xs text-indigo-400 animate-pulse">Simuliert...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {saveMsg || 'Speichern'}
          </button>
          <button
            onClick={() => load('slot1')}
            className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Laden
          </button>
          <button
            onClick={initNew}
            className="text-xs px-3 py-1.5 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded transition-colors"
          >
            Neu
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-2 flex justify-between items-center">
          <span className="text-sm text-red-300">{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-white text-sm">✕</button>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-57px)]">
        {/* Left: Dashboard + Finance + Career */}
        <aside className="col-span-3 border-r border-border overflow-y-auto p-4 space-y-6">
          <Dashboard state={state} />
          <hr className="border-border" />
          <FinancePanel finance={state.finance} />
          <hr className="border-border" />
          <CareerPanel career={state.career} relationships={state.relationships} />
        </aside>

        {/* Center: Actions */}
        <main className="col-span-4 border-r border-border overflow-y-auto p-4">
          <ActionPanel
            onAction={tick}
            onParseText={parseText}
            llmOnline={llmOnline}
            isLoading={isLoading}
            state={state}
          />
        </main>

        {/* Right: Events / Audit / Skills */}
        <section className="col-span-5 overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-border sticky top-0 bg-surface z-10">
            {(['events', 'audit', 'skills'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'events' ? `Events (${events.length})` : tab === 'audit' ? `Log (${auditLog.length})` : 'Skills'}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'events' && <EventFeed events={events} />}
            {activeTab === 'audit' && <AuditLog auditLog={auditLog} />}
            {activeTab === 'skills' && <SkillsPanel skills={state.skills} />}
          </div>
        </section>
      </div>
    </div>
  );
}

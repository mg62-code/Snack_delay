import { useState } from 'react';
import { Action, LifeState } from '@snack/engine';

interface Props {
  onAction: (action: Action) => void;
  onParseText: (text: string) => Promise<Action | null>;
  llmOnline: boolean;
  isLoading: boolean;
  state: LifeState;
}

const QUICK_ACTIONS: Array<{ label: string; emoji: string; action: Action }> = [
  { label: 'Intensiv arbeiten', emoji: '💼', action: { type: 'WORK', intensity: 'HIGH', hours: 8 } },
  { label: 'Normal arbeiten', emoji: '🖥️', action: { type: 'WORK', intensity: 'MED', hours: 6 } },
  { label: 'Leicht arbeiten', emoji: '📋', action: { type: 'WORK', intensity: 'LOW', hours: 4 } },
  { label: '8h schlafen', emoji: '😴', action: { type: 'SLEEP', hours: 8 } },
  { label: '6h schlafen', emoji: '🛌', action: { type: 'SLEEP', hours: 6 } },
  { label: 'Sport mittel', emoji: '🏃', action: { type: 'EXERCISE', intensity: 'MED', minutes: 45 } },
  { label: 'Meditieren', emoji: '🧘', action: { type: 'MEDITATE', minutes: 20 } },
  { label: 'Ausruhen', emoji: '☕', action: { type: 'REST', hours: 3 } },
  { label: 'Gesund essen', emoji: '🥗', action: { type: 'EAT', quality: 'HEALTHY' } },
  { label: 'Normal essen', emoji: '🍱', action: { type: 'EAT', quality: 'NORMAL' } },
  { label: 'Günstig essen', emoji: '🌮', action: { type: 'EAT', quality: 'CHEAP' } },
  { label: 'Job wechseln (Sicher)', emoji: '🔄', action: { type: 'JOB_CHANGE', strategy: 'SAFE' } },
];

export function ActionPanel({ onAction, onParseText, llmOnline, isLoading, state }: Props) {
  const [text, setText] = useState('');
  const [parsedAction, setParsedAction] = useState<Action | null>(null);
  const [parsing, setParsing] = useState(false);

  async function handleParse() {
    if (!text.trim()) return;
    setParsing(true);
    const action = await onParseText(text);
    setParsedAction(action);
    setParsing(false);
  }

  function handleExecuteParsed() {
    if (parsedAction) {
      onAction(parsedAction);
      setParsedAction(null);
      setText('');
    }
  }

  // Generate socialize actions from relationships
  const socialActions = state.relationships.slice(0, 2).map((r) => ({
    label: `${r.name} treffen`,
    emoji: '👥',
    action: { type: 'SOCIALIZE' as const, targetRelId: r.id, mode: 'MEET' as const, hours: 2 },
  }));

  const allActions = [...QUICK_ACTIONS, ...socialActions];

  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-wider text-gray-500">Aktionen</h3>

      {/* Free text input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            placeholder={llmOnline ? 'Freitext eingeben... (via LM Studio)' : 'LM Studio offline — Quick Actions nutzen'}
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleParse}
            disabled={!text.trim() || parsing || isLoading}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-sm transition-colors"
          >
            {parsing ? '...' : 'Parse'}
          </button>
        </div>

        {parsedAction && (
          <div className="bg-indigo-900/40 border border-indigo-700 rounded p-2 flex justify-between items-center">
            <div className="text-xs text-indigo-300">
              <span className="font-mono">{JSON.stringify(parsedAction)}</span>
            </div>
            <div className="flex gap-2 ml-2 shrink-0">
              <button
                onClick={handleExecuteParsed}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded"
              >
                Ausführen
              </button>
              <button onClick={() => setParsedAction(null)} className="text-gray-500 hover:text-white text-xs">
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${llmOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
          <span className="text-xs text-gray-500">
            LM Studio {llmOnline ? 'online' : 'offline'}
          </span>
        </div>
      </div>

      {/* Quick action grid */}
      <div className="grid grid-cols-2 gap-2">
        {allActions.map((a, i) => (
          <button
            key={i}
            onClick={() => onAction(a.action)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-left px-3 py-2 rounded text-sm text-gray-200 transition-colors"
          >
            <span>{a.emoji}</span>
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

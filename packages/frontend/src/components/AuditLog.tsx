import { AuditEntry } from '@snack/engine';
import { useState } from 'react';

interface Props {
  auditLog: AuditEntry[];
}

export function AuditLog({ auditLog }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (auditLog.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-gray-500">Audit Log</h3>
        <p className="text-xs text-gray-600 text-center py-4">Noch keine Logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500">
        Audit Log ({auditLog.length})
      </h3>
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {auditLog.map((entry, i) => (
          <div
            key={entry.tick}
            className="bg-gray-800 rounded border border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-500">T{entry.tick}</span>
                <span className="font-mono text-xs text-indigo-400 uppercase">
                  {entry.action.type}
                </span>
                {entry.ruleHits.length > 0 && (
                  <span className="text-xs text-gray-500">{entry.ruleHits.length} Regeln</span>
                )}
              </div>
              <span className="text-gray-600 text-xs">{expanded === i ? '▲' : '▼'}</span>
            </button>

            {expanded === i && (
              <div className="px-3 pb-3 space-y-2 border-t border-gray-700">
                {/* Action details */}
                <div className="font-mono text-xs text-gray-400 mt-2">
                  {JSON.stringify(entry.action)}
                </div>

                {/* Rule hits */}
                {entry.ruleHits.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Angewendete Regeln:</div>
                    <div className="flex flex-wrap gap-1">
                      {entry.ruleHits.map((r) => (
                        <span key={r} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deltas */}
                {entry.deltas.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Zustandsänderungen:</div>
                    <div className="space-y-0.5 font-mono text-xs">
                      {entry.deltas
                        .filter((d) => d.actualDelta !== 0)
                        .map((d, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <span className="text-gray-500 truncate">{d.path}</span>
                            <span className="ml-auto shrink-0">
                              <span className="text-gray-400">{d.before.toFixed(1)}</span>
                              <span className="text-gray-600 mx-1">→</span>
                              <span className="text-white">{d.after.toFixed(1)}</span>
                              <span
                                className={`ml-1 ${d.actualDelta > 0 ? 'text-green-400' : 'text-red-400'}`}
                              >
                                ({d.actualDelta > 0 ? '+' : ''}{d.actualDelta.toFixed(1)})
                              </span>
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

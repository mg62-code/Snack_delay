import { GameEvent } from '@snack/engine';

interface Props {
  events: GameEvent[];
}

const SEVERITY_STYLE = {
  info:     'border-blue-700 bg-blue-900/20',
  warn:     'border-yellow-600 bg-yellow-900/20',
  critical: 'border-red-600 bg-red-900/20',
};

const DOMAIN_EMOJI: Record<string, string> = {
  health:   '❤️',
  finance:  '💰',
  career:   '💼',
  social:   '👥',
  personal: '✨',
};

export function EventFeed({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-gray-500">Events</h3>
        <p className="text-xs text-gray-600 text-center py-4">Noch keine Events — führe eine Aktion aus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500">
        Events ({events.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {events.map((event) => (
          <div
            key={event.id}
            className={`border rounded-lg p-3 ${SEVERITY_STYLE[event.severity]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>{DOMAIN_EMOJI[event.domain] ?? '📌'}</span>
                <span className="font-medium text-sm text-white">{event.title}</span>
              </div>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-mono shrink-0 ${
                  event.severity === 'critical'
                    ? 'bg-red-700 text-red-100'
                    : event.severity === 'warn'
                    ? 'bg-yellow-700 text-yellow-100'
                    : 'bg-blue-700 text-blue-100'
                }`}
              >
                {event.severity}
              </span>
            </div>

            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{event.description}</p>

            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                Warum?
              </summary>
              <div className="mt-1 text-xs font-mono text-gray-400 bg-gray-900 rounded p-2">
                <div className="text-gray-500">Regel: {event.explanation.ruleId}</div>
                <div>{event.explanation.trigger}</div>
              </div>
            </details>

            {event.choices && event.choices.length > 0 && (
              <div className="flex gap-2 mt-2">
                {event.choices.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded cursor-pointer hover:bg-gray-600"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

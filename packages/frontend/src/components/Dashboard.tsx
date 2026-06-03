import { LifeState } from '@snack/engine';
import { StatBar } from './StatBar.js';

interface Props {
  state: LifeState;
}

export function Dashboard({ state }: Props) {
  const { vitals, emotions, person } = state;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{person.age} Jahre</h2>
          <p className="text-xs text-gray-500">
            {state.location.city} · Tick {state.meta.tick}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Habits aktiv</div>
          <div className="text-sm font-mono text-indigo-400">{state.habits.length}</div>
        </div>
      </div>

      {/* Vitals */}
      <section>
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Körper & Geist</h3>
        <div className="space-y-2">
          <StatBar label="Gesundheit" value={vitals.health} />
          <StatBar label="Energie" value={vitals.energy} />
          <StatBar label="Stress" value={vitals.stress} inverted />
          <StatBar label="Stimmung" value={vitals.mood} />
          <StatBar
            label="Schlafmangel"
            value={vitals.sleepDebt}
            max={24}
            color={vitals.sleepDebt > 10 ? 'bg-red-500' : vitals.sleepDebt > 5 ? 'bg-yellow-500' : 'bg-blue-500'}
            inverted
          />
        </div>
      </section>

      {/* Emotions */}
      <section>
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Emotionen</h3>
        <div className="space-y-2">
          <StatBar label="Angst" value={emotions.anxiety} inverted color="bg-purple-500" />
          <StatBar label="Stolz" value={emotions.pride} color="bg-amber-500" />
          <StatBar label="Einsamkeit" value={emotions.loneliness} inverted color="bg-blue-400" />
          <StatBar label="Groll" value={emotions.resentment} inverted color="bg-red-400" />
        </div>
      </section>

      {/* Habits */}
      {state.habits.length > 0 && (
        <section>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Aktive Gewohnheiten</h3>
          <div className="space-y-1">
            {state.habits.map((h) => (
              <div key={h.actionType} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{h.actionType}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Streak: {h.streak}</span>
                  <span className="text-green-400">+{(h.efficiencyBonus * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

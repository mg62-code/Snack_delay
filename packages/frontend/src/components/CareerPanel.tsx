import { CareerState, Relationship } from '@snack/engine';
import { StatBar } from './StatBar.js';

interface Props {
  career: CareerState;
  relationships: Relationship[];
}

export function CareerPanel({ career, relationships }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-wider text-gray-500">Karriere & Netzwerk</h3>

      {/* Job info */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="text-white font-medium">{career.jobTitle}</div>
        <div className="text-xs text-gray-500">{career.employer} · {career.monthsInRole} Monate</div>
      </div>

      {/* Career stats */}
      <div className="space-y-2">
        <StatBar label="Seniority" value={career.seniority} color="bg-blue-500" />
        <StatBar label="Performance" value={career.performance} />
        <StatBar label="Entlass-Risiko" value={career.riskOfLayoff} inverted />
      </div>

      {/* Reputation */}
      {Object.keys(career.reputation).length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">Reputation</div>
          <div className="space-y-1">
            {Object.entries(career.reputation).map(([domain, value]) => (
              <StatBar key={domain} label={domain} value={value} color="bg-indigo-400" />
            ))}
          </div>
        </div>
      )}

      {/* Relationships */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Beziehungen</div>
        <div className="space-y-2">
          {relationships.map((r) => (
            <div key={r.id} className="bg-gray-800 rounded p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">{r.name}</span>
                <span className="text-xs text-gray-500 capitalize">{r.type}</span>
              </div>
              <div className="space-y-1">
                <StatBar label="Nähe" value={r.closeness} showValue={false} color="bg-pink-500" />
                <StatBar label="Konflikt" value={r.conflict} showValue={false} inverted color="bg-orange-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

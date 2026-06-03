import { StatBar } from './StatBar.js';

interface Props {
  skills: Record<string, number>;
}

export function SkillsPanel({ skills }: Props) {
  const sorted = Object.entries(skills).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500">Skills</h3>
      <div className="space-y-2">
        {sorted.map(([skill, value]) => (
          <StatBar key={skill} label={skill} value={value} color="bg-cyan-500" />
        ))}
      </div>
    </div>
  );
}

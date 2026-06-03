interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
  inverted?: boolean; // true = high is bad (stress)
}

export function StatBar({ label, value, max = 100, color, showValue = true, inverted = false }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  const autoColor = (() => {
    if (color) return color;
    if (inverted) {
      if (pct > 75) return 'bg-red-500';
      if (pct > 50) return 'bg-yellow-500';
      return 'bg-green-500';
    } else {
      if (pct < 25) return 'bg-red-500';
      if (pct < 50) return 'bg-yellow-500';
      return 'bg-green-500';
    }
  })();

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${autoColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="w-10 text-right text-xs font-mono text-gray-300">{value.toFixed(0)}</span>
      )}
    </div>
  );
}

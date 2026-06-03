import { Finance } from '@snack/engine';

interface Props {
  finance: Finance;
}

function Money({ value, positive = true }: { value: number; positive?: boolean }) {
  const color = value >= 0 ? 'text-green-400' : 'text-red-400';
  return <span className={`font-mono text-sm ${color}`}>{value >= 0 ? '+' : ''}{value.toFixed(0)}€</span>;
}

function CreditBar({ score }: { score: number }) {
  const pct = ((score - 300) / 550) * 100;
  const color = score > 700 ? 'bg-green-500' : score > 580 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-gray-300">{score}</span>
    </div>
  );
}

export function FinancePanel({ finance }: Props) {
  const netMonthly = finance.incomeMonthly * (1 - finance.taxRate) - finance.expensesMonthly;
  const totalAssets = finance.assets.reduce((s, a) => s + a.value, 0);

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-gray-500">Finanzen</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Konto</div>
          <div className={`text-xl font-bold font-mono ${finance.cash < 0 ? 'text-red-400' : 'text-white'}`}>
            {finance.cash.toFixed(0)}€
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Netto/Monat</div>
          <Money value={netMonthly} />
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Schulden</div>
          <div className={`text-sm font-mono ${finance.debt > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {finance.debt.toFixed(0)}€
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Anlagen</div>
          <div className="text-sm font-mono text-blue-400">{totalAssets.toFixed(0)}€</div>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500 mb-1">Kreditwürdigkeit</div>
        <CreditBar score={finance.creditScore} />
      </div>

      {finance.assets.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Portfolio</div>
          <div className="space-y-1">
            {finance.assets.map((a) => {
              const gain = ((a.value - a.purchasePrice) / a.purchasePrice) * 100;
              return (
                <div key={a.id} className="flex justify-between text-xs">
                  <span className="text-gray-400 uppercase">{a.type}</span>
                  <span className="font-mono text-white">{a.value.toFixed(0)}€</span>
                  <span className={gain >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

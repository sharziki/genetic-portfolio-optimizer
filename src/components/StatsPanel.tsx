import { TrendingUp, Shield, Percent, BarChart2, Target, Zap } from 'lucide-react';
import type { Portfolio, Asset } from '../lib/geneticAlgorithm';

interface StatsPanelProps {
  bestPortfolio: Portfolio | null;
  markowitzOptimal: Portfolio | null;
  assets: Asset[];
  currentGeneration: number;
  totalGenerations: number;
  isRunning: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, subValue, icon, color }: StatCardProps) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-[hsl(var(--secondary))] ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatsPanel({
  bestPortfolio,
  markowitzOptimal,
  assets,
  currentGeneration,
  totalGenerations,
  isRunning,
}: StatsPanelProps) {
  if (!bestPortfolio) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Expected Return"
          value="—"
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-[hsl(var(--primary))]"
        />
        <StatCard
          label="Volatility"
          value="—"
          icon={<Shield className="w-5 h-5" />}
          color="text-[hsl(var(--generation))]"
        />
        <StatCard
          label="Sharpe Ratio"
          value="—"
          icon={<Zap className="w-5 h-5" />}
          color="text-[hsl(var(--optimal))]"
        />
        <StatCard
          label="Progress"
          value="—"
          icon={<Target className="w-5 h-5" />}
          color="text-[hsl(var(--muted-foreground))]"
        />
      </div>
    );
  }

  // Find top holdings
  const topHoldings = bestPortfolio.weights
    .map((w, i) => ({ ticker: assets[i].ticker, weight: w }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(h => `${h.ticker} ${(h.weight * 100).toFixed(0)}%`)
    .join(', ');

  // Compare to Markowitz
  const sharpeGap = markowitzOptimal
    ? ((bestPortfolio.sharpeRatio / markowitzOptimal.sharpeRatio) * 100).toFixed(1)
    : '—';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Expected Return"
          value={`${(bestPortfolio.expectedReturn * 100).toFixed(2)}%`}
          subValue="Annualized"
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-[hsl(var(--primary))]"
        />
        <StatCard
          label="Volatility"
          value={`${(bestPortfolio.volatility * 100).toFixed(2)}%`}
          subValue="Std. Deviation"
          icon={<Shield className="w-5 h-5" />}
          color="text-[hsl(var(--generation))]"
        />
        <StatCard
          label="Sharpe Ratio"
          value={bestPortfolio.sharpeRatio.toFixed(3)}
          subValue={markowitzOptimal ? `${sharpeGap}% of optimal` : undefined}
          icon={<Zap className="w-5 h-5" />}
          color="text-[hsl(var(--optimal))]"
        />
        <StatCard
          label="Progress"
          value={`${currentGeneration + 1}/${totalGenerations}`}
          subValue={isRunning ? 'Evolving...' : 'Complete'}
          icon={<Target className="w-5 h-5" />}
          color="text-[hsl(var(--muted-foreground))]"
        />
      </div>

      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">Top Holdings</h3>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{topHoldings}</p>
      </div>

      {markowitzOptimal && (
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Percent className="w-4 h-4 text-[hsl(var(--optimal))]" />
            <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">Markowitz Optimal</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[hsl(var(--muted-foreground))]">Return</p>
              <p className="text-[hsl(var(--foreground))] font-mono">
                {(markowitzOptimal.expectedReturn * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[hsl(var(--muted-foreground))]">Volatility</p>
              <p className="text-[hsl(var(--foreground))] font-mono">
                {(markowitzOptimal.volatility * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[hsl(var(--muted-foreground))]">Sharpe</p>
              <p className="text-[hsl(var(--optimal))] font-mono">
                {markowitzOptimal.sharpeRatio.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

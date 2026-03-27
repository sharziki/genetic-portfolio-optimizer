import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Portfolio, Asset } from '../lib/geneticAlgorithm';

interface WeightsChartProps {
  portfolio: Portfolio | null;
  assets: Asset[];
  title?: string;
}

export function WeightsChart({ portfolio, assets, title = 'Portfolio Allocation' }: WeightsChartProps) {
  if (!portfolio) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">{title}</h2>
        <div className="h-[300px] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
          Run the optimizer to see allocation
        </div>
      </div>
    );
  }

  const data = portfolio.weights.map((weight, i) => ({
    ticker: assets[i].ticker,
    name: assets[i].name,
    weight: weight * 100,
    color: assets[i].color,
  })).sort((a, b) => b.weight - a.weight);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg p-3 shadow-xl">
          <div className="text-xs space-y-1">
            <div className="font-semibold text-[hsl(var(--foreground))]">{data.name}</div>
            <div className="text-[hsl(var(--muted-foreground))]">
              Weight: <span className="text-[hsl(var(--primary))]">{data.weight.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="ticker"
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

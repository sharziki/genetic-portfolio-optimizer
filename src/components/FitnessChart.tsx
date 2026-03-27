import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import type { GenerationStats } from '../lib/geneticAlgorithm';

interface FitnessChartProps {
  generations: GenerationStats[];
  currentGeneration: number;
}

export function FitnessChart({ generations, currentGeneration }: FitnessChartProps) {
  const data = generations.slice(0, currentGeneration + 1).map((g) => ({
    generation: g.generation + 1,
    best: g.bestFitness,
    avg: g.avgFitness,
    worst: g.worstFitness,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg p-3 shadow-xl">
          <div className="text-xs space-y-1">
            <div className="font-semibold text-[hsl(var(--foreground))]">Generation {label}</div>
            {payload.map((p: any) => (
              <div key={p.name} className="text-[hsl(var(--muted-foreground))]">
                {p.name}: <span style={{ color: p.color }}>{p.value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (generations.length === 0) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
          Fitness Evolution
        </h2>
        <div className="h-[250px] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
          Run the optimizer to see fitness evolution
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Fitness Evolution
        </h2>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          Generation <span className="text-[hsl(var(--primary))] font-mono">{currentGeneration + 1}</span> / {generations.length}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="fitnessGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
          <XAxis
            dataKey="generation"
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            label={{
              value: 'Generation',
              position: 'bottom',
              offset: 0,
              fill: 'hsl(215, 20%, 65%)',
              fontSize: 12,
            }}
          />
          <YAxis
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            tickFormatter={(v) => v.toFixed(2)}
            label={{
              value: 'Fitness (Sharpe)',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(215, 20%, 65%)',
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="best"
            name="Best"
            stroke="hsl(142, 71%, 45%)"
            fill="url(#fitnessGradient)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="avg"
            name="Average"
            stroke="hsl(38, 92%, 50%)"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="worst"
            name="Worst"
            stroke="hsl(0, 62%, 50%)"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

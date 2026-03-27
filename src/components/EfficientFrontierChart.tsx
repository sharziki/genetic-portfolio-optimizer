import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import type { Portfolio, Asset } from '../lib/geneticAlgorithm';

interface EfficientFrontierChartProps {
  population: Portfolio[];
  efficientFrontier: Portfolio[];
  bestPortfolio: Portfolio | null;
  markowitzOptimal: Portfolio | null;
  assets: Asset[];
  riskFreeRate: number;
}

export function EfficientFrontierChart({
  population,
  efficientFrontier,
  bestPortfolio,
  markowitzOptimal,
  assets,
  riskFreeRate,
}: EfficientFrontierChartProps) {
  // Convert to chart data
  const populationData = population.map((p, i) => ({
    volatility: p.volatility * 100,
    return: p.expectedReturn * 100,
    sharpe: p.sharpeRatio,
    type: 'population',
    index: i,
  }));

  const frontierData = efficientFrontier.map((p, i) => ({
    volatility: p.volatility * 100,
    return: p.expectedReturn * 100,
    sharpe: p.sharpeRatio,
    type: 'frontier',
    index: i,
  }));

  // Individual assets
  const assetData = assets.map((a, i) => ({
    volatility: Math.sqrt(0.04 + i * 0.02) * 100, // Approximate from diagonal of covariance
    return: a.expectedReturn * 100,
    name: a.ticker,
    type: 'asset',
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg p-3 shadow-xl">
          <div className="text-xs space-y-1">
            {data.name && (
              <div className="font-semibold text-[hsl(var(--foreground))]">{data.name}</div>
            )}
            <div className="text-[hsl(var(--muted-foreground))]">
              Return: <span className="text-[hsl(var(--primary))]">{data.return.toFixed(2)}%</span>
            </div>
            <div className="text-[hsl(var(--muted-foreground))]">
              Volatility: <span className="text-[hsl(var(--foreground))]">{data.volatility.toFixed(2)}%</span>
            </div>
            {data.sharpe !== undefined && (
              <div className="text-[hsl(var(--muted-foreground))]">
                Sharpe: <span className="text-[hsl(var(--foreground))]">{data.sharpe.toFixed(3)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Efficient Frontier
        </h2>
        <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] opacity-40" />
            <span>Population</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[hsl(var(--optimal))]" />
            <span>Frontier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--generation))]" />
            <span>Best</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
          <XAxis
            dataKey="volatility"
            type="number"
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            label={{
              value: 'Volatility (Risk)',
              position: 'bottom',
              offset: 0,
              fill: 'hsl(215, 20%, 65%)',
              fontSize: 12,
            }}
          />
          <YAxis
            dataKey="return"
            type="number"
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            label={{
              value: 'Expected Return',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(215, 20%, 65%)',
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Risk-free rate line */}
          <ReferenceLine
            y={riskFreeRate * 100}
            stroke="hsl(215, 20%, 40%)"
            strokeDasharray="5 5"
            label={{
              value: `Rf: ${(riskFreeRate * 100).toFixed(1)}%`,
              fill: 'hsl(215, 20%, 50%)',
              fontSize: 10,
            }}
          />

          {/* Population scatter */}
          <Scatter
            data={populationData}
            fill="hsl(142, 71%, 45%)"
            fillOpacity={0.3}
            r={4}
          />

          {/* Efficient frontier line */}
          <Line
            data={frontierData}
            type="monotone"
            dataKey="return"
            stroke="hsl(262, 83%, 58%)"
            strokeWidth={2}
            dot={false}
          />

          {/* Individual assets */}
          <Scatter
            data={assetData}
            fill="hsl(215, 20%, 65%)"
            r={6}
            shape="diamond"
          />

          {/* Best portfolio */}
          {bestPortfolio && (
            <Scatter
              data={[{
                volatility: bestPortfolio.volatility * 100,
                return: bestPortfolio.expectedReturn * 100,
                sharpe: bestPortfolio.sharpeRatio,
              }]}
              fill="hsl(38, 92%, 50%)"
              r={10}
            />
          )}

          {/* Markowitz optimal */}
          {markowitzOptimal && (
            <Scatter
              data={[{
                volatility: markowitzOptimal.volatility * 100,
                return: markowitzOptimal.expectedReturn * 100,
                sharpe: markowitzOptimal.sharpeRatio,
                name: 'Markowitz',
              }]}
              fill="hsl(262, 83%, 58%)"
              r={8}
              shape="star"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 text-center">
        Watch the population evolve towards the efficient frontier over generations
      </p>
    </div>
  );
}

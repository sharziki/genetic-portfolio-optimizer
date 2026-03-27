import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Dna, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { InputSlider } from './components/InputSlider';
import { EfficientFrontierChart } from './components/EfficientFrontierChart';
import { WeightsChart } from './components/WeightsChart';
import { FitnessChart } from './components/FitnessChart';
import { StatsPanel } from './components/StatsPanel';
import {
  runGeneticAlgorithm,
  SAMPLE_ASSETS,
  SAMPLE_COVARIANCE,
  DEFAULT_CONFIG,
  type GAConfig,
  type GenerationStats,
  type Portfolio,
} from './lib/geneticAlgorithm';

function App() {
  // Config state
  const [config, setConfig] = useState<GAConfig>(DEFAULT_CONFIG);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Results state
  const [generations, setGenerations] = useState<GenerationStats[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState(-1);
  const [efficientFrontier, setEfficientFrontier] = useState<Portfolio[]>([]);
  const [markowitzOptimal, setMarkowitzOptimal] = useState<Portfolio | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationRef = useRef<number | null>(null);
  const generationsRef = useRef<GenerationStats[]>([]);

  const updateConfig = useCallback((key: keyof GAConfig, value: number | string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const runOptimization = useCallback(() => {
    setIsRunning(true);
    setGenerations([]);
    setCurrentGeneration(-1);
    generationsRef.current = [];

    // Run GA synchronously but store all generations
    const result = runGeneticAlgorithm(
      SAMPLE_ASSETS,
      SAMPLE_COVARIANCE,
      config,
      (stats) => {
        generationsRef.current.push(stats);
      }
    );

    setGenerations(generationsRef.current);
    setEfficientFrontier(result.efficientFrontier);
    setMarkowitzOptimal(result.markowitzOptimal);
    setIsRunning(false);

    // Start animation
    setIsAnimating(true);
    setCurrentGeneration(0);
  }, [config]);

  // Animation loop
  useEffect(() => {
    if (isAnimating && currentGeneration < generations.length - 1) {
      animationRef.current = window.setTimeout(() => {
        setCurrentGeneration((prev) => prev + 1);
      }, 100);
    } else if (currentGeneration >= generations.length - 1) {
      setIsAnimating(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, currentGeneration, generations.length]);

  const toggleAnimation = () => {
    if (generations.length === 0) return;
    setIsAnimating(!isAnimating);
  };

  const reset = () => {
    setIsAnimating(false);
    setCurrentGeneration(0);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const currentStats = generations[currentGeneration];
  const bestPortfolio = currentStats?.bestPortfolio || null;
  const currentPopulation = currentStats?.population || [];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--primary))] bg-opacity-20">
              <Dna className="w-8 h-8 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Genetic Portfolio Optimizer
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Evolution-based Markowitz optimization with real-time visualization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runOptimization}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Optimize'}
            </button>
            {generations.length > 0 && (
              <>
                <button
                  onClick={toggleAnimation}
                  className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <StatsPanel
          bestPortfolio={bestPortfolio}
          markowitzOptimal={markowitzOptimal}
          assets={SAMPLE_ASSETS}
          currentGeneration={currentGeneration}
          totalGenerations={config.generations}
          isRunning={isRunning || isAnimating}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Basic Parameters */}
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  GA Parameters
                </h2>
              </div>

              <InputSlider
                label="Population Size"
                value={config.populationSize}
                onChange={(v) => updateConfig('populationSize', v)}
                min={20}
                max={500}
                step={10}
                tooltip="Number of portfolios in each generation"
                disabled={isRunning}
              />

              <InputSlider
                label="Generations"
                value={config.generations}
                onChange={(v) => updateConfig('generations', v)}
                min={10}
                max={200}
                step={5}
                tooltip="Number of evolution cycles"
                disabled={isRunning}
              />

              <InputSlider
                label="Mutation Rate"
                value={config.mutationRate}
                onChange={(v) => updateConfig('mutationRate', v)}
                min={0.01}
                max={0.5}
                step={0.01}
                unit="%"
                tooltip="Probability of random weight changes"
                disabled={isRunning}
              />

              <InputSlider
                label="Crossover Rate"
                value={config.crossoverRate}
                onChange={(v) => updateConfig('crossoverRate', v)}
                min={0.1}
                max={1}
                step={0.05}
                tooltip="Probability of combining parent portfolios"
                disabled={isRunning}
              />

              <InputSlider
                label="Risk-Free Rate"
                value={config.riskFreeRate * 100}
                onChange={(v) => updateConfig('riskFreeRate', v / 100)}
                min={0}
                max={10}
                step={0.25}
                unit="%"
                tooltip="Annual risk-free rate for Sharpe ratio"
                disabled={isRunning}
              />

              {/* Advanced Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-5 pt-2 border-t border-[hsl(var(--border))]">
                  <InputSlider
                    label="Elitism Count"
                    value={config.elitismCount}
                    onChange={(v) => updateConfig('elitismCount', v)}
                    min={1}
                    max={20}
                    step={1}
                    tooltip="Top portfolios kept each generation"
                    disabled={isRunning}
                  />

                  <InputSlider
                    label="Max Position"
                    value={config.maxPositionSize * 100}
                    onChange={(v) => updateConfig('maxPositionSize', v / 100)}
                    min={10}
                    max={100}
                    step={5}
                    unit="%"
                    tooltip="Maximum allocation to single asset"
                    disabled={isRunning}
                  />

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Fitness Function
                    </label>
                    <select
                      value={config.fitnessFunction}
                      onChange={(e) => updateConfig('fitnessFunction', e.target.value)}
                      disabled={isRunning}
                      className="px-3 py-1.5 text-sm bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    >
                      <option value="sharpe">Sharpe Ratio</option>
                      <option value="sortino">Sortino Ratio</option>
                      <option value="maxReturn">Max Return</option>
                      <option value="minVariance">Min Variance</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Allow Short Selling
                    </label>
                    <button
                      onClick={() => updateConfig('allowShortSelling', !config.allowShortSelling)}
                      disabled={isRunning}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        config.allowShortSelling
                          ? 'bg-[hsl(var(--primary))]'
                          : 'bg-[hsl(var(--secondary))]'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          config.allowShortSelling ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Weights Chart */}
            <WeightsChart
              portfolio={bestPortfolio}
              assets={SAMPLE_ASSETS}
              title="GA Portfolio"
            />
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Efficient Frontier */}
            <EfficientFrontierChart
              population={currentPopulation}
              efficientFrontier={efficientFrontier}
              bestPortfolio={bestPortfolio}
              markowitzOptimal={markowitzOptimal}
              assets={SAMPLE_ASSETS}
              riskFreeRate={config.riskFreeRate}
            />

            {/* Fitness Evolution */}
            <FitnessChart
              generations={generations}
              currentGeneration={currentGeneration}
            />

            {/* Markowitz Comparison */}
            {markowitzOptimal && (
              <WeightsChart
                portfolio={markowitzOptimal}
                assets={SAMPLE_ASSETS}
                title="Markowitz Optimal"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[hsl(var(--muted-foreground))] pt-4">
          <p>
            Using {SAMPLE_ASSETS.length} sample assets with historical covariance estimates.
            The GA evolves portfolios to maximize the selected fitness function.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

// Genetic Algorithm for Portfolio Optimization

export interface Asset {
  name: string;
  ticker: string;
  expectedReturn: number; // Annualized
  color: string;
}

export interface Portfolio {
  weights: number[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  fitness: number;
}

export interface GAConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  fitnessFunction: 'sharpe' | 'sortino' | 'maxReturn' | 'minVariance';
  riskFreeRate: number;
  allowShortSelling: boolean;
  maxPositionSize: number;
}

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
  bestPortfolio: Portfolio;
  population: Portfolio[];
}

export interface GAResult {
  bestPortfolio: Portfolio;
  generations: GenerationStats[];
  efficientFrontier: Portfolio[];
  markowitzOptimal: Portfolio;
}

// Sample assets with realistic data
export const SAMPLE_ASSETS: Asset[] = [
  { name: 'Apple', ticker: 'AAPL', expectedReturn: 0.25, color: '#3b82f6' },
  { name: 'Microsoft', ticker: 'MSFT', expectedReturn: 0.22, color: '#10b981' },
  { name: 'Amazon', ticker: 'AMZN', expectedReturn: 0.28, color: '#f59e0b' },
  { name: 'Google', ticker: 'GOOGL', expectedReturn: 0.20, color: '#ef4444' },
  { name: 'Tesla', ticker: 'TSLA', expectedReturn: 0.35, color: '#8b5cf6' },
  { name: 'NVIDIA', ticker: 'NVDA', expectedReturn: 0.40, color: '#06b6d4' },
  { name: 'JP Morgan', ticker: 'JPM', expectedReturn: 0.12, color: '#ec4899' },
  { name: 'Johnson & Johnson', ticker: 'JNJ', expectedReturn: 0.08, color: '#84cc16' },
];

// Sample covariance matrix (realistic correlations)
export const SAMPLE_COVARIANCE: number[][] = [
  [0.0625, 0.0300, 0.0280, 0.0320, 0.0400, 0.0420, 0.0180, 0.0100],
  [0.0300, 0.0529, 0.0260, 0.0300, 0.0350, 0.0380, 0.0200, 0.0120],
  [0.0280, 0.0260, 0.0676, 0.0300, 0.0420, 0.0450, 0.0150, 0.0080],
  [0.0320, 0.0300, 0.0300, 0.0576, 0.0380, 0.0400, 0.0170, 0.0090],
  [0.0400, 0.0350, 0.0420, 0.0380, 0.1225, 0.0800, 0.0220, 0.0050],
  [0.0420, 0.0380, 0.0450, 0.0400, 0.0800, 0.1600, 0.0180, 0.0040],
  [0.0180, 0.0200, 0.0150, 0.0170, 0.0220, 0.0180, 0.0400, 0.0150],
  [0.0100, 0.0120, 0.0080, 0.0090, 0.0050, 0.0040, 0.0150, 0.0256],
];

// Calculate portfolio return
export function portfolioReturn(weights: number[], assets: Asset[]): number {
  return weights.reduce((sum, w, i) => sum + w * assets[i].expectedReturn, 0);
}

// Calculate portfolio volatility (standard deviation)
export function portfolioVolatility(weights: number[], covariance: number[][]): number {
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      variance += weights[i] * weights[j] * covariance[i][j];
    }
  }
  return Math.sqrt(variance);
}

// Calculate Sharpe ratio
export function sharpeRatio(ret: number, vol: number, riskFreeRate: number): number {
  if (vol === 0) return 0;
  return (ret - riskFreeRate) / vol;
}

// Calculate Sortino ratio (using downside deviation)
export function sortinoRatio(ret: number, vol: number, riskFreeRate: number): number {
  // Simplified: assume downside deviation is ~70% of total vol for this demo
  const downsideVol = vol * 0.7;
  if (downsideVol === 0) return 0;
  return (ret - riskFreeRate) / downsideVol;
}

// Normalize weights to sum to 1
function normalizeWeights(weights: number[], allowShort: boolean): number[] {
  if (!allowShort) {
    // Make all weights positive first
    weights = weights.map(w => Math.max(0, w));
  }
  const sum = weights.reduce((a, b) => a + Math.abs(b), 0);
  if (sum === 0) return weights.map(() => 1 / weights.length);
  return weights.map(w => w / sum);
}

// Apply position size constraints
function applyConstraints(weights: number[], maxPosition: number, allowShort: boolean): number[] {
  let result = [...weights];

  // Apply max position constraint
  result = result.map(w => Math.min(Math.max(allowShort ? -maxPosition : 0, w), maxPosition));

  // Re-normalize
  return normalizeWeights(result, allowShort);
}

// Create a random portfolio
function createRandomPortfolio(
  numAssets: number,
  assets: Asset[],
  covariance: number[][],
  config: GAConfig
): Portfolio {
  let weights = Array(numAssets).fill(0).map(() => Math.random());
  weights = applyConstraints(weights, config.maxPositionSize, config.allowShortSelling);

  const ret = portfolioReturn(weights, assets);
  const vol = portfolioVolatility(weights, covariance);
  const sr = sharpeRatio(ret, vol, config.riskFreeRate);

  let fitness: number;
  switch (config.fitnessFunction) {
    case 'sharpe':
      fitness = sr;
      break;
    case 'sortino':
      fitness = sortinoRatio(ret, vol, config.riskFreeRate);
      break;
    case 'maxReturn':
      fitness = ret;
      break;
    case 'minVariance':
      fitness = -vol; // Negative because we maximize fitness
      break;
    default:
      fitness = sr;
  }

  return { weights, expectedReturn: ret, volatility: vol, sharpeRatio: sr, fitness };
}

// Tournament selection
function tournamentSelect(population: Portfolio[], tournamentSize: number = 3): Portfolio {
  let best: Portfolio | null = null;
  for (let i = 0; i < tournamentSize; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (!best || candidate.fitness > best.fitness) {
      best = candidate;
    }
  }
  return best!;
}

// Blend crossover
function crossover(parent1: Portfolio, parent2: Portfolio, config: GAConfig): number[] {
  if (Math.random() > config.crossoverRate) {
    return [...parent1.weights];
  }

  const alpha = Math.random();
  return parent1.weights.map((w, i) => alpha * w + (1 - alpha) * parent2.weights[i]);
}

// Mutation
function mutate(weights: number[], config: GAConfig): number[] {
  return weights.map(w => {
    if (Math.random() < config.mutationRate) {
      // Add Gaussian noise
      const noise = (Math.random() - 0.5) * 0.2;
      return w + noise;
    }
    return w;
  });
}

// Run one generation
function evolveGeneration(
  population: Portfolio[],
  assets: Asset[],
  covariance: number[][],
  config: GAConfig
): Portfolio[] {
  // Sort by fitness (descending)
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);

  const newPopulation: Portfolio[] = [];

  // Elitism: keep best individuals
  for (let i = 0; i < config.elitismCount && i < sorted.length; i++) {
    newPopulation.push(sorted[i]);
  }

  // Generate rest through selection, crossover, mutation
  while (newPopulation.length < config.populationSize) {
    const parent1 = tournamentSelect(population);
    const parent2 = tournamentSelect(population);

    let childWeights = crossover(parent1, parent2, config);
    childWeights = mutate(childWeights, config);
    childWeights = applyConstraints(childWeights, config.maxPositionSize, config.allowShortSelling);

    const ret = portfolioReturn(childWeights, assets);
    const vol = portfolioVolatility(childWeights, covariance);
    const sr = sharpeRatio(ret, vol, config.riskFreeRate);

    let fitness: number;
    switch (config.fitnessFunction) {
      case 'sharpe':
        fitness = sr;
        break;
      case 'sortino':
        fitness = sortinoRatio(ret, vol, config.riskFreeRate);
        break;
      case 'maxReturn':
        fitness = ret;
        break;
      case 'minVariance':
        fitness = -vol;
        break;
      default:
        fitness = sr;
    }

    newPopulation.push({
      weights: childWeights,
      expectedReturn: ret,
      volatility: vol,
      sharpeRatio: sr,
      fitness,
    });
  }

  return newPopulation;
}

// Calculate efficient frontier using Markowitz (analytical)
export function calculateEfficientFrontier(
  assets: Asset[],
  covariance: number[][],
  numPoints: number = 50,
  riskFreeRate: number = 0.02
): Portfolio[] {
  const frontier: Portfolio[] = [];

  // Simple approach: vary target return and find min variance portfolio
  const minReturn = Math.min(...assets.map(a => a.expectedReturn));
  const maxReturn = Math.max(...assets.map(a => a.expectedReturn));

  for (let i = 0; i < numPoints; i++) {
    const targetReturn = minReturn + (maxReturn - minReturn) * (i / (numPoints - 1));

    // Use gradient descent to find minimum variance for this return
    let weights = assets.map(() => 1 / assets.length);
    const lr = 0.01;

    for (let iter = 0; iter < 1000; iter++) {
      const ret = portfolioReturn(weights, assets);

      // Gradient of variance + penalty for return constraint
      const returnPenalty = 10 * (ret - targetReturn);

      for (let j = 0; j < weights.length; j++) {
        let gradient = 0;
        for (let k = 0; k < weights.length; k++) {
          gradient += 2 * weights[k] * covariance[j][k];
        }
        gradient += returnPenalty * assets[j].expectedReturn;
        weights[j] -= lr * gradient;
      }

      // Normalize and enforce constraints
      weights = normalizeWeights(weights, false);
    }

    const ret = portfolioReturn(weights, assets);
    const vol = portfolioVolatility(weights, covariance);
    const sr = sharpeRatio(ret, vol, riskFreeRate);

    frontier.push({
      weights,
      expectedReturn: ret,
      volatility: vol,
      sharpeRatio: sr,
      fitness: sr,
    });
  }

  return frontier;
}

// Find Markowitz optimal portfolio (max Sharpe)
export function findMarkowitzOptimal(
  assets: Asset[],
  covariance: number[][],
  riskFreeRate: number = 0.02
): Portfolio {
  const frontier = calculateEfficientFrontier(assets, covariance, 100, riskFreeRate);
  return frontier.reduce((best, p) => p.sharpeRatio > best.sharpeRatio ? p : best, frontier[0]);
}

// Main GA function
export function runGeneticAlgorithm(
  assets: Asset[],
  covariance: number[][],
  config: GAConfig,
  onGeneration?: (stats: GenerationStats) => void
): GAResult {
  const numAssets = assets.length;
  const generations: GenerationStats[] = [];

  // Initialize population
  let population: Portfolio[] = [];
  for (let i = 0; i < config.populationSize; i++) {
    population.push(createRandomPortfolio(numAssets, assets, covariance, config));
  }

  // Evolution loop
  for (let gen = 0; gen < config.generations; gen++) {
    population = evolveGeneration(population, assets, covariance, config);

    // Calculate stats
    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    const fitnesses = population.map(p => p.fitness);

    const stats: GenerationStats = {
      generation: gen,
      bestFitness: sorted[0].fitness,
      avgFitness: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
      worstFitness: sorted[sorted.length - 1].fitness,
      bestPortfolio: sorted[0],
      population: [...population],
    };

    generations.push(stats);

    if (onGeneration) {
      onGeneration(stats);
    }
  }

  const bestPortfolio = generations[generations.length - 1].bestPortfolio;
  const efficientFrontier = calculateEfficientFrontier(assets, covariance, 50, config.riskFreeRate);
  const markowitzOptimal = findMarkowitzOptimal(assets, covariance, config.riskFreeRate);

  return {
    bestPortfolio,
    generations,
    efficientFrontier,
    markowitzOptimal,
  };
}

// Default config
export const DEFAULT_CONFIG: GAConfig = {
  populationSize: 100,
  generations: 50,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  elitismCount: 5,
  fitnessFunction: 'sharpe',
  riskFreeRate: 0.02,
  allowShortSelling: false,
  maxPositionSize: 0.4,
};

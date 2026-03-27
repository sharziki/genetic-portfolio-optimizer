# Genetic Portfolio Optimizer

An interactive portfolio optimization tool that uses genetic algorithms to find optimal asset allocations. Watch the evolution unfold in real-time as populations converge toward the efficient frontier.

## Features

- **Genetic Algorithm Optimization**: Uses tournament selection, blend crossover, and Gaussian mutation to evolve portfolios
- **Real-time Visualization**: Watch the population evolve toward optimal solutions across the risk-return space
- **Efficient Frontier**: Calculated using gradient descent and compared against GA solutions
- **Multiple Fitness Functions**: Optimize for Sharpe ratio, Sortino ratio, maximum return, or minimum variance
- **Configurable Parameters**: Tune population size, generations, mutation rate, crossover rate, and more
- **Portfolio Constraints**: Set maximum position sizes and toggle short selling

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Recharts for data visualization
- Lucide React icons

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How It Works

### Genetic Algorithm

1. **Initialization**: Creates a random population of portfolios with different weight allocations
2. **Selection**: Tournament selection picks parent portfolios based on fitness
3. **Crossover**: Blend crossover combines parent weights to create offspring
4. **Mutation**: Gaussian noise is applied to weights with a configurable probability
5. **Elitism**: Top performers are preserved across generations
6. **Constraints**: Weights are normalized and position limits are enforced

### Fitness Functions

- **Sharpe Ratio**: (Return - Risk-Free Rate) / Volatility
- **Sortino Ratio**: Uses downside deviation instead of total volatility
- **Max Return**: Optimize purely for expected return
- **Min Variance**: Find the lowest volatility portfolio

### Markowitz Comparison

The tool also calculates the theoretical Markowitz optimal portfolio using gradient descent, allowing you to compare how close the GA solution gets to the analytical optimum.

## Sample Assets

The demo includes 8 sample assets with realistic expected returns and a covariance matrix:
- AAPL, MSFT, AMZN, GOOGL (Tech)
- TSLA, NVDA (High Growth)
- JPM (Financials)
- JNJ (Healthcare/Defensive)

## License

MIT

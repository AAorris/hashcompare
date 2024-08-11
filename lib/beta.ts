import { pdf, mode, quantile } from '@stdlib/stats-base-dists-beta';

export type Result = 0 | 1;

/** [alpha, beta] where alpha is the count of success */
export type BetaDistribution = [number, number];

export type Experiment<K extends string = string> = {
  name: string;
  init?: Record<K, BetaDistribution>;
  data?: Record<K, BetaDistribution>;
};


export function probabilityDensity(
  [alpha, beta]: BetaDistribution,
  /** 0-1 */
  x: number
) {
  return pdf(x, alpha, beta);
}

/** The probability where density is the highest (0-1) */
export function highestProbability([alpha, beta]: BetaDistribution) {
  return mode(alpha, beta);
}

/** The density value at the highest probability location */
export function highestDensity(distribution: BetaDistribution) {
  return probabilityDensity(distribution, highestProbability(distribution));
}

/** The low and high probabilities for a given confidence percentage (0-100) */
export function probabilityBounds(
  [alpha, beta]: BetaDistribution,
  /** 0-100 */
  confidencePercentage: number
) {
  const k = confidencePercentage / 100;
  return {
    high: quantile(1 - k, alpha, beta),
    low: quantile(k, alpha, beta),
  };
}

/** Given some probability distribution and confidence percentage,
 * produce a low and high value for X containing that % of the distribution area,
 * as well as a low and high value for Y containing the low and high probability density
 */
export function probabilityArea(
  distribution: BetaDistribution,
  confidencePercentage: number
) {
  const bounds = probabilityBounds(distribution, confidencePercentage);
  const mode = highestDensity(distribution);
  return {
    x1: bounds.low,
    x2: bounds.high,
    y1: 0,
    y2: mode,
  };
}

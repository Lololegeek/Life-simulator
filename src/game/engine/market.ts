import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';
import seedrandom from 'seedrandom';
import type { Character } from '../types';
import { STOCKS } from '../data/catalog';
import { chance, normal } from '../rng';

const noiseCache = new Map<string, NoiseFunction2D>();

function noiseFor(seed: string) {
  let n = noiseCache.get(seed);
  if (!n) {
    n = createNoise2D(seedrandom(`market-${seed}`));
    noiseCache.set(seed, n);
  }
  return n;
}

/**
 * Advance the stock market by one year. Prices follow a drift plus smooth
 * simplex-noise cycles (bull / bear markets) and a little white noise.
 */
export function stepMarket(c: Character) {
  const noise = noiseFor(c.seed);
  const m = c.market;
  m.tick += 1;
  const crisis = chance(0.04) ? -0.35 : 0;
  STOCKS.forEach((s, i) => {
    const cycle = noise(m.tick * 0.35, i * 7.3);
    const r = s.drift + s.volatility * (0.75 * cycle + 0.35 * normal(0, 1)) + crisis * (0.5 + s.volatility);
    const next = Math.max(0.05, m.prices[s.symbol] * (1 + Math.max(-0.9, r)));
    m.prices[s.symbol] = Math.round(next * 100) / 100;
    const h = m.history[s.symbol];
    h.push(m.prices[s.symbol]);
    if (h.length > 40) h.shift();
  });
  return crisis < 0;
}

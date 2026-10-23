import seedrandom from 'seedrandom';
import { randomNormal } from 'd3-random';
import { nanoid } from 'nanoid';

type PRNG = seedrandom.StatefulPRNG<seedrandom.State.Arc4>;

let prng: PRNG = seedrandom(nanoid(), { state: true });

/** (Re)initialise the global generator. All randomness of a life flows through it, so a seed replays a life. */
export function initRng(seed: string, state?: object) {
  prng = state ? seedrandom('', { state: state as seedrandom.State.Arc4 }) : seedrandom(seed, { state: true });
}

export function rngState(): object {
  return prng.state();
}

export const random = () => prng();

export const int = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

export const float = (min: number, max: number) => random() * (max - min) + min;

export const chance = (p: number) => random() < p;

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

export function weighted<T>(items: readonly T[], weight: (item: T) => number): T {
  const total = items.reduce((s, i) => s + Math.max(0, weight(i)), 0);
  let roll = random() * total;
  for (const item of items) {
    roll -= Math.max(0, weight(item));
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function normal(mu: number, sigma: number) {
  return randomNormal.source(random)(mu, sigma)();
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const newSeed = () => nanoid(10);

import { describe, expect, it } from 'vitest';
import { initRng } from '../rng';
import { ensureLocale } from '../names';
import { getCountry } from '../data/countries';
import { createCharacter, randomCountry } from './create';
import { ageUp } from './ageUp';
import { resolveChoice, doActivity, applyJob, jobOptions, enroll, ACTIVITIES, commitCrime, buyStock, interact } from './actions';
import { checkAchievements } from './achievements';
import { computeRibbon, summarize } from './death';
import { netWorth } from './helpers';
import { MAJORS } from '../data/education';
import { CRIMES } from '../data/health';
import { int, pick } from '../rng';

async function playLife(seed: string, active = true) {
  initRng(seed);
  const code = randomCountry();
  await ensureLocale(getCountry(code).locale);
  const c = createCharacter({ seed, countryCode: code });
  let guard = 0;
  while (c.alive && guard++ < 150) {
    while (c.pending.length) resolveChoice(c, int(0, c.pending[0].choices.length - 1));
    if (active) {
      doActivity(c, pick(ACTIVITIES).id);
      if (c.age >= 18 && !c.education.enrolled && c.education.highest === 'secondary') enroll(c, pick(MAJORS).id);
      if (c.age >= 18 && !c.career) {
        const open = jobOptions(c).filter((o) => !o.locked);
        if (open.length) applyJob(c, pick(open).job.id);
      }
      if (c.age % 13 === 0) commitCrime(c, pick(CRIMES).id);
      if (c.age >= 25 && c.money > 1000) buyStock(c, 'MNDE', Math.round(c.money * 0.1));
      const r = c.relations.find((x) => x.alive);
      if (r) interact(c, r.id, 'time');
    }
    ageUp(c);
    checkAchievements(c);
  }
  return c;
}

describe('life engine', () => {
  it('creates a coherent newborn', async () => {
    initRng('newborn');
    const c = createCharacter({ seed: 'newborn', countryCode: 'FR' });
    expect(c.age).toBe(0);
    expect(c.relations.some((r) => r.relation === 'mother')).toBe(true);
    expect(c.log[0].text).toContain('France');
  });

  it('is deterministic for a given seed', async () => {
    const a = await playLife('same-seed');
    const b = await playLife('same-seed');
    expect(a.age).toBe(b.age);
    expect(a.causeOfDeath).toBe(b.causeOfDeath);
    expect(netWorth(a)).toBe(netWorth(b));
  });

  it('simulates many full lives without crashing and with plausible lifespans', async () => {
    const ages: number[] = [];
    for (let i = 0; i < 120; i++) {
      const c = await playLife(`life-${i}`, i % 2 === 0);
      expect(c.alive).toBe(false);
      expect(Number.isFinite(netWorth(c))).toBe(true);
      for (const v of Object.values(c.stats)) expect(v).toBeGreaterThanOrEqual(0);
      expect(computeRibbon(c).label).toBeTruthy();
      expect(summarize(c).age).toBe(c.age);
      ages.push(c.age);
    }
    const mean = ages.reduce((s, a) => s + a, 0) / ages.length;
    console.log('mean lifespan', mean.toFixed(1), 'min', Math.min(...ages), 'max', Math.max(...ages));
    expect(mean).toBeGreaterThan(50);
    expect(mean).toBeLessThan(95);
  });
});

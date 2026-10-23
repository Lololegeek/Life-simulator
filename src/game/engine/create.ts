import { clamp } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { Character, Gender, Market, Person, RelationKind } from '../types';
import { COUNTRIES, getCountry, wealthFactor } from '../data/countries';
import { NPC_JOBS } from '../data/jobs';
import { STOCKS } from '../data/catalog';
import { chance, int, normal, pick, weighted } from '../rng';
import { firstName, lastName } from '../names';
import { log } from './helpers';

export interface NewLifeOptions {
  seed: string;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  countryCode?: string;
  generation?: number;
  inheritance?: number;
  /** When continuing as a child, the people the child already knows */
  family?: Person[];
}

export const stat = (mu = 50, sigma = 20) => clamp(Math.round(normal(mu, sigma)), 0, 100);

export function randomCountry() {
  return weighted(COUNTRIES, (c) => c.population).code;
}

export function makePerson(
  locale: string,
  relation: RelationKind,
  opts: { gender?: Gender; age: number; lastName?: string; countryCode?: string },
): Person {
  const gender = opts.gender ?? (chance(0.5) ? 'M' : 'F');
  const wealth = opts.countryCode ? wealthFactor(opts.countryCode) : 0.5;
  return {
    id: nanoid(8),
    firstName: firstName(locale, gender),
    lastName: opts.lastName ?? lastName(locale),
    gender,
    age: opts.age,
    relation,
    closeness: clamp(int(40, 95), 0, 100),
    alive: true,
    looks: stat(),
    smarts: stat(),
    money: Math.round(Math.max(0, normal(40000, 30000)) * wealth),
    job: opts.age >= 20 && chance(0.85) ? pick(NPC_JOBS) : undefined,
  };
}

export function initMarket(): Market {
  const prices: Record<string, number> = {};
  const history: Record<string, number[]> = {};
  for (const s of STOCKS) {
    prices[s.symbol] = s.start;
    history[s.symbol] = [s.start];
  }
  return { prices, history, tick: int(0, 1000) };
}

export function createCharacter(o: NewLifeOptions): Character {
  const countryCode = o.countryCode ?? randomCountry();
  const country = getCountry(countryCode);
  const gender: Gender = o.gender ?? (chance(0.5) ? 'M' : 'F');
  const family = o.lastName ?? lastName(country.locale);
  const city = pick(country.cities);

  const c: Character = {
    id: nanoid(10),
    seed: o.seed,
    generation: o.generation ?? 1,
    firstName: o.firstName?.trim() || firstName(country.locale, gender),
    lastName: family,
    gender,
    countryCode,
    birthCountry: countryCode,
    city,
    birthYear: new Date().getFullYear(),
    age: 0,
    alive: true,
    causeOfDeath: null,
    stats: {
      health: clamp(stat(78, 14), 30, 100),
      happiness: stat(75, 15),
      smarts: stat(),
      looks: stat(),
      fitness: stat(45, 15),
    },
    karma: 50,
    fame: 0,
    money: o.inheritance ?? 0,
    debt: 0,
    education: { enrolled: null, highest: 'none', major: null, yearsLeft: 0, performance: 50, degrees: [], droppedOut: false },
    career: null,
    retired: false,
    pension: 0,
    jobHistory: [],
    relations: [],
    assets: [],
    holdings: {},
    market: initMarket(),
    diseases: [],
    prison: null,
    criminalRecord: [],
    log: [],
    history: [],
    pending: [],
    flags: {},
    actionsThisYear: {},
    lifeAchievements: [],
    maxNetWorth: 0,
    lotteryWins: 0,
    countriesLived: [countryCode],
  };

  if (o.family?.length) {
    c.relations = o.family;
  } else {
    const momAge = int(18, 42);
    const mom = makePerson(country.locale, 'mother', { gender: 'F', age: momAge, countryCode, lastName: chance(0.7) ? family : undefined });
    const dad = makePerson(country.locale, 'father', { gender: 'M', age: clamp(momAge + int(-3, 8), 18, 60), countryCode, lastName: family });
    c.relations.push(mom);
    if (chance(0.88)) c.relations.push(dad);
    const siblings = weighted([0, 1, 2, 3, 4], (n) => [3, 4, 2.5, 1, 0.4][n] * (country.gdp < 5000 && n > 1 ? 2 : 1));
    for (let i = 0; i < siblings; i++) {
      const age = int(1, Math.max(1, Math.min(momAge - 17, 15)));
      c.relations.push(makePerson(country.locale, 'sibling', { age, lastName: family, countryCode }));
    }
  }

  const parentsLine = c.relations
    .filter((r) => r.relation === 'mother' || r.relation === 'father')
    .map((p) => `${p.relation === 'mother' ? 'ta mère' : 'ton père'} ${p.firstName} (${p.age} ans${p.job ? `, ${p.job.toLowerCase()}` : ''})`)
    .join(' et ');

  log(
    c,
    `Tu es ${gender === 'F' ? 'née' : 'né'} ${gender === 'F' ? 'fille' : 'garçon'} à ${city}, ${country.nameFr}. Tu es le fruit de ${parentsLine || 'parents inconnus'}.`,
    'special',
    '👶',
  );
  if (o.inheritance) log(c, `Tu hérites de la fortune familiale.`, 'good', '💰');
  c.history.push({ age: 0, ...c.stats, netWorth: c.money });
  return c;
}

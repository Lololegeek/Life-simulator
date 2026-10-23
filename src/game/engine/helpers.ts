import { clamp, sumBy } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { Character, LogEntry, Person, StatKey } from '../types';
import { wealthFactor } from '../data/countries';
import { getJob, jobTitle } from '../data/jobs';

export function log(c: Character, text: string, tone: LogEntry['tone'] = 'neutral', icon?: string) {
  c.log.push({ id: nanoid(8), age: c.age, text, tone, icon });
  if (c.log.length > 1500) c.log.splice(0, c.log.length - 1500);
}

export function adjust(c: Character, stat: StatKey, delta: number) {
  c.stats[stat] = clamp(Math.round(c.stats[stat] + delta), 0, 100);
}

export function adjustMany(c: Character, deltas: Partial<Record<StatKey, number>>) {
  for (const [k, v] of Object.entries(deltas)) adjust(c, k as StatKey, v ?? 0);
}

export function karma(c: Character, delta: number) {
  c.karma = clamp(c.karma + delta, 0, 100);
}

export function fame(c: Character, delta: number) {
  c.fame = clamp(Math.round(c.fame + delta), 0, 100);
}

export const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`;

/** Scale a US price into the current country's purchasing power. */
export const local = (c: Character, usd: number) => Math.round(usd * wealthFactor(c.countryCode));

export function netWorth(c: Character) {
  const holdings = sumBy(Object.entries(c.holdings), ([s, n]) => n * (c.market.prices[s] ?? 0));
  return Math.round(c.money + sumBy(c.assets, 'value') + holdings - c.debt);
}

export const living = (c: Character) => c.relations.filter((r) => r.alive);

export const partner = (c: Character): Person | undefined =>
  c.relations.find((r) => r.alive && (r.relation === 'partner' || r.relation === 'spouse'));

export const children = (c: Character) => c.relations.filter((r) => r.relation === 'child');

export const parents = (c: Character) =>
  c.relations.filter((r) => r.relation === 'mother' || r.relation === 'father');

export function currentTitle(c: Character) {
  if (c.prison) return 'Détenu';
  if (c.career) return jobTitle(c.career.jobId, c.career.level);
  if (c.retired) return 'Retraité';
  if (c.education.enrolled) {
    const e = c.education.enrolled;
    if (e === 'primary') return 'Écolier';
    if (e === 'secondary') return 'Lycéen';
    return 'Étudiant';
  }
  if (c.age < 3) return 'Bébé';
  if (c.age < 6) return 'Enfant';
  return 'Sans emploi';
}

export function relationLabel(p: Person) {
  const f = p.gender === 'F';
  switch (p.relation) {
    case 'father':
      return 'Père';
    case 'mother':
      return 'Mère';
    case 'sibling':
      return f ? 'Sœur' : 'Frère';
    case 'friend':
      return f ? 'Amie' : 'Ami';
    case 'partner':
      return f ? 'Petite amie' : 'Petit ami';
    case 'spouse':
      return f ? 'Épouse' : 'Époux';
    case 'ex':
      return f ? 'Ex-compagne' : 'Ex-compagnon';
    case 'child':
      return f ? 'Fille' : 'Fils';
    case 'pet':
      return p.species ?? 'Animal';
  }
}

/** Track repeated actions within the same year. Returns how many times it was already done. */
export function countAction(c: Character, key: string) {
  const n = c.actionsThisYear[key] ?? 0;
  c.actionsThisYear[key] = n + 1;
  return n;
}

export const jobName = (c: Character) => (c.career ? jobTitle(c.career.jobId, c.career.level) : null);

export const isFamous = (c: Character) => c.fame >= 50;

export function salaryOf(c: Character) {
  if (!c.career) return 0;
  return c.career.salary;
}

export function baseSalary(c: Character, jobId: string, level: number) {
  const j = getJob(jobId)!;
  return local(c, j.salary * Math.pow(j.growth, level));
}

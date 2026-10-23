import type { Character, LifeSummary } from '../types';
import { children, fullName, jobName, log, netWorth } from './helpers';
import { eduRank } from '../data/education';

export function die(c: Character, cause: string) {
  if (!c.alive) return;
  c.alive = false;
  c.causeOfDeath = cause;
  c.pending = [];
  log(c, `Tu es mort·e ${cause}, à l’âge de ${c.age} ans.`, 'bad', '⚰️');
}

export interface Ribbon {
  id: string;
  label: string;
  icon: string;
  description: string;
}

/** A one-word verdict on a whole life, like the ribbons of BitLife. */
export function computeRibbon(c: Character): Ribbon {
  const nw = netWorth(c);
  const kids = children(c).length;
  const r = (id: string, label: string, icon: string, description: string) => ({ id, label, icon, description });
  if (c.age < 12) return r('fleeting', 'Éphémère', '🕊️', 'Une vie bien trop courte.');
  if (c.criminalRecord.length >= 4) return r('outlaw', 'Hors-la-loi', '🦹', 'Tu as passé ta vie à défier la loi.');
  if (nw >= 50_000_000) return r('mogul', 'Magnat', '🤑', 'Une fortune colossale.');
  if (c.fame >= 80) return r('icon', 'Icône', '🌟', 'Le monde entier connaissait ton nom.');
  if (c.karma >= 90) return r('saint', 'Saint·e', '😇', 'Une bonté exemplaire.');
  if (c.karma <= 10) return r('wicked', 'Malveillant·e', '😈', 'Le monde respire mieux sans toi.');
  if (c.education.highest === 'doctorate' && c.stats.smarts > 80) return r('scholar', 'Érudit·e', '📚', 'Une vie dédiée au savoir.');
  if (kids >= 5) return r('fertile', 'Patriarche', '👨‍👩‍👧‍👦', 'Une descendance nombreuse.');
  if (nw >= 1_000_000) return r('rich', 'Riche', '💰', 'Tu as fini à l’abri du besoin.');
  if (c.age >= 95) return r('elder', 'Increvable', '🐢', 'Tu as survécu à tout le monde.');
  if (c.countriesLived.length >= 3) return r('nomad', 'Nomade', '🧭', 'Tu as fait du monde ta maison.');
  if (c.stats.happiness >= 80) return r('happy', 'Épanoui·e', '😊', 'Une vie remplie de bonheur.');
  if (c.stats.happiness <= 20) return r('miserable', 'Malheureux·se', '😢', 'La vie ne t’a pas fait de cadeaux.');
  if (c.flags.married && !c.flags.divorced) return r('romantic', 'Romantique', '💞', 'L’amour d’une vie.');
  if (c.stats.fitness >= 85) return r('athletic', 'Sportif·ve', '🏅', 'Un corps d’athlète jusqu’au bout.');
  if (eduRank(c.education.highest) <= 1 && nw < 5000) return r('humble', 'Modeste', '🌾', 'Une vie simple et sans éclat.');
  return r('average', 'Ordinaire', '🙂', 'Une vie comme 8 milliards d’autres. Et c’est déjà beaucoup.');
}

export function summarize(c: Character): LifeSummary {
  return {
    id: c.id,
    name: fullName(c),
    gender: c.gender,
    countryCode: c.birthCountry,
    birthYear: c.birthYear,
    age: c.age,
    cause: c.causeOfDeath ?? '',
    netWorth: netWorth(c),
    ribbon: computeRibbon(c).id,
    job: jobName(c) ?? c.jobHistory.at(-1)?.title ?? null,
    children: children(c).length,
    achievements: c.lifeAchievements,
    diedAt: Date.now(),
    generation: c.generation,
  };
}

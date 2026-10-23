import { clamp } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { ActionResult, Character, EduLevel, Person } from '../types';
import { getCountry, wealthFactor } from '../data/countries';
import { CRIMES, getDisease } from '../data/health';
import { EDU_LABEL, EDU_YEARS, eduRank, getMajor } from '../data/education';
import { getJob, JOBS, jobTitle, type Job } from '../data/jobs';
import { getItem } from '../data/catalog';
import { getEvent } from '../data/events';
import { chance, float, int, pick } from '../rng';
import { money } from '@/lib/format';
import { petName } from '../names';
import { makePerson } from './create';
import { adjust, children, countAction, fame, karma, local, log, partner, relationLabel } from './helpers';
import { endCareer } from './ageUp';
import { die } from './death';

const ok = (text: string, icon?: string): ActionResult => ({ text, tone: 'good', icon });
const ko = (text: string, icon?: string): ActionResult => ({ text, tone: 'bad', icon });
const nt = (text: string, icon?: string): ActionResult => ({ text, tone: 'neutral', icon });

function record(c: Character, r: ActionResult): ActionResult {
  if (r) log(c, r.text, r.tone ?? 'neutral', r.icon);
  return r;
}

const tired = (c: Character, key: string, max = 3) => countAction(c, key) >= max;

// ───────────────────────────── Activities ─────────────────────────────

export interface Activity {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'Corps & esprit' | 'Loisirs' | 'Santé' | 'Amour & famille' | 'Argent' | 'Prison';
  minAge: number;
  cost?: (c: Character) => number;
  prison?: boolean;
  available?: (c: Character) => boolean;
  run: (c: Character) => ActionResult;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'gym', name: 'Salle de sport', icon: '🏋️', description: 'Forme +, santé +', category: 'Corps & esprit', minAge: 12,
    cost: (c) => (c.age >= 18 ? local(c, 300) : 0),
    run: (c) => {
      if (tired(c, 'gym')) return nt('Tes muscles réclament du repos. Reviens l’année prochaine.', '😮‍💨');
      adjust(c, 'fitness', int(3, 7)); adjust(c, 'health', int(1, 3)); adjust(c, 'looks', chance(0.4) ? 1 : 0);
      return ok(pick(['Belle séance de musculation !', 'Tu as battu ton record au développé couché.', 'Cours de crossfit intense.']), '🏋️');
    },
  },
  {
    id: 'run', name: 'Courir', icon: '🏃', description: 'Gratuit, bon pour le cœur', category: 'Corps & esprit', minAge: 8,
    run: (c) => {
      if (tired(c, 'run')) return nt('Tu as déjà couru des kilomètres cette année.', '👟');
      adjust(c, 'fitness', int(2, 4)); adjust(c, 'health', int(1, 3)); adjust(c, 'happiness', 2);
      if (chance(0.04)) { adjust(c, 'health', -6); return ko('Tu t’es tordu la cheville en courant.', '🦶'); }
      return ok('Un footing revigorant au lever du soleil.', '🏃');
    },
  },
  {
    id: 'meditate', name: 'Méditer', icon: '🧘', description: 'Bonheur +, stress −', category: 'Corps & esprit', minAge: 10,
    prison: true,
    run: (c) => {
      if (tired(c, 'meditate')) return nt('Ton esprit est déjà parfaitement zen.', '🧘');
      adjust(c, 'happiness', int(3, 7)); adjust(c, 'health', 1); karma(c, 1);
      return ok('Tu as médité une heure. Tu te sens apaisé·e.', '🧘');
    },
  },
  {
    id: 'library', name: 'Bibliothèque', icon: '📚', description: 'Intelligence +', category: 'Corps & esprit', minAge: 6,
    run: (c) => {
      if (tired(c, 'library')) return nt('Tu as lu tous les livres intéressants cette année.', '📚');
      adjust(c, 'smarts', int(2, 5));
      if (c.education.enrolled) c.education.performance = clamp(c.education.performance + 3, 0, 100);
      return ok(`Tu as lu « ${pick(['Les Misérables', 'Sapiens', 'Le Petit Prince', 'Une brève histoire du temps', '1984', 'L’Étranger', 'Dune'])} ».`, '📖');
    },
  },
  {
    id: 'volunteer', name: 'Bénévolat', icon: '🤲', description: 'Karma +, bonheur +', category: 'Corps & esprit', minAge: 12,
    run: (c) => {
      if (tired(c, 'volunteer', 2)) return nt('Tu as déjà beaucoup donné de ton temps.', '🤲');
      karma(c, int(4, 8)); adjust(c, 'happiness', 3);
      return ok(`Tu as été bénévole ${pick(['dans une soupe populaire', 'dans un refuge pour animaux', 'auprès de personnes âgées', 'pour nettoyer une plage'])}.`, '🤲');
    },
  },
  {
    id: 'doctor', name: 'Médecin', icon: '🩺', description: 'Soigner tes maladies', category: 'Santé', minAge: 0,
    cost: (c) => local(c, c.diseases.length ? 900 : 150),
    run: (c) => {
      if (tired(c, 'doctor', 2)) return nt('Le médecin t’a déjà vu·e deux fois cette année.', '🩺');
      const quality = clamp(0.55 + wealthFactor(c.countryCode) * 0.5, 0, 1);
      if (!c.diseases.length) { adjust(c, 'health', int(1, 4)); return ok('Bilan de santé : tout va bien !', '🩺'); }
      const cured: string[] = [];
      c.diseases = c.diseases.filter((d) => {
        const info = getDisease(d.id);
        if (chance(info.curable * quality)) { cured.push(info.name.toLowerCase()); return false; }
        return true;
      });
      if (cured.length) { adjust(c, 'health', int(5, 12)); return ok(`Le traitement a fonctionné : guéri·e de ${cured.join(', ')}.`, '💊'); }
      adjust(c, 'health', 2);
      return ko('Le traitement n’a pas encore donné de résultat.', '💊');
    },
  },
  {
    id: 'surgery', name: 'Chirurgie esthétique', icon: '💉', description: 'Apparence + (risqué)', category: 'Santé', minAge: 18,
    cost: (c) => local(c, 9000),
    run: (c) => {
      if (tired(c, 'surgery', 1)) return nt('Le chirurgien refuse une deuxième opération cette année.', '💉');
      if (chance(0.15)) { adjust(c, 'looks', -int(10, 25)); adjust(c, 'happiness', -10); return ko('L’opération a mal tourné. Ton visage est méconnaissable…', '😱'); }
      adjust(c, 'looks', int(8, 18)); adjust(c, 'happiness', 6);
      return ok(`Ta ${pick(['rhinoplastie', 'liposuccion', 'greffe de cheveux', 'chirurgie des paupières'])} est une réussite !`, '✨');
    },
  },
  {
    id: 'vacation', name: 'Vacances', icon: '🏖️', description: 'Bonheur ++', category: 'Loisirs', minAge: 18,
    cost: (c) => local(c, 3500),
    run: (c) => {
      if (tired(c, 'vacation', 2)) return nt('Assez de vacances pour cette année !', '🧳');
      adjust(c, 'happiness', int(10, 18)); adjust(c, 'health', 2);
      if (chance(0.06)) { adjust(c, 'health', -10); return ko('Tu as attrapé une intoxication alimentaire en voyage.', '🤢'); }
      return ok(`Superbes vacances ${pick(['à Bali', 'en Islande', 'à Rome', 'au Japon', 'en Patagonie', 'aux Maldives', 'à New York'])} !`, '🏝️');
    },
  },
  {
    id: 'club', name: 'Sortir en boîte', icon: '🪩', description: 'Bonheur +, rencontres', category: 'Loisirs', minAge: 16,
    cost: (c) => local(c, 80),
    run: (c) => {
      if (tired(c, 'club')) return nt('Tu es épuisé·e de faire la fête.', '🥱');
      adjust(c, 'happiness', int(3, 8)); adjust(c, 'health', -int(0, 3));
      if (chance(0.25)) {
        const f = makePerson(getCountry(c.countryCode).locale, 'friend', { age: c.age + int(-3, 3), countryCode: c.countryCode });
        c.relations.push(f);
        return ok(`Nuit folle ! Tu t’es fait un nouvel ami : ${f.firstName}.`, '🪩');
      }
      return ok('Tu as dansé jusqu’à l’aube.', '🪩');
    },
  },
  {
    id: 'dating', name: 'Application de rencontre', icon: '💘', description: 'Trouver l’amour', category: 'Amour & famille', minAge: 16,
    available: (c) => !partner(c),
    run: (c) => {
      if (tired(c, 'dating')) return nt('Tu as swipé jusqu’à en avoir mal au pouce.', '📱');
      const p = c.stats.looks / 140 + c.stats.happiness / 400 + (c.money > local(c, 50000) ? 0.1 : 0);
      if (!chance(clamp(p, 0.1, 0.9))) { adjust(c, 'happiness', -3); return ko(pick(['Aucun match cette fois.', 'Ton rencard ne s’est jamais présenté.', 'Rendez-vous catastrophique : il·elle a parlé de son ex pendant 3 heures.']), '💔'); }
      const g = c.gender === 'M' ? (chance(0.92) ? 'F' : 'M') : chance(0.92) ? 'M' : 'F';
      const date = makePerson(getCountry(c.countryCode).locale, 'partner', { gender: g, age: clamp(c.age + int(-4, 4), 16, 99), countryCode: c.countryCode });
      date.together = 0; date.closeness = int(55, 80);
      c.relations.push(date);
      adjust(c, 'happiness', 10);
      return ok(`Tu sors maintenant avec ${date.firstName} ${date.lastName}${date.job ? `, ${date.job.toLowerCase()}` : ''} (${date.age} ans) !`, '💕');
    },
  },
  {
    id: 'baby', name: 'Avoir un enfant', icon: '👶', description: 'Agrandir la famille', category: 'Amour & famille', minAge: 18,
    available: (c) => !!partner(c) && c.age <= 55,
    run: (c) => {
      if (tired(c, 'baby', 1)) return nt('Patience… essayez à nouveau l’année prochaine.', '⏳');
      const p = partner(c)!;
      const fertile = chance(clamp(0.7 - Math.max(0, Math.max(c.age, p.age) - 32) * 0.04, 0.05, 0.75));
      if (!fertile) return ko('Pas de bébé cette année.', '🍼');
      const kid = makePerson(getCountry(c.countryCode).locale, 'child', { age: 0, lastName: c.lastName, countryCode: c.countryCode });
      kid.closeness = 95; kid.looks = Math.round((c.stats.looks + p.looks) / 2 + int(-10, 10)); kid.smarts = Math.round((c.stats.smarts + p.smarts) / 2 + int(-10, 10)); kid.money = 0;
      c.relations.push(kid);
      p.closeness = clamp(p.closeness + 10, 0, 100);
      adjust(c, 'happiness', 15);
      return { text: `Bienvenue au monde, ${kid.firstName} ! ${kid.gender === 'F' ? 'Une petite fille' : 'Un petit garçon'} plein de vie.`, tone: 'special', icon: '👶' };
    },
  },
  {
    id: 'pet', name: 'Adopter un animal', icon: '🐾', description: 'Un compagnon fidèle', category: 'Amour & famille', minAge: 8,
    cost: (c) => local(c, 250),
    run: (c) => {
      if (tired(c, 'pet', 1)) return nt('Un animal par an, c’est déjà bien !', '🐾');
      const species = pick(['Chien', 'Chat', 'Lapin', 'Perroquet', 'Hamster', 'Tortue']);
      const pet = makePerson('en', 'pet', { age: int(0, 3) });
      pet.firstName = petName(); pet.lastName = ''; pet.species = species; pet.closeness = 85; pet.money = 0; pet.job = undefined;
      c.relations.push(pet);
      adjust(c, 'happiness', 8);
      return ok(`Tu as adopté ${pet.firstName} (${species.toLowerCase()}) au refuge.`, '🐾');
    },
  },
  {
    id: 'lottery', name: 'Loterie', icon: '🎟️', description: 'Une chance sur un million…', category: 'Argent', minAge: 18,
    cost: (c) => local(c, 10),
    run: (c) => {
      if (tired(c, 'lottery', 5)) return nt('Tu as déjà joué 5 fois cette année.', '🎟️');
      const roll = float(0, 1);
      if (roll < 1 / 4000) { const w = local(c, 25_000_000); c.money += w; c.lotteryWins += 1; fame(c, 15); return { text: `JACKPOT !!! Tu remportes ${money(w)} !`, tone: 'special', icon: '🎰' }; }
      if (roll < 0.01) { const w = local(c, 2000); c.money += w; return ok(`Tu gagnes ${money(w)} !`, '🎟️'); }
      if (roll < 0.12) { const w = local(c, 20); c.money += w; return ok(`Tu gagnes ${money(w)}. Remboursé·e !`, '🎟️'); }
      return ko('Perdu !', '🎟️');
    },
  },
  // Prison
  {
    id: 'good_behavior', name: 'Bonne conduite', icon: '😇', description: 'Réduire ta peine', category: 'Prison', minAge: 0, prison: true,
    available: (c) => !!c.prison,
    run: (c) => {
      if (tired(c, 'good', 1)) return nt('Les gardiens ont déjà noté ta bonne conduite.', '📋');
      karma(c, 2);
      if (c.prison && c.prison.yearsLeft > 1 && chance(0.35)) { c.prison.yearsLeft -= 1; return ok('Ta peine est réduite d’un an pour bonne conduite.', '📋'); }
      return nt('Les gardiens apprécient ton comportement.', '📋');
    },
  },
  {
    id: 'prison_gym', name: 'Musculation en cellule', icon: '💪', description: 'Forme +', category: 'Prison', minAge: 0, prison: true,
    available: (c) => !!c.prison,
    run: (c) => {
      if (tired(c, 'pgym')) return nt('Tes pompes ont usé le sol de ta cellule.', '💪');
      adjust(c, 'fitness', int(3, 6));
      return ok('Pompes, tractions, abdos. La routine du détenu.', '💪');
    },
  },
  {
    id: 'escape', name: 'Tenter une évasion', icon: '🪜', description: 'Très risqué', category: 'Prison', minAge: 0, prison: true,
    available: (c) => !!c.prison,
    run: (c) => {
      if (tired(c, 'escape', 1)) return nt('Les gardiens te surveillent de près cette année.', '👀');
      const p = 0.12 + c.stats.smarts / 600 + c.stats.fitness / 600;
      if (chance(p)) { c.prison = null; c.flags.escaped = true; karma(c, -5); return { text: 'Tu t’es évadé·e par les égouts ! Te voilà libre… et recherché·e.', tone: 'special', icon: '🏃' }; }
      if (chance(0.04)) { die(c, 'abattu·e lors d’une tentative d’évasion'); return null; }
      if (c.prison) { c.prison.yearsLeft += int(1, 3); c.prison.total += 1; }
      adjust(c, 'health', -10);
      return ko('Évasion ratée ! Les chiens t’ont rattrapé·e. Ta peine est alourdie.', '🚨');
    },
  },
];

export function activityCost(c: Character, a: Activity) {
  return a.cost?.(c) ?? 0;
}

export function activityLocked(c: Character, a: Activity): string | null {
  if (!c.alive) return 'Mort·e';
  if (c.age < a.minAge) return `Dès ${a.minAge} ans`;
  if (c.prison && !a.prison) return 'En prison';
  if (!c.prison && a.category === 'Prison') return 'Réservé à la prison';
  if (a.available && !a.available(c)) return 'Indisponible';
  const cost = activityCost(c, a);
  if (cost > 0 && c.money < cost && c.age >= 18) return 'Trop cher';
  return null;
}

export function doActivity(c: Character, id: string) {
  const a = ACTIVITIES.find((x) => x.id === id);
  if (!a || activityLocked(c, a)) return null;
  const cost = activityCost(c, a);
  if (cost > 0) {
    if (c.age < 18) {
      const parent = c.relations.find((r) => (r.relation === 'mother' || r.relation === 'father') && r.alive);
      if (parent) parent.money -= cost;
    } else c.money -= cost;
  }
  return record(c, a.run(c));
}

// ───────────────────────────── Casino ─────────────────────────────

export function casino(c: Character, game: 'roulette' | 'blackjack' | 'slots', bet: number) {
  if (c.age < 18 || c.prison || bet <= 0 || bet > c.money) return null;
  if (tired(c, 'casino', 6)) return record(c, nt('Le casino t’a demandé de faire une pause.', '🎰'));
  c.money -= bet;
  let gain = 0;
  if (game === 'roulette') gain = chance(18 / 37) ? bet * 2 : 0;
  if (game === 'blackjack') gain = chance(0.49 + c.stats.smarts / 2000) ? bet * 2 : chance(0.08) ? bet : 0;
  if (game === 'slots') { const r = float(0, 1); gain = r < 0.005 ? bet * 50 : r < 0.05 ? bet * 5 : r < 0.25 ? bet * 1.5 : 0; }
  gain = Math.round(gain);
  c.money += gain;
  const label = { roulette: 'roulette', blackjack: 'blackjack', slots: 'machine à sous' }[game];
  if (gain > bet) { adjust(c, 'happiness', 4); return record(c, ok(`${label[0].toUpperCase()}${label.slice(1)} : tu remportes ${money(gain)} !`, '🎰')); }
  if (gain === bet) return record(c, nt(`${label[0].toUpperCase()}${label.slice(1)} : égalité, tu récupères ta mise.`, '🎰'));
  adjust(c, 'happiness', -3);
  return record(c, ko(`${label[0].toUpperCase()}${label.slice(1)} : tu perds ${money(bet)}.`, '🎰'));
}

// ───────────────────────────── Crime ─────────────────────────────

export function commitCrime(c: Character, id: string) {
  const crime = CRIMES.find((x) => x.id === id);
  if (!crime || c.age < crime.minAge || c.prison || !c.alive) return null;
  if (tired(c, `crime_${id}`, 2)) return record(c, nt('Trop risqué de recommencer si vite. La police rôde.', '👮'));
  karma(c, crime.karma);
  const harsh = getCountry(c.countryCode).harshness;
  const p = crime.success + (c.stats.smarts - 50) / 400 + (c.stats.fitness - 50) / 500 - c.criminalRecord.length * 0.02;
  if (chance(clamp(p, 0.05, 0.95))) {
    const loot = local(c, int(crime.loot[0], crime.loot[1]));
    c.money += loot;
    if (crime.id === 'bank') c.flags.bankHeist = true;
    adjust(c, 'happiness', 3);
    return record(c, ok(loot > 0 ? `${crime.name} réussi : tu empoches ${money(loot)}.` : `${crime.name} réussi. Personne ne t’a vu.`, crime.icon));
  }
  c.criminalRecord.push(crime.name);
  const years = Math.round(int(crime.sentence[0], crime.sentence[1]) * (0.6 + harsh));
  adjust(c, 'happiness', -10);
  if (c.age < 16 || years <= 0) {
    const fine = local(c, 500);
    c.money -= c.age >= 18 ? fine : 0;
    return record(c, ko(`Tu t’es fait prendre (${crime.name.toLowerCase()}). ${c.age < 18 ? 'Convocation au commissariat avec tes parents.' : `Amende de ${money(fine)}.`}`, '🚔'));
  }
  if (c.career) { log(c, 'Ton employeur t’a licencié·e suite à ton arrestation.', 'bad', '📦'); endCareer(c); }
  if (c.education.enrolled && c.age >= 18) { c.education.enrolled = null; c.education.droppedOut = true; }
  c.prison = { yearsLeft: years, total: years, crime: crime.name };
  return record(c, { text: `Arrêté·e pour ${crime.name.toLowerCase()} ! Tu es condamné·e à ${years} an${years > 1 ? 's' : ''} de prison.`, tone: 'bad', icon: '⛓️' });
}

// ───────────────────────────── Emigration ─────────────────────────────

export function emigrationCost(c: Character, code: string) {
  return Math.round(local(c, 4000) + 3000 * wealthFactor(code));
}

export function emigrate(c: Character, code: string) {
  if (c.age < 18 || c.prison || code === c.countryCode) return null;
  const cost = emigrationCost(c, code);
  if (c.money < cost) return record(c, ko('Tu n’as pas assez d’argent pour émigrer.', '🧳'));
  if (tired(c, 'emigrate', 1)) return record(c, nt('Ton visa est déjà en cours d’examen.', '🛂'));
  c.money -= cost;
  const target = getCountry(code);
  const visa = clamp(0.85 - (target.gdp / 100000) * 0.5 + c.stats.smarts / 300 + (c.career ? 0.1 : 0), 0.15, 0.95);
  if (!chance(visa)) return record(c, ko(`Ta demande de visa pour ${target.nameFr} a été refusée. Les frais ne sont pas remboursés.`, '🛂'));
  const ratio = wealthFactor(code) / wealthFactor(c.countryCode);
  c.money = Math.round(c.money * ratio);
  c.debt = Math.round(c.debt * ratio);
  if (c.career) { endCareer(c); }
  c.countryCode = code;
  c.city = pick(target.cities);
  if (!c.countriesLived.includes(code)) c.countriesLived.push(code);
  c.relations.filter((r) => r.relation === 'friend').forEach((f) => (f.closeness -= 20));
  adjust(c, 'happiness', 5);
  return record(c, { text: `Nouvelle vie ! Tu t’installes à ${c.city}, ${target.nameFr}. Ton argent est converti au coût de la vie local.`, tone: 'special', icon: '✈️' });
}

// ───────────────────────────── Education ─────────────────────────────

export function nextDegree(c: Character): EduLevel | null {
  const h = c.education.highest;
  if (h === 'secondary') return 'bachelor';
  if (h === 'bachelor') return 'master';
  if (h === 'master') return 'doctorate';
  return null;
}

export function enroll(c: Character, majorId: string) {
  const level = nextDegree(c);
  const major = getMajor(majorId);
  if (!level || !major || c.education.enrolled || c.prison || c.age < 17) return null;
  const needed = major.minSmarts + (level === 'master' ? 5 : level === 'doctorate' ? 12 : 0);
  if (c.stats.smarts < needed - 15 || !chance(clamp(0.4 + (c.stats.smarts - needed) / 40, 0.05, 0.98))) {
    return record(c, ko(`Ta candidature en ${major.name.toLowerCase()} (${EDU_LABEL[level].toLowerCase()}) a été refusée.`, '📭'));
  }
  if (level !== 'bachelor' && c.education.major && c.education.major !== majorId && chance(0.4)) {
    return record(c, ko('Le jury estime que ton parcours ne correspond pas à cette filière.', '📭'));
  }
  if (c.career && !getJob(c.career.jobId)?.partTime) endCareer(c);
  c.education.enrolled = level;
  c.education.major = majorId;
  c.education.yearsLeft = EDU_YEARS[level] + (majorId === 'medicine' && level === 'doctorate' ? 2 : 0);
  c.education.performance = clamp(c.stats.smarts + int(-10, 5), 10, 90);
  return record(c, ok(`Accepté·e ! Tu commences ${level === 'bachelor' ? 'une licence' : level === 'master' ? 'un master' : 'un doctorat'} en ${major.name.toLowerCase()} ${major.icon}.`, '🎓'));
}

export function studyHarder(c: Character) {
  if (!c.education.enrolled) return null;
  if (tired(c, 'study')) return record(c, nt('Tu as déjà bûché tout ce que tu pouvais cette année.', '📖'));
  c.education.performance = clamp(c.education.performance + int(5, 12), 0, 100);
  adjust(c, 'smarts', int(1, 3));
  adjust(c, 'happiness', -2);
  return record(c, ok('Tu as révisé d’arrache-pied. Tes notes s’améliorent.', '✏️'));
}

export function dropOut(c: Character) {
  const e = c.education;
  if (!e.enrolled || (e.enrolled !== 'bachelor' && e.enrolled !== 'master' && e.enrolled !== 'doctorate' && c.age < 16)) return null;
  const lvl = e.enrolled;
  e.enrolled = null;
  e.droppedOut = true;
  adjust(c, 'happiness', 4);
  return record(c, ko(`Tu as abandonné tes études (${EDU_LABEL[lvl].toLowerCase()}).`, '🚪'));
}

// ───────────────────────────── Career ─────────────────────────────

export interface JobOption {
  job: Job;
  title: string;
  salary: number;
  locked: string | null;
  odds: number;
}

export function jobOptions(c: Character): JobOption[] {
  return JOBS.map((job) => {
    let locked: string | null = null;
    if (c.age < (job.minAge ?? 18)) locked = `Dès ${job.minAge ?? 18} ans`;
    else if (job.maxAge && c.age > job.maxAge) locked = 'Trop âgé·e';
    else if (eduRank(c.education.highest) < eduRank(job.minEdu)) locked = `Requiert : ${EDU_LABEL[job.minEdu]}`;
    else if (job.majors && !c.education.degrees.some((d) => d.major && job.majors!.includes(d.major))) locked = `Filière : ${job.majors.map((m) => getMajor(m)?.name).join(', ')}`;
    else if (!job.partTime && c.education.enrolled && c.age < 23 && ['bachelor', 'master', 'doctorate'].includes(c.education.enrolled)) locked = 'Pendant tes études : petits boulots uniquement';
    else if (!job.partTime && c.education.enrolled && c.age < 18) locked = 'Termine d’abord l’école';
    const odds = clamp(
      1 - job.difficulty +
        ((c.stats.smarts - (job.minSmarts ?? 40)) / 150) +
        (job.minLooks ? (c.stats.looks - job.minLooks) / 60 : 0) +
        (job.minFitness ? (c.stats.fitness - job.minFitness) / 60 : 0) -
        c.criminalRecord.length * 0.08,
      0.03,
      0.97,
    );
    return { job, title: job.levels[0], salary: local(c, job.salary), locked, odds };
  });
}

export function applyJob(c: Character, jobId: string) {
  if (c.prison || !c.alive) return null;
  const opt = jobOptions(c).find((o) => o.job.id === jobId);
  if (!opt || opt.locked) return null;
  if (c.career?.jobId === jobId) return null;
  if (tired(c, 'apply', 4)) return record(c, nt('Tu as envoyé assez de CV cette année.', '📨'));
  const { job } = opt;
  const missingStat =
    (job.minSmarts && c.stats.smarts < job.minSmarts - 10) ||
    (job.minLooks && c.stats.looks < job.minLooks - 10) ||
    (job.minFitness && c.stats.fitness < job.minFitness - 10);
  if (missingStat || !chance(opt.odds)) {
    adjust(c, 'happiness', -3);
    return record(c, ko(`Ta candidature pour le poste de ${opt.title.toLowerCase()} a été rejetée.`, '📭'));
  }
  if (c.career) endCareer(c);
  c.retired = false;
  c.career = { jobId, level: 0, performance: 55, years: 0, salary: Math.round(opt.salary * float(0.92, 1.08)) };
  adjust(c, 'happiness', 6);
  return record(c, ok(`Embauché·e ! Tu deviens ${opt.title.toLowerCase()} ${job.icon} pour ${money(c.career.salary)}/an.`, '💼'));
}

export function workHarder(c: Character) {
  if (!c.career) return null;
  if (tired(c, 'work')) return record(c, nt('Tu es au bord du burn-out. Lève le pied !', '🔥'));
  c.career.performance = clamp(c.career.performance + int(5, 12), 0, 100);
  adjust(c, 'happiness', -int(1, 4));
  adjust(c, 'health', -int(0, 2));
  return record(c, ok('Tu as fait des heures supplémentaires. Ton patron l’a remarqué.', '⏱️'));
}

export function askRaise(c: Character) {
  if (!c.career) return null;
  if (tired(c, 'raise', 1)) return record(c, nt('Tu as déjà demandé une augmentation cette année.', '💬'));
  if (chance(c.career.performance / 130)) {
    const pct = int(5, 15);
    c.career.salary = Math.round(c.career.salary * (1 + pct / 100));
    return record(c, ok(`Augmentation de ${pct} % accordée ! Nouveau salaire : ${money(c.career.salary)}/an.`, '💸'));
  }
  c.career.performance -= 5;
  return record(c, ko('Ton patron a ri. Pas d’augmentation.', '🙅'));
}

export function quitJob(c: Character) {
  if (!c.career) return null;
  const title = jobTitle(c.career.jobId, c.career.level);
  endCareer(c);
  adjust(c, 'happiness', 3);
  return record(c, nt(`Tu as démissionné de ton poste de ${title.toLowerCase()}.`, '👋'));
}

export function retire(c: Character) {
  if (c.age < 55 || c.retired) return null;
  const last = c.career?.salary ?? 0;
  const years = c.jobHistory.reduce((s, j) => s + j.years, 0) + (c.career?.years ?? 0);
  c.pension = Math.round(Math.max(local(c, 3000), last * clamp(years / 60, 0.1, 0.65)));
  endCareer(c);
  c.retired = true;
  adjust(c, 'happiness', 10);
  return record(c, { text: `Tu prends ta retraite ! Pension : ${money(c.pension)}/an.`, tone: 'special', icon: '🏖️' });
}

// ───────────────────────────── Relationships ─────────────────────────────

export type Interaction = 'time' | 'talk' | 'compliment' | 'gift' | 'money' | 'argue' | 'propose' | 'breakup' | 'play' | 'reconcile';

export function interactionsFor(c: Character, p: Person): { id: Interaction; label: string; icon: string }[] {
  if (!p.alive) return [];
  if (p.relation === 'pet') return [{ id: 'play', label: 'Jouer', icon: '🎾' }];
  const list: { id: Interaction; label: string; icon: string }[] = [
    { id: 'time', label: 'Passer du temps', icon: '☕' },
    { id: 'talk', label: 'Discuter', icon: '💬' },
    { id: 'compliment', label: 'Complimenter', icon: '🌹' },
  ];
  if (c.age >= 10) list.push({ id: 'gift', label: 'Offrir un cadeau', icon: '🎁' });
  if (['mother', 'father', 'spouse', 'partner'].includes(p.relation)) list.push({ id: 'money', label: 'Demander de l’argent', icon: '💵' });
  list.push({ id: 'argue', label: 'Se disputer', icon: '😤' });
  if (p.relation === 'partner' && c.age >= 18) list.push({ id: 'propose', label: 'Demander en mariage', icon: '💍' });
  if (p.relation === 'partner' || p.relation === 'spouse') list.push({ id: 'breakup', label: p.relation === 'spouse' ? 'Divorcer' : 'Rompre', icon: '💔' });
  if (p.relation === 'ex') return [{ id: 'reconcile', label: 'Se remettre ensemble', icon: '❤️‍🩹' }, { id: 'talk', label: 'Discuter', icon: '💬' }];
  return list;
}

export function interact(c: Character, personId: string, action: Interaction) {
  const p = c.relations.find((r) => r.id === personId);
  if (!p || !p.alive || !c.alive) return null;
  if (c.prison && !['talk', 'breakup'].includes(action)) return record(c, nt('Impossible depuis ta cellule : seul le parloir est autorisé.', '🔒'));
  const label = `${relationLabel(p)} ${p.firstName}`.trim();
  const close = (d: number) => (p.closeness = clamp(p.closeness + d, 0, 100));
  if (tired(c, `rel_${p.id}_${action}`, action === 'money' ? 1 : 2)) return record(c, nt(`${p.firstName} a besoin d’un peu d’espace.`, '🫥'));

  switch (action) {
    case 'play':
      close(8); adjust(c, 'happiness', 4);
      return record(c, ok(`Tu as joué avec ${p.firstName}. ${pick(['Il remue la queue de bonheur.', 'Il ronronne contre toi.', 'Il a rapporté la balle 50 fois.'])}`, '🐾'));
    case 'time':
      close(int(5, 12)); adjust(c, 'happiness', 3);
      return record(c, ok(`Tu as passé ${pick(['un après-midi au parc', 'une soirée cinéma', 'une journée à la plage', 'un dîner'])} avec ${label}.`, '☕'));
    case 'talk':
      close(int(2, 7));
      return record(c, ok(`Longue conversation avec ${label} à propos de ${pick(['la vie', 'politique', 'vos souvenirs', 'l’avenir', 'football', 'cuisine'])}.`, '💬'));
    case 'compliment':
      close(chance(0.85) ? int(3, 8) : -3);
      return record(c, ok(`Tu as dit à ${label} : « ${pick(['Tu es formidable', 'J’adore ton style', 'Tu es si drôle', 'Tu comptes beaucoup pour moi'])} ».`, '🌹'));
    case 'gift': {
      const cost = local(c, 100);
      if (c.money < cost && c.age >= 18) return record(c, ko('Tu n’as pas les moyens d’offrir un cadeau.', '🎁'));
      if (c.age >= 18) c.money -= cost;
      close(int(6, 14));
      return record(c, ok(`Tu as offert ${pick(['un livre', 'des fleurs', 'un parfum', 'une montre', 'des chocolats'])} à ${label}.`, '🎁'));
    }
    case 'money': {
      const willing = chance(p.closeness / 120) && p.money > 0;
      if (!willing) { close(-5); return record(c, ko(`${label} refuse de te donner de l’argent.`, '💸')); }
      const amt = Math.round(Math.min(p.money * float(0.02, 0.1), local(c, c.age < 18 ? 200 : 5000)));
      p.money -= amt; c.money += amt; close(-2);
      return record(c, ok(`${label} t’a donné ${money(amt)}.`, '💵'));
    }
    case 'argue':
      close(-int(8, 18)); karma(c, -1);
      if (chance(0.08) && c.age >= 14) { adjust(c, 'health', -5); return record(c, ko(`La dispute avec ${label} a dégénéré en bagarre !`, '🥊')); }
      return record(c, ko(`Tu t’es violemment disputé·e avec ${label} à propos de ${pick(['l’argent', 'la vaisselle', 'tes choix de vie', 'la politique'])}.`, '😤'));
    case 'propose': {
      if (p.relation !== 'partner') return null;
      if (chance(p.closeness / 100 + (p.together ?? 0) * 0.05 - 0.15)) {
        p.relation = 'spouse'; close(15); c.flags.married = true; adjust(c, 'happiness', 20);
        const cost = local(c, 15000); c.money -= cost;
        return record(c, { text: `${p.firstName} a dit OUI ! Vous vous êtes mariés lors d’une magnifique cérémonie (${money(cost)}).`, tone: 'special', icon: '💒' });
      }
      close(-15); adjust(c, 'happiness', -12);
      return record(c, ko(`${p.firstName} a refusé ta demande en mariage…`, '💔'));
    }
    case 'breakup': {
      const wasSpouse = p.relation === 'spouse';
      p.relation = 'ex'; p.closeness = int(5, 25);
      adjust(c, 'happiness', -int(5, 15));
      if (wasSpouse) {
        c.flags.divorced = true;
        const half = Math.round(Math.max(0, c.money) * 0.5);
        c.money -= half;
        return record(c, ko(`Divorce prononcé avec ${p.firstName}. Ton ex repart avec ${money(half)}.`, '⚖️'));
      }
      return record(c, ko(`Tu as rompu avec ${p.firstName}.`, '💔'));
    }
    case 'reconcile': {
      if (partner(c)) return record(c, nt('Tu es déjà en couple !', '💑'));
      if (chance(p.closeness / 80)) { p.relation = 'partner'; p.together = 0; close(20); return record(c, ok(`Tu t’es remis·e avec ${p.firstName} !`, '❤️‍🩹')); }
      return record(c, ko(`${p.firstName} ne veut plus entendre parler de toi.`, '🚫'));
    }
  }
}

// ───────────────────────────── Assets & investments ─────────────────────────────

export function buyItem(c: Character, catalogId: string) {
  const item = getItem(catalogId);
  const price = local(c, item.price);
  if (c.age < 18 || c.prison || c.money < price) return null;
  c.money -= price;
  c.assets.push({ id: nanoid(8), kind: item.kind, catalogId, name: item.name, value: price, purchasePrice: price, condition: 100, boughtAt: c.age });
  adjust(c, 'happiness', item.happiness);
  return record(c, ok(`Tu as acheté : ${item.name} ${item.icon} pour ${money(price)}.`, item.icon));
}

export function sellAsset(c: Character, assetId: string) {
  const a = c.assets.find((x) => x.id === assetId);
  if (!a || c.prison) return null;
  const price = Math.round(a.value * (0.9 + a.condition / 1000));
  c.money += price;
  c.assets = c.assets.filter((x) => x.id !== assetId);
  const diff = price - a.purchasePrice;
  return record(c, diff >= 0 ? ok(`Vendu : ${a.name} pour ${money(price)} (plus-value de ${money(diff)}).`, '🤝') : ko(`Vendu : ${a.name} pour ${money(price)} (moins-value de ${money(-diff)}).`, '🤝'));
}

export function buyStock(c: Character, symbol: string, amount: number) {
  const price = c.market.prices[symbol];
  if (!price || amount <= 0 || amount > c.money || c.age < 18 || c.prison) return null;
  c.money -= amount;
  c.holdings[symbol] = (c.holdings[symbol] ?? 0) + amount / price;
  return record(c, nt(`Tu as investi ${money(amount)} en ${symbol} à ${price.toFixed(2)} $.`, '📈'));
}

export function sellStock(c: Character, symbol: string, fraction = 1) {
  const shares = c.holdings[symbol] ?? 0;
  if (shares <= 0 || c.prison) return null;
  const qty = shares * clamp(fraction, 0, 1);
  const value = Math.round(qty * c.market.prices[symbol]);
  c.holdings[symbol] = shares - qty;
  if (c.holdings[symbol] < 1e-6) delete c.holdings[symbol];
  c.money += value;
  return record(c, nt(`Tu as vendu des titres ${symbol} pour ${money(value)}.`, '📉'));
}

// ───────────────────────────── Events ─────────────────────────────

export function resolveChoice(c: Character, index: number) {
  const pending = c.pending[0];
  if (!pending) return null;
  const ev = getEvent(pending.eventId);
  c.pending.shift();
  const choice = ev?.choices?.[index];
  if (!ev || !choice) return null;
  const person = pending.personId ? c.relations.find((r) => r.id === pending.personId) : undefined;
  const out = choice.run(c, person);
  for (const r of c.relations) r.closeness = clamp(r.closeness, 0, 100);
  return record(c, { text: out.text, tone: out.tone ?? 'neutral', icon: ev.icon });
}

export const hasChildren = (c: Character) => children(c).some((k) => k.alive);

import type { Character } from '../types';
import { children, netWorth } from '../engine/helpers';
import { eduRank } from './education';
import { getCountry } from './countries';
import { getJob } from './jobs';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'commun' | 'rare' | 'épique' | 'légendaire';
  check: (c: Character) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'born', name: 'Bienvenue sur Terre', description: 'Naître. Un bon début.', icon: '🌍', rarity: 'commun', check: () => true },
  { id: 'rare_birth', name: '1 sur 8 milliards', description: 'Naître dans un pays de moins de 12 millions d’habitants.', icon: '💎', rarity: 'rare', check: (c) => getCountry(c.birthCountry).population < 12 },
  { id: 'tiny_birth', name: 'Flocon unique', description: 'Naître dans un pays de moins d’un million d’habitants.', icon: '❄️', rarity: 'légendaire', check: (c) => getCountry(c.birthCountry).population < 1 },
  { id: 'adult', name: 'Majeur·e', description: 'Atteindre 18 ans.', icon: '🔞', rarity: 'commun', check: (c) => c.age >= 18 },
  { id: 'fifty', name: 'Demi-siècle', description: 'Atteindre 50 ans.', icon: '🎂', rarity: 'commun', check: (c) => c.age >= 50 },
  { id: 'ninety', name: 'Sage', description: 'Atteindre 90 ans.', icon: '🧙', rarity: 'rare', check: (c) => c.age >= 90 },
  { id: 'centenarian', name: 'Centenaire', description: 'Atteindre 100 ans.', icon: '💯', rarity: 'épique', check: (c) => c.age >= 100 },
  { id: 'graduate', name: 'Diplômé·e', description: 'Obtenir une licence.', icon: '🎓', rarity: 'commun', check: (c) => eduRank(c.education.highest) >= 3 },
  { id: 'doctor', name: 'Docteur', description: 'Obtenir un doctorat.', icon: '🥼', rarity: 'rare', check: (c) => c.education.highest === 'doctorate' },
  { id: 'genius', name: 'Génie', description: 'Atteindre 100 en intelligence.', icon: '🧠', rarity: 'épique', check: (c) => c.stats.smarts >= 100 },
  { id: 'beauty', name: 'Beauté fatale', description: 'Atteindre 100 en apparence.', icon: '💄', rarity: 'épique', check: (c) => c.stats.looks >= 100 },
  { id: 'athlete', name: 'Athlète', description: 'Atteindre 100 en forme physique.', icon: '💪', rarity: 'épique', check: (c) => c.stats.fitness >= 100 },
  { id: 'first_job', name: 'Premier salaire', description: 'Obtenir un emploi.', icon: '💼', rarity: 'commun', check: (c) => c.jobHistory.length > 0 || !!c.career },
  { id: 'top_career', name: 'Au sommet', description: 'Atteindre le plus haut échelon d’une carrière.', icon: '🏔️', rarity: 'rare', check: (c) => !!c.career && c.career.level >= (getJob(c.career.jobId)?.levels.length ?? 99) - 1 && (getJob(c.career.jobId)?.levels.length ?? 0) > 2 },
  { id: 'astronaut', name: 'Vers l’infini', description: 'Devenir astronaute.', icon: '🚀', rarity: 'légendaire', check: (c) => c.career?.jobId === 'astronaut' || c.jobHistory.some((j) => j.jobId === 'astronaut') },
  { id: 'president', name: 'Chef d’État', description: 'Diriger ton pays.', icon: '👑', rarity: 'légendaire', check: (c) => c.career?.jobId === 'politician' && c.career.level >= 4 },
  { id: 'hundredk', name: 'Petit pécule', description: 'Atteindre 100 000 $ de patrimoine.', icon: '💵', rarity: 'commun', check: (c) => netWorth(c) >= 100_000 },
  { id: 'millionaire', name: 'Millionnaire', description: 'Atteindre 1 million de $ de patrimoine.', icon: '💰', rarity: 'rare', check: (c) => netWorth(c) >= 1_000_000 },
  { id: 'billionaire', name: 'Milliardaire', description: 'Atteindre 1 milliard de $ de patrimoine.', icon: '🤑', rarity: 'légendaire', check: (c) => netWorth(c) >= 1_000_000_000 },
  { id: 'bankrupt', name: 'Fauché·e', description: 'Avoir plus de 50 000 $ de dettes.', icon: '📉', rarity: 'rare', check: (c) => c.money - c.debt < -50_000 },
  { id: 'homeowner', name: 'Propriétaire', description: 'Acheter un bien immobilier.', icon: '🏠', rarity: 'commun', check: (c) => c.assets.some((a) => a.kind === 'house') },
  { id: 'island', name: 'Robinson de luxe', description: 'Posséder une île privée.', icon: '🏝️', rarity: 'légendaire', check: (c) => c.assets.some((a) => a.catalogId === 'island') },
  { id: 'married', name: 'Oui, je le veux', description: 'Se marier.', icon: '💍', rarity: 'commun', check: (c) => !!c.flags.married },
  { id: 'divorced', name: 'Ça n’a pas marché', description: 'Divorcer.', icon: '💔', rarity: 'commun', check: (c) => !!c.flags.divorced },
  { id: 'parent', name: 'Parent', description: 'Avoir un enfant.', icon: '🍼', rarity: 'commun', check: (c) => children(c).length > 0 },
  { id: 'big_family', name: 'Famille nombreuse', description: 'Avoir 5 enfants ou plus.', icon: '👨‍👩‍👧‍👦', rarity: 'rare', check: (c) => children(c).length >= 5 },
  { id: 'grandparent', name: 'Papi·Mamie', description: 'Devenir grand-parent.', icon: '👵', rarity: 'rare', check: (c) => ((c.flags.grandchildren as number) ?? 0) > 0 },
  { id: 'pet_owner', name: 'Meilleur ami', description: 'Adopter un animal.', icon: '🐕', rarity: 'commun', check: (c) => c.relations.some((r) => r.relation === 'pet') },
  { id: 'criminal', name: 'Casier judiciaire', description: 'Être condamné·e.', icon: '🚔', rarity: 'commun', check: (c) => c.criminalRecord.length > 0 },
  { id: 'escape', name: 'La grande évasion', description: 'S’évader de prison.', icon: '🏃', rarity: 'épique', check: (c) => !!c.flags.escaped },
  { id: 'heist', name: 'Casse du siècle', description: 'Réussir un braquage de banque.', icon: '🏦', rarity: 'épique', check: (c) => !!c.flags.bankHeist },
  { id: 'saint', name: 'Âme pure', description: 'Atteindre 100 de karma.', icon: '😇', rarity: 'épique', check: (c) => c.karma >= 100 },
  { id: 'devil', name: 'Âme damnée', description: 'Tomber à 0 de karma.', icon: '😈', rarity: 'rare', check: (c) => c.karma <= 0 },
  { id: 'famous', name: 'Célébrité', description: 'Atteindre 75 de célébrité.', icon: '🌟', rarity: 'rare', check: (c) => c.fame >= 75 },
  { id: 'jackpot', name: 'Jackpot', description: 'Gagner le gros lot de la loterie.', icon: '🎰', rarity: 'légendaire', check: (c) => c.lotteryWins > 0 },
  { id: 'globetrotter', name: 'Globe-trotteur', description: 'Vivre dans 3 pays différents.', icon: '✈️', rarity: 'rare', check: (c) => c.countriesLived.length >= 3 },
  { id: 'emigrant', name: 'Nouvelle vie', description: 'Émigrer dans un autre pays.', icon: '🧳', rarity: 'commun', check: (c) => c.countriesLived.length >= 2 },
  { id: 'abducted', name: 'Ils sont parmi nous', description: 'Vivre une rencontre du troisième type.', icon: '👽', rarity: 'légendaire', check: (c) => !!c.flags.abducted },
  { id: 'retired', name: 'Repos bien mérité', description: 'Prendre sa retraite.', icon: '🏖️', rarity: 'commun', check: (c) => c.retired },
  { id: 'dynasty', name: 'Dynastie', description: 'Jouer la 3e génération d’une famille.', icon: '🌳', rarity: 'épique', check: (c) => c.generation >= 3 },
  { id: 'young_death', name: 'Partir trop tôt', description: 'Mourir avant 18 ans.', icon: '🥀', rarity: 'rare', check: (c) => !c.alive && c.age < 18 },
];

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);

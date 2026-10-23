import type { EduLevel } from '../types';

export const EDU_ORDER: EduLevel[] = ['none', 'primary', 'secondary', 'bachelor', 'master', 'doctorate'];

export const EDU_LABEL: Record<EduLevel, string> = {
  none: 'Aucun diplôme',
  primary: 'École primaire',
  secondary: 'Baccalauréat',
  bachelor: 'Licence',
  master: 'Master',
  doctorate: 'Doctorat',
};

export const eduRank = (l: EduLevel) => EDU_ORDER.indexOf(l);

export interface Major {
  id: string;
  name: string;
  icon: string;
  minSmarts: number;
  /** Yearly tuition at US prices */
  tuition: number;
}

export const MAJORS: Major[] = [
  { id: 'cs', name: 'Informatique', icon: '💻', minSmarts: 55, tuition: 22000 },
  { id: 'medicine', name: 'Médecine', icon: '🩺', minSmarts: 75, tuition: 35000 },
  { id: 'law', name: 'Droit', icon: '⚖️', minSmarts: 65, tuition: 28000 },
  { id: 'business', name: 'Commerce', icon: '📈', minSmarts: 45, tuition: 25000 },
  { id: 'engineering', name: 'Ingénierie', icon: '⚙️', minSmarts: 65, tuition: 24000 },
  { id: 'literature', name: 'Lettres', icon: '📚', minSmarts: 35, tuition: 15000 },
  { id: 'arts', name: 'Beaux-arts', icon: '🎨', minSmarts: 25, tuition: 18000 },
  { id: 'biology', name: 'Biologie', icon: '🧬', minSmarts: 55, tuition: 20000 },
  { id: 'psychology', name: 'Psychologie', icon: '🧠', minSmarts: 45, tuition: 18000 },
  { id: 'sport', name: 'Sciences du sport', icon: '🏃', minSmarts: 25, tuition: 14000 },
  { id: 'architecture', name: 'Architecture', icon: '🏛️', minSmarts: 60, tuition: 26000 },
  { id: 'journalism', name: 'Journalisme', icon: '📰', minSmarts: 40, tuition: 17000 },
];

export const getMajor = (id: string | null) => MAJORS.find((m) => m.id === id) ?? null;

/** Duration in years for each level */
export const EDU_YEARS: Record<EduLevel, number> = {
  none: 0,
  primary: 6,
  secondary: 6,
  bachelor: 4,
  master: 2,
  doctorate: 4,
};

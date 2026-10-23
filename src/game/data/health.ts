export interface DiseaseInfo {
  id: string;
  name: string;
  /** Used in « mort·e des suites … » */
  cause: string;
  icon: string;
  /** Health lost per year */
  damage: number;
  /** Chance a doctor cures it (scaled by country healthcare) */
  curable: number;
  minAge: number;
  /** Relative frequency */
  weight: number;
  deadly: boolean;
  /** Chance per year it disappears on its own */
  selfHeal: number;
}

export const DISEASES: DiseaseInfo[] = [
  { id: 'flu', cause: "d’une grippe", name: 'Grippe', icon: '🤧', damage: 4, curable: 0.95, minAge: 0, weight: 10, deadly: false, selfHeal: 0.8 },
  { id: 'chickenpox', cause: "d’une varicelle", name: 'Varicelle', icon: '🔴', damage: 3, curable: 0.95, minAge: 0, weight: 5, deadly: false, selfHeal: 0.9 },
  { id: 'migraine', cause: "de migraines", name: 'Migraines chroniques', icon: '🤕', damage: 2, curable: 0.6, minAge: 12, weight: 5, deadly: false, selfHeal: 0.1 },
  { id: 'depression', cause: "d’une dépression", name: 'Dépression', icon: '🌧️', damage: 3, curable: 0.65, minAge: 13, weight: 5, deadly: false, selfHeal: 0.15 },
  { id: 'asthma', cause: "d’une crise d’asthme", name: 'Asthme', icon: '🫁', damage: 2, curable: 0.5, minAge: 0, weight: 4, deadly: false, selfHeal: 0.05 },
  { id: 'malaria', cause: "du paludisme", name: 'Paludisme', icon: '🦟', damage: 12, curable: 0.85, minAge: 0, weight: 3, deadly: true, selfHeal: 0.2 },
  { id: 'diabetes', cause: "du diabète", name: 'Diabète', icon: '🍬', damage: 4, curable: 0.3, minAge: 30, weight: 4, deadly: true, selfHeal: 0 },
  { id: 'hypertension', cause: "d’hypertension", name: 'Hypertension', icon: '❤️‍🩹', damage: 4, curable: 0.6, minAge: 35, weight: 5, deadly: true, selfHeal: 0.02 },
  { id: 'arthritis', cause: "d’arthrose", name: 'Arthrose', icon: '🦴', damage: 3, curable: 0.3, minAge: 45, weight: 5, deadly: false, selfHeal: 0 },
  { id: 'heart', cause: "d’une maladie cardiaque", name: 'Maladie cardiaque', icon: '💔', damage: 10, curable: 0.45, minAge: 45, weight: 3, deadly: true, selfHeal: 0 },
  { id: 'cancer', cause: "d’un cancer", name: 'Cancer', icon: '🎗️', damage: 16, curable: 0.4, minAge: 30, weight: 2, deadly: true, selfHeal: 0.01 },
  { id: 'alzheimer', cause: "de la maladie d’Alzheimer", name: 'Maladie d’Alzheimer', icon: '🧩', damage: 7, curable: 0.05, minAge: 65, weight: 2, deadly: true, selfHeal: 0 },
];

export const getDisease = (id: string) => DISEASES.find((d) => d.id === id)!;

export interface Crime {
  id: string;
  name: string;
  icon: string;
  minAge: number;
  success: number;
  /** Loot range at US prices */
  loot: [number, number];
  /** Prison sentence range in years */
  sentence: [number, number];
  karma: number;
}

export const CRIMES: Crime[] = [
  { id: 'shoplift', name: 'Vol à l’étalage', icon: '🛍️', minAge: 10, success: 0.75, loot: [10, 200], sentence: [0, 1], karma: -3 },
  { id: 'pickpocket', name: 'Pickpocket', icon: '👛', minAge: 12, success: 0.65, loot: [20, 500], sentence: [0, 1], karma: -5 },
  { id: 'graffiti', name: 'Graffiti sauvage', icon: '🎨', minAge: 10, success: 0.8, loot: [0, 0], sentence: [0, 1], karma: -1 },
  { id: 'burglary', name: 'Cambriolage', icon: '🏚️', minAge: 15, success: 0.5, loot: [500, 15000], sentence: [1, 4], karma: -10 },
  { id: 'cartheft', name: 'Vol de voiture', icon: '🚘', minAge: 16, success: 0.45, loot: [2000, 30000], sentence: [1, 5], karma: -10 },
  { id: 'fraud', name: 'Fraude fiscale', icon: '🧾', minAge: 21, success: 0.6, loot: [5000, 120000], sentence: [1, 6], karma: -8 },
  { id: 'cyber', name: 'Piratage informatique', icon: '🕵️', minAge: 14, success: 0.4, loot: [1000, 250000], sentence: [2, 8], karma: -8 },
  { id: 'bank', name: 'Braquage de banque', icon: '🏦', minAge: 18, success: 0.18, loot: [50000, 2000000], sentence: [8, 25], karma: -25 },
];

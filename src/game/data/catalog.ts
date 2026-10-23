export interface CatalogItem {
  id: string;
  kind: 'house' | 'car';
  name: string;
  icon: string;
  /** Price at US purchasing power */
  price: number;
  happiness: number;
  /** Yearly upkeep as a fraction of value */
  upkeep: number;
  /** Yearly value change (positive for real estate, negative for cars) */
  drift: number;
}

export const CATALOG: CatalogItem[] = [
  { id: 'studio', kind: 'house', name: 'Studio en ville', icon: '🏢', price: 120000, happiness: 4, upkeep: 0.012, drift: 0.03 },
  { id: 'flat', kind: 'house', name: 'Appartement 3 pièces', icon: '🏬', price: 260000, happiness: 7, upkeep: 0.012, drift: 0.03 },
  { id: 'house', kind: 'house', name: 'Maison de banlieue', icon: '🏡', price: 420000, happiness: 10, upkeep: 0.015, drift: 0.032 },
  { id: 'farmhouse', kind: 'house', name: 'Ferme à la campagne', icon: '🛖', price: 310000, happiness: 9, upkeep: 0.018, drift: 0.02 },
  { id: 'loft', kind: 'house', name: 'Loft avec terrasse', icon: '🌆', price: 850000, happiness: 13, upkeep: 0.015, drift: 0.035 },
  { id: 'villa', kind: 'house', name: 'Villa avec piscine', icon: '🏖️', price: 1900000, happiness: 17, upkeep: 0.02, drift: 0.035 },
  { id: 'mansion', kind: 'house', name: 'Manoir historique', icon: '🏰', price: 6500000, happiness: 22, upkeep: 0.025, drift: 0.03 },
  { id: 'island', kind: 'house', name: 'Île privée', icon: '🏝️', price: 35000000, happiness: 30, upkeep: 0.03, drift: 0.04 },
  { id: 'bike', kind: 'car', name: 'Vélo électrique', icon: '🚲', price: 2500, happiness: 2, upkeep: 0.03, drift: -0.15 },
  { id: 'scooter', kind: 'car', name: 'Scooter', icon: '🛵', price: 4000, happiness: 3, upkeep: 0.05, drift: -0.15 },
  { id: 'used', kind: 'car', name: 'Citadine d’occasion', icon: '🚗', price: 9000, happiness: 3, upkeep: 0.08, drift: -0.14 },
  { id: 'sedan', kind: 'car', name: 'Berline familiale', icon: '🚙', price: 32000, happiness: 5, upkeep: 0.06, drift: -0.13 },
  { id: 'ev', kind: 'car', name: 'Voiture électrique', icon: '🔋', price: 48000, happiness: 7, upkeep: 0.03, drift: -0.12 },
  { id: 'pickup', kind: 'car', name: 'Pick-up', icon: '🛻', price: 45000, happiness: 6, upkeep: 0.07, drift: -0.12 },
  { id: 'sports', kind: 'car', name: 'Voiture de sport', icon: '🏎️', price: 180000, happiness: 12, upkeep: 0.06, drift: -0.1 },
  { id: 'supercar', kind: 'car', name: 'Hypercar', icon: '🚀', price: 2500000, happiness: 18, upkeep: 0.05, drift: -0.05 },
  { id: 'yacht', kind: 'car', name: 'Yacht', icon: '🛥️', price: 8000000, happiness: 20, upkeep: 0.08, drift: -0.06 },
  { id: 'jet', kind: 'car', name: 'Jet privé', icon: '🛩️', price: 40000000, happiness: 25, upkeep: 0.07, drift: -0.06 },
];

export const getItem = (id: string) => CATALOG.find((c) => c.id === id)!;

export interface Stock {
  symbol: string;
  name: string;
  icon: string;
  start: number;
  drift: number;
  volatility: number;
}

export const STOCKS: Stock[] = [
  { symbol: 'MNDE', name: 'Indice Monde', icon: '🌍', start: 100, drift: 0.06, volatility: 0.15 },
  { symbol: 'NOVA', name: 'Nova Technologies', icon: '🤖', start: 50, drift: 0.09, volatility: 0.35 },
  { symbol: 'PETR', name: 'PétroGlobal', icon: '🛢️', start: 80, drift: 0.03, volatility: 0.25 },
  { symbol: 'SANT', name: 'Santé+ Pharma', icon: '💊', start: 60, drift: 0.05, volatility: 0.2 },
  { symbol: 'BLEU', name: 'Agro Bleu', icon: '🌽', start: 40, drift: 0.04, volatility: 0.18 },
  { symbol: 'KRPT', name: 'KryptoCoin', icon: '🪙', start: 10, drift: 0.12, volatility: 0.85 },
];

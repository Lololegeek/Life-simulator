export type Gender = 'M' | 'F';

export type StatKey = 'health' | 'happiness' | 'smarts' | 'looks' | 'fitness';
export type Stats = Record<StatKey, number>;

export type RelationKind =
  | 'father'
  | 'mother'
  | 'sibling'
  | 'friend'
  | 'partner'
  | 'spouse'
  | 'ex'
  | 'child'
  | 'pet';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  relation: RelationKind;
  closeness: number;
  alive: boolean;
  looks: number;
  smarts: number;
  money: number;
  job?: string;
  species?: string;
  /** Number of years in the current romantic relationship */
  together?: number;
}

export type EduLevel = 'none' | 'primary' | 'secondary' | 'bachelor' | 'master' | 'doctorate';

export interface Education {
  enrolled: EduLevel | null;
  highest: EduLevel;
  major: string | null;
  yearsLeft: number;
  performance: number;
  degrees: { level: EduLevel; major: string | null; age: number }[];
  droppedOut: boolean;
}

export interface Career {
  jobId: string;
  level: number;
  performance: number;
  years: number;
  salary: number;
}

export interface Asset {
  id: string;
  kind: 'house' | 'car';
  catalogId: string;
  name: string;
  value: number;
  purchasePrice: number;
  condition: number;
  boughtAt: number;
}

export interface Disease {
  id: string;
  years: number;
}

export interface LogEntry {
  id: string;
  age: number;
  text: string;
  tone: 'good' | 'bad' | 'neutral' | 'special';
  icon?: string;
}

export interface HistoryPoint {
  age: number;
  health: number;
  happiness: number;
  smarts: number;
  looks: number;
  fitness: number;
  netWorth: number;
}

export interface Market {
  prices: Record<string, number>;
  history: Record<string, number[]>;
  tick: number;
}

export interface PendingChoice {
  eventId: string;
  title: string;
  text: string;
  icon: string;
  choices: string[];
  personId?: string;
}

export interface Prison {
  yearsLeft: number;
  crime: string;
  total: number;
}

export interface Character {
  id: string;
  seed: string;
  generation: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  countryCode: string;
  birthCountry: string;
  city: string;
  birthYear: number;
  age: number;
  alive: boolean;
  causeOfDeath: string | null;
  stats: Stats;
  karma: number;
  fame: number;
  money: number;
  debt: number;
  education: Education;
  career: Career | null;
  retired: boolean;
  pension: number;
  jobHistory: { jobId: string; title: string; years: number }[];
  relations: Person[];
  assets: Asset[];
  holdings: Record<string, number>;
  market: Market;
  diseases: Disease[];
  prison: Prison | null;
  criminalRecord: string[];
  log: LogEntry[];
  history: HistoryPoint[];
  pending: PendingChoice[];
  flags: Record<string, number | boolean | string>;
  actionsThisYear: Record<string, number>;
  lifeAchievements: string[];
  maxNetWorth: number;
  lotteryWins: number;
  countriesLived: string[];
}

export interface LifeSummary {
  id: string;
  name: string;
  gender: Gender;
  countryCode: string;
  birthYear: number;
  age: number;
  cause: string;
  netWorth: number;
  ribbon: string;
  job: string | null;
  children: number;
  achievements: string[];
  diedAt: number;
  generation: number;
}

export type ActionResult = { text: string; tone?: LogEntry['tone']; icon?: string } | null;

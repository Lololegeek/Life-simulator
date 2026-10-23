import type { EduLevel } from '../types';

export interface Job {
  id: string;
  icon: string;
  category: 'Petit boulot' | 'Service' | 'Bureau' | 'Santé' | 'Tech' | 'Juridique' | 'Art & médias' | 'Sport' | 'Métiers' | 'Public' | 'Prestige';
  levels: string[];
  /** Yearly salary for level 0, at US purchasing power */
  salary: number;
  /** Salary multiplier for each promotion */
  growth: number;
  minEdu: EduLevel;
  majors?: string[];
  minSmarts?: number;
  minLooks?: number;
  minFitness?: number;
  minAge?: number;
  maxAge?: number;
  partTime?: boolean;
  /** Fame earned per year */
  fame?: number;
  /** Base difficulty of being hired (0-1) */
  difficulty: number;
  stress: number;
}

export const JOBS: Job[] = [
  // Part-time
  { id: 'babysitter', icon: '🍼', category: 'Petit boulot', levels: ['Baby-sitter'], salary: 4000, growth: 1, minEdu: 'none', minAge: 14, maxAge: 25, partTime: true, difficulty: 0.15, stress: 1 },
  { id: 'fastfood', icon: '🍔', category: 'Petit boulot', levels: ['Équipier fast-food', 'Chef d’équipe'], salary: 9000, growth: 1.2, minEdu: 'none', minAge: 15, partTime: true, difficulty: 0.1, stress: 3 },
  { id: 'paperboy', icon: '🗞️', category: 'Petit boulot', levels: ['Livreur de journaux'], salary: 3000, growth: 1, minEdu: 'none', minAge: 13, maxAge: 22, partTime: true, difficulty: 0.05, stress: 1 },
  { id: 'courier', icon: '🛵', category: 'Petit boulot', levels: ['Livreur à vélo', 'Livreur à scooter'], salary: 12000, growth: 1.25, minEdu: 'none', minAge: 16, partTime: true, minFitness: 30, difficulty: 0.1, stress: 3 },
  // Service
  { id: 'cashier', icon: '🛒', category: 'Service', levels: ['Caissier', 'Chef de caisse', 'Responsable de magasin'], salary: 24000, growth: 1.3, minEdu: 'none', minAge: 18, difficulty: 0.15, stress: 3 },
  { id: 'waiter', icon: '🍽️', category: 'Service', levels: ['Serveur', 'Chef de rang', 'Maître d’hôtel'], salary: 26000, growth: 1.3, minEdu: 'none', minAge: 18, minLooks: 30, difficulty: 0.2, stress: 4 },
  { id: 'chef', icon: '👨‍🍳', category: 'Service', levels: ['Commis', 'Cuisinier', 'Sous-chef', 'Chef étoilé'], salary: 28000, growth: 1.45, minEdu: 'secondary', minAge: 18, difficulty: 0.3, stress: 6 },
  { id: 'barber', icon: '💈', category: 'Service', levels: ['Coiffeur apprenti', 'Coiffeur', 'Gérant de salon'], salary: 25000, growth: 1.35, minEdu: 'none', minAge: 17, difficulty: 0.2, stress: 2 },
  { id: 'flight', icon: '✈️', category: 'Service', levels: ['Steward', 'Chef de cabine'], salary: 45000, growth: 1.35, minEdu: 'secondary', minAge: 20, minLooks: 55, difficulty: 0.4, stress: 4 },
  // Trades
  { id: 'farmer', icon: '🌾', category: 'Métiers', levels: ['Ouvrier agricole', 'Agriculteur', 'Exploitant agricole'], salary: 22000, growth: 1.4, minEdu: 'none', minAge: 16, minFitness: 30, difficulty: 0.1, stress: 3 },
  { id: 'builder', icon: '🧱', category: 'Métiers', levels: ['Manœuvre', 'Maçon', 'Chef de chantier'], salary: 32000, growth: 1.3, minEdu: 'none', minAge: 18, minFitness: 40, difficulty: 0.2, stress: 4 },
  { id: 'electrician', icon: '⚡', category: 'Métiers', levels: ['Apprenti électricien', 'Électricien', 'Maître électricien'], salary: 38000, growth: 1.35, minEdu: 'secondary', minAge: 18, difficulty: 0.3, stress: 4 },
  { id: 'mechanic', icon: '🔧', category: 'Métiers', levels: ['Apprenti mécanicien', 'Mécanicien', 'Chef d’atelier'], salary: 36000, growth: 1.3, minEdu: 'none', minAge: 18, difficulty: 0.25, stress: 3 },
  { id: 'trucker', icon: '🚚', category: 'Métiers', levels: ['Chauffeur routier', 'Routier international'], salary: 42000, growth: 1.25, minEdu: 'none', minAge: 21, difficulty: 0.2, stress: 4 },
  // Office
  { id: 'secretary', icon: '🗂️', category: 'Bureau', levels: ['Assistant administratif', 'Assistant de direction'], salary: 34000, growth: 1.3, minEdu: 'secondary', minAge: 18, difficulty: 0.25, stress: 3 },
  { id: 'accountant', icon: '🧮', category: 'Bureau', levels: ['Comptable junior', 'Comptable', 'Expert-comptable', 'Directeur financier'], salary: 50000, growth: 1.4, minEdu: 'bachelor', majors: ['business'], minAge: 21, difficulty: 0.35, stress: 5 },
  { id: 'marketing', icon: '📣', category: 'Bureau', levels: ['Chargé de marketing', 'Chef de produit', 'Directeur marketing'], salary: 48000, growth: 1.45, minEdu: 'bachelor', majors: ['business', 'journalism', 'psychology', 'arts'], minAge: 21, difficulty: 0.35, stress: 5 },
  { id: 'banker', icon: '🏦', category: 'Bureau', levels: ['Analyste', 'Associé', 'Vice-président', 'Directeur général'], salary: 85000, growth: 1.6, minEdu: 'master', majors: ['business', 'engineering', 'cs'], minSmarts: 65, minAge: 22, difficulty: 0.6, stress: 9 },
  { id: 'architect', icon: '🏛️', category: 'Bureau', levels: ['Architecte junior', 'Architecte', 'Architecte associé'], salary: 60000, growth: 1.45, minEdu: 'master', majors: ['architecture'], minAge: 23, difficulty: 0.45, stress: 5 },
  // Tech
  { id: 'itsupport', icon: '🖥️', category: 'Tech', levels: ['Technicien support', 'Administrateur systèmes'], salary: 40000, growth: 1.35, minEdu: 'secondary', minSmarts: 45, minAge: 18, difficulty: 0.25, stress: 4 },
  { id: 'developer', icon: '👩‍💻', category: 'Tech', levels: ['Développeur junior', 'Développeur', 'Développeur senior', 'Lead dev', 'CTO'], salary: 70000, growth: 1.35, minEdu: 'bachelor', majors: ['cs', 'engineering'], minSmarts: 55, minAge: 21, difficulty: 0.4, stress: 5 },
  { id: 'datascientist', icon: '📊', category: 'Tech', levels: ['Data analyst', 'Data scientist', 'Head of AI'], salary: 85000, growth: 1.45, minEdu: 'master', majors: ['cs', 'engineering', 'biology'], minSmarts: 70, minAge: 22, difficulty: 0.5, stress: 5 },
  { id: 'engineer', icon: '🛠️', category: 'Tech', levels: ['Ingénieur junior', 'Ingénieur', 'Ingénieur en chef'], salary: 72000, growth: 1.35, minEdu: 'master', majors: ['engineering'], minSmarts: 60, minAge: 22, difficulty: 0.45, stress: 5 },
  // Health
  { id: 'nurse', icon: '💉', category: 'Santé', levels: ['Aide-soignant', 'Infirmier', 'Cadre de santé'], salary: 42000, growth: 1.3, minEdu: 'bachelor', majors: ['medicine', 'biology', 'psychology'], minAge: 21, difficulty: 0.3, stress: 7 },
  { id: 'doctor', icon: '🩺', category: 'Santé', levels: ['Interne', 'Médecin', 'Chef de service', 'Professeur de médecine'], salary: 95000, growth: 1.45, minEdu: 'doctorate', majors: ['medicine'], minSmarts: 75, minAge: 26, difficulty: 0.55, stress: 8 },
  { id: 'psychologist', icon: '🛋️', category: 'Santé', levels: ['Psychologue', 'Psychologue renommé'], salary: 60000, growth: 1.4, minEdu: 'master', majors: ['psychology'], minAge: 23, difficulty: 0.4, stress: 4 },
  { id: 'vet', icon: '🐾', category: 'Santé', levels: ['Assistant vétérinaire', 'Vétérinaire', 'Directeur de clinique'], salary: 65000, growth: 1.35, minEdu: 'doctorate', majors: ['biology', 'medicine'], minAge: 25, difficulty: 0.45, stress: 5 },
  // Law
  { id: 'paralegal', icon: '📑', category: 'Juridique', levels: ['Assistant juridique', 'Juriste'], salary: 40000, growth: 1.35, minEdu: 'bachelor', majors: ['law'], minAge: 21, difficulty: 0.3, stress: 5 },
  { id: 'lawyer', icon: '⚖️', category: 'Juridique', levels: ['Avocat collaborateur', 'Avocat', 'Associé', 'Bâtonnier'], salary: 90000, growth: 1.5, minEdu: 'master', majors: ['law'], minSmarts: 65, minAge: 23, difficulty: 0.5, stress: 8 },
  { id: 'judge', icon: '👨‍⚖️', category: 'Juridique', levels: ['Juge', 'Président de tribunal', 'Juge à la Cour suprême'], salary: 120000, growth: 1.3, minEdu: 'doctorate', majors: ['law'], minSmarts: 75, minAge: 30, difficulty: 0.65, stress: 6 },
  // Public
  { id: 'teacher', icon: '🍎', category: 'Public', levels: ['Professeur stagiaire', 'Professeur', 'Directeur d’école'], salary: 40000, growth: 1.3, minEdu: 'master', minAge: 22, difficulty: 0.3, stress: 6 },
  { id: 'police', icon: '👮', category: 'Public', levels: ['Gardien de la paix', 'Brigadier', 'Lieutenant', 'Commissaire'], salary: 38000, growth: 1.3, minEdu: 'secondary', minFitness: 50, minAge: 19, difficulty: 0.35, stress: 7 },
  { id: 'firefighter', icon: '🚒', category: 'Public', levels: ['Sapeur-pompier', 'Sergent', 'Capitaine'], salary: 40000, growth: 1.3, minEdu: 'secondary', minFitness: 60, minAge: 18, difficulty: 0.4, stress: 7 },
  { id: 'soldier', icon: '🎖️', category: 'Public', levels: ['Soldat', 'Sergent', 'Lieutenant', 'Colonel', 'Général'], salary: 30000, growth: 1.3, minEdu: 'none', minFitness: 50, minAge: 18, difficulty: 0.2, stress: 8 },
  { id: 'professor', icon: '🎓', category: 'Public', levels: ['Maître de conférences', 'Professeur des universités', 'Président d’université'], salary: 75000, growth: 1.3, minEdu: 'doctorate', minSmarts: 75, minAge: 28, difficulty: 0.55, stress: 4 },
  { id: 'politician', icon: '🏛️', category: 'Public', levels: ['Conseiller municipal', 'Maire', 'Député', 'Ministre', 'Chef d’État'], salary: 50000, growth: 1.4, minEdu: 'bachelor', majors: ['law', 'business', 'journalism'], minAge: 25, minSmarts: 55, fame: 6, difficulty: 0.55, stress: 8 },
  // Arts & media
  { id: 'musician', icon: '🎸', category: 'Art & médias', levels: ['Musicien de bar', 'Musicien de session', 'Artiste signé', 'Star internationale'], salary: 15000, growth: 2.2, minEdu: 'none', minAge: 16, fame: 8, difficulty: 0.4, stress: 4 },
  { id: 'actor', icon: '🎬', category: 'Art & médias', levels: ['Figurant', 'Second rôle', 'Acteur principal', 'Star de cinéma'], salary: 18000, growth: 2.3, minEdu: 'none', minLooks: 60, minAge: 16, fame: 10, difficulty: 0.55, stress: 5 },
  { id: 'model', icon: '📸', category: 'Art & médias', levels: ['Mannequin débutant', 'Mannequin', 'Top model'], salary: 25000, growth: 2, minEdu: 'none', minLooks: 80, minAge: 16, maxAge: 40, fame: 8, difficulty: 0.6, stress: 4 },
  { id: 'journalist', icon: '📰', category: 'Art & médias', levels: ['Pigiste', 'Journaliste', 'Rédacteur en chef'], salary: 38000, growth: 1.4, minEdu: 'bachelor', majors: ['journalism', 'literature'], minAge: 21, fame: 2, difficulty: 0.4, stress: 6 },
  { id: 'writer', icon: '✍️', category: 'Art & médias', levels: ['Auteur inconnu', 'Romancier publié', 'Auteur à succès'], salary: 12000, growth: 2.4, minEdu: 'secondary', minSmarts: 55, minAge: 18, fame: 5, difficulty: 0.3, stress: 2 },
  { id: 'streamer', icon: '🎮', category: 'Art & médias', levels: ['Petit streamer', 'Streamer partenaire', 'Influenceur star'], salary: 6000, growth: 3, minEdu: 'none', minAge: 15, fame: 8, difficulty: 0.25, stress: 3 },
  // Sport
  { id: 'footballer', icon: '⚽', category: 'Sport', levels: ['Joueur amateur', 'Joueur pro', 'Titulaire en 1re division', 'Ballon d’or'], salary: 25000, growth: 2.6, minEdu: 'none', minFitness: 80, minAge: 16, maxAge: 36, fame: 10, difficulty: 0.65, stress: 5 },
  { id: 'coach', icon: '🏋️', category: 'Sport', levels: ['Coach sportif', 'Préparateur physique', 'Entraîneur national'], salary: 32000, growth: 1.4, minEdu: 'secondary', minFitness: 65, minAge: 18, difficulty: 0.3, stress: 3 },
  // Prestige
  { id: 'astronaut', icon: '🚀', category: 'Prestige', levels: ['Candidat astronaute', 'Astronaute', 'Commandant de mission'], salary: 110000, growth: 1.25, minEdu: 'doctorate', majors: ['engineering', 'medicine', 'biology', 'cs'], minSmarts: 85, minFitness: 70, minAge: 27, maxAge: 50, fame: 7, difficulty: 0.85, stress: 7 },
  { id: 'ceo', icon: '💼', category: 'Prestige', levels: ['Directeur adjoint', 'Directeur général', 'PDG du CAC 40'], salary: 180000, growth: 1.9, minEdu: 'master', majors: ['business', 'engineering', 'law', 'cs'], minSmarts: 70, minAge: 32, fame: 4, difficulty: 0.8, stress: 9 },
];

export const getJob = (id: string | undefined | null) => JOBS.find((j) => j.id === id) ?? null;

export const jobTitle = (id: string, level: number) => {
  const j = getJob(id);
  if (!j) return 'Inconnu';
  return j.levels[Math.min(level, j.levels.length - 1)];
};

/** Jobs people around you may have (for flavour). */
export const NPC_JOBS = JOBS.filter((j) => !j.partTime).map((j) => j.levels[Math.min(1, j.levels.length - 1)]);

import type { Character, LogEntry, Person } from '../types';
import { adjust, children, fame, fullName, karma, local, partner, parents } from '../engine/helpers';
import { chance, float, int, pick } from '../rng';
import { money } from '@/lib/format';
import { makePerson } from '../engine/create';
import { getCountry } from './countries';
import { petName } from '../names';

export interface Outcome {
  text: string;
  tone?: LogEntry['tone'];
}

export interface EventChoice {
  label: string;
  run: (c: Character, p?: Person) => Outcome;
}

type Text = string | ((c: Character, p?: Person) => string);

export interface GameEvent {
  id: string;
  icon: string;
  minAge: number;
  maxAge: number;
  weight: number;
  once?: boolean;
  /** Allowed while in prison */
  prison?: boolean;
  when?: (c: Character) => boolean;
  person?: (c: Character) => Person | undefined;
  title: Text;
  text: Text;
  choices?: EventChoice[];
  run?: (c: Character, p?: Person) => Outcome;
}

const good = (text: string): Outcome => ({ text, tone: 'good' });
const bad = (text: string): Outcome => ({ text, tone: 'bad' });
const meh = (text: string): Outcome => ({ text, tone: 'neutral' });

const sibling = (c: Character) => {
  const s = c.relations.filter((r) => r.alive && r.relation === 'sibling');
  return s.length ? pick(s) : undefined;
};
const friend = (c: Character) => {
  const f = c.relations.filter((r) => r.alive && r.relation === 'friend');
  return f.length ? pick(f) : undefined;
};
const aParent = (c: Character) => {
  const p = parents(c).filter((r) => r.alive);
  return p.length ? pick(p) : undefined;
};
const aChild = (c: Character) => {
  const k = children(c).filter((r) => r.alive);
  return k.length ? pick(k) : undefined;
};
const locale = (c: Character) => getCountry(c.countryCode).locale;

export const EVENTS: GameEvent[] = [
  // ───────────── Childhood ─────────────
  {
    id: 'first_word', icon: '🗣️', minAge: 1, maxAge: 2, weight: 6, once: true,
    title: 'Premier mot', text: '',
    run: (c) => {
      const w = pick(['« maman »', '« papa »', '« non »', '« gâteau »', '« chat »', '« encore »', '« pourquoi »']);
      adjust(c, 'smarts', 2);
      return good(`Ton premier mot était ${w}. Toute la famille est aux anges.`);
    },
  },
  {
    id: 'first_steps', icon: '👣', minAge: 1, maxAge: 2, weight: 5, once: true,
    title: 'Premiers pas', text: '',
    run: (c) => {
      adjust(c, 'fitness', 2);
      return good('Tu as fait tes premiers pas… droit dans la table basse.');
    },
  },
  {
    id: 'toddler_tantrum', icon: '😤', minAge: 2, maxAge: 5, weight: 4, person: aParent,
    title: 'Le caprice du supermarché',
    text: (c, p) => `Au supermarché, tu veux absolument un paquet de bonbons. ${p ? (p.relation === 'mother' ? 'Ta mère' : 'Ton père') : 'Ton parent'} refuse.`,
    choices: [
      { label: 'Hurler par terre', run: (c, p) => { if (p) p.closeness -= 6; adjust(c, 'happiness', chance(0.4) ? 5 : -3); return bad('Tu t’es roulé·e par terre en hurlant. Tout le magasin te regarde.'); } },
      { label: 'Faire les yeux doux', run: (c, p) => { if (chance(0.5 + c.stats.looks / 250)) { adjust(c, 'happiness', 6); return good('Ça a marché ! Tu repars avec tes bonbons.'); } if (p) p.closeness += 1; return meh('Raté, mais au moins tu es resté·e sage.'); } },
      { label: 'Accepter sagement', run: (c, p) => { if (p) p.closeness += 4; karma(c, 2); return good('Tes parents sont fiers de toi.'); } },
    ],
  },
  {
    id: 'imaginary_friend', icon: '👻', minAge: 3, maxAge: 7, weight: 2, once: true,
    title: 'Ami imaginaire', text: 'Tu t’es inventé un ami imaginaire nommé Bidule. Il veut que tu dessines sur les murs.',
    choices: [
      { label: 'Dessiner sur les murs', run: (c) => { adjust(c, 'happiness', 4); return bad('Ton chef-d’œuvre mural a valu une sévère punition.'); } },
      { label: 'Dire non à Bidule', run: (c) => { adjust(c, 'smarts', 2); return good('Bidule est vexé et disparaît pour toujours.'); } },
    ],
  },
  {
    id: 'pet_found', icon: '🐶', minAge: 5, maxAge: 70, weight: 2,
    title: 'Un animal abandonné',
    text: (c) => `Tu trouves un ${pick(['chiot', 'chaton', 'lapin'])} abandonné près de chez toi${c.age < 18 ? '. Tes parents te laissent décider.' : '.'}`,
    choices: [
      { label: 'L’adopter', run: (c) => { const species = pick(['Chien', 'Chat', 'Lapin']); const pet = makePerson('en', 'pet', { age: int(0, 2) }); pet.firstName = petName(); pet.lastName = ''; pet.species = species; pet.closeness = 80; c.relations.push(pet); adjust(c, 'happiness', 8); karma(c, 5); return good(`Tu as adopté ${pet.firstName}, ton nouveau compagnon (${species.toLowerCase()}).`); } },
      { label: 'L’emmener au refuge', run: (c) => { karma(c, 3); return meh('Tu l’as déposé au refuge. Il trouvera sûrement une famille.'); } },
      { label: 'L’ignorer', run: (c) => { karma(c, -3); return bad('Tu passes ton chemin. Ses petits yeux te hantent.'); } },
    ],
  },
  {
    id: 'sibling_fight', icon: '🥊', minAge: 4, maxAge: 17, weight: 3, person: sibling,
    when: (c) => c.relations.some((r) => r.relation === 'sibling' && r.alive),
    title: (c, p) => `${p?.firstName} t’embête`,
    text: (c, p) => `${p?.firstName} a cassé ton jouet préféré et rigole.`,
    choices: [
      { label: 'Le frapper', run: (c, p) => { if (p) p.closeness -= 12; karma(c, -2); return bad(`Tu as frappé ${p?.firstName}. Vous êtes tous les deux punis.`); } },
      { label: 'Le dire aux parents', run: (c, p) => { if (p) p.closeness -= 4; return meh(`${p?.firstName} est privé de dessert.`); } },
      { label: 'Pardonner', run: (c, p) => { if (p) p.closeness += 8; karma(c, 3); return good(`Tu pardonnes à ${p?.firstName}. Vous êtes plus proches que jamais.`); } },
    ],
  },
  {
    id: 'school_bully', icon: '😠', minAge: 7, maxAge: 16, weight: 3,
    title: 'Le caïd de la cour',
    text: 'Un élève plus grand exige ton goûter tous les jours.',
    choices: [
      { label: 'Lui tenir tête', run: (c) => { if (chance(0.3 + c.stats.fitness / 200)) { adjust(c, 'happiness', 8); return good('Tu l’as remis à sa place. Respect total dans la cour.'); } adjust(c, 'health', -8); return bad('Il t’a mis une raclée. Tu rentres avec un œil au beurre noir.'); } },
      { label: 'Prévenir un surveillant', run: (c) => { adjust(c, 'happiness', 2); return meh('Le caïd est convoqué. Il te regarde de travers maintenant.'); } },
      { label: 'Donner le goûter', run: (c) => { adjust(c, 'happiness', -6); return bad('Tu as faim tous les après-midi.'); } },
    ],
  },
  {
    id: 'new_friend_school', icon: '🤝', minAge: 6, maxAge: 22, weight: 4,
    title: 'Nouvel ami', text: '',
    run: (c) => {
      const f = makePerson(locale(c), 'friend', { age: c.age + int(-1, 1), countryCode: c.countryCode });
      c.relations.push(f);
      adjust(c, 'happiness', 4);
      return good(`Tu es devenu·e ami·e avec ${fullName(f)} ${c.education.enrolled ? 'à l’école' : 'dans le quartier'}.`);
    },
  },
  {
    id: 'friend_loan', icon: '🫴', minAge: 16, maxAge: 90, weight: 2, person: friend,
    title: (c, p) => `${p?.firstName} a besoin d’aide`,
    text: (c, p) => `${p?.firstName}, ton ami·e, traverse une mauvaise passe et te demande ${money(local(c, 1500))}.`,
    choices: [
      { label: 'Prêter l’argent', run: (c, p) => { const amt = local(c, 1500); c.money -= amt; karma(c, 5); if (p) p.closeness += 15; if (chance(0.6)) { c.money += amt; return good(`${p?.firstName} t’a remboursé·e quelques mois plus tard. Une amitié en or.`); } return meh(`${p?.firstName} ne t’a jamais remboursé·e…`); } },
      { label: 'Refuser', run: (c, p) => { if (p) p.closeness -= 15; return bad(`${p?.firstName} est très déçu·e.`); } },
      { label: 'Lui faire la morale', run: (c, p) => { if (p) p.closeness -= 25; karma(c, -2); return bad(`${p?.firstName} t’a raccroché au nez.`); } },
    ],
  },
  {
    id: 'friend_trip', icon: '🚐', minAge: 16, maxAge: 70, weight: 1.5, person: friend,
    title: 'Road trip !', text: (c, p) => `${p?.firstName} te propose un road trip improvisé ce week-end.`,
    choices: [
      { label: 'Partir à l’aventure', run: (c, p) => { adjust(c, 'happiness', 10); if (p) p.closeness += 12; if (chance(0.1)) { adjust(c, 'health', -8); return bad('Le van est tombé en panne en plein désert. Coup de soleil garanti.'); } return good('Des souvenirs pour la vie !'); } },
      { label: 'Décliner', run: (c, p) => { if (p) p.closeness -= 5; return meh('Tu restes à la maison.'); } },
    ],
  },
  {
    id: 'talent_show', icon: '🎤', minAge: 8, maxAge: 17, weight: 2,
    title: 'Spectacle de l’école', text: 'L’école organise un spectacle de talents.',
    choices: [
      { label: 'Chanter', run: (c) => { if (chance(c.stats.looks / 150 + 0.2)) { adjust(c, 'happiness', 10); fame(c, 2); return good('Standing ovation ! On parle de toi dans toute l’école.'); } adjust(c, 'happiness', -6); return bad('Ta voix a déraillé devant 300 personnes.'); } },
      { label: 'Faire de la magie', run: (c) => { if (chance(c.stats.smarts / 140)) { adjust(c, 'happiness', 8); return good('Le lapin est sorti du chapeau. Magique !'); } return bad('Le lapin s’est enfui dans le gymnase.'); } },
      { label: 'Rester dans le public', run: () => meh('Tu applaudis poliment les autres.') },
    ],
  },
  {
    id: 'lost_tooth', icon: '🦷', minAge: 6, maxAge: 8, weight: 3, once: true,
    title: 'Petite souris', text: '',
    run: (c) => { c.money += local(c, 2); return good('Tu as perdu ta première dent. La petite souris est passée !'); },
  },
  {
    id: 'science_fair', icon: '🔬', minAge: 9, maxAge: 17, weight: 2,
    when: (c) => !!c.education.enrolled,
    title: 'Concours de sciences', text: 'Ton professeur te propose de participer au concours de sciences.',
    choices: [
      { label: 'Volcan en bicarbonate', run: (c) => { adjust(c, 'smarts', 2); return meh('Classique mais efficace. Tu finis 5e.'); } },
      { label: 'Robot fait maison', run: (c) => { if (chance(c.stats.smarts / 110)) { adjust(c, 'smarts', 6); c.education.performance += 10; return good('Ton robot a gagné le premier prix !'); } return bad('Ton robot a pris feu devant le jury.'); } },
      { label: 'Refuser', run: () => meh('Tu préfères jouer aux jeux vidéo.') },
    ],
  },
  {
    id: 'broken_arm', icon: '🦴', minAge: 5, maxAge: 16, weight: 2,
    title: 'Chute', text: '',
    run: (c) => { adjust(c, 'health', -10); return bad(`Tu es tombé·e ${pick(['d’un arbre', 'de vélo', 'd’un toboggan', 'en skate'])} et tu t’es cassé le bras.`); },
  },
  {
    id: 'cheat_exam', icon: '📝', minAge: 10, maxAge: 25, weight: 3,
    when: (c) => !!c.education.enrolled,
    title: 'Examen important', text: 'Un camarade te propose les réponses de l’examen de demain.',
    choices: [
      { label: 'Prendre les réponses', run: (c) => { karma(c, -5); if (chance(0.25)) { c.education.performance -= 20; return bad('Tu t’es fait prendre ! Zéro et convocation chez le directeur.'); } c.education.performance += 12; return good('Excellente note… mais à quel prix ?'); } },
      { label: 'Réviser toute la nuit', run: (c) => { adjust(c, 'smarts', 3); adjust(c, 'health', -2); c.education.performance += 6; return good('Ta nuit blanche a payé.'); } },
      { label: 'Dénoncer le camarade', run: (c) => { karma(c, 2); adjust(c, 'happiness', -3); return meh('Justice est faite, mais tu passes pour une balance.'); } },
    ],
  },
  {
    id: 'puberty', icon: '🌱', minAge: 12, maxAge: 14, weight: 6, once: true,
    title: 'Puberté', text: '',
    run: (c) => { const d = int(-12, 12); adjust(c, 'looks', d); return d >= 0 ? good('La puberté t’a plutôt réussi.') : bad('La puberté est cruelle : boutons et voix qui déraille.'); },
  },
  {
    id: 'first_crush', icon: '💘', minAge: 12, maxAge: 17, weight: 3, once: true,
    title: 'Premier béguin', text: 'Tu as le béguin pour quelqu’un de ta classe.',
    choices: [
      { label: 'Lui déclarer ta flamme', run: (c) => { if (chance(c.stats.looks / 130 + 0.15)) { const p = makePerson(locale(c), 'partner', { age: c.age, countryCode: c.countryCode, gender: c.gender === 'M' ? 'F' : 'M' }); p.together = 0; c.relations.push(p); adjust(c, 'happiness', 12); return good(`${p.firstName} a dit oui ! Ton premier amour.`); } adjust(c, 'happiness', -10); return bad('Un « non » cinglant devant tout le monde. Aïe.'); } },
      { label: 'Écrire un poème anonyme', run: (c) => { adjust(c, 'smarts', 2); return meh('Ton poème circule dans le collège. Personne ne sait que c’est toi.'); } },
      { label: 'Garder ça pour toi', run: () => meh('Tu soupires en silence.') },
    ],
  },
  {
    id: 'party_invite', icon: '🎉', minAge: 14, maxAge: 19, weight: 3,
    title: 'Grosse soirée', text: 'Tu es invité·e à une soirée chez un lycéen populaire. Tes parents ne sont pas au courant.',
    choices: [
      { label: 'Faire le mur', run: (c) => { if (chance(0.35)) { adjust(c, 'happiness', -5); parents(c).forEach((p) => (p.closeness -= 8)); return bad('Tes parents t’ont attendu·e dans le salon à 3 h du matin…'); } adjust(c, 'happiness', 10); fame(c, 1); return good('Soirée légendaire. Tu es enfin populaire.'); } },
      { label: 'Demander la permission', run: (c) => { if (chance(0.5)) { adjust(c, 'happiness', 6); return good('Ils ont dit oui ! Soirée sympa.'); } return meh('Refusé. Tu passes la soirée devant Netflix.'); } },
      { label: 'Rester réviser', run: (c) => { adjust(c, 'smarts', 2); c.education.performance += 3; return meh('Studieux·se jusqu’au bout.'); } },
    ],
  },
  {
    id: 'driving_test', icon: '🚦', minAge: 17, maxAge: 30, weight: 5, once: true,
    title: 'Permis de conduire', text: 'C’est le jour de l’examen du permis.',
    choices: [
      { label: 'Passer l’examen', run: (c) => { if (chance(0.45 + c.stats.smarts / 200)) { c.flags.license = true; adjust(c, 'happiness', 8); return good('Permis obtenu du premier coup !'); } adjust(c, 'happiness', -5); return bad('Recalé·e pour un stop mal marqué.'); } },
      { label: 'Reporter', run: () => meh('Tu reportes l’examen. Les transports en commun, c’est bien aussi.') },
    ],
  },
  // ───────────── Adult life ─────────────
  {
    id: 'found_wallet', icon: '👛', minAge: 8, maxAge: 90, weight: 3,
    title: 'Portefeuille trouvé', text: (c) => `Tu trouves un portefeuille contenant ${money(local(c, 300))} dans la rue.`,
    choices: [
      { label: 'Le rapporter', run: (c) => { karma(c, 8); adjust(c, 'happiness', 3); if (chance(0.3)) { c.money += local(c, 100); return good('Le propriétaire te remercie avec une récompense !'); } return good('Le propriétaire te remercie chaleureusement.'); } },
      { label: 'Garder l’argent', run: (c) => { karma(c, -8); c.money += local(c, 300); return meh('Argent facile… ta conscience te gratte un peu.'); } },
    ],
  },
  {
    id: 'stranger_help', icon: '🧓', minAge: 10, maxAge: 90, weight: 2,
    title: 'Une vieille dame en difficulté', text: 'Une vieille dame a du mal à porter ses courses dans l’escalier.',
    choices: [
      { label: 'L’aider', run: (c) => { karma(c, 6); adjust(c, 'happiness', 4); if (chance(0.1)) { c.money += local(c, 5000); return good('Elle insiste pour te glisser un chèque. Elle était millionnaire !'); } return good('Elle te remercie avec un grand sourire.'); } },
      { label: 'Passer ton chemin', run: (c) => { karma(c, -3); return meh('Tu fais semblant de ne pas la voir.'); } },
    ],
  },
  {
    id: 'job_offer_random', icon: '📨', minAge: 22, maxAge: 60, weight: 1.5,
    when: (c) => !!c.career && !c.prison,
    title: 'Chasseur de têtes', text: 'Un chasseur de têtes te propose un poste équivalent avec 25 % d’augmentation… mais à l’autre bout du pays.',
    choices: [
      { label: 'Accepter', run: (c) => { if (c.career) c.career.salary = Math.round(c.career.salary * 1.25); adjust(c, 'happiness', -3); c.relations.filter((r) => r.relation === 'friend').forEach((f) => (f.closeness -= 15)); return good('Nouveau départ, nouveau salaire !'); } },
      { label: 'Refuser', run: (c) => { adjust(c, 'happiness', 2); return meh('Tu restes près de tes proches.'); } },
    ],
  },
  {
    id: 'work_affair', icon: '💋', minAge: 20, maxAge: 65, weight: 1.5,
    when: (c) => !!partner(c) && !!c.career,
    title: 'Tentation au bureau', text: 'Un·e collègue charmant·e te fait des avances lors du séminaire.',
    choices: [
      { label: 'Céder', run: (c) => { const p = partner(c)!; karma(c, -10); if (chance(0.45)) { p.closeness -= 50; adjust(c, 'happiness', -10); return bad(`${p.firstName} a tout découvert. C’est la crise.`); } adjust(c, 'happiness', 5); return meh('Personne n’en saura rien… pour l’instant.'); } },
      { label: 'Refuser poliment', run: (c) => { karma(c, 4); const p = partner(c)!; p.closeness += 4; return good('Tu restes fidèle.'); } },
    ],
  },
  {
    id: 'inheritance_uncle', icon: '📜', minAge: 18, maxAge: 80, weight: 0.6, once: true,
    title: 'Héritage inattendu', text: '',
    run: (c) => { const amt = local(c, int(5000, 250000)); c.money += amt; return good(`Un grand-oncle dont tu ignorais l’existence t’a légué ${money(amt)}.`); },
  },
  {
    id: 'car_accident', icon: '💥', minAge: 18, maxAge: 90, weight: 1.2,
    when: (c) => c.assets.some((a) => a.kind === 'car'),
    title: 'Accident de voiture', text: '',
    run: (c) => {
      const car = c.assets.find((a) => a.kind === 'car')!;
      car.condition = Math.max(0, car.condition - int(20, 70));
      car.value = Math.round(car.value * 0.6);
      adjust(c, 'health', -int(5, 25));
      return bad(`Tu as eu un accident avec ton véhicule (${car.name}). Gros dégâts et quelques points de suture.`);
    },
  },
  {
    id: 'scam_call', icon: '📞', minAge: 25, maxAge: 95, weight: 2,
    when: (c) => c.money > 500,
    title: 'Appel suspect', text: 'Un « conseiller bancaire » t’appelle : ton compte serait piraté, il te faut confirmer tes codes.',
    choices: [
      { label: 'Donner tes codes', run: (c) => { const loss = Math.round(Math.max(0, c.money) * 0.3); c.money -= loss; adjust(c, 'happiness', -10); return bad(`C’était une arnaque. Tu as perdu ${money(loss)}.`); } },
      { label: 'Raccrocher', run: (c) => { adjust(c, 'smarts', 1); return good('Bien joué, c’était une arnaque.'); } },
    ],
  },
  {
    id: 'promotion_party', icon: '🥂', minAge: 20, maxAge: 70, weight: 2,
    when: (c) => !!c.career,
    title: 'Pot de départ', text: 'Ton patron organise un pot. Il y a un karaoké.',
    choices: [
      { label: 'Monter sur scène', run: (c) => { if (c.career) c.career.performance += chance(0.6) ? 6 : -4; adjust(c, 'happiness', 6); return meh('Ta reprise de Céline Dion restera dans les annales.'); } },
      { label: 'Discuter avec le patron', run: (c) => { if (c.career) c.career.performance += 5; return good('Ton patron t’apprécie beaucoup.'); } },
      { label: 'Partir tôt', run: () => meh('Tu rentres te coucher.') },
    ],
  },
  {
    id: 'lottery_ticket_gift', icon: '🎟️', minAge: 18, maxAge: 99, weight: 1,
    title: 'Ticket à gratter', text: 'Un ami t’offre un ticket à gratter pour ton anniversaire.',
    run: (c) => {
      if (chance(0.02)) { const w = local(c, 50000); c.money += w; return good(`Incroyable, tu gagnes ${money(w)} !`); }
      if (chance(0.25)) { const w = local(c, 20); c.money += w; return good(`Tu gagnes ${money(w)}. C’est déjà ça.`); }
      return meh('Perdu. Comme d’habitude.');
    },
  },
  {
    id: 'viral_video', icon: '📱', minAge: 13, maxAge: 60, weight: 1,
    title: 'Vidéo virale', text: '',
    run: (c) => { const g = int(3, 15); fame(c, g); return chance(0.6) ? good('Une vidéo de toi est devenue virale ! Des millions de vues.') : bad('Une vidéo gênante de toi est devenue virale…'); },
  },
  {
    id: 'parent_gift', icon: '🎁', minAge: 18, maxAge: 40, weight: 1.5, person: aParent,
    when: (c) => parents(c).some((p) => p.alive && p.money > 1000),
    title: 'Coup de pouce', text: '',
    run: (c, p) => {
      if (!p) return meh('');
      const amt = Math.round(Math.min(p.money * 0.15, local(c, 20000)));
      p.money -= amt; c.money += amt;
      return good(`${p.relation === 'mother' ? 'Ta mère' : 'Ton père'} t’a offert ${money(amt)} pour t’aider.`);
    },
  },
  {
    id: 'proposal_received', icon: '💍', minAge: 20, maxAge: 70, weight: 3, person: partner,
    when: (c) => { const p = partner(c); return !!p && p.relation === 'partner' && (p.together ?? 0) >= 2 && p.closeness > 60; },
    title: (c, p) => `${p?.firstName} te demande en mariage !`,
    text: (c, p) => `Après ${p?.together} ans ensemble, ${p?.firstName} pose un genou à terre.`,
    choices: [
      { label: 'Oui !', run: (c, p) => { if (p) { p.relation = 'spouse'; p.closeness += 15; } c.flags.married = true; adjust(c, 'happiness', 20); return good(`Tu as épousé ${p?.firstName} ! Quelle belle cérémonie.`); } },
      { label: 'Pas encore', run: (c, p) => { if (p) p.closeness -= 20; return bad(`${p?.firstName} est blessé·e.`); } },
      { label: 'Rompre', run: (c, p) => { if (p) { p.relation = 'ex'; p.closeness = 10; } adjust(c, 'happiness', -10); return bad('Tu as rompu. Moment très gênant.'); } },
    ],
  },
  {
    id: 'baby_news', icon: '🤰', minAge: 18, maxAge: 48, weight: 1.5, person: partner,
    when: (c) => !!partner(c) && (partner(c)!.together ?? 0) >= 1 && children(c).length < 6,
    title: 'Grande nouvelle', text: (c, p) => `${p?.firstName} et toi attendez un enfant… par surprise !`,
    choices: [
      { label: 'Garder le bébé', run: (c, p) => {
        const kid = makePerson(locale(c), 'child', { age: 0, lastName: c.lastName, countryCode: c.countryCode });
        kid.closeness = 90; c.relations.push(kid); adjust(c, 'happiness', 12);
        if (p) p.closeness += 10;
        return good(`Bienvenue à ${kid.firstName}, ${kid.gender === 'F' ? 'ta fille' : 'ton fils'} !`);
      } },
      { label: 'Ce n’est pas le moment', run: (c, p) => { if (p) p.closeness -= 10; adjust(c, 'happiness', -5); return meh('Décision difficile, mais réfléchie.'); } },
    ],
  },
  {
    id: 'child_trouble', icon: '🧒', minAge: 25, maxAge: 80, weight: 2, person: aChild,
    when: (c) => children(c).some((k) => k.alive && k.age >= 8 && k.age <= 18),
    title: (c, p) => `${p?.firstName} fait des bêtises`,
    text: (c, p) => `${p?.firstName} s’est fait renvoyer de cours pour avoir ${pick(['tagué les toilettes', 'insulté un professeur', 'triché', 'séché trois semaines'])}.`,
    choices: [
      { label: 'Le punir', run: (c, p) => { if (p) { p.closeness -= 8; p.smarts += 3; } return meh('Privé·e d’écrans pendant un mois.'); } },
      { label: 'Discuter calmement', run: (c, p) => { if (p) p.closeness += 6; karma(c, 2); return good('Une vraie discussion. Ça l’a fait réfléchir.'); } },
      { label: 'S’en moquer', run: (c, p) => { if (p) p.closeness -= 3; return bad('Laisser-faire total.'); } },
    ],
  },
  {
    id: 'child_success', icon: '🏅', minAge: 30, maxAge: 99, weight: 1.5, person: aChild,
    when: (c) => children(c).some((k) => k.alive && k.age >= 18),
    title: 'Fierté parentale', text: '',
    run: (c, p) => { adjust(c, 'happiness', 6); return good(`${p?.firstName} a ${pick(['décroché son diplôme', 'été promu·e', 'gagné un concours', 'acheté sa première maison', 'ouvert son entreprise'])}. Tu es si fier·e !`); },
  },
  {
    id: 'grandchild', icon: '👶', minAge: 40, maxAge: 99, weight: 1.5, person: aChild,
    when: (c) => children(c).some((k) => k.alive && k.age >= 22),
    title: 'Grand-parent !', text: '',
    run: (c, p) => { c.flags.grandchildren = ((c.flags.grandchildren as number) ?? 0) + 1; adjust(c, 'happiness', 8); return good(`${p?.firstName} a eu un bébé. Tu es grand-parent !`); },
  },
  {
    id: 'midlife', icon: '🏍️', minAge: 40, maxAge: 52, weight: 2, once: true,
    title: 'Crise de la quarantaine', text: 'Tu ressens soudain l’envie irrésistible de tout changer.',
    choices: [
      { label: 'Acheter une moto', run: (c) => { const cost = local(c, 15000); c.money -= cost; adjust(c, 'happiness', 10); return meh(`Tu as claqué ${money(cost)} dans une moto rutilante.`); } },
      { label: 'Faire un marathon', run: (c) => { adjust(c, 'fitness', 10); adjust(c, 'health', 5); return good('Tu as couru ton premier marathon !'); } },
      { label: 'Teindre tes cheveux', run: (c) => { adjust(c, 'looks', chance(0.5) ? 5 : -5); return meh('Le résultat est… audacieux.'); } },
    ],
  },
  {
    id: 'neighbor_dispute', icon: '🏘️', minAge: 20, maxAge: 99, weight: 1.5,
    when: (c) => c.assets.some((a) => a.kind === 'house'),
    title: 'Voisin bruyant', text: 'Ton voisin organise des fêtes jusqu’à 4 h du matin chaque week-end.',
    choices: [
      { label: 'Appeler la police', run: (c) => { adjust(c, 'happiness', 3); return meh('Le calme revient. Le voisin ne te dit plus bonjour.'); } },
      { label: 'Aller faire la fête avec lui', run: (c) => { adjust(c, 'happiness', 8); adjust(c, 'health', -3); const f = makePerson(locale(c), 'friend', { age: c.age + int(-10, 10), countryCode: c.countryCode }); c.relations.push(f); return good(`Tu t’es fait un nouvel ami : ${f.firstName} !`); } },
      { label: 'Mettre des boules Quies', run: (c) => { adjust(c, 'happiness', -3); return meh('Tu dors mal mais tu évites le conflit.'); } },
    ],
  },
  {
    id: 'charity', icon: '🙏', minAge: 18, maxAge: 99, weight: 1.5,
    when: (c) => c.money > 1000,
    title: 'Appel aux dons', text: 'Une association humanitaire te sollicite pour un don.',
    choices: [
      { label: 'Donner 10 % de ton argent', run: (c) => { const d = Math.round(c.money * 0.1); c.money -= d; karma(c, 12); adjust(c, 'happiness', 6); return good(`Tu as donné ${money(d)}. Ton geste va changer des vies.`); } },
      { label: 'Donner un petit montant', run: (c) => { c.money -= local(c, 20); karma(c, 3); return good('Chaque geste compte.'); } },
      { label: 'Refuser', run: (c) => { karma(c, -1); return meh('Pas cette fois.'); } },
    ],
  },
  {
    id: 'natural_disaster', icon: '🌪️', minAge: 0, maxAge: 99, weight: 0.5,
    title: 'Catastrophe naturelle', text: '',
    run: (c) => {
      const what = pick(['Un séisme', 'Une inondation', 'Un ouragan', 'Un incendie de forêt']);
      adjust(c, 'health', -int(0, 15)); adjust(c, 'happiness', -10);
      c.assets.filter((a) => a.kind === 'house').forEach((h) => { h.condition = Math.max(0, h.condition - 30); h.value = Math.round(h.value * 0.8); });
      return bad(`${what} a frappé ${c.city}. Ta maison et ton moral en ont pris un coup.`);
    },
  },
  {
    id: 'market_crash', icon: '📉', minAge: 18, maxAge: 99, weight: 0.4,
    when: (c) => Object.values(c.holdings).some((v) => v > 0),
    title: 'Krach boursier', text: '',
    run: (c) => {
      for (const s of Object.keys(c.market.prices)) c.market.prices[s] = Math.max(0.5, c.market.prices[s] * float(0.55, 0.75));
      adjust(c, 'happiness', -8);
      return bad('Krach boursier mondial ! Tes placements ont fondu.');
    },
  },
  {
    id: 'celebrity_meet', icon: '⭐', minAge: 12, maxAge: 99, weight: 0.8,
    title: 'Rencontre inattendue', text: () => `Tu croises ${pick(['un acteur célèbre', 'une chanteuse mondialement connue', 'un footballeur star', 'une milliardaire de la tech'])} dans un café.`,
    choices: [
      { label: 'Demander un selfie', run: (c) => { adjust(c, 'happiness', 6); return good('Le selfie fait un carton sur tes réseaux !'); } },
      { label: 'Lui proposer un projet', run: (c) => { if (chance(0.1 + c.stats.smarts / 400)) { const g = local(c, 30000); c.money += g; fame(c, 5); return good(`Coup de génie : on t’investit ${money(g)} !`); } return bad('Ses gardes du corps t’ont éconduit·e.'); } },
      { label: 'Rester cool', run: () => meh('Tu fais comme si de rien n’était. La classe.') },
    ],
  },
  {
    id: 'ufo', icon: '🛸', minAge: 10, maxAge: 99, weight: 0.15, once: true,
    title: 'Lumières dans le ciel', text: 'Une nuit, tu observes une lumière étrange au-dessus des champs. Elle semble t’appeler.',
    choices: [
      { label: 'S’approcher', run: (c) => { adjust(c, 'smarts', 10); c.flags.abducted = true; return meh('Tu te réveilles trois jours plus tard dans un champ, sans souvenirs. Tu te sens… plus intelligent·e.'); } },
      { label: 'Filmer', run: (c) => { fame(c, 4); return meh('Ta vidéo floue alimente les forums complotistes.'); } },
      { label: 'Fuir', run: () => meh('Mieux vaut ne pas savoir.') },
    ],
  },
  {
    id: 'parent_sick', icon: '🏥', minAge: 15, maxAge: 80, weight: 1.5, person: aParent,
    when: (c) => parents(c).some((p) => p.alive && p.age > 55),
    title: (c, p) => `${p?.relation === 'mother' ? 'Ta mère' : 'Ton père'} est malade`,
    text: (c, p) => `${p?.firstName} est hospitalisé·e. Les frais médicaux sont élevés.`,
    choices: [
      { label: 'Payer les soins', run: (c, p) => { const cost = local(c, 8000); c.money -= cost; if (p) p.closeness += 15; karma(c, 6); return good(`Tu as payé ${money(cost)}. ${p?.firstName} se rétablit.`); } },
      { label: 'Lui rendre visite', run: (c, p) => { if (p) p.closeness += 8; adjust(c, 'happiness', -2); return good('Ta présence l’a beaucoup touché·e.'); } },
      { label: 'Ne rien faire', run: (c, p) => { if (p) p.closeness -= 15; karma(c, -5); return bad('Tu n’es pas venu·e.'); } },
    ],
  },
  {
    id: 'gym_injury', icon: '🏋️', minAge: 16, maxAge: 80, weight: 0.8,
    when: (c) => c.stats.fitness > 60,
    title: 'Blessure sportive', text: '',
    run: (c) => { adjust(c, 'health', -8); adjust(c, 'fitness', -6); return bad('Tu t’es déchiré un muscle à l’entraînement.'); },
  },
  {
    id: 'random_kindness', icon: '☀️', minAge: 5, maxAge: 99, weight: 2,
    title: 'Belle journée', text: '',
    run: (c) => { adjust(c, 'happiness', int(3, 8)); return good(pick(['Tu as vu un magnifique coucher de soleil.', 'Un inconnu t’a offert un café.', 'Tu as retrouvé un vieil ami par hasard.', 'Tu as ri aux larmes toute la soirée.', 'Ta série préférée a sorti une nouvelle saison.'])); },
  },
  {
    id: 'bad_day', icon: '🌧️', minAge: 5, maxAge: 99, weight: 2,
    title: 'Mauvaise passe', text: '',
    run: (c) => { adjust(c, 'happiness', -int(3, 8)); return bad(pick(['Un pigeon t’a pris pour cible.', 'Tu as raté ton bus trois fois cette semaine.', 'Ton téléphone est tombé dans les toilettes.', 'Tu t’es disputé·e avec un inconnu sur Internet.', 'Il a plu tout l’été.'])); },
  },
  {
    id: 'military_draft', icon: '🪖', minAge: 18, maxAge: 19, weight: 2, once: true,
    when: (c) => ['KR', 'IL', 'TR', 'RU', 'UA', 'IR', 'EG'].includes(c.countryCode) && c.gender === 'M',
    title: 'Service militaire', text: 'Tu es appelé pour le service militaire obligatoire.',
    choices: [
      { label: 'Servir', run: (c) => { adjust(c, 'fitness', 15); adjust(c, 'happiness', -6); karma(c, 2); return good('Tu as servi ton pays. Tu reviens musclé et discipliné.'); } },
      { label: 'Tenter de te faire réformer', run: (c) => { if (chance(0.35)) return meh('Réformé pour « pieds plats ». Ouf.'); adjust(c, 'happiness', -10); return bad('Ta ruse a échoué. Tu sers quand même… avec un sergent qui te déteste.'); } },
    ],
  },
  {
    id: 'pet_dies', icon: '🌈', minAge: 1, maxAge: 120, weight: 3,
    when: (c) => c.relations.some((r) => r.relation === 'pet' && r.alive && r.age > 10),
    person: (c) => c.relations.find((r) => r.relation === 'pet' && r.alive && r.age > 10),
    title: 'Adieu, compagnon', text: '',
    run: (c, p) => { if (p) p.alive = false; adjust(c, 'happiness', -12); return bad(`${p?.firstName} s’est éteint paisiblement. Il te manquera.`); },
  },
  {
    id: 'stock_tip', icon: '💡', minAge: 20, maxAge: 85, weight: 1,
    title: 'Tuyau boursier', text: 'Un collègue te jure que KryptoCoin va « faire x10 ». Tout le monde en parle.',
    choices: [
      { label: 'Investir massivement', run: (c) => { const amt = Math.max(0, Math.round(c.money * 0.4)); const p = c.market.prices.KRPT; c.money -= amt; c.holdings.KRPT = (c.holdings.KRPT ?? 0) + amt / p; return meh(`Tu as placé ${money(amt)} en KryptoCoin. Croisons les doigts.`); } },
      { label: 'Ignorer', run: () => meh('Tu laisses les autres jouer au casino.') },
    ],
  },
  // ───────────── Prison ─────────────
  {
    id: 'prison_fight', icon: '🔪', minAge: 10, maxAge: 120, weight: 4, prison: true,
    when: (c) => !!c.prison,
    title: 'Embrouille au réfectoire', text: 'Un détenu costaud renverse ton plateau exprès.',
    choices: [
      { label: 'Le frapper', run: (c) => { if (chance(c.stats.fitness / 120)) { adjust(c, 'happiness', 5); c.flags.prisonRespect = true; return good('Tu l’as mis K.O. Plus personne ne t’embête.'); } adjust(c, 'health', -15); if (c.prison) c.prison.yearsLeft += 1; return bad('Tu finis à l’infirmerie, avec un an de peine en plus.'); } },
      { label: 'Ramasser ton plateau', run: (c) => { adjust(c, 'happiness', -5); return meh('Tu baisses les yeux. Prudence.'); } },
    ],
  },
  {
    id: 'prison_book', icon: '📖', minAge: 10, maxAge: 120, weight: 3, prison: true,
    when: (c) => !!c.prison,
    title: 'Bibliothèque de la prison', text: '',
    run: (c) => { adjust(c, 'smarts', 4); return good('Tu as dévoré tous les livres de la bibliothèque de la prison.'); },
  },
  // ───────────── Old age ─────────────
  {
    id: 'retirement_hobby', icon: '🪴', minAge: 62, maxAge: 99, weight: 2,
    title: 'Nouveau passe-temps', text: 'Tu as enfin du temps pour toi.',
    choices: [
      { label: 'Jardinage', run: (c) => { adjust(c, 'happiness', 6); adjust(c, 'health', 2); return good('Tes tomates sont les plus belles du quartier.'); } },
      { label: 'Club de bridge', run: (c) => { adjust(c, 'smarts', 4); const f = makePerson(locale(c), 'friend', { age: c.age + int(-5, 5), countryCode: c.countryCode }); c.relations.push(f); return good(`Tu y rencontres ${f.firstName}, un·e partenaire redoutable.`); } },
      { label: 'Voyager', run: (c) => { const cost = local(c, 5000); c.money -= cost; adjust(c, 'happiness', 10); return good('Tour du monde en croisière !'); } },
    ],
  },
  {
    id: 'grandchild_visit', icon: '🍪', minAge: 55, maxAge: 110, weight: 2,
    when: (c) => ((c.flags.grandchildren as number) ?? 0) > 0,
    title: 'Visite des petits-enfants', text: '',
    run: (c) => { adjust(c, 'happiness', 6); return good('Tes petits-enfants sont venus goûter. Tu leur as raconté ta jeunesse.'); },
  },
  {
    id: 'fall_old', icon: '🦯', minAge: 72, maxAge: 120, weight: 2,
    title: 'Chute', text: '',
    run: (c) => { adjust(c, 'health', -int(6, 18)); return bad('Tu as glissé dans la salle de bain. Col du fémur fragile…'); },
  },
  {
    id: 'memoirs', icon: '🖋️', minAge: 60, maxAge: 99, weight: 1, once: true,
    title: 'Mémoires', text: 'Un éditeur te propose d’écrire tes mémoires.',
    choices: [
      { label: 'Écrire', run: (c) => { const g = local(c, c.fame > 40 ? 300000 : 5000); c.money += g; fame(c, 3); return good(`Tes mémoires se vendent bien : ${money(g)} de droits d’auteur.`); } },
      { label: 'Garder tes secrets', run: () => meh('Certaines choses doivent rester privées.') },
    ],
  },
];

export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);

export const resolveText = (t: Text, c: Character, p?: Person) => (typeof t === 'function' ? t(c, p) : t);

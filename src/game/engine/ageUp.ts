import { clamp, maxBy } from 'lodash-es';
import type { Character, Person } from '../types';
import { getCountry, wealthFactor } from '../data/countries';
import { getJob, jobTitle } from '../data/jobs';
import { getItem } from '../data/catalog';
import { DISEASES, getDisease } from '../data/health';
import { EDU_LABEL, EDU_YEARS, getMajor } from '../data/education';
import { EVENTS, resolveText, type GameEvent } from '../data/events';
import { chance, float, int, weighted } from '../rng';
import { money } from '@/lib/format';
import { adjust, children, fame, local, log, netWorth, partner, relationLabel } from './helpers';
import { stepMarket } from './market';
import { die } from './death';

/** Yearly probability of dying, Gompertz-style around the country's life expectancy. */
export function mortality(age: number, lifeExpectancy: number, health = 60) {
  const base = 0.04 * Math.exp(0.09 * (age - lifeExpectancy));
  const healthFactor = clamp(1 + (55 - health) / 35, 0.35, 4);
  const infant = age < 5 ? 0.004 * (90 - lifeExpectancy) / 10 : 0;
  return clamp(base * healthFactor + infant, 0, 0.95);
}

function ageRelations(c: Character) {
  const country = getCountry(c.countryCode);
  for (const r of c.relations) {
    if (!r.alive) continue;
    r.age += 1;
    if (r.relation === 'partner' || r.relation === 'spouse') r.together = (r.together ?? 0) + 1;
    if (r.relation !== 'pet') r.closeness = clamp(r.closeness - int(1, 4), 0, 100);
    if (r.relation === 'child' && r.age === 18) log(c, `${r.firstName} a fêté ses 18 ans et quitte le nid.`, 'neutral', '🎈');
    if (r.relation === 'child' && r.age === 22 && chance(0.8)) r.job = jobTitle(['developer', 'teacher', 'nurse', 'chef', 'mechanic', 'lawyer'][int(0, 5)], 0);

    const lifeExp = r.relation === 'pet' ? 13 : country.lifeExpectancy;
    const p = r.relation === 'pet' ? (r.age > 10 ? 0.15 : 0.01) : mortality(r.age, lifeExp);
    if (r.relation !== 'pet' && chance(p)) relativeDies(c, r);
  }
}

function relativeDies(c: Character, r: Person) {
  r.alive = false;
  const close = ['mother', 'father', 'spouse', 'partner', 'child'].includes(r.relation);
  adjust(c, 'happiness', close ? -int(12, 25) : -int(3, 8));
  log(c, `${relationLabel(r)} ${r.firstName} est décédé·e à ${r.age} ans.`, 'bad', '🕯️');
  if ((r.relation === 'mother' || r.relation === 'father' || r.relation === 'spouse') && r.money > 0) {
    const heirs = 1 + (r.relation === 'spouse' ? 0 : c.relations.filter((s) => s.relation === 'sibling' && s.alive).length);
    const share = Math.round(r.money / heirs);
    c.money += share;
    if (share > 0) log(c, `Tu hérites de ${money(share)}.`, 'good', '📜');
  }
  if (r.relation === 'spouse') c.flags.widowed = true;
}

function naturalStats(c: Character) {
  const { age } = c;
  if (age < 18) adjust(c, 'fitness', chance(0.5) ? 1 : 0);
  if (age > 28) adjust(c, 'fitness', -float(0.5, 1.8));
  if (age > 35) adjust(c, 'looks', -float(0, age > 60 ? 1.6 : 0.8));
  // The body heals toward a baseline that sinks with age; fitness slows the decline.
  const baseline = clamp(94 - Math.max(0, age - 32) * 0.75 + (c.stats.fitness - 50) / 6 - (c.prison ? 8 : 0), 5, 100);
  adjust(c, 'health', (baseline - c.stats.health) * 0.2 + float(-2, 2));
  if (age > 78) adjust(c, 'smarts', -float(0, 1.5));
  if (age < 22) adjust(c, 'smarts', float(0, 1.5));

  // Happiness drifts toward a baseline shaped by circumstances.
  let target = 55;
  const p = partner(c);
  if (p) target += p.closeness > 50 ? 10 : -5;
  if (c.assets.some((a) => a.kind === 'house')) target += 5;
  if (c.prison) target -= 30;
  if (c.money < 0) target -= 12;
  if (c.career) target -= (getJob(c.career.jobId)?.stress ?? 0) * 1.5;
  if (c.diseases.length) target -= 8 * c.diseases.length;
  target += c.relations.filter((r) => r.alive && r.relation === 'pet').length * 3;
  target += Math.min(10, Math.log10(Math.max(1, netWorth(c))) - 3);
  adjust(c, 'happiness', (target - c.stats.happiness) * 0.25 + float(-3, 3));
}

function education(c: Character) {
  const e = c.education;
  const country = getCountry(c.countryCode);
  const access = clamp(0.6 + country.gdp / 8000, 0, 1);

  if (!e.enrolled && e.highest === 'none' && c.age === 6 && !c.prison) {
    if (chance(access)) {
      e.enrolled = 'primary';
      e.yearsLeft = EDU_YEARS.primary;
      e.performance = clamp(c.stats.smarts + int(-10, 10), 10, 90);
      log(c, 'C’est la rentrée : tu entres à l’école primaire !', 'neutral', '🎒');
    } else {
      log(c, 'Ta famille n’a pas les moyens de t’envoyer à l’école. Tu aides à la maison.', 'bad', '🧺');
      c.flags.noSchool = true;
    }
    return;
  }
  if (!e.enrolled) return;

  e.performance = clamp(e.performance + (c.stats.smarts - e.performance) * 0.2 + int(-6, 6), 0, 100);
  adjust(c, 'smarts', float(0.5, 2.5));

  if (['bachelor', 'master', 'doctorate'].includes(e.enrolled)) {
    const major = getMajor(e.major);
    const tuition = local(c, major?.tuition ?? 20000) * (e.enrolled === 'doctorate' ? 0.4 : 1);
    if (e.performance > 88) {
      log(c, 'Ton excellence t’a valu une bourse : frais de scolarité offerts cette année !', 'good', '🏅');
    } else if (c.money >= tuition) {
      c.money -= tuition;
    } else {
      c.debt += tuition;
    }
  }

  e.yearsLeft -= 1;
  if (e.yearsLeft > 0) return;

  const level = e.enrolled;
  if (e.performance < 30 && chance(0.6)) {
    e.yearsLeft = 1;
    log(c, `Résultats insuffisants : tu redoubles ta dernière année (${EDU_LABEL[level].toLowerCase()}).`, 'bad', '📉');
    return;
  }
  e.highest = level;
  e.degrees.push({ level, major: e.major, age: c.age });
  e.enrolled = null;

  if (level === 'primary') {
    if (chance(access) || c.money > 0) {
      e.enrolled = 'secondary';
      e.yearsLeft = EDU_YEARS.secondary;
      log(c, 'Tu termines l’école primaire et entres au collège.', 'good', '🏫');
    } else {
      log(c, 'Tu termines l’école primaire, mais tu dois commencer à travailler.', 'neutral', '🏫');
    }
  } else if (level === 'secondary') {
    log(c, `Tu obtiens ton baccalauréat${e.performance > 80 ? ' avec mention très bien' : e.performance > 60 ? ' avec mention' : ''} ! Tu peux t’inscrire à l’université depuis l’onglet Carrière.`, 'good', '🎓');
    adjust(c, 'happiness', 8);
  } else {
    const major = getMajor(e.major);
    log(c, `Diplômé·e ! Tu obtiens ton ${EDU_LABEL[level].toLowerCase()}${major ? ` en ${major.name.toLowerCase()}` : ''}.`, 'special', '🎓');
    adjust(c, 'happiness', 10);
  }
}

function work(c: Character) {
  const car = c.career;
  if (!car) return;
  const job = getJob(car.jobId)!;
  car.years += 1;
  c.money += Math.round(car.salary * 0.75);
  car.performance = clamp(car.performance + (c.stats.smarts - 50) / 20 + (c.stats.happiness - 50) / 25 + int(-6, 6), 0, 100);
  adjust(c, 'happiness', -float(0, job.stress / 2));
  if (job.fame) fame(c, job.fame * (car.level + 1) * 0.35 * float(0.3, 1.2));

  if (job.maxAge && c.age > job.maxAge && chance(0.5)) {
    log(c, `À ${c.age} ans, ta carrière de ${jobTitle(job.id, car.level).toLowerCase()} touche à sa fin.`, 'neutral', '⌛');
    endCareer(c);
    return;
  }
  if (car.performance < 15 && chance(0.55)) {
    log(c, `Tu as été licencié·e de ton poste de ${jobTitle(job.id, car.level).toLowerCase()}.`, 'bad', '📦');
    adjust(c, 'happiness', -15);
    endCareer(c);
    return;
  }
  const canPromote = car.level < job.levels.length - 1;
  if (canPromote && car.performance > 70 && chance(0.25 + (car.performance - 70) / 60)) {
    car.level += 1;
    car.salary = Math.round(local(c, job.salary * Math.pow(job.growth, car.level)) * float(0.95, 1.1));
    car.performance = 55;
    adjust(c, 'happiness', 10);
    log(c, `Promotion ! Tu deviens ${jobTitle(job.id, car.level).toLowerCase()} (${money(car.salary)}/an).`, 'special', '📈');
  } else {
    car.salary = Math.round(car.salary * 1.02);
  }
}

export function endCareer(c: Character) {
  if (!c.career) return;
  c.jobHistory.push({ jobId: c.career.jobId, title: jobTitle(c.career.jobId, c.career.level), years: c.career.years });
  c.career = null;
}

function finances(c: Character) {
  const independent = c.age >= 18 && !(c.education.enrolled && c.age < 23) && !c.prison;
  if (independent) {
    // Without income you scrape by: shared flat, family help, small odd jobs.
    const earning = !!c.career || c.retired;
    let cost = local(c, earning ? 11000 : 4500);
    if (c.assets.some((a) => a.kind === 'house')) cost *= 0.55;
    const p = partner(c);
    if (p && p.relation === 'spouse') cost *= 0.8;
    cost += children(c).filter((k) => k.alive && k.age < 18).length * local(c, earning ? 4500 : 2000);
    c.money -= Math.round(cost);
  }
  if (c.retired) c.money += c.pension;

  for (const a of c.assets) {
    const item = getItem(a.catalogId);
    c.money -= Math.round(a.value * item.upkeep);
    a.value = Math.max(0, Math.round(a.value * (1 + item.drift + float(-0.04, 0.04))));
    a.condition = clamp(a.condition - int(0, a.kind === 'car' ? 8 : 3), 0, 100);
  }

  if (c.debt > 0 && c.money > 0) {
    const pay = Math.min(c.debt, Math.max(c.money * 0.25, c.debt * 0.1));
    c.debt = Math.round(c.debt - pay);
    c.money = Math.round(c.money - pay);
    if (c.debt === 0) log(c, 'Tu as remboursé toutes tes dettes !', 'good', '🧾');
  }
  if (c.debt > 0) c.debt = Math.round(c.debt * 1.03);

  if (c.money < 0) {
    c.money = Math.round(c.money * 1.06);
    if (c.money < -local(c, 40000)) bankruptcy(c);
    else if (chance(0.4)) log(c, `Tu es à découvert (${money(c.money)}). Les agios s’accumulent…`, 'bad', '🏧');
  }
}

/** The bank seizes everything and wipes the slate. */
function bankruptcy(c: Character) {
  const seized = c.assets.length;
  c.assets = [];
  c.holdings = {};
  c.money = 0;
  c.debt = Math.round(c.debt * 0.3);
  c.flags.bankrupt = true;
  adjust(c, 'happiness', -18);
  log(c, `Faillite personnelle ! La banque saisit ${seized ? `tes ${seized} bien(s) et ` : ''}tes comptes. Tu repars de zéro.`, 'bad', '⚖️');
}

function health(c: Character) {
  const country = getCountry(c.countryCode);
  for (const d of [...c.diseases]) {
    const info = getDisease(d.id);
    d.years += 1;
    adjust(c, 'health', -info.damage * float(0.6, 1.3));
    if (chance(info.selfHeal)) {
      c.diseases = c.diseases.filter((x) => x !== d);
      log(c, `Tu t’es remis·e de : ${info.name.toLowerCase()}.`, 'good', '💚');
    }
  }
  const risk = 0.025 + c.age * 0.0009 + (c.stats.health < 40 ? 0.05 : 0) - c.stats.fitness / 2500;
  if (chance(risk)) {
    const candidates = DISEASES.filter(
      (d) => d.minAge <= c.age && !c.diseases.some((x) => x.id === d.id) && (d.id !== 'malaria' || country.gdp < 5000),
    );
    if (candidates.length) {
      const d = weighted(candidates, (x) => x.weight * (x.minAge > 30 ? 1 + c.age / 40 : 1));
      c.diseases.push({ id: d.id, years: 0 });
      adjust(c, 'health', -d.damage / 2);
      log(c, `On t’a diagnostiqué : ${d.name.toLowerCase()}.`, 'bad', d.icon);
    }
  }
}

function prison(c: Character) {
  if (!c.prison) return;
  c.prison.yearsLeft -= 1;
  adjust(c, 'happiness', -4);
  if (c.prison.yearsLeft <= 0) {
    log(c, `Tu es sorti·e de prison après ${c.prison.total} an${c.prison.total > 1 ? 's' : ''} derrière les barreaux.`, 'special', '🔓');
    c.prison = null;
  }
}

function eligible(c: Character, e: GameEvent) {
  if (c.age < e.minAge || c.age > e.maxAge) return false;
  if (!!c.prison !== !!e.prison) return false;
  if (e.once && c.flags[`ev_${e.id}`]) return false;
  if (e.person && !e.person(c)) return false;
  return e.when ? e.when(c) : true;
}

export function triggerEvents(c: Character, count: number) {
  for (let i = 0; i < count; i++) {
    const pool = EVENTS.filter((e) => eligible(c, e) && !c.pending.some((p) => p.eventId === e.id));
    if (!pool.length) return;
    const e = weighted(pool, (x) => x.weight);
    if (e.once) c.flags[`ev_${e.id}`] = true;
    const person = e.person?.(c);
    if (e.choices?.length) {
      c.pending.push({
        eventId: e.id,
        icon: e.icon,
        title: resolveText(e.title, c, person),
        text: resolveText(e.text, c, person),
        choices: e.choices.map((x) => x.label),
        personId: person?.id,
      });
    } else if (e.run) {
      const out = e.run(c, person);
      if (out.text) log(c, out.text, out.tone ?? 'neutral', e.icon);
    }
  }
}

function checkDeath(c: Character) {
  const country = getCountry(c.countryCode);
  if (c.stats.health <= 0) {
    const worst = maxBy(c.diseases.map((d) => getDisease(d.id)).filter((d) => d.deadly), 'damage');
    die(c, worst ? `des suites ${worst.cause}` : 'd’une santé trop fragile');
    return;
  }
  const lifeExp = country.lifeExpectancy + (wealthFactor(c.countryCode) > 0.5 ? 1 : 0);
  if (chance(mortality(c.age, lifeExp, c.stats.health))) {
    const deadly = c.diseases.map((d) => getDisease(d.id)).filter((d) => d.deadly);
    if (deadly.length && chance(0.7)) die(c, `des suites ${deadly[0].cause}`);
    else if (c.age > 70) die(c, 'paisiblement dans son sommeil');
    else die(c, ['dans un accident de la route', 'd’un arrêt cardiaque', 'd’un AVC', 'd’une chute malheureuse', 'd’une infection foudroyante'][int(0, 4)]);
  }
}

export function ageUp(c: Character) {
  if (!c.alive || c.pending.length) return;
  c.age += 1;
  c.actionsThisYear = {};
  ageRelations(c);
  naturalStats(c);
  education(c);
  work(c);
  finances(c);
  const crashed = stepMarket(c);
  if (crashed && Object.values(c.holdings).some((v) => v > 0)) log(c, 'Les marchés financiers ont plongé cette année.', 'bad', '📉');
  health(c);
  prison(c);
  if (c.age > 0) triggerEvents(c, 1 + (chance(0.45) ? 1 : 0));
  if (c.age === 1 && !c.flags.birthday) c.flags.birthday = true;
  checkDeath(c);
  const nw = netWorth(c);
  c.maxNetWorth = Math.max(c.maxNetWorth, nw);
  c.history.push({ age: c.age, ...c.stats, netWorth: nw });
}

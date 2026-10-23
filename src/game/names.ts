import type { Faker } from '@faker-js/faker';
import { faker as baseFaker } from '@faker-js/faker/locale/en';
import type { Gender } from './types';
import { int } from './rng';

/**
 * Faker locales are loaded lazily so that only the languages of the countries
 * you actually live in end up downloaded by the browser.
 */
const loaders: Record<string, () => Promise<{ faker: Faker }>> = {
  ar: () => import('@faker-js/faker/locale/ar'),
  bn_BD: () => import('@faker-js/faker/locale/bn_BD'),
  de: () => import('@faker-js/faker/locale/de'),
  en: () => import('@faker-js/faker/locale/en'),
  en_AU: () => import('@faker-js/faker/locale/en_AU'),
  en_GB: () => import('@faker-js/faker/locale/en_GB'),
  en_IE: () => import('@faker-js/faker/locale/en_IE'),
  en_IN: () => import('@faker-js/faker/locale/en_IN'),
  en_US: () => import('@faker-js/faker/locale/en_US'),
  es: () => import('@faker-js/faker/locale/es'),
  es_MX: () => import('@faker-js/faker/locale/es_MX'),
  fa: () => import('@faker-js/faker/locale/fa'),
  fr: () => import('@faker-js/faker/locale/fr'),
  fr_BE: () => import('@faker-js/faker/locale/fr_BE'),
  fr_CA: () => import('@faker-js/faker/locale/fr_CA'),
  fr_CH: () => import('@faker-js/faker/locale/fr_CH'),
  fr_LU: () => import('@faker-js/faker/locale/fr_LU'),
  fr_SN: () => import('@faker-js/faker/locale/fr_SN'),
  id_ID: () => import('@faker-js/faker/locale/id_ID'),
  it: () => import('@faker-js/faker/locale/it'),
  ja: () => import('@faker-js/faker/locale/ja'),
  ko: () => import('@faker-js/faker/locale/ko'),
  nb_NO: () => import('@faker-js/faker/locale/nb_NO'),
  ne: () => import('@faker-js/faker/locale/ne'),
  nl: () => import('@faker-js/faker/locale/nl'),
  pl: () => import('@faker-js/faker/locale/pl'),
  pt_BR: () => import('@faker-js/faker/locale/pt_BR'),
  ru: () => import('@faker-js/faker/locale/ru'),
  sv: () => import('@faker-js/faker/locale/sv'),
  th: () => import('@faker-js/faker/locale/th'),
  tr: () => import('@faker-js/faker/locale/tr'),
  uk: () => import('@faker-js/faker/locale/uk'),
  ur: () => import('@faker-js/faker/locale/ur'),
  vi: () => import('@faker-js/faker/locale/vi'),
  yo_NG: () => import('@faker-js/faker/locale/yo_NG'),
  zh_CN: () => import('@faker-js/faker/locale/zh_CN'),
  zu_ZA: () => import('@faker-js/faker/locale/zu_ZA'),
};

const cache = new Map<string, Faker>([['en', baseFaker]]);

export async function ensureLocale(locale: string) {
  if (cache.has(locale) || !loaders[locale]) return;
  try {
    cache.set(locale, (await loaders[locale]()).faker);
  } catch {
    // network hiccup: fall back to English names
  }
}

function fakerFor(locale: string, seed: number) {
  const f = cache.get(locale) ?? baseFaker;
  f.seed(seed);
  return f;
}

export function firstName(locale: string, gender: Gender) {
  const f = fakerFor(locale, int(0, 2 ** 31));
  try {
    return f.person.firstName(gender === 'M' ? 'male' : 'female');
  } catch {
    return baseFaker.person.firstName(gender === 'M' ? 'male' : 'female');
  }
}

export function lastName(locale: string) {
  const f = fakerFor(locale, int(0, 2 ** 31));
  try {
    return f.person.lastName();
  } catch {
    return baseFaker.person.lastName();
  }
}

export function petName() {
  return fakerFor('en', int(0, 2 ** 31)).animal.petName();
}

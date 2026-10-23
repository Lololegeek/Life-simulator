import { countries as countryList, getEmojiFlag, type TCountryCode } from 'countries-list';

export interface CountryInfo {
  code: TCountryCode;
  nameFr: string;
  /** Population in millions (approximation 2025) */
  population: number;
  /** GDP per capita in USD (approximation) */
  gdp: number;
  lifeExpectancy: number;
  locale: string;
  cities: string[];
  /** 0 = democracy and gentle justice, 1 = very harsh */
  harshness: number;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'IN', nameFr: 'Inde', population: 1440, gdp: 2700, lifeExpectancy: 72, locale: 'en_IN', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Jaipur'], harshness: 0.5 },
  { code: 'CN', nameFr: 'Chine', population: 1410, gdp: 13000, lifeExpectancy: 78, locale: 'zh_CN', cities: ['Shanghai', 'Pékin', 'Shenzhen', 'Chengdu', 'Wuhan', "Xi'an"], harshness: 0.8 },
  { code: 'US', nameFr: 'États-Unis', population: 336, gdp: 85000, lifeExpectancy: 77, locale: 'en_US', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Seattle'], harshness: 0.6 },
  { code: 'ID', nameFr: 'Indonésie', population: 279, gdp: 5000, lifeExpectancy: 71, locale: 'id_ID', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bali'], harshness: 0.6 },
  { code: 'PK', nameFr: 'Pakistan', population: 245, gdp: 1500, lifeExpectancy: 67, locale: 'ur', cities: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad'], harshness: 0.7 },
  { code: 'NG', nameFr: 'Nigeria', population: 229, gdp: 1600, lifeExpectancy: 54, locale: 'yo_NG', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'], harshness: 0.6 },
  { code: 'BR', nameFr: 'Brésil', population: 217, gdp: 10000, lifeExpectancy: 76, locale: 'pt_BR', cities: ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Brasília', 'Recife'], harshness: 0.5 },
  { code: 'BD', nameFr: 'Bangladesh', population: 174, gdp: 2600, lifeExpectancy: 73, locale: 'bn_BD', cities: ['Dacca', 'Chittagong', 'Khulna', 'Sylhet'], harshness: 0.6 },
  { code: 'RU', nameFr: 'Russie', population: 144, gdp: 14000, lifeExpectancy: 72, locale: 'ru', cities: ['Moscou', 'Saint-Pétersbourg', 'Novossibirsk', 'Kazan'], harshness: 0.8 },
  { code: 'MX', nameFr: 'Mexique', population: 130, gdp: 13000, lifeExpectancy: 75, locale: 'es_MX', cities: ['Mexico', 'Guadalajara', 'Monterrey', 'Cancún', 'Puebla'], harshness: 0.5 },
  { code: 'ET', nameFr: 'Éthiopie', population: 129, gdp: 1200, lifeExpectancy: 67, locale: 'en', cities: ['Addis-Abeba', 'Dire Dawa', 'Gondar', 'Mekele'], harshness: 0.6 },
  { code: 'JP', nameFr: 'Japon', population: 124, gdp: 34000, lifeExpectancy: 85, locale: 'ja', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo', 'Fukuoka'], harshness: 0.5 },
  { code: 'PH', nameFr: 'Philippines', population: 118, gdp: 3900, lifeExpectancy: 70, locale: 'en', cities: ['Manille', 'Cebu', 'Davao', 'Quezon City'], harshness: 0.6 },
  { code: 'EG', nameFr: 'Égypte', population: 114, gdp: 3500, lifeExpectancy: 71, locale: 'ar', cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Louxor'], harshness: 0.7 },
  { code: 'CD', nameFr: 'RD Congo', population: 105, gdp: 650, lifeExpectancy: 61, locale: 'fr', cities: ['Kinshasa', 'Lubumbashi', 'Goma', 'Kisangani'], harshness: 0.6 },
  { code: 'VN', nameFr: 'Viêt Nam', population: 100, gdp: 4300, lifeExpectancy: 74, locale: 'vi', cities: ['Hô Chi Minh-Ville', 'Hanoï', 'Da Nang', 'Hué'], harshness: 0.7 },
  { code: 'IR', nameFr: 'Iran', population: 90, gdp: 4500, lifeExpectancy: 74, locale: 'fa', cities: ['Téhéran', 'Ispahan', 'Chiraz', 'Tabriz'], harshness: 0.9 },
  { code: 'TR', nameFr: 'Turquie', population: 86, gdp: 13000, lifeExpectancy: 77, locale: 'tr', cities: ['Istanbul', 'Ankara', 'Izmir', 'Antalya'], harshness: 0.6 },
  { code: 'DE', nameFr: 'Allemagne', population: 84, gdp: 54000, lifeExpectancy: 81, locale: 'de', cities: ['Berlin', 'Munich', 'Hambourg', 'Cologne', 'Francfort'], harshness: 0.2 },
  { code: 'TH', nameFr: 'Thaïlande', population: 72, gdp: 7300, lifeExpectancy: 79, locale: 'th', cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'], harshness: 0.6 },
  { code: 'GB', nameFr: 'Royaume-Uni', population: 68, gdp: 52000, lifeExpectancy: 81, locale: 'en_GB', cities: ['Londres', 'Manchester', 'Édimbourg', 'Birmingham', 'Liverpool'], harshness: 0.3 },
  { code: 'FR', nameFr: 'France', population: 68, gdp: 46000, lifeExpectancy: 83, locale: 'fr', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes'], harshness: 0.25 },
  { code: 'TZ', nameFr: 'Tanzanie', population: 68, gdp: 1200, lifeExpectancy: 67, locale: 'en', cities: ['Dar es Salaam', 'Dodoma', 'Arusha', 'Zanzibar'], harshness: 0.6 },
  { code: 'ZA', nameFr: 'Afrique du Sud', population: 63, gdp: 6200, lifeExpectancy: 65, locale: 'zu_ZA', cities: ['Johannesburg', 'Le Cap', 'Durban', 'Pretoria'], harshness: 0.5 },
  { code: 'IT', nameFr: 'Italie', population: 59, gdp: 39000, lifeExpectancy: 83, locale: 'it', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'], harshness: 0.3 },
  { code: 'KE', nameFr: 'Kenya', population: 56, gdp: 2000, lifeExpectancy: 66, locale: 'en', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], harshness: 0.6 },
  { code: 'KR', nameFr: 'Corée du Sud', population: 52, gdp: 34000, lifeExpectancy: 84, locale: 'ko', cities: ['Séoul', 'Busan', 'Incheon', 'Daegu'], harshness: 0.4 },
  { code: 'CO', nameFr: 'Colombie', population: 52, gdp: 7000, lifeExpectancy: 77, locale: 'es', cities: ['Bogota', 'Medellín', 'Cali', 'Carthagène'], harshness: 0.5 },
  { code: 'ES', nameFr: 'Espagne', population: 48, gdp: 33000, lifeExpectancy: 83, locale: 'es', cities: ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Bilbao'], harshness: 0.3 },
  { code: 'AR', nameFr: 'Argentine', population: 46, gdp: 13000, lifeExpectancy: 77, locale: 'es', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'], harshness: 0.4 },
  { code: 'DZ', nameFr: 'Algérie', population: 46, gdp: 5300, lifeExpectancy: 76, locale: 'ar', cities: ['Alger', 'Oran', 'Constantine', 'Annaba'], harshness: 0.6 },
  { code: 'CA', nameFr: 'Canada', population: 40, gdp: 53000, lifeExpectancy: 82, locale: 'fr_CA', cities: ['Toronto', 'Montréal', 'Vancouver', 'Québec', 'Calgary'], harshness: 0.2 },
  { code: 'PL', nameFr: 'Pologne', population: 37, gdp: 22000, lifeExpectancy: 78, locale: 'pl', cities: ['Varsovie', 'Cracovie', 'Gdańsk', 'Wrocław'], harshness: 0.4 },
  { code: 'MA', nameFr: 'Maroc', population: 38, gdp: 3700, lifeExpectancy: 75, locale: 'fr', cities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'], harshness: 0.6 },
  { code: 'UA', nameFr: 'Ukraine', population: 37, gdp: 5000, lifeExpectancy: 71, locale: 'uk', cities: ['Kyiv', 'Lviv', 'Odessa', 'Kharkiv'], harshness: 0.5 },
  { code: 'SA', nameFr: 'Arabie saoudite', population: 37, gdp: 30000, lifeExpectancy: 77, locale: 'ar', cities: ['Riyad', 'Djeddah', 'La Mecque', 'Dammam'], harshness: 0.9 },
  { code: 'PE', nameFr: 'Pérou', population: 34, gdp: 7800, lifeExpectancy: 77, locale: 'es', cities: ['Lima', 'Cuzco', 'Arequipa', 'Trujillo'], harshness: 0.5 },
  { code: 'NP', nameFr: 'Népal', population: 30, gdp: 1400, lifeExpectancy: 71, locale: 'ne', cities: ['Katmandou', 'Pokhara', 'Lalitpur'], harshness: 0.5 },
  { code: 'CI', nameFr: "Côte d'Ivoire", population: 29, gdp: 2700, lifeExpectancy: 59, locale: 'fr', cities: ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro'], harshness: 0.5 },
  { code: 'CM', nameFr: 'Cameroun', population: 29, gdp: 1700, lifeExpectancy: 62, locale: 'fr', cities: ['Douala', 'Yaoundé', 'Garoua', 'Bamenda'], harshness: 0.6 },
  { code: 'AU', nameFr: 'Australie', population: 27, gdp: 65000, lifeExpectancy: 83, locale: 'en_AU', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'], harshness: 0.2 },
  { code: 'SN', nameFr: 'Sénégal', population: 18, gdp: 1700, lifeExpectancy: 69, locale: 'fr_SN', cities: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'], harshness: 0.4 },
  { code: 'NL', nameFr: 'Pays-Bas', population: 18, gdp: 62000, lifeExpectancy: 82, locale: 'nl', cities: ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht'], harshness: 0.15 },
  { code: 'BE', nameFr: 'Belgique', population: 11.8, gdp: 53000, lifeExpectancy: 82, locale: 'fr_BE', cities: ['Bruxelles', 'Anvers', 'Liège', 'Gand', 'Namur'], harshness: 0.2 },
  { code: 'HT', nameFr: 'Haïti', population: 11.7, gdp: 1700, lifeExpectancy: 64, locale: 'fr', cities: ['Port-au-Prince', 'Cap-Haïtien', 'Gonaïves'], harshness: 0.5 },
  { code: 'SE', nameFr: 'Suède', population: 10.5, gdp: 56000, lifeExpectancy: 83, locale: 'sv', cities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'], harshness: 0.1 },
  { code: 'CH', nameFr: 'Suisse', population: 8.9, gdp: 99000, lifeExpectancy: 84, locale: 'fr_CH', cities: ['Zurich', 'Genève', 'Lausanne', 'Berne', 'Bâle'], harshness: 0.15 },
  { code: 'NO', nameFr: 'Norvège', population: 5.5, gdp: 87000, lifeExpectancy: 83, locale: 'nb_NO', cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'], harshness: 0.1 },
  { code: 'IE', nameFr: 'Irlande', population: 5.3, gdp: 104000, lifeExpectancy: 82, locale: 'en_IE', cities: ['Dublin', 'Cork', 'Galway', 'Limerick'], harshness: 0.2 },
  { code: 'LU', nameFr: 'Luxembourg', population: 0.67, gdp: 128000, lifeExpectancy: 83, locale: 'fr_LU', cities: ['Luxembourg', 'Esch-sur-Alzette', 'Differdange'], harshness: 0.15 },
  { code: 'IS', nameFr: 'Islande', population: 0.39, gdp: 78000, lifeExpectancy: 83, locale: 'en', cities: ['Reykjavik', 'Akureyri', 'Kópavogur'], harshness: 0.1 },
];

export const WORLD_POPULATION_MILLIONS = 8_100;

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code: string): CountryInfo {
  return byCode.get(code as TCountryCode) ?? COUNTRIES[0];
}

export const flagOf = (code: string) => getEmojiFlag(code as TCountryCode);

export const englishName = (code: string) => countryList[code as TCountryCode]?.name ?? code;

export const nativeName = (code: string) => countryList[code as TCountryCode]?.native ?? code;

export const capitalOf = (code: string) => countryList[code as TCountryCode]?.capital ?? '';

export const currencyOf = (code: string) => countryList[code as TCountryCode]?.currency?.[0] ?? 'USD';

/** Purchasing-power factor applied to salaries and prices (1 = United States). */
export function wealthFactor(code: string) {
  const c = getCountry(code);
  return Math.min(1.35, Math.max(0.06, Math.pow(c.gdp / 85000, 0.65)));
}

/** "1 chance sur N" of being born in this country, out of the whole world population. */
export function birthOdds(code: string) {
  return WORLD_POPULATION_MILLIONS / getCountry(code).population;
}

export function countryName(code: string, lang: string) {
  return lang.startsWith('fr') ? getCountry(code).nameFr : englishName(code);
}

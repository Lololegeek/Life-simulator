import numeral from 'numeral';
import pluralize from 'pluralize';

export function money(value: number, compact = Math.abs(value) >= 100_000) {
  const sign = value < 0 ? '-' : '';
  const v = Math.abs(value);
  if (compact) return `${sign}${numeral(v).format('0.[00]a').toUpperCase()} $`;
  return `${sign}${numeral(v).format('0,0').replace(/,/g, ' ')} $`;
}

export function years(n: number, lang = 'fr') {
  if (lang.startsWith('en')) return `${n} ${pluralize('year', n)}`;
  return `${n} an${n > 1 ? 's' : ''}`;
}

export function plural(word: string, n: number, lang = 'fr') {
  if (lang.startsWith('en')) return pluralize(word, n, true);
  return `${n} ${word}${n > 1 && !/[sxz]$/.test(word) ? 's' : ''}`;
}

export function odds(n: number) {
  return numeral(n).format(n < 10 ? '0.[0]' : '0,0').replace(/,/g, ' ');
}

import type { Country, RawCountry } from '../types/index';

export function mapCountryResponse(raw: RawCountry): Country {
  const flagUrl = raw.flags?.svg ?? raw.flags?.png ?? raw.flag ?? '';

  const languages = (raw.languages ?? [])
    .map((lang) => lang.name ?? lang.nativeName ?? '')
    .filter((name): name is string => Boolean(name));

  const currencies = (raw.currencies ?? [])
    .map((currency) => {
      if (currency.name && currency.code) {
        return `${currency.name} (${currency.code})`;
      }
      return currency.name ?? currency.code ?? '';
    })
    .filter((entry): entry is string => Boolean(entry));

  return {
    name: raw.name,
    flagUrl,
    capital: raw.capital || 'N/A',
    region: raw.region || 'Unknown',
    subregion: raw.subregion || 'Unknown',
    population: raw.population ?? 0,
    area: raw.area ?? 0,
    borders: raw.borders ? [...raw.borders] : [],
    languages,
    currencies,
  };
}

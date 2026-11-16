import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../mapCountryResponse';
import type { RawCountry } from '../../types';

describe('mapCountryResponse', () => {
  it('maps complete raw country DTO to normalized Country model', () => {
    const rawSpain: RawCountry = {
      name: 'Spain',
      flag: 'https://flagcdn.com',
      flags: {
        svg: 'https://flagcdn.com',
        png: 'https://flagcdn.com',
      },
      capital: 'Madrid',
      region: 'Europe',
      subregion: 'Southern Europe',
      population: 47351567,
      area: 505992,
      borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
      languages: [{ name: 'Spanish', nativeName: 'Español', iso639_1: 'es', iso639_2: 'spa' }],
      currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
    };

    const result = mapCountryResponse(rawSpain);

    expect(result).toEqual({
      name: 'Spain',
      flagUrl: 'https://flagcdn.com',
      capital: 'Madrid',
      region: 'Europe',
      subregion: 'Southern Europe',
      population: 47351567,
      area: 505992,
      borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
      languages: ['Spanish'],
      currencies: ['Euro (EUR)'],
    });
  });

  it('provides safe fallback values when optional fields are missing', () => {
    const rawAntarctica: RawCountry = {
      name: 'Antarctica',
      flag: 'https://flagcdn.com',
    };

    const result = mapCountryResponse(rawAntarctica);

    expect(result).toEqual({
      name: 'Antarctica',
      flagUrl: 'https://flagcdn.com',
      capital: 'N/A',
      region: 'Unknown',
      subregion: 'Unknown',
      population: 0,
      area: 0,
      borders: [],
      languages: [],
      currencies: [],
    });
  });
});

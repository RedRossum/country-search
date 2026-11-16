//mapCountryResponse
export interface RawCurrency {
  code?: string;
  name?: string;
  symbol?: string;
}

export interface RawLanguage {
  name?: string;
  nativeName?: string;
  iso639_1?: string;
  iso639_2?: string;
}

export interface RawCountry {
  name: string;
  flag?: string;
  flags?: {
    svg?: string;
    png?: string;
  };
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  borders?: string[];
  languages?: RawLanguage[];
  currencies?: RawCurrency[];
}

export interface Country {
  name: string;
  flagUrl: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  borders: string[];
  languages: string[];
  currencies: string[];
}
//debounce
export type TimerId = number;

export interface DebouncedFunction<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
}
//searchCountries
export type SearchCountriesFn = (query: string, signal?: AbortSignal) => Promise<Country[]>;

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
//timeout handling and error classification
export type SearchErrorKind = 'abort' | 'timeout' | 'http' | 'network';

export interface ClassifiedSearchError {
  kind: SearchErrorKind;
  message: string;
  status?: number;
}

export type SearchOutcome =
  { ok: true; countries: Country[] } | { ok: false; error: ClassifiedSearchError };
//
export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface SearchState {
  status: SearchStatus;
  query: string;
  countries: Country[];
  errorMessage: string | null;
}

export type SearchStateListener = (state: SearchState) => void;

export interface SearchControllerOptions {
  debounceDelayMs?: number;
  timeoutMs?: number;
  searchFn?: (query: string, signal?: AbortSignal, timeoutMs?: number) => Promise<SearchOutcome>;
}

export interface SearchController {
  getState: () => SearchState;
  subscribe: (listener: SearchStateListener) => () => void;
  handleInput: (rawQuery: string) => void;
  retry: () => void;
  clear: () => void;
  dispose: () => void;
}

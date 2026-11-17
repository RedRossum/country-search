import { mapCountryResponse } from './mapCountryResponse';
import type { Country, RawCountry } from '../types/index';

const API_BASE_URL = 'https://countries.dev/name';

export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `HTTP error with status ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

export async function searchCountries(query: string, signal?: AbortSignal): Promise<Country[]> {
  const encodedQuery = encodeURIComponent(query.trim());
  const response = await window.fetch(
    `${API_BASE_URL}/${encodedQuery}`,
    signal ? { signal } : undefined,
  );
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const rawCountries: RawCountry[] = await response.json();

  if (!Array.isArray(rawCountries)) {
    return [];
  }

  return rawCountries.map(mapCountryResponse);
}

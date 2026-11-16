import type { Country } from '../types/index';

export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `HTTP error with status ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

export async function searchCountries(query: string, signal?: AbortSignal): Promise<Country[]> {
  void query;
  void signal;
  throw new Error('Not implemented');
}

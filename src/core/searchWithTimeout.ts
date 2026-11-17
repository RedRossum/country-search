import type { ClassifiedSearchError, SearchOutcome } from '../types/index';

export const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

export function classifySearchError(error: unknown): ClassifiedSearchError {
  void error;
  throw new Error('Not implemented');
}

export async function searchWithTimeout(
  query: string,
  externalSignal?: AbortSignal,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<SearchOutcome> {
  void query;
  void externalSignal;
  void timeoutMs;
  throw new Error('Not implemented');
}

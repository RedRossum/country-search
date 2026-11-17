import { HttpError, searchCountries } from './searchCountries';
import type { ClassifiedSearchError, SearchOutcome } from '../types/index';

export const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

export function classifySearchError(error: unknown): ClassifiedSearchError {
  if (error instanceof HttpError) {
    return {
      kind: 'http',
      status: error.status,
      message: `Ошибка сервера (HTTP ${error.status}). Попробуйте повторить запрос.`,
    };
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    const errorName = String((error as { name: unknown }).name);

    if (errorName === 'AbortError') {
      return {
        kind: 'abort',
        message: 'Запрос отменён.',
      };
    }

    if (errorName === 'TimeoutError') {
      return {
        kind: 'timeout',
        message:
          'Превышено время ожидания ответа от сервера. Проверьте соединение и повторите попытку.',
      };
    }
  }

  return {
    kind: 'network',
    message: 'Ошибка сети. Проверьте подключение к интернету и повторите попытку.',
  };
}

export async function searchWithTimeout(
  query: string,
  externalSignal?: AbortSignal,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<SearchOutcome> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = externalSignal
    ? AbortSignal.any([externalSignal, timeoutSignal])
    : timeoutSignal;

  try {
    const countries = await searchCountries(query, combinedSignal);
    return { ok: true, countries };
  } catch (error: unknown) {
    return {
      ok: false,
      error: classifySearchError(error),
    };
  }
}

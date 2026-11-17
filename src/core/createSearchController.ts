import { debounce } from './debounce';
import { DEFAULT_REQUEST_TIMEOUT_MS, searchWithTimeout } from './searchWithTimeout';
import type {
  Country,
  SearchController,
  SearchControllerOptions,
  SearchOutcome,
  SearchState,
  SearchStateListener,
} from '../types/index';

export const DEFAULT_DEBOUNCE_DELAY_MS = 300;

interface InFlightRequest {
  promise: Promise<SearchOutcome>;
  subscribers: number;
  controller: AbortController;
}

export function createSearchController(options: SearchControllerOptions = {}): SearchController {
  const debounceDelayMs = options.debounceDelayMs ?? DEFAULT_DEBOUNCE_DELAY_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const searchFn = options.searchFn ?? searchWithTimeout;
  const cache = new Map<string, Country[]>();
  const inFlight = new Map<string, InFlightRequest>();
  const listeners = new Set<SearchStateListener>();

  let activeAbortController: AbortController | null = null;
  let requestSequence = 0;

  let state: SearchState = {
    status: 'idle',
    query: '',
    countries: [],
    errorMessage: null,
  };

  const setState = (patch: Partial<SearchState>): void => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => {
      listener(state);
    });
  };

  const abortActiveRequest = (): void => {
    if (activeAbortController !== null) {
      activeAbortController.abort();
      activeAbortController = null;
    }
  };

  const executeDeduplicatedSearch = (
    trimmedQuery: string,
    normalizedKey: string,
    callerSignal: AbortSignal,
  ): Promise<SearchOutcome> => {
    let entry = inFlight.get(normalizedKey);

    if (!entry) {
      const sharedController = new AbortController();
      const promise = searchFn(trimmedQuery, sharedController.signal, timeoutMs).finally(() => {
        inFlight.delete(normalizedKey);
      });

      entry = {
        promise,
        subscribers: 0,
        controller: sharedController,
      };
      inFlight.set(normalizedKey, entry);
    }

    entry.subscribers += 1;
    const currentEntry = entry;

    const onCallerAbort = (): void => {
      currentEntry.subscribers -= 1;
      if (currentEntry.subscribers <= 0) {
        currentEntry.controller.abort();
        inFlight.delete(normalizedKey);
      }
    };

    callerSignal.addEventListener('abort', onCallerAbort, { once: true });

    return currentEntry.promise.finally(() => {
      callerSignal.removeEventListener('abort', onCallerAbort);
    });
  };

  const runSearch = async (rawQuery: string, bypassCache: boolean = false): Promise<void> => {
    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    const normalizedKey = trimmedQuery.toLowerCase();
    const currentRequestId = ++requestSequence;

    if (!bypassCache && cache.has(normalizedKey)) {
      const cachedCountries = cache.get(normalizedKey) ?? [];
      setState({
        status: cachedCountries.length > 0 ? 'success' : 'empty',
        query: rawQuery,
        countries: cachedCountries,
        errorMessage: null,
      });
      return;
    }

    abortActiveRequest();
    const controller = new AbortController();
    activeAbortController = controller;

    setState({
      status: 'loading',
      query: rawQuery,
      errorMessage: null,
    });

    const outcome = await executeDeduplicatedSearch(trimmedQuery, normalizedKey, controller.signal);

    if (controller.signal.aborted || currentRequestId !== requestSequence) {
      return;
    }

    activeAbortController = null;

    if (outcome.ok) {
      cache.set(normalizedKey, outcome.countries);
      setState({
        status: outcome.countries.length > 0 ? 'success' : 'empty',
        query: rawQuery,
        countries: outcome.countries,
        errorMessage: null,
      });
      return;
    }

    if (outcome.error.kind === 'abort') {
      return;
    }

    setState({
      status: 'error',
      query: rawQuery,
      countries: [],
      errorMessage: outcome.error.message,
    });
  };

  const debouncedSearch = debounce((queryToSearch: string) => {
    void runSearch(queryToSearch, false);
  }, debounceDelayMs);

  const handleInput = (rawQuery: string): void => {
    debouncedSearch.cancel();
    abortActiveRequest();
    requestSequence += 1;

    if (rawQuery.trim() === '') {
      setState({
        status: 'idle',
        query: rawQuery,
        countries: [],
        errorMessage: null,
      });
      return;
    }

    setState({
      query: rawQuery,
      errorMessage: null,
    });

    debouncedSearch(rawQuery);
  };

  const retry = (): void => {
    if (state.query.trim() === '') {
      return;
    }
    debouncedSearch.cancel();
    abortActiveRequest();
    void runSearch(state.query, true);
  };

  const clear = (): void => {
    handleInput('');
  };

  const dispose = (): void => {
    debouncedSearch.cancel();
    abortActiveRequest();
    listeners.clear();
  };

  const getState = (): SearchState => state;

  const subscribe = (listener: SearchStateListener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    subscribe,
    handleInput,
    retry,
    clear,
    dispose,
  };
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '../createSearchController';
import type { Country, SearchOutcome } from '../../types/index';

const makeCountry = (name: string): Country => ({
  name,
  flagUrl: `https://flagcdn.com{name.toLowerCase()}.svg`,
  capital: `${name} City`,
  region: 'Europe',
  subregion: 'Western Europe',
  population: 1000000,
  area: 50000,
  borders: [],
  languages: ['English'],
  currencies: ['Euro (EUR)'],
});

describe('createSearchController & race condition handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aborts in-flight request immediately on new input and ignores out-of-order late responses', async () => {
    const signalsByQuery = new Map<string, AbortSignal>();
    const resolversByQuery = new Map<string, (outcome: SearchOutcome) => void>();

    const mockSearchFn = vi.fn((query: string, signal?: AbortSignal): Promise<SearchOutcome> => {
      if (signal) {
        signalsByQuery.set(query, signal);
      }
      return new Promise<SearchOutcome>((resolve) => {
        resolversByQuery.set(query, resolve);
      });
    });

    const controller = createSearchController({
      debounceDelayMs: 300,
      searchFn: mockSearchFn,
    });

    controller.handleInput('sp');
    await vi.advanceTimersByTimeAsync(300);

    expect(mockSearchFn).toHaveBeenCalledTimes(1);
    const firstSignal = signalsByQuery.get('sp');
    expect(firstSignal).toBeDefined();
    expect(firstSignal?.aborted).toBe(false);

    controller.handleInput('spain');
    expect(firstSignal?.aborted).toBe(true);
    expect(mockSearchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(300);
    expect(mockSearchFn).toHaveBeenCalledTimes(2);

    const resolveSecond = resolversByQuery.get('spain');
    resolveSecond?.({ ok: true, countries: [makeCountry('Spain')] });
    await Promise.resolve();

    expect(controller.getState()).toEqual({
      status: 'success',
      query: 'spain',
      countries: [makeCountry('Spain')],
      errorMessage: null,
    });

    const resolveFirst = resolversByQuery.get('sp');
    resolveFirst?.({ ok: true, countries: [makeCountry('Singapore')] });
    await Promise.resolve();

    expect(controller.getState().status).toBe('success');
    expect(controller.getState().countries).toHaveLength(1);
    expect(controller.getState().countries?.name).toBe('Spain');
  });

  it('cancels pending/active requests and resets to idle when input becomes empty or whitespace', async () => {
    const signals: AbortSignal[] = [];
    const mockSearchFn = vi.fn((_query: string, signal?: AbortSignal): Promise<SearchOutcome> => {
      if (signal) {
        signals.push(signal);
      }
      return new Promise(() => {});
    });

    const controller = createSearchController({
      debounceDelayMs: 300,
      searchFn: mockSearchFn,
    });

    controller.handleInput('   ');
    await vi.advanceTimersByTimeAsync(300);
    expect(mockSearchFn).not.toHaveBeenCalled();
    expect(controller.getState().status).toBe('idle');

    controller.handleInput('italy');
    await vi.advanceTimersByTimeAsync(300);
    expect(mockSearchFn).toHaveBeenCalledTimes(1);
    expect(signals?.aborted).toBe(false);

    controller.handleInput('');
    expect(signals?.aborted).toBe(true);
    expect(controller.getState()).toEqual({
      status: 'idle',
      query: '',
      countries: [],
      errorMessage: null,
    });
  });

  it('retries the last entered query when retry() is called after an error', async () => {
    const mockSearchFn = vi
      .fn<(query: string, signal?: AbortSignal) => Promise<SearchOutcome>>()
      .mockResolvedValueOnce({
        ok: false,
        error: { kind: 'network', message: 'Ошибка сети.' },
      })
      .mockResolvedValueOnce({
        ok: true,
        countries: [makeCountry('Norway')],
      });

    const controller = createSearchController({
      debounceDelayMs: 300,
      searchFn: mockSearchFn,
    });

    controller.handleInput('norway');
    await vi.advanceTimersByTimeAsync(300);

    expect(controller.getState().status).toBe('error');
    expect(controller.getState().errorMessage).toBe('Ошибка сети.');

    controller.retry();
    await Promise.resolve();

    expect(mockSearchFn).toHaveBeenCalledTimes(2);
    expect(mockSearchFn).toHaveBeenLastCalledWith('norway', expect.any(AbortSignal), 5000);
    expect(controller.getState().status).toBe('success');
    expect(controller.getState().countries?.name).toBe('Norway');
  });

  it('returns cached results for repeated normalized queries without extra network calls', async () => {
    const mockSearchFn = vi
      .fn<(query: string, signal?: AbortSignal) => Promise<SearchOutcome>>()
      .mockResolvedValue({
        ok: true,
        countries: [makeCountry('France')],
      });

    const controller = createSearchController({
      debounceDelayMs: 300,
      searchFn: mockSearchFn,
    });

    controller.handleInput('France');
    await vi.advanceTimersByTimeAsync(300);
    expect(mockSearchFn).toHaveBeenCalledTimes(1);

    controller.handleInput('  france  ');
    await vi.advanceTimersByTimeAsync(300);

    expect(mockSearchFn).toHaveBeenCalledTimes(1);
    expect(controller.getState().status).toBe('success');
    expect(controller.getState().countries?.name).toBe('France');
  });
});

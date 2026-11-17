import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../searchCountries';
import { classifySearchError, searchWithTimeout } from '../searchWithTimeout';
import type { RawCountry } from '../../types/index';

describe('classifySearchError & searchWithTimeout', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    fetchMock.mockReset();
  });

  describe('classifySearchError', () => {
    it('classifies DOMException with name AbortError as abort', () => {
      const err = new DOMException('Aborted by user', 'AbortError');
      expect(classifySearchError(err)).toMatchObject({ kind: 'abort' });
    });

    it('classifies DOMException with name TimeoutError as timeout', () => {
      const err = new DOMException('The operation timed out', 'TimeoutError');
      expect(classifySearchError(err)).toMatchObject({ kind: 'timeout' });
    });

    it('classifies HttpError as http with status code', () => {
      const err = new HttpError(502, 'Bad Gateway');
      expect(classifySearchError(err)).toMatchObject({
        kind: 'http',
        status: 502,
      });
    });

    it('classifies TypeError and generic errors as network error', () => {
      const err = new TypeError('Failed to fetch');
      expect(classifySearchError(err)).toMatchObject({ kind: 'network' });
    });
  });

  describe('searchWithTimeout', () => {
    it('returns ok: true with mapped countries when request succeeds within timeout', async () => {
      const rawResponse: RawCountry[] = [
        {
          name: 'Germany',
          flag: 'https://flagcdn.com',
          capital: 'Berlin',
          region: 'Europe',
          population: 83240525,
        },
      ];

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(rawResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const outcome = await searchWithTimeout('Germany');

      expect(outcome.ok).toBe(true);
      if (outcome.ok) {
        expect(outcome.countries).toHaveLength(1);
        expect(outcome.countries[0]?.name).toBe('Germany');
      }
    });

    it('aborts combined signal and returns kind: abort when externalSignal aborts', async () => {
      fetchMock.mockImplementationOnce((_input, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(
              init.signal?.reason ?? new DOMException('The operation was aborted.', 'AbortError'),
            );
          });
        });
      });

      const externalController = new AbortController();
      const promise = searchWithTimeout('France', externalController.signal, 5000);

      externalController.abort();

      const outcome = await promise;
      expect(outcome).toEqual({
        ok: false,
        error: expect.objectContaining({ kind: 'abort' }),
      });
    });

    it('aborts combined signal and returns kind: timeout when timeoutMs elapses', async () => {
      vi.useFakeTimers();

      fetchMock.mockImplementationOnce((_input, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(
              init.signal?.reason ??
                new DOMException('The operation was aborted due to timeout', 'TimeoutError'),
            );
          });
        });
      });

      const externalController = new AbortController();
      const promise = searchWithTimeout('Japan', externalController.signal, 3000);

      await vi.advanceTimersByTimeAsync(3000);

      const outcome = await promise;
      expect(outcome).toEqual({
        ok: false,
        error: expect.objectContaining({ kind: 'timeout' }),
      });
    });
  });
});

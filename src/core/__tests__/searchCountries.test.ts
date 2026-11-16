import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError, searchCountries } from '../searchCountries';
import type { RawCountry } from '../../types/index';

describe('searchCountries & HttpError', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('fetches countries with encoded query and signal, returning mapped Country[] on 200 OK', async () => {
    const rawResponse: RawCountry[] = [
      {
        name: 'Spain',
        flag: 'https://flagcdn.com',
        capital: 'Madrid',
        region: 'Europe',
        population: 47351567,
      },
    ];

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(rawResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const controller = new AbortController();
    const result = await searchCountries('New Zealand', controller.signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev', {
      signal: controller.signal,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Spain');
    expect(result[0]?.capital).toBe('Madrid');
  });

  it('returns an empty array without throwing when API responds with 404', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Not Found' }), {
        status: 404,
      }),
    );

    const result = await searchCountries('nonexistentcountry');

    expect(result).toEqual([]);
  });

  it('throws HttpError with status code when response.ok is false and status is not 404', async () => {
    fetchMock.mockResolvedValue(
      new Response('Internal Server Error', {
        status: 500,
      }),
    );

    await expect(searchCountries('spain')).rejects.toBeInstanceOf(HttpError);
    await expect(searchCountries('spain')).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });

  it('rethrows AbortError when request is aborted via AbortSignal', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    fetchMock.mockRejectedValueOnce(abortError);

    const controller = new AbortController();
    controller.abort();

    await expect(searchCountries('spain', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays execution until the specified delay has elapsed', () => {
    const spy = vi.fn<(query: string) => void>();
    const debouncedFn = debounce(spy, 300);

    debouncedFn('spain');
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('spain');
  });

  it('resets the timer on repeated calls and invokes fn only with the latest arguments', () => {
    const spy = vi.fn<(query: string) => void>();
    const debouncedFn = debounce(spy, 300);

    debouncedFn('s');
    vi.advanceTimersByTime(150);

    debouncedFn('sp');
    vi.advanceTimersByTime(150);

    debouncedFn('spain');
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('spain');
  });

  it('cancels pending execution when cancel() is called', () => {
    const spy = vi.fn<(query: string) => void>();
    const debouncedFn = debounce(spy, 300);

    debouncedFn('germany');
    vi.advanceTimersByTime(150);

    debouncedFn.cancel();
    vi.advanceTimersByTime(300);

    expect(spy).not.toHaveBeenCalled();
  });
});

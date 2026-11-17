import type { DebouncedFunction } from '../types/index';

export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): DebouncedFunction<TArgs> {
  let timerId: number | null = null;

  const cancel = (): void => {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  };

  const debounced = (...args: TArgs): void => {
    cancel();
    timerId = window.setTimeout(() => {
      timerId = null;
      fn(...args);
    }, delay);
  };

  return Object.assign(debounced, { cancel });
}

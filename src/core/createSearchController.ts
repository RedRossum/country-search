import type { SearchController, SearchControllerOptions } from '../types/index';

export const DEFAULT_DEBOUNCE_DELAY_MS = 300;

export function createSearchController(options?: SearchControllerOptions): SearchController {
  void options;
  throw new Error('Not implemented');
}

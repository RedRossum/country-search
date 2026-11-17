/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/country-search/',
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
  },
});

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@eventops/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@eventops/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
    },
  },
});

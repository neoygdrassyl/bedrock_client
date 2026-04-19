import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const requiredPrebundledDeps = [
  '@tanstack/react-table',
  'react-pdf',
  'pdf-lib',
  'markdown-to-jsx',
  'next-themes',
  'sonner',
  'clsx',
  'tailwind-merge',
  'class-variance-authority',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-slot',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-avatar',
  '@radix-ui/react-separator',
  'axios',
  'js-sha256',
];

describe('vite optimizeDeps stability', () => {
  it('prebundles route-level dependencies that otherwise trigger mid-run re-optimization', () => {
    const source = readFileSync('vite.config.mjs', 'utf8');

    for (const dependency of requiredPrebundledDeps) {
      expect(source).toContain(`'${dependency}'`);
    }
  });
});

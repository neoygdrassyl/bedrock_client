import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const buildNodeOptions = 'NODE_OPTIONS=--max-old-space-size=4096';

describe('smart build configuration', () => {
  it('uses explicit Vite modes for development and production scripts', () => {
    expect(packageJson.scripts.dev).toBe('vite --mode development');
    expect(packageJson.scripts.start).toBe('vite --mode development');
    expect(packageJson.scripts.build).toBe(`${buildNodeOptions} vite build --mode production`);
    expect(packageJson.scripts['build:prod']).toBe(`${buildNodeOptions} vite build --mode production`);
    expect(packageJson.scripts['build:production']).toBe(
      `${buildNodeOptions} vite build --mode production`,
    );
    expect(packageJson.scripts['build:dev']).toBe(`${buildNodeOptions} vite build --mode development`);
    expect(packageJson.scripts['build:analyze']).toBe(
      `${buildNodeOptions} VITE_BUILD_ANALYZE=true vite build --mode production`,
    );
  });

  it('keeps build, test, and e2e tooling in devDependencies only', () => {
    const devOnlyPackages = [
      'vite',
      '@vitejs/plugin-react',
      'vitest',
      '@playwright/test',
      '@testing-library/react',
      'jsdom',
    ];

    for (const packageName of devOnlyPackages) {
      expect(packageJson.devDependencies).toHaveProperty(packageName);
      expect(packageJson.dependencies).not.toHaveProperty(packageName);
    }
  });

  it('loads analyzer settings from Vite mode env instead of process.env', () => {
    const source = readFileSync('vite.config.mjs', 'utf8');

    expect(source).toContain("import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';");
    expect(source).toContain('defineConfig(({ mode }) => {');
    expect(source).toContain("loadEnv(mode, process.cwd(), '')");
    expect(source).toContain("env.VITE_BUILD_ANALYZE === 'true'");
    expect(source).not.toContain('process.env.ANALYZE');
  });

  it('documents required Vite env variables with development and production defaults', () => {
    const exampleEnv = readFileSync('.env.example', 'utf8');
    const developmentEnv = readFileSync('.env.development', 'utf8');
    const productionEnv = readFileSync('.env.production', 'utf8');

    for (const envName of [
      'VITE_API_URL',
      'VITE_GLOBAL_ID',
      'VITE_GOOGLE_CAPTCHA_HTML',
      'VITE_GOOGLE_CAPTCHA_KEY',
      'VITE_GOOGLE_MAPS_KEY',
      'VITE_API_PROF_URL',
      'VITE_API_EMAIL_URL',
      'VITE_BUILD_ANALYZE',
    ]) {
      expect(exampleEnv).toContain(envName);
    }

    expect(developmentEnv).toContain('VITE_API_URL="/api"');
    expect(developmentEnv).toContain('VITE_BUILD_ANALYZE="false"');
    expect(productionEnv).toContain(
      'VITE_API_URL="https://prod.curaduria1bucaramanga.com.co/api"',
    );
    expect(productionEnv).toContain('VITE_GLOBAL_ID="cb1"');
    expect(productionEnv).toContain('VITE_BUILD_ANALYZE="false"');
  });

  it('documents the static deployment contract', () => {
    const docs = readFileSync('BUILD_DEPLOYMENT.md', 'utf8');

    expect(docs).toContain('npm ci');
    expect(docs).toContain('npm run build:prod');
    expect(docs).toContain('build/');
    expect(docs).toContain('npm ci --omit=dev');
    expect(docs).toContain('Vite');
  });
});

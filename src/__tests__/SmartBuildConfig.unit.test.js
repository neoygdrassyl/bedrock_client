import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const viteBuild = 'node --max-old-space-size=4096 node_modules/vite/bin/vite.js build';

describe('smart build configuration', () => {
  it('uses explicit Vite modes for development and production scripts', () => {
    expect(packageJson.scripts.dev).toBe('vite --mode development');
    expect(packageJson.scripts.start).toBe('vite --mode development');
    expect(packageJson.scripts.build).toBe(`${viteBuild} --mode production`);
    expect(packageJson.scripts['build:prod']).toBe(`${viteBuild} --mode production`);
    expect(packageJson.scripts['build:production']).toBe(`${viteBuild} --mode production`);
    expect(packageJson.scripts['build:dev']).toBe(`${viteBuild} --mode development`);
    expect(packageJson.scripts['build:analyze']).toBe(`${viteBuild} --mode production`);

    for (const scriptName of [
      'build',
      'build:prod',
      'build:production',
      'build:dev',
      'build:analyze',
    ]) {
      expect(packageJson.scripts[scriptName]).not.toMatch(/(^|\s)(NODE_OPTIONS|VITE_BUILD_ANALYZE)=/);
    }
  });

  it('builds without a wrapper script so the commands stay cross-platform', () => {
    expect(existsSync('build-tools')).toBe(false);
    expect(packageJson.scripts['build:analyze']).not.toContain('--analyze');
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

    expect(source).toContain('loadEnv');
    expect(source).toContain('defineConfig(({ mode, command }) => {');
    expect(source).toContain("loadEnv(mode, process.cwd(), '')");
    expect(source).toContain("env.VITE_BUILD_ANALYZE === 'true'");
    expect(source).toContain("process.env.npm_lifecycle_event === 'build:analyze'");
    expect(source).not.toContain('process.env.ANALYZE');
  });

  it('documents required Vite env variables in .env.example with real default values', () => {
    // `.env.development` and `.env.production` are gitignored (see README.md
    // "Variables de entorno" and .gitignore) and never committed, so they don't
    // exist in a clean checkout or CI. `.env.example` is the one real, committed
    // file that documents the contract, so every assertion here reads from it
    // directly instead of from self-written fixtures the test would then be
    // comparing against itself.
    const exampleEnv = readFileSync('.env.example', 'utf8');

    function declaredValue(envName) {
      const match = exampleEnv.match(new RegExp(`^${envName}="([^"]*)"$`, 'm'));
      return match ? match[1] : null;
    }

    // Vars that must ship with a real, non-empty default: an empty VITE_API_URL
    // or VITE_GLOBAL_ID leaves a fresh checkout pointing at nothing, and an
    // empty VITE_API_PROF_URL/VITE_API_EMAIL_URL/VITE_BUILD_ANALYZE silently
    // breaks professional lookup,
    // email notifications, or the analyzer toggle without anyone noticing until
    // the app is running.
    const requiredNonEmptyVars = [
      'VITE_API_URL',
      'VITE_GLOBAL_ID',
      'VITE_API_PROF_URL',
      'VITE_API_EMAIL_URL',
      'VITE_BUILD_ANALYZE',
    ];

    // Documented optional overrides (README.md "Variables de entorno"):
    // intentionally shipped empty in the template and filled per environment
    // via *.local overrides, so they must be declared but may stay empty.
    const optionalVars = ['VITE_PROFESSIONALS_API_URL'];

    for (const envName of [...requiredNonEmptyVars, ...optionalVars]) {
      expect(declaredValue(envName), `${envName} must be declared in .env.example as KEY="value"`).not.toBeNull();
    }

    for (const envName of requiredNonEmptyVars) {
      expect(declaredValue(envName).trim(), `${envName} must not ship with an empty default`).not.toBe('');
    }

    expect(declaredValue('VITE_BUILD_ANALYZE')).toMatch(/^(true|false)$/);
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

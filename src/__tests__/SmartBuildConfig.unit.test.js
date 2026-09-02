import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const buildRunner = 'node build-tools/run-vite-build.mjs';
const buildRunnerPath = 'build-tools/run-vite-build.mjs';

describe('smart build configuration', () => {
  it('uses explicit Vite modes for development and production scripts', () => {
    expect(packageJson.scripts.dev).toBe('vite --mode development');
    expect(packageJson.scripts.start).toBe('vite --mode development');
    expect(packageJson.scripts.build).toBe(`${buildRunner} production`);
    expect(packageJson.scripts['build:prod']).toBe(`${buildRunner} production`);
    expect(packageJson.scripts['build:production']).toBe(`${buildRunner} production`);
    expect(packageJson.scripts['build:dev']).toBe(`${buildRunner} development`);
    expect(packageJson.scripts['build:analyze']).toBe(`${buildRunner} production --analyze`);

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

  it('uses a cross-platform Node build runner for heap and analyzer flags', () => {
    const runnerExists = existsSync(buildRunnerPath);

    expect(runnerExists).toBe(true);

    if (!runnerExists) return;

    const source = readFileSync(buildRunnerPath, 'utf8');

    expect(source).toContain('spawnSync');
    expect(source).toContain('process.execPath');
    expect(source).toContain('--max-old-space-size=4096');
    expect(source).toContain('VITE_BUILD_ANALYZE');
    expect(source).toContain("'vite/package.json'");
    expect(source).toContain("'bin/vite.js'");
    expect(source).not.toContain("require.resolve('vite/bin/vite.js')");
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
    // empty VITE_GOOGLE_CAPTCHA_HTML/VITE_API_PROF_URL/VITE_API_EMAIL_URL/
    // VITE_BUILD_ANALYZE silently breaks login captcha, professional lookup,
    // email notifications, or the analyzer toggle without anyone noticing until
    // the app is running.
    const requiredNonEmptyVars = [
      'VITE_API_URL',
      'VITE_GLOBAL_ID',
      'VITE_GOOGLE_CAPTCHA_HTML',
      'VITE_API_PROF_URL',
      'VITE_API_EMAIL_URL',
      'VITE_BUILD_ANALYZE',
    ];

    // Documented optional overrides (README.md "Variables de entorno"):
    // intentionally shipped empty in the template and filled per environment
    // via *.local overrides, so they must be declared but may stay empty.
    const optionalVars = ['VITE_GOOGLE_CAPTCHA_KEY', 'VITE_GOOGLE_MAPS_KEY'];

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

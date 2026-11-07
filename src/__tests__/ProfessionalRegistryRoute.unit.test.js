import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(path.resolve(__dirname, '../app/router/routes.jsx'), 'utf8');
const paletteSource = readFileSync(path.resolve(__dirname, '../app/layouts/command-palette/CommandPalette.jsx'), 'utf8');

describe('BD PROFESIONALES route', () => {
  it('is lazy loaded and mounted inside the authenticated layout, next to the existing professionals route', () => {
    expect(source).toMatch(/const PROFESSIONAL_REGISTRY = lazy\(\(\) => import\('\.\.\/\.\.\/features\/professional-registry\/ProfessionalRegistryPage'\)\);/);
    const privateLayout = source.indexOf('<Route element={<PrivateLayout />}>');
    const registryRoute = source.indexOf('<Route path="/bd-profesionales" element={<PROFESSIONAL_REGISTRY />} />');
    const legacyRoute = source.indexOf('<Route path="/profesionales"');
    expect(privateLayout).toBeGreaterThan(-1);
    expect(registryRoute).toBeGreaterThan(privateLayout);
    expect(registryRoute).toBeGreaterThan(legacyRoute);
    expect(source.indexOf('<Route path="*"')).toBeGreaterThan(registryRoute);
  });

  it('does not touch the existing professionals module route', () => {
    expect(source).toMatch(/<Route path="\/profesionales" element=\{\s*<PROFESIONALS /);
  });

  it('is listed in the command palette right below the existing professionals database', () => {
    const legacy = paletteSource.indexOf("route: '/profesionales'");
    const registry = paletteSource.indexOf("route: '/bd-profesionales'");
    expect(legacy).toBeGreaterThan(-1);
    expect(registry).toBeGreaterThan(legacy);
    expect(paletteSource.slice(legacy, registry).split('\n')).toHaveLength(2);
  });
});

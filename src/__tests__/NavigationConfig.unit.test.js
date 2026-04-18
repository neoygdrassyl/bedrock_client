import { describe, expect, it } from 'vitest';
import { getNavItems, getRouteRedirects } from '@/app/layouts/navigation-config';

describe('navigation-config', () => {
  describe('getNavItems', () => {
    it('returns all items for ADMIN role', () => {
      const items = getNavItems('ADMIN');
      const ids = items.map((i) => i.id);
      expect(ids).toContain('dashboard');
      expect(ids).toContain('licencias');
      expect(ids).toContain('peticiones');
      expect(ids).toContain('ventanilla');
      expect(ids).toContain('mensajes');
      expect(ids).toContain('calendario');
      expect(ids).toContain('archivo');
      expect(ids).toContain('publicaciones');
      expect(ids).toContain('nomenclatura');
      expect(ids).toContain('normas');
    });

    it('returns limited items for USER role', () => {
      const items = getNavItems('USER');
      const ids = items.map((i) => i.id);
      expect(ids).toContain('dashboard');
      expect(ids).toContain('calendario');
      expect(ids).toContain('ventanilla');
      expect(ids).toContain('peticiones');
      expect(ids).toContain('normas');
      // USER should NOT see admin-only modules
      expect(ids).not.toContain('mensajes');
      expect(ids).not.toContain('archivo');
      expect(ids).not.toContain('publicaciones');
    });

    it('returns all items when role is null (legacy fallback)', () => {
      const items = getNavItems(null);
      expect(items.length).toBeGreaterThan(5);
    });

    it('each item has required fields', () => {
      const items = getNavItems('ADMIN');
      for (const item of items) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('route');
        expect(item).toHaveProperty('roles');
      }
    });
  });

  describe('getRouteRedirects', () => {
    it('returns old-to-new route mapping', () => {
      const redirects = getRouteRedirects();
      expect(redirects['/fun']).toBe('/licencias');
      expect(redirects['/funmanage']).toBe('/licencias/gestion');
      expect(redirects['/pqrsadmin']).toBe('/peticiones');
      expect(redirects['/mail']).toBe('/mensajes');
      expect(redirects['/profesionals']).toBe('/profesionales');
    });
  });
});

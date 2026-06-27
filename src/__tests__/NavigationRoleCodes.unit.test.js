import { describe, expect, it } from 'vitest';
import { getNavItems } from '@/app/layouts/navigation-config';

describe('navigation role code compatibility', () => {
  it('treats ADM as an admin-equivalent role code', () => {
    const ids = getNavItems('ADM').map((item) => item.id);
    expect(ids).toContain('licencias');
    expect(ids).toContain('mensajes');
    expect(ids).toContain('archivo');
    expect(ids).toContain('publicaciones');
  });
});

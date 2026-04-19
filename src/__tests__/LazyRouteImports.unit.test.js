import { describe, expect, it } from 'vitest';

const lazyRouteModules = [
  {
    name: 'profesionals page',
    load: () => import('@/app/pages/user/profesionals/profesionals.page'),
  },
  {
    name: 'profesionals email page',
    load: () => import('@/app/pages/user/profesionals/email.page'),
  },
  {
    name: 'profesionals public page',
    load: () => import('@/app/pages/user/profesionals/public.page'),
  },
  {
    name: 'guide user page',
    load: () => import('@/app/pages/user/guide_user/guide_user.page'),
  },
  {
    name: 'dev guide page',
    load: () => import('@/app/pages/user/dev_guide/dev_guide.page'),
  },
  {
    name: 'norms page',
    load: () => import('@/app/pages/user/norms/norms.page'),
  },
  {
    name: 'certification page',
    load: () => import('@/app/pages/user/certifications/certification.page'),
  },
  {
    name: 'zone use page',
    load: () => import('@/app/pages/user/zone_use/zone_use.page'),
  },
];

describe('lazy route module imports', () => {
  it.each(lazyRouteModules)('loads $name without missing wrapper exports', async ({ load }) => {
    const module = await load();

    expect(module.default).toBeTypeOf('function');
  });
});

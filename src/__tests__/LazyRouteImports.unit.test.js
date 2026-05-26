import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

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
  {
    name: 'legal flow guide page',
    load: () => import('@/app/pages/user/legal_flow_guide/LegalFlowGuide.page'),
  },
];

describe('lazy route module imports', () => {
  it.each(lazyRouteModules)('loads $name without missing wrapper exports', async ({ load }) => {
    const module = await load();

    expect(module.default).toBeTypeOf('function');
  });

  it('keeps legal flow guide out of the eager app entry bundle', () => {
    const appSource = readFileSync('src/app/App.js', 'utf8');

    expect(appSource).toContain(
      "const LEGAL_FLOW_GUIDE = lazy(() => import('./pages/user/legal_flow_guide/LegalFlowGuide.page'))",
    );
    expect(appSource).not.toContain(
      "import LEGAL_FLOW_GUIDE from './pages/user/legal_flow_guide/LegalFlowGuide.page'",
    );
  });
});

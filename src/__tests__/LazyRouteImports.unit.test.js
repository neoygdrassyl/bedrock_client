import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const lazyRouteModules = [
  {
    name: 'profesionals page',
    load: () => import('@/features/professionals/profesionals.page'),
  },
  {
    name: 'guide user page',
    load: () => import('@/features/help/guide_user/guide_user.page'),
  },
  {
    name: 'dev guide page',
    load: () => import('@/features/help/dev_guide/dev_guide.page'),
  },
  {
    name: 'norms page',
    load: () => import('@/features/norms/norms.page'),
  },
  {
    name: 'certification page',
    load: () => import('@/features/certifications/certification.page'),
  },
  {
    name: 'zone use page',
    load: () => import('@/features/norms/zone-use/zone_use.page'),
  },
  {
    name: 'legal flow guide page',
    load: () => import('@/features/simulador/legal_flow_guide/LegalFlowGuide.page'),
  },
];

describe('lazy route module imports', () => {
  it.each(lazyRouteModules)('loads $name without missing wrapper exports', async ({ load }) => {
    const module = await load();

    expect(module.default).toBeTypeOf('function');
  });

  it('keeps legal flow guide out of the eager app entry bundle', () => {
    const appSource = readFileSync('src/app/router/routes.jsx', 'utf8');

    expect(appSource).toContain(
      "const LEGAL_FLOW_GUIDE = lazy(() => import('../../features/simulador/legal_flow_guide/LegalFlowGuide.page'))",
    );
    expect(appSource).not.toContain(
      "import LEGAL_FLOW_GUIDE from '../../features/simulador/legal_flow_guide/LegalFlowGuide.page'",
    );
  });
});

import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const COMPACT_SIDEBAR_BREAKPOINT = 1200;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

export function useIsCompactSidebar() {
  const [isCompact, setIsCompact] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth < COMPACT_SIDEBAR_BREAKPOINT,
  );

  React.useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < COMPACT_SIDEBAR_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isCompact;
}

/**
 * Responsive tiers of the app shell (viewport width, px). One model for the sidebar, the
 * header and the expediente workspace:
 *
 *   wide     >= 1536   rail sidebar, full header, inline section nav
 *   desktop  >= 1200   rail sidebar, shorter breadcrumb
 *   compact  >= 1024   rail sidebar (always collapsed by default), densest desktop header
 *   tablet   >=  640   off-canvas sidebar and section nav, 40px touch targets
 *   mobile   <   640   same as tablet, header tools grouped in one overflow menu
 *
 * Below `compact` the sidebar and the expediente section nav are off-canvas sheets.
 * Density inside a bar follows the bar's measured width, not the tier, because the
 * sidebar can be expanded.
 */
export const SHELL_TIER_MIN_WIDTH = Object.freeze({ wide: 1536, desktop: 1200, compact: 1024, tablet: 640, mobile: 0 });
const SHELL_TIER_ORDER = ['wide', 'desktop', 'compact', 'tablet', 'mobile'];

function readShellTier() {
  if (typeof window === 'undefined') return 'wide';
  const width = window.innerWidth;
  return SHELL_TIER_ORDER.find((tier) => width >= SHELL_TIER_MIN_WIDTH[tier]) || 'mobile';
}

/** Current shell tier; re-renders only when a tier boundary is crossed. */
export function useShellTier() {
  const [tier, setTier] = React.useState(readShellTier);

  React.useEffect(() => {
    const handleResize = () => setTier(readShellTier());
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return tier;
}

/** True in the tiers where the sidebar is an off-canvas sheet (tablet and mobile). */
export function isOffCanvasTier(tier) {
  return tier === 'tablet' || tier === 'mobile';
}

/** True below 1024px: the app sidebar is an off-canvas sheet opened from the header. */
export function useIsOffCanvasSidebar() {
  return isOffCanvasTier(useShellTier());
}

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

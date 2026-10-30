import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { LazyMotion, MotionConfig } from 'motion/react';
import { getNavItems } from './navigation-config';
import { AppSidebar } from './AppSidebar';
import { HeaderBar } from './HeaderBar';
import { AppFooter } from './AppFooter';
import { LegacyPageWrapper } from '../../shared/components/LegacyPageWrapper';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';
import { useIsCompactSidebar } from '@/shared/hooks/use-mobile';
import { NavigationPendingProvider } from './navigation-pending-context';
import { TopProgressBar } from './TopProgressBar';
import { BusinessCalendarSyncNotice } from './BusinessCalendarBootstrap';

const SIDEBAR_STORAGE_KEY = 'dovela-sidebar-collapsed';
const SIDEBAR_SIZE_VARS = { '--sidebar-width': '16.5rem', '--sidebar-width-icon': '3.5rem' };
const loadMotionFeatures = () => import('./motion-features').then((module) => module.default);

function moduleKey(pathname) {
  return pathname.split('/')[1] || '';
}

/**
 * Fades the page in when the user switches module. It animates the existing node
 * instead of re-keying it, so pages are never remounted and keep their state.
 */
function RouteContentTransition({ children }) {
  const location = useLocation();
  const scope = useRef(null);
  const currentModule = moduleKey(location.pathname);
  const previousModule = useRef(currentModule);

  useEffect(() => {
    if (previousModule.current === currentModule) return;
    previousModule.current = currentModule;
    const node = scope.current;
    if (!node?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    // Native WAAPI: compositor-only properties, ends on `transform: none` so no containing block lingers.
    node.animate(
      [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
      { duration: 220, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    );
  }, [currentModule]);

  return <div ref={scope}>{children}</div>;
}

/**
 * Main application shell: floating sidebar + header + content + footer.
 * Only the routed content changes on navigation; the shell stays mounted.
 */
export function AppShell({ user, onLogout, children }) {
  const navItems = getNavItems(user?.role_short);
  const isCompactSidebar = useIsCompactSidebar();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'; }
    catch { return false; }
  });
  const [compactSidebarOpen, setCompactSidebarOpen] = useState(false);

  useEffect(() => {
    if (isCompactSidebar) setCompactSidebarOpen(false);
  }, [isCompactSidebar]);

  const handleSidebarOpenChange = useCallback((open) => {
    if (isCompactSidebar) {
      setCompactSidebarOpen(open);
      return;
    }

    const collapsed = !open;
    setSidebarCollapsed(collapsed);
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed)); } catch {}
  }, [isCompactSidebar]);

  const sidebarOpen = isCompactSidebar ? compactSidebarOpen : !sidebarCollapsed;

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SidebarProvider
          open={sidebarOpen}
          onOpenChange={handleSidebarOpenChange}
          style={SIDEBAR_SIZE_VARS}
          className="h-screen overflow-hidden bg-background text-foreground"
        >
          <NavigationPendingProvider>
            <TopProgressBar />
            <AppSidebar items={navItems} user={user} onLogout={onLogout} />

            <SidebarInset className="min-h-0 min-w-0">
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="app-shell-header px-2 pt-2">
                  <HeaderBar />
                  <BusinessCalendarSyncNotice className="mt-2" />
                </div>

                <ScrollArea type="always" className="flex-1 app-shell-main-scroll">
                  <div id="main-content" className="p-4 md:p-5">
                    <RouteContentTransition>
                      <LegacyPageWrapper>
                        {children}
                      </LegacyPageWrapper>
                    </RouteContentTransition>
                  </div>
                </ScrollArea>

                <AppFooter />
              </div>
            </SidebarInset>

          </NavigationPendingProvider>
        </SidebarProvider>
      </MotionConfig>
    </LazyMotion>
  );
}

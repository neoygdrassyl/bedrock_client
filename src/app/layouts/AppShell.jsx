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
import { cn } from '@/shared/lib/utils';
import { registerWorkspaceSlot, useShellWorkspaceActive } from '@/shared/lib/shellWorkspace';
import { NavigationPendingProvider } from './navigation-pending-context';
import { TopProgressBar } from './TopProgressBar';
import { BusinessCalendarSyncNotice } from './BusinessCalendarBootstrap';
import { ExpedienteDockMount } from '../../features/expediente/dock';

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
 *
 * Workspace mode (see `shared/lib/shellWorkspace`): while a full-height workspace such
 * as the expediente detail is mounted, only the page scroller is hidden and the workspace
 * fills that region through the slot below. The header card and the footer keep their
 * exact geometry (the workspace adds its breadcrumb and actions to the header through
 * the store slots). The sidebar collapses to its icon rail for the visit, to give the
 * expediente the room: that is session state only, the persisted preference is never
 * written and applies again on leaving. Ctrl/⌘+B can still expand it while the workspace
 * is open (the header shows its trigger only when the sidebar is off-canvas, below
 * 1024px); the header card follows the sidebar width. Tiers: `shared/hooks/use-mobile`.
 */
export function AppShell({ user, onLogout, children }) {
  const navItems = getNavItems(user?.role_short);
  const isCompactSidebar = useIsCompactSidebar();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'; }
    catch { return false; }
  });
  const [compactSidebarOpen, setCompactSidebarOpen] = useState(false);
  const workspaceActive = useShellWorkspaceActive();
  // Sidebar state for the current workspace visit only (never persisted). Reset during
  // render when workspace mode flips, so the rail is in place on the first workspace paint.
  const [workspaceSidebarOpen, setWorkspaceSidebarOpen] = useState(false);
  const [trackedWorkspaceActive, setTrackedWorkspaceActive] = useState(workspaceActive);
  if (trackedWorkspaceActive !== workspaceActive) {
    setTrackedWorkspaceActive(workspaceActive);
    setWorkspaceSidebarOpen(false);
  }

  useEffect(() => {
    if (isCompactSidebar) setCompactSidebarOpen(false);
  }, [isCompactSidebar]);

  const handleSidebarOpenChange = useCallback((open) => {
    if (isCompactSidebar) {
      setCompactSidebarOpen(open);
      return;
    }

    if (workspaceActive) {
      setWorkspaceSidebarOpen(open);
      return;
    }

    const collapsed = !open;
    setSidebarCollapsed(collapsed);
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed)); } catch {}
  }, [isCompactSidebar, workspaceActive]);

  const desktopSidebarOpen = workspaceActive ? workspaceSidebarOpen : !sidebarCollapsed;
  const sidebarOpen = isCompactSidebar ? compactSidebarOpen : desktopSidebarOpen;

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

                {/* Workspace slot: empty and hidden unless a workspace is mounted. */}
                <div
                  ref={registerWorkspaceSlot}
                  data-shell-workspace-slot=""
                  className={workspaceActive ? 'flex min-h-0 min-w-0 flex-1 flex-col' : 'hidden'}
                />

                {/* Kept mounted (only hidden) in workspace mode so the page keeps its state. */}
                <ScrollArea type="always" className={cn('flex-1 app-shell-main-scroll', workspaceActive && 'hidden')}>
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

            {/* Global expediente dock: renders nothing (and loads no chunk) while empty. */}
            <ExpedienteDockMount />
          </NavigationPendingProvider>
        </SidebarProvider>
      </MotionConfig>
    </LazyMotion>
  );
}

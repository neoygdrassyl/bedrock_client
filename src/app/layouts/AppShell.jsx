import { useState, useCallback, useEffect } from 'react';
import { getNavItems } from './navigation-config';
import { AppSidebar } from './AppSidebar';
import { HeaderBar } from './HeaderBar';
import { AppFooter } from './AppFooter';
import { LegacyPageWrapper } from './LegacyPageWrapper';
import { DovelaSupportLayer } from '../components/DovelaSupportLayer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useIsCompactSidebar } from '@/hooks/use-mobile';

const SIDEBAR_STORAGE_KEY = 'dovela-sidebar-collapsed';

/**
 * Main application shell: official shadcn sidebar + header + content + footer.
 * Sidebar state remains persisted for compatibility with the previous shell.
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
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={handleSidebarOpenChange}
      className="h-screen overflow-hidden bg-background text-foreground"
    >
      <AppSidebar items={navItems} />

      <SidebarInset className="min-h-0 min-w-0">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="app-shell-header">
            <HeaderBar
              user={user}
              onLogout={onLogout}
            />
          </div>

          <ScrollArea className="flex-1 app-shell-main-scroll">
            <div id="main-content" className="p-4 md:p-5">
              <LegacyPageWrapper>
                {children}
              </LegacyPageWrapper>
            </div>
          </ScrollArea>

          <AppFooter />
        </div>
      </SidebarInset>

      <DovelaSupportLayer user={user} />
    </SidebarProvider>
  );
}

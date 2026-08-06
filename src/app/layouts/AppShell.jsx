import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getNavItems } from './navigation-config';
import { IconRail } from './IconRail';
import { ContextPanel } from './ContextPanel';
import { HeaderBar } from './HeaderBar';
import { AppFooter } from './AppFooter';
import { LegacyPageWrapper } from './LegacyPageWrapper';
import { DovelaSupportLayer } from '../components/DovelaSupportLayer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { infoCud } from '@/app/components/jsons/vars';

const SIDEBAR_STORAGE_KEY = 'dovela-sidebar-collapsed';

/**
 * Main application shell: rail + panel + header + content + footer.
 * Sidebar is collapsible and persists state in localStorage.
 */
export function AppShell({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = getNavItems(user?.role_short);

  const activeItem = navItems.find(
    (item) =>
      location.pathname === item.route ||
      location.pathname.startsWith(item.route + '/') ||
      item.children?.some((child) => location.pathname === child.route)
  ) || null;

  const [activeRailId, setActiveRailId] = useState(activeItem?.id ?? null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'; }
    catch { return false; }
  });

  // Sync activeRailId when route changes externally (e.g. browser back/forward)
  useEffect(() => {
    const nextActiveId = activeItem?.id ?? null;
    if (nextActiveId !== activeRailId) {
      setActiveRailId(nextActiveId);
    }
  }, [activeItem?.id, activeRailId]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut: Ctrl+B / Cmd+B
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar]);

  const selectedItem = navItems.find((item) => item.id === activeRailId) || null;
  const panelItems = selectedItem?.children || [];

  const handleRailSelect = useCallback(
    (id) => {
      setActiveRailId(id);
      const item = navItems.find((i) => i.id === id);
      if (item) {
        navigate(item.route);
      }
    },
    [navItems, navigate]
  );

  const logo = (
    <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center bg-white/10">
      <img
        src={infoCud.icon}
        alt={infoCud.name}
        className="w-full h-full object-contain"
      />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="app-shell-rail">
      <IconRail
        items={navItems}
        activeId={activeRailId}
        onSelect={handleRailSelect}
        logo={logo}
        collapsed={sidebarCollapsed}
      />
      </div>

      <div className="app-shell-context">
      <ContextPanel
        title={selectedItem?.label || ''}
        items={panelItems}
        collapsed={sidebarCollapsed || panelItems.length === 0}
      />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="app-shell-header">
        <HeaderBar
          user={user}
          onLogout={onLogout}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        </div>

        <ScrollArea type="always" className="flex-1 app-shell-main-scroll">
          <main id="main-content" className="p-4 md:p-5">
            <LegacyPageWrapper>
              {children}
            </LegacyPageWrapper>
          </main>
        </ScrollArea>

        <AppFooter />
      </div>

      <DovelaSupportLayer user={user} />
    </div>
  );
}

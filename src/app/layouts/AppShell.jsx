import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getNavItems } from './navigation-config';
import { IconRail } from './IconRail';
import { ContextPanel } from './ContextPanel';
import { HeaderBar } from './HeaderBar';
import { AppFooter } from './AppFooter';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Main application shell: rail + panel + header + content + footer.
 */
export function AppShell({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const navItems = getNavItems(user?.role_short);

  const activeItem = navItems.find(
    (item) =>
      location.pathname === item.route ||
      location.pathname.startsWith(item.route + '/') ||
      item.children?.some((child) => location.pathname === child.route)
  ) || navItems[0];

  const [activeRailId, setActiveRailId] = useState(activeItem?.id || 'dashboard');

  const selectedItem = navItems.find((item) => item.id === activeRailId);
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
    <div className="w-8 h-8 rounded-lg bg-sidebar-accent/20 flex items-center justify-center text-sidebar-foreground font-semibold text-sm">
      D
    </div>
  );

  const bottomSlot = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="h-10 w-10 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/10"
        aria-label={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <IconRail
        items={navItems}
        activeId={activeRailId}
        onSelect={handleRailSelect}
        logo={logo}
        bottomSlot={bottomSlot}
      />

      <ContextPanel
        title={selectedItem?.label || ''}
        items={panelItems}
        collapsed={panelItems.length === 0}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <HeaderBar user={user} onLogout={onLogout} />

        <ScrollArea className="flex-1">
          <main id="main-content" className="p-6">
            {children}
          </main>
        </ScrollArea>

        <AppFooter />
      </div>
    </div>
  );
}

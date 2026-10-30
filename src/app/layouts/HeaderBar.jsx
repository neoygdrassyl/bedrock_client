import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { useTheme } from '@/shared/components/theme-provider';
import { Sun, Moon, Search, CalendarDays, ChevronRight } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { SidebarTrigger, useSidebar } from '@/shared/ui/sidebar';
import { cn } from '@/shared/lib/utils';
import ChatLauncher from '../../features/messaging/chat/ChatLauncher';
import { RUNTIME_FEATURES } from '../../shared/config/runtime-features';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';

const LazyAlarmBell = lazy(() =>
  import('../../features/expediente/fun/fun_forms/components/AlarmBell').then((module) => ({
    default: module.AlarmBell,
  })),
);

const LazyGlobalSearchDialog = lazy(() =>
  import('./GlobalSearchDialog').then((module) => ({
    default: module.GlobalSearchDialog,
  })),
);

const MODULE_ICONS = {
  dashboard: 'LayoutGrid',
  licencias: 'Building2',
  peticiones: 'MessageSquareText',
  ventanilla: 'Inbox',
  mensajes: 'Mail',
  calendario: 'CalendarDays',
  archivo: 'Archive',
  publicaciones: 'Megaphone',
  nomenclatura: 'Signpost',
  normas: 'Landmark',
  simulador: 'FlaskConical',
  documentos: 'FileText',
  calculadora: 'Calculator',
  consecutivos: 'Book',
  profesionales: 'HardHat',
  certificados: 'Contact',
  ayuda: 'BookOpen',
  sellos: 'Stamp',
};

/**
 * Floating top bar: sidebar toggle + breadcrumb on the left; calendar, search,
 * chat, alarms and theme on the right. The account menu lives in the sidebar footer.
 */
export function HeaderBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { isMobile, openMobile, state } = useSidebar();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const sidebarOpen = isMobile ? openMobile : state === 'expanded';
  const shortcutModifier = /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘' : 'Ctrl';

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + segments.slice(0, i + 1).join('/'),
    icon: i === 0 ? MODULE_ICONS[seg] : undefined,
  }));

  useEffect(() => {
    const handleSearchShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  return (
    <header className="flex h-16 min-w-0 items-center gap-1.5 overflow-hidden rounded-2xl border border-border/70 bg-card px-2.5 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] select-none">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger
              aria-label={sidebarOpen ? 'Ocultar menú lateral' : 'Expandir menú lateral'}
              title={sidebarOpen ? 'Ocultar menú lateral' : 'Expandir menú lateral'}
              className="h-11 w-11 shrink-0 lg:h-7 lg:w-7"
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4} className="text-xs">
            {sidebarOpen ? 'Ocultar menú' : 'Expandir menú'} <kbd className="ml-1 text-[9px] bg-muted/80 px-1 py-0.5 rounded font-mono">{shortcutModifier}B</kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-4 mx-0.5" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden text-[13px]">
        <Link to="/dashboard" className="hidden shrink-0 rounded-sm text-[13px] text-muted-foreground no-underline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card xl:inline-flex">
          Inicio
        </Link>
        {breadcrumb.map((crumb, i) => (
          <span
            key={crumb.path}
            className={cn(
              'min-w-0 items-center gap-0.5',
              i === breadcrumb.length - 1 ? 'flex' : 'hidden xl:flex',
            )}
          >
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            {i === breadcrumb.length - 1 ? (
              <span className="text-foreground font-medium truncate flex items-center gap-1">
                {crumb.icon && <Icon name={crumb.icon} size={13} className="text-primary/80 shrink-0" />}
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="rounded-sm text-muted-foreground hover:text-foreground no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/calendario-laboral"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Abrir calendario laboral"
            >
              <CalendarDays className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4} className="text-xs">
            Calendario laboral
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-xs text-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card lg:h-8 lg:w-64 lg:justify-start lg:gap-2 lg:px-3"
        aria-label="Buscar expediente"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden lg:inline">Buscar expediente…</span>
        <kbd className="ml-auto hidden rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-none xl:inline">{shortcutModifier} K</kbd>
      </button>

      {/* Chat & notifications */}
      <ChatLauncher />
      {RUNTIME_FEATURES.alarmsEnabled && (
        <Suspense fallback={null}>
          <LazyAlarmBell />
        </Suspense>
      )}

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="h-11 w-11 shrink-0 rounded-xl p-0 text-muted-foreground lg:h-8 lg:w-8"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {searchOpen && (
        <Suspense fallback={null}>
          <LazyGlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}
    </header>
  );
}

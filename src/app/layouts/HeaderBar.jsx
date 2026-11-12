import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { useTheme } from '@/shared/components/theme-provider';
import { Sun, Moon, Search, CalendarDays, ChevronRight } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { SidebarTrigger, useSidebar } from '@/shared/ui/sidebar';
import { cn } from '@/shared/lib/utils';
import { useShellTier } from '@/shared/hooks/use-mobile';
import {
  registerHeaderActionsSlot,
  registerHeaderBreadcrumbSlot,
  useShellWorkspaceActive,
} from '@/shared/lib/shellWorkspace';
import ChatLauncher from '../../features/messaging/chat/ChatLauncher';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';

// The palette code is fetched on first use; hovering/focusing the trigger prefetches it.
const loadCommandPalette = () => import('./command-palette/CommandPalette');
const LazyCommandPalette = lazy(loadCommandPalette);
const prefetchCommandPalette = () => { loadCommandPalette().catch(() => undefined); };

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || Boolean(target.closest('[contenteditable="true"], [role="textbox"]'));
}

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

// Other shell surfaces open the palette without importing it (e.g. the workspace overflow
// menu on phones, where the search trigger is not in the bar).
export const OPEN_SEARCH_EVENT = 'dovela:open-search';

// While a workspace shares the header, the search gives room by the header's own width
// (px; it changes with the sidebar): below this the field shrinks to its icon. The
// expediente workspace sizes its identity around it (`HEADER_MIN_WIDTH`).
const WORKSPACE_FULL_SEARCH_MIN_WIDTH = 1120;

const WIDE_HEADER_LAYOUT = Object.freeze({ compactSearch: false });

/**
 * Layout flags of the header while a workspace is active. Only the threshold crossings
 * are stored (not the pixel width), so the bar does not re-render on every frame of the
 * sidebar transition.
 */
function useWorkspaceHeaderLayout(headerRef, workspaceActive) {
  const [layout, setLayout] = useState(WIDE_HEADER_LAYOUT);

  useEffect(() => {
    const node = headerRef.current;
    if (!workspaceActive || !node || typeof ResizeObserver === 'undefined') {
      setLayout(WIDE_HEADER_LAYOUT);
      return undefined;
    }
    const update = () => {
      const width = node.clientWidth || null;
      const compactSearch = width != null && width < WORKSPACE_FULL_SEARCH_MIN_WIDTH;
      setLayout((previous) => (previous.compactSearch === compactSearch ? previous : { compactSearch }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [headerRef, workspaceActive]);

  return layout;
}

/**
 * Floating top bar: sidebar toggle + breadcrumb on the left; calendar, search,
 * chat and theme on the right. The account menu lives in the sidebar footer.
 *
 * While a workspace is active (`shared/lib/shellWorkspace`) the bar keeps its geometry but
 * shows only identity, search and window controls: the workspace fills the breadcrumb
 * area and the window-control area at the far end through portals. The sidebar trigger
 * stays only while the sidebar is off-canvas (Ctrl/⌘+B still toggles the rail); calendar,
 * chat and theme step aside (sidebar, account menu and command palette keep them
 * reachable). On phones the search trigger moves into the workspace overflow menu.
 */
export function HeaderBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { isMobile, openMobile, state } = useSidebar();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  // Stays mounted after the first open so the close animation and loaded chunk are kept.
  const [paletteMounted, setPaletteMounted] = useState(false);
  const workspaceActive = useShellWorkspaceActive();
  const headerRef = useRef(null);
  const { compactSearch } = useWorkspaceHeaderLayout(headerRef, workspaceActive);
  const tier = useShellTier();
  const showSidebarTrigger = !workspaceActive || isMobile;
  const showSearchTrigger = !workspaceActive || tier !== 'mobile';
  // 40px targets in the off-canvas tiers of the workspace header.
  const workspaceTouch = workspaceActive && isMobile;

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
      const isModK = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k';
      const isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey
        && !event.defaultPrevented && !isTypingTarget(event.target);
      if (isModK || isSlash) {
        event.preventDefault();
        setPaletteMounted(true);
        setSearchOpen((current) => (isModK ? !current : true));
      }
    };

    const handleOpenRequest = () => { setPaletteMounted(true); setSearchOpen(true); };

    window.addEventListener('keydown', handleSearchShortcut);
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpenRequest);
    return () => {
      window.removeEventListener('keydown', handleSearchShortcut);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleOpenRequest);
    };
  }, []);

  return (
    <header ref={headerRef} data-workspace={workspaceActive ? 'true' : undefined} className="flex h-16 short:h-12 min-w-0 items-center gap-1.5 overflow-hidden rounded-2xl border border-border/70 bg-card px-2.5 shadow-[shadow:var(--elevation-floating)] select-none">
      {showSidebarTrigger ? (
        <>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger
                  aria-label={sidebarOpen ? 'Ocultar menú lateral' : 'Expandir menú lateral'}
                  title={sidebarOpen ? 'Ocultar menú lateral' : 'Expandir menú lateral'}
                  className={cn('h-8 w-8 shrink-0 touch:h-11 touch:w-11', workspaceTouch && 'h-10 w-10')}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} className="text-xs">
                {sidebarOpen ? 'Ocultar menú' : 'Expandir menú'} <kbd className="ml-1 text-[9px] bg-muted/80 px-1 py-0.5 rounded font-mono">{shortcutModifier}B</kbd>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-4 mx-0.5" />
        </>
      ) : null}

      {/* Breadcrumb: the active workspace renders its own trail (and identity) here. */}
      {workspaceActive ? (
        <nav
          ref={registerHeaderBreadcrumbSlot}
          aria-label="Breadcrumb"
          data-shell-header-breadcrumb=""
          className={cn('flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden text-[13px]', !showSidebarTrigger && 'pl-1.5')}
        />
      ) : (
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
      )}

      {!workspaceActive ? (
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
      ) : null}

      {/* Search trigger */}
      {showSearchTrigger ? (
        <button
          type="button"
          onClick={() => { setPaletteMounted(true); setSearchOpen(true); }}
          onPointerEnter={prefetchCommandPalette}
          onFocus={prefetchCommandPalette}
          className={cn(
            'flex h-8 w-8 shrink-0 touch:h-11 touch:min-w-11 items-center justify-center rounded-xl border border-border bg-muted/60 text-xs text-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            !compactSearch && 'lg:w-64 lg:justify-start lg:gap-2 lg:px-3',
            workspaceTouch && 'h-10 w-10',
          )}
          aria-label="Buscar expedientes, módulos o acciones"
          title={compactSearch ? `Buscar (${shortcutModifier} K)` : undefined}
          aria-keyshortcuts="Control+K Meta+K /"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className={cn('hidden', !compactSearch && 'lg:inline')}>Buscar…</span>
          <kbd className={cn('ml-auto hidden rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-none', !compactSearch && 'xl:inline')}>{shortcutModifier} K</kbd>
        </button>
      ) : null}

      {/* Chat: stays mounted (hidden) in workspace mode so the palette can still open it. */}
      <div className={workspaceActive ? 'hidden' : 'contents'}>
        <ChatLauncher />
      </div>

      {workspaceActive ? (
        <>
          {showSearchTrigger ? <Separator orientation="vertical" className="mx-1 h-5" /> : null}
          {/* Window controls of the workspace (open expedientes, minimize, close): always last. */}
          <div
            ref={registerHeaderActionsSlot}
            data-shell-header-actions=""
            className="flex shrink-0 items-center gap-0.5 empty:hidden"
          />
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="h-8 w-8 shrink-0 rounded-xl p-0 text-muted-foreground touch:h-11 touch:w-11"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      )}

      {paletteMounted && (
        <Suspense fallback={null}>
          <LazyCommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}
    </header>
  );
}

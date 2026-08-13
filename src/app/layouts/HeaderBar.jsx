import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon, LogOut, Search, ChevronRight, FileText, UserCircle2, AlertTriangle } from 'lucide-react';
import { Icon } from '@/components/icon';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { requestDovelaErrorReport } from '@/app/utils/errorReporting';
import { cn } from '@/lib/utils';
import ChatLauncher from '../pages/user/chat/ChatLauncher';
import { RUNTIME_FEATURES } from '../config/runtime-features';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const LazyAlarmBell = lazy(() =>
  import('../pages/user/fun_forms/components/AlarmBell').then((module) => ({
    default: module.AlarmBell,
  })),
);

const LazyGlobalSearchDialog = lazy(() =>
  import('./GlobalSearchDialog').then((module) => ({
    default: module.GlobalSearchDialog,
  })),
);

const MODULE_ICONS = {
  dashboard: 'LayoutDashboard',
  licencias: 'FileText',
  peticiones: 'FileSpreadsheet',
  ventanilla: 'FileInput',
  mensajes: 'Mail',
  calendario: 'Calendar',
  archivo: 'FolderOpen',
  publicaciones: 'Newspaper',
  nomenclatura: 'PenLine',
  normas: 'Home',
  simulador: 'SearchCheck',
  documentos: 'FileText',
  calculadora: 'Calculator',
  consecutivos: 'Book',
  profesionales: 'HardHat',
  certificados: 'Contact',
  ayuda: 'BookOpen',
  sellos: 'Stamp',
};

/**
 * Top header bar: sidebar toggle + breadcrumb + search + theme toggle + user dropdown.
 * Visual reference: Linear top bar — compact, functional, uncluttered.
 */
export function HeaderBar({ user, onLogout }) {
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

  const initials = user
    ? (user.name?.[0] || '') + (user.surname?.[0] || '')
    : '?';

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
    <header className="flex h-11 min-w-0 items-center gap-1.5 overflow-hidden border-b border-border bg-card px-2.5 backdrop-blur-sm select-none">
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

      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs text-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card lg:h-7 lg:w-auto lg:justify-start lg:gap-1.5 lg:px-2.5"
        aria-label="Buscar expediente"
      >
        <Search className="h-3 w-3" />
        <span className="hidden lg:inline">Expediente...</span>
        <kbd className="ml-3 hidden rounded border border-border bg-background px-1 py-0.5 font-mono text-[9px] xl:inline">{shortcutModifier}K</kbd>
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
        className="h-11 w-11 shrink-0 p-0 text-muted-foreground lg:h-7 lg:w-7"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </Button>

      <Separator orientation="vertical" className="h-4 mx-0.5" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-11 w-11 shrink-0 gap-1.5 px-2 lg:h-7 lg:w-auto lg:px-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px] bg-primary text-primary-foreground font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-xs font-medium text-foreground lg:inline">
              {user?.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user?.name} {user?.surname}</p>
            <p className="text-xs text-muted-foreground">{user?.role_short || 'Usuario'}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="min-h-11 sm:min-h-8">
            <Link to="/configuracion?tab=cuenta">
              <UserCircle2 className="h-4 w-4 mr-2" />
              Mi perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="min-h-11 sm:min-h-8">
            <Link to="/configuracion?tab=misReportes">
              <FileText className="h-4 w-4 mr-2" />
              Mis reportes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => requestDovelaErrorReport({ reportSource: 'header-user-menu' })}
            className="min-h-11 sm:min-h-8"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reportar error
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="min-h-11 text-destructive sm:min-h-8">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {searchOpen && (
        <Suspense fallback={null}>
          <LazyGlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}
    </header>
  );
}

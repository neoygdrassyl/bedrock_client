import { useEffect, useState } from 'react';
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
import { Sun, Moon, LogOut, Search, PanelLeftClose, PanelLeft, ChevronRight, FileText, UserCircle2 } from 'lucide-react';
import { Icon } from '@/components/icon';
import { AlarmBell } from '../pages/user/fun_forms/components/AlarmBell';
import ChatLauncher from '../pages/user/chat/ChatLauncher';
import { GlobalSearchDialog } from './GlobalSearchDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
export function HeaderBar({ user, onLogout, sidebarCollapsed, onToggleSidebar }) {
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

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
    <header className="flex items-center h-11 px-2.5 border-b border-border bg-card backdrop-blur-sm gap-1.5 select-none">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Ocultar menú lateral'}
              className="h-7 w-7 p-0 shrink-0"
            >
              {sidebarCollapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4} className="text-xs">
            {sidebarCollapsed ? 'Expandir menú' : 'Ocultar menú'} <kbd className="ml-1 text-[9px] bg-muted/80 px-1 py-0.5 rounded font-mono">⌘B</kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-4 mx-0.5" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-0.5 text-[13px] flex-1 min-w-0">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground no-underline transition-colors text-[13px]">
          Inicio
        </Link>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-0.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            {i === breadcrumb.length - 1 ? (
              <span className="text-foreground font-medium truncate flex items-center gap-1">
                {crumb.icon && <Icon name={crumb.icon} size={13} className="text-primary/80 shrink-0" />}
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="text-muted-foreground hover:text-foreground no-underline transition-colors">
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
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground md:w-auto md:justify-start md:gap-1.5 md:px-2.5"
        aria-label="Buscar expediente"
      >
        <Search className="h-3 w-3" />
        <span className="hidden md:inline">Expediente...</span>
        <kbd className="ml-3 hidden rounded border border-border bg-background px-1 py-0.5 font-mono text-[9px] lg:inline">⌘K</kbd>
      </button>

      {/* Chat & notifications */}
      <ChatLauncher />
      <AlarmBell />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="h-7 w-7 p-0 text-muted-foreground"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </Button>

      <Separator orientation="vertical" className="h-4 mx-0.5" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px] bg-primary text-primary-foreground font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium hidden md:inline text-foreground">
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
          <DropdownMenuItem asChild>
            <Link to="/configuracion?tab=cuenta">
              <UserCircle2 className="h-4 w-4 mr-2" />
              Mi perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/configuracion?tab=misReportes">
              <FileText className="h-4 w-4 mr-2" />
              Mis reportes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

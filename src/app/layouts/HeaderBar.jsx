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
import { Sun, Moon, LogOut, Search, Bell, PanelLeftClose, PanelLeft, ChevronRight } from 'lucide-react';
import { Icon } from '@/components/icon';
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

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + segments.slice(0, i + 1).join('/'),
    icon: i === 0 ? MODULE_ICONS[seg] : undefined,
  }));

  const initials = user
    ? (user.name?.[0] || '') + (user.surname?.[0] || '')
    : '?';

  return (
    <header className="flex items-center h-11 px-2.5 border-b border-border/60 bg-card/50 backdrop-blur-sm gap-1.5">
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
        <Link to="/dashboard" className="text-muted-foreground/60 hover:text-foreground no-underline transition-colors text-[13px]">
          Inicio
        </Link>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-0.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
            {i === breadcrumb.length - 1 ? (
              <span className="text-foreground font-medium truncate flex items-center gap-1">
                {crumb.icon && <Icon name={crumb.icon} size={13} className="text-primary/80 shrink-0" />}
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="text-muted-foreground/60 hover:text-foreground no-underline transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Search trigger */}
      <button
        className="hidden md:flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border/50 bg-muted/30 text-xs text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground transition-colors"
        aria-label="Buscar"
      >
        <Search className="h-3 w-3" />
        <span>Buscar...</span>
        <kbd className="ml-3 text-[9px] bg-background/80 border border-border/40 px-1 py-0.5 rounded font-mono">⌘K</kbd>
      </button>

      {/* Notifications */}
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 relative text-muted-foreground" aria-label="Notificaciones">
        <Bell className="h-3.5 w-3.5" />
      </Button>

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
            <span className="text-xs font-medium hidden md:inline text-foreground/80">
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
          <DropdownMenuItem onClick={onLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

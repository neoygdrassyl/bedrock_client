import { useLocation } from 'react-router-dom';
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
import { Sun, Moon, LogOut, Search, Bell } from 'lucide-react';
import { Icon } from '@/components/icon';

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
 * Top header bar: breadcrumb + search + theme toggle + user dropdown.
 */
export function HeaderBar({ user, onLogout }) {
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
    <header className="flex items-center h-12 px-4 border-b border-border bg-card gap-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm flex-1 min-w-0">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground no-underline transition-colors">
          Inicio
        </a>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            <span className="text-muted-foreground/50">/</span>
            {i === breadcrumb.length - 1 ? (
              <span className="text-foreground font-medium truncate flex items-center gap-1.5">
                {crumb.icon && <Icon name={crumb.icon} size={14} className="text-primary shrink-0" />}
                {crumb.label}
              </span>
            ) : (
              <a href={crumb.path} className="text-muted-foreground hover:text-foreground no-underline transition-colors">
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </nav>

      {/* Search trigger placeholder */}
      <button
        className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Buscar"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="ml-4 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>

      {/* Notifications placeholder */}
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative" aria-label="Notificaciones">
        <Bell className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="h-8 w-8 p-0"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline">
              {user?.name} {user?.surname}
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

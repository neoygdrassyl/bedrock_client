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
import { Sun, Moon, LogOut } from 'lucide-react';

/**
 * Top header bar: breadcrumb + theme toggle + user dropdown.
 */
export function HeaderBar({ user, onLogout }) {
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));

  const initials = user
    ? (user.name?.[0] || '') + (user.surname?.[0] || '')
    : '?';

  return (
    <header className="flex items-center h-12 px-4 border-b border-border bg-card gap-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm flex-1 min-w-0">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground no-underline">
          Inicio
        </a>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            <span className="text-muted-foreground">/</span>
            {i === breadcrumb.length - 1 ? (
              <span className="text-foreground font-medium truncate">{crumb.label}</span>
            ) : (
              <a href={crumb.path} className="text-muted-foreground hover:text-foreground no-underline">
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </nav>

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

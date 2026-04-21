import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAlarms } from '../hooks/useAlarms';

export function AlarmBell() {
  const { alarms, loading, attend, hide } = useAlarms({ pollMs: 60000 });

  const openAlarms = useMemo(
    () => (alarms || []).filter((a) => !a.attendedAt && !a.hiddenAt),
    [alarms]
  );
  const count = openAlarms.length;
  const critical = useMemo(
    () => openAlarms.some((a) => (a.severity || '').toLowerCase() === 'critical'),
    [openAlarms]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 relative text-muted-foreground"
          aria-label={`Notificaciones${count ? `: ${count} pendientes` : ''}`}
          data-testid="alarm-bell"
        >
          <Bell className="h-3.5 w-3.5" />
          {count > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold flex items-center justify-center px-1 ${
                critical ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
              }`}
              data-testid="alarm-badge"
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alarmas</span>
          <span className="text-xs text-muted-foreground font-normal">
            {loading ? 'Actualizando…' : `${count} pendiente${count === 1 ? '' : 's'}`}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {count === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-muted-foreground">
            Sin alarmas pendientes.
          </div>
        ) : (
          openAlarms.slice(0, 20).map((a) => {
            const sev = (a.severity || '').toLowerCase();
            const dotCls =
              sev === 'critical' ? 'bg-red-600' : sev === 'warning' ? 'bg-amber-500' : 'bg-slate-400';
            return (
              <DropdownMenuItem
                key={a.id}
                className="flex flex-col items-start gap-1 py-2"
                onSelect={(e) => e.preventDefault()}
                data-testid={`alarm-item-${a.id}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={`w-2 h-2 rounded-full ${dotCls} shrink-0`} />
                  <span className="text-xs font-medium truncate">
                    {a.radicado || a.title || `Alarma #${a.id}`}
                  </span>
                </div>
                {a.message && (
                  <span className="text-[11px] text-muted-foreground line-clamp-2">
                    {a.message}
                  </span>
                )}
                <div className="flex gap-2 mt-1 ml-4">
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline"
                    onClick={() => attend(a.id)}
                  >
                    Atender
                  </button>
                  <button
                    type="button"
                    className="text-[11px] text-muted-foreground hover:underline"
                    onClick={() => hide(a.id)}
                  >
                    Ocultar
                  </button>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

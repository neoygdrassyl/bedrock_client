import { useEffect, useMemo, useState } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronsUpDown, Clock3, Search } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { infoCud } from '@/shared/config/jsons/vars';
import { useCuraduriaLogo } from '@/shared/branding/useCuraduriaLogo';
import { cn } from '@/shared/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { getNavItems } from '../../../app/layouts/navigation-config';
import {
  getRecentExpedientes,
  RECENT_EXPEDIENTES_CHANGED_EVENT,
} from '../fun/fun_forms/utils/expedienteWorkspaceRoute';

const ROW = 'flex h-9 w-full items-center gap-2.5 rounded-xl border-0 bg-transparent px-2.5 text-left text-[13px] text-sidebar-foreground/75 outline-none transition-colors duration-150 hover:bg-white/[0.08] hover:text-sidebar-foreground focus-visible:bg-white/[0.08] focus-visible:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring';
const SECTION_TITLE = 'm-0 px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50';

function useRecentExpedientes(currentRadicado) {
  const [items, setItems] = useState(() => getRecentExpedientes(6));
  useEffect(() => {
    const refresh = () => setItems(getRecentExpedientes(6));
    window.addEventListener(RECENT_EXPEDIENTES_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(RECENT_EXPEDIENTES_CHANGED_EVENT, refresh);
  }, []);
  return items.filter((item) => item.radicado !== currentRadicado).slice(0, 5);
}

/*
 * Brand row of the expediente side nav. Opens the app navigation (same modules as the
 * main sidebar, which the fullscreen workspace covers), the recent expedientes and a
 * "go to radicado" field, so the user can leave for another project without closing first.
 */
function RouterSwitcher(props) {
  const navigate = useNavigate();
  return <SwitcherBody {...props} navigate={navigate} />;
}

const assignLocation = (route) => window.location.assign(route);

/** Works inside the app router; outside one (isolated renders) it falls back to a full navigation. */
export function ExpedienteAppSwitcher(props) {
  const inRouter = useInRouterContext();
  return inRouter ? <RouterSwitcher {...props} /> : <SwitcherBody {...props} navigate={assignLocation} />;
}

function SwitcherBody({ currentRadicado, collapsed = false, navigate }) {
  const { logo } = useCuraduriaLogo();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const recents = useRecentExpedientes(currentRadicado);
  const modules = useMemo(() => getNavItems(), []);

  const go = (route) => {
    setOpen(false);
    setQuery('');
    navigate(route);
  };

  const submitRadicado = (event) => {
    event.preventDefault();
    const radicado = query.trim();
    if (!radicado) return;
    go(`/funmanage/expediente/${encodeURIComponent(radicado)}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ir a otro módulo o expediente"
          className={cn(
            'flex h-11 w-full min-w-0 items-center gap-3 rounded-xl border-0 bg-transparent text-left outline-none transition-colors duration-150 hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-white/[0.09]',
            collapsed ? 'justify-center px-0' : 'px-1.5',
          )}
        >
          <span className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-0.5 shadow-sm ring-1 ring-white/20">
            <img src={logo} alt="" className="size-full object-contain" />
          </span>
          {collapsed ? null : (
            <>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[13px] font-semibold text-sidebar-foreground">{infoCud.name}</span>
                <span className="truncate text-[11px] text-sidebar-foreground/55">Módulos y expedientes</span>
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/45" aria-hidden="true" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={collapsed ? 'right' : 'bottom'}
        align="start"
        sideOffset={8}
        className="w-72 rounded-2xl border-white/10 bg-sidebar p-1.5 text-sidebar-foreground shadow-[0_24px_48px_-16px_rgb(0_0_0/0.6)]"
      >
        <form onSubmit={submitRadicado} className="p-1">
          <label htmlFor="expediente-switcher-radicado" className="sr-only">Abrir expediente por radicado</label>
          <div className="flex h-9 items-center gap-2 rounded-xl bg-white/[0.07] px-2.5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-sidebar-ring">
            <Search className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/55" aria-hidden="true" />
            <input
              id="expediente-switcher-radicado"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ir a radicado, ej. 68001-1-26-0105"
              autoComplete="off"
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[12px] text-sidebar-foreground outline-none placeholder:font-sans placeholder:text-sidebar-foreground/45"
            />
            {query.trim() ? (
              <button type="submit" aria-label="Abrir expediente" className="flex size-6 items-center justify-center rounded-md border-0 bg-sidebar-accent text-sidebar-accent-foreground">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        {recents.length ? (
          <div role="group" aria-label="Expedientes recientes">
            <p className={SECTION_TITLE}>Recientes</p>
            {recents.map((item) => (
              <button key={item.radicado} type="button" className={ROW} onClick={() => go(item.href)}>
                <Clock3 className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" aria-hidden="true" />
                <span className="truncate font-mono text-[12px]">{item.radicado}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div role="group" aria-label="Módulos de Dovela" className="mt-1 border-t border-white/10 pt-1">
          <p className={SECTION_TITLE}>Módulos</p>
          <div className="max-h-[min(22rem,50vh)] overflow-y-auto pr-0.5">
            {modules.map((item) => (
              <div key={item.id}>
                <button type="button" className={ROW} onClick={() => go(item.route)}>
                  <Icon name={item.icon} size={15} strokeWidth={1.85} className="shrink-0 text-sidebar-foreground/55" aria-hidden="true" />
                  <span className="truncate font-medium">{item.label}</span>
                </button>
                {item.children?.length ? (
                  <div className="ml-[1.15rem] border-l border-white/10 pl-2">
                    {item.children.map((child) => (
                      <button key={child.id} type="button" className={cn(ROW, 'h-8 text-[12.5px]')} onClick={() => go(child.route)}>
                        {child.icon ? <Icon name={child.icon} size={13} strokeWidth={1.85} className="shrink-0 text-sidebar-foreground/45" aria-hidden="true" /> : null}
                        <span className="truncate">{child.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ExpedienteAppSwitcher;

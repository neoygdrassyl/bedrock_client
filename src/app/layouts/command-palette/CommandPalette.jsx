import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ArrowRight,
  CornerDownLeft,
  FilePlus2,
  FolderOpen,
  History,
  Image as ImageIcon,
  Megaphone,
  MessageCircle,
  MessageSquarePlus,
  MessageSquareText,
  Search,
  Signpost,
  Stamp,
  SunMoon,
} from 'lucide-react';

import { Icon } from '@/shared/components/icon';
import { useTheme } from '@/shared/components/theme-provider';
import { Z_CLASS } from '@/shared/lib/layers';
import { cn } from '@/shared/lib/utils';
import SearchService from '@/shared/api/search.service';
import { formsParser1 } from '@/shared/config/customClasses/typeParse';
import { toDisplayCase } from '@/shared/utils/displayCase';
import { formatRelativeTime } from '@/shared/utils/relativeTime';
import FUNService from '../../../features/expediente/api/fun.service';
import {
  buildExpedienteWorkspaceUrl,
  getRecentExpedientes,
} from '../../../features/expediente/fun/fun_forms/utils/expedienteWorkspaceRoute';
import { getNavItems, preloadNavigationRoute } from '../navigation-config';
import { useAuth } from '../../router/auth';
import { scoreMatch, splitHighlight } from './paletteMatching';

export const OPEN_CHAT_EVENT = 'dovela:open-chat';

const MIN_SERVER_QUERY = 2;
const SERVER_DEBOUNCE_MS = 250;
const SERVER_LIMIT = 8;
const EMPTY_QUERY_NAV_LIMIT = 6;

// Modules reachable by route but not listed in the sidebar.
const EXTRA_DESTINATIONS = [
  { id: 'documentos', label: 'Documentos', route: '/documentos', icon: 'FileText', keywords: ['seguridad', 'sst', 'osha'] },
  { id: 'calculadora', label: 'Calculadora de expensas', route: '/calculadora', icon: 'Calculator', keywords: ['liquidador', 'expensas', 'cobro'] },
  { id: 'consecutivos', label: 'Consecutivos', route: '/consecutivos', icon: 'Book', keywords: ['diccionario', 'numeracion'] },
  { id: 'profesionales', label: 'Profesionales', route: '/profesionales', icon: 'HardHat', keywords: ['arquitectos', 'ingenieros'] },
  { id: 'bd-profesionales', label: 'BD Profesionales', route: '/bd-profesionales', icon: 'Users', keywords: ['registro', 'matricula', 'experiencia', 'roles'] },
  { id: 'certificados', label: 'Certificados', route: '/certificados', icon: 'Contact', keywords: ['certificacion'] },
  { id: 'sellos', label: 'Sellos', route: '/sellos', icon: Stamp, keywords: ['firmas'] },
  { id: 'calendario-laboral', label: 'Calendario laboral', route: '/calendario-laboral', icon: 'CalendarDays', keywords: ['dias habiles', 'festivos'] },
  { id: 'ayuda', label: 'Ayuda', route: '/ayuda', icon: 'BookOpen', keywords: ['guia', 'manual'] },
];

const SERVER_GROUP_META = {
  expedientes: { label: 'Expedientes', icon: FolderOpen, hint: 'Expediente' },
  pqrs: { label: 'Peticiones (PQRS)', icon: MessageSquareText, hint: 'Peticiones' },
  nomenclaturas: { label: 'Nomenclaturas', icon: Signpost, hint: 'Nomenclatura' },
  publicaciones: { label: 'Publicaciones', icon: Megaphone, hint: 'Publicaciones' },
};

// Flips to false once the backend answers 404 (older version without /api/search).
let unifiedSearchAvailable = true;

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function describeLicense(meta) {
  if (!meta) return '';
  const parsed = formsParser1({
    tipo: meta.tipo,
    tramite: meta.tramite,
    m_urb: meta.m_urb,
    m_sub: meta.m_sub,
    m_lic: meta.m_lic,
  });
  if (!parsed) return '';
  return parsed.split(',').map((token) => toDisplayCase(token)).filter(Boolean).join(' · ');
}

// Legacy fallback: the old radicado search, only when the query looks like one.
async function fetchLegacyGroups(term) {
  if (term.length < 3 || !/\d/.test(term)) return [];
  const response = await FUNService.getSearch('1', term);
  const items = normalizeRows(response?.data)
    .filter((row) => row?.id_public)
    .slice(0, SERVER_LIMIT)
    .map((row) => ({
      id: row.id,
      title: row.id_public,
      subtitle: '',
      href: buildExpedienteWorkspaceUrl(row),
      meta: row,
    }));
  return [{ type: 'expedientes', items }];
}

async function fetchServerGroups(term, signal) {
  if (unifiedSearchAvailable) {
    try {
      const response = await SearchService.search(term, { limit: SERVER_LIMIT, signal });
      return Array.isArray(response?.data?.groups) ? response.data.groups : [];
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      unifiedSearchAvailable = false;
    }
  }
  return fetchLegacyGroups(term);
}

function useServerSearch(query) {
  const [state, setState] = useState({ status: 'idle', groups: [] });

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_SERVER_QUERY) {
      setState({ status: 'idle', groups: [] });
      return undefined;
    }

    const controller = new AbortController();
    setState({ status: 'loading', groups: [] });
    const timer = window.setTimeout(async () => {
      try {
        const groups = await fetchServerGroups(term, controller.signal);
        if (!controller.signal.aborted) setState({ status: 'done', groups });
      } catch (error) {
        if (controller.signal.aborted || error?.code === 'ERR_CANCELED') return;
        setState({ status: 'error', groups: [] });
      }
    }, SERVER_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return state;
}

function useNavigationEntries(user) {
  return useMemo(() => {
    const entries = [];
    const seen = new Set();
    const push = (entry) => {
      if (seen.has(entry.route)) return;
      seen.add(entry.route);
      entries.push(entry);
    };

    getNavItems(user?.role_short).forEach((item) => {
      push({ id: item.id, label: item.label, route: item.route, icon: item.icon, keywords: [item.id] });
      (item.children || []).forEach((child) => {
        push({
          id: child.id,
          label: `${item.label} › ${child.label}`,
          route: child.route,
          icon: child.icon || item.icon,
          keywords: [child.label, item.label],
        });
      });
    });
    EXTRA_DESTINATIONS.forEach(push);
    return entries;
  }, [user?.role_short]);
}

function Highlight({ text, query }) {
  const segments = useMemo(() => splitHighlight(text, query), [text, query]);
  return segments.map((segment, index) => (
    segment.match
      ? <mark key={index} className="rounded-[3px] bg-primary/15 px-0 text-inherit">{segment.text}</mark>
      : <span key={index}>{segment.text}</span>
  ));
}

function ItemIcon({ icon }) {
  if (!icon) return null;
  if (typeof icon === 'string') return <Icon name={icon} size={16} aria-hidden="true" />;
  const Component = icon;
  return <Component className="h-4 w-4" aria-hidden="true" />;
}

function SkeletonRows() {
  return (
    <div className="space-y-1 px-2 pb-1" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex h-12 items-center gap-3 rounded-xl px-2">
          <span className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-muted" />
          <span className="flex-1 space-y-1.5">
            <span className="block h-3 w-1/3 animate-pulse rounded bg-muted" />
            <span className="block h-2.5 w-2/3 animate-pulse rounded bg-muted/70" />
          </span>
        </div>
      ))}
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-background px-1 font-mono text-[10px] text-muted-foreground shadow-none">
      {children}
    </kbd>
  );
}

/**
 * Universal command palette (Ctrl/⌘K): modules, quick actions, recent expedientes
 * and server-side entity search, fully keyboard navigable (combobox + listbox).
 */
export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const listboxId = useId();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigationEntries = useNavigationEntries(auth?.user);
  const server = useServerSearch(open ? query : '');
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const actions = useMemo(() => [
    {
      id: 'action-radicar',
      title: 'Nueva radicación',
      subtitle: 'Radicar una licencia urbanística',
      icon: FilePlus2,
      keywords: ['radicar', 'licencia', 'nuevo', 'fun'],
      href: '/licencias',
    },
    {
      id: 'action-pqrs',
      title: 'Nueva PQRS',
      subtitle: 'Registrar una petición, queja, reclamo o sugerencia',
      icon: MessageSquarePlus,
      keywords: ['peticion', 'queja', 'reclamo', 'solicitud', 'derecho de peticion'],
      href: '/peticiones',
    },
    {
      id: 'action-chat',
      title: 'Abrir chat interno',
      subtitle: 'Mensajes directos entre usuarios',
      icon: MessageCircle,
      keywords: ['mensajes', 'conversacion'],
      run: () => window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT)),
    },
    {
      id: 'action-theme',
      title: resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
      subtitle: 'Alternar el tema de la interfaz',
      icon: SunMoon,
      keywords: ['tema', 'oscuro', 'claro', 'apariencia', 'dark', 'light'],
      run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    },
    {
      id: 'action-identity',
      title: 'Configuración › Identidad',
      subtitle: 'Logo e identidad visual de la curaduría',
      icon: ImageIcon,
      keywords: ['logo', 'marca', 'branding', 'ajustes'],
      href: '/configuracion?tab=identidad',
    },
  ], [resolvedTheme, setTheme]);

  const sections = useMemo(() => {
    const result = [];
    const rank = (entries, getTitle, getKeywords) => entries
      .map((entry) => ({ entry, score: scoreMatch(trimmedQuery, getTitle(entry), getKeywords(entry)) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ entry }) => entry);

    const navMatches = rank(navigationEntries, (entry) => entry.label, (entry) => entry.keywords || []);
    const visibleNav = trimmedQuery ? navMatches.slice(0, 8) : navMatches.slice(0, EMPTY_QUERY_NAV_LIMIT);
    if (visibleNav.length) {
      result.push({
        id: 'nav',
        label: 'Ir a',
        items: visibleNav.map((entry) => ({
          id: `nav-${entry.id}`,
          title: entry.label,
          icon: entry.icon,
          hint: 'Ir a',
          href: entry.route,
          prefetch: entry.route,
        })),
      });
    }

    const actionMatches = rank(actions, (action) => action.title, (action) => action.keywords);
    if (actionMatches.length) {
      result.push({ id: 'actions', label: 'Acciones', items: actionMatches.map((action) => ({ ...action, hint: 'Acción' })) });
    }

    if (!trimmedQuery) {
      const recent = getRecentExpedientes(6);
      if (recent.length) {
        result.push({
          id: 'recent',
          label: 'Recientes',
          items: recent.map((item) => ({
            id: `recent-${item.radicado}`,
            title: item.radicado,
            subtitle: item.updatedAt ? `Abierto ${formatRelativeTime(item.updatedAt)}` : 'Expediente reciente',
            icon: History,
            hint: 'Expediente',
            href: item.href,
          })),
        });
      }
    }

    server.groups.forEach((group) => {
      const meta = SERVER_GROUP_META[group.type] || { label: group.type, icon: Search, hint: '' };
      const items = (group.items || []).slice(0, SERVER_LIMIT).filter((item) => item?.href);
      if (!items.length) return;
      result.push({
        id: `server-${group.type}`,
        label: meta.label,
        items: items.map((item) => {
          const license = group.type === 'expedientes' ? describeLicense(item.meta) : '';
          return {
            id: `server-${group.type}-${item.id ?? item.title}`,
            title: item.title,
            // Address/owner first: that is usually what matched and must survive truncation.
            subtitle: [item.subtitle, license].filter(Boolean).join(' · '),
            icon: meta.icon,
            hint: meta.hint,
            href: item.href,
          };
        }),
      });
    });

    return result;
  }, [actions, navigationEntries, server.groups, trimmedQuery]);

  const flatItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery, server.status]);

  useEffect(() => {
    const node = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const runItem = useCallback((item) => {
    if (!item) return;
    close();
    if (item.run) {
      item.run();
      return;
    }
    if (item.href) navigate(item.href);
  }, [close, navigate]);

  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    const count = flatItems.length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (count) setActiveIndex((index) => (index + 1) % count);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (count) setActiveIndex((index) => (index - 1 + count) % count);
    } else if (event.key === 'Home' && count) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && count) {
      event.preventDefault();
      setActiveIndex(count - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runItem(flatItems[activeIndex]);
    }
  };

  const activeItem = flatItems[activeIndex];
  const showServerSkeleton = server.status === 'loading';
  const showEmpty = Boolean(trimmedQuery) && !flatItems.length && !showServerSkeleton && server.status !== 'error';
  let runningIndex = -1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            Z_CLASS.modal,
          )}
        />
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            'fixed left-1/2 top-[12vh] flex max-h-[76vh] w-[calc(100vw-2rem)] max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-[0_24px_64px_-24px_rgba(15,23,42,0.45)] outline-none short:top-[6vh] short:max-h-[86vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]',
            Z_CLASS.modal,
          )}
        >
          <DialogPrimitive.Title className="sr-only">Búsqueda universal</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Busca expedientes, módulos o acciones. Use las flechas para navegar y Enter para abrir.
          </DialogPrimitive.Description>

          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-4">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Busca expedientes, módulos o acciones"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeItem ? `${listboxId}-${activeIndex}` : undefined}
              autoComplete="off"
              spellCheck={false}
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/80"
            />
            {showServerSkeleton ? (
              <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" aria-hidden="true" />
            ) : null}
            <Kbd>Esc</Kbd>
          </div>

          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Resultados"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"
          >
            {sections.map((section) => (
              <div key={section.id} role="group" aria-labelledby={`${listboxId}-${section.id}`} className="pb-1">
                <div
                  id={`${listboxId}-${section.id}`}
                  className="px-4 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80"
                >
                  {section.label}
                </div>
                <div className="px-2">
                  {section.items.map((item) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const active = index === activeIndex;
                    return (
                      <div
                        key={item.id}
                        id={`${listboxId}-${index}`}
                        role="option"
                        aria-selected={active}
                        data-index={index}
                        onPointerMove={() => { if (!active) setActiveIndex(index); }}
                        onPointerEnter={item.prefetch ? () => preloadNavigationRoute(item.prefetch) : undefined}
                        onClick={() => runItem(item)}
                        className={cn(
                          'flex min-h-12 cursor-pointer select-none items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-75',
                          active ? 'bg-muted' : 'bg-transparent',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60',
                            active ? 'bg-background text-primary' : 'bg-muted/50 text-muted-foreground',
                          )}
                        >
                          <ItemIcon icon={item.icon} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[13.5px] font-medium leading-5 text-foreground">
                            <Highlight text={item.title} query={trimmedQuery} />
                          </span>
                          {item.subtitle ? (
                            <span className="truncate text-xs leading-4 text-muted-foreground">
                              <Highlight text={item.subtitle} query={trimmedQuery} />
                            </span>
                          ) : null}
                        </span>
                        <span className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                          {active ? <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" /> : item.hint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {showServerSkeleton ? (
              <div className="pb-1" aria-live="polite">
                <div className="px-4 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Expedientes
                </div>
                <span className="sr-only">Buscando…</span>
                <SkeletonRows />
              </div>
            ) : null}

            {server.status === 'error' ? (
              <p className="m-0 px-4 py-2 text-xs text-muted-foreground" role="status">
                No fue posible consultar el servidor en este momento. Los módulos y acciones siguen disponibles.
              </p>
            ) : null}

            {showEmpty ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center" role="status">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="m-0 text-sm font-medium text-foreground">Sin resultados para “{trimmedQuery}”</p>
                <p className="m-0 max-w-sm text-xs text-muted-foreground">
                  Prueba con un radicado, un propietario o el nombre de un módulo.
                </p>
              </div>
            ) : null}

            {!trimmedQuery ? (
              <p className="m-0 px-4 pb-1 pt-2 text-[11px] text-muted-foreground/80">
                Prueba con un radicado, un propietario o el nombre de un módulo.
              </p>
            ) : null}
          </div>

          <div className="flex h-10 shrink-0 items-center gap-4 border-t border-border/60 bg-muted/30 px-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
            <span className="flex items-center gap-1"><Kbd>Enter</Kbd> abrir</span>
            <span className="flex items-center gap-1"><Kbd>Esc</Kbd> cerrar</span>
            <span className="ml-auto hidden items-center gap-1 sm:flex">
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
              {trimmedQuery.length > 0 && trimmedQuery.length < MIN_SERVER_QUERY
                ? 'Escribe al menos 2 caracteres para buscar en el servidor'
                : 'Expedientes, PQRS, nomenclaturas y publicaciones'}
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default CommandPalette;

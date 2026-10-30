import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { Icon } from '@/shared/components/icon';
import { infoCud } from '@/shared/config/jsons/vars';
import { cn } from '@/shared/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/shared/ui/sidebar';
import { Anchor as PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@/shared/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { preloadNavigationRoute } from './navigation-config';
import { useNavigationPending } from './navigation-pending-context';

const UTILITY_START_INDEX = 7;
const OPEN_GROUPS_STORAGE_KEY = 'dovela-sidebar-closed-items';
const FLYOUT_CLOSE_DELAY_MS = 140;

// Shared spring for the active pill so it glides between items instead of jumping.
const PILL_TRANSITION = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 };
const SUBMENU_TRANSITION = { duration: 0.22, ease: [0.32, 0.72, 0, 1] };
// Inline on purpose: without Tailwind preflight, `border-l` has no border-style.
const SUBMENU_GUIDE_STYLE = { borderLeft: '1px solid rgb(255 255 255 / 0.1)' };

// Labels fade out while the rail narrows; the icon keeps its x position so nothing jumps.
const LABEL_CLASS = 'truncate transition-opacity duration-200 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0';

function isRouteActive(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isChildActive(location, child) {
  return child.route === location.pathname || child.route === `${location.pathname}${location.search}`;
}

function readClosedItems() {
  try { return new Set(JSON.parse(localStorage.getItem(OPEN_GROUPS_STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}

function NavItemSpinner({ className }) {
  return (
    <span
      className={`shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

function ActivePill() {
  return (
    <m.span
      layoutId="dovela-nav-active-pill"
      transition={PILL_TRANSITION}
      className="absolute inset-0 rounded-xl bg-sidebar-accent shadow-[0_6px_16px_-6px_hsl(var(--sidebar-accent)/0.7)]"
      aria-hidden="true"
    />
  );
}

function useNavHandlers() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pendingRoute, beginNavigation } = useNavigationPending();

  return {
    pendingRoute,
    linkProps: (route) => ({
      to: route,
      onClick: () => {
        beginNavigation(route);
        if (isMobile) setOpenMobile(false);
      },
      onPointerEnter: () => preloadNavigationRoute(route),
      onFocus: () => preloadNavigationRoute(route),
    }),
  };
}

function NavRow({ item, active, showPill, pending, collapsedRail, trailing }) {
  const { linkProps } = useNavHandlers();

  return (
    <Link
      {...linkProps(item.route)}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsedRail ? item.label : undefined}
      className={cn(
        'relative flex h-10 w-full items-center gap-3 rounded-xl px-[11px] text-sm font-medium no-underline outline-none hover:no-underline',
        'transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        showPill
          ? 'text-sidebar-accent-foreground'
          : active
            ? 'text-sidebar-foreground'
            : 'text-sidebar-foreground/65 hover:bg-white/[0.06] hover:text-sidebar-foreground',
      )}
    >
      {showPill ? <ActivePill /> : null}
      <span className="relative z-10 flex size-[18px] shrink-0 items-center justify-center">
        {pending ? <NavItemSpinner className="h-4 w-4" /> : <Icon name={item.icon} size={18} strokeWidth={1.75} />}
      </span>
      <span className={cn('relative z-10 flex-1', LABEL_CLASS)}>{item.label}</span>
      {trailing}
    </Link>
  );
}

function SubmenuList({ item, location, activeChildId }) {
  const { pendingRoute, linkProps } = useNavHandlers();

  return (
    <ul className="mb-0 ml-[20px] mr-0 mt-1 list-none space-y-0.5 py-0 pl-2 pr-0" style={SUBMENU_GUIDE_STYLE}>
      {item.children.map((child) => {
        const childActive = child.id === activeChildId;
        const childPending = pendingRoute === child.route;
        return (
          <li key={child.id}>
            <Link
              {...linkProps(child.route)}
              aria-current={isChildActive(location, child) ? 'page' : undefined}
              className={cn(
                'relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] no-underline outline-none hover:no-underline',
                'transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                childActive
                  ? 'font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/60 hover:bg-white/[0.06] hover:text-sidebar-foreground',
              )}
            >
              {childActive ? <ActivePill /> : null}
              <span className="relative z-10 flex size-3.5 shrink-0 items-center justify-center">
                {childPending
                  ? <NavItemSpinner className="h-3.5 w-3.5" />
                  : (child.icon && <Icon name={child.icon} size={14} strokeWidth={1.75} />)}
              </span>
              <span className="relative z-10 truncate">{child.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Collapsed rail: hovering a parent opens a floating panel with its submodules. */
function CollapsedFlyout({ item, location, active, pending }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const { pendingRoute, linkProps } = useNavHandlers();

  const show = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), FLYOUT_CLOSE_DELAY_MS);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchor (not Trigger): clicking the icon navigates instead of toggling the panel. */}
      <PopoverAnchor asChild>
        <div onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
          <NavRow item={item} active={active} showPill={active} pending={pending} collapsedRail />
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={14}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-56 rounded-2xl border-white/10 bg-sidebar p-1.5 text-sidebar-foreground shadow-2xl"
      >
        <p className="m-0 px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
          {item.label}
        </p>
        {item.children.map((child) => {
          const childActive = isChildActive(location, child);
          return (
            <Link
              key={child.id}
              {...linkProps(child.route)}
              onClick={(event) => { linkProps(child.route).onClick(event); setOpen(false); }}
              aria-current={childActive ? 'page' : undefined}
              className={cn(
                'flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] no-underline outline-none transition-colors duration-150 hover:no-underline',
                'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                childActive
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-white/[0.07] hover:text-sidebar-foreground',
              )}
            >
              {pendingRoute === child.route
                ? <NavItemSpinner className="h-3.5 w-3.5" />
                : (child.icon && <Icon name={child.icon} size={14} strokeWidth={1.75} />)}
              <span className="truncate">{child.label}</span>
            </Link>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function SidebarNavItem({ item, location, closedItems, onToggleItem }) {
  const { state, isMobile } = useSidebar();
  const { pendingRoute } = useNavHandlers();
  const collapsedRail = state === 'collapsed' && !isMobile;
  const hasChildren = Boolean(item.children?.length);
  const activeChild = hasChildren ? item.children.find((child) => isChildActive(location, child)) : null;
  const active = isRouteActive(location.pathname, item.route) || Boolean(activeChild);
  const pending = pendingRoute === item.route;
  const expanded = hasChildren && !closedItems.has(item.id);

  if (collapsedRail) {
    if (hasChildren) {
      return <li><CollapsedFlyout item={item} location={location} active={active} pending={pending} /></li>;
    }
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <div><NavRow item={item} active={active} showPill={active} pending={pending} collapsedRail /></div>
          </TooltipTrigger>
          {/* Same floating panel look as the submodule flyout. */}
          <TooltipContent
            side="right"
            sideOffset={14}
            className="flex items-center gap-2.5 rounded-2xl border-white/10 bg-sidebar px-3 py-2 text-[13px] font-medium text-sidebar-foreground shadow-2xl"
          >
            <Icon name={item.icon} size={14} strokeWidth={1.75} className="text-sidebar-foreground/60" />
            {item.label}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  // Expanded: the pill sits on the matching submodule when the submenu is visible.
  const pillOnChild = expanded && activeChild;
  const toggle = hasChildren ? (
    <button
      type="button"
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); onToggleItem(item.id); }}
      aria-label={expanded ? `Contraer ${item.label}` : `Desplegar ${item.label}`}
      aria-expanded={expanded}
      className={cn('relative z-10 -mr-1 flex size-6 items-center justify-center rounded-md hover:bg-white/10', LABEL_CLASS)}
    >
      <Icon
        name="ChevronDown"
        size={14}
        className={cn('transition-transform duration-200', expanded ? 'rotate-0' : '-rotate-90')}
      />
    </button>
  ) : null;

  return (
    <li>
      <NavRow
        item={item}
        active={active}
        showPill={active && !pillOnChild}
        pending={pending}
        trailing={toggle}
      />
      <AnimatePresence initial={false}>
        {expanded ? (
          <m.div
            key="submenu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SUBMENU_TRANSITION}
            className="overflow-hidden"
          >
            <SubmenuList item={item} location={location} activeChildId={pillOnChild ? activeChild.id : null} />
          </m.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function SidebarNavGroup({ label, items, location, closedItems, onToggleItem }) {
  return (
    <section className="px-2 py-1.5">
      <div className="relative flex h-7 items-center px-3">
        <span className={cn('text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40', LABEL_CLASS)}>
          {label}
        </span>
        <span
          className="pointer-events-none absolute inset-x-2 top-1/2 h-px bg-white/10 opacity-0 transition-opacity duration-200 group-data-[collapsible=icon]:opacity-100"
          aria-hidden="true"
        />
      </div>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            location={location}
            closedItems={closedItems}
            onToggleItem={onToggleItem}
          />
        ))}
      </ul>
    </section>
  );
}

export function AppSidebar({ items = [] }) {
  const location = useLocation();
  const { linkProps } = useNavHandlers();
  const [closedItems, setClosedItems] = useState(readClosedItems);
  const mainItems = items.slice(0, UTILITY_START_INDEX);
  const utilityItems = items.slice(UTILITY_START_INDEX);

  const toggleItem = (id) => {
    setClosedItems((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(OPEN_GROUPS_STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  return (
    <div className="app-shell-rail">
      <Sidebar collapsible="icon" variant="floating" data-testid="dovela-sidebar">
        <SidebarHeader className="h-16 shrink-0 justify-center px-2">
          <Link
            {...linkProps('/dashboard')}
            aria-label={infoCud.name}
            className="flex h-12 items-center gap-3 rounded-xl px-[5px] no-underline outline-none hover:no-underline transition-colors duration-150 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <span className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-0.5 shadow-sm ring-1 ring-white/20">
              <img src={infoCud.icon} alt="" className="size-full object-contain" />
            </span>
            <span className={cn('flex min-w-0 flex-col leading-tight', LABEL_CLASS)}>
              <span className="truncate text-sm font-semibold text-sidebar-foreground">{infoCud.name}</span>
              <span className="truncate text-[11px] text-sidebar-foreground/45">Dovela</span>
            </span>
          </Link>
        </SidebarHeader>

        <div className="mx-4 h-px bg-white/10" aria-hidden="true" />

        <SidebarContent className="py-1">
          <nav aria-label="Navegación principal">
            <LayoutGroup id="dovela-sidebar-nav">
              <SidebarNavGroup
                label="Módulos"
                items={mainItems}
                location={location}
                closedItems={closedItems}
                onToggleItem={toggleItem}
              />
              {utilityItems.length ? (
                <SidebarNavGroup
                  label="Utilidades"
                  items={utilityItems}
                  location={location}
                  closedItems={closedItems}
                  onToggleItem={toggleItem}
                />
              ) : null}
            </LayoutGroup>
          </nav>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { ChevronsUpDown, LogOut, Moon, Sun, UserCircle2 } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { infoCud } from '@/shared/config/jsons/vars';
import { useCuraduriaLogo } from '@/shared/branding/useCuraduriaLogo';
import { cn } from '@/shared/lib/utils';
import { useShellTier } from '@/shared/hooks/use-mobile';
import { useTheme } from '@/shared/components/theme-provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/shared/ui/sidebar';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Anchor as PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@/shared/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { preloadNavigationRoute } from './navigation-config';
import { useNavigationPending } from './navigation-pending-context';

const UTILITY_START_INDEX = 7;
const OPEN_GROUPS_STORAGE_KEY = 'dovela-sidebar-closed-items';
const FLYOUT_CLOSE_DELAY_MS = 140;
// Any other open menu, popover or dialog: a rail flyout never opens next to one.
const OPEN_OVERLAY_SELECTOR = '[role="menu"][data-state="open"], [role="dialog"][data-state="open"]';
// One rail flyout at a time: opening one closes the previous one right away.
let closeActiveFlyout = null;

// Shared spring for the active pill so it glides between items instead of jumping.
const PILL_TRANSITION = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 };
const SUBMENU_TRANSITION = { duration: 0.22, ease: [0.32, 0.72, 0, 1] };
// Inline on purpose: without Tailwind preflight, `border-l` has no border-style.
const SUBMENU_GUIDE_STYLE = { borderLeft: '1px solid rgb(255 255 255 / 0.1)' };

// Labels fade out while the rail narrows; the icon keeps its x position so nothing jumps.
// Asymmetric by 1px to offset the panel's left border so collapsed icons sit dead center.
const RAIL_INSET_CLASS = 'pl-[9px] pr-[7px]';
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

// Pending routes keep their icon (swapping it for a spinner made it blink on every click);
// the icon only pulses while the top progress bar shows the load.
function NavIcon({ name, size, pending }) {
  return (
    <Icon
      name={name}
      size={size}
      strokeWidth={1.75}
      className={pending ? 'animate-pulse' : undefined}
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
        <NavIcon name={item.icon} size={18} pending={pending} />
      </span>
      <span className={cn('relative z-10 flex-1', LABEL_CLASS)}>{item.label}</span>
      {trailing}
    </Link>
  );
}

function SubmenuList({ item, location, activeChildId }) {
  const { pendingRoute, linkProps } = useNavHandlers();
  // Off-canvas sheet (tablet and mobile tiers): 40px rows.
  const { isMobile } = useSidebar();

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
                'relative flex items-center gap-2.5 rounded-lg px-2.5 text-[13px] no-underline outline-none hover:no-underline',
                isMobile ? 'h-10' : 'h-8',
                'transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                childActive
                  ? 'font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/60 hover:bg-white/[0.06] hover:text-sidebar-foreground',
              )}
            >
              {childActive ? <ActivePill /> : null}
              <span className="relative z-10 flex size-3.5 shrink-0 items-center justify-center">
                {child.icon && <NavIcon name={child.icon} size={14} pending={childPending} />}
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

  const contentRef = useRef(null);
  const closeNow = useRef(null);
  closeNow.current = () => { clearTimeout(closeTimer.current); setOpen(false); };

  const show = () => {
    clearTimeout(closeTimer.current);
    if (open) return;
    const otherOverlay = Array.from(document.querySelectorAll(OPEN_OVERLAY_SELECTOR))
      .some((node) => node !== contentRef.current && !node.hasAttribute('data-rail-flyout'));
    if (otherOverlay) return;
    if (closeActiveFlyout && closeActiveFlyout !== closeNow) closeActiveFlyout.current?.();
    closeActiveFlyout = closeNow;
    setOpen(true);
  };
  // The short delay keeps the panel open while the pointer crosses the gap diagonally.
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), FLYOUT_CLOSE_DELAY_MS);
  };
  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    if (closeActiveFlyout === closeNow) closeActiveFlyout = null;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchor (not Trigger): clicking the icon navigates instead of toggling the panel. */}
      <PopoverAnchor asChild>
        <div onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
          <NavRow item={item} active={active} showPill={active} pending={pending} collapsedRail />
        </div>
      </PopoverAnchor>
      <PopoverContent
        ref={contentRef}
        data-rail-flyout=""
        side="right"
        align="start"
        sideOffset={14}
        collisionPadding={8}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="max-h-[var(--radix-popover-content-available-height)] w-56 overflow-y-auto rounded-2xl border-white/10 bg-sidebar p-1.5 text-sidebar-foreground shadow-2xl"
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
              {child.icon && <NavIcon name={child.icon} size={14} pending={pendingRoute === child.route} />}
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
      className={cn('relative z-10 flex items-center justify-center rounded-md hover:bg-white/10', isMobile ? '-mr-2 size-10' : '-mr-1 size-6', LABEL_CLASS)}
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
    <section className={cn('py-1.5', RAIL_INSET_CLASS)}>
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

/** Account block pinned to the bottom of the rail (moved here from the header). */
function SidebarAccount({ user, onLogout }) {
  const { state, isMobile } = useSidebar();
  const collapsedRail = state === 'collapsed' && !isMobile;
  const fullName = [user?.name, user?.surname].filter(Boolean).join(' ');
  const initials = user ? `${user.name?.[0] || ''}${user.surname?.[0] || ''}` : '?';
  const { resolvedTheme, setTheme } = useTheme();
  const darkTheme = resolvedTheme === 'dark';
  // Remounting on a tier change closes the menu, so it is never left orphaned by a resize.
  const tier = useShellTier();

  return (
    <DropdownMenu key={tier}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Cuenta de ${fullName || 'usuario'}`}
          className="flex h-12 w-full items-center gap-3 rounded-xl px-[7px] text-left outline-none transition-colors duration-150 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-white/[0.08]"
        >
          <Avatar className="size-7 shrink-0 ring-1 ring-white/15">
            <AvatarFallback className="bg-sidebar-accent text-[10px] font-semibold text-sidebar-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className={cn('flex min-w-0 flex-1 flex-col leading-tight', LABEL_CLASS)}>
            <span className="truncate text-[13px] font-medium text-sidebar-foreground">{fullName || 'Usuario'}</span>
            <span className="truncate text-[11px] text-sidebar-foreground/45">{user?.role_short || 'Usuario'}</span>
          </span>
          <ChevronsUpDown size={14} className={cn('shrink-0 text-sidebar-foreground/40', LABEL_CLASS)} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsedRail ? 'right' : 'top'}
        align={collapsedRail ? 'end' : 'start'}
        sideOffset={collapsedRail ? 14 : 8}
        collisionPadding={8}
        className="w-56 rounded-2xl p-1.5"
      >
        <div className="px-2.5 py-1.5">
          <p className="m-0 truncate text-sm font-medium">{fullName}</p>
          <p className="m-0 text-xs text-muted-foreground">{user?.role_short || 'Usuario'}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="min-h-8 rounded-xl touch:min-h-11">
          <Link to="/configuracion?tab=cuenta" className="text-foreground no-underline hover:text-foreground">
            <UserCircle2 size={16} className="mr-2" />
            Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setTheme(darkTheme ? 'light' : 'dark')}
          className="min-h-8 rounded-xl touch:min-h-11"
        >
          {darkTheme ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
          {darkTheme ? 'Modo claro' : 'Modo oscuro'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="min-h-8 rounded-xl text-destructive touch:min-h-11">
          <LogOut size={16} className="mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar({ items = [], user, onLogout }) {
  const location = useLocation();
  const { linkProps } = useNavHandlers();
  const [closedItems, setClosedItems] = useState(readClosedItems);
  const { logo: curaduriaLogo } = useCuraduriaLogo();
  // One data source for both bell placements (header when expanded, rail row when collapsed).
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
        <SidebarHeader className={cn('h-16 short:h-12 shrink-0 justify-center py-2', RAIL_INSET_CLASS)}>
          <div className="flex min-w-0 items-center gap-1">
            <Link
              {...linkProps('/dashboard')}
              aria-label={infoCud.name}
              className="flex h-12 short:h-10 min-w-0 flex-1 items-center gap-3 rounded-xl px-[6px] no-underline outline-none hover:no-underline transition-colors duration-150 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <span className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-0.5 shadow-sm ring-1 ring-white/20">
                <img src={curaduriaLogo} alt="" className="size-full object-contain" />
              </span>
              <span className={cn('flex min-w-0 flex-col leading-tight', LABEL_CLASS)}>
                <span className="truncate text-sm font-semibold text-sidebar-foreground">{infoCud.name}</span>
              </span>
            </Link>
          </div>
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

        <div className="mx-4 h-px bg-white/10" aria-hidden="true" />
        <SidebarFooter className={cn('py-2', RAIL_INSET_CLASS)}>
          <SidebarAccount user={user} onLogout={onLogout} />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

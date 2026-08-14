import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/icon';
import { infoCud } from '@/app/components/jsons/vars';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { preloadNavigationRoute } from './navigation-config';
import { useNavigationPending } from './navigation-pending-context';

const UTILITY_START_INDEX = 7;

function isRouteActive(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function NavItemSpinner({ className }) {
  return (
    <span
      className={`shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

function SidebarNavItem({ item, pathname }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pendingRoute, beginNavigation } = useNavigationPending();
  const isActive = isRouteActive(pathname, item.route)
    || item.children?.some((child) => pathname === child.route);
  const isPending = pendingRoute === item.route;
  const handleNavigate = (route) => {
    beginNavigation(route);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link
          to={item.route}
          aria-current={isActive ? 'page' : undefined}
          onClick={() => handleNavigate(item.route)}
          onPointerEnter={() => preloadNavigationRoute(item.route)}
          onFocus={() => preloadNavigationRoute(item.route)}
        >
          {isPending ? <NavItemSpinner className="h-4 w-4" /> : <Icon name={item.icon} size={16} />}
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>

      {item.children?.length ? (
        <SidebarMenuSub>
          {item.children.map((child) => {
            const childIsActive = pathname === child.route;
            const childIsPending = pendingRoute === child.route;
            return (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton asChild isActive={childIsActive}>
                  <Link
                    to={child.route}
                    aria-current={childIsActive ? 'page' : undefined}
                    onClick={() => handleNavigate(child.route)}
                    onPointerEnter={() => preloadNavigationRoute(child.route)}
                    onFocus={() => preloadNavigationRoute(child.route)}
                  >
                    {childIsPending
                      ? <NavItemSpinner className="h-3.5 w-3.5" />
                      : (child.icon && <Icon name={child.icon} size={14} />)}
                    <span>{child.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function SidebarNavGroup({ label, items, pathname }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarNavItem key={item.id} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ items = [] }) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { beginNavigation } = useNavigationPending();
  const mainItems = items.slice(0, UTILITY_START_INDEX);
  const utilityItems = items.slice(UTILITY_START_INDEX);

  return (
    <div className="app-shell-rail">
      <Sidebar collapsible="icon" data-testid="dovela-sidebar">
        <SidebarHeader className="h-16 shrink-0 justify-center">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" tooltip={infoCud.name} className="!h-12">
                <Link
                  to="/dashboard"
                  onClick={() => { beginNavigation('/dashboard'); if (isMobile) setOpenMobile(false); }}
                  onPointerEnter={() => preloadNavigationRoute('/dashboard')}
                  onFocus={() => preloadNavigationRoute('/dashboard')}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <img src={infoCud.icon} alt="" className="size-full object-contain" />
                  </span>
                  <span className="truncate font-semibold">{infoCud.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <nav aria-label="Navegación principal">
            <SidebarNavGroup label="Módulos" items={mainItems} pathname={location.pathname} />
            {utilityItems.length ? (
              <>
                <SidebarSeparator />
                <SidebarNavGroup label="Utilidades" items={utilityItems} pathname={location.pathname} />
              </>
            ) : null}
          </nav>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </div>
  );
}

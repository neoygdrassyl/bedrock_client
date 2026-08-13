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

const UTILITY_START_INDEX = 7;

function isRouteActive(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function SidebarNavItem({ item, pathname }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = isRouteActive(pathname, item.route)
    || item.children?.some((child) => pathname === child.route);
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link
          to={item.route}
          aria-current={isActive ? 'page' : undefined}
          onClick={closeMobileSidebar}
          onPointerEnter={() => preloadNavigationRoute(item.route)}
          onFocus={() => preloadNavigationRoute(item.route)}
        >
          <Icon name={item.icon} size={16} />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>

      {item.children?.length ? (
        <SidebarMenuSub>
          {item.children.map((child) => {
            const childIsActive = pathname === child.route;
            return (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton asChild isActive={childIsActive}>
                  <Link
                    to={child.route}
                    aria-current={childIsActive ? 'page' : undefined}
                    onClick={closeMobileSidebar}
                    onPointerEnter={() => preloadNavigationRoute(child.route)}
                    onFocus={() => preloadNavigationRoute(child.route)}
                  >
                    {child.icon && <Icon name={child.icon} size={14} />}
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
                  onClick={() => { if (isMobile) setOpenMobile(false); }}
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

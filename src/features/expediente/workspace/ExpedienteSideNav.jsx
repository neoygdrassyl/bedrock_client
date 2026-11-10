import { m } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { NAV_TONE_CLASSES } from './expedienteNavConfig';

// Same spring as the app sidebar pill so both navs feel identical.
const PILL_TRANSITION = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 };
export const NAV_WIDTH_EXPANDED = 248;
export const NAV_WIDTH_COLLAPSED = 64;
const LABEL_FADE_CLASS = 'truncate whitespace-nowrap transition-opacity duration-200 motion-reduce:transition-none';

function toneClasses(tone) {
  return NAV_TONE_CLASSES[tone] || NAV_TONE_CLASSES.sky;
}

function RailTooltip({ enabled, label, children }) {
  if (!enabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="rounded-xl px-3 py-1.5 text-xs font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function NavItem({ item, active, collapsed, onSelect }) {
  const tone = toneClasses(item.tone);
  const label = item.ariaLabel || item.label;

  return (
    <li className="m-0 p-0">
      <RailTooltip enabled={collapsed} label={label}>
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          data-active={active ? 'true' : undefined}
          className={cn(
            'group relative flex h-9 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-[10px] text-left text-[13px] font-medium outline-none',
            'transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card',
            active ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
          )}
        >
          {active ? (
            <m.span
              layoutId="expediente-nav-pill"
              transition={PILL_TRANSITION}
              className={cn('absolute inset-0 rounded-lg ring-1 ring-inset', tone.pill)}
              aria-hidden="true"
            />
          ) : null}
          <span className={cn('relative z-10 flex size-[18px] shrink-0 items-center justify-center', active ? tone.icon : undefined)}>
            <Icon name={item.icon} size={17} strokeWidth={1.85} aria-hidden="true" />
          </span>
          <span className={cn('relative z-10 min-w-0 flex-1', LABEL_FADE_CLASS, collapsed && 'pointer-events-none opacity-0')}>
            {item.label}
          </span>
        </button>
      </RailTooltip>
    </li>
  );
}

function IdentityBlock({ identity, collapsed }) {
  if (!identity) return null;
  const { radicado, version, typeLabel, statusLabel, statusClass, barClass, remainingDays, progressPercent } = identity;
  const remainingText = remainingDays != null
    ? `${remainingDays} día${remainingDays === 1 ? '' : 's'} hábil${remainingDays === 1 ? '' : 'es'} restante${remainingDays === 1 ? '' : 's'}`
    : 'Sin término calculado';

  if (collapsed) {
    return (
      <RailTooltip enabled label={`${radicado} · ${statusLabel} · ${remainingText}`}>
        <div
          className={cn('mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-xl border font-mono text-[11px] font-semibold leading-none', statusClass)}
          aria-label={`${radicado}, ${statusLabel}, ${remainingText}`}
          role="img"
        >
          {remainingDays != null ? `${remainingDays}d` : '—'}
        </div>
      </RailTooltip>
    );
  }

  return (
    <div className="space-y-3 border-b border-border/70 px-1 pb-4" data-testid="expediente-nav-identity">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 min-w-0 truncate font-mono text-[15px] font-semibold tracking-tight text-foreground" title={radicado}>{radicado}</p>
        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground" title={`Versión ${version} del expediente`}>
          v{version}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', statusClass)}>
          {statusLabel}
        </span>
        {typeLabel ? (
          <span className="inline-flex min-w-0 max-w-full items-center truncate text-[11px] text-muted-foreground" title={typeLabel}>
            {typeLabel}
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {remainingDays != null
              ? <><strong className="text-lg font-semibold tabular-nums text-foreground">{remainingDays}</strong>{' '}{remainingText.replace(/^\d+ /, '')}</>
              : remainingText}
          </span>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{progressPercent}%</span>
        </div>
        <div
          className="h-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Avance del término legal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <div className={cn('h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none', barClass)} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Left navigation of the expediente workspace.
 * `variant="rail"` is the docked, collapsible column; `variant="sheet"` renders the
 * same content full-width for the off-canvas sheet used below 1024px.
 */
export function ExpedienteSideNav({
  groups,
  activeSection,
  onSelect,
  identity,
  collapsed = false,
  onToggleCollapsed,
  variant = 'rail',
  className,
}) {
  const isRail = variant === 'rail';
  const isCollapsed = isRail && collapsed;

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          'flex h-full min-h-0 flex-col bg-card',
          isRail && 'shrink-0 overflow-hidden border-r border-border transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
          className,
        )}
        style={isRail ? { width: isCollapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED } : undefined}
        data-collapsed={isCollapsed ? 'true' : 'false'}
        data-testid={`expediente-side-nav-${variant}`}
      >
        <div className={cn('shrink-0 px-3 pt-4', isCollapsed ? 'pb-2' : 'pb-1')}>
          <IdentityBlock identity={identity} collapsed={isCollapsed} />
        </div>

        <nav aria-label="Módulos del expediente" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3">
          {groups.map((group) => {
            const tone = toneClasses(group.tone);
            const titleId = `expediente-nav-group-${variant}-${group.id}`;
            return (
              <div key={group.id} role="group" aria-labelledby={titleId} className="mt-3 first:mt-1">
                <div className="flex h-6 items-center gap-2 px-[14px]">
                  <span className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden="true" />
                  <span
                    id={titleId}
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80',
                      LABEL_FADE_CLASS,
                      isCollapsed && 'opacity-0',
                    )}
                  >
                    {group.label}
                  </span>
                </div>
                <ul className="m-0 list-none space-y-0.5 p-0">
                  {group.items.map((item) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      active={activeSection === item.id}
                      collapsed={isCollapsed}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {isRail && onToggleCollapsed ? (
          <div className="shrink-0 border-t border-border/70 p-3">
            <RailTooltip enabled={isCollapsed} label="Expandir menú">
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label={isCollapsed ? 'Expandir menú del expediente' : 'Contraer menú del expediente'}
                aria-expanded={!isCollapsed}
                className="flex h-9 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-[10px] text-[13px] font-medium text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-[18px] shrink-0 items-center justify-center">
                  {isCollapsed
                    ? <PanelLeftOpen className="h-[17px] w-[17px]" strokeWidth={1.85} aria-hidden="true" />
                    : <PanelLeftClose className="h-[17px] w-[17px]" strokeWidth={1.85} aria-hidden="true" />}
                </span>
                <span className={cn(LABEL_FADE_CLASS, isCollapsed && 'pointer-events-none opacity-0')}>Contraer menú</span>
              </button>
            </RailTooltip>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

export default ExpedienteSideNav;

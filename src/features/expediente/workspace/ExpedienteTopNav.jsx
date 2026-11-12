import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { getNavToneClasses } from './expedienteNavConfig';

// Extra room required before going back to a roomier layout, so the bar never flips
// back and forth around a threshold.
const FIT_HYSTERESIS_PX = 24;

/**
 * Fit levels of the nav card, roomiest first. The nav and the tool group share the card:
 * when space runs short the tool labels go first, then the nav collapses to its group
 * menus, and last the tools fold into their "Más" menu.
 */
const FIT_LEVELS = Object.freeze([
  { inline: false, tools: 'menu' },
  { inline: false, tools: 'icons' },
  { inline: true, tools: 'icons' },
  { inline: true, tools: 'labels' },
]);
const TOP_FIT_LEVEL = FIT_LEVELS.length - 1;

function itemsSignature(groups) {
  return groups.map((group) => `${group.id}:${group.items.map((item) => item.id).join(',')}`).join('|');
}

/**
 * Picks the fit level by measuring. The roomiest level is rendered first; whenever the
 * nav row overflows its container (the card minus the tool group) the level steps down
 * and the card width that level needed is remembered as the room required to come back.
 * A new `signature` (the items changed) restarts from the roomiest level.
 */
function useNavCardFit(containerRef, rowRef, signature) {
  const [fit, setFit] = useState({ signature, level: TOP_FIT_LEVEL });
  const level = fit.signature === signature ? fit.level : TOP_FIT_LEVEL;
  const required = useRef({ signature, cardWidths: [] });

  useLayoutEffect(() => {
    const container = containerRef.current;
    const card = container?.parentElement;
    if (!container || !card) return undefined;
    if (required.current.signature !== signature) required.current = { signature, cardWidths: [] };
    const { cardWidths } = required.current;

    const evaluate = () => {
      const available = container.clientWidth;
      const cardWidth = card.clientWidth;
      const row = rowRef.current;
      if (!available || !row) return;
      const needed = row.scrollWidth;
      if (needed > available && level > 0) {
        // The nav itself + everything else in the card (tool group, gaps) at this level.
        cardWidths[level] = needed + (cardWidth - available);
        setFit({ signature, level: level - 1 });
        return;
      }
      const roomForNext = cardWidths[level + 1];
      if (level < TOP_FIT_LEVEL && roomForNext && cardWidth >= roomForNext + FIT_HYSTERESIS_PX) {
        setFit({ signature, level: level + 1 });
      }
    };

    evaluate();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(evaluate);
    observer.observe(container);
    observer.observe(card);
    return () => observer.disconnect();
  }, [containerRef, rowRef, level, signature]);

  return level;
}

const ITEM_BASE_CLASS = 'flex h-8 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg border-0 bg-transparent px-1.5 text-[12.5px] leading-none text-foreground outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card motion-reduce:transition-none';
const SEGMENT_CLASS = 'flex h-10 min-w-0 items-center rounded-xl px-1';

/** Solid group marker: the group name on its section color. */
function GroupChip({ id, tone, children }) {
  return (
    <span
      id={id}
      className={cn(
        'mr-1 inline-flex h-5 shrink-0 select-none items-center rounded-md px-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.05em]',
        tone.chip,
      )}
    >
      {children}
    </span>
  );
}

function InlineItem({ item, tone, active, onSelect }) {
  return (
    <li className="m-0 flex shrink-0 p-0">
      <button
        type="button"
        data-nav-item=""
        onClick={() => onSelect(item.id)}
        aria-label={item.ariaLabel || item.label}
        aria-current={active ? 'page' : undefined}
        title={item.description || (item.shortLabel ? item.ariaLabel || item.label : undefined)}
        className={cn(ITEM_BASE_CLASS, active ? cn('font-semibold', tone.activeSurface, tone.activeText) : cn('font-medium', tone.hover))}
      >
        <span className={cn('inline-flex shrink-0', tone.icon)}>
          <Icon name={item.icon} size={14} strokeWidth={active ? 2.2 : 1.85} aria-hidden="true" />
        </span>
        {item.shortLabel || item.label}
      </button>
    </li>
  );
}

function GroupMenu({ group, tone, activeSection, onSelect, onNavigated, shrinkable }) {
  const activeItem = group.items.find((item) => item.id === activeSection) || null;
  // True between picking an item and the menu closing: focus then goes to the content.
  const navigated = useRef(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-nav-item=""
          aria-label={activeItem ? `${group.label}: ${activeItem.ariaLabel || activeItem.label}` : group.label}
          className={cn(
            ITEM_BASE_CLASS,
            'group h-10 gap-1.5 rounded-xl pl-1 pr-2 text-[13px]',
            shrinkable && 'min-w-0 shrink',
            activeItem ? cn('font-semibold', tone.activeSurface, tone.activeText) : cn('font-medium', tone.wash, tone.hover),
          )}
        >
          <GroupChip tone={tone}>{group.label}</GroupChip>
          {activeItem ? (
            <>
              <span className={cn('inline-flex shrink-0', tone.icon)}>
                <Icon name={activeItem.icon} size={15} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className="truncate">{activeItem.shortLabel || activeItem.label}</span>
            </>
          ) : null}
          <ChevronDown className={cn('size-3.5 shrink-0 transition-transform duration-150 group-data-[state=open]:rotate-180 motion-reduce:transition-none', tone.icon)} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className="min-w-[13rem]"
        onCloseAutoFocus={(event) => {
          if (!navigated.current) return;
          navigated.current = false;
          if (!onNavigated) return;
          event.preventDefault();
          onNavigated();
        }}
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <GroupChip tone={tone}>{group.label}</GroupChip>
        </DropdownMenuLabel>
        {group.items.map((item) => {
          const active = item.id === activeSection;
          return (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => { navigated.current = true; onSelect(item.id); }}
              aria-current={active ? 'page' : undefined}
              className={cn('cursor-pointer text-[13px] text-foreground touch:min-h-11', active && 'font-semibold')}
            >
              <span className={cn('inline-flex shrink-0', tone.icon)}>
                <Icon name={item.icon} size={15} strokeWidth={active ? 2.2 : 1.85} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.ariaLabel || item.label}</span>
              {active ? <Check className={tone.icon} aria-hidden="true" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Horizontal section navigation of the expediente workspace (the nav card under the
 * shell header). Each group is a segment in its own section color: solid chip with the
 * group name, light wash, then its modules. When the row does not fit, each group
 * collapses into a menu trigger that keeps its color and the active module visible.
 * It never wraps or clips.
 *
 * The card's tool group is rendered through `renderTools(mode)` right after the nav, so
 * one measurement decides both: `mode` is `'labels'`, `'icons'` or `'menu'` (see
 * `FIT_LEVELS`). `onNavigated` runs after a module is picked from a group menu, in place
 * of returning focus to the trigger (move focus to the content there).
 *
 * Renders a fragment: the parent is the nav card (a flex row).
 */
export function ExpedienteTopNav({ groups, activeSection, onSelect, onNavigated, renderTools, className }) {
  const containerRef = useRef(null);
  const rowRef = useRef(null);
  const signature = itemsSignature(groups);
  const level = useNavCardFit(containerRef, rowRef, signature);
  const { inline, tools } = FIT_LEVELS[level];
  // Only the last level may squeeze the group triggers (their labels truncate).
  const shrinkable = level === 0;

  // Keep the active module in view if the inline row ever scrolls (zoomed text, long labels).
  useEffect(() => {
    rowRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeSection, inline]);

  const handleKeyDown = (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    if (event.target?.dataset?.navItem === undefined) return;
    const items = Array.from(rowRef.current?.querySelectorAll('[data-nav-item]') || []);
    const index = items.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else next = items.length - 1;
    items[next]?.focus();
  };

  return (
    <>
      <nav
        ref={containerRef}
        aria-label="Módulos del expediente"
        className={cn('min-w-0 flex-1 overflow-hidden', className)}
        data-testid="expediente-top-nav"
      >
        {/* Arrow keys only move focus between the buttons inside this row. */}
        <div
          ref={rowRef}
          data-layout={inline ? 'inline' : 'menus'}
          onKeyDown={handleKeyDown}
          className="flex h-10 min-w-0 items-center gap-1.5"
        >
          {groups.map((group) => {
            const titleId = `expediente-top-nav-${group.id}`;
            const tone = getNavToneClasses(group.tone);
            return inline ? (
              <div
                key={group.id}
                role="group"
                aria-labelledby={titleId}
                data-nav-group={group.id}
                className={cn(SEGMENT_CLASS, 'shrink-0', tone.wash)}
              >
                <GroupChip id={titleId} tone={tone}>{group.label}</GroupChip>
                <ul className="m-0 flex shrink-0 list-none items-center p-0">
                  {group.items.map((item) => (
                    <InlineItem key={item.id} item={item} tone={tone} active={item.id === activeSection} onSelect={onSelect} />
                  ))}
                </ul>
              </div>
            ) : (
              <GroupMenu
                key={group.id}
                group={group}
                tone={tone}
                activeSection={activeSection}
                onSelect={onSelect}
                onNavigated={onNavigated}
                shrinkable={shrinkable}
              />
            );
          })}
        </div>
      </nav>
      {renderTools ? renderTools(tools) : null}
    </>
  );
}

export default ExpedienteTopNav;

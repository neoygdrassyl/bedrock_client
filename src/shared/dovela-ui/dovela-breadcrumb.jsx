import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const LINK_CLASS = 'rounded-sm border-0 bg-transparent p-0 text-muted-foreground no-underline outline-none transition-colors duration-150 hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card';

function BreadcrumbNode({ item, current }) {
  const content = <span className={cn('block truncate', item.mono && 'font-mono')}>{item.label}</span>;

  if (current) {
    return (
      <span aria-current="page" className="block min-w-0 font-medium text-foreground">
        {content}
      </span>
    );
  }
  if (item.href) {
    return (
      <a href={item.href} onClick={item.onClick} className={cn('block min-w-0', LINK_CLASS)}>
        {content}
      </a>
    );
  }
  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className={cn('block min-w-0 max-w-full cursor-pointer text-left', LINK_CLASS)}>
        {content}
      </button>
    );
  }
  return <span className="block min-w-0 text-muted-foreground">{content}</span>;
}

/**
 * Location trail of a page or module.
 *
 * @param {{
 *   items: Array<{ label: React.ReactNode, href?: string, onClick?: (event: React.SyntheticEvent) => void, mono?: boolean }>,
 *   label?: string,
 *   className?: string,
 * }} props
 * Items with `href` render a link (pass `onClick` too for client-side navigation),
 * items with only `onClick` render a button, the rest are plain text. The last item is
 * always the current page and is never interactive.
 */
export function DovelaBreadcrumb({ items, label = 'Breadcrumb', className }) {
  const entries = (items || []).filter((item) => item && item.label != null && item.label !== '');
  if (!entries.length) return null;

  return (
    <nav aria-label={label} data-dovela-ui="breadcrumb" className={cn('min-w-0', className)}>
      <ol className="m-0 flex min-w-0 list-none items-center gap-1.5 p-0 text-xs leading-5">
        {entries.map((item, index) => {
          const current = index === entries.length - 1;
          return (
            <li
              key={item.key ?? index}
              className={cn('m-0 flex min-w-0 items-center gap-1.5 p-0', current ? 'shrink' : 'shrink-[2]')}
            >
              {index > 0 ? <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" /> : null}
              <BreadcrumbNode item={item} current={current} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

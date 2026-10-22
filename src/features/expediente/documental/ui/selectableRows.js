/**
 * Shared behaviour of documentary tables whose whole row selects a document
 * (role="grid", rows with `data-row-key`, roving tabindex on the selected row).
 */

/** Enter/Space select the focused row; ArrowUp/ArrowDown move focus between rows. */
export function handleSelectableRowKeyDown(event, onSelect) {
  if (event.target !== event.currentTarget) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onSelect();
    return;
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const rows = [...(event.currentTarget.closest('table')?.querySelectorAll('tr[data-row-key]') || [])];
  const next = rows[rows.indexOf(event.currentTarget) + (event.key === 'ArrowDown' ? 1 : -1)];
  if (next) {
    event.preventDefault();
    next.focus();
  }
}

export const selectableRowClass = (selected) => [
  'cursor-pointer border-border/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none',
  selected ? 'bg-primary/5 hover:bg-primary/5' : 'hover:bg-muted/40',
].join(' ');

/** Left accent of the selected row, applied to its first cell. */
export const selectedRowAccent = "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary before:content-['']";

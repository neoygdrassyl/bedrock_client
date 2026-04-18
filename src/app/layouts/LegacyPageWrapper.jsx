/**
 * LegacyPageWrapper — CSS bridge between Bootstrap legacy pages and the
 * redesigned shell's design tokens.
 *
 * Wraps legacy page content and overrides Bootstrap component colors
 * (buttons, tables, cards, badges, alerts) to use the design token palette.
 * This does NOT rewrite components — it just reduces the visual clash
 * between old pages and the new shell.
 *
 * Usage: wrap Outlet in AppShell or individual legacy routes.
 */
export function LegacyPageWrapper({ children }) {
  return (
    <div className="legacy-bridge">
      {children}
    </div>
  );
}

import { infoCud } from '@/app/components/jsons/vars';

/**
 * App footer: version + institution name.
 */
export function AppFooter() {
  return (
    <footer
      role="contentinfo"
      className="flex items-center justify-between h-8 px-4 border-t border-border text-xs text-muted-foreground bg-card"
    >
      <span>Dovela</span>
      <span>{infoCud.name} — {infoCud.city}</span>
    </footer>
  );
}

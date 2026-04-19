import { infoCud } from '@/app/components/jsons/vars';
import packageJson from '../../../package.json';

/**
 * App footer: version, institution name, NIT, connectivity status.
 * Styled as a VS Code-like status bar — compact, informational, unobtrusive.
 */
export function AppFooter() {
  return (
    <footer
      role="contentinfo"
      className="flex items-center h-[22px] px-3 border-t border-border/40 text-[10px] bg-sidebar text-sidebar-foreground/50 gap-2.5 select-none"
    >
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
        <span className="hidden sm:inline">Conectado</span>
      </span>

      <span className="opacity-15">|</span>

      <span className="font-medium tracking-wide">
        Dovela <span className="opacity-50">v{packageJson.version}</span>
      </span>

      <span className="opacity-15">|</span>

      <span className="flex-1 truncate opacity-70">
        {infoCud.name} — {infoCud.city}, {infoCud.state}
      </span>

      {infoCud.nit && (
        <span className="opacity-40 hidden sm:inline font-mono text-[9px]">
          NIT {infoCud.nit}
        </span>
      )}
    </footer>
  );
}

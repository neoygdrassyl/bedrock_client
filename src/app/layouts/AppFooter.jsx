import { infoCud } from '@/app/components/jsons/vars';
import packageJson from '../../../package.json';

/**
 * App footer: version, institution name, NIT, connectivity status.
 * Styled as a VS Code-like status bar.
 */
export function AppFooter() {
  return (
    <footer
      role="contentinfo"
      className="flex items-center h-6 px-4 border-t border-border text-[10px] text-muted-foreground bg-sidebar text-sidebar-foreground/60 gap-3 select-none"
    >
      {/* Connectivity indicator */}
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline opacity-70">Conectado</span>
      </span>

      <span className="opacity-20">|</span>

      {/* Branding + version */}
      <span className="font-medium tracking-wide">
        Dovela <span className="opacity-60">v{packageJson.version}</span>
      </span>

      <span className="opacity-20">|</span>

      {/* Institution info */}
      <span className="flex-1 truncate">
        {infoCud.name} — {infoCud.city}, {infoCud.state}
      </span>

      {/* NIT */}
      {infoCud.nit && (
        <span className="opacity-60 hidden sm:inline">
          NIT {infoCud.nit}
        </span>
      )}
    </footer>
  );
}

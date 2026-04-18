import { infoCud } from '@/app/components/jsons/vars';
import packageJson from '../../../package.json';

/**
 * App footer: version, institution name, NIT.
 * Styled as a VS Code-like status bar.
 */
export function AppFooter() {
  return (
    <footer
      role="contentinfo"
      className="flex items-center h-7 px-4 border-t border-border text-[11px] text-muted-foreground bg-sidebar text-sidebar-foreground/60 gap-4 select-none"
    >
      {/* Left: branding + version */}
      <span className="font-medium tracking-wide">
        Dovela <span className="opacity-60">v{packageJson.version}</span>
      </span>

      <span className="opacity-30">|</span>

      {/* Center: institution info */}
      <span className="flex-1 truncate">
        {infoCud.name} — {infoCud.city}, {infoCud.state}
      </span>

      {/* Right: NIT */}
      {infoCud.nit && (
        <span className="opacity-60 hidden sm:inline">
          NIT {infoCud.nit}
        </span>
      )}
    </footer>
  );
}

import { infoCud } from '@/shared/config/jsons/vars';
import { BrandMark } from './BrandMark';

/**
 * Institutional panel of the split-screen pages (login, error screens), shown
 * from `lg` up. Fixed dark base so white text keeps its contrast whatever
 * palette --primary is set to.
 *
 * @param {object} props
 * @param {'h1'|'p'} [props.nameAs] element for the tenant name; pages whose own
 *   title is the h1 (error screens) pass `p` so there is a single h1.
 */
export function BrandPanel({ nameAs: NameTag = 'h1' }) {
  const location = [infoCud.city, infoCud.state].filter(Boolean).join(', ');

  return (
    <aside className="relative hidden overflow-hidden bg-[hsl(222_47%_11%)] text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_100%_0%,hsl(var(--primary)/0.55),transparent_60%),radial-gradient(40rem_30rem_at_0%_100%,hsl(var(--primary)/0.30),transparent_60%)]"
      />
      <div aria-hidden="true" className="absolute -right-24 top-1/3 h-96 w-96 rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute -left-16 bottom-24 h-64 w-64 rounded-full border border-white/10" />

      <div className="relative z-10 flex items-center gap-3 text-sm font-medium tracking-wide text-white/90">
        <span className="h-px w-8 bg-white/60" aria-hidden="true" />
        Sistema de gestión de trámites urbanísticos
      </div>

      <div className="relative z-10 max-w-md">
        <BrandMark className="mb-8 h-24 w-24 text-4xl" />
        <NameTag className="text-3xl font-semibold leading-tight tracking-tight">{infoCud.name}</NameTag>
        {location && <p className="mt-3 text-base text-white/85">{location}</p>}
      </div>

      <div className="relative z-10 space-y-4">
        {/* White government mark (tenant config `icon2`), meant for dark backgrounds. */}
        {infoCud.icon2 && (
          <img src={infoCud.icon2} alt="Gobierno de Colombia" className="h-10 w-auto" />
        )}
        <p className="text-sm text-white/75">{infoCud.dir || ' '}</p>
      </div>
    </aside>
  );
}

/** Brand row that replaces the panel below `lg`. */
export function BrandCompactHeader() {
  return (
    <div className="mb-8 flex items-center gap-3 lg:hidden">
      <BrandMark tone="primary" className="h-12 w-12 shrink-0 text-xl" />
      <p className="text-base font-semibold leading-snug text-foreground">{infoCud.name}</p>
    </div>
  );
}

/** "Powered by Dovela" footer of the split-screen pages. */
export function PoweredByDovela() {
  return (
    <p className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
      Powered by
      <img src="/logo192.png" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
      <span className="font-semibold text-foreground">Dovela</span>
    </p>
  );
}

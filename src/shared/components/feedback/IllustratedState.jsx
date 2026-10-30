import { useId } from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

/**
 * Calm, illustrated replacement for error boxes, alerts and toasts.
 *
 * Variants: `not-found` (404), `load-error` (a resource or request failed; shows
 * "Reintentar" when `onRetry` is given), `offline`, `empty` and `image` (broken
 * image placeholder). Illustrations are inline SVG drawn with `currentColor` and
 * the theme's CSS tokens, so they follow light and dark mode without assets.
 *
 * Spacing avoids Bootstrap's `!important` utilities (`mt-3`, `px-4`, `gap-3`…),
 * and the accent color is set inline because Bootstrap's `.text-primary` would
 * override Tailwind's class of the same name.
 */

const ACCENT = { color: 'hsl(var(--primary))' };

// Shared backdrop: a soft halo and a ground shadow.
function Backdrop() {
  return (
    <>
      <circle cx="80" cy="56" r="46" fill="currentColor" opacity="0.06" style={ACCENT} />
      <ellipse cx="80" cy="106" rx="44" ry="5" fill="currentColor" opacity="0.12" />
    </>
  );
}

function NotFoundArt() {
  return (
    <>
      <Backdrop />
      <rect x="46" y="22" width="52" height="68" rx="6" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2.5" />
      <path d="M56 38h32M56 48h24M56 58h28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <g style={ACCENT}>
        <circle cx="100" cy="72" r="15" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="3" />
        <path d="M111 83l12 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M96 68.5a4.5 4.5 0 1 1 6 4.2c-1.3.5-2 1.4-2 2.8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="80" r="1.6" fill="currentColor" />
      </g>
    </>
  );
}

function LoadErrorArt() {
  return (
    <>
      <Backdrop />
      <rect x="40" y="30" width="80" height="58" rx="8" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2.5" />
      <path d="M40 42h80" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="36" r="1.8" fill="currentColor" />
      <circle cx="54" cy="36" r="1.8" fill="currentColor" />
      <circle cx="60" cy="36" r="1.8" fill="currentColor" />
      <g style={ACCENT}>
        <path d="M66 68a14 14 0 0 1 24-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M91 51v8h-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M94 66a14 14 0 0 1-24 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
      </g>
    </>
  );
}

function OfflineArt() {
  return (
    <>
      <Backdrop />
      <path
        d="M52 84h56a16 16 0 0 0 1-32 24 24 0 0 0-46-6 18 18 0 0 0-11 38z"
        fill="hsl(var(--background))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <g style={ACCENT}>
        <path d="M68 66a17 17 0 0 1 24 0M74 72a8 8 0 0 1 12 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="80" cy="78" r="2" fill="currentColor" />
      </g>
      <path d="M62 50l36 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </>
  );
}

function EmptyArt() {
  return (
    <>
      <Backdrop />
      <path d="M42 60l12-22h52l12 22" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path
        d="M42 60h26a12 12 0 0 0 24 0h26v26a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6z"
        fill="hsl(var(--background))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <g style={ACCENT} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M80 18v10M64 22l4 7M96 22l-4 7" />
      </g>
    </>
  );
}

function ImageArt() {
  return (
    <>
      <Backdrop />
      <rect x="44" y="28" width="72" height="56" rx="6" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2.5" />
      <path d="M48 78l20-20 14 14 10-10 20 20" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" opacity="0.5" />
      <g style={ACCENT}>
        <circle cx="98" cy="44" r="6" fill="currentColor" opacity="0.85" />
      </g>
      <path d="M84 28l-6 14 8 8-6 12" stroke="hsl(var(--background))" strokeWidth="4" fill="none" />
      <path d="M84 28l-6 14 8 8-6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
    </>
  );
}

export const ILLUSTRATED_STATE_VARIANTS = {
  'not-found': {
    Art: NotFoundArt,
    title: 'No encontramos esta página',
    description: 'La dirección no corresponde a ninguna pantalla. Puede que el enlace esté incompleto o que la página haya cambiado de lugar.',
  },
  'load-error': {
    Art: LoadErrorArt,
    title: 'No pudimos cargar esta información',
    description: 'Puede ser algo momentáneo. Intente de nuevo en unos segundos.',
  },
  offline: {
    Art: OfflineArt,
    title: 'Sin conexión',
    description: 'Revise su conexión a internet. La información se mostrará cuando vuelva la conexión.',
  },
  empty: {
    Art: EmptyArt,
    title: 'Aún no hay nada aquí',
    description: 'Cuando haya información disponible aparecerá en este espacio.',
  },
  image: {
    Art: ImageArt,
    title: 'Imagen no disponible',
    description: 'No fue posible mostrar esta imagen.',
  },
};

/**
 * @param {object} props
 * @param {'not-found'|'load-error'|'offline'|'empty'|'image'} [props.variant]
 * @param {string} [props.title] overrides the variant's title
 * @param {import('react').ReactNode} [props.description] overrides the variant's text; `null` hides it
 * @param {() => void} [props.onRetry] shows a "Reintentar" button (any variant)
 * @param {string} [props.retryLabel]
 * @param {import('react').ReactNode} [props.actions] extra actions next to retry
 * @param {import('react').ReactNode} [props.detail] small print under the actions (e.g. a reference code)
 * @param {'compact'|'default'} [props.size]
 * @param {boolean} [props.fullPage] centers the state in the whole viewport and uses an h1
 * @param {string} [props.className]
 */
export function IllustratedState({
  variant = 'load-error',
  title,
  description,
  onRetry,
  retryLabel = 'Reintentar',
  actions,
  detail,
  size = 'default',
  fullPage = false,
  className,
}) {
  const config = ILLUSTRATED_STATE_VARIANTS[variant] || ILLUSTRATED_STATE_VARIANTS['load-error'];
  const titleId = useId();
  const compact = size === 'compact';
  const Heading = fullPage ? 'h1' : 'h2';
  const text = description === undefined ? config.description : description;
  const { Art } = config;

  const body = (
    <section
      role="status"
      aria-labelledby={titleId}
      data-illustrated-state={variant}
      className={cn(
        'mx-auto flex w-full flex-col items-center text-center',
        compact ? 'max-w-[320px] py-6' : 'max-w-[440px] py-10',
        !fullPage && className,
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 160 120"
        fill="none"
        className={cn('shrink-0 text-muted-foreground', compact ? 'h-20 w-[107px]' : 'h-32 w-[171px]')}
      >
        <Art />
      </svg>

      <Heading
        id={titleId}
        className={cn(
          'mb-0 font-semibold tracking-tight text-foreground',
          compact ? 'mt-2.5 text-sm' : fullPage ? 'mt-6 text-2xl' : 'mt-6 text-lg',
        )}
      >
        {title || config.title}
      </Heading>

      {text ? (
        <p className={cn('mb-0 text-muted-foreground', compact ? 'mt-1 text-xs leading-5' : 'mt-2 text-sm leading-relaxed')}>
          {text}
        </p>
      ) : null}

      {onRetry || actions ? (
        <div className={cn('flex flex-wrap items-center justify-center gap-2', compact ? 'mt-3.5' : 'mt-6')}>
          {onRetry ? (
            <Button type="button" variant="outline" size={compact ? 'sm' : 'default'} onClick={onRetry}>
              <RotateCw aria-hidden="true" />
              {retryLabel}
            </Button>
          ) : null}
          {actions}
        </div>
      ) : null}

      {detail ? <div className={cn('text-xs text-muted-foreground', compact ? 'mt-2.5' : 'mt-6')}>{detail}</div> : null}
    </section>
  );

  if (!fullPage) return body;

  return (
    <main className={cn('flex min-h-screen items-center justify-center bg-background px-6', className)}>
      {body}
    </main>
  );
}

export default IllustratedState;

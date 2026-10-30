import { useEffect, useId, useRef, useState } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { Check, Copy, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { BrandCompactHeader, BrandPanel, PoweredByDovela } from '@/shared/components/brand/BrandPanel';

// Spacing avoids Bootstrap's !important utilities (`mt-3`, `px-4`, `gap-3`…),
// which would beat Tailwind classes of the same name. Primary is tinted toward
// black (light) or white (dark) as on the login, so text on it reaches 4.5:1.
const PRIMARY_ACTION_CLASS =
  'text-base font-semibold ' +
  'bg-[color-mix(in_srgb,hsl(var(--primary))_88%,black)] hover:bg-[color-mix(in_srgb,hsl(var(--primary))_78%,black)] ' +
  'dark:bg-[color-mix(in_srgb,hsl(var(--primary))_78%,white)] dark:hover:bg-[color-mix(in_srgb,hsl(var(--primary))_66%,white)]';

// Bare `border` collides with Bootstrap's `.border`; an inset ring draws the edge.
const SECONDARY_ACTION_CLASS =
  'text-base font-medium bg-background text-foreground ring-1 ring-inset ring-muted-foreground/60 hover:bg-muted';

const STATUS_CLASS =
  'text-7xl font-semibold leading-none tracking-tight ' +
  'text-[color-mix(in_srgb,hsl(var(--primary))_88%,black)] dark:text-[color-mix(in_srgb,hsl(var(--primary))_70%,white)]';

export const ERROR_SCREEN_KINDS = {
  'not-found': {
    status: '404',
    title: 'Esta página no existe',
    description: 'La dirección que abrió no corresponde a ninguna pantalla de Dovela. Puede que el enlace esté incompleto o que la página haya cambiado de lugar.',
    actions: ['dashboard', 'back'],
  },
  crash: {
    status: '500',
    title: 'Algo falló al mostrar esta pantalla',
    description: 'Ocurrió un error inesperado y la pantalla se detuvo para no mostrar información incompleta. El error quedó registrado; puede recargar la página o volver al panel.',
    actions: ['reload', 'dashboard'],
  },
  chunk: {
    icon: RefreshCw,
    title: 'Hay una versión nueva de Dovela',
    description: 'Dovela se actualizó mientras esta pestaña estaba abierta. Actualice la página para cargar la versión más reciente; su sesión se conserva.',
    actions: ['update'],
  },
  unavailable: {
    icon: WifiOff,
    title: 'No pudimos conectar con el servidor',
    description: 'Revise su conexión a internet. Si la conexión funciona, el servidor puede estar en mantenimiento: intente de nuevo en unos minutos.',
    actions: ['retry'],
  },
  forbidden: {
    status: '403',
    title: 'No tiene permiso para ver esta página',
    description: 'Su usuario no tiene acceso a esta sección. Si considera que debería tenerlo, solicítelo a la persona administradora de la curaduría.',
    actions: ['dashboard'],
  },
};

const ACTION_LABELS = {
  dashboard: 'Ir al panel',
  back: 'Volver',
  reload: 'Recargar',
  update: 'Actualizar',
  retry: 'Reintentar',
};

function reloadPage() {
  window.location.reload();
}

function ReferenceCode({ value }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const selectCode = () => {
    const node = codeRef.current;
    const selection = window.getSelection?.();
    if (!node || !selection || !document.createRange) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Without clipboard access, select the code so Ctrl+C copies it.
      selectCode();
    }
  };

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span>Código de referencia:</span>
      <code
        ref={codeRef}
        data-testid="error-reference"
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground select-all"
      >
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Código copiado' : 'Copiar código de referencia'}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
      </button>
      <span aria-live="polite" className="sr-only">{copied ? 'Código copiado' : ''}</span>
    </div>
  );
}

/**
 * Full-page error screen in the login's split layout.
 *
 * Kinds: `not-found` (404), `crash` (render failure), `chunk` (outdated build),
 * `unavailable` (backend unreachable) and `forbidden` (403). Pages that detect a
 * 403 on load can render `<ErrorScreen kind="forbidden" />` directly.
 *
 * @param {object} props
 * @param {keyof ERROR_SCREEN_KINDS} props.kind
 * @param {string} [props.referenceId] request or event id shown as "Código de referencia"
 * @param {() => void} [props.onRetry] `unavailable` retry; reloads the page by default
 * @param {string} [props.title] overrides the kind's title
 * @param {string} [props.description] overrides the kind's explanation
 */
export function ErrorScreen(props) {
  // useNavigate is only valid inside a Router; outside one (a crash above the
  // router) navigation falls back to a full page load.
  return useInRouterContext() ? <RoutedErrorScreen {...props} /> : <ErrorScreenView {...props} navigate={null} />;
}

function RoutedErrorScreen(props) {
  const navigate = useNavigate();
  return <ErrorScreenView {...props} navigate={navigate} />;
}

function ErrorScreenView({ kind = 'crash', referenceId, onRetry, title, description, navigate }) {
  const config = ERROR_SCREEN_KINDS[kind] || ERROR_SCREEN_KINDS.crash;
  const titleId = useId();
  const headingRef = useRef(null);
  const Icon = config.icon;
  // After a crash the app state is unreliable: leave through a full page load.
  const fullReload = kind === 'crash' || kind === 'chunk';
  const goTo = (path) => {
    if (navigate && !fullReload) navigate(path);
    else window.location.assign(path);
  };

  useEffect(() => {
    // Move focus to the title so screen readers announce the new page.
    headingRef.current?.focus({ preventScroll: true });
  }, [kind]);

  const handlers = {
    dashboard: () => goTo('/dashboard'),
    back: () => {
      if (window.history.length > 1) window.history.back();
      else goTo('/dashboard');
    },
    reload: reloadPage,
    update: reloadPage,
    retry: () => (onRetry ? onRetry() : reloadPage()),
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]" data-error-kind={kind}>
      <BrandPanel nameAs="p" />

      <main
        aria-labelledby={titleId}
        className="flex items-center justify-center px-6 py-10 sm:px-10 lg:shadow-[inset_1px_0_0_hsl(var(--border))]"
      >
        <div className="w-full max-w-[440px] animate-fade-in-up motion-reduce:animate-none">
          <BrandCompactHeader />

          {config.status ? (
            <p aria-hidden="true" className={cn(STATUS_CLASS, 'mb-0')}>{config.status}</p>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-foreground"
            >
              <Icon className="h-8 w-8" />
            </span>
          )}

          <h1
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="mb-0 mt-6 text-2xl font-semibold tracking-tight text-foreground outline-none"
          >
            {title || config.title}
          </h1>
          <p role="alert" className="mb-0 mt-2.5 text-base leading-relaxed text-muted-foreground">
            {description || config.description}
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            {config.actions.map((action, index) => (
              <Button
                key={action}
                type="button"
                size="lg"
                variant={index === 0 ? 'default' : 'ghost'}
                onClick={handlers[action]}
                className={cn('sm:flex-1', index === 0 ? PRIMARY_ACTION_CLASS : SECONDARY_ACTION_CLASS)}
              >
                {ACTION_LABELS[action]}
              </Button>
            ))}
          </div>

          {referenceId && <ReferenceCode value={referenceId} />}

          <PoweredByDovela />
        </div>
      </main>
    </div>
  );
}

export default ErrorScreen;

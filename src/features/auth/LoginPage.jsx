import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import CustomsDataService from '@/shared/api/custom.service';
import DataSerive from '@/shared/api/data.service';
import { swalError } from '@/shared/utils/swalAdapter';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';
import { BrandCompactHeader, BrandPanel, PoweredByDovela } from '@/shared/components/brand/BrandPanel';

// Fields set an explicit text color: Tailwind preflight is off, so a bare <input>
// falls back to the browser default (black) and vanishes on the dark theme.
// Tailwind's `border` collides with Bootstrap's `.border` (which is !important and
// forces #dee2e6), so the field boundary is an inset ring in --muted-foreground
// (>= 3:1 on both themes) instead of a border. For the same reason horizontal padding
// is requested as `px-10` (Bootstrap has no such class): the Input's base `px-3` is
// `.px-3 { padding-left: 1rem !important }` in Bootstrap and would beat any `pl-*`.
const FIELD_CLASS =
  'h-11 border-0 bg-background text-foreground text-base ' +
  'ring-1 ring-inset ring-muted-foreground/85 placeholder:text-muted-foreground ' +
  'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0 ' +
  'aria-[invalid=true]:ring-destructive ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] ' +
  '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_hsl(var(--background))]';

// Primary tinted toward black (light) or white (dark) so the label reaches 4.5:1
// whatever palette --primary is set to.
const SUBMIT_CLASS =
  'w-full text-base font-semibold ' +
  'bg-[color-mix(in_srgb,hsl(var(--primary))_88%,black)] hover:bg-[color-mix(in_srgb,hsl(var(--primary))_78%,black)] ' +
  'dark:bg-[color-mix(in_srgb,hsl(var(--primary))_78%,white)] dark:hover:bg-[color-mix(in_srgb,hsl(var(--primary))_66%,white)]';

const ERROR_CLASS = 'flex items-center gap-1.5 text-sm font-medium text-[hsl(0_72%_40%)] dark:text-[hsl(0_91%_72%)]';

/**
 * Login page — split-screen layout: institutional panel + credentials form.
 * Authentication logic is unchanged; credentials are now read from the form at
 * submit time so browser autofill and password managers are always captured.
 *
 * @param {object} props
 * @param {(cb: Function) => void} props.signin - auth.signin from ProvideAuth
 */
export default function LoginPage({ signin }) {
  useTranslation();
  const navigate = useNavigate();
  const submittingRef = React.useRef(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [capsLock, setCapsLock] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const from = { pathname: '/dashboard' };

  // ── Authentication logic (unchanged) ────────────────────────────────

  const performLogin = (credentials) => {
    return CustomsDataService.appLoginCompatible(credentials)
      .then((response) => {
        let userInfo = {};

        if (response.data.token && response.data.user) {
          const u = response.data.user;
          userInfo.name = u.name;
          userInfo.surname = u.surname;
          userInfo.role = u.Role.name;
          userInfo.role_short = u.Role.short;
          userInfo.roleDesc = u.Role.desc;
          userInfo.active = u.active;
          userInfo.roleId = u.roleId;
          userInfo.id = u.id;
          userInfo.name_short = u.name + ' ' + u.surname;
          userInfo.name_full =
            u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
          DataSerive.saveToken(response.data.token);
          DataSerive.setUser(userInfo);
          doLogin();
        } else if (Array.isArray(response.data) && response.data.length === 1) {
          const u = response.data[0];
          userInfo.name = u.name;
          userInfo.surname = u.surname;
          userInfo.role = u.role?.name;
          userInfo.role_short = u.role?.short;
          userInfo.roleDesc = u.role?.desc;
          userInfo.active = u.active;
          userInfo.roleId = u.roleId;
          userInfo.id = u.id;
          userInfo.name_short = u.name + ' ' + u.surname;
          userInfo.name_full =
            u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
          DataSerive.setUser(userInfo);
          doLogin();
        } else {
          swalError({
            title: 'CERTIFICACION FALLIDA',
            text: 'Respuesta de autenticación inválida',
            footer: 'El servidor respondió sin token o sin datos de usuario',
            icon: 'error',
          });
        }
      })
      .catch((e) => {
        console.log('[AUTH] Login error', e);

        if (!e.response) {
          swalError({
            title: 'ERROR DE CONEXION',
            text: 'No fue posible conectar con el servidor',
            footer: 'Verifique que el backend esté en línea y VITE_API_URL apunte correctamente',
            icon: 'error',
          });
          return;
        }

        if (e.response.status === 401) {
          swalError({
            title: 'CREDENCIALES INVALIDAS',
            text: 'Usuario o contraseña incorrectos',
            footer: 'Revise sus credenciales e intentelo nuevamente',
            icon: 'error',
          });
          return;
        }

        swalError({
          title: 'ERROR EN EL SERVIDOR',
          text: 'No fue posible iniciar sesión en este momento',
          footer: 'Intente nuevamente o contacte al administrador',
          icon: 'error',
        });
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    // Read from the DOM, not from onChange: browsers fill saved credentials
    // without always firing a React change event.
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');

    const nextErrors = {};
    if (!email) nextErrors.email = 'Ingrese su correo electrónico.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Revise el formato del correo electrónico.';
    if (!password) nextErrors.password = 'Ingrese su contraseña.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstInvalid = nextErrors.email ? 'email' : 'password';
      event.currentTarget.elements[firstInvalid]?.focus();
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      // performLogin reports its own failures; this only guards double submits.
      await performLogin({ email, password });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const doLogin = () => {
    signin(() => {
      navigate(from.pathname, { replace: true });
    });
  };

  const clearError = (field) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  // ── UI ──────────────────────────────────────────────────────────────

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Institutional panel (desktop) */}
      <BrandPanel />

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-10 sm:px-10 lg:shadow-[inset_1px_0_0_hsl(var(--border))]">
        <div className="w-full max-w-[400px] animate-fade-in-up motion-reduce:animate-none">
          {/* Brand header (below lg) */}
          <BrandCompactHeader />

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Iniciar sesión</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ingrese sus credenciales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                  placeholder="nombre@ejemplo.com"
                  aria-invalid={errors.email ? 'true' : undefined}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  onChange={() => clearError('email')}
                  className={cn(FIELD_CLASS, 'px-10')}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className={ERROR_CLASS}>
                  <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Su contraseña"
                  aria-invalid={errors.password ? 'true' : undefined}
                  aria-describedby={cn(errors.password && 'password-error', capsLock && 'caps-hint') || undefined}
                  onChange={() => clearError('password')}
                  onKeyUp={(e) => setCapsLock(e.getModifierState?.('CapsLock') === true)}
                  onBlur={() => setCapsLock(false)}
                  className={cn(FIELD_CLASS, 'px-10 pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar caracteres' : 'Mostrar caracteres'}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </button>
              </div>
              {capsLock && (
                <p id="caps-hint" className="text-sm text-muted-foreground">
                  Bloq Mayús está activado.
                </p>
              )}
              {errors.password && (
                <p id="password-error" role="alert" className={ERROR_CLASS}>
                  <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} aria-busy={isSubmitting} className={SUBMIT_CLASS}>
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Ingresando…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <PoweredByDovela />
        </div>
      </main>
    </div>
  );
}

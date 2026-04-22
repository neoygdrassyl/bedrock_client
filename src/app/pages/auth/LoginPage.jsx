import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import CustomsDataService from '@/app/services/custom.service';
import DataSerive from '@/app/services/data.service';
import { infoCud } from '@/app/components/jsons/vars';
import { swalError } from '@/app/utils/swalAdapter';

/**
 * Login page — split-screen layout with brand panel + form panel.
 * All authentication logic preserved from original extraction.
 *
 * @param {object} props
 * @param {(cb: Function) => void} props.signin - auth.signin from ProvideAuth
 */
export default function LoginPage({ signin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const recaptchaRef = React.useRef(null);
  const credentialsRef = React.useRef({ email: '', password: '' });

  const from = { pathname: '/dashboard' };

  // ── Authentication logic (unchanged) ────────────────────────────────

  const handleSubmit = (event) => {
    event.preventDefault();

    const showAuthError = ({ title, text, footer }) => {
      swalError({ title, text, footer, icon: 'error' });
    };

    recaptchaRef.current
      .execute()
      .then(() => {
        CustomsDataService.appLoginCompatible(credentialsRef.current)
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
              showAuthError({
                title: 'CERTIFICACION FALLIDA',
                text: 'Respuesta de autenticaci\u00f3n inv\u00e1lida',
                footer: 'El servidor respondi\u00f3 sin token o sin datos de usuario',
              });
            }
          })
          .catch((e) => {
            console.log('[AUTH] Login error', e);

            if (!e.response) {
              showAuthError({
                title: 'ERROR DE CONEXION',
                text: 'No fue posible conectar con el servidor',
                footer: 'Verifique que el backend est\u00e9 en l\u00ednea y VITE_API_URL apunte correctamente',
              });
              return;
            }

            if (e.response.status === 401) {
              showAuthError({
                title: 'CREDENCIALES INVALIDAS',
                text: 'Usuario o contrase\u00f1a incorrectos',
                footer: 'Revise sus credenciales e intentelo nuevamente',
              });
              return;
            }

            showAuthError({
              title: 'ERROR EN EL SERVIDOR',
              text: 'No fue posible iniciar sesi\u00f3n en este momento',
              footer: 'Intente nuevamente o contacte al administrador',
            });
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const doLogin = () => {
    signin(() => {
      navigate(from.pathname, { replace: true });
    });
  };

  // ── UI — Split-screen layout ────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel — left side (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(221,83%,45%)] to-[hsl(221,80%,35%)] items-center justify-center p-12 relative overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-white translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full border border-white -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full border border-white/50 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full border border-white/30" />
        </div>

        <div className="text-center text-white relative z-10 max-w-sm">
          {/* Institution logo */}
          <div className="mb-10">
            {infoCud.icon ? (
              <img
                src={infoCud.icon}
                alt="Logo institucional"
                className="w-32 h-32 object-contain mx-auto drop-shadow-2xl rounded-2xl bg-white/10 backdrop-blur-sm p-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto">
                <span className="text-5xl font-bold text-white">D</span>
              </div>
            )}
          </div>
          <h1 className="text-xl font-semibold tracking-tight mb-2 text-white/95">{infoCud.name}</h1>
          <p className="text-white/50 text-sm">
            {infoCud.city}{infoCud.state ? `, ${infoCud.state}` : ''}
          </p>
          {infoCud.dir && (
            <p className="text-white/30 text-xs mt-6">{infoCud.dir}</p>
          )}
        </div>
      </div>

      {/* Form panel — right side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[340px] space-y-8 animate-fade-in-up">
          {/* Mobile logo (visible only on small screens) */}
          <div className="lg:hidden text-center mb-6">
            {infoCud.icon ? (
              <img
                src={infoCud.icon}
                alt="Logo institucional"
                className="w-14 h-14 object-contain mx-auto mb-3 rounded-xl bg-primary/5 p-1"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-semibold text-primary-foreground">D</span>
              </div>
            )}
            <h1 className="text-base font-semibold text-foreground">{infoCud.name}</h1>
          </div>

          {/* Form heading */}
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Iniciar sesión</h2>
            <p className="text-[13px] text-muted-foreground/70 mt-1">
              Ingrese sus credenciales para continuar
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-all"
                placeholder="nombre@ejemplo.com"
                autoComplete="email"
                onChange={(e) => {
                  credentialsRef.current.email = e.target.value;
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-foreground">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
                onChange={(e) => {
                  credentialsRef.current.password = e.target.value;
                }}
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 w-full border-0 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-all duration-150 shadow-sm"
            >
              Iniciar sesión
            </button>

            <ReCAPTCHA
              ref={recaptchaRef}
              size="invisible"
              sitekey={import.meta.env.VITE_GOOGLE_CAPTCHA_HTML}
            />
          </form>

          {/* Footer branding */}
          <p className="text-center text-[10px] text-muted-foreground/40 pt-2">
            Powered by <span className="font-medium">Dovela</span>
          </p>
        </div>
      </div>
    </div>
  );
}

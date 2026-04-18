import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CustomsDataService from '@/app/services/custom.service';
import DataSerive from '@/app/services/data.service';
import { infoCud } from '@/app/components/jsons/vars';

const MySwal = withReactContent(Swal);

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
      MySwal.fire({
        title,
        text,
        footer,
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      });
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
    <div className="flex min-h-screen">
      {/* Brand panel — left side (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary via-primary to-primary/80 items-center justify-center p-12 relative overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full border-2 border-white -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full border border-white -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="text-center text-primary-foreground relative z-10">
          {/* Institution logo */}
          <div className="mb-8">
            {infoCud.icon ? (
              <img
                src={infoCud.icon}
                alt="Logo institucional"
                className="w-28 h-28 object-contain mx-auto mb-6 drop-shadow-xl rounded-2xl bg-white/15 backdrop-blur-sm p-3"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-semibold text-white">D</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{infoCud.name}</h1>
          <p className="text-primary-foreground/70 text-sm">
            {infoCud.city}{infoCud.state ? `, ${infoCud.state}` : ''}
          </p>
          {infoCud.dir && (
            <p className="text-primary-foreground/50 text-xs mt-4">{infoCud.dir}</p>
          )}
        </div>
      </div>

      {/* Form panel — right side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-[fadeInUp_0.4s_ease-out]">
          {/* Mobile logo (visible only on small screens) */}
          <div className="lg:hidden text-center mb-8">
            {infoCud.icon ? (
              <img
                src={infoCud.icon}
                alt="Logo institucional"
                className="w-16 h-16 object-contain mx-auto mb-4 rounded-xl bg-primary/5 p-1"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold text-primary-foreground">D</span>
              </div>
            )}
            <h1 className="text-lg font-semibold text-foreground">{infoCud.name}</h1>
          </div>

          {/* Form heading */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ingrese sus credenciales para continuar
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                placeholder="nombre@ejemplo.com"
                autoComplete="email"
                onChange={(e) => {
                  credentialsRef.current.email = e.target.value;
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
                onChange={(e) => {
                  credentialsRef.current.password = e.target.value;
                }}
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
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
          <p className="text-center text-xs text-muted-foreground pt-4">
            Powered by <span className="font-medium">Dovela</span>
          </p>
        </div>
      </div>
    </div>
  );
}

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
 * Login page — extracted from App.js.
 * Receives `useAuth` callbacks via props to avoid circular import of authContext.
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

  return (
    <div className="Login container py-3">
      <div className="row my-4 d-flex justify-content-center">
        <div className="col-lg-8 col-md-12">
          <h2 className="text-center my-4">
            INICIO DE SESI&Oacute;N {infoCud.name} DE {infoCud.city.toUpperCase()}
          </h2>
          <div className="d-flex justify-content-center mt-5">
            <div className="w-75 rounded">
              <div className="card-body" style={{ backgroundColor: '#d3d3d3' }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label text-black">
                      {t('login.str_user')}
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      onChange={(e) => {
                        credentialsRef.current.email = e.target.value;
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label text-black">
                      {t('login.str_pass')}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      onChange={(e) => {
                        credentialsRef.current.password = e.target.value;
                      }}
                    />
                  </div>
                  <div className="text-center pt-4 mt-3">
                    <button
                      type="submit"
                      className="btn text-white"
                      style={{ backgroundColor: '#2651A8' }}
                    >
                      {t('login.str_btn')}
                    </button>
                  </div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    size="invisible"
                    sitekey={import.meta.env.VITE_GOOGLE_CAPTCHA_HTML}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

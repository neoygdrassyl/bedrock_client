import './App.css';
import React, { useContext, createContext, useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

// Auth and Login
import CustomsDataService from "./services/custom.service";
import DataSerive from './services/data.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// Shell components (always loaded — visible on every page)
import Footer from './components/footer'
import Navbar1 from './components/navbar'

// Translations Services
import { useTranslation } from "react-i18next";
import "./translation/i18n";

// Dark Theme Services
import { StyleSheetManager, ThemeProvider } from 'styled-components'
import isPropValid from '@emotion/is-prop-valid'
// Color themes removed — dark mode handled by BS5 data-bs-theme attribute
import { fontZise1, fontZise2, fontZise3, fontZise4, fontZise5 } from './components/font';
import { GlobalStyles } from './components/global';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import ReCAPTCHA from 'react-google-recaptcha';
import { Nav, Navbar } from 'rsuite';
import { infoCud } from './components/jsons/vars';

// ── Lazy-loaded page components (code-split per route) ──────────────
const PQRSADMIN = lazy(() => import('./pages/user/pqrs/pqrsadmin'));
const Liquidator = lazy(() => import('./pages/liquidator/liquidator'));
const Dashboard = lazy(() => import('./pages/user/dashboard'));
const Publish = lazy(() => import('./pages/user/publish'));
const Seals = lazy(() => import('./pages/user/seal'));
const Appointments = lazy(() => import('./pages/user/appointments'));
const Mail = lazy(() => import('./pages/user/mail'));
const FUN = lazy(() => import('./pages/user/fun'));
const OSHA = lazy(() => import('./pages/user/osha'));
const NOMENCLATURE = lazy(() => import('./pages/user/nomenclature/nomenclature'));
const SUBMIT = lazy(() => import('./pages/user/submit/submit'));
const ARCHIVE = lazy(() => import('./pages/user/archive/archive.page'));
const DICTIONARY = lazy(() => import('./pages/user/dictionary.page'));
const FUN_MANAGE = lazy(() => import('./pages/user/funmanage.page'));
const FUN_MANAGE_NEW = lazy(() => import('./pages/user/funmanage_new.page'));
const PROFESIONALS = lazy(() => import('./pages/user/profesionals/profesionals.page'));
const GUIDE_USER = lazy(() => import('./pages/user/guide_user/guide_user.page'));
const DEV_GUIDE = lazy(() => import('./pages/user/dev_guide/dev_guide.page'));
const NORMS = lazy(() => import('./pages/user/norms/norms.page'));
const CERTIFICATE_WORKER = lazy(() => import('./pages/user/certifications/certification.page'));
const ZONE_USE = lazy(() => import('./pages/user/zone_use/zone_use.page'));
import LEGAL_FLOW_GUIDE from './pages/user/legal_flow_guide/LegalFlowGuide.page';


const MySwal = withReactContent(Swal);

// ── Loading fallback for Suspense ───────────────────────────────────
function LoadingFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '40vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando módulo...</p>
      </div>
    </div>
  );
}

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Route subtree error captured:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='container py-4'>
          <div className='alert alert-danger'>
            <h4 className='mb-2'>Error en este modulo</h4>
            <p className='mb-2'>La vista actual presento un error y se detuvo para evitar una pantalla en blanco.</p>
            <p className='mb-0'><a href='/dashboard'>Volver al panel</a></p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function RoutesWithBoundary({ children }) {
  const location = useLocation();
  return <RouteErrorBoundary key={location.pathname}>{children}</RouteErrorBoundary>;
}

export default function App() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState(3);
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-bs-theme', next);
  }
  const changeFontsizePlus = () => {
    if (font >= 1 && font < 5) {
      setFont(font + 1);
    }
  }
  const changeFontsizeMinus = () => {
    if (font > 1 && font <= 5) {
      setFont(font - 1);
    }
  }


  return (
    <ProvideAuth>
      <Router>
        <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
          <ThemeProvider theme={font === 5 ? fontZise5 : font === 4 ? fontZise4 : font === 3 ? fontZise3 : font === 2 ? fontZise2 : fontZise1} >
            <>
              <GlobalStyles />
              <div className="App">
                {/* <BtnAccesibiity theme={theme} font={font} toggleTheme={toggleTheme}
                  changeFontsizePlus={changeFontsizePlus} changeFontsizeMinus={changeFontsizeMinus}
                  style={{ position: 'relative', zIndex: '3' }} /> */}
                {/* <BtnStart /> */}
                {/* <BtnChat translation={t("misc.btn_chat", { returnObjects: true })} /> */}
                <div className="app-navbar-fixed">
                  <NavbarWithAuth
                  toggleTheme={toggleTheme}
                  changeFontsizePlus={changeFontsizePlus}
                  changeFontsizeMinus={changeFontsizeMinus} />
                </div>

                <main className="app-main" id="main-content">              
                    <div className="bg-image-gr">
                      <div id="overlayer" className="container-fluid overlay-container container-primary p-2">
                        
                        {/* <Route render={(props) => (
                          <Title {...props} translation={t("title", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })} />
                        )} /> */}
                        {/* <div className="sticky-top" style={{ zIndex: 2000 }}>
                          <Navbar1 authBtn={<AuthButton />} />
                        </div> */}
                        <Suspense fallback={<LoadingFallback />}>
                        <RoutesWithBoundary>
                        <Routes>

                          <Route path='/home' element={
                              <LoginPage
                                translation={t("login", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            }
                          />

                          <Route path='/login' element={
                              <LoginPage
                                translation={t("login", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            }
                          />


                          <Route path='/dashboard' element={
                            <PrivateRoute>
                              <Dashboard translation={t("title", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                theme={theme}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/publish' element={
                            <PrivateRoute>
                              <Publish translation={t("title", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/seals' element={
                            <PrivateRoute>
                              <Seals translation={t("title", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/appointments' element={
                            <PrivateRoute>
                              <Appointments translation={t("scheduling.scheduling", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/mail' element={
                            <PrivateRoute>
                              <Mail translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/fun' element={
                            <PrivateRoute>
                              <FUN
                                translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/funmanage' element={
                            <PrivateRoute>
                              <FUN_MANAGE
                                translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/funmanage-new' element={
                            <PrivateRoute>
                              <FUN_MANAGE_NEW
                                translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/legal-flow-guide' element={
                            <PrivateRoute>
                              <LEGAL_FLOW_GUIDE />
                            </PrivateRoute>
                          } />
                          <Route path='/pqrsadmin' element={
                            <PrivateRoute>
                              <PQRSADMIN translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation_form={t("transparency.pqrs_form", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/osha' element={
                            <PrivateRoute>
                              <OSHA translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation_form={t("transparency.pqrs_form", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/nomenclature' element={
                            <PrivateRoute>
                              <NOMENCLATURE translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation_form={t("transparency.pqrs_form", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/submit' element={
                            <PrivateRoute>
                              <SUBMIT translation={t("title", { returnObjects: true })}
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/calculator' element={
                            <PrivateRoute>
                              <Liquidator
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation={t("liquidator.liquidator", { returnObjects: true })}
                                versioni={'2024'} hideInfo useSelector
                              />
                            </PrivateRoute>
                          } />
                          <Route path='/archive' element={
                            <PrivateRoute>
                              <ARCHIVE
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation={t("liquidator.liquidator", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />

                          <Route path='/dictionary' element={
                            <PrivateRoute>
                              <DICTIONARY
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation={t("liquidator.liquidator", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />


                          <Route path='/profesionals' element={
                            <PrivateRoute>
                              <PROFESIONALS
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation={t("liquidator.liquidator", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />

                          <Route path='/guide_user' element={
                            <PrivateRoute>
                              <GUIDE_USER
                                globals={t("globals", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                                translation={t("liquidator.liquidator", { returnObjects: true })}
                              />
                            </PrivateRoute>
                          } />

                          <Route path='/dev-guide' element={
                            <DEV_GUIDE
                              globals={t("globals", { returnObjects: true })}
                              swaMsg={t("swa_messages", { returnObjects: true })}
                              breadCrums={t("breadCrums", { returnObjects: true })}
                              translation={t("liquidator.liquidator", { returnObjects: true })}
                            />
                          } />


                          <Route path='/norms' element={
                              <NORMS
                                translation={t("login", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            }
                          />


                          <Route path='/certs' element={
                              <CERTIFICATE_WORKER
                                translation={t("login", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            }
                          />

                           <Route path='/zone_use' element={
                              <ZONE_USE
                                translation={t("login", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            }
                          />


                          <Route path='/' element={
                              <LoginPage
                                translation={t("login", { returnObjects: true })}
                                swaMsg={t("swa_messages", { returnObjects: true })}
                                breadCrums={t("breadCrums", { returnObjects: true })}
                              />
                            }
                          />

                          <Route path='*' element={<LoginPage />} />
                        </Routes>
                        </RoutesWithBoundary>
                        </Suspense>
                      </div>
                    </div>
                </main>
                <Footer id="footer-app-main" translation={t("footer", { returnObjects: true })} />
              </div>
            </>
          </ThemeProvider>
        </StyleSheetManager>
      </Router>
    </ProvideAuth>
  );
}

const fakeAuth = {
  isAuthenticated: false,
  signin(cb) {
    fakeAuth.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    fakeAuth.isAuthenticated = false;
    setTimeout(cb, 100);
  }
};

const authContext = createContext();

function NavbarWithAuth({ toggleTheme, changeFontsizePlus, changeFontsizeMinus }) {
  const auth = useAuth();
  const { t } = useTranslation();

  return (
    <Navbar1
      authBtn={<AuthButton />}
      isLoggedIn={!!auth.user}
      roleShort={auth.user?.role_short}
      toggleTheme={toggleTheme}
      changeFontsizePlus={changeFontsizePlus}
      changeFontsizeMinus={changeFontsizeMinus}
      chatLabel={t('misc.btn_chat')}
    />
  );
}

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return {
    user,
    signin,
    signout
  };
}
const MyLink = ({ href, as, children, ref, ...rest }) => (
  <Link
    ref={ref}
    to={href}
    {...rest}
    style={{ color: 'var(--bs-body-color)', textDecoration: 'none' }}
  >
    {children}
  </Link>
);
function AuthButton() {
  const navigate = useNavigate();
  let auth = useAuth();

  return auth.user ? (
    <div className='px-2'>
      <Nav pullRight className='px-2 mx-4'>
        <Nav.Menu title={<label><i className="fas fa-user-circle "></i> <label >{auth.user.name + ' ' + auth.user.surname}</label></label>} >
          <Nav.Item eventKey="5" as={MyLink} href="/dashboard"><i className="fas fa-tv"></i> Panel de Control</Nav.Item>
          <hr className='bg-info'></hr>
          <Nav.Item eventKey="6" as={MyLink} href="/mail"><i className="fas fa-envelope-open-text" style={{ "color": "Crimson" }}></i> Buzón de mensajes</Nav.Item>
          <Nav.Item eventKey="7" as={MyLink} href="/appointments"><i className="far fa-calendar-alt" style={{ "color": "MediumSeaGreen" }}></i> Calendario de citas</Nav.Item>
          <Nav.Item eventKey="8" as={MyLink} href="/submit"> <i className="fas fa-file-import" style={{ "color": "Khaki" }}></i> Ventanilla única</Nav.Item>
          <hr className='bg-info'></hr>
          <Nav.Item eventKey="9" as={MyLink} href="/publish"><i className="fas fa-newspaper" style={{ "color": "LightSalmon" }}></i> Publicaciones</Nav.Item>
          <Nav.Item eventKey="10" as={MyLink} href="/fun"><i className="fas fa-file-alt" style={{ "color": "DodgerBlue" }}></i> Solicitudes y Licencias</Nav.Item>
          <Nav.Item eventKey="10" as={MyLink} href="/funmanage"><i className="fas fa-file-alt" style={{ "color": "DodgerBlue" }}></i> Gestion Soli. y Lic.</Nav.Item>
          <Nav.Item eventKey="10a" as={MyLink} href="/funmanage-new"><i className="fas fa-layer-group" style={{ "color": "DodgerBlue" }}></i> Gestion Lic. Nuevo</Nav.Item>
          <Nav.Item eventKey="11" as={MyLink} href="/nomenclature"><i className="fas fa-file-signature" style={{ "color": "Plum" }}></i> Nomenclaturas</Nav.Item>
          <Nav.Item eventKey="12" as={MyLink} href="/pqrsadmin"><i className="fas fa-file-invoice" style={{ "color": "MediumPurple" }}></i>  Peticiones PQRS</Nav.Item>
          <hr className='bg-info'></hr>
          <Nav.Item eventKey="13" onClick={() => {
            auth.signout(() => navigate("/home"));
          }}> Log out <i className="fas fa-sign-out-alt"></i></Nav.Item>
        </Nav.Menu>
      </Nav>
    </div>
  ) : (
    <Nav pullRight>
      <Nav.Item eventKey="" as={MyLink} href="/login"><i className="fas fa-sign-in-alt px-1"></i> Login</Nav.Item>
      <Navbar.Brand> </Navbar.Brand>
    </Nav>
  );
}

function PrivateRoute({ children }) {
  let auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  let auth = useAuth();
  const recaptchaRef = React.useRef(null);
  const credentialsRef = React.useRef({ email: "", password: "" });

  let { from } = { from: { pathname: "/dashboard" } };

  let handleSubmit = (event) => {
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

    recaptchaRef.current.execute().then(response => {
      CustomsDataService.appLoginCompatible(credentialsRef.current)
        .then(response => {
          let userInfo = {};

          if (response.data.token && response.data.user) {
            // JWT format: { token, user: { ..., Role: { name, desc, short } } }
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
            userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
            DataSerive.saveToken(response.data.token);
            DataSerive.setUser(userInfo);
            login();
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
            userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
            DataSerive.setUser(userInfo);
            login();
          } else {
            showAuthError({
              title: 'CERTIFICACION FALLIDA',
              text: 'Respuesta de autenticación inválida',
              footer: 'El servidor respondió sin token o sin datos de usuario',
            });
          }
        })
        .catch(e => {
          console.log('[AUTH] Login error', e);

          if (!e.response) {
            showAuthError({
              title: 'ERROR DE CONEXION',
              text: 'No fue posible conectar con el servidor',
              footer: 'Verifique que el backend esté en línea y VITE_API_URL apunte correctamente',
            });
            return;
          }

          if (e.response.status === 401) {
            showAuthError({
              title: 'CREDENCIALES INVALIDAS',
              text: 'Usuario o contraseña incorrectos',
              footer: 'Revise sus credenciales e intentelo nuevamente',
            });
            return;
          }

          showAuthError({
            title: 'ERROR EN EL SERVIDOR',
            text: 'No fue posible iniciar sesión en este momento',
            footer: 'Intente nuevamente o contacte al administrador',
          });
        });
    }).catch(e => {
      console.log(e);
    });;


  };

  let login = () => {
    auth.signin(() => {
      navigate(from, { replace: true });
    });
  };


  return (
    <div className="Login container py-3">
      <div className="row my-4 d-flex justify-content-center">
        <div className="col-lg-8 col-md-12">
          <h2 className="text-center my-4">INICIO DE SESIÓN {infoCud.name} DE {infoCud.city.toUpperCase()}</h2>
          <div className="d-flex justify-content-center mt-5">
            <div className="w-75 rounded">
              <div className="card-body" style={{backgroundColor: '#d3d3d3'}}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label text-black">{t('login.str_user')}</label>
                    <input type="email" className="form-control" id="email"
                      onChange={(e) => { credentialsRef.current.email = e.target.value; }} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label text-black">{t('login.str_pass')}</label>
                    <input type="password" className="form-control" id="password"
                      onChange={(e) => { credentialsRef.current.password = e.target.value; }} />
                  </div>
                  <div className="text-center pt-4 mt-3">
                    <button type="submit" className="btn text-white" style={{ backgroundColor: '#2651A8' }}>{t('login.str_btn')}</button>
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

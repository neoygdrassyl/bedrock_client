import './App.css';
import React, { useContext, createContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

// PQRS
import PQRSADMIN from './pages/user/pqrs/pqrsadmin'


// Pages -> Liquidator
import Liquidator from './pages/liquidator/liquidator'


// Atuh and Login
//import Login from './pages/user/login'
import CustomsDataService from "./services/custom.service";
import DataSerive from './services/data.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


// Users and APP
import Dashboard from './pages/user/dashboard'
import Publish from './pages/user/publish'
import Seals from './pages/user/seal'
import Appointments from './pages/user/appointments'
import Mail from './pages/user/mail'
import FUN from './pages/user/fun'
import OSHA from './pages/user/osha'
import NOMENCLATURE from './pages/user/nomenclature/nomenclature';
import SUBMIT from './pages/user/submit/submit';
import ARCHIVE from './pages/user/archive/archive.page';
import DICTIONARY from './pages/user/dictionary.page';
import FUN_MANAGE from './pages/user/funmanage.page';

// Components
import Footer from './components/footer'
//import Title from './components/title'
import Navbar1 from './components/navbar'
import BtnStart from './components/btnStart'
import BtnChat from './components/btnChat'
import BtnAccesibiity from './components/btnAccesibility'

// Translations Services
import { useTranslation } from "react-i18next";
import "./translation/i18n";

// Dark Theme Services
import { ThemeProvider } from 'styled-components'
import { lightTheme, darkTheme } from './components/theme';
import { fontZise1, fontZise2, fontZise3, fontZise4, fontZise5 } from './components/font';
import { GlobalStyles } from './components/global';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import ReCAPTCHA from 'react-google-recaptcha';
import { Nav, Navbar } from 'rsuite';
import PROFESIONALS from './pages/user/profesionals/profesionals.page';
import GUIDE_USER from './pages/user/guide_user/guide_user.page';
import DEV_GUIDE from './pages/user/dev_guide/dev_guide.page';
import { infoCud } from './components/jsons/vars';
import NORMS from './pages/user/norms/norms.page';
import CERTIFICATE_WORKER from './pages/user/certifications/certification.page';
import ZONE_USE from './pages/user/zone_use/zone_use.page';


const MySwal = withReactContent(Swal);

export default function App() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState(3);
  const toggleTheme = () => {
    theme === 'light' ? setTheme('dark') : setTheme('light')
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
        <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme} font={font === 5 ? fontZise1 : fontZise2}>
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
                    <div class="bg-image-gr">
                      <div id="overlayer" className="container-fluid overlay-container container-primary p-2">
                        
                        {/* <Route render={(props) => (
                          <Title {...props} translation={t("title", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })} />
                        )} /> */}
                        {/* <div className="sticky-top" style={{ zIndex: 2000 }}>
                          <Navbar1 authBtn={<AuthButton />} />
                        </div> */}
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
                      </div>
                    </div>
                </main>
                <Footer id="footer-app-main" translation={t("footer", { returnObjects: true })} />
              </div>
            </>
          </ThemeProvider>
        </ThemeProvider>
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
    if (DataSerive.restoreSession && DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    if (DataSerive.getUserData() != null) {
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
const MyLink = React.forwardRef(({ href, as, children, ...rest }, ref) => (
  <Link
    ref={ref}
    to={href}
    {...rest}
    style={{ color: '#575757', textDecoration: 'none' }}
  >
    {children}
  </Link>
));
function AuthButton() {
  const navigate = useNavigate();
  let auth = useAuth();

  return auth.user ? (
    <div className='px-2'>
      <Nav pullRight className='px-2 mx-4'>
        <Nav.Menu title={<label><i class="fas fa-user-circle "></i> <label >{auth.user.name + ' ' + auth.user.surname}</label></label>} >
          <Nav.Item eventKey="5" as={MyLink} href="/dashboard"><i class="fas fa-tv"></i> Panel de Control</Nav.Item>
          <hr className='bg-info'></hr>
          <Nav.Item eventKey="6" as={MyLink} href="/mail"><i class="fas fa-envelope-open-text" style={{ "color": "Crimson" }}></i> Buzón de mensajes</Nav.Item>
          <Nav.Item eventKey="7" as={MyLink} href="/appointments"><i class="far fa-calendar-alt" style={{ "color": "MediumSeaGreen" }}></i> Calendario de citas</Nav.Item>
          <Nav.Item eventKey="8" as={MyLink} href="/submit"> <i class="fas fa-file-import" style={{ "color": "Khaki" }}></i> Ventanilla única</Nav.Item>
          <hr className='bg-info'></hr>
          <Nav.Item eventKey="9" as={MyLink} href="/publish"><i class="fas fa-newspaper" style={{ "color": "LightSalmon" }}></i> Publicaciones</Nav.Item>
          <Nav.Item eventKey="10" as={MyLink} href="/fun"><i class="fas fa-file-alt" style={{ "color": "DodgerBlue" }}></i> Solicitudes y Licencias</Nav.Item>
          <Nav.Item eventKey="10" as={MyLink} href="/funmanage"><i class="fas fa-file-alt" style={{ "color": "DodgerBlue" }}></i> Gestion Soli. y Lic.</Nav.Item>
          <Nav.Item eventKey="11" as={MyLink} href="/nomenclature"><i class="fas fa-file-signature" style={{ "color": "Plum" }}></i> Nomenclaturas</Nav.Item>
          <Nav.Item eventKey="12" as={MyLink} href="/pqrsadmin"><i class="fas fa-file-invoice" style={{ "color": "MediumPurple" }}></i>  Peticiones PQRS</Nav.Item>
          <hr className='bg-info'></hr>
          <Nav.Item eventKey="13" onClick={() => {
            auth.signout(() => navigate("/home"));
          }}> Log out <i class="fas fa-sign-out-alt"></i></Nav.Item>
        </Nav.Menu>
      </Nav>
    </div>
  ) : (
    <Nav pullRight>
      <Nav.Item eventKey="" as={MyLink} href="/login"><i class="fas fa-sign-in-alt px-1"></i> Login</Nav.Item>
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
  let sha256 = require('js-sha256');
  const { t } = useTranslation();
  const navigate = useNavigate();
  let auth = useAuth();
  const recaptchaRef = React.createRef();
  var formData = new FormData();

  let { from } = { from: { pathname: "/dashboard" } };

  let handleSubmit = (event) => {
    event.preventDefault();

    recaptchaRef.current.execute().then(response => {
      CustomsDataService.appLogin(formData)
        .then(response => {
            let userInfo = {};
            if (response.data && response.data.token && response.data.user) {
              const u = response.data.user;
              const role = u.Role || u.role || {};
              userInfo.name = u.name;
              userInfo.surname = u.surname;
              userInfo.role = role.name || u.role;
              userInfo.role_short = role.short || u.role_short;
              userInfo.roleDesc = role.desc || u.roleDesc;
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
              userInfo.role = u.role.name;
              userInfo.role_short = u.role.short;
              userInfo.roleDesc = u.role.desc;
              userInfo.active = u.active;
              userInfo.roleId = u.roleId;
              userInfo.id = u.id;
              userInfo.name_short = u.name + ' ' + u.surname;
              userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
              
              DataSerive.setUser(userInfo);
              login();
            } else {
              MySwal.fire({
                title: <h2>CERTIFICACION FALLIDA</h2>,
                text: 'Hubo un error de acceso a la aplicación',
                footer: 'Revise sus credenciales e intentelo nuevamente',
                icon: 'error',
                confirmButtonText: 'CONTINUAR',
              })
            }
          })
          .catch(e => {
            console.log(e);
            MySwal.fire({
              title: <h2>CERTIFICACION FALLIDA</h2>,
              text: 'Credenciales inválidas o error de conexión',
              footer: 'Revise sus credenciales e intentelo nuevamente',
              icon: 'error',
              confirmButtonText: 'CONTINUAR',
            })
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
              <div class="card-body" style={{backgroundColor: '#d3d3d3'}}>
                <form onSubmit={handleSubmit}>
                  <div class="mb-3">
                    <label for="email" class="form-label text-black">{t('login.str_user')}</label>
                    <input type="email" class="form-control" id="email"
                      onChange={(e) => formData.set('email', e.target.value)} />
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label text-black">{t('login.str_pass')}</label>
                    <input type="password" class="form-control" id="password"
                      onChange={(e) => formData.set('password', sha256(e.target.value))} />
                  </div>
                  <div className="text-center pt-4 mt-3">
                    <button type="submit" class="btn text-white" style={{ backgroundColor: '#2651A8' }}>{t('login.str_btn')}</button>
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

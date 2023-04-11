import './App.css';
import React, { useContext, createContext, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
  Link,
  useParams,
} from "react-router-dom";

import {
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
  MDBDropdownDivider,
  MDBDropdownLink,
  MDBBtn,
} from 'mdb-react-ui-kit';

// Pages
import Home from './pages/home'

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
import MainApp from './pages/user/fun_forms/sideBar'
import OSHA from './pages/user/osha'
import NOMENCLATURE from './pages/user/nomenclature/nomenclature';
import SUBMIT from './pages/user/submit/submit';
import ARCHIVE from './pages/user/archive/archive.page';
import DICTIONARY from './pages/user/dictionary.page';
import FUN_MANAGE from './pages/user/funmanage.page';

// Components
import Footer from './components/footer'
import Title from './components/title'
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


import ReCAPTCHA from 'react-google-recaptcha';
import { Nav, Navbar } from 'rsuite';
import PROFESIONALS from './pages/user/profesionals/profesionals.page';
import GUIDE_USER from './pages/user/guide_user/guide_user.page';
import { infoCud } from './components/jsons/vars';


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
        <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme} font={font == 5 ? fontZise1 : fontZise2}>
          <ThemeProvider theme={font === 5 ? fontZise5 : font === 4 ? fontZise4 : font === 3 ? fontZise3 : font === 2 ? fontZise2 : fontZise1} >
            <>
              <GlobalStyles />
              <div className="App">
                <BtnAccesibiity theme={theme} font={font} toggleTheme={toggleTheme}
                  changeFontsizePlus={changeFontsizePlus} changeFontsizeMinus={changeFontsizeMinus}
                  style={{ position: 'relative', zIndex: '3' }} />
                <BtnStart />
                <BtnChat translation={t("misc.btn_chat", { returnObjects: true })} />
                <div class="bg-image">
                  <div class="bg-image-gr">
                    <div class="container container-primary p-0">
                      <Route render={(props) => (
                        <Title {...props} translation={t("title", { returnObjects: true })}
                          swaMsg={t("swa_messages", { returnObjects: true })}
                          breadCrums={t("breadCrums", { returnObjects: true })} />
                      )} />
                      <Navbar1
                        authBtn={<AuthButton />}
                      />
                      <Switch>

                        <Route path='/home'
                          render={(props) => (
                            <LoginPage {...props}
                              translation={t("login", { returnObjects: true })}
                              swaMsg={t("swa_messages", { returnObjects: true })}
                              breadCrums={t("breadCrums", { returnObjects: true })}
                            />
                          )}
                        />

                        

                        <Route path='/login'
                          render={(props) => (
                            <LoginPage {...props}
                              translation={t("login", { returnObjects: true })}
                              swaMsg={t("swa_messages", { returnObjects: true })}
                              breadCrums={t("breadCrums", { returnObjects: true })}
                            />
                          )}
                        />
                       

                        <PrivateRoute path='/dashboard'>
                          <Dashboard translation={t("title", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            theme={theme}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/publish'>
                          <Publish translation={t("title", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/seals'>
                          <Seals translation={t("title", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/appointments'>
                          <Appointments translation={t("scheduling.scheduling", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/mail'>
                          <Mail translation={t("title", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/fun'>
                          <FUN
                            translation={t("title", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/funmanage'>
                          <FUN_MANAGE
                            translation={t("title", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/pqrsadmin'>
                          <PQRSADMIN translation={t("title", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation_form={t("transparency.pqrs_form", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/osha'>
                          <OSHA translation={t("title", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation_form={t("transparency.pqrs_form", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/nomenclature'>
                          <NOMENCLATURE translation={t("title", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation_form={t("transparency.pqrs_form", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/submit'>
                          <SUBMIT translation={t("title", { returnObjects: true })}
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/calculator'>
                          <Liquidator
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation={t("liquidator.liquidator", { returnObjects: true })}
                            versioni={'2023'} hideInfo useSelector
                          />
                        </PrivateRoute>
                        <PrivateRoute path='/archive'>
                          <ARCHIVE
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation={t("liquidator.liquidator", { returnObjects: true })}
                          />
                        </PrivateRoute>

                        <PrivateRoute path='/dictionary'>
                          <DICTIONARY
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation={t("liquidator.liquidator", { returnObjects: true })}
                          />
                        </PrivateRoute>


                        <PrivateRoute path='/profesionals'>
                          <PROFESIONALS
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation={t("liquidator.liquidator", { returnObjects: true })}
                          />

                        </PrivateRoute>

                        <PrivateRoute path='/guide_user'>
                          <GUIDE_USER
                            globals={t("globals", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                            translation={t("liquidator.liquidator", { returnObjects: true })}
                          />
                        </PrivateRoute>

                        <Route exact path='/'
                          render={(props) => (
                            <LoginPage {...props}
                            translation={t("login", { returnObjects: true })}
                            swaMsg={t("swa_messages", { returnObjects: true })}
                            breadCrums={t("breadCrums", { returnObjects: true })}
                          />
                          )}
                        />
                        <Route path='*' exact={true} component={LoginPage} />
                      </Switch>
                      <Footer translation={t("footer", { returnObjects: true })} />
                    </div>
                  </div>
                </div>
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
  const [user, setUser] = useState(null);

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
const MyLink = React.forwardRef((props, ref) => {
  const { href, as, ...rest } = props;
  return (
    <Link style={{ color: '#575757', textDecoration: 'none' }} to={href} as={as}>
      <a {...rest} />
    </Link>
  );
});
function AuthButton() {
  let history = useHistory();
  let auth = useAuth();
  let params = useParams();

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
          <Nav.Item eventKey="11" as={MyLink} href="/nomenclature"><i class="fas fa-file-signature" style={{ "color": "Plum" }}></i> Nomenclaturas</Nav.Item>
          <Nav.Item eventKey="12" as={MyLink} href="/pqrsadmin"><i class="fas fa-file-invoice" style={{ "color": "MediumPurple" }}></i>  Peticiones PQRS</Nav.Item>
          <hr className='bg-info'></hr>
          <Nav.Item eventKey="13" onClick={() => {
            auth.signout(() => history.push("/home"));
          }}> Log out <i class="fas fa-sign-out-alt"></i></Nav.Item>
        </Nav.Menu>
      </Nav>
    </div>
  ) : (
    <Nav pullRight>
      <Nav.Item eventKey="" as={MyLink} href="/login"><i class="fas fa-sign-in-alt px-1"></i> Login</Nav.Item>
      <Navbar.Brand href="#"> </Navbar.Brand>
    </Nav>
  );
}

function PrivateRoute({ children, ...rest }) {
  let auth = useAuth();
  const { t } = useTranslation();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
              translation: t("login", { returnObjects: true })
            }}
          />
        )
      }
    />
  );
}

function LoginPage() {
  let sha256 = require('js-sha256');
  const { t } = useTranslation();
  let history = useHistory();
  let location = useLocation();
  let auth = useAuth();
  const recaptchaRef = React.createRef();

  let credentials = {
    email: '',
    password: '',
  }
  var formData = new FormData();

  let { from } = { from: { pathname: "/dashboard" } };

  let handleSubmit = (event) => {
    event.preventDefault();

    recaptchaRef.current.execute().then(response => {
      CustomsDataService.appLogin(formData)
        .then(response => {
          if (response.data.length == 1) {
            let userInfo = {};
            userInfo.name = response.data[0].name;
            userInfo.surname = response.data[0].surname;
            userInfo.role = response.data[0].role.name;
            userInfo.role_short = response.data[0].role.short;
            userInfo.roleDesc = response.data[0].role.desc;
            userInfo.active = response.data[0].active;
            userInfo.roleId = response.data[0].roleId;
            userInfo.id = response.data[0].id;
            userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
            userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
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
        });
    }).catch(e => {
      console.log(e);
    });;


  };

  let login = () => {
    auth.signin(() => {
      history.replace(from);
    });
  };


  return (
    <div className="Login">
      <div className="row my-4 d-flex justify-content-center">
        <div className="col-lg-8 col-md-12">
          <h2 className="text-center my-4">INICIO DE SESIÓN {infoCud.nomens} DE {infoCud.city.toUpperCase()}</h2>
          <div className="d-flex justify-content-center">
            <div className="bg-card w-50">
              <div class="card-body">
                <form onSubmit={handleSubmit}>
                  <div class="mb-3">
                    <label for="email" class="form-label">{t('login.str_user')}</label>
                    <input type="email" class="form-control" id="email"
                      onChange={(e) => formData.set('email', e.target.value)} />
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">{t('login.str_pass')}</label>
                    <input type="password" class="form-control" id="password"
                      onChange={(e) => formData.set('password', sha256(e.target.value))} />
                  </div>
                  <div className="text-center py-4 mt-3">
                    <button type="submit" class="btn text-white" style={{ backgroundColor: '#2651A8' }}>{t('login.str_btn')}</button>
                  </div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    size="invisible"
                    sitekey={process.env.REACT_APP_GOOGLE_CAPTCHA_HTML}
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

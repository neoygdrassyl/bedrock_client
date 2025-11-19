import React, { useState, useEffect } from 'react';
import { Navbar, Nav } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Title from './title';
import { useTranslation } from 'react-i18next';
import '../translation/i18n';

export default function Navbar1(props) {
  const {
    authBtn,
    isLoggedIn = false,
    roleShort,                         // ej: "ADMIN" | "AUX" | "USER"
    // handlers para los botones de ayuda en navbar
    toggleTheme,
    changeFontsizePlus,
    changeFontsizeMinus,
    chatLabel = 'Chat'
  } = props;

  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  // Sidebar
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // ================= Módulos (ids únicos) =================
  const workModulesBase = [
    { id: 'dashboard',    name: 'Panel Control',   icon: 'fas fa-tv',                 href: '/dashboard',    color: '#2651A8' },
    { id: 'mail',         name: 'Buzón Mensajes',  icon: 'fas fa-envelope-open-text', href: '/mail',         color: '#DC143C' },
    { id: 'appointments', name: 'Calendario',      icon: 'far fa-calendar-alt',       href: '/appointments', color: '#3CB371' },
    { id: 'submit',       name: 'Ventanilla Única',icon: 'fas fa-file-import',        href: '/submit',       color: '#DAA520' },
    { id: 'publish',      name: 'Publicaciones',   icon: 'fas fa-newspaper',          href: '/publish',      color: '#FFA07A' },
    { id: 'pqrs',         name: 'PQRS',            icon: 'fas fa-file-invoice',       href: '/pqrsadmin',    color: '#9370DB' },
    // { id: 'nomenclature', name: 'Nomenclaturas',   icon: 'fas fa-file-signature',     href: '/nomenclature', color: '#DDA0DD' },
    { id: 'archive',      name: 'Archivo',         icon: 'fas fa-folder-open',        href: '/archive',      color: '#CD853F' },
    { id: 'fun',          name: 'Solicitudes',     icon: 'fas fa-file-alt',           href: '/fun',          color: '#1E90FF' },
    { id: 'funmanage',    name: 'Gestión Solic.',  icon: 'fas fa-folder',             href: '/funmanage',    color: '#4169E1' },
  ];

  const workModulesSpecific = [
    { id: 'norm',         name: 'Norm. Urbanas',   icon: 'fas fa-home',               href: '/norms',        color: '#008B8B' },
  ];

  const workModules = [...workModulesBase, ...workModulesSpecific];

  // ============== Visibilidad por rol ==============
  const allowByRole = {
    ADMIN: ['dashboard','mail','appointments','submit','publish','pqrs','nomenclature','archive','fun','funmanage','norm'],
    AUX:   ['dashboard','appointments','pqrs','fun','funmanage','norm'],
    USER:  ['dashboard','appointments','submit','pqrs','norm'],
  };
  const allowedIds = roleShort ? allowByRole[roleShort.toUpperCase()] : null;
  const visibleModules = allowedIds
    ? workModules.filter(m => allowedIds.includes(m.id))
    : workModules;

  useEffect(() => {
    if (isLoggedIn && sidebarExpanded) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setSidebarExpanded(false);
      document.body.classList.remove('sidebar-expanded');
      document.body.classList.add('no-auth');
    } else {
      document.body.classList.remove('no-auth');
    }
    return () => {
      document.body.classList.remove('sidebar-expanded');
      document.body.classList.remove('no-auth');
    };
  }, [isLoggedIn]);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (window.innerWidth <= 768) setSidebarExpanded(false);
  }, [location.pathname]);

  // Link sin anidar <a>
  const MyLink = React.forwardRef(({ href, as, children, ...rest }, ref) => (
    <Link ref={ref} to={href} {...rest} style={{ color: '#575757', textDecoration: 'none' }}>
      {children}
    </Link>
  ));

  const handleSidebarToggle = () => setSidebarExpanded(v => !v);

  const handleModuleClick = (href) => {
    history.push(href);
    if (window.innerWidth <= 768) setSidebarExpanded(false);
  };

  const isActiveRoute = (href) => location.pathname === href;

  // ================= Render =================
  const NavBarInstance = ({ onSelect, activeKey, ...props }) => {
    return (
      <>
        {/* SIDEBAR solo con sesión */}
        {isLoggedIn && (
          <>
            <div className={`work-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
              <div style={{ padding: '0' }}>
                {visibleModules.map((module) => {
                  const isActive = isActiveRoute(module.href);
                  return (
                    <div
                      key={`${module.id}-${module.href}`}
                      className={`module-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleModuleClick(module.href)}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span className="module-icon">
                        <i
                          className={module.icon}
                          style={{
                            color: isActive ? '#2651A8' : module.color
                          }}
                        />
                      </span>
                      <span
                        className="module-name"
                        style={{
                          color: isActive ? '#2651A8' : '#495057',
                          fontWeight: isActive ? 600 : 500
                        }}
                      >
                        {module.name}
                      </span>

                      {/* Tooltip en modo colapsado */}
                      {!sidebarExpanded && (
                        <div
                          className="module-tooltip"
                          style={{
                            position: 'absolute',
                            left: '4.0625rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: '#333',
                            color: '#fff',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            opacity: 0,
                            visibility: 'hidden',
                            transition: 'opacity 0.2s ease, visibility 0.2s ease',
                            zIndex: 1060,
                            pointerEvents: 'none'
                          }}
                        >
                          {module.name}
                          <div
                            style={{
                              content: '""',
                              position: 'absolute',
                              left: '-0.3125rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: '0.3125rem solid transparent',
                              borderRightColor: '#333'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overlay móvil */}
            <div
              className={`sidebar-overlay ${sidebarExpanded && window.innerWidth <= 768 ? 'active' : ''}`}
              onClick={() => setSidebarExpanded(false)}
            />
          </>
        )}

        {/* NAVBAR superior (siempre visible) */}
        <Navbar {...props} className="app-navbar" style={{ backgroundColor: '##F7F7FA' }}>
          {/* MUY IMPORTANTE: evitar <a> para no anidar con Title */}
          <Navbar.Brand as="div"
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              color: 'inherit',
              gap: '0.625rem',
              paddingLeft: 0,
            }}
          >
            {isLoggedIn && (
              <div
                onClick={handleSidebarToggle}
                className="sidebar-toggle-btn"
                aria-label="Abrir/Cerrar menú lateral"
                title={sidebarExpanded ? t('Cerrar menú') : t('Abrir menú')}
              >
                <i className={`fas ${sidebarExpanded ? 'fa-times' : 'fa-bars'}`} />
              </div>
            )}

            {/* Logo */}
            <img
              src="/favicon.ico"
              alt="logo"
              style={{ width: '2.25rem', height: '2.25rem', display: 'block', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: 'clamp(0.84rem, 1.42vw, 0.90rem)', fontWeight: 600 }}>
              Dovela
            </span>
            <span style={{ fontSize: 'clamp(0.64rem, 1.22vw, 0.70rem)', fontWeight: 500, opacity: 0.8 }}>
              v 1.9.0
            </span>
          </div>

            {/* Separador vertical */}
            <span aria-hidden="true" style={{ width: 1, height: '1.25rem', background: '#000', opacity: 0.75 }} />

            {/* Título compacto */}
            <div style={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 'clamp(11.25rem, 28vw, 32.5rem)'
                }}
              >
                <Title variant="navbar" />
              </div>
            </div>
          </Navbar.Brand>

          {/* Acciones a la derecha: WhatsApp + accesibilidad + perfil */}
          <Nav pullRight className="nav-right">
            {/* Cajón/box de usabilidad */}
            <div className="nav-ux-group" role="group" aria-label="Accesibilidad y ayuda">
              {/* <a
                className="nav-icon-btn whats"
                href="https://web.whatsapp.com/send?phone=+573162795010"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp soporte"
                title={chatLabel}
              >
                <i className="fab fa-whatsapp" />
              </a> */}

              <button
                type="button"
                className="nav-icon-btn"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
                title="Cambiar tema"
              >
                <i className="fas fa-adjust" />
              </button>

              <button
                type="button"
                className="nav-icon-btn"
                onClick={changeFontsizePlus}
                aria-label="Aumentar fuente"
                title="Aumentar fuente"
              >
                <i className="fas fa-plus" />
              </button>

              <button
                type="button"
                className="nav-icon-btn"
                onClick={changeFontsizeMinus}
                aria-label="Disminuir fuente"
                title="Disminuir fuente"
              >
                <i className="fas fa-minus" />
              </button>
            </div>

            {/* Tu componente de usuario / perfil */}
            {authBtn}
          </Nav>

        </Navbar>

        {/* CSS para tooltips (solo cuando sidebar colapsado) */}
        <style jsx>{`
          .module-item:hover .module-tooltip {
            opacity: 1 !important;
            visibility: visible !important;
          }
        `}</style>
      </>
    );
  };

  const [activeKey, setActiveKey] = useState(false);

  return (
    <div className="nav-wrapper">
      <NavBarInstance activeKey={activeKey} onSelect={setActiveKey} />
    </div>
  );
}

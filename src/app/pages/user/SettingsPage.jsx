import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Bug, FileText, UserCircle2, Settings as SettingsIcon } from 'lucide-react';
import DataService from '../../services/data.service.js';
import AlarmsV2ConfigPanel from './AlarmsV2ConfigPanel.jsx';
import ErrorReportsPanel from './ErrorReportsPanel.jsx';
import { isDeveloperUser, isErrorReportManagerUser } from '../../utils/developerAccess.js';
import './SettingsPage.css';

const NAV_ITEMS = [
  {
    key: 'alarmas',
    label: 'Alarmas',
    description: 'Umbrales por fase, actor y nivel',
    icon: Bell,
  },
  {
    key: 'cuenta',
    label: 'Cuenta',
    description: 'Información del usuario actual',
    icon: UserCircle2,
  },
  {
    key: 'misReportes',
    label: 'Mis reportes',
    description: 'Estado de reportes enviados',
    icon: FileText,
  },
];

function formatLastLogin(value) {
  if (!value) return 'No disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState(searchParams.get('tab') || 'alarmas');
  const user = DataService.getUserData();
  const canSeeTechnicalReports = isDeveloperUser(user);
  const canManageErrorReports = isErrorReportManagerUser(user) || canSeeTechnicalReports;
  const navItems = canManageErrorReports
    ? [
        ...NAV_ITEMS,
        {
          key: 'errorReports',
          label: canSeeTechnicalReports ? 'Reportes técnicos' : 'Gestión de reportes',
          description: canSeeTechnicalReports ? 'JSON seguro para desarrollo' : 'Estados y notas visibles',
          icon: Bug,
        },
      ]
    : NAV_ITEMS;
  const activeKey = navItems.some((item) => item.key === active) ? active : 'alarmas';
  const fullName = [user?.name, user?.surname].filter(Boolean).join(' ') || 'No disponible';
  const roleDesc = user?.roleDesc || 'No disponible';
  const lastLogin = formatLastLogin(user?.lastLoginAt || user?.lastLogin);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab) setActive(requestedTab);
  }, [searchParams]);

  const selectTab = (key) => {
    setActive(key);
    if (key === 'alarmas') setSearchParams({});
    else setSearchParams({ tab: key });
  };

  return (
    <div className="settings-shell">
      <header className="settings-shell__header">
        <div className="settings-shell__title">
          <SettingsIcon size={20} className="settings-shell__title-icon" />
          <div>
            <h1>Configuración</h1>
            <p>Ajustes globales de la curaduría.</p>
          </div>
        </div>
      </header>

      <div className="settings-shell__body">
        <aside className="settings-nav" aria-label="Secciones de configuración">
          <ul className="settings-nav__list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className={`settings-nav__item${isActive ? ' is-active' : ''}`}
                    onClick={() => selectTab(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={`settings-nav-${item.key}`}
                  >
                    <Icon size={18} className="settings-nav__icon" />
                    <span className="settings-nav__text">
                      <span className="settings-nav__label">{item.label}</span>
                      <span className="settings-nav__desc">{item.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="settings-panel" role="main">
          {activeKey === 'alarmas' && <AlarmsV2ConfigPanel />}
          {activeKey === 'misReportes' && <ErrorReportsPanel mode="mine" />}
          {activeKey === 'errorReports' && canManageErrorReports && (
            <ErrorReportsPanel mode={canSeeTechnicalReports ? 'technical' : 'management'} />
          )}
          {activeKey === 'cuenta' && (
            <AccountPanel fullName={fullName} roleDesc={roleDesc} lastLogin={lastLogin} />
          )}
        </main>
      </div>
    </div>
  );
}

function AccountPanel({ fullName, roleDesc, lastLogin }) {
  return (
    <div className="settings-account">
      <div className="settings-panel__header">
        <h2>Cuenta</h2>
        <p>Información del usuario autenticado en esta curaduría.</p>
      </div>
      <dl className="settings-account__list">
        <div>
          <dt>Nombre</dt>
          <dd>{fullName}</dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd>{roleDesc}</dd>
        </div>
        <div>
          <dt>Última sesión</dt>
          <dd>{lastLogin}</dd>
        </div>
      </dl>
    </div>
  );
}

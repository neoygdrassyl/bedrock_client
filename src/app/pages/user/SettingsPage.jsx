import React, { useState } from 'react';
import { Bell, UserCircle2, Settings as SettingsIcon } from 'lucide-react';
import DataService from '../../services/data.service.js';
import AlarmsV2ConfigPanel from './AlarmsV2ConfigPanel.jsx';
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
  const [active, setActive] = useState('alarmas');
  const user = DataService.getUserData();
  const fullName = [user?.name, user?.surname].filter(Boolean).join(' ') || 'No disponible';
  const roleDesc = user?.roleDesc || 'No disponible';
  const lastLogin = formatLastLogin(user?.lastLoginAt || user?.lastLogin);

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
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className={`settings-nav__item${isActive ? ' is-active' : ''}`}
                    onClick={() => setActive(item.key)}
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
          {active === 'alarmas' && <AlarmsV2ConfigPanel />}
          {active === 'cuenta' && (
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

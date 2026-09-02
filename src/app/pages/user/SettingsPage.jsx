import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Bug, Check, Database, FileText, LayoutDashboard, Library, RotateCcw, UserCircle2, Settings as SettingsIcon } from 'lucide-react';
import DataService from '../../services/data.service.js';
import AlarmsV2ConfigPanel from './AlarmsV2ConfigPanel.jsx';
import DocumentCatalogWorkspacePage, {
  normalizeDocumentCatalogSection,
} from './legal_config/DocumentCatalogWorkspacePage.jsx';
import ErrorReportsPanel from './ErrorReportsPanel.jsx';
import CentralConfigurationPanel from './document_requirements/CentralConfigurationPanel.jsx';
import { isDeveloperUser, isErrorReportManagerUser } from '../../utils/developerAccess.js';
import {
  DASHBOARD_DENSITY_OPTIONS,
  DASHBOARD_LAYOUT_OPTIONS,
  DASHBOARD_PALETTE_OPTIONS,
  DASHBOARD_PREFERENCES_CHANGED_EVENT,
  DEFAULT_DASHBOARD_PREFERENCES,
  patchDashboardPreferences,
  readDashboardPreferences,
  resetDashboardPreferences,
} from './dashboardPreferences.js';
import './SettingsPage.css';

const NAV_ITEMS = [
  {
    key: 'alarmas',
    label: 'Alarmas',
    icon: Bell,
  },
  {
    key: 'catalogo-documental',
    label: 'Catálogo documental',
    icon: Library,
  },
  {
    key: 'configuracion-documental',
    label: 'Configuración documental',
    icon: Database,
  },
  {
    key: 'personalizacion',
    label: 'Personalización',
    icon: LayoutDashboard,
  },
  {
    key: 'cuenta',
    label: 'Cuenta',
    icon: UserCircle2,
  },
  {
    key: 'misReportes',
    label: 'Mis reportes',
    icon: FileText,
  },
];

const LEGACY_DOCUMENT_CATALOG_TABS = Object.freeze({
  'configuracion-actuaciones': 'actuaciones',
  'revision-documentos': 'evaluacion-documentos',
});

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
  const user = DataService.getUserData();
  const canSeeTechnicalReports = isDeveloperUser(user);
  const canManageErrorReports = isErrorReportManagerUser(user) || canSeeTechnicalReports;
  const navItems = canManageErrorReports
    ? [
        ...NAV_ITEMS,
        {
          key: 'errorReports',
          label: canSeeTechnicalReports ? 'Reportes técnicos' : 'Gestión de reportes',
          icon: Bug,
        },
      ]
    : NAV_ITEMS;
  const requestedTab = searchParams.get('tab') || 'alarmas';
  const legacyDocumentCatalogSection = LEGACY_DOCUMENT_CATALOG_TABS[requestedTab];
  const requestedActiveKey = legacyDocumentCatalogSection ? 'catalogo-documental' : requestedTab;
  const activeKey = navItems.some((item) => item.key === requestedActiveKey) ? requestedActiveKey : 'alarmas';
  const documentCatalogSection = legacyDocumentCatalogSection
    || normalizeDocumentCatalogSection(searchParams.get('section'));
  const fullName = [user?.name, user?.surname].filter(Boolean).join(' ') || 'No disponible';
  const roleDesc = user?.roleDesc || 'No disponible';
  const lastLogin = formatLastLogin(user?.lastLoginAt || user?.lastLogin);

  const selectTab = (key) => {
    if (key === 'alarmas') setSearchParams({});
    else if (key === 'catalogo-documental') setSearchParams({ tab: key, section: documentCatalogSection });
    else setSearchParams({ tab: key });
  };

  const selectDocumentCatalogSection = (section) => {
    setSearchParams({ tab: 'catalogo-documental', section: normalizeDocumentCatalogSection(section) });
  };

  return (
    <div className="settings-shell settings-shell--wide">
      <header className="settings-shell__header">
        <div className="settings-shell__title">
          <SettingsIcon size={20} className="settings-shell__title-icon" />
          <h1>Configuración</h1>
        </div>
      </header>

      <div className="settings-shell__body">
        <aside className="settings-nav" aria-label="Secciones de configuración">
          <div className="settings-nav__list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              return (
                <div key={item.key}>
                  <button
                    type="button"
                    className={`settings-nav__item${isActive ? ' is-active' : ''}`}
                    onClick={() => selectTab(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={`settings-nav-${item.key}`}
                  >
                    <Icon size={18} className="settings-nav__icon" />
                    <span className="settings-nav__label">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="settings-panel">
          {activeKey === 'alarmas' && <AlarmsV2ConfigPanel />}
          {activeKey === 'catalogo-documental' && (
            <DocumentCatalogWorkspacePage
              activeSection={documentCatalogSection}
              onSectionChange={selectDocumentCatalogSection}
            />
          )}
          {activeKey === 'configuracion-documental' && <CentralConfigurationPanel />}
          {activeKey === 'personalizacion' && <DashboardPersonalizationPanel />}
          {activeKey === 'misReportes' && <ErrorReportsPanel mode="mine" />}
          {activeKey === 'errorReports' && canManageErrorReports && (
            <ErrorReportsPanel mode={canSeeTechnicalReports ? 'technical' : 'management'} />
          )}
          {activeKey === 'cuenta' && (
            <AccountPanel fullName={fullName} roleDesc={roleDesc} lastLogin={lastLogin} />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardPersonalizationPanel() {
  const [preferences, setPreferences] = useState(() => readDashboardPreferences());

  useEffect(() => {
    function syncPreferences(event) {
      setPreferences(event?.detail || readDashboardPreferences());
    }

    window.addEventListener('storage', syncPreferences);
    window.addEventListener(DASHBOARD_PREFERENCES_CHANGED_EVENT, syncPreferences);

    return () => {
      window.removeEventListener('storage', syncPreferences);
      window.removeEventListener(DASHBOARD_PREFERENCES_CHANGED_EVENT, syncPreferences);
    };
  }, []);

  const updatePreference = (key, value) => {
    const next = patchDashboardPreferences({ [key]: value });
    setPreferences(next);
  };

  const resetPreferences = () => {
    const next = resetDashboardPreferences();
    setPreferences(next);
  };

  const selectedPreset = DASHBOARD_LAYOUT_OPTIONS.find((option) => option.value === preferences.layout) || DASHBOARD_LAYOUT_OPTIONS[0];
  const selectedPalette = DASHBOARD_PALETTE_OPTIONS.find((option) => option.value === preferences.palette) || DASHBOARD_PALETTE_OPTIONS[0];
  const selectedDensity = DASHBOARD_DENSITY_OPTIONS.find((option) => option.value === preferences.density) || DASHBOARD_DENSITY_OPTIONS[0];

  return (
    <div className="settings-dashboard-preferences">
      <div className="settings-panel__header">
        <h2>Personalización de experiencia</h2>
        <p>
          Define cómo se organiza tu panel principal y qué paleta global usa la aplicación.
        </p>
      </div>

      <div className="settings-dashboard-preferences__intro">
        <div>
          <strong>Guardado por usuario en este navegador.</strong> Se aplica al dashboard y a los tokens globales de color. La sincronización multi-dispositivo queda lista para una fase backend posterior.
        </div>
        <button type="button" className="settings-dashboard-preferences__reset" onClick={resetPreferences}>
          <RotateCcw size={15} />
          Volver a {DASHBOARD_LAYOUT_OPTIONS.find((option) => option.value === DEFAULT_DASHBOARD_PREFERENCES.layout)?.label || 'Dovela recomendado'}
        </button>
      </div>

      <div className="settings-personalization-grid">
        <div className="settings-personalization-controls">
          <PreferenceGroup
            title="Configuración del dashboard"
            description="Cada opción reorganiza acciones, seguimiento y módulos secundarios."
            options={DASHBOARD_LAYOUT_OPTIONS}
            value={preferences.layout}
            onSelect={(value) => updatePreference('layout', value)}
          />

          <PreferenceGroup
            title="Paleta global"
            description="Cambia tokens semánticos de la aplicación: acciones, foco, navegación y acentos."
            options={DASHBOARD_PALETTE_OPTIONS}
            value={preferences.palette}
            onSelect={(value) => updatePreference('palette', value)}
            renderVisual={(option) => <PaletteSwatches swatches={option.swatches} />}
          />

          <PreferenceGroup
            title="Densidad"
            description="Ajusta cuánta información aparece por pantalla."
            options={DASHBOARD_DENSITY_OPTIONS}
            value={preferences.density}
            onSelect={(value) => updatePreference('density', value)}
          />
        </div>

        <DashboardPreview
          preset={selectedPreset}
          palette={selectedPalette}
          density={selectedDensity}
        />
      </div>
    </div>
  );
}

function PreferenceGroup({ title, description, options, value, onSelect, renderVisual }) {
  return (
    <section className="settings-preference-group">
      <div className="settings-preference-group__header">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="settings-preference-group__grid">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              className={`settings-preference-card${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(option.value)}
              aria-pressed={isActive}
            >
              <span className="settings-preference-card__topline">
                {renderVisual ? renderVisual(option) : null}
                {isActive ? <Check size={15} aria-hidden="true" /> : null}
              </span>
              <span className="settings-preference-card__label">{option.label}</span>
              <span className="settings-preference-card__description">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PaletteSwatches({ swatches = [] }) {
  return (
    <span className="settings-palette-swatches" aria-hidden="true">
      {swatches.map((swatch) => (
        <span key={swatch} style={{ backgroundColor: `hsl(${swatch})` }} />
      ))}
    </span>
  );
}

function DashboardPreview({ preset, palette, density }) {
  const actions = preset.previewActions || [];

  return (
    <aside className="settings-dashboard-preview" data-preview-palette={palette.value} aria-label="Previsualización de personalización">
      <div className="settings-dashboard-preview__header">
        <span className="settings-dashboard-preview__eyebrow">Vista previa</span>
        <h3>{preset.label}</h3>
        <p>{palette.label} · {density.label}</p>
      </div>

      <div className="settings-dashboard-preview__shell">
        <div className="settings-dashboard-preview__rail">
          <span />
          <span />
          <span />
        </div>
        <div className="settings-dashboard-preview__canvas">
          <div className="settings-dashboard-preview__hero">
            <span>Consola operativa</span>
            <strong>{preset.label}</strong>
          </div>
          <div className={`settings-dashboard-preview__actions ${density.value === 'compact' ? 'is-compact' : ''}`}>
            {actions.map((action) => (
              <span key={action}>{action}</span>
            ))}
          </div>
          <div className="settings-dashboard-preview__body">
            <div className="settings-dashboard-preview__section">
              <span />
              <span />
              <span />
            </div>
            <div className="settings-dashboard-preview__tracking">
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </aside>
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

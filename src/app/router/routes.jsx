import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getRouteRedirects } from '../layouts/navigation-config';
import { PrivateLayout, LoginPageWithAuth } from './PrivateRoute';
import FunmanageExpedienteRoute from './FunmanageExpedienteRoute';

// ── Lazy-loaded page components (code-split per route) ──────────────
const PQRSADMIN = lazy(() => import('../../features/pqrs/pqrsadmin'));
const Liquidator = lazy(() => import('../../features/liquidator/liquidator'));
const Dashboard = lazy(() => import('../../features/dashboard/dashboard'));
const Publish = lazy(() => import('../../features/publications/publish'));
const Seals = lazy(() => import('../../features/seals/seal'));
const Appointments = lazy(() => import('../../features/appointments/appointments'));
const Mail = lazy(() => import('../../features/messaging/mail'));
const FUN = lazy(() => import('../../features/expediente/fun/fun'));
const OSHA = lazy(() => import('../../features/documentos/osha'));
const NOMENCLATURE = lazy(() => import('../../features/nomenclature/nomenclature'));
const SUBMIT = lazy(() => import('../../features/ventanilla/submit'));
const ARCHIVE = lazy(() => import('../../features/archive/archive.page'));
const DICTIONARY = lazy(() => import('../../features/dictionary/dictionary.page'));
const FUN_MANAGE = lazy(() => import('../../features/expediente/fun/funmanage.page'));
const FUN_MANAGE_NEW = lazy(() => import('../../features/expediente/fun/funmanage_new.page'));
const PROFESIONALS = lazy(() => import('../../features/professionals/profesionals.page'));
const GUIDE_USER = lazy(() => import('../../features/help/guide_user/guide_user.page'));
const DEV_GUIDE = lazy(() => import('../../features/help/dev_guide/dev_guide.page'));
const NORMS = lazy(() => import('../../features/norms/norms.page'));
const CERTIFICATE_WORKER = lazy(() => import('../../features/certifications/certification.page'));
const ZONE_USE = lazy(() => import('../../features/norms/zone-use/zone_use.page'));
const SETTINGS = lazy(() => import('../../features/settings/SettingsPage'));
const LEGAL_FLOW_GUIDE = lazy(() => import('../../features/simulador/legal_flow_guide/LegalFlowGuide.page'));
const SIMULADOR = lazy(() => import('../../features/simulador'));
const BUSINESS_CALENDAR = lazy(() => import('../../features/business-calendar/BusinessCalendarPage'));

// Route table. Translation bundles are resolved once in App and passed down
// unchanged, so every page keeps receiving the same props as before.
export default function AppRoutes({ titleT, loginT, globalsT, swaMsg, breadCrums, pqrsFormT, schedulingT, liquidatorT }) {
  return (
    <Routes>
      {/* ── Public route (no shell) ───────────────────── */}
      <Route path="/login" element={<LoginPageWithAuth />} />

      {/* ── Legacy route redirects ────────────────────── */}
      {Object.entries(getRouteRedirects()).map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
      <Route path="/settings" element={<Navigate replace to="/configuracion" />} />
      <Route path="/ajustes" element={<Navigate replace to="/configuracion" />} />

      {/* ── Authenticated routes (inside AppShell) ───── */}
      <Route element={<PrivateLayout />}>
        <Route path="/dashboard" element={
          <Dashboard translation={titleT} swaMsg={swaMsg} breadCrums={breadCrums} theme="auto" />
        } />
        <Route path="/licencias" element={
          <FUN translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/licencias/gestion" element={
          <FUN_MANAGE translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/funmanage/expediente/:radicado" element={
          <FunmanageExpedienteRoute translation={titleT} globals={globalsT} swaMsg={swaMsg} />
        } />
        <Route path="/licencias/gestion-nueva" element={
          <FUN_MANAGE_NEW translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/peticiones" element={
          <PQRSADMIN translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation_form={pqrsFormT} />
        } />
        <Route path="/ventanilla" element={
          <SUBMIT translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/mensajes" element={
          <Mail translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/calendario" element={
          <Appointments translation={schedulingT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/calendario-laboral" element={<BUSINESS_CALENDAR />} />
        <Route path="/archivo" element={
          <ARCHIVE globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
        } />
        <Route path="/publicaciones" element={
          <Publish translation={titleT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/nomenclatura" element={
          <NOMENCLATURE translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation_form={pqrsFormT} />
        } />
        <Route path="/documentos" element={
          <OSHA translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation_form={pqrsFormT} />
        } />
        <Route path="/simulador" element={
          <SIMULADOR translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/simulador/documentos" element={<Navigate to="/configuracion?tab=configuracion-documental" replace />} />
        <Route path="/simulador/legal" element={<LEGAL_FLOW_GUIDE />} />
        <Route path="/calculadora" element={
          <Liquidator globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} versioni="2024" hideInfo useSelector />
        } />
        <Route path="/consecutivos" element={
          <DICTIONARY globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
        } />
        <Route path="/profesionales" element={
          <PROFESIONALS globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
        } />
        <Route path="/ayuda" element={
          <GUIDE_USER globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
        } />
        <Route path="/legal-flow-guide" element={<LEGAL_FLOW_GUIDE />} />
        <Route path="/configuracion" element={<SETTINGS />} />
        <Route path="/user/settings" element={<SETTINGS />} />
        <Route path="/sellos" element={
          <Seals translation={titleT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/normas" element={
          <NORMS translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/certificados" element={
          <CERTIFICATE_WORKER translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/uso-suelo" element={
          <ZONE_USE translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
        } />
        <Route path="/dev-guide" element={
          <DEV_GUIDE globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
        } />

        {/* Catch-all for authenticated area → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* ── Root & fallback ───────────────────────────── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

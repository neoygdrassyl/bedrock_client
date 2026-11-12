import { buildExpedienteWorkspaceUrl } from '../fun/fun_forms/utils/expedienteWorkspaceRoute';
import { sectionToWorkspaceTarget } from '../workspace/expedienteNavConfig';
import { addToDock, getDockSnapshot, minimize } from './expedienteDockStore';

/** Workspace URL for a radicado and an optional nav section id (e.g. 'juridico'). */
export function buildDockWorkspaceUrl(radicado, sectionId) {
  const options = {};
  if (sectionId) {
    const target = sectionToWorkspaceTarget(sectionId);
    options.section = target.section;
    if (target.report) options.report = target.report;
  }
  return buildExpedienteWorkspaceUrl({ id_public: radicado }, options);
}

/**
 * Expands a dock item into the fullscreen workspace. When another expediente is
 * already open in the workspace, it is swapped into the dock (minimized) and the
 * history entry is replaced, so "Volver" still leaves to where the user came from.
 */
export function expandDockItem(navigate, radicado, sectionId) {
  const url = buildDockWorkspaceUrl(radicado, sectionId);
  if (!url) return;
  const { activeWorkspace } = getDockSnapshot();
  if (activeWorkspace && activeWorkspace !== radicado) {
    addToDock(activeWorkspace, { open: false });
  }
  minimize(radicado);
  navigate(url, { replace: Boolean(activeWorkspace) });
}

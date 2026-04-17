/**
 * Generates Mermaid flowchart for a specific project/expediente based on actual phase data.
 * Pure function — no React dependencies.
 */
import { PROCESS_DEFINITION } from './legalProcessDefinition';

const STATUS_CLASS = {
  completado: 'completado',
  activo: 'activo',
  pendiente: 'pendiente',
  vencido: 'vencido',
};

const RESPONSIBLE_LABELS = {
  solicitante: 'Solicitante',
  curaduria: 'Curaduría',
  paralelo: 'Paralelo',
};

/**
 * @param {Array} phases - Phase objects from useProcessPhases/computeProcessPhases.
 *   Each: { phaseId, label, status, daysUsed, daysLimit, responsible, ... }
 * @param {Object} expediente - Enriched expediente from dashboard BFF.
 *   Has: { radicado, fase_label, status, es_desistido, fase_id, ... }
 * @returns {string} Mermaid flowchart TD syntax
 */
export function generateProjectFlowMermaid(phases, expediente) {
  if (!phases || phases.length === 0) return '';

  const lines = [];
  lines.push('flowchart TD');
  lines.push('');

  // --- Class definitions ---
  lines.push('  classDef completado fill:#27AE60,stroke:#333,color:white');
  lines.push('  classDef activo fill:#F39C12,stroke:#333,color:white,stroke-width:3px');
  lines.push('  classDef pendiente fill:#BDC3C7,stroke:#999,color:#666');
  lines.push('  classDef vencido fill:#E74C3C,stroke:#333,color:white');
  lines.push('  classDef desistimiento fill:#E74C3C,stroke:#333,color:white');
  lines.push('');

  // --- Title ---
  lines.push(`  title_node["Expediente: ${expediente?.radicado || 'N/A'}"]:::activo`);
  lines.push('');

  // Build a set of phase IDs that have been reached (completado, activo, or vencido)
  const reachedStatuses = new Set(['completado', 'activo', 'vencido']);
  const activePhase = phases.find((p) => p.status === 'activo');
  const activeIdx = activePhase ? phases.indexOf(activePhase) : -1;

  // Show phases up to one past the active (or all if no active found)
  const visibleLimit = activeIdx >= 0 ? activeIdx + 2 : phases.length;
  const visiblePhases = phases.slice(0, Math.min(visibleLimit, phases.length));

  // --- Render nodes ---
  for (const phase of visiblePhases) {
    const cls = STATUS_CLASS[phase.status] || 'pendiente';
    const resp = RESPONSIBLE_LABELS[phase.responsible] || phase.responsible || '';
    const daysInfo = phase.daysLimit != null
      ? `${phase.daysUsed ?? 0}/${phase.daysLimit}d`
      : `${phase.daysUsed ?? 0}d`;
    const label = `${phase.label}\\n${daysInfo} | ${resp}`;
    lines.push(`  ${sanitizeId(phase.phaseId)}["${label}"]:::${cls}`);
  }
  lines.push('');

  // --- Render edges ---
  for (let i = 0; i < visiblePhases.length - 1; i++) {
    const curr = visiblePhases[i];
    const next = visiblePhases[i + 1];
    const isActiveEdge = curr.status === 'activo' || next.status === 'activo';
    const edgeLabel = next.status === 'activo' ? '|"Fase Actual"|' : '';
    lines.push(`  ${sanitizeId(curr.phaseId)} -->${edgeLabel} ${sanitizeId(next.phaseId)}`);
  }

  // Connect title to first phase
  if (visiblePhases.length > 0) {
    lines.push(`  title_node --> ${sanitizeId(visiblePhases[0].phaseId)}`);
  }
  lines.push('');

  // --- Desistimiento subflow ---
  if (expediente?.es_desistido) {
    const bifurcationPhase = activePhase || visiblePhases[visiblePhases.length - 1];

    lines.push('  subgraph "Subflujo Desistimiento"');
    for (const step of PROCESS_DEFINITION.desistimientoSubflow) {
      const sid = `DS_${step.id}`;
      const resp = RESPONSIBLE_LABELS[step.responsible] || step.responsible;
      const condLabel = step.conditional ? ' (si recurso)' : '';
      lines.push(`    ${sid}["${step.label}${condLabel}\\n${step.days}d | ${resp}"]:::desistimiento`);
    }
    for (let i = 0; i < PROCESS_DEFINITION.desistimientoSubflow.length - 1; i++) {
      const a = `DS_${PROCESS_DEFINITION.desistimientoSubflow[i].id}`;
      const b = `DS_${PROCESS_DEFINITION.desistimientoSubflow[i + 1].id}`;
      lines.push(`    ${a} --> ${b}`);
    }
    lines.push('  end');

    if (bifurcationPhase) {
      lines.push(`  ${sanitizeId(bifurcationPhase.phaseId)} -->|"Desistido"| DS_D1`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Sanitize a phase ID for use as a Mermaid node ID (no hyphens allowed).
 */
function sanitizeId(id) {
  if (!id) return 'UNKNOWN';
  return id.replace(/-/g, '_');
}

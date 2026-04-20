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
  curaduria: 'Curaduria',
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

  // --- Class definitions — cohesive professional palette ---
  lines.push('  classDef completado fill:#3D9B7F,stroke:#338A6E,color:#fff,rx:8,ry:8');
  lines.push('  classDef activo fill:#D4943A,stroke:#C0842E,color:#fff,rx:8,ry:8,stroke-width:3px');
  lines.push('  classDef pendiente fill:#CBD2DC,stroke:#B0B8C5,color:#5A6578,rx:8,ry:8');
  lines.push('  classDef vencido fill:#C97A7A,stroke:#B56A6A,color:#fff,rx:8,ry:8');
  lines.push('  classDef desistimiento fill:#C97A7A,stroke:#B56A6A,color:#fff,rx:8,ry:8');
  lines.push('');

  // --- Title ---
  lines.push(`  title_node["Expediente: ${expediente?.radicado || 'N/A'}"]:::activo`);
  lines.push('');

  // Build a set of phase IDs that have been reached (completado, activo, or vencido)
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
    const label = `${phase.label}\\n${daysInfo} · ${resp}`;
    lines.push(`  ${sanitizeId(phase.phaseId)}["${label}"]:::${cls}`);
  }
  lines.push('');

  // --- Render edges ---
  for (let i = 0; i < visiblePhases.length - 1; i++) {
    const curr = visiblePhases[i];
    const next = visiblePhases[i + 1];
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

    lines.push('  subgraph desist ["Subflujo Desistimiento"]');
    for (const step of PROCESS_DEFINITION.desistimientoSubflow) {
      const sid = `DS_${step.id}`;
      const resp = RESPONSIBLE_LABELS[step.responsible] || step.responsible;
      const condLabel = step.conditional ? ' (si recurso)' : '';
      lines.push(`    ${sid}["${step.label}${condLabel}\\n${step.days}d · ${resp}"]:::desistimiento`);
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

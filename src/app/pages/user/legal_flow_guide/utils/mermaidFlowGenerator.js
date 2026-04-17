/**
 * Generates Mermaid flowchart syntax for the generic legal process diagram.
 * Pure function — no React dependencies.
 */
import { PROCESS_DEFINITION, getPhaseDays, getPoolDays } from './legalProcessDefinition';

const RESPONSIBLE_LABELS = {
  solicitante: 'Solicitante',
  curaduria: 'Curaduría',
  paralelo: 'Paralelo',
};

/**
 * @param {Object} options
 * @param {string}  [options.projectType='I']
 * @param {string}  [options.notificationMode='notificar']
 * @param {string}  [options.notificationType='personal']
 * @param {boolean} [options.cumpleActa=false]
 * @param {Object}  [options.showDesistimientos={}]  - e.g. { '-1': true, '-2': true }
 * @param {boolean} [options.showSuspension=false]
 * @param {boolean} [options.showExtension=false]
 * @param {boolean} [options.showProrroga=false]
 * @param {boolean} [options.showRecurso=true]
 * @returns {string} Mermaid flowchart TD syntax
 */
export function generateLegalFlowMermaid(options = {}) {
  const {
    projectType = 'I',
    notificationMode = 'notificar',
    notificationType = 'personal',
    cumpleActa = false,
    showDesistimientos = {},
    showSuspension = false,
    showExtension = false,
    showProrroga = false,
    showRecurso = true,
  } = options;

  const phaseOpts = { projectType, notificationMode, notificationType };
  const poolTotal = getPoolDays(projectType);
  const estDays = getPhaseDays('EST', phaseOpts) ?? 0;
  const lines = [];

  lines.push('flowchart TD');
  lines.push('');

  // --- Class definitions ---
  lines.push('  classDef curaduria fill:#4A90D9,stroke:#333,color:white');
  lines.push('  classDef solicitante fill:#F5A623,stroke:#333,color:white');
  lines.push('  classDef paralelo fill:#999,stroke:#333,color:white');
  lines.push('  classDef desistimiento fill:#E74C3C,stroke:#333,color:white');
  lines.push('  classDef modifier fill:#9B59B6,stroke:#333,color:white,stroke-dasharray:5');
  lines.push('');

  // --- Determine visible phases ---
  const skipIds = new Set();
  if (cumpleActa) {
    skipIds.add('NOT_OBS');
    skipIds.add('CORR');
  } else if (notificationMode === 'comunicar') {
    skipIds.add('NOT_OBS');
  }

  // comunicar for viabilidad skips NOT_VIA
  if (notificationMode === 'comunicar') {
    skipIds.add('NOT_VIA');
  }

  const visiblePhases = PROCESS_DEFINITION.phases.filter((p) => !skipIds.has(p.id));

  // --- Render phase nodes ---
  let poolUsed = 0;
  for (const phase of visiblePhases) {
    let days;
    if (phase.id === 'VIA') {
      days = Math.max(0, poolTotal - estDays);
      poolUsed = estDays; // track for label
    } else {
      days = getPhaseDays(phase.id, phaseOpts);
    }
    const daysLabel = days != null ? `${days}d` : '—';
    const resp = RESPONSIBLE_LABELS[phase.responsible] || phase.responsible;
    const label = `F${phase.order}: ${phase.label}\\n${daysLabel} | ${resp}`;
    lines.push(`  ${phase.id}["${label}"]:::${phase.color}`);
  }
  lines.push('');

  // --- Render edges between visible phases ---
  for (let i = 0; i < visiblePhases.length - 1; i++) {
    const curr = visiblePhases[i];
    const next = visiblePhases[i + 1];
    lines.push(`  ${curr.id} --> ${next.id}`);
  }
  lines.push('');

  // --- Pool annotation ---
  lines.push(`  pool_note["Pool compartido EST+VIA: ${poolTotal}d (Tipo ${projectType})"]:::modifier`);
  lines.push('  EST -.- pool_note');
  lines.push('  VIA -.- pool_note');
  lines.push('');

  // --- Modifiers ---
  if (showSuspension) {
    const susPre = PROCESS_DEFINITION.modifiers.suspension_pre_acta;
    lines.push(`  MOD_SUS_PRE["${susPre.label}\\n+${susPre.maxDays}d máx"]:::modifier`);
    lines.push('  EST -.- MOD_SUS_PRE');

    const susPost = PROCESS_DEFINITION.modifiers.suspension_post_acta;
    lines.push(`  MOD_SUS_POST["${susPost.label}\\n+${susPost.maxDays}d máx"]:::modifier`);
    lines.push('  VIA -.- MOD_SUS_POST');
    lines.push('');
  }

  if (showExtension) {
    const ext = PROCESS_DEFINITION.modifiers.extension;
    lines.push(`  MOD_EXT["${ext.label}\\n1 vez máx"]:::modifier`);
    lines.push('  EST -.- MOD_EXT');
    lines.push('');
  }

  if (showProrroga && !cumpleActa) {
    const prr = PROCESS_DEFINITION.modifiers.prorroga_correcciones;
    lines.push(`  MOD_PRR["${prr.label}\\n+${prr.extraDays}d"]:::modifier`);
    lines.push('  CORR -.- MOD_PRR');
    lines.push('');
  }

  // --- Recurso subflow ---
  if (showRecurso) {
    lines.push('  subgraph "Recurso de Reposición"');
    lines.push('    REC_RES["Resolver Recurso\\n45d | Curaduría"]:::curaduria');
    lines.push('    REC_NOT["Notif. Respuesta\\n15d | Curaduría"]:::curaduria');
    lines.push('    REC_RES --> REC_NOT');
    lines.push('  end');
    lines.push('  EJEC -->|"Recurso"| REC_RES');
    lines.push('  REC_NOT --> ENT');
    lines.push('');
  }

  // --- Desistimientos ---
  const enabledDesist = Object.entries(showDesistimientos).filter(([, v]) => v);

  if (enabledDesist.length > 0) {
    // Render shared desistimiento subflow once
    lines.push('  subgraph "Subflujo Desistimiento"');
    for (const step of PROCESS_DEFINITION.desistimientoSubflow) {
      const sid = `DS_${step.id}`;
      const resp = RESPONSIBLE_LABELS[step.responsible] || step.responsible;
      const condLabel = step.conditional ? ' (si recurso)' : '';
      lines.push(`    ${sid}["${step.label}${condLabel}\\n${step.days}d | ${resp}"]:::desistimiento`);
    }
    // Chain subflow
    for (let i = 0; i < PROCESS_DEFINITION.desistimientoSubflow.length - 1; i++) {
      const a = `DS_${PROCESS_DEFINITION.desistimientoSubflow[i].id}`;
      const b = `DS_${PROCESS_DEFINITION.desistimientoSubflow[i + 1].id}`;
      lines.push(`    ${a} --> ${b}`);
    }
    lines.push('  end');
    lines.push('');

    // Edges from bifurcation phases to the desistimiento subflow entry
    for (const [key] of enabledDesist) {
      const def = PROCESS_DEFINITION.desistimientos[key];
      if (!def) continue;

      if (key === '-5') {
        // Voluntario: any phase
        lines.push(`  VOLUNTARIO["Cualquier Fase\\n(Desistimiento Voluntario)"]:::desistimiento`);
        lines.push('  VOLUNTARIO -.->|"Voluntario"| DS_D1');
        continue;
      }

      const sources = Array.isArray(def.bifurcation) ? def.bifurcation : [def.bifurcation];
      for (const src of sources) {
        if (skipIds.has(src)) continue;
        lines.push(`  ${src} -->|"${def.label}"| DS_D1`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

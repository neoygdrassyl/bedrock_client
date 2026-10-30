export const OPERATIONAL_STATE_META = {
  en_revision: {
    id: 'en_revision',
    label: 'En revisión',
    description: 'El expediente o solicitud está siendo validado por el equipo responsable.',
    tone: 'info',
    requiresDueDate: false,
    requiresResponsible: true,
    requiresNextAction: false,
  },
  requiere_subsanacion: {
    id: 'requiere_subsanacion',
    label: 'Requiere subsanación',
    description: 'El solicitante debe corregir o completar información para continuar el trámite.',
    tone: 'warning',
    requiresDueDate: true,
    requiresResponsible: true,
    requiresNextAction: true,
  },
  pendiente_respuesta: {
    id: 'pendiente_respuesta',
    label: 'Pendiente de respuesta',
    description: 'Existe una actuación o PQRS a la espera de respuesta formal.',
    tone: 'warning',
    requiresDueDate: true,
    requiresResponsible: true,
    requiresNextAction: true,
  },
  respondido: {
    id: 'respondido',
    label: 'Respondido',
    description: 'La actuación ya cuenta con respuesta registrada.',
    tone: 'success',
    requiresDueDate: false,
    requiresResponsible: false,
    requiresNextAction: false,
  },
  vencido: {
    id: 'vencido',
    label: 'Vencido',
    description: 'El plazo legal u operativo terminó y requiere atención inmediata.',
    tone: 'danger',
    requiresDueDate: true,
    requiresResponsible: true,
    requiresNextAction: true,
  },
  proximo_a_vencer: {
    id: 'proximo_a_vencer',
    label: 'Próximo a vencer',
    description: 'El plazo está cerca de cumplirse y debe priorizarse.',
    tone: 'warning',
    requiresDueDate: true,
    requiresResponsible: true,
    requiresNextAction: true,
  },
  archivado: {
    id: 'archivado',
    label: 'Archivado',
    description: 'El expediente o actuación está cerrado para consulta histórica.',
    tone: 'neutral',
    requiresDueDate: false,
    requiresResponsible: false,
    requiresNextAction: false,
  },
  bloqueado: {
    id: 'bloqueado',
    label: 'Bloqueado',
    description: 'El trámite no puede avanzar hasta resolver una condición administrativa.',
    tone: 'danger',
    requiresDueDate: false,
    requiresResponsible: true,
    requiresNextAction: true,
  },
};

export const DOCUMENT_TYPE_META = {
  requisito: { id: 'requisito', label: 'Requisito', tone: 'info' },
  soporte: { id: 'soporte', label: 'Soporte', tone: 'neutral' },
  respuesta: { id: 'respuesta', label: 'Respuesta', tone: 'success' },
  acto_administrativo: { id: 'acto_administrativo', label: 'Acto administrativo', tone: 'info' },
  revision_tecnica: { id: 'revision_tecnica', label: 'Revisión técnica', tone: 'warning' },
};

export function getOperationalStateMeta(state) {
  return OPERATIONAL_STATE_META[state] ?? OPERATIONAL_STATE_META.en_revision;
}

export function getDocumentTypeMeta(type) {
  return DOCUMENT_TYPE_META[type] ?? DOCUMENT_TYPE_META.soporte;
}

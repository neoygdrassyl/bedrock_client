export const CHECKLIST_EVALUATION = Object.freeze({
  SI: 'SI',
  NO: 'NO',
  NA: 'NA',
});

export function normalizeChecklistResponse(response) {
  const data = response?.data?.data || response?.data || {};
  return {
    requirements: Array.isArray(data.requirements) ? data.requirements : [],
    vrs: Array.isArray(data.vrs) ? data.vrs : [],
    links: Array.isArray(data.links) ? data.links : [],
  };
}

export function normalizeRequirementCode(code) {
  return String(code ?? '').trim();
}

export function filterApplicableRequirements(requirements, isRequirementApplicable) {
  return requirements.filter((row) => {
    const code = normalizeRequirementCode(row.code);
    return typeof isRequirementApplicable === 'function' ? isRequirementApplicable(code) : true;
  });
}

export function sortVrs(vrs) {
  return [...vrs].sort((left, right) => {
    const leftDate = `${left.date || ''} ${left.time || ''}`.trim();
    const rightDate = `${right.date || ''} ${right.time || ''}`.trim();
    if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);
    return Number(left.id || 0) - Number(right.id || 0);
  });
}

export function resolveRowVr(row, selectedVrId) {
  if (selectedVrId) return selectedVrId;
  return row.latestVrIdPublic || row.vr_id_public || null;
}

export function getPrimaryEvidence(row, selectedVrId) {
  const evidence = Array.isArray(row.evidence) ? row.evidence : [];
  if (selectedVrId) {
    const selectedEvidence = evidence.find((item) => item.vr_id_public === selectedVrId);
    if (selectedEvidence) return selectedEvidence;
  }
  return evidence[0] || null;
}

export function getEvidenceAction(row, selectedVrId) {
  const evidence = getPrimaryEvidence(row, selectedVrId);
  if (evidence) {
    return { type: 'preview', icon: 'eye', label: 'Ver documento', evidence };
  }
  return { type: 'link', icon: 'pencil', label: 'Relacionar documento', evidence: null };
}

export const CHECKLIST_HIERARCHY = Object.freeze([
  {
    id: '6.1',
    title: '6.1 DOCUMENTOS COMUNES A TODA SOLICITUD',
    groups: [{ id: '6.1.general', codes: ['511', '512', '513', '516', '517', '518', '519'] }],
  },
  {
    id: '6.2',
    title: '6.2 DOCUMENTOS ADICIONALES EN LICENCIA DE URBANIZACIÓN',
    groups: [
      { id: '6.2.A', title: 'A. Modalidad Desarrollo', codes: ['621', '601a', '622', '602a'] },
      { id: '6.2.B', title: 'B. Modalidad Saneamiento', codes: ['623', '601b', '602b', '624', '625'] },
      { id: '6.2.C', title: 'C. Modalidad de Reurbanización', codes: ['626', '627', '601c', '602c'] },
    ],
  },
  {
    id: '6.3',
    title: '6.3 DOCUMENTOS ADICIONALES EN LA LICENCIA DE PARCELACIÓN',
    groups: [
      { id: '6.3.general', codes: ['630', '631', '632', '633'] },
      { id: '6.3.saneamiento', title: 'Documentos adicionales en licencia de parcelación para saneamiento', codes: ['634', '635', '636'] },
    ],
  },
  {
    id: '6.4',
    title: '6.4 DOCUMENTOS ADICIONALES EN LA LICENCIA DE SUBDIVISIÓN',
    groups: [
      { id: '6.4.A', title: 'A. Modalidad Subdivisión Urbana y Rural', codes: ['641'] },
      { id: '6.4.B', title: 'B. Modalidad Reloteo', codes: ['642', '643'] },
    ],
  },
  {
    id: '6.5',
    title: '6.5 DOCUMENTOS RECONOCIMIENTO DE EDIFICACIONES',
    groups: [{ id: '6.5.general', codes: ['651', '652', '653'] }],
  },
  {
    id: '6.6',
    title: '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN',
    groups: [
      {
        id: '6.6.profesional',
        note: '* Deben presentarse firmados y rotulados por profesional idóneo',
        codes: ['6601', '6602', '6603', '6604', '6605', '911'],
      },
      {
        id: '6.6.revision',
        title: 'Revisión independiente de los diseños estructurales',
        note: 'Indique la condición por la que se debe adelantar la revisión (Apéndice A-6.3 NSR 10)',
        codes: ['660a', '660b', '660c', '660d', '660e', '660f'],
      },
      { id: '6.6.adjuntos-revision', title: 'Para las condiciones anteriores, adjuntar los siguientes documentos:', codes: ['6607', '6608'] },
      { id: '6.6.bic', title: 'Bien de interés cultural', codes: ['6609'] },
      { id: '6.6.ph', title: 'Propiedad Horizontal', codes: ['6610'] },
      { id: '6.6.reforzamiento', title: 'Reforzamiento Estructural para Edificaciones en riesgo por daños en la estructura', codes: ['6611'] },
      { id: '6.6.equipamientos', title: 'Equipamientos en suelos objeto de entrega de cesiones anticipadas:', codes: ['6612', '6613'] },
      { id: '6.6.autoridad', title: 'Trámite presentado ante autoridad distinta a la que otorgó la licencia inicial', codes: ['6614'] },
      { id: '6.6.modificacion', title: 'Modalidad de Modificación y Adecuación', codes: ['6615'] },
      { id: '6.6.demolicion', title: 'Modalidad de Demolición y Cerramiento', codes: ['6616', '6617', '6618', '6619'] },
    ],
  },
  {
    id: '6.7',
    title: '6.7 DOCUMENTOS ADICIONALES EN LICENCIAS DE INTERVENCIÓN Y OCUPACIÓN DEL ESPACIO PÚBLICO',
    groups: [
      { id: '6.7.general', note: '* Deben presentarse firmados y rotulados por profesional idóneo', codes: ['671', '672'] },
    ],
  },
  {
    id: '6.8',
    title: '6.8 DOCUMENTOS PARA OTRAS ACTUACIONES',
    groups: [
      { id: '6.8.cotas', title: 'Ajuste de cotas y áreas', codes: ['680'] },
      { id: '6.8.ph', title: 'Aprobación de los planos de propiedad horizontal', codes: ['681', '682', '683', '684', '685'] },
      { id: '6.8.tierras', title: 'Autorización para el movimiento de tierras', codes: ['686'] },
      { id: '6.8.piscinas', title: 'Aprobación de piscinas', codes: ['687', '6862'] },
      { id: '6.8.plano', title: 'Modificación del plano urbanístico:', codes: ['688', '689'] },
      { id: '6.8.norma', title: 'Concepto de norma urbanística y uso del suelo:', codes: ['6891', '6892'] },
      { id: '6.8.uso-publico', title: 'Bienes destinados al uso público o con vocación al uso público:', codes: ['6893'] },
    ],
  },
]);

export function buildVisibleSections(rows) {
  const rowByCode = new Map(rows.map((row) => [normalizeRequirementCode(row.code), row]));

  return CHECKLIST_HIERARCHY.map((section) => {
    const groups = section.groups
      .map((group) => ({
        ...group,
        rows: group.codes.map((code) => rowByCode.get(normalizeRequirementCode(code))).filter(Boolean),
      }))
      .filter((group) => group.rows.length > 0);

    return { ...section, groups };
  }).filter((section) => section.groups.length > 0);
}

export function buildVisibleRows({ requirements, selectedVrId, isRequirementApplicable }) {
  return filterApplicableRequirements(requirements, isRequirementApplicable).map((row) => ({
    ...row,
    contextualVrId: resolveRowVr(row, selectedVrId),
    evidenceAction: getEvidenceAction(row, selectedVrId),
  }));
}

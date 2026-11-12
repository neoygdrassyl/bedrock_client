/**
 * Criteria of the Licencia de subdivisión review (FUN tipo `C`), taken from the curaduría's
 * subdivision acta. Pure data and helpers: no React, no services.
 *
 * Persistence contract (record_law_step `sub_law` and record_arc_step `sub_arc`, field `json`).
 * The resolution writer in the backend reads exactly this shape:
 *
 *   {
 *     criteria: { [key]: 'SI' | 'NO' | 'NA' },
 *     notes: { [key]: string },
 *     observations: string,
 *     decision: 'procedente' | 'no_procedente' | null,
 *   }
 */

export const SUB_LAW_STEP = 'sub_law';
export const SUB_ARC_STEP = 'sub_arc';

export const MODALITIES = Object.freeze({ RURAL: 'rural', URBANA: 'urbana', RELOTEO: 'reloteo' });

/** fun_1.m_sub codes (funOptions.js FUN_1_OPTIONS.m_sub): A rural, B urbana, C reloteo. */
export const M_SUB_MODALITY = Object.freeze({ A: MODALITIES.RURAL, B: MODALITIES.URBANA, C: MODALITIES.RELOTEO });

export const MODALITY_LABELS = Object.freeze({
  [MODALITIES.RURAL]: 'Subdivisión rural',
  [MODALITIES.URBANA]: 'Subdivisión urbana',
  [MODALITIES.RELOTEO]: 'Reloteo',
});

export const ANSWERS = Object.freeze({ SI: 'SI', NO: 'NO', NA: 'NA' });
export const DECISIONS = Object.freeze({ PROCEDENTE: 'procedente', NO_PROCEDENTE: 'no_procedente' });

/** `criterion`: SI / NO / NA and counts for the suggested decision. `finding`: SI / NO hallazgo, informative. */
export const KIND = Object.freeze({ CRITERION: 'criterion', FINDING: 'finding' });

const criterion = (key, label, extra = {}) => ({ key, label, kind: KIND.CRITERION, modalities: null, ...extra });
const finding = (key, label) => ({ key, label, kind: KIND.FINDING, modalities: null });

export const LEGAL_SECTIONS = Object.freeze([
  {
    id: 'poder',
    title: 'Poder y solicitante',
    items: [
      criterion('poder_legitimado', 'Quien otorga el poder está legitimado'),
      criterion('poder_notariado', 'Debidamente notariado y con presentación personal'),
      criterion('poder_corresponde', 'El mandato corresponde con la actuación solicitada'),
      criterion('poder_firmado', 'Firmado por poderdante y apoderado'),
      criterion('solicitante_firma', 'El responsable firmó con firma autógrafa'),
      criterion('solicitante_identidad', 'Aportó documento de identidad'),
    ],
  },
  {
    id: 'clt',
    title: 'Certificado de libertad y tradición',
    items: [
      criterion('clt_vigente', 'Expedido hasta 30 días antes de la radicación'),
    ],
  },
  {
    id: 'anotaciones',
    title: 'Anotaciones del certificado',
    description: 'Marque Sí cuando el certificado registra la anotación. Los hallazgos no deciden por sí solos: valórelos en las observaciones.',
    items: [
      finding('anot_bic', 'Bien de interés cultural'),
      finding('anot_utilidad_publica', 'Afectación por utilidad pública'),
      finding('anot_litigio', 'Demanda, embargo o litigio en curso'),
      finding('anot_rph', 'Sometido a régimen de propiedad horizontal'),
      finding('anot_baldio', 'Adjudicación de baldíos'),
      finding('anot_derechos_reales', 'Derechos reales o limitaciones al dominio (servidumbre, hipoteca, usufructo)'),
    ],
  },
  {
    id: 'documentacion',
    title: 'Documentación (Res. 1025/2021 arts. 1 y 4)',
    items: [
      criterion('doc_fun', 'Formulario único nacional diligenciado'),
      criterion('doc_predial', 'Declaración del impuesto predial del año; la dirección coincide con el certificado de libertad'),
      criterion('doc_plano_topografico', 'Plano topográfico antes y después, amojonado y alinderado, con cuadro de áreas'),
      criterion('doc_plano_base', 'Plano base de la urbanización o legalización', { modalities: [MODALITIES.RELOTEO] }),
      criterion('doc_excepcion_uaf', 'Justificación de la excepción a la UAF (art. 45 Ley 160 de 1994)', { modalities: [MODALITIES.RURAL] }),
    ],
  },
  {
    id: 'procedibilidad',
    title: 'Procedibilidad',
    items: [
      criterion('proc_tradicion', 'La tradición no corresponde a adjudicación de baldíos: títulos debidamente inscritos'),
      criterion('proc_destinacion', 'La destinación de los predios resultantes corresponde al POT y a la normativa ambiental'),
      criterion('proc_uaf', 'Los predios resultantes cumplen la UAF o la unidad mínima de actuación (mínimo 2 ha netas, art. 414 POT Bucaramanga)', { modalities: [MODALITIES.RURAL] }),
      criterion('proc_situacion_urbana', 'Se presenta alguna situación del art. 2.2.6.1.1.6 que permite subdividir en suelo urbano', { modalities: [MODALITIES.URBANA] }),
      criterion('proc_reloteo', 'El predio está previamente urbanizado o legalizado', { modalities: [MODALITIES.RELOTEO] }),
    ],
  },
]);

export const ARC_PLANIMETRY_SECTION = Object.freeze({
  id: 'planimetria',
  title: 'Planimetría',
  items: [
    criterion('a_area_predios', 'a. Presenta el área de los predios'),
    criterion('b_area_clt', 'b. El área del predio de mayor extensión está inscrita en el certificado de libertad'),
    criterion('c_suma_areas', 'c. El área de los predios resultantes suma el área del predio de mayor extensión'),
    criterion('d_linderos_tecnicos', 'd. Presenta los linderos técnicos de los predios'),
    criterion('e_amojonado', 'e. Los predios están amojonados'),
    criterion('f_sistema_internacional', 'f. Las medidas están expresadas en el sistema internacional de unidades'),
    criterion('g_magna_sirgas', 'g. Está referido al Datum Magna Sirgas / origen nacional'),
    criterion('h_numero_predial', 'h. Indica el número predial'),
    criterion('i_nomenclatura', 'i. Indica la nomenclatura del predio'),
    criterion('j_clase_licencia', 'j. Identifica la clase y la modalidad de la licencia'),
    criterion('k_firmado', 'k. Firmado por profesionales idóneos: topógrafo; arquitecto en reloteo'),
  ],
});

export const ARC_NORM_SECTION = Object.freeze({
  id: 'norma',
  title: 'Norma urbana',
  modalities: [MODALITIES.URBANA, MODALITIES.RELOTEO],
  items: [
    criterion('norma_area_minima', 'Los predios resultantes cumplen el área mínima de lote (cuadro 43 POT)', { modalities: [MODALITIES.URBANA, MODALITIES.RELOTEO] }),
    criterion('norma_frente_minimo', 'Los predios resultantes cumplen el frente mínimo de lote', { modalities: [MODALITIES.URBANA, MODALITIES.RELOTEO] }),
    criterion('norma_frente_via', 'Frente sobre vía pública vehicular o peatonal, sin acceso por zonas verdes o comunales', { modalities: [MODALITIES.URBANA, MODALITIES.RELOTEO] }),
  ],
});

export const ARC_SECTIONS = Object.freeze([ARC_PLANIMETRY_SECTION, ARC_NORM_SECTION]);

const appliesTo = (modalities, modality) => !modality || !Array.isArray(modalities) || modalities.includes(modality);

/** Sections and items that apply to `modality`. `null` (unknown modality) keeps everything. */
export function visibleSections(sections, modality) {
  return sections
    .filter(section => appliesTo(section.modalities, modality))
    .map(section => ({ ...section, items: section.items.filter(item => appliesTo(item.modalities, modality)) }))
    .filter(section => section.items.length > 0);
}

export const itemsOf = sections => sections.flatMap(section => section.items);
export const criterionKeys = sections => itemsOf(sections).filter(item => item.kind === KIND.CRITERION).map(item => item.key);

/**
 * Suggested decision for the given criteria keys: `no_procedente` as soon as one is NO,
 * `procedente` when every key is SI or NA, `null` while some are unanswered. Advisory only.
 */
export function suggestDecision(criteria, keys) {
  const values = (keys || []).map(key => criteria?.[key]);
  if (values.some(value => value === ANSWERS.NO)) return DECISIONS.NO_PROCEDENTE;
  if (values.length && values.every(value => value === ANSWERS.SI || value === ANSWERS.NA)) return DECISIONS.PROCEDENTE;
  return null;
}

function latestByVersion(rows, version) {
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
  if (!list.length) return null;
  if (version !== undefined && version !== null && version !== '') {
    const match = list.find(row => String(row?.version) === String(version));
    if (match) return match;
  }
  return list.reduce((latest, row) => (Number(row?.version) || 0) >= (Number(latest?.version) || 0) ? row : latest, list[0]);
}

/**
 * Modality of the subdivision from the FUN: `fun_1s` row of `version` (latest version when
 * omitted or missing), field `m_sub`. Returns null when absent or when several modalities are
 * marked, so the caller shows every criterion.
 */
export function modalityFromFun(fun, version) {
  if (!fun || typeof fun !== 'object') return null;
  const fun1 = latestByVersion(fun.fun_1s, version) || fun.fun_1 || null;
  const raw = fun1?.m_sub ?? fun['fun_1s.m_sub'];
  if (raw === undefined || raw === null) return null;
  const tokens = (Array.isArray(raw) ? raw : String(raw).split(/[;,|]/))
    .map(token => String(token ?? '').trim().toUpperCase())
    .filter(Boolean)
    .flatMap(token => (/^[A-C]+$/.test(token) ? token.split('') : [token.charAt(0)]));
  const modalities = [...new Set(tokens.map(code => M_SUB_MODALITY[code]).filter(Boolean))];
  return modalities.length === 1 ? modalities[0] : null;
}

const VALID_ANSWERS = new Set(Object.values(ANSWERS));
const VALID_DECISIONS = new Set(Object.values(DECISIONS));

export const EMPTY_REVIEW = Object.freeze({ criteria: {}, notes: {}, observations: '', decision: null });

/** Normalizes a stored step json (object, single or double-encoded string) to the contract shape. */
export function normalizeReview(json) {
  let value = json;
  for (let pass = 0; pass < 2 && typeof value === 'string'; pass += 1) {
    try {
      value = JSON.parse(value);
    } catch {
      value = null;
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...EMPTY_REVIEW, criteria: {}, notes: {} };

  const criteria = {};
  Object.entries(value.criteria && typeof value.criteria === 'object' ? value.criteria : {}).forEach(([key, answer]) => {
    if (VALID_ANSWERS.has(answer)) criteria[key] = answer;
  });
  const notes = {};
  Object.entries(value.notes && typeof value.notes === 'object' ? value.notes : {}).forEach(([key, note]) => {
    if (typeof note === 'string' && note.trim()) notes[key] = note;
  });
  return {
    criteria,
    notes,
    observations: typeof value.observations === 'string' ? value.observations : '',
    decision: VALID_DECISIONS.has(value.decision) ? value.decision : null,
  };
}

/** Builds the json to persist, keeping only the keys shown for the current modality. */
export function buildReviewJson(review, keys) {
  const allowed = new Set(keys);
  const criteria = {};
  const notes = {};
  Object.entries(review?.criteria || {}).forEach(([key, answer]) => {
    if (allowed.has(key) && VALID_ANSWERS.has(answer)) criteria[key] = answer;
  });
  Object.entries(review?.notes || {}).forEach(([key, note]) => {
    const text = typeof note === 'string' ? note.trim() : '';
    if (allowed.has(key) && text) notes[key] = text;
  });
  return {
    criteria,
    notes,
    observations: typeof review?.observations === 'string' ? review.observations.trim() : '',
    decision: VALID_DECISIONS.has(review?.decision) ? review.decision : null,
  };
}

/** Step `id_public` of `version` inside a record's step list. */
export function findStep(steps, idPublic, version) {
  const list = Array.isArray(steps) ? steps : [];
  return list.find(step => step?.id_public === idPublic && String(step?.version) === String(version)) || null;
}

export const PROFESSIONAL_RESPONSIBILITIES = [
    { id: 'urbanizador', label: 'Urbanizador y/o parcelador', roles: ['URBANIZADOR/PARCELADOR', 'URBANIZADOR O CONSTRUCTOR RESPONSABLE'] },
    { id: 'director', label: 'Director de la construcción', roles: ['DIRECTOR DE LA CONSTRUCCION'] },
    { id: 'arquitecto', label: 'Arquitecto proyectista', roles: ['ARQUITECTO PROYECTISTA'] },
    { id: 'ingeniero_diseno', label: 'Ingeniero civil diseñador', roles: ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'] },
    { id: 'no_estructurales', label: 'Diseñador de elementos no estructurales', roles: ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES'] },
    { id: 'geotecnista', label: 'Ingeniero civil geotecnista', roles: ['INGENIERO CIVIL GEOTECNISTA'] },
    { id: 'topografo', label: 'Ingeniero/topógrafo', roles: ['INGENIERO TOPOGRAFO Y/O TOPOGRAFO'] },
    { id: 'revisor', label: 'Revisor independiente de diseños', roles: ['REVISOR INDEPENDIENTE DE LOS DISENOS ESTRUCTURALES'] },
];

export const REQUIRED_EXPERIENCE_YEARS = {
    urbanizador: null,
    director: 3,
    arquitecto: null,
    ingeniero_diseno: 5,
    no_estructurales: 3,
    geotecnista: 5,
    topografo: null,
    revisor: 5,
};

const normalizeRole = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

const ROLE_REQUIRED_EXPERIENCE_YEARS = Object.fromEntries([
    ['URBANIZADOR/PARCELADOR', null],
    ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', null],
    ['DIRECTOR DE LA CONSTRUCCION', 3],
    ['ARQUITECTO PROYECTISTA', null],
    ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL', 5],
    ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES', 3],
    ['INGENIERO CIVIL GEOTECNISTA', 5],
    ['INGENIERO TOPOGRAFO Y/O TOPÓGRAFO', null],
    ['REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES', 5],
    ['OTROS PROFESIONALES ESPECIALISTAS', null],
].map(([role, years]) => [normalizeRole(role), years]));

export const getRequiredExperienceYears = role => {
    const requirements = String(role || '')
        .split(',')
        .map(normalizeRole)
        .filter(Boolean)
        .map(normalizedRole => ROLE_REQUIRED_EXPERIENCE_YEARS[normalizedRole]);

    if (!requirements.length || requirements.some(requiredYears => requiredYears === undefined)) return undefined;
    return requirements.reduce((maximum, requiredYears) => Number.isInteger(requiredYears)
        ? Math.max(maximum, requiredYears)
        : maximum, 0) || null;
};

export const DOCUMENT_COLUMNS = ['Cédula', 'Matrícula', 'Certificado de vigencia', 'Hoja de vida', 'Estudios de postgrado', 'Certificados'];
export const CHECK_COLUMNS = [
    { id: 'fun_signature', label: 'Original en el FUN', legacyIndex: 1 },
    { id: 'plan_signature', label: 'Coincide en los planos' },
    { id: 'experience', label: 'Acreditó experiencia', legacyIndex: 2 },
    { id: 'registration', label: 'Matrícula vigente', legacyIndex: 0 },
];

export const CELL_STATES = ['pending', 'cumple', 'no_cumple', 'no_aplica'];
export const STATE_META = {
    pending: { label: 'Pendiente', glyph: '', className: 'pending' },
    cumple: { label: 'Cumple', glyph: '✓', className: 'cumple' },
    no_cumple: { label: 'No cumple', glyph: '✕', className: 'noCumple' },
    no_aplica: { label: 'No aplica', glyph: '–', className: 'noAplica' },
};

import { regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
import { NEGATIVE_PROCESS_TITLE } from '../hooks/useClocksManager';

const STEPS_TO_CHECK = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];

// --- GENERADORES DE SECCIONES DINÁMICAS ---
const getSuspensionClocks = (suspensionData, type) => {
    if (!suspensionData.exists) return [];
    const [startState, endState] = type === 'pre' ? [300, 350] : [301, 351];
    const title = type === 'pre' ? 'SUSPENSIÓN ANTES DEL ACTA' : 'SUSPENSIÓN DESPUÉS DEL ACTA';

    return [
        { title },
        {
            state: startState, name: 'Inicio de Suspensión', editableDate: true, hasConsecutivo: false, hasAnnexSelect: true,
            suspensionInfo: { data: suspensionData, type }
        },
        {
            state: endState, name: 'Fin de Suspensión', editableDate: true, hasConsecutivo: false, hasAnnexSelect: true,
            spentDaysConfig: { startState: type === 'pre' ? 300 : 301 }
        },
    ];
};

const getExtensionClocks = (extensionData) => {
    if (!extensionData.exists) return [];
    return [
        { title: 'PRÓRROGA POR COMPLEJIDAD' },
        { state: 400, name: 'Inicio de Prórroga', editableDate: true, hasConsecutivo: false, hasAnnexSelect: true },
        // La fecha de fin siempre es editable si el inicio existe
        { 
            state: 401, name: 'Fin de Prórroga', editableDate: true, hasConsecutivo: false, hasAnnexSelect: true, 
            limit: [[400, 22]], // Límite de 22 días desde el inicio
            spentDaysConfig: { startState: 400 } 
        },
    ];
};

const getDesistClocks = (version, getClockVersion) => {
    const hasDesistProcess = getClockVersion(-5, version) || getClockVersion(-6, version);
    if (!hasDesistProcess) return [];
    return [
        { title: `DESISTIDO POR: ${NEGATIVE_PROCESS_TITLE[version] || 'MOTIVO NO ESPECIFICADO'}` },
        { state: STEPS_TO_CHECK, version: version, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, optional: true }
    ];
};

// --- DEFINICIONES DE SECCIONES ESTÁTICAS ---
const extraClocks = (props) => {
    const { currentItem, child1, getClock, getClockVersion, viaTime, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension } = props;
    
    if (regexChecker_isOA_2(child1)) return []; // Simplificación para OA

    const acta1 = getClock(30);
    const requereCorr = () => acta1?.desc?.includes('NO CUMPLE');
    const presentExt = () => !!getClock(34)?.date_start;
    const fun_type = FUN_0_TYPE_TIME[currentItem.type] ?? 45;

    // Determinar dónde mostrar las suspensiones y prórrogas
    const preActaSusp = getSuspensionClocks(suspensionPreActa, 'pre');
    const postActaSusp = acta1 ? getSuspensionClocks(suspensionPostActa, 'post') : [];
    
    const preActaExt = !acta1 || (extension.exists && extension.start?.date_start < acta1.date_start)
        ? getExtensionClocks(extension) : [];
    const postActaExt = acta1 && extension.exists && extension.start?.date_start >= acta1.date_start
        ? getExtensionClocks(extension) : [];

    return [
      { title: 'RADICACIÓN' },
      { state: false, name: 'Radicación', desc: "Tiempo de Creación en el sistema", manualDate: currentItem.date, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 3, name: 'Expensas Fijas', desc: "Pago de Expensas Fijas", editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, spentDaysConfig: { startState: false, referenceDate: currentItem.date } },
      { state: -1, name: 'Incompleto', desc: false, editableDate: false, limit: [[3, 30]], hasConsecutivo: false, hasAnnexSelect: false, icon: "empty", spentDaysConfig: { startState: 3 } },

      { state: 502, name: 'Legal y debida forma', desc: "Último día en el que se completó la documentación requerida", editableDate: true, limit: regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]], hasConsecutivo: false, hasAnnexSelect: false, rest:2, spentDaysConfig: { startState: regexChecker_isOA_2(child1) ? 4 : 3 } },
      { state: 501, name: 'Declaracion en legal y debida forma', desc: "Fecha de documento legal y debida forma", editableDate: true, limit: [[502, 1]], hasConsecutivo: false, hasAnnexSelect: false, spentDaysConfig: { startState: 502 } },
      { state: 5, name: 'Radicación en superintendencia', desc: "Radicación del legal y debida forma en la superintendencia", editableDate: true, limit: [[501, 1], [502, 1], regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]]], hasConsecutivo: false, hasAnnexSelect: false, spentDaysConfig: { startState: [501, 502, regexChecker_isOA_2(child1) ? 4 : 3] } },
      { state: 503, name: 'Instalación de la valla', desc: false, editableDate: true, limit: [[5, 5]], hasConsecutivo: false, hasAnnexSelect: false, spentDaysConfig: { startState: 5 } },
      ...getDesistClocks(-1, getClockVersion),
      ...getDesistClocks(-2, getClockVersion),
      ...preActaSusp,
      ...preActaExt,
      { title: 'ACTA PARTE 1: OBSERVACIONES' },
      { state: 30, name: 'Acta Parte 1: Observaciones', desc: "Acta de Observaciones inicial", limit: [[5, fun_type]], spentDaysConfig: { startState: 5 } },
      { state: 31, name: 'Citación (Observaciones)', desc: "Citación para Observaciones", limit: [[30, 5]], hasConsecutivo: false, hasAnnexSelect: false, spentDaysConfig: { startState: 30 } },
      { state: 32, name: 'Notificación (Observaciones)', desc: "Notificación de Observaciones", limit: [[31, 5]], spentDaysConfig: { startState: 31 } },
      { state: 33, name: 'Notificación por aviso (Observaciones)', desc: "Notificación por aviso de Observaciones", limit: [[31, 10]], icon: "empty", spentDaysConfig: { startState: 31 } },
      { state: 34, name: 'Prórroga correcciones', desc: "Prórroga para presentar correcciones", limit: [ [[33, 32], 30], [[30], 30] ], icon: "empty", hasConsecutivo: false, hasAnnexSelect: true, spentDaysConfig: { startState: [33, 32] } },
      { state: 35, name: 'Radicación de Correcciones', desc: requereCorr() ? "Radicación de documentos corregidos" : false, limit: [ [[33, 32], presentExt() ? 45 : 30] ], icon: requereCorr() ? undefined : "empty", hasConsecutivo: false, hasAnnexSelect: false, spentDaysConfig: { startState: 30 } },
      ...postActaSusp,
      ...postActaExt,
      { title: 'ACTA PARTE 2: CORRECCIONES' },
      { state: 49, name: 'Acta Parte 2: Correcciones', desc: requereCorr() ? "Acta de revisión de correcciones" : false, limit: [[35, 50]], limitValues: viaTime, icon: requereCorr() ? undefined : "empty", spentDaysConfig: { startState: 35 } },
      ...getDesistClocks(-3, getClockVersion),
      ...getDesistClocks(-5, getClockVersion),
      { title: 'ACTA DE VIABILIDAD Y LIQUIDACIÓN' },
      { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', desc: "Tramite de viabilidad Licencia", limit: false, spentDaysConfig: { startState: 49 } },
      { state: 55, name: 'Citación (Viabilidad)', desc: "Comunicación o Requerimiento para el tramite de viabilidad de Licencia", limit: [[61, 5]], spentDaysConfig: { startState: 61 } },
      { state: 56, name: 'Notificación (Viabilidad)', desc: "Se le notifica al solicitante del Tramite de viabilidad Licencia", limit: [[55, 5]], spentDaysConfig: { startState: 55 } },
      { state: 57, show: false, name: 'Notificación por aviso (Viabilidad)', desc: "El solicitante NO se presento para el Tramite de viabilidad Licencia, fue informado por otros medios", limit: [[55, 10]], icon: "empty", spentDaysConfig: { startState: 55 } },
    ]
}

const paymentsClocks = (props) => {
    const { child1, getClockVersion, namePayment, conGI } = props;
    const conOA = regexChecker_isOA_2(child1);
    return [
        { title: 'PAGOS' },
        { state: 62, name: 'Expensas Variables', desc: "Pago de Expensas Variables", limit: [[49, 30]], show: conOA, spentDaysConfig: { startState: 49 } },
        { state: 63, name: namePayment, desc: "Pago de Impuestos Municipales", limit: [[49, 30]], show: conOA, spentDaysConfig: { startState: 49 } },
        { state: 64, name: 'Estampilla PRO-UIS', desc: "Pago de Estampilla PRO-UIS", limit: [[49, 30]], spentDaysConfig: { startState: 49 } },
        { state: 65, name: 'Deberes Urbanísticos', desc: "Pago de Deberes Urbanísticos", limit: [[49, 30]], show: !conGI, spentDaysConfig: { startState: 49 } },
        { state: 69, name: 'Radicacion de último pago', desc: "Último pago realizado", limit: [[[56, 57], 30]], spentDaysConfig: { startState: [56, 57] } },
        ...getDesistClocks(-4, getClockVersion),
    ];
};

const finalClocks = () => [
    { title: 'RESOLUCIÓN' },
    { state: 70, name: "Acto Administrativo / Resolución ", desc: "Expedición Acto Administrativo ", limit: [[69, 5]], spentDaysConfig: { startState: 69 } },
    { state: 71, name: "Comunicación o Requerimiento(Resolución)", desc: "Comunicación para notificar al solicitante de Acto Administrativo", spentDaysConfig: { startState: 70 } },
    { state: 72, name: "Notificación (Resolución)", desc: "Se le notifica al solicitante del Acto Administrativo", limit: [[71, 5]], spentDaysConfig: { startState: 71 } },
    { state: 73, name: "Notificación por aviso (Resolución)", desc: "El solicitante NO se presento para el Acto Administrativo, fue informado por otros medios", limit: [[71, 10]], spentDaysConfig: { startState: 71 } },
    { state: 731, name: "Notificación (Planeación)", desc: "Se notificar a la oficina de planeación", limit: [[71, 5]], spentDaysConfig: { startState: 71 } },
    { state: 730, name: "Renuncia de Términos", desc: "Se renuncia a los términos", },
    { title: 'RECURSO' },
    { state: 74, name: "Recurso", desc: "Se presenta recurso", limit: [[71, 15]], spentDaysConfig: { startState: 71 } },
    { state: 75, name: "Resuelve Recurso", desc: "El recurso se resuelve", limit: [[74, 30]], requiredClock: 74, spentDaysConfig: { startState: 74 } },
    { state: 751, name: "Comunicación o Requerimiento(Recurso)", desc: "Comunicación para notificar al solicitante de Recurso", limit: [[74, 5]], requiredClock: 74, spentDaysConfig: { startState: 74 } },
    { state: 752, name: "Notificación (Recurso)", desc: "Se le notifica al solicitante del Recurso", limit: [[751, 5]], requiredClock: 74, spentDaysConfig: { startState: 751 } },
    { state: 733, name: "Notificación por aviso (Recurso)", desc: "El solicitante NO se presento para el Recurso, fue informado por otros medios", limit: [[751, 10]], requiredClock: 74, spentDaysConfig: { startState: 751 } },
    { state: 762, name: "Traslado Recurso", desc: "Se traslada el recurso", limit: [[75, 5]], requiredClock: 74, spentDaysConfig: { startState: 75 } },
    { state: 76, name: "Apelación (Planeación)", desc: "El recurso se resuelve por planeación", limit: [[74, 30]], requiredClock: 74, spentDaysConfig: { startState: 74 } },
    { state: 761, name: "Recepción Notificación (Planeación)", desc: "Se recibe el recurso de planeación", requiredClock: 74 },
    { title: 'LICENCIA' },
    { state: 85, name: "Publicación", desc: "Se publica la Licencia", spentDaysConfig: { startState: 99 } },
    { state: 99, name: "Ejecutoria - Licencia", desc: "Expedición de Licencia", limit: [[[72, 73], 10]], spentDaysConfig: { startState: [72, 73] } },
    { state: 98, name: "Entrega de Licencia", desc: "La licencia fue entregada oficialmente", spentDaysConfig: { startState: 99 } },
];


// --- FUNCIÓN PRINCIPAL QUE ENSAMBLA TODO ---
export const generateClocks = (props) => {
    return [
        ...extraClocks(props),
        ...paymentsClocks(props),
        ...finalClocks(props),
    ];
};
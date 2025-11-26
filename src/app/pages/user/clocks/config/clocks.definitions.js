import { regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
import { NEGATIVE_PROCESS_TITLE } from '../hooks/useClocksManager';
import moment from 'moment';

const STEPS_TO_CHECK = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];

// --- GENERADORES DE SECCIONES DINÁMICAS ---
const getSuspensionClocks = (suspensionData, type) => {
    if (!suspensionData.exists) return [];
    const [startState, endState] = type === 'pre' ? [300, 350] : [301, 351];
    const title = type === 'pre' ? 'SUSPENSIÓN ANTES DEL ACTA' : 'SUSPENSIÓN DESPUÉS DE CORRECCIONES';

    return [
        { title },
        {
            state: startState, 
            name: 'Inicio de Suspensión', 
            desc: `Inicio de suspensión de términos (${type === 'pre' ? 'Pre-Acta' : 'Post-Correcciones'})`,
            editableDate: true, 
            hasConsecutivo: false, 
            hasAnnexSelect: true,
        },
        {
            state: endState, 
            name: 'Fin de Suspensión', 
            desc: `Finalización de suspensión de términos (${type === 'pre' ? 'Pre-Acta' : 'Post-Correcciones'})`,
            editableDate: true, 
            hasConsecutivo: false, 
            hasAnnexSelect: true,
            spentDaysConfig: { startState: type === 'pre' ? 300 : 301 }
        },
    ];
};

const getExtensionClocks = (extensionData) => {
    if (!extensionData.exists) return [];
    return [
        { title: 'PRÓRROGA POR COMPLEJIDAD' },
        { 
            state: 400, 
            name: 'Inicio de Prórroga', 
            desc: 'Inicio de prórroga por complejidad técnica (hasta 22 días hábiles)',
            editableDate: true, 
            hasConsecutivo: false, 
            hasAnnexSelect: true 
        },
        { 
            state: 401, 
            name: 'Fin de Prórroga', 
            desc: 'Finalización de prórroga por complejidad técnica',
            editableDate: true, 
            hasConsecutivo: false, 
            hasAnnexSelect: true, 
            limit: [[400, 21]],
            spentDaysConfig: { startState: 400 } 
        },
    ];
};

const getDesistClocks = (version, getClockVersion) => {
    const hasDesistProcess = getClockVersion(-5, version) || getClockVersion(-6, version);
    if (!hasDesistProcess) return [];
    return [
        { title: `DESISTIDO POR: ${NEGATIVE_PROCESS_TITLE[version] || 'MOTIVO NO ESPECIFICADO'}` },
        { 
            state: STEPS_TO_CHECK, 
            version: version, 
            editableDate: false, 
            hasConsecutivo: false, 
            hasAnnexSelect: false, 
            optional: true 
        }
    ];
};

// --- DEFINICIONES DE SECCIONES ESTÁTICAS ---
const extraClocks = (props) => {
    const { currentItem, child1, getClock, getClockVersion, viaTime, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension } = props;
    
    if (regexChecker_isOA_2(child1)) return [];

    const acta1 = getClock(30);
    const requereCorr = () => acta1?.desc?.includes('NO CUMPLE');
    const presentExt = () => !!getClock(34)?.date_start;
    const fun_type = FUN_0_TYPE_TIME[currentItem.type] ?? 45;

    // Determinar ubicación de suspensiones y prórrogas
    const preActaSusp = getSuspensionClocks(suspensionPreActa, 'pre');
    const postActaSusp = getSuspensionClocks(suspensionPostActa, 'post');
    
    // La prórroga se muestra donde esté ubicada temporalmente
    let condition = !acta1 || (extension.exists && extension.start?.date_start && (!acta1.date_start || moment(extension.start.date_start).isBefore(acta1.date_start)));
    const preActaExt = !acta1 || (extension.exists && extension.start?.date_start && (!acta1.date_start || moment(extension.start.date_start).isBefore(acta1.date_start)))
        ? getExtensionClocks(extension) : [];
    const postActaExt = acta1 && extension.exists && extension.start?.date_start && moment(extension.start.date_start).isSameOrAfter(acta1.date_start)
        ? getExtensionClocks(extension) : [];

    return [
      { title: 'RADICACIÓN Y LEGAL Y DEBIDA FORMA' },
      { 
        state: false, 
        name: 'Radicación', 
        desc: "Fecha de creación del expediente en el sistema", 
        manualDate: currentItem.date, 
        editableDate: false, 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
      },
      { 
        state: 3, 
        name: 'Expensas Fijas', 
        desc: "Pago de expensas fijas (inicio del plazo de 30 días para completar documentación)", 
        editableDate: false, 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: false, referenceDate: currentItem.date } 
      },
      { 
        state: -1, 
        name: 'Incompleto', 
        desc: "Desistimiento por no completar documentación en 30 días hábiles", 
        editableDate: false, 
        limit: [[3, 30]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        icon: "empty", 
        spentDaysConfig: { startState: 3 } 
      },
      { 
        state: 502, 
        name: 'Legal y debida forma', 
        desc: "Último día en que se completó toda la documentación requerida", 
        editableDate: true, 
        limit: regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        rest: 2, 
        spentDaysConfig: { startState: regexChecker_isOA_2(child1) ? 4 : 3 } 
      },
      { 
        state: 501, 
        name: 'Declaración en legal y debida forma', 
        desc: "Fecha del documento formal de legal y debida forma", 
        editableDate: true, 
        limit: [[502, 1]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: 502 } 
      },
      { 
        state: 5, 
        name: 'Radicación en superintendencia', 
        desc: "Radicación del expediente en legal y debida forma ante la superintendencia (INICIA PLAZO DE CURADURÍA)", 
        editableDate: true, 
        limit: [[501, 1], [502, 1], regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: [501, 502, regexChecker_isOA_2(child1) ? 4 : 3] } 
      },
      { 
        state: 503, 
        name: 'Instalación de la valla', 
        desc: "Instalación de la valla informativa del proyecto", 
        editableDate: true, 
        limit: [[5, 5]],
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: 5 } 
      },
      ...getDesistClocks(-1, getClockVersion),
      ...getDesistClocks(-2, getClockVersion),
      ...preActaSusp,
      ...preActaExt,
      
      { title: 'ACTA PARTE 1: OBSERVACIONES' },
      { 
        state: 30, 
        name: 'Acta Parte 1: Observaciones', 
        desc: "Acta de observaciones inicial (indica si CUMPLE o NO CUMPLE)", 
        limit: [[5, fun_type]], 
        spentDaysConfig: { startState: 5 } 
      },
      { 
        state: 31, 
        name: 'Citación (Observaciones)', 
        desc: "Citación para notificar el acta de observaciones", 
        limit: [[30, 5]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: 30 } 
      },
      { 
        state: 32, 
        name: 'Notificación Personal (Observaciones)', 
        desc: "Notificación personal del acta de observaciones", 
        limit: [[31, 5]], 
        spentDaysConfig: { startState: 31 } 
      },
      { 
        state: 33, 
        name: 'Notificación por Aviso (Observaciones)', 
        desc: "Notificación por aviso del acta de observaciones (si no se logró notificación personal)", 
        limit: [[31, 10]], 
        icon: "empty", 
        spentDaysConfig: { startState: 31 } 
      },
      { 
        state: 34, 
        name: 'Prórroga de correcciones', 
        desc: "Prórroga para presentar correcciones (15 días adicionales sobre los 20 días base = 45 días totales)", 
        limit: [[[33, 32], 30]], //[[[33, 32], 30], [[30], 30]], 
        icon: "empty", 
        hasConsecutivo: false, 
        hasAnnexSelect: true, 
        spentDaysConfig: { startState: [33, 32] } 
      },
      { 
        state: 35, 
        name: 'Radicación de Correcciones', 
        desc: requereCorr() ? "Radicación de los documentos corregidos por el solicitante (CONTINÚA PLAZO DE CURADURÍA)" : false, 
        limit: [[[33, 32], presentExt() ? 45 : 30]], 
        icon: requereCorr() ? undefined : "empty", 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: [33, 32] } 
      },
      
      ...postActaSusp,
      ...postActaExt,
      
      { title: 'ACTA PARTE 2: REVISIÓN DE CORRECCIONES' },
      { 
        state: 49, 
        name: 'Acta Parte 2: Correcciones', 
        desc: requereCorr() ? "Acta de revisión de las correcciones presentadas" : false, 
        // limit: [[35, 50]], 
        limitValues: viaTime, 
        icon: requereCorr() ? undefined : "empty", 
        spentDaysConfig: { startState: 35 } 
      },
      ...getDesistClocks(-3, getClockVersion),
      ...getDesistClocks(-5, getClockVersion),
      
      { title: 'VIABILIDAD Y LIQUIDACIÓN' },
      { 
        state: 61, 
        name: 'Acto de Trámite de Licencia (Viabilidad)', 
        desc: "Acto de trámite de viabilidad de la licencia (FINALIZA PLAZO DE CURADURÍA)", 
        // limit: [[35, 50]], 
        limitValues: viaTime,
        spentDaysConfig: { startState: 49 } 
      },
      { 
        state: 55, 
        name: 'Citación (Viabilidad)', 
        desc: "Citación para notificar el acto de viabilidad", 
        limit: [[61, 5]], 
        spentDaysConfig: { startState: 61 } 
      },
      { 
        state: 56, 
        name: 'Notificación Personal (Viabilidad)', 
        desc: "Notificación personal del acto de viabilidad", 
        limit: [[55, 5]], 
        spentDaysConfig: { startState: 55 } 
      },
      { 
        state: 57, 
        show: false, 
        name: 'Notificación por Aviso (Viabilidad)', 
        desc: "Notificación por aviso del acto de viabilidad", 
        limit: [[55, 10]], 
        icon: "empty", 
        spentDaysConfig: { startState: 55 } 
      },
    ]
};

const paymentsClocks = (props) => {
    const { child1, getClockVersion, namePayment, conGI } = props;
    const conOA = regexChecker_isOA_2(child1);
    return [
        { title: 'PAGOS (PLAZO SOLICITANTE: 30 DÍAS)' },
        { 
            state: 62, 
            name: 'Expensas Variables', 
            desc: "Pago de expensas variables", 
            limit: [[[56, 57], 30]], 
            show: conOA, 
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 63, 
            name: namePayment, 
            desc: "Pago de impuestos municipales o delineación", 
            limit: [[[56, 57], 30]], 
            show: conOA, 
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 64, 
            name: 'Estampilla PRO-UIS', 
            desc: "Pago de estampilla PRO-UIS", 
            limit: [[[56, 57], 30]], 
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 65, 
            name: 'Deberes Urbanísticos', 
            desc: "Pago de deberes urbanísticos", 
            limit: [[[56, 57], 30]], 
            show: !conGI, 
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 69, 
            name: 'Radicación de último pago', 
            desc: "Radicación de todos los pagos requeridos (INICIA PLAZO RESOLUCIÓN)", 
            limit: [[[56, 57], 30]], 
            spentDaysConfig: { startState: [56, 57] } 
        },
        ...getDesistClocks(-4, getClockVersion),
    ];
};

const finalClocks = (props) => {
    const { getClock } = props;
    
    return [
        { title: 'RESOLUCIÓN (PLAZO CURADURÍA: 5 DÍAS)' },
        { 
            state: 70, 
            name: "Acto Administrativo / Resolución", 
            desc: "Expedición del acto administrativo de resolución", 
            limit: [[69, 5]], 
            spentDaysConfig: { startState: 69 } 
        },
        { 
            state: 71, 
            name: "Comunicación o Requerimiento (Resolución)", 
            desc: "Comunicación para notificar al solicitante del acto administrativo", 
            limit: [[70, 1]], 
            spentDaysConfig: { startState: 70 } 
        },
        { 
            state: 72, 
            name: "Notificación Personal (Resolución)", 
            desc: "Notificación personal del acto administrativo", 
            limit: [[71, 5]], 
            spentDaysConfig: { startState: 71 } 
        },
        { 
            state: 73, 
            name: "Notificación por Aviso (Resolución)", 
            desc: "Notificación por aviso del acto administrativo (si no se logró notificación personal)", 
            limit: [[71, 10]], 
            icon: "empty",
            spentDaysConfig: { startState: 71 } 
        },
        { 
            state: 731, 
            name: "Notificación a Planeación", 
            desc: "Notificación a la oficina de planeación municipal", 
            limit: [[71, 5]], 
            spentDaysConfig: { startState: 71 } 
        },
        { 
            state: 85, 
            name: "Publicación", 
            desc: "Publicación de la resolución (DEBE SER EL MISMO DÍA O MÁXIMO 1 DÍA DESPUÉS)", 
            limit: [[70, 1]], 
            spentDaysConfig: { startState: 70 } 
        },
        
        { title: 'RECURSO DE REPOSICIÓN (OPCIONAL - PLAZO SOLICITANTE: 10 DÍAS)' },
        { 
            state: 730, 
            name: "Renuncia de Términos", 
            desc: "El solicitante renuncia a los términos de ejecutoria (acelera el proceso)", 
            limit: [[[72, 73], 10]],
            icon: "empty",
            hasConsecutivo: false,
            hasAnnexSelect: true,
            spentDaysConfig: { startState: [72, 73] }
        },
        { 
            state: 74, 
            name: "Recurso de Reposición", 
            desc: "Presentación de recurso de reposición por el solicitante", 
            limit: [[[72, 73], 10]], 
            icon: "empty",
            spentDaysConfig: { startState: [72, 73] } 
        },
        { 
            state: 75, 
            name: "Resuelve Recurso", 
            desc: "Resolución del recurso de reposición", 
            limit: [[74, 30]], 
            requiredClock: 74, 
            spentDaysConfig: { startState: 74 } 
        },
        { 
            state: 751, 
            name: "Comunicación o Requerimiento (Recurso)", 
            desc: "Comunicación para notificar la resolución del recurso", 
            limit: [[75, 5]], 
            requiredClock: 74, 
            spentDaysConfig: { startState: 75 } 
        },
        { 
            state: 752, 
            name: "Notificación Personal (Recurso)", 
            desc: "Notificación personal de la resolución del recurso", 
            limit: [[751, 5]], 
            requiredClock: 74, 
            spentDaysConfig: { startState: 751 } 
        },
        { 
            state: 733, 
            name: "Notificación por Aviso (Recurso)", 
            desc: "Notificación por aviso de la resolución del recurso", 
            limit: [[751, 10]], 
            icon: "empty",
            requiredClock: 74, 
            spentDaysConfig: { startState: 751 } 
        },
        { 
            state: 762, 
            name: "Traslado de Recurso", 
            desc: "Traslado del recurso a otra entidad si aplica", 
            limit: [[75, 5]], 
            requiredClock: 74, 
            spentDaysConfig: { startState: 75 } 
        },
        { 
            state: 76, 
            name: "Apelación (Planeación)", 
            desc: "Apelación del recurso ante planeación municipal", 
            limit: [[74, 30]], 
            icon: "empty",
            requiredClock: 74, 
            spentDaysConfig: { startState: 74 } 
        },
        { 
            state: 761, 
            name: "Recepción Notificación (Planeación)", 
            desc: "Recepción de la notificación de planeación sobre la apelación", 
            icon: "empty",
            requiredClock: 74 
        },
        
        { title: 'EJECUTORIA Y ENTREGA (PLAZO CURADURÍA: 10 DÍAS + 1 DÍA)' },
        { 
            state: 99, 
            name: "Ejecutoria - Licencia", 
            desc: "Ejecutoria de la licencia (queda en firme)", 
            limit: [[[72, 73], 10]], 
            spentDaysConfig: { startState: [72, 73] } 
        },
        { 
            state: 98, 
            name: "Entrega de Licencia", 
            desc: "Entrega oficial de la licencia al solicitante (FINALIZA EL PROCESO)", 
            limit: [[99, 1]], 
            spentDaysConfig: { startState: 99 } 
        },
    ];
};

// --- FUNCIÓN PRINCIPAL QUE ENSAMBLA TODO ---
export const generateClocks = (props) => {
    return [
        ...extraClocks(props),
        ...paymentsClocks(props),
        ...finalClocks(props),
    ];
};
import { regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
import { NEGATIVE_PROCESS_TITLE } from '../hooks/useClocksManager';
import moment from 'moment';

const DESIST_CLOCKS = {
    '-50': { name: 'Inicio del proceso de desistimiento', desc: 'Inicio formal del proceso de desistimiento.' },
    '-6':  { name: 'Creación de Resolución', desc: 'Notificación mediante email.' },
    '-5':  { name: 'Citación', desc: 'Se inicia proceso de desistimiento.' },
    '-7':  { name: 'Notificación', desc: 'Contacto personal, electrónico o certificada.' },
    '-8':  { name: 'Notificación por aviso', desc: 'El solicitante no se presentó, se informa por aviso.' },
    '-10': { name: 'Interponer recurso', desc: 'El solicitante presenta o no el recurso.' },
    '-17': { name: 'Resolución frente a recurso', desc: 'Respuesta al recurso interpuesto.' },
    '-20': { name: 'Citación (2° vez)', desc: 'Citación adicional para informar la decisión.' },
    '-21': { name: 'Notificación por aviso (2° vez)', desc: 'Aviso al solicitante (2° vez).' },
    '-22': { name: 'Notificación (2° vez)', desc: 'Notificación personal/electrónica (2° vez).' },
    '-30': { name: 'Finalización', desc: 'El proceso de desistimiento ha finalizado oficialmente.' },
};

// Límites legales para cada evento de desistimiento
const getDesistLimit = (state) => {
    switch (String(state)) {
        case '-6':
        case '-5':
            // 5 días hábiles desde el inicio del desistimiento
            return [[-50, 5], [-5, 5]];
        case '-7':
        case '-8':
            // 5 días hábiles desde la resolución/citación
            return [[-6, 5]];
        case '-10':
            // 10 días hábiles desde la notificación (personal o aviso)
            return [[-7, 10], [-8, 10]];
        case '-21':
        case '-22':
            // 5 días hábiles desde la segunda citación
            return [[-20, 5]];
        default:
            return null;
    }
};

const buildDesistSection = (version, getClockVersion) => {
    const hasProcess = getClockVersion(-50, version) || getClockVersion(-5, version) || getClockVersion(-6, version);
    if (!hasProcess) return [];

    const title = `DESISTIMIENTO - ${NEGATIVE_PROCESS_TITLE[version] || 'MOTIVO NO ESPECIFICADO'}`;
    const stepsOrder = ['-50', '-6', '-5', '-7', '-8', '-10', '-17', '-20', '-21', '-22', '-30'];

    const section = [{ title }];
    stepsOrder.forEach((stateKey) => {
        const meta = DESIST_CLOCKS[stateKey];
        if (!meta) return;
        section.push({
            state: Number(stateKey),
            version,
            name: meta.name,
            desc: meta.desc,
            editableDate: true,
            hasAnnexSelect: true,
            optional: false,
            limit: getDesistLimit(stateKey),
        });
    });
    return section;
};

// --- GENERADORES DE SECCIONES DINÁMICAS ---
const getSuspensionClocks = (suspensionData, type) => {
    if (!suspensionData.exists) return [];
    const [startState, endState] = type === 'pre' ? [300, 350] : [301, 351];
    const title = type === 'pre' ? 'Suspensión antes del acta' : 'Suspensión después de correcciones';

    return [
        // { title },
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
        // { title: 'Prórroga por complejidad' },
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

// --- DEFINICIONES DE SECCIONES ESTÁTICAS ---
const extraClocks = (props) => {
    const { currentItem, child1, getClock, getClockVersion, viaTime, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, phaseOptions } = props;

    // Opciones para la fase de Estudio y Valla
    const estudioOptions = phaseOptions?.phase_estudio || { notificationType: 'notificar', byAviso: false };

    // Opciones para la fase de Revisión de Correcciones
    const correccionesOptions = phaseOptions?.phase_correcciones || { notificationType: 'notificar', byAviso: false };


    const getRadicacionFecha = () => {
        // 1. Usar "optional chaining" (?.) para acceder a la propiedad de forma segura.
        // Esto evita errores si `fun_law` no existe.
        const signString = currentItem?.fun_law?.sign;

        // 2. Verificar si el string existe y no está vacío.
        if (!signString) {
            return "Fecha no disponible";
        }

        // 3. Dividir el string por la coma para obtener un array.
        const signArray = signString.split(',');

        // 4. Verificar si el array tiene al menos dos elementos y devolver el segundo (la fecha).
        if (signArray.length > 1) {
            return signArray[1]; // Esta es la fecha
        }

        return "Fecha no encontrada";
    };

    // Obtener fecha de radicación de valla informativa y correlacionarla con el state apartado en la sección finalClocks
    
    if (regexChecker_isOA_2(child1)) return [];

    const acta1 = getClock(30);
    const requereCorr = () => acta1?.desc?.includes('NO CUMPLE');
    const presentExt = () => !!getClock(34)?.date_start;
    const fun_type = FUN_0_TYPE_TIME[currentItem.type] ?? 45;

    // Determinar ubicación de suspensiones y prórrogas
    const preActaSusp = getSuspensionClocks(suspensionPreActa, 'pre');
    const postActaSusp = getSuspensionClocks(suspensionPostActa, 'post');
    
    // La prórroga se muestra donde esté ubicada temporalmente
    const preActaExt = !acta1 || (extension.exists && extension.start?.date_start && (!acta1.date_start || moment(extension.start.date_start).isBefore(acta1.date_start)))
        ? getExtensionClocks(extension) : [];
    const postActaExt = acta1 && extension.exists && extension.start?.date_start && moment(extension.start.date_start).isSameOrAfter(acta1.date_start)
        ? getExtensionClocks(extension) : [];

    return [
      { title: 'Radicación de Legal y debida forma' },
      { 
        state: false, 
        name: 'Radicación', 
        desc: "Fecha de creación del expediente en el sistema", 
        manualDate: currentItem.date, 
        editableDate: false, 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        legalSupport: "DECRETO 1077 de 2015. ARTÍCULO 2.2.6.1.2.1.2 Radicación de la solicitud. Presentada la solicitud de licencia, se radicará y numerará consecutivamente, en orden cronológico de recibo, dejando constancia de los documentos aportados con la misma. Nota: El solicitante entrega los documentos. La Curaduría los recibe, les asigna un código de ingreso (Ej: VR 21-00000) y expide un soporte del inventario documental recibido.",
      },
      { 
        state: 3, 
        name: 'Liquidación y Pago del Cargo Fijo (Expensas)', 
        desc: "Pago de expensas fijas (inicio del plazo de 30 días para completar documentación)", 
        editableDate: false, 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        legalSupport: 'DECRETO 1077 de 2015. ARTÍCULO 2.2.6.6.8.5 Radicación de las solicitudes de licencias. Además de los requisitos contemplados en la Subsección 1 de la Sección 2 del Capítulo 1 del presente Título, será condición para la radicación ante las curadurías urbanas de toda solicitud de licencia de urbanización y construcción o sus modalidades, el pago al curador del cargo fijo "Cf" establecido en el presente decreto.',
        spentDaysConfig: { startState: false, referenceDate: currentItem.date } 
      },
      { 
        state: -1, 
        name: 'Radicación Incompleta', 
        desc: "Desiste por no completar documentación en 30 días hábiles", 
        editableDate: false, 
        limit: [[3, 30]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false,
        legalSupport: "DECRETO 1077 de 2015. ARTÍCULO 2.2.6.1.2.1.2 Radicación de la solicitud  (…) En caso de que la solicitud no se encuentre completa, se devolverá la documentación para completarla. Si el peticionario insiste, se radicará dejando constancia de este hecho y advirtiéndole que deberá allanarse a cumplir dentro de los treinta (30) días hábiles siguientes so pena de entenderse desistida la solicitud, lo cuál se hará mediante acto administrativo que ordene su archivo y contra el que procederá el recurso de reposición ante la autoridad que lo expidió. Nota: Se declara si faltan documentos. Se Informa al solicitante, indicando qué debe completar la documentación en un término no superior a 30 días hábiles, contados a partir de la radicación." ,
        icon: "empty", 
        spentDaysConfig: { startState: 3 } 
      },
      { 
        state: 5, 
        name: 'Radicación en Legal y debida forma', 
        desc: "Último día en que se completó toda la documentación requerida", 
        editableDate: true, 
        limit: regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        legalSupport: "DECRETO 1077 de 2015. ARTÍCULO 2.2.6.1.2.1.1 (…) PARÁGRAFO 1. Se entenderá que una solicitud de licencia o su modificación está radicada en Legal y debida forma si a la fecha de radicación se allega la totalidad de los documentos exigidos en el presente Capítulo, aun cuando estén sujetos a posteriores correcciones. (…) DECRETO 1077 de 2015. ARTÍCULO 2.2.6.1.2.3.1 Término para resolver las solicitudes de licencias, sus modificaciones y revalidación de licencias. Los curadores urbanos y la entidad municipal o distrital encargada del estudio, trámite y expedición de las licencias, según el caso. tendrán un plazo máximo de cuarenta y cinco (45) días hábiles para resolver las solicitudes de licencias y de modificación de licencia vigente pronunciándose sobre su viabilidad, negación o desistimiento contados desde la fecha en que la solicitud haya sido radicada en legal y debida forma. Nota: La curaduría cuenta según el sistema de categorización del proyecto un plazo que esta entre 20 y 45 días hábiles contados a partir de la radicación en legal y debida forma; en este periodo se debe realizar el proceso de revisión como el pronunciamiento sobre la solicitud",
        rest: 2, 
        spentDaysConfig: { startState: regexChecker_isOA_2(child1) ? 4 : 3 } 
      },
      { 
        state: 502,
        name: 'Declaración en legal y debida forma', 
        desc: "Fecha del documento formal de legal y debida forma", 
        editableDate: true, 
        limit: [[5, 1], regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: 502 },
        allowSchedule: true
      },
      { 
        state: 501, 
        name: 'Radicación en superintendencia', 
        desc: "Radicación del expediente en legal y debida forma ante la superintendencia (INICIA PLAZO DE CURADURÍA)", 
        editableDate: true, 
        limit: [[5, 2], regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]]],  // [501, 1], [502, 1],
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: [501, 502, regexChecker_isOA_2(child1) ? 4 : 3] },
        allowSchedule: true
      },
      { 
        state: 504, 
        name: 'Comunicación a vecinos', 
        desc: "COMUNICACIÓN A VECINOS)", 
        editableDate: true, 
        limit: [[5, 2], regexChecker_isOA_2(child1) ? [[4, -30]] : [[3, 30]]],  // [501, 1], [502, 1],
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: [501, 502, regexChecker_isOA_2(child1) ? 4 : 3] },
        allowSchedule: true
      },
      ...buildDesistSection('-1', getClockVersion),
      ...buildDesistSection('-2', getClockVersion),
    //   ...preActaExt,
      { title: 'Estudio y Observaciones' },
      ...preActaSusp,
      { 
        state: 503, 
        name: 'Instalación y Registro de la Valla Informativa', 
        desc: "Instalación de la valla informativa del proyecto", 
        editableDate: true, 
        limit: [[5, 5]],
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        legalSupport: "DECRETO 1077 de 2015. ARTÍCULO 2.2.6.1.2.2.1 PARÁGRAFO 1. Desde el día siguiente a la fecha de radicación en legal y debida forma de solicitudes de proyectos de parcelación, urbanización y construcción en cualquiera de sus modalidades, el peticionario de la licencia deberá instalar una valla resistente a la intemperie de fondo amarillo y letras negras (…) Nota: El funcionario a cargo de la radicación le informa al peticionario sobre el deber de publicidad de los actos de licenciamiento urbanístico que incluyen la valla informativa, la citación a los vecinos colindante y terceros interesados etc",
        spentDaysConfig: { startState: 5 },
        hasLegalAlarm: true
      },
      { 
        state: 30, 
        name: 'Acta Parte 1: Observaciones', 
        desc: "Acta de observaciones inicial (indica si CUMPLE o NO CUMPLE)", 
        limit: [[5, fun_type]], 
        spentDaysConfig: { startState: 5 },
        allowSchedule: true
      },
      { 
        state: 33, 
        name: 'Comunicación (Observaciones)', 
        desc: "Comunicación del acta de observaciones", 
        limit: [[30, 5]], 
        icon: "empty", 
        spentDaysConfig: { startState: 30 },
        allowSchedule: true,
        show: estudioOptions.notificationType==='comunicar',
      },
      { title: 'Notificación Observaciones', show: estudioOptions.notificationType !== 'comunicar' },
      {
        state: 31, 
        name: 'Citación (Observaciones)', 
        desc: "Citación para notificar el acta de observaciones", 
        limit: [[30, 5]], 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: 30 },
        allowSchedule: true,
        show: estudioOptions.notificationType === 'notificar',
      },
      { 
        state: 32, 
        name: 'Notificación Personal (Observaciones)', 
        desc: "Notificación personal del acta de observaciones", 
        limit: [[31, 5]], 
        spentDaysConfig: { startState: 31 },
        allowSchedule: true,
        show: estudioOptions.notificationType === 'notificar',
      },
      { 
        state: 33, 
        name: 'Notificación por Aviso (Observaciones)', 
        desc: "Notificación por aviso del acta de observaciones (si no se logró notificación personal)", 
        limit: [[32, 5]], 
        icon: "empty", 
        spentDaysConfig: { startState: 31 },
        allowSchedule: true,
        show: (estudioOptions.notificationType === 'notificar' && estudioOptions.byAviso),
      },
      { title: 'Correcciones del Solicitante' },
      {
        state: 34, 
        name: 'Prórroga de correcciones', 
        desc: "Prórroga para presentar correcciones (15 días adicionales sobre los 20 días base = 45 días totales)", 
        limit: estudioOptions.notificationType === 'comunicar' ? [[[30], 30]] : estudioOptions.byAviso ? [[[33], 30]] : [[[32], 30]], //[[[33, 32], 30]], //[[[33, 32], 30], [[30], 30]], 
        icon: "empty", 
        hasConsecutivo: false, 
        hasAnnexSelect: true, 
        spentDaysConfig: { startState: [33, 32] } 
      },
      { 
        state: 35, 
        name: 'Radicación de Correcciones', 
        desc: requereCorr() ? "Radicación de los documentos corregidos por el solicitante (CONTINÚA PLAZO DE CURADURÍA)" : false, 
        limit: estudioOptions.notificationType === 'comunicar' ? [[[30], presentExt() ? 45 : 30]] : estudioOptions.byAviso ? [[[33], presentExt() ? 45 : 30]] : [[[32], presentExt() ? 45 : 30]], 
        icon: requereCorr() ? undefined : "empty", 
        hasConsecutivo: false, 
        hasAnnexSelect: false, 
        spentDaysConfig: { startState: [33, 32] } 
      },
      { title: 'Revisión y Viabilidad' },
      ...postActaSusp,
      ...postActaExt,
      { 
        state: 49, 
        name: 'Acta Parte 2: Correcciones', 
        desc: requereCorr() ? "Acta de revisión de las correcciones presentadas" : false, 
        // limit: [[35, 50]], 
        limitValues: viaTime, 
        icon: requereCorr() ? undefined : "empty", 
        spentDaysConfig: { startState: 35 },
        allowSchedule: true
      },
      { 
        state: 61, 
        name: 'Acto de Trámite de Licencia (Viabilidad)', 
        desc: "Acto de trámite de viabilidad de la licencia (FINALIZA PLAZO DE CURADURÍA)", 
        // limit: [[35, 50]], 
        limitValues: viaTime,
        spentDaysConfig: { startState: 49 },
        allowSchedule: true 
      },
      { 
        state: 57, 
        // show: false, 
        name: 'Comunicación (Viabilidad)', 
        desc: "Comunicación del acto de viabilidad", 
        limit: [[55, 10]], 
        icon: "empty", 
        spentDaysConfig: { startState: 55 },
        allowSchedule: true,
        show: correccionesOptions.notificationType==='comunicar',
      },
      ...buildDesistSection('-3', getClockVersion),
      ...buildDesistSection('-5', getClockVersion),
      ...buildDesistSection('-6', getClockVersion),
      
      { title: "Notificación de Viabilidad", show: correccionesOptions.notificationType !== 'comunicar' },
      { 
        state: 55, 
        name: 'Citación (Viabilidad)', 
        desc: "Citación para notificar el acto de viabilidad", 
        limit: [[61, 5]], 
        spentDaysConfig: { startState: 61 },
        allowSchedule: true
      },
      { 
        state: 56, 
        name: 'Notificación Personal (Viabilidad)', 
        desc: "Notificación personal del acto de viabilidad", 
        limit: [[55, 5]], 
        spentDaysConfig: { startState: 55 },
        allowSchedule: true 
      },
      { 
        state: 57, 
        // show: false, 
        name: 'Notificación por Aviso (Viabilidad)', 
        desc: "Notificación por aviso del acto de viabilidad", 
        limit: [[55, 10]], 
        icon: "empty", 
        spentDaysConfig: { startState: 55 },
        allowSchedule: true,
        show: (correccionesOptions.notificationType === 'notificar' && correccionesOptions.byAviso),
      },
    ]
};

const paymentsClocks = (props) => {
    const { child1, getClockVersion, namePayment, conGI, phaseOptions } = props;
    const conOA = regexChecker_isOA_2(child1);
    // Opciones para la fase de Revisión de Correcciones
    const correccionesOptions = phaseOptions?.phase_correcciones || { notificationType: 'notificar', byAviso: false };

    return [
        { title: 'Liquidación y Pagos' },
        { 
            state: 62, 
            name: 'Expensas Variables', 
            desc: "Pago de expensas variables", 
            // limit: [[[56, 57], 30]], 
            limit: correccionesOptions.notificationType === 'comunicar' ? [[[57], 30]] : correccionesOptions.byAviso ? [[[57], 30]] : [[[56], 30]],
            show: conOA, 
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 63, 
            name: namePayment, 
            desc: "Pago de impuestos municipales o delineación", 
            limit: correccionesOptions.notificationType === 'comunicar' ? [[[57], 30]] : correccionesOptions.byAviso ? [[[57], 30]] : [[[56], 30]],
            show: conOA, 
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 64, 
            name: 'Estampilla PRO-UIS', 
            desc: "Pago de estampilla PRO-UIS", 
            limit: correccionesOptions.notificationType === 'comunicar' ? [[[57], 30]] : correccionesOptions.byAviso ? [[[57], 30]] : [[[56], 30]],
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 65, 
            name: 'Deberes Urbanísticos', 
            desc: "Pago de deberes urbanísticos", 
            limit: correccionesOptions.notificationType === 'comunicar' ? [[[57], 30]] : correccionesOptions.byAviso ? [[[57], 30]] : [[[56], 30]], 
            show: !conGI, 
            spentDaysConfig: { startState: [56, 57] } 
        },
        { 
            state: 69, 
            name: 'Radicación de último pago', 
            desc: "Radicación de todos los pagos requeridos (INICIA PLAZO RESOLUCIÓN)", 
            limit: correccionesOptions.notificationType === 'comunicar' ? [[[57], 30]] : correccionesOptions.byAviso ? [[[57], 30]] : [[[56], 30]],
            spentDaysConfig: { startState: [56, 57] } 
        },
        ...buildDesistSection('-4', getClockVersion),
    ];
};

const finalClocks = (props) => {
    const { getClock } = props;
    
    return [
        { title: 'Generación de Resolución' },
        { 
            state: 70, 
            name: "Acto Administrativo / Resolución", 
            desc: "Expedición del acto administrativo de resolución", 
            limit: [[69, 5]], 
            spentDaysConfig: { startState: 69 },
            allowSchedule: true 
        },
        { title: 'Notificación Resolución' },
        { 
            state: 71, 
            name: "Comunicación o Requerimiento (Resolución)", 
            desc: "Comunicación para notificar al solicitante del acto administrativo", 
            limit: [[70, 1]], 
            spentDaysConfig: { startState: 70 },
            allowSchedule: true 
        },
        { 
            state: 72, 
            name: "Notificación Personal (Resolución)", 
            desc: "Notificación personal del acto administrativo", 
            limit: [[71, 5]], 
            spentDaysConfig: { startState: 71 },
            allowSchedule: true
        },
        { 
            state: 73, 
            name: "Notificación por Aviso (Resolución)", 
            desc: "Notificación por aviso del acto administrativo (si no se logró notificación personal)", 
            limit: [[71, 10]], 
            icon: "empty",
            spentDaysConfig: { startState: 71 },
            allowSchedule: true 
        },
        { 
            state: 731, 
            name: "Notificación a Planeación", 
            desc: "Notificación a la oficina de planeación municipal", 
            limit: [[71, 5]], 
            spentDaysConfig: { startState: 71 }, 
            allowSchedule: true
        },
        { 
            state: 85, 
            name: "Publicación", 
            desc: "Publicación de la resolución (DEBE SER EL MISMO DÍA O MÁXIMO 1 DÍA DESPUÉS)", 
            limit: [[70, 1]], 
            spentDaysConfig: { startState: 70 },
            allowSchedule: true 
        },
        
        { title: 'Recurso de Reposición' },
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
        
        { title: 'Ejecutoria y Recurso' },
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
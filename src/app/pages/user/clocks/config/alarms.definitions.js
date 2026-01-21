/**
 * Define los umbrales de días para que una alarma se active.
 * Si a un evento le quedan `threshold` días o menos, se mostrará.
 */
export const ALARM_THRESHOLD_DAYS = {
    legal: 7,       // Alarmas legales se muestran si vencen en 7 días o menos
    scheduled: 5,   // Alarmas programadas se muestran si vencen en 5 días o menos
    process: 10,    // Alarma de proceso general se muestra si vence en 10 días o menos
};

/**
 * Repositorio central de sugerencias para las alarmas.
 * La estructura permite definir mensajes específicos para cada tipo de alarma
 * y si el plazo está "porVencer" o ya está "vencido".
 */
export const ALARM_SUGGESTIONS = {
    // --- Sugerencias específicas por STATE del clock ---
    5: { // Legal y debida forma
        legal: {
            porVencer: { suggestion: "El tiempo está pronto a vencer, en caso de no quedar en Legal y debida forma el proyecto deberá desistirse." },
            vencido: { suggestion: "El tiempo legal para el solicitante ha finalizado, por favor iniciar el desistimiento" }
        },
        scheduled: {
            porVencer: { suggestion: "El tiempo está pronto a vencer, en caso de no quedar en Legal y debida forma el proyecto deberá desistirse." },
            vencido: { suggestion: "El tiempo legal para el solicitante ha finalizado, por favor iniciar el desistimiento" }
        }
    },
    30: { // Acta Parte 1
        legal: {
            porVencer: { suggestion: "El plazo para emitir el Acta de Observaciones está por terminar. Añadir suspensión de términos o prórroga por complejidad." },
            vencido: { suggestion: "El plazo para el Acta de Observaciones ha expirado. Añadir suspensión de términos o prórroga por complejidad." }
        },
        scheduled: {
            porVencer: { suggestion: "La fecha que programaste para el Acta de Observaciones se acerca. Asegúrate de cumplir con tu planificación." },
            vencido: { suggestion: "El plazo programado para el Acta de Observaciones Parte 1 ha expirado. Añadir suspensión de términos o prórroga por complejidad." }
        }
    },
    // 35: { // Radicacion correcciones solicitante
    //     legal: {
    //         porVencer: { suggestion: "El plazo para presentar las correcciones está pronto a vencer, es necesario añadir prórroga." },
    //         vencido: { suggestion: "El plazo para las correcciones ha expirado. Desistir por no atender las observaciones." }
    //     },
    //     scheduled: {
    //         porVencer: { suggestion: "El plazo para presentar las correcciones está pronto a vencer, es necesario añadir prórroga." },
    //         vencido: { suggestion: "El plazo para las correcciones ha expirado. Desistir por no atender las observaciones." }
    //     }
    // },
    61: { // Viabilidad
        legal: {
            porVencer: { suggestion: "El plazo para declarar la viabilidad es crítico. Añadir suspensión de términos o prórroga por complejidad." },
            vencido: { suggestion: "El tiempo para emitir la viabilidad ha vencido. Añadir suspensión de términos o prórroga por complejidad." }
        },
        scheduled: {
            porVencer: { suggestion: "La fecha programada para la Viabilidad es inminente. Prioriza esta tarea para mantener el cronograma." },
            vencido: { suggestion: "La fecha de viabilidad programada ha pasado. Actúa ahora para no afectar el resto del proceso." }
        }
    },
    70: { // Resolución
        legal: {
            porVencer: { suggestion: "El tiempo para expedir la resolución final se agota. Verifica que los pagos y documentos estén en orden." },
            vencido: { suggestion: "Se ha superado el plazo para expedir la resolución. Emite el documento final lo antes posible." }
        },
        scheduled: {
            porVencer: { suggestion: "Estás cerca de la fecha programada para la Resolución. Confirma los últimos detalles para finalizar." },
            vencido: { suggestion: "La resolución programada está retrasada. Prioriza su emisión." }
        }
    },
    503: { // Instalación de Valla
        legal: {
            porVencer: { suggestion: "El solicitante está cerca del límite para registrar la instalación de la valla. Considera enviar un recordatorio." },
            vencido: { suggestion: "El plazo para allegar la valla ha vencido. Inicia el proceso de desistimiento por valla." }
        }
    },
    35: { // Radiacion de correcciones solicitante
        legal: {
            porVencer: { suggestion: "Se acerca el límite para presentar correcciones del solicitante, activar prórroga." },
            vencido: { suggestion: "Se ha vencido el término para presentar correcciones del solicitante. Desistir el proceso." }
        }
    },

    // --- Sugerencias para la alarma de PROCESO GENERAL ---
    process: {
        porVencer: {
            suggestion: "Quedan pocos días del plazo total de esta fase. Prioriza las tareas restantes para cumplir a tiempo y evitar un vencimiento."
        },
        vencido: {
            suggestion: "El tiempo total de la fase ha sido superado. Añade prórrogas o desiste según corresponda."
        }
    },
    
    // --- Sugerencias DEFAULT para eventos no especificados arriba ---
    default: {
        legal: {
            porVencer: { suggestion: "El límite legal para este evento está próximo a vencer. Es prioritario completar esta tarea para no incurrir en retrasos." },
            vencido: { suggestion: "El plazo legal para este evento ha vencido. Registra la fecha real y gestiona las implicaciones del retraso." }
        },
        scheduled: {
            porVencer: { suggestion: "La fecha programada para este evento se acerca. Revisa su estado para asegurar el cumplimiento." },
            vencido: { suggestion: "Te has retrasado en una tarea programada. Evalúa el impacto en el resto del cronograma." }
        }
    }
};
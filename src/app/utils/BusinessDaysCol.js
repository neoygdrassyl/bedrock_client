import moment from 'moment';

class DiasHabilesColombia {
    constructor() {
        // Festivos fijos de Colombia
        this.festivosFijos = {
            '01-01': 'Año Nuevo',
            '05-01': 'Día del Trabajo',
            '07-20': 'Día de la Independencia',
            '08-07': 'Batalla de Boyacá',
            '12-08': 'Inmaculada Concepción',
            '12-25': 'Navidad'
        };
        this.memoizedHolidays = {};
    }

    /**
     * Calcula la fecha de Pascua para un año dado usando el algoritmo de Gauss
     */
    calcularPascua(año) {
        const a = año % 19;
        const b = Math.floor(año / 100);
        const c = año % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mes = Math.floor((h + l - 7 * m + 114) / 31);
        const dia = ((h + l - 7 * m + 114) % 31) + 1;
        
        // Usar UTC para evitar problemas de zona horaria
        return new Date(Date.UTC(año, mes - 1, dia));
    }

    /**
     * Calcula todos los festivos de Colombia para un año dado
     */
    obtenerFestivos(año) {
        if (this.memoizedHolidays[año]) {
            return this.memoizedHolidays[año];
        }

        const festivos = new Set();
        
        // Agregar festivos fijos
        for (const [fecha] of Object.entries(this.festivosFijos)) {
            festivos.add(`${año}-${fecha}`);
        }
        
        const pascua = this.calcularPascua(año);
        
        const festivosPascua = [
            { dias: -3 }, // Jueves Santo
            { dias: -2 }, // Viernes Santo
            { dias: 39 }, // Ascensión del Señor
            { dias: 60 }, // Corpus Christi
            { dias: 68 }  // Sagrado Corazón
        ];
        
        festivosPascua.forEach(festivo => {
            const fecha = new Date(pascua.getTime());
            fecha.setUTCDate(fecha.getUTCDate() + festivo.dias);
            
            if (festivo.dias > 0) { // Trasladar al lunes
                const diaSemana = fecha.getUTCDay(); // Domingo=0, Lunes=1
                const diasParaLunes = (diaSemana === 0) ? 1 : (8 - diaSemana) % 7;
                fecha.setUTCDate(fecha.getUTCDate() + diasParaLunes);
            }
            
            festivos.add(fecha.toISOString().split('T')[0]);
        });
        
        const festivosTraslado = [
            { mes: 1, dia: 6 },  // Epifanía
            { mes: 3, dia: 19 }, // San José
            { mes: 6, dia: 29 }, // San Pedro y San Pablo
            { mes: 8, dia: 15 }, // Asunción de la Virgen
            { mes: 10, dia: 12 },// Día de la Raza
            { mes: 11, dia: 1 }, // Todos los Santos
            { mes: 11, dia: 11 }// Independencia de Cartagena
        ];
        
        festivosTraslado.forEach(festivo => {
            const fecha = new Date(Date.UTC(año, festivo.mes - 1, festivo.dia));
            const diaSemana = fecha.getUTCDay(); // Domingo=0, Lunes=1
            const diasParaLunes = (diaSemana === 0) ? 1 : (8 - diaSemana) % 7;
            if (diaSemana !== 1) { // Si no es lunes
                 fecha.setUTCDate(fecha.getUTCDate() + diasParaLunes);
            }
            festivos.add(fecha.toISOString().split('T')[0]);
        });

        this.memoizedHolidays[año] = festivos;
        return festivos;
    }

    /**
     * Verifica si una fecha es día hábil (no es fin de semana ni festivo)
     */
    esDiaHabil(fecha, festivos) {
        // Asegurarse de que la fecha no tenga componentes de hora
        const fechaObj = new Date(fecha + 'T00:00:00Z');
        const diaSemana = fechaObj.getUTCDay();
        
        if (diaSemana === 0 || diaSemana === 6) { // 0 = Domingo, 6 = Sábado
            return false;
        }
        
        return !festivos.has(fecha);
    }

    // --- MÉTODOS EXISTENTES (NO MODIFICADOS) ---

    siguienteDiaHabil(fechaInicial) {
        const fecha = new Date(fechaInicial + 'T00:00:00Z');
        const año = fecha.getUTCFullYear();
        const festivos = this.obtenerFestivos(año);
        
        fecha.setUTCDate(fecha.getUTCDate() + 1);
        
        while (true) {
            const fechaStr = fecha.toISOString().split('T')[0];
            const añoActual = fecha.getUTCFullYear();
            const festivosActuales = this.obtenerFestivos(añoActual);
            
            if (this.esDiaHabil(fechaStr, festivosActuales)) {
                return fechaStr;
            }
            fecha.setUTCDate(fecha.getUTCDate() + 1);
        }
    }

    calcularDiasHabiles(fechaInicial, diasHabiles) {
        if (diasHabiles <= 0) {
            throw new Error('El número de días hábiles debe ser mayor a 0');
        }
        
        const fecha = new Date(fechaInicial + 'T00:00:00Z');
        let diasContados = 0;
        
        // Empezar desde el día siguiente
        fecha.setUTCDate(fecha.getUTCDate() + 1);
        
        while (diasContados < diasHabiles) {
            const fechaStr = fecha.toISOString().split('T')[0];
            const añoActual = fecha.getUTCFullYear();
            const festivosActuales = this.obtenerFestivos(añoActual);
            
            if (this.esDiaHabil(fechaStr, festivosActuales)) {
                diasContados++;
            }
            
            if (diasContados < diasHabiles) {
                fecha.setUTCDate(fecha.getUTCDate() + 1);
            }
        }
        
        return fecha.toISOString().split('T')[0];
    }

    // --- NUEVOS MÉTODOS PARA EL CALENDARIO ---

    /**
     * Devuelve una lista de festivos para los años especificados.
     * @param {number[]} years - Un array de años.
     * @returns {Set<string>} - Un Set con todas las fechas de los festivos en formato YYYY-MM-DD.
     */
    getHolidaysForYears(years) {
        const allHolidays = new Set();
        years.forEach(year => {
            const yearHolidays = this.obtenerFestivos(year);
            yearHolidays.forEach(holiday => allHolidays.add(holiday));
        });
        return allHolidays;
    }

    /**
     * Cuenta los días hábiles entre dos fechas.
     * @param {string} startDate - Fecha de inicio 'YYYY-MM-DD'
     * @param {string} endDate - Fecha de fin 'YYYY-MM-DD'
     * @param {boolean} [include=false] - Si es true, cuenta también el día de inicio. Por defecto es false.
     * @returns {number}
     */
    contarDiasHabiles(startDate, endDate, include = false) {
        let current = moment(startDate).startOf('day');
        const end = moment(endDate).startOf('day');
        if (!current.isValid() || !end.isValid() || current.isAfter(end)) {
            return 0;
        }

        let count = 0;
        
        if (!include) {
            current.add(1, 'day');
        }
        
        while (current.isSameOrBefore(end, 'day')) {
            const festivos = this.obtenerFestivos(current.year());
            
            if (this.esDiaHabil(current.format('YYYY-MM-DD'), festivos)) {
                count++;
            }

            current.add(1, 'day');
        }
        
        return count;
    }

    /**
     * Suma N días hábiles a una fecha.
     * Si days es negativo, delega en restarDiasHabiles.
     * @param {string} startDate - Fecha de inicio 'YYYY-MM-DD'
     * @param {number} days - Días a sumar (puede ser negativo).
     * @returns {string} - Fecha resultante 'YYYY-MM-DD'
     */
    sumarDiasHabiles(startDate, days) {
        if (days === 0) return startDate;
        if (days < 0) return this.restarDiasHabiles(startDate, -days);

        const fecha = new Date(startDate + 'T00:00:00Z');
        let diasSumados = 0;

        while (diasSumados < days) {
            fecha.setUTCDate(fecha.getUTCDate() + 1);
            const fechaStr = fecha.toISOString().split('T')[0];
            const festivos = this.obtenerFestivos(fecha.getUTCFullYear());
            if (this.esDiaHabil(fechaStr, festivos)) {
                diasSumados++;
            }
        }
        return fecha.toISOString().split('T')[0];
    }

    /**
     * Resta N días hábiles a una fecha.
     * No resta más ni menos que el parámetro dado: cuenta exactamente N días hábiles hacia atrás.
     * @param {string} startDate - Fecha de inicio 'YYYY-MM-DD'
     * @param {number} days - Días hábiles a restar (debe ser > 0)
     * @returns {string} - Fecha resultante 'YYYY-MM-DD'
     */
    restarDiasHabiles(startDate, days) {
        if (days <= 0) return startDate;

        const fecha = new Date(startDate + 'T00:00:00Z');
        let diasRestados = 0;

        while (diasRestados < days) {
            fecha.setUTCDate(fecha.getUTCDate() - 1);
            const fechaStr = fecha.toISOString().split('T')[0];
            const festivos = this.obtenerFestivos(fecha.getUTCFullYear());
            if (this.esDiaHabil(fechaStr, festivos)) {
                diasRestados++;
            }
        }
        return fecha.toISOString().split('T')[0];
    }
}

function procesarFecha(fechaInicial, diasHabiles = 10) {
    const businessDays = new DiasHabilesColombia();
    const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(fechaInicial);
    if (!formatoValido) {
        throw new Error('La fecha debe estar en formato YYYY-MM-DD');
    }
    return businessDays.sumarDiasHabiles(fechaInicial, diasHabiles);
}

/**
 * Procesa la resta de días hábiles desde una fecha dada.
 * @param {string} fechaInicial - 'YYYY-MM-DD'
 * @param {number} diasHabiles - días a restar (>0)
 * @returns {string} 'YYYY-MM-DD'
 */
function procesarFechaRestar(fechaInicial, diasHabiles = 10) {
    const businessDays = new DiasHabilesColombia();
    const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(fechaInicial);
    if (!formatoValido) {
        throw new Error('La fecha debe estar en formato YYYY-MM-DD');
    }
    return businessDays.restarDiasHabiles(fechaInicial, diasHabiles);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { procesarFecha, procesarFechaRestar, DiasHabilesColombia };
}

export {DiasHabilesColombia, procesarFecha, procesarFechaRestar}
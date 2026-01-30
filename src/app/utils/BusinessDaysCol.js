import moment from 'moment';
import holidaysData from '../components/jsons/holydaysmoment.json';

class DiasHabilesColombia {
    constructor() {
        // Cargar festivos desde JSON
        this.allHolidays = new Set(holidaysData.holidays || []);
        this.memoizedHolidays = {};
    }

    /**
     * Obtiene los festivos disponibles para un año dado
     */
    obtenerFestivos(año) {
        if (this.memoizedHolidays[año]) {
            return this.memoizedHolidays[año];
        }

        const festivos = new Set();
        this.allHolidays.forEach(fecha => {
            if (fecha.startsWith(`${año}-`)) {
                festivos.add(fecha);
            }
        });

        this.memoizedHolidays[año] = festivos;
        return festivos;
    }

    /**
     * Verifica si una fecha es día hábil (no es fin de semana ni festivo)
     */
    esDiaHabil(fecha, festivos) {
        const fechaObj = new Date(fecha + 'T00:00:00Z');
        const diaSemana = fechaObj.getUTCDay();
        
        if (diaSemana === 0 || diaSemana === 6) { // 0 = Domingo, 6 = Sábado
            return false;
        }
        
        return !festivos.has(fecha);
    }

    // --- MÉTODOS EXISTENTES ---

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
import holidaysData from '../components/jsons/holydaysmoment.json';

const officialBusinessCalendarHolidays = new Set(holidaysData.holidays || []);
const customBusinessCalendarDays = new Map();
const businessCalendarHolidays = new Set(officialBusinessCalendarHolidays);
let businessCalendarVersion = 0;

function replaceBusinessCalendarHolidays(holidays, synchronizedYears) {
    const years = new Set((synchronizedYears || holidays.map(date => date.substring(0, 4))).map(String));
    removeSetYears(officialBusinessCalendarHolidays, years);
    holidays.forEach(date => officialBusinessCalendarHolidays.add(date));
    rebuildYears(years);
}

function replaceBusinessCalendarCustomDays(entries, synchronizedYears) {
    const years = new Set((synchronizedYears || entries.map(entry => entry.date.substring(0, 4))).map(String));
    Array.from(customBusinessCalendarDays.keys()).forEach(date => {
        if (years.has(date.substring(0, 4))) customBusinessCalendarDays.delete(date);
    });
    entries.forEach(entry => customBusinessCalendarDays.set(entry.date, entry));
    rebuildYears(years);
}

function addBusinessCalendarCustomDay(entry) {
    customBusinessCalendarDays.set(entry.date, entry);
    rebuildYears(new Set([entry.date.substring(0, 4)]));
}

function removeBusinessCalendarCustomDay(date) {
    customBusinessCalendarDays.delete(date);
    rebuildYears(new Set([date.substring(0, 4)]));
}

function removeSetYears(set, years) {
    set.forEach(date => {
        if (years.has(date.substring(0, 4))) set.delete(date);
    });
}

function rebuildYears(years) {
    removeSetYears(businessCalendarHolidays, years);
    officialBusinessCalendarHolidays.forEach(date => {
        if (years.has(date.substring(0, 4))) businessCalendarHolidays.add(date);
    });
    customBusinessCalendarDays.forEach((_, date) => {
        if (years.has(date.substring(0, 4))) businessCalendarHolidays.add(date);
    });
    businessCalendarVersion++;
}

class DiasHabilesColombia {
    constructor() {
        this.allHolidays = businessCalendarHolidays;
        this.memoizedHolidays = {};
        this.holidaysVersion = businessCalendarVersion;
    }

    /**
     * Obtiene los festivos disponibles para un año dado
     */
    obtenerFestivos(año) {
        if (this.holidaysVersion !== businessCalendarVersion) {
            this.memoizedHolidays = {};
            this.holidaysVersion = businessCalendarVersion;
        }
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

    /**
     * Verifica si una fecha es festivo colombiano.
     * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
     * @returns {boolean}
     */
    esFestivo(fecha) {
        const año = parseInt(fecha.substring(0, 4), 10);
        const festivos = this.obtenerFestivos(año);
        return festivos.has(fecha);
    }

    /**
     * Convenience: verifica si una fecha es día hábil (no weekend, no festivo).
     * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
     * @returns {boolean}
     */
    esHabil(fecha) {
        const año = parseInt(fecha.substring(0, 4), 10);
        const festivos = this.obtenerFestivos(año);
        return this.esDiaHabil(fecha, festivos);
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
        const current = new Date(startDate + 'T00:00:00Z');
        const end = new Date(endDate + 'T00:00:00Z');
        if (isNaN(current.getTime()) || isNaN(end.getTime()) || current > end) {
            return 0;
        }

        let count = 0;
        
        if (!include) {
            current.setUTCDate(current.getUTCDate() + 1);
        }
        
        while (current <= end) {
            const fechaStr = current.toISOString().split('T')[0];
            const festivos = this.obtenerFestivos(current.getUTCFullYear());
            
            if (this.esDiaHabil(fechaStr, festivos)) {
                count++;
            }

            current.setUTCDate(current.getUTCDate() + 1);
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

export {
    addBusinessCalendarCustomDay,
    DiasHabilesColombia,
    procesarFecha,
    procesarFechaRestar,
    removeBusinessCalendarCustomDay,
    replaceBusinessCalendarCustomDays,
    replaceBusinessCalendarHolidays,
}

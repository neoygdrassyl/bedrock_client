import moment from 'moment';

/**
 * Calcula la fecha del Domingo de Pascua para un año dado usando el algoritmo de Gauss.
 * @param {number} year - El año para el cual calcular la Pascua.
 * @returns {moment} - Un objeto moment con la fecha del Domingo de Pascua.
 */
const getEasterSunday = (year) => {
    const a = year % 19;
    const b = year % 4;
    const c = year % 7;
    const k = Math.floor(year / 100);
    const p = Math.floor((13 + 8 * k) / 25);
    const q = Math.floor(k / 4);
    const M = (15 - p + k - q) % 30;
    const N = (4 + k - q) % 7;
    const d = (19 * a + M) % 30;
    const e = (2 * b + 4 * c + 6 * d + N) % 7;

    if (d === 29 && e === 6) {
        return moment(`${year}-04-19`);
    }
    if (d === 28 && e === 6 && (11 * M + 11) % 30 < 19) {
        return moment(`${year}-04-18`);
    }
    
    const day = 22 + d + e;
    if (day > 31) {
        return moment(`${year}-04-${day - 31}`);
    }
    return moment(`${year}-03-${day}`);
};

/**
 * Mueve una fecha al siguiente lunes si no lo es ya.
 * @param {moment} date - La fecha a evaluar.
 * @returns {moment} - La fecha original si es lunes, o el siguiente lunes.
 */
const moveToNextMonday = (date) => {
    const dayOfWeek = date.day();
    if (dayOfWeek === 1) return date; // Ya es lunes
    return date.add(8 - dayOfWeek, 'days');
};

/**
 * Genera una lista de todos los días festivos en Colombia para un año específico.
 * @param {number} year - El año para el cual generar los festivos.
 * @returns {string[]} - Un array de strings con las fechas de los festivos en formato 'YYYY-MM-DD'.
 */
export const getColombianHolidays = (year) => {
    const easter = getEasterSunday(year);

    const holidays = [
        // Festivos fijos
        moment(`${year}-01-01`), // Año Nuevo
        moment(`${year}-05-01`), // Día del Trabajo
        moment(`${year}-07-20`), // Grito de Independencia
        moment(`${year}-08-07`), // Batalla de Boyacá
        moment(`${year}-12-08`), // Inmaculada Concepción
        moment(`${year}-12-25`), // Navidad

        // Festivos de la Ley Emiliani (se mueven al lunes)
        moveToNextMonday(moment(`${year}-01-06`)), // Reyes Magos
        moveToNextMonday(moment(`${year}-03-19`)), // San José
        moveToNextMonday(moment(`${year}-06-29`)), // San Pedro y San Pablo
        moveToNextMonday(moment(`${year}-08-15`)), // Asunción de la Virgen
        moveToNextMonday(moment(`${year}-10-12`)), // Día de la Raza
        moveToNextMonday(moment(`${year}-11-01`)), // Todos los Santos
        moveToNextMonday(moment(`${year}-11-11`)), // Independencia de Cartagena

        // Festivos basados en la Pascua
        easter.clone().subtract(3, 'days'), // Jueves Santo
        easter.clone().subtract(2, 'days'), // Viernes Santo
        moveToNextMonday(easter.clone().add(39, 'days')), // Ascensión del Señor
        moveToNextMonday(easter.clone().add(60, 'days')), // Corpus Christi
        moveToNextMonday(easter.clone().add(68, 'days')), // Sagrado Corazón de Jesús
    ];

    const holidayStrings = holidays.map(date => date.format('YYYY-MM-DD'));
    return [...new Set(holidayStrings)];
};


/**
 * Comprueba si una fecha es un día hábil en Colombia.
 * @param {moment.Moment} date - La fecha a comprobar.
 * @param {string[]} holidays - Array de festivos en formato 'YYYY-MM-DD'.
 * @returns {boolean} - True si es un día hábil, false en caso contrario.
 */
export const isBusinessDay = (date, holidays) => {
    const dayOfWeek = date.day();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = Domingo, 6 = Sábado
        return false;
    }
    if (holidays.includes(date.format('YYYY-MM-DD'))) {
        return false;
    }
    return true;
};

/**
 * Cuenta los días hábiles entre dos fechas.
 * @param {moment.Moment} startDate - La fecha de inicio.
 * @param {moment.Moment} endDate - La fecha de fin.
 * @param {string[]} holidays - Array de festivos.
 * @returns {number} - El número de días hábiles.
 */
export const countBusinessDays = (startDate, endDate, holidays) => {
    if (startDate.isAfter(endDate)) return 0;
    
    let count = 0;
    const current = startDate.clone();

    while (current.isSameOrBefore(endDate, 'day')) {
        if (isBusinessDay(current, holidays)) {
            count++;
        }
        current.add(1, 'day');
    }
    return count;
};

/**
 * Suma un número de días hábiles a una fecha.
 * @param {moment.Moment} startDate - La fecha de inicio.
 * @param {number} days - El número de días hábiles a sumar.
 * @param {string[]} holidays - Array de festivos.
 * @returns {moment.Moment} - La fecha resultante.
 */
export const addBusinessDays = (startDate, days, holidays) => {
    let count = 0;
    const resultDate = startDate.clone();
    
    while (count < days) {
        resultDate.add(1, 'day');
        if (isBusinessDay(resultDate, holidays)) {
            count++;
        }
    }
    return resultDate;
};
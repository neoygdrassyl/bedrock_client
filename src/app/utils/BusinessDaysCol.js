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
        
        return new Date(año, mes - 1, dia);
    }

    /**
     * Calcula todos los festivos de Colombia para un año dado
     */
    obtenerFestivos(año) {
        const festivos = new Set();
        
        // Agregar festivos fijos
        for (const [fecha, nombre] of Object.entries(this.festivosFijos)) {
            festivos.add(`${año}-${fecha}`);
        }
        
        // Calcular festivos basados en Pascua
        const pascua = this.calcularPascua(año);
        
        // Festivos relativos a Pascua
        const festivosPascua = [
            { dias: -3, nombre: 'Jueves Santo' },
            { dias: -2, nombre: 'Viernes Santo' },
            { dias: 39, nombre: 'Ascensión del Señor' },
            { dias: 60, nombre: 'Corpus Christi' },
            { dias: 68, nombre: 'Sagrado Corazón' }
        ];
        
        festivosPascua.forEach(festivo => {
            const fecha = new Date(pascua);
            fecha.setDate(pascua.getDate() + festivo.dias);
            
            // Para Ascensión, Corpus Christi y Sagrado Corazón, se trasladan al lunes siguiente
            if (festivo.dias > 0) {
                const diasParaLunes = (8 - fecha.getDay()) % 7;
                if (diasParaLunes > 0) {
                    fecha.setDate(fecha.getDate() + diasParaLunes);
                }
            }
            
            const fechaStr = fecha.toISOString().split('T')[0];
            festivos.add(fechaStr);
        });
        
        // Festivos que se trasladan al lunes siguiente si no caen en lunes
        const festivosTraslado = [
            { mes: 1, dia: 6, nombre: 'Epifanía' },
            { mes: 3, dia: 19, nombre: 'San José' },
            { mes: 6, dia: 29, nombre: 'San Pedro y San Pablo' },
            { mes: 8, dia: 15, nombre: 'Asunción de la Virgen' },
            { mes: 10, dia: 12, nombre: 'Día de la Raza' },
            { mes: 11, dia: 1, nombre: 'Todos los Santos' },
            { mes: 11, dia: 11, nombre: 'Independencia de Cartagena' }
        ];
        
        festivosTraslado.forEach(festivo => {
            const fecha = new Date(año, festivo.mes - 1, festivo.dia);
            
            // Trasladar al siguiente lunes si no es lunes
            const diasParaLunes = (8 - fecha.getDay()) % 7;
            if (diasParaLunes > 0) {
                fecha.setDate(fecha.getDate() + diasParaLunes);
            }
            
            const fechaStr = fecha.toISOString().split('T')[0];
            festivos.add(fechaStr);
        });
        
        return festivos;
    }

    /**
     * Verifica si una fecha es día hábil (no es fin de semana ni festivo)
     */
    esDiaHabil(fecha, festivos) {
        const fechaObj = new Date(fecha + 'T00:00:00');
        const diaSemana = fechaObj.getDay();
        
        // 0 = Domingo, 6 = Sábado
        if (diaSemana === 0 || diaSemana === 6) {
            return false;
        }
        
        // Verificar si es festivo
        return !festivos.has(fecha);
    }

    /**
     * Obtiene el siguiente día hábil a partir de una fecha dada
     */
    siguienteDiaHabil(fechaInicial) {
        const fecha = new Date(fechaInicial + 'T00:00:00');
        const año = fecha.getFullYear();
        const festivos = this.obtenerFestivos(año);
        let festivosAñoSiguiente = null;
        
        // Comenzar desde el día siguiente
        fecha.setDate(fecha.getDate() + 1);
        
        while (true) {
            const fechaStr = fecha.toISOString().split('T')[0];
            
            // Si cambiamos de año, obtener festivos del nuevo año
            if (fecha.getFullYear() !== año && !festivosAñoSiguiente) {
                festivosAñoSiguiente = this.obtenerFestivos(fecha.getFullYear());
            }
            
            const festivosActuales = fecha.getFullYear() === año ? festivos : festivosAñoSiguiente;
            
            if (this.esDiaHabil(fechaStr, festivosActuales)) {
                return fechaStr;
            }
            
            fecha.setDate(fecha.getDate() + 1);
        }
    }

    /**
     * Calcula una fecha que está N días hábiles después de la fecha inicial
     */
    calcularDiasHabiles(fechaInicial, diasHabiles) {
        if (diasHabiles <= 0) {
            throw new Error('El número de días hábiles debe ser mayor a 0');
        }
        
        const fecha = new Date(fechaInicial + 'T00:00:00');
        let año = fecha.getFullYear();
        let festivos = this.obtenerFestivos(año);
        let festivosAñoSiguiente = null;
        
        let diasContados = 0;
        
        // Comenzar desde el día siguiente a la fecha inicial
        fecha.setDate(fecha.getDate() + 1);
        
        while (diasContados < diasHabiles) {
            const fechaStr = fecha.toISOString().split('T')[0];
            
            // Si cambiamos de año, obtener festivos del nuevo año
            if (fecha.getFullYear() !== año) {
                año = fecha.getFullYear();
                festivosAñoSiguiente = this.obtenerFestivos(año);
            }
            
            const festivosActuales = festivosAñoSiguiente || festivos;
            
            if (this.esDiaHabil(fechaStr, festivosActuales)) {
                diasContados++;
            }
            
            if (diasContados < diasHabiles) {
                fecha.setDate(fecha.getDate() + 1);
            }
        }
        
        return fecha.toISOString().split('T')[0];
    }
}

/**
 * Función principal exportable para calcular días hábiles
 * @param {string} fechaInicial - Fecha en formato YYYY-MM-DD
 * @param {number} diasHabiles - Número de días hábiles a calcular (por defecto 10)
 * @returns {Object} Objeto con fechaInicial, siguienteDiaHabil y diezDiasHabiles
 */
function procesarFecha(fechaInicial, diasHabiles = 10) {
    const businessDays = new DiasHabilesColombia();

    // Validar formato de fecha
    const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(fechaInicial);
    if (!formatoValido) {
        throw new Error('La fecha debe estar en formato YYYY-MM-DD');
    }
    
    const siguienteDia = businessDays.siguienteDiaHabil(fechaInicial);
    const diasHabilesCalculados = businessDays.calcularDiasHabiles(fechaInicial, diasHabiles);
    
    return diasHabilesCalculados;
}

// Exportaciones para diferentes sistemas de módulos
// CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { procesarFecha, DiasHabilesColombia };
}

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'moment/locale/es';
import { DiasHabilesColombia } from '../../../../utils/BusinessDaysCol.js';

moment.locale('es');
const businessDaysCalculator = new DiasHabilesColombia();

/**
 * SOLUCIÓN: Componente de calendario completamente aislado
 * 
 * Problemas anteriores:
 * 1. CalendarContent se definía dentro del componente, recreándose en cada render
 * 2. El prop onClose cambiaba referencia en cada render del padre
 * 3. El estado del calendario se reiniciaba con cambios externos
 * 
 * Solución:
 * 1. Usar useRef para mantener referencia estable de onClose
 * 2. Mover toda la lógica de contenido al componente principal
 * 3. Evitar recreación de funciones usando useCallback
 * 4. El portal se crea una sola vez y no se actualiza con el padre
 */

// Componente interno puro para el contenido del calendario - NO recibe props que cambien
const CalendarContentInternal = React.memo(({ 
    currentDate, 
    onChangeMonth, 
    allHolidays,
    calcMode,
    setCalcMode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    daysToAdd,
    setDaysToAdd,
    result,
    onCalculate,
    isFloating,
    onCloseRef // Usamos ref en lugar de función directa
}) => {
    
    // --- Renderizado de Celdas (memoizado) ---
    const calendarBody = useMemo(() => {
        const monthStart = currentDate.clone().startOf('month');
        const monthEnd = currentDate.clone().endOf('month');
        const startDateGrid = monthStart.clone().startOf('isoWeek');
        const endDateGrid = monthEnd.clone().endOf('isoWeek');

        const rows = [];
        let day = startDateGrid.clone();

        while (day.isSameOrBefore(endDateGrid, 'day')) {
            const daysInWeek = [];
            for (let i = 0; i < 7; i++) {
                const fDate = day.format('YYYY-MM-DD');
                let dayClass = 'day-cell';
                
                if (!day.isSame(currentDate, 'month')) dayClass += ' not-current-month';
                else if (allHolidays.has(fDate)) dayClass += ' holiday';
                else if (day.isoWeekday() >= 6) dayClass += ' weekend';
                
                if (day.isSame(moment(), 'day')) dayClass += ' today';

                daysInWeek.push(
                    <div className={dayClass} key={fDate} title={fDate}>
                        {day.date()}
                    </div>
                );
                day.add(1, 'day');
            }
            rows.push(<div className="calendar-grid" key={`week-${rows.length}`}>{daysInWeek}</div>);
        }
        return rows;
    }, [currentDate, allHolidays]);

    const handleClose = useCallback(() => {
        if (onCloseRef.current) {
            onCloseRef.current();
        }
    }, [onCloseRef]);

    return (
        <div className={`calendar-widget ${isFloating ? 'floating-mode' : ''}`}>
            {/* Header Rediseñado: Todo en una línea */}
            <div className="calendar-header-compact">
                <div className="calendar-title-compact">
                    <i className="fas fa-calendar-check text-primary"></i>
                    <span>Días Hábiles</span>
                </div>
                
                <div className="calendar-nav-compact">
                    <button className="nav-btn-compact" onClick={() => onChangeMonth(-1)}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="current-month-label-compact">{currentDate.format('MMM YYYY')}</span>
                    <button className="nav-btn-compact" onClick={() => onChangeMonth(1)}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                {isFloating && (
                    <button 
                        className="btn-close-compact" 
                        onClick={handleClose}
                        title="Cerrar calendario"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>

            {/* Cuerpo */}
            <div className="calendar-body">
                <div className="calendar-grid days-of-week">
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <div key={d}>{d}</div>)}
                </div>
                {calendarBody}
                
                <div className="calendar-mini-legend">
                    <div className="legend-item"><span className="legend-dot holiday"></span>Festivo</div>
                    <div className="legend-item"><span className="legend-dot weekend"></span>FinSem</div>
                    <div className="legend-item"><span className="legend-dot today"></span>Hoy</div>
                </div>
            </div>

            {/* Calculadora Compacta */}
            <div className="calculator-compact">
                <div className="calc-toggle-row">
                    <button 
                        className={`calc-toggle-btn ${calcMode === 'range' ? 'active' : ''}`} 
                        onClick={() => setCalcMode('range')}
                    >
                        Intervalo
                    </button>
                    <button 
                        className={`calc-toggle-btn ${calcMode === 'add' ? 'active' : ''}`} 
                        onClick={() => setCalcMode('add')}
                    >
                        Sumar
                    </button>
                </div>
                
                <div className="calc-inputs-row">
                    <input 
                        type="date" 
                        className="calc-input" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                    />
                    <span className="calc-separator">{calcMode === 'range' ? 'a' : '+'}</span>
                    {calcMode === 'range' ? (
                        <input 
                            type="date" 
                            className="calc-input" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                        />
                    ) : (
                        <input 
                            type="number" 
                            className="calc-input input-days" 
                            value={daysToAdd} 
                            onChange={e => setDaysToAdd(e.target.value)} 
                            placeholder="#" 
                        />
                    )}
                    <button className="btn-calc-go" onClick={onCalculate}>
                        <i className="fas fa-equals"></i>
                    </button>
                </div>

                {result && (
                    <div className={`calc-result-badge ${result.isError ? 'error' : 'success'}`}>
                        {result.text}
                    </div>
                )}
            </div>
        </div>
    );
});

CalendarContentInternal.displayName = 'CalendarContentInternal';

/**
 * Componente principal del calendario - memoizado con comparador de props estricto
 */
export const HolidayCalendar = React.memo(({ isFloating = false, onClose }) => {
    // SOLUCIÓN: Usar ref para onClose para evitar re-renders cuando la función cambia
    const onCloseRef = useRef(onClose);
    
    // Actualizar la ref cuando cambia onClose (pero sin causar re-render)
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Estado del calendario
    const [currentDate, setCurrentDate] = useState(() => moment());
    
    // Estado de la calculadora
    const [calcMode, setCalcMode] = useState('range');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [daysToAdd, setDaysToAdd] = useState('');
    const [result, setResult] = useState(null);

    // Memoizar los festivos
    const allHolidays = useMemo(() => {
        const year = currentDate.year();
        return businessDaysCalculator.getHolidaysForYears([year - 1, year, year + 1]);
    }, [currentDate]);

    // Callbacks estables
    const changeMonth = useCallback((amount) => {
        setCurrentDate(prev => prev.clone().add(amount, 'month'));
    }, []);

    const handleCalculate = useCallback(() => {
        const startMoment = moment(startDate);
        if (!startMoment.isValid()) {
            return setResult({ text: 'Inicio inválido', isError: true });
        }
        const startDateStr = startMoment.format('YYYY-MM-DD');

        if (calcMode === 'range') {
            const endMoment = moment(endDate);
            if (!endMoment.isValid() || endMoment.isBefore(startMoment)) {
                return setResult({ text: 'Fin inválido', isError: true });
            }
            const businessDays = businessDaysCalculator.contarDiasHabiles(startDateStr, endMoment.format('YYYY-MM-DD'));
            setResult({ text: `${businessDays} días hábiles`, isError: false });
        } else {
            const numDays = parseInt(daysToAdd, 10);
            if (!numDays || numDays <= 0) return setResult({ text: 'Días inválidos', isError: true });
            const finalDate = businessDaysCalculator.sumarDiasHabiles(startDateStr, numDays);
            setResult({ text: moment(finalDate).format('DD MMM YY'), isError: false });
        }
    }, [calcMode, startDate, endDate, daysToAdd]);

    const content = (
        <CalendarContentInternal
            currentDate={currentDate}
            onChangeMonth={changeMonth}
            allHolidays={allHolidays}
            calcMode={calcMode}
            setCalcMode={setCalcMode}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            daysToAdd={daysToAdd}
            setDaysToAdd={setDaysToAdd}
            result={result}
            onCalculate={handleCalculate}
            isFloating={isFloating}
            onCloseRef={onCloseRef}
        />
    );

    if (isFloating) {
        return ReactDOM.createPortal(content, document.body);
    }
    
    return (
        <div className="sidebar-card" style={{padding: 0, overflow: 'hidden', border: 'none'}}>
            {content}
        </div>
    );
}, (prevProps, nextProps) => {
    // SOLUCIÓN: Comparador de props personalizado
    // Solo re-renderizar si isFloating cambia (onClose se maneja con ref)
    return prevProps.isFloating === nextProps.isFloating;
});

HolidayCalendar.displayName = 'HolidayCalendar';
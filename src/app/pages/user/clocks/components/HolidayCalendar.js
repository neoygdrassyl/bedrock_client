import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'moment/locale/es';
import { DiasHabilesColombia } from '../../../../utils/BusinessDaysCol.js';

moment.locale('es');
const businessDaysCalculator = new DiasHabilesColombia();

// Usamos React.memo para evitar re-renderizados innecesarios cuando el padre se actualiza
export const HolidayCalendar = React.memo(({ isFloating = false, onClose }) => {
    const [currentDate, setCurrentDate] = useState(moment());
    
    // --- Lógica del Calendario ---
    const allHolidays = useMemo(() => {
        const year = currentDate.year();
        return businessDaysCalculator.getHolidaysForYears([year - 1, year, year + 1]);
    }, [currentDate.year()]);

    // --- Lógica de la Calculadora ---
    const [calcMode, setCalcMode] = useState('range');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [daysToAdd, setDaysToAdd] = useState('');
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
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
    };

    const changeMonth = (amount) => setCurrentDate(currentDate.clone().add(amount, 'month'));

    // --- Renderizado de Celdas ---
    const renderCalendarBody = () => {
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
                    <div className={dayClass} key={day.toString()} title={fDate}>
                        {day.date()}
                    </div>
                );
                day.add(1, 'day');
            }
            rows.push(<div className="calendar-grid" key={day.format('WW')}>{daysInWeek}</div>);
        }
        return rows;
    };

    const CalendarContent = () => (
        <div className={`calendar-widget ${isFloating ? 'floating-mode' : ''}`}>
            {/* Header Rediseñado: Todo en una línea */}
            <div className="calendar-header-compact">
                <div className="calendar-title-compact">
                    <i className="fas fa-calendar-check text-primary"></i>
                    <span>Días Hábiles</span>
                </div>
                
                <div className="calendar-nav-compact">
                    <button className="nav-btn-compact" onClick={() => changeMonth(-1)}><i className="fas fa-chevron-left"></i></button>
                    <span className="current-month-label-compact">{currentDate.format('MMM YYYY')}</span>
                    <button className="nav-btn-compact" onClick={() => changeMonth(1)}><i className="fas fa-chevron-right"></i></button>
                </div>

                {isFloating && (
                    <button 
                        className="btn-close-compact" 
                        onClick={onClose}
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
                {renderCalendarBody()}
                
                <div className="calendar-mini-legend">
                    <div className="legend-item"><span className="legend-dot holiday"></span>Festivo</div>
                    <div className="legend-item"><span className="legend-dot weekend"></span>FinSem</div>
                    <div className="legend-item"><span className="legend-dot today"></span>Hoy</div>
                </div>
            </div>

            {/* Calculadora Compacta */}
            <div className="calculator-compact">
                <div className="calc-toggle-row">
                    <button className={`calc-toggle-btn ${calcMode === 'range' ? 'active' : ''}`} onClick={() => setCalcMode('range')}>Intervalo</button>
                    <button className={`calc-toggle-btn ${calcMode === 'add' ? 'active' : ''}`} onClick={() => setCalcMode('add')}>Sumar</button>
                </div>
                
                <div className="calc-inputs-row">
                    <input type="date" className="calc-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span className="calc-separator">{calcMode === 'range' ? 'a' : '+'}</span>
                    {calcMode === 'range' ? (
                        <input type="date" className="calc-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    ) : (
                        <input type="number" className="calc-input input-days" value={daysToAdd} onChange={e => setDaysToAdd(e.target.value)} placeholder="#" />
                    )}
                    <button className="btn-calc-go" onClick={handleCalculate}><i className="fas fa-equals"></i></button>
                </div>

                {result && (
                    <div className={`calc-result-badge ${result.isError ? 'error' : 'success'}`}>
                        {result.text}
                    </div>
                )}
            </div>
        </div>
    );

    if (isFloating) {
        return ReactDOM.createPortal(<CalendarContent />, document.body);
    }
    
    return <div className="sidebar-card" style={{padding:0, overflow:'hidden', border:'none'}}><CalendarContent /></div>;
});
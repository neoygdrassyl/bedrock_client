import React, { useState, useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/es';
import { DiasHabilesColombia } from '../../../../utils/BusinessDaysCol.js';

moment.locale('es');

const businessDaysCalculator = new DiasHabilesColombia();

export const HolidayCalendar = () => {
    const [currentDate, setCurrentDate] = useState(moment());
    
    // --- Lógica del Calendario ---
    const allHolidays = useMemo(() => {
        // Carga festivos del año actual, anterior y siguiente para la navegación del calendario
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
            return setResult({ text: 'Fecha de inicio requerida', isError: true });
        }
        
        const startDateStr = startMoment.format('YYYY-MM-DD');

        if (calcMode === 'range') {
            const endMoment = moment(endDate);
            if (!endMoment.isValid()) return setResult({ text: 'Fecha de fin requerida', isError: true });
            if (endMoment.isBefore(startMoment)) return setResult({ text: 'Fecha fin inválida', isError: true });
            
            const endDateStr = endMoment.format('YYYY-MM-DD');
            const businessDays = businessDaysCalculator.contarDiasHabiles(startDateStr, endDateStr);
            setResult({ text: `${businessDays} día(s) hábil(es)`, isError: false });

        } else if (calcMode === 'add') {
            const numDays = parseInt(daysToAdd, 10);
            if (!numDays || numDays <= 0) return setResult({ text: 'Número de días requerido', isError: true });

            const finalDateStr = businessDaysCalculator.sumarDiasHabiles(startDateStr, numDays);
            const finalDateMoment = moment(finalDateStr);
            setResult({ text: finalDateMoment.format('DD MMM YYYY'), isError: false });
        }
    };

    const changeMonth = (amount) => {
        setCurrentDate(currentDate.clone().add(amount, 'month'));
    };

    const renderHeader = () => (
        <div className="calendar-header">
            <button onClick={() => changeMonth(-1)} title="Mes anterior">&lt;</button>
            <div className="current-month" style={{textTransform: 'capitalize'}}>{currentDate.format('MMMM YYYY')}</div>
            <button onClick={() => changeMonth(1)} title="Mes siguiente">&gt;</button>
        </div>
    );

    const renderDaysOfWeek = () => {
        const days = moment.weekdaysShort(true);
        return <div className="calendar-grid days-of-week">{days.map(day => <div key={day}>{day}</div>)}</div>;
    };

    const renderCells = () => {
        const monthStart = currentDate.clone().startOf('month');
        const monthEnd = currentDate.clone().endOf('month');
        const startDate = monthStart.clone().startOf('isoWeek');
        const endDate = monthEnd.clone().endOf('isoWeek');

        const rows = [];
        let day = startDate.clone();

        while (day.isSameOrBefore(endDate, 'day')) {
            const weekRow = [];
            for (let i = 0; i < 7; i++) {
                const formattedDate = day.format('YYYY-MM-DD');
                let dayClass = 'day-cell';
                if (!day.isSame(currentDate, 'month')) {
                    dayClass += ' not-current-month';
                } else if (allHolidays.has(formattedDate)) {
                    dayClass += ' holiday';
                } else if (day.isoWeekday() >= 6) {
                    dayClass += ' weekend';
                }
                if (day.isSame(moment(), 'day')) {
                    dayClass += ' today';
                }

                weekRow.push(<div className={dayClass} key={day.toString()}>{day.date()}</div>);
                day.add(1, 'day');
            }
            rows.push(<div className="calendar-grid" key={day.toString()}>{weekRow}</div>);
        }
        return <div className="calendar-body">{rows}</div>;
    };

    return (
        <div className="sidebar-card calendar-widget">
            <div className="sidebar-card-header">
                <i className="fas fa-calendar-alt"></i>
                <span>Días Hábiles Colombia</span>
            </div>
            <div className="sidebar-card-body">
                {renderHeader()}
                {renderDaysOfWeek()}
                {renderCells()}
                <div className="calendar-legend">
                    <div><span className="legend-box holiday"></span> Festivo</div>
                    <div><span className="legend-box weekend"></span> Fin de semana</div>
                </div>

                <div className="calculator-section">
                    <div className="calc-tabs">
                        <button className={calcMode === 'range' ? 'active' : ''} onClick={() => setCalcMode('range')}>Rango</button>
                        <button className={calcMode === 'add' ? 'active' : ''} onClick={() => setCalcMode('add')}>Sumar Días</button>
                    </div>
                    <div className="calc-body">
                        {calcMode === 'range' ? (
                            <>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <span className="calc-separator">a</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </>
                        ) : (
                            <>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <span className="calc-separator">+</span>
                                <input type="number" placeholder="días" value={daysToAdd} onChange={e => setDaysToAdd(e.target.value)} min="1"/>
                            </>
                        )}
                         <button className="calc-button" onClick={handleCalculate}>=</button>
                    </div>
                    {result && (
                        <div className={`calc-result ${result.isError ? 'error' : ''}`}>
                            {result.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
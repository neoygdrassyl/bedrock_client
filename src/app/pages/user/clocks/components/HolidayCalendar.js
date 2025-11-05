import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { getColombianHolidays, countBusinessDays, addBusinessDays } from './colombianHolidays';

export const HolidayCalendar = () => {
    const [currentDate, setCurrentDate] = useState(moment());
    
    // --- Lógica del Calendario ---
    const holidaysForYear = useMemo(() => getColombianHolidays(currentDate.year()), [currentDate]);
    const holidaysForNextYear = useMemo(() => getColombianHolidays(currentDate.year() + 1), [currentDate]);
    const allHolidays = useMemo(() => [...holidaysForYear, ...holidaysForNextYear], [holidaysForYear, holidaysForNextYear]);

    // --- Lógica de la Calculadora ---
    const [calcMode, setCalcMode] = useState('range'); // 'range' o 'add'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [daysToAdd, setDaysToAdd] = useState('');
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        if (calcMode === 'range') {
            if (!startDate || !endDate) return setResult({ text: 'Fechas requeridas', isError: true });
            const start = moment(startDate);
            const end = moment(endDate);
            if (end.isBefore(start)) return setResult({ text: 'Fecha fin inválida', isError: true });
            
            const businessDays = countBusinessDays(start, end, allHolidays);
            setResult({ text: `${businessDays} día(s) hábil(es)`, isError: false });

        } else if (calcMode === 'add') {
            const numDays = parseInt(daysToAdd, 10);
            if (!startDate || !numDays || numDays <= 0) return setResult({ text: 'Datos requeridos', isError: true });

            const finalDate = addBusinessDays(moment(startDate), numDays, allHolidays);
            setResult({ text: finalDate.format('DD MMM YYYY'), isError: false });
        }
    };

    const changeMonth = (amount) => {
        setCurrentDate(currentDate.clone().add(amount, 'month'));
    };

    const renderHeader = () => (
        <div className="calendar-header">
            <button onClick={() => changeMonth(-1)} title="Mes anterior">&lt;</button>
            <div className="current-month">{currentDate.format('MMMM YYYY')}</div>
            <button onClick={() => changeMonth(1)} title="Mes siguiente">&gt;</button>
        </div>
    );

    const renderDaysOfWeek = () => {
        const days = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
        return <div className="calendar-grid days-of-week">{days.map(day => <div key={day}>{day}</div>)}</div>;
    };

    const renderCells = () => {
        const monthStart = currentDate.clone().startOf('month');
        const monthEnd = currentDate.clone().endOf('month');
        const startDate = monthStart.clone().startOf('isoWeek');
        const endDate = monthEnd.clone().endOf('isoWeek');

        const rows = [];
        let days = [];
        let day = startDate.clone();

        while (day.isBefore(endDate, 'day')) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = day.format('YYYY-MM-DD');
                let dayClass = 'day-cell';
                if (!day.isSame(currentDate, 'month')) dayClass += ' not-current-month';
                else if (allHolidays.includes(formattedDate)) dayClass += ' holiday';
                else if (day.day() === 0 || day.day() === 6) dayClass += ' weekend';
                if (day.isSame(moment(), 'day')) dayClass += ' today';

                days.push(<div className={dayClass} key={day.toString()}>{day.date()}</div>);
                day.add(1, 'day');
            }
            rows.push(<div className="calendar-grid" key={day.toString()}>{days}</div>);
            days = [];
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

                {/* --- Calculadora --- */}
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
                                <input type="number" placeholder="días" value={daysToAdd} onChange={e => setDaysToAdd(e.target.value)} />
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
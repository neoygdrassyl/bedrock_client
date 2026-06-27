import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

export const ControlBar = ({ timeTravel, onClose }) => {
  const { systemDate, onDateChange, onDateShift, onDateReset } = timeTravel;
  const isToday = dayjs(systemDate).isSame(dayjs(), 'day');

  return (
    <div className="control-bar">
      <div className="bar-inner">
        <div className="time-travel-controls">
          {/* <span className="control-label"><Icon name="magic" size={16} className="me-2" />Emulador</span> */}
          
          <Button variant="outline" size="sm" title="Retroceder 5 días"
            onClick={() => onDateShift(-5)}
          >
            <Icon name="chevron-left" size={16} className="me-1" />-5d
          </Button>

          <Button variant="outline" size="sm" title="Retroceder 1 días"
            onClick={() => onDateShift(-1)}
          >
            <Icon name="chevron-left" size={16} className="me-1" />-1d
          </Button>
          
          <input 
            type="date" 
            className="form-control form-control-sm date-picker"
            value={systemDate}
            onChange={(e) => onDateChange(e.target.value)}
          />

          <Button variant="outline" size="sm" title="Avanzar 1 días"
            onClick={() => onDateShift(1)}
          >
            <Icon name="chevron-right" size={16} className="me-1" />+1d
          </Button>
          
          <Button variant="outline" size="sm" title="Avanzar 5 días"
            onClick={() => onDateShift(5)}
          >
            +5d<Icon name="chevron-right" size={16} className="ms-1" />
          </Button>
          
          <Button 
            variant={isToday ? "outline" : "default"}
            size="sm"
            title="Volver a la fecha actual"
            onClick={onDateReset}
            disabled={isToday}
          >
            <Icon name="undo" size={16} className="me-1" /> Hoy
          </Button>
        </div>
        <div className="actions">
            {onClose && (
              <Button variant="outline" size="sm" className="text-destructive border-destructive border-0" onClick={onClose}
                  title="Ocultar barra de tiempo">
                  <Icon name="times" size={16} />
              </Button>
            )}
        </div>
      </div>
       {!isToday && (
        <div className="time-travel-banner">
          <Icon name="exclamation-triangle" size={16} className="me-2" />
          Estás viendo el expediente a fecha de <strong>{dayjs(systemDate).format('DD MMMM YYYY')}</strong>. Los cálculos reflejan esta fecha.
        </div>
      )}
    </div>
  );
};
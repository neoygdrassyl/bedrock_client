import React from 'react';
import { Icon } from '@/components/icon';

export function MissingDataBadge({ reason = 'generic' }) {
  const getReasonData = () => {
    switch (reason) {
      case 'fecha_radicacion':
        return { text: 'Falta radicación', icon: 'calendar-times' };
      case 'termino':
        return { text: 'Sin término', icon: 'clock' };
      case 'categoria':
        return { text: 'Falta categoría', icon: 'tags' };
      case 'actor':
        return { text: 'Sin responsable', icon: 'user-times' };
      case 'generic':
      default:
        return { text: 'Dato legal faltante', icon: 'exclamation-triangle' };
    }
  };

  const { text, icon } = getReasonData();

  return (
    <span 
      className="badge bg-warning text-dark border border-warning d-inline-flex align-items-center gap-1" 
      title="Información legal requerida"
    >
      <Icon name={icon} size={12} /> {text}
    </span>
  );
}

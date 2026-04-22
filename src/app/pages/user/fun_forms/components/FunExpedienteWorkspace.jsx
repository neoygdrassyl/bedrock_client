import React from 'react';
import { FunExpedienteFullscreen } from './FunExpedienteFullscreen';

export function FunExpedienteWorkspace({ expediente, onClose, onRefresh }) {
  return (
    <div
      className="fixed inset-0 z-[1050] bg-background"
      data-testid="fun-expediente-workspace"
      role="dialog"
      aria-label="Detalle del expediente"
    >
      <FunExpedienteFullscreen
        expediente={expediente}
        onClose={onClose}
      />
    </div>
  );
}

export default FunExpedienteWorkspace;

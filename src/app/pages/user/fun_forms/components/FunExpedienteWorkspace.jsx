import React from 'react';
import { FunExpedienteDetail } from './FunExpedienteDetail';

export function FunExpedienteWorkspace({ expediente, onClose, onRefresh }) {
  return (
    <div className="fixed inset-0 z-[1050] bg-background" data-testid="fun-expediente-workspace">
      <FunExpedienteDetail
        expediente={expediente}
        onClose={onClose}
      />
    </div>
  );
}

export default FunExpedienteWorkspace;

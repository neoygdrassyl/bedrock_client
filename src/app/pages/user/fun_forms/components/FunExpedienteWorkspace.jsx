import React from 'react';
import { FunExpedienteFullscreen } from './FunExpedienteFullscreen';

export function FunExpedienteWorkspace({ expediente, translation, globals, swaMsg, onClose, onRefresh }) {
  return (
    <FunExpedienteFullscreen
      expediente={expediente}
      translation={translation}
      globals={globals}
      swaMsg={swaMsg}
      onClose={onClose}
      onRefresh={onRefresh}
    />
  );
}

export default FunExpedienteWorkspace;

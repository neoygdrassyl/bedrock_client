import React from 'react';

export const ControlBar = ({ actions }) => {
  const { onSetIsFull, isFull } = actions;

  return (
    <div className="control-bar">
      <div className="bar-inner">
        {/* Espacio reservado para futuros controles sobre la tabla */}
        <div className="actions">
          {!isFull && (
            <button type="button" className="btn btn-outline-secondary btn-sm exp-full-btn" title="Pantalla completa" onClick={() => onSetIsFull(true)}>
              <i className="fas fa-expand"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
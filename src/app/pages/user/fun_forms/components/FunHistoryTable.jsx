import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import { Icon } from '@/components/icon';
import { swalError } from '@/app/utils/swalAdapter';
import { formatHistoryDate, getHistoryDocumentLabel } from './funHistory.utils';

export default function FunHistoryTable({ history, loading, error, onDownload, onSaveObservation }) {
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const observationRef = useRef('');
  const historyEntries = Array.isArray(history) ? history : [];

  const startEditing = (entry) => {
    if (!entry || typeof entry !== 'object' || entry.id == null) {
      swalError({
        title: 'REGISTRO NO DISPONIBLE',
        text: 'No fue posible editar la observación porque el registro histórico está incompleto.',
      });
      return;
    }

    setEditingId(entry.id);
    observationRef.current = entry.observation || '';
  };

  const saveObservation = async (entry) => {
    setSavingId(entry.id);
    try {
      await onSaveObservation(entry.id, observationRef.current);
      setEditingId(null);
    } catch (error) {
      swalError({
        title: 'ERROR AL GUARDAR',
        text: error?.message || 'No fue posible actualizar la observación del histórico.',
      });
    } finally {
      setSavingId(null);
    }
  };

  const startDownload = (entry) => {
    if (!entry || typeof entry !== 'object' || typeof onDownload !== 'function') {
      swalError({
        title: 'PDF NO DISPONIBLE',
        text: 'No fue posible preparar la descarga de esta versión FUN.',
      });
      return;
    }

    onDownload(entry);
  };

  const columns = [
    {
      name: 'DOCUMENTO',
      center: true,
      minWidth: '180px',
      cell: (entry) => <span className="fw-semibold">{getHistoryDocumentLabel(entry)}</span>,
    },
    {
      name: 'FECHA',
      center: true,
      maxWidth: '170px',
      cell: (entry) => <span className="whitespace-nowrap">{formatHistoryDate(entry?.historyDate)}</span>,
    },
    {
      name: 'OBSERVACIÓN',
      minWidth: '320px',
      cell: (entry) => (
        editingId === entry?.id ? (
          <div className="d-flex gap-2 align-items-start">
            <textarea
              aria-label={`Observación de ${getHistoryDocumentLabel(entry)}`}
              className="form-control"
              rows="2"
              maxLength="4000"
              defaultValue={observationRef.current}
              onChange={(event) => { observationRef.current = event.target.value; }}
            />
            <Button size="sm" disabled={savingId === entry.id} onClick={() => saveObservation(entry)}>
              Guardar
            </Button>
          </div>
        ) : (
          <div className="d-flex gap-2 align-items-center">
            <span>{entry?.observation || 'Sin observación'}</span>
          </div>
        )
      ),
    },
    {
      name: 'ACCIÓN',
      button: true,
      center: true,
      minWidth: '210px',
      cell: (entry) => (
        <div className="d-inline-flex gap-1">
          <Button
            aria-label={`Editar observación de ${getHistoryDocumentLabel(entry)}`}
            size="sm"
            variant="outline"
            className="px-2"
            onClick={() => startEditing(entry)}
          >
            <Icon name="edit" size={16} />
          </Button>
          <Button
            aria-label={`Descargar ${getHistoryDocumentLabel(entry)}`}
            size="sm"
            variant="outline"
            onClick={() => startDownload(entry)}
          >
            Descargar PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <fieldset className="p-3 mt-3">
      <legend className="my-2 px-3 bg-light" id="fun_history">
        <label className="app-p lead fw-normal">HISTÓRICO DE CAMBIOS FUN</label>
      </legend>
      {error && <div className="alert alert-warning" role="alert">{error}</div>}
      <DataTable
        noDataComponent="No hay versiones FUN disponibles."
        striped
        columns={columns}
        data={historyEntries}
        highlightOnHover
        className="data-table-component"
        noHeader
        dense
        progressPending={loading}
        progressComponent={<label className="fw-normal lead text-muted">Cargando histórico...</label>}
      />
    </fieldset>
  );
}

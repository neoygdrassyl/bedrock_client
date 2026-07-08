import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import documentRequirementService from '../../../services/document_requirement.service.js';

const DEFAULT_SELECTION = {};

function isAbortedPreviewError(error) {
  return error?.name === 'AbortError'
    || error?.name === 'CanceledError'
    || error?.code === 'ERR_CANCELED';
}

export function useDocumentRequirementExplorer(status = 'published') {
  const [explorer, setExplorer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestIdRef = useRef(0);
  const previewAbortControllerRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await documentRequirementService.getExplorer(status);
      setExplorer(response.data);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Error al cargar la configuración documental.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const simulate = useCallback(async (selectionOverride) => {
    const active = selectionOverride ?? selection;
    if (!active || Object.keys(active).length === 0) return;

    previewAbortControllerRef.current?.abort();

    const requestId = previewRequestIdRef.current + 1;
    previewRequestIdRef.current = requestId;
    const controller = new AbortController();
    previewAbortControllerRef.current = controller;

    try {
      setPreviewLoading(true);
      setErrorMessage('');
      const result = await documentRequirementService.previewRequirements(active, {
        status,
        signal: controller.signal,
      });

      if (requestId !== previewRequestIdRef.current || controller.signal.aborted) return;

      setPreview(result.data);
    } catch (error) {
      if (
        requestId !== previewRequestIdRef.current
        || controller.signal.aborted
        || isAbortedPreviewError(error)
      ) {
        return;
      }

      const message = error?.response?.data?.message || error?.message || 'No se pudo calcular la lista con estos datos. La configuración vigente no fue modificada.';
      setErrorMessage(message);
      setPreview(null);
    } finally {
      if (requestId === previewRequestIdRef.current) {
        setPreviewLoading(false);
      }
    }
  }, [selection, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => () => {
    previewAbortControllerRef.current?.abort();
  }, []);

  const selectionIsEmpty = useMemo(
    () => !selection || Object.keys(selection).length === 0,
    [selection],
  );

  return {
    explorer,
    loading,
    errorMessage,
    selection,
    setSelection,
    preview,
    previewLoading,
    selectionIsEmpty,
    refresh,
    simulate,
    status,
  };
}

export function getDocumentRequirementErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Error al procesar la configuración documental.';
}

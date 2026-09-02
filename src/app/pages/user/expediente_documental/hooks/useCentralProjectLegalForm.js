import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DocumentRequirementService from '../../../../services/document_requirement.service';
import {
  getCentralProjectLegalForm,
  getCentralProjectPayload,
  getLegalFormSourceLabel,
  getSelectedLegalFormVr,
  normalizeLegalFormVrOptions,
} from '../documentalViewModel';

const LOAD_ERROR_MESSAGE = 'No fue posible consultar el contexto documental de Dovela Central.';
const SAVE_ERROR_MESSAGE = 'No fue posible guardar el VR de Legal y debida forma.';

export function useCentralProjectLegalForm({
  currentPublic,
  fallbackVrOptions = [],
  latestVr = '',
} = {}) {
  const requestSequence = useRef(0);
  const [projectContext, setProjectContext] = useState(null);
  const [selectedVrOverride, setSelectedVrOverride] = useState('');
  const [loading, setLoading] = useState(Boolean(currentPublic));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const refresh = useCallback(async () => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;

    if (!currentPublic) {
      setProjectContext(null);
      setSelectedVrOverride('');
      setLoading(false);
      setError('');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const response = await DocumentRequirementService.getCentralProject(currentPublic);
      const payload = getCentralProjectPayload(response);
      if (requestSequence.current === requestId) {
        setProjectContext(payload);
        setSelectedVrOverride('');
      }
      return payload;
    } catch (loadError) {
      console.warn(LOAD_ERROR_MESSAGE, loadError);
      if (requestSequence.current === requestId) {
        setProjectContext(null);
        setError(LOAD_ERROR_MESSAGE);
      }
      return null;
    } finally {
      if (requestSequence.current === requestId) setLoading(false);
    }
  }, [currentPublic]);

  useEffect(() => {
    refresh();
    return () => {
      requestSequence.current += 1;
    };
  }, [refresh]);

  const legalForm = useMemo(
    () => getCentralProjectLegalForm(projectContext || {}),
    [projectContext],
  );
  const persistedSelectedVr = useMemo(
    () => getSelectedLegalFormVr(legalForm),
    [legalForm],
  );
  const selectedVr = selectedVrOverride || persistedSelectedVr;
  const options = useMemo(
    () => normalizeLegalFormVrOptions(legalForm, fallbackVrOptions, latestVr),
    [fallbackVrOptions, latestVr, legalForm],
  );
  const defaultVr = selectedVr
    || options.find((option) => option.isLatest)?.value
    || options[0]?.value
    || latestVr
    || '';

  const saveSelection = useCallback(async (vrIdPublic) => {
    const normalizedVr = String(vrIdPublic || '').trim();
    if (!currentPublic || !normalizedVr || saving) return false;

    setSaving(true);
    setSaveError('');
    try {
      const response = await DocumentRequirementService.updateCentralProjectLegalForm(
        currentPublic,
        { vrIdPublic: normalizedVr },
      );
      const payload = getCentralProjectPayload(response);
      if (payload && typeof payload === 'object') {
        setProjectContext((current) => {
          const updatedLegalForm = payload?.legalForm || payload?.legal_form;
          if (updatedLegalForm) {
            return {
              ...(current || {}),
              ...payload,
              legalForm: updatedLegalForm,
            };
          }
          return payload;
        });
      }
      setSelectedVrOverride(normalizedVr);
      return true;
    } catch (saveSelectionError) {
      console.warn(SAVE_ERROR_MESSAGE, saveSelectionError);
      setSaveError(SAVE_ERROR_MESSAGE);
      return false;
    } finally {
      setSaving(false);
    }
  }, [currentPublic, saving]);

  return {
    projectContext,
    legalForm,
    sourceLabel: getLegalFormSourceLabel(legalForm),
    selectedVr,
    defaultVr,
    options,
    loading,
    error,
    saving,
    saveError,
    clearSaveError: () => setSaveError(''),
    refresh,
    saveSelection,
  };
}

export default useCentralProjectLegalForm;

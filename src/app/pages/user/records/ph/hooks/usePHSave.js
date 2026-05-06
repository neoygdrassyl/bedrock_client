import { useState, useCallback } from 'react';
import { swalLoading, swalSuccess, swalError } from '@/app/utils/swalAdapter';

export default function usePHSave(swaMsg) {
  const [isSaving, setIsSaving] = useState(false);

  const execute = useCallback(async (operationPromise, options = {}) => {
    const {
      operationName = 'guardar',
      loading = true,
      success = true,
      error = true,
    } = options;

    if (loading) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
    setIsSaving(true);

    try {
      const response = await operationPromise;

      if (response.data === 'OK') {
        if (success) {
          swalSuccess({
            title: swaMsg.publish_success_title,
            text: swaMsg.publish_success_text,
            footer: swaMsg.text_footer,
          });
        }
        return { ok: true, data: response.data };
      }

      if (response.data === 'ERROR_DUPLICATE') {
        if (error) {
          swalError({
            title: 'ERROR DE DUPLICACIÓN',
            text: 'El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo',
          });
        }
        return { ok: false, error: 'duplicate' };
      }

      if (error) {
        swalError({
          title: `Error al ${operationName}`,
          text: swaMsg.generic_error_text,
          icon: 'warning',
        });
      }
      return { ok: false, error: 'unknown', data: response.data };
    } catch (e) {
      console.error(e);
      if (error) {
        swalError({
          title: `Error al ${operationName}`,
          text: swaMsg.generic_error_text,
          icon: 'warning',
        });
      }
      return { ok: false, error: e };
    } finally {
      setIsSaving(false);
    }
  }, [swaMsg]);

  const executeSteps = useCallback(async (steps) => {
    setIsSaving(true);

    for (const step of steps) {
      swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

      try {
        const response = await step.promise;
        if (response.data !== 'OK') {
          swalError({
            title: `Error al ${step.name}`,
            text: swaMsg.generic_error_text,
            icon: 'warning',
          });
          setIsSaving(false);
          return { ok: false, failedStep: step.name, data: response.data };
        }
      } catch (e) {
        console.error(e);
        swalError({
          title: `Error al ${step.name}`,
          text: swaMsg.generic_error_text,
          icon: 'warning',
        });
        setIsSaving(false);
        return { ok: false, failedStep: step.name, error: e };
      }
    }

    swalSuccess({
      title: swaMsg.publish_success_title,
      text: swaMsg.publish_success_text,
      footer: swaMsg.text_footer,
    });
    setIsSaving(false);
    return { ok: true };
  }, [swaMsg]);

  return { isSaving, execute, executeSteps };
}

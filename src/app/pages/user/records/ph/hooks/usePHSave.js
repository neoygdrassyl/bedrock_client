import { useState, useCallback } from 'react';
import { swalLoading, swalSuccess, swalError } from '@/app/utils/swalAdapter';

export default function usePHSave(swaMsg) {
  const [isSaving, setIsSaving] = useState(false);
  const messages = swaMsg?.swaMsg ?? swaMsg ?? {};

  const execute = useCallback(async (operationPromise, options = {}) => {
    const {
      operationName = 'guardar',
      loading = true,
      success = true,
      error = true,
      onSuccess,
      onError,
      isSuccessResponse = response => response.data === 'OK',
    } = options;

    if (loading) swalLoading({ title: messages.title_wait, text: messages.text_wait });
    setIsSaving(true);

    try {
      const response = await operationPromise;

      if (isSuccessResponse(response)) {
        await onSuccess?.(response);
        if (success) {
          swalSuccess({
            title: messages.publish_success_title,
            text: messages.publish_success_text,
            footer: messages.text_footer,
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
        await onError?.(response);
        return { ok: false, error: 'duplicate' };
      }

      if (error) {
        swalError({
          title: `Error al ${operationName}`,
          text: messages.generic_error_text,
          icon: 'warning',
        });
      }
      await onError?.(response);
      return { ok: false, error: 'unknown', data: response.data };
    } catch (e) {
      console.error(e);
      if (error) {
        swalError({
          title: `Error al ${operationName}`,
          text: messages.generic_error_text,
          icon: 'warning',
        });
      }
      await onError?.(e);
      return { ok: false, error: e };
    } finally {
      setIsSaving(false);
    }
  }, [messages]);

  const executeSteps = useCallback(async (steps) => {
    setIsSaving(true);

    for (const step of steps) {
      swalLoading({ title: messages.title_wait, text: messages.text_wait });

      try {
        const response = await step.promise;
        if (response.data !== 'OK') {
          swalError({
            title: `Error al ${step.name}`,
            text: messages.generic_error_text,
            icon: 'warning',
          });
          setIsSaving(false);
          return { ok: false, failedStep: step.name, data: response.data };
        }
      } catch (e) {
        console.error(e);
        swalError({
          title: `Error al ${step.name}`,
          text: messages.generic_error_text,
          icon: 'warning',
        });
        setIsSaving(false);
        return { ok: false, failedStep: step.name, error: e };
      }
    }

    swalSuccess({
      title: messages.publish_success_title,
      text: messages.publish_success_text,
      footer: messages.text_footer,
    });
    setIsSaving(false);
    return { ok: true };
  }, [messages]);

  return { isSaving, execute, executeSteps };
}

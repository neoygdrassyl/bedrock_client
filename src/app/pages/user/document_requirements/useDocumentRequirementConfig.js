import { useCallback, useEffect, useMemo, useState } from 'react';
import DocumentRequirementService from '../../../services/document_requirement.service.js';

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response ?? {};
}

function normalizeConfigPayload(payload) {
  const data = unwrapResponse(payload);
  return {
    configVersion: data.configVersion ?? data.version ?? null,
    status: data.status || null,
    config: data.config ?? data.configJson ?? null,
    updatedAt: data.updatedAt || data.updated_at || data.publishedAt || data.published_at || null,
    raw: data,
  };
}

function formatErrorDetails(details) {
  if (Array.isArray(details)) return details.filter(Boolean).join(' ');
  if (typeof details === 'string') return details;
  if (details && typeof details === 'object') return Object.values(details).flat().filter(Boolean).join(' ');
  return '';
}

export function getDocumentRequirementErrorMessage(error, fallback = 'No fue posible cargar la configuración documental.') {
  const data = error?.response?.data;
  const message = data?.message || error?.message || fallback;
  const details = formatErrorDetails(data?.errors || error?.details);
  return [message, details].filter(Boolean).join(' ');
}

export function useDocumentRequirementConfig() {
  const [published, setPublished] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [publishedResult, draftResult] = await Promise.allSettled([
      DocumentRequirementService.getConfig('published'),
      DocumentRequirementService.getConfig('draft'),
    ]);

    let firstError = null;
    let nextPublished = null;
    let nextDraft = null;

    if (publishedResult.status === 'fulfilled') {
      nextPublished = normalizeConfigPayload(publishedResult.value);
      setPublished(nextPublished);
    } else {
      firstError = publishedResult.reason;
    }

    if (draftResult.status === 'fulfilled') {
      nextDraft = normalizeConfigPayload(draftResult.value);
      setDraft(nextDraft);
    } else if (!firstError) {
      firstError = draftResult.reason;
    }

    if (firstError) setError(firstError);
    setLoading(false);

    return { published: nextPublished, draft: nextDraft, error: firstError };
  }, []);

  const saveDraft = useCallback(async (nextConfig) => {
    setSaving(true);
    setActionError(null);
    try {
      const response = await DocumentRequirementService.saveDraft(nextConfig);
      const nextDraft = normalizeConfigPayload(response);
      setDraft(nextDraft);
      return nextDraft;
    } catch (err) {
      setActionError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const publishConfig = useCallback(async () => {
    setPublishing(true);
    setActionError(null);
    try {
      const response = await DocumentRequirementService.publishConfig();
      await refetch();
      return unwrapResponse(response);
    } catch (err) {
      setActionError(err);
      throw err;
    } finally {
      setPublishing(false);
    }
  }, [refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const errorMessage = useMemo(() => (
    error ? getDocumentRequirementErrorMessage(error) : ''
  ), [error]);

  return {
    published,
    draft,
    loading,
    saving,
    publishing,
    error,
    actionError,
    errorMessage,
    refetch,
    saveDraft,
    publishConfig,
  };
}

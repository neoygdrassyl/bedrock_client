import { useEffect, useMemo, useState } from 'react';
import DocumentRequirementService from '@/app/services/document_requirement.service.js';

export const INSUFFICIENT_REQUIREMENT_PREVIEW_MESSAGE = 'Información incompleta para resolver requisitos';

const EMPTY_PREVIEW = Object.freeze({
  configVersion: null,
  source: 'published',
  sourceLabel: 'Publicada',
  requiredDocuments: [],
  matchedRules: [],
  diagnostics: [],
});

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  if (value == null || value === false) return [];
  const text = String(value).trim();
  if (!text) return [];
  return text.split(',').map((item) => item.trim()).filter(Boolean);
}

function normalizeScalar(value) {
  if (Array.isArray(value)) return value[0] ? String(value[0]).trim() : '';
  if (value == null || value === false) return '';
  return String(value).trim();
}

function normalizeActuacion(actuacion = {}) {
  return {
    tipo: normalizeList(actuacion.tipo),
    tramite: normalizeScalar(actuacion.tramite),
    m_urb: normalizeScalar(actuacion.m_urb),
    m_sub: normalizeScalar(actuacion.m_sub),
    m_lic: normalizeList(actuacion.m_lic),
    usos: normalizeList(actuacion.usos),
    area: normalizeScalar(actuacion.area),
    vivienda: normalizeScalar(actuacion.vivienda),
    cultural: normalizeScalar(actuacion.cultural),
    regla_1: normalizeScalar(actuacion.regla_1),
    regla_2: normalizeScalar(actuacion.regla_2),
  };
}

function hasInsufficientInputs(actuacion) {
  if (!actuacion.tipo.length || !actuacion.tramite) return true;
  if (actuacion.tipo.includes('A') && !actuacion.m_urb) return true;
  if (actuacion.tipo.includes('C') && !actuacion.m_sub) return true;
  if (actuacion.tipo.includes('D') && !actuacion.m_lic.length) return true;
  return false;
}

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response ?? {};
}

function getSourceLabel(source) {
  if (source === 'draft') return 'Borrador';
  if (source === 'published') return 'Publicada';
  if (source === 'legacy' || source === 'legacy_snapshot') return 'Legado';
  if (source === 'error') return 'Error';
  return source || 'Publicada';
}

function normalizePreviewPayload(response, fallbackStatus) {
  const data = unwrapResponse(response);
  const source = data.status || data.source || fallbackStatus || 'published';
  const requiredDocuments = Array.isArray(data.requiredDocuments)
    ? data.requiredDocuments
    : Array.isArray(data.requirements)
      ? data.requirements
      : [];
  const matchedRules = Array.isArray(data.matchedRules)
    ? data.matchedRules
    : Array.isArray(data.traces)
      ? data.traces
      : [];

  return {
    configVersion: data.configVersion ?? data.version ?? null,
    source,
    sourceLabel: getSourceLabel(source),
    requiredDocuments,
    matchedRules,
    diagnostics: Array.isArray(data.diagnostics) ? data.diagnostics : [],
    raw: data,
  };
}

function getPreviewErrorMessage(error) {
  return error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message
    || 'No fue posible resolver el preview de requisitos documentales.';
}

export function useRequirementPreview(actuacion, options = {}) {
  const {
    configStatus = 'published',
    debounceMs = 500,
  } = options;
  const normalizedActuacion = useMemo(() => normalizeActuacion(actuacion), [actuacion]);
  const signature = useMemo(
    () => JSON.stringify({ configStatus, normalizedActuacion }),
    [configStatus, normalizedActuacion]
  );
  const [state, setState] = useState(() => ({
    status: hasInsufficientInputs(normalizedActuacion) ? 'insufficient' : 'idle',
    message: hasInsufficientInputs(normalizedActuacion) ? INSUFFICIENT_REQUIREMENT_PREVIEW_MESSAGE : '',
    preview: EMPTY_PREVIEW,
  }));

  useEffect(() => {
    const nextActuacion = normalizeActuacion(JSON.parse(signature).normalizedActuacion);

    if (hasInsufficientInputs(nextActuacion)) {
      setState({
        status: 'insufficient',
        message: INSUFFICIENT_REQUIREMENT_PREVIEW_MESSAGE,
        preview: { ...EMPTY_PREVIEW, source: configStatus, sourceLabel: getSourceLabel(configStatus) },
      });
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setState((currentState) => ({
        ...currentState,
        status: 'loading',
        message: '',
        preview: {
          ...currentState.preview,
          source: configStatus,
          sourceLabel: getSourceLabel(configStatus),
        },
      }));

      DocumentRequirementService.previewRequirements({
        configStatus,
        actuacion: nextActuacion,
      })
        .then((response) => {
          if (!active) return;
          setState({
            status: 'ready',
            message: '',
            preview: normalizePreviewPayload(response, configStatus),
          });
        })
        .catch((error) => {
          if (!active) return;
          setState({
            status: 'warning',
            message: getPreviewErrorMessage(error),
            preview: { ...EMPTY_PREVIEW, source: 'error', sourceLabel: 'Error' },
          });
        });
    }, debounceMs);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [configStatus, debounceMs, signature]);

  return state;
}

export function normalizeRequirementPreviewInput(actuacion) {
  return normalizeActuacion(actuacion);
}

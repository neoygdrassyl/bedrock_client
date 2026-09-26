import { saveAs } from 'file-saver';

import http from '@/http-common';

function readBlobText(blob) {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

async function normalizeBlobError(error) {
  const data = error?.response?.data;
  if (!(data instanceof Blob)) return error;

  try {
    const text = await readBlobText(data);
    const parsed = JSON.parse(text);
    error.response.data = parsed;
    error.message = parsed.message || parsed.error || error.message;
  } catch {
    // Preserve the original transport error when the blob is not JSON.
  }

  return error;
}

async function errorFromJsonBlob(blob, fallbackMessage) {
  try {
    const text = await readBlobText(blob);
    const parsed = JSON.parse(text);
    const error = new Error(parsed.message || parsed.error || fallbackMessage);
    error.response = { data: parsed };
    return error;
  } catch {
    return new Error(fallbackMessage);
  }
}

export function toProtectedApiPath(source) {
  if (!source || typeof source !== 'string' || /^(?:blob:|data:)/.test(source)) return null;

  const apiBaseUrl = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  let path = source;

  if (apiBaseUrl && path.startsWith(apiBaseUrl)) {
    path = path.slice(apiBaseUrl.length) || '/';
  }
  if (path.startsWith('/api/')) {
    path = path.slice(4);
  }

  return /^\/(?:files|pdf|seal|pdf-generate)\//.test(path) ? path : null;
}

function encodePathSegment(segment) {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

export function buildProtectedFilePath(...parts) {
  const path = parts
    .flatMap((part) => String(part || '').split('/'))
    .filter(Boolean)
    .map(encodePathSegment)
    .join('/');
  return `/files/${path}`;
}

export async function requestProtectedBlob(path, requestConfig = {}) {
  try {
    const response = await http.request({
      ...requestConfig,
      method: requestConfig.method || 'GET',
      responseType: 'blob',
      url: path,
    });
    const contentType = response.headers?.['content-type'] || response.data?.type || '';

    if (contentType.includes('application/json')) {
      if (response.data instanceof Blob) {
        throw await errorFromJsonBlob(response.data, 'El servidor no devolvió un documento válido.');
      }
      throw new Error(response.data?.message || response.data?.error || 'El servidor no devolvió un documento válido.');
    }

    return response;
  } catch (error) {
    throw await normalizeBlobError(error);
  }
}

export async function requestProtectedArrayBuffer(path, requestConfig = {}) {
  try {
    const response = await http.request({
      ...requestConfig,
      method: requestConfig.method || 'GET',
      responseType: 'arraybuffer',
      url: path,
    });
    const contentType = response.headers?.['content-type'] || '';

    if (contentType.includes('application/json')) {
      const parsed = JSON.parse(new TextDecoder().decode(response.data));
      throw new Error(parsed.message || parsed.error || 'El servidor no devolvió un documento válido.');
    }

    return response;
  } catch (error) {
    throw await normalizeBlobError(error);
  }
}

export async function downloadProtectedFile(path, filename, requestConfig = {}) {
  const response = await requestProtectedBlob(path, requestConfig);
  saveAs(response.data, filename);
  return response;
}

export async function downloadProtectedPdf(path, filename, requestConfig = {}) {
  const response = await requestProtectedBlob(path, requestConfig);
  const contentType = response.headers?.['content-type'] || response.data?.type || '';

  if (contentType && !contentType.includes('application/pdf') && !contentType.includes('application/octet-stream')) {
    throw new Error(`Respuesta PDF inválida (${contentType}).`);
  }

  saveAs(response.data, filename);
  return response;
}

export function downloadGeneratedPdf(generationResponse, legacyPath, filename) {
  const artifactId = generationResponse?.data?.artifactId;
  if (!artifactId && !legacyPath) {
    return Promise.reject(new Error('El servidor no devolvió un PDF generado seguro.'));
  }
  const path = artifactId ? `/pdf/artifacts/${encodePathSegment(artifactId)}` : legacyPath;
  return downloadProtectedPdf(path, filename);
}

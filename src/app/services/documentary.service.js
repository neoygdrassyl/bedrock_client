import http from '../../http-common';
import {
  validateDocumentaryView, validateDocumentaryConfigurations, isSafeDocumentaryFileUrl,
} from '../pages/user/expediente_documental/documentaryViewContract';

const ROOT = '/fun/documentary/v1';
const headers = { 'Content-Type': 'application/json' };

export function documentaryProjectId(value) {
  if (!['number', 'string'].includes(typeof value) || !/^[1-9]\d{0,9}$/.test(String(value)) || Number(value) > 2147483647) {
    throw new Error('No se dispone del identificador interno del expediente.');
  }
  return Number(value);
}

export async function getDocumentaryConfigurations(signal) {
  const response = await http.get(`${ROOT}/configurations`, { headers, signal });
  return validateDocumentaryConfigurations(response.data);
}

export async function getDocumentaryView(fun0Id, configurationId, signal) {
  const projectId = documentaryProjectId(fun0Id);
  const selectedId = configurationId === '' || configurationId == null ? null : documentaryProjectId(configurationId);
  const response = await http.get(`${ROOT}/projects/${projectId}/view`, {
    headers, signal, params: selectedId === null ? {} : { configurationId: selectedId },
  });
  const view = validateDocumentaryView(response.data);
  if (view.project.fun0Id !== projectId || (view.configuration?.id ?? null) !== selectedId) {
    throw new Error('La respuesta no corresponde al expediente y configuración seleccionados.');
  }
  return view;
}

export async function downloadDocumentarySource(source) {
  const url = source.file.downloadUrl;
  if (!isSafeDocumentaryFileUrl(url)) throw new Error('No hay una ruta histórica de descarga segura.');
  // Use the shared JWT client: a direct anchor would omit Authorization.
  const response = await http.get(url.replace(/^\/api/, ''), { headers, responseType: 'blob' });
  const objectUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/octet-stream' }));
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = source.raw.filename || 'documento';
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function documentaryError(error) {
  if (error?.response?.status === 404) return 'No se encontró el recurso solicitado. Si falta la ruta de vista previa, el proceso backend debe cargar esta versión.';
  const payload = error?.response?.data;
  if (payload?.schemaVersion === 'dovela-backoffice/documentary-error/v1' && typeof payload.error?.message === 'string') {
    return `${payload.error.message} (${payload.error.code})`;
  }
  return error?.response ? 'No fue posible consultar la documentación. Revise su sesión y los permisos.' : error?.message || 'No fue posible consultar la documentación.';
}

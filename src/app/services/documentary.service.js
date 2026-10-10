export function documentaryProjectId(value) {
  if (!['number', 'string'].includes(typeof value) || !/^[1-9]\d{0,9}$/.test(String(value)) || Number(value) > 2147483647) {
    throw new Error('No se dispone del identificador interno del expediente.');
  }
  return Number(value);
}

export function documentaryError(error) {
  if (error?.response?.status === 404) return 'No se encontró el recurso solicitado. Si falta la ruta de vista previa, el proceso backend debe cargar esta versión.';
  const payload = error?.response?.data;
  if (payload?.schemaVersion === 'dovela-backoffice/documentary-error/v1' && typeof payload.error?.message === 'string') {
    return `${payload.error.message} (${payload.error.code})`;
  }
  return error?.response ? 'No fue posible consultar la documentación. Revise su sesión y los permisos.' : error?.message || 'No fue posible consultar la documentación.';
}

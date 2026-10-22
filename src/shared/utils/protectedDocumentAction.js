import { downloadProtectedFile, requestProtectedArrayBuffer } from './pdfDownload';
import { swalClose, swalError } from './swalAdapter';

export async function requestProtectedArrayBufferWithFeedback(path, requestConfig) {
  try {
    return requestConfig === undefined
      ? await requestProtectedArrayBuffer(path)
      : await requestProtectedArrayBuffer(path, requestConfig);
  } catch (error) {
    swalClose();
    swalError({
      title: 'ERROR AL CARGAR',
      text: error?.message || 'No fue posible cargar la plantilla del documento.',
    });
    return null;
  }
}

export async function downloadProtectedFileWithFeedback(path, filename, requestConfig) {
  try {
    return await downloadProtectedFile(path, filename, requestConfig);
  } catch (error) {
    swalError({
      title: 'ERROR AL DESCARGAR',
      text: error?.message || 'No fue posible descargar el documento.',
    });
    return null;
  }
}

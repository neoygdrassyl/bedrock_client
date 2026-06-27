import dayjs from 'dayjs';
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';

function sanitizeSegment(value, fallback) {
    const normalized = String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return normalized || fallback;
}

function getExtension(file) {
    const fromName = String(file?.name || '').split('.').pop();
    if (fromName && fromName !== file?.name) return fromName.toLowerCase();
    return String(file?.type || '').split('/').pop() || 'png';
}

export async function uploadRecordArcRichTextImage(file, currentItem) {
    if (!file || !String(file.type || '').startsWith('image/')) {
        throw new Error('BlockNote solo puede adjuntar imagenes en este campo.');
    }

    const year = dayjs(currentItem?.createdAt || new Date()).format('YY');
    const folder = sanitizeSegment(currentItem?.id_public || currentItem?.id, 'sin-radicado');
    const originalName = sanitizeSegment(String(file.name || 'imagen').replace(/\.[^.]+$/, ''), 'imagen');
    const filename = `fun6_${year}_${folder}_blocknote-${Date.now()}-${originalName}.${getExtension(file)}`;
    const formData = new FormData();

    formData.append('file', file, filename);
    formData.set('year', year);
    formData.set('folder', folder);

    const response = await RECORD_ARCSERVICE.uploadRichTextImage(formData);
    const url = response.data?.url;

    if (!url) {
        throw new Error('El backend no devolvio la URL de la imagen.');
    }

    return url;
}
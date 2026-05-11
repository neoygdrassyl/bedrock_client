export const RICH_TEXT_PREFIX = '__DOVELA_BLOCKNOTE_V1__:';

const EMPTY_BLOCKS = [{ type: 'paragraph', content: '' }];

function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function decodeBase64Url(value) {
    const normalized = String(value || '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return new TextDecoder().decode(bytes);
}

export function isRichTextValue(value) {
    return typeof value === 'string' && value.startsWith(RICH_TEXT_PREFIX);
}

function normalizeBlocks(blocks) {
    return Array.isArray(blocks) && blocks.length ? blocks : EMPTY_BLOCKS;
}

function getInlineText(content) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';

    return content.map((item) => {
        if (typeof item === 'string') return item;
        if (item?.type === 'text') return item.text || '';
        if (item?.type === 'link') return getInlineText(item.content) || item.href || '';
        return item?.text || '';
    }).join('');
}

function blockToPlainText(block) {
    if (!block) return '';

    const ownText = block.type === 'image'
        ? `[Imagen: ${block.props?.caption || block.props?.name || block.props?.url || 'sin descripcion'}]`
        : getInlineText(block.content);
    const childText = Array.isArray(block.children)
        ? block.children.map(blockToPlainText).filter(Boolean).join('\n')
        : '';

    return [ownText, childText].filter(Boolean).join('\n');
}

export function richTextBlocksToPlainText(blocks) {
    return normalizeBlocks(blocks)
        .map(blockToPlainText)
        .filter(Boolean)
        .join('\n')
        .trim();
}

export function richTextToPlainText(value) {
    if (!value) return '';

    if (Array.isArray(value)) {
        return richTextBlocksToPlainText(value);
    }

    if (!isRichTextValue(value)) {
        return String(value || '').trim();
    }

    return richTextBlocksToPlainText(parseRichTextBlocks(value));
}

export function parseRichTextBlocks(value) {
    if (!value) return EMPTY_BLOCKS;

    if (Array.isArray(value)) {
        return normalizeBlocks(value);
    }

    if (!isRichTextValue(value)) {
        const lines = String(value || '').split(/\r?\n/);
        const blocks = lines.length ? lines.map((line) => ({ type: 'paragraph', content: line })) : EMPTY_BLOCKS;
        return normalizeBlocks(blocks);
    }

    try {
        const encoded = value.slice(RICH_TEXT_PREFIX.length);
        const parsed = JSON.parse(decodeBase64Url(encoded));
        return normalizeBlocks(parsed);
    } catch (error) {
        console.warn('No fue posible leer contenido BlockNote; se mostrara como texto plano.', error);
        return [{ type: 'paragraph', content: String(value || '') }];
    }
}

export function serializeRichTextBlocks(blocks) {
    const normalizedBlocks = normalizeBlocks(blocks);
    const plainText = richTextBlocksToPlainText(normalizedBlocks);
    const hasMedia = normalizedBlocks.some((block) => block?.type === 'image' || block?.type === 'file' || block?.type === 'video' || block?.type === 'audio');

    if (!plainText && !hasMedia) {
        return '';
    }

    return `${RICH_TEXT_PREFIX}${encodeBase64Url(JSON.stringify(normalizedBlocks))}`;
}

export function sanitizeRichTextForLegacyJoin(value) {
    if (isRichTextValue(value)) return value;
    return String(value || '').replaceAll(';', ',');
}
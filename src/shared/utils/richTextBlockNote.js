export const RICH_TEXT_PREFIX = '__DOVELA_BLOCKNOTE_V1__:';

const EMPTY_BLOCKS = [{ type: 'paragraph', content: [] }];
const MAX_RECOVERY_DEPTH = 8;

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

function plainTextToBlocks(value) {
    const lines = String(value || '').split(/\r?\n/);
    const blocks = lines.length ? lines.map((line) => ({ type: 'paragraph', content: line ? [{ type: 'text', text: line, styles: {} }] : [] })) : EMPTY_BLOCKS;
    return normalizeBlocks(blocks);
}

function decodeJsonStringFragment(value) {
    try {
        return JSON.parse(`"${value}"`);
    } catch (error) {
        return String(value || '')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
    }
}

function extractJsonTextValues(rawJson) {
    const values = [];
    const matcher = /"text"\s*:\s*"/g;
    let match = matcher.exec(rawJson);

    while (match) {
        let escaped = false;
        let closed = false;
        let buffer = '';

        for (let i = matcher.lastIndex; i < rawJson.length; i += 1) {
            const char = rawJson[i];

            if (escaped) {
                buffer += `\\${char}`;
                escaped = false;
                continue;
            }

            if (char === '\\') {
                escaped = true;
                continue;
            }

            if (char === '"') {
                closed = true;
                matcher.lastIndex = i + 1;
                break;
            }

            buffer += char;
        }

        values.push({ text: decodeJsonStringFragment(buffer), closed });
        if (!closed) break;
        match = matcher.exec(rawJson);
    }

    return values;
}

export function canParseRichTextBlocks(value) {
    if (!isRichTextValue(value)) return true;

    try {
        JSON.parse(decodeBase64Url(value.slice(RICH_TEXT_PREFIX.length)));
        return true;
    } catch (error) {
        return false;
    }
}

export function recoverRichTextPlainText(value) {
    const originalValue = String(value || '');
    if (!isRichTextValue(originalValue)) return originalValue.trim();

    const recoveredTexts = [];
    const seenValues = new Set();
    let currentValue = originalValue;

    for (let depth = 0; depth < MAX_RECOVERY_DEPTH; depth += 1) {
        if (!isRichTextValue(currentValue) || seenValues.has(currentValue)) break;
        seenValues.add(currentValue);

        let rawJson = '';
        try {
            rawJson = decodeBase64Url(currentValue.slice(RICH_TEXT_PREFIX.length));
        } catch (error) {
            break;
        }

        try {
            const parsed = JSON.parse(rawJson);
            const plainText = richTextBlocksToPlainText(parsed);
            if (plainText) return plainText;
            break;
        } catch (error) {
            const textValues = extractJsonTextValues(rawJson)
                .map((item) => item.text)
                .filter(Boolean);
            const nestedValue = textValues.find(isRichTextValue);
            const visibleTexts = textValues.filter((text) => !isRichTextValue(text));

            recoveredTexts.push(...visibleTexts);
            if (!nestedValue) break;
            currentValue = nestedValue;
        }
    }

    return recoveredTexts.join('\n').trim() || originalValue.trim();
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
        return plainTextToBlocks(value);
    }

    try {
        const encoded = value.slice(RICH_TEXT_PREFIX.length);
        const parsed = JSON.parse(decodeBase64Url(encoded));
        return normalizeBlocks(parsed);
    } catch (error) {
        console.warn('No fue posible leer contenido BlockNote; se mostrara como texto plano.', error);
        return plainTextToBlocks(recoverRichTextPlainText(value));
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

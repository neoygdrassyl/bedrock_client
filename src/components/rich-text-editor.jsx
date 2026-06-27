import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import {
    canParseRichTextBlocks,
    parseRichTextBlocks,
    richTextToPlainText,
    serializeRichTextBlocks,
} from '@/app/utils/richTextBlockNote';

const TEXT_COLORS = [
    { label: 'Quitar color', color: 'default', swatch: 'transparent', border: true },
    { label: 'Rojo', color: 'red', swatch: '#ef4444' },
    { label: 'Naranja', color: 'orange', swatch: '#f97316' },
    { label: 'Amarillo', color: '#b45309', swatch: '#b45309' },
    { label: 'Verde', color: 'green', swatch: '#22c55e' },
    { label: 'Azul', color: 'blue', swatch: '#3b82f6' },
    { label: 'Morado', color: 'purple', swatch: '#a855f7' },
    { label: 'Gris', color: 'gray', swatch: '#6b7280' },
];

const HIGHLIGHT_COLORS = [
    { label: 'Quitar resaltado', color: 'default', swatch: 'transparent', border: true },
    { label: 'Amarillo', color: 'yellow', swatch: '#fde68a' },
    { label: 'Verde claro', color: 'green', swatch: '#bbf7d0' },
    { label: 'Azul claro', color: 'blue', swatch: '#bfdbfe' },
    { label: 'Rosa', color: 'pink', swatch: '#fbcfe8' },
    { label: 'Naranja claro', color: 'orange', swatch: '#fed7aa' },
    { label: 'Rojo claro', color: 'red', swatch: '#fecaca' },
];

function getCurrentTheme() {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function ColorPicker({ colors, onSelect, onClose, label }) {
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div
            ref={ref}
            style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 100,
                background: 'var(--color-background, #fff)',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                padding: '6px',
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
                width: 'max-content',
                maxWidth: 180,
            }}
        >
            {colors.map((c) => (
                <button
                    key={c.color + c.label}
                    type="button"
                    title={c.label}
                    onMouseDown={(e) => { e.preventDefault(); onSelect(c.color); }}
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: c.swatch,
                        border: c.border ? '1.5px solid #d1d5db' : '1.5px solid transparent',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                    }}
                >
                    {c.border ? '✕' : ''}
                </button>
            ))}
        </div>
    );
}

function RichTextEditor({
    value = '',
    hiddenId,
    hiddenName,
    maxLength,
    readOnly = false,
    minHeight = 150,
    placeholder = 'Escribe aquí...',
    onBlur,
    onSave,
    onPlainTextChange,
    uploadFile,
}) {
    const wrapperRef = useRef(null);
    const hiddenInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const hasEditorChangedRef = useRef(false);
    const initialBlocks = useMemo(() => parseRichTextBlocks(value), [value]);
    const valueHasParseError = useMemo(() => Boolean(value) && !canParseRichTextBlocks(value), [value]);
    const [serializedValue, setSerializedValue] = useState(value || '');
    const [plainTextLength, setPlainTextLength] = useState(() => richTextToPlainText(value).length);
    const [theme, setTheme] = useState(getCurrentTheme);
    const [statusMessage, setStatusMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);

    const editorUploadFile = useCallback(async (file) => {
        if (!uploadFile) {
            throw new Error('No hay un manejador de carga configurado para este editor.');
        }

        try {
            return await uploadFile(file);
        } catch (error) {
            setStatusMessage(error?.message || 'No fue posible cargar la imagen.');
            throw error;
        }
    }, [uploadFile]);
    const editor = useCreateBlockNote({
        initialContent: initialBlocks,
        uploadFile: uploadFile ? editorUploadFile : undefined,
        placeholders: {
            default: placeholder,
        },
    }, [value, editorUploadFile, uploadFile]);

    useEffect(() => {
        hasEditorChangedRef.current = false;
        setSerializedValue(value || '');
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = value || '';
        }
        const nextLength = richTextToPlainText(value).length;
        setPlainTextLength(nextLength);
        onPlainTextChange?.(nextLength);
    }, [value, onPlainTextChange]);

    useEffect(() => {
        if (!editor) return;
        if (valueHasParseError) {
            setSerializedValue(value || '');
            if (hiddenInputRef.current) {
                hiddenInputRef.current.value = value || '';
            }
            return;
        }
        const nextValue = serializeRichTextBlocks(editor.document);
        setSerializedValue(nextValue || value || '');
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = nextValue || value || '';
        }
    }, [editor, value, valueHasParseError]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const observer = new MutationObserver(() => setTheme(getCurrentTheme()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const syncEditorState = useCallback(() => {
        if (valueHasParseError && !hasEditorChangedRef.current) {
            const nextValue = value || '';
            const nextLength = richTextToPlainText(nextValue).length;
            setSerializedValue(nextValue);
            if (hiddenInputRef.current) {
                hiddenInputRef.current.value = nextValue;
            }
            setPlainTextLength(nextLength);
            onPlainTextChange?.(nextLength);
            return { nextValue, nextLength };
        }

        const nextValue = serializeRichTextBlocks(editor.document);
        const nextLength = richTextToPlainText(nextValue).length;
        setSerializedValue(nextValue);
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = nextValue;
        }
        setPlainTextLength(nextLength);
        onPlainTextChange?.(nextLength);
        return { nextValue, nextLength };
    }, [editor, onPlainTextChange, value, valueHasParseError]);

    const handleChange = useCallback(() => {
        hasEditorChangedRef.current = true;
        setStatusMessage('');
        syncEditorState();
    }, [syncEditorState]);

    const handleBlurCapture = useCallback(() => {
        window.setTimeout(() => {
            if (!wrapperRef.current?.contains(document.activeElement)) {
                onBlur?.(syncEditorState());
            }
        }, 0);
    }, [onBlur, syncEditorState]);

    const applyInlineStyle = useCallback((style) => {
        hasEditorChangedRef.current = true;
        editor.focus();
        editor.toggleStyles({ [style]: true });
        syncEditorState();
    }, [editor, syncEditorState]);

    const applyBlockType = useCallback((type, props = {}) => {
        hasEditorChangedRef.current = true;
        editor.focus();
        const currentBlock = editor.getTextCursorPosition().block;
        editor.updateBlock(currentBlock, { type, props });
        syncEditorState();
    }, [editor, syncEditorState]);

    const applyTextColor = useCallback((color) => {
        hasEditorChangedRef.current = true;
        editor.focus();
        editor.toggleStyles({ textColor: color });
        syncEditorState();
        setShowTextColorPicker(false);
    }, [editor, syncEditorState]);

    const applyHighlightColor = useCallback((color) => {
        hasEditorChangedRef.current = true;
        editor.focus();
        editor.toggleStyles({ backgroundColor: color });
        syncEditorState();
        setShowHighlightPicker(false);
    }, [editor, syncEditorState]);

    const insertImage = useCallback(async (file) => {
        if (!file || !uploadFile) return;

        setUploadingImage(true);
        setStatusMessage('Cargando imagen...');

        try {
            const url = await editorUploadFile(file);
            hasEditorChangedRef.current = true;
            const currentBlock = editor.getTextCursorPosition().block;
            const imageBlock = {
                type: 'image',
                props: {
                    url,
                    name: file.name,
                },
            };

            if (Array.isArray(currentBlock.content) && currentBlock.content.length === 0) {
                editor.updateBlock(currentBlock, imageBlock);
            } else {
                editor.insertBlocks([imageBlock], currentBlock, 'after');
            }

            editor.focus();
            syncEditorState();
            setStatusMessage('Imagen cargada.');
        } catch (error) {
            setStatusMessage(error?.message || 'No fue posible cargar la imagen.');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [editor, editorUploadFile, syncEditorState, uploadFile]);

    const handleFileChange = useCallback((event) => {
        insertImage(event.target.files?.[0]);
    }, [insertImage]);

    const handleSave = useCallback(() => {
        const nextState = syncEditorState();
        const saveHandler = onSave || onBlur;

        if (!saveHandler) return;

        setStatusMessage('Guardando...');
        const result = saveHandler(nextState);

        if (result && typeof result.finally === 'function') {
            result.finally(() => setStatusMessage('Guardado solicitado.'));
            return;
        }

        setStatusMessage('Guardado solicitado.');
    }, [onBlur, onSave, syncEditorState]);

    const remaining = Number.isFinite(Number(maxLength)) ? Number(maxLength) - plainTextLength : null;

    return <div className="rich-text-editor-field" ref={wrapperRef} onBlurCapture={handleBlurCapture}>
        {hiddenName || hiddenId ? <input
            ref={hiddenInputRef}
            type="hidden"
            id={hiddenId}
            name={hiddenName}
            value={serializedValue}
            readOnly
        /> : null}
        <div className={`rich-text-editor-shell ${readOnly ? 'rich-text-editor-shell--readonly' : ''}`} style={{ '--rich-text-min-height': `${minHeight}px` }}>
            {!readOnly ? <div className="rich-text-editor-toolbar" role="toolbar" aria-label="Opciones de formato del editor enriquecido">
                <div className="rich-text-editor-toolbar-group">
                    <Button type="button" variant="ghost" size="sm" title="Negrita" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('bold')}><Icon name="Bold" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Cursiva" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('italic')}><Icon name="Italic" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Subrayado" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('underline')}><Icon name="Underline" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Tachado" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('strike')}><Icon name="Strikethrough" size={14} /></Button>
                </div>
                <div className="rich-text-editor-toolbar-group" style={{ position: 'relative' }}>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        title="Color de texto"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => { setShowTextColorPicker((v) => !v); setShowHighlightPicker(false); }}
                    >
                        <Icon name="Palette" size={14} />
                    </Button>
                    {showTextColorPicker && (
                        <ColorPicker
                            label="Paleta de color de texto"
                            colors={TEXT_COLORS}
                            onSelect={applyTextColor}
                            onClose={() => setShowTextColorPicker(false)}
                        />
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        title="Resaltado"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => { setShowHighlightPicker((v) => !v); setShowTextColorPicker(false); }}
                    >
                        <Icon name="Highlighter" size={14} />
                    </Button>
                    {showHighlightPicker && (
                        <ColorPicker
                            label="Paleta de resaltado"
                            colors={HIGHLIGHT_COLORS}
                            onSelect={applyHighlightColor}
                            onClose={() => setShowHighlightPicker(false)}
                        />
                    )}
                </div>
                <div className="rich-text-editor-toolbar-group">
                    <Button type="button" variant="ghost" size="sm" title="Título" onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlockType('heading', { level: 3 })}><Icon name="Heading3" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Lista" onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlockType('bulletListItem')}><Icon name="List" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Lista numerada" onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlockType('numberedListItem')}><Icon name="ListOrdered" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Checklist" onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlockType('checkListItem')}><Icon name="ListChecks" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Cita" onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlockType('quote')}><Icon name="Quote" size={14} /></Button>
                </div>
                <div className="rich-text-editor-toolbar-group rich-text-editor-toolbar-group--grow">
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                    <Button type="button" variant="ghost" size="sm" title="Insertar imagen" disabled={!uploadFile || uploadingImage} onClick={() => fileInputRef.current?.click()}><Icon name="ImagePlus" size={14} /></Button>
                    <Button type="button" variant="default" size="sm" className="rich-text-editor-save" onClick={handleSave}><Icon name="Save" size={14} /> Guardar</Button>
                </div>
            </div> : null}
            <BlockNoteView
                editor={editor}
                editable={!readOnly}
                theme={theme}
                onChange={handleChange}
                data-placeholder={placeholder}
            />
        </div>
        {remaining !== null ? <div className={`rich-text-editor-counter ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Icon name={remaining < 0 ? 'CircleAlert' : 'FileText'} size={13} />
            {Math.max(remaining, 0)} caracteres restantes
        </div> : null}
        {statusMessage ? <div className="rich-text-editor-status text-muted-foreground" role="status">{statusMessage}</div> : null}
    </div>;
}

export default RichTextEditor;

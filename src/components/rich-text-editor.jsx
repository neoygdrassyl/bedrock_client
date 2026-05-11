import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import {
    parseRichTextBlocks,
    richTextToPlainText,
    serializeRichTextBlocks,
} from '@/app/utils/richTextBlockNote';

function getCurrentTheme() {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
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
    const initialBlocks = useMemo(() => parseRichTextBlocks(value), [value]);
    const [serializedValue, setSerializedValue] = useState(value || '');
    const [plainTextLength, setPlainTextLength] = useState(() => richTextToPlainText(value).length);
    const [theme, setTheme] = useState(getCurrentTheme);
    const [statusMessage, setStatusMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
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
        setSerializedValue(value || '');
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = value || '';
        }
        const nextLength = richTextToPlainText(value).length;
        setPlainTextLength(nextLength);
        onPlainTextChange?.(nextLength);
    }, [value, onPlainTextChange]);

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const observer = new MutationObserver(() => setTheme(getCurrentTheme()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const syncEditorState = useCallback(() => {
        const nextValue = serializeRichTextBlocks(editor.document);
        const nextLength = richTextToPlainText(nextValue).length;
        setSerializedValue(nextValue);
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = nextValue;
        }
        setPlainTextLength(nextLength);
        onPlainTextChange?.(nextLength);
        return { nextValue, nextLength };
    }, [editor, onPlainTextChange]);

    const handleChange = useCallback(() => {
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
        editor.focus();
        editor.toggleStyles({ [style]: true });
        syncEditorState();
    }, [editor, syncEditorState]);

    const applyBlockType = useCallback((type, props = {}) => {
        editor.focus();
        const currentBlock = editor.getTextCursorPosition().block;
        editor.updateBlock(currentBlock, { type, props });
        syncEditorState();
    }, [editor, syncEditorState]);

    const insertImage = useCallback(async (file) => {
        if (!file || !uploadFile) return;

        setUploadingImage(true);
        setStatusMessage('Cargando imagen...');

        try {
            const url = await editorUploadFile(file);
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
        {hiddenName || hiddenId ? <textarea
            ref={hiddenInputRef}
            id={hiddenId}
            name={hiddenName}
            value={serializedValue}
            maxLength={maxLength}
            readOnly
            hidden
            aria-hidden="true"
        /> : null}
        <div className={`rich-text-editor-shell ${readOnly ? 'rich-text-editor-shell--readonly' : ''}`} style={{ '--rich-text-min-height': `${minHeight}px` }}>
            {!readOnly ? <div className="rich-text-editor-toolbar" aria-label="Opciones de formato del editor enriquecido">
                <div className="rich-text-editor-toolbar-group">
                    <Button type="button" variant="ghost" size="sm" title="Negrita" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('bold')}><Icon name="Bold" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Cursiva" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('italic')}><Icon name="Italic" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Subrayado" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('underline')}><Icon name="Underline" size={14} /></Button>
                    <Button type="button" variant="ghost" size="sm" title="Tachado" onMouseDown={(event) => event.preventDefault()} onClick={() => applyInlineStyle('strike')}><Icon name="Strikethrough" size={14} /></Button>
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
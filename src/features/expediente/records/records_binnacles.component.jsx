import { useCallback, useEffect, useRef, useState } from 'react';
import { swalError, swalSuccess } from '@/shared/utils/swalAdapter';
import RichTextEditor from '@/shared/components/rich-text-editor';
import { richTextToPlainText } from '@/shared/utils/richTextBlockNote';
import '@/shared/components/ObservationPanel.css';
import { uploadRecordArcRichTextImage } from './arc/recordArcRichTextUpload';
export default function RECORDS_BINNACLE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, SERVICE, AIM, PATH, readOnly, compact = false, idSuffix = '' } = props;

    var [BINNACLE, setBinn] = useState('');
    var [load, setLoad] = useState(0);
    var [tacl, setTacl] = useState(4000 - Number(BINNACLE ? BINNACLE.length : 0));
    const [loadedRecord, setLoadedRecord] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    // The blur autosave is silent on success; a failed save must still be visible to the reviewer.
    const [saveFailed, setSaveFailed] = useState(false);
    const textareaRef = useRef(null);
    const useRichTextEditor = AIM === 'Arquitectura';
    const inputId = ['binnable_ta', AIM, idSuffix].filter(Boolean).join('_');
    const contentId = `${inputId}_content`;
    const uploadRichTextImage = useCallback((file) => uploadRecordArcRichTextImage(file, currentItem), [currentItem]);


    let cal_tacl = (value) => {
        if (typeof value === 'string') {
            let html_obj = document.getElementById(value);
            let max = html_obj ? Number(html_obj.maxLength) : 4000;
            let length = html_obj ? String(html_obj.value).length : 0;
            setTacl(max - Number(length));
            return;
        }

        setTacl(4000 - Number(value || 0));
    }

    useEffect(() => {
        if(load == 0) loadBinnable();
    }, [load]);

    useEffect(() => {
        resizePlainTextBinnacle();
    }, [BINNACLE, useRichTextEditor]);


    // ******************* JSX  ******************* //

    let _COMPONENT = () => {
        const textareaClassName = `input-group op__textarea op__static-textarea ${readOnly ? 'op__static-textarea--readonly' : ''}`.trim();
        const handlePlainTextChange = (event) => {
            cal_tacl(inputId);
            resizePlainTextBinnacle(event.currentTarget);
        };

        return <>
            <div className={`op__static-card ${compact ? 'op__static-card--compact' : ''}`}>
                <div className="op__static-header">
                    <div className="op__label">
                        <span className="op__title">Bitácora - {AIM ?? ''}</span>
                        {readOnly ? <span className="op__static-meta">Solo lectura</span> : null}
                    </div>
                    <button type="button" className="op__static-toggle" aria-expanded={!isCollapsed}
                        aria-controls={contentId} onClick={() => setIsCollapsed((current) => !current)}>
                        {isCollapsed ? 'Maximizar' : 'Minimizar'}
                    </button>
                </div>
                <div id={contentId} className="op__static-body" hidden={isCollapsed}>
                    {useRichTextEditor ? <div className="op__static-editor"><RichTextEditor
                        value={BINNACLE}
                        hiddenId={inputId}
                        maxLength={4000}
                        minHeight={compact ? (readOnly ? 110 : 140) : (readOnly ? 130 : 170)}
                        readOnly={readOnly}
                        placeholder={`Bitácora de ${AIM ?? 'evaluación'}`}
                        toolbarItems={['bold', 'image']}
                        uploadFile={uploadRichTextImage}
                        onPlainTextChange={cal_tacl}
                        onBlur={(editorState) => setBinnacle(false, editorState)}
                        onSave={(editorState) => setBinnacle(true, editorState)}
                    /></div>
                        : <textarea ref={textareaRef} className={textareaClassName} defaultValue={BINNACLE} rows={3}
                            id={inputId} onChange={handlePlainTextChange} maxLength="4000" onBlur={() => setBinnacle(false)} readOnly={readOnly}
                            aria-label={`Bitácora - ${AIM ?? ''}`} placeholder={readOnly ? 'Sin anotaciones' : `Bitácora de ${AIM ?? 'evaluación'}`}></textarea>}
                    {/* The rich text editor prints its own counter: show this one only for the plain textarea. */}
                    {!readOnly && !useRichTextEditor ? <div className="op__helper">{tacl} caracteres restantes</div> : ''}
                    {saveFailed ? <div className="op__helper ew-text-danger" role="alert">No se pudo guardar la bitácora. El texto sigue en pantalla; inténtalo de nuevo.</div> : null}
                </div>
            </div>
        </>
    }

    function resizePlainTextBinnacle(textarea = textareaRef.current) {
        if (useRichTextEditor || !textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // ******************* APIS ******************* //
    function setBinnacle(useSwal, editorState) {
        if(readOnly) return Promise.resolve();
        const targetRecord = currentRecord || loadedRecord;
        if (!targetRecord?.id) return Promise.resolve();
        let formData = new FormData();
        const binnacleInput = document.getElementById(inputId);
        const hasEditorValue = Object.prototype.hasOwnProperty.call(editorState ?? {}, 'nextValue');
        if (!hasEditorValue && !binnacleInput) return Promise.resolve();
        let binnacle = hasEditorValue ? (editorState.nextValue ?? '') : binnacleInput.value;
        formData.set('binnacle', binnacle);
        return SERVICE.update(targetRecord.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    setBinn(binnacle);
                    setSaveFailed(false);
                    if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.requestUpdateRecord?.(currentItem.id);
                  
                } else {
                    setSaveFailed(true);
                    if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                setSaveFailed(true);
                if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    function loadBinnable() {
        if (!currentItem?.id) return;
        SERVICE.getRecord(currentItem.id)
            .then(response => {
                let binn = '';
                let record = null;

                // FIX: Add optional chaining for undefined response handling
                if (PATH && response.data?.[PATH]) record = response.data[PATH];
                else if (response.data?.length) record = response.data[0];
                else if (response.data) record = response.data;

                if (record?.binnacle) binn = record.binnacle;

                binn = binn ?? '';
                setLoadedRecord(record);
                setBinn(binn);
                cal_tacl(richTextToPlainText(binn).length);
                setLoad(1);

            })
            .catch(e => {
                console.log(e);
            });
    }
    return (
        <div>
            {_COMPONENT()}
        </div >
    );
}

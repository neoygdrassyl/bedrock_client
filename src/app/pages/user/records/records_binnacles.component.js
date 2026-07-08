import { useCallback, useEffect, useState } from 'react';
import { swalError, swalSuccess } from '@/app/utils/swalAdapter';
import RichTextEditor from '@/components/rich-text-editor';
import { richTextToPlainText } from '@/app/utils/richTextBlockNote';
import '@/app/components/ObservationPanel.css';
import { uploadRecordArcRichTextImage } from './arc/recordArcRichTextUpload';
export default function RECORDS_BINNACLE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, SERVICE, AIM, PATH, readOnly, compact = false, idSuffix = '' } = props;

    var [BINNACLE, setBinn] = useState('');
    var [load, setLoad] = useState(0);
    var [tacl, setTacl] = useState(4000 - Number(BINNACLE ? BINNACLE.length : 0));
    const [loadedRecord, setLoadedRecord] = useState(null);
    const useRichTextEditor = AIM === 'Arquitectura';
    const inputId = ['binnable_ta', AIM, idSuffix].filter(Boolean).join('_');
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


    // ******************* JSX  ******************* //

    let _COMPONENT = () => {
        const textareaClassName = `input-group op__textarea op__static-textarea ${readOnly ? 'op__static-textarea--readonly' : ''}`.trim();

        return <>
            <div className={`op__static-card ${compact ? 'op__static-card--compact' : ''}`}>
                <div className="op__static-header">
                    <div className="op__label">
                        <span className="op__title">Bitácora - {AIM ?? ''}</span>
                    </div>
                </div>
                <div className="op__static-body">
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
                        : <textarea className={textareaClassName} defaultValue={BINNACLE} rows={3}
                            id={inputId} onChange={() => cal_tacl(inputId)} maxLength="4000" onBlur={() => setBinnacle(false)} readOnly={readOnly}></textarea>}
                    {!readOnly ? <div className={`op__helper ${compact ? 'fs-6 mb-0' : ''}`}>{tacl} caracteres restantes</div> : ''}
                </div>
            </div>
        </>
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
                    if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.requestUpdateRecord?.(currentItem.id);
                  
                } else {
                    if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
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

import { useCallback, useEffect, useState } from 'react';
import { swalError, swalSuccess } from '@/app/utils/swalAdapter';
import RichTextEditor from '@/components/rich-text-editor';
import { richTextToPlainText } from '@/app/utils/richTextBlockNote';
import { uploadRecordArcRichTextImage } from './arc/recordArcRichTextUpload';
export default function RECORDS_BINNACLE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, SERVICE, AIM, PATH, readOnly } = props;

    var [BINNACLE, setBinn] = useState('');
    var [load, setLoad] = useState(0);
    var [tacl, setTacl] = useState(4000 - Number(BINNACLE ? BINNACLE.length : 0));
    const useRichTextEditor = AIM === 'Arquitectura';
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

        return <>
            <div className='row  border border-dark bg-primary text-primary-foreground fwb-bold py-1 mx-0 mt-3'>
                <div className='col'>
                    <label>Bitácora - {AIM ?? ''}</label>
                </div>
            </div>
            {useRichTextEditor ? <RichTextEditor
                    value={BINNACLE}
                    hiddenId={"binnable_ta_" + AIM}
                    maxLength={4000}
                    minHeight={readOnly ? 130 : 170}
                    readOnly={readOnly}
                    placeholder={`Bitácora de ${AIM ?? 'evaluación'}`}
                    uploadFile={uploadRichTextImage}
                    onPlainTextChange={cal_tacl}
                    onBlur={() => setBinnacle(false)}
                />
                : <textarea className="input-group" defaultValue={BINNACLE} rows="3" style={{ backgroundColor: readOnly ? 'gainsboro' : 'lightblue' }}
                    id={"binnable_ta_" + AIM} onChange={() => cal_tacl('binnable_ta_'+ AIM)} maxLength="4000" onBlur={() => setBinnacle(false)} readOnly={readOnly}></textarea>}
            {!readOnly ? <h5 className='text-muted'> ({tacl} caracteres restantes)</h5> : ''}
        </>
    }

    // ******************* APIS ******************* //
    function setBinnacle(useSwal) {
        if(readOnly) return;
        let formData = new FormData();
        let binnacle = document.getElementById('binnable_ta_' + AIM).value;
        formData.set('binnacle', binnacle);
        SERVICE.update(currentRecord.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.requestUpdateRecord(currentItem.id);
                  
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
        SERVICE.getRecord(currentItem.id)
            .then(response => {
                let binn = '';

                // FIX: Add optional chaining for undefined response handling
                if (PATH && response.data?.[PATH]?.binnacle) {
                    binn = response.data[PATH].binnacle;
                }
                if (response.data?.length && response.data?.[0]?.binnacle) {
                    binn = response.data[0].binnacle;
                }

                binn = binn ?? '';
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
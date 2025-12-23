import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


const MySwal = withReactContent(Swal);

export default function RECORDS_BINNACLE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, SERVICE, AIM, PATH, readOnly } = props;

    var [BINNACLE, setBinn] = useState('');
    var [load, setLoad] = useState(0);
    var [tacl, setTacl] = useState(4000 - Number(BINNACLE ? BINNACLE.length : 0));


    let cal_tacl = (_id) => {
        let html_obj = document.getElementById(_id);
        let max = html_obj ? Number(html_obj.maxLength) : 0;
        let value = html_obj ? String(html_obj.value).length : 0;
        setTacl(max - Number(value));
    }

    useEffect(() => {
        if(load == 0) loadBinnable();
    }, [load]);


    // ******************* JSX  ******************* //

    let _COMPONENT = () => {

        return <>
            <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                <div className='col'>
                    <label>Bitácora - {AIM ?? ''}</label>
                </div>
            </div>
            <textarea className="input-group" defaultValue={BINNACLE} rows="3" style={{ backgroundColor: readOnly ? 'gainsboro' : 'lightblue' }}
                id={"binnable_ta_" + AIM} onChange={() => cal_tacl('binnable_ta_'+ AIM)} maxLength="4000" onBlur={() => setBinnacle(false)} readOnly={readOnly}></textarea>
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
                    if (useSwal) MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdateRecord(currentItem.id);
                  
                } else {
                    if (useSwal) MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                if (useSwal) MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
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
                if (response.data?.length && response.data[0]?.binnacle) {
                    binn = response.data[0].binnacle;
                }

                binn = binn ?? '';
                setBinn(binn);
                cal_tacl('binnable_ta_'+ AIM);
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
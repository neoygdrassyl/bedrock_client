import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import SERVICE_ARCHIVE from '../../../services/archive.service';


const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);

export default function ARCHIVE_FUN_VIEW(props) {
    const { translation, swaMsg, globals, currentItem } = props;
    var [LIST_A, setListA] = useState([]);
    var [load, setLoad] = useState(0);
    

    useEffect(() => {
        if (load == 0) loadLists();
    }, [load]);
    // ***************************  DATA CONVERTER *********************** //


    // ***************************  JXS *********************** //
    let _LIST_COMPONENT = () => {
        if (LIST_A.length == 0) return <div className='row'>
            <div className='col text-center'>
                <label className='fw-bold text-muted'>No hay Información de archivo</label>
            </div>
        </div>

        return LIST_A.map(li => {
            let box = li.fun_archive ?? {};
            //let json = getJSONFull(li.json ?? false);
            return <>
                <div className='row border py-1'>
                    <div className='row'>
                        <div className='col'>
                            <label><i class="fas fa-border-all"></i> Estante: <label className='fw-bold'>{box.column}</label></label>
                        </div>
                        <div className='col'>
                            <label><i class="fas fa-inbox"></i> Entrepaño: <label className='fw-bold'>{box.row}</label></label>
                        </div>
                        <div className='col'>
                            <label><i class="fas fa-archive"></i> Caja: <label className='fw-bold'>{box.box}</label></label>
                        </div>
                        <div className='col'>
                            <label><i class="far fa-folder"></i> Carpeta: <label className='fw-bold'>{li.folder}</label></label>
                        </div>
                        <div className='col'>
                            <label><i class="far fa-file-alt"></i> Folios: <label className='fw-bold'>{li.pages}</label></label>
                        </div>
                    </div>
                </div>
            </>
        })
    }

    // ***************************  DATATABLES *********************** //


    // ***************************  APIS *********************** //
    function loadLists() {
        SERVICE_ARCHIVE.get_fun(currentItem.id)
            .then(response => {
                setListA(response.data);
                setLoad(1);
            })
            .catch(e => {
                console.log(e);
            });
    }

    return (
        <div className='p-2'>
            {_LIST_COMPONENT()}
        </div>
    );
}

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import SERVICE_ARCHIVE from '../../../services/archive.service';
import { Icon } from '@/components/icon';


const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
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
                            <label><Icon name="border-all" size={16} /> Estante: <label className='fw-bold'>{box.column}</label></label>
                        </div>
                        <div className='col'>
                            <label><Icon name="inbox" size={16} /> Entrepaño: <label className='fw-bold'>{box.row}</label></label>
                        </div>
                        <div className='col'>
                            <label><Icon name="archive" size={16} /> Caja: <label className='fw-bold'>{box.box}</label></label>
                        </div>
                        <div className='col'>
                            <label><Icon name="folder" size={16} /> Carpeta: <label className='fw-bold'>{li.folder}</label></label>
                        </div>
                        <div className='col'>
                            <label><Icon name="file-alt" size={16} /> Folios: <label className='fw-bold'>{li.pages}</label></label>
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

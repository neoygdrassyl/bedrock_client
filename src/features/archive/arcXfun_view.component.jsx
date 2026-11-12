import { useEffect, useState } from 'react';

import SERVICE_ARCHIVE from './api/archive.service';
import { DataGrid, DataField } from '@/shared/components/SectionCard';


const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

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
        if (LIST_A.length == 0) return <p className='m-0 text-sm text-muted-foreground'>Sin información de archivo.</p>

        return LIST_A.map((li, index) => {
            let box = li.fun_archive ?? {};
            //let json = getJSONFull(li.json ?? false);
            return <DataGrid key={li.id || `${li.folder || 'folder'}-${index}`}>
                <DataField label="Estante" mono value={box.column} />
                <DataField label="Entrepaño" mono value={box.row} />
                <DataField label="Caja" mono value={box.box} />
                <DataField label="Carpeta" mono value={li.folder} />
                <DataField label="Folios" mono value={li.pages} />
            </DataGrid>
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
        <div>
            {_LIST_COMPONENT()}
        </div>
    );
}

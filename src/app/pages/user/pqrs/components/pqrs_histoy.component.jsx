import { useCallback, useState, useEffect } from 'react';
import PQRS_Service from '../../../../services/pqrs_main.service';
import DataTable from '@/components/data-table-bridge';
import { swalError } from '@/app/utils/swalAdapter';
export const HISTORY_PQRS_INFO = (props) => {
    const {currentItem } = props;
    const [history_pqrs_inf, setHistory_pqrs] = useState([])

    const validation_1 = currentItem?.pqrs_fun?.id_public || ''
    const validation_2 = currentItem?.pqrs_fun?.catastral || ''

    //console.log(validation_1)
    const history_pqrs = useCallback(() => {
        const ids = [validation_1, validation_2].filter((value) => value && value !== 'undefined');

        if (!ids.length) {
            setHistory_pqrs([]);
            return;
        }

        Promise.all(ids.map((id) => PQRS_Service.gethistory(id)))
            .then((responses) => {
                const history = responses.flatMap((response) => Array.isArray(response.data) ? response.data : []);
                setHistory_pqrs(history)
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    }, [validation_1, validation_2])
    useEffect(() => {
        history_pqrs();
    }, [history_pqrs])

    let _HISTORY_PQRS_INFO1 = () => {
        const _LIST = [...history_pqrs_inf];
        const columns = [
            {
                name: <h5>Consecutivo de entrada</h5>,
                selector: row => row.name,
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3 text-center">{row.id_global ? row.id_global : row.id_publico ? row.id_publico : ''}</h6>
            },
            {
                name: <h5>Estado</h5>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3">{row.status === 0 ? <h6 className='text-danger'>Activa</h6> : row.status === 1 ? <h6 className='text-success'>Cerrada</h6> : ''}</h6>
            },
            {
                name: <h5>Tipo de peticion</h5>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3">{row.type}</h6>
            },
            {
                name: <h5>Consecutivo de salida</h5>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3">{row.id_reply ?? ''}</h6>
            },
        ]



        var _COMPONENT =
            <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay mensajes"
                hidden={10}
                striped="true"
                columns={columns}
                data={_LIST.filter( value =>{
                    if(value.id !== currentItem.id){
                        return true
                    }
                    return false
                })}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        return <>{_COMPONENT}</>;
    }

    return (
        <div>
            {_HISTORY_PQRS_INFO1()}
        </div>
    )
}

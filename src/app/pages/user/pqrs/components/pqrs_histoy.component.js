import React, { useState, useEffect } from 'react'
import PQRS_Service from '../../../../services/pqrs_main.service';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal);
export const HISTORY_PQRS_INFO = (props) => {
    const {currentItem, currentId } = props;
    const [history_pqrs_inf, setHistory_pqrs] = useState({})

    var validation_1 = currentItem.pqrs_fun ? currentItem.pqrs_fun.id_public : ''
    var validation_2 = currentItem.pqrs_fun ? currentItem.pqrs_fun.catastral: ''

    //console.log(validation_1)
    const history_pqrs = () => {
        PQRS_Service.gethistory(validation_1)
            .then(response => {
                setHistory_pqrs(response.data)
            }).catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
            PQRS_Service.gethistory(validation_2)
            .then(response => {
                setHistory_pqrs(response.data)
            }).catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }
    useEffect(() => {
        history_pqrs();
    }, [])

    let _HISTORY_PQRS_INFO1 = () => {
        var _LIST = [];
        for (var i = 0; i < history_pqrs_inf.length; i++) {
            _LIST.push(history_pqrs_inf[i]);
        }
        const columns = [
            {
                name: <h5>Consecutivo de entrada</h5>,
                selector: 'name',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3 text-center">{row.id_global ? row.id_global : row.id_publico ? row.id_publico : ''}</h6>
            },
            {
                name: <h5>Estado</h5>,
                selector: 'type',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3">{row.status == 0 ? <h6 className='text-danger'>Activa</h6> : row.status == 1 ? <h6 className='text-success'>Cerrada</h6> : ''}</h6>
            },
            {
                name: <h5>Tipo de peticion</h5>,
                selector: 'type',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3">{row.type}</h6>
            },
            {
                name: <h5>Consecutivo de salida</h5>,
                selector: 'type',
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
                    if(value.id != currentItem.id){
                        return true
                    }
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

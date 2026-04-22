import FUNService from '../../../services/fun.service'
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const FUNN4 = ({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate }) => {

        var formData = new FormData();

        let _SET_CHILD_4 = () => {
            var _CHILD = currentItem.fun_4s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _CHILD_4_LIST = () => {
            let _LIST = _SET_CHILD_4();
            const columns_4 = [
                {
                    name: 'LINDEROS',
                    selector: row => row.coord,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.coord}</span>
                },
                {
                    name: 'LONGITUD',
                    selector: row => row.longitud,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.longitud}</span>
                },
                {
                    name: 'COLINDA CON',
                    selector: row => row.colinda,
                    cell: row => <span className="text-sm">{row.colinda}</span>
                },
                {
                    name: 'ACCIÓN',
                    button: true,
                    cell: row => <Button variant="destructive" size="sm" onClick={() => delete_4(row.id)}><Icon name="trash-alt" size={16} /></Button>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_4}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                className="data-table-component"
                noHeader
            />
        }

        let new_4 = () => {
            let fun0Id = null;
            //
            formData = new FormData();
            fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let coord = document.getElementById("f_41").value;
            formData.set('coord', coord);
            let colinda = document.getElementById("f_43").value;
            formData.set('colinda', colinda);
            let longitud = document.getElementById("f_42").value;
            formData.set('longitud', longitud);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.create_fun4(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdate(currentItem.id)
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });
        }
        let delete_4 = (id) => {
            swalConfirm({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    FUNService.delete_4(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                requestUpdate(currentItem.id)
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        });
                }
            });
        }

        return (<>
            <fieldset className="p-3">
                <legend className="my-2 px-3 Collapsible" id="funn_4">
                    <label className="app-p lead text-center fw-normal">4. Linderos, Dimensiones y Áreas</label>
                </legend>
                <div className="row mb-3">
                    <div className="col-4">
                        <label>4.1 Linderos</label>
                        <div className="input-group mb-3">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="compass" size={16} />
                            </span>
                            <select className="form-select" required id="f_41" >
                                <option>NORTE</option>
                                <option>SUR</option>
                                <option>ORIENTE</option>
                                <option>OCCIDENTE</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>4.2 Longitud (en m)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="ruler" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_42" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>4.3 Colinda con </label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="home" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_43" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3 text-center">
                    <div className="col-12">
                        <Button size="sm" className="my-3" onClick={() => new_4()}><Icon name="file-alt" size={16} /> AÑADIR ITEM </Button>
                    </div>
                </div>
                {_CHILD_4_LIST()}
            </fieldset>
        </>);
};

export default FUNN4;
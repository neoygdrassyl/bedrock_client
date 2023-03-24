import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FUN_Service from '../../../../services/fun.service'
import { dateParser, dateParser_yearsPassed } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);

class RECORD_LAW_GEN_2_FUN51 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger';
            }
            if (_VALUE == 0) {
                return 'form-select text-danger';
            }
            if (_VALUE == 1) {
                return 'form-select text-success';
            }
            if (_VALUE == 2) {
                return 'form-select text-warning';
            } else {
                return 'form-select';
            }
        }
        let _GET_DOCS_BTNS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<>{_array[0] > 0
                ? <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'} 
                icon={'far fa-id-card fa-2x me-1'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ? <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'} 
                icon={'far fa-id-badge fa-2x me-1'} color={'DarkOrchid'} />
                : ""}</>)

            return <>{_COMPONENT}</>
        }

        // COMPONENT JSX
        let _COMPONENT_6_FUN_51 = () => {
            let _LIST = _GET_CHILD_51();
            const columns_51 = [
                {
                    name: <label>EVALUACION</label>,
                    button: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <> <select className={_GET_SELECT_COLOR_VALUE(row.check)}
                        defaultValue={row.check} onChange={(e) => fun_51_check(row, e.target.value)} >
                        <option value="0">NO CUMPLE</option>
                        <option value="1">CUMPLE</option>
                    </select></>
                },
                {
                    name: <label>TIPO</label>,
                    selector: 'type',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.type}</label>
                },
                {
                    name: <label>NOMBRE</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.name + " " + row.surname}</label>
                },
                {
                    name: <label>CC/NIT</label>,
                    selector: 'id_number',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.id_number}</label>
                },
                {
                    name: <label>NOMBRE REP. LEGAL</label>,
                    selector: 'rep_name',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.rep_name}</label>
                },
                {
                    name: <label>C.C. REP. LEGAL</label>,
                    selector: 'rep_id_number',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.rep_id_number}</label>
                },
                {
                    name: <label>TELEFONO/ CELULAR</label>,
                    selector: 'nunber',
                    center: true,
                    cell: row => <label >{row.nunber}</label>
                },
                {
                    name: <label>CORREO</label>,
                    selector: 'email',
                    center: true,
                    cell: row => <label>{row.email}</label>
                },
                {
                    name: <label>ROL</label>,
                    selector: 'role',
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.role}</label>
                },
                {
                    name: <label>DOCUMENTOS</label>,
                    button: true,
                    center: true,
                    center: true,
                    cell: row => <> {_GET_DOCS_BTNS(row.docs)}</>
                },
               
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_51}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let manage_51 = (useMySwal, _id) => {
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            FUN_Service.update_51(_id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        this.props.requestUpdate(currentItem.id)
                    } else {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                });
        }

        let fun_51_check = (_item, _value) => {
            formData = new FormData();
            formData.set('check', _value);
            manage_51(false, _item.id);
        }
        return (
            <div className="record_lar_gen2 container">
                {_COMPONENT_6_FUN_51()}
                <div className="border p-2 m-2">
                    <label className="me-2">LEYENDA:</label>
                    <label className="me-2"><i class="far fa-id-card fa-2x" style={{color: "DeepSkyBlue"}}></i> : Documento de Identidad,</label>
                    <label className="me-2"><i class="far fa-id-badge fa-2x" style={{color: 'DarkOrchid'}}></i>: Certificado de Existencia y Representación Legal</label>
                </div>
            </div >
        );
    }
}

export default RECORD_LAW_GEN_2_FUN51;
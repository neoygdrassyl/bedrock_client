import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FUN_Service from '../../../../services/fun.service'
import { dateParser, dateParser_yearsPassed } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);

class RECORD_LAW_GEN_2_FUN52 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_52 = () => {
            var _CHILD = currentItem.fun_52s;
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
                ?
                <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'far fa-id-card fa-2x me-1'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ? <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'far fa-id-badge fa-2x me-1'} color={'DarkOrchid'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ? <VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                    icon={'fas fa-book fa-2x me-1'} color={'GoldenRod'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[3] > 0
                ? <VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'fas fa-file-invoice fa-2x me-1'} color={'LimeGreen'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[5] > 0
                ? <VIZUALIZER url={_FIND_6(_array[5]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'fas fa-file-invoice fa-2x me-1'} color={'gray'} />
                : ""}</>)

            return <>{_COMPONENT}</>
        }

        // COMPONENT JSX
        let _COMPONENT_4_FUN_52 = () => {
            let _LIST = _GET_CHILD_52();
            const columns_52 = [
                {
                    name: <label>ANÁLISIS</label>,
                    button: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <> <select className={_GET_SELECT_COLOR_VALUE(row.check)}
                        defaultValue={row.check} onChange={(e) => fun_52_check(row, e.target.value)} >
                        <option value="0">NO CUMPLE</option>
                        <option value="1">CUMPLE</option>
                    </select></>
                },
                {
                    name: <label>NOMBRE</label>,
                    selector: 'surname',
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
                    minWidth: '150px',
                    cell: row => <label>{row.id_number}</label>
                },
                {
                    name: <label>TELEFONO/ CELULAR</label>,
                    selector: 'number',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.number}</label>
                },
                {
                    name: <label>CORREO</label>,
                    selector: 'email',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.email}</label>
                },
                {
                    name: <label>PROFESIÓN</label>,
                    selector: 'role',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.role}</label>
                },
                {
                    name: <label>MATRÍCULA</label>,
                    selector: 'registration',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.registration}</label>
                },
                {
                    name: <label>EXP. MATRÍCULA</label>,
                    selector: 'registration_date',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{dateParser(row.registration_date)}</label>
                },
                {
                    name: <label>EXPERIENCIA</label>,
                    selector: 'expirience',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{Math.trunc(row.expirience / 12)} año(s)</label>
                },
                {
                    name: <label>¿SANCIONADO?</label>,
                    selector: 'sanction',
                    center: true,
                    cell: row => <label>{row.sanction ? <label className="text-danger fw-bold">SI</label> : "NO"}</label>
                },
                {
                    name: <label>SUPERVISIÓN</label>,
                    selector: 'supervision',
                    center: true,
                    cell: row => <label>{row.supervision}</label>
                },
                {
                    name: <label>DOCUMENTOS</label>,
                    button: true,
                    center: true,
                    cell: row => <> {_GET_DOCS_BTNS(row.docs)}</>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_52}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let manage_52 = (useMySwal, _id) => {
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            FUN_Service.update_52(_id, formData)
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

        let fun_52_check = (_item, _value) => {
            formData = new FormData();
            formData.set('check', _value);
            manage_52(false, _item.id);
        }
        return (
            <div className="record_lar_gen2 container">
                {_COMPONENT_4_FUN_52()}
                <div className="border p-2 m-2">
                    <label className="me-2">LEYENDA:</label>
                    <label className="me-2"><a><i class="far fa-id-card fa-2x" style={{ "color": "DeepSkyBlue" }}></i></a> : C.C.,</label>
                    <label className="me-2"><a><i class="far fa-id-badge fa-2x" style={{ "color": "DarkOrchid" }}></i></a> : Matrícula,</label>
                    <label className="me-2"><a><i class="fas fa-book fa-2x" style={{ "color": "GoldenRod" }}></i></a> : Ficha COPNIA,</label>
                    <label className="me-2"><a><i class="fas fa-file-invoice fa-2x" style={{ "color": "LimeGreen" }}></i></a> : Hoja de vida y Certificados</label>
                </div>
            </div >
        );
    }
}

export default RECORD_LAW_GEN_2_FUN52;
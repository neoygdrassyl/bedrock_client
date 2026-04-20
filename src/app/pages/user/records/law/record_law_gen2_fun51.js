import DataTable from '@/components/data-table-bridge';
import Icon from '@/components/icon';
import FUN_Service from '../../../../services/fun.service'
import { dateParser, dateParser_yearsPassed } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function RECORD_LAW_GEN_2_FUN51(props) {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;

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
                icon={'IdCard'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ? <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'} 
                icon={'BadgeCheck'} color={'DarkOrchid'} />
                : ""}</>)

            return <>{_COMPONENT}</>
        }

        // COMPONENT JSX
        let _COMPONENT_6_FUN_51 = () => {
            let _LIST = _GET_CHILD_51();
            const columns_51 = [
                {
                    name: 'EVALUACION',
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
                    name: 'TIPO',
                    selector: row => row.type,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.type}</span>
                },
                {
                    name: 'NOMBRE',
                    selector: row => row.name,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.name + " " + row.surname}</span>
                },
                {
                    name: 'CC/NIT',
                    selector: row => row.id_number,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{row.id_number}</span>
                },
                {
                    name: 'NOMBRE REP. LEGAL',
                    selector: row => row.rep_name,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.rep_name}</span>
                },
                {
                    name: 'C.C. REP. LEGAL',
                    selector: row => row.rep_id_number,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{row.rep_id_number}</span>
                },
                {
                    name: 'TELEFONO/ CELULAR',
                    selector: row => row.nunber,
                    center: true,
                    cell: row => <label >{row.nunber}</label>
                },
                {
                    name: 'CORREO',
                    selector: row => row.email,
                    center: true,
                    cell: row => <span className="text-sm">{row.email}</span>
                },
                {
                    name: 'ROL',
                    selector: row => row.role,
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.role}</span>
                },
                {
                    name: 'DOCUMENTOS',
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
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            }
            FUN_Service.update_51(_id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        }
                        props.requestUpdate(currentItem.id)
                    } else {
                        if (useMySwal) {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
                    <label className="me-2"><Icon name="id-card" size={24} style={{ color: 'DeepSkyBlue' }} /> : Documento de Identidad,</label>
                    <label className="me-2"><Icon name="id-badge" size={24} style={{ color: 'DarkOrchid' }} />: Certificado de Existencia y Representación Legal</label>
                </div>
            </div >
        );
}

export default RECORD_LAW_GEN_2_FUN51;
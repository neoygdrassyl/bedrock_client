import DataTable from '@/components/data-table-bridge';
import FUN_Service from '../../../../services/fun.service'
import { dateParser, dateParser_yearsPassed } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function RECORD_LAW_GEN_2_FUN52(props) {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;

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
                    icon={'IdCard'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ? <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'BadgeCheck'} color={'DarkOrchid'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ? <VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                    icon={'BookOpen'} color={'GoldenRod'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[3] > 0
                ? <VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'LimeGreen'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[5] > 0
                ? <VIZUALIZER url={_FIND_6(_array[5]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'gray'} />
                : ""}</>)

            return <>{_COMPONENT}</>
        }

        // COMPONENT JSX
        let _COMPONENT_4_FUN_52 = () => {
            let _LIST = _GET_CHILD_52();
            const columns_52 = [
                {
                    name: 'ANÁLISIS',
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
                    name: 'NOMBRE',
                    selector: row => row.surname,
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
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.id_number}</span>
                },
                {
                    name: 'TELEFONO/ CELULAR',
                    selector: row => row.number,
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.number}</span>
                },
                {
                    name: 'CORREO',
                    selector: row => row.email,
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.email}</span>
                },
                {
                    name: 'PROFESIÓN',
                    selector: row => row.role,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.role}</span>
                },
                {
                    name: 'MATRÍCULA',
                    selector: row => row.registration,
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.registration}</span>
                },
                {
                    name: 'EXP. MATRÍCULA',
                    selector: row => row.registration_date,
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{dateParser(row.registration_date)}</span>
                },
                {
                    name: 'EXPERIENCIA',
                    selector: row => row.expirience,
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{Math.trunc(row.expirience / 12)} año(s)</label>
                },
                {
                    name: '¿SANCIONADO?',
                    selector: row => row.sanction,
                    center: true,
                    cell: row => <span className="text-sm">{row.sanction ? <label className="text-danger fw-bold">SI</label> : "NO"}</span>
                },
                {
                    name: 'SUPERVISIÓN',
                    selector: row => row.supervision,
                    center: true,
                    cell: row => <span className="text-sm">{row.supervision}</span>
                },
                {
                    name: 'DOCUMENTOS',
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
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            }
            FUN_Service.update_52(_id, formData)
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
                    <label className="me-2"><a><Icon name="id-card" size={16} style={{ "color": "DeepSkyBlue" }} /></a> : C.C.,</label>
                    <label className="me-2"><a><Icon name="id-badge" size={16} style={{ "color": "DarkOrchid" }} /></a> : Matrícula,</label>
                    <label className="me-2"><a><Icon name="book" size={16} style={{ "color": "GoldenRod" }} /></a> : Ficha COPNIA,</label>
                    <label className="me-2"><a><Icon name="file-invoice" size={16} style={{ "color": "LimeGreen" }} /></a> : Hoja de vida y Certificados</label>
                </div>
            </div >
        );
}

export default RECORD_LAW_GEN_2_FUN52;
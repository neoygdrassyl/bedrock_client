import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { MDBBadge } from 'mdb-react-ui-kit';
import FUN6JSON from '../../../../components/jsons/fun6DocsList.json'
import FUN_SERVICE from '../../../../services/fun.service';
import VIZUALIZER from '../../../../components/vizualizer.component';
import DataTable from 'react-data-table-component';
import { VR_DOCUMENTS_OF_INTEREST } from '../../../../components/customClasses/typeParse';
import submitService from '../../../../services/submit.service';

const MySwal = withReactContent(Swal);

class RECORD_LAW_DOCSCHECK extends Component {
    constructor(props) {
        super(props);
        this.state = {
            VRDocs: [],
            load: false
        };
    }
    componentDidMount() {
        this.setVRList(this.props.currentItem ? this.props.currentItem.id_public : false);
    }
    setVRList(id_public) {
        if (!id_public) return;
        if (this.state.load) return;
        submitService.getIdRelated(this.props.currentItem.id_public).then(response => {
            let newList = [];
            let List = response.data;
            List.map((value, i) => {
                let subList = value.sub_lists;
                subList.map(valuej => {
                    let name = valuej.list_name ? valuej.list_name.split(";") : []
                    let category = valuej.list_category ? valuej.list_category.split(",") : []
                    let code = valuej.list_code ? valuej.list_code.split(",") : []
                    let page = valuej.list_pages ? valuej.list_pages.split(",") : []
                    let review = valuej.list_review ? valuej.list_review.split(",") : []

                    review.map((valuek, k) => {
                        if (valuek == 'SI') newList.push({
                            id_public: value.id_public,
                            date: value.date,
                            time: value.time,
                            name: name[k],
                            category: category[k],
                            page: page[k],
                            code: code[k],
                        })
                    })
                })
            })
            this.setState({ VRDocs: newList, load: true })
        })

    };

    render() {
        const { translation, swaMsg, globals, currentItem, _FUN_1, _FUN_R, _FUN_6, readOnly, docsScope } = this.props;
        const { VRDocs } = this.state;

        const _docsScope = docsScope ? VR_DOCUMENTS_OF_INTEREST[docsScope] : [];

        const _CODE_LIST_61 = {
            parent: '6.1 DOCUMENTOS COMUNES A TODA SOLICITUD',
            codes: ['511', '512', '513', '516', '517', '518', '519']
        };
        const _CODE_LIST_62 = {
            parent: '6.2 DOCUNENTOS ADICIONALES EN LICENCIA DE URBANIZACIÓN',
            children: [
                {
                    parent: 'A. Modalidad Desarrollo',
                    codes: ['621', '601a', '622', '602a']
                },
                {
                    parent: 'B. Modalidad Saneamiento',
                    codes: ['623', '601b', '602b', '624', '625']
                },
                {
                    parent: 'C. Modalidad Recuperacion',
                    codes: ['626', '627', '601c', '602c']
                }
            ]
        };
        const _CODE_LIST_63 = {
            parent: '6.3 DOCUMENTOS ADICIONALES EN LA LICENCIA DE PARCELACION',
            codes: ['631', '632', '633',],
            children: [
                {
                    parent: 'Documentos adicionales en licencia de parcaleación para saneamiento',
                    codes: ['634', '635', '636',]
                },
            ]
        };
        const _CODE_LIST_64 = {
            parent: '6.4 DOCUMENTOS ADICIONALES EN LA LICENCIA DE SUBDIVISION',
            children: [
                {
                    parent: 'A. Modalidad Subdivisión Urbana y Rural',
                    codes: ['641']
                },
                {
                    parent: 'B. Modalidad Reloteo',
                    codes: ['642', '643'],
                },
            ]
        };
        const _CODE_LIST_65 = {
            parent: '6.5 DOCUMENTOS RECONOCIMIENTO DE EDIFICACIONES',
            codes: ['651', '652', '653']
        };
        const _CODE_LIST_66 = {
            parent: '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN',
            codes: ['6601', '6602', '6603', '6604', '6605',],
            children: [
                {
                    parent: 'Revisión indepenciente de los diseños estructurales',
                    codes: ['660a', '660b', '660c', '660d', '660e', '6607', '6608',]
                },
                {
                    parent: 'Bien de interés cultural',
                    codes: ['6609',]
                },
                {
                    parent: 'Propiedad Horizontal',
                    codes: ['6610',]
                },
                {
                    parent: 'Reforzamiento Estructural para Edificaciones en riesgo por daños en la estructura',
                    codes: ['6611',]
                },
                {
                    parent: 'Equipamientos en suelos objeto de entrega de cesiones anticipadas',
                    codes: ['6612', '6613',]
                },
                {
                    parent: 'Trámite presentado ante autoridad distinta a la que otorgo la licencia inicial',
                    codes: ['6614',]
                },
                {
                    parent: 'Modalidad de Modificacion y Adecuacion',
                    codes: ['6615',]
                },
                {
                    parent: 'Modalidad de Demolicion y Cerramiento',
                    codes: ['6616', '6617', '6618', '6619']
                },

            ]
        };
        const _CODE_LIST_67 = {
            parent: '6.7 DOCUMENTOS ADICIONALES EN LICENCIAS DE INTERVENCIÓN Y OCUPACIÓN DEL ESPACIO PÚBLICO',
            codes: ['671', '672']
        };
        const _CODE_LIST_68 = {
            parent: '6.8 DOCUMENTOS PARA OTRAS ACTUACIONES',
            children: [
                {
                    parent: 'Ajuste de cotas y áreas',
                    codes: ['680',]
                },
                {
                    parent: 'Aprobación de los planos de propiedad horizontal',
                    codes: ['681', '682', '683', '684', '685',]
                },
                {
                    parent: 'Autorización para el movimiento de tierras',
                    codes: ['686',]
                },
                {
                    parent: 'Aprobación de piscinas',
                    codes: ['687', '6862',]
                },
                {
                    parent: 'Modificación del plano urbanístico',
                    codes: ['688', '689']
                },
            ]
        };

        const _CODE_LIST = []
        // DATA GETTER
        let _GET_CHILD_6 = () => {
            var _CHILD = _FUN_6;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        //  DATA CONVERTES
        let _FIND_IN_VRDOCS = (code) => {
            if(!code) return false;
            let FOUND_CODE = VRDocs.find(vr => code.includes(vr.code));
            return FOUND_CODE;
        }
        let _GET_EDIT_POWERS = (row) => {
            if (docsScope) {
                if (_docsScope.includes(String(row.code))) return true;
                else return false;
            }
            return true;
        }
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
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _GET_VALUE_BADGE = (row) => {
            let bg = {};

            if (row.value == -1 || row.value == null) bg = { color: 'dark', text: 'SIN DEFINIR', value: 1 }
            if (row.value == 0) {
                let VR = _FIND_IN_VRDOCS(row.code);
                if (VR) bg = { color: 'success', text: 'APORTO', value: 2 }
                else bg = { color: 'danger', text: 'NO APORTO', value: 1 }
            }
            if (row.value == 1) bg = { color: 'success', text: 'APORTO', value: 2 }
            if (row.value == 2) bg = { color: 'warning', text: 'NO APLICA', value: 0 }
            let editable = _GET_EDIT_POWERS(row);


            return <a href="#!" onClick={() => { if (editable) save_fun_r_2(bg.value, row.code) }}> <MDBBadge color={bg.color}>{bg.text}</MDBBadge></a>
        }
        let _GET_EVA_VAKUE = (row) =>{
            if(row.value == 1) return true;
            else if(row.value == -1 || row.value == null || row.value == 2) return false;
            else return _FIND_IN_VRDOCS(row.code);
        }
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger input-group-sm';
            }
            if (_VALUE == 0) {
                return 'form-select text-danger input-group-sm';
            }
            if (_VALUE == 1) {
                return 'form-select text-success input-group-sm';
            }
            if (_VALUE == 2) {
                return 'form-select text-warning input-group-sm';
            } else {
                return 'form-select input-group-sm';
            }
        }
        let _GET_REVIEW = (_code) => {
            let _review = _FUN_R.review;
            _review ? _review = _review.split(',') : _review = [];
            for (var i = 0; i < _review.length; i++) {
                if (_review[i].includes(_code)) return _review[i].split('&')[1];
            }
            return 0;
        }
        let _GET_ID6 = (_code) => {
            let _id6 = _FUN_R.id6;
            _id6 ? _id6 = _id6.split(',') : _id6 = [];
            for (var i = 0; i < _id6.length; i++) {
                if (_id6[i].includes(_code)) return _id6[i].split('&')[1];
            }
            return false;
        }
        let _FIND_6_CODE = (_code) => {
            let _LIST = _GET_CHILD_6();
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id_public == _code) {
                    return _LIST[i];
                }
            }
            return false;
        }
        let _GET_ID6_NAME = (_code) => {
            let _id6 = _FIND_6_CODE(_code)
            if (!_id6) return 0;
            return _id6.id;
        }

        const conditionalRowStyles = [
            {
                when: row => !_GET_EDIT_POWERS(row),
                style: {
                    backgroundColor: 'lightgray',
                    color: 'dark',
                    '&:hover': {
                        cursor: 'pointer',
                    },
                },
            },
        ];
        // COMPONENT JSX
        let _COMPONENT_TABLE_LIST = () => {
            if (!_FUN_R) return []
            let _DOCS = _FUN_R.code;
            let _VALUE = _FUN_R.checked;
            let _REVIEW = _FUN_R.review;
            let _ID6 = _FUN_R.id6;
            if (!_DOCS || !_VALUE) return []
            _DOCS = _DOCS.split(',');
            _VALUE = _VALUE.split(',');

            let buildList = BUILD_LIST();
            let newList = [];
            buildList.map(value => {
                let codes = value.codes;
                if (!codes) return;
                codes.map(valuej => {
                    let indexOfCode = _DOCS.indexOf(valuej)
                    newList.push({
                        parent: value.parent,
                        code: valuej,
                        index: indexOfCode,
                        doc: _DOCS[indexOfCode],
                        value: _VALUE[indexOfCode],
                        name: FUN6JSON[_DOCS[indexOfCode]],
                    })
                })
            })


            return newList;
        }

        let BUILD_LIST = () => {
            let list = [];
            list.push(_CODE_LIST_61);

            if (_FUN_1.item_1.includes('A')) {
                if (_FUN_1.item_3.includes('A')) list.push(_CODE_LIST_62.children[0]);
                if (_FUN_1.item_3.includes('B')) list.push(_CODE_LIST_62.children[1]);
                if (_FUN_1.item_3.includes('C')) list.push(_CODE_LIST_62.children[2]);
            }
            if (_FUN_1.item_1.includes('B')) {
                list.push(_CODE_LIST_63);
                if (_FUN_1.item_3.includes('B')) list.push(_CODE_LIST_63.children[0]);
            }
            if (_FUN_1.item_1.includes('C')) {
                if (_FUN_1.item_3.includes('A') || _FUN_1.item_3.includes('B')) list.push(_CODE_LIST_64.children[0]);
                if (_FUN_1.item_3.includes('C')) list.push(_CODE_LIST_62.children[1]);
            }
            if (_FUN_1.item_1.includes('F')) {
                list.push(_CODE_LIST_65);
            }
            if (_FUN_1.item_1.includes('D')) {
                list.push(_CODE_LIST_66);
                list.push(_CODE_LIST_66.children[0]);
                list.push(_CODE_LIST_66.children[1]);
                list.push(_CODE_LIST_66.children[2]);
                list.push(_CODE_LIST_66.children[3]);
                list.push(_CODE_LIST_66.children[4]);
                list.push(_CODE_LIST_66.children[5]);
                list.push(_CODE_LIST_66.children[6]);
                list.push(_CODE_LIST_66.children[7]);
            }
            if (_FUN_1.item_1.includes('E')) {
                list.push(_CODE_LIST_67);
            }
            if (_FUN_1.item_1.includes('G')) {
                list.push(_CODE_LIST_68.children[0]);
                list.push(_CODE_LIST_68.children[1]);
                list.push(_CODE_LIST_68.children[2]);
                list.push(_CODE_LIST_68.children[3]);
                list.push(_CODE_LIST_68.children[4]);
            }
            return list;
        }
        // FUNCTIONS & APIS
        var formData = new FormData();
        const columns = [
            {
                name: <label className="text-center">MODALIDAD</label>,
                minWidth: '350px',
                cell: row => <label>{row.parent}</label>
            },
            {
                name: <label className="text-center">DOCUMENTO</label>,
                minWidth: '350px',
                cell: row => <label>{row.name ?? FUN6JSON[row.code]}</label>
            },
            {
                name: <label className="text-center">CODIGO</label>,
                center: true,
                minWidth: '60px',
                cell: row => <label>{(row.code)}</label>
            },
            {
                name: <label className="text-center">ESTATUS</label>,
                center: true,
                minWidth: '60px',
                cell: row => _GET_VALUE_BADGE(row)
            },
            {
                name: <label className="text-center">EVALUACION</label>,
                minWidth: '150px',
                cell: row => _GET_EVA_VAKUE(row) ? <div class="input-group input-group-sm">
                    <input type="hidden" value={row.doc} name={'r_l_g2_doc_code'} />
                    <select className={_GET_SELECT_COLOR_VALUE(_GET_REVIEW(row.code))} name="r_l_g2_doc_review"
                        defaultValue={_GET_REVIEW(row.code)} onChange={() => save_fun_r(row)} disabled={readOnly ? true : !_GET_EDIT_POWERS(row)}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                    </select></div> : ''
            },
            {
                name: <label className="text-center">ANEXO</label>,
                center: true,
                minWidth: '150px',
                cell: row => <div class="input-group input-group-sm"><select className='form-select' name="r_l_g2_doc_id6" disabled={readOnly ? true : !_GET_EDIT_POWERS(row)}
                    defaultValue={_GET_ID6(row.doc) || _GET_ID6_NAME(row.doc)} onChange={() => save_fun_r()}>
                    <option value="-1">APORTADO FISICAMENTE</option>
                    <option value="0">SIN DOCUMENTO</option>
                    {_CHILD_6_SELECT()}
                </select></div>
            },
            {
                name: <label className="text-center">VER</label>,
                center: true,
                minWidth: '100px',
                cell: row => {
                    let id6 = _GET_ID6(row.doc) || _GET_ID6_NAME(row.doc);
                    if (id6 > 0) return <VIZUALIZER
                        url={_FIND_6(id6).path + "/" + _FIND_6(id6).filename}
                        apipath={'/files/'}
                        icon='fas fa-search'
                        iconWrapper='btn btn-sm btn-info m-0 p-1 shadow-none'
                        iconStyle={{ fontSize: '150%' }}
                    />
                    else return '';
                }
            },
        ]
        let save_fun_r = () => {
            let _reivews = document.getElementsByName('r_l_g2_doc_review');
            let _id6s = document.getElementsByName('r_l_g2_doc_id6');
            let _codes = document.getElementsByName('r_l_g2_doc_code');

            let review = [];
            let id6 = [];
            for (var i = 0; i < _codes.length; i++) {
                review.push(`${_codes[i].value}&${_reivews[i].value}`);
                id6.push(`${_codes[i].value}&${_id6s[i].value}`);
            }
            formData.set('review', review.join());
            formData.set('id6', id6.join());
            manage_fun_r(false);
        }

        let save_fun_r_2 = (value, code) => {
            let codes = _FUN_R.code.split(',');
            let values = _FUN_R.checked.split(',');
            let codeIndex = codes.indexOf(code);
            if (codeIndex == -1) {
                codes.push(code)
                values.push(value)
                formData.set('checked', values.join());
                formData.set('code', codes.join());
            } else {
                values[codeIndex] = value;
                formData.set('checked', values.join());
            }

            manage_fun_r(false);
        }

        let manage_fun_r = (useMySwal) => {
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_FUN_R) {
                FUN_SERVICE.update_r(_FUN_R.id, formData)
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
                            this.props.requestUpdate(currentItem.id);
                            //this.props.requestUpdateRecord(currentItem.id);
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
        }


        return (
            <div className="record_lar_doc_check container">
                <DataTable
                    conditionalRowStyles={conditionalRowStyles}

                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                    noDataComponent="NO HAY ARCHIVOS DEFINIDOS"
                    striped="true"
                    columns={columns}
                    dense

                    load={true}
                    //progressPending={!true}
                    progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                    fixedHeader
                    fixedHeaderScrollHeight="500px"

                    data={_COMPONENT_TABLE_LIST()}
                    highlightOnHover

                    className="data-table-component"
                    noHeader
                    onRowClicked={(e) => this.setState({ selectedRow: e.id })}
                />
            </div >
        );
    }
}

export default RECORD_LAW_DOCSCHECK;
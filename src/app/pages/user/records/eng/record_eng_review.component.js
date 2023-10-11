import { MDBBtn, MDBTypography } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'
import FUN_SERVICE from '../../../../services/fun.service'
import { PDFDocument, StandardFonts } from 'pdf-lib';
import moment from 'moment';
import { cities, domains_number } from '../../../../components/jsons/vars';
import { handleEnghCheck } from '../../../../components/customClasses/pdfCheckHandler';
import { VR_DOCUMENTS_OF_INTEREST } from '../../../../components/customClasses/typeParse';
import submitService from '../../../../services/submit.service';
import RECORD_DOCUMENT_VERSION from '../record_docVersion.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class RECORD_ENG_REVIEW extends Component {
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
    _GET_CHILD_RECORD_REVIEW = () => {
        var _CHILD = this.props.currentRecord.record_eng_reviews;
        var _CURRENT_VERSION = document.getElementById('record_version').value;
        var _CHILD_VARS = {
            id: false,
            version: 1,
            check: "",
            check_2: "",
            date: "",
            desc: '',
            detail: '',
            detail_2: '',
            worker_id: '',
            worker_name: '',
            check_context: '',
            check_2_cotext: '',
        }
        if (_CHILD) {
            for (let i = 0; i < _CHILD.length; i++) {
                const element = _CHILD[i];
                if (element.version == _CURRENT_VERSION) {
                    _CHILD_VARS.id = element.id;
                    _CHILD_VARS.version = element.version;
                    _CHILD_VARS.check = element.check;
                    _CHILD_VARS.check_2 = element.check_2;
                    _CHILD_VARS.date = element.date ?? "";
                    _CHILD_VARS.desc = element.desc ?? "";
                    _CHILD_VARS.detail = element.detail ?? "";
                    _CHILD_VARS.detail_2 = element.detail_2 ?? "";
                    _CHILD_VARS.worker_id = element.worker_id ?? "";
                    _CHILD_VARS.worker_name = element.worker_name ?? "";
                    _CHILD_VARS.check_context = element.check_context ?? "";
                    _CHILD_VARS.check_2_cotext = element.check_2_cotext ?? "";
                }
            }
        }
        return _CHILD_VARS;
    }

    LOAD_STEP(_id_public) {
        var _CHILD = this.props.currentRecord.record_law_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == document.getElementById('record_version').value && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    _GET_STEP_TYPE(_id_public, _type) {
        var STEP = this.LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type] ?? []
        if (!value.length) return [];
        value = value.split(';');
        return value
    }
    async CREATE_CHECK(_detail, chekcs, _currentItem, _headers, _date) {
        let swaMsg = this.props.swaMsg;
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        const currentItem = _currentItem;
        const id_public = currentItem.id_public;


        let model = currentItem.model
        if (!model) return MySwal.fire({
            title: 'SOLICITUD SIN MODELO',
            text: 'Para poder generar el PDF de esta solicitud, se debe de definir el modelo.',
            icon: 'error',
            showConfirmButton: true,
            confirmButtonText: 'CONTINUAR',
        });

        var formUrl = process.env.REACT_APP_API_URL + "/pdf/recordengextra";
        if (Number(model) == 2021) formUrl = process.env.REACT_APP_API_URL + "/pdf/recordengextra";
        if (Number(model) >= 2022) formUrl = process.env.REACT_APP_API_URL + "/pdf/recordengextra2022";
        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);

        let page = pdfDoc.getPage(0)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)
        // WIDTH = 612, HEIGHT = 936

        handleEnghCheck(pdfDoc, page, chekcs, _detail, 0, 1, model)


        let _city = _headers.city;
        if (_date && _GLOBAL_ID === 'cb1') _city = _headers.city + ", radicado el " + _date;
        let _number = _headers.number;
        let pageCount = pdfDoc.getPageCount();

        for (let i = 0; i < pageCount; i++) {
            if (Number(model) == 2021 || i > 0){
                page = pdfDoc.getPage(i);
                page.moveTo(215, 783)
                page.drawText(_number, { size: 14 })
                page.moveTo(100, 770)
                page.drawText(_city, { size: 9 })
                page.moveTo(420, 830)
                page.drawText(id_public, { size: 14 })
            } 

            // THIS IS DONE BECAUSE THE SIZE OF THE PAGES ARE DIFERENT, ONE IS LETTER, OTHER IS LEGAL
            if (Number(model) >= 2022 && i == 0) {
                page = pdfDoc.getPage(i);
                page.moveTo(200, 783 - 150)
                page.drawText(_number, { size: 14 })
                page.moveTo(100, 770 - 150)
                page.drawText(_city, { size: 9 })
                page.moveTo(450, 830 - 165)
                page.drawText(id_public, { size: 14 })
            }
        }

        pdfDoc.setAuthor("CURADURIA URBANA 1 DE BUCARAMANGA");
        pdfDoc.setCreationDate(moment().toDate());
        pdfDoc.setCreator('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setKeywords(['formulario', 'unico', 'nacional', 'curaduria', 'planeacion', 'construccion', 'obra', 'proyecto', 'informe', 'acta', 'estructural', 'ingenieria']);
        pdfDoc.setLanguage('es-co');
        pdfDoc.setProducer('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setTitle('INFORME ESTRUCTURAL - ' + id_public)

        var pdfBytes = await pdfDoc.save();
        var fileDownload = require('js-file-download');
        fileDownload(pdfBytes, 'INFORME ESTRUCTURAL ' + id_public + '.pdf');
        MySwal.close();


    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, isP } = this.props;
        const { VRDocs } = this.state;

        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_REVIEW = () => {
            var _CHILD = currentRecord.record_eng_reviews;
            var _CURRENT_VERSION = currentVersionR;
            var _CHILD_VARS = {
                id: false,
                version: 1,
                check: "",
                check_2: "",
                date: "",
                desc: '',
                detail: '',
                detail_2: '',
                detail_3: '',
                worker_id: '',
                worker_name: '',
                check_context: '',
                check_2_cotext: '',
            }
            if (_CHILD) {
                for (let i = 0; i < _CHILD.length; i++) {
                    const element = _CHILD[i];
                    if (element.version == _CURRENT_VERSION) {
                        _CHILD_VARS.id = element.id;
                        _CHILD_VARS.version = element.version;
                        _CHILD_VARS.check = element.check;
                        _CHILD_VARS.check_2 = element.check_2;
                        _CHILD_VARS.date = element.date ?? "";
                        _CHILD_VARS.desc = element.desc ?? "";
                        _CHILD_VARS.detail = element.detail ?? "";
                        _CHILD_VARS.detail_2 = element.detail_2 ?? "";
                        _CHILD_VARS.detail_3 = element.detail_3 ?? "";
                        _CHILD_VARS.worker_id = element.worker_id ?? "";
                        _CHILD_VARS.worker_name = element.worker_name ?? "";
                        _CHILD_VARS.check_context = element.check_context ?? "";
                        _CHILD_VARS.check_2_cotext = element.check_2_cotext ?? "";
                    }
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_FUN_R = () => {
            var _CHILD = currentItem.fun_rs;
            var _CURRENT_VERSION = currentVersion - 1;
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD = _CHILD[_CURRENT_VERSION]
                } else {
                    _CHILD = false
                }
            }
            return _CHILD;
        };
        // DATA CONVERTERS
        let _FIND_IN_VRDOCS = (code) => {
            if (!code) return false;
            let FOUND_CODE = VRDocs.find(vr => code.includes(vr.code));
            return FOUND_CODE;
        }
        let BUILD_LIST = () => {
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
                codes: ['631', '632', '633', '630'],
                children: [
                    {
                        parent: 'Documentos adicionales en licencia de parcaleación para saneamiento',
                        codes: ['634', '635', '636']
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

            const _FUN_1 = _GET_CHILD_1();
            let list = [];
            list = list.concat(_CODE_LIST_61.codes);

            if (_FUN_1.item_1.includes('A')) {
                if (_FUN_1.item_3.includes('A')) list = list.concat(_CODE_LIST_62.children[0].codes);
                if (_FUN_1.item_3.includes('B')) list = list.concat(_CODE_LIST_62.children[1].codes);
                if (_FUN_1.item_3.includes('C')) list = list.concat(_CODE_LIST_62.children[2].codes);
            }
            if (_FUN_1.item_1.includes('B')) {
                list = list.concat(_CODE_LIST_63.codes);
                list = list.concat(_CODE_LIST_63.children[0].codes);
            }
            if (_FUN_1.item_1.includes('C')) {
                if (_FUN_1.item_3.includes('A') || _FUN_1.item_3.includes('B')) list = list.concat(_CODE_LIST_64.children[0].codes);
                if (_FUN_1.item_3.includes('C')) list = list.concat(_CODE_LIST_62.children[1].codes);
            }
            if (_FUN_1.item_1.includes('F')) {
                list = list.concat(_CODE_LIST_65.codes);
            }
            if (_FUN_1.item_1.includes('D')) {
                list = list.concat(_CODE_LIST_66.codes);
                list = list.concat(_CODE_LIST_66.children[0].codes);
                list = list.concat(_CODE_LIST_66.children[1].codes);
                list = list.concat(_CODE_LIST_66.children[2].codes);
                list = list.concat(_CODE_LIST_66.children[3].codes);
                list = list.concat(_CODE_LIST_66.children[4].codes);
                list = list.concat(_CODE_LIST_66.children[5].codes);
                list = list.concat(_CODE_LIST_66.children[6].codes);
                list = list.concat(_CODE_LIST_66.children[7].codes);
            }
            if (_FUN_1.item_1.includes('E')) {
                list = list.concat(_CODE_LIST_67.codes);
            }
            if (_FUN_1.item_1.includes('G')) {
                list = list.concat(_CODE_LIST_68.children[0].codes);
                list = list.concat(_CODE_LIST_68.children[1].codes);
                list = list.concat(_CODE_LIST_68.children[2].codes);
                list = list.concat(_CODE_LIST_68.children[3].codes);
                list = list.concat(_CODE_LIST_68.children[4].codes);
            }

            return list;
        }
        let _ALLOW_REVIEW = () => {
            const _docsScope = VR_DOCUMENTS_OF_INTEREST['eng'];
            let FUN_R = _GET_FUN_R();
            if (!FUN_R) return false;
            let CHECK = FUN_R.checked ? FUN_R.checked.split(',') : [];
            let REVIEWS = FUN_R.review ? FUN_R.review.split(',') : [];
            let R_CODES = FUN_R.code ? FUN_R.code.split(',') : [];
            let CODES = BUILD_LIST();
            let _ALLOW = CODES.every((c, i) => {
                let DOC = _docsScope.find(d => d.includes(c));
                if (!DOC) return true;
                let R = REVIEWS.find((r) => { return r.includes(c); })
                let r_i = R_CODES.findIndex(r => r.includes(c));
                //if (!R) return true;
                let eva = R ? R.split('&') : [];
                if (CHECK[r_i] == 2) return true;
                let vr = _FIND_IN_VRDOCS(R);
                let cond1 = eva[1] == 1 || eva[1] == 2;
                let cond2 = CHECK[r_i] == 1 || CHECK[r_i] == 2 || vr;
                return cond1 && cond2;
            })
            return _ALLOW;
        }
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_CLOCK_STATE_VERSION = (_state, version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_PROFESIONAL_NAME = () => {
            var _ROLEID = window.user.roleId;
            return window.user.name + " " + window.user.surname
            //THIS ROLES ARE PROGRAMER MASTER, CURATOR AND ARCHITEC
            if (_ROLEID == 1 || _ROLEID == 2 || _ROLEID == 6) {

            } else {
                return "NO ESTA AUTORIZADO A REALIZAR ESTA ACCION"
            }
        }
        let _GET_RECORD_REVIEW = () => {
            var _CHILD = currentItem.record_review;
            return _CHILD ?? {};
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : []
            if (!value) return [];
            value = value.split(';');
            return value
        }
        // COMPONENT JSX
        let _COMPONENT_DETAILS_2 = () => {
            let _CHILD = _GET_REVIEW();

            return <div className="row py-2">
                <div className="col-12">
                    <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Observaciones</label>
                        </div>
                    </div>
                    <textarea className="input-group" maxLength="8000" id="record_eng_detail_2" rows="4"
                        defaultValue={_CHILD.detail_2} onBlur={() => save_item()}></textarea>
                    <label> (máximo 8000 caracteres)</label>
                </div>
            </div>
        }
        let _COMPONENT_DETAILS_3 = () => {
            let _CHILD = _GET_REVIEW();
            return <>
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Notas del Ingeniero Revisor</label>
                    </div>
                </div>
                <textarea className="input-group" id="record_eng_docs_desc" maxLength={4000}
                    defaultValue={_CHILD.detail_3 ?? ""} onBlur={() => save_item_d3()} rows="3"></textarea>
                <label> (Máximo 4000 Caracteres)</label>
            </>
        }
        let _COMPONENT_REVIEW = () => {
            let _CHILD = _GET_REVIEW();

            let _RR = _GET_RECORD_REVIEW();

            let _PRIMAL_ASIGN = { date_asign: currentRecord.date_asign, worker_name: currentRecord.worker_name }
            let _ASIGNS = _GET_CLOCK_STATE_VERSION(12, 100).date_start ? _GET_CLOCK_STATE_VERSION(12, 100).date_start.split(';') : [];
            let _REVIEWS = _GET_CLOCK_STATE_VERSION(12, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(12, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES = _GET_CLOCK_STATE_VERSION(12, 200).date_start ? _GET_CLOCK_STATE_VERSION(12, 200).date_start.split(';') : [];
            let _REVIEWS_DESC = _GET_CLOCK_STATE_VERSION(12, 200).desc ? _GET_CLOCK_STATE_VERSION(12, 200).desc.split(';') : [];

            let CLOCKS_R;
            CLOCKS_R = _RR.check == 0 ? ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Acta Correcciones',] : ['Acta Observaciones',]

            const REW_STR = [<label className='text-danger fw-bold'>NO ES VIABLE</label>,
            <label className='text-success fw-bold'>SI ES VIABLE</label>,
            <label className='text-warning fw-bold'>NO APLICA</label>];

            const ALLOW_REVIEW = _ALLOW_REVIEW();
            return <>
                {!ALLOW_REVIEW ? <MDBTypography note noteColor='danger'>
                    <h3 className="text-justify text-dark">ADVERTENCIA</h3>
                    NO ES POSIBLE EVALUAR EL INFORME COMO "SI ES VIABLE" POR QUE HAY DOCUMENTOS QUE NO CUMPLEN, PARA PODER EVALUAR COMO "SI ES VIABLE" LOS DOCUMENTOS EN EL PUNTO 4.1.1 DEBEN ESTAR DECLARAROS COMO "CUMPLE" EN SU EVALUACIÓN
                </MDBTypography> : ''}
                <div className="row border bg-info py-1 text-white fw-bold">
                    <div className="col">
                        <label>REVISION</label>
                    </div>
                    <div className="col-3 text-center">
                        <label>PROFESIONAL</label>
                    </div>
                    <div className="col text-center">
                        <label>FECHA ASIGNACIÓN</label>
                    </div>
                    <div className="col text-center">
                        <label>FECHA RESULTADO</label>
                    </div>
                    <div className="col-1">
                    </div>
                </div>
                {CLOCKS_R.map((value, i) => {
                    let iasing = i == 0 ? (_PRIMAL_ASIGN.date_asign ?? _ASIGNS[i]) : _ASIGNS[i];
                    let rev = _REVIEWS[i] ? _REVIEWS[i].split(',') : [];
                    let ireview = i == 0 ? (_CHILD.check ?? rev[0]) : rev[0];
                    let ireview2 = i == 0 ? (_CHILD.check_2 ?? rev[1]) : rev[1];

                    let idate = i == 0 ? (_CHILD.date ?? _REVIEWS_DATES[i]) : _REVIEWS_DATES[i];
                    let iworker = _PRIMAL_ASIGN.worker_name || _CHILD.worker_name || '';

                    let desc = _REVIEWS_DESC[i] ? _REVIEWS_DESC[i].split('&&') : [];
                    let idesc1 = i == 0 ? (_CHILD.check_context ?? desc[0] ?? '') : desc[0] ?? '';
                    let idesc2 = i == 0 ? (_CHILD.check_2_cotext ?? desc[1] ?? '') : desc[1] ?? '';

                    let isPrimal = i == 0;
                    let allowReview = iasing != null && iasing != undefined && iasing != '';

                    return <>
                        <div className="row border">
                            <div className="row">
                                <div className="col">
                                    <label className='fw-bold'>{value}</label>
                                </div>
                                <div className="col-3 text-center">
                                    {this.state['REW' + i]
                                        ? <input type="text" class="form-control me-1" id={"r_l_review_worker_" + i}
                                            defaultValue={iworker} disabled />
                                        : <label>{iworker}</label>
                                    }
                                </div>
                                <div className="col text-center">
                                    <label>{iasing}</label>
                                </div>
                                <div className="col text-center">
                                    {this.state['REW' + i]
                                        ? <input type="date" class="form-control form-control-sm" id={"r_l_review_date_" + i} max="2100-01-01"
                                            defaultValue={idate} />
                                        : <label>{idate ?? ''}</label>
                                    }
                                </div>
                                <div className="col-1">
                                    {allowReview ? <MDBBtn floating tag='a' size='sm' color='secondary' outline={this.state['REW' + i]}
                                        onClick={() => this.setState({ ['REW' + i]: !this.state['REW' + i] })}><i class="far fa-edit"></i></MDBBtn>
                                        : ''}
                                    {this.state['REW' + i]
                                        ? <MDBBtn floating tag='a' size='sm' color='success' className='ms-1'
                                            onClick={() => review_r(isPrimal, i, iasing)}><i class="fas fa-check"></i></MDBBtn>
                                        : ""
                                    }
                                    {(ireview != null) && allowReview ?
                                        //false ?
                                        <RECORD_DOCUMENT_VERSION
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdate={this.props.requestUpdate}
                                            swaMsg={swaMsg}
                                            id6={"eng" + i} />
                                        : ''
                                    }
                                </div>
                            </div>
                            <div className="row border mx-2">
                                <div className="col">
                                    <label>Resultado 1:</label>
                                </div>
                                <div className="col-6">
                                    {this.state['REW' + i]
                                        ? <input type="text" class="form-control me-1" id={"r_l_review_40_" + i}
                                            defaultValue={idesc1} />
                                        : <label>{idesc1}</label>
                                    }
                                </div>
                                <div className="col-3 text-center">
                                    {this.state['REW' + i]
                                        ? <select className="form-select form-control form-control-sm" defaultValue={ireview} id={"r_l_review_20_" + i}>
                                            <option value="0" className="text-danger">NO ES VIABLE</option>
                                            {ALLOW_REVIEW ? <option value="1" className="text-success">SI ES VIABLE</option> : ''}
                                        </select>
                                        : <label>{REW_STR[ireview] ?? ''}</label>
                                    }
                                </div>
                                <div className="col"></div>
                            </div>
                            <div className="row border mx-2">
                                <div className="col">
                                    <label>Resultado 2:</label>
                                </div>
                                <div className="col-6">
                                    {this.state['REW' + i]
                                        ? <input type="text" class="form-control me-1" id={"r_l_review_50_" + i}
                                            defaultValue={idesc2} />
                                        : <label>{idesc2}</label>
                                    }
                                </div>
                                <div className="col-3 text-center">
                                    {this.state['REW' + i]
                                        ? <select className="form-select form-control form-control-sm" defaultValue={ireview2} id={"r_l_review_30_" + i}>
                                            <option value="0" className="text-danger">NO ES VIABLE</option>
                                            {ALLOW_REVIEW ? <option value="1" className="text-success">SI ES VIABLE</option> : ''}
                                            <option value="2" className="text-success">NO APLICA</option>
                                        </select>
                                        : <label>{REW_STR[ireview2] ?? ''}</label>
                                    }
                                </div>
                                <div className="col"></div>
                            </div>
                        </div>
                    </>
                })}
            </>
        }
        let _COMPONENT_CHECK_REVIEW = () => {
            let _CHILD = _GET_REVIEW();
            return <>
                <div className="row">
                    <div className="col-9 p-1">
                        <label className="fw-bold text-uppercase">Contexto de la revision. </label>
                    </div>
                    <div className="col-3 p-1">
                        <label className="fw-bold text-uppercase">Resultado</label>
                    </div>
                    <div className="col-3 p-1"></div>
                </div>
                <div className="row">
                    <div className="col-9 p-1">
                        <input type="text" class="form-control me-1" id="r_l_review_40"
                            defaultValue={_CHILD.check_context ?? ''} />
                    </div>
                    <div className="col-3 p-1">
                        <select className="form-select" defaultValue={_CHILD.check} id="r_l_review_20">
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                    <div className="col-3 p-1"></div>
                </div>

                <div className="row">
                    <div className="col-9 p-1">
                        <input type="text" class="form-control me-1" id="r_l_review_50"
                            defaultValue={_CHILD.check_2_cotext ?? ''} />
                    </div>
                    <div className="col-3 p-1">
                        <select className="form-select" defaultValue={_CHILD.check_2} id="r_l_review_30">
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                    </div>
                </div>

            </>
        }
        let _COMPONENT_ASIGN_REVIEW = () => {
            var clocks_asign = _GET_CLOCK_STATE(12, 100);
            var clocks_reviews = _GET_CLOCK_STATE(12, 200);

            var asigns = clocks_asign.date_start ? clocks_asign.date_start.split(';') : [];

            var reviews_date = clocks_reviews.date_start ? clocks_reviews.date_start.split(';') : [];

            return <>
                <label>Asignación</label>
                <select className="form-select" id="asign_re">
                    {asigns.map((value, index) => <option selected={index == reviews_date.length - 1} value={index}># {index + 1} {value}</option>)}
                </select>
            </>
        }
        let _COMPOENT_PDF = () => {
            let _CHILD = _GET_REVIEW();
            let _WORKER_NAME = currentRecord.worker_name;
            let _RR = _GET_RECORD_REVIEW();

            let _REVIEWS = _GET_CLOCK_STATE_VERSION(12, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(12, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES = _GET_CLOCK_STATE_VERSION(12, 200).date_start ? _GET_CLOCK_STATE_VERSION(12, 200).date_start.split(';') : [];
            let _REVIEWS_DESC = _GET_CLOCK_STATE_VERSION(12, 200).desc ? _GET_CLOCK_STATE_VERSION(12, 200).desc.split(';') : [];

            let CLOCKS_R;
            CLOCKS_R = _RR.check == 0 ? ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Acta Correcciones',] : ['Acta Observaciones',]

            let reviews = [
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
            ]

            for (let i = 0; i < CLOCKS_R.length; i++) {
                const clock = CLOCKS_R[i];
                let checks = _REVIEWS[i] ? _REVIEWS[i].split(',') : [];
                let checks_desc = _REVIEWS_DESC[i] ? _REVIEWS_DESC[i].split('&&') : [];
                if (i == 0) {
                    reviews[i].worker = _WORKER_NAME;
                    reviews[i].check = _CHILD.check ?? (checks[0] ? checks[0] : 0);
                    reviews[i].check2 = _CHILD.check_2 ?? (checks[1] ? checks[1] : 0);
                    reviews[i].date = _CHILD.date ?? (_REVIEWS_DATES[i] ? _REVIEWS_DATES[i] : '');
                    reviews[i].c1 = _CHILD.check_context ?? (checks_desc[0] ? checks_desc[0] : '');
                    reviews[i].c2 = _CHILD.check_2_cotext ?? (checks_desc[1] ? checks_desc[1] : '');
                } else {
                    reviews[i].worker = _WORKER_NAME;
                    reviews[i].check = checks[0] ? checks[0] : 0;
                    reviews[i].check2 = (checks[1] ? checks[1] : 0);
                    reviews[i].date = _REVIEWS_DATES[i] ? _REVIEWS_DATES[i] : '';
                    reviews[i].c1 = (checks_desc[0] ? checks_desc[0] : '');
                    reviews[i].c2 = (checks_desc[1] ? checks_desc[1] : '');
                }
            }

            let _CHANGE_VALUES = (i) => {
                if (i == 3) document.getElementById('record_version').value = 2
                else document.getElementById('record_version').value = 1
                document.getElementById('record_pdf_worker_name').value = reviews[i].worker;
                document.getElementById('record_pdf_date').value = reviews[i].date;

                document.getElementById('record_pdf_check_1_v').value = reviews[i].check == 1 ? 'VIABLE' : 'NO VIABLE';
                document.getElementById('record_pdf_check_2_v').value = reviews[i].check2 == 1 ? 'VIABLE' : reviews[i].check2 == 2 ? 'NO APLICA' : 'NO VIABLE';
                document.getElementById('record_pdf_check_1_c').value = reviews[i].c1;
                document.getElementById('record_pdf_check_2_c').value = reviews[i].c2;
            }

            return <div className='row'>
                <div className="py-3">
                    <div className="row mb-3">
                        <div className="col">
                            <label>Autoridad Competente</label>
                            <div class="input-group my-1">
                                <select class="form-select me-1" id={"func_pdf_0_1"}>
                                    {domains_number}
                                </select>
                            </div>
                        </div>
                        <div className="col">
                            <label>Ciudad</label>
                            <div class="input-group my-1">
                                <select class="form-select me-1" id={"func_pdf_0_2"}>
                                    {cities}
                                </select>
                            </div>
                        </div>
                        <div className="col">
                            <label>Acta</label>
                            <div class="input-group my-1">
                                <select class="form-select me-1" id={"record_version"}>
                                    <option value={1}>OBSERVACIONES</option>
                                    <option value={2}>CORRECCIONES</option>
                                </select>
                            </div>
                        </div>
                        <div className="col">
                            <label>Cabecera</label>
                            <div class="input-group my-1">
                                <select class="form-select me-1" id={"record_header"}>
                                    <option value={1}>USAR CABECERA</option>
                                    <option value={0}>NO USAR CABECERA</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col">
                            <label>Revision</label>
                            <div class="input-group my-1">
                                <select class="form-select me-1" id={"record_pdf_version"} onChange={(e) => _CHANGE_VALUES(e.target.value)}>
                                    {CLOCKS_R.map((op, i) => <option value={i}>{op}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col">
                            <label>Profesional</label>
                            <div class="input-group my-1">
                                <input className='form-control' id={"record_pdf_worker_name"} disabled defaultValue={reviews[0].worker} />
                            </div>
                        </div>
                        <div className="col">
                            <label>Fecha</label>
                            <div class="input-group my-1">
                                <input className='form-control' id={"record_pdf_date"} disabled defaultValue={reviews[0].date} />
                            </div>
                        </div>
                        <div className="col-2">
                            <br />
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="record_eng_pending" />
                                <label class="form-check-label" for="exampleCheck1">Pendiente</label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col">
                            <label>Resultado 1 Contexto:</label>
                            <input className='form-control' id={"record_pdf_check_1_c"} disabled defaultValue={reviews[0].c1} />
                        </div>
                        <div className="col">
                            <label>Resultado 1:</label>
                            <input className='form-control' id={"record_pdf_check_1_v"} disabled defaultValue={reviews[0].check == 1 ? 'VIABLE' : 'NO VIABLE'} />
                        </div>
                        <div className="col">
                            <label>Resultado 2 Contexto:</label>
                            <input className='form-control' id={"record_pdf_check_2_c"} disabled defaultValue={reviews[0].c2} />
                        </div>
                        <div className="col">
                            <label>Resultado 2:</label>
                            <input className='form-control' id={"record_pdf_check_2_v"} disabled defaultValue={reviews[0].check2 == 1 ? 'VIABLE' : reviews[0].check2 == 2 ? 'NO APLICA' : 'NO VIABLE'} />
                        </div>
                    </div>
                    <div className="row mb-3 text-center">
                        <div className="col">
                            <button className="btn btn-danger me-1" onClick={() => CREATE_PDF()}> <i class="far fa-file-pdf"></i> DESCARGAR INFORME</button>
                        </div>
                        <div className="col">
                            <button className="btn btn-danger" onClick={() => CREATE_PDF_CHECK()}> <i class="far fa-check-square"></i> DESCARGAR CHECKEO</button>
                        </div>
                    </div>
                </div>
            </div>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let save_item = (e) => {
            if (e) e.preventDefault();
            formData = new FormData();
            formData.set('recordEngId', currentRecord.id);
            let detail_2 = document.getElementById('record_eng_detail_2').value;
            formData.set('detail_2', detail_2);
            manage_item(false);
        }
        let save_item_d3 = (e) => {
            if (e) e.preventDefault();
            formData = new FormData();
            formData.set('recordEngId', currentRecord.id);
            let desc = document.getElementById('record_eng_docs_desc').value;
            formData.set('detail_3', desc);
            manage_item(false);
        }
        let manage_item = (useSwal) => {
            var _CHILD = _GET_REVIEW();
            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                RECORD_ENG_SERVICE.update_review(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            } else {
                RECORD_ENG_SERVICE.create_review(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }

        }

        // REVIEW
        let review_r = (isPrimal, i, iasing) => {
            MySwal.fire({
                title: "REALIZAR REVISION",
                text: `¿Esta seguro de realizar la revision ${currentVersionR} de este Informe?`,
                icon: 'question',
                confirmButtonText: "REVISAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    save_review(isPrimal);
                    save_clock(i, iasing);
                }
            });
        }

        let save_review = (isPrimal) => {
            if (isPrimal) {
                let i = '_0';
                formData = new FormData();
                let worker_name = document.getElementById("r_l_review_worker" + i).value;
                formData.set('worker_name', worker_name);
                let date = document.getElementById("r_l_review_date" + i).value;
                formData.set('date', date);
                let check = document.getElementById("r_l_review_20" + i).value;
                formData.set('check', check);
                let check_2 = document.getElementById("r_l_review_30" + i).value;
                formData.set('check_2', check_2);
                let check_context = document.getElementById("r_l_review_40" + i).value;
                formData.set('check_context', check_context);
                let check_2_cotext = document.getElementById("r_l_review_50" + i).value;
                formData.set('check_2_cotext', check_2_cotext);

                formData.set('worker_id', window.user.id);
                manage_review(true);
            }

        }
        let manage_review = (useMySwal) => {
            let _CHILD = _GET_REVIEW();
            formData.set('recordEngId', currentRecord.id);
            formData.set('version', currentVersionR);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_CHILD.id) {
                RECORD_ENG_SERVICE.update_review(_CHILD.id, formData)
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
                            this.props.requestUpdateRecord(currentItem.id);
                            this.setState({ ['REW0']: false })
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
            else {
                RECORD_ENG_SERVICE.create_review(formData)
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
                            this.props.requestUpdateRecord(currentItem.id);
                            this.setState({ ['REW0']: false })
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

        let save_clock = (isIndex, iasing) => {
            let formDataClock = new FormData();

            let state = 12 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS
            let i = isIndex ? '_' + isIndex : '_0';
            let worker = document.getElementById("r_l_review_40" + i).value;
            let date = document.getElementById("r_l_review_date" + i).value;
            let review_1 = document.getElementById("r_l_review_20" + i).value;
            let review_2 = document.getElementById("r_l_review_30" + i).value;
            let desc_1 = review_1 == 1 ? "CUMPLE" : "NO CUMPLE";
            let desc_2 = review_2 == 1 ? "CUMPLE" : "NO CUMPLE";

            formDataClock.set('date_start', date);
            formDataClock.set('name', "Revision ESTRUCTURAL, revision " + currentVersionR);
            formDataClock.set('desc', `Resultado 1: ${desc_1}, Resultado 2: ${desc_2} por ${worker}`);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersionR);

            save_clock_asign(state, isIndex)
            manage_clock(true, state, formDataClock);
        }
        let save_clock_asign = (state, index) => {
            var _CLOCK_ASIGN = _GET_CLOCK_STATE(state, 100);
            var _CLOCK = _GET_CLOCK_STATE(state, 200);
            let j = index ? '_' + index : '_0';

            let desc_1 = document.getElementById("r_l_review_40" + j).value;
            let desc_2 = document.getElementById("r_l_review_50" + j).value;
            let desct = [desc_1, desc_2].join('&&');
            let review_1 = document.getElementById("r_l_review_20" + j).value;
            let review_2 = document.getElementById("r_l_review_30" + j).value;
            let review = [review_1, review_2].join(',')
            let date = document.getElementById("r_l_review_date" + j).value;
            let asign_length = _CLOCK_ASIGN ? _CLOCK_ASIGN.date_start ? _CLOCK_ASIGN.date_start.split(';').length : 0 : 0;

            var date_start = _CLOCK ? _CLOCK.date_start ? _CLOCK.date_start.split(';') : [] : [];
            var resolver_context = _CLOCK ? _CLOCK.resolver_context ? _CLOCK.resolver_context.split(';') : [] : [];
            var desc = _CLOCK ? _CLOCK.desc ? _CLOCK.desc.split(';') : [] : [];

            for (let i = 0; i < asign_length; i++) {
                date_start[i] = date_start[i] ?? '';
                resolver_context[i] = resolver_context[i] ?? '';
                desc[i] = desc[i] ?? '';
                if (index == i) date_start[i] = date;
                if (index == i) resolver_context[i] = review;
                if (index == i) desc[i] = desct;
            }

            let formDataClock = new FormData();
            formDataClock.set('date_start', date_start.join(';'));
            formDataClock.set('resolver_context', resolver_context.join(';'));
            formDataClock.set('state', state);
            formDataClock.set('desc', desc.join(';'));
            formDataClock.set('version', 200);

            manage_clock(false, state, formDataClock, 200, index);
        }
        let manage_clock = (useMySwal, findOne, formDataClock, altVersion, closeIndex) => {
            var _CHILD = _GET_CLOCK_STATE(findOne, altVersion ?? currentVersionR);

            formDataClock.set('fun0Id', currentItem.id);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }

            if (_CHILD.id) {
                FUN_SERVICE.update_clock(_CHILD.id, formDataClock)
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
                            if (Number(closeIndex)) this.setState({ ['REW' + closeIndex]: false })
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
            else {
                FUN_SERVICE.create_clock(formDataClock)
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
                            if (Number(closeIndex)) this.setState({ ['REW' + closeIndex]: false })
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

        // pdf gen
        let CREATE_PDF = () => {
            var formData = new FormData();
            formData.set('id', currentItem.id);
            let version = document.getElementById("record_version").value;
            formData.set('version', version);
            let header = document.getElementById("record_header").value;
            formData.set('header', header);
            let type = document.getElementById("record_version").value;
            formData.set('type_rev', type);
            let r_worker = document.getElementById("record_pdf_worker_name").value;
            formData.set('r_worker', r_worker);
            let r_date = document.getElementById("record_pdf_date").value;
            formData.set('r_date', r_date);
            let r_engc_pending = document.getElementById("record_eng_pending").checked;
            formData.set('r_engc_pending', r_engc_pending);


            let r_check = document.getElementById("record_pdf_check_1_v").value;
            formData.set('r_check', r_check);
            let r_check_2 = document.getElementById("record_pdf_check_2_v").value;
            formData.set('r_check_2', r_check_2);

            let r_check_c = document.getElementById("record_pdf_check_1_c").value;
            formData.set('r_check_c', r_check_c);
            let r_check_2_c = document.getElementById("record_pdf_check_2_c").value;
            formData.set('r_check_2_c', r_check_2_c);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_ENG_SERVICE.pdfgen(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/recordeng/" + "INFORME ESTRUCTURAL " + currentItem.id_public + ".pdf");
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        let _VERSIONS_SELECT = () => {
            var _COMPONENT = [];
            for (let i = 0; i < currentItem.version; i++) {
                _COMPONENT.push(<option value={i + 1}>Revision {i + 1}</option>)
            }
            return <select class="form-select" id="record_version">{_COMPONENT}</select>
        }
        let CREATE_PDF_CHECK = () => {
            let CLOCK_3 = _GET_CLOCK_STATE(3, 1)
            let _CHILD = _GET_REVIEW();
            let _RESUME = [];
            _RESUME.push(_CHILD.detail_2)

            let checks = _GET_STEP_TYPE('s44_check', 'check');

            if (_RESUME) _RESUME = _RESUME.join('\n\n')

            let _city = document.getElementById('func_pdf_0_2').value;
            let _number = document.getElementById('func_pdf_0_1').value;

            var headers = {};
            headers.city = _city;
            headers.number = _number

            this.CREATE_CHECK(_RESUME, checks, currentItem, headers, CLOCK_3.date_start)
        }
        return (
            <div className="record_eng_review container">
                <label className="app-p lead fw-bold my-2">4.5.1 OBSERVACIONES</label>
                {_COMPONENT_DETAILS_2()}

                {_COMPONENT_DETAILS_3()}

                <div className='row'>
                    {_COMPOENT_PDF()}
                </div>
                <h3 className="py-3" >4.5.2 Evaluar Viabilidad</h3>
                {_COMPONENT_REVIEW()}
            </div >
        );
    }
}

export default RECORD_ENG_REVIEW;
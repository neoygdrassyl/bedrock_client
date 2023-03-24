import { MDBBtn, MDBTooltip, MDBTypography, MDBPopover, MDBPopoverBody, MDBPopoverHeader, } from 'mdb-react-ui-kit';
import { MDBCollapse } from "mdbreact";
import moment from 'moment';
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import { dateParser_finalDate, dateParser_timePassed, regexChecker_isOA_2, regexChecker_isPh } from '../../../../components/customClasses/typeParse';
import FunService from '../../../../services/fun.service';

var momentB = require('moment-business-days');
const _fun_0_state = {
    '1': 'RADICACIÓN',
    '-1': 'RADICACIÓN',
    '-101': "DESISTIMIENTO",
    '-102': "DESISTIMIENTO",
    '-103': "DESISTIMIENTO",
    '-104': "DESISTIMIENTO",
    '-105': "DESISTIMIENTO",
    '-106': "DESISTIMIENTO",
    '5': 'EVALUACIÓN (LyDF)',
    '50': 'EXPEDICIÓN',
    '100': 'EXPEDIDA',
    '101': 'ARCHIVADA',
}
const _fun_0_state_COLOR = {
    '1': 'fw-bold',
    '-1': 'fw-bold',
    '-101': "fw-bold text-danger",
    '-102': "fw-bold text-danger",
    '-103': "fw-bold text-danger",
    '-104': "fw-bold text-danger",
    '-105': "fw-bold text-danger",
    '-106': "fw-bold text-danger",
    '5': 'fw-bold',
    '50': 'fw-bold',
    '100': 'fw-bold text-primary',
    '101': 'fw-bold text-primary',
}
const _fun_0_type = { '0': '', 'i': 'I', 'ii': "II", 'iii': "III", 'iv': "IV", 'oa': "OA" }
const _fun_0_type_days = { 'i': 4, 'ii': 6, 'iii': 8, 'iv': 10, 'oa': 2 };
const _fun_0_type_total = { 'i': 45, 'ii': 45, 'iii': 45, 'iv': 45, 'oa': 15 };
const _fun_0_type_days_matrix = {
    'i': { 'law': 1, 'arc': 2, 'eng': 2 },
    'ii': { 'law': 1, 'arc': 3, 'eng': 3 },
    'iii': { 'law': 1, 'arc': 4, 'eng': 4 },
    'iv': { 'law': 1, 'arc': 5, 'eng': 5 },
    'oa': { 'law': 1, 'arc': 1, 'eng': 0 },
    '0': { 'law': 1, 'arc': 1, 'eng': 0 },
}
const clocks_process = ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Revision de Correcciones',]
class FUN_WORKER_ASIGN extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentItems: [],
            currentItems2: [],
            collapseID: false,
            lic_list: false,
            lic_list2: false
        };
    }
    componentDidMount() {
        this.load()
    }
    load() {
        FunService.loadasign(window.user.id, this.props.type)
            .then(response => {
                if (response.data.length) {
                    this.asignList(response.data)
                }
            }).catch(e => {
                console.log(e);
            });

    }
    asignList(_LIST) {
        var list1 = [];
        for (let i = 0; i < _LIST.length; i++) {
            const lItem = _LIST[i];
            var vrtime = this.get_lastVRTime(lItem);
            list1.push({ ...lItem, vrtime: vrtime });
        }
        list1.sort((a, b) => a.vrtime - b.vrtime)

        this.setState({
            currentItems: list1.filter(item => {
                if (this.props.type == 'law') {
                    if (this._con_law(item) == 1) return true;
                }
                if (this.props.type == 'arc'  && !regexChecker_isOA_2(item)) {
                    if (this._con_arc(item) == 1) return true;
                }
                if (this.props.type == 'eng' && !regexChecker_isOA_2(item)) {
                    if (this._con_eng(item) == 1) return true;
                }
            }),
        })
    }
    get_lastVRTime(items) {
        var screated = items.screated ? items.screated.split(';') : [];
        var today = moment();
        var diff = moment(today).diff(screated[0], 'days', true);
        screated.map(value => {
            var diffi = moment(today).diff(value, 'days', true)
            if (diffi < diff) diff = diffi
        })
        return diff;
    }

    _con_law(row, returnObj = false) {
        let review_primal = row.review ?? row.reviewph;
        let asgin_primal = row.law_asign ?? row.ph_law_asign;
        let asigns = row.clock_asign_law ? row.clock_asign_law.split(';') : [];
        let reviews = row.clock_review_law_c ? row.clock_review_law_c.split(';') : [];
        let con1;
        let con2;
        let process = 1;
        let processIndex = 0;
        let lastR = null;
        let lastA = null;
        let rev = null;
        if (row.rec_rev == 0) process = 4;
        for (let i = 0; i < process; i++) {
            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                con2 = reviews[0] ? reviews[0] == null : review_primal == null;
                rev = reviews[0] ? reviews[0] : review_primal;
                if (con1 == null) lastR = rev;
            }
            else {
                con1 = asigns[i];
                con2 = reviews[i] == null;
                rev = reviews[i];
            }
            if (con1) processIndex = i;
            if (con1) lastR = rev;
            if (con1) lastA = con1
        }
        if (returnObj) return {
            process: clocks_process[processIndex],
            date_asign: lastA,
            max_date: dateParser_finalDate(lastA, _fun_0_type_days_matrix[row.type ?? 0][this.props.type])
        };
        if (lastA && lastR == null) return 1; // YES ASIGN, NO REVIEW
        return 0;
    }
    _con_arc(row, returnObj = false) {
        let review_primal = row.review ?? row.reviewph;
        let asgin_primal = row.arc_asign ?? row.ph_arc_asign;
        let asigns = row.clock_asign_arc ? row.clock_asign_arc.split(';') : [];
        let reviews = row.clock_review_arc_c ? row.clock_review_arc_c.split(';') : [];
        let con1;
        let con2;
        let process = 1;
        let processIndex = 0;
        let lastR = null;
        let lastA = null;
        let rev = null;
        if (row.rec_rev == 0) process = 4;
        for (let i = 0; i < process; i++) {
            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                con2 = reviews[0] ? reviews[0] == null : review_primal == null;
                rev = reviews[0] ? reviews[0] : review_primal;
                if (con1 == null) lastR = rev;
            }
            else {
                con1 = asigns[i];
                con2 = reviews[i] == null;
                rev = reviews[i];
            }
            if (con1) processIndex = i;
            if (con1) lastR = rev;
            if (con1) lastA = con1
        }
        if (returnObj) return {
            process: clocks_process[processIndex],
            date_asign: lastA,
            max_date: dateParser_finalDate(lastA, _fun_0_type_days_matrix[row.type ?? 0][this.props.type])
        };
        if (lastA && lastR == null) return 1; // YES ASIGN, NO REVIEW
        return 0;
    }
    _con_eng(row, returnObj = false) {
        let review_primal = [row.review, row.review_2];
        let asgin_primal = row.eng_asign;
        let asigns = row.clock_asign_eng ? row.clock_asign_eng.split(';') : [];
        let reviews = row.clock_review_eng_c ? row.clock_review_eng_c.split(';') : [];
        let con1;
        let con2;
        let process = 1;
        let processIndex = 0;
        let lastR = [null, null];
        let lastA = null;
        let rev = [null, null];
        if (row.rec_rev == 0) process = 4;
        for (let i = 0; i < process; i++) {
            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                let engr = reviews[0] ? reviews[0].split(',') : review_primal;
                con2 = engr[0] == null && engr[1] == null;
                if (!con2) lastR = engr;
                rev = engr
                if (con1 == null) lastR = engr;

            }
            else {
                con1 = asigns[i];
                let engr = reviews[i] ? reviews[i].split(',') : [null, null]
                con2 = engr[0] == null && engr[1] == null;
                if (!con2) lastR = engr;
                rev = engr
            }
            if (con1) processIndex = i;
            if (con1) lastA = con1
            if (con1) lastR = rev;
        }
        let con3 = lastR[0] == null && (lastR[1] == null || lastR[1] == 2)
       
        if (returnObj) return {
            process: clocks_process[processIndex],
            date_asign: lastA,
            max_date: dateParser_finalDate(lastA, _fun_0_type_days_matrix[row.type ?? 0][this.props.type])
        };
        if (lastA && con3) return 1; // YES ASIGN, NO REVIEW
        return 0;
    }

    get_obj(row) {
        if (this.props.type == 'law') return this._con_law(row, true)
        if (this.props.type == 'arc') return this._con_arc(row, true)
        if (this.props.type == 'eng') return this._con_eng(row, true)
    }
    render() {
        const { translation, globals, type } = this.props;
        const { currentItems, currentItems2 } = this.state;

        let get_reportBtn = item => {
            if (regexChecker_isPh(item, true)) return <MDBTooltip title='Ver Informe' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                <button
                    onClick={() => this.props.openModal(item, 'record_ph')}
                    className="px-2 btn-sm btn-warning btn"
                > <i class="fas fa-pencil-ruler fa-2x" ></i>
                </button> </MDBTooltip>

            if (type == 'law') return <MDBTooltip title='Ver Informe' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                <button
                    onClick={() => this.props.openModal(item, 'record_law')}
                    className="px-2 btn-sm btn-warning btn"
                > <i class="fas fa-balance-scale fa-2x" ></i>
                </button>
            </MDBTooltip>
            if (type == 'arc') return <MDBTooltip title='Ver Informe' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                <button
                    onClick={() => this.props.openModal(item, 'record_arc')}
                    className="px-2 btn-sm btn-warning btn"
                > <i class="far fa-building fa-2x" ></i>
                </button>
            </MDBTooltip>
            if (type == 'eng') return <MDBTooltip title='Ver Informe' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                <button
                    onClick={() => this.props.openModal(item, 'record_eng')}
                    className="px-2 btn-sm btn-warning btn"
                > <i class="fas fa-cogs fa-2x" ></i>
                </button>
            </MDBTooltip>
            return '';
        }
        let get_state_label = row => {
            if (row.state < -5) return <label className='text-danger fw-bold'>DES</label>
            if (row.state == -1 || row.state == 1) return <label className=''>RAD.</label>
            if (row.state >= 5 && row.state < 100) return <label className='text-primary'>LyDF</label>
            if (row.state >= 100) return <label className='text-sucCess fw-bold'>EXP</label>
        }

        let reviewNull = () => {
            return <MDBTypography note noteColor='danger'>
                <div className="row">
                    <div className="col-10">
                        <label className="fw-bold">SOLICITUDES SIN REVISAR: {currentItems.filter(item => item.state <= 50).length} (INFORME {type == 'law' ? 'JURIDICO' : type == 'eng' ? 'ESTRUCTURAL' : type == 'arc' ? 'ARQUITECTONICO' : ''})</label>
                    </div>
                    <div className="col text-end">
                        <MDBTooltip title='Detalles' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                            <MDBBtn
                                color="info"
                                size="sm"
                                onClick={() => this.setState({ lic_list: !this.state.lic_list })}
                                className="px-2"
                            > <i class="fas fa-info-circle fa-2x"></i>
                            </MDBBtn>
                        </MDBTooltip>
                    </div>
                </div>



                <MDBCollapse id='lic_list' isOpen={this.state.lic_list}>
                    <ul class="list-group mx-2">
                        {listMap(currentItems)}
                    </ul>
                </MDBCollapse>

            </MDBTypography>
        }
        let listMap = (list) => {
            let newList = [];
            list.filter(item => item.state <= 50).map(value => { newList.push(value) })
            const columns = [
                {
                    name: <label className="text-center"># RADICACION</label>,
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '140px',
                    cell: row => <label>{row.id_public}</label>
                },
                {
                    name: <label className="text-center">REV</label>,
                    selector: row => this.get_obj(row).process,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{this.get_obj(row).process}</label>
                },
                {
                    name: <label className="text-center">FECHA ASIGNACION</label>,
                    selector: row => this.get_obj(row).date_asign,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{this.get_obj(row).date_asign}</label>
                },
                {
                    name: <label className="text-center">FECHA LIMITE</label>,
                    selector: row => this.get_obj(row).max_date,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{this.get_obj(row).max_date}</label>
                },
                {
                    name: <label className="text-center">EST</label>,
                    selector: row => row.state,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => <label>{get_state_label(row)}</label>
                },
                {
                    name: <label className="text-center">CT</label>,
                    selector: row => row.type ?? 0,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '60px',
                    maxWidth: '60px',
                    cell: row => <label>{_fun_0_type[row.type ?? 0]}</label>
                },
                {
                    name: <label className="text-center">ULTIMO VR</label>,
                    center: true,
                    selector: row => this.get_lastVRTime(row),
                    sortable: true,
                    filterable: true,
                    minWidth: '100px',
                    cell: row => <label> {get_lastVR(row)}</label>,
                },
                {
                    name: <label className="text-center">ACCIÓN</label>,
                    button: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <>
                        {listItemPopOver(row)}
                        <MDBTooltip title='Informacion Solicitud' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                            <button
                                onClick={() => this.props.openModal(row, 'general')}
                                className="px-2 btn-sm btn-info btn"
                            > <i class="far fa-folder-open fa-2x" ></i>
                            </button>
                        </MDBTooltip>
                        {get_reportBtn(row)}
                    </>,
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY INFORMACION"
                striped="true"
                columns={columns}
                data={newList}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                noHeader
                dense
            />
        }
        let listItemPopOver = (items) => {
            var scodes = items.scodes ? items.scodes.split(';') : [];
            var sreview = items.sreview ? items.sreview.split(';') : [];
            var snames = items.snames ? items.snames.split('&&') : [];

            var vrs = items.vrs ? items.vrs.split(',') : [];
            var screated = items.screated ? items.screated.split(';') : [];
            var vrItem = [];
            vrs.map((value, i) => vrItem.push(
                {
                    title: value,
                    scodes: scodes[i],
                    sreview: sreview[i],
                    screated: screated[i],
                    snames: snames[i],
                }
            ))
            vrItem.sort((a, b) => new Date(b.screated) - new Date(a.screated));
            return <MDBPopover placement='left' dismiss poperStyle={{ height: 'auto', width: 400 }}
                btnChildren={<i class="fas fa-file-import fa-2x"></i>}
                btnClassName={'px-2 btn-sm btn-info btn mb-1 me-1'}>
                <MDBPopoverHeader>Ventanilla Única</MDBPopoverHeader>
                <MDBPopoverBody>{vrItem.map(value => listVR(value))}</MDBPopoverBody>
            </MDBPopover>
        }
        let listVR = (item) => {
            var scodes = item.scodes ? item.scodes.split(',') : [];
            var sreview = item.sreview ? item.sreview.split(',') : [];
            var snames = item.snames ? item.snames.split(';') : [];
            return <>
                <h6 className='fw-bold'>{item.title} | {item.screated}</h6>
                <ul>
                    {sreview.map((value, i) => {
                        if (value == 'SI') return <li><h6 className='text-muted'>{scodes[i]} {snames[i]}</h6></li>
                    })}
                </ul>
            </>
        }
        let get_lastVR = (items) => {
            var diff = this.get_lastVRTime(items)
            var days = Math.trunc(diff);
            var hours = Math.trunc(diff * 24) % 24;
            var mins = Math.trunc(diff * 24 * 60) % 60;
            var message = `${days} d, ${hours}:${mins < 10 ? '0' + mins : mins} h,`
            return <label className={days <= 3 ? 'text-success fw-bold' : ''}>{message}</label>
        }

        return (
            <div className="submit_x_fun  container">
                {currentItems.length > 0
                    ? <div className="row d-flex justify-content-center">
                        <div className="col-10">
                            {reviewNull()}
                        </div>
                    </div>
                    : ""}
            </div >
        );
    }
}

export default FUN_WORKER_ASIGN;
import { MDBBadge, MDBBtn, MDBPopover, MDBPopoverBody, MDBPopoverHeader, MDBTooltip, MDBTypography } from 'mdb-react-ui-kit';
import { MDBCollapse } from "mdbreact";
import moment from 'moment';
import React, { Component } from 'react';
import { dateParser_dateDiff, dateParser_finalDate, dateParser_timeLeft, formsParser1 } from '../../../components/customClasses/typeParse';
import FunService from '../../../services/fun.service';
import PqrsMainDataService from '../../../services/pqrs_main.service';
import Codes from '../../../components/jsons/fun6DocsList.json';
import DataTable from 'react-data-table-component';
import { nomens } from '../../../components/jsons/vars';

var momentB = require('moment-business-days');
class SUBMIT_X_FUN extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentItems: [],
            collapseID: false,
            load: false,
            incomplete: [],
        };
    }
    componentDidMount() {
        this.loadSubmit();
        if (this.props.type == "LIC") this.loadIcoplete();

    }
    componentDidUpdate(prevProps) {
        if (prevProps.listIncomplete != this.props.listIncomplete) this.loadIcoplete();
    }
    loadSubmit() {
        var end_date = moment().format('YYYY-MM-DD');
        var start_date = momentB(end_date, 'YYYY-MM-DD').businessSubtract(15)._d;
        start_date = moment(start_date).format('YYYY-MM-DD')

        if (this.props.type == "LIC") {
            FunService.loadSubmit2(start_date, end_date)
                .then(response => {
                    if (response.data.length) {
                        this.setState({
                            currentItems: response.data,
                            load: true,
                        })
                        var submitItems = [];
                        for (var i = 0; i < response.data.length; i++) {
                            submitItems.push(response.data[i].id)
                        }
                        this.props.setSubtmitRows(submitItems);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }
        if (this.props.type == "PQRS") {
            PqrsMainDataService.loadSubmit(start_date, end_date)
                .then(response => {
                    if (response.data.length) {
                        this.setState({
                            currentItems: response.data
                        })
                        var submitItems = [];
                        var incompleteItems = [];
                        for (var i = 0; i < response.data.length; i++) {
                            submitItems.push(response.data[i].id);
                            console.log(response.data[i])
                        }
                        this.props.setSubtmitRows(submitItems);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }

    }
    loadIcoplete() {
        FunService.getAll_incDocs()
            .then(response => {
                if (response.data.length) {
                    this.setState({ incomplete: response.data })
                }
            })
            .catch(e => {
                console.log(e);
            });
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
    render() {
        const { translation, globals, type, simple, hide } = this.props;
        const { currentItems, load, incomplete } = this.state;

        const docs6ToCheck = ['672', '6601', '6602', '6604', '6605', '6606', '6607', '6608', '681', '682', '685', '686', '687', '689', '916', '917', '918']
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
        let fatherValues_n = {
            61: ['511', '512', '513', '516', '517', '518', '519'],
            62: ['621', '601a', '622', '602a', '623', '601b', '602b', '624', '625', '626', '627', '601c', '602c'],
            63: ['630', '631', '632', '633',],
            64: ['641', '642', '643',],
            65: ['651', '652', '653',],
            66: ['6601', '6602', '6603', '6604', '6605', '911', '660a', '660b', '660c', '660d', '660e', '6607', '6608', '6609', '6610', '6611', '6612', '6613', '6614', '6615', '6616', '6617', '6618', '6619',],
            67: ['671', '672',],
            68: ['680', '681', '682', '683', '684', '685', '686', '687', '6862', '688', '689'],
        }

        let bluePrintBaget = (items) => {
            let _array_codes = items.scodes ? items.scodes.split(',') : [];
            let _array_names = items.snames ? items.snames.split(';') : [];
            let _array_reviews = items.sreview ? items.sreview.split(',') : [];
            let bluePrints = false;
            _array_reviews.map((review, i) => {
                if ((docs6ToCheck.includes(_array_codes[i]) || ((_array_names[i]).toLowerCase()).includes('plano')) && review == 'SI') {
                    bluePrints = true
                }
            })
            if (bluePrints === true) return <MDBBadge color="primary" className='mb-3'>PLANOS</MDBBadge>
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
            return <label className={days <= 2 ? 'text-success fw-bold' : ''}>{message}</label>
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
            return <MDBPopover placement='left' dismiss poperStyle={{ height: 'auto', width: '600px', minWidth: '600px' }}
                btnChildren={<i class="fas fa-file-import"></i>}
                btnClassName={'px-2 btn-sm btn-info btn mb-1 me-1'}>
                <MDBPopoverHeader>Ventanilla Única</MDBPopoverHeader>
                <MDBPopoverBody>{vrItem.map(value => listVR(value))}</MDBPopoverBody>
            </MDBPopover>
        }

        let listIncPopOver = (row) => {
            let vr_codes = row.vr_codes ? row.vr_codes.split(',') : [];
            let vr_checked = row.vr_checked ? row.vr_checked.split(',') : []

            let submited = [];
            vr_codes.map((code, i) => {
                if (vr_checked[i] == 'SI' && code) submited.push(code);
            })

            let codes = row.code ? row.code.split(',') : [];
            let checked = row.checked ? row.checked.split(',') : []

            let toSubmit = [];
            let inChecked = [];

            codes.map((code, i) => {
                if ((checked[i] == 1 || checked[i] == 0) && code) toSubmit.push(code);
                if (checked[i] === '1') inChecked.push(code)
            })


            return <MDBPopover placement='left' dismiss poperStyle={{ height: 'auto', width: '800px', minWidth: '800px' }}
                btnChildren={<i class="fas fa-file-import"></i>}
                btnClassName={'px-2 btn-sm btn-info btn mb-1 me-1'}>
                <MDBPopoverHeader>Documentos aportados</MDBPopoverHeader>
                <MDBPopoverBody>

                    <ul>
                        {toSubmit.map(code => {
                            let classColor = '';
                            if (submited.includes(code) && !inChecked.includes(code)) classColor = "text-warning"
                            if (inChecked.includes(code) && !submited.includes(code)) classColor = "text-warning"
                            if (inChecked.includes(code) && submited.includes(code)) classColor = "text-success"
                            return <li className={classColor}>
                                <label> <label className='fw-bold'>{code}</label> - {Codes[code]}  {inChecked.includes(code) ? <i class="fas fa-check-square text-dark"></i> : ''} {submited.includes(code) ? <i class="fas fa-file-import text-dark"></i> : ''}</label>
                            </li>
                        })}
                    </ul></MDBPopoverBody>
            </MDBPopover>
        }

        function processCodes(row) {
            let vr_codes = row.vr_codes ? row.vr_codes.split(',') : [];
            let vr_checked = row.vr_checked ? row.vr_checked.split(',') : []

            let submited = [];
            vr_codes.map((code, i) => {
                if (vr_checked[i] == 'SI' && code) submited.push(code);
            })

            let codes = row.code ? row.code.split(',') : [];
            let checked = row.checked ? row.checked.split(',') : []

            let toSubmit = [];
            let inChecked = [];
            let allCheckedCounter = 0;

            codes.map((code, i) => {
                if (checked[i] === '1' || checked[i] === '0') toSubmit.push(code);
                if (checked[i] === '1') inChecked.push(code)
                if (checked[i] === '1') allCheckedCounter++
            })

            let completed = 0;
            toSubmit.map(code => {
                if (submited.includes(code) || inChecked.includes(code)) completed++;
            })

            return { completed, toSubmit, inChecked, allCheckedCounter }
        }

        let _COMPONENT_LIST_DOCS_CHECK = (simple) => {
            const columns = [
                {
                    name: <label className="text-center"># RADICACION</label>,
                    selector: 'id_public',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    maxWidth: '150px',
                    cell: row => {
                        const { completed, toSubmit, inChecked, allCheckedCounter } = processCodes(row)
                        if (completed == toSubmit.length && completed != 0 && allCheckedCounter < toSubmit.length) return <div className='d-flex'><label>{row.id_public} <i class="fas fa-star text-muted"></i> </label></div>;
                        else if (completed == toSubmit.length && completed != 0 && allCheckedCounter >= toSubmit.length) return <div className='d-flex'><label>{row.id_public} <i class="fas fa-star text-warning"></i> </label></div>;
                        else return <label>{row.id_public}</label>;
                    }
                },
                {
                    name: <label className="text-center">DOCUMENTOS PARA LYDF</label>,
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => {
                        const { completed, toSubmit } = processCodes(row)
                        return <label className>{completed}/{toSubmit.length}</label>
                    }
                },
                {
                    name: <label className="text-center">MODALIDAD</label>,
                    selector: row => formsParser1(row),
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label className>{formsParser1(row)}</label>
                },
                {
                    name: <label className="text-center">FECHA LIMITE</label>,
                    selector: row => dateParser_finalDate(row.clocks_date, 30),
                    sortable: true,
                    filterable: true,
                    center: true,
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => <label className>{dateParser_finalDate(row.clocks_date, 30)}</label>
                },
                {
                    name: <label className="text-center">TIEMPO RESTANTE</label>,
                    selector: row => dateParser_timeLeft(row.clocks_date, 30),
                    sortable: true,
                    filterable: true,
                    center: true,
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => {
                        let timeLeft = dateParser_timeLeft(row.clocks_date, 30);
                        let timeOver = timeLeft < 0;
                        return <label><label className={timeOver ? 'text-danger fw-bold' : ''}>{timeLeft}</label> /30</label>
                    }
                },
                {
                    name: <label className="text-center">ACCIÓN</label>,
                    button: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <>
                        {listIncPopOver(row)}
                        <MDBTooltip title='Documentos' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                            <button
                                onClick={() => this.props.openModal({ ...row, version: 1 }, 'archive')}
                                className="px-1 btn-sm btn-secondary btn"
                            ><i class="fas fa-archive"></i>
                            </button>
                        </MDBTooltip>
                    </>,
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY ENTRADAS"
                striped="true"
                columns={columns}
                data={incomplete.filter(row => {
                    if (simple) {
                        const { completed, toSubmit, inChecked, allCheckedCounter } = processCodes(row)
                        return (completed == toSubmit.length && completed != 0)
                    }
                    return true
                })}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                title="LISTA DE DOCUMENTOS FALTANTES PARA LYDF"

                progressPending={!incomplete.length}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                defaultSortFieldId={1}

                dense
            />
        }

        let _COMPONENT_SUBMIT_LIST = () => {
            const columns = [
                {
                    name: <label className="text-center"># RADICACION</label>,
                    selector: 'id_public',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '140px',
                    cell: row => <label>{row.id_public}</label>
                },
                {
                    name: <label className="text-center">ESTADO</label>,
                    selector: 'state',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '160px',
                    cell: row => <label className={_fun_0_state_COLOR[row.state] ?? 'fw-bold'}>{_fun_0_state[row.state] ?? ''}</label>
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
                    name: '',
                    minWidth: '50px',
                    maxWidth: '50px',
                    cell: row => <label>  {bluePrintBaget(row)}</label>,
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
                                className="px-1 btn-sm btn-info btn"
                            > <i class="far fa-folder-open" ></i>
                            </button>
                        </MDBTooltip>
                    </>,
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY ENTRADAS"
                striped="true"
                columns={columns}
                data={currentItems}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                title="LISTA DE DOCUMENTOS ENTRANTES"

                progressPending={!load}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                defaultSortFieldId={3}

                dense
            />
        }

        let _COMPONENT_SIMPLE = () => {
            return <MDBTypography note noteColor='danger'>
                <div className="row">
                    <div className="col-10">
                        <label className="fw-bold">SOLICITUDES PARA DECLARAR EN LYDF</label>
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
                        {this.props.type == "LIC" ? _COMPONENT_LIST_DOCS_CHECK(simple) : ''}
                    </ul>
                </MDBCollapse>

            </MDBTypography>
        }

        // CHANGE ONE ROLE ID FOR 3 IN THE FUTURE IF IS NEEDED
        return simple && (window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 5) ?
            <div className="submit_x_fun  container">
                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        {_COMPONENT_SIMPLE()}
                    </div>
                </div>
            </div >

            : hide ? '' : <div className="submit_x_fun  container">
                <div className="row d-flex justify-content-center">
                    {this.props.type == "LIC" ? _COMPONENT_LIST_DOCS_CHECK() : ''}
                    {_COMPONENT_SUBMIT_LIST()}
                </div>
            </div >
    }
}

export default SUBMIT_X_FUN;
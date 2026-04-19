import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import DataTable from '@/components/data-table-bridge';
import { dateParser_finalDate, dateParser_timePassed, regexChecker_isOA_2, regexChecker_isPh } from '../../../../components/customClasses/typeParse';
import FunService from '../../../../services/fun.service';
import { Icon } from '@/components/icon';

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
function FUN_WORKER_ASIGN({ translation, globals, type, openModal }) {
        const [currentItems, setCurrentItems] = useState([]);
        const [currentItems2, setCurrentItems2] = useState([]);
        const [collapseID, setCollapseID] = useState(false);
        const [licList, setLicList] = useState(false);
        const [licList2, setLicList2] = useState(false);

    const get_lastVRTime = (items) => {
        var screated = items.screated ? items.screated.split(';') : [];
        var today = dayjs();
        var diff = dayjs(today).diff(screated[0], 'days', true);
        screated.map(value => {
            var diffi = dayjs(today).diff(value, 'days', true)
            if (diffi < diff) diff = diffi
        })
        return diff;
    }

    const _con_law = (row, returnObj = false) => {
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
            max_date: dateParser_finalDate(lastA, _fun_0_type_days_matrix[row.type ?? 0][type])
        };
        if (lastA && lastR == null) return 1; // YES ASIGN, NO REVIEW
        return 0;
    }
    const _con_arc = (row, returnObj = false) => {
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
            max_date: dateParser_finalDate(lastA, _fun_0_type_days_matrix[row.type ?? 0][type])
        };
        if (lastA && lastR == null) return 1; // YES ASIGN, NO REVIEW
        return 0;
    }
    const _con_eng = (row, returnObj = false) => {
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
            max_date: dateParser_finalDate(lastA, _fun_0_type_days_matrix[row.type ?? 0][type])
        };
        if (lastA && con3) return 1; // YES ASIGN, NO REVIEW
        return 0;
    }

    const get_obj = (row) => {
        if (type == 'law') return _con_law(row, true)
        if (type == 'arc') return _con_arc(row, true)
        if (type == 'eng') return _con_eng(row, true)
    }

    const asignList = (_LIST) => {
        var list1 = [];
        for (let i = 0; i < _LIST.length; i++) {
            const lItem = _LIST[i];
            var vrtime = get_lastVRTime(lItem);
            list1.push({ ...lItem, vrtime: vrtime });
        }
        list1 = [...list1].sort((a, b) => a.vrtime - b.vrtime)

        setCurrentItems(list1.filter(item => {
                if (type == 'law') {
                    if (_con_law(item) == 1) return true;
                }
                if (type == 'arc'  && !regexChecker_isOA_2(item)) {
                    if (_con_arc(item) == 1) return true;
                }
                if (type == 'eng' && !regexChecker_isOA_2(item)) {
                    if (_con_eng(item) == 1) return true;
                }
            }));
    }

    const load = () => {
        FunService.loadasign(window.user.id, type)
            .then(response => {
                if (response.data.length) {
                    asignList(response.data)
                }
            }).catch(e => {
                console.log(e);
            });
    }

    useEffect(() => {
        load();
    }, []);

        let get_reportBtn = item => {
            if (regexChecker_isPh(item, true)) return <button
                    onClick={() => openModal(item, 'record_ph')}
                    className="px-2 btn-sm btn-warning btn"
                > <Icon name="pencil-ruler" size={16} />
                </button>

            if (type == 'law') return <button
                    onClick={() => openModal(item, 'record_law')}
                    className="px-2 btn-sm btn-warning btn"
                > <Icon name="balance-scale" size={16} />
                </button>
            if (type == 'arc') return <button
                    onClick={() => openModal(item, 'record_arc')}
                    className="px-2 btn-sm btn-warning btn"
                > <Icon name="building" size={16} />
                </button>
            if (type == 'eng') return <button
                    onClick={() => openModal(item, 'record_eng')}
                    className="px-2 btn-sm btn-warning btn"
                > <Icon name="cogs" size={16} />
                </button>
            return '';
        }
        let get_state_label = row => {
            if (row.state < -5) return <label className='text-danger fw-bold'>DES</label>
            if (row.state == -1 || row.state == 1) return <label className=''>RAD.</label>
            if (row.state >= 5 && row.state < 100) return <label className='text-primary'>LyDF</label>
            if (row.state >= 100) return <label className='text-sucCess fw-bold'>EXP</label>
        }

        let reviewNull = () => {
            return <div className="alert alert-danger">
                <div className="row">
                    <div className="col-10">
                        <label className="fw-bold">SOLICITUDES SIN REVISAR: {currentItems.filter(item => item.state <= 50).length} (INFORME {type == 'law' ? 'JURIDICO' : type == 'eng' ? 'ESTRUCTURAL' : type == 'arc' ? 'ARQUITECTONICO' : ''})</label>
                    </div>
                    <div className="col text-end">
                        <span title="Detalles"><button type="button" className="btn"
                                color="info"
                                size="sm"
                                onClick={() => setLicList(!licList)}
                                className="px-2"
                            > <Icon name="info-circle" size={16} />
                            </button></span>
                    </div>
                </div>

                {licList && (
                    <ul className="list-group mx-2">
                        {listMap(currentItems)}
                    </ul>
                )}

            </div>
        }
        let listMap = (list) => {
            let newList = [];
            list.filter(item => item.state <= 50).map(value => { newList.push(value) })
            const columns = [
                {
                    name: '# Radicación',
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '140px',
                    cell: row => <span className="text-sm">{row.id_public}</span>
                },
                {
                    name: 'Rev',
                    selector: row => get_obj(row).process,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{get_obj(row).process}</span>
                },
                {
                    name: 'Fecha Asignación',
                    selector: row => get_obj(row).date_asign,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{get_obj(row).date_asign}</span>
                },
                {
                    name: 'Fecha Límite',
                    selector: row => get_obj(row).max_date,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{get_obj(row).max_date}</span>
                },
                {
                    name: 'Est',
                    selector: row => row.state,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => <span className="text-sm">{get_state_label(row)}</span>
                },
                {
                    name: 'CT',
                    selector: row => row.type ?? 0,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '60px',
                    maxWidth: '60px',
                    cell: row => <span className="text-sm">{_fun_0_type[row.type ?? 0]}</span>
                },
                {
                    name: 'Último VR',
                    center: true,
                    selector: row => get_lastVRTime(row),
                    sortable: true,
                    filterable: true,
                    minWidth: '100px',
                    cell: row => <label> {get_lastVR(row)}</label>,
                },
                {
                    name: 'Acción',
                    button: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <>
                        {listItemPopOver(row)}
                        <button
                                onClick={() => openModal(row, 'general')}
                                className="px-2 btn-sm btn-info btn"
                            > <Icon name="folder-open" size={16} />
                            </button>
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
            vrItem = [...vrItem].sort((a, b) => new Date(b.screated) - new Date(a.screated));
            return <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2 mb-1 me-1">
                        <Icon name="FileInput" size={16} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="left" className="w-[400px]">
                    <p className="font-semibold text-sm mb-2">Ventanilla Única</p>
                    {vrItem.map(value => listVR(value))}
                </PopoverContent>
            </Popover>
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
            var diff = get_lastVRTime(items)
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

export default FUN_WORKER_ASIGN;
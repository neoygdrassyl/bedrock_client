import { useEffect, useState } from 'react';
import FUN_SERVICE from '../../../../services/fun.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { formsParser1_exlucde2, regexChecker_isPh } from '../../../../components/customClasses/typeParse';
import DataTable from 'react-data-table-component';

const MySwal = withReactContent(Swal);
const moment = require('moment')

export default function FUN_ASIGNS_HISTORY_COMPONENT(props) {
    const { swaMsg, translation, globals, name, id, type } = props;

    var [clocks, setClocks] = useState([])
    var [ogClocks, setOgClocks] = useState([])
    var [load, setLoad] = useState(0)
    var [search, setSearch] = useState('')

    useEffect(() => {
        loadAsignClocks(id, type);
    }, [id]);


    // ***************************  DATA GETTERS *********************** //

    // *************************  DATA CONVERTERS ********************** //
    let PROCESS_DATA = (_data) => {
        let data = [];
        _data.map(item => {
            let asigns = "";
            let reviews = "";
            let results = "";
            let isPH = regexChecker_isPh(item, true)
            switch (type) {
                case 'law':
                    if (isPH) {
                        asigns = item.ph_law_asign || '';
                        reviews = item.dateph || '';
                        results = item.reviewph || '';
                    }
                    else {
                        asigns = item.clock_asign_law || '';
                        reviews = item.clock_review_law || '';
                        results = item.clock_review_law_c || '';
                    }
                    break;
                case 'eng':
                    asigns = item.clock_asign_eng || '';
                    reviews = item.clock_review_eng || '';
                    results = item.clock_review_eng_c || '';
                    break;
                case 'arc':
                    if (isPH) {
                        asigns = item.ph_arc_asign || '';
                        reviews = item.dateph || '';
                        results = item.reviewph || '';
                    }
                    else {
                        asigns = item.clock_asign_arc || '';
                        reviews = item.clock_review_arc || '';
                        results = item.clock_review_arc_c || '';
                    }
                    break;
            }

            asigns = asigns.split(';');
            reviews = reviews.split(';');
            results = String(results).split(';');

            asigns.map((asign, i) => {
                if (asign) data.push({
                    id_public: item.id_public,
                    type: formsParser1_exlucde2(item),
                    state: item.state,
                    asign: asign,
                    rew: reviews[i],
                    res: results[i],
                    study: type,
                })
            })
        })

        setClocks(data);
        setOgClocks(data);

    }
    let _GET_STATE_STR = (state, string = false) => {
        if (state < '-1') return string ? "DESISTIDO (Ejecución)" : <label className='text-danger text-center'>DESISTIDO (Ejecución)</label>
        if (state == '-1') return 'INCOMPLETO'
        if (state == '1') return 'INCOMPLETO'
        if (state == '5') return 'LYDF'
        if (state == '50') return 'EXPEDICIÓN'
        if (state == '100') return string ? "CERRADO" : <label className='fw-bold'>CERRADO</label>
        if (state == '101') return string ? "ARCHIVADO" : <label className='fw-bold text-primary'>ARCHIVADO</label>
        if (state == '200') return string ? "CERRADO (Desistido)" : <label className='fw-bold text-center'>CERRADO (Desistido)</label>
        if (state == '201') return string ? "DESISTIDO (Incompleto)" : <label className='text-danger text-center'>DESISTIDO (Incompleto)</label>
        if (state == '202') return string ? "DESISTIDO (No radicó valla)" : <label className='text-danger text-center'>DESISTIDO (No radicó valla)</label>
        if (state == '203') return string ? "DESISTIDO (No subsanó Acta)" : <label className='text-danger text-center'>DESISTIDO (No subsanó Acta)</label>
        if (state == '204') return string ? "DESISTIDO (No radicó pagos)" : <label className='text-danger text-center'>DESISTIDO (No radicó pagos)</label>
        if (state == '205') return string ? "DESISTIDO (Voluntario)" : <label className='text-danger text-center'>DESISTIDO (Voluntario)</label>
        return ''
    }
    let _GET_REVIEW = (_REVIEW) => {
        let res = {
            '-1': <label className=" me-1"><i class="far fa-dot-circle" style={{ fontSize: '150%' }}></i></label>,
            '0': <label className="fw-bold text-danger me-1"><i class="far fa-times-circle" style={{ fontSize: '150%' }}></i></label>,
            '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle" style={{ fontSize: '150%' }}></i></label>,
            '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle" style={{ fontSize: '150%' }}></i></label>,
        }
        return res[_REVIEW || 0]
    }
    let FILTER = () => {
        let search_value = document.getElementById('search_bar').value;
        let normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        search_value = normalize(search_value)

        if (!search_value) setClocks(ogClocks)
        else {
            let filter_list = ogClocks.filter(item => {
                let con_1 = item.id_public.includes(search_value);
                let con_2 = item.type ? normalize(item.type).includes(search_value) : false;
                let con_3 = normalize(_GET_STATE_STR(item.state, true)).includes(search_value);
                let con_4 = item.asign.includes(search_value);
                let con_5 = item.rew ? item.rew.includes(search_value) : false;

                return con_1 || con_2 || con_3 || con_4 || con_5;
            });
            setClocks(filter_list);
        }
    }
    // ******************************* JSX ***************************** // 
    let LIST_COMPONENT = () => {
        const columns = [
            {
                name: <label className="text-center">No. RADICACIÓN</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '180px',
                cell: row => <h6 className='fw-normal'>{row.id_public}</h6>
            },
            {
                name: <label className="text-center">TIPO</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                cell: row => <label>{row.type}</label>
            },
            {
                name: <label className="text-center">ESTADO</label>,
                selector: row => row.state,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '120px',
                cell: row => <>{_GET_STATE_STR(row.state)}</>
            },
            {
                name: <label className="text-center">ASIG.</label>,
                selector: row => row.asign,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{row.asign}</label>
            },
            {
                name: <label className="text-center">REV.</label>,
                selector: row => row.rew,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{row.rew}</label>
            },
            {
                name: <label className="text-center">RES.</label>,
                selector: row => row.res,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => row.study == "eng" ? String(row.res).split(',').map(res => _GET_REVIEW(res)) : _GET_REVIEW(row.res)
            },
        ]

        return <>
            <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY HISTORIAL"
                striped="true"
                columns={columns}
                data={clocks}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                noHeader
                dense
            />
        </>
    }
    let SEARCH_COMPONENT = () => {
        return <>
            <div className='row'>
                <div className='col'></div>
                <div className='col'>
                    <div class="input-group">
                        <input className='form-control' id="search_bar" placeholder='Buscar...'
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') FILTER() }} />
                        <div class="input-group-append">
                            {search ? <button class="btn btn-danger" type="button"
                                onClick={() => { setSearch(''); document.getElementById('search_bar').value = ''; FILTER() }}>X</button> : null}
                            <button class="btn btn-primary" type="button" onClick={() => FILTER()}>BUSCAR</button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    }
    // ******************************* APIS **************************** // 
    let loadAsignClocks = (_id, _type) => {
        FUN_SERVICE.loadasign(_id, _type)
            .then(response => {
                if (response.data) {
                    PROCESS_DATA(response.data)
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
            })
            .finally(() => setLoad(1));

    }

    return <>
        {SEARCH_COMPONENT()}
        {load == 1 ?
            clocks.length > 0 ?
                <>
                    {LIST_COMPONENT()}
                </>
                : <div className='row text-center' > <label className='fw-normal lead text-muted'>NO HAY HISTORIAL DE ASIGNACIONES</label></div>
            :
            < div className='row text-center' > <label className='fw-normal lead text-muted'>CARGANDO...</label></div>
        }
    </>
}



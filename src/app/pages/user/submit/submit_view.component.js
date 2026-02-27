import { useState, useEffect } from 'react';
import SubmitService from '../../../services/submit.service';
import { dateParser } from '../../../components/customClasses/typeParse';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Collapsible from 'react-collapsible';
import DataTable from 'react-data-table-component';


const MySwal = withReactContent(Swal);

function SUBMIT_SINGLE_VIEW({ translation, swaMsg, globals, id_related, setVRList }) {
    const [load, setLoad] = useState(false);
    const [curatedList, setCuratedListState] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        retrieveItem();
    }, []);

    function retrieveItem() {
        SubmitService.getIdRelated(id_related).then(response => {
            setCuratedList(response.data)
        })
    }

    function setCuratedList(List) {
        let newList = [];
        if(!List) return;
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
        setCuratedListState(newList);
        setLoad(true);
        if (setVRList) setVRList(newList);
    }

    const columns = [
        {
            name: <label className="text-center">VR</label>,
            selector: row => row.id_public,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label>{row.id_public}</label>
        },
        {
            name: <label className="text-center">FECHA</label>,
            selector: row => row.date,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label>{row.date}</label>
        },
        {
            name: <label className="text-center">HORA</label>,
            selector: row => row.time,
            sortable: true,
            filterable: true,
            center: true,
            minWidth: '60px',
            cell: row => <label>{(row.time)}</label>
        },
        {
            name: <label className="text-center">DOCUMENTO</label>,
            selector: row => row.name,
            sortable: true,
            filterable: true,
            minWidth: '400px',
            cell: row => <label>{(row.name)}</label>
        },
        {
            name: <label className="text-center">NOMEN.</label>,
            selector: row => row.category,
            sortable: true,
            filterable: true,
            center: true,
            minWidth: '60px',
            cell: row => <label>{(row.category)}</label>
        },
        {
            name: <label className="text-center">CODIGO</label>,
            selector: row => row.code,
            sortable: true,
            filterable: true,
            center: true,
            minWidth: '60px',
            cell: row => <label>{(row.code)}</label>
        },
        {
            name: <label className="text-center">FOLIOS</label>,
            selector: row => row.page,
            sortable: true,
            filterable: true,
            center: true,
            minWidth: '60px',
            cell: row => <label>{(row.page)}</label>
        },
    ]

    return (
        <div className="submit  container py-3">
            <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY SOLICITUDES"
                striped="true"
                columns={columns}
                dense

                load={load}
                progressPending={!load}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                defaultSortFieldId={2}
                defaultSortAsc={false}

                data={curatedList}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                noHeader
                onRowClicked={(e) => setSelectedRow(e.id)}
            />
        </div >
    );
}

export default SUBMIT_SINGLE_VIEW;
import React, { Component } from 'react';
import SubmitService from '../../../services/submit.service';
import { dateParser } from '../../../components/customClasses/typeParse';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Collapsible from 'react-collapsible';
import DataTable from 'react-data-table-component';


const MySwal = withReactContent(Swal);

class SUBMIT_SINGLE_VIEW extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
            load: false,
            curatedList: [],
        };
    }
    componentDidMount() {
        this.retrieveItem();
    }
    retrieveItem() {
        SubmitService.getIdRelated(this.props.id_related).then(response => {
            this.setCuratedList(response.data)
        })
    }
    setCuratedList(List) {
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
        this.setState({ curatedList: newList, load: true })
    };

    render() {
        const { translation, swaMsg, globals, id_related } = this.props;
        const { curatedList, load } = this.state;
        const columns = [
            {
                name: <label className="text-center">VR</label>,
                selector: 'id_public',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label className="text-center">FECHA</label>,
                selector: 'date',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.date}</label>
            },
            {
                name: <label className="text-center">HORA</label>,
                selector: 'time',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '60px',
                cell: row => <label>{(row.time)}</label>
            },
            {
                name: <label className="text-center">DOCUMENTO</label>,
                selector: 'name',
                sortable: true,
                filterable: true,
                minWidth: '400px',
                cell: row => <label>{(row.name)}</label>
            },
            {
                name: <label className="text-center">NOMEN.</label>,
                selector: 'category',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '60px',
                cell: row => <label>{(row.category)}</label>
            },
            {
                name: <label className="text-center">CODIGO</label>,
                selector: 'code',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '60px',
                cell: row => <label>{(row.code)}</label>
            },
            {
                name: <label className="text-center">FOLIOS</label>,
                selector: 'page',
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
                    onRowClicked={(e) => this.setState({ selectedRow: e.id })}
                />
            </div >
        );
    }
}

export default SUBMIT_SINGLE_VIEW;
import { useEffect, useState } from 'react';
import { MDBBtn, MDBTooltip } from '../../../../components/ui';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import ListJson from '../../../../components/jsons/fun6DocsList.json';
import './fun_modal_shared.css';


let _GET_DOCS_DATA = (filter) => {
    let data = [];
    for (var item in ListJson) {
        if (filter) {
            let v1 = ListJson[item].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let v2 = filter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (v1.includes(v2)) data.push({
                cod: item,
                desc: ListJson[item],
            })
        }
        else data.push({
            cod: item,
            desc: ListJson[item],
        })

    }
    return data;
}

function DOCS_LIST({ idRef, text, setValues }) {
    const [modalSearchList, setModalSearchList] = useState(false);
    const [filter, setFilter] = useState('');
    const [docsData, setDocsData] = useState(_GET_DOCS_DATA(filter));

    const customStylesForModal = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1050,
        },
        content: {
            position: 'absolute',
            top: '15%',
            left: 'var(--fun-sidebar-width)',
            right: '30%',
            bottom: '15%',
            border: '1px solid #ccc',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            marginRight: 'auto',

        }
    };

    const docsColumns = [
        {
            name: 'CODIGO',
            selector: row => row.cod,
            sortable: true,
            width: '100px',
        },
        {
            name: 'NOMBRE',
            selector: row => row.desc,
            sortable: true,
            wrap: true,
        },
        {
            name: 'ACCION',
            button: true,
            cell: row => <MDBTooltip title='Copiar informacion' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0">
                <button className="btn btn-sm btn-info m-0 p-2 shadow-none" onClick={() => _COPY_INFO(row)}>
                    <i className="far fa-copy fa-2x"></i></button></MDBTooltip>,
        }
    ]


    let toggle = (id) => {
        setModalSearchList(prev => !prev);
    }
    let _COPY_INFO = (_data) => {
        setValues(idRef, [_data.cod, _data.desc])
        setModalSearchList(false)
    }

    useEffect(() => {
        setDocsData(_GET_DOCS_DATA(filter))
    }, [filter]);

    return (
        <div>
            <MDBBtn className="btn btn-info shadow-none" id={idRef} onClick={(e) => toggle(e.target.id)}><i className="fas fa-th-list"></i> {text}</MDBBtn>
            <Modal contentLabel="GENERAL VIEW FUN"
                isOpen={modalSearchList}
                style={customStylesForModal}
                ariaHideApp={false}
            >

                <div className="my-4 d-flex justify-content-between">
                    <label><i className="fas fa-th-list"></i> CODIGOS TIPOLOGIA DOCUMENTAL</label>
                    <input className="form-control form-control-sm" id="code_list_filter" onChange={(v) => setFilter(v.target.value)} />
                    <MDBBtn className='btn-close' color='none' onClick={toggle}></MDBBtn>
                </div>
                <DataTable
                    striped
                    columns={docsColumns}
                    data={docsData}
                    pagination
                    paginationPerPage={10}
                    paginationComponentOptions={{ rowsPerPageText: 'Mostrar entradas', rangeSeparatorText: 'de' }}
                    dense
                    highlightOnHover
                    noDataComponent="No hay datos"
                />
                <div className="text-end py-4 mt-3">
                    <MDBBtn className="btn btn-lg btn-info" onClick={() => setModalSearchList(false)}><i className="fas fa-times-circle"></i> CERRAR</MDBBtn>
                </div>
            </Modal>

        </div>
    );
}

export default DOCS_LIST;
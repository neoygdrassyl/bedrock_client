import { Component } from 'react';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import ListJson from '../../../../components/jsons/fun6DocsList.json';
import './fun_modal_shared.css';



class DOCS_LIST extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_searchList: false,
        };
    }

    render() {
        const { idRef, text } = this.props;
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
        let _GET_DOCS_DATA = () => {
            let data = [];
            for (var item in ListJson) {
                data.push({
                    cod: item,
                    desc: ListJson[item],
                })
            }
            return data;
        }
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
                        <i class="far fa-copy fa-2x"></i></button></MDBTooltip>,
            }
        ]
        const docsData = _GET_DOCS_DATA();

        let toggle = (id) => {
            this.setState({
                modal_searchList: !this.state.modal_searchList,
                modal_id: id
            });
        }
        let _COPY_INFO = (_data) => {
            this.props.setValues(idRef, [_data.cod, _data.desc])
            this.setState({ modal_searchList: false })
        }
        return (
            <div>
                <MDBBtn className="btn btn-info shadow-none" id={idRef} onClick={(e) => toggle(e.target.id)}><i class="fas fa-th-list"></i> {text}</MDBBtn>
                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={this.state.modal_searchList}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >

                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-th-list"></i> CODIGOS TIPOLOGIA DOCUMENTAL</label>
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
                        <MDBBtn className="btn btn-lg btn-info" onClick={() => this.setState({ modal_searchList: false })}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
                    </div>
                </Modal>

            </div>
        );
    }
}

export default DOCS_LIST;
import { useState } from 'react';

import DataTable from 'react-data-table-component';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import ListJson from '../../../../components/jsons/fun6DocsList.json';
import './fun_modal_shared.css';
import { Icon } from '@/components/icon';

function DOCS_LIST({ idRef, text, setValues }) {
        const [modalSearchList, setModalSearchList] = useState(false);
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
                cell: row => <button title="Copiar informacion" className="btn btn-sm btn-info m-0 p-2 shadow-none" onClick={() => _COPY_INFO(row)}>
                        <Icon name="copy" size={16} /></button>,
            }
        ]
        const docsData = _GET_DOCS_DATA();

        let toggle = (id) => {
            setModalSearchList(prev => !prev);
        }
        let _COPY_INFO = (_data) => {
            setValues(idRef, [_data.cod, _data.desc])
            setModalSearchList(false)
        }
        return (
            <div>
                <button type="button" className="btn btn-info shadow-none" id={idRef} onClick={(e) => toggle(e.target.id)}><Icon name="th-list" size={16} /> {text}</button>
                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={modalSearchList}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >

                    <div className="my-4 d-flex justify-content-between">
                        <label><Icon name="th-list" size={16} /> CODIGOS TIPOLOGIA DOCUMENTAL</label>
                        <button type="button" className="btn-close" onClick={toggle} />
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
                        <button type="button" className="btn btn-lg btn-info" onClick={() => setModalSearchList(false)}><Icon name="times-circle" size={16} /> CERRAR</button>
                    </div>
                </Modal>

            </div>
        );
}

export default DOCS_LIST;
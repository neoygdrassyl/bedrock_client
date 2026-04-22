import { useState } from 'react';

import DataTable from '@/components/data-table-bridge';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import ListJson from '../../../../components/jsons/fun6DocsList.json';
import './fun_modal_shared.css';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';

function DOCS_LIST({ idRef, text, setValues }) {
        const [modalSearchList, setModalSearchList] = useState(false);
        const customStylesForModal = {};
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
                cell: row => <Button size="sm" className="m-0 p-2" title="Copiar informacion" onClick={() => _COPY_INFO(row)}>
                        <Icon name="copy" size={16} /></Button>,
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
                <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors" id={idRef} onClick={(e) => toggle(e.target.id)}><Icon name="th-list" size={16} /> {text}</button>
                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={modalSearchList}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >

                    <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                <Icon name="th-list" size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold tracking-tight">Códigos tipología documental</h2>
                        </div>
                        <button type="button" onClick={toggle} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                            <Icon name="X" size={16} className="text-muted-foreground" />
                        </button>
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
                    <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                        <Button variant="outline" size="sm" onClick={() => setModalSearchList(false)}><Icon name="X" size={14} /> Cerrar</Button>
                    </div>
                </Modal>

            </div>
        );
}

export default DOCS_LIST;
import { Button } from '@/shared/ui/button';
import Icon from '@/shared/components/icon';

import { cities, domains_number } from '../../../../../shared/config/jsons/vars';
import { swalClose, swalError, swalLoading } from '@/shared/utils/swalAdapter';
import fileDownload from 'js-file-download';
import { useDocumentaryInventory } from '../../expediente_documental/hooks/useDocumentaryInventory';
import { inventoryBlocker } from '../../expediente_documental/documentaryInventoryModel';
import { buildChecklistPdf } from './checklistPdf';

function FUN_PDF_CHECK({ currentItem, currentVersion, swaMsg }) {
    // Canonical expedientes take requirement statuses from the documentary inventory (null for legacy).
    const documentaryInventory = useDocumentaryInventory(currentItem);

    const _GET_CHILD_REVIEW = () => {
        var _CHILD = currentItem.fun_rs;
        var _CURRENT_VERSION = currentVersion - 1;
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD = _CHILD[_CURRENT_VERSION]
            } else {
                _CHILD = false
            }
        }
        if (documentaryInventory?.inventory) return documentaryInventory.inventory.funReview(_CHILD);
        return _CHILD;
    }

    const getPdfForm = async () => {
        const blocker = inventoryBlocker(documentaryInventory);
        if (blocker) return swalError({ title: swaMsg.generic_eror_title, text: blocker });
        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

        const pdfBytes = await buildChecklistPdf({
            currentItem,
            currentVersion,
            review: _GET_CHILD_REVIEW(),
            city: document.getElementById('func_pdf_0_2').value,
            number: document.getElementById('func_pdf_0_1').value,
            swaMsg,
        });
        if (!pdfBytes) return;

        fileDownload(pdfBytes, 'FORMULARIO DE REVISION GENERAL' + currentItem.id_public + '.pdf');
        swalClose();
    }

        return (
            <div className="py-3">
                <div className="row mb-3">
                    <div className="col-6">
                        <label>Autoridad Competente</label>
                        <div className="input-group my-1">
                            <select className="form-select me-1" id={"func_pdf_0_1"}>
                                {domains_number}
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Ciudad</label>
                        <div className="input-group my-1">
                            <select className="form-select me-1" id={"func_pdf_0_2"}>
                                {cities}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-3 text-center">
                    <div className="col-12">
                        <Button variant="destructive" size="sm" className="my-3" onClick={() => getPdfForm()}><Icon name="file-pdf" size={16} /> DESCARGAR FORMULARIO</Button>
                    </div>
                </div>
            </div>
        );
}

export default FUN_PDF_CHECK;

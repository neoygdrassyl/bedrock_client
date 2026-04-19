import Collapsible from '../../../../components/Collapsible';
import PQRS_PDFGEN_CONFIRM from './pqrs_genPDF_confirm.component';
import PQRS_PDFGEN_REPLY from './pqrs_genPDF_reply.component';

import dayjs from 'dayjs';
function PQRS_COMPONENT_ATTACH_SPECIAL({ translation, swaMsg, globals, currentItem }) {

        return (
            <div>
                <Collapsible className="bg-success" trigger={<label className="m-2 text-uppercase">Generar Documento de Confirmación</label>}>
                    <PQRS_PDFGEN_CONFIRM
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                    />
                </Collapsible>
                {currentItem.id_reply
                ? <>
                <Collapsible className="bg-success" trigger={<label className="m-2 text-uppercase">Generar Documento Oficio de Respuesta</label>}>
                    <PQRS_PDFGEN_REPLY
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                    />
                </Collapsible>
                </>
                :""}
                
            </div>
        );
}

export default PQRS_COMPONENT_ATTACH_SPECIAL;
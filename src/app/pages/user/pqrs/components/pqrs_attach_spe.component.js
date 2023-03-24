import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Collapsible from 'react-collapsible';
import PQRS_PDFGEN_CONFIRM from './pqrs_genPDF_confirm.component';
import PQRS_PDFGEN_REPLY from './pqrs_genPDF_reply.component';

const moment = require('moment');
const MySwal = withReactContent(Swal);
class PQRS_COMPONENT_ATTACH_SPECIAL extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

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
}

export default PQRS_COMPONENT_ATTACH_SPECIAL;
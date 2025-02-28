import Modal from 'react-modal'
import { pqrsResponseStyles } from '../../../utils/styles/modalStyles';
import { configForUniqueResponse } from '../../../utils/config/joditConfig';
import JoditEditor from "jodit-pro-react";
import new_Pqrs_Service from "../../../../../../../services/new_pqrs.service"
import { useRef, useState } from 'react';
const PqrsResponseModal = ({ responseType, modalOpen, setModalOpen, selectedPqrs }) => {
    const editorRef = useRef(null)
    const [responseData, setResponseData] = useState('')

    const handleSubmit = async () => {
        if (responseData === '') {
            alert("Por favor, escribe una respuesta antes de enviar.");
            return;
        }
        try {
            console.log(responseData, responseType, selectedPqrs.id)
            const data = new FormData()
            data.append('response_name', responseType);
            data.append('data', responseData);
            const res = await new_Pqrs_Service.updateResponse(selectedPqrs.id, data);
            if (res) {
                console.log(res)
            }
            alert("Respuesta enviada con éxito.");
            setModalOpen(false); // Close modal after submission
        } catch (error) {
            console.error("Error al enviar la respuesta:", error);
            alert("Hubo un error al enviar la respuesta.");
        }
    };
    return (
        <Modal contentLabel="RESPONDER SOLCITUD PQRS"
            isOpen={modalOpen}
            style={pqrsResponseStyles}
            ariaHideApp={false}>
            <div className="my-4 d-flex justify-content-between">

                <h2>RESPONDER SOLICITUD PQRS {selectedPqrs.id_public}</h2>

                <div className='btn-close' color='none' onClick={() => setModalOpen(false)}></div>
            </div>
            <JoditEditor
                config={configForUniqueResponse}
                ref={editorRef}
                onBlur={(value) => setResponseData(value)}

            />

            {/* // ref={editor3}
                // value={editorContent.response_arquitecture}
                // onBlur={(value) => handleJoditChange("response_arquitecture", value)} /> */}


            <div className="text-end py-4 mt-3">
                <button className="btn btn-lg btn-success me-2" onClick={handleSubmit}>
                    <i className="fas fa-paper-plane"></i> ENVIAR RESPUESTA
                </button>
                <button className="btn btn-lg btn-info" onClick={() => setModalOpen(false)}><i class="fas fa-times-circle"></i> CERRAR </button>
            </div>
        </Modal>


    );
};

export default PqrsResponseModal;
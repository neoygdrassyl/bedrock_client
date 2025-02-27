import { useState } from 'react';
import {
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardHeader,
    MDBInput,
    MDBBtn,
    MDBTypography
} from 'mdb-react-ui-kit';
import { _GET_LAST_ID } from '../utils/helpers/verifyVR';

export default function PQRSMiniForm({ continueToForm, setData }) {
    const [formData, setFormData] = useState({
        id_public: '',
        canalIngreso: '',
        creation_date: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        continueToForm();
        console.log(formData);
        setData(formData);
    };

    return (
        <MDBCard className="mx-auto" style={{ maxWidth: '500px' }}>
            <MDBCardHeader>
                <MDBTypography tag='h5' className='mb-0'>Formulario PQRS</MDBTypography>
            </MDBCardHeader>
            <MDBCardBody>
                <form onSubmit={handleSubmit}>
                    <MDBRow className='mb-4'>
                        <MDBCol>
                            <label className='form-label' htmlFor='vr'>Número</label>
                            <div className='d-flex w-100 gap-2'>
                                <div className="flex-grow-1">
                                    <MDBInput
                                        label='VR (Ventanilla de Radicación)'
                                        id='vr'
                                        type='text'
                                        name='id_public'
                                        value={formData.id_public}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-info shadow-none"
                                    style={{ whiteSpace: "nowrap" }}
                                    onClick={() => _GET_LAST_ID(setFormData)}
                                >
                                    GENERAR
                                </button>
                            </div>
                        </MDBCol>

                    </MDBRow>

                    <MDBRow className='mb-4'>
                        <MDBCol>
                            <div className="form-outline">
                                <label className="form-label" htmlFor="canalIngreso">Canal de Ingreso</label>
                                <select
                                    className="form-select"
                                    id='canalIngreso'
                                    name='canalIngreso'
                                    value={formData.canalIngreso}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="" disabled>Seleccione un canal</option>
                                    <option value="Correo Electrónico">Correo Electrónico</option>
                                    <option value="Ventanilla">Ventanilla</option>
                                    <option value="Teléfono">Teléfono</option>
                                    <option value="Sitio Web">Sitio Web</option>
                                </select>
                            </div>
                        </MDBCol>
                    </MDBRow>

                    <MDBRow className='mb-4'>
                        <MDBCol>
                            <label className='form-label' htmlFor='fechaRadicacion'>Fecha de Radicación</label>
                            <MDBInput
                                id='fechaRadicacion'
                                type='date'
                                name='creation_date'
                                value={formData.creation_date}
                                onChange={handleInputChange}
                                required
                                min={new Date().toLocaleDateString('en-CA')} // past disabled
                            />
                        </MDBCol>
                    </MDBRow>

                    <MDBBtn type='submit' className='mb-4' block>
                        Siguiente
                    </MDBBtn>
                </form>
            </MDBCardBody>
        </MDBCard>
    );
}


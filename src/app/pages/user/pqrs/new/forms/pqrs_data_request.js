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

export default function PQRSMiniForm({continueToForm , setData}) {
    const [formData, setFormData] = useState({
        vr: '',
        canalIngreso: '',
        fechaRadicacion: ''
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
                            <label className='form-label' htmlFor='fechaRadicacion'>Número</label>
                            <MDBInput
                                label='VR (Ventanilla de Radicación)'
                                id='vr'
                                type='text'
                                name='vr'
                                value={formData.vr}
                                onChange={handleInputChange}
                                required
                            />
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
                                    <option value="1">Correo Electrónico</option>
                                    <option value="2">Ventanilla</option>
                                    <option value="3">Teléfono</option>
                                    <option value="4">Sitio Web</option>
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
                                name='fechaRadicacion'
                                value={formData.fechaRadicacion}
                                onChange={handleInputChange}
                                required
                            />
                        </MDBCol>
                    </MDBRow>

                    <MDBBtn type='submit' className='mb-4' block>
                        Enviar
                    </MDBBtn>
                </form>
            </MDBCardBody>
        </MDBCard>
    );
}


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
        id_public: '',
        canalIngreso: '',
        date: ''
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
                                name='id_public'
                                value={formData.id_public}
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
                                name='date'
                                value={formData.date}
                                onChange={handleInputChange}
                                required
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


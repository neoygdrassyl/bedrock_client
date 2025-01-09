import { useEffect, useState } from "react";
import TranslationComponent from "./components/pqrs_translation.component";
import PetitionerComponent from "./components/pqrs_petitioner.component";
import ValidationComponent from "./components/pqrs_validation.component";
import ProcessControl from "./components/pqrs_management.component";
import ClasificationComponent from "./components/pqrs_clasification.component";
import ClasificationTermComponent from "./components/pqrs_clasification_2.component";

const PQRS = () => {
    const [currentItem, setCurrentItem] = useState()
    const [formData, setFormData] = useState({
    });
    useEffect(() => {
        // pqrs_mainService.get()
    }, [])
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        // Lógica para enviar datos al backend
    };

    // const [pqrs, setPqrs] = useState([])


    return (
        <form className="container my-4" onSubmit={handleSubmit}>
            <div className="card">
                {/* Header Section */}
                <div className="card-header p-4 bg-primary text-white">
                    <div className="row">
                        <div className="col-md-8">
                            <h4 className="mb-0">CONTROL ADMINISTRATIVO A LA PQRS- VR24-3526</h4>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <span className="badge bg-success fs-6">ABIERTA</span>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <small>Informe No: 1</small><br />
                            <small>Canal de Ingreso / Presentación: Correo Electrónico</small>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <small>Fecha de actualización: DD/MM/AA</small><br />
                            <small>Fecha de radicación: 12/01/2024</small>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {/* Petitioner Information Section */}
                    <PetitionerComponent formData={formData} onChange={handleChange} />
                    {/* Description Section */}
                    <div className="mb-4">
                        <h4 className="border-bottom p-2">DESCRIPCION DEL ASUNTO DE LA SOLICITUD</h4>
                        <div className="mb-3">
                            <label className="form-label">Hechos</label>
                            <textarea
                                name="desc"
                                className="form-control"
                                rows={4}
                                value={formData.desc}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Validation Section */}
                    <ValidationComponent formData={formData} onChange={handleChange} />

                    <div className="mb-4">
                        <h5 className="border p-2">
                            Art 21. Ley 1755/2015. Funcionario sin competencia. Entidades a las que se hace el traslado (1). Correspondencia se debe enviar dentro de los 5 días siguientes a radicación
                        </h5>
                        <TranslationComponent formData={formData} onChange={handleChange} />
                    </div>
                    <ClasificationComponent formData={formData} onChange={handleChange} />
                    <ClasificationTermComponent formData={formData} onChange={handleChange} />
                    <ProcessControl formData={formData} onChange={handleChange} />
                    <pre>{JSON.stringify(formData, null, 2)}</pre>

                    <button type="submit" className="btn btn-primary">Enviar</button>

                </div>
            </div>
        </form>
    )
}
export default PQRS


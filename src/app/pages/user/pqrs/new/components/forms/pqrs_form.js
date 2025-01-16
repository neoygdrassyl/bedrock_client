import {  useState } from "react";
import TranslationComponent from "../pqrs_translation.component";
import PetitionerComponent from "../pqrs_petitioner.component";
import ValidationComponent from "../pqrs_validation.component";
import ProcessControl from "../pqrs_management.component";
import ClasificationComponent from "../pqrs_clasification.component";
import ClasificationTermComponent from "../pqrs_clasification_2.component";
import new_pqrsService from "../../../../../../services/new_pqrs.service";
import useProcessControl from "../../hooks/useProcessControl";

const PqrsForm = () => {
    const [currentItem, setCurrentItem] = useState()
    const [formData, setFormData] = useState({
        document_type: "C.C."
    });
    const { control, handleControlChange, processControlData } = useProcessControl();
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const controlData = processControlData();
        const combinedData = { ...formData, controlData };
        console.log("Form Data:", combinedData);

        let data = new FormData()
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });
        data.append('controlData', JSON.stringify(controlData));
        
        console.log(data)
        const res = await new_pqrsService.create(data)
        alert("Registro exitoso")
        console.log(res)
    };


    return (
        <form className="my-4" onSubmit={handleSubmit}>
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
                        <div className="mb-3">
                            <label className="form-label">Peticiones</label>
                            <textarea
                                name="petition"
                                className="form-control"
                                rows={3}
                                value={formData.petition}
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
                    <ProcessControl formData={control} onChange={handleControlChange} />
                    <pre>{JSON.stringify(formData, null, 2)}</pre>

                    <button type="submit" className="btn btn-primary">Enviar</button>

                </div>
            </div>
        </form>
    )
}
export default PqrsForm


import { useEffect, useState } from "react";
import TranslationComponent from "../components/pqrs_form/pqrs_translation.component";
import PetitionerComponent from "../components/pqrs_form/pqrs_petitioner.component";
import ValidationComponent from "../components/pqrs_form/pqrs_validation.component";
import ProcessControl from "../components/pqrs_form/pqrs_management.component";
import ClasificationComponent from "../components/pqrs_form/pqrs_clasification.component";
import ClasificationTermComponent from "../components/pqrs_form/pqrs_clasification_2.component";
import new_pqrsService from "../../../../../services/new_pqrs.service";
import useProcessControl from "../hooks/useProcessControl";

const PqrsForm = ({ id }) => {

    const [isLoaded, setLoading] = useState(false)
    const [initialData, setInitialData] = useState({})
    useEffect(() => {
        const getData = async (id) => {
            try {
                const res = await new_pqrsService.getById(id);
                if (res) {
                    setInitialData(res.data);
                    setLoading(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(true)
            }
        };
        getData(id);
    }, [id]);
    console.log(initialData)
    const [formData, setFormData] = useState({
        // extract all the data
        document_type: "C.C.",
        status: initialData.status ?? "ABIERTO",
        date: initialData.date,
        id_public: initialData.id_public,
        canalIngreso: initialData.canalIngreso,
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
        <>
            {
                isLoaded ? <form className="my-4" onSubmit={handleSubmit}>
                    <div className="card">
                        {/* Header Section */}
                        <div className="card-header p-4 bg-primary text-white">
                            <div className="row">
                                <div className="col-md-8">
                                    <h4 className="mb-0">CONTROL ADMINISTRATIVO A LA PQRS- {formData.id_public}</h4>
                                </div>
                                <div className="col-md-4 text-md-end">
                                    <span className="badge bg-success fs-6">ABIERTA</span>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <small>Informe No: 1</small><br />
                                    <small>Canal de Ingreso / Presentación: {formData.canalIngreso}</small>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <small>Fecha de actualización: DD/MM/AA</small><br />
                                    <small>Fecha de radicación: {initialData.createdAt ?? formData.date}</small>
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
                                        defaultValue={initialData.desc ?? formData.desc}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Peticiones</label>
                                    <textarea
                                        name="petition"
                                        className="form-control"
                                        rows={3}
                                        defaultValue={initialData.petition ?? formData.petition}
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
                            <ProcessControl initialData={initialData.new_pqrs_controls} formData={control} onChange={handleControlChange} />
                            <pre>{JSON.stringify(formData, null, 2)}</pre>

                            <button type="submit" className="btn btn-primary">Enviar</button>

                        </div>
                    </div>
                </form>
                    : <div>Loading...</div>
            }
        </>


    )
}
export default PqrsForm


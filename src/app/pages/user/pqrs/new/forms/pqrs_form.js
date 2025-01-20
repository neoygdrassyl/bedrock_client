import { useEffect, useState } from "react";
// import PetitionerComponent from "../components/pqrs_form/pqrs_petitioner.component";
import ValidationComponent from "../components/pqrs_form/pqrs_validation.component";
import ProcessControl from "../components/pqrs_form/pqrs_management.component";
import ClasificationComponent from "../components/pqrs_form/pqrs_clasification.component";
import ClasificationTermComponent from "../components/pqrs_form/pqrs_clasification_2.component";
import new_pqrsService from "../../../../../services/new_pqrs.service";
import useProcessControl from "../hooks/useProcessControl";
import PetitionerForm from "../components/pqrs_form/pqrs_petitioner_form";
import TransferForm from "../components/pqrs_form/pqrs_transfer_form";

const PqrsForm = ({ id, creationData }) => {

    const [isLoaded, setIsLoaded] = useState(false)
    const [initialData, setInitialData] = useState(null)
    useEffect(() => {
        const getData = async () => {
            try {
                if (id) {
                    const res = await new_pqrsService.getById(id);
                    if (res?.data) {
                        setInitialData(res.data);
                    }
                } else {
                    console.log(creationData);
                    setInitialData(creationData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoaded(true); // Ensure loading is stopped after fetch
            }
        };

        getData();
    }, [id, creationData]);
    //setData
    useEffect(() => {
        console.log("entra")
        if (initialData) {
            setFormData({
                document_type: "C.C.",
                status: initialData.status ?? "ABIERTA",
                creation_date: initialData.creation_date,
                id_public: initialData.id_public,
                canalIngreso: initialData.canalIngreso,
                desc: initialData.desc ?? "",
                petition: initialData.petition ?? ""
            });
        }
    }, [initialData]); 
    // overall data
    const [formData, setFormData] = useState({});
    //data from management
    const { control, handleControlChange, processControlData } = useProcessControl();
    //data from petitioners
    const [petitioners , setPetitioners] = useState({});
    //data from translations
    const [transfers , setTranfers] = useState({});


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

        let data = new FormData()
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });
        data.append('controlData', JSON.stringify(controlData));
        data.append('petitioners', JSON.stringify(petitioners));
        data.append('transfers', JSON.stringify(transfers));


        console.log(data.get('transfers'));
        // const res = await new_pqrsService.create(data)
        alert("Registro exitoso")
        // console.log(res)
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
                                    <span className="badge bg-success fs-6">{formData.status}</span>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <small>Informe No: 1</small><br />
                                    <small>Canal de Ingreso / Presentación: {formData.canalIngreso}</small>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <small>Fecha de actualización: DD/MM/AA</small><br />
                                    <small>Fecha de radicación: {formData.creation_date}</small>
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Petitioner Information Section */}
                            {/* <PetitionerComponent formData={formData} onChange={handleChange} /> */}
                            <PetitionerForm setFormData={setPetitioners} loadedPetitioners={initialData.new_pqrs_petitioners}/>

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
                            <ValidationComponent initialData={initialData.new_pqrs_evaluation} formData={formData} onChange={handleChange} />

                            <div className="mb-4">
                                <h5 className="border p-2">
                                    Art 21. Ley 1755/2015. Funcionario sin competencia. Entidades a las que se hace el traslado (1). Correspondencia se debe enviar dentro de los 5 días siguientes a radicación
                                </h5>
                                <TransferForm setFormData={setTranfers} loadedTranslations={initialData.new_pqrs_translation}/>
                                {/* <TranslationComponent formData={formData} onChange={handleChange} /> */}
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


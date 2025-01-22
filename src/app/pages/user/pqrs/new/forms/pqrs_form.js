import { useEffect, useState, useRef } from "react";
// import PetitionerComponent from "../components/pqrs_form/pqrs_petitioner.component";
import ValidationComponent from "../components/pqrs_form/pqrs_validation.component";
import ProcessControl from "../components/pqrs_form/pqrs_management.component";
import ClasificationComponent from "../components/pqrs_form/pqrs_clasification.component";
import ClasificationTermComponent from "../components/pqrs_form/pqrs_clasification_2.component";
import new_pqrsService from "../../../../../services/new_pqrs.service";
import useProcessControl from "../hooks/useProcessControl";
import PetitionerForm from "../components/pqrs_form/pqrs_petitioner_form";
import TransferForm from "../components/pqrs_form/pqrs_transfer_form";
import Collapsible from 'react-collapsible';
import JoditEditor from "jodit-pro-react";


const PqrsForm = ({ id, creationData }) => {
    // overall data
    const [formData, setFormData] = useState({});
    //data from management
    const { control, handleControlChange, processControlData } = useProcessControl();
    //data from petitioners
    const [petitioners, setPetitioners] = useState({});
    //data from translations
    const [transfers, setTranfers] = useState({});
    //data from Jodit Editor (responses)
    const [editorContent, setEditorContent] = useState({
        response_curator: "",
        response_legal: "",
        response_arquitecture: "",
        response_structure: "",
        response_archive: ""
    });
    // editor refs 
    const editor1 = useRef(null);
    const editor2 = useRef(null);
    const editor3 = useRef(null);
    const editor4 = useRef(null);
    const editor5 = useRef(null);
    // config to enable all features in the jodit editor
    const config = {
        readonly: false, // all options from https://xdsoft.net/jodit/doc/,
        uploader: {
            url: 'https://xdsoft.net/jodit/finder/?action=fileUpload'
        },
        filebrowser: {
            ajax: {
                url: 'https://xdsoft.net/jodit/finder/'
            },
            height: 580,
        },
        language: 'es',
        "readonly": false,
        controls: {
            lineHeight: {
                list: ([0.5, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 2, 3, 3.5])

            }
        }
    }

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
            // responses for editor
            if (initialData?.new_pqrs_response) {
                setEditorContent({
                    response_curator: initialData.new_pqrs_response.response_curator ?? "",
                    response_archive: initialData.new_pqrs_response.response_archive ?? "",
                    response_arquitecture: initialData.new_pqrs_response.response_arquitecture ?? "",
                    response_legal: initialData.new_pqrs_response.response_legal ?? "",
                    response_structure: initialData.new_pqrs_response.response_structure ?? "",
                });
            }
        }
    }, [initialData]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleJoditChange = (key, value) => {
        setEditorContent((prev) => ({ ...prev, [key]: value }));
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
        data.append("responses", JSON.stringify(editorContent));
        console.log(editorContent.response_curator)


        console.log(data.get('responses'));
        const res = await new_pqrsService.create(data)
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
                            <PetitionerForm setFormData={setPetitioners} loadedPetitioners={initialData.new_pqrs_petitioners} />

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
                                <TransferForm setFormData={setTranfers} loadedTranslations={initialData.new_pqrs_translation} />
                                {/* <TranslationComponent formData={formData} onChange={handleChange} /> */}
                            </div>
                            <ClasificationComponent formData={formData} onChange={handleChange} />
                            <ClasificationTermComponent formData={formData} onChange={handleChange} />
                            <ProcessControl initialData={initialData.new_pqrs_controls} formData={control} onChange={handleControlChange} />
                            <pre>{JSON.stringify(formData, null, 2)}</pre>
                            <div >
                                <Collapsible className='bg-primary border border-info text-center' openedClassName='bg-info text-center' trigger={<><label className="fw-normal text-light text-center">Respuestas</label></>}>
                                    <div className="p-3">
                                        <h5 className="my-4 bg-info p-1">Respuesta Curador</h5>
                                        <JoditEditor
                                            config={config}
                                            ref={editor1}
                                            value={editorContent.response_curator}
                                            onBlur={(value) => handleJoditChange("response_curator", value)} />

                                        <h5 className="my-4 bg-info p-1">Respuesta Legal</h5>
                                        <JoditEditor
                                            config={config}
                                            ref={editor2}
                                            value={editorContent.response_legal}
                                            onBlur={(value) => handleJoditChange("response_legal", value)} />

                                        <h5 className="my-4 bg-info p-1">Respuesta Arquitectura</h5>
                                        <JoditEditor
                                            config={config}
                                            ref={editor3}
                                            value={editorContent.response_arquitecture}
                                            onBlur={(value) => handleJoditChange("response_arquitecture", value)} />

                                        <h5 className="my-4 bg-info p-1">Respuesta Estructura</h5>
                                        <JoditEditor
                                            config={config}
                                            ref={editor4}
                                            value={editorContent.response_structure}
                                            onBlur={(value) => handleJoditChange("response_structure", value)} />

                                        <h5 className="my-4 bg-info p-1">Respuesta Archivo</h5>
                                        <JoditEditor
                                            config={config}
                                            ref={editor5}
                                            value={editorContent.response_archive}
                                            onBlur={(value) => handleJoditChange("response_archive", value)} />
                                    </div>
                                </Collapsible>
                            </div>

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


import React, { useState, useEffect, useCallback } from "react";
import PetitionerComponent from "./pqrs_petitioner.component";
import { AddButton, RemoveButton } from "./ui/pqrs_button";

const PetitionerForm = ({ setFormData, loadedPetitioners }) => {
    // Estado inicial con datos existentes
    const [petitioners, setPetitioners] = useState(() => {
        const initialPetitioners = loadedPetitioners?.map((p) => ({
            id: p.document_number ?? Date.now(),
            data: p
        })) || [{ id: Date.now(), data: {} }];
        return initialPetitioners;
    });

    // save data
    const updateFormData = useCallback(() => {
        setFormData(petitioners.map((p) => p.data));
    }, [petitioners, setFormData]);


    useEffect(() => {
        updateFormData();
    }, [petitioners, updateFormData]);

    // Función para agregar un nuevo peticionario vacío
    const addPetitioner = () => {
        setPetitioners([...petitioners, { id: Date.now(), data: {} }]);
    };

    // Función para eliminar un peticionario por ID
    const removePetitioner = (id) => {
        setPetitioners(petitioners.filter((p) => p.id !== id));
    };

    // Función para actualizar los datos de un peticionario
    const updatePetitioner = (id, field, value) => {
        setPetitioners((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, data: { ...p.data, [field]: value } } : p
            )
        );
    };
    return (
        <div>
            <h3>Información de Peticionarios</h3>
            {petitioners.map(({ id, data }) => (
                <div key={id} className="border p-3 mb-3">
                    <PetitionerComponent formData={data} onChange={(e) => updatePetitioner(id, e.target.name, e.target.type === "checkbox" ? e.target.checked : e.target.value)} />
                    {
                        petitioners.length > 1 &&
                        <div className="d-flex justify-content-end">
                            <RemoveButton onClick={() => removePetitioner(id)} />
                        </div>

                    }
                </div>
            ))}

            <div className="d-flex justify-content-end">
                <AddButton onClick={addPetitioner} />
            </div>
        </div>
    );
};

export default PetitionerForm;

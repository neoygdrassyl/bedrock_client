import React, { useState, useEffect, useCallback } from "react";
import TranslationComponent from "./pqrs_translation.component";

const TransferForm = ({ setFormData, loadedTranslations }) => {
    // Initialize state with loaded data or a default empty entry
    const [translations, setTranslations] = useState(() => {
        return loadedTranslations?.length
            ? loadedTranslations.map((t, index) => ({ id: index, data: t }))
            : [{ id: Date.now(), data: {} }];
    });

    // Update parent form data
    const updateFormData = useCallback(() => {
        setFormData(translations.map((t) => t.data));
    }, [translations, setFormData]);

    useEffect(() => {
        updateFormData();
    }, [translations, updateFormData]);

    // Add a new translation entry
    const addTranslation = () => {
        setTranslations([...translations, { id: Date.now(), data: {} }]);
    };

    // Remove the last translation entry (ensuring at least one remains)
    const removeLastTranslation = () => {
        setTranslations(translations.slice(0, -1)); // Removes the last element

    };

    // Update a specific translation entry
    const updateTranslation = (id, field, value) => {
        setTranslations((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, data: { ...t.data, [field]: value } } : t
            )
        );
    };

    return (
        <div>
            {translations.map(({ id, data }) => (
                <div key={id} className="border p-3 mb-3">
                    <TranslationComponent
                        formData={data}
                        onChange={(e) =>
                            updateTranslation(id, e.target.name, e.target.value)
                        }
                    />
                </div>
            ))}

            <div className="d-flex justify-content-end">
                {
                    translations.length > 1 && (
                        <button type="button" className="btn btn-danger" onClick={removeLastTranslation}>
                            ❌
                        </button>
                    )
                }
                <button type="button" className="btn btn-primary" onClick={addTranslation}>
                    ➕
                </button>
            </div>
        </div>
    );
};

export default TransferForm;

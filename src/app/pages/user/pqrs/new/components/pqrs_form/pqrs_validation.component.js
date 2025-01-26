import { useState, useCallback } from "react";

const RadioGroup = ({ name, options, value, onChange }) => (
  <div className="d-flex gap-2">
    {options.map((option, index) => (
      <div key={index} className="btn-group" role="group">
        <input
          type="radio"
          className="btn-check"
          name={name}
          id={`${name}${index}`}
          autoComplete="off"
          value={option}
          checked={value === option}    
          onChange={onChange}
        />
        <label className="btn btn-outline-primary btn-sm" htmlFor={`${name}${index}`}>
          {option === "1" ? "Sí" : "No"}
        </label>
      </div>
    ))}
  </div>
);

const ValidationItem = ({ label, name, value, onChange }) => (
  <div className="d-flex justify-content-between align-items-center mb-2">
    <span className="text-truncate me-2">{label}</span>
    <RadioGroup name={name} options={["1", "0"]} value={value} onChange={onChange} />
  </div>
);

const generateInitialState = (data) =>
  Object.keys(data || {}).reduce((acc, key) => {
    acc[key] = data[key] ? "1" : "0";
    return acc;
  }, {});

const ValidationComponent = ({ initialData = {}, onChange }) => {
  const [localFormData, setLocalFormData] = useState(() => generateInitialState(initialData));

  const handleRadioChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
    onChange?.(e);
  }, [onChange]);

  const formalAspects = [
    "Está dirigida a la entidad CUB1. Art16/1755/2015",
    "Es claro el objeto de la petición. Art16/1755/2015",
    "Presenta razones que la fundamentan. Art16/1755/2015",
    "Anexa documentos. Art15/1755/2015",
    "Requiere estar por escrito. Art15/1755/2015",
    "*Digital",
  ];

  const competenceRelations = [
    "Una actuación urbanística (Licencias/ Reconocimientos / Otras actuaciones)",
    "Reconocimiento de un derecho (Vecino colindante/ Debido proceso)",
    "Recursos de reposición y/o subsidio de apelación",
  ];

  return (
    <div className="mb-4">
      <h4 className="border-bottom p-2">VALORACION DE LA SOLICITUD Y DEFINICION DE COMPETENCIA</h4>
      <div className="row">
        <div className="col-md-6">
          <h6 className="mb-3">Cumplimiento de aspectos formales. Art16/1755/2015.</h6>
          {formalAspects.map((label, index) => (
            <ValidationItem
              key={index}
              label={label}
              name={`formal${index}`}
              value={localFormData[`formal${index}`] || ""}
              onChange={handleRadioChange}
            />
          ))}
        </div>
        <div className="col-md-6">
          <h6 className="mb-3">Relación de competencia de la Petición con la CUB1</h6>
          {competenceRelations.map((label, index) => (
            <ValidationItem
              key={index}
              label={label}
              name={`competence${index}`}
              value={localFormData[`competence${index}`] || ""}
              onChange={handleRadioChange}
            />
          ))}
          <h6 className="mt-4 mb-3">Relación de la Petición con otras entidades</h6>
          <ValidationItem
            label="Requiere intervención de otras entidades. (En caso positivo identifíquelas (1))"
            name="otherEntities"
            value={localFormData.otherEntities || ""}
            onChange={handleRadioChange}
          />
        </div>
      </div>
    </div>
  );
};  

export default ValidationComponent;

export const AddButton = ({ onClick }) => {
    return (
        <button
            type="button" 
            onClick={onClick}
            className="btn btn-primary px-2 rounded-end">
            Agregar Otro
        </button>
    );
};

export const RemoveButton = ({ onClick }) => {
    return (
        <button
            type="button" 
            onClick={onClick}
            className="btn btn-danger d-flex align-items-center justify-content-center p-2 rounded-circle shadow-sm"
            style={{ width: "24px", height: "24px" }}
        >
            &minus;
        </button>
    );
};


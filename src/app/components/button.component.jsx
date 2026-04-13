export const Button_navigation = (props) => {
    const { Idup, Iddown } = props
    const _Redirec = (id) => {
        const element = document.getElementById(id);
        element.scrollIntoView()
    }
    return <>
        {Iddown == null ? '' : (
            <button type="button" className="btn btn-sm btn-link p-0 ms-1" onClick={() => _Redirec(Iddown)} aria-label="Ir abajo">
                <i className="fas fa-arrow-circle-down" />
            </button>
        )}
        {Idup == null ? '' : (
            <button type="button" className="btn btn-sm btn-link p-0 ms-1" onClick={() => _Redirec(Idup)} aria-label="Ir arriba">
                <i className="fas fa-arrow-circle-up" />
            </button>
        )}
    </>
}

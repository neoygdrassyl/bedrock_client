const TranslationComponent = ({ formData, onChange }) => {
    return (
        <div className="table-responsive">
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Entidad</th>
                        <th>Funcionario</th>
                        <th>Cargo</th>
                        <th>Correo electrónico / Ventanilla Única</th>
                        <th>Hecho o Petición</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" className="form-control form-control-sm" name="entity" value={formData.entity} onChange={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="officer" value={formData.officer} onChange={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="charge" value={formData.charge} onChange={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="email_translate" value={formData.email_translate} onChange={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="reason" value={formData.reason} onChange={onChange} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
export default TranslationComponent;
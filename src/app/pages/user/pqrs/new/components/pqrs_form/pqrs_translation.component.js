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
                        <td><input type="text" className="form-control form-control-sm" name="entity" defaultValue={formData.entity} onBlur={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="officer" defaultValue={formData.officer} onBlur={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="charge" defaultValue={formData.charge} onBlur={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="email_transfer" defaultValue={formData.email_transfer} onBlur={onChange} /></td>
                        <td><input type="text" className="form-control form-control-sm" name="reason" defaultValue={formData.reason} onBlur={onChange} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
export default TranslationComponent;
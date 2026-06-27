import DataTable from '@/components/data-table-bridge';
import { dateParser } from '../../../../components/customClasses/typeParse';

function PQRS_COMPONENT_CONTACTS({ translation, swaMsg, globals, currentItem }) {

        //DATA GETTERS
        let _GET_CONTACTS = () => {
            return currentItem.pqrs_contacts;
        }

        let _GET_NOTIFY_CONTEXT = (_value, _date) => {
            if (_value == 0) return <label className="text-warning">SIN EVENTO</label>
            if (_value == 1) return <label className="text-success">SI - {dateParser(_date)}</label>
            if (_value == 2) return <label className="text-danger">NO - CORREO REBOTO</label>
            if (_value == 3) return <label className="text-danger">NO - NO PIDE NOTIFICACIÓN POR EMAIL</label>
            if (_value == 4) return <label className="text-danger">NO - NO DOTO CORREO ELECTRÓNICO</label>
        }

        let _CONTACTS_COMPONENT = () => {
            var _LIST = _GET_CONTACTS();
            const columns = [
                {
                    name: 'DIRECCIÓN',
                    selector: row => row.name,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.address}</span>,
                },
                {
                    name: 'BARRIO',
                    selector: row => row.competence,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.neighbour}</span>,
                },
                {
                    name: 'MUNICIPIO',
                    cell: row => <span className="text-sm">{row.county}</span>,
                },
                {
                    name: 'TELÉFONO',
                    selector: row => row.asign,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.phone}</span>,
                },
                {
                    name: 'CONTACTO',
                    minWidth: '180px',
                    cell: row => <span className="text-sm">{row.email}</span>,
                },
                {
                    name: 'DEPARTAMENTO',
                    cell: row => <span className="text-sm">{row.state}</span>,
                },
                {
                    name: '¿NOTIFICA CORREO?',
                    minWidth: '180px',
                    center: true,
                    cell: row => <span className="text-sm">{row.notify ? <label className="text-success fw-bold">SI</label> : "NO"}</span>,
                },
            ]
            var _COMPONENT = <DataTable
                noDataComponent="No hay contactos"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
            return _COMPONENT;
        }
    return (
        <div>
            {_CONTACTS_COMPONENT()}

        </div>
    );
}

export default PQRS_COMPONENT_CONTACTS;
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import { dateParser } from '../../../../components/customClasses/typeParse';

class PQRS_COMPONENT_CONTACTS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

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
                    name: <label>DIRECCIÓN</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.address}</label>,
                },
                {
                    name: <label>BARRIO</label>,
                    selector: 'competence',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.neighbour}</label>,
                },
                {
                    name: <label>MUNICIPIO</label>,
                    cell: row => <label>{row.county}</label>,
                },
                {
                    name: <label>TELÉFONO</label>,
                    selector: 'asign',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.phone}</label>,
                },
                {
                    name: <label>CONTACTO</label>,
                    minWidth: '180px',
                    cell: row => <label>{row.email}</label>,
                },
                {
                    name: <label>DEPARTAMENTO</label>,
                    cell: row => <label>{row.state}</label>,
                },
                {
                    name: <label>¿NOTIFICA CORREO?</label>,
                    minWidth: '180px',
                    center: true,
                    cell: row => <label>{row.notify ? <label className="text-success fw-bold">SI</label> : "NO"}</label>,
                },
            ]
            var _COMPONENT = <DataTable
                noDataComponent="No hay conactos"
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
}

export default PQRS_COMPONENT_CONTACTS;
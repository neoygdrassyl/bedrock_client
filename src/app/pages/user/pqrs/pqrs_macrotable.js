import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';

import PQRS_Main from '../../../services/pqrs_main.service'
import { dateParser_dateDiff, dateParser_finalDate, dateParser_timeLeft } from '../../../components/customClasses/typeParse';
import { MDBTooltip, MDBTypography } from 'mdb-react-ui-kit';
import PQRS_ACTION_REVIEW from './components/pqrs_reviewAction.component';


const MySwal = withReactContent(Swal);
class PQRS_MACROTABLE extends Component {
    constructor(props) {
        super(props);
        this.retrieveMacro = this.retrieveMacro.bind(this);
        this.state = {
            load: false,
            data_macro: null,

            _OPEN: 0,
            _CLOSE: 0,
        };
    }
    componentDidMount() {
        this.retrieveMacro();
    }
    retrieveMacro() {
        PQRS_Main.getAllMacro(this.props.date_start, this.props.date_end)
            .then(response => {
                this.setState({
                    data_macro: response.data,
                    load: true,
                })
                this._SET_REPORT_VARIABLES(response.data);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    _SET_REPORT_VARIABLES(_LIST) {
        let _open_pqrs = 0;
        let _closed_pqrs = 0;
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].status == 0) _open_pqrs++;
            if (_LIST[i].status == 1) _closed_pqrs++;
        }

        this.setState({ _OPEN: _open_pqrs, _CLOSE: _closed_pqrs })
    }
    render() {
        const { translation, swaMsg, globals, selectedRow } = this.props;
        const { load } = this.state;

        // DATA GETTER

        //DATA CONVERTERS
        let _GET_STATUS_COMPONENT = (status, string = false) => {
            switch (status) {
                case 0:
                    return string ? 'ACTIVO': <label className="text-danger fw-bold">ACTIVO</label>
                case 1:
                    return string ? 'CERRADO':<label className="text-success fw-bold">CERRADO</label>
                case 2:
                    return string ? 'ARCHIVADO':<label className="text-primary fw-bold">ARCHIVADO</label>
                case 3:
                    return string ? 'TRASLADADO':<label className="text-secondary fw-bold">TRASLADADO</label>
                default:;
                    return ''
            }
        }
        let _REPLIES_COMPONENT = (item) => {
            var counter = 0;
            for (var i = 0; i < item.pqrs_workers.length; i++) {
                if (item.pqrs_workers[i].reply) {
                    counter++;
                }
            }
            return counter;
        }
        let _GET_STOPLIGHT_COLOR = (row) => {
            if (!row.pqrs_time) return ""
            if (row.status) return <i class="fas fa-lightbulb fa-2x text-dark"></i>
            let days = dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1));
            if (days <= 0) return <i class="fas fa-lightbulb fa-2x text-danger"></i>
            if (days > 0 && days < 7) return <i class="fas fa-lightbulb fa-2x text-warning"></i>
            if (days >= 7) return <i class="fas fa-lightbulb fa-2x text-success"></i>
        }
        let _GET_REPLY_TIME_TIME = (row) => {
            if (!row.pqrs_time) return ""
            if (!row.pqrs_time.reply_formal) return ""
            let days_to_reply = dateParser_dateDiff(row.pqrs_time.legal, row.pqrs_time.reply_formal);
            return days_to_reply;
        }
        let _GET_REPLY_TIME_REPORT = (row) => {
            if (!row.pqrs_time) return ""
            if (!row.pqrs_time.reply_formal) return ""
            let days_to_reply = _GET_REPLY_TIME_TIME(row);
            return <label className="">{days_to_reply} Dia(s)</label>
            if (days_to_reply < 5) return <label className="">{days_to_reply} DIAS - <label className="text-success">CON RAPIDEZ</label></label>
            if (days_to_reply >= 5 && days_to_reply < 15) return <label className="">{days_to_reply} DIAS - <label className="text-warning">EN EL TIEMPO ESTABLECIDO</label> </label>
            if (days_to_reply >= 15) return <label className="">{days_to_reply} DIAS - <label className="text-danger">NECESITO UN TIEMPO CONSIDERABLE</label> </label>
        }
        // COMPONENT JSX
        const rowSelectedStyle = [
            {
                when: row => row.id == selectedRow,
                style: {
                    backgroundColor: 'BlanchedAlmond',
                },
            },
        ];

        const columns = [
            {
                name: <label>ACCION</label>,
                button: true,
                cell: row => <> <MDBTooltip title='Informacion solicitud' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                    <button className="btn btn-sm btn-info m-0 p-2 shadow-none"
                        onClick={() => this.props.NAVIGATION_GEN(row)}>
                        <i class="far fa-eye" ></i></button></MDBTooltip>
                </>,
                excell: false,
            },
            {
                name: "",
                center: true,
                maxWidth: "40px",
                cell: row => <label>{_GET_STOPLIGHT_COLOR(row)}</label>,
                excell: false,
            },
            { 
                name: <label  className="text-center">CONSECUTIVO VENTANILLA ÚNICA</label>,
                selector: 'id_global',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_global}</label>,
                excellHeader: "RADICADO VENTANILLA",
                excellValue: row => row.id_global
            }, 
            {
                name: <label  className="text-center">FECHA RADICACIÓN</label>,
                selector: 'pqrs_time.legal',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? row.pqrs_time.legal : ''}</label>,
                excellHeader: "FECHA RADICACIÓN",
                excellValue: row => row.pqrs_time ? row.pqrs_time.legal : ''
            },
            {
                name: <label  className="text-center">CANAL DE INGRESO </label>,
                selector: 'pqrs_info.radication_channel',
                sortable: true,
                filterable: true,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_info ? row.pqrs_info.radication_channel : ''}</label>,
                excellHeader: "CANAL DE INGRESO",
                excellValue: row => row.pqrs_info ? row.pqrs_info.radication_channel : ''
            },
            {
                name: <label  className="text-center">NOMBRE PETICIONARIO</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_solocitors.map(e => e.name).join(', ')}</label>,
                excellHeader: "NOMBRE PETICIONARIO",
                excellValue: row => row.pqrs_solocitors.map(e => e.name).join(' ')
            },
            {
                name: <label  className="text-center">TIPO DE PETICIONARIO</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_solocitors.map(e => e.type).join(', ')}</label>,
                excellHeader: "TIPO DE PETICIONARIO",
                excellValue: row => row.pqrs_solocitors.map(e => e.type).join(' ')
            },
            {
                name: <label  className="text-center">TIPO DE DOCUMENTO</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_solocitors.map(e => e.type_id).join(', ')}</label>,
                excellHeader: "TIPO DE DOCUMENTO",
                excellValue: row => row.pqrs_solocitors.map(e => e.type_id).join(' ')
            }, 
            {
                name: <label  className="text-center">NÚMERO DE DOCUMENTO</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_solocitors.map(e => e.id_number).join(', ')}</label>,
                excellHeader: "NUMERO DE DOCUMENTO",
                excellValue: row => row.pqrs_solocitors.map(e => e.id_number).join(' ')
            }, 
            {
                name: <label  className="text-center">DIRECCIÓN</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_contacts.map(e => e.address).join(', ')}</label>,
                excellHeader: "DIRECCION",
                excellValue: row => row.pqrs_contacts.map(e => e.address).join(' ')
            },
            {
                name: <label  className="text-center">MUNICIPIO</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_contacts.map(e => e.county).join(', ')}</label>,
                excellHeader: "MUNICIPIO",
                excellValue: row => row.pqrs_contacts.map(e => e.county).join(' ')
            },
            {
                name: <label  className="text-center">CONTACTO</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_contacts.map(e => e.email || e.phone).join(', ')}</label>,
                excellHeader: "CONTACTO",
                excellValue: row => row.pqrs_contacts.map(e => e.email || e.phone).join(' ')
            }, 
            {
                name: <label  className="text-center">AUTORIZA CORREO ELECTRÓNICO</label>,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_contacts.map(e => e.notify ? "SI" : "NO").join(', ')}</label>,
                excellHeader: "AUTORIZA CORREO ELECTRÓNICO",
                excellValue: row => row.pqrs_contacts.map(e => e.notify ? "SI" : "NO").join(' ')
            },
            {
                name: <label  className="text-center">TIPO DE PETICIÓN</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.type}</label>,
                excellHeader: "TIPO DE PETICIÓN",
                excellValue: row => row.type
            },
            {
                name: <label  className="text-center">TIEMPO PARA RESPONDER</label>,
                selector: row => row.pqrs_time ? row.pqrs_time.time : '',
                sortable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? row.pqrs_time.time : ''}  Dia(s)</label>,
                excellHeader: "TIEMPO PARA RESPONDER",
                excellValue: row => row.pqrs_time ? row.pqrs_time.time : ''
            },
            {
                name: <label  className="text-center">TIEMPO DE RESPUESTA</label>,
                selector: row => _GET_REPLY_TIME_TIME(row),
                sortable: true,
                center: true,
                cell: row => <label>{_GET_REPLY_TIME_REPORT(row)}</label>,
                excellHeader: "TIEMPO DE RESPUESTA",
                excellValue: row => _GET_REPLY_TIME_TIME(row)
            },
            {
                name: <label  className="text-center">CONSECUTIVO SALIDA</label>,
                selector: 'id_reply',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_reply}</label>,
                excellHeader: "CONSECUTIVO SALID",
                excellValue: row => row.id_reply
            },
            {
                name: <label className="text-center">FECHA LIMITE RESPUESTA LEGAL</label>,
                selector: 'pqrs_time.legal',
                sortable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? (dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time)) : ''}</label>,
                excellHeader: "FECHA LIMITE RESPUESTA LEGAL",
                excellValue: row => row.pqrs_time ? (dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time)) : ''
            },
            {
                name: <label  className="text-center">TIEMPO RESTANTE</label>,
                selector: row => (!row.status && row.pqrs_time ? dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time) : -9999),
                sortable: true,
                center: true,
                cell: row => <label>{!row.status && row.pqrs_time? dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time) + ' dia(s)' : ""}</label>,
                excell: false
            },
            {
                name: <label  className="text-center">FECHA DE RESPUESTA</label>,
                selector: 'pqrs_time.reply_formal',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? row.pqrs_time.reply_formal : ''}</label>,
                excellHeader: "FECHA DE RESPUESTA",
                excellValue: row => row.pqrs_time ? row.pqrs_time.reply_formal : ''
            },

            // MEDIO DE EGRESO

            {
                name: <label  className="text-center">ESTADO</label>,
                selector: 'status',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <>{_GET_STATUS_COMPONENT(row.status)}</>,
                excellHeader: "ESTADO",
                excellValue: row => _GET_STATUS_COMPONENT(row.status, true)
            },
            {
                name: <label  className="text-center">EFICAZ</label>,
                selector: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) && Number(_GET_REPLY_TIME_TIME(row)) <= Number(row.pqrs_time.time) ? 'SI' : 'NO' : '',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <>{row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) && Number(_GET_REPLY_TIME_TIME(row)) <= Number(row.pqrs_time.time) ? 'SI' : 'NO' : ''}</>,
                excellHeader: "EFICAZ",
                excellValue: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) && Number(_GET_REPLY_TIME_TIME(row)) <= Number(row.pqrs_time.time) ? 'SI' : 'NO' : ''
            },
            {
                name: <label  className="text-center">INDICADOR</label>,
                selector: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) ? Number(Number(_GET_REPLY_TIME_TIME(row)) / Number(row.pqrs_time.time)).toFixed(1)  : '' : '',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <>{row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) ? Number(Number(_GET_REPLY_TIME_TIME(row)) / Number(row.pqrs_time.time)).toFixed(1)  : '' : ''}</>,
                excellHeader: "EFICAZ",
                excellValue: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) ? Number(Number(_GET_REPLY_TIME_TIME(row)) / Number(row.pqrs_time.time)).toFixed(1)  : '' : ''
            },
            {
                name: <label  className="text-center">DESCRIPCIÓN</label>,
                cell: row => row.content && row.content.length > 0 ? row.content.substring(0, 50) + (row.content.length > 50 ? "..." : '' ): '',
                minWidth: "200px",
                excellHeader: "DESCRIPCIÓN",
                excellValue: row => row.content ? row.content.replace(/[\n\r]+ */g, ' ').replace(/[;]+ */g, ', ').replace(/[,]+ */g, ' ') : ''
            },
 

        ]

        // FUNCTIONS & APIS

        let generateCVS = () => {
            let _data = this.state.data_macro;
            const rows = [];

            const headRows = columns.filter(row => (row.excell != false)).map(row => row.excellHeader);

            rows.push(headRows);
            _data.map(_d => {
                let row = [];
                let entry =  columns.filter(e => (e.excell != false)).map(e => e.excellValue(_d))
                row.push(entry); 
                rows.push(row)
            }) 

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");

            var encodedUri = encodeURI(csvContent);
            const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

            var link = document.createElement("a");
            link.setAttribute("href", fixedEncodedURI);
            link.setAttribute("download", `REPORTE_PQRS_${this.props.date_start}_${this.props.date_end}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }
        return (
            <div className="py-3">
                <div className="row">
                    <div className="col-6">
                        <MDBTypography note noteColor='danger'>
                            Hay un total de {this.state._OPEN} peticiones ACTIVAS en proceso.
                        </MDBTypography>
                    </div>
                    <div className="col-6">
                        <MDBTypography note noteColor='success'>
                            Hay un total de {this.state._CLOSE} peticiones CERRADAS, ya resueltas.
                        </MDBTypography>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="lead fw-bold me-3">Descargar Excel</label>
                        <a target="_blank" onClick={() => generateCVS()} ><i class="far fa-file-excel fa-2x" style={{ color: "darkgreen" }}></i> </a>
                    </div>
                </div>

                {load ? (
                    <DataTable
                        conditionalRowStyles={rowSelectedStyle}
                        noDataComponent={<h4 className="fw-bold">NO HAY INFORMACIÓN</h4>}
                        striped="true"
                        columns={columns}
                        data={this.state.data_macro}
                        highlightOnHover
                        pagination
                        paginationPerPage={50}
                        paginationRowsPerPageOptions={[50, 100, 200]}
                        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                        className="data-table-component"
                        noHeader
                        onRowClicked={(e) => this.props.setSelectedRow(e.id)}
                        dense={true}
                    />
                ) : (
                    <div className="text-center">
                        <h4 className="fw-bold">CARGANDO INFORMACIÓN...</h4>
                    </div>)}
            </div>
        );
    }
}

export default PQRS_MACROTABLE;
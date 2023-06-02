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
        let _GET_STATUS_COMPONENT = (status) => {
            switch (status) {
                case 0:
                    return <label className="text-danger fw-bold">ACTIVO</label>
                case 1:
                    return <label className="text-success fw-bold">CERRADO</label>
                case 2:
                    return <label className="text-primary fw-bold">ARCHIVADO</label>
                case 3:
                    return <label className="text-secondary fw-bold">TRASLADADO</label>
                default:
                    break;
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
                        <i class="far fa-eye fa-2x" ></i></button></MDBTooltip>
                    {_GET_REPLY_TIME_TIME(row) > 15
                        ? <PQRS_ACTION_REVIEW translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={row}
                            refreshList={this.retrieveMacro}
                        />
                        : ""}
                </>
            },
            {
                name: "",
                center: true,
                maxWidth: "40px",
                cell: row => <label>{_GET_STOPLIGHT_COLOR(row)}</label>
            },
            { 
                name: <label  className="text-center">CONSECUTIVO VENTANILLA ÚNICA</label>,
                selector: 'id_global',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_global}</label>
            }, 
            {
                name: <label  className="text-center">CONSECUTIVO ENTRADA</label>,
                selector: 'id_publico',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_publico}</label>
            },
            {
                name: <label  className="text-center">CONSECUTIVO GUIÁ</label>,
                selector: 'id_correspondency',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_correspondency}</label>
            },
            {
                name: <label  className="text-center">ESTADO</label>,
                selector: 'status',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <>{_GET_STATUS_COMPONENT(row.status)}</>
            },
            {
                name: <label  className="text-center">MEDIO DE RADICACIÓN ORIGINAL</label>,
                selector: 'pqrs_info.radication_channel',
                sortable: true,
                filterable: true,
                minWidth: "200px",
                center: true,
                cell: row => <label>{row.pqrs_info ? row.pqrs_info.radication_channel : ''}</label>
            },
            {
                name: <label  className="text-center">FECHA RADICACIÓN</label>,
                selector: 'pqrs_time.legal',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? row.pqrs_time.legal : ''}</label>
            },
            {
                name: <label  className="text-center">TOTAL RESPUESTAS DE PROFESIONALES</label>,
                selector: row => _REPLIES_COMPONENT(row),
                sortable: true,
                center: true,
                cell: row => <label>{_REPLIES_COMPONENT(row) + " de " + row.pqrs_workers.length}</label>
            },
            {
                name: <label className="text-center">FECHA LIMITE RESPUESTA LEGAL</label>,
                selector: 'pqrs_time.legal',
                sortable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? (dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time)) : ''}</label>
            },
            {
                name: <label  className="text-center">TIEMPO RESTANTE</label>,
                selector: row => (!row.status && row.pqrs_time ? dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time) : -9999),
                sortable: true,
                center: true,
                
                cell: row => <label>{!row.status && row.pqrs_time? dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time) + ' dia(s)' : ""}</label>
            },
            {
                name: <label  className="text-center">CONSECUTIVO SALIDA</label>,
                selector: 'id_reply',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_reply}</label>
            },
            {
                name: <label  className="text-center">FECHA REAL DE RESPUESTA</label>,
                selector: 'pqrs_time.reply_formal',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? row.pqrs_time.reply_formal : ''}</label>
            },
            {
                name: <label  className="text-center">TIEMPO DE RESPUESTA</label>,
                selector: row => _GET_REPLY_TIME_TIME(row),
                sortable: true,
                center: true,
                minWidth: "200px",
                cell: row => <label>{_GET_REPLY_TIME_REPORT(row)}</label>
            },

        ]

        // FUNCTIONS & APIS

        let generateCVS = () => {
            let _data = this.state.data_macro;
            const rows = [];

            const headRows = [
                "CONSECUTIVO VENTANILLA ÚNICA",
                'CONSECUTIVO ENTRADA',
                'CONSECUTIVO GUIÁ',
                'MEDIO RADICACIÓN ORIGINAL',
                'FECHA RADICACIÓN',
                'HORA RADICACIÓN',
                'FECHA LIMITE RESPUESTA LEGAL',
                'CONSECUTIVO SALIDA',
                'FECHA REAL DE RESPUESTA',
                'TIEMPO DE RESPUESTA',
                'ASUNTO'];

            rows.push(headRows);
            _data.map(_d => {
                let row = [];
                row.push(_d.id_global || ''); // id_global CONSECUTIVO VENTANILLA ÚNICA
                row.push(_d.id_publico || ''); // id_publico CONSECUTIVO ENTRADA
                row.push(_d.id_correspondency || ''); // id_correspondency CONSECUTIVO GUIÁ
                row.push(_d.pqrs_info ? _d.pqrs_info.radication_channel: ''); // radication_channel MEDIO RADICACIÓN ORIGINAL
                row.push(_d.pqrs_time ? _d.pqrs_time.legal: ''); // legal FECHA RADICACIÓN
                row.push(_d.pqrs_time ? _d.pqrs_time.creation ? _d.pqrs_time.creation.split(' ')[1] : '' : ''); // legal HORA DE RESPUESTA
                row.push(_d.pqrs_time ? dateParser_finalDate(_d.pqrs_time.legal, _d.pqrs_time.time) : ''); // final date
                row.push(_d.id_reply); // id_reply
                row.push(_d.pqrs_time ? _d.pqrs_time.reply_formal : ''); // reply_date
                row.push(_GET_REPLY_TIME_TIME(_d) ? _GET_REPLY_TIME_TIME(_d) + " dia(s)" : ""); // reply_time
                let new_conent = _d.content ? _d.content.replace(/[\n\r]+ */g, ' ') : '';
                new_conent = new_conent.replace(/\;/g, ':');
                new_conent = new_conent.replaceAll('#', '%23').replaceAll('°', 'r');
                row.push(new_conent) // ASUNTO
                rows.push(row)
            }) 

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
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
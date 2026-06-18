import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';

import PQRS_Main from '../../../services/pqrs_main.service'
import { dateParser_dateDiff, dateParser_finalDate, dateParser_timeLeft } from '../../../components/customClasses/typeParse';

import PQRS_ACTION_REVIEW from './components/pqrs_reviewAction.component';
import { Icon } from '@/components/icon';
import { swalError } from '@/app/utils/swalAdapter';

function PQRS_MACROTABLE({ translation, swaMsg, globals, selectedRow, date_start, date_end, NAVIGATION_GEN, setSelectedRow }) {
    const [load, setLoad] = useState(false);
    const [data_macro, setDataMacro] = useState(null);
    const [_OPEN, set_OPEN] = useState(0);
    const [_CLOSE, set_CLOSE] = useState(0);

    useEffect(() => {
        retrieveMacro();
    }, []);

    const retrieveMacro = () => {
        PQRS_Main.getAllMacro(date_start, date_end)
            .then(response => {
                setDataMacro(response.data);
                setLoad(true);
                _SET_REPORT_VARIABLES(response.data);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    };

    const _SET_REPORT_VARIABLES = (_LIST) => {
        let _open_pqrs = 0;
        let _closed_pqrs = 0;
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].status == 0) _open_pqrs++;
            if (_LIST[i].status == 1) _closed_pqrs++;
        }
        set_OPEN(_open_pqrs);
        set_CLOSE(_closed_pqrs);
    };

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
            if (row.status) return <Icon name="lightbulb" size={16} className="text-dark" />
            let days = dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1));
            if (days <= 0) return <Icon name="lightbulb" size={16} className="text-danger" />
            if (days > 0 && days < 7) return <Icon name="lightbulb" size={16} className="text-warning" />
            if (days >= 7) return <Icon name="lightbulb" size={16} className="text-success" />
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
            if (days_to_reply < 5) return <label className="">{days_to_reply} DIAS - <label className="text-success">CON RAPIDEZ</label></label>
            if (days_to_reply >= 5 && days_to_reply < 15) return <label className="">{days_to_reply} DIAS - <label className="text-warning">EN EL TIEMPO ESTABLECIDO</label> </label>
            if (days_to_reply >= 15) return <label className="">{days_to_reply} DIAS - <label className="text-danger">NECESITO UN TIEMPO CONSIDERABLE</label> </label>
            return <label className="">{days_to_reply} Dia(s)</label>
        }
        // COMPONENT JSX
        const rowSelectedStyle = [
            {
                when: row => row.id == selectedRow,
                style: {
                    backgroundColor: 'hsl(var(--warning) / 0.12)',
                },
            },
        ];

        const columns = [
            {
                name: 'Acción',
                button: true,
                cell: row => <> <Button size="sm" className="m-0 p-2" title="Informacion solicitud" onClick={() => NAVIGATION_GEN(row)}>
                        <Icon name="eye" size={16} /></Button>
                </>,
                excell: false,
            },
            {
                name: "",
                center: true,
                maxWidth: "40px",
                cell: row => <span className="text-sm">{_GET_STOPLIGHT_COLOR(row)}</span>,
                excell: false,
            },
            { 
                name: 'Consecutivo V.U.',
                selector: row => row.id_global,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.id_global}</span>,
                excellHeader: "RADICADO VENTANILLA",
                excellValue: row => row.id_global
            }, 
            {
                name: 'Fecha Radicación',
                selector: row => row.pqrs_time?.legal,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_time ? row.pqrs_time.legal : ''}</span>,
                excellHeader: "FECHA RADICACIÓN",
                excellValue: row => row.pqrs_time ? row.pqrs_time.legal : ''
            },
            {
                name: 'Canal de Ingreso',
                selector: row => row.pqrs_info?.radication_channel,
                sortable: true,
                filterable: true,
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_info ? row.pqrs_info.radication_channel : ''}</span>,
                excellHeader: "CANAL DE INGRESO",
                excellValue: row => row.pqrs_info ? row.pqrs_info.radication_channel : ''
            },
            {
                name: 'Nombre Peticionario',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_solocitors.map(e => e.name).join(', ')}</span>,
                excellHeader: "NOMBRE PETICIONARIO",
                excellValue: row => row.pqrs_solocitors.map(e => e.name).join(' ')
            },
            {
                name: 'Tipo Peticionario',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_solocitors.map(e => e.type).join(', ')}</span>,
                excellHeader: "TIPO DE PETICIONARIO",
                excellValue: row => row.pqrs_solocitors.map(e => e.type).join(' ')
            },
            {
                name: 'Tipo Documento',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_solocitors.map(e => e.type_id).join(', ')}</span>,
                excellHeader: "TIPO DE DOCUMENTO",
                excellValue: row => row.pqrs_solocitors.map(e => e.type_id).join(' ')
            }, 
            {
                name: 'Nro. Documento',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_solocitors.map(e => e.id_number).join(', ')}</span>,
                excellHeader: "NUMERO DE DOCUMENTO",
                excellValue: row => row.pqrs_solocitors.map(e => e.id_number).join(' ')
            }, 
            {
                name: 'Dirección',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_contacts.map(e => e.address).join(', ')}</span>,
                excellHeader: "DIRECCION",
                excellValue: row => row.pqrs_contacts.map(e => e.address).join(' ')
            },
            {
                name: 'Municipio',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_contacts.map(e => e.county).join(', ')}</span>,
                excellHeader: "MUNICIPIO",
                excellValue: row => row.pqrs_contacts.map(e => e.county).join(' ')
            },
            {
                name: 'Contacto',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_contacts.map(e => e.email || e.phone).join(', ')}</span>,
                excellHeader: "CONTACTO",
                excellValue: row => row.pqrs_contacts.map(e => e.email || e.phone).join(' ')
            }, 
            {
                name: 'Autoriza Correo',
                minWidth: "200px",
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_contacts.map(e => e.notify ? "SI" : "NO").join(', ')}</span>,
                excellHeader: "AUTORIZA CORREO ELECTRÓNICO",
                excellValue: row => row.pqrs_contacts.map(e => e.notify ? "SI" : "NO").join(' ')
            },
            {
                name: 'Tipo Petición',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.type}</span>,
                excellHeader: "TIPO DE PETICIÓN",
                excellValue: row => row.type
            },
            {
                name: 'Tiempo Respuesta',
                selector: row => row.pqrs_time ? row.pqrs_time.time : '',
                sortable: true,
                center: true,
                cell: row => <label>{row.pqrs_time ? row.pqrs_time.time : ''}  Dia(s)</label>,
                excellHeader: "TIEMPO PARA RESPONDER",
                excellValue: row => row.pqrs_time ? row.pqrs_time.time : ''
            },
            {
                name: 'Tiempo de Respuesta',
                selector: row => _GET_REPLY_TIME_TIME(row),
                sortable: true,
                center: true,
                cell: row => <span className="text-sm">{_GET_REPLY_TIME_REPORT(row)}</span>,
                excellHeader: "TIEMPO DE RESPUESTA",
                excellValue: row => _GET_REPLY_TIME_TIME(row)
            },
            {
                name: 'Consecutivo Salida',
                selector: row => row.id_reply,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.id_reply}</span>,
                excellHeader: "CONSECUTIVO SALID",
                excellValue: row => row.id_reply
            },
            {
                name: 'Fecha Límite Respuesta Legal',
                selector: row => row.pqrs_time?.legal,
                sortable: true,
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_time ? (dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time)) : ''}</span>,
                excellHeader: "FECHA LIMITE RESPUESTA LEGAL",
                excellValue: row => row.pqrs_time ? (dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time)) : ''
            },
            {
                name: 'Tiempo Restante',
                selector: row => (!row.status && row.pqrs_time ? dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time) : -9999),
                sortable: true,
                center: true,
                cell: row => <span className="text-sm">{!row.status && row.pqrs_time? dateParser_timeLeft(row.pqrs_time.legal, row.pqrs_time.time) + ' dia(s)' : ""}</span>,
                excell: false
            },
            {
                name: 'Fecha Respuesta',
                selector: row => row.pqrs_time?.reply_formal,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.pqrs_time ? row.pqrs_time.reply_formal : ''}</span>,
                excellHeader: "FECHA DE RESPUESTA",
                excellValue: row => row.pqrs_time ? row.pqrs_time.reply_formal : ''
            },

            // MEDIO DE EGRESO

            {
                name: 'Estado',
                selector: row => row.status,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <>{_GET_STATUS_COMPONENT(row.status)}</>,
                excellHeader: "ESTADO",
                excellValue: row => _GET_STATUS_COMPONENT(row.status, true)
            },
            {
                name: 'Eficaz',
                selector: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) && Number(_GET_REPLY_TIME_TIME(row)) <= Number(row.pqrs_time.time) ? 'SI' : 'NO' : '',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <>{row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) && Number(_GET_REPLY_TIME_TIME(row)) <= Number(row.pqrs_time.time) ? 'SI' : 'NO' : ''}</>,
                excellHeader: "EFICAZ",
                excellValue: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) && Number(_GET_REPLY_TIME_TIME(row)) <= Number(row.pqrs_time.time) ? 'SI' : 'NO' : ''
            },
            {
                name: 'INDICADOR',
                selector: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) ? Number(Number(_GET_REPLY_TIME_TIME(row)) / Number(row.pqrs_time.time)).toFixed(1)  : '' : '',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <>{row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) ? Number(Number(_GET_REPLY_TIME_TIME(row)) / Number(row.pqrs_time.time)).toFixed(1)  : '' : ''}</>,
                excellHeader: "EFICAZ",
                excellValue: row => row.pqrs_time ? row.pqrs_time.time && _GET_REPLY_TIME_TIME(row) ? Number(Number(_GET_REPLY_TIME_TIME(row)) / Number(row.pqrs_time.time)).toFixed(1)  : '' : ''
            },
            {
                name: 'DESCRIPCIÓN',
                cell: row => row.content && row.content.length > 0 ? row.content.substring(0, 50) + (row.content.length > 50 ? "..." : '' ): '',
                minWidth: "200px",
                excellHeader: "DESCRIPCIÓN",
                excellValue: row => row.content ? row.content.replace(/[\n\r]+ */g, ' ').replace(/[;]+ */g, ', ').replace(/[,]+ */g, ' ') : ''
            },
 

        ]

        // FUNCTIONS & APIS

        let generateCVS = () => {
            let _data = data_macro;
            if (!Array.isArray(_data) || !_data.length) return;
            const rows = [];

            const headRows = columns.filter(row => (row.excell != false)).map(row => row.excellHeader);

            rows.push(headRows);
            _data.forEach(_d => {
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
            link.setAttribute("download", `REPORTE_PQRS_${date_start}_${date_end}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }
        return (
            <div className="min-w-0 py-3">
                <div className="row">
                    <div className="col-6">
                        <div className="alert alert-danger">
                            Hay un total de {_OPEN} peticiones ACTIVAS en proceso.
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="alert alert-success">
                            Hay un total de {_CLOSE} peticiones CERRADAS, ya resueltas.
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="lead fw-bold me-3">Descargar Excel</label>
                        <button type="button" onClick={() => generateCVS()} ><Icon name="file-excel" size={16} style={{ color: "darkgreen" }} /> </button>
                    </div>
                </div>

                {load ? (
                    <div className="max-w-full min-w-0 overflow-x-auto">
                        <DataTable
                            conditionalRowStyles={rowSelectedStyle}
                            noDataComponent={<h4 className="fw-bold">NO HAY INFORMACIÓN</h4>}
                            striped="true"
                            columns={columns}
                            data={Array.isArray(data_macro) ? data_macro : []}
                            highlightOnHover
                            pagination
                            paginationPerPage={50}
                            paginationRowsPerPageOptions={[50, 100, 200]}
                            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                            className="data-table-component"
                            noHeader
                            onRowClicked={(e) => setSelectedRow(e.id)}
                            dense={true}
                        />
                    </div>
                ) : (
                    <div className="text-center">
                        <h4 className="fw-bold">CARGANDO INFORMACIÓN...</h4>
                    </div>)}
            </div>
        );
}

export default PQRS_MACROTABLE;

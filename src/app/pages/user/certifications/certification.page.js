import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { addDecimalPoints, formsParser1 } from '../../../components/customClasses/typeParse';
import UsersService from '../../../services/users.service';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icon';
import { swalClose, swalError, swalLoading } from '@/app/utils/swalAdapter';
import { downloadProtectedPdf } from '@/app/utils/pdfDownload';

export default function CERTIFICATE_WORKER(props) {
    const translation = props.translation
    const swaMsg = props.swaMsg
    var formData = new FormData();
    var [loadTable, setLoadTable] = useState(false)
    var [data, setData] = useState([]);
    var [title, setTitle] = useState('')
    var [subjectNumer, setNumber] = useState('')
    var [subjectRegistration, setRegistration] = useState('')
    var [id, setId] = useState('')

    useEffect(() => {
        if (data.length > 0) {
            setTitle((data[0].name + " " + data[0].surname).toUpperCase());
            setNumber(data[0].id_number);
            setRegistration(data[0].registration);
            var rad = document.getElementById('id_number').value
            setId(dayjs(`20${rad[0]}${rad[1]}-${rad[3]}${rad[4]}-${rad[5]}${rad[6]}`))
            setLoadTable(true);
        }
        if (data.length == 0) setLoadTable(false)
    }, [data]);

    // *********************** TABLE FUNCTIONS ************************** // 
    let getFun1 = (element) => {
        var type = element.fun_1 ? element.fun_1.split('&') : [];
        var suType = type[type.length - 1] ? type[type.length - 1].split(';') : [];
        var typeObject = {
            tipo: suType[0],
            tramite: suType[1],
            m_urb: suType[2],
            m_sub: suType[3],
            m_lic: suType[4]
        }

        return formsParser1(typeObject);
    }

    let getDates = (element) => {
        var state = element.states ? element.states.split(',') : [];
        var date = element.dates ? element.dates.split(',') : [];
        var date_start = '';
        var date_end = '';
        if (state.length) {
            if (state.includes('-1')) {
                var indexOf = state.indexOf('-1');
                date_start = date[indexOf];
            }
            if (state.includes('3')) {
                var indexOf = state.indexOf('3');
                date_start = date[indexOf];
            }
            if (state.includes('5')) {
                var indexOf = state.indexOf('5');
                date_start = date[indexOf];
            }
            if (state.includes('99')) {
                var indexOf = state.indexOf('99');
                date_end = date[indexOf]
            }
        }
        return [date_start, date_end]
    }
    // ******************************* APIS **************************** // 
    let generateCVS = (_data, _name) => {
        var rows = [];


        const columns = [
            {
                name: 'SOLICITUD',
                cell: row => row.id_public,
            },
            {
                name: 'ACTUACION URBANISTICA',
                cell: row => getFun1(row),
            },
            {
                name: 'FECHA RADICACIÓN',
                cell: row => getDates(row)[0],
            },
            {
                name: 'FECHA EXPEDICIÓN',
                cell: row => getDates(row)[1],
            },
            {
                name: 'EN CALIDAD DE',
                cell: row => row.roles,
            },
        ]
        const headRows = columns.filter(c => c.ignoreCSV == undefined).map(c => { return c.name })
        rows = _data.map(d =>
            columns.filter(c => c.ignoreCSV == undefined).map(c => {
                return (String(c.cell(d) ?? '')).replace(/[\n\r]+ */g, ' ')
            }
            )
        );

        rows.unshift(headRows);

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(";")).join("\n");


        var encodedUri = encodeURI(csvContent);
        const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

        var link = document.createElement("a");
        link.setAttribute("href", fixedEncodedURI);
        link.setAttribute("download", `${_name ?? 'HISTORIAL DEL PRFESIONAL'}.csv`);
        document.body.appendChild(link); // Required for FF

        link.click();
    }


    let handleSubmit = (e) => {
        e.preventDefault();
        formData = new FormData();
        let id_number = document.getElementById('id_number').value;
        id_number = id_number.replaceAll(',', '.')
        if (!id_number.includes('.')) id_number = addDecimalPoints(id_number)
        id_number = addDecimalPoints(id_number);
        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        UsersService.getCertificateData(id_number)
            .then(response => {
                if (response.data == "NO") return swalError({ title: 'NO SE ENCONTRÓ PROFESIONAL', text: 'No hay profesional con este número de documento, verifique el numero de documento enviado.', icon: 'warning' });
                setData(response.data)
                swalClose()

            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    let generatePDF = () => {
        console.log(subjectNumer)
        let id_number = String(subjectNumer);
        id_number = id_number.replaceAll(',', '.')
        if (!id_number.includes('.')) id_number = addDecimalPoints(id_number)

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        UsersService.getCertificateDataPDF(id_number)
            .then(response => {
                if (response.data === 'OK') {
                    swalClose();
                    const filename = "Historial Progesional " + title + ".pdf";
                    return downloadProtectedPdf(`/pdf/certificate_data/${encodeURIComponent(filename)}`, filename);
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });

    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-foreground">Certificaciones</h1>
                <p className="text-sm text-muted-foreground mt-1">Consulta de historial de profesionales</p>
            </div>

            <div className="row my-4 d-flex justify-content-center">
                <div className="col-lg-8 col-md-12">
                    <h2 className="text-center my-2">CONSULTA DE HISTORIAL DE PROFESIONALES</h2>
                    <div className="d-flex justify-content-center">
                        <div className="bg-card w-50">
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">{translation.str_id}</label>
                                        <input type="text" className="form-control" id="id_number" onChange={(e) => setNumber(e.target.value)}/>
                                    </div>
                                    <div className="text-center mb-2">
                                        <Button type="submit" size="sm">{translation.str_btn3}</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {loadTable ? <>
                <div className='d-flex justify-content-center my-3'>
                    <div className='col-10'>
                        <div className='row text-center'>
                            <h3 className='fw-bold'> HISTORIAL DE PROFESIONAL : {title} </h3>
                        </div>

                        <div className='my-2'>
                            <Button variant="outline" size="sm" className="text-destructive border-destructive mx-1" onClick={() => generatePDF()}><Icon name="file-pdf" size={16} /> Generar PDF</Button>
                            <Button variant="outline" size="sm" onClick={() => { generateCVS(data, 'HISTORIAL DEL PRFESIONAL ' + title) }}><Icon name="file-csv" size={16} /> Descargar CSV</Button>
                        </div>

                        <div className='row text-center border border-black py-2' style={{ backgroundColor: 'lightgray' }}>
                            <div className='col-2'>
                                <label className='fw-bol'>SOLICITUD</label>
                            </div>
                            <div className='col'>
                                <label className='fw-bol'>ACTUACION URBANISTICA</label>
                            </div>
                            <div className='col-2'>
                                <label className='fw-bol'>FECHA RADICACIÓN</label>
                            </div>
                            <div className='col-2'>
                                <label className='fw-bol'>FECHA EXPEDICIÓN</label>
                            </div>
                            <div className='col'>
                                <label className='fw-bol'>EN CALIDAD DE:</label>
                            </div>
                        </div>
                        {data.map((value, index) => <div className='row text-center border border-black py-2'>
                            <div className='col-2'>
                                <label>{value.id_public}</label>
                            </div>
                            <div className='col'>
                                <label>{getFun1(value)}</label>
                            </div>
                            <div className='col-2'>
                                <label>{getDates(value)[0]}</label>
                            </div>
                            <div className='col-2'>
                                <label>{getDates(value)[1] || 'ACTIVO'}</label>
                            </div>
                            <div className='col' >
                                <label >{value.roles}</label>
                            </div>
                        </div>
                        )}
                    </div>
                </div>

            </> : ""}
        </div >
    );
}

import React, { useEffect, useState } from 'react';
import { addDecimalPoints, formsParser1 } from '../../../components/customClasses/typeParse';
import UsersService from '../../../services/users.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment';
import { MDBBreadcrumb, MDBBreadcrumbItem, MDBBtn } from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

export default function CERTIFICATE_WORKER(props) {
    const translation = props.translation
    const swaMsg = props.swaMsg
    const MySwal = withReactContent(Swal);
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
            setId(moment(`20${rad[0]}${rad[1]}-${rad[3]}${rad[4]}-${rad[5]}${rad[6]}`))
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
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        UsersService.getCertificateData(id_number)
            .then(response => {
                if (response.data == "NO") return MySwal.fire({
                    title: 'NO SE ENCONTRÓ PROFESIONAL',
                    text: 'No hay profesional con este número de documento, verifique el numero de documento enviado.',
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
                setData(response.data)
                MySwal.close()

            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    let generatePDF = () => {
        console.log(subjectNumer)
        let id_number = String(subjectNumer);
        id_number = id_number.replaceAll(',', '.')
        if (!id_number.includes('.')) id_number = addDecimalPoints(id_number)

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        UsersService.getCertificateDataPDF(id_number)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.close();
                    window.open(process.env.REACT_APP_API_URL + "/pdf/certificate_data/" + "Historial Progesional " + title + ".pdf");
                } else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });

    }

    return (
        <div>
            <div className="row my-4 d-flex justify-content-center">
                <MDBBreadcrumb className="mx-5">
                    <MDBBreadcrumbItem>
                        <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">INICIO</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem>
                        <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">PANEL DE CONTROL</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem active><i class="fas fa-address-book"></i> <label className="text-uppercase">HISTORIAL PROFESIONALES</label></MDBBreadcrumbItem>
                </MDBBreadcrumb>

                <div className="col-lg-8 col-md-12">
                    <h2 className="text-center my-2">CONSULTA DE HISTORIAL DE PROFESIONALES</h2>
                    <div className="d-flex justify-content-center">
                        <div className="bg-card w-50">
                            <div class="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div class="mb-3">
                                        <label class="form-label">{translation.str_id}</label>
                                        <input type="text" class="form-control" id="id_number" onChange={(e) => setNumber(e.target.value)}/>
                                    </div>
                                    <div className="text-center mb-2">
                                        <button type="submit" class="btn btn-info ">{translation.str_btn3}</button>
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
                            <MDBBtn outline className='mx-1' color='danger' size="sm" onClick={() => generatePDF()}>
                                <i class="far fa-file-pdf"></i> GENERAR PDF</MDBBtn>
                            <MDBBtn outline color='success' size="sm" onClick={() => { generateCVS(data, 'HISTORIAL DEL PRFESIONAL ' + title) }}>
                                <i class="fas fa-file-csv"></i> DESCARGAR CSV</MDBBtn>
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

import { MDBBtn } from 'mdb-react-ui-kit';
import { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _GET_SERIE_COD, _GET_SERIE_STR, _GET_SUBSERIE_COD, _GET_SUBSERIE_STR } from '../../../../components/customClasses/typeParse';
import FUN_SERVICE from '../../../../services/fun.service'

const MySwal = withReactContent(Swal);
class FUN_ARCHIVE extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, isEdit } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
                docs: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                    _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_ARCHIVE = () => {
            var _CHILD = currentItem.fun_archive;
            var _CHILD_VARS = {
                id: _CHILD ? _CHILD.id : false,
                date_1: _CHILD ? _CHILD.date_1 ?? '' : '',
                date_2: _CHILD ? _CHILD.date_2 ?? '' : '',
                resolution: _CHILD ? _CHILD.resolution ?? '' : '',
                folder: _CHILD ? _CHILD.folder ?? '' : '',
                pages: _CHILD ? _CHILD.pages ?? '' : '',
                box: _CHILD ? _CHILD.box ?? '' : '',
                row: _CHILD ? _CHILD.row ?? '' : '',
                column: _CHILD ? _CHILD.column ?? '' : '',
            }
            return _CHILD_VARS;
        }

        // DATA CONVERTERS

        // APIS
        var formData = new FormData();
        let save_archive = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);

            var date_1 = document.getElementById('fun_archive_2').value;
            formData.set('date_1', date_1);
            var date_2 = document.getElementById('fun_archive_3').value;
            formData.set('date_2', date_2);
            var resolution = document.getElementById('fun_archive_1').value;
            formData.set('resolution', resolution);
            var folder = document.getElementById('fun_archive_4').value;
            formData.set('folder', folder);
            var pages = document.getElementById('fun_archive_5').value;
            formData.set('pages', pages);
            var box = document.getElementById('fun_archive_6').value;
            formData.set('box', box);
            var row = document.getElementById('fun_archive_7').value;
            formData.set('row', row);
            var column = document.getElementById('fun_archive_8').value;
            formData.set('column', column);

            manage_archive();
        }

        let manage_archive = () => {
            let _CHILD = _GET_ARCHIVE();
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                FUN_SERVICE.update_archive(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
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
            } else {
                FUN_SERVICE.create_archive(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
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
        }
        let gen_pdf = () => {
            formData = new FormData();

            var serie_str = document.getElementById('archive_label_1').innerText;
            formData.set('serie_str', serie_str);
            var serie_cod = document.getElementById('archive_label_2').innerText;
            formData.set('serie_cod', serie_cod);
            var subserie_str = document.getElementById('archive_label_3').innerText;
            formData.set('subserie_str', subserie_str);
            var subserie_cod = document.getElementById('archive_label_4').innerText;
            formData.set('subserie_cod', subserie_cod);
            var id_public = document.getElementById('archive_label_5').innerText;
            formData.set('id_public', id_public);
            var resolution = document.getElementById('archive_label_6') ? document.getElementById('archive_label_6').innerText : document.getElementById('fun_archive_1').value;
            formData.set('resolution', resolution);
            var titular = document.getElementById('archive_label_7').innerText;
            formData.set('titular', titular);
            
            var date_1 = document.getElementById('archive_label_8') ? document.getElementById('archive_label_8').innerText : document.getElementById('fun_archive_2').value;
            formData.set('date_1', date_1);
            var date_2 = document.getElementById('archive_label_9') ? document.getElementById('archive_label_9').innerText : document.getElementById('fun_archive_3').value;
            formData.set('date_2', date_2);
            var folder = document.getElementById('archive_label_10') ? document.getElementById('archive_label_10').innerText : document.getElementById('fun_archive_4').value;
            formData.set('folder', folder);
            var pages = document.getElementById('archive_label_11') ? document.getElementById('archive_label_11').innerText : document.getElementById('fun_archive_5').value;
            formData.set('pages', pages);
            var box = document.getElementById('archive_label_12') ? document.getElementById('archive_label_12').innerText : document.getElementById('fun_archive_6').value;
            formData.set('box', box);
            var row = document.getElementById('archive_label_13') ? document.getElementById('archive_label_13').innerText : document.getElementById('fun_archive_7').value;
            formData.set('row', row);
            var column = document.getElementById('archive_label_14') ? document.getElementById('archive_label_14').innerText : document.getElementById('fun_archive_8').value;
            formData.set('column', column);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUN_SERVICE.gen_doc_stickerarchive(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/stickerarvhive/" + "STICKER DE ARCHIVO - " + currentItem.id_public + ".pdf");
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
            <div className="fun_archive">
                <form onSubmit={save_archive} id="form_archive">
                    <div className="row border mx-1 py-1">
                        <div className="col-2">
                            <label>SERIE</label>
                        </div>
                        <div className="col-6">
                            <label className="fw-bold" id="archive_label_1">{_GET_SERIE_STR(_GET_CHILD_1()).join(', ')}</label>
                        </div>
                        <div className="col-2">
                            <label>CÓDIGO</label>
                        </div>
                        <div className="col-2">
                            <label className="fw-bold" id="archive_label_2">{_GET_SERIE_COD(_GET_CHILD_1()).join(', ')}</label>
                        </div>
                    </div>
                    <div className="row border mx-1 py-1">
                        <div className="col-2">
                            <label>SUBSERIE</label>
                        </div>
                        <div className="col-6">
                            <label className="fw-bold" id="archive_label_3">{_GET_SUBSERIE_STR(_GET_CHILD_1()).join(', ')}</label>
                        </div>
                        <div className="col-2">
                            <label>CÓDIGO</label>
                        </div>
                        <div className="col-2">
                            <label className="fw-bold" id="archive_label_4">{_GET_SUBSERIE_COD(_GET_CHILD_1()).join(', ')}</label>
                        </div>
                    </div>

                    <div className="row border mx-1 py-1">
                        <div className="col-2">
                            <label>RADICADO N°</label>
                        </div>
                        <div className="col-6">
                            <label className="fw-bold" id="archive_label_5">{currentItem.id_public}</label>
                        </div>
                        <div className="col-2">
                            <label>RES. N°</label>
                        </div>
                        <div className="col-2">
                            {isEdit
                                ? <input type="text" class="form-control" id="fun_archive_1"
                                    defaultValue={_GET_ARCHIVE().resolution} />
                                : <label className="fw-bold" id="archive_label_6">{_GET_ARCHIVE().resolution}</label>}
                        </div>
                    </div>

                    <div className="row border mx-1 py-1">
                        <div className="col-2">
                            <label>TITULAR</label>
                        </div>
                        <div className="col-10">
                            <label className="fw-bold" id="archive_label_7">{_GET_CHILD_53().item_5311} {_GET_CHILD_53().item_5312}</label>
                        </div>
                    </div>

                    <div className="row border mx-1 py-1">
                        <div className="col-2">
                            <label>FECHAS EXTREMAS</label>
                        </div>
                        <div className="col-10">
                            {isEdit
                                ? <><div class="input-group my-1">
                                    <input type="date" max="2100-01-01" class="form-control me-2" id="fun_archive_2"
                                        defaultValue={_GET_ARCHIVE().date_1} />
                                    a
                                    <input type="date" max="2100-01-01" class="form-control ms-2" id="fun_archive_3"
                                        defaultValue={_GET_ARCHIVE().date_2} />
                                </div>
                                </>
                                : <>
                                    <label className="fw-bold me-1" id="archive_label_8">{_GET_ARCHIVE().date_1}</label>
                                    <label className="fw-bold"> a </label>
                                    <label className="fw-bold ms-1" id="archive_label_9">{_GET_ARCHIVE().date_2}</label>
                                </>
                            }
                        </div>
                    </div>

                    <div className="row border mx-1 py-1">
                        <div className="col-2">
                            <label>CARPETA N°</label>
                        </div>
                        <div className="col-2">
                            {isEdit
                                ? <input type="number" step="1" min="0" class="form-control" id="fun_archive_4"
                                    defaultValue={_GET_ARCHIVE().folder} />
                                : <label className="fw-bold" id="archive_label_10">{_GET_ARCHIVE().folder}</label>}
                        </div>
                        <div className="col-2">
                            <label>FOLIOS</label>
                        </div>
                        <div className="col-2">
                            {isEdit
                                ? <input type="number" step="1" min="0" class="form-control" id="fun_archive_5"
                                    defaultValue={_GET_ARCHIVE().pages} />
                                : <label className="fw-bold" id="archive_label_11">{_GET_ARCHIVE().pages}</label>}
                        </div>
                        <div className="col-2">
                            <label>CAJA N°</label>
                        </div>
                        <div className="col-2">
                            {isEdit
                                ? <input type="number" step="1" min="0" class="form-control" id="fun_archive_6"
                                    defaultValue={_GET_ARCHIVE().box} />
                                : <label className="fw-bold" id="archive_label_12">{_GET_ARCHIVE().box}</label>}
                        </div>
                    </div>

                    <div className="row border mx-1 py-1">
                        <div className="col">
                            <label>UBICACIÓN</label>
                        </div>
                    </div>

                    <div className="row border mx-1 py-1">
                        <div className="col-2">
                            <label>ESTANTE N°</label>
                        </div>
                        <div className="col-2">
                            {isEdit
                                ? <input type="number" step="1" min="0" class="form-control" id="fun_archive_7"
                                    defaultValue={_GET_ARCHIVE().row} />
                                : <label className="fw-bold" id="archive_label_13">{_GET_ARCHIVE().row}</label>}
                        </div>
                        <div className="col-4">

                        </div>
                        <div className="col-2">
                            <label>ENTREPAÑO N°</label>
                        </div>
                        <div className="col-2">
                            {isEdit
                                ? <input type="number" step="1" min="0" class="form-control" id="fun_archive_8"
                                    defaultValue={_GET_ARCHIVE().column} />
                                : <label className="fw-bold" id="archive_label_14">{_GET_ARCHIVE().column}</label>}
                        </div>
                    </div>
                    <div className="row">
                        {isEdit
                            ? <div className="col  text-center">
                                <button className="btn btn-success my-3" ><i class="far fa-edit"></i> GUARDAR CAMBIOS </button>
                            </div>
                            : ""}
                        <div className="col  text-center">
                            <MDBBtn className="btn btn-danger my-3" onClick={() => gen_pdf()} ><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                        </div>
                    </div>

                </form>
            </div>
        );
    }
}

export default FUN_ARCHIVE;
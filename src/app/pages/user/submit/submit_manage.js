import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
// SERVICES
import SubmitService from '../../../services/submit.service';
import FunService from '../../../services/fun.service';
import SUBMIT_ANEX from './submit_anex.component';
import SUBMIT_LIST from './submit_list.component';
import { formsParser1 } from '../../../components/customClasses/typeParse';
import { Icon } from '@/components/icon';
import ObservationPanel from '../../../components/ObservationPanel';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

function SUBMIT_MANAGE({ translation, swaMsg, globals, currentId, refreshList: propRefreshList, closeModal, edit, requestOptions = [] }) {
    const [currentItem, setCurrentItem] = useState(false);
    const [verifyMSG, setVerifyMSG] = useState(null);
    const [vrWarning, setVrWarning] = useState(null);
    const [isVrDuplicate, setIsVrDuplicate] = useState(false);
    const [payment, setPayment] = useState(false);
    const [documentPanel, setDocumentPanel] = useState('physical');
    const [digitalCount, setDigitalCount] = useState(0);
    const [digitalDocuments, setDigitalDocuments] = useState([]);
    const [requestQuery, setRequestQuery] = useState('');
    const [isRequestMenuOpen, setIsRequestMenuOpen] = useState(false);
    const refreshRequestIdRef = useRef(0);

    const normalizedRequestQuery = requestQuery.trim().toLowerCase();
    const requestSuggestions = [...new Set(
        requestOptions
            .map(item => item?.id_related)
            .filter(Boolean),
    )]
        .filter(id => id.toLowerCase().includes(normalizedRequestQuery))
        .slice(0, 8);

    function selectRequest(id) {
        document.getElementById('submit_2').value = id;
        setRequestQuery(id);
        setIsRequestMenuOpen(false);
    }

    useEffect(() => {
        refreshItem();
    }, []);

    function refreshItem() {
        if (currentId) {
            const requestId = ++refreshRequestIdRef.current;
            SubmitService.get(currentId).then(response => {
                if (requestId !== refreshRequestIdRef.current) return;
                let item = response.data;
                setCurrentItem(item);
            });
        }
    }

    function refreshList(id) {
        propRefreshList(id);
    }

    function handleDigitalDocumentsChange(count, rows = []) {
        setDigitalCount(count);
        setDigitalDocuments(Array.isArray(rows) ? rows : []);
    }


        // DATA GETTERS
        let GET_SUBMIT = () => {
            var _CHILD = currentItem;
            var _CHILD_VARS = {
                id: _CHILD ? _CHILD.id : null,
                id_public: _CHILD ? _CHILD.id_public : null,
                id_related: _CHILD ? _CHILD.id_related : null,
                type: _CHILD ? _CHILD.type : null,
                list_type: _CHILD ? _CHILD.list_type : null,
                list_type_str: _CHILD ? _CHILD.list_type_str : null,
                date: _CHILD ? _CHILD.date : dayjs().format('YYYY-MM-DD'),
                time: _CHILD ? _CHILD.time : dayjs().format('HH:mm'),
                owner: _CHILD ? _CHILD.owner : null,
                worker_reciever: _CHILD ? _CHILD.worker_reciever : window.user.name + " " + window.user.surname,
                name_retriever: _CHILD ? _CHILD.name_retriever : null,
                id_number_retriever: _CHILD ? _CHILD.id_number_retriever : null,
                details: _CHILD ? _CHILD.details : null,

                list_category: _CHILD ? _CHILD.list_category : null,
                list_code: _CHILD ? _CHILD.list_code : null,
                list_pages: _CHILD ? _CHILD.list_pages : null,
                list_review: _CHILD ? _CHILD.list_review : null,
                list_name: _CHILD ? _CHILD.list_name : null,
            }
            if (document.getElementById('submit_7')) document.getElementById('submit_7').value = _CHILD_VARS.worker_reciever;
            if (document.getElementById('submit_3')) document.getElementById('submit_3').value = _CHILD_VARS.date
            if (document.getElementById('submit_32')) document.getElementById('submit_32').value = _CHILD_VARS.time
            return _CHILD_VARS;
        }

        // DATA COMVERTERS
        let _REGEX_IDNUMBER = (e) => {
            let regex = /^[0-9]+$/i;
            let test = regex.test(e.target.value);
            if (test) {
                var _value = Number(e.target.value).toLocaleString();
                _value = _value.replaceAll(',', '.');
                document.getElementById(e.target.id).value = _value;
            }
        }
        let _GET_LAST_ID = (_htmlId) => {
            let new_id = "";
            let htmlId = _htmlId ?? 'submit_1';
            SubmitService.getlastid()
                .then(response => {
                    if (response.data.length) {
                        new_id = response.data[0].vr;
                        if (new_id) {
                            let concecutive = new_id.split('-')[1];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = new_id.split('-')[0] + "-" + concecutive
                            document.getElementById(htmlId).value = new_id;
                            _VERIFY_VR_DUPLICATE(htmlId);
                        } else document.getElementById(htmlId).value = "VR" + dayjs().format('YY') + "-0001";
                    } else document.getElementById(htmlId).value = "VR" + dayjs().format('YY') + "-0001";
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
                });

        }
        let _VERIFY_VR_DUPLICATE = (_htmlId) => {
            let htmlId = _htmlId ?? 'submit_1';
            let vrCode = document.getElementById(htmlId).value;
            if (!vrCode || vrCode.length < 4) {
                setVrWarning(null);
                return;
            }
            setVrWarning(<label className="fw-bold"><Icon name="search-location" size={14} className="text-info" /> Verificando duplicado...</label>);
            SubmitService.getSearch(1, vrCode)
                .then(response => {
                    let duplicates = response.data;
                    if (currentItem && currentItem.id_public) {
                        duplicates = duplicates.filter(d => d.id_public !== currentItem.id_public);
                    }
                    if (duplicates.length) {
                        setIsVrDuplicate(true);
                        setVrWarning(<label className="fw-bold" style={{ fontSize: '12px' }}>
                            <Icon name="exclamation-triangle" size={14} className="text-danger" /> El código VR <strong>{vrCode}</strong> ya existe en ventanilla única. Se guardará como duplicado si continúa.
                        </label>);
                    } else {
                        setIsVrDuplicate(false);
                        setVrWarning(<label className="fw-bold" style={{ fontSize: '12px' }}>
                            <Icon name="check" size={14} className="text-success" /> Código VR disponible.
                        </label>);
                    }
                })
                .catch(e => {
                    console.log(e);
                    setIsVrDuplicate(false);
                    setVrWarning(<label className="fw-bold" style={{ fontSize: '12px' }}>
                        <Icon name="exclamation" size={14} className="text-warning" /> No se pudo verificar duplicado. El backend validará al guardar.
                    </label>);
                });
        }
        let _VERIFY_RELATED_ID = () => {
            setVerifyMSG(<label className="fw-bold"><Icon name="search-location" size={16} className="text-info" /> Buscando...</label>)
            var id = document.getElementById('submit_2').value;
            if (id.length) {
                _GET_TYPE(id)
                SubmitService.verifyid(id)
                    .then(response => {
                        if (response.data.length) {
                            setVerifyMSG(<label className="fw-bold"><Icon name="check" size={16} className="text-success" /> Se encontro consecutivo</label>)
                        } else {
                            setVerifyMSG(<label className="fw-bold"><Icon name="exclamation" size={16} className="text-warning" /> No se encontro consecutivo</label>)
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        setVerifyMSG(<label className="fw-bold"><Icon name="exclamation" size={16} className="text-warning" /> Se encontraron errores en el Codigo a buscar</label>)
                    });
            } else {
                document.getElementById('submit_4').value = ""
                setVerifyMSG(<label className="fw-bold"><Icon name="times" size={16} className="text-danger" /> Debe especificar un consecutivo de Licencia o JUR.</label>)
            }
        }
        let _GET_TYPE = (id_public) => {
            FunService.get_fun_IdPublic(id_public).then(response => {
                if (response.data) {
                    let fun = response.data;
                    let version = fun.version - 1
                    let fun_1 = fun.fun_1s[version]
                    let fun_51 = fun.fun_51s;
                    let owners = [];
                    let state = fun.state;
                    let rec_rev = fun.record_review ? fun.record_review.check : null;
                    let rec_rev_2 = fun.record_review ? fun.record_review.check_2 : null;
                    let state_str = (state) => {
                        if (state == undefined || state == null) return '';
                        if (state < -1) return 'DESISTIDO';
                        if (state < 5) return 'INCOMPLETO';
                        if (state == 5) {
                            let con = (rec_rev == 1 || (rec_rev != 1 && rec_rev_2 == 1));
                            let con2 = (rec_rev == null && rec_rev_2 == null);
                            if (con2) return 'LEGAL Y DEBIDA FORMA';
                            if (con) return "ACTA DE OBSERVACIONES"
                            return "ACTA DE OBSERVACIONES Y CORRECCIONES"
                        }
                        if (state > 5 && state < 100) return "EXPEDICIÓN";
                        if (state >= 100 && state < 200) return "EXPEDIDO";
                        if (state >= 200) return "DESISTIDO";
                    }
                    fun_51.map(value => { if (value.role == 'PROPIETARIO') owners.push(value.name + ' ' + value.surname) })
                    document.getElementById('submit_5').value = owners.join(', ');
                    document.getElementById('submit_42').value = state_str(state);
                    if (fun_1) document.getElementById('submit_4').value = formsParser1(fun_1);
                    else document.getElementById('submit_4').value = ""
                } else document.getElementById('submit_4').value = ""
            })
        }
        let _GET_LAST_ID_PUBLIC = () => {
            let new_id = "";
            FunService.getLastIdPublic()
                .then(response => {
                    if (response.data.length) {
                        new_id = response.data[0].id;
                        if (new_id) {
                            let _id = new_id.split('-')
                            let concecutive = _id[3];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = `${_id[0]}-${_id[1]}-${_id[2]}-${concecutive}`
                            document.getElementById('submit_2').value = new_id;
                        } else document.getElementById('submit_2').value = "68001-1-" + dayjs().format('YY') + "-0001";
                    } else document.getElementById('submit_2').value = "68001-1-" + dayjs().format('YY') + "-0001";
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
                });

        }
        let _GET_LAST_OA = () => {
            let new_id = "";
            FunService.getLastOA()
                .then(response => {
                    if (response.data.length) {
                        new_id = response.data[0].id;
                        if (new_id) {
                            let _id = new_id.split('-')
                            let concecutive = _id[1];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = `${_id[0]}-${concecutive}`
                            document.getElementById('submit_2').value = new_id;
                        } else document.getElementById('submit_2').value = "OA" + dayjs().format('YYYY') + "-0001";
                    } else document.getElementById('submit_2').value = "OA" + dayjs().format('YYYY') + "-0001";
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
                });

        }
        // COMPONENT JSX
        let COMPONENT_NEW = () => {
            let _CHILD = GET_SUBMIT();
            return <>
                <div className="space-y-3 text-[clamp(0.78rem,0.72rem+0.2vw,0.92rem)] leading-snug">
                    <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                        <label htmlFor="submit_1" className="mb-1 block font-semibold text-foreground">1. Número de radicación</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="hashtag" size={14} /></span>
                            <input type="text" className="form-control form-control-sm" id="submit_1" required defaultValue={_CHILD.id_public} onBlur={() => _VERIFY_VR_DUPLICATE()} />
                            <Button size="sm" type="button" className="h-[31px] px-2 text-[11px]" onClick={() => _GET_LAST_ID()}>GENERAR</Button>
                        </div>
                        {vrWarning ? <div className="mt-1 text-[11px] leading-snug">{vrWarning}</div> : null}
                    </div>

                    <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                        <label htmlFor="submit_2" className="mb-1 block font-semibold text-foreground">2. Número de solicitud</label>
                        <div className="relative">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-primary text-primary-foreground"><Icon name="hashtag" size={14} /></span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="submit_2"
                                    defaultValue={_CHILD.id_related}
                                    autoComplete="off"
                                    aria-autocomplete="list"
                                    aria-controls="submit_2_options"
                                    aria-expanded={isRequestMenuOpen && requestSuggestions.length > 0}
                                    onChange={event => {
                                        setRequestQuery(event.target.value);
                                        setIsRequestMenuOpen(true);
                                    }}
                                    onFocus={() => setIsRequestMenuOpen(true)}
                                    onBlur={() => setIsRequestMenuOpen(false)}
                                />
                                <Button size="sm" type="button" className="h-[31px] bg-warning px-2 text-[11px] text-warning-foreground hover:bg-warning/90" onClick={() => _VERIFY_RELATED_ID()}>VERIFICAR</Button>
                            </div>
                            {isRequestMenuOpen && requestSuggestions.length > 0 ? (
                                <div
                                    id="submit_2_options"
                                    role="listbox"
                                    className="absolute left-[31px] top-full z-[60] mt-1 max-h-52 min-w-[250px] overflow-y-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-lg"
                                >
                                    {requestSuggestions.map(id => (
                                        <button
                                            key={id}
                                            type="button"
                                            role="option"
                                            aria-selected={requestQuery === id}
                                            className="block w-full cursor-pointer whitespace-nowrap px-3 py-2 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                            onMouseDown={event => event.preventDefault()}
                                            onClick={() => selectRequest(id)}
                                        >
                                            {id}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                        {verifyMSG ? <div className="mt-1 text-[11px] leading-snug">{verifyMSG}</div> : null}
                    </div>

                    <div className="rounded-lg border border-border/70 bg-muted/10 p-2.5">
                        <div className="form-check m-0 flex items-start gap-2 p-0">
                            <input className="form-check-input mt-1 ms-0" type="checkbox" id="payment_cb" onChange={(e) => setPayment(e.target.checked)} />
                            <label className="form-check-label flex-1 text-[0.82em] font-semibold leading-snug text-foreground" htmlFor="payment_cb">Se entrega pago de expensas fijas y generar solicitud</label>
                        </div>
                        {payment
                            ? <div className="mt-2 space-y-2 border-t border-border/60 pt-2">
                                <label htmlFor="submit_21" className="mb-1 block text-[0.82em] font-semibold text-muted-foreground">2.1 Consecutivo pago</label>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-primary text-primary-foreground"><Icon name="hashtag" size={14} /></span>
                                    <input type="text" className="form-control form-control-sm" id="submit_21" required defaultValue={_CHILD.id_related} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" type="button" className="h-8 text-[11px]" onClick={() => _GET_LAST_ID_PUBLIC()}>GENERAR LIC</Button>
                                    <Button size="sm" type="button" className="h-8 text-[11px]" onClick={() => _GET_LAST_ID('submit_2')}>GENERAR VR</Button>
                                </div>
                            </div>
                            : null}
                    </div>

                    <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                        <label htmlFor="submit_4" className="mb-1 block font-semibold text-foreground">3.1 Tipo</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="check-square" size={14} /></span>
                            <input list="submit_type" className="form-control form-control-sm" id="submit_4" defaultValue={_CHILD.type} autoComplete="off" maxLength={250} placeholder="Seleccione o escriba un tipo..." />
                            <datalist id="submit_type">
                                <option value="LICENCIA" />
                                <option value="URBANIZACION" />
                                <option value="PARCELACION" />
                                <option value="SUBDIVISION" />
                                <option value="RECONOCIMIENTO" />
                                <option value="COSTRUCCION" />
                                <option value="OTRAS ACTUACIONES" />
                                <option value="VISTO BUENO" />
                                <option value="PROPIEDAD HORIZONTAL" />
                                <option value="EXPENSAS / IMPUESTOS " />
                            </datalist>
                        </div>
                        <p className="mb-0 mt-1 text-[0.75em] leading-snug text-muted-foreground"><Icon name="info-circle" size={12} /> Puede escoger una opción o escribir un valor libre.</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                            <label htmlFor="submit_42" className="mb-1 block font-semibold text-foreground">3.2 Estado</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-primary text-primary-foreground"><Icon name="hashtag" size={14} /></span>
                                <input type="text" className="form-control form-control-sm" id="submit_42" defaultValue={_CHILD.list_type_str} maxLength={250} />
                            </div>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                            <label htmlFor="submit_41" className="mb-1 block font-semibold text-foreground">3.3 Tipo de radicación</label>
                            <select className='form-select form-select-sm' id="submit_41" defaultValue={_CHILD.list_type}>
                                <option value={1}>RADICACIÓN SOLICITUD</option>
                                <option value={2}>ASESORÍA TÉCNICA</option>
                                <option value={3}>CORRECCIONES SOLICITUD</option>
                                <option value={4}>TRAMITE</option>
                                <option value={5}>PQRS</option>
                                <option value={0}>OTRO</option>
                                {_GLOBAL_ID == 'cp1' ?
                                    <>
                                        <option value={6}>FOTO VALLA</option>
                                        <option value={7}>SOLICITUD LICENCIAS URBANISTICA </option>
                                        <option value={8}>SOLICITUD MODIFICACION LICENCIA VIGENTE</option>
                                        <option value={9}>SOLICITUD DE CONCEPTO DE USO</option>
                                        <option value={10}>SOLICITUD DE NORMA URBANA</option>
                                        <option value={11}>SOLICITUD OTRAS ACTUACIONES</option>
                                        <option value={12}>SOLICITUD PRORROGA</option>
                                        <option value={13}>SOLICITUD REVALIDACION</option>
                                        <option value={14}>PAGO EXPENSAS Y/O IMPUESTOS / OTROS</option>
                                        <option value={15}>DOCUMENTOS PARA RLDF</option>
                                        <option value={16}>DOCUMENTOS ACTAS OBSERVACIONES</option>
                                        <option value={17}>DOCUMENTOS TRAMITE</option>
                                    </>
                                    : null}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                            <label htmlFor="submit_3" className="mb-1 block font-semibold text-foreground">4. Fecha y hora de ingreso</label>
                            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                                <input type="date" max="2100-01-01" className="form-control form-control-sm" id="submit_3" required defaultValue={_CHILD.date} />
                                <input type="time" className="form-control form-control-sm" id="submit_32" defaultValue={_CHILD.time} />
                            </div>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                            <label htmlFor="submit_5" className="mb-1 block font-semibold text-foreground">5. Propietarios</label>
                            <input type="text" className="form-control form-control-sm" id="submit_5" maxLength={250} defaultValue={_CHILD.owner} />
                        </div>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                        <label htmlFor="submit_7" className="mb-1 block font-semibold text-foreground">7. Funcionario que recibe</label>
                        <input type="text" className="form-control form-control-sm" id="submit_7" disabled defaultValue={_CHILD.worker_reciever} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
                        <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                            <label htmlFor="submit_8" className="mb-1 block font-semibold text-foreground">8. Persona que entrega</label>
                            <input type="text" className="form-control form-control-sm" id="submit_8" maxLength={250} defaultValue={_CHILD.name_retriever} />
                        </div>
                        <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                            <label htmlFor="submit_81" className="mb-1 block font-semibold text-foreground">8.1 C.C.</label>
                            <input type="text" className="form-control form-control-sm" id="submit_81" maxLength={250} onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} defaultValue={_CHILD.id_number_retriever} />
                        </div>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-background p-2.5 shadow-sm">
                        <ObservationPanel
                            title="9. Observaciones y detalles"
                            textareaProps={{
                                className: 'form-control form-control-sm',
                                rows: '4',
                                maxLength: '2000',
                                id: 'submit_9',
                                defaultValue: _CHILD.details,
                            }}
                        />
                    </div>
                </div>

            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let handleFormKeyDown = (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
                e.preventDefault();
            }
        };

        let save_submit = (e) => {
            e.preventDefault();
            formData = new FormData();

            let type = document.getElementById("submit_4").value;
            if (type) formData.set('type', type);

            let list_type_str = document.getElementById("submit_42").value;
            if (list_type_str) formData.set('list_type_str', list_type_str);

            let list_type = document.getElementById("submit_41").value;
            if (list_type) formData.set('list_type', list_type);

            let id_related = document.getElementById("submit_2").value;
            if (id_related) formData.set('id_related', id_related);
            if (document.getElementById("payment_cb")) {
                if (document.getElementById("payment_cb").checked) {
                    let id_payment = document.getElementById("submit_21").value;
                    if (id_payment) formData.set('id_payment', id_payment);
                }
            }

            let id_public = document.getElementById("submit_1").value;
            formData.set('id_public', id_public);

            if (isVrDuplicate) {
                swalConfirm({
                    title: "POSIBLE DUPLICADO",
                    text: `El código VR ${id_public} ya existe en ventanilla única. ¿Desea guardar de todos modos?`,
                    icon: 'warning',
                    confirmButtonText: "Guardar de todos modos"
                }).then(result => {
                    if (result.isConfirmed) {
                        manage_submit(id_public);
                    }
                });
                return;
            }

            let date = document.getElementById("submit_3").value;
            if (date) formData.set('date', date);
            let time = document.getElementById("submit_32").value;
            if (time) formData.set('time', time);
            let owner = document.getElementById("submit_5").value;
            if (owner) formData.set('owner', owner);
            let worker_reciever = document.getElementById("submit_7").value;
            if (worker_reciever) formData.set('worker_reciever', worker_reciever);
            if (worker_reciever) formData.set('worker_id', window.user.id);
            let name_retriever = document.getElementById("submit_8").value;
            if (name_retriever) formData.set('name_retriever', name_retriever);
            let id_number_retriever = document.getElementById("submit_81").value;
            if (id_number_retriever) formData.set('id_number_retriever', id_number_retriever);
            let details = document.getElementById("submit_9").value;
            if (details) formData.set('details', details);

            manage_submit(id_public);

        };
        let manage_submit = (id_public) => {
            let _CHILD = GET_SUBMIT();

            // Protección: si estamos en modo edición pero currentItem no ha cargado, bloquear
            if (edit && (!_CHILD.id || !currentItem)) {
                swalError({ title: "DATOS NO CARGADOS", text: "Los datos aún se están cargando. Por favor espere un momento e intente nuevamente." });
                return;
            }

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (_CHILD.id) {
                formData.set('new_id', document.getElementById("submit_1").value);
                formData.set('prev_id', _CHILD.id_public);

                SubmitService.update(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            propRefreshList(currentItem.id);
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            swalError({ title: "ERROR DE DUPLICACIÓN", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                        }
                        else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }
            else {
                SubmitService.create(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            propRefreshList();
                            closeModal();
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            swalError({ title: "ERROR DE DUPLICACIÓN", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                        }
                        else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }
        }

        let renderPrimarySubmitAction = () => (
            edit || currentItem
                ? <Button type="submit" size="sm" className="w-full justify-center md:w-auto"><Icon name="edit" size={16} /> GUARDAR CAMBIOS </Button>
                : <Button type="submit" size="sm" className="w-full justify-center md:w-auto"><Icon name="plus-circle" size={16} /> CREAR </Button>
        );

        return (
            <div className="grid h-full min-h-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(390px,0.36fr)_minmax(0,0.64fr)]">
                <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                    <form id="form_manage_submit" onSubmit={save_submit} onKeyDown={handleFormKeyDown} className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 overflow-y-auto p-2">
                            <div className="space-y-3">
                                {COMPONENT_NEW()}
                            </div>
                        </div>

                        <div className="sticky bottom-0 z-10 shrink-0 space-y-2 border-t border-border/60 bg-card/95 px-3 py-2 backdrop-blur">
                            <div className="flex justify-end">
                                {renderPrimarySubmitAction()}
                            </div>
                        </div>
                    </form>

                    {currentItem ? <div className="shrink-0 border-t border-border/60 bg-card px-2 py-2">
                        <SUBMIT_ANEX
                            swaMsg={swaMsg}
                            currentItem={currentItem}
                            refreshList={refreshList}
                            refreshItem={refreshItem}
                            variant="primary"
                            onDigitalCountChange={handleDigitalDocumentsChange}
                        />
                    </div> : null}
                </aside>

                <section className="flex min-h-0 flex-col overflow-hidden">
                    {currentItem
                        ? <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                                <div className="min-h-0 flex-1 overflow-hidden p-1.5">
                                    <SUBMIT_LIST
                                        translation={translation}
                                        swaMsg={swaMsg}
                                        globals={globals}
                                        currentItem={currentItem}
                                        refreshList={refreshItem}
                                        activePanel={documentPanel}
                                        digitalCount={digitalCount}
                                        digitalDocuments={digitalDocuments}
                                        onPanelChange={setDocumentPanel}
                                        renderDigitalPanel={() => <SUBMIT_ANEX
                                            swaMsg={swaMsg}
                                            currentItem={currentItem}
                                            refreshList={refreshList}
                                            refreshItem={refreshItem}
                                            variant="digital"
                                            onDigitalCountChange={handleDigitalDocumentsChange}
                                        />}
                                    />
                                </div>
                            </section>
                        : <div className="flex min-h-64 flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
                            <p className="mb-0 max-w-md text-sm text-muted-foreground">
                                Primero guarda la entrada para habilitar listas físicas y documentos digitales.
                            </p>
                        </div>}
                </section>
            </div>
        );
}

export default SUBMIT_MANAGE;

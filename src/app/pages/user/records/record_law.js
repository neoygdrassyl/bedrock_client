import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { LegacyModal as Modal } from '@/components/legacy-modal';

import FUN_SERVICE from '../../../services/fun.service';
import submitService from '../../../services/submit.service';

import RECORD_ARCSERVICE from '../../../services/record_arc.service';
import RECORD_LAW_SERVICE from '../../../services/record_law.service';
import RECORD_ENG_SERVICE from '../../../services/record_eng.service';

import FUN_VERSION_NAV from '../fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun_forms/components/fun_moduleNav';
import RECORD_LAW_EVALUATION from './law/record_law_review';
import CLOCKS_CONTROL from '../fun_forms/components/clocks_control.component';
import SHORT_INFO from '../fun_forms/components/shot_info.component';
import RECORD_ARC_32 from './arc/record_arc_32';
import RECORD_LAW_DOCSCHECK from './law/record_law_docs_check';
import RECORD_LAW_STEP_1 from './law/record_law_step1.cmponent';
import RECORD_LAW_FUN_1 from './law/record_law_fun_1.component';
import IdentificationRequestDataGrid from './law/IdentificationRequestDataGrid';
import RECORD_LAW_FUN_2 from './law/record_law_fun_2.component';
import PropertyInformationDataGrid from './law/PropertyInformationDataGrid';
import RECORD_LAW_GEN2_11 from './law/record_law_gen2_11';
import RECORD_LAW_FUN_51 from './law/record_law_fun_51.component';
import LicenseHolderDataGrid from './law/LicenseHolderDataGrid';
import RECORD_LAW_FUN_52 from './law/record_law_fun_52.component';
import ProfessionalDataGrid from './law/ProfessionalDataGrid';
// Temporary: the new professional-responsibility matrix is pending approval.
// import ProfessionalResponsibilityMatrixNew from './law/ProfessionalResponsibilityMatrixNew';
import RECORD_LAW_FUN_53 from './law/record_law_fun_53.component';
import ApplicantResponsibleDataGrid from './law/ApplicantResponsibleDataGrid';
import RECORD_LAW_PROFESIONALS from './law/record_law_profesionals';
import RECORD_LAW_FUN_LAW from './law/record_law_fun_law.component';
import FUN_6_VIEW from '../fun_forms/fun_6.view';
import FUNN51 from '../fun_forms/fun_n_51';
import RECORDS_BINNACLE from './records_binnacles.component';
import funService from '../../../services/fun.service';
import { swalError, swalSuccess } from '@/app/utils/swalAdapter';
import RecordReviewWorkspace from './components/RecordReviewWorkspace';
import { buildFunInformationViewModel } from './law/funInformationViewModel';

// Preserve the original Información Jurídica tables while the replacements remain under review.
const SHOW_NEW_FUN_1_TABLE = false;
const SHOW_LEGACY_FUN_2_TABLE = true;
const SHOW_NEW_FUN_2_TABLE = false;
const SHOW_LEGACY_FUN_51_TABLES = true;
const SHOW_NEW_FUN_51_TABLE = false;
const SHOW_LEGACY_FUN_52_TABLES = true;
const SHOW_NEW_FUN_52_TABLE = false;
const SHOW_LEGACY_FUN_53_TABLE = true;
const SHOW_NEW_FUN_53_TABLE = false;

// RECORDS

function RECORD_LAW({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION, hideInlineBinnacles = false }) {
    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentVersionR, setCurrentVersionR] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editingLicenseHolder, setEditingLicenseHolder] = useState(null);
    const [reviewLinkError, setReviewLinkError] = useState('');

    const sharedFunInformationViewModel = useMemo(() => currentItem
        ? buildFunInformationViewModel({ currentItem, currentVersion })
        : null, [currentItem, currentVersion]);

    const retrievePQRSxFUN = useCallback((id_public) => {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const retrieveItem = useCallback((id) => {
        return FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                retrievePQRSxFUN(response.data.id_public);
                return response.data;
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
                return null;
            });
    }, [swaMsg, retrievePQRSxFUN]);

    const setItem_RecordArc = useCallback(() => {
        RECORD_LAW_SERVICE.getRecord(currentId)
            .then(response => {
                const records = Array.isArray(response.data) ? response.data : [];
                const record = records.find(item => String(item?.fun0Id) === String(currentId) && String(item?.version) === String(currentVersion));
                if (!record) {
                    setCurrentRecord(null);
                    setCurrentVersionR(null);
                    setReviewLinkError(records.length ? 'No existe una revisión jurídica para la versión FUN activa.' : 'No existe una revisión jurídica para este expediente.');
                    setLoaded(true);
                } else {
                    setCurrentRecord(record);
                    setCurrentVersionR(record.version);
                    setReviewLinkError('');
                    setLoaded(true);
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }, [currentId, currentVersion, swaMsg]);

    const requestUpdateRecord = (id) => {
        RECORD_LAW_SERVICE.getRecord(id)
            .then(response => {
                const records = Array.isArray(response.data) ? response.data : [];
                const expectedVersion = currentVersionR ?? currentVersion;
                const record = records.find(item => String(item?.fun0Id) === String(id) && String(item?.version) === String(expectedVersion));
                setCurrentRecord(record || null);
                setCurrentVersionR(record?.version ?? null);
                setReviewLinkError(record ? '' : 'No existe una revisión jurídica para la versión FUN activa.');
                setLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    };

    const requestUpdate = (id) => {
        return retrieveItem(id);
    };

    const openLicenseHolderEditor = (holderId) => {
        const holders = Array.isArray(currentItem?.fun_51s) ? currentItem.fun_51s : [];
        const holder = holders.find(item => String(item.id) === String(holderId));
        if (!holder || holder.id === undefined || holder.id === null || holder.id === '') {
            swalError({ title: swaMsg.generic_eror_title, text: 'No fue posible identificar el titular a actualizar.' });
            return;
        }
        setEditingLicenseHolder(holder);
    };

    const navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                setCurrentVersionR(prev => prev - 1);
                break;
            case "plus":
                setCurrentVersionR(prev => prev + 1);
                break;
        }
    };

    useEffect(() => {
        setItem_RecordArc();
        retrieveItem(currentId);
    }, [currentId, setItem_RecordArc, retrieveItem]);

    useEffect(() => {
        if (!currentRecord || !currentItem || String(currentRecord.fun0Id) === String(currentItem.id)) return;
        setCurrentRecord(null);
        setCurrentVersionR(null);
        setReviewLinkError('La revisión jurídica no corresponde al expediente cargado.');
    }, [currentItem, currentRecord]);
        const rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        var formData = new FormData();
        const quickModalStyle = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 1050,
            },
            content: {
                position: 'absolute',
                top: '15%',
                left: '25%',
                right: '25%',
                bottom: '15%',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',

            }
        };
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
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_52 = () => {
            var _CHILD = currentItem.fun_52s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_REVIEW = () => {
            var _CHILD = currentItem.fun_rs;
            var _CURRENT_VERSION = currentVersion - 1;
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD = _CHILD[_CURRENT_VERSION]
                } else {
                    _CHILD = false
                }
            }
            return _CHILD;
        }
        let new_record_law = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            formData.set('version', 1);
            RECORD_LAW_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdateRecord(currentItem.id)
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }

        let save_fun0 = () => {
            var formData0 = new FormData();
            let currentRules = rules;

            currentRules[0] = document.getElementById('fun_0_rules').checked ? 1 : 0;

            formData0.set('rules', currentRules.join(';'));

            funService.update(currentItem.id, formData0).then(response => {
                if (response.data === 'OK') retrieveItem(currentItem.id)
            });
        }
        return (
            <div className="record_arc container">
                {currentItem != null ? <>
                    {loaded ? <>
                        {currentRecord
                            ? <>

                                <legend className="my-2 px-3 Collapsible" id="record_law_gen">
                                    <label className="app-p lead fw-normal">I. CONTROL DEL DEBIDO PROCESO DE LA SOLICITUD</label>
                                </legend>
                                {
                                    /**
                                     * <SHORT_INFO translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion} />
                                     * 
                                     * 
                                     */

                                }

                                <CLOCKS_CONTROL translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                />

                                <legend className="my-2 px-3 Collapsible" id="record_law_gen_2">
                                    <label className="app-p lead fw-normal">II. Observaciones Jurídicas</label>
                                </legend>

                                <legend className="my-2 px-3 bg-light" id="record_law_21">
                                    <label className="app-p lead fw-normal">2.1 TIPO DE SOLICITUD</label>
                                </legend>
                                <RECORD_ARC_32 translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion} />
                                {!hideInlineBinnacles ? <>
                                    <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        SERVICE={RECORD_LAW_SERVICE}
                                        requestUpdateRecord={requestUpdateRecord}
                                        AIM={"Jurídico"}
                                    />
                                    <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        SERVICE={RECORD_ARCSERVICE}
                                        requestUpdateRecord={requestUpdateRecord}
                                        AIM={"Arquitectura"}
                                        PATH={"record_arc"}
                                        readOnly
                                    />
                                    <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        SERVICE={RECORD_ENG_SERVICE}
                                        requestUpdateRecord={requestUpdateRecord}
                                        AIM={"Estructural"}
                                        readOnly />
                                </> : null}

                                <legend className="my-2 px-3 bg-light" id="record_law_22">
                                    <label className="app-p lead fw-normal">2.2 Revisión documental</label>
                                </legend>
                                <RecordReviewWorkspace
                                    inventoryLabel="2.2 Inventario de Información Aportada"
                                    documentsLabel="2.3 Expediente documental"
                                    documentsId="record_law_23"
                                    inventoryContent={<RECORD_LAW_DOCSCHECK
                                        _FUN_1={_GET_CHILD_1()}
                                        _FUN_6={_GET_CHILD_6()}
                                        _FUN_R={_GET_CHILD_REVIEW()}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        requestUpdate={requestUpdate}
                                        docsScope={'law'}
                                        hideNotApplicableDefault
                                        showFilters
                                    />}
                                    documentsContent={<FUN_6_VIEW
                                        translation={translation}
                                        swaMsg={swaMsg}
                                        globals={globals}
                                        currentItem={currentItem}
                                        currentId={currentId}
                                        currentVersion={currentVersion}
                                        requestUpdate={requestUpdate}
                                        readOnly
                                        mergeVentanilla
                                    />}
                                    professionalsLabel="Profesionales del proyecto"
                                    professionalsContent={<RECORD_LAW_PROFESIONALS
                                        translation={translation}
                                        swaMsg={swaMsg}
                                        globals={globals}
                                        _FUN_1={_GET_CHILD_1()}
                                        _FUN_52={_GET_CHILD_52()}
                                    />}
                                />

                                <legend className="my-2 px-3 bg-light" id="record_law_25">
                                    <label className="app-p lead fw-normal">2.5 Formulario Único Nacional</label>
                                </legend>

                                <RECORD_LAW_STEP_1
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                />

                                <RECORD_LAW_FUN_1
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />

                                 {SHOW_NEW_FUN_1_TABLE ? <IdentificationRequestDataGrid
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                     currentVersionR={currentVersionR}
                                     requestUpdateRecord={requestUpdateRecord}
                                      viewModel={sharedFunInformationViewModel}
                                 /> : null}

                                {SHOW_NEW_FUN_2_TABLE ? <PropertyInformationDataGrid
                                    currentItem={currentItem}
                                    currentRecord={currentRecord}
                                     currentVersionR={currentVersionR}
                                     requestUpdateRecord={requestUpdateRecord}
                                      viewModel={sharedFunInformationViewModel}
                                 /> : null}

                                {SHOW_LEGACY_FUN_2_TABLE ? <RECORD_LAW_FUN_2
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                /> : null}

                                {SHOW_LEGACY_FUN_51_TABLES ? <RECORD_LAW_FUN_51
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                /> : null}

                                {SHOW_NEW_FUN_51_TABLE ? <LicenseHolderDataGrid
                                    currentItem={currentItem}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                     requestUpdateRecord={requestUpdateRecord}
                                     onEdit={openLicenseHolderEditor}
                                      viewModel={sharedFunInformationViewModel}
                                 /> : null}

                                <Modal contentLabel="Actualizar titular" isOpen={Boolean(editingLicenseHolder)} onRequestClose={() => setEditingLicenseHolder(null)} ariaHideApp={false} style={quickModalStyle}>
                                    <div className="p-2"><div className="mb-2 flex justify-end"><Button type="button" size="sm" variant="outline" onClick={() => setEditingLicenseHolder(null)}><Icon name="times-circle" size={14} /></Button></div><FUNN51 translation={translation} swaMsg={swaMsg} globals={globals} currentItem={currentItem} currentVersion={currentVersion} requestUpdate={requestUpdate} initialEdit={editingLicenseHolder} /></div>
                                </Modal>

                                {SHOW_LEGACY_FUN_52_TABLES ? <RECORD_LAW_FUN_52
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                /> : null}

                                {SHOW_NEW_FUN_52_TABLE ? <ProfessionalDataGrid
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                     requestUpdate={requestUpdate}
                                     quickModalStyle={quickModalStyle}
                                      viewModel={sharedFunInformationViewModel}
                                 /> : null}

                                {/* Temporary: the new professional-responsibility matrix is pending approval.
                                <ProfessionalResponsibilityMatrixNew
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                /> */}

                                {SHOW_LEGACY_FUN_53_TABLE ? <RECORD_LAW_FUN_53
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                /> : null}

                                {SHOW_NEW_FUN_53_TABLE ? <ApplicantResponsibleDataGrid
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                     currentVersionR={currentVersionR}
                                     requestUpdateRecord={requestUpdateRecord}
                                      viewModel={sharedFunInformationViewModel}
                                 /> : null}

                                <RECORD_LAW_GEN2_11
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />

                                <legend className="my-2 px-3 bg-light" id="record_law_26">
                                    <label className="app-p lead fw-normal">2.6 ACCIONES DE PUBLICIDAD DEL PROCESO</label>
                                </legend>

                                <div className="row border my-2 py-4 border border-warning bg-body-secondary" style={{ borderWidth: '3px' }}>
                                    <div className="col-4"></div>
                                    <div className="col-4">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" value="1" id="fun_0_rules" defaultChecked={rules[0] == 1} 
                                            onChange={() => save_fun0()}/>
                                            <h2 className="form-check-label">No usar Publicidad</h2>
                                        </div>
                                    </div>
                                </div>

                                {rules[0] != 1 ? <>
                                    <RECORD_LAW_FUN_LAW
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        requestUpdate={requestUpdate}
                                        requestUpdateRecord={requestUpdateRecord}
                                        quickModalStyle={quickModalStyle}
                                    />
                                </> : ''}

                                <legend className="my-2 px-3 Collapsible" id="record_law_gen_3">
                                    <label className="app-p lead fw-normal">III. Viabilidad Jurídica</label>
                                </legend>
                                <RECORD_LAW_EVALUATION
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord}
                                />

                                {/* {NAV_FUNA(_GET_CHILD_1())} */}
                            </> : <>

                                <fieldset className="p-3">
                                    {reviewLinkError ? <p className="text-center text-sm text-muted-foreground" role="status">{reviewLinkError}</p> : null}
                                    <div className="text-center">
                                        <Button size="sm" onClick={() => new_record_law()}><Icon name="FilePlus" size={14} /> Generar informe en blanco</Button>
                                    </div>
                                </fieldset>

                            </>}
                    </> : <div className="text-center">
                        <h3 className="fw-bold ">CARGANDO INFORMACION...</h3>
                    </div>}
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentRecord}
                        currentVersion={currentVersionR}
                        NAVIGATION_VERSION={navigation_version}
                        _RECORD
                    />
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"record_law"}
                        NAVIGATION={NAVIGATION}
                        pqrsxfun={pqrsxfun}
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}
            </div >
        );
}

const NAV_FUNA = (_CHILD) => {
    let _REGEX_MATCH_PH = (_string) => {
        let regex0 = /p\.\s+h/i;
        let regex1 = /p\.h/i;
        let regex2 = /PROPIEDAD\s+HORIZONTAL/i;
        if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string)) return true;
        return false
    }
    return (
        <div className="btn-navpqrs">
            <div className="fung_nav">
                <div className="rounded-lg border border-border bg-card">
                    <div className="p-1">
                        <legend className="px-3 pt-2 bg-light text-center">
                            <h6>Menu de Navegación</h6>
                        </legend>
                        <br />
                        <a href="#record_law_gen">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>I. CONTROL DEL DEBIDO PROCESO DE LA SOLICITUD</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_gen_2">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>II. Observaciones Jurídicas</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_21">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>2.1 TIPO DE SOLICITUD</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_22">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>2.2 REVISIÓN DOCUMENTAL</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_23">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>2.3 EXPEDIENTE DOCUMENTAL</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_25">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>2.5 Formulario Único Nacional</h6>
                            </legend>
                        </a>
                        <a href="#record_law_26">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>2.6 ACCIONES DE PUBLICIDAD DEL PROCESO</h6>
                            </legend>
                        </a>
                        <a href="#record_law_gen_3">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>III. Viabilidad Jurídica</h6>
                            </legend>
                        </a>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default RECORD_LAW;

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/ui/button';

import FUN_SERVICE from '../api/fun.service';
import EXPEDITION_SERVICE from '../api/expedition.service';
import RECORD_LAW_SERVICE from '../api/record_law.service';
import FUN_VERSION_NAV from '../fun/fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun/fun_forms/components/fun_moduleNav';
import CUSTOM_DATA_SERVICE from '../../../shared/api/custom.service';
import EXP_1 from './exp_1.component';
import EXP_AREAS from './exp_areas.component';
import EXP_DOCS from './exp_docs.component';
import EXP_LIC from './exp_lic.component';
import { regexChecker_isOA_2, regexChecker_isPh } from '../../../shared/config/customClasses/typeParse';
import EXP_2 from './exp_2.component';
import { swalError, swalSuccess } from '@/shared/utils/swalAdapter';
import { SectionCard } from '@/shared/components/SectionCard';
import { useActionGuard } from './useActionGuard';

function EXP_CLOCKS_ACCESS({ currentItem, NAVIGATION, step }) {
    const canOpenTimes = currentItem && typeof NAVIGATION === 'function';

    return (
        <SectionCard
            id="nav_expedition_clock_redirect"
            title={`${step ? `${step}. ` : ''}Tiempos`}
            actions={
                <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => canOpenTimes && NAVIGATION(currentItem, 'clock', 'expedition')}
                    disabled={!canOpenTimes}
                >
                    Abrir submódulo de tiempos
                </Button>
            }
        >
            <p className="ew-toolbar__meta m-0" data-testid="exp-clocks-link">
                Las fechas de expedición, notificación y entrega se gestionan desde el submódulo de tiempos.
            </p>
        </SectionCard>
    );
}

/** Purely navigational: jumps to a step card of the module. */
function EXP_STEP_INDEX({ steps }) {
    const goTo = (id) => {
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };

    return (
        <nav className="ew-steps" aria-label="Pasos de la expedición">
            <ol>
                {steps.map((item, index) => (
                    <li key={item.id}>
                        <button type="button" className="ew-steps__item" onClick={() => goTo(item.id)}>
                            <span className="ew-steps__number" aria-hidden="true">{index + 1}</span>
                            <span>{item.title}</span>
                        </button>
                    </li>
                ))}
            </ol>
        </nav>
    );
}

function EXPEDITION(props) {
    const { currentId, currentVersion, swaMsg, translation, globals, closeModal: closeModalProp, requesRefresh, NAVIGATION } = props;

    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentVersionR, setCurrentVersionR] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [recordArc, setRecordArc] = useState(null);
    const [, setOutCodes] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const guard = useActionGuard(4000);

    const requestOutCodes = useCallback((id) => {
        CUSTOM_DATA_SERVICE.loadDictionary_cub_id(id)
            .then(response => {
                setOutCodes(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

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
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                retrievePQRSxFUN(response.data.id_public);
                requestOutCodes(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    }, [requestOutCodes, retrievePQRSxFUN]);

    const setItem_Record = useCallback(() => {
        EXPEDITION_SERVICE.getRecord(currentId)
            .then(response => {
                if (response.data.length < 1) {
                    setCurrentRecord(null);
                    setCurrentVersionR(null);
                    setLoaded(true);
                } else {
                    setCurrentRecord(response.data[0]);
                    setCurrentVersionR(response.data[0].version);
                    setLoaded(true);
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }, [currentId, swaMsg.generic_eror_title, swaMsg.generic_error_text]);

    const requestUpdateRecord = (id) => {
        EXPEDITION_SERVICE.getRecord(id)
            .then(response => {
                if (response.data.length < 1) {
                    setCurrentRecord(null);
                    setCurrentVersionR(null);
                    setLoaded(true);
                } else {
                    setCurrentRecord(response.data[0]);
                    setCurrentVersionR(response.data[0].version);
                    setLoaded(true);
                }
            })
            .catch(e => {
                console.log(e);
            });
    };

    const requestUpdate = (id) => {
        retrieveItem(id);
    };

    const setItem_RecordArc = useCallback(() => {
        RECORD_LAW_SERVICE.getRecord(currentId)
            .then(response => {
                if (response.data.length < 1) {
                    setRecordArc({});
                } else {
                    setRecordArc(response.data[0]);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }, [currentId]);

    const closeModal = () => {
        closeModalProp();
        requesRefresh();
    };

    useEffect(() => {
        setItem_Record();
        retrieveItem(currentId);
        setItem_RecordArc();
    }, [currentId, retrieveItem, setItem_Record, setItem_RecordArc]);

        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS = {
                        item_0: _CHILD[_CURRENT_VERSION].id,
                        tipo: _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "",
                        tramite: _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "",
                        m_urb: _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "",
                        m_sub: _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "",
                        m_lic: _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "",
                        item_6: _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "",
                        item_7: _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "",
                        item_8: _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "",
                        item_9: _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "",
                        item_101: _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "",
                        item_102: _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "",
                    }
                }
            }
            return _CHILD_VARS;
        }
        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
        let isPH = () => regexChecker_isPh(currentItem ? _GET_CHILD_1() : false, true)
        const isOtherActuation = currentItem ? conOA() : false;
        const isPropertyHorizontal = currentItem ? isPH() : false;
        // Steps of the module in the order they are mounted below (same conditions as the render).
        const steps = [{ id: 'nav_expedition_1', title: 'Liquidación y pagos' }];
        if (!isOtherActuation && !isPropertyHorizontal) steps.push({ id: 'nav_expedition_10', title: 'Áreas y unidades' });
        if (!isPropertyHorizontal) {
            steps.push(
                { id: 'nav_expedition_control', title: 'Control para entidades' },
                { id: 'nav_expedition_20', title: 'Documentos de pago' },
                { id: 'nav_expedition_documents', title: 'Actos y documentos' },
                { id: 'nav_expedition_clock_redirect', title: 'Tiempos' },
                { id: 'nav_expedition_4', title: 'Cierre de la solicitud' },
            );
        }
        const stepOf = (id) => steps.findIndex(item => item.id === id) + 1;
        const moduleLoading = (id) => (
            <section className="ew-card" id={id} aria-busy="true">
                <p className="ew-toolbar__meta m-0" role="status">Cargando información…</p>
            </section>
        );
        // DATA CONVERTERS
        // JSX CONTROLLERS

        // COMPONENT JSX

        // APIS
        var formData = new FormData();

        let new_expedition = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            return EXPEDITION_SERVICE.create(formData)
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

        return (
            <div className="record_ph container">
                {currentItem != null ? <>
                    {loaded ? <>
                        {currentRecord
                            ? <>
                                <>
                                    <EXP_STEP_INDEX steps={steps} />
                                    <EXP_1
                                        step={stepOf('nav_expedition_1')}
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                    requestUpdate={requestUpdate}
                                    requestUpdateRecord={requestUpdateRecord} />

                                    {!isOtherActuation && !isPropertyHorizontal ? <>
                                        <EXP_AREAS
                                            step={stepOf('nav_expedition_10')}
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdate={requestUpdate}
                                            requestUpdateRecord={requestUpdateRecord} />
                                    </> : ''}

                                    {!isPropertyHorizontal ?
                                        <>
                                            <EXP_2
                                                step={stepOf('nav_expedition_control')}
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                            requestUpdate={requestUpdate}
                                            requestUpdateRecord={requestUpdateRecord} />

                                            <EXP_DOCS
                                                step={stepOf('nav_expedition_20')}
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                recordArc={recordArc}
                                                requestUpdate={requestUpdate}
                                                requestUpdateRecord={requestUpdateRecord} />

                                            <EXP_CLOCKS_ACCESS
                                                step={stepOf('nav_expedition_clock_redirect')}
                                                currentItem={currentItem}
                                                NAVIGATION={NAVIGATION}
                                            />

                                            <EXP_LIC
                                                step={stepOf('nav_expedition_4')}
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={requestUpdate}
                                                closeModal={closeModal}
                                            />
                                        </> : null}

                                    {/* {NAV_FUNA()} */}

                                </>
                            </> : <>
                                <section className="ew-card">
                                    <div className="ew-empty">
                                        <h2 className="ew-empty__title">Este expediente aún no tiene expedición</h2>
                                        <p className="ew-empty__text">Genere el registro en blanco para liquidar, producir los actos y cerrar la solicitud.</p>
                                        <Button size="sm" type="button" onClick={guard(() => new_expedition(), 'new_expedition')}>
                                            {isPropertyHorizontal ? 'Generar expedición P.H. en blanco' : 'Generar expedición en blanco'}
                                        </Button>
                                    </div>
                                </section>
                            </>}
                    </> : moduleLoading()}
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentRecord}
                        currentVersion={currentVersionR}
                        NAVIGATION_VERSION={undefined}
                        _RECORD
                    />
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"expedition"}
                        NAVIGATION={NAVIGATION}
                        pqrsxfun={pqrsxfun}
                    />
                </> : moduleLoading('fung_0')}
            </div >
        );
}

const NAV_FUNA = (_CHILD) => {
    return (
        <div className="btn-navpqrs">
            <div className="fung_nav">
                <div className="rounded-lg border border-border bg-card">
                    <div className="p-1">
                        <legend className="px-3 pt-2 bg-light text-center">
                            <h6>Menu de Navegación</h6>
                        </legend>
                        <br />
                        <a href="#nav_expedition_1">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>INFORMACIÓN GENERAL</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_10">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>AREAS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_20">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>PAGOS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_21">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>Acto de tramite de licencia</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_22">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>Liquidación de Expensas</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_23">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>Impuestos Municipales</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_24">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>Estampilla PRO-UIS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_25">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>Deberes Urbanísticos</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_26">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>DOCUMENTOS</h6>
                            </legend>
                        </a>

                        <a href="#nav_expedition_28">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>Acto Administrativo / Resolución</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_27">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>CERTIFICACIÓN DE EJECUTORIA</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_29">
                            <legend className="px-3 rounded text-sm font-medium bg-muted text-muted-foreground">
                                <h6>Licencia</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_3">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>EXPEDICIÓN</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_4">
                            <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                                <h6>CERRAR SOLICITUD</h6>
                            </legend>
                        </a>
                        <br />
                    </div>
                </div>
            </div>
        </div>
    );
}

void NAV_FUNA;

export default EXPEDITION;

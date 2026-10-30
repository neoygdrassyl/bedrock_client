import { Fragment, useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/ui/button';

import Icon from '@/shared/components/icon';
import FUN_SERVICE from '../../../api/fun.service';
import Codes from '../../../../../shared/config/jsons/fun6DocsList.json';
import { SERIES_DOCS, _GET_SERIE_COD, _GET_SERIE_STR, _GET_SUBSERIE_COD, _GET_SUBSERIE_STR } from '../../../../../shared/config/customClasses/typeParse';
import { swalClose, swalError, swalLoading, swalSuccess } from '@/shared/utils/swalAdapter';
import { normalizeDocumentControlPages } from './documentControlPages';
import { downloadProtectedPdf } from '@/shared/utils/pdfDownload';
import { useDocumentaryInventory } from '../../../documental/hooks/useDocumentaryInventory';
import { inventoryBlocker } from '../../../documental/documentaryInventoryModel';
import { CANONICAL_SAVE_UNAVAILABLE_HINT, generatorSaveErrorText } from './generatorSavePolicy';
import { CONTROL_SHEET_ALL, CONTROL_SHEET_CATEGORIES, controlSheetCounts, controlSheetGroups, controlSheetRows, filterControlSheetRows } from '../../../documental/controlSheetModel';
import { useLegalForm } from '../../../documental/hooks/useLegalForm';
import { controlSheetDefaults, controlSheetReviewPlan, SHEET_SKIP_REASONS } from '../../../documental/legalFormModel';
import { legalFormErrorMessage, saveLegalFormReview } from '@/features/expediente/api/documentaryLegalForm.service';

const CONTROL_SHEET_REASON = 'Hoja de control documental';
const LEGAL_FORM_LOADING = 'Cargando legal y debida forma...';
const REVIEW_LOCKED = 'Las revisiones no se pueden cambiar: el expediente ya fue declarado en legal y debida forma o su usuario no tiene permiso.';

/** Saves the sheet verdicts and folio ranges as legal y debida forma reviews (canonical expedientes). */
export async function saveControlSheetReviews(fun0Id, legalForm, entries) {
    const plan = controlSheetReviewPlan(legalForm, entries, CONTROL_SHEET_REASON);
    let saved = 0;
    for (const command of plan.commands) {
        await saveLegalFormReview(fun0Id, command.documentCode, command.body);
        saved += 1;
    }
    return { saved, skipped: plan.skipped };
}

function FUN_D_CONTROL({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate, canonicalSaveBlocked = false }) {
    // Canonical expedientes read statuses and folios from the documentary inventory (null for legacy).
    const documentaryInventory = useDocumentaryInventory(currentItem);
    // Canonical expedientes keep the reviewer verdicts in legal y debida forma (null for legacy).
    const legalForm = useLegalForm(documentaryInventory ? currentItem.id : null);
    const legalFormBlocker = legalForm && !legalForm.data ? (legalForm.error || LEGAL_FORM_LOADING) : null;
    // Canonical expedientes list every document of the inventory, filtered by category; edits are
    // kept per row so switching the filter never loses what was typed.
    const [category, setCategory] = useState(CONTROL_SHEET_ALL);
    const [edits, setEdits] = useState({});
    const canonicalRows = useMemo(
        () => (documentaryInventory?.status === 'ready' && documentaryInventory.inventory?.raw ? controlSheetRows(documentaryInventory.inventory.raw) : null),
        [documentaryInventory],
    );

    const _GET_CHILD_1 = () => {
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

    useEffect(() => {
        let SERIE = document.getElementById('fun_doc_control_0').value;
        let _CHILD = _GET_CHILD_1();
        if (!SERIE) SERIE = 0;
        let str = _GET_SERIE_STR(_CHILD)
        document.getElementById('fun_doc_control_1').value = str;

        SERIE = document.getElementById('fun_doc_control_2').value;
        if (!SERIE) SERIE = 0;
        str = _GET_SUBSERIE_STR(_CHILD);
        document.getElementById('fun_doc_control_3').value = str;
    }, []);
        const _SERIES_DOCS = SERIES_DOCS
        // DATA GETTERS
    
        let _SET_CHILD_REVIEW = () => {
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

        // DATA CONVERTERS
        let _GET_FUNR_CHECK_CONTROL = (_INDEX) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_OF_CODES = _CHILD_REVIEW.check_control ? _CHILD_REVIEW.check_control.split(",") : [];
                let _value = _ARRAY_OF_CODES[_INDEX]
                if (_value) return _value
                else return null
            }
        }
        let _GET_FUNR_CHECK_CONTROL_PAGES = (_INDEX) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_OF_CODES = _CHILD_REVIEW.check_control_pages ? _CHILD_REVIEW.check_control_pages.split(",") : [];
                let _value = _ARRAY_OF_CODES[_INDEX]
                if (_value) return _value
                else return null
            }
        }
        let _GET_FUNR_CODE = (_CODE) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_CODES = _CHILD_REVIEW.code ? _CHILD_REVIEW.code.split(",") : [];
                let _ARRAY_VALUES = _CHILD_REVIEW.checked ? _CHILD_REVIEW.checked.split(",") : [];
                let _code_index = _ARRAY_CODES.indexOf(String(_CODE))
                if (_code_index != -1) return _ARRAY_VALUES[_code_index];
                else return null
            }
        }
        // COMPONENT JSX
        let _GET_SERIES = () => {
            let _CHILD = _GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
            return <>
                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Series Documental:</label>
                    </div>
                    <div className="col-3">
                        <input className="form-control me-1" id="fun_doc_control_0" defaultValue={_SERIE[0]}  disabled />
                    </div>
                    <div className="col-6">
                        <input type="text" className="form-control me-1" id="fun_doc_control_1" disabled defaultValue={''} />
                    </div>
                </div>

                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Subseries Documental:</label>
                    </div>
                    <div className="col-3">
                        <input className="form-control me-1" id="fun_doc_control_2" defaultValue={_SUBSERIE[0]}  disabled  />
                         
                    </div>
                    <div className="col-6">
                        <input type="text" className="form-control me-1" id="fun_doc_control_3" disabled
                            defaultValue={''} />
                    </div>
                </div>

                {_SERIE.length > 1 || _SUBSERIE.length > 1
                    ? <div className="row my-2">
                        <label className="text-danger fw-bold">AMBIGÜEDAD DE SERIES O SUBSERIES ENCONTRADA</label><br />
                        <label className="fw-bold">El sistema ha detectado varias series o varias subseries validas para esta solicitud</label>
                    </div>
                    : ""}

                {_SERIE.length == 0 || _SUBSERIE.length == 0
                    ? <div className="row my-2">
                        <label className="text-danger fw-bold">SERIE O SUBSERIE NO ENCONTRADA</label><br />
                        <label className="fw-bold">El sistema no ha podido identificar una serie o subserie, revise la modalidad de la solicitud.</label>
                    </div>
                    : ""}

                {_SERIE.length == 1 && _SUBSERIE.length <= 1
                    ? <div className="row my-2">
                        <form id="form_manage_ph_gen" onSubmit={save_fun_r}>
                            <div className="row mb-3 text-center">
                                <div className="col">
                                    {canonicalSaveBlocked
                                        ? <span className="d-block my-3 text-muted small" role="status">{CANONICAL_SAVE_UNAVAILABLE_HINT}</span>
                                        : <Button size="sm" className="my-3"><Icon name="edit" size={16} /> GUARDAR CAMBIOS </Button>}
                                </div>
                                <div className="col">
                                    <Button type="button" variant="destructive" size="sm" className="my-3" onClick={() => gen_pdf()} ><Icon name="file-pdf" size={16} /> GENERAR PDF </Button>
                                </div>
                            </div>
                            {canonicalRows ? _CATEGORY_FILTER() : null}
                            <ul className="list-group mx-2">
                                <li className="list-group-item">
                                    <div className="row">
                                        <div className="col-1 text-center"><label className="fw-bold">N° Orden</label></div>
                                        <div className="col text-center"><label className="fw-bold">Nombre Tipologia Documental</label></div>
                                        <div className="col-1 text-center"><label className="fw-bold">Codigo Tipologia</label></div>
                                        <div className="col-2 text-center"><label className="fw-bold">Rango de folios</label></div>
                                        <div className="col-2 text-center"><label className="fw-bold">Estado</label></div>
                                    </div>
                                </li>
                                {_COMPONENT_LIST()}
                            </ul>
                        </form>
                    </div>
                    : ""}
            </>
        }
        let _COMPONENT_LIST = () => {
            let _CHILD = _GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
            let _LIST = [];
            if (_SUBSERIE.length == 0) _LIST = _SERIE;
            else _LIST = _SUBSERIE;

            const blocker = inventoryBlocker(documentaryInventory);
            if (blocker) return <li className="list-group-item text-center">{documentaryInventory.status === 'loading' ? 'Cargando inventario documental...' : blocker}</li>;
            if (legalFormBlocker) return <li className="list-group-item text-center">{legalFormBlocker}</li>;
            if (canonicalRows) return _CANONICAL_LIST();
            return _LIST.map((value) => {
                let _LIST_2 = _SERIES_DOCS[value]
                if (!_LIST_2) _LIST_2 = _SERIES_DOCS['GENERIC']
                let _RETURN_COMPONENT = []
                let DOCS_COUNT = 1;
                for (var ITEM in _LIST_2) {
                    _RETURN_COMPONENT.push(<Fragment key={`${value}-${ITEM}`}>
                        <li className="list-group-item">
                            <div className="row">
                                <div className="col">
                                    <label className="fw-bold" name="title_doc">{ITEM}</label>
                                    <input type='hidden' name="title_id" value={DOCS_COUNT - 1} />
                                </div>
                            </div>
                        </li>

                        {_COMPONENT_DOCS(_LIST_2[ITEM], DOCS_COUNT)}

                    </Fragment>)
                    DOCS_COUNT += _LIST_2[ITEM].length;
                }
                return <Fragment key={value}>
                    {_RETURN_COMPONENT}
                </Fragment>
            })
        }
        // Category filter of the canonical sheet; the printed PDF uses the filtered selection.
        let _CATEGORY_FILTER = () => {
            const counts = controlSheetCounts(canonicalRows);
            return (
                <div className="d-flex flex-wrap align-items-center gap-2 mx-2 mb-2" role="group" aria-label="Filtrar documentos por categoría">
                    <span className="small text-muted me-1">Mostrar e imprimir:</span>
                    {CONTROL_SHEET_CATEGORIES.map((item) => (
                        <Button key={item.key} type="button" size="sm" variant={category === item.key ? 'default' : 'outline'} aria-pressed={category === item.key} onClick={() => setCategory(item.key)}>
                            {item.label} ({counts[item.key]})
                        </Button>
                    ))}
                </div>
            );
        }
        // Reviewer verdict / stored folio range first, then the inventory status and folios of the row.
        let _CANONICAL_DEFAULTS = (row) => {
            const reviewed = row.code ? controlSheetDefaults(legalForm?.data, row.code) : null;
            const edited = edits[row.key] || {};
            return {
                pages: edited.pages ?? normalizeDocumentControlPages(reviewed?.folioRange ?? row.pages),
                check: edited.check ?? String(reviewed?.check ?? row.status),
            };
        }
        let _SET_EDIT = (key, patch) => setEdits((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
        let _CANONICAL_LIST = () => {
            const visible = filterControlSheetRows(canonicalRows, category);
            if (!visible.length) return <li className="list-group-item text-center text-muted">No hay documentos en esta categoría.</li>;
            return controlSheetGroups(visible).map((group) => (
                <Fragment key={group.category}>
                    <li className="list-group-item">
                        <div className="row">
                            <div className="col">
                                <label className="fw-bold" name="title_doc">{group.title}</label>
                                <input type='hidden' name="title_id" defaultValue={group.offset} />
                            </div>
                        </div>
                    </li>
                    {group.rows.map((row, index) => {
                        const values = _CANONICAL_DEFAULTS(row);
                        return (
                            <li className="list-group-item" key={row.key}>
                                <div className="row">
                                    <div className="col-1 text-center">
                                        <label className="fw-bold" name="number_doc">{group.offset + index + 1}</label>
                                    </div>
                                    <div className="col">
                                        <label name="name_doc">{row.name}</label>
                                        {row.vrLabels.length ? <span className="d-block small text-muted">{row.vrLabels.join(', ')}</span> : null}
                                    </div>
                                    <div className="col-1 text-center">
                                        <label className="fw-bold" name="code_doc">{row.code}</label>
                                    </div>
                                    <div className="col-2 text-center">
                                        <input type="text" inputMode="text" className="form-control" name="pages_doc" aria-label={`Folios de ${row.name}`}
                                            value={values.pages} onChange={(event) => _SET_EDIT(row.key, { pages: event.target.value })} />
                                    </div>
                                    <div className="col-2 text-center">
                                        <select className="form-select" name="select_doc" aria-label={`Estado de ${row.name}`}
                                            value={values.check} onChange={(event) => _SET_EDIT(row.key, { check: event.target.value })}>
                                            <option value="2">N/A</option>
                                            <option value="1">SI</option>
                                            <option value="0">NO</option>
                                        </select>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </Fragment>
            ));
        }
        let _COMPONENT_DOCS = (array, _DOCS_COUNT) => {
            let _COMPONENT = [];

            for (var i = 0; i < array.length; i++) {
                let cId = Number(array[i].i);
                let docName = Codes[array[i].n];
                let docCode = array[i].n;
                const canonical = documentaryInventory ? documentaryInventory.inventory : null;
                // Canonical: the stored reviewer verdict/folio range first, then the inventory.
                const reviewed = canonical ? controlSheetDefaults(legalForm?.data, docCode) : null;
                let currentPages = canonical ? normalizeDocumentControlPages(reviewed?.folioRange ?? canonical.folios.byCode.get(String(docCode))) : normalizeDocumentControlPages(_GET_FUNR_CHECK_CONTROL_PAGES(cId));
                let defaultState = canonical ? (reviewed?.check ?? canonical.statusByCode.get(String(docCode)) ?? 2) : (_GET_FUNR_CHECK_CONTROL(cId) ?? _GET_FUNR_CODE(array[i].i) ?? 2);
                _COMPONENT.push(<Fragment key={cId}>
                    <li className="list-group-item">
                        <div className="row">
                            <div className="col-1 text-center">
                                <label className="fw-bold" name="number_doc">{i + _DOCS_COUNT}</label>
                            </div>
                            <div className="col">
                                <label name="name_doc">{docName}</label>
                            </div>
                            <div className="col-1 text-center">
                                <label className="fw-bold" name="code_doc">{docCode}</label>
                            </div>
                            <div className="col-2 text-center">
                                <input type="text" inputMode="text" className="form-control" name="pages_doc" id={"pages_doc_" + cId}
                                    defaultValue={currentPages} />
                            </div>
                            <div className="col-2 text-center">
                                <select className="form-select" name="select_doc" id={"select_doc_" + cId}
                                    defaultValue={defaultState}>
                                    <option value="2">N/A</option>
                                    <option value="1">SI</option>
                                    <option value="0">NO</option>
                                </select>
                            </div>
                        </div>
                    </li></Fragment>)
            }
            return <>{_COMPONENT}</>
        }
        // FUNCTIONS & APIS
        var formData = new FormData();

        let save_fun_r = (e) => {
            e.preventDefault();
            if (canonicalSaveBlocked) return;
            if (legalForm) return save_canonical();

            formData = new FormData();
            formData.set('fun0Id', currentItem.id);

            var checks = document.getElementsByName('select_doc');
            var check_control = [];
            for (var i = 0; i < checks.length; i++) {
                let element = document.getElementById('select_doc_' + i).value
                check_control.push(element);
            }
            formData.set('check_control', check_control.join(','));

            checks = document.getElementsByName('pages_doc');
            var check_control_pages = [];
            for (var i = 0; i < checks.length; i++) {
                let element = normalizeDocumentControlPages(document.getElementById('pages_doc_' + i).value)
                check_control_pages.push(element);
            }
            formData.set('check_control_pages', check_control_pages.join(','));
            manage_fun_r();

        }
        // Canonical: one legal y debida forma review per delivered code whose verdict or folios changed.
        let save_canonical = async () => {
            if (legalFormBlocker || inventoryBlocker(documentaryInventory)) return swalError({ title: swaMsg.generic_eror_title, text: legalFormBlocker || inventoryBlocker(documentaryInventory) });
            if (!legalForm.data.actions?.review) return swalError({ title: swaMsg.generic_eror_title, text: REVIEW_LOCKED });
            // Every inventory row is saved, whatever the category filter currently shows.
            const entries = (canonicalRows || []).filter((row) => row.code).map((row) => {
                const values = _CANONICAL_DEFAULTS(row);
                return { code: row.code, check: values.check, pages: normalizeDocumentControlPages(values.pages) };
            });
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            try {
                const result = await saveControlSheetReviews(currentItem.id, legalForm.data, entries);
                const skipped = result.skipped.map((item) => `${item.code}: ${SHEET_SKIP_REASONS[item.reason]}`);
                swalSuccess({ title: swaMsg.publish_success_title, text: [`Revisiones guardadas: ${result.saved}.`, ...(skipped.length ? ['Sin guardar:', ...skipped] : [])].join('\n') });
                if (result.saved) requestUpdate(currentItem.id);
            } catch (error) {
                swalError({ title: swaMsg.generic_eror_title, text: legalFormErrorMessage(error) || generatorSaveErrorText(error, swaMsg.generic_error_text) });
            } finally {
                // Saved reviews (or a revision conflict) change the expected revisions of the next save.
                legalForm.reload();
            }
        }
        let manage_fun_r = () => {
            var _CHILD = _SET_CHILD_REVIEW();

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (_CHILD.id) {
                FUN_SERVICE.update_r(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdate(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: generatorSaveErrorText(e, swaMsg.generic_error_text) });
                    });
            }
            else {
                FUN_SERVICE.create_funr(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdate(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: generatorSaveErrorText(e, swaMsg.generic_error_text) });
                    });
            }

        }
        let gen_pdf = () => {
            const blocker = inventoryBlocker(documentaryInventory) || legalFormBlocker;
            if (blocker) return swalError({ title: swaMsg.generic_eror_title, text: blocker });
            if (canonicalRows && !filterControlSheetRows(canonicalRows, category).length) return swalError({ title: swaMsg.generic_eror_title, text: 'No hay documentos en la categoría elegida para imprimir.' });

            formData = new FormData();

            formData.set('id_public', currentItem.id_public);

            var dom = document.getElementsByName('title_doc');
            var title_doc = [];
            for (var i = 0; i < dom.length; i++) {
                title_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('title_id');
            var title_id = [];
            for (var i = 0; i < dom.length; i++) {
                title_id.push(dom[i].value);
            }

            dom = document.getElementsByName('number_doc');
            var number_doc = [];
            for (var i = 0; i < dom.length; i++) {
                number_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('name_doc');
            var name_doc = [];
            for (var i = 0; i < dom.length; i++) {
                name_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('pages_doc');
            var pages_doc = [];
            for (var i = 0; i < dom.length; i++) {
                pages_doc.push(normalizeDocumentControlPages(dom[i].value));
            }

            dom = document.getElementsByName('code_doc');
            var code_doc = [];
            for (var i = 0; i < dom.length; i++) {
                code_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('select_doc');
            var select_doc = [];
            for (var i = 0; i < dom.length; i++) {
                select_doc.push(dom[i].value);
            }

            formData.set('title_doc', title_doc.join(';'));
            formData.set('title_id', title_id.join(';'));
            formData.set('number_doc', number_doc.join(';'));
            formData.set('name_doc', name_doc.join(';'));
            formData.set('pages_doc', pages_doc.join(';'));
            formData.set('code_doc', code_doc.join(';'));
            formData.set('select_doc', select_doc.join(';'));

            var serie_cod = document.getElementById('fun_doc_control_0').value;
            formData.set('serie_cod', serie_cod);
            var serie_str = document.getElementById('fun_doc_control_1').value;
            formData.set('serie_str', serie_str);
            var subserie_cod = document.getElementById('fun_doc_control_2').value;
            formData.set('subserie_cod', subserie_cod);
            var subserie_str = document.getElementById('fun_doc_control_3').value;
            formData.set('subserie_str', subserie_str);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUN_SERVICE.gen_doc_checkcontrol(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalClose();
                        const filename = `Hoja de control serie documental - ${currentItem.id_public}.pdf`;
                        return downloadProtectedPdf(`/pdf/controlcheck/${encodeURIComponent(filename)}`, filename);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });

        }
        return (
            <div>
                {_GET_SERIES()}
            </div>
        );
}

export default FUN_D_CONTROL;

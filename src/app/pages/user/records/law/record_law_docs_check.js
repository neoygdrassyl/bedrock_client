import { useState, useEffect } from 'react';
import FUN6JSON from '../../../../components/jsons/fun6DocsList.json'
import FUN_SERVICE from '../../../../services/fun.service';
import VIZUALIZER from '../../../../components/vizualizer.component';
import DataTable from '@/components/data-table-bridge';
import { GEM_CODE_LIST, VR_DOCUMENTS_OF_INTEREST } from '../../../../components/customClasses/typeParse';
import submitService from '../../../../services/submit.service';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import { Button } from '@/components/ui/button';

const normalizeReportStatus = (status) => {
    const value = String(status || '').trim().toLowerCase();
    if (value === 'cumple' || value === 'no_cumple' || value === 'revisar') return value;
    return 'pendiente';
}

const normalizeEvaluationRows = (responseData) => {
    const rows = Array.isArray(responseData?.data) ? responseData.data : responseData;
    if (!Array.isArray(rows)) return {};

    return rows.reduce((acc, row) => {
        const code = String(row.requirement_code || row.requirementCode || row.code || '');
        if (!code) return acc;
        acc[code] = {
            status: normalizeReportStatus(row.status),
            observation: row.observation || '',
        };
        return acc;
    }, {});
}

function RECORD_LAW_DOCSCHECK(props) {
    const [VRDocs, setVRDocs] = useState([]);
    const [load, setLoad] = useState(false);
    const [hideNotApplicable, setHideNotApplicable] = useState(Boolean(props.hideNotApplicableDefault));
    const [reportEvaluations, setReportEvaluations] = useState({});
    const [savingReportEvaluations, setSavingReportEvaluations] = useState(false);

    const {
        swaMsg,
        currentItem,
        _FUN_R,
        _FUN_6,
        readOnly,
        docsScope,
        ownerRecordId,
        showFilters = false,
        title = 'Inventario de Informacion Aportada',
    } = props;
    const reportOwnerRecordId = ownerRecordId ?? currentItem?.id ?? '';

    useEffect(() => {
        setHideNotApplicable(Boolean(props.hideNotApplicableDefault));
    }, [props.hideNotApplicableDefault]);

    useEffect(() => {
        setVRList(currentItem ? currentItem.id_public : false);
    }, []);

    useEffect(() => {
        if (!currentItem?.id || !docsScope) {
            setReportEvaluations({});
            return;
        }

        let mounted = true;
        FUN_SERVICE.getDocumentEvaluations(currentItem.id, docsScope, reportOwnerRecordId)
            .then(response => {
                if (!mounted) return;
                setReportEvaluations(normalizeEvaluationRows(response.data));
            })
            .catch(e => {
                console.log(e);
                if (mounted) setReportEvaluations({});
            });

        return () => {
            mounted = false;
        }
    }, [currentItem?.id, docsScope, reportOwnerRecordId]);

    const setVRList = (id_public) => {
        if (!id_public) return;
        if (load) return;
        submitService.getIdRelated(currentItem.id_public).then(response => {
            let newList = [];
            let List = Array.isArray(response.data) ? response.data : [];
            List.map((value) => {
                let subList = Array.isArray(value.sub_lists) ? value.sub_lists : [];
                subList.map(valuej => {
                    let name = valuej.list_name ? valuej.list_name.split(";") : []
                    let category = valuej.list_category ? valuej.list_category.split(",") : []
                    let code = valuej.list_code ? valuej.list_code.split(",") : []
                    let page = valuej.list_pages ? valuej.list_pages.split(",") : []
                    let review = valuej.list_review ? valuej.list_review.split(",") : []

                    review.map((valuek, k) => {
                        if (valuek == 'SI') newList.push({
                            id_public: value.id_public,
                            date: value.date,
                            time: value.time,
                            name: name[k],
                            category: category[k],
                            page: page[k],
                            code: code[k],
                        })
                    })
                })
            })
            setVRDocs(newList);
            setLoad(true);
        }).catch(() => {
            setVRDocs([]);
            setLoad(true);
        })

    };

    const _docsScope = docsScope ? VR_DOCUMENTS_OF_INTEREST[docsScope] : [];

    // DATA GETTER
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = 0;
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
        var _CHILD = _FUN_6;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    //  DATA CONVERTES
    let _FIND_IN_VRDOCS = (code) => {
        if(!code) return false;
        let FOUND_CODE = VRDocs.find(vr =>{ 
            if (!vr.code) return false
            else return vr.code.includes(code)});
        return FOUND_CODE;
    }
    let _GET_EDIT_POWERS = (row) => {
        if (docsScope) {
            if (_docsScope.includes(String(row.code))) return true;
            else return false;
        }
        return true;
    }
    let _FIND_6 = (_ID) => {
        let _LIST = _GET_CHILD_6();
        let _CHILD = [];
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].id == _ID) {
                return _LIST[i];
            }
        }
        return _CHILD;
    }
    let _CHILD_6_SELECT = () => {
        let _LIST = _GET_CHILD_6();
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
        }
        return <>{_COMPONENT}</>
    }
    let _GET_VALUE_BADGE = (row) => {
        let bg = {};

        if (row.value == -1 || row.value == null) bg = { color: 'dark', text: 'SIN DEFINIR', value: 1 }
        if (row.value == 0) {
            let VR = _FIND_IN_VRDOCS(row.code);
            if (VR) bg = { color: 'success', text: 'APORTO', value: 2 }
            else bg = { color: 'danger', text: 'NO APORTO', value: 1 }
        }
        if (row.value == 1) bg = { color: 'success', text: 'APORTO', value: 2 }
        if (row.value == 2) bg = { color: 'warning', text: 'NO APLICA', value: 0 }
        let editable = _GET_EDIT_POWERS(row);
        const badgeClass = {
            dark: 'border-border bg-muted text-foreground',
            success: 'border-accent/20 bg-accent/10 text-accent',
            danger: 'border-destructive/20 bg-destructive/10 text-destructive',
            warning: 'border-warning/20 bg-warning/10 text-warning',
        }[bg.color] || 'border-border bg-background text-foreground';

        if (editable) {
            return <button type="button" className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${badgeClass}`}
                onClick={() => save_fun_r_2(bg.value, row.code)}>{bg.text}</button>;
        }

        return <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${badgeClass}`}>{bg.text}</span>;
    }
    let _GET_EVA_VAKUE = (row) =>{
        if(row.value == 1) return true;
        else if(row.value == -1 || row.value == null || row.value == 2) return false;
        else return _FIND_IN_VRDOCS(row.code);
    }
    let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
        if (!_VALUE) {
            return 'form-select text-danger input-group-sm';
        }
        if (_VALUE == 0) {
            return 'form-select text-danger input-group-sm';
        }
        if (_VALUE == 1) {
            return 'form-select text-success input-group-sm';
        }
        if (_VALUE == 2) {
            return 'form-select text-warning input-group-sm';
        } else {
            return 'form-select input-group-sm';
        }
    }
    let _GET_REVIEW = (_code) => {
        let _review = _FUN_R.review;
        _review ? _review = _review.split(',') : _review = [];
        for (var i = 0; i < _review.length; i++) {
            if (_review[i].includes(_code)) return _review[i].split('&')[1];
        }
        return 0;
    }
    let _GET_ID6 = (_code) => {
        let _id6 = _FUN_R.id6;
        _id6 ? _id6 = _id6.split(',') : _id6 = [];
        for (var i = 0; i < _id6.length; i++) {
            if (_id6[i].includes(_code)) return _id6[i].split('&')[1];
        }
        return false;
    }
    let _FIND_6_CODE = (_code) => {
        let _LIST = _GET_CHILD_6();
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].id_public == _code) {
                return _LIST[i];
            }
        }
        return false;
    }
    let _GET_ID6_NAME = (_code) => {
        let _id6 = _FIND_6_CODE(_code)
        if (!_id6) return 0;
        return _id6.id;
    }
    const _GET_REPORT_EVALUATION = (code) => {
        const value = reportEvaluations[String(code)] || {};
        return {
            status: normalizeReportStatus(value.status),
            observation: value.observation || '',
        }
    }
    const updateReportEvaluation = (code, field, value) => {
        const key = String(code);
        setReportEvaluations(current => ({
            ...current,
            [key]: {
                ..._GET_REPORT_EVALUATION(key),
                ...current[key],
                [field]: field === 'status' ? normalizeReportStatus(value) : value,
            },
        }));
    }

    const conditionalRowStyles = [
        {
            when: row => !_GET_EDIT_POWERS(row),
            style: {
                backgroundColor: 'lightgray',
                color: 'dark',
                '&:hover': {
                    cursor: 'pointer',
                },
            },
        },
    ];
    // COMPONENT JSX
    let BUILD_LIST = () => {
        const _FUN_1 = _GET_CHILD_1();
        let list = GEM_CODE_LIST(_FUN_1)
        return list
    }

    
    let _COMPONENT_TABLE_LIST = () => {
        if (!_FUN_R) return []
        let _DOCS = _FUN_R.code;
        let _VALUE = _FUN_R.checked;
        if (!_DOCS || !_VALUE) return []
        _DOCS = _DOCS.split(',');
        _VALUE = _VALUE.split(',');

        let buildList = BUILD_LIST();
        let newList = [];
        buildList.map(value => {
            let codes = value.codes;
            if (!codes) return;
            codes.map(valuej => {
                let indexOfCode = _DOCS.indexOf(valuej)
                newList.push({
                    parent: value.parent,
                    code: valuej,
                    index: indexOfCode,
                    doc: _DOCS[indexOfCode],
                    value: _VALUE[indexOfCode],
                    name: FUN6JSON[_DOCS[indexOfCode]],
                })
            })
        })

        return newList;
    }

  
    // FUNCTIONS & APIS
    var formData = new FormData();
    const columns = [
        {
            name: 'MODALIDAD',
            minWidth: '240px',
            cell: row => <span className="text-sm">{row.parent}</span>
        },
        {
            name: 'DOCUMENTO',
            minWidth: '280px',
            cell: row => <span className="text-sm">{row.name ?? FUN6JSON[row.code]}</span>
        },
        {
            name: 'CODIGO',
            center: true,
            minWidth: '80px',
            cell: row => <span className="text-sm">{(row.code)}</span>
        },
        {
            name: 'ESTATUS',
            center: true,
            minWidth: '110px',
            cell: row => _GET_VALUE_BADGE(row)
        },
        {
            name: 'EVALUACIÓN FUN',
            minWidth: '130px',
            cell: row => _GET_EVA_VAKUE(row) ? <div className="input-group input-group-sm">
                <input type="hidden" value={row.doc} name={'r_l_g2_doc_code'} />
                <select className={_GET_SELECT_COLOR_VALUE(_GET_REVIEW(row.code))} name="r_l_g2_doc_review"
                    defaultValue={_GET_REVIEW(row.code)} onChange={() => save_fun_r(row)} disabled={readOnly ? true : !_GET_EDIT_POWERS(row)}>
                    <option value="0" className="text-danger">NO CUMPLE</option>
                    <option value="1" className="text-success">CUMPLE</option>
                </select></div> : ''
        },
        {
            name: 'EVALUACIÓN INFORME',
            minWidth: '260px',
            cell: row => {
                const reportEvaluation = _GET_REPORT_EVALUATION(row.code);
                const disabled = readOnly ? true : !_GET_EDIT_POWERS(row);
                return <div className="flex min-w-[240px] flex-col gap-1 py-1">
                    <label className="sr-only" htmlFor={`report-doc-evaluation-${row.code}`}>Evaluación del informe {row.code}</label>
                    <select
                        id={`report-doc-evaluation-${row.code}`}
                        className="form-select input-group-sm"
                        value={reportEvaluation.status}
                        onChange={(event) => updateReportEvaluation(row.code, 'status', event.target.value)}
                        disabled={disabled}
                    >
                        <option value="pendiente">PENDIENTE</option>
                        <option value="cumple">CUMPLE</option>
                        <option value="no_cumple">NO CUMPLE</option>
                        <option value="revisar">REVISAR</option>
                    </select>
                    <label className="sr-only" htmlFor={`report-doc-observation-${row.code}`}>Observación del informe {row.code}</label>
                    <textarea
                        id={`report-doc-observation-${row.code}`}
                        className="form-control min-h-[52px] text-xs"
                        defaultValue={reportEvaluation.observation}
                        onBlur={(event) => updateReportEvaluation(row.code, 'observation', event.target.value)}
                        disabled={disabled}
                        placeholder="Observación del informe"
                    />
                </div>
            }
        },
        {
            name: 'ANEXO',
            center: true,
            minWidth: '140px',
            cell: row => <div className="input-group input-group-sm"><select className='form-select' name="r_l_g2_doc_id6" disabled={readOnly ? true : !_GET_EDIT_POWERS(row)}
                defaultValue={_GET_ID6(row.doc) || _GET_ID6_NAME(row.doc)} onChange={() => save_fun_r()}>
                <option value="-1">APORTADO FISICAMENTE</option>
                <option value="0">SIN DOCUMENTO</option>
                {_CHILD_6_SELECT()}
            </select></div>
        },
        {
            name: 'VER',
            center: true,
            minWidth: '90px',
            cell: row => {
                let id6 = _GET_ID6(row.doc) || _GET_ID6_NAME(row.doc);
                let numId6 = Number(id6);

                if (numId6 > 0) {
                    let fun6doc = _FIND_6(numId6);
                    if (fun6doc && fun6doc.path && fun6doc.filename) {
                        return <VIZUALIZER
                            url={fun6doc.path + "/" + fun6doc.filename}
                            apipath={'/files/'}
                            icon='Search'
                            iconWrapper='inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8'
                            iconStyle={{ fontSize: '150%' }}
                        />
                    }
                    return (
                        <span
                            title="El documento está registrado pero no tiene archivo digital asociado"
                            className="inline-flex items-center justify-center rounded-md bg-muted/50 h-8 w-8 text-muted-foreground cursor-help"
                        >—</span>
                    );
                }

                if (numId6 === -1 || id6 === '-1') {
                    return (
                        <span
                            title="Documento aportado físicamente (ventanilla única)"
                            className="inline-flex items-center justify-center rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning cursor-help"
                        >FÍSICO</span>
                    );
                }

                return (
                    <span
                        title="Sin documento digital asociado"
                        className="inline-flex items-center justify-center rounded-md bg-muted/50 h-8 w-8 text-muted-foreground cursor-help"
                    >—</span>
                );
            }
        },
    ]
    const allRows = _COMPONENT_TABLE_LIST();
    const visibleRows = hideNotApplicable ? allRows.filter((row) => row.value != 2) : allRows;
    const notApplicableRows = allRows.filter((row) => row.value == 2).length;
    let save_fun_r = () => {
        let _reivews = document.getElementsByName('r_l_g2_doc_review');
        let _id6s = document.getElementsByName('r_l_g2_doc_id6');
        let _codes = document.getElementsByName('r_l_g2_doc_code');

        let review = [];
        let id6 = [];
        for (var i = 0; i < _codes.length; i++) {
            review.push(`${_codes[i].value}&${_reivews[i].value}`);
            id6.push(`${_codes[i].value}&${_id6s[i].value}`);
        }
        formData.set('review', review.join());
        formData.set('id6', id6.join());
        manage_fun_r(false);
    }

    let save_fun_r_2 = (value, code) => {
        let codes = _FUN_R.code.split(',');
        let values = _FUN_R.checked.split(',');
        let codeIndex = codes.indexOf(code);
        if (codeIndex == -1) {
            codes.push(code)
            values.push(value)
            formData.set('checked', values.join());
            formData.set('code', codes.join());
        } else {
            values[codeIndex] = value;
            formData.set('checked', values.join());
        }

        manage_fun_r(false);
    }

    let manage_fun_r = (useMySwal) => {
        if (useMySwal) {
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        }
        if (_FUN_R) {
            FUN_SERVICE.update_r(_FUN_R.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        }
                        props.requestUpdate(currentItem.id);
                        //props.requestUpdateRecord(currentItem.id);
                    } else {
                        if (useMySwal) {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                });
            }
    }

    const saveReportEvaluations = () => {
        if (!currentItem?.id || !docsScope) return;
        setSavingReportEvaluations(true);
        const entries = allRows.map(row => {
            const reportEvaluation = _GET_REPORT_EVALUATION(row.code);
            const observationInput = document.getElementById(`report-doc-observation-${row.code}`);
            return {
                requirement_code: String(row.code),
                requirement_label: row.name ?? FUN6JSON[row.code] ?? String(row.code),
                status: reportEvaluation.status,
                observation: observationInput ? observationInput.value : reportEvaluation.observation,
            }
        });

        FUN_SERVICE.saveDocumentEvaluations(currentItem.id, docsScope, {
            owner_record_id: reportOwnerRecordId,
            entries,
        })
            .then(response => {
                const normalizedRows = normalizeEvaluationRows(response.data?.rows || response.data);
                if (Object.keys(normalizedRows).length) setReportEvaluations(normalizedRows);
                props.requestUpdate?.(currentItem.id);
            })
            .catch(e => {
                console.log(e);
            })
            .finally(() => {
                setSavingReportEvaluations(false);
            });
    }

    return (
        <div className="record_lar_doc_check container space-y-3">
            {showFilters ? <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground">Lista compacta para revisar aporte, evaluación FUN, evaluación por informe y soporte asociado.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-border bg-background px-3 py-1.5">Visibles: {visibleRows.length}</span>
                        <span className="rounded-full border border-border bg-background px-3 py-1.5">No aplica: {notApplicableRows}</span>
                        {docsScope ? <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={saveReportEvaluations}
                            disabled={readOnly || savingReportEvaluations}
                        >
                            {savingReportEvaluations ? 'Guardando...' : 'Guardar evaluación del informe'}
                        </Button> : null}
                        <Button
                            type="button"
                            variant={hideNotApplicable ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHideNotApplicable((currentValue) => !currentValue)}
                        >
                            {hideNotApplicable ? 'Mostrar "No aplica"' : 'Ocultar "No aplica"'}
                        </Button>
                    </div>
                </div>
            </div> : null}

            <DataTable
                conditionalRowStyles={conditionalRowStyles}

                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY ARCHIVOS DEFINIDOS"
                striped="true"
                columns={columns}
                dense

                load={load}
                progressPending={!load}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                fixedHeader
                fixedHeaderScrollHeight={showFilters ? '360px' : '500px'}

                data={visibleRows}
                highlightOnHover

                className="data-table-component"
                noHeader
            />
        </div >
    );
}

export default RECORD_LAW_DOCSCHECK;

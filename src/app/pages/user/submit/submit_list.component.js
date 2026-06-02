import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// SERVICES
import SubmitService from '../../../services/submit.service';
import funService from '../../../services/fun.service';
import dayjs from 'dayjs';
import { PDFDocument } from 'pdf-lib';

// LISTS
import Fun6DocList from '../../../components/jsons/fun6DocsList.json'
import { Lists } from '../../../components/jsons/lists_submit'

import DOCS_LIST from '../fun_forms/components/docs_list.component';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import { DOCUMENT_ORIGIN_STATE } from '../shared/expediente-documental.constants';
import { LegacyModal } from '@/components/legacy-modal';

function SUBMIT_LIST({ translation, swaMsg, globals, currentItem, list, refreshList, activePanel = 'physical', digitalCount = 0, digitalDocuments = [], onPanelChange, renderDigitalPanel }) {
    const [lists, setLists] = useState(0);
    const [extra_items, setExtraItems] = useState(0);
    const [list_data_table, setListDataTable] = useState([]);
    const [selected_list, setSelectedList] = useState([]);
    const [list_new, setListNew] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const [activeListIndex, setActiveListIndex] = useState(0);
    const [scanDrafts, setScanDrafts] = useState({});
    const [physicalDrafts, setPhysicalDrafts] = useState({});
    const [scanUploadStates, setScanUploadStates] = useState({});
    const [dragOverScanKey, setDragOverScanKey] = useState(null);
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [scanPreviewDocument, setScanPreviewDocument] = useState(null);
    const [localDigitalDocuments, setLocalDigitalDocuments] = useState([]);
    const currentSubLists = currentItem?.sub_lists ?? [];
    const normalizeDocumentCode = (value) => String(value || '').trim().toUpperCase();
    const currentVrCode = normalizeDocumentCode(currentItem?.id_public);
    const belongsToCurrentVr = (documentItem) => {
        const documentVrCode = normalizeDocumentCode(documentItem?.id_replace || documentItem?.idReplace || documentItem?.vr || documentItem?.idRelated);
        return Boolean(currentVrCode && documentVrCode === currentVrCode);
    };
    const displayedDigitalDocuments = [...localDigitalDocuments, ...digitalDocuments]
        .filter(belongsToCurrentVr)
        .filter((documentItem, index, scopedDocuments) => {
            const documentId = documentItem?.id ? `id:${documentItem.id}` : '';
            const documentKey = documentId || `${normalizeDocumentCode(documentItem?.id_public || documentItem?.documentCode || documentItem?.code)}:${normalizeDocumentCode(documentItem?.id_replace)}`;
            return scopedDocuments.findIndex((candidate) => {
                const candidateId = candidate?.id ? `id:${candidate.id}` : '';
                const candidateKey = candidateId || `${normalizeDocumentCode(candidate?.id_public || candidate?.documentCode || candidate?.code)}:${normalizeDocumentCode(candidate?.id_replace)}`;
                return candidateKey === documentKey;
            }) === index;
        });
    const CONTRIBUTOR_OPTIONS = ['', 'Solicitante', 'Curaduría'];

    const splitListField = (value, separator = ',') => value ? String(value).split(separator) : [];
    const hasPositivePages = (value) => Number(String(value || '').trim()) > 0;
    const deriveReviewFromPages = (value) => hasPositivePages(value) ? 'SI' : 'NO';
    const normalizeContributor = (value) => {
        const normalizedValue = String(value || '').trim();
        return CONTRIBUTOR_OPTIONS.includes(normalizedValue) ? normalizedValue : '';
    };

    const getPhysicalDraftKey = (listId, rowIndex, field) => `${listId}_${rowIndex}_${field}`;
    const getPhysicalDraftValue = (listId, rowIndex, field, fallback = '') => {
        const key = getPhysicalDraftKey(listId, rowIndex, field);
        return Object.prototype.hasOwnProperty.call(physicalDrafts, key) ? physicalDrafts[key] : fallback;
    };
    const updatePhysicalDraft = (listId, rowIndex, field, value) => {
        const key = getPhysicalDraftKey(listId, rowIndex, field);
        setPhysicalDrafts((current) => ({ ...current, [key]: value }));
    };

    const ContributorSelect = ({ name, value, defaultValue = '', className = '', onChange }) => {
        const selectProps = value !== undefined
            ? { value: normalizeContributor(value) }
            : { defaultValue: normalizeContributor(defaultValue) };

        return (
        <select
            className={`form-select form-select-sm h-8 text-[0.76rem] ${className}`}
            name={name}
            {...selectProps}
            onChange={onChange}
            aria-label="Quién aporta el documento"
        >
            <option value="">Sin definir</option>
            <option value="Solicitante">Solicitante</option>
            <option value="Curaduría">Curaduría</option>
        </select>
        );
    };

    const getScanDraftKey = (listId, rowIndex) => `${listId}_${rowIndex}`;

    const updateScanDraft = (listId, rowIndex, patch) => {
        const key = getScanDraftKey(listId, rowIndex);
        setScanDrafts((current) => ({
            ...current,
            [key]: {
                ...(current[key] || {}),
                ...patch,
            },
        }));
    };

    const clearScanDraft = (listId, rowIndex) => {
        const key = getScanDraftKey(listId, rowIndex);
        setScanDrafts((current) => {
            const next = { ...current };
            delete next[key];
            return next;
        });
    };

    const getScanUploadKey = (listId, rowIndex) => `${listId}_${rowIndex}`;

    const updateScanUploadState = (listId, rowIndex, patch) => {
        const key = getScanUploadKey(listId, rowIndex);
        setScanUploadStates((current) => ({
            ...current,
            [key]: {
                ...(current[key] || {}),
                ...patch,
            },
        }));
    };

    const clearScanUploadState = (listId, rowIndex) => {
        const key = getScanUploadKey(listId, rowIndex);
        setScanUploadStates((current) => {
            const next = { ...current };
            delete next[key];
            return next;
        });
    };

    useEffect(() => {
        // componentDidMount
        //const interval = setInterval(() => {}, 1000);
        return () => {
            // componentWillUnmount cleanup
            //clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setActiveListIndex((currentIndex) => {
            if (!currentSubLists.length) return 0;
            return Math.min(currentIndex, currentSubLists.length - 1);
        });
    }, [currentSubLists.length]);

    const activeList = currentSubLists[activeListIndex] || null;

    const getReviewedDocuments = (row) => {
        if (!row) return [];
        const names = splitListField(row.list_name, ";");
        const categories = splitListField(row.list_category);
        const codes = splitListField(row.list_code);
        const pages = splitListField(row.list_pages);
        const contributors = splitListField(row.list_aportante);
        const itemCount = Math.max(names.length, categories.length, codes.length, pages.length, contributors.length);

        return Array.from({ length: itemCount }).reduce((items, _, originalIndex) => {
            if (![names[originalIndex], categories[originalIndex], codes[originalIndex], pages[originalIndex], contributors[originalIndex]].some((value) => String(value || '').trim())) return items;

            items.push({
                originalIndex,
                category: categories[originalIndex] || '',
                code: codes[originalIndex] || '',
                name: names[originalIndex] || '',
                pages: pages[originalIndex] || '',
                contributor: normalizeContributor(contributors[originalIndex]),
            });

            return items;
        }, []);
    };

    const activeReviewedDocuments = getReviewedDocuments(activeList);

    const normalizeOriginState = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, '_');

    const hasScannedDocument = (documentCode) => {
        const normalizedCode = normalizeDocumentCode(documentCode);
        if (!normalizedCode) return false;

        return displayedDigitalDocuments.some((documentItem) => {
            const digitalCode = normalizeDocumentCode(documentItem?.id_public || documentItem?.documentCode || documentItem?.code);
            const hasFile = Boolean(documentItem?.filename || documentItem?.path || documentItem?.previewUrl || documentItem?.downloadUrl);
            const originState = normalizeOriginState(documentItem?.origin_state || documentItem?.originState);
            const isScanned = ['SCANNED', 'ESCANEADO', 'DIGITALIZADO'].includes(originState) || (!originState && hasFile);

            return digitalCode === normalizedCode && hasFile && isScanned;
        });
    };

    const getScannedDocument = (documentCode) => {
        const normalizedCode = normalizeDocumentCode(documentCode);
        if (!normalizedCode) return null;

        return displayedDigitalDocuments.find((documentItem) => {
            const digitalCode = normalizeDocumentCode(documentItem?.id_public || documentItem?.documentCode || documentItem?.code);
            const hasFile = Boolean(documentItem?.filename || documentItem?.path || documentItem?.previewUrl || documentItem?.downloadUrl);
            const originState = normalizeOriginState(documentItem?.origin_state || documentItem?.originState);
            const isScanned = ['SCANNED', 'ESCANEADO', 'DIGITALIZADO'].includes(originState) || (!originState && hasFile);

            return digitalCode === normalizedCode && hasFile && isScanned;
        }) || null;
    };

    const getScanPreviewUrl = (documentItem) => documentItem?.previewUrl || (documentItem?.path && documentItem?.filename ? `/api/files/${documentItem.path}/${encodeURIComponent(documentItem.filename)}?inline=1` : '');
    const getScanDownloadUrl = (documentItem) => documentItem?.downloadUrl || (documentItem?.path && documentItem?.filename ? `/api/files/${documentItem.path}/${encodeURIComponent(documentItem.filename)}` : '');

    const openScanPreview = (documentItem) => {
        if (!getScanPreviewUrl(documentItem)) {
            swalError({ title: 'Previsualización no disponible', text: 'Este escaneado todavía no tiene un archivo asociado.' });
            return;
        }
        setScanPreviewDocument(documentItem);
    };

    const goToPreviousList = () => {
        setActiveListIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    };

    const goToNextList = () => {
        setActiveListIndex((currentIndex) => {
            if (!currentSubLists.length) return 0;
            return Math.min(currentIndex + 1, currentSubLists.length - 1);
        });
    };

        // DATA GETTERS

        // DATA COMVERTERS
        let _LIST_COMPONENT = () => {
            var _LIST = [];
            for (var ITEM in Lists) {
                // FIX: Added key prop for list items
                _LIST.push(<option key={ITEM}>{Object.keys(Lists[ITEM])}</option>)
            }
            _LIST.push(<option key="LISTA_EXTRA">LISTA EXTRA</option>) // FIX: Added key prop
            return <>{_LIST}</>
        }

        let checkIfExtra = (_TITLE) => {
            for (var ITEM in Lists) {
                if (Lists[ITEM][_TITLE]) return true
            }
            return false
        }

        let _SET_LIST = (e) => {
            var items_set = [];
            var new_list = document.getElementById('submit_list_type').value;
            for (var ITEM in Lists) {
                if (Lists[ITEM][new_list]) {
                    items_set = Lists[ITEM];
                    break;
                }
            }
            setListNew(items_set)
            //_update_doms();
        }

        let _LIST_GEN = (row) => {
            let ID = row.id
            let name = splitListField(row.list_name, ";")
            let category = splitListField(row.list_category)
            let code = splitListField(row.list_code)
            let page = splitListField(row.list_pages)
            let contributor = splitListField(row.list_aportante)

            let items = Math.max(name.length, category.length, code.length, page.length, contributor.length);
            let isExtra = checkIfExtra(row.list_title)
            const tableGridClass = "grid grid-cols-[52px_58px_74px_70px_minmax(260px,1fr)_62px_74px_124px] gap-1.5 lg:gap-2";

            const StatusBadge = ({ active, icon, label, description, tone = 'primary' }) => {
                const activeClass = tone === 'success'
                    ? 'border-emerald-500/60 bg-emerald-50 text-emerald-700 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                    : 'border-primary/60 bg-primary/10 text-primary shadow-[0_0_0_3px_rgba(59,130,246,0.12)]';
                const inactiveClass = 'border-border/70 bg-muted/30 text-muted-foreground opacity-70';

                return (
                    <span className="group/status relative inline-flex">
                        <button
                            type="button"
                            aria-label={label}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 ${active ? activeClass : inactiveClass}`}
                        >
                            <Icon name={icon} size={16} />
                        </button>
                        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-left text-[0.72rem] leading-snug text-popover-foreground opacity-0 shadow-lg transition-all duration-150 before:absolute before:-top-1 before:left-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:rotate-45 before:border-l before:border-t before:border-border before:bg-popover group-hover/status:opacity-100 group-focus-within/status:opacity-100">
                            <span className="block font-semibold">{label}</span>
                            <span className="mt-0.5 block text-muted-foreground">{description}</span>
                        </span>
                    </span>
                );
            };

            return (
                <div className="space-y-2 text-[clamp(0.74rem,0.7rem+0.12vw,0.86rem)]">
                    <div className="flex items-center justify-between gap-2 px-1 text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        <span>Documentos de la lista</span>
                        <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[0.9em] normal-case tracking-normal">
                            {items} documento{items === 1 ? '' : 's'}
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                        <div className={`${tableGridClass} border-b border-border/70 bg-muted/25 px-2 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground`}>
                            <span>Estado</span>
                            <span className="text-center">Carga</span>
                            <span>Cat.</span>
                            <span className="text-center">Código</span>
                            <span>Descripción</span>
                            <span className="text-center">Folios</span>
                            <span className="text-center">Folios dig.</span>
                            <span>Quién aporta</span>
                        </div>

                        <div className="divide-y divide-border/70">
                            {Array.from({ length: items }).map((_, i) => {
                                const currentPages = getPhysicalDraftValue(ID, i, 'pages', page[i] || '');
                                const currentContributor = normalizeContributor(getPhysicalDraftValue(ID, i, 'contributor', contributor[i] || ''));
                                const scannedDocument = getScannedDocument(code[i]);
                                const provided = hasPositivePages(currentPages);
                                const scanned = Boolean(scannedDocument);
                                const contributorText = currentContributor || 'Sin definir';
                                const uploadKey = getScanUploadKey(ID, i);
                                const uploadState = scanUploadStates[uploadKey] || {};
                                const currentDigitalPages = getPhysicalDraftValue(ID, i, 'digitalPages', scannedDocument?.pages || '');
                                const rowIsDragOver = dragOverScanKey === uploadKey;
                                const isUploadingScan = uploadState.status === 'uploading';

                                return <fieldset
                                    aria-label={`Documento ${code[i] || i + 1}. Suelte un archivo para cargar escaneado`}
                                    key={`${ID}-${code[i] || i}`}
                                    className={`${tableGridClass} items-start rounded-md px-2 py-1.5 transition-all duration-150 hover:bg-muted/20 ${rowIsDragOver ? 'bg-primary/10 ring-2 ring-primary/35' : ''}`}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setDragOverScanKey(uploadKey);
                                    }}
                                    onDragLeave={() => setDragOverScanKey((current) => current === uploadKey ? null : current)}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        setDragOverScanKey(null);
                                        const file = event.dataTransfer?.files?.[0];
                                        if (file) uploadScannedDocument(activeList, i, file, { code: code[i], name: name[i], pages: currentPages, digitalPages: currentDigitalPages, existingDocument: scannedDocument });
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        <StatusBadge
                                            active={provided}
                                            icon="FileCheck"
                                            label={provided ? 'Aportado en ventanilla única' : 'No aportado en ventanilla única'}
                                            description={provided ? `${currentPages} folio${String(currentPages) === '1' ? '' : 's'} registrado${String(currentPages) === '1' ? '' : 's'} · ${contributorText}` : 'Ingrese un número de folios mayor a 0 para marcarlo como aportado.'}
                                            tone="primary"
                                        />
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                                        <input
                                            type="file"
                                            id={`direct_scan_${ID}_${i}`}
                                            className="sr-only"
                                            accept="application/pdf,image/jpeg,image/png"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (file) uploadScannedDocument(activeList, i, file, { code: code[i], name: name[i], pages: currentPages, digitalPages: currentDigitalPages, existingDocument: scannedDocument });
                                                event.target.value = '';
                                            }}
                                        />
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 ${isUploadingScan ? 'cursor-wait border-primary/60 bg-primary/10 text-primary' : scanned ? 'border-emerald-500/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-border/70 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-primary'}`}
                                                onClick={() => document.getElementById(`direct_scan_${ID}_${i}`)?.click()}
                                                aria-label={scanned ? 'Reemplazar escaneado' : 'Subir escaneado'}
                                                title={isUploadingScan ? (uploadState.message || 'Subiendo escaneado...') : scanned ? 'Reemplazar escaneado de esta fila' : 'Subir escaneado para esta fila'}
                                                disabled={isUploadingScan}
                                            >
                                                <Icon name={isUploadingScan ? 'Loader2' : scanned ? 'FileCheck' : 'FileUp'} size={16} className={isUploadingScan ? 'animate-spin' : ''} />
                                            </button>
                                            {scannedDocument ? <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition-colors hover:text-primary" onClick={() => openScanPreview(scannedDocument)} aria-label="Previsualizar escaneado" title="Previsualizar escaneado"><Icon name="Eye" size={16} /></button> : null}
                                        </div>
                                        <span className={`max-w-[56px] truncate text-[0.62rem] leading-none ${scanned ? 'text-emerald-700' : 'text-muted-foreground'}`}>{isUploadingScan ? 'Subiendo' : scanned ? 'Cargado' : 'Arrastre'}</span>
                                    </div>

                                    <select className="form-select form-select-sm h-8 w-[78px] px-1 text-[0.76rem]" name={"submit_list_category_" + ID} defaultValue={category[i]}>
                                        <option>DC</option>
                                        <option>DA-OA</option>
                                        <option>DA-LC</option>
                                        <option>DA-R</option>
                                        <option>EXP</option>
                                        <option>IMP</option>
                                        <option>PRO-UIS</option>
                                        <option>DBU</option>
                                        <option>CCP</option>
                                    </select>

                                    <div className="flex min-w-0 items-center gap-1">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm h-8 min-w-0 px-1 text-center font-mono text-[0.74rem]"
                                            name={"submit_list_code_" + ID}
                                            id={'edit_list_code_' + ID + '_' + i}
                                            defaultValue={code[i]}
                                            disabled={isExtra}
                                        />
                                        {!isExtra ? <div className="shrink-0 [&_button]:h-8 [&_button]:px-2 [&_button]:py-1 [&_button]:text-[10px] [&_svg]:h-3.5 [&_svg]:w-3.5"><DOCS_LIST idRef={ID + '_' + i} setValues={setValuesEdit} text="Lista" /></div> : ""}
                                    </div>

                                    <textarea
                                        rows="1"
                                        className="form-control form-control-sm min-h-8 resize-y overflow-hidden py-1 text-[0.82rem] leading-tight"
                                        name={"submit_list_name_" + ID}
                                        id={'edit_list_name_' + ID + '_' + i}
                                        defaultValue={name[i]}
                                        disabled={isExtra}
                                    />

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        className="form-control form-control-sm h-8 text-center text-[0.78rem]"
                                        name={"submit_list_pages_" + ID}
                                        defaultValue={page[i]}
                                        onChange={(e) => updatePhysicalDraft(ID, i, 'pages', e.target.value)}
                                    />

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        className="form-control form-control-sm h-8 text-center text-[0.78rem]"
                                        name={"submit_list_digital_pages_" + ID}
                                        value={currentDigitalPages}
                                        placeholder={scannedDocument?.pages || currentPages || 'Auto'}
                                        onChange={(e) => updatePhysicalDraft(ID, i, 'digitalPages', e.target.value)}
                                        aria-label="Folios digitales"
                                    />

                                    <ContributorSelect
                                        name={"submit_list_aportante_" + ID}
                                        value={currentContributor}
                                        onChange={(e) => updatePhysicalDraft(ID, i, 'contributor', e.target.value)}
                                    />
                                </fieldset>
                            })}
                        </div>
                    </div>
                </div>
            )
        }

        let setValues = (refs, values) => {
            document.getElementById('new_list_code_' + refs).value = values[0];
            document.getElementById('new_list_name_' + refs).value = values[1];
        }
        let setValuesEdit = (refs, values) => {
            document.getElementById('edit_list_code_' + refs).value = values[0];
            document.getElementById('edit_list_name_' + refs).value = values[1];
        }

        // DATA CONVERTERS FOR DATATABLE
        let _update_selected_list = (value, id) => {
            let _array_selected_list = [...selected_list];
            let _newEntry = value + ':' + id;
            let _searchIndex = _array_selected_list.findIndex(value => value.includes(id));
            if (_searchIndex < 0) _array_selected_list.push(_newEntry);
            else _array_selected_list[_searchIndex] = _newEntry;
            setSelectedList(_array_selected_list);
        }
        let _update_doms = () => {
            /*for (var i = 0; i < this.state.selected_list.length; i++) {
                let _split_value = this.state.selected_list[i].split(':');
                if (document.getElementById(_split_value[1])) document.getElementById(_split_value[1]).value = _split_value[0];
            }*/
        }
        let _GET_DATA_FOR_TITLE = () => {
            let _LIST = list_new ? [list_new] : [Lists.list_61];
            return <span className="fw-bold submit_list_title" id="new_list_title">
                {Object.keys(_LIST[0])}</span>
        }
        let _GET_DATA_FOR_LIST = () => {
            let _LIST = list_new ? [list_new] : [Lists.list_61];
            for (const ITEM in _LIST) {
                const items_set = Object.values(_LIST[ITEM])[0] ?? [];
                return items_set.map((value) => {
                    return {
                        id: value,
                        search_cod: value,
                        search_title: Fun6DocList[value],
                        nome: <select className="form-select" name="submit_list_category" id={'select_' + value} onChange={(e) => _update_selected_list(e.target.value, 'select_' + value)}>
                            <option >DC</option>
                            <option>DA-OA</option>
                            <option>DA-LC</option>
                            <option>DA-R</option>
                            <option>EXP</option>
                            <option>IMP</option>
                            <option>PRO-UIS</option>
                            <option>DBU</option>
                            <option>CCP</option>
                        </select>,
                        cod: <input type="text" className="form-control" name="submit_list_code"
                            value={value} readOnly disabled id={'cod_' + value} onChange={(e) => _update_selected_list(e.target.value, 'cod_' + value)} />,
                        title: <textarea rows="2" className="form-control" name="submit_list_name"
                            value={Fun6DocList[value]} readOnly disabled id={'title_' + value} onChange={(e) => _update_selected_list(e.target.value, 'title_' + value)} >
                        </textarea>,
                        review: <ContributorSelect name="submit_list_aportante" defaultValue="" className="min-w-[128px]" onChange={(e) => _update_selected_list(e.target.value, 'aportante_' + value)} />,
                        pages: <input type="number" min="0" step="1" className="form-control" name="submit_list_pages" id={'pages_' + value} onChange={(e) => _update_selected_list(e.target.value, 'pages_' + value)} />,
                    }
                })
            }
        }
        let getStandardListRows = () => {
            let _LIST = list_new ? [list_new] : [Lists.list_61];
            for (const ITEM in _LIST) {
                const items_set = Object.values(_LIST[ITEM])[0] ?? [];
                return items_set.map((value) => ({
                    category: 'DC',
                    code: value,
                    name: Fun6DocList[value] || '',
                    pages: '',
                    contributor: '',
                }));
            }

            return [];
        }
        var data = {
            columns: [
                {
                    label: 'NOMENCLATURA',
                    field: 'nome',
                },
                {
                    label: 'COD',
                    field: 'cod',
                    sort: 'search_cod',
                    width: '70px'
                },
                {
                    label: _GET_DATA_FOR_TITLE(),
                    field: 'title',
                    sort: 'search_title',
                    width: '300px'
                },
                {
                    label: 'QUIÉN APORTA',
                    field: 'review',
                },
                {
                    label: '# FOLIOS / PLANOS',
                    field: 'pages',
                },
            ],
            rows: _GET_DATA_FOR_LIST(),
        }
        // COMPONENT JSX
        let _COMPONENT_ADD_LIS = () => {
            return <>
                <Button variant="outline" size="sm" className="h-8 justify-center px-2 text-[11px]" onClick={() => setIsNew(true)}>
                        <Icon name="plus-circle" size={16} /> NUEVA LISTA </Button>
            </>

        }
        let _COMPONENT_LIST = () => {
            if (isNew) return _COMPONENT_NEW();

            return (
                <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden">
                    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border/60 bg-background px-2 pt-2">
                        {currentSubLists.map((row, index) => {
                            const isActive = activePanel === 'physical' && index === activeListIndex;
                            const items = row.list_name ? row.list_name.split(";").length : 0;
                            return (
                                <button
                                    type="button"
                                    key={row.id}
                                    aria-current={isActive ? 'page' : undefined}
                                    onClick={() => {
                                        onPanelChange?.('physical');
                                        setActiveListIndex(index);
                                    }}
                                    className={`-mb-px inline-flex max-w-[220px] items-center gap-2 rounded-t-lg border px-3 py-2 text-left text-[12px] transition-colors ${isActive ? 'border-border border-b-background bg-background text-primary shadow-sm' : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted'}`}
                                >
                                    <span className="truncate font-semibold">{row.list_title || `Lista ${index + 1}`}</span>
                                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{items}</span>
                                </button>
                            )
                        })}
                        <button
                            type="button"
                            onClick={() => onPanelChange?.('digital')}
                            className={`-mb-px inline-flex items-center gap-2 rounded-t-lg border px-3 py-2 text-[12px] transition-colors ${activePanel === 'digital' ? 'border-border border-b-background bg-background text-primary shadow-sm' : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted'}`}
                        >
                            Digitales
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{digitalCount}</span>
                        </button>
                        <div className="ml-auto flex items-center gap-1 pb-1">
                            <Button variant="outline" size="sm" className="h-8 px-2" disabled={!currentSubLists.length || activeListIndex <= 0} onClick={goToPreviousList}>
                                <Icon name="chevron-left" size={14} />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-2" disabled={!currentSubLists.length || activeListIndex >= currentSubLists.length - 1} onClick={goToNextList}>
                                <Icon name="chevron-right" size={14} />
                            </Button>
                            {_COMPONENT_ADD_LIS()}
                        </div>
                    </div>

                    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-b-lg border border-t-0 border-border/70 bg-background shadow-sm">
                        {activePanel === 'digital'
                            ? renderDigitalPanel?.()
                            : activeList
                            ? <>
                                <div className="flex shrink-0 flex-col gap-2 border-b border-border/60 bg-muted/20 px-3 py-2 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0 flex-1">
                                        {checkIfExtra(activeList.list_title)
                                            ? <h4 className="mb-0 truncate text-sm font-semibold text-foreground">{activeList.list_title || 'Lista sin título'}</h4>
                                            : <input
                                                type="text"
                                                className="form-control form-control-sm max-w-xl text-sm font-semibold"
                                                id={"save_list_title_" + activeList.id}
                                                placeholder="Título de la lista"
                                                defaultValue={activeList.list_title}
                                            />}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Button variant="outline" size="sm" className="h-8 px-2 text-[11px]" title="Guardar Cambios" onClick={() => save_list(activeList.id)}>
                                            <Icon name="save" size={14} /> Guardar
                                        </Button>
                                        <Button variant="destructive" size="sm" className="h-8 px-2 text-[11px]" title="Eliminar" onClick={() => delete_list(activeList.id)}>
                                            <Icon name="trash-alt" size={14} /> Eliminar
                                        </Button>
                                        <Button type="button" size="sm" className="h-8 px-2 text-[11px]" disabled={!activeReviewedDocuments.length} title="Gestionar escaneados" onClick={() => setScanModalOpen(true)}>
                                            <Icon name="FileUp" size={14} /> Gestionar escaneados
                                        </Button>
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 overflow-auto p-2">
                                    {_LIST_GEN(activeList)}
                                </div>
                            </>
                            : <div className="flex min-h-64 flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                No hay información documental para esta entrada.
                            </div>}
                    </section>
                </div>
            )
        }

        let _COMPONENT_NEW = () => {
            let _COMPONENT = [];
            let _LIST = list_new ? [list_new] : [Lists.list_61];

            _COMPONENT.push(<>
                <div className="row">
                    <div className="text-start col-6 my-3">
                        <label htmlFor="submit_list_type">NUEVA LISTA</label>
                        <select className="form-select" required id={"submit_list_type"}
                            onChange={(e) => _SET_LIST(e)} >
                            {_LIST_COMPONENT()}
                        </select>
                    </div>
                    <div className="text-end col-6 my-3">
                        <Button variant="outline" size="sm" className="my-3 me-2" onClick={() => setIsNew(false)}>
                            <Icon name="times-circle" size={16} />  CANCELAR </Button>
                        <Button size="sm" className="my-3" onClick={() => new_list()}>
                            <Icon name="edit" size={16} /> GUARDAR LISTA </Button>
                    </div>
                </div></>)

            for (const ITEM in _LIST) {

                if (Object.keys(_LIST[ITEM])[0]) {
                    const rows = getStandardListRows();
                    _COMPONENT.push(<>
                        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Lista seleccionada</span>
                                    {_GET_DATA_FOR_TITLE()}
                                    <p className="mb-0 mt-1">Al guardar, esta lista quedará disponible en las pestañas superiores para editar folios, cargar escaneados por fila y previsualizarlos.</p>
                                </div>
                                <span className="inline-flex w-fit items-center rounded-full border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground">
                                    {rows.length} documento{rows.length === 1 ? '' : 's'} base
                                </span>
                            </div>
                        </div>
                    </>)
                } else {
                    _COMPONENT.push(<>{_COMPONENT_EXTRA_LIST()}</>)
                }
            }
            return <>{_COMPONENT}</>
        }
        let _COMPONENT_EXTRA_LIST = () => {
            let _COMPONENT = [];

            _COMPONENT.push(<React.Fragment key="extra-list-header">
                <div className="row text-center border border-secondary py-2 bg-secondary text-white">
                    <div className="col-2">
                        <span className="fw-bold">Nomenclatura</span>
                    </div>
                    <div className="col-2">
                        <span className="fw-bold">COD</span>
                    </div>
                    <div className="col-4">
                        <input type="text" className="form-control" id="new_list_title"
                            placeholder="Titulo..." />
                    </div>
                    <div className="col-2">
                        <span className="fw-bold">Quién aporta</span>
                    </div>
                    <div className="col-2">
                        <span className="fw-bold"># FOLIOS / PLANOS</span>
                    </div>
                </div>
            </React.Fragment>)

            for (let i = 0; i < extra_items; i++) {
                _COMPONENT.push(<React.Fragment key={`extra-list-item-${i}`}>
                    <div className="row border border-secondary py-1 text-center">
                        <div className="col-2">
                            <select className="form-select" name="submit_list_category" >
                                <option >DC</option>
                                <option>DA-OA</option>
                                <option>DA-LC</option>
                                <option>DA-R</option>
                                <option>EXP</option>
                                <option>IMP</option>
                                <option>PRO-UIS</option>
                                <option>DBU</option>
                                <option>CCP</option>
                            </select>
                        </div>
                        <div className="col-2">
                            <input type="text" className="form-control" name="submit_list_code"
                                id={"new_list_code_" + i} />
                            <DOCS_LIST idRef={i} setValues={setValues} text={"VER LISTA"} />
                        </div>
                        <div className="col-4 text-start">
                            <textarea rows="2" className="form-control" name="submit_list_name"
                                id={"new_list_name_" + i} >
                            </textarea>
                        </div>
                        <div className="col-2">
                            <ContributorSelect name="submit_list_aportante" />
                        </div>
                        <div className="col-2">
                            <input type="number" min="0" step="1" className="form-control" name="submit_list_pages" />
                        </div>
                    </div>
                </React.Fragment>)

            }

            _COMPONENT.push(<React.Fragment key="extra-list-footer">
                <div className="row text-center border border-secondary py-2 text-white">
                    <div className="col-6">
                        <span className="fw-bold text-dark">ITEMS TOTALES: {extra_items}</span>
                    </div>
                    <div className="col-6 text-end">
                        {extra_items > 0
                            ? <Button variant="outline" size="sm" className="my-3 me-1" onClick={() => setExtraItems(extra_items - 1)}>
                                <Icon name="minus-circle" size={16} /> REMOVER ULTIMO </Button>
                            : ""}
                        <Button variant="outline" size="sm" className="my-3" onClick={() => setExtraItems(extra_items + 1)}>
                            <Icon name="plus-circle" size={16} /> AÑADIR ITEM </Button>
                    </div>
                </div>
            </React.Fragment>)

            return <>{_COMPONENT}</>
        }

        // FUNCTIONS AND APIS
        var formData = new FormData();

        let resolveRelatedFun = () => {
            const relatedFunPublicId = currentItem.id_related || currentItem.id_public;
            return relatedFunPublicId
                ? funService.get_fun_IdPublic(relatedFunPublicId).then((funResponse) => funResponse.data).catch(() => null)
                : Promise.resolve(null);
        };

        let buildScanFilename = (relatedFun, documentCode, file) => {
            const creationYear = dayjs(relatedFun?.createdAt || currentItem.createdAt).format('YY');
            const folder = relatedFun?.id_public || currentItem.id_related || currentItem.id_public;
            return `fun6_${creationYear}_${folder}_${documentCode}-${file.name}`;
        };

        let refreshDigitalDocuments = () => {
            const relatedFunId = currentItem.id_related || currentItem.id_public;
            return funService.getAll_VrFun(relatedFunId, currentItem.id_public)
                .then((response) => {
                    const rows = Array.isArray(response.data) ? response.data : [];
                    setLocalDigitalDocuments(rows);
                    return rows;
                })
                .catch(() => []);
        };

        let resolveDigitalPagesFromFile = (file, fallbackPages = '') => {
            const fallback = String(fallbackPages || '').trim();
            if (!file) return Promise.resolve(fallback);

            const fileType = String(file.type || '').toLowerCase();
            const fileName = String(file.name || '').toLowerCase();
            const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
            const isImage = fileType.startsWith('image/') || /\.(jpe?g|png)$/i.test(fileName);

            if (isPdf && file.arrayBuffer) {
                return file.arrayBuffer()
                    .then((buffer) => PDFDocument.load(buffer, { ignoreEncryption: true }))
                    .then((pdfDocument) => String(pdfDocument.getPageCount()))
                    .catch(() => fallback);
            }

            if (isImage) return Promise.resolve(fallback || '1');

            return Promise.resolve(fallback);
        };

        let uploadScannedDocument = (row, rowIndex, file, defaults = {}) => {
            const listId = row.id;
            const codeInput = document.getElementById('edit_list_code_' + listId + '_' + rowIndex);
            const nameInput = document.getElementById('edit_list_name_' + listId + '_' + rowIndex);
            const pagesInputs = document.getElementsByName('submit_list_pages_' + listId);
            const documentCode = (codeInput?.value || defaults.code || '').trim();
            const documentName = (nameInput?.value || defaults.name || '').trim();
            const physicalPages = pagesInputs[rowIndex]?.value || defaults.pages || '';
            const digitalPages = getPhysicalDraftValue(listId, rowIndex, 'digitalPages', defaults.digitalPages || physicalPages || '');
            const candidateExistingDocument = defaults.existingDocument || getScannedDocument(documentCode);
            const existingDocument = belongsToCurrentVr(candidateExistingDocument) ? candidateExistingDocument : null;

            if (!file || !documentCode || !documentName) {
                swalError({
                    title: 'Escaneado incompleto',
                    text: 'Seleccione archivo, código, descripción y folios digitales para guardar el escaneado.',
                    icon: 'warning',
                });
                return Promise.resolve(false);
            }

            updateScanUploadState(listId, rowIndex, { status: 'uploading', message: 'Calculando folios...' });

            return resolveDigitalPagesFromFile(file, digitalPages || physicalPages)
                .then((resolvedPages) => {
                    const pages = Number(resolvedPages) > 0 ? resolvedPages : physicalPages;

                    if (!pages || Number(pages) < 1) {
                        updateScanUploadState(listId, rowIndex, { status: 'error', message: 'Sin folios' });
                        swalError({
                            title: 'Folios digitales requeridos',
                            text: 'No fue posible contar los folios del archivo. Ingrese el número de folios digitales y vuelva a cargarlo.',
                            icon: 'warning',
                        });
                        return false;
                    }

                    updatePhysicalDraft(listId, rowIndex, 'digitalPages', String(pages));
                    updateScanUploadState(listId, rowIndex, { status: 'uploading', message: existingDocument ? 'Reemplazando...' : 'Subiendo...' });

                    return resolveRelatedFun()
                .then((relatedFun) => {
                    const fileName = buildScanFilename(relatedFun, documentCode, file);

                    if (existingDocument?.id) {
                        const replaceFormData = new FormData();
                        replaceFormData.set('attached', 'true');
                        replaceFormData.set('description', documentName);
                        replaceFormData.set('id_public', documentCode);
                        replaceFormData.set('id_replace', currentItem.id_public);
                        replaceFormData.set('pages', pages);
                        replaceFormData.set('date', dayjs().format('YYYY-MM-DD'));
                        replaceFormData.set('origin_state', DOCUMENT_ORIGIN_STATE.SCANNED);
                        replaceFormData.set('medio_recepcion', '');
                        replaceFormData.set('active', 1);
                        replaceFormData.append('file', file, fileName);
                        return funService.update_6(existingDocument.id, replaceFormData);
                    }

                    const fileField = `file_${listId}_${rowIndex}`;
                    const scanFormData = new FormData();
                    scanFormData.set('idRelated', currentItem.id_public);
                    if (relatedFun?.id) scanFormData.set('fun0Id', relatedFun.id);

                    const rowData = {
                        selected: true,
                        documentCode,
                        documentName,
                        vr: currentItem.id_public,
                        pages,
                        date: dayjs().format('YYYY-MM-DD'),
                        originState: DOCUMENT_ORIGIN_STATE.SCANNED,
                        receptionMedium: '',
                        fileField,
                        uploadIndex: 0,
                    };
                    if (relatedFun?.id) rowData.fun0Id = relatedFun.id;

                    scanFormData.set('rows', JSON.stringify([rowData]));
                    scanFormData.append(fileField, file, fileName);
                    return funService.createDocumentEntriesBatch(scanFormData);
                })
                .then((response) => {
                    const ok = response?.data === 'OK' || response?.data?.status === 'OK';
                    if (!ok) {
                        updateScanUploadState(listId, rowIndex, { status: 'error', message: 'No guardado' });
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        return false;
                    }

                    const savedRows = Array.isArray(response?.data?.rows) ? response.data.rows : [];
                    const fallbackDocument = {
                        ...(existingDocument || {}),
                        id: existingDocument?.id,
                        description: documentName,
                        id_public: documentCode,
                        id_replace: currentItem.id_public,
                        pages,
                        origin_state: DOCUMENT_ORIGIN_STATE.SCANNED,
                        active: 1,
                    };
                    const documentsToMerge = (savedRows.length ? savedRows : [fallbackDocument])
                        .map((documentItem) => ({ ...documentItem, id_replace: documentItem?.id_replace || currentItem.id_public }))
                        .filter(belongsToCurrentVr);

                    setLocalDigitalDocuments((currentDocuments) => {
                        const incomingIds = new Set(documentsToMerge.map((documentItem) => documentItem?.id).filter(Boolean));
                        const incomingCodes = new Set(documentsToMerge.map((documentItem) => normalizeDocumentCode(documentItem?.id_public)).filter(Boolean));
                        const remainingDocuments = currentDocuments.filter((documentItem) => {
                            const sameId = documentItem?.id && incomingIds.has(documentItem.id);
                            const sameCode = incomingCodes.has(normalizeDocumentCode(documentItem?.id_public));
                            return !sameId && !sameCode;
                        });

                        return [...remainingDocuments, ...documentsToMerge];
                    });

                    return refreshDigitalDocuments().then(() => {
                        updateScanUploadState(listId, rowIndex, { status: 'success', message: existingDocument ? 'Reemplazado' : 'Guardado' });
                        clearScanDraft(listId, rowIndex);
                        updatePhysicalDraft(listId, rowIndex, 'digitalPages', String(pages));
                        setTimeout(() => clearScanUploadState(listId, rowIndex), 1200);
                        refreshList();
                        return true;
                    });
                });
                })
                .catch((error) => {
                    updateScanUploadState(listId, rowIndex, { status: 'error', message: 'Error' });
                    swalError({ title: 'Error al guardar escaneado', text: error.response?.data?.message || swaMsg.generic_error_text, icon: 'warning' });
                    return false;
                });
        };

        let deleteScannedDocument = (documentItem) => {
            if (!documentItem?.id) return;
            if (!belongsToCurrentVr(documentItem)) {
                swalError({ title: 'Escaneado fuera del VR activo', text: 'Este documento no pertenece a la entrada de ventanilla seleccionada.' });
                return;
            }

            swalConfirm({ title: 'Eliminar escaneado', text: '¿Desea eliminar el archivo escaneado asociado a este documento?', icon: 'question', confirmButtonText: 'ELIMINAR' }).then(SweetAlertResult => {
                if (!SweetAlertResult.isConfirmed) return;

                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                funService.delete_6(documentItem.id)
                    .then((response) => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: 'Escaneado eliminado', text: 'El archivo escaneado fue eliminado correctamente.' });
                            setLocalDigitalDocuments((currentDocuments) => currentDocuments.filter((localDocument) => localDocument?.id !== documentItem.id));
                            refreshList();
                            return;
                        }

                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    })
                    .catch((error) => {
                        swalError({ title: 'Error al eliminar escaneado', text: error.response?.data?.message || swaMsg.generic_error_text, icon: 'warning' });
                    });
            });
        };

        let createScannedDocument = (row, rowIndex, defaults = {}) => {
            const listId = row.id;
            const scanDraft = scanDrafts[getScanDraftKey(listId, rowIndex)] || {};
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            uploadScannedDocument(row, rowIndex, scanDraft.file, { ...defaults, digitalPages: scanDraft.digitalPages })
                .then((ok) => {
                    if (ok) swalSuccess({ title: 'Escaneado guardado', text: 'El escaneado se registró correctamente como documento digitalizado.' });
                });
        };

        let new_list = () => {
            formData = new FormData();
            formData.set('submitId', currentItem.id);
            let new_list_type = document.getElementById("submit_list_type").value;

            if (new_list_type === "LISTA EXTRA" && extra_items === 0) {
                swalError({ title: "LISTA EXTRA VACIA", text: "Para crear una Lista Extra de documentos, debe añadir almenos un elemeno.", icon: 'warning' });
                return 1
            }

            let listTitleElement = document.getElementById("new_list_title");
            let list_title = listTitleElement?.textContent || listTitleElement?.value || new_list_type;
            formData.set('list_title', list_title);

            let list_category = [];
            let list_code = [];
            let list_name = [];
            let list_review = [];
            let list_pages = [];
            let list_aportante = [];

            if (new_list_type === "LISTA EXTRA") {
                let submit_list_category = document.getElementsByName("submit_list_category");
                let submit_list_code = document.getElementsByName("submit_list_code");
                let submit_list_name = document.getElementsByName("submit_list_name");
                let submit_list_aportante = document.getElementsByName("submit_list_aportante");
                let submit_list_pages = document.getElementsByName("submit_list_pages");

                for (let i = 0; i < submit_list_pages.length; i++) {
                    list_category.push(submit_list_category[i].value);
                    list_code.push(submit_list_code[i].value);
                    list_name.push(submit_list_name[i].value);
                    const currentPages = submit_list_pages[i].value;
                    const currentContributor = submit_list_aportante[i]?.value || '';
                    list_pages.push(currentPages);
                    list_review.push(deriveReviewFromPages(currentPages));
                    list_aportante.push(normalizeContributor(currentContributor));
                }
            } else {
                getStandardListRows().forEach((row) => {
                    list_category.push(row.category);
                    list_code.push(row.code);
                    list_name.push(row.name);
                    list_pages.push(row.pages);
                    list_review.push(deriveReviewFromPages(row.pages));
                    list_aportante.push(normalizeContributor(row.contributor));
                });
            }
            formData.set('list_category', list_category.join(','));
            formData.set('list_code', list_code.join(','));
            formData.set('list_name', list_name.join(';'));
            formData.set('list_review', list_review.join(','));
            formData.set('list_pages', list_pages.join(','));
            formData.set('list_aportante', list_aportante.join(','));

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            SubmitService.create_list(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshList();
                        onPanelChange?.('physical');
                        setActiveListIndex(currentSubLists.length);
                        setIsNew(false)
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });

        };

        let save_list = (ID) => {
            formData = new FormData();

            let submit_list_category = document.getElementsByName("submit_list_category_" + ID);
            let submit_list_code = document.getElementsByName("submit_list_code_" + ID);
            let submit_list_name = document.getElementsByName("submit_list_name_" + ID);
            let submit_list_aportante = document.getElementsByName("submit_list_aportante_" + ID);
            let submit_list_pages = document.getElementsByName("submit_list_pages_" + ID);

            let list_title = document.getElementById("save_list_title_" + ID) ? document.getElementById("save_list_title_" + ID).value : false;
            if (list_title) formData.set('list_title', list_title);

            let list_category = [];
            let list_code = [];
            let list_name = [];
            let list_review = [];
            let list_pages = [];
            let list_aportante = [];

            for (let i = 0; i < submit_list_pages.length; i++) {
                list_category.push(submit_list_category[i].value);
                list_code.push(submit_list_code[i].value);
                list_name.push(submit_list_name[i].value);
                const currentPages = getPhysicalDraftValue(ID, i, 'pages', submit_list_pages[i].value);
                const currentContributor = getPhysicalDraftValue(ID, i, 'contributor', submit_list_aportante[i]?.value || '');
                list_pages.push(currentPages);
                list_review.push(deriveReviewFromPages(currentPages));
                list_aportante.push(normalizeContributor(currentContributor));
            }
            formData.set('list_category', list_category.join(','));
            formData.set('list_code', list_code.join(','));
            formData.set('list_name', list_name.join(';'));
            formData.set('list_review', list_review.join(','));
            formData.set('list_pages', list_pages.join(','));
            formData.set('list_aportante', list_aportante.join(','));

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            SubmitService.update_list(ID, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshList();
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });

        };

        let delete_list = (id) => {
            swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    SubmitService.delete_list(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                refreshList();
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        });
                }
            });
        };

        const renderScanModal = () => {
            const reviewedDocuments = activeReviewedDocuments;

            return (
                <LegacyModal
                    isOpen={scanModalOpen}
                    onRequestClose={() => setScanModalOpen(false)}
                    contentLabel="Gestionar escaneados"
                    style={{
                        content: {
                            top: '6%',
                            left: '50%',
                            right: 'auto',
                            bottom: '6%',
                            width: 'min(92vw, 980px)',
                            maxWidth: '980px',
                            transform: 'translateX(-50%)',
                            overflow: 'hidden',
                            padding: 0,
                        },
                    }}
                >
                    <section className="flex h-full min-h-0 flex-col bg-background text-foreground">
                        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
                            <div className="min-w-0">
                                <h3 className="mb-1 text-base font-semibold">Gestionar escaneados</h3>
                                <p className="mb-0 text-sm text-muted-foreground">Consulte, previsualice, reemplace o elimine escaneados únicamente para documentos de la lista activa de este VR.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 px-2" onClick={() => setScanModalOpen(false)}>
                                <Icon name="XCircle" size={14} /> Cerrar
                            </Button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-3">
                            {reviewedDocuments.length
                                ? <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                                    <div className="grid grid-cols-[105px_minmax(260px,1fr)_90px_110px_150px] gap-2 border-b border-border/70 bg-muted/25 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                        <span>Código</span>
                                        <span>Documento</span>
                                        <span className="text-center">Folios dig.</span>
                                        <span>Estado</span>
                                        <span className="text-center">Acciones</span>
                                    </div>
                                    <div className="divide-y divide-border/70">
                                        {reviewedDocuments.map((documentItem) => {
                                            const scanDraft = scanDrafts[getScanDraftKey(activeList.id, documentItem.originalIndex)] || {};
                                            const scannedDocument = getScannedDocument(documentItem.code);
                                            const uploadKey = getScanUploadKey(activeList.id, documentItem.originalIndex);
                                            const uploadState = scanUploadStates[uploadKey] || {};
                                            const digitalPages = getPhysicalDraftValue(activeList.id, documentItem.originalIndex, 'digitalPages', scanDraft.digitalPages || scannedDocument?.pages || '');

                                            return (
                                                <div key={`${activeList.id}-${documentItem.originalIndex}`} className="grid grid-cols-[105px_minmax(260px,1fr)_90px_110px_150px] gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/20">
                                                    <div className="min-w-0">
                                                        <span className="block truncate font-mono text-xs font-semibold text-foreground">{documentItem.code || 'Sin código'}</span>
                                                        <span className="text-[0.7rem] text-muted-foreground">{documentItem.category || 'Sin categoría'} · {documentItem.pages || 0} físico{String(documentItem.pages) === '1' ? '' : 's'}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="mb-0 truncate font-medium leading-snug text-foreground">{documentItem.name || 'Documento sin descripción'}</p>
                                                        {scannedDocument?.filename ? <p className="mb-0 truncate text-[0.72rem] text-muted-foreground">{scannedDocument.filename}</p> : null}
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        className="form-control form-control-sm h-8 text-center text-[0.78rem]"
                                                        value={digitalPages}
                                                        placeholder={documentItem.pages || 'Auto'}
                                                        onChange={(e) => {
                                                            updateScanDraft(activeList.id, documentItem.originalIndex, { digitalPages: e.target.value });
                                                            updatePhysicalDraft(activeList.id, documentItem.originalIndex, 'digitalPages', e.target.value);
                                                        }}
                                                        aria-label="Folios digitales del escaneado"
                                                    />
                                                    <div className="flex items-center">
                                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.72rem] font-semibold ${uploadState.status === 'uploading' ? 'border-primary/40 bg-primary/10 text-primary' : scannedDocument ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700' : 'border-border bg-muted/30 text-muted-foreground'}`}>
                                                            <Icon name={uploadState.status === 'uploading' ? 'Loader2' : scannedDocument ? 'SearchCheck' : 'XCircle'} size={13} className={uploadState.status === 'uploading' ? 'animate-spin' : ''} />
                                                            {uploadState.status === 'uploading' ? 'Guardando' : scannedDocument ? 'Cargado' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {scannedDocument ? <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition-colors hover:text-primary" onClick={() => openScanPreview(scannedDocument)} aria-label="Previsualizar escaneado"><Icon name="Eye" size={16} /></button> : null}
                                                        <input
                                                            type="file"
                                                            id={`scan_modal_file_${activeList.id}_${documentItem.originalIndex}`}
                                                            className="sr-only"
                                                            accept="application/pdf,image/jpeg,image/png"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0] || null;
                                                                updateScanDraft(activeList.id, documentItem.originalIndex, { file });
                                                                if (file) {
                                                                    resolveDigitalPagesFromFile(file, digitalPages || documentItem.pages)
                                                                        .then((resolvedPages) => {
                                                                            if (Number(resolvedPages) > 0) {
                                                                                updateScanDraft(activeList.id, documentItem.originalIndex, { digitalPages: String(resolvedPages) });
                                                                                updatePhysicalDraft(activeList.id, documentItem.originalIndex, 'digitalPages', String(resolvedPages));
                                                                            }
                                                                        });
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition-colors hover:text-primary"
                                                            onClick={() => document.getElementById(`scan_modal_file_${activeList.id}_${documentItem.originalIndex}`)?.click()}
                                                            aria-label={scannedDocument ? 'Seleccionar reemplazo' : 'Seleccionar archivo'}
                                                        >
                                                            <Icon name="FileUp" size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                                                            disabled={!scanDraft.file}
                                                            onClick={() => createScannedDocument(activeList, documentItem.originalIndex, { code: documentItem.code, name: documentItem.name, pages: documentItem.pages, digitalPages, existingDocument: scannedDocument })}
                                                            aria-label={scannedDocument ? 'Reemplazar escaneado' : 'Crear escaneado'}
                                                        >
                                                            <Icon name={scannedDocument ? 'Upload' : 'FilePlus'} size={16} />
                                                        </button>
                                                        {scannedDocument ? <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/15"
                                                            onClick={() => deleteScannedDocument(scannedDocument)}
                                                            aria-label="Eliminar escaneado"
                                                        >
                                                            <Icon name="Trash2" size={16} />
                                                        </button> : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                : <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                    Esta lista no tiene documentos para gestionar escaneados.
                                </div>}
                        </div>
                    </section>
                </LegacyModal>
            );
        };

        const renderScanPreviewModal = () => {
            const previewUrl = getScanPreviewUrl(scanPreviewDocument);
            const downloadUrl = getScanDownloadUrl(scanPreviewDocument);

            return (
                <LegacyModal
                    isOpen={Boolean(scanPreviewDocument)}
                    onRequestClose={() => setScanPreviewDocument(null)}
                    contentLabel="Previsualizar escaneado"
                    style={{
                        content: {
                            top: '5%',
                            left: '50%',
                            right: 'auto',
                            bottom: '5%',
                            width: 'min(94vw, 1100px)',
                            maxWidth: '1100px',
                            transform: 'translateX(-50%)',
                            overflow: 'hidden',
                            padding: 0,
                        },
                    }}
                >
                    <section className="flex h-full min-h-0 flex-col bg-background text-foreground">
                        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
                            <div className="min-w-0">
                                <h3 className="mb-1 text-base font-semibold">Previsualizar escaneado</h3>
                                <p className="mb-0 truncate text-sm text-muted-foreground">{scanPreviewDocument?.filename || scanPreviewDocument?.description || 'Documento escaneado'}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {downloadUrl ? <a className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted" href={downloadUrl} target="_blank" rel="noreferrer"><Icon name="FileCheck" size={14} /> Descargar</a> : null}
                                <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={() => setScanPreviewDocument(null)}>
                                    <Icon name="XCircle" size={14} /> Cerrar
                                </Button>
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 bg-muted/30 p-3">
                            {previewUrl ? <iframe title="Previsualización del escaneado" src={previewUrl} className="h-full min-h-[520px] w-full rounded-lg border border-border bg-background" /> : <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground">Previsualización no disponible.</div>}
                        </div>
                    </section>
                </LegacyModal>
            );
        };

        return (
            <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                <div className="h-full min-h-0 flex-1 overflow-auto">
                    {_COMPONENT_LIST()}
                </div>
                {renderScanModal()}
                {renderScanPreviewModal()}
            </section>
        );
}

export default SUBMIT_LIST;

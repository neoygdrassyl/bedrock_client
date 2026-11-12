import { useState, useEffect, useCallback } from 'react';
import FUNService from '../../../api/fun.service'

import Collapsible from '../../../../../shared/components/Collapsible';
import dayjs from 'dayjs';
import FUN6DATALIST from './fun_6_datalist';

import FUND_NAV from './fun_d_nav';
import FUN_MODULE_NAV from './fun_moduleNav';
import FUN_VERSION_NAV from './fun_versionNav';

import FUN_SERVICE from '../../../api/fun.service';
import DOCS_LIST from './docs_list.component';
import FUN_6_VIEW from '../fun_6.view';

import { PDFDocument } from 'pdf-lib'
import { buildGeneratorContext, evaluateGenerator, generatorsBySection, getGeneratorProps, GENERATOR_SECTION_AUTOMATIC, GENERATOR_SECTION_SPECIAL } from './documentGeneratorsRegistry';
import { Icon } from '@/shared/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/shared/utils/swalAdapter';
import { Button } from '@/shared/ui/button';
import { SectionCard } from '@/shared/components/SectionCard';

function FUN_DOCS({ NAVIGATION, NAVIGATION_VERSION, currentId, swaMsg, translation, globals, currentVersion }) {
        const [attachs, setAttachs] = useState(0);
        const [item, setItem] = useState(null);
        const [show_doc_1, setShow_doc_1] = useState(false);
        const [modal_searchList, setModal_searchList] = useState(false);
        const [pqrsxfun, setPqrsxfun] = useState(false);
        const [funVRList, setFunVRList] = useState([]);
        const [currentItem, setCurrentItem] = useState(null);
        const [load, setLoad] = useState(null);
    const requestUpdate = (id) => {
        retrieveItem(id);
    }
    useEffect(() => {
        retrieveItem(currentId);
    }, []);

    const retrieveItem = (id) => {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                setLoad(true)
                retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    }
    const retrievePQRSxFUN = (id_public) => {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data)
            })
            .catch(e => {
                console.log(e);
            });
    }
    useEffect(() => {
        if (item != null) {
            document.getElementById('fun6_descriptions_edit').value = item.description;
            document.getElementById('fun6_codes_edit').value = item.id_public;
            document.getElementById('fun6_pages_edit').value = item.pages;
            document.getElementById('fun6_dates_edit').value = item.date;
        }
    }, [item]);

    const addAttach = () => {
        setAttachs(prev => prev + 1)
    }
    const minusAttach = () => {
        setAttachs(prev => prev - 1)
    }

    const readPDF = async (file, i) => {
        if (file.type == "application/pdf") {
            var path = (window.URL || window.webkitURL).createObjectURL(file);
            const url = path
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
            const pdfDoc = await PDFDocument.load(existingPdfBytes)
            const pages = pdfDoc.getPages().length
            document.getElementById('fun6_page_' + i).value = pages
        }
    };

        var formData = new FormData();

        let setValues = (refs, values) => {
            document.getElementById('fun6_codes_' + refs).value = values[0];
            document.getElementById('fun6_descriptions_' + refs).value = values[1];
        }

        let _ATTACHS_COMPONENT = () => {
            var array_of_attachts = Array(attachs).fill(0);
            return array_of_attachts.map((a, i) => {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="app-p lead text-start fw-normal">DOCUMENTO ANEXO N° {i + 1}</label>
                            <div className="input-group">
                                <span className="input-group-text bg-primary text-primary-foreground"><Icon name="paperclip" size={16} /></span>
                                <input type="file" className="form-control" name="files_fun6s" accept="image/png, image/jpeg application/pdf"
                                    required onChange={(e) => readPDF(e.target.files[0], i)} />
                            </div>
                            <div className="input-group">
                                <span className="input-group-text bg-primary text-primary-foreground"><Icon name="paperclip" size={16} /></span>
                                <input list="fun_6_docs_list" name="fun6_descriptions" id={'fun6_descriptions_' + i} className="form-control" placeholder="Descripcion del documento" />
                                <DOCS_LIST idRef={i} setValues={setValues} text={'VER LISTA'} />
                            </div>
                        </div>
                    </div>
                    <div className="row d-flex justify-content-start">
                        <div className="col">
                            <div className="input-group">
                                <span className="input-group-text bg-primary text-primary-foreground"><Icon name="hashtag" size={16} /></span>
                                <input type="text" className="form-control" id={'fun6_codes_' + i} placeholder="Codigo" name="fun6_codes" />
                            </div>
                        </div>
                        <div className="col">
                            <div className="input-group">
                                <span className="input-group-text bg-primary text-primary-foreground"><Icon name="sticky-note" size={16} /></span>
                                <input type="number" className="form-control" placeholder="Folios" step="1" min="0" name="fun6_pages"
                                    id={'fun6_page_' + i} />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input-group">
                                <span className="input-group-text bg-primary text-primary-foreground"><Icon name="calendar-alt" size={16} />&nbsp;Fecha Radicación</span>
                                <input type="date" className="form-control" max="2100-01-01" defaultValue={dayjs().format('YYYY-MM-DD')} name="fun6_dates" />
                            </div>
                        </div>
                    </div>
                </>
            })
        }
        let addDocument = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);

            let _creationYear = dayjs(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;

            // GET DATA OF ATTACHS
            let files = document.getElementsByName("files_fun6s");
            formData.set('attachs_length', attachs);
            for (var i = 0; i < attachs; i++) {
                let code = document.getElementsByName("fun6_codes")
                if (files[i].files[0]) {
                    formData.append('file', files[i].files[0], "fun6_" + _creationYear + "_" + _folder + "_" + code[i].value + "-"+ files[i].files[0].name)
                }
            }

            let array_form = [];
            let array_html = [];

            array_html = document.getElementsByName("fun6_descriptions");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('descriptions', array_form.join());
            array_form = [];

            array_html = document.getElementsByName("fun6_codes");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('codes', array_form.join());
            array_form = [];

            array_html = document.getElementsByName("fun6_pages");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('pages', array_form.join());
            array_form = [];

            array_html = document.getElementsByName("fun6_dates");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('dates', array_form.join());
            array_form = [];

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.create_fun6(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        setAttachs(0);
                        requestUpdate(currentItem.id);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });

        }

        let generateCVSNegative = (_data, _id) => {
            var rows = [];
            const headRows = [
                'No. Solicitud',  'Descripción', 'VR', 'Código', 'Folios', 'Fecha Radicación'
            ]
            rows = _data.map(d =>
            ([_id, d.name, d.id_public, d.code, d.page, d.date])
            )
            rows.unshift(headRows);

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");

            var encodedUri = encodeURI(csvContent);
            const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

            var link = document.createElement("a");
            link.setAttribute("href", fixedEncodedURI);
            link.setAttribute("download", `DOCUMENTOS RADICADOS ${_id}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }

        // Generators come from the shared registry (also used by the documentary module's
        // "Generar documentos" tab); the markup below is the legacy one.
        let renderGenerators = (section) => {
            const ctx = buildGeneratorContext({ currentItem, currentVersion, requestUpdate });
            const baseProps = { translation, swaMsg, globals, currentItem, currentVersion };
            const rendered = generatorsBySection(section).map((entry) => {
                const { visible, available } = evaluateGenerator(entry, ctx);
                if (!visible || !available) return null;
                const Generator = entry.component;
                return <div id={entry.domId} key={entry.id}>
                    <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info">{entry.label}</label>}>
                        <div className='text-start'>
                            <Generator {...getGeneratorProps(entry, baseProps, ctx)} />
                        </div>
                    </Collapsible>
                </div>
            }).filter(Boolean);
            // Absence is stated, never an empty card.
            if (!rendered.length) return <p className="m-0 text-sm text-muted-foreground">No hay documentos disponibles para esta solicitud.</p>;
            return rendered;
        }
        return (
            <div>
                <SectionCard
                    id="fund_11"
                    title={<span id="fund_1">1. Gestión documental</span>}
                    actions={
                        <Button variant="outline" size="sm" disabled={!funVRList.length} onClick={() => { generateCVSNegative(funVRList, currentItem.id_public) }}>
                            <Icon name="file-csv" size={16} /> Descargar CSV
                        </Button>
                    }
                >
                    {currentItem != null
                        ? <FUN_6_VIEW
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentId={currentId}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate}
                            VREdit
                            mergeVentanilla
                            onVentanillaRowsChange={setFunVRList}
                        />
                        : <p className="m-0 py-8 text-center text-sm text-muted-foreground" role="status">Cargando información de la solicitud…</p>}
                </SectionCard>
                {currentItem != null ? <>

                    <SectionCard id="fund_4" title="2. Generar documentos automáticos">
                        {renderGenerators(GENERATOR_SECTION_AUTOMATIC)}
                    </SectionCard>

                    <SectionCard id="fund_5" title="3. Control de documentación especial">
                        {renderGenerators(GENERATOR_SECTION_SPECIAL)}
                    </SectionCard>

                    {/* <FUND_NAV currentItem={currentItem} /> */}
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"archive"}
                        NAVIGATION={NAVIGATION}
                        pqrsxfun={pqrsxfun}
                    />
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        NAVIGATION_VERSION={NAVIGATION_VERSION}
                        ON
                    />
                </> : null}

            </div>
        );
}

export default FUN_DOCS;

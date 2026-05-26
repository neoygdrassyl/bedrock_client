import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/icon';
import FUNService from '../../../../services/fun.service'
import FunCorrelatedDocumentControl from './FunCorrelatedDocumentControl';

import JsonDocList from '../../../../components/jsons/fun6DocsList.json'
import { regexChecker_cota, regexChecker_isPh, regexChecker_modPlano, regexChecker_movTierra, regexChecker_piscina } from '../../../../components/customClasses/typeParse';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';


const fatherValues = ['511', '512', '513', '516', '517', '518', '519',
    '621', '601a', '622', '602a', '623', '601b', '602b', '624', '625', '626', '627', '601c', '602c',
    '630', '631', '632', '633', '634', '635', '636',
    '641', '642', '643',
    '651', '652', '653',
    '6601', '6602', '6603', '6604', '6605', '911', '660a', '660b', '660c', '660d', '660e', '660f', '6607', '6608',
    '6609', '6610', '6611', '6612', '6613', '6614', '6615', '6616', '6617', '6618', '6619',
    '671', '672',
    '680', '681', '682', '683', '684', '685', '686', '687', '6862', '688', '689', '6891', '6892', '6893'];

const dvCheckList = {
    '511': () => true,
    '512': () => true,
    '513': () => true,
    '516': () => true,
    '517': () => true,
    '518': () => true,
    '519': () => true,

    '621': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'A' : true,
    '601a': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'A' : true,
    '622': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'A' : true,
    '602a': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'A' : true,
    '623': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'B' : true,
    '601b': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'B' : true,
    '602b': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'B' : true,
    '624': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'B' : true,
    '625': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'B' : true,
    '626': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'C' : true,
    '627': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'C' : true,
    '601c': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'C' : true,
    '602c': item => item.fun_1s[0] ? item.fun_1s[0].m_urb == 'C' : true,

    '630': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('B') : true,
    '631': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('B') : true,
    '632': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('B') : true,
    '633': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('B') : true,
    '634': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('B') : true,
    '635': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('B') : true,
    '636': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('B') : true,

    '641': item => item.fun_1s[0] ? item.fun_1s[0].m_sub == 'A' : true,
    '642': item => item.fun_1s[0] ? item.fun_1s[0].m_sub == 'B' : true,
    '643': item => item.fun_1s[0] ? item.fun_1s[0].m_sub == 'B' : true,

    '651': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('F') : true,
    '652': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('F') : true,
    '653': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('F') : true,

    '6601': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('D') : true,
    '6602': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('D') : true,
    '6603': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('D') : true,
    '6604': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('D') : true,
    '6605': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('D') : true,
    '911': item => item.fun_1s[0] ? item.fun_1s[0].tipo.includes('D') : true,

    '660a': item => item.fun_1s[0] ? item.fun_1s[0].area == 'B' : true,
    '660b': item => item.fun_1s[0] ? item.fun_1s[0].area == 'C' : true,
    '660c': item => item.fun_1s[0] ? item.fun_1s[0].area == 'D' : true,
    '660d': item => item.fun_1s[0] ? item.fun_1s[0].area == 'C' : true,
    '660e': item => item.fun_1s[0] ? item.fun_1s[0].area == 'D' : true,
    '660f': () => true,
    '6607': item => item.fun_1s[0] ? item.fun_1s[0].area == 'B' || item.fun_1s[0].area == 'C' || item.fun_1s[0].area == 'D' : true,
    '6608': item => item.fun_1s[0] ? item.fun_1s[0].area == 'B' || item.fun_1s[0].area == 'C' || item.fun_1s[0].area == 'D' : true,
    '6609': item => item.fun_1s[0] ? item.fun_1s[0].cultural ? item.fun_1s[0].cultural == 'A' : true : true,
    '6610': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? !item.fun_1s[0].m_lic.includes('A') : true : true,
    '6611': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? item.fun_1s[0].m_lic.includes('B') || item.fun_1s[0].m_lic.includes('C') || item.fun_1s[0].m_lic.includes('F') : true : true,
    '6612': item => item.fun_1s[0] ? item.fun_1s[0].tipo ? item.fun_1s[0].tipo.includes('B') || item.fun_1s[0].tipo.includes('A') : true : true,
    '6613': item => item.fun_1s[0] ? item.fun_1s[0].tipo ? item.fun_1s[0].tipo.includes('B') || item.fun_1s[0].tipo.includes('A') : true : true,
    '6614': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? !item.fun_1s[0].m_lic.includes('A') : true : true,
    '6615': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? item.fun_1s[0].m_lic.includes('C') || item.fun_1s[0].m_lic.includes('D') : true : true,
    '6616': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? item.fun_1s[0].m_lic.includes('g') || item.fun_1s[0].m_lic.includes('G') || item.fun_1s[0].m_lic.includes('I') : true : true,
    '6617': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? item.fun_1s[0].m_lic.includes('g') || item.fun_1s[0].m_lic.includes('G') || item.fun_1s[0].m_lic.includes('I') : true : true,
    '6618': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? item.fun_1s[0].m_lic.includes('g') || item.fun_1s[0].m_lic.includes('G') || item.fun_1s[0].m_lic.includes('I') : true : true,
    '6619': item => item.fun_1s[0] ? item.fun_1s[0].m_lic ? item.fun_1s[0].m_lic.includes('g') || item.fun_1s[0].m_lic.includes('G') || item.fun_1s[0].m_lic.includes('I') : true : true,

    '671': item => item.fun_1s[0] ? item.fun_1s[0].tipo ? item.fun_1s[0].tipo.includes('E') : true : true,
    '672': item => item.fun_1s[0] ? item.fun_1s[0].tipo ? item.fun_1s[0].tipo.includes('E') : true : true,

    '680': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_cota(item.fun_1s[0].tramite) : true : true,
    '681': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_isPh(item.fun_1s[0], true) : true : true,
    '682': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_isPh(item.fun_1s[0], true) : true : true,
    '683': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_isPh(item.fun_1s[0], true) : true : true,
    '684': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_isPh(item.fun_1s[0], true) : true : true,
    '685': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_isPh(item.fun_1s[0], true) : true : true,
    '686': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_movTierra(item.fun_1s[0].tramite) : true : true,
    '687': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_piscina(item.fun_1s[0].tramite) : true : true,
    '6862': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_piscina(item.fun_1s[0].tramite) : true : true,
    '688': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_modPlano(item.fun_1s[0].tramite) : true : true,
    '689': item => item.fun_1s[0] ? item.fun_1s[0].tramite ? regexChecker_modPlano(item.fun_1s[0].tramite) : true : true,
    '6891': () => true,
    '6892': () => true,
    '6893': () => true,
}
function FUN_CHECKLIST_N({ currentItem, currentVersion, readOnly, requestUpdate, swaMsg }) {

    useEffect(() => {
        if (currentVersion != null) {
            for (var i = 0; i < fatherValues.length; i++) {
                let radios = document.getElementsByName(fatherValues[i]);
                if (radios.length) {
                    (_CHECK_INDEXVALUE(fatherValues[i], 1)) ? radios[0].checked = true : radios[0].checked = false;
                    (_CHECK_INDEXVALUE(fatherValues[i], 0)) ? radios[1].checked = true : radios[1].checked = false;
                    (_CHECK_INDEXVALUE(fatherValues[i], 2)) ? radios[2].checked = true : radios[2].checked = false;
                }
            }
        }
    }, [currentVersion]);

        var formData = new FormData();

        let _SET_CHILD = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                }
            }
            return _CHILD_VARS;
        }
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
        const _CHECK_INDEXVALUE = (_CODE, _VALUE) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_OF_CODES = (_CHILD_REVIEW.code ? _CHILD_REVIEW.code.split(",") : []);
                let _ARRAY_OF_CHECKEDS = (_CHILD_REVIEW.checked ? _CHILD_REVIEW.checked.split(",") : []);
                if (_ARRAY_OF_CODES.indexOf(_CODE) > -1) {
                    let pos = _ARRAY_OF_CODES.indexOf(_CODE);
                    if (_ARRAY_OF_CHECKEDS[pos] == _VALUE) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (dvCheckList[_CODE] && _VALUE == 0) return dvCheckList[_CODE](currentItem)
                    if (dvCheckList[_CODE] && _VALUE == 2) return !dvCheckList[_CODE](currentItem)
                    return false;
                }
            } else {
                if (dvCheckList[_CODE] && _VALUE == 0) return dvCheckList[_CODE](currentItem)
                if (dvCheckList[_CODE] && _VALUE == 2) return !dvCheckList[_CODE](currentItem)
                else return false;
            }
        }

        const getCorrelatedCheckValue = (_CODE) => {
            try {
                if (_CHECK_INDEXVALUE(_CODE, 1)) return 'SI';
                if (_CHECK_INDEXVALUE(_CODE, 0)) return 'NO';
                if (_CHECK_INDEXVALUE(_CODE, 2)) return 'N/A';
            } catch (_error) {
                return 'sin_definir';
            }
            return 'sin_definir';
        };

        const isCorrelatedRequirementApplicable = (_CODE) => {
            if (!dvCheckList[_CODE]) return false;
            try {
                return Boolean(dvCheckList[_CODE](currentItem));
            } catch (_error) {
                return false;
            }
        };

        let m_2022 = Number(currentItem.model) >= 2022

        const toCorrelatedRequirement = (_CODE) => ({
            code: _CODE,
            label: JsonDocList[_CODE] || `Requisito ${_CODE}`,
        });

        const createCorrelatedSection = (id, title, codes) => {
            const requirements = codes
                .filter(isCorrelatedRequirementApplicable)
                .map(toCorrelatedRequirement);

            if (!requirements.length) return null;
            return { id, title, requirements };
        };

        const buildCorrelatedSections = () => {
            const _CHILD_VARS = _SET_CHILD();
            const sections = [
                createCorrelatedSection('6.1', '6.1 DOCUMENTOS COMUNES A TODA SOLICITUD', ['511', '512', '513', '516', '517', '518', '519']),
            ];

            if (_CHILD_VARS.item_1.includes('A')) {
                if (_CHILD_VARS.item_3.includes('A')) sections.push(createCorrelatedSection('6.2-a', '6.2 DOCUNENTOS ADICIONALES EN LICENCIA DE URBANIZACIÓN / A. Modalidad Desarrollo', ['621', '601a', '622', '602a']));
                if (_CHILD_VARS.item_3.includes('B')) sections.push(createCorrelatedSection('6.2-b', '6.2 DOCUNENTOS ADICIONALES EN LICENCIA DE URBANIZACIÓN / B. Modalidad Saneamiento', ['623', '601b', '602b', '624', '625']));
                if (_CHILD_VARS.item_3.includes('C')) sections.push(createCorrelatedSection('6.2-c', '6.2 DOCUNENTOS ADICIONALES EN LICENCIA DE URBANIZACIÓN / C. Modalidad de Reurbanización', ['626', '627', '601c', '602c']));
            }

            if (_CHILD_VARS.item_1.includes('B')) {
                sections.push(createCorrelatedSection('6.3-main', '6.3 DOCUMENTOS ADICIONALES EN LA LICENCIA DE PARCELACION', ['630', '631', '632', '633']));
                sections.push(createCorrelatedSection('6.3-saneamiento', '6.3 DOCUMENTOS ADICIONALES EN LA LICENCIA DE PARCELACION / Documentos adicionales en licencia de parcaleación para saneamiento', ['634', '635', '636']));
            }

            if (_CHILD_VARS.item_1.includes('C')) {
                sections.push(createCorrelatedSection('6.4-a', '6.4 DOCUMENTOS ADICIONALES EN LA LICENCIA DE SUBDIVISION / A. Modalidad Subdivisión Urbana y Rural', ['641']));
                sections.push(createCorrelatedSection('6.4-b', '6.4 DOCUMENTOS ADICIONALES EN LA LICENCIA DE SUBDIVISION / B. Modalidad Reloteo', ['642', '643']));
            }

            if (_CHILD_VARS.item_1.includes('F')) {
                sections.push(createCorrelatedSection('6.5', '6.5 DOCUMENTOS RECONOCIMIENTO DE EDIFICACIONES', ['651', '652', '653']));
            }

            if (_CHILD_VARS.item_1.includes('D')) {
                sections.push(createCorrelatedSection('6.6-main', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN', ['6601', '6602', '6603', '6604', '6605', '911']));
                sections.push(createCorrelatedSection('6.6-revision', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Revisión indepenciente de los diseños estructurales', ['660a', '660b', '660c', '660d', '660e', '660f', '6607', '6608']));
                sections.push(createCorrelatedSection('6.6-bic', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Bien de interés cultural', ['6609']));
                sections.push(createCorrelatedSection('6.6-ph', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Propiedad Horizontal', ['6610']));
                sections.push(createCorrelatedSection('6.6-reforzamiento', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Reforzamiento Estructural para Edificaciones en riesgo por daños en la estructura', ['6611']));
                sections.push(createCorrelatedSection('6.6-equipamientos', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Equipamientos en suelos objeto de entrega de cesiones anticipadas', ['6612', '6613']));
                sections.push(createCorrelatedSection('6.6-autoridad', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Trámite presentado ante autoridad distinta a la que otorgo la licencia inicial', ['6614']));
                sections.push(createCorrelatedSection('6.6-modificacion', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Modalidad de Modificacion y Adecuacion', ['6615']));
                sections.push(createCorrelatedSection('6.6-demolicion', '6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN / Modalidad de Demolicion y Cerramiento', ['6616', '6617', '6618', '6619']));
            }

            if (_CHILD_VARS.item_1.includes('E')) {
                sections.push(createCorrelatedSection('6.7', '6.7 DOCUMENTOS ADICIONALES EN LICENCIAS DE INTERVENCIÓN Y OCUPACIÓN DEL ESPACIO PÚBLICO', ['671', '672']));
            }

            if (_CHILD_VARS.item_1.includes('G')) {
                sections.push(createCorrelatedSection('6.8-cotas', 'Ajuste de cotas y áreas', ['680']));
                sections.push(createCorrelatedSection('6.8-ph', 'Aprobación de los planos de propiedad horizontal', ['681', '682', '683', '684', '685']));
                sections.push(createCorrelatedSection('6.8-tierras', 'Autorización para el movimiento de tierras', ['686']));
                sections.push(createCorrelatedSection('6.8-piscinas', 'Aprobación de piscinas', ['687', '6862']));
                sections.push(createCorrelatedSection('6.8-plano', 'Modificación del plano urbanístico', ['688', '689']));
                if (m_2022) {
                    sections.push(createCorrelatedSection('6.8-norma', 'Concepto de norma urbanística y uso del suelo', ['6891', '6892']));
                    sections.push(createCorrelatedSection('6.8-publico', 'Bienes destinados al uso público o con vocación al uso público', ['6893']));
                }
            }

            return sections.filter(Boolean);
        };

        const correlatedSections = buildCorrelatedSections();
        const correlatedCodes = correlatedSections.flatMap((section) => section.requirements.map((requirement) => requirement.code));
        const [activeChecklistTab, setActiveChecklistTab] = useState('control');

        let _SET_610 = () => {
            return <>
                <div className="row">
                    <div className="col-9">
                        <label className="app-p upper-case fw-bold"> 6.1 DOCUMENTOS COMUNES A TODA SOLICITUD</label>
                    </div>
                    <div className="col-1">
                        <label className="app-p upper-case">SI</label>
                    </div>
                    <div className="col-1">
                        <label className="app-p upper-case">NO</label>
                    </div>
                    <div className="col-1">
                        <label className="app-p upper-case">N/A</label>
                    </div>
                </div>
                {_PRINT_GROUP(['511', '512', '513', '516', '517', '518', '519'])}
            </>
        }

        let _SET_620 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("A")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold"> 6.2 DOCUNENTOS ADICIONALES EN LICENCIA DE URBANIZACIÓN</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    {_SET_620A()}
                    {_SET_620B()}
                    {_SET_620C()}
                </>
            }
        }
        let _SET_620A = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_3.includes("A")) {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> A. Modalidad Desarrollo</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['621', '601a', '622', '602a'])}
                </>
            }
        }
        let _SET_620B = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_3.includes("B")) {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> B. Modalidad Saneamiento</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['623', '601b', '602b', '624', '625'])}
                </>
            }
        }
        let _SET_620C = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_3.includes("C")) {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> C. Modalidad de Reurbanización</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['626', '627', '601c', '602c'])}
                </>
            }
        }

        let _SET_630 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("B")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold"> 6.3 DOCUMENTOS ADICIONALES EN LA LICENCIA DE PARCELACION</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['630', '631', '632', '633'])}
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Documentos adicionales en licencia de parcaleación para saneamiento</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['634', '635', '636'])}
                </>
            }
        }

        let _SET_640 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("C")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.4 DOCUMENTOS ADICIONALES EN LA LICENCIA DE SUBDIVISION</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> A. Modalidad Subdivisión Urbana y Rural</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['641'])}
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> B. Modalidad Reloteo</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['642', '643'])}
                </>
            }
        }

        let _SET_650 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("F")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.5 DOCUMENTOS RECONOCIMIENTO DE EDIFICACIONES</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['651', '652', '653'])}
                </>
            }
        }

        let _SET_660 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("D")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    {_SET_6601()}
                    {_SET_6602()}
                    {_SET_6603()}
                </>
            }
        }
        let _SET_6601 = () => {
            return <>
                <div className="row">
                    <div className="col-12">
                        <sup className="">* Deben presentarse firmados y rotulados por profesional idóneo</sup>
                    </div>
                </div>
                {_PRINT_GROUP(['6601', '6602', '6603', '6604', '6605', '911'])}
            </>
        }
        let _SET_6602 = () => {
            return <>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Revisión indepenciente de los diseños estructurales</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <sup className="">Indique la condición por la que se debe adelantar la revisión (Apéndice A-6.3 NSR 10)</sup>
                    </div>
                </div>
                {_PRINT_GROUP(
                    m_2022 ? ['660a', '660b', '660c', '660d', '660e', '660f'] : ['660a', '660b', '660c', '660d', '660e', '660f']
                )}
                <div className="row">
                    <div className="col-12">
                        <p className="">Para las condiciones anteroriores, adjuntar los siguinetes documentos:</p>
                    </div>
                </div>
                {_PRINT_GROUP(['6607', '6608'])}
            </>
        }
        let _SET_6603 = () => {
            return <>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Bien de interés cultural</label>
                    </div>
                </div>
                {_PRINT_GROUP(['6609'])}
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Propiedad Horizontal</label>
                    </div>
                </div>
                {_PRINT_GROUP(['6610'])}
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Reforzamiento Estructural para Edificaciones en riesgo por daños en la estructura</label>
                    </div>
                </div>
                {_PRINT_GROUP(['6611'])}
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Equipamientos en suelos objeto de entrega de cesiones anticipadas:</label>
                    </div>
                </div>
                {_PRINT_GROUP(['6612', '6613'])}
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Trámite presentado ante autoridad distinta a la que otorgo la licencia inicial</label>
                    </div>
                </div>
                {_PRINT_GROUP(['6614'])}
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Modalidad de Modificacion y Adecuacion</label>
                    </div>
                </div>
                {_PRINT_GROUP(['6615'])}
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Modalidad de Demolicion y Cerramiento</label>
                    </div>
                </div>
                {_PRINT_GROUP(['6616', '6617', '6618', '6619'])}
            </>
        }

        let _SET_670 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("E")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.7 DOCUMENTOS ADICIONALES EN LICENCIAS DE INTERVENCIÓN Y OCUPACIÓN DEL ESPACIO PÚBLICO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <sup className="">* Deben presentarse firmados y rotulados por profesional idóneo</sup>
                        </div>
                    </div>
                    {_PRINT_GROUP(['671', '672'])}
                </>
            }
        }

        let _SET_680 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("G")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.8 DOCUMENTOS PARA OTRAS ACTUACIONES</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <sup className="">* Deben presentarse firmados y rotulados por profesional idóneo</sup>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Ajuste de cotas y áreas</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['680'])}
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Aprobación de los planos de propiedad horizontal</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['681', '682', '683', '684', '685'])}
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Autorización para el movimiento de tierras</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['686'])}
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Aprobación de piscinas</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['687', '6862'])}
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Modificación del plano urbanístico:</label>
                        </div>
                    </div>
                    {_PRINT_GROUP(['688', '689'])}

                    {m_2022 ? <>

                        <div className="row">
                            <div className="col-12">
                                <label className="fw-bold">Concepto de norma urbanística y uso del suelo:</label>
                            </div>
                        </div>
                        {_PRINT_GROUP(['6891', '6892'])}

                       <div className="row">
                            <div className="col-12">
                                <label className="fw-bold">Bienes destinados al uso público o con vocación al uso público:</label>
                            </div>
                        </div>
                        {_PRINT_GROUP(['6893'])}
                    </> : null}
                </>
            }
        }

        // COMPONENTS JSX
        let _PRINT_GROUP = (_array) => {
            return _array.map((value) => {
                //if(!_CHECK_INDEXVALUE(value, 0)) return '';
                return (<div key={value} className="row">
                        <div className="col-9">
                            <ul>
                                <label>({value}) {JsonDocList[value]}</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input className="form-check-input" type="radio" name={value} value="1"
                                defaultChecked={_CHECK_INDEXVALUE(value, 1)} />
                        </div>
                        <div className="col-1">
                            <input className="form-check-input" type="radio" name={value} value="0"
                                defaultChecked={_CHECK_INDEXVALUE(value, 0)} />
                        </div>
                        <div className="col-1">
                            <input className="form-check-input" type="radio" name={value} value="2"
                                defaultChecked={_CHECK_INDEXVALUE(value, 2)} />
                        </div>
                    </div>
                )
            })
        }

        // FUNCTIONS & APIS
        let setCheckList = () => {
            formData = new FormData();
            let codes = [];
            let checkeds = [];
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();

            let radios = [];
            for (var i = 0; i < fatherValues.length; i++) {
                radios = document.getElementsByName(fatherValues[i]);
                if (radios.length) {
                    for (var j = 0; j < radios.length; j++) {
                        if (radios[j].checked) {
                            checkeds.push(radios[j].value);
                            codes.push(fatherValues[i]);
                        }
                    }
                }
            }

            codes = codes.join();
            checkeds = checkeds.join();
            formData.set('code', codes);
            formData.set('checked', checkeds);
            formData.set('version', currentVersion);
            formData.set('fun0Id', currentItem.id);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            if (_CHILD_REVIEW) {
                FUNService.update_r(_CHILD_REVIEW.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            requestUpdate(currentItem.id, true);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            } else {
                FUNService.create_funr(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            requestUpdate(currentItem.id, true)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            }
        }

        return (
            <Tabs value={activeChecklistTab} onValueChange={setActiveChecklistTab} className="w-full">
                <div className="mb-3 flex justify-end rounded-xl border border-border bg-card/80 p-2 text-foreground shadow-sm">
                    <TabsList className="h-9" aria-label="Vistas del checklist FUN">
                        <TabsTrigger value="control" className="px-3 py-1 text-xs">Control documental</TabsTrigger>
                        <TabsTrigger value="legacy" className="px-3 py-1 text-xs">Checklist legacy</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="control" className="mt-0">
                    <FunCorrelatedDocumentControl
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        codes={correlatedCodes}
                        sections={correlatedSections}
                        labels={JsonDocList}
                        getCheckValue={getCorrelatedCheckValue}
                        isRequirementApplicable={isCorrelatedRequirementApplicable}
                        currentReview={_SET_CHILD_REVIEW()}
                        readOnly={readOnly}
                        requestUpdate={requestUpdate}
                        swaMsg={swaMsg}
                    />
                </TabsContent>

                <TabsContent value="legacy" className="mt-0">
                    <div>
                        {_SET_610()}
                        {_SET_620()}
                        {_SET_630()}
                        {_SET_640()}
                        {_SET_650()}
                        {_SET_660()}
                        {_SET_670()}
                        {_SET_680()}
                        {readOnly ?
                            ''
                            : <div className="row text-center">
                                <div className="col-12">
                                    <Button size="sm" className="my-3" onClick={() => setCheckList()}><Icon name="share-square" size={16} /> GUARDAR CAMBIOS</Button>
                                </div>
                            </div>}
                    </div>
                </TabsContent>

                <hr />
            </Tabs>
        );
}

export default FUN_CHECKLIST_N;

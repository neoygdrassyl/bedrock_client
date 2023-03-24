import { MDBBtn } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_24_PARSER, _FUN_25_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../components/customClasses/funCustomArrays';
import { getJSON } from '../../../components/customClasses/typeParse';
import FUN_SERVICE from '../../../services/fun.service';

export default function FUN_ANEX(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion } = props;
    const MySwal = withReactContent(Swal);

    // *********************** DATA GETTERS ************************** // 
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            item_0: false,
            item_102: "",
            anex1: "",
            anex2: "",
            anex3: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                _CHILD_VARS.anex1 = _CHILD[_CURRENT_VERSION].anex1 ? _CHILD[_CURRENT_VERSION].anex1 : "";
                _CHILD_VARS.anex2 = _CHILD[_CURRENT_VERSION].anex2 ? _CHILD[_CURRENT_VERSION].anex2 : "";
                _CHILD_VARS.anex3 = _CHILD[_CURRENT_VERSION].anex3 ? _CHILD[_CURRENT_VERSION].anex3 : "";
            }
        }
        return _CHILD_VARS;
    }

    // ************************ DATA CONVERTERS ************************ // 

    // ************************** JSX COMPONENTS *********************** // 
    let _CHILD_A1 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = _CHILD_VARS.anex1 ? _CHILD_VARS.anex1.split(';') : [];

        return <>
            <legend className="my-2 px-3 text-uppercase bg-light" id="funn_1_a1">
                <label className="app-p lead fw-normal text-uppercase">1. TIPO DE USO</label>
            </legend>
            <div className='row mx-3'>
                <div className='col'>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="A" name="fun_1_a1"
                            defaultChecked={VAR[0] == 'A'} />
                        <label class="form-check-label">
                            A. Vivienda
                        </label>
                    </div>
                </div>
                <div className='col'>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="B" name="fun_1_a1"
                            defaultChecked={VAR[1] == 'B'} />
                        <label class="form-check-label">
                            B. Comercio y/o Servicios
                        </label>
                    </div>
                </div>
                <div className='col'>  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a1"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label" >
                        C. Institucional
                    </label>
                </div></div>
                <div className='col'> <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a1"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Industrial
                    </label>
                </div></div>

            </div>

            <div className='row mx-3'>
                <div className='col'> <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a1"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label">
                        E. Educación
                    </label>
                </div></div>
                <div className='col'><div class="form-check">
                    <input class="form-check-input" type="checkbox" value="F" name="fun_1_a1"
                        defaultChecked={VAR[5] == 'F'} />
                    <label class="form-check-label">
                        F. Salud
                    </label>
                </div></div>
                <div className='col-6'>
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a1" defaultValue={VAR[6] || ''} />
                    </div>
                </div></div>


        </>
    }
    let _CHILD_A2 = () => {
        return <>
            <legend className="my-2 px-3 text-uppercase bg-light" id="funn_1_a2">
                <label className="app-p lead fw-normal text-uppercase">2. REGLAMENTACIÓN DE CONSTRUCCIÓN SOSTENIBLE</label>
            </legend>
            <div className='row text-center my-2'>
                <label className='fw-bold'>2.1 DECLARACIÓN SOBRE MEDIDAS DE AHORRO EN ENERGIA</label>
            </div>
            <div className='row my-2'>
                <div className='col'>
                    {_CHILD_A211()}
                </div>
                <div className='col'>
                    {_CHILD_A212()}
                </div>
            </div>
            <div className='row my-2'>
                <div className='col'>
                    {_CHILD_A22()}
                </div>
                <div className='col'>
                    {_CHILD_A23()}
                </div>
            </div>
            <div className='row my-2'>
                <div className='col'>
                    {_CHILD_A24()}
                </div>
                <div className='col'>
                    {_CHILD_A25()}
                </div>
            </div>
            <div className='row my-2'>
                <div className='col'>
                    {_CHILD_A26()}
                </div>
                <div className='col'>
                    {_CHILD_A27()}
                </div>
            </div>
            <div className='row my-2'>
                <div className='col'>
                    {_CHILD_A28()}
                </div>
                <div className='col'>
                    {_CHILD_A29()}
                </div>
            </div>
        </>
    }
    let _CHILD_A211 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a211');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];

        return <>
            <div className='row mx-3'>
                <label>2.1.1 Medidas Pasivas</label>
            </div>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="fun_1_a211"
                        defaultChecked={VAR[0] == 'A'} />
                    <label class="form-check-label">
                        A. Cubierta Verde
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="fun_1_a211"
                        defaultChecked={VAR[1] == 'B'} />
                    <label class="form-check-label">
                        B. Elementos de protección Solar
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a211"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label">
                        C. Vidrios de protección Solar
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a211"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Cubierta de protección solar
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a211"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label">
                        E. Pared de protección solar
                    </label>
                </div>
                <div class="form-check">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a211" defaultValue={VAR[5] ?? ''} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_A212 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a212');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];
        return <>
            <div className='row mx-3'>
                <label>2.1.2 Medidas Activa</label>
            </div>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="fun_1_a212"
                        defaultChecked={VAR[0] == 'A'} />
                    <label class="form-check-label">
                        A. Iluminación eficiente
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="fun_1_a212"
                        defaultChecked={VAR[1] == 'B'} />
                    <label class="form-check-label">
                        B. Equipos e aire acondicionados eficientes
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a212"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label">
                        C. Agua caliente solar
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a212"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Controles de iluminación
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a212"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label">
                        E. Variedades de velocidad para bombas
                    </label>
                </div>
                <div class="form-check">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a212" defaultValue={VAR[5] || ''} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_A22 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a22');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];
        return <>
            <div className='row mx-3'>
                <label>2.2 Materialidad muro externos</label>
            </div>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="fun_1_a22"
                        defaultChecked={VAR[0] == 'A'} />
                    <label class="form-check-label">
                        A. Ladrillo portante
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="fun_1_a22"
                        defaultChecked={VAR[1] == 'B'} />
                    <label class="form-check-label">
                        B. Ladrillo común
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a22"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label">
                        C. Muro de concreto vaciado en obra
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a22"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Muro en superboard
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a22"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label" >
                        E. Muro cortina en aluminio
                    </label>
                </div>
                <div class="form-check">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a22" defaultValue={VAR[5] ?? ''} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_A23 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a23');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];
        return <>
            <div className='row mx-3'>
                <label>2.3 Materialidad muro interno</label>
            </div>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="fun_1_a23"
                        defaultChecked={VAR[0] == 'A'} />
                    <label class="form-check-label">
                        A. Ladrillo numero 4 o similar
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="fun_1_a23"
                        defaultChecked={VAR[1] == 'B'} />
                    <label class="form-check-label" >
                        B. Drywall
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a23"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label">
                        C. Ladrillo común
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a23"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Muro de concreto vaciado en obra
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a23"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label">
                        E. Mampostería de bloque de concreto
                    </label>
                </div>
                <div class="form-check">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a23" defaultValue={VAR[5] ?? ''} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_A24 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a24');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];
        return <>
            <div className='row mx-3'>
                <label>2.4 Materialidad de cubierta</label>
            </div>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="fun_1_a24"
                        defaultChecked={VAR[0] == 'A'} />
                    <label class="form-check-label">
                        A. Cubierta de concreto vaciado en obra
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="fun_1_a24"
                        defaultChecked={VAR[1] == 'B'} />
                    <label class="form-check-label">
                        B. Panel tipo sándwich de aluminio
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a24"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label">
                        C. Tejas de arcilla
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a24"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Metálica
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a24"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label">
                        E. Fibrocemento
                    </label>
                </div>
                <div class="form-check">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a24" defaultValue={VAR[5] ?? ''} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_A25 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a25');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];
        return <>
            <div className='row mx-3'>
                <label>2.5 Relación muro ventana y altura piso a techo</label>
            </div>
            <div className='row mx-3'>
                <label>Rango( 0% - 100%)</label>
                <div class="form-group row form-control-sm">
                    <label class="col-sm-3 col-form-label">Norte</label>
                    <div class="col-sm-7">
                        <input type="text" class="form-control form-control-sm" name="fun_1_a25" defaultValue={VAR[0]} />
                    </div>
                </div>
                <div class="form-group row form-control-sm">
                    <label class="col-sm-3 col-form-label">Sur</label>
                    <div class="col-sm-7">
                        <input type="text" class="form-control form-control-sm" name="fun_1_a25"  defaultValue={VAR[1]} />
                    </div>
                </div>
                <div class="form-group row form-control-sm">
                    <label class="col-sm-3 col-form-label">Oriente</label>
                    <div class="col-sm-7">
                        <input type="text" class="form-control form-control-sm" name="fun_1_a25"   defaultValue={VAR[2]}/>
                    </div>
                </div>
                <div class="form-group row form-control-sm">
                    <label class="col-sm-3 col-form-label">Occidente</label>
                    <div class="col-sm-7">
                        <input type="text" class="form-control form-control-sm" name="fun_1_a25"  defaultValue={VAR[3]} />
                    </div>
                </div>
                <div class="form-group row form-control-sm">
                    <label class="col-sm-4 col-form-label">Altura piso a techo (m)</label>
                    <div class="col-sm-6">
                        <input type="text" class="form-control form-control-sm" name="fun_1_a25"   defaultValue={VAR[4]}/>
                    </div>
                </div>
            </div>
        </>
    }
    let _CHILD_A26 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a26');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];
        return <>
            <div className='row mx-3'>
                <label>2.6 Declaración sobre medidas de ahorro en agua</label>
            </div>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="fun_1_a26"
                        defaultChecked={VAR[0] == 'A'} />
                    <label class="form-check-label" >
                        A. Sanitarios de bajo consumo
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="fun_1_a26"
                        defaultChecked={VAR[1] == 'B'} />
                    <label class="form-check-label" >
                        B. Lavamanos de bajo consumo
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a26"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label" >
                        C. Duchas de consumo
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a26"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Orinales de bajo consumo
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a26"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label">
                        E. Recolección de agua lluvia
                    </label>
                </div>
                <div class="form-check">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a26" defaultValue={VAR[5] ?? ''} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_A27 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a27');
        if(VAR) VAR = VAR.split(';')
        else VAR = [];
        return <>
            <div className='row mx-3'>
                <label>2.7 Zonificación Climática</label>
            </div>
            <h5 className='fw-normal'>Señales la zona climática asignada de acuerdo al Anexo  de la Res. 549 de 2015</h5>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="fun_1_a27"
                        defaultChecked={VAR[0] == 'A'} />
                    <label class="form-check-label">
                        A. Frio
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="fun_1_a27"
                        defaultChecked={VAR[1] == 'B'} />
                    <label class="form-check-label">
                        B. Templado
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="fun_1_a27"
                        defaultChecked={VAR[2] == 'C'} />
                    <label class="form-check-label">
                        C. Cálido seco
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="fun_1_a27"
                        defaultChecked={VAR[3] == 'D'} />
                    <label class="form-check-label">
                        D. Cálido húmedo
                    </label>
                </div>
            </div>
            <h5 className='fw-normal'>¿Su predio se encuentra en una zona climática distinta a la que le fue asignada?</h5>
            <div className='row mx-3'>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="fun_1_a27"
                        defaultChecked={VAR[4] == 'E'} />
                    <label class="form-check-label">
                        E. Si
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="F" name="fun_1_a27"
                        defaultChecked={VAR[5] == 'F'} />
                    <label class="form-check-label">
                        F. No
                    </label>
                </div>
                <div class="form-check">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                            name="fun_1_a27" defaultValue={VAR[6] ?? ''} />
                    </div>
                </div>
            </div>
        </>
    }
    let _CHILD_A28 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a28');
        if(!VAR) VAR = '';
        return <>
            <div className='row mx-3'>
                <label>2.8 Ahorro de esperado de agua</label>
            </div>
            <div className='row mx-3'>
                <div class="form-group row">
                    <h5 class="col-sm-8 col-form-label fw-normal">Indique el ahorro que actualmente busca el proyecto en manera de agua</h5>
                    <div class="col-sm-4">
                        <input type="text" class="form-control form-control-sm" name="fun_1_a28" defaultValue={VAR}/>
                    </div>
                </div>
            </div>
        </>
    }
    let _CHILD_A29 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = getJSON(_CHILD_VARS.anex2, 'a29');
        if(!VAR) VAR = '';
        return <>
            <div className='row mx-3'>
                <label>2.9 Ahorro esperado en energía</label>
            </div>
            <div className='row mx-3'>
                <div class="form-group row">
                    <h5 class="col-sm-8 col-form-label fw-normal">Indique el ahorro que actualmente busca el proyecto en manera de energía</h5>
                    <div class="col-sm-4">
                        <input type="text" class="form-control form-control-sm" name="fun_1_a29"  defaultValue={VAR}/>
                    </div>
                </div>
            </div>
        </>
    }
    let _CHILD_A3 = () => {
        let _CHILD_VARS = _GET_CHILD_1();
        let VAR = _CHILD_VARS.anex3 ? _CHILD_VARS.anex3.split(';') : [];
        return <>
            <legend className="my-2 px-3 text-uppercase bg-light" id="funn_1_a3">
                <label className="app-p lead fw-normal text-uppercase">3. ÁREA DEL PROYECTO</label>
            </legend>
            <div className='row mx-3'>
                <div class="form-group row">
                    <label class="col-sm-8 col-form-label">Área neta de urbanismo y paisajismo (si aplica)</label>
                    <div class="col-sm-3">
                        <input type="number"  step={0.01} class="form-control" name="fun_1_a3" defaultValue={VAR[0]}/>
                    </div>
                    <label class="col-sm-1 col-form-label">m2</label>
                </div>
            </div>
            <div className='row mx-3'>
                <div class="form-group row">
                    <label class="col-sm-8 col-form-label">Área neta de zonas comunes (si aplica)</label>
                    <div class="col-sm-3">
                        <input type="number" step={0.01} class="form-control" name="fun_1_a3" defaultValue={VAR[1]} />
                    </div>
                    <label class="col-sm-1 col-form-label">m2</label>
                </div>
            </div>
            <div className='row mx-3'>
                <div class="form-group row">
                    <label class="col-sm-8 col-form-label">Área neta de parqueaderos (si aplica)</label>
                    <div class="col-sm-3">
                        <input type="number" step={0.01} class="form-control" name="fun_1_a3" defaultValue={VAR[2]}/>
                    </div>
                    <label class="col-sm-1 col-form-label">m2</label>
                </div>
            </div>
        </>
    }
    // ************************** TABLE COMPONENTS ********************* // 

    // ******************************* APIS **************************** // 
    var formData = new FormData();
    let manage_a = () => {
        formData = new FormData();
        let version = currentVersion;
        let fun0Id = currentItem.id;
        let _CHILD = _GET_CHILD_1()
        formData.set('version', version);
        formData.set('fun0Id', fun0Id);

        let value = null;
        let checkbox = null;

        //let anex1 = getJSON(_CHILD, 'anex1', 1);
        
        value = []
        checkbox = document.getElementsByName("fun_1_a1");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        let anex1 = value.join(';');
        formData.set('anex1', anex1);


        value = []
        checkbox = document.getElementsByName("fun_1_a3");
        for (var i = 0; i < checkbox.length; i++) {
            value.push(checkbox[i].value)
        }
        let anex3 = value.join(';');
        formData.set('anex3', anex3);

        let anex2 = {};
        value = []
        checkbox = document.getElementsByName("fun_1_a211");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a211 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a212");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a212 = value.join(';');


        value = []
        checkbox = document.getElementsByName("fun_1_a22");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a22 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a23");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a23 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a24");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a24 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a25");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a25 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a26");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a26 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a27");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a27 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a28");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a28 = value.join(';');

        value = []
        checkbox = document.getElementsByName("fun_1_a29");
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked || checkbox[i].type == 'text') value.push(checkbox[i].value)
            else value.push(0)
        }
        anex2.a29 = value.join(';');


        formData.set('anex2', JSON.stringify(anex2));
        
        //return 

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        if (!_CHILD.item_0) {
            FUN_SERVICE.create_fun1(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdate(currentItem.id)
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
            FUN_SERVICE.update_1(_CHILD.item_0, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdate(currentItem.id)
                    } else {
                        if (response.status == 500) {
                            MySwal.close();
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }

    }

    return (
        <fieldset className="p-3">
            <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_a">
                <label className="app-p lead fw-normal text-uppercase">ANEXO DE CONSTRUCCIÓN SOSTENIBLE</label>
            </legend>

            {_CHILD_A1()}
            {_CHILD_A2()}
            {_CHILD_A3()}

            <div className="row mb-3 text-center">
                <hr />
                <div className="col">
                    <MDBBtn className="btn btn-success my-3" onClick={() => manage_a()}><i class="far fa-file-alt"></i> ACTUALIZAR </MDBBtn>
                </div>
            </div>
        </fieldset>
    );
}

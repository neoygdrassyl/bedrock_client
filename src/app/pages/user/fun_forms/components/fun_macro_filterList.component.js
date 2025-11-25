import React, { Component, useState } from 'react';
import { MDBBadge, MDBBtn, MDBCollapse, MDBTooltip } from 'mdb-react-ui-kit';
import { MDBDataTable } from 'mdbreact';
import Modal from 'react-modal';
import './fun_modal_shared.css';



export default function FUN_MACROTABLE_FILTERLIST(props) {
    const { idRef, text } = props;
    var [modal, setModal] = useState(false);
    var [modalId, setModalId] = useState(null)
    var [collapsables, setCollapsables] = useState({})

    const customStylesForModal = {
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
            top: '8%',
            left: 'var(--fun-sidebar-width)',
            right: '25%',
            bottom: '8%',
            border: '1px solid #ccc',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            marginRight: 'auto',

        }
    };

    const data = [
        {
            title: 'FILTRO DE FUNCIONALIDAD', class: 'list-group-item list-group-item-secondary', color: 'secondary',
            children: [
                { filter: 'relax', label: 'Este filtro relaja los criterios de búsqueda, filtrando solicitudes que cumplan con al menos una de las condiciones de los filtros', badge: true },
                {
                    filter: '!X', label: ' Utilice un signo de exclamación ( ! ) antes del filtro para invertir la lógica donde X es el filtro. ',
                    badge: false, ex: 'rad -> Busca Solicitudes en Radicación, !rad -> busca Solicitudes que NO estén en Radicación'
                },
            ]
        },
        {
            title: 'FILTROS DE PROPIEDADES', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'num:X1,...,Xn', label: ' Busca una solicitud cuyo número de Radicación sea igual o parcialmente a X, separe varios números de radicado con coma.', badge: false },
                {
                    filter: 'n:X1,...,Xn', label: ' Tiene la misma funcionalidad que el filtro anterior', badge: false,
                    ex: 'n:295,6800-1-21-0296,21-297 -> Busca la solicitudes con los números de Radicación xxxx-x-x295, 6800-1-21-0296 y xxxx-x-21-0297'
                },
                { filter: 'dias>X', label: ' Solicitudes que estén en proceso por mas (e igual) a X días', badge: false },
                { filter: 'd>X', label: ' Tiene la misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'dias<X', label: ' Solicitudes que estén en proceso por menos  (e igual) a X días', badge: false },
                { filter: 'd<X', label: ' Tiene la misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'prof:X', label: ' Solicitudes que han sido asignadas al profesional X', badge: false },
                { filter: 'r:X', label: ' Tiene la misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'prio', label: ' Solicitudes con prioridad', badge: false },
                { filter: 'prio:X', label: ' Solicitudes con prioridad de valor X', badge: false },
            ]
        },
        {
            title: 'FILTROS DE FECHAS', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'fecha:Y:FECHA1:FECHA2', label: ' Filtro de fecha, seleccionado las solicitudes cuya fecha de tipo Y cumpla con los parámetros de FECHA1 y FECHA2', badge: false, },
                { filter: 'f:Y:FECHA1:FECHA2', label: ' La misma funcionalidad que el filtro anterior', badge: false, },
                { filter: 'Y = rad', label: ' Fecha de radicación', badge: false, },
                { filter: 'Y = ldf', label: ' Fecha de legal y debida forma', badge: false, },
                { filter: 'Y = asg', label: ' Fecha de asignación de profesional (sin especificar cual área)', badge: false, },
                { filter: 'Y = asgj', label: ' Fecha de asignación de profesional de informe Jurídico', badge: false, },
                { filter: 'Y = asga', label: ' Fecha de asignación de profesional de informe Arquitectónico', badge: false, },
                { filter: 'Y = asge', label: ' Fecha de asignación de profesional de informe Estructural', badge: false, },
                { filter: 'Y = rev', label: ' Fecha de revision de informe (Sin especificar cual área)', badge: false, },
                { filter: 'Y = revj', label: ' Fecha de revision de informe Jurídico', badge: false, },
                { filter: 'Y = reva', label: ' Fecha de revision de informe Arquitectónico', badge: false, },
                { filter: 'Y = reve', label: ' Fecha de revision de informe Estructural', badge: false, },
                { filter: 'Y = acta1', label: ' Fecha del Acta de Observaciones', badge: false, },
                { filter: 'Y = acta2', label: ' Fecha del Acta de Correcciones', badge: false, },
                { filter: 'Y = anot', label: ' Fecha de notificación del Acta', badge: false, },
                { filter: 'Y = aent', label: ' Fecha de la entrega de correcciones', badge: false, },
                { filter: 'Y = via', label: ' Fecha del acto de Viabilidad', badge: false, },
                { filter: 'Y = res', label: ' Fecha de la Resolución', badge: false, },
                { filter: 'Y = lic', label: ' Fecha de la Licencia', badge: false, },
                { filter: 'Y = ach', label: ' Fecha de Archivación', badge: false, },
                { filter: 'FECHA1 = YYYY-MM-DD | YYYY-MM  | YYYY | -An', label: ' La fecha número uno de filtración, esta fecha es obligatoria para el funcionamiento del filtro, SI NO se usa la FECHA2, la FECHA1 puede escribirse de forma ligera, definiendo solo el año (YYYY), año y mes (YYYY-MM) o fecha cerrada (YYYY-MM-DD) ó también puede definirse como un tiempo estimado -An', badge: false, },
                { filter: 'FECHA2 = vacío | YYYY-MM-DD  | X ', label: ' La fecha número dos de filtración, esta fecha puede tomar 3 posibles valores, vacío, (sin escribir nada), fecha cerrada (YYYY-MM-DD) o un numero natural X, la fecha cerrada delimitara la búsqueda a las dos fechas datas, definir el numero absoluto definirá la segunda fecha como: FECHA1 + X DÍAS HÁBILES', badge: false, },
                {
                    filter: false, label: '', badge: false,
                    ex: 'f:asgj:2022-01 -> Buscara las solicitudes que fueron asignadas a la rama jurídica para el mes de enero del año 2022.'
                },
                {
                    filter: false, label: '', badge: false,
                    ex: 'f:asga:2021-12-01:2021-12-31 -> Buscara las solicitudes de la rama arquitectónica que fueron asignadas entre 1 de diciembre de 2021 y 31 de diciembre de 2021.'
                },
                {
                    filter: false, label: '', badge: false,
                    ex: 'fecha:ldf:2021-06-01:30 -> Buscara las solicitudes cuya fecha de legal y debida forma este entre el 1 de junio y el 1 de junio mas 30 días hábiles. (Aproximadamente 45 días calendario normal)'
                },
                { filter: 'FECHA1 = -An', label: ' Filtro dinámico de tiempo, permite buscar por fecha estimadas por el sistema', badge: false, },
                { filter: 'A = d | w | m | y ', label: ' Identificado como dia(d), semana(w), mes(m) o año(y)', badge: false, },
                { filter: 'n ', label: ' Un numero natural, junto con el filtro anterior, determina un rango de fechas entre el dia de hoy, y la cantidad A atrás. si no se determina, se entiende por defecto 1', badge: false, },
                {
                    filter: false, label: '', badge: false,
                    ex: 'f:via:-w -> las solicitudes con actas de viabilidad expedidas entre hoy y la semana pasada.'
                },
            ]
        },
        {
            title: 'FILTROS DE ESTADO', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                //{ filter: 'rad', label: 'En Radicación, sin especificar Incompleto o LyDF', badge: true },
                { filter: 'inc', label: 'Incompleto', badge: true },
                { filter: 'ldf', label: 'En legal y debida forma', badge: true },
                { filter: 'acta', label: 'Con Acta expedida', badge: true },
                { filter: 'via', label: 'Con tramite de viabilidad', badge: true },
                { filter: 'res', label: 'Con Resolución', badge: true },
                { filter: 'lic', label: 'Con Licencia', badge: true },
                { filter: 'end', label: 'Expedida o Archivada', badge: true },
                { filter: 'cer', label: 'Cerradas', badge: true },
                { filter: 'ach', label: 'Archivadas', badge: true },
                { filter: 'des', label: 'En proceso de desistimiento', badge: true },
                { filter: '*', label: ' Adjunte un asterisco (*) al final del filtro para forzar la inclusión de solicitudes en estados superiores', badge: false },
            ]
        },
        {
            title: 'FILTROS DE TIPO DE LICENCIA', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'lic:X1,...,Xn | NO', label: ' Filtra el tipo y modalidad de la licencia, donde X es el tipo o modalidad de la licencia basados en el FUN, pare definir varios tipos se pueden separar por coma', badge: false },
                { filter: 'l:X1,...,Xn', label: ' La misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'X = A | urb', label: ' Tipo de tramite = Licencia de Urbanización', badge: false },
                { filter: 'X = B | par', label: ' Tipo de tramite = Licencia de Parcelación', badge: false },
                { filter: 'X = C | sub', label: ' Tipo de tramite = Licencia de Subdivisión', badge: false },
                { filter: 'X = D | con', label: ' Tipo de tramite = Licencia de Construcción', badge: false },
                { filter: 'X = E | esp', label: ' Tipo de tramite = Intervención y ocupación del espacio público', badge: false },
                { filter: 'X = F | rec', label: ' Tipo de tramite = Reconocimiento de la existencia de una edificación', badge: false },
                { filter: 'X = G | oa', label: ' Tipo de tramite = Otras actuaciones', badge: false },
                { filter: 'X = 2A | ini', label: ' Objecto de tramite = Inicial', badge: false },
                { filter: 'X = 2B | pro', label: ' Objecto de tramite = Prorroga (Este objecto fue depreciado a partir del 2022)', badge: false },
                { filter: 'X = 2C | mlv', label: ' Objecto de tramite = Modificación de licencia vigente', badge: false },
                { filter: 'X = 2D | rev', label: ' Objecto de tramite = Revalidación', badge: false },
                { filter: 'X = 3A | ude', label: ' Licencia de Urbanización = Desarrollo', badge: false },
                { filter: 'X = 3B | usa', label: ' Licencia de Urbanización = Saneamiento', badge: false },
                { filter: 'X = 3C | ure', label: ' Licencia de Urbanización = Reurbanización', badge: false },
                { filter: 'X = 4A | sru', label: ' Licencia de Subdivisión = Subdivisión rural', badge: false },
                { filter: 'X = 4B | sur', label: ' Licencia de Subdivisión = Subdivisión urbana', badge: false },
                { filter: 'X = 4C | sre', label: ' Licencia de Subdivisión = Reloteo', badge: false },
                { filter: 'X = 5A | cob', label: ' Licencia de Construcción = Obra Nueva', badge: false },
                { filter: 'X = 5B | cam', label: ' Licencia de Construcción = Ampliación', badge: false },
                { filter: 'X = 5C | cad', label: ' Licencia de Construcción = Adecuación', badge: false },
                { filter: 'X = 5D | cmo', label: ' Licencia de Construcción = Modificación', badge: false },
                { filter: 'X = 5E | cre', label: ' Licencia de Construcción = Restauración', badge: false },
                { filter: 'X = 5F | crf', label: ' Licencia de Construcción = Reforzamiento Estructural', badge: false },
                { filter: 'X = 5G | cdt', label: ' Licencia de Construcción = Demolición: Total', badge: false },
                { filter: 'X = 5GP | cdp', label: ' Licencia de Construcción = Demolición Parcial', badge: false },
                { filter: 'X = 5H | crc', label: ' Licencia de Construcción = Reconstrucción', badge: false },
                { filter: 'X = 5I | cce', label: ' Licencia de Construcción = Cerramiento', badge: false },
                { filter: 'X = NO', label: ' Use unicamente NO para filtrar las solicitudes que no cumplan con la modalidad estándar de la Curaduría', badge: false },
                { filter: false, label: '', badge: false, ex: 'lic:D,5A -> Solicitudes con tipo Construcción Obra Nueva.' },
                { filter: false, label: '', badge: false, ex: 'l:urb,ude -> Solicitudes con tipo Urbanización y Desarrollo.' },

            ]
        },
        {
            title: 'FILTROS DE CATEGORÍA', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'c1', label: ' Solicitudes de categoría I', badge: true },
                { filter: 'c2', label: ' Solicitudes de categoría II', badge: true },
                { filter: 'c3', label: ' Solicitudes de categoría III', badge: true },
                { filter: 'c4', label: ' Solicitudes de categoría IV', badge: true },
                { filter: 'coa', label: ' Solicitudes de categoría Otras Actuaciones', badge: true },
                { filter: 'nc', label: ' Sin categorizar', badge: true },
                { filter: '*', label: ' Adjunte un asterisco (*) al final del filtro para forzar la inclusión de Licencias de Construcción y Reconocimiento unicamente', badge: false },
            ]
        },
        {
            title: 'FILTROS DE INFORMES', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'inf:Y1,Y2,Y3:X1,...,Xn', label: ' Filtra por informe Y y requisito X, donde Y puede variar de 1 hasta 3 valores distintos', badge: false },
                { filter: 'i:Y1,Y2,Y3:X1,...,Xn', label: ' La misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'Y = jur | j', label: ' Informe Jurídico', badge: false },
                { filter: 'Y = arq | q', label: ' Informe Arquitectónico', badge: false },
                { filter: 'Y = est | e', label: ' Informe Estructural', badge: false },
                { filter: 'X = 0', label: ' Informe sin evaluar', badge: false },
                { filter: 'X = si', label: ' Informe declarado viable', badge: false },
                { filter: 'X = no', label: ' Informe declarado no viable', badge: false },
                //{ filter: 'X = naf', label: ' Informe no asignado; sin fecha', badge: false },
                { filter: 'X = nap', label: ' Informe no asignado; sin profesional', badge: false },
                { filter: '*', label: ' Adjunte un asterisco (*) al final del filtro para forzar las solicitudes que este en LyDF unicamente', badge: false },
                { filter: false, label: '', badge: false, ex: 'inf:jur:si,no -> Informes jurídicos que hayan sido revisados' },
                { filter: false, label: '', badge: false, ex: 'i:q:no,0 -> Informes arquitectónicos que hayan sido declarado no viables o sin evaluar' },
                { filter: false, label: '', badge: false, ex: 'i:j,q,e:si -> Informes jurídicos, arquitectónicos y estructurales que ya estén viables' },
            ]
        },
        {
            title: 'FILTROS DE ACTAS', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'acta:X1,...,Xn', label: ' Filtra basado en el estado actual del acta', badge: false },
                { filter: 'a:X1,...,Xn', label: ' La misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'X = 0', label: ' Sin acta de Observaciones y Correcciones', badge: false },
                { filter: 'X = 1', label: ' Con acta de Observaciones y Correcciones', badge: false },
                { filter: 'X = si', label: ' Con acta de Observaciones (Cumple con todo)', badge: false },
                { filter: 'X = no', label: ' Con acta de Observaciones (No Cumple)', badge: false },
                { filter: 'X = c0', label: ' Esperando acta de Correcciones  (Cuando no cumple)', badge: false },
                { filter: 'X = c', label: ' Con acta de Correcciones (Cuando no cumple)', badge: false },
                { filter: 'X = not', label: ' Con Acta notificada', badge: false },
                { filter: '*', label: ' Adjunte un asterisco (*) al final del filtro para forzar las solicitudes que este en LyDF unicamente', badge: false },
                { filter: false, label: '', badge: false, ex: 'acta:no,0 -> Muestra las solicitudes cuya acta no cumpla o no se halla creado' },
            ]
        },
        {
            title: 'FILTROS DE EXPEDICION', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'exp:X1,...,Xn', label: ' Filtra por el avance del proceso de expedición de la solicitud', badge: false },
                { filter: 'e:X1,...,Xn', label: ' La misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'X = via', label: ' Con viabilidad/ Acto de tramite de licencia', badge: false },
                { filter: 'X = eje', label: ' Con ejecutoria', badge: false },
                { filter: 'X = lic', label: ' Con Licencia', badge: false },
                { filter: 'X = res', label: ' Con resolución', badge: false },
                { filter: 'X = res:[ESTADO] = OTORGA | NIEGA | DESISTE | RECURSO | INTERNO | OTRO', label: ' Con resolución de estado [ESTADO]', badge: false },
                { filter: 'X = res:[ID-YY] =  X-YY', label: ' Con ID numero X y el año YY, el año YY es opcional', badge: false },
                { filter: '*', label: ' Adjunte un asterisco (*) al final del filtro para forzar las solicitudes que este en LyDF unicamente', badge: false },
                { filter: false, label: '', badge: false, ex: 'e:res,lic -> Muestra las solicitudes con resolución y licencia' },
                { filter: false, label: '', badge: false, ex: 'e:res:0001-21 -> Muestra las solicitudes cuya resolución sea la 0001 del año 2021' },
            ]
        },
        {
            title: 'FILTROS DE PAGOS', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'pago:X1,...,Xn', label: ' Filtra por estado actual de pago X', badge: false },
                { filter: 'p:X1,...,Xn', label: ' La misma funcionalidad que el filtro anterior', badge: false },
                { filter: 'X = fijo', label: ' Con pago fijo', badge: false },
                { filter: 'X = var', label: ' Con pago variable', badge: false },
                { filter: 'X = inm', label: ' Con pago impuestos municipales', badge: false },
                { filter: 'X = uis', label: ' Con pago estampilla PRO-UIS', badge: false },
                { filter: 'X = deb', label: ' Con pago deberes urbanísticos', badge: false },
                { filter: false, label: '', badge: false, ex: 'p:fijo,var -> Muestra las solicitudes que ya tengan el pago fijo y variable' },

            ]
        },
        {
            title: 'FILTROS VARIOS', class: 'list-group-item list-group-item-primary', color: 'primary',
            children: [
                { filter: 'valla', label: ' Solicitudes con Valla radicada (Fecha presente)', badge: true },
                { filter: 'vallano', label: ' Solicitudes sin Valla radicada (Fecha NO presente)', badge: true },
                { filter: 'sello', label: ' Solicitudes sello presente (creado)', badge: true },
                { filter: 'sellono', label: ' Solicitudes sello no presente (NO creado)', badge: true },
                { filter: 'rep', label: ' Reporte de planeación presente (Consecutivo CUB)', badge: true },
                { filter: 'repno', label: ' Reporte de planeación no presente (NO Consecutivo CUB)', badge: true },
                { filter: 'vecino', label: ' Solicitudes con TODOS los Vecinos alertados', badge: true },
                { filter: 'vecinono', label: ' Solicitudes con SIN TODOS los Vecinos alertados', badge: true },
                { filter: 'pqrs', label: ' Solicitudes con 1 o mas peticiones relacionadas', badge: true },
                { filter: 'tabla', label: ' Solicitudes con el cuadro de áreas completo', badge: true },
                { filter: 'tag:X1,...,Xn', label: ' Solicitudes con etiqueta X, puede incluir varias etiquetas con coma', badge: false },
                { filter: 't:X1,...,Xn', label: ' La misma funcionalidad que el filtro anterior', badge: false },
            ]
        },
        {
            title: 'FILTROS DE DESISTIMIENTOS', class: 'list-group-item list-group-item-secondary', color: 'danger',
            children: [
                { filter: 'des', label: 'Filtra las solicitudes en proceso activo de desistimiento', badge: true },
                { filter: 'des:X1,...,Xn:Y1,...,Yn', label: ' Filtra las solicitudes mediante una categoría de filtro X y un estado Y', badge: false, },
                { filter: 'x:X1,...,Xn:Y1,...,Yn', label: ' La misma funcionalidad que el filtro anterior', badge: false, },
                { filter: 'X = fin', label: ' Solicitudes que ya hallan subsanado y continuaron en curso', badge: false },
                { filter: 'X = ach', label: ' Solicitudes que NO hallan subsanado y fueron enviados al archivo ', badge: false },
                { filter: 'X = now', label: ' Solicitudes en proceso de descimiento', badge: false },
                { filter: 'X = *', label: ' Incluye todas las categorías anteriores', badge: false },
                { filter: 'Y = inc', label: ' Solicitudes que quedaron incompletas', badge: false },
                { filter: 'Y = acta', label: ' Solicitudes que no cumplieron con acta de observaciones', badge: false },
                { filter: 'Y = pago', label: ' Solicitudes que no pagaron las expensas', badge: false },
                { filter: 'Y = vol', label: ' Solicitudes que fueron desistidas voluntariamente', badge: false },
                { filter: 'Y = *', label: ' Incluye todos los estados anteriores', badge: false },
                {  ex: 'des:now:inc -> Las solicitudes en proceso que estén incompletas', filter: false, label: '', badge: false, },
                {  ex: 'x:ach:* -> Todas las solicitudes que no subsanaron y fueron archivadas', filter: false, label: '', badge: false, },
            ]
        },



    ];


    let toggle = (id) => {
        setModal(!modal)
        setModalId(id)
    }

    let _COMPONENT_LIST = () => {
        let EX = (child) => <li class="list-group-item list-group-item-success"><label className='fw-bold'>EJEMPLO:</label> {child.ex}</li>

        return <div className="row py-2">
            <div className="col">
                {data.map((parent, i) => {
                    return <>
                        <ul class="list-group">
                            <MDBBtn tag='a' outline color={parent.color} className={'my-1 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_23"
                                onClick={(prevState) => setCollapsables({ ...prevState, [parent.title]: !collapsables[parent.title] })}>
                                <label className="app-p lead fw-normal text-muted" >{i + 1}. {parent.title}</label>
                            </MDBBtn>
                            <MDBCollapse show={collapsables[parent.title]}>
                                {parent.children.map(child => {
                                    if (child.badge) return <>{
                                        child.filter ? <li class="list-group-item">
                                            <MDBBadge color={parent.color}>
                                                <label className="fw-bold app-pointer" onClick={(e) => props.setValues(e.target.innerText)}>{child.filter}</label>
                                            </MDBBadge> {child.label}</li>
                                            : ''
                                    }
                                        {child.ex ? EX(child) : ''}</>;
                                    else return <>{child.filter ? <li class="list-group-item"><label className="fw-bold">{child.filter}</label> {child.label}</li>
                                        : ''}
                                        {child.ex ? EX(child) : ''}</>
                                })}
                            </MDBCollapse>
                        </ul>
                    </>
                })}
            </div>
        </div>
    }
    return (
        <div>
            <MDBBtn className="btn btn-primary shadow-none" id={idRef} onClick={(e) => toggle(e.target.id)}><i class="fas fa-th-list"></i> {text}</MDBBtn>
            <Modal contentLabel="GENERAL VIEW FUN"
                isOpen={modal}
                style={customStylesForModal}
                ariaHideApp={false}
            >

                <div className="my-4 d-flex justify-content-between">
                    <label><i class="fas fa-th-list"></i> LISTA DE FILTROS</label>
                    <MDBBtn className='btn-close' color='none' onClick={toggle}></MDBBtn>
                </div>
                {_COMPONENT_LIST()}




                <div className="text-end py-1 mt-2">
                    <MDBBtn className="btn btn-lg btn-info" onClick={() => setModal(false)}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
                </div>
            </Modal>

        </div>
    );
}

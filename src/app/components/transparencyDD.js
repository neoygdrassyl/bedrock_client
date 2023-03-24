import React from 'react';
import {
    MDBDropdownHeader,
    MDBDropdown,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBTypography,
    MDBDropdownItem
} from 'mdb-react-ui-kit';
import Collapsible from 'react-collapsible';

import {
    Link,
} from "react-router-dom";

// Translations Services
import { useTranslation } from "react-i18next";
import "../translation/i18n";

export default function TransparencyDD() {
    const { t } = useTranslation();

    return (
        <MDBDropdown options={{
            modifiers:[
            {
              name: 'offset',
              options: {
                offset: [-515, 0],
              },
            },
            ]}}>
            <MDBDropdownToggle className="btn-nav" outline>TRANSPARENCIA</MDBDropdownToggle>
            <MDBDropdownMenu>
                <MDBDropdownHeader className="bg-dd">
                    <MDBTypography note noteColor='info'>
                        <h5>TRANSPARENCIA Y ACCESO A LA INFORMACIÓN PÚBLICA</h5>
                        <h6 className="text-wrap">En cumplimiento a <strong>la Ley 1712 del 6 de marzo de 2014</strong> la Curaduría Urbana No.1 de Bucaramanga pone a disposición de la ciudadanía la siguiente información.</h6>
                        <h6 className="text-wrap">Adicionalmente se publica la Directiva 006 del 14 de mayo de 2019 de la Procuraduría General de la Nación, dando cumplimiento a la misma.</h6>
                    </MDBTypography>
                    <TDD_1 />
                    <TDD_2 />
                    <TDD_3 />
                    <TDD_4 />
                    <TDD_6 />
                    <TDD_7 />
                    <TDD_9 />
                    <TDD_10 />
                    <TDD_11 />
                    <TDD_12 />
                    <TDD_13 />
                </MDBDropdownHeader>
            </MDBDropdownMenu>
        </MDBDropdown>
    );

}

function TDD_1() {
    return (
        <Collapsible trigger="MECANISMOS DE CONTACTO" lazyRender="true">
            <ul>
                <li><h6>Sección particular:</h6></li>
                <h6 className="text-wrap">Estimado ciudadano: La Curaduría Urbana No.1 de Bucaramanga ha destinado este botón de transparencia para facilitar el acceso a la información de interés público que genera la Curaduría. Lo invitamos a conocer su contenido.</h6>
                <li><h6>Mecanismos para la atención al ciudadano:</h6></li>
                <ul>
                <Link to={'/mailbox'}><li><MDBDropdownItem><h6 className="text-wrap">Contacte con nosotros</h6></MDBDropdownItem></li></Link>
                </ul>
            </ul>
        </Collapsible>
    );
}

function TDD_2() {
    return (
        <Collapsible trigger="INFORMACIÓN DE INTERÉS" lazyRender="true">
            <ul>
            <li><h6 className="text-wrap">Datos Abiertos</h6></li>
                <ul>
                <Link to={'/administrative'}><li><MDBDropdownItem><h6 className="text-wrap">Actos Administrativos</h6></MDBDropdownItem></li></Link>
                <Link to={'/liquidator'}><li><MDBDropdownItem><h6 className="text-wrap">Liquidador</h6></MDBDropdownItem></li></Link>
                </ul>
                <Link to={'/faq'}><li><MDBDropdownItem><h6 className="text-wrap">Preguntas y respuestas frecuentes</h6></MDBDropdownItem></li></Link>
                <a href={process.env.REACT_APP_API_URL + '/files/docs/glosario.docx'} target="_blank" download="Glosario"><li><h6 className="text-wrap">Glosario</h6></li></a>
                <Link to={'/kids'}><li><MDBDropdownItem><h6 className="text-wrap">Información para niños, niñas y adolescentes</h6></MDBDropdownItem></li></Link>
            </ul>
        </Collapsible>
    );
}

function TDD_3() {
    return (
        <Collapsible trigger="ESTRUCTURA ORGÁNICA Y TALENTO HUMANO" lazyRender="true">
            <ul>
                <Link to={'/mision'}><li><MDBDropdownItem><h6 className="text-wrap">Misión y Visión</h6></MDBDropdownItem></li></Link>
                <li><h6 className="text-wrap">Funciones y deberes</h6></li>
                <h6 className="text-wrap"><strong>ARTÍCULO 2.2.6.6.1.2 </strong>Naturaleza de la función del curador urbano. El curador urbano ejerce una función pública para la verificación del cumplimiento de las normas urbanísticas y de edificación vigentes, a través del otorgamiento de licencias de parcelación, urbanización, subdivisión y de construcción</h6>
                <Link to={'/organization'}><li><MDBDropdownItem><h6 className="text-wrap">Procesos y procedimientos</h6></MDBDropdownItem></li></Link>
                <Link to={'/organization'}><li><h6 className="text-wrap">Organigrama</h6></li></Link>
                <Link to={'/curator'}><li><MDBDropdownItem><h6 className="text-wrap">Directorio de inforacion de serviores publicos, contratistas y empreados</h6></MDBDropdownItem></li></Link>
                <Link to={'/curator'}><li><MDBDropdownItem><h6 className="text-wrap">Directorio de de entidades</h6></MDBDropdownItem></li></Link>
                <Link to={'/curator'}><li><MDBDropdownItem><h6 className="text-wrap">Directorio de agremiaciones, asociaciones y otros grupos de interés</h6></MDBDropdownItem></li></Link>
            </ul>
        </Collapsible>
    );
}

function TDD_4() {
    return (
        <Collapsible trigger="NORMATIVIDAD">
            <ul>
                <li><h6  className="text-wrap">Otros sujetos obligados</h6></li>
                <h6 className="text-wrap"><strong>Art 9. Lit d), Ley 1712 de 2014:</strong> Todas las normas generales y reglamentarias, políticas, lineamientos o manuales, las metas y objetivos de las unidades administrativas de conformidad con sus programas operativos y los resultados de las auditorías al ejercicio presupuestal e indicadores de desempeño</h6>
            </ul>
        </Collapsible>
    );
}

function TDD_6() {
    return (
        <Collapsible trigger="PLANEACIÓN">
            <ul>
                <li><h6 className="text-wrap">Políticas, lineamientos y manuales</h6></li>
                <ul>
                <Link to={'/organization'}><li><MDBDropdownItem><h6 className="text-wrap">Procesos y procedimientos</h6></MDBDropdownItem></li></Link>
                </ul>
                <li><h6 className="text-wrap">Informes de empalme</h6></li>
                <h6 className="text-wrap text-danger">En espera...</h6>
            </ul>
        </Collapsible>
    );
}

function TDD_7() {
    return (
        <Collapsible trigger="CONTROL">
            <ul>
            <Link to={'/data'}><li><MDBDropdownItem><h6 className="text-wrap">Informes de gestión, evaluación y auditoría</h6></MDBDropdownItem></li></Link>
                <li><h6 className="text-wrap">Entes de control que vigilan a la entidad y mecanismos de supervisión</h6></li>
                <ul>
                    <li><h6 className="text-wrap">PROCURADURIA GENERAL DE LA NACION</h6></li>
                    <ul>
                        <h6 className="text-wrap">Dirección Carrera 5 # 15-80, Bogotá D.C., Colombia, código postal: 11032 </h6>
                        <h6 className="text-wrap">Carrera 5 # 15-80, Bogotá D.C., Colombia, código postal: 11032 </h6>
                        <h6 className="text-wrap">PBX: +57 1 587 8750</h6>
                        <h6 className="text-wrap">línea gratuita nacional: 01 8000 940 808 </h6>
                        <h6 className="text-wrap">Sede electrónica para PQRS: <a href="//www.procuraduria.gov.co/portal/pqrsdf.page" target="_blank">Link</a></h6>
                    </ul>
                    <li><h6 className="text-wrap">SUPERINTENDENCIA DE NOTARIADO Y REGISTRO</h6></li>
                    <ul>
                        <h6 className="text-wrap">Superintendente: Rubén Silva Gómez </h6>
                        <h6 className="text-wrap">Dirección: Calle 26 No. 13-49 Interior 201 Bogotá D.C. Colombia</h6>
                        <h6 className="text-wrap">Conmutador: 57+(1) 328 2121 </h6>
                        <h6 className="text-wrap">línea gratuita nacional: 01 8000 940 808 </h6>
                        <h6 className="text-wrap">Sede electrónica para PQRS: <a href="//https://servicios.supernotariado.gov.co/pqrs/ " target="_blank">Link</a></h6>
                    </ul>
                    <li><h6 className="text-wrap">CONTRALORIA MUNICIPAL DE BUCARAMANGA</h6></li>
                    <ul>
                        <h6 className="text-wrap">Dirección: Carrera 11 # 34 - 52, Piso 4 Edificio de la Alcaldía Fase 2 Bucaramanga - Colombia</h6>
                        <h6 className="text-wrap">Teléfono: +57 (7) 6522777 </h6>
                        <h6 className="text-wrap">Fax: +57 (7) 6522777 </h6>
                        <h6 className="text-wrap">Correo: contactenos@contraloriabga.gov.co </h6>
                        <h6 className="text-wrap">Notificaciones Judiciales: juridica@contraloriabga.gov.co </h6>
                    </ul>
                </ul>
            </ul>
        </Collapsible>
    );
}

function TDD_9() {
    return (
        <Collapsible trigger="TRÁMITES Y SERVICIOS">
            <ul>
                <li><h6 className="text-wrap">Trámites y servicios</h6></li>
                <ul>
                <Link to={'/administrative'}><li><MDBDropdownItem><h6 className="text-wrap">Actos administrativos</h6></MDBDropdownItem></li></Link>
                <ul>
                <h6 className="text-wrap">Licencias de construcción</h6>
                <h6 className="text-wrap">Actos de Reconocimiento</h6>
                <h6 className="text-wrap">Otras Actuaciones</h6>
                <h6 className="text-wrap">Asesorías en norma urbana y NSR10</h6>
                </ul>
                </ul>
            </ul>
        </Collapsible>
    );
}

function TDD_10() {
    return (
        <Collapsible trigger="INSTRUMENTOS DE GESTIÓN DE INFORMACIÓN PÚBLICA">
            <ul>
                <Link to={'/administrative'}><li><MDBDropdownItem><h6 className="text-wrap">Registro de publicaciones</h6></MDBDropdownItem></li></Link>
                <Link to={'/pqrs'}><li><MDBDropdownItem><h6 className="text-wrap">Mecanismos para presentar quejas y reclamos en relación con omisiones o acciones del sujeto obligado</h6></MDBDropdownItem></li></Link>
            </ul>
        </Collapsible>
    );
}

function TDD_11() {
    return (
        <Collapsible trigger="TRANSPARENCIA PASIVA">
            <ul>
            <Link to={'/status'}><li><MDBDropdownItem><h6 className="text-wrap">Medios de seguimiento para la consulta del estado de las solicitudes de información pública </h6></MDBDropdownItem></li></Link>
            <Link to={'/file'}><li><MDBDropdownItem><h6 className="text-wrap">Formulario para la recepción de solicitudes de información pública.</h6></MDBDropdownItem></li></Link>
            </ul>
        </Collapsible>
    );
}

function TDD_12() {
    return (
        <Collapsible trigger="CRITERIO DIFERENCIAL DE ACCESIBILIDAD">
            <ul>
                <li><h6 className="text-wrap">Accesibilidad en medios electrónicos para la población en situación de discapacidad </h6></li>
                <ul>
                    <li><h6 className="text-wrap">Resolución 3564 d 2015</h6></li>
                    <ul>
                        <h6 className="text-wrap">Artículo 1 </h6>
                        <h6 className="text-wrap">OBJETO.La presente resolución tiene por objeto establecer los lineamientos respecto de los estándares para publicación y divulgación de la información, accesibilidad en medios electrónicos para población en situación de discapacidad, formulario electrónico para la recepción de solicitudes de acceso a información pública, condiciones técnicas para la publicación de datos abiertos y condiciones de seguridad de los medios electrónicos, que se establecen en los artículos 2.1.1.2.1.1, 2.1.1.2.1.11, y el parágrafo 2 del artículo 2.1.1.3.1.1 del Decreto N° 1081 de 2015. </h6>
                        <h6 className="text-wrap">Artículo 5 </h6>
                        <h6 className="text-wrap"> ACCESIBILIDAD EN MEDIOS ELECTRÓNICOS PARA POBLACIÓN EN SITUACIÓN DE DISCAPACIDAD. Los sujetos obligados deberán dar cumplimiento a los lineamientos de accesibilidad establecidos a través del Marco de Referencia de Arquitectura Empresarial, disponibles en el portal de la Estrategia Gobierno en Línea www.estrateqia.qobiernoenlinea.qov.co. </h6>
                    </ul>
                    <a href="//www.mincit.gov.co/ministerio/ministerio-en-breve/docs/5854-1.aspx" target="_blank"><li><h6 className="text-wrap">NTC 5854 de Accesibilidad Web</h6></li></a>
                    <li><h6 className="text-wrap">Decreto 103 de 2015</h6></li>
                    <ul>
                        <a href="//suin.gov.co/viewDocument.asp?ruta=Decretos/30019726" target="_blank"><h6 className="text-wrap">Capitulo II</h6></a>
                    </ul>
                </ul>
            </ul>
        </Collapsible>
    );
}

function TDD_13() {
    return (
        <Collapsible trigger="PROTECCIÓN DE DATOS PERSONALES">
            <ul>
                <li><h6 className="text-wrap">Cumplimiento de principios y obligaciones del régimen general de protección de datos personales</h6></li>
            </ul>
        </Collapsible>
    );
}
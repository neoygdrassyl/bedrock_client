import guide_dev_01 from './guide_dev_01.md'
import guide_dev_02 from './guide_dev_02.md'
import guide_dev_03 from './guide_dev_03.md'
import guide_dev_04 from './guide_dev_04.md'
import guide_dev_05 from './guide_dev_05.md'
import guide_dev_06 from './guide_dev_06.md'
import guide_dev_07 from './guide_dev_07.md'

const DevIndexList = [
    { pre: '1', label: 'Visión General', ref: '1-vision-general', md: guide_dev_01, },
    { pre: '1.1', label: 'Objetivo de la Aplicación', ref: '11-objetivo-de-la-aplicacion', md: guide_dev_01, },
    { pre: '1.2', label: 'Tipos de Usuarios', ref: '12-tipos-de-usuarios', md: guide_dev_01, },
    { pre: '1.3', label: 'Tecnologías Principales', ref: '13-tecnologias-principales', md: guide_dev_01, },
    { pre: '1.4', label: 'Diagrama de Arquitectura', ref: '14-diagrama-de-arquitectura', md: guide_dev_01, },
    { br: true },
    { pre: '2', label: 'Arquitectura del Sistema', ref: '2-arquitectura-del-sistema', md: guide_dev_02, },
    { pre: '2.1', label: 'Comunicación Frontend-Backend', ref: '21-comunicacion-frontend-backend', md: guide_dev_02, },
    { pre: '2.2', label: 'Flujo de Datos', ref: '22-flujo-de-datos', md: guide_dev_02, },
    { pre: '2.3', label: 'Servicios Externos', ref: '23-servicios-externos', md: guide_dev_02, },
    { br: true },
    { pre: '3', label: 'Frontend (React)', ref: '3-frontend-react', md: guide_dev_03, },
    { pre: '3.1', label: 'Stack y Librerías', ref: '31-stack-y-librerias', md: guide_dev_03, },
    { pre: '3.2', label: 'Estructura de Directorios', ref: '32-estructura-de-directorios', md: guide_dev_03, },
    { pre: '3.3', label: 'Componentes Principales', ref: '33-componentes-principales', md: guide_dev_03, },
    { pre: '3.4', label: 'Servicios (API Clients)', ref: '34-servicios-api-clients', md: guide_dev_03, },
    { pre: '3.5', label: 'Flujos de Navegación', ref: '35-flujos-de-navegacion', md: guide_dev_03, },
    { pre: '3.6', label: 'Sistema de Traducciones', ref: '36-sistema-de-traducciones', md: guide_dev_03, },
    { br: true },
    { pre: '4', label: 'Backend (Express + Sequelize)', ref: '4-backend-express-sequelize', md: guide_dev_04, },
    { pre: '4.1', label: 'Stack del Backend', ref: '41-stack-del-backend', md: guide_dev_04, },
    { pre: '4.2', label: 'Estructura de Directorios', ref: '42-estructura-de-directorios', md: guide_dev_04, },
    { pre: '4.3', label: 'Modelos y Entidades', ref: '43-modelos-y-entidades', md: guide_dev_04, },
    { pre: '4.4', label: 'Relaciones entre Entidades', ref: '44-relaciones-entre-entidades', md: guide_dev_04, },
    { pre: '4.5', label: 'Diagrama ER', ref: '45-diagrama-er', md: guide_dev_04, },
    { br: true },
    { pre: '5', label: 'APIs y Endpoints', ref: '5-apis-y-endpoints', md: guide_dev_05, },
    { pre: '5.1', label: 'Usuarios y Autenticación', ref: '51-usuarios-y-autenticacion', md: guide_dev_05, },
    { pre: '5.2', label: 'FUN (Formulario Único Nacional)', ref: '52-fun-formulario-unico-nacional', md: guide_dev_05, },
    { pre: '5.3', label: 'PQRS', ref: '53-pqrs', md: guide_dev_05, },
    { pre: '5.4', label: 'Nomenclaturas', ref: '54-nomenclaturas', md: guide_dev_05, },
    { pre: '5.5', label: 'Submit (Radicaciones)', ref: '55-submit-radicaciones', md: guide_dev_05, },
    { pre: '5.6', label: 'Diagrama de Secuencia API', ref: '56-diagrama-de-secuencia-api', md: guide_dev_05, },
    { br: true },
    { pre: '6', label: 'Configuración y Entorno', ref: '6-configuracion-y-entorno', md: guide_dev_06, },
    { pre: '6.1', label: 'Requisitos del Sistema', ref: '61-requisitos-del-sistema', md: guide_dev_06, },
    { pre: '6.2', label: 'Variables de Entorno', ref: '62-variables-de-entorno', md: guide_dev_06, },
    { pre: '6.3', label: 'Levantar el Frontend', ref: '63-levantar-el-frontend', md: guide_dev_06, },
    { pre: '6.4', label: 'Levantar el Backend', ref: '64-levantar-el-backend', md: guide_dev_06, },
    { pre: '6.5', label: 'Base de Datos', ref: '65-base-de-datos', md: guide_dev_06, },
    { br: true },
    { pre: '7', label: 'Extensibilidad y Convenciones', ref: '7-extensibilidad-y-convenciones', md: guide_dev_07, },
    { pre: '7.1', label: 'Añadir Nuevas Páginas', ref: '71-anadir-nuevas-paginas', md: guide_dev_07, },
    { pre: '7.2', label: 'Añadir Nuevos Servicios', ref: '72-anadir-nuevos-servicios', md: guide_dev_07, },
    { pre: '7.3', label: 'Añadir Nuevos Endpoints', ref: '73-anadir-nuevos-endpoints', md: guide_dev_07, },
    { pre: '7.4', label: 'Añadir Nuevos Modelos', ref: '74-anadir-nuevos-modelos', md: guide_dev_07, },
    { pre: '7.5', label: 'Convenciones de Código', ref: '75-convenciones-de-codigo', md: guide_dev_07, },
];

export default DevIndexList;

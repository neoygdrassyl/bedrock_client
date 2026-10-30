import Logo1 from '../../assets/logo.png'
import Logo2 from '../../assets/logo2.png'
import Logo3 from '../../assets/logogov.png'
import LogoFl from '../../assets/logo3.png'
import LogoLbj from '../../assets/lbj.png'
import { GLOBAL_ID, DEFAULT_GLOBAL_ID } from './global-id'
const info = {
    'cb1': {
        name: 'CURADURIA URBANA 1',
        dir: 'LUIS CARLOS PARRA SALAZAR',
        title: 'ARQUITECTO',
        job: 'CURADOR URBANO UNO DE BUCARAMANGA (P)',
        signature_job: 'Curador Urbano Uno de Bucaramanga (P)',
        call: 'Nombramiento Decreto municipal 0114 de 3 de junio de 2026\nDiligencia de posesión N° 0119 de 9 de junio de 2026',
        titles: 'ARQ.',
        city: 'Bucaramanga',
        state: 'Santander',
        nomen: '68001-1-',
        nomens: '1',
        address: 'Calle 36 # 31-39 Centro Empresarial Chicamocha - Local 101 y Local 102',
        web: 'https://www.curaduria1bucaramanga.com/',
        number1: '(+57)3162795010',
        number2: '607)6803596',
        email1: 'curaduriaurbana1@gmail.com',
        email2: '',
        nit: '91239522-1',
        icon: Logo1,
        icon2: Logo3,
        m: 0.76,
        // CHECKS WHEN THE AREA IS LARGER TO THE SELECTED VAR DEFAULT 3000
        axisVar: ["Eje Cra. 33", "Eje Cra. 27", "Eje Cra./Dig. 15", "Eje la Rosita", "Boul Bolivar/Sder.", "Demas Zona", 'Autop Florida'],
        axisTable: [1000, 2500, 2000, 3000, 2000, 3000, 2000],
        // CHECKS THE % OF THE TAX, GIVEN THE SELECTED VALUE, DEFAULT 0.1
        zonesVar: ["N/A", "Centro", "Norte"],
        zonesTable : [0.1, 0.05, 0.05],
        pot: '11/2014',
        sign: {
            text: 'Todo el interesado en formular objeciones a la expedición de una licencia, podrá hacerse parte en el trámite desde la fecha de la radicación de la solicitud hasta antes de la expedición del acto administrativo que la resuelve. Dicho acto solo podrá ser expedido una vez haya transcurrido un término de (5) días hábiles, contados a partir del día siguiente a la fecha de la citación a los vecinos colindantes.(Decreto 1077/2015 y decreto que lo modifique).'
        },
        serials: {
            start:'VR',
            end: 'CUB',
        },
        exp_rules : ['Exp. Variables', 'Imp. Minicipal'],
        res_extras : {
            art1p : ""
        },
        other_entities: [
            {id: "Planeación", name: "Secretaria de planeación Municipio de Bucaramanga", official: "Arq. LYDA XIMENA RODRIGUEZ ACEVEDO", job: "Secretaria Municipal", email: "secretariaplaneacion@bucaramanga.gov.co", other: "H2/P2"},
            {id: "CDMB", name: "Corporación autónoma de la Meseta de Bucaramanga", official: "Dr. JUAN CARLOS REEYES NOVA", job: "Director CDMB", email: "info@cdmb.gov.co", other: "H2/P2"},
            {id: "UNGR", name: "Unidad Nacional para la Gestión del Riesgo", official: "Dr. OLMEDO DE JESUS LOPEZ MARTINEZ", job: "Director general", email: "correspondedncia@gestiondelriesgo.gov.co", other: "H2/P2"},
            {id: "INGEOMINAS", name: "INGEOMINAS", official: "Dr. HÉCTOR JULIO FIERRO MORALEES", job: "Director general", email: "relacionciudadana@sgc.gov.co", other: "H2/P2"},
        ],
        codeDictionary: true,
    },
    'cp1': {
        name: 'CURADURIA URBANA 1',
        dir: 'SILVIA JOHANNA CAMARGO GUTIERREZ',
        title: 'INGENIERA',
        job: 'CURADORA URBANA UNO DE PIEDECUESTA',
        titles: 'ING.',
        city: 'Piedecuesta',
        state: 'SANTANDER',
        nomen: '68547-1-',
        nomens: '1',
        address: 'CENTRO COMERCIAL DE LA CUESTA LOCAL 321 CARRERA 15 No. 3AN-10',
        web: 'www.curaduria1piedecuesta.com',
        number1: '(607)6399200',
        number2: '(+57)3144710505',
        email1: 'curaduria1piedecuesta@gmail.com',
        email2: '',
        nit: '',
        icon: Logo2,
        m: 0.713,
        axisVar: ["Zona Piedecuesta"],
        axisTable: [3000],
        zonesVar: ["N/A",],
        zonesTable : [0.1,],
        pot: '11/2003',
        sign: {
            text: 'Esta valla advierte a terceros sobre la iniciación del trámite administrativo correspondiente. Toda persona interesada en formular objeciones a la expedición de una licencia urbanística podrá hacerse parte del trámite administrativo desde la fecha de la radicación de la solicitud hasta antes de la expedición del acto administrativo que resuelve la solicitud. Dicho acto sólo podrá ser expedido una vez haya transcurrido un término mínimo de cinco (5) días hábiles, contados a partir del día siguiente a la fecha de la citación a los vecinos colindantes o de la publicación cuando este fuere necesaria y, en el caso de los demás terceros, a partir del día siguiente a la fecha en que se radique la fotografía donde conste la instalación de la valla o aviso (Artículo 2.2.6.1.2.2.2 Decreto 1077 de 2015).'
        },
        serials: {
            start:'VR',
            end: 'OE',
        },
        exp_rules : ['Exp. Variables', 'Imp. Delineacion'],
        res_extras : {
            art1p : "en concordancia con el Acuerdo Municipal 028 del 2003 - POT del Municipio de Piedecuesta,"
        },
        other_entities: false,
        codeDictionary: false,
    },
    'fl2': {
        name: 'CURADURIA URBANA 2',
        dir: 'LAURA MARCELA GARCIA ARBOLEDA',
        title: 'ABOGADA',
        job: 'CURADORA URBANA DOS DE FLORIDABLANCA',
        titles: 'ABG.',
        city: 'Floridablanca',
        state: 'SANTANDER',
        nomen: '68276-2-',
        nomens: '2',
        address: 'CL 4 7 57 Casco Antiguo Floridablanca',
        web: ' - ',
        number1: '67 78 293',
        number2: '(+57)305 216 6699',
        email1: 'curaduria2f.informacion@gmail.com',
        email2: '',
        nit: '25289814-0',
        icon: LogoFl,
        m: 0.675,
        axisVar: ["Zona Floridablanca"],
        axisTable: [3000],
        zonesVar: ["N/A",],
        zonesTable : [0.1,],
        pot: '11/2003',
        sign: {
            text: 'Esta valla advierte a terceros sobre la iniciación del trámite administrativo correspondiente. Toda persona interesada en formular objeciones a la expedición de una licencia urbanística podrá hacerse parte del trámite administrativo desde la fecha de la radicación de la solicitud hasta antes de la expedición del acto administrativo que resuelve la solicitud. Dicho acto sólo podrá ser expedido una vez haya transcurrido un término mínimo de cinco (5) días hábiles, contados a partir del día siguiente a la fecha de la citación a los vecinos colindantes o de la publicación cuando este fuere necesaria y, en el caso de los demás terceros, a partir del día siguiente a la fecha en que se radique la fotografía donde conste la instalación de la valla o aviso (Artículo 2.2.6.1.2.2.2 Decreto 1077 de 2015).'
        },
        serials: {
            start:'VR',
            end: 'OE',
        },
        exp_rules : ['Exp. Variables', 'Imp. Delineacion'],
        res_extras : {
            art1p : "en concordancia con el Acuerdo Municipal 028 del 2003 - POT del Municipio de Piedecuesta,"
        },
        other_entities: false,
        codeDictionary: false,
    },
    'lbj': {
        name: 'ALCALDIA DE LEBRIJA',
        dir: 'ALEXANDER MARTINEZ MENDOZA',
        title: '',
        job: 'JEFE OFICINA ASESOR DE PLANEACION',
        titles: '',
        city: 'Lebrija',
        state: 'SANTANDER',
        nomen: '',
        nomens: '',
        address: '', // FALTA
        web: 'https://www.lebrija-santander.gov.co/Paginas/Inicio.aspx',
        number1: '607 685 49 00 EXT 127',
        number2: '(+57)318 36 09 271',
        email1: 'planeacion@lebrija-santander.gov.co',
        email2: '',
        nit: '8902012220',
        icon: LogoLbj,
        m: 1,
        axisVar: ["Zona Lebrija"],
        axisTable: [3000],
        zonesVar: ["N/A",],
        zonesTable : [0.1,],
        pot: '11/2003',
        sign: {
            text: 'Esta valla advierte a terceros sobre la iniciación del trámite administrativo correspondiente. Toda persona interesada en formular objeciones a la expedición de una licencia urbanística podrá hacerse parte del trámite administrativo desde la fecha de la radicación de la solicitud hasta antes de la expedición del acto administrativo que resuelve la solicitud. Dicho acto sólo podrá ser expedido una vez haya transcurrido un término mínimo de cinco (5) días hábiles, contados a partir del día siguiente a la fecha de la citación a los vecinos colindantes o de la publicación cuando este fuere necesaria y, en el caso de los demás terceros, a partir del día siguiente a la fecha en que se radique la fotografía donde conste la instalación de la valla o aviso (Artículo 2.2.6.1.2.2.2 Decreto 1077 de 2015).'
        },
        serials: {
            start:'VR',
            end: 'OE',
        },
        exp_rules : ['Exp. Variables', 'Imp. Delineacion'],
        res_extras : {
            art1p : "en revisión excepcional 010 de 2011,"
        },
        other_entities: false,
    },
}

// Defensive fallback: GLOBAL_ID is validated against a known-id list in
// global-id.js, but that list can drift from the keys actually present here.
// Fall back to the default tenant instead of crashing the module at import time.
const ACTIVE_INFO = info[GLOBAL_ID] || info[DEFAULT_GLOBAL_ID];

export const cities = <>
    <option>{ACTIVE_INFO.city}</option>
</>

export const rules_opt = <>
    {ACTIVE_INFO.exp_rules.map((value, index) => <option value={index}>{value}</option>)}
</>

export const states = <>
    <option>{ACTIVE_INFO.state}</option>
</>

export const domains = <>
    <option>{ACTIVE_INFO.name}</option>
</>

export const domains_number = <>
    <option value={ACTIVE_INFO.nomens}>{ACTIVE_INFO.name}</option>
</>
// Plain values behind the single `cities` / `domains_number` options (checklist dialog selects).
export const activeCity = ACTIVE_INFO.city
export const activeAuthority = { value: ACTIVE_INFO.nomens, label: ACTIVE_INFO.name }
export const axisTable = ACTIVE_INFO.axisTable
export const axisVar = ACTIVE_INFO.axisVar

export const axis = <>
    {axisVar.map((value, index) => <option value={index}>{value}</option>)}
</>

export const zonesTable = ACTIVE_INFO.zonesTable
export const zonesVar = ACTIVE_INFO.zonesVar
export const zones = <>
    {zonesVar.map((value, index) => <option value={index}>{value}</option>)}
</>

export const nomens = ACTIVE_INFO.nomen
export const infoCud = ACTIVE_INFO


import Logo1 from '../../img/logo.png'
import Logo2 from '../../img/logo2.png'
import Logo3 from '../../img/logogov.png'
import IMG1 from '../../img/slider/img1.jpg'
import IMG2 from '../../img/slider/img2.jpg'
import IMG3 from '../../img/slider/img3.jpg'
import AVISO from '../../img/aviso.jpg'
import COLOMBIA from '../../img/colombian.jpg'
const info = {
    'cb1': {
        name: 'CURADURIA URBANA 1',
        dir: 'LUIS CARLOS PARRA SALAZAR',
        title: 'ARQUITECTO',
        job: 'CURADOR URBANO UNO DE BUCARAMANGA',
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
        schedule: 'Lunes a Viernes: 07:00 - 12:30pm y 1:00pm - 4:00pm',
        icon: Logo1,
        icon2: Logo3,
        imagen1: IMG1,
        imagen2: IMG2,
        imagen3: IMG3,
        //imagen4: IMG4,
        imagen5: COLOMBIA,
        aviso: AVISO,
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
        exp_rules : ['Exp. Variables', 'Imp. Minicipal', 'Ambos', 'Ignorar'],
        res_extras : {
            art1p : ""
        }
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
        schedule: 'Lunes a Viernes: 08:00 - 12:00pm y 2:00pm - 6:00pm',
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
        exp_rules : ['Exp. Variables', 'Imp. Delineacion', 'Ambos', 'Ignorar'],
        res_extras : {
            art1p : "en concordancia con el Acuerdo Municipal 028 del 2003 - P.B.O.T. del Municipio de Piedecuesta,"
        }
    },
}


export const cities = <>
    <option>{info[process.env.REACT_APP_GLOBAL_ID].city}</option>
</>

export const rules_opt = <>
    {info[process.env.REACT_APP_GLOBAL_ID].exp_rules.map((value, index) => <option value={index}>{value}</option>)}
</>

export const states = <>
    <option>{info[process.env.REACT_APP_GLOBAL_ID].state}</option>
</>

export const domains = <>
    <option>{info[process.env.REACT_APP_GLOBAL_ID].name}</option>
</>

export const domains_number = <>
    <option value={info[process.env.REACT_APP_GLOBAL_ID].nomens}>{info[process.env.REACT_APP_GLOBAL_ID].name}</option>
</>
export const axisTable = info[process.env.REACT_APP_GLOBAL_ID].axisTable
export const axisVar =info[process.env.REACT_APP_GLOBAL_ID].axisVar

export const axis = <>
    {axisVar.map((value, index) => <option value={index}>{value}</option>)}
</>

export const zonesTable = info[process.env.REACT_APP_GLOBAL_ID].zonesTable
export const zonesVar = info[process.env.REACT_APP_GLOBAL_ID].zonesVar
export const zones = <>
    {zonesVar.map((value, index) => <option value={index}>{value}</option>)}
</>

export const nomens = info[process.env.REACT_APP_GLOBAL_ID].nomen
export const infoCud = info[process.env.REACT_APP_GLOBAL_ID]



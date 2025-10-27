const _SERIES_DOCS = {
    'GENERIC': {
        'DOCUMENTOS GENERALES': [701, 803, 511, 512, 514, 513, 516, 517, 900, 519, 520, 521, 522, 523, 524, 531, 532, 6610, 6614, 906, 911, 820, 999],
        'DOCUMENTOS EXPEDIDOS': [996, 700, 842, 400, 819, 811, 821, 823, 824, 831, 826, 835, 837, 838, 844],
        'LICENCIA': [845, 915],
        'ANEXOS TECNICOS': [916, 6605, 998, 997]
    },
    '1100-40.01': false,
    '1100-40.02': {
        'DOCUMENTOS GENERALES': [700, 803, 511, 512, 514, 513, 516, 517, 900, 519, 520, 521, 522],
        'DOCUMENTOS EXPEDIDOS': [996, 821],
        'VISTO BUENO': [681, 682, 683, 684, 685],
    },
    '1100-40.03': false,
    '1100-40.04': false,
    '1100-40.05': false,
    '1100-40.06': false,
    '1100-40.07': false,

    '1100-190.01': {
        'DOCUMENTOS GENERALES': [701, 803, 511, 512, 514, 513, 516, 517, 519, 520, 521, 522, 523, 524, 531, 532, 653, 6610, 6614, 906, 911, 912, 820],
        'DOCUMENTOS EXPEDIDOS': [996, 400, 842, 840, 841, 846, 819, 821, 831, 826, 700],
        'LICENCIA': [835, 837, 838, 845, 915],
        'ANEXOS TECNICOS': [997, 6601, 652, 6604, 6602, 916, 917, 6605, 918, 919, 998, 999]

    },
    '1100-190.02': false,
    '1100-190.03': false,
    '1100-190.04': false,
    '1100-190.05': false,
    '1100-190.06': false,
    '1100-190.07': false,
    '1100-190.08': false,
    '1100-190.09': false,
    '1100-190.10': false,
    '1100-190.11': false,
    '1100-190.12': false,
    '1100-190.13': false,
    '1100-190.14': false,
    '1100-190.15': false,
    '1100-190.16': false,
    '1100-190.17': false,
    '1100-190.18': false,
    '1100-190.19': false,
    '1100-190.20': false,
    '1100-190.21': false,
    '1100-190.22': false,
    '1100-190.23': false,
    '1100-190.24': false,
    '1100-190.25': false,
    '1100-190.26': false,
    '1100-190.27': false,
    '1100-190.28': false,
    '1100-190.29': false,
    '1100-190.30': false,

    '1100-200': {
        'DOCUMENTOS GENERALES': [701, 803, 511, 512, 514, 513, 516, 517, 900, 519, 520, 6610, 6614, 906, 911, 820],
        'DOCUMENTOS EXPEDIDOS': [819, 811, 812, 821, 823, 824, 831, 826, 835, 837, 838, 844, 845, 915],
        'ANEXOS TECNICOS': [997, 916, 6605, 998, 996, 700, 842, 400]

    },

    '1100-250.01': false,
    '1100-250.02': false,

    '1100-260.01': false,
    '1100-260.02': false,
    '1100-260.03': false,
    '1100-260.04': false,
    '1100-260.05': false,
    '1100-260.06': false,
    '1100-260.07': false,
    '1100-260.08': false,
    '1100-260.09': false,
    '1100-260.10': false,
    '1100-260.11': false,
    '1100-260.12': false,
    '1100-260.13': false,
    '1100-260.14': false,
    '1100-260.15': false,

    '1100-270': false,
}
const _WORKER_NEEDED_FOR_MODULE = {
    '1:A': ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'ARQUITECTO PROYECTISTA', 'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO', 'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES'],
    '1:B': ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'ARQUITECTO PROYECTISTA', 'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'],
    '1:C': ['ARQUITECTO PROYECTISTA', 'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'],
    '1:D': ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'ARQUITECTO PROYECTISTA', 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL', 'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES'],
    '5:A': ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES', 'INGENIERO CIVIL GEOTECNISTA'],
    '5:B': ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES'],
    '7:B': ['REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES'],
    '7:C': ['REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES'],
    '1:F': ['ARQUITECTO PROYECTISTA', 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'],
    '2:B': ['URBANIZADOR O CONSTRUCTOR RESPONSABLE'],
    '2:D': ['URBANIZADOR O CONSTRUCTOR RESPONSABLE'],
    '2:PH': ['ARQUITECTO PROYECTISTA'],
    '2:TIERRA': ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'],
    '2:PISCINA': ['ARQUITECTO PROYECTISTA', 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'],
}
const _SERIES_MODULES_RELATION = {
    '1100-40': ['1:G', '2:OA'],

    '1100-70': [''],

    '1100-190': ['1:D'],

    '1100-200': ['1:G', '2:C'],

    '1100-250': ['1:G', '2:B'],

    '1100-260': ['1:F'],

    '1100-270': ['1:G', '2:D'],
}
const _SUBSERIES_MODULES_RELATION = {
    '1100-40.01': ['1:G', '2:OA', '2:COTAS'],
    '1100-40.02': ['1:G', '2:OA', '2:PH'],
    '1100-40.03': ['1:G', '2:OA', '2:TIERRA'],
    '1100-40.04': ['1:G', '2:OA', '2:PISCINA'],
    '1100-40.05': ['1:G', '2:OA', '2:PLANOS'],
    '1100-40.06': ['1:G', '2:OA', '2:BIENES'],
    '1100-40.07': ['1:G', '2:OA', '2:ESTRUCTURAL'],

    '1100-70.01': [''],
    '1100-70.02': [''],
    '1100-70.03': [''],
    '1100-70.04': [''],

    '1100-190.01': ['1:D', '5:A'],
    '1100-190.02': ['1:D', '5:A', '5:G'],
    '1100-190.03': ['1:D', '5:I', '5:G'],
    '1100-190.04': ['1:D', '5:B'],
    '1100-190.05': ['1:D', '5:D'],
    '1100-190.06': ['1:D', '5:C'],
    '1100-190.07': ['1:D', '5:F'],
    '1100-190.08': ['1:D', '5:E'],
    '1100-190.09': ['1:D', '5:H'],
    '1100-190.10': ['1:D', '5:I'],
    '1100-190.11': ['1:D', '5:B'],
    '1100-190.12': ['1:D', '5:C', 'D:C'],
    '1100-190.13': ['1:D', '5:B', '5:C'],
    '1100-190.14': ['1:D', '5:B', '5:F'],
    '1100-190.15': ['1:D', '5:C', '5:D', '5:F'],
    '1100-190.16': ['1:D', '5:B', '5:C', '5:F'],
    '1100-190.17': ['1:D', '5:B', '5:G'],
    '1100-190.18': ['1:D', '5:C', '5:D', '5:G'],
    '1100-190.19': ['1:D', '5:B', '5:C', '5:G'],
    '1100-190.20': ['1:D', '5:B', '5:F', '5:G'],
    '1100-190.21': ['1:D', '5:C', '5:D', '5:F', '5:G'],
    '1100-190.22': ['1:D', '5:B', '5:C', '5:F', '5:G'],
    '1100-190.23': ['1:C', '4:B'],
    '1100-190.24': ['1:C', '4:A'],
    '1100-190.25': ['1:C', '4:C:'],
    '1100-190.26': ['1:A', '3:A:'],
    '1100-190.27': ['1:A', '3:B:'],
    '1100-190.28': ['1:A', '3:C'],
    '1100-190.29': ['1:B'],
    '1100-190.30': ['1:E'],

    '1100-250.01': ['1:G', '2:B'],
    '1100-250.02': ['1:G', '2:B'],

    '1100-260.01': ['1:F', '5:D'],
    '1100-260.02': ['1:F', '5:B'],
    '1100-260.03': ['1:F', '5:C'],
    '1100-260.04': ['1:F', '5:F'],
    '1100-260.05': ['1:F', '5:g'],
    '1100-260.06': ['1:F', '5:D', '5:g'],
    '1100-260.07': ['1:F', '5:B', '5:C', '5:D', '5:F', '5:g'],
    '1100-260.08': ['1:F', '5:B', '5:F'],
    '1100-260.09': ['1:F', '5:D', '5:F'],
    '1100-260.10': ['1:F', '5:C', '5:F'],
    '1100-260.11': ['1:F', '5:B', '5:g'],
    '1100-260.12': ['1:F', '5:C', '5:g'],
    '1100-260.13': ['1:F', '5:B', '5:D'],
    '1100-260.14': ['1:F', '5:C', '5:D'],
    '1100-260.15': ['1:F', '5:B', '5:C'],

}


// RECIEVES AN OBJECT FUN 1 ONLY CARING ABOUT 5 OF ITS PROPERTIES
// RETURNS A STRING TRANSFORMING ALL THE INPUT VALUE INTO CONTEXTUALIZED INFORMATION
// IE A -> LICENCIA X

function formsParser1(object) {
    if (!object) return "";
    let f_11 = object.tipo ? object.tipo : "";
    let f_12 = object.tramite ? object.tramite : "";
    let f_13 = object.m_urb ? object.m_urb : "";
    let f_14 = object.m_sub ? object.m_sub : "";
    let f_15 = object.m_lic ? object.m_lic : "";

    let textToParse = [];
    let arrayHelper = null;
    let arrayHelper2 = null;
    let defaultValue = null;

    // 1.1 CAN BE MULTIPLE
    defaultValue = f_11
    arrayHelper = ['LICENCIA DE URBANIZACION',
        'LICENCIA DE PARCELACION',
        'LICENCIA DE SUBDIVISION',
        'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
        'RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION',
        'LICENCIA DE CONSTRUCCION',
        'OTRAS ACTUACIONES'];
    arrayHelper2 = ['A', 'B', 'C', 'E', 'F', 'D', 'G'];
        for (var j = 0; j < arrayHelper2.length; j++) {
            for (var i = 0; i < defaultValue.length; i++) {
            if (arrayHelper2[j] == defaultValue[i]) {
                textToParse.push(arrayHelper[j]);
            }
        }
    }

    // 1.2 CAN HAVE OTHER OPTIONS
    arrayHelper = ['INICIAL',
        'PRORROGA',
        'MODIFICACION DE LICENCIA VIGENTE',
        'REVALIDACION'];
    arrayHelper2 = ['A', 'B', 'C', 'D'];
    defaultValue = f_12;
    for (var i = 0; i < arrayHelper2.length; i++) {
        if (arrayHelper2[i] == defaultValue) {
            defaultValue = arrayHelper[i];
            break;
        }
    }
    if (defaultValue) {
        textToParse.push(defaultValue);
    }


    // 1.3 CAN BE NULL
    defaultValue = f_13
    if (defaultValue != "" && defaultValue != null) {
        arrayHelper = ['DESARROLLO',
            'SANEAMIENTO',
            'RECUPERACION'];
        arrayHelper2 = ['A', 'B', 'C'];
        for (var i = 0; i < arrayHelper2.length; i++) {
            if (arrayHelper2[i] == defaultValue) {
                textToParse.push(arrayHelper[j]);
                break;
            }
        }
    }

    // 1.4 CAN BE NULL
    defaultValue = f_14
    if (defaultValue != "" && defaultValue != null) {
        arrayHelper = ['SUBDIVISION RURAL',
            'SUBDIVISION URBANA',
            'RELOTEO'];
        arrayHelper2 = ['A', 'B', 'C'];
        for (var i = 0; i < arrayHelper2.length; i++) {
            if (arrayHelper2[i] == defaultValue) {
                textToParse.push(arrayHelper[j]);
                break;
            }
        }
    }

    // 1.5 CAN BE NULL && CAN BE MULTILPLE
    defaultValue = f_15
    if (defaultValue != "" && defaultValue != null) {
        arrayHelper = ['OBRA NUEVA',
            'AMPLIACION',
            'ADECUACION',
            'MODIFICACION',
            'RESTAURACION',
            'REFORZAMIENTO ESTRUCTURAL',
            'DEMOLICION TOTAL',
            'DEMOLICION PARCIAL',
            'RECONSTRUCCION',
            'CERRAMIENTO'];
        arrayHelper2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'g', 'H', 'I'];
        for (var i = 0; i < defaultValue.length; i++) {
            for (var j = 0; j < arrayHelper2.length; j++) {
                if (arrayHelper2[j] == defaultValue[i]) {
                    textToParse.push(arrayHelper[j]);
                }
            }
        }
    }
    var striing = textToParse.join()
    return striing.replace(/,/g, ", ");
}


function formsParser1_exlucde2(object) {
    if (!object) return "";
    let f_11 = object.tipo ? object.tipo : "";
    let f_12 = object.tramite ? object.tramite : "";
    let f_13 = object.m_urb ? object.m_urb : "";
    let f_14 = object.m_sub ? object.m_sub : "";
    let f_15 = object.m_lic ? object.m_lic : "";

    let textToParse = [];
    let arrayHelper = null;
    let arrayHelper2 = null;
    let defaultValue = null;

    // 1.1 CAN BE MULTIPLE
    defaultValue = f_11
    arrayHelper = ['LICENCIA DE URBANIZACION',
        'LICENCIA DE PARCELACION',
        'LICENCIA DE SUBDIVICION',
        'LICENCIA DE CONSTRUCCION',
        'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
        'RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION',
        'OTRAS ACTUACIONES'];
    arrayHelper2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    for (var i = 0; i < defaultValue.length; i++) {
        for (var j = 0; j < arrayHelper2.length; j++) {
            if (arrayHelper2[j] == defaultValue[i]) {
                textToParse.push(arrayHelper[j]);
            }
        }
    }


    // 1.3 CAN BE NULL
    defaultValue = f_13
    if (defaultValue != "" && defaultValue != null) {
        arrayHelper = ['DESARROLLO',
            'SANEAMIENTO',
            'RECUPERACION'];
        arrayHelper2 = ['A', 'B', 'C'];
        for (var i = 0; i < arrayHelper2.length; i++) {
            if (arrayHelper2[i] == defaultValue) {
                textToParse.push(arrayHelper[j]);
                break;
            }
        }
    }

    // 1.4 CAN BE NULL
    defaultValue = f_14
    if (defaultValue != "" && defaultValue != null) {
        arrayHelper = ['SUBDIVISION RURAL',
            'SUBDIVISION URBANA',
            'RELOTEO'];
        arrayHelper2 = ['A', 'B', 'C'];
        for (var i = 0; i < arrayHelper2.length; i++) {
            if (arrayHelper2[i] == defaultValue) {
                textToParse.push(arrayHelper[j]);
                break;
            }
        }
    }

    // 1.5 CAN BE NULL && CAN BE MULTILPLE
    defaultValue = f_15
    if (defaultValue != "" && defaultValue != null) {
        arrayHelper = ['OBRA NUEVA',
            'AMPLIACION',
            'ADECUACION',
            'MODIFICACION',
            'RESTAURACION',
            'REFORZAMIENTO ESTRUCTURAL',
            'DEMOLICION TOTAL',
            'DEMOLICION PARCIAL',
            'RECONSTRUCCION',
            'CERRAMIENTO'];
        arrayHelper2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'g', 'H', 'I'];
        for (var i = 0; i < defaultValue.length; i++) {
            for (var j = 0; j < arrayHelper2.length; j++) {
                if (arrayHelper2[j] == defaultValue[i]) {
                    textToParse.push(arrayHelper[j]);
                }
            }
        }
    }

    var striing = textToParse.join()
    return striing.replace(/,/g, ", ");
}

// REGEX GROUP
function regexChecker_isPh(input, parser) {
    if (parser)  return REGEX_MATCH_1100_40_02(formsParser1(input))
    return REGEX_MATCH_1100_40_02(input)
}
function regexChecker_movTierra(input) {
    return REGEX_MATCH_1100_40_03(input)
}

 // REGEXES... REGI?
 function REGEX_MATCH_1100_40_01(input) {
    let regex = /ajuste.*cota/i;
    return regex.test(input);
}
function REGEX_MATCH_1100_40_02(_string) {
    let regex0 = /p\.\s+h/i;
    let regex1 = /p\.h/i;
    let regex2 = /PROPIEDAD\s+HORIZONTAL/i;
    let regex3 = /p\s+h/i;
    if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
    return false
}
function REGEX_MATCH_1100_40_03(input) {
    let regex = /movimiento.*tierra/i;
    return regex.test(input);
}
function REGEX_MATCH_1100_40_04(input) {
    let regex = /piscina/i;
    return regex.test(input);
}
function REGEX_MATCH_1100_40_05(input) {
    let regex = /modificacion.*plano.*urbanistico/i;
    return regex.test(input);
}
function REGEX_MATCH_1100_40_06(input) {
    let regex = /bien.*destin.*publico/i;
    return regex.test(input);
}
function REGEX_MATCH_1100_40_07(input) {
    let regex = /revision.*independiente.*estructural/i;
    return regex.test(input);
}
///

// RECIEVES A DATE FORMAT YYYY-MM-DD AND RETURNS A MORE CONTEXTUALIZED FORMAT, IE: X OF JUNE OF 20XX
function dateParser(date) {
    if (!date) return ""
    const moment = require('moment');
    let esLocale = require('moment/locale/es');
    var momentLocale = moment(date).locale('es', esLocale);
    return momentLocale.format("LL")
}

// RECIEVES A SATR DATE FORMAT YYYY-MM-DD AND AN POSITIVE INTEGER
// RETURNS AN INTEGER STATING HOW MUCH TIME IN BUSSINES DAYS IS LEFT FOR THE startDate AND time + startDate TO BE EQUAL
function dateParser_timeLeft(startDate, time) {
    if (!startDate && !time) return ""
    var moment = require('moment');
    var momentB = require('moment-business-days');
    const holydays = require("./holydays.json")
    momentB.updateLocale(holydays);
    let today = moment().format('YYYY-MM-DD');
    let endate = momentB(startDate, 'YYYY-MM-DD').businessAdd(time)._d;
    let diff = momentB(endate).businessDiff(moment(today), true);
    return diff;
}

// RECIEVES A SATR DATE FORMAT YYYY-MM-DD AND AN POSITIVE INTEGER
// RETURNS A DATE THAT IS EUQAL TO THE STARTING DATE PLUS THE NUMBER OF time ADDED AS BUSINESS DAYS
function dateParser_finalDate(startDate, time) {
    if (!startDate || !time) return ""
    var momentB = require('moment-business-days');
    var moment = require('moment');
    const holydays = require("./holydays.json")
    momentB.updateLocale('us', holydays);
    let endate = momentB(startDate, 'YYYY-MM-DD').businessAdd(time)._d;
    return moment(endate).format('YYYY-MM-DD');
}

// RECIEVES TWO DATES FORMAT YYYY-MM-DD
// RETURN THE DIFFERENCE IN BUSINESS DAYS BETWEEN THE TWO DATES
function dateParser_dateDiff(dateA, dateB) {
    var momentB = require('moment-business-days');
    var moment = require('moment');
    const holydays = require("./holydays.json")
    momentB.updateLocale(holydays);
    var diff = momentB(dateA, 'YYYY-MM-DD').businessDiff(moment(dateB, 'YYYY-MM-DD'))
    return diff;
}

// RECIEVES A DATE FORMAT YYYY-MM-DD
// RETURNS AN INTEGER STATING THE NUMBERS OF BUSSINESS DAYS THAT HAS PASSED SINCE THAT DATE AND TODAY
function dateParser_timePassed(date) {
    var momentB = require('moment-business-days');
    var moment = require('moment');
    const holydays = require("./holydays.json")
    momentB.updateLocale(holydays);
    const today = moment().format('YYYY-MM-DD');
    var diff = momentB(date, 'YYYY-MM-DD').businessDiff(moment(today, 'YYYY-MM-DD'))
    return diff;
}

// RECIEVES A DATE FORMAT YYYY-MM-DD
// RETURNS AN INTEGER STATING THE NUMBERS OF YEARS THAT HAS PASSED SINCE THAT DATE AND TODAY
function dateParser_yearsPassed(date) {
    var moment = require('moment');
    const today = moment().format('YYYY-MM-DD');
    var diff = moment(today, 'YYYY-MM-DD').diff(date, 'years');
    return diff;
}

// SERIES AND SUBSERIES IDENTIFIER
function _IDENTIFY_SERIES(_CHILD_1) {
    let _CONDITONS = [];
    let _CHILD = _CHILD_1;
    if (_CHILD.item_1.includes('A')) _CONDITONS.push('1:A');
    if (_CHILD.item_1.includes('B')) _CONDITONS.push('1:B');
    if (_CHILD.item_1.includes('C')) _CONDITONS.push('1:C');
    if (_CHILD.item_1.includes('D')) _CONDITONS.push('1:D');
    if (_CHILD.item_1.includes('E')) _CONDITONS.push('1:E');
    if (_CHILD.item_1.includes('F')) _CONDITONS.push('1:F');
    if (_CHILD.item_1.includes('G')) _CONDITONS.push('1:G');

    if (_CHILD.item_2 == 'A') _CONDITONS.push('2:A');
    if (_CHILD.item_2 == 'B') _CONDITONS.push('2:B');
    if (_CHILD.item_2 == 'C') _CONDITONS.push('2:C');
    if (_CHILD.item_2 == 'D') _CONDITONS.push('2:D');
    if (REGEX_MATCH_1100_40_01(_CHILD.item_2) ||
        REGEX_MATCH_1100_40_02(_CHILD.item_2) ||
        REGEX_MATCH_1100_40_03(_CHILD.item_2) ||
        REGEX_MATCH_1100_40_04(_CHILD.item_2) ||
        REGEX_MATCH_1100_40_05(_CHILD.item_2) ||
        REGEX_MATCH_1100_40_06(_CHILD.item_2) ||
        REGEX_MATCH_1100_40_07(_CHILD.item_2)) _CONDITONS.push('2:OA');
    if (REGEX_MATCH_1100_40_01(_CHILD.item_2)) _CONDITONS.push('2:COTAS');
    if (REGEX_MATCH_1100_40_02(_CHILD.item_2)) _CONDITONS.push('2:PH');
    if (REGEX_MATCH_1100_40_03(_CHILD.item_2)) _CONDITONS.push('2:TIERRA');
    if (REGEX_MATCH_1100_40_04(_CHILD.item_2)) _CONDITONS.push('2:PISCINA');
    if (REGEX_MATCH_1100_40_05(_CHILD.item_2)) _CONDITONS.push('2:PLANOS');
    if (REGEX_MATCH_1100_40_06(_CHILD.item_2)) _CONDITONS.push('2:BIENES');
    if (REGEX_MATCH_1100_40_07(_CHILD.item_2)) _CONDITONS.push('2:ESTRUCTURAL');

    if (_CHILD.item_3 == 'A') _CONDITONS.push('3:A');
    if (_CHILD.item_3 == 'B') _CONDITONS.push('3:B');
    if (_CHILD.item_3 == 'C') _CONDITONS.push('3:C');

    if (_CHILD.item_4 == 'A') _CONDITONS.push('4:A');
    if (_CHILD.item_4 == 'B') _CONDITONS.push('4:B');
    if (_CHILD.item_4 == 'C') _CONDITONS.push('4:C');

    if (_CHILD.item_5.includes('A')) _CONDITONS.push('5:A');
    if (_CHILD.item_5.includes('B')) _CONDITONS.push('5:B');
    if (_CHILD.item_5.includes('C')) _CONDITONS.push('5:C');
    if (_CHILD.item_5.includes('D')) _CONDITONS.push('5:D');
    if (_CHILD.item_5.includes('E')) _CONDITONS.push('5:E');
    if (_CHILD.item_5.includes('F')) _CONDITONS.push('5:F');
    if (_CHILD.item_5.includes('G')) _CONDITONS.push('5:G');
    if (_CHILD.item_5.includes('g')) _CONDITONS.push('5:g');
    if (_CHILD.item_5.includes('H')) _CONDITONS.push('5:H');
    if (_CHILD.item_5.includes('I')) _CONDITONS.push('5:I');

    return _CONDITONS;

}

function _GET_SERIE_COD(_CHILD) {
    let _CONDITONS = _IDENTIFY_SERIES(_CHILD);
    let _SERIES = [];
    for (var ITEM in _SERIES_MODULES_RELATION) {
        let isFounded = _SERIES_MODULES_RELATION[ITEM].every(ai => _CONDITONS.includes(ai));
        if (isFounded) _SERIES.push(ITEM)
    }
    return _SERIES;
}
function _GET_SERIE_STR(_CHILD) {
    let _SERIES = _GET_SERIE_COD(_CHILD);
    var COD_SERIES = require('../jsons/funCodes.json');
    let _SERIES_STR = [];
    for(var i = 0; i < _SERIES.length; i++){
        _SERIES_STR.push(COD_SERIES[_SERIES[i]])
    } 
    return _SERIES_STR;
}
function _GET_SUBSERIE_COD(_CHILD) {
    let _CONDITONS = _IDENTIFY_SERIES(_CHILD);
    let _SUBSERIES = [];
    for (var ITEM in _SUBSERIES_MODULES_RELATION) {
        let isFounded = false;
        if (_SUBSERIES_MODULES_RELATION[ITEM].join('') === _CONDITONS.join('')) isFounded = true;
        if (isFounded) _SUBSERIES.push(ITEM)
    }
    return _SUBSERIES;
}
function _GET_SUBSERIE_STR(_CHILD) {
    let _SERIES = _GET_SUBSERIE_COD(_CHILD);
    var COD_SERIES = require('../jsons/funCodes.json');
    let _SERIES_STR = [];
    for(var i = 0; i < _SERIES.length; i++){
        _SERIES_STR.push(COD_SERIES[_SERIES[i]])
    } 
    return _SERIES_STR;
}


function addDecimalPoints(num) {
    if(!num) return ''
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

module.exports = {
    formsParser1,
    dateParser_finalDate,
    dateParser_dateDiff,
};
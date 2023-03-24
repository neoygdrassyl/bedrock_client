import moment from 'moment'
import { infoCud } from '../jsons/vars'

export const SERIES_DOCS = {
    // i count = 86
    'GENERIC': {
        'DOCUMENTOS GENERALES': [{ n: 700, i: 0 }, { n: 803, i: 1 }, { n: 511, i: 2 }, { n: 512, i: 3 }, { n: 514, i: 4 }, { n: 513, i: 5 }, { n: 516, i: 6 }, { n: 517, i: 7 }, { n: 900, i: 8 },
        { n: 519, i: 9 }, { n: 535, i: 10 }, { n: 520, i: 11 }, { n: 536, i: 12 }, { n: 521, i: 13 }, { n: 522, i: 14 }, { n: 537, i: 15 }, { n: 523, i: 16 }, { n: 524, i: 17 }, { n: 538, i: 18 }, { n: 525, i: 19 }, { n: 526, i: 20 }, { n: 539, i: 21 }, { n: 527, i: 22 }, { n: 528, i: 23 }, { n: 540, i: 24 }, { n: 529, i: 25 }, { n: 530, i: 26 }, { n: 541, i: 27 }, { n: 531, i: 28 }, { n: 532, i: 29 }, { n: 542, i: 30 }, { n: 533, i: 31 }, { n: 534, i: 32 }, // PROF DOCS
        { n: 653, i: 33 }, { n: 6610, i: 34 }, { n: 6614, i: 35 }, { n: 906, i: 36 }, { n: 911, i: 37 }, { n: 820, i: 38 }, { n: 921, i: 39 }, { n: 912, i: 40 }, { n: 3222, i: 41 }, { n: 999, i: 42 }],
        'DOCUMENTOS EXPEDIDOS': [{ n: 996, i: 43 }, { n: 842, i: 44 }, { n: 400, i: 45 }, { n: 920, i: 46 }, { n: 854, i: 47 }, { n: 856, i: 48 }, { n: 855, i: 49 }, { n: 823, i: 50 }, { n: 824, i: 51 }, { n: 819, i: 52 }, { n: 821, i: 53 }, { n: 831, i: 54 }, { n: 827, i: 55 }, { n: 828, i: 56 }],
        'SOPORTE DE PAGO DE IMPUESTOS Y EXPENSAS': [{ n: 701, i: 57 }, { n: 702, i: 58 }, { n: 703, i: 59 }, { n: 705, i: 60 }, { n: 706, i: 61 }, { n: 707, i: 62 }],
        'LICENCIA': [{ n: 835, i: 63 }, { n: 837, i: 64 }, { n: 838, i: 65 }, { n: 844, i: 66 }, { n: 845, i: 67 }, { n: 857, i: 68 }, { n: 915, i: 69 }],
        'ANEXOS TECNICOS': [{ n: 997, i: 70 }, { n: 6601, i: 71 }, { n: 652, i: 72 }, { n: 6604, i: 73 }, { n: 6615, i: 74 }, { n: 6616, i: 86 }, { n: 686, i: 75 }, { n: 6602, i: 85 }, { n: 602, i: 76 }, { n: 6608, i: 77 }, { n: 916, i: 78 }, { n: 917, i: 79 }, { n: 6605, i: 80 }, { n: 918, i: 81 }, { n: 919, i: 82 }, { n: 998, i: 83 }, { n: 999, i: 84 }]
    },
    '1100-40.01': false,
    '1100-40.02': false,
    '1100-40.03': false,
    '1100-40.04': false,
    '1100-40.05': false,
    '1100-40.06': false,
    '1100-40.07': false,

    '1100-190.01': false,
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
        'DOCUMENTOS GENERALES': [{ n: 701, i: 0 }, { n: 803, i: 1 }, { n: 511, i: 2 }, { n: 512, i: 3 }, { n: 514, i: 4 }, { n: 513, i: 5 }, { n: 516, i: 6 }, { n: 517, i: 7 }, { n: 900, i: 8 }, { n: 519, i: 9 }, { n: 520, i: 10 }, { n: 6610, i: 11 }, { n: 6614, i: 12 }, { n: 906, i: 13 }, { n: 911, i: 14 }, { n: 820, i: 15 }, { n: 999, i: 16 }],
        'DOCUMENTOS EXPEDIDOS': [{ n: 819, i: 17 }, { n: 811, i: 18 }, { n: 812, i: 19 }, { n: 821, i: 20 }, { n: 823, i: 21 }, { n: 824, i: 22 }, { n: 831, i: 23 }, { n: 826, i: 24 }, { n: 835, i: 25 }, { n: 837, i: 26 }, { n: 838, i: 27 }, { n: 844, i: 28 }, { n: 845, i: 29 }, { n: 857, i: 30 }, { n: 915, i: 31 }],
        'ANEXOS TECNICOS': [{ n: 997, i: 32 }, { n: 916, i: 33 }, { n: 6605, i: 34 }, { n: 998, i: 35 }, { n: 996, i: 36 }, { n: 700, i: 37 }, { n: 842, i: 38 }, { n: 400, i: 39 }]

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
export const WORKER_NEEDED_FOR_MODULE = {
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
export const SERIES_MODULES_RELATION = {
    '1100-40': ['1:G,2:OA'],

    //'1100-70': [''],

    '1100-190': ['1:A', '1:B', '1:C', '1:D', '1:E',],

    '1100-200': ['1:G,2:C'],

    '1100-250': ['1:G,2:B'],

    '1100-260': ['1:D,1:F', '1:F'],

    '1100-270': ['1:G,2:D'],
}
export const SUBSERIES_MODULES_RELATION = {
    '1100-40.01': ['1:G', '2:OA', '2:COTAS'],
    '1100-40.02': ['1:G', '2:OA', '2:PH'],
    '1100-40.03': ['1:G', '2:OA', '2:TIERRA'],
    '1100-40.04': ['1:G', '2:OA', '2:PISCINA'],
    '1100-40.05': ['1:G', '2:OA', '2:PLANOS'],
    '1100-40.06': ['1:G', '2:OA', '2:BIENES'],
    '1100-40.07': ['1:G', '2:OA', '2:ESTRUCTURAL'],

    //'1100-70.01': [''],
    //'1100-70.02': [''],
    //'1100-70.03': [''],
    //'1100-70.04': [''],

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
    '1100-190.11': ['1:D', '5:B', '5:D'],
    '1100-190.12': ['1:D', '5:C', '5:D'],
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
    '1100-190.31': ['1:D', '5:B', '5:C', '5:D'],
    '1100-190.32': ['1:D', '5:D', '5:F', '5:G'],
    '1100-190.33': ['1:D', '5:B', '5:C', '5:D', '5:F'],
    '1100-190.34': ['1:D', '5:B', '5:C', '5:D', '5:g'],
    '1100-190.35': ['1:D', '5:B', '5:D', '5:F'],
    '1100-190.36': ['1:D', '5:B', '5:D', '5:F', '5:g'],
    '1100-190.37': ['1:D', '5:B', '5:D', '5:g'],
    '1100-190.38': ['1:D', '5:B', '5:C', '5:D', '5:F', '5:g'],

    '1100-250.01': ['1:G', '2:B'],
    '1100-250.02': ['1:G', '2:D'],

    '1100-260.00': ['1:F'],
    '1100-260.01': ['1:D', '1:F', '5:D'],
    '1100-260.02': ['1:D', '1:F', '5:B'],
    '1100-260.03': ['1:D', '1:F', '5:C'],
    '1100-260.04': ['1:D', '1:F', '5:F'],
    '1100-260.05': ['1:D', '1:F', '5:g'],
    '1100-260.06': ['1:D', '1:F', '5:D', '5:g'],
    '1100-260.07': ['1:D', '1:F', '5:B', '5:C', '5:D', '5:F', '5:g'],
    '1100-260.08': ['1:D', '1:F', '5:B', '5:F'],
    '1100-260.09': ['1:D', '1:F', '5:D', '5:F'],
    '1100-260.10': ['1:D', '1:F', '5:C', '5:F'],
    '1100-260.11': ['1:D', '1:F', '5:B', '5:g'],
    '1100-260.12': ['1:D', '1:F', '5:C', '5:g'],
    '1100-260.13': ['1:D', '1:F', '5:B', '5:D'],
    '1100-260.14': ['1:D', '1:F', '5:C', '5:D'],
    '1100-260.15': ['1:D', '1:F', '5:B', '5:C'],
    '1100-260.16': ['1:D', '1:F', '5:B', '5:D', '5:F'],
    '1100-260.17': ['1:D', '1:F', '5:D', '5:F', '5:g'],
    '1100-260.18': ['1:D', '1:F', '5:B', '5:C', '5:D'],
    '1100-260.19': ['1:D', '1:F', '5:B', '5:C', '5:D', '5:g'],
    '1100-260.20': ['1:D', '1:F', '5:C', '5:D', '5:F', '5:g'],
    '1100-260.21': ['1:D', '1:F', '5:B', '5:D', '5:g'],
    '1100-260.22': ['1:D', '1:F', '5:B', '5:D', '5:F', '5:g'],
    '1100-260.23': ['1:D', '1:F', '5:C', '5:D', '5:G'],
}

// RECIEVES AN OBJECT FUN 1 ONLY CARING ABOUT 5 OF ITS PROPERTIES
// RETURNS A STRING TRANSFORMING ALL THE INPUT VALUE INTO CONTEXTUALIZED INFORMATION
// IE A -> LICENCIA X

export const VR_DOCUMENTS_OF_INTEREST = {
    'law': ['511', '512', '513', '514', '516', '517', '518', '519', '520', '521', '522', '523', '524', '525', '526', '527', '528', '529', '530', '531', '532', '533', '534', '535', '536', '537', '538', '539', '540', '541', '542',
        '601', '602', '621', '622', '623', '624', '625', '626', '627',
        '630', '631', '632', '633', '634', '635', '636',
        '641', '642', '643',
        '651', '652', '653',
        '671', '672',
        '680', '681', '682', '683', '685', '685', '686', '6862', '688', '689',
        '6609', '6610', '6611', '6612', '6613', '6617', 
    ],
    'law2': ',511,512,513,514,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,601,602,621,622,623,624,625,626,627,630,631,632,633,634,635,636,641,642,643,651,652,653,671,672,680,681,682,683,685,685,686,6862,688,689,6609,6610,6611,6612,6613,6617,',
    'arc': ['687', '907', '909', '916', '917', '6603'],
    'eng': ['660a', '660b', '660c', '660d', '660e', '6601', '6602', '6604', '6605', '6607', '6608', '6614', '6615', '6616', '6618', '6619'],
}

export function formsParser1(object) {
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
    if (defaultValue && defaultValue != 'B') {
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
                textToParse.push(arrayHelper[i]);
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
                textToParse.push(arrayHelper[i]);
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

    var striing = textToParse.join(', ')
    return striing;
}


export function formsParser1_exlucde2(object) {
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
export function regexChecker_isPh(input, parser) {
    if (parser) return REGEX_MATCH_1100_40_02(formsParser1(input))
    return REGEX_MATCH_1100_40_02(input)
}
export function regexChecker_isOA(input) {
    let modalidad = input.tramite;
    let tipo = input.tipo;
    if (!modalidad) return false;
    if (!tipo) tipo = "";
    if (modalidad == 'B' || modalidad == 'D' || tipo.includes('G')) return true;
    return false;
}
export function regexChecker_isOA_2(input) {
    if (!input) return false;
    let modalidad = input.tramite;
    if (!modalidad) return false;
    let isPro = modalidad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") == 'prorroga';
    let tipo = input.tipo;
    if (!tipo) tipo = "";
    if (modalidad == 'B' || isPro) return true;
    return false;
}
export function regexChecker_isOA_3(input) {
    if (!input) return false;
    let modalidad = input.tramite;
    let tipo = input.tipo;
    if (!modalidad) return false;
    if (!tipo) tipo = "";
    if (modalidad == 'B' || modalidad == 'D') return true;
    return false;
}
export function regexChecker_movTierra(input) {
    return REGEX_MATCH_1100_40_03(input)
}
export function regexChecker_piscina(input) {
    return REGEX_MATCH_1100_40_04(input)
}
export function regexChecker_modPlano(input) {
    return REGEX_MATCH_1100_40_05(input)
}
export function regexChecker_cota(input) {
    return REGEX_MATCH_1100_40_01(input)
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
    let regex = /modificacion.*plano./i;
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
export function dateParser(date) {
    let con1 = date === false || date === null || date === undefined || date === '';
    if (con1) return ""
    const moment = require('moment');
    let esLocale = require('moment/locale/es');
    var momentLocale = moment(date).locale('es', esLocale);
    return momentLocale.format("LL")
}

// RECIEVES A SATR DATE FORMAT YYYY-MM-DD AND AN POSITIVE INTEGER
// RETURNS AN INTEGER STATING HOW MUCH TIME IN BUSSINES DAYS IS LEFT FOR THE startDate AND time + startDate TO BE EQUAL
export function dateParser_timeLeft(startDate, time) {
    let con1 = time === false || time === null || time === undefined;
    let con2 = startDate === false || startDate === null || startDate === undefined
    if (con1 || con2) return ""
    if (!checkDate(startDate)) return ""
    var moment = require('moment');
    var momentB = require('moment-business-days');
    const holydays = require("../jsons/holydaysmoment.json")
    momentB.updateLocale('co', holydays);
    let today = moment().format('YYYY-MM-DD');
    let endate = momentB(startDate, 'YYYY-MM-DD').businessAdd(time)._d;
    let diff = momentB(endate).businessDiff(moment(today), true);
    return diff;
}

// RECIEVES A SATR DATE FORMAT YYYY-MM-DD AND AN POSITIVE INTEGER
// RETURNS A DATE THAT IS EUQAL TO THE STARTING DATE PLUS THE NUMBER OF time ADDED AS BUSINESS DAYS
export function dateParser_finalDate(startDate, time) {
    let con1 = time === false || time === null || time === undefined || time === '';
    let con2 = startDate === false || startDate === null || startDate === undefined || startDate === '';
    if (con1 || con2) return ""
    if (!checkDate(startDate)) return ""
    let momentB = require('moment-business-days');
    let moment = require('moment');
    const holydays = require("../jsons/holydaysmoment.json")
    momentB.updateLocale('co', holydays);
    let endate = momentB(startDate, 'YYYY-MM-DD').businessAdd(time)._d;
    return moment(endate).format('YYYY-MM-DD');
}

// RECIEVES TWO DATES FORMAT YYYY-MM-DD
// RETURN THE DIFFERENCE IN BUSINESS DAYS BETWEEN THE TWO DATES
export function dateParser_dateDiff(dateA, dateB, momentDiff = false) {
    let con1 = dateA === false || dateA === null || dateA === undefined || dateA === '';
    let con2 = dateB === false || dateB === null || dateB === undefined || dateB === '';
    if (con1 || con2) return ""
    let momentB = require('moment-business-days');
    let moment = require('moment');
    const holydays = require("../jsons/holydaysmoment.json")
    momentB.updateLocale('co', holydays);
    var diff = momentB(dateA, 'YYYY-MM-DD').businessDiff(moment(dateB, 'YYYY-MM-DD'), momentDiff)
    return diff;
}

// RECIEVES A DATE FORMAT YYYY-MM-DD
// RETURNS AN INTEGER STATING THE NUMBERS OF BUSSINESS DAYS THAT HAS PASSED SINCE THAT DATE AND TODAY
export function dateParser_timePassed(date) {
    let con1 = date === false || date === null || date === undefined || date === '';
    if (con1) return ""
    let momentB = require('moment-business-days');
    let moment = require('moment');
    const holydays = require("../jsons/holydaysmoment.json")
    momentB.updateLocale('co', holydays);
    const today = moment().format('YYYY-MM-DD');
    var diff = momentB(date, 'YYYY-MM-DD').businessDiff(moment(today, 'YYYY-MM-DD'))
    return diff;
}

// RECIEVES A DATE FORMAT YYYY-MM-DD
// RETURNS AN INTEGER STATING THE NUMBERS OF YEARS THAT HAS PASSED SINCE THAT DATE AND TODAY
export function dateParser_yearsPassed(date) {
    let con1 = date === false || date === null || date === undefined || date === '';
    if (con1) return ""
    let moment = require('moment');
    const today = moment().format('YYYY-MM-DD');
    var diff = moment(today, 'YYYY-MM-DD').diff(date, 'years');
    return diff;
}

function checkDate(_date) {
    let moment = require('moment');
    const date = moment(_date).format('YYYY');
    if (date > 2010) return true;
    return false
}

// SERIES AND SUBSERIES IDENTIFIER
export function _IDENTIFY_SERIES(_CHILD_1, select = [1, 1, 1, 1, 1], isOA) {
    let _CONDITONS = [];
    let _CHILD = _CHILD_1;
    if ([_CHILD.item_1, _CHILD.item_2, _CHILD.item_3, _CHILD.item_4, _CHILD.item_5].some(ch => ch == null || ch == undefined)) return _CONDITONS;
    if (select[0]) {
        if (_CHILD.item_1.includes('A')) _CONDITONS.push('1:A');
        if (_CHILD.item_1.includes('B')) _CONDITONS.push('1:B');
        if (_CHILD.item_1.includes('C')) _CONDITONS.push('1:C');
        if (_CHILD.item_1.includes('D')) _CONDITONS.push('1:D');
        if (_CHILD.item_1.includes('E')) _CONDITONS.push('1:E');
        if (_CHILD.item_1.includes('F')) _CONDITONS.push('1:F');
        if (_CHILD.item_1.includes('G')) _CONDITONS.push('1:G');
    }

    if (select[1]) {
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
        if (REGEX_MATCH_1100_40_01(_CHILD.item_2) && isOA) _CONDITONS.push('2:COTAS');
        if (REGEX_MATCH_1100_40_02(_CHILD.item_2) && isOA) _CONDITONS.push('2:PH');
        if (REGEX_MATCH_1100_40_03(_CHILD.item_2) && isOA) _CONDITONS.push('2:TIERRA');
        if (REGEX_MATCH_1100_40_04(_CHILD.item_2) && isOA) _CONDITONS.push('2:PISCINA');
        if (REGEX_MATCH_1100_40_05(_CHILD.item_2) && isOA) _CONDITONS.push('2:PLANOS');
        if (REGEX_MATCH_1100_40_06(_CHILD.item_2) && isOA) _CONDITONS.push('2:BIENES');
        if (REGEX_MATCH_1100_40_07(_CHILD.item_2) && isOA) _CONDITONS.push('2:ESTRUCTURAL');
    }
    if (select[2]) {
        if (_CHILD.item_3 == 'A') _CONDITONS.push('3:A');
        if (_CHILD.item_3 == 'B') _CONDITONS.push('3:B');
        if (_CHILD.item_3 == 'C') _CONDITONS.push('3:C');
    }
    if (select[3]) {
        if (_CHILD.item_4 == 'A') _CONDITONS.push('4:A');
        if (_CHILD.item_4 == 'B') _CONDITONS.push('4:B');
        if (_CHILD.item_4 == 'C') _CONDITONS.push('4:C');
    }
    if (select[4]) {
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
    }
    return _CONDITONS;

}

export function _GET_SERIE_COD(_CHILD) {
    let _CONDITONS = _IDENTIFY_SERIES(_CHILD, [1, 0, 0, 0, 0]);
    let _SERIES = [];
    for (var ITEM in SERIES_MODULES_RELATION) {
        let isFounded = false;
        if (SERIES_MODULES_RELATION[ITEM].includes(_CONDITONS.join(','))) isFounded = true;
        if (isFounded) _SERIES.push(ITEM)
    }
    return _SERIES;
}
export function _GET_SERIE_STR(_CHILD) {
    let _SERIES = _GET_SERIE_COD(_CHILD);
    var COD_SERIES = require('../jsons/funCodes.json');
    let _SERIES_STR = [];
    for (var i = 0; i < _SERIES.length; i++) {
        _SERIES_STR.push(COD_SERIES[_SERIES[i]])
    }
    return _SERIES_STR;
}
export function _GET_SUBSERIE_COD(_CHILD) {
    let _CONDITONS = _IDENTIFY_SERIES(_CHILD, [1, 0, 1, 1, 1], true);
    let _SUBSERIES = [];
    for (var ITEM in SUBSERIES_MODULES_RELATION) {
        let isFounded = false;
        if (SUBSERIES_MODULES_RELATION[ITEM].join('') === _CONDITONS.join('')) isFounded = true;
        if (isFounded) _SUBSERIES.push(ITEM)
    }
    return _SUBSERIES;
    // 1100-70.01 1100-70.02 1100-70.03 1100-70.04
}
export function _GET_SUBSERIE_STR(_CHILD) {
    let _SERIES = _GET_SUBSERIE_COD(_CHILD);
    var COD_SERIES = require('../jsons/funCodes.json');
    let _SERIES_STR = [];
    for (var i = 0; i < _SERIES.length; i++) {
        _SERIES_STR.push(COD_SERIES[_SERIES[i]])
    }
    return _SERIES_STR;
}


export function addDecimalPoints(num) {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

export function _ADDRESS_SET_FULL(_DOMID, _FUN2) {
    let newAddress = [];
    newAddress.push(_FUN2.item_211);
    if (_FUN2.item_268) newAddress.push('manzana No. ' + _FUN2.item_268);
    if (_FUN2.item_264) newAddress.push('sector ' + _FUN2.item_264);
    if (_FUN2.item_266) newAddress.push('lote n° ' + _FUN2.item_266);
    if (_FUN2.item_261) newAddress.push('barrio ' + _FUN2.item_261);
    if (_FUN2.item_263) newAddress.push('comuna ' + _FUN2.item_263);
    if (_FUN2.item_265) newAddress.push('corregimiento ' + _FUN2.item_265);
    if (_FUN2.item_262) newAddress.push('vereda ' + _FUN2.item_262);

    document.getElementById(_DOMID).value = newAddress.join(', ');
}

export function getJSON(objec, field) {
    if (!objec) return false;
    let json = objec;
    let whileSafeBreaker = 0;
    while (!json[field]) {
        try {
            json = JSON.parse(json)
        } catch (error) {
            return false;
        }
        whileSafeBreaker++
        if (whileSafeBreaker == 10) return false;
    }
    return json[field]
}

export function getJSONFull(objec) {
    if (!objec) return {};
    let json = objec;
    let whileSafeBreaker = 0;
    while (typeof json !== 'object') {
        try {
            json = JSON.parse(json)
        } catch (error) {
            return false;
        }
        whileSafeBreaker++
        if (whileSafeBreaker == 10) return false;
    }
    return json
}

export function getJSON_Simple(objec) {
    let json = objec;
    let whileSafeBreaker = 0;
    while (typeof json !== 'object') {
        try {
            json = JSON.parse(json)
        } catch (error) {
            return false;
        }
        whileSafeBreaker++
        if (whileSafeBreaker == 10) return false;
    }
    return json
}

export function _SET_PRIORITY(_data, finalSort = false) {
    const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15, '0': 45 };
    let sortdList = [];
    let sortedList = _data.map((item, i) => {
        let days = {
            days_pay: dateParser_timePassed(item.clock_payment),
            days_ldf: dateParser_timePassed(item.clock_date),
            days_acta: dateParser_dateDiff(item.clock_date, item.clock_not_1 ?? item.clock_not_2),
            days_r1: dateParser_dateDiff(item.clock_date, item.clock_record_p1),
            priority: '',
        }



        let con1 = item.rec_review == null && item.rec_review_2 == null;
        let con2 = item.rec_review == 0 && (item.rec_review_2 != 1);
        let con3 = item.rec_review == 1 && (item.rec_review_2 == 0);
        let con4 = item.state == 5;
        let con5 = item.state == 1 || item.state == -1;
        if ((con1 || con2 || con3) && (con4 || con5)) {
            // PRIORITY
            let p_c = item.rec_review != 1
                ? item.clock_not_1 || item.clock_not_2
                    ? (item.clock_record_postpone ? 45 : 30) - Number(dateParser_timePassed(item.clock_not_1 || item.clock_not_2))
                    : (item.clock_record_postpone ? 45 : 30)
                : 0;
            let p_r = item.rec_review != 1
                ? (_fun_0_type_time[item.type] ?? 45) - days.days_acta
                : (_fun_0_type_time[item.type] ?? 45) - days.days_ldf ?? 0;

            let submit_dates_array = item.submit_dates ? item.submit_dates.split(';') : [];

            let lastVR = days.days_ldf || days.days_pay || 100;
            submit_dates_array.map(value => {
                let date = value.split(' ')[0];
                let days = dateParser_timePassed(date);
                if (days < lastVR) lastVR = days;
            })


            let ri = {
                days_j: null,
                check_j: null,
                days_a: null,
                check_a: null,
                days_e: null,
                check_e: null,
                check2_e: null,
            };
            let crate_ri_pairs = (dates, checks, index, checks2,) => {
                dates.map((date, i) => {
                    let days = dateParser_timePassed(date);
                    if (days) {
                        if (days < ri['days_' + index]) {
                            ri['days_' + index] = days;
                            ri['check_' + index] = checks[i]
                            if (checks2) ri['check2_' + index] = checks2[i]
                        } else if (!ri['days_' + index]) {
                            ri['days_' + index] = days;
                            ri['check_' + index] = checks[i]
                            if (checks2) ri['check2_' + index] = checks2[i]
                        }
                    }
                })
            }

            let pairs_date = [item.asign_law_date,]
            let pairs_check = [item.jur_review,];

            pairs_date.concat(item.clock_asign_law ? item.clock_asign_law.split(';') : [])
            pairs_check.concat(item.clock_review_law_c ? item.clock_review_law_c.split(';') : [])

            crate_ri_pairs(pairs_date, pairs_check, 'j');

            pairs_date = [item.asign_arc_date,]
            pairs_check = [item.arc_review,];

            pairs_date.concat(item.clock_asign_arc ? item.clock_asign_arc.split(';') : [])
            pairs_check.concat(item.clock_review_arc_c ? item.clock_review_arc_c.split(';') : [])

            crate_ri_pairs(pairs_date, pairs_check, 'a');

            pairs_date = [item.asign_eng_date,];
            pairs_check = [item.eng_review,];
            let pairs_check2 = [item.eng_review_2,];

            let engChecks2 = item.clock_review_arc_c ? item.clock_review_arc_c.split(';') : []

            pairs_date.concat(item.clock_asign_eng ? item.clock_asign_eng.split(';') : [])
            engChecks2.map(value => {
                let check1 = value.split(',')[0];
                let check2 = value.split(',')[1];

                pairs_check.push(check1);
                pairs_check2.push(check2);
            })

            crate_ri_pairs(pairs_date, pairs_check, 'e', pairs_check2);


            let check_VR_n_RI = () => {
                let lvr = lastVR;
                let con_vr_1 = lvr < ri.days_j && ri.check_j != 1;
                let con_vr_2 = lvr < ri.days_a && ri.check_a != 1;
                let con_vr_3 = lvr < ri.days_e && ri.check_e != 1 && ri.check2_e != 1;
                let cons = [];
                if (ri.days_j != null) cons.push(con_vr_1)
                if (ri.days_a != null) cons.push(con_vr_2)
                if (ri.days_e != null) cons.push(con_vr_3)
                let finalCon = cons.some(value => value)
                return finalCon;
            }

            let priority = 0;
            let con1 = item.state == 1 || item.state == -1;
            let con2 = item.rec_review == 0 && item.rec_review_2 != 1;
            let c1 = 100 * (con1 ? 1 : 0); // BOOTS START LDF/INC
            let c2 = (_fun_0_type_time[item.type] ?? 45); // DAYS FROM CATEGORY
            let c3 = p_c; // TIME CORRECIOTION
            let c4 = (days.days_acta || days.days_ldf || 0); // DAYS SINCE LDF AND ACTA 1 NOT
            let c5 = lastVR // DAYS SINCE LAST DOCUMENTS
            let c6 = check_VR_n_RI() ? 0 : 20; // ASIGN INDEX, SEARCH IF AN ASIGN WAS GIVEN AFTER NEW DOCS WERE ADDED
            // *1 IF IN CORRECTIONS, ELSE *0
            // *2 IF DOCUMENTS ARE CORR, ELSE *1

            // pr = (c2 - c4)
            priority = 0 + c1 + c3 + (c2 - c4) + c5 + c6;
            let rank = 5;
            if (priority < 0) rank = 1;
            if (priority >= 0 && priority < 25) rank = 2;
            if (priority >= 25 && priority < 50) rank = 3;
            if (priority >= 50) rank = 4;
            if (item.state < 5 && item.state >= -1) rank = 5;

            days = {
                ...days,
                priority_index: priority,
                priority_rank: rank,
                constants: [c1, c2, c3, c4, c5, c6]
            }

            sortdList.push({
                i: i,
                ...days,
            })

        }

        return { ...item, ...days, }
    })

    sortdList.sort((value1, value2) => {
        let v1c = Number(value1.priority_index || 0);
        let v2c = Number(value2.priority_index || 0);
        return v2c - v1c;
    })

    sortdList.map((value, i) => {
        sortedList[value.i].priority = sortdList.length - i;
    })

    if (finalSort) sortedList.sort((value1, value2) => {
        if (!value1.priority_index) return 9999
        if (!value2.priority_index) return 0
        let v1c = Number(value1.priority_index);
        let v2c = Number(value2.priority_index);
        return v1c - v2c;
    })


    return sortedList;
}

export function _MANAGE_IDS(_data, _type) {
    let new_id = _data;
    let concecutive;
    if (_type == 'end') {
        if (!new_id) new_id = `${infoCud.serials.end}${moment().format('YY')}-0000`
        concecutive = new_id.split('-')[1];
        concecutive = Number(concecutive) + 1
        if (concecutive < 1000) concecutive = "0" + concecutive
        if (concecutive < 100) concecutive = "0" + concecutive
        if (concecutive < 10) concecutive = "0" + concecutive
        new_id = new_id.split('-')[0] + "-" + concecutive
    }

    return new_id;
}
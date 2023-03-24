const _FUN_1_1 = ['A. LICENCIA DE URBANIZACION',
    'B. LICENCIA DE PARCELACION',
    'C. LICENCIA DE SUBDIVISION',
    'D. LICENCIA DE CONSTRUCCION',
    'E. INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
    'F. RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION',
    'G. OTRAS ACTUACIONES'];

const _FUN_1_1a = ['LICENCIA DE URBANIZACION',
    'LICENCIA DE PARCELACION',
    'LICENCIA DE SUBDIVISION',
    'LICENCIA DE CONSTRUCCION',
    'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
    'RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION',
    'OTRAS ACTUACIONES'];

const _FUN_1_1_HELPER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const _FUN_1_2 = ['A. INICIAL',
    'B. PRORROGA',
    'C. MODIFICACION DE LICENCIA VIGENTE',
    'D. REVALIDACION'];
const _FUN_1_2a = ['INICIAL',
    'PRORROGA',
    'MODIFICACION DE LICENCIA VIGENTE',
    'REVALIDACION'];

const _FUN_1_2_HELPER = ['A', 'B', 'C', 'D'];

const _FUN_1_3 = ['A. DESARROLLO',
    'B. SANEAMIENTO',
    'C. RECUPERACION'];
const _FUN_1_3a = ['DESARROLLO',
    'SANEAMIENTO',
    'RECUPERACION'];

const _FUN_1_3_HELPER = ['A', 'B', 'C'];

const _FUN_1_4 = ['A. SUBDIVISION RURAL',
    'B. SUBDIVISION URBANA',
    'C. RELOTEO'];
const _FUN_1_4a = ['SUBDIVISION RURAL',
    'SUBDIVISION URBANA',
    'RELOTEO'];

const _FUN_1_4_HELPER = ['A', 'B', 'C'];

const _FUN_1_5 = ['A. OBRA NUEVA',
    'B. AMPLIACION',
    'C. ADECUACION',
    'D. MODIFICACION',
    'E. RESTAURACION',
    'F. REFORZAMIENTO ESTRUCTURAL',
    'G.1 DEMOLICION TOTAL',
    'G.2 DEMOLICION PARCIAL',
    'H. RECONSTRUCCION',
    'I. CERRAMIENTO'];
const _FUN_1_5a = ['OBRA NUEVA',
    'AMPLIACION',
    'ADECUACION',
    'MODIFICACION',
    'RESTAURACION',
    'REFORZAMIENTO ESTRUCTURAL',
    'DEMOLICION TOTAL',
    'DEMOLICION PARCIAL',
    'RECONSTRUCCION',
    'CERRAMIENTO'];

const _FUN_1_5_HELPER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'g', 'H', 'I'];

const _FUN_1_6 = ['A. VIVIENDA',
    'B. COMERCIO Y/O SERVICIOS',
    'C. INSTITUCIONAL',
    'D. INDUSTRIAL'];

const _FUN_1_6_SIMPLYFY = ['VIVIENDA',
    'COMERCIO Y/O SERVICIOS',
    'INSTITUCIONAL',
    'INDUSTRIAL'];

const _FUN_1_6_HELPER = ['A', 'B', 'C', 'D'];

const _FUN_1_7 = ['A. MENOR A 2000 m2',
    'B. IGUAL O MAYOR A 2000 m2',
    'C. ALCANZA O SUPERA MEDIANTE AMPLIACION LOS 2000 m2'];

const _FUN_1_7_HELPER = ['A', 'B', 'C'];

const _FUN_1_8 = ['A. VIP',
    'B. VIS',
    'C. NO VIS'];
const _FUN_1_8a = ['VIP',
    'VIS',
    'NO VIS'];

const _FUN_1_8_HELPER = ['A', 'B', 'C'];

const _FUN_1_9 = ['A. SI',
    'B. NO'];

const _FUN_1_9_HELPER = ['A', 'B'];

const _FUN_1_101 = ['A. MEDIDAS PASIVAS',
    'B. MEDIDAS ACTIVAS',
    'C. MEDIDAS ACTIVAS Y PASIVAS'];

const _FUN_1_101_HELPER = ['A', 'B', 'C'];

const _FUN_1_102 = ['A. FRIO',
    'B. TEMPLADO',
    'C. CALIDO SECO',
    'D. CALIDO HUMEDO'];

const _FUN_1_102_HELPER = ['A', 'B', 'C', 'D'];

const _FUN_2_4 = ['A. URBANO',
    'B. RURAL',
    'C. DE EXPANSION'];
const _FUN_2_4a = ['URBANO',
    'RURAL',
    'DE EXPANSION'];

const _FUN_2_4_HELPER = ['A', 'B', 'C'];

const _FUN_2_5 = ['A. PLANO DE LOTEO',
    'B. PLANO TOPOGRAFICO'];

const _FUN_2_5_HELPER = ['A', 'B'];


// 1.1 CAN BE MULTIPLE
export const _FUN_1_PARSER = (_ARRAY, noLetters) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalArray = []
    var _finalStr = ""
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_1_HELPER.length; j++) {
            if (_FUN_1_1_HELPER[j] == _defaultValue[i]) {
                if (noLetters) _finalArray.push(_FUN_1_1a[j]);
                else _finalArray.push(_FUN_1_1[j]);
            }
        }
    }
    return _finalStr = _finalArray.join();
}

// 1.2 CAN BE OPTIONS && CAN BE EMPTY STRING
export const _FUN_2_PARSER = (_ARRAY, noLetters) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_2_HELPER.length; j++) {
            if (_FUN_1_2_HELPER[j] == _defaultValue) {
                if (noLetters) _finalStr = _FUN_1_2a[j];
                else _finalStr = _FUN_1_2[j];
                break;
            }
        }
    }
    return _finalStr;
}

//  1.3 CAN BE EMPTY STRING
export const _FUN_3_PARSER = (_ARRAY, noLetters) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_3_HELPER.length; j++) {
            if (_FUN_1_3_HELPER[j] == _defaultValue[i]) {
                if (noLetters) _finalStr = _FUN_1_3a[j];
                else _finalStr = _FUN_1_3[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 1.4 CAN BE EMPTY STRING
export const _FUN_4_PARSER = (_ARRAY, noLetters) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_4_HELPER.length; j++) {
            if (_FUN_1_4_HELPER[j] == _defaultValue[i]) {
                if (noLetters) _finalStr = _FUN_1_4a[j];
                else _finalStr = _FUN_1_4[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 1.5 CAN BE EMPTY STRING && CAN BE MULTILPLE
export const _FUN_5_PARSER = (_ARRAY, noLetters) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalArray = []
    var _finalStr = ""
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_5_HELPER.length; j++) {
            if (_FUN_1_5_HELPER[j] == _defaultValue[i]) {
                if (noLetters) _finalArray.push(_FUN_1_5a[j]);
                else _finalArray.push(_FUN_1_5[j]);
            }
        }
    }
    return _finalStr = _finalArray.join(', ');
}

// 1.6 CAN BE MULTILPLE && CAN BE OTHERS && CAN BE EMPTY STRING
export const _FUN_6_PARSER = (_ARRAY, useSimplyfy) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalArray = []
    var flag = false;
    var _finalStr = ""
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_6_HELPER.length; j++) {
            if (_FUN_1_6_HELPER[j] == _defaultValue[i]) {
                _finalArray.push(useSimplyfy ? _FUN_1_6_SIMPLYFY[j] : _FUN_1_6[j]);
                flag = true;
            }
        }
    }
    if (!flag) {
        _finalArray.push(_defaultValue)
    }
    return _finalStr = _finalArray.join(', ');
}

// 1.7 CAN BE EMPTY STRING
export const _FUN_7_PARSER = (_ARRAY) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_7_HELPER.length; j++) {
            if (_FUN_1_7_HELPER[j] == _defaultValue[i]) {
                _finalStr = _FUN_1_7[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 1.8 CAN BE EMPTY STRING
export const _FUN_8_PARSER = (_ARRAY, noLetters) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_8_HELPER.length; j++) {
            if (_FUN_1_8_HELPER[j] == _defaultValue[i]) {
                if (noLetters) _finalStr = _FUN_1_8a[j];
                else _finalStr = _FUN_1_8[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 1.9 CAN BE EMPTY STRING
export const _FUN_9_PARSER = (_ARRAY) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_9_HELPER.length; j++) {
            if (_FUN_1_9_HELPER[j] == _defaultValue[i]) {
                _finalStr = _FUN_1_9[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 1.101 CAN BE EMPTY STRING
export const _FUN_101_PARSER = (_ARRAY) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_101_HELPER.length; j++) {
            if (_FUN_1_101_HELPER[j] == _defaultValue[i]) {
                _finalStr = _FUN_1_101[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 1.102 CAN BE EMPTY STRING && CAN BE OTHERS
export const _FUN_102_PARSER = (_ARRAY) => {
    if (!_ARRAY) return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_1_102_HELPER.length; j++) {
            if (_FUN_1_102_HELPER[j] == _defaultValue[i]) {
                _finalStr = _FUN_1_102[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 2.4 CAN BE EMPTY STRING && CAN BE OTHERS
export const _FUN_24_PARSER = (_ARRAY, noLetters) => {
    if (!_ARRAY || _ARRAY == 'null') return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_2_4_HELPER.length; j++) {
            if (_FUN_2_4_HELPER[j] == _defaultValue[i]) {
                if (noLetters) _finalStr = _FUN_2_4a[j];
                else _finalStr = _FUN_2_4[j];
                break;
            }
        }
    }
    return _finalStr;
}

// 2.5 CAN HAVE OTHER OPTIONS
export const _FUN_25_PARSER = (_ARRAY) => {
    if (!_ARRAY || _ARRAY == 'null') return ""
    var _defaultValue = _ARRAY
    var _finalStr = _defaultValue;
    for (var i = 0; i < _defaultValue.length; i++) {
        for (var j = 0; j < _FUN_2_5_HELPER.length; j++) {
            if (_FUN_2_5_HELPER[j] == _defaultValue[i]) {
                _finalStr = _FUN_2_5[j];
                break;
            }
        }
    }
    return _finalStr;
}
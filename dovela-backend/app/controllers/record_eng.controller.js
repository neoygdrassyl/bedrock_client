const db = require("../models");
const ENG = db.record_eng;
const STEP = db.record_eng_step;
const SIS = db.record_eng_sismic;
const REW = db.record_eng_review;

const FUN_0 = db.fun_0;
const FUN_1 = db.fun_1;
const FUN_2 = db.fun_2;
const FUN_3 = db.fun_3;
const FUN_51 = db.fun_51;
const FUN_52 = db.fun_52;
const FUN_53 = db.fun_53;
const FUN_R = db.fun_r;
const FUN_LAW = db.fun_law;
const FUN_CLOCK = db.fun_clock;

const RR = db.record_review;

const Op = db.Sequelize.Op; 1
const moment = require('moment');
const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");
const curaduriaInfo = require('../config/curaduria.json')
const typeParse = require("../config/typeParse");

const CARGA_VIVA_USOS = [
    {
        i: 1, name: 'RESIDENCIAL Y PARQUEADEROS', usos: [
            { i: 0, name: 'Cuartos', default: 1.8 },
            { i: 1, name: 'Balcones', default: 5.0 },
            { i: 2, name: 'Escaleras', default: 3.0 },
            { i: 3, name: 'Parqueaderos', default: 2.5 },
            { i: 4, name: 'Cubierta', default: 0.5 },
        ]
    },
    {
        i: 2, name: 'REUNIÓN', usos: [
            { i: 0, name: 'Silleteria fija', default: 3.0 },
            { i: 1, name: 'Silleteria móvil', default: 5.0 },
            { i: 2, name: 'Gimnacios', default: 5.0 },
            { i: 3, name: 'Vestibulos', default: 5.0 },
            { i: 4, name: 'Áreas recreativas', default: 5.0 },
            { i: 5, name: 'Plataformas', default: 5.0 },
            { i: 6, name: 'Escenarios', default: 7.5 },
        ]
    },
    {
        i: 3, name: 'INSTITUCIONAL', usos: [
            { i: 0, name: 'Cuartos de cirugía, laboratorios', default: 4.0 },
            { i: 1, name: 'Cuartos privados', default: 2.0 },
            { i: 2, name: 'Corredores y escaleras', default: 5.0 },
        ]
    },
    {
        i: 4, name: 'OFICINAS', usos: [
            { i: 0, name: 'Corredores y escaleras', default: 3.0 },
            { i: 1, name: 'Oficinas', default: 2.0 },
            { i: 2, name: 'Restaurantes', default: 5.0 },
        ]
    },
    {
        i: 5, name: 'EDUCATIVOS', usos: [
            { i: 0, name: 'Salones de clase', default: 2.0 },
            { i: 1, name: 'Corredores y escaleras', default: 5.0 },
            { i: 2, name: 'Bibliotecas', default: null },
            { i: 3, name: 'Salonesd de lectura', default: 2.0 },
            { i: 4, name: 'Estanterías', default: 7.0 },
        ]
    },
    {
        i: 6, name: 'FÁBRICAS', usos: [
            { i: 0, name: 'Industrias livianas', default: 5.0 },
            { i: 1, name: 'Industrias pesadas', default: 10.0 },
        ]
    },
    {
        i: 7, name: 'COMERCIO', usos: [
            { i: 0, name: 'Minorista', default: 5.0 },
            { i: 1, name: 'Mayorista', default: 6.0 },
        ]
    },
    {
        i: 8, name: 'ALMACIENAMIENTO', usos: [
            { i: 0, name: 'Liviano', default: 6.0 },
            { i: 1, name: 'Mayorista', default: 12.0 },
        ]
    },
    {
        i: 9, name: 'GARAJES', usos: [
            { i: 0, name: 'Automoviles de pasajeros', default: 2.5 },
            { i: 1, name: 'capacidad de carga hasta 2ton', default: 5.0 },
        ]
    },
    {
        i: 10, name: 'COLISEOS Y ESTADIOS', usos: [
            { i: 0, name: 'Graderias', default: 5.0 },
            { i: 1, name: 'Escaleras', default: 5.0 },
        ]
    },
    {
        i: 0, name: 'NA', usos: []
    },
];


// POST
exports.create = (req, res) => {

    const fun0Id = (req.body.fun0Id ? req.body.fun0Id : res.send('NOT A REAL ID'));

    const object = {
        fun0Id: fun0Id,
        id_public: req.body.id_public ? req.body.id_public : null,
        version: req.body.version ? req.body.version : null,
        worker_id: (req.body.worker_id ? req.body.worker_id : null),
        date_asign: (req.body.date_asign ? req.body.date_asign : null),
        worker_prev: (req.body.worker_prev ? req.body.worker_prev : null),
        worker_name: (req.body.worker_name ? req.body.worker_name : null),
    };

    ENG.create(object)
        .then(data => {
            res.send('OK');
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while executing CREATE."
            });
        });
};
exports.create_step = (req, res) => {
    const recordEngId = (req.body.recordEngId ? req.body.recordEngId : res.send('NOT A REAL ID'));

    const object = {
        recordEngId: recordEngId,
        id_public: req.body.id_public ? req.body.id_public : null,
        version: req.body.version ? req.body.version : null,
        check: req.body.check ? req.body.check : null,
        value: req.body.value ? req.body.value : null,
        json: req.body.json ? req.body.json : null,
    };

    // Create
    STEP.create(object)
        .then(data => {
            res.send('OK');
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while executing CREATE."
            });
        });
};
exports.create_sis = (req, res) => {
    const recordEngId = (req.body.recordEngId ? req.body.recordEngId : res.send('NOT A REAL ID'));

    const object = {
        recordEngId: recordEngId,
        name: req.body.name ? req.body.name : null,
        height: req.body.height ? req.body.height : null,
        area: req.body.area ? req.body.area : null,
        esca: req.body.esca ? req.body.esca : null,
        pos: req.body.pos ? req.body.pos : null,
        denplac: req.body.denplac ? req.body.denplac : null,
        viga: req.body.viga ? req.body.viga : null,
        column: req.body.column ? req.body.column : null,
    };

    // Create
    SIS.create(object)
        .then(data => {
            res.send('OK');
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while executing CREATE."
            });
        });
};

exports.create_xsis = (req, res) => {
    const recordEngId = (req.body.recordEngId ? req.body.recordEngId : res.send('NOT A REAL ID'));
    const pos = (req.body.pos ? req.body.pos : res.send('NOT pos'));
    const x = (req.body.x ? req.body.x : res.send('NOT x'));
    const op = (req.body.op ? req.body.op : res.send('NOT op'));
    const sort = (req.body.sort ? req.body.sort : res.send('NOT sort'));
    const copy = (req.body.copy == '1' ? true : false);

    SIS.findAll({
        where: { recordEngId: recordEngId },
        order: [['pos', sort]],
    }
    ).then(data => {
        var newData = data;

        var newSortedArray = [];
        for (let i = 0; i < newData.length; i++) {
            const element = newData[i];
            newSortedArray.push(element.pos)
        }
        const indexPos = newSortedArray.indexOf(Number(pos))
        const checkIndex = indexPos + 1 + Number(op);


        var y;
        if (copy) {
            let copyObject = newData[indexPos];
            if (op == '-1') {
                y = indexPos - x;
                if (y < 0) y = 0;
                for (let i = indexPos; i >= y; i--) {
                    if (newData[i]) {
                        newData[i].name = copyObject.name;
                        newData[i].height = copyObject.height;
                        newData[i].area = copyObject.area;
                        newData[i].esca = copyObject.esca;
                        newData[i].denplac = copyObject.denplac;
                        newData[i].viga = copyObject.viga;
                        newData[i].column = copyObject.column ? (((copyObject.column))) : null;
                    }
                }
            } else {
                y = indexPos + Number(x);
                if (y > newData.length) y = newData.length;
                for (let i = indexPos; i <= y; i++) {
                    if (newData[i]) {
                        newData[i].name = copyObject.name;
                        newData[i].height = copyObject.height;
                        newData[i].area = copyObject.area;
                        newData[i].esca = copyObject.esca;
                        newData[i].denplac = copyObject.denplac;
                        newData[i].viga = copyObject.viga;
                        newData[i].column = copyObject.column ? (((copyObject.column))) : null;
                    }
                }
            }
        } else {
            for (let i = 0; i < x; i++) {
                let newItem = { recordEngId: recordEngId };
                if (checkIndex < 0) newData.push(newItem)
                else if (checkIndex > newData.length) newData.splice(-1, 0, newItem);
                else newData.splice(checkIndex, 0, newItem);
            }
        }

        for (let i = 0; i < newData.length; i++) {
            if (sort == 'DESC') newData[i]['pos'] = newData.length - Number(i);
            else newData[i]['pos'] = Number(i) + 1;
        }

        //res.send(newData);
        createAndUpdate(newData)
    })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving ALL DATA."
            });
        });


    function createAndUpdate(objects) {
        for (let i = 0; i < objects.length; i++) {
            const element = objects[i];
            var editObject = {
                pos: element.pos,
                name: element.name,
                height: element.height,
                area: element.area,
                esca: element.esca,
                denplac: element.denplac,
                viga: element.viga,
                column: element.column ? JSON.parse(element.column) : null,
            }
            if (element.id) SIS.update(editObject, { where: { id: element.id } }).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });
            else SIS.create(element).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });
        }
        res.send('OK');
    }




};

exports.create_review = (req, res) => {

    const recordEngId = (req.body.recordEngId ? req.body.recordEngId : res.send('NOT A REAL ID'));


    const object = {
        recordEngId: recordEngId,
        version: req.body.version ? req.body.version : 1,
        check: req.body.check ? req.body.check : null,
        check_2: req.body.check_2 ? req.body.check_2 : null,
        check_3: req.body.check_3 ? req.body.check_3 : null,
        date: req.body.date ? req.body.date : null,
        desc: req.body.desc ? req.body.desc : null,
        detail: req.body.detail ? req.body.detail : null,
        detail_2: req.body.detail_2 ? req.body.detail_2 : null,
        worker_id: req.body.worker_id ? req.body.worker_id : null,
        worker_name: req.body.worker_name ? req.body.worker_name : null,
        check_context: req.body.check_context ? req.body.check_context : null,
        check_2_cotext: req.body.check_2_cotext ? req.body.check_2_cotext : null,
        check_3_cotext: req.body.check_3_cotext ? req.body.check_3_cotext : null,
        detail_3: req.body.detail_3 ? req.body.detail_3 : null,
        detail_4: req.body.detail_4 ? req.body.detail_4 : null,
    };

    REW.create(object)
        .then(data => {
            res.send('OK');
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while executing CREATE."
            });
        });
};

// GET.
exports.findAll = (req, res) => {
    ENG.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving ALL DATA."
            });
        });
};
exports.findIdRelated = (req, res) => {
    const _id_related = req.params.id;
    ENG.findAll({
        include: [STEP, { model: SIS, order: [['pos', 'DESC']] }, REW],
        where: { fun0Id: _id_related },
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving ALL DATA."
            });
        });
};

// GET BY ID
exports.findOne = (req, res) => {
    const id = req.params.id;
    ENG.findByPk(id, { include: [STEP, SIS, REW] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving DATA with ID=" + id
            });
        });
};

exports.findSingle = (req, res) => {
    const _id = req.params.id;
    ENG.findAll({
        include: [STEP, SIS, REW],
        where: { fun0Id: _id }
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving ALL DATA."
            });
        });
};

// PUT
exports.update = (req, res) => {
    const id = req.params.id;
    ENG.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.update_step = (req, res) => {
    const id = req.params.id;

    STEP.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.update_sis = (req, res) => {
    const id = req.params.id;
    SIS.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })

};
exports.update_review = (req, res) => {
    const id = req.params.id;
    REW.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })

};

// DELETE BY ID
exports.delete = (req, res) => {
    res.json({ message: "NOT IMPLEMENTED" });
};
exports.delete_sis = (req, res) => {
    const id = req.params.id;
    const sort = req.params.sort;
    const recordEngId = (req.params.recordEngId ? req.params.recordEngId : res.send('NOT A REAL ID'));
    SIS.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                loadAllSorted();
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })

    function loadAllSorted() {
        SIS.findAll({
            where: { recordEngId: recordEngId },
            order: [['pos', sort]],
        }
        ).then(data => {
            var newData = data;
            if (sort == 'DESC') {
                for (let i = 0; i < newData.length; i++) {
                    newData[i]['pos'] = newData.length - Number(i);
                }
            } else {
                for (let i = 0; i < newData.length; i++) {
                    newData[i]['pos'] = Number(i) + 1;
                }
            }

            //res.send(newData);
            createAndUpdate(newData)
        })
    }


    function createAndUpdate(objects) {
        for (let i = 0; i < objects.length; i++) {
            const element = objects[i];
            if (element.id) SIS.update({ pos: element.pos }, { where: { id: element.id } }).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });
            else SIS.create(element).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });
        }
        res.send('OK');
    }
};

// DELETE ALL
exports.deleteAll = (req, res) => {
    res.json({ message: "NOT IMPLEMENTED" });
};



exports.pdfgen = (req, res) => {
    var _DATA = {
        id: (req.body.id != 'null' ? req.body.id : 0),
        version: 1,
        type_rev: req.body.type_rev ? req.body.type_rev : 1,
    }

    FUN_0.findOne({
        include:
            [RR,
                {
                    model: ENG, include: [
                        { model: SIS, required: false, },
                        { model: STEP, where: { version: _DATA.version }, required: false, },
                        { model: REW, where: { version: _DATA.version }, required: false, },
                    ],
                    where: { version: _DATA.version },
                    required: false,
                },
                { model: FUN_1, where: { version: _DATA.version }, required: false, },
                //                FUN_2,
                //                FUN_3,
                //                FUN_51,
                { model: FUN_52, required: false, },
                { model: FUN_53, where: { version: _DATA.version }, required: false, },
                //                { model: FUN_R, where: { version: _DATA.version } },
                //                FUN_LAW
            ],
        where: { id: _DATA.id, }
    })
        .then(data => {
            let DATA = data;
            DATA.rew = {
                r_worker: req.body.r_worker ? req.body.r_worker : '',
                r_date: req.body.r_date ? req.body.r_date : '',
                r_pending: req.body.r_engc_pending === 'true' ? 1 : 0,

                r_check: req.body.r_check ? req.body.r_check : 'NO VIABLE',
                r_check_2: req.body.r_check_2 ? req.body.r_check_2 : 'NO VIABLE',
                r_check_3: req.body.r_check_3 ? req.body.r_check_3 : 'NO VIABLE',

                r_check_c: req.body.r_check_c ? req.body.r_check_c : '',
                r_check_2_c: req.body.r_check_2_c ? req.body.r_check_2_c : '',
                r_check_3_c: req.body.r_check_3_c ? req.body.r_check_3_c : '',

            };
            DATA.header = {
                use: (req.body.header === '1' ? true : req.body.header === '0' ? false : true),
            };
            DATA.recorc_rev = DATA.record_review;
            DATA.type_rev = _DATA.type_rev;
            _continue_funClock(DATA);
        })
        .catch(err => {

            res.status(500).send({
                message: err.message
            });
        });


    function _continue_funClock(DATA) {
        FUN_CLOCK.findAll({
            where: { fun0Id: _DATA.id, }
        })
            .then(data => {
                DATA.fun_clocks = data
                pdfCreate(DATA);
                setTimeout(() => {
                    res.send('OK');
                }, 1000);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    }
};

function pdfCreate(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LEGAL',
        margins: {
            top: 128,
            bottom: 56,
            left: 56,
            right: 54
        },
        bufferPages: true,
    });
    doc.pipe(fs.createWriteStream('./docs/public/output_recorwd_eng.pdf'));
    PDFGEN_ENG_RECORD(_DATA, doc);
    pdfSupport.setHeader(doc, { title: 'INFORME ESTRUCTURAL', size: 13, icon: true, id_public: _DATA ? _DATA.id_public : '', header: _DATA.header.use })
    doc.end();
    return true;
}


exports.PDFGEN_ENG_RECORD_EXP = (_DATA, doc, simple) => {
    PDFGEN_ENG_RECORD(_DATA, doc, simple)
}
function PDFGEN_ENG_RECORD(_DATA, doc, simple) {

    const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
    //const fun_2 = _DATA ? _DATA.fun_2 ? _DATA.fun_2 : {} : {};
    //const fun_3 = _DATA ? _DATA.fun_3s : [];
    //const fun_51 = _DATA ? _DATA.fun_51s : [];
    const fun_52 = _DATA ? _DATA.fun_52s : [];
    const fun_53 = _DATA ? _DATA.fun_53s ? _DATA.fun_53s.length > 0 ? _DATA.fun_53s[0] : false : false : false;
    //const fun_law = _DATA ? _DATA.fun_law ? _DATA.fun_law : false : false;
    //const fun_r = _DATA ? _DATA.fun_rs ? _DATA.fun_rs.length > 0 ? _DATA.fun_rs[0] : false : false : false;
    const fun_clocks = _DATA ? _DATA.fun_clocks : [];

    const record_rev = _DATA ? _DATA.recorc_rev ? _DATA.recorc_rev : {} : {};

    const record_eng = _DATA ? _DATA.record_eng : false;
    const record_eng_steps = record_eng ? record_eng.record_eng_steps ? record_eng.record_eng_steps : [] : [];
    var record_eng_sis = record_eng ? record_eng.record_eng_sismics ? record_eng.record_eng_sismics : [] : [];
    const record_eng_review = record_eng ? record_eng.record_eng_reviews ? record_eng.record_eng_reviews[0] : false : false;
    const CATEGORY = record_eng ? record_eng.category ? record_eng.category : null : null;
    const SUBCATEGORIES = record_eng ? (record_eng.subcategory ? record_eng.subcategory.split(';') : []) : [];
    const version = _DATA ? _DATA.version : 1;
    const checkValue = ['NO CUMPLE', 'CUMPLE', 'N/A'];
    const checkValueAlt = ['NO', 'SI', 'N/A'];
    const _fun_0_type = { '0': 'NC', 'i': 'I', 'ii': "II", 'iii': "III", 'iv': "IV", 'oa': "OA" }
    const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
    const validateCheck = (check, alt = false) => {
        let validateString = [];
        if (alt) validateString = checkValueAlt;
        else validateString = checkValue;

        if (validateString[check]) return validateString[check];
        return validateString[1]
    }
    const H2221 = [
        'Nombre, plano de localización, objetivo del estudio, descripción general, sistema estructural y evaluación de cargas.',
        'Resumen del reconocimiento de campo, morfología del terreno, origen geológico, características físico mecánicas y descripción de los niveles freáticos o aguas subterráneas',
        'De cada unidad geológica o de suelo, se hará su identificación, su espesor, su distribución y los parámetros obtenidos en las pruebas y ensayos de campo',
        'Cumple el número de unidades de construcción a la cual se le realiza la exploración geotécnica',
        '¿Se presenta la clasificación de la edificación de acuerdo a su categoría?',
        '¿Presenta la localización, número y profundidad de los sondeos realizados?',
        'Registro de los sondeos',
        '¿Presenta la clasificación del tipo de suelo? (A.2.4.4)',
        '¿Presenta los parámetros de diseño sísmico?',
        '¿Presenta la caracterización del suelo? (A.2.4.4)',
        '¿Realiza el cálculo de capacidad de carga del suelo?',
        '¿Presenta la recomendación de tipo de cimentación y profundidad?',
        '¿Se realizó el análisis de estabilidad de taludes?',
        '¿Se realizó el cálculo de asentamientos?',
        '¿Incluye recomendaciones proceso constructivo?',
        '¿Incluye recomendaciones protección de edificaciones vecinas?',
        '¿Incluye anexos, ensayos, laboratorios, etc?'
    ]
    const HP = [
        'Coherencia técnica del peritaje con los planos arquitectónicos',
        'Presenta antigüedad de la construccion',
        'Descripción del peritaje técnico',
    ]
    const S1 = [
        'Coherencia técnica con los planos arquitectónicos.',
        'Coherencia técnica entre el estudio de suelos y el diseño estructural.',
        'Columna fuerte / Viga debil.',
    ]
    const analSismic = {
        'Fuerza horizontal equivalente': [
            'Regulares e irregulares, amenaza sísmica baja',
            'Regulares e irregulares, uso I, localizadas amenaza intermedia',
            'Regulares HASTA (20 niveles 60 m) SIN zona, excepto perfil D,E,F con periodo > 2Tc',
            'Irregulares HASTA (6 nivelas 18 m) de la base',
            'Estructuras flexibles apoyadas sobre más rígida VER(A.3.24)'
        ],
        'Análisis dinámico elástico': [
            'Edificaciones MAS (20 niveles 60 m) aun en zona ALTA',
            'Irregularidades Verticales 1aA, 1bA, 2A, 3A, pisos flexibles, masas y geometría',
            'Irregularidades no descritas en (A.3.3.4) planta y (A.3.3.5) altura ',
            'MAS (5 Niveles 20 m) amenaza alta y cambio de sistema estructural',
            'Regulares e irregulares con perfil D,E,F o periodo > 2Tc VER Cap 7'
        ],
        'Análisis dinámico inelástico': [
            'Fallas en la capacidad de disipar energía en el rango inelástico',
            'Revisión por 2 profesionales, independientes del diseñador idóneos',
            'Memorial con procedimientos empleados y que lo diseñado debe ser similar',
            'A una edificación diseñada por métodos del reglamento en sismos con intensidad',
            'Similar al del diseño, este documento forma parte de la licencia de construcción'
        ],
        'Estático análisis alternos plastificación progresiva': [
            'Plastificación progresiva',
            'Cumplir apéndice A-3',
            'Este procedimiento no tiene carácter obligatorio en el reglamento',
            'Analiza la respuesta no lineal de estructuras en movimientos sísmicos fuertes ',
            'Debe ser revisado por dos ingenieros en el criterio sísmico utilizado en el sitio y en el desplazamiento objetivo y la resistencia efectiva de la estructura'
        ],
        'No': [
            ' ',
        ]
    }
    let _FIND_PROFESIOANL = (_role) => {
        for (var i = 0; i < fun_52.length; i++) {
            if (fun_52[i].role.includes(_role)) return fun_52[i];
        }
        return false;
    }
    function LOAD_STEP(_id_public) {
        var _CHILD = record_eng_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == version && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    function _GET_STEP_TYPE(_id_public, _type) {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP) return [];
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (!value.length) return [];
        value = value.split(';');
        return value
    }
    let _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = fun_clocks;
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }

    var _VALUE_ARRAY;
    var _CHECK_ARRAY;

    const _BODY = `A continuación se lista la documentación que sirve de base para la revisión del proyecto en función de la 
    actuación urbanística radicada y sobre la cual se pronunciará el evaluador estructural en los aspectos de calidad y 
    pertinencia de los documentos frente al cumplimiento la NSR-10. Esta revisión se hace a partir de los documentos presentados 
    a la ${curaduriaInfo.name}.`.replace(/[\n\r]+ */g, ' ');

    const _BODY2 = `A.1.5.1 — DISEÑADOR RESPONSABLE — La responsabilidad de los diseños de los diferentes elementos que componen 
    la edificación recae en los profesionales bajo cuya dirección se elaboran los diferentes diseños particulares. Se presume, 
    que cuando un elemento figure en un plano o memoria de diseño, es porque se han tomado todas las medidas necesarias para cumplir 
    el  propósito del Reglamento y por lo tanto el profesional que firma o rotula el plano es el responsable del diseño 
    correspondiente.`.replace(/[\n\r]+ */g, ' ');

    const _BODY3 = `Es importante recordar lo dispuesto en el Artículo 32 de Decreto 1469 de 2010, que dice: El solicitante 
    contará con un plazo de treinta (30) días hábiles para dar respuesta al requerimiento. Este plazo podrá ser ampliado, a 
    solicitud de parte, hasta por un término adicional de quince (15) días hábiles. Durante este periodo se suspenderá el término 
    para el acto administrativo, vencido este plazo se declara desistida la solicitud de la actuación urbanística, acto contra el 
    cual se puede interponer recurso de reposición.`.replace(/[\n\r]+ */g, ' ');

    const _BODY4 = `Si considera necesario alguna aclaración sobre los aspectos aquí contemplados, favor acercarse a nuestras 
    oficinas donde el equipo de profesionales con gusto atenderá sus inquietudes y sugerencias. Una vez resueltas las observaciones 
    anotadas en la presente acta, el trámite de expedición de licencia culminará favorablemente.`.replace(/[\n\r]+ */g, ' ');

    let _BODY5 = `Como resultado de la revisión efectuada a los diseños y estudios, se entrega la relación de las partes por corregir, para ser incorporada al 
    Acta de Observaciones y correcciones del tramite.   Esta revisión de oficio cumple con las disposiciones del Reglamento NSR-10, dentro del alcance prescrito en la 
    Resolución 017 de 2017 , el decreto 926 del 19 de marzo de 2010, Decreto 2525 de julio de 2010, Decreto 092 del 17 de enero de 2011, Ley 1796 del 13 de julio de 2016, 
    Decreto 945 del 5 de junio de 2017.`.replace(/[\n\r]+ */g, ' ');

    if (curaduriaInfo.id == 'cup1') _BODY5 = `Esta revisión de oficio cumple con las disposiciones del Reglamento NSR-10, dentro del alcance prescrito en la 
    Resolución 017 de 2017 , el decreto 926 del 19 de marzo de 2010, Decreto 2525 de julio de 2010, Decreto 092 del 17 de enero de 2011, Ley 1796 del 13 de julio de 2016, 
    Decreto 945 del 5 de junio de 2017.`.replace(/[\n\r]+ */g, ' ');

    doc.startPage = undefined;
    doc.lastPage = undefined;
    doc.on('pageAdded', () => { doc.startPage = undefined });

    let _prof = _FIND_PROFESIOANL('INGENIERO CIVIL DISEÑADOR ESTRUCTURAL');
    if (!_prof) _prof = _FIND_PROFESIOANL('INGENIERO CIVIL GEOTECNISTA');
    let prof = {
        name: _prof ? _prof.name + ' ' + _prof.surname : ' ',
        mat: _prof ? _prof.registration : ' ',
        number: _prof ? _prof.number : ' ',
        email: _prof ? _prof.email : ' ',
        mat_date: _prof ? _prof.registration_date : ' ',
    }



    let legal_date = _GET_CLOCK_STATE(5).date_start;
    let time_to_review = _fun_0_type_time[_DATA.type ? _DATA.type : 'iii']
    let final_date = '';
    if (legal_date) {
        let limite_date = _GET_CLOCK_STATE(32).date_start || _GET_CLOCK_STATE(33).date_start;
        if (limite_date) {
            let pro = _GET_CLOCK_STATE(34).date_start ? 45 : 30;
            final_date = typeParse.dateParser_finalDate(limite_date, pro);
        }
        else final_date = typeParse.dateParser_finalDate(legal_date, time_to_review);
    }

    doc.font('Helvetica-Bold');
    doc.fontSize(7);

    if (!simple) {
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 22, h: 1, text: 'IV. REVISIÓN ESTRUCTURAL', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
                { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 0], w: 10, h: 1, text: 'INFORME', config: { bold: true, fill: 'steelblue', color: 'white' } },
                { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [34, 0], w: 8, h: 1, text: 'OBSERVACIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
                { coord: [42, 0], w: 2, h: 1, text: _DATA.type_rev == 1 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
                { coord: [44, 0], w: 8, h: 1, text: 'CORRECCIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
                { coord: [52, 0], w: 2, h: 1, text: _DATA.type_rev == 2 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },

                { coord: [0, 1], w: 8, h: 1, text: 'Ingeniero Civil Geotecnista', config: { align: 'left' } },
                { coord: [8, 1], w: 14, h: 1, text: prof.name, config: { align: 'left' } },
                { coord: [22, 1], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 1], w: 10, h: 1, text: 'Control Revisión', config: { align: 'center' } },
                { coord: [33, 1], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [0, 2], w: 8, h: 1, text: 'Matricula profesional', config: { align: 'left' } },
                { coord: [8, 2], w: 14, h: 1, text: prof.mat, config: { align: 'left' } },
                { coord: [22, 2], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 2], w: 6, h: 1, text: 'Fecha Ingreso', config: { align: 'left' } },
                { coord: [29, 2], w: 4, h: 1, text: _GET_CLOCK_STATE(5).date_start, config: { align: 'center' } },
                { coord: [33, 2], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [34, 2], w: 20, h: 1, text: '', config: { hide: true } },

                { coord: [0, 3], w: 8, h: 1, text: 'Fecha matricula', config: { align: 'left' } },
                { coord: [8, 3], w: 14, h: 1, text: prof.mat_date, config: { align: 'left' } },
                { coord: [22, 3], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 3], w: 6, h: 1, text: 'Fecha Rev. 1', config: { align: 'left' } },
                { coord: [29, 3], w: 4, h: 1, text: record_rev.date, config: { align: 'center' } },
                { coord: [33, 3], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [34, 3], w: 20, h: 1, text: '', config: { hide: true } },

                { coord: [0, 4], w: 8, h: 1, text: 'Email', config: { align: 'left' } },
                { coord: [8, 4], w: 14, h: 1, text: prof.email, config: { align: 'left' } },
                { coord: [22, 4], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 4], w: 6, h: 1, text: 'Fecha Rev. 2', config: { align: 'left' } },
                { coord: [29, 4], w: 4, h: 1, text: record_rev.date_2, config: { align: 'center' } },
                { coord: [33, 4], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [34, 4], w: 20, h: 1, text: '', config: { hide: true } },

                { coord: [0, 5], w: 8, h: 1, text: 'Teléfono', config: { align: 'left' } },
                { coord: [8, 5], w: 14, h: 1, text: prof.number, config: { align: 'left' } },
                { coord: [22, 5], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 5], w: 6, h: 1, text: 'Fecha Desistir', config: { align: 'left' } },
                { coord: [29, 5], w: 4, h: 1, text: final_date, config: { align: 'center' } },
                { coord: [33, 5], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [34, 5], w: 20, h: 1, text: '', config: { hide: true } },

                { coord: [34, 1], w: 20, h: 5, text: typeParse.formsParser1(fun_1), config: { bold: true, fill: 'gold', align: 'center', valign: true } },

            ],
            [doc.x, doc.y],
            [54, 6],
            {})
    }

    doc.fontSize(8);
    if (curaduriaInfo.id == 'cup1') doc.fontSize(10);
    if (CATEGORY == '2') {

        let strDocs = record_eng_review ? record_eng_review.detail_3 ? record_eng_review.detail_3 : '' : '';
        let strDesc = record_eng_review ? record_eng_review.desc ? record_eng_review.desc : '' : '';
        let strReview = record_eng_review ? record_eng_review.detail_4 ? record_eng_review.detail_4 : '' : '';
        let strDetails = record_eng_review ? record_eng_review.detail_2 ? record_eng_review.detail_2 : '' : '';

        if (!simple) {
            pdfSupport.rowConfCols2(doc, doc.y,
                [_BODY,],
                [1],
                [{ align: 'justify' }],
            )

            pdfSupport.rowConfCols2(doc, doc.y,
                ['4.1 Revisión Documentos requeridos para la actuación urbanística solicitada para proyectos.',],
                [1],
                [{ align: 'left', pretty: true, bold: true }],
            )
            pdfSupport.listText(doc, doc.y, strDocs);

            pdfSupport.rowConfCols2(doc, doc.y,
                ['4.2 Descripción del proyecto estructural ',],
                [1],
                [{ align: 'left', pretty: true, bold: true }],
            )
            pdfSupport.listText(doc, doc.y, strDesc);

            pdfSupport.rowConfCols2(doc, doc.y,
                ['4.3 Revisión general',],
                [1],
                [{ align: 'left', pretty: true, bold: true }],
            )
            pdfSupport.listText(doc, doc.y, strReview);

        }
        pdfSupport.rowConfCols2(doc, doc.y,
            [`${_BODY5}`,],
            [1,],
            [{ align: 'justify', bold: false, pretty: false },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [simple ? 'CONCLUSIONES Y OBSERVACIONES' : '4.4 Observaciones',],
            [1],
            [{ align: 'left', pretty: true, bold: true }],
        )
        var details = strDetails ? strDetails : 'NO HAY OBSERVACIONES';
        pdfSupport.listText(doc, doc.y, details);


        pdfSupport.rowConfCols2(doc, doc.y,
            [simple ? 'EVALUACIÓN DE VIABILIDAD ESTRUCTURAL' : '4.5 Procedente Estructural',],
            [1],
            [{ align: 'left', pretty: true, bold: true }],
        )
        doc.startPage = doc.bufferedPageRange().count - 1;
        doc.lastPage = doc.startPage;

        let color = _DATA.rew.r_pending ? 'blanchedalmond' : _DATA.rew.r_check == 'VIABLE' ? 'paleturquoise' : 'lightsalmon';
        let color2 = _DATA.rew.r_pending ? 'blanchedalmond' : _DATA.rew.r_check_2 == 'VIABLE' ? 'paleturquoise' : _DATA.rew.r_check_2 == 'NO APLICA' ? 'paleturquoise' : 'lightsalmon';

        if (_DATA.omit_date) pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 11, h: 2, text: 'PROFESIONAL REVISOR:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [11, 0], w: 11, h: 2, text: `${_DATA.rew.r_worker}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

                { coord: [22, 0], w: 17, h: 1, text: `${_DATA.rew.r_check_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 0], w: 7, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check}`, config: { align: 'center', bold: true, valign: true, fill: color } },

                { coord: [22, 1], w: 17, h: 1, text: `${_DATA.rew.r_check_2_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 1], w: 7, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_2}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

            ],
            [doc.x, doc.y], [47, 2], {})
        else pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 11, h: 2, text: 'PROFESIONAL REVISOR:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [11, 0], w: 11, h: 2, text: `${_DATA.rew.r_worker}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

                { coord: [22, 0], w: 17, h: 1, text: `${_DATA.rew.r_check_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 0], w: 7, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check}`, config: { align: 'center', bold: true, valign: true, fill: color } },

                { coord: [22, 1], w: 17, h: 1, text: `${_DATA.rew.r_check_2_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 1], w: 7, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_2}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

                { coord: [46, 0], w: 7, h: 2, text: 'FECHA:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [53, 0], w: 7, h: 2, text: `${_DATA.rew.r_date}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            ],
            [doc.x, doc.y], [60, 2], {})

        doc.text('\n');
        doc.startPage = undefined;
        doc.lastPage = undefined;
        if (!simple) {
            pdfSupport.rowConfCols2(doc, doc.y,
                ['V. SUSPENSION DE TERMINOS',],
                [1],
                [{ align: 'left', pretty: true, color: 'gold', bold: true }],
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                [_BODY3 + '\n\n' + _BODY4,],
                [1],
                [{ align: 'justify' }],
            )
        }
    }
    if (CATEGORY == '1' || CATEGORY == '3') {
        if (!simple) {
            doc.font('Helvetica-Bold');
            pdfSupport.rowConfCols2(doc, doc.y,
                ['4.1 Revisión Documentos requeridos para la actuación urbanística solicitada',],
                [1,],
                [{ align: 'left', bold: true, pretty: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                [_BODY,],
                [1,],
                [{ align: 'justify' },]
            )

            _CHECK_ARRAY = _GET_STEP_TYPE('s44_check', 'check');

            var LIST = [
                {
                    title: 'PARA PROYECTOS SUJETOS AL TÍTULO E DEL REGLAMENTO NSR-10*:', items: [
                        { i: 0, v: 0, desc: 'APIQUE', },
                        { i: 1, v: 0, desc: 'CUADRO DE LONGITUD DE MUROS CONFINADOS', },
                        { i: 2, v: 0, desc: 'PLANOS CON ELEMENTOS ESTRUCTURALES DE MUROS CONFINADOS, CIMENTACION ENTREPISOS Y CUBIERTA*', },
                    ],
                },

                {
                    title: 'Rótulo', items: [
                        { i: 3, v: 0, desc: 'Dirección', },
                        { i: 4, v: 0, desc: 'Firma del arquitecto', },
                        { i: 5, v: 0, desc: 'Número de matrícula del ingeniero', },
                        { i: 6, v: 0, desc: 'Escala', },
                        { i: 7, v: 0, desc: 'Planta de cimentación con ejes', },
                        { i: 8, v: 0, desc: 'Plantas de vigas y muro con ejes', },
                        { i: 9, v: 0, desc: 'Despiece de elementos de confinamiento', },
                        { i: 10, v: 0, desc: 'Especificaciones de materiales', },
                    ],
                },

                {
                    title: 'PARA PROYECTOS NO SUJETOS AL TÍTULO E DEL REGÑAMENTO NSR-10*:', items: [
                        { i: 11, v: 0, desc: 'ESTUDIO DE SUELOS Y GEOTÉCNICO', },
                        { i: 12, v: 0, desc: 'MEMORIAS DE CÁLCULO ESTRUCTURAL', },
                        { i: 13, v: 0, desc: 'PLANOS ESTRUCTURALES*', },
                    ],
                },

                {
                    title: 'Rótulo', items: [
                        { i: 14, v: 0, desc: 'Dirección', },
                        { i: 15, v: 0, desc: 'Firma del arquitecto', },
                        { i: 16, v: 0, desc: 'Número de matrícula del ingeniero', },
                        { i: 17, v: 0, desc: 'Escala', },
                        { i: 18, v: 0, desc: 'Planta de cimentación con ejes', },
                        { i: 19, v: 0, desc: 'Plantas estructurales con ejes', },
                        { i: 20, v: 0, desc: 'Despiece de elementos de confinamiento', },
                        { i: 21, v: 0, desc: 'Especificaciones de materiales', },
                    ],
                },

                {
                    title: 'ELEMENTOS NO ESTRUCTURALES', items: [
                        { i: 22, v: 0, desc: 'Cálculo de los elementos no estructurales', },
                        { i: 23, v: 0, desc: 'Planos de elementos no estructurales', },
                    ],
                },

                {
                    title: 'PROYECTOS DE INGENIERIA PARA EL RECONOCIMIENTO DE LA EXISTENCIA DE EDIFICACIONES', items: [
                        { i: 24, v: 0, desc: 'PARA PROYECTOS SUJETOS AL TÍTULO E DEL REGLAMENTONSR-10 Peritaje simplificado según Manual de Construcción, Evaluación y Rehabilitación sismo resistente de Viviendas de Mampostería de la Asociación de Ingeniería Sísmica, AIS (Decreto 1077, Artículo 2.2.6.4.2).', },
                        { i: 25, v: 0, desc: 'PARA PROYECTOS NO SUJETOS AL TÍTULO E DEL REGLAMENTO NSR-10 Copia de un peritaje técnico que sirva para determinar la estabilidad de la construcción y las intervenciones y obras a realizar que lleven progresiva o definitivamente a disminuir la vulnerabilidad sísmica de la edificación, cuando a ello hubiere lugar (Decreto 1077, Artículo 2.2.6.4.2.3).', },
                    ],
                },
            ];

            LIST.map(item => {
                let allNA = item.items.every(it => _CHECK_ARRAY[it.i] == 2 || it.i === false)

                if (!allNA) {
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [item.title],
                        [1,],
                        [{ align: 'left', bold: true, },]
                    )

                    item.items.map(it => {
                        if (_CHECK_ARRAY[it.i] != 2) pdfSupport.rowConfCols2(doc, doc.y,
                            [it.desc, checkValue[_CHECK_ARRAY[it.i]]],
                            [10, 2],
                            [{ align: 'left' }, { align: 'center', bold: true }]
                        )
                    })
                }
            })

            LIST = [
                { title: 'Memorias elementos estructurales', page: true, index: 0, },
                { title: 'Memorias elementos NO estructurales', page: true, index: 1, },
                { title: 'Planos estructurales', index: 2, },
                { title: 'Planos NO estructurales', Page: true, index: 8, },
                { title: 'Plano Geotécnico', page: true, index: 3, },
                { title: 'Estudio Geotécnico', page: true, index: 9, },
                { title: 'Memorias segunda revisor', index: 4, },
                { title: 'Peritaje', index: 5, },
                { title: 'Movimiento de tierras', index: 6, },
                { title: 'Otros', otrher: true, page: true, index: 7, },
            ]

            _CHECK_ARRAY = _GET_STEP_TYPE('s430', 'check');
            _VALUE_ARRAY = _GET_STEP_TYPE('s430', 'value');
            var _VALUE_ARRAY2 = _GET_STEP_TYPE('s430p', 'value');
            var _VALUE_ARRAY3 = _GET_STEP_TYPE('s430o', 'value');

            pdfSupport.rowConfCols2(doc, doc.y,
                ['REVISION DE PLANOS, ESTUDIOS Y MEMORIAS'],
                [1,],
                [{ align: 'left', bold: true, },]
            )

            pdfSupport.rowConfCols2(doc, doc.y,
                ['DESCRIPCIÓN', 'FOLIIOS', 'CANTIDAD'],
                [4, 1, 1],
                [{ align: 'center', bold: true }, { align: 'center', bold: true }, { align: 'center', bold: true }]
            )

            LIST.map(it => {
                if (_CHECK_ARRAY[it.index] == 1) pdfSupport.rowConfCols2(doc, doc.y,
                    [it.otrher ? `OTROS: ${_VALUE_ARRAY3[0]}` : it.title, _VALUE_ARRAY2[it.index], _VALUE_ARRAY[it.index]],
                    [4, 1, 1],
                    [{ align: 'left', }, { align: 'center', }, { align: 'center', }]
                )
            })

            pdfSupport.rowConfCols2(doc, doc.y,
                [_BODY2,],
                [1,],
                [{ align: 'justify' },]
            )

            // PROFESIONAL LIST

            let PRFS_V = _GET_STEP_TYPE('cb_profs', 'value');
            let PROFS_C = _GET_STEP_TYPE('cb_profs', 'check');

            PROFS_C.map((c, i) => {
                let ing = _FIND_PROFESIOANL(PRFS_V[i]);
                if (ing && c == 1) pdfSupport.rowConfCols2(doc, doc.y,
                    [PRFS_V[i], `${ing ? ing.name : ''} ${ing ? ing.surname : ''}`.toUpperCase(),
                        'Nº Matricula', `${ing ? ing.registration : ''}`],
                    [3, 4, 2, 2,],
                    [{ align: 'center' },
                    { align: 'center', bold: true },
                    { align: 'center' },
                    { align: 'center', bold: true },]
                )
                if (!ing && c == 1) pdfSupport.rowConfCols2(doc, doc.y,
                    [PRFS_V[i], `FALTA INFORMACIÓN`.toUpperCase(),
                        'Nº Matricula', ` `],
                    [3, 4, 2, 2,],
                    [{ align: 'center' },
                    { align: 'center', bold: true },
                    { align: 'center' },
                    { align: 'center', bold: true },]
                )
            })


            pdfSupport.rowConfCols2(doc, doc.y,
                ['4.2 Descripción del proyecto',],
                [1,],
                [{ align: 'left', bold: true, pretty: true },]
            )
            let desc = `${fun_1.description ? '' : ''}${record_eng_review ? record_eng_review.desc ? record_eng_review.desc : '' : ''}`
            pdfSupport.rowConfCols2(doc, doc.y,
                [desc,],
                [1],
                [{ align: 'justify' }]
            )
            if (record_eng.desc) pdfSupport.rowConfCols2(doc, doc.y,
                [`${record_eng.desc}`,],
                [1],
                [{ align: 'justify' }]
            )

            pdfSupport.rowConfCols2(doc, doc.y,
                ['4.3 Revisión del Proyecto',],
                [1,],
                [{ align: 'left', bold: true, pretty: true },]
            )
            let counter = 0;

            if (SUBCATEGORIES[0] == '1') {
                counter++;
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`4.3.${counter} Estudio Geotécnico`,],
                    [1],
                    [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
                )

                _VALUE_ARRAY = _GET_STEP_TYPE('s4311', 'value');
                _CHECK_ARRAY = _GET_STEP_TYPE('s4311', 'check');

                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Categoría Construcción (H.3.1)', `${_VALUE_ARRAY[5] || ''}`, 'Segun los Niveles', `${_VALUE_ARRAY[0] || ''}`, `${validateCheck(_CHECK_ARRAY[0])}`],
                    [5, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Numero de Sondeos', `${_VALUE_ARRAY[1] || ''}`, 'Profundida (h.3.2.1)', `${_VALUE_ARRAY[2] || ''}`, `${validateCheck(_CHECK_ARRAY[1])}`],
                    [5, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Cargas en Columna', `${_VALUE_ARRAY[3] || ''}`, 'Supersivisíon Técnica', `${_VALUE_ARRAY[4] || ''}`, `${validateCheck(_CHECK_ARRAY[2])}`],
                    [5, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Contenido del estudio geotécnico definitivo (H.2.2.2.1)`,],
                    [1],
                    [{ align: 'left', bold: true },]
                )
                _CHECK_ARRAY = _GET_STEP_TYPE('s4312', 'check');
                H2221.map((value, i) => {
                    if (_CHECK_ARRAY[i] != '2') pdfSupport.rowConfCols2(doc, doc.y,
                        [value, `${validateCheck(_CHECK_ARRAY[i])}`],
                        [16, 2],
                        [{ align: 'left' },
                        { align: 'center', bold: true },]
                    )
                })

                _VALUE_ARRAY = _GET_STEP_TYPE('s4313', 'value');
                _CHECK_ARRAY = _GET_STEP_TYPE('s4313', 'check');

                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Numero Golpes/Pie', `${_VALUE_ARRAY[0] || ''}`, 'Profundidad captación', `${_VALUE_ARRAY[1] || ''} ml`, ``],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Presión o capacidad portante', `${_VALUE_ARRAY[2] || ''} kPa`, 'Ancho del cimiento', `${_VALUE_ARRAY[3] || ''} ml`, ``],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Angulo Fricción interna', `${_VALUE_ARRAY[4] || ''} Grados`, ``],
                    [4, 4, 10],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Módulo de Balasto Ks', `${_VALUE_ARRAY[5] || ''} kg/cm3`, 'Coef. presión activa Ka', `${_VALUE_ARRAY[6] || ''}`, ``],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Nivel freático NF', `${_VALUE_ARRAY[7] || ''} m`, 'Coef. presión pasiva Kp', `${_VALUE_ARRAY[8] || ''}`, ``],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Características sísmicas`,],
                    [1],
                    [{ align: 'left', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Aa Acele. pico efectiva (A.2.2)', `${_VALUE_ARRAY[9] || ''}`, 'Av Velocidad pico efectiva', `${_VALUE_ARRAY[10] || ''}`, `${validateCheck(_CHECK_ARRAY[0])}`],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Zona amenaza sísmica (A.2.3)', `${_VALUE_ARRAY[11] || ''}`, 'Ae Vel reducida (A.10.3)', `${_VALUE_ARRAY[12] || ''}`, `${validateCheck(_CHECK_ARRAY[1])}`],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['', 'Ad Vel umbral daño (A.12.2)', `${_VALUE_ARRAY[13] || ''}`, `${validateCheck(_CHECK_ARRAY[2])}`],
                    [8, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Tipo perfil`,],
                    [1],
                    [{ align: 'left', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Tipo perfil de suelo (A.2.4.2)', `${_VALUE_ARRAY[14] || ''}`, ``],
                    [4, 4, 10],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Descripción suelo', `${_VALUE_ARRAY[15] || ''}`, 'Vel. onda cortante', `${_VALUE_ARRAY[16] || ''}`, ``],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Núm. golpes/pie', `${_VALUE_ARRAY[17] || ''}`, 'Resist. No drenada', `${_VALUE_ARRAY[18] || ''}`, ``],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Fa = Periodos cortos', `${_VALUE_ARRAY[19] || ''}`, 'Fv= Periodos intermedios', `${_VALUE_ARRAY[20] || ''}`, `${validateCheck(_CHECK_ARRAY[3])}`],
                    [4, 4, 4, 4, 2],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
            }

            if (SUBCATEGORIES[1] == '1') {
                counter++;
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`4.3.${counter} Peritaje Estructural`,],
                    [1],
                    [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
                )
                _CHECK_ARRAY = _GET_STEP_TYPE('s433p', 'check');
                HP.map((value, i) =>
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [value, `${validateCheck(_CHECK_ARRAY[i])}`],
                        [16, 2],
                        [{ align: 'left' },
                        { align: 'center', bold: true },]
                    )
                )
            }

            if (SUBCATEGORIES[2] == '1') {
                counter++;
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`4.3.${counter} Memorias de cálculo`,],
                    [1],
                    [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
                )
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 1: Pre dimensionamiento y coordinación con otros profesionales.`,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )
                _CHECK_ARRAY = _GET_STEP_TYPE('s4321', 'check');
                S1.map((value, i) =>
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [value, `${validateCheck(_CHECK_ARRAY[i])}`],
                        [16, 2],
                        [{ align: 'left' },
                        { align: 'center', bold: true },]
                    )
                )
                doc.text('\n');
                _VALUE_ARRAY = _GET_STEP_TYPE('s4321', 'value');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`PREDIMENSIONAMIENTO`,],
                    [1],
                    [{ align: 'left', bold: true, }],
                    { draw: false }
                )
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['C.9.5      NSR-10', 'L=Losa', `L=Viga`,],
                    [2, 1, 1],
                    [{ align: 'center', bold: true, pretty: true, },
                    { align: 'center', bold: true, pretty: true, },
                    { align: 'center', bold: true, pretty: true, },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Luz simplemente apoyados', _VALUE_ARRAY[0] || '', _VALUE_ARRAY[1] || '',],
                    [2, 1, 1],
                    [{ align: 'left', },
                    { align: 'center', },
                    { align: 'center', },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Con un apoyo continuo', _VALUE_ARRAY[2] || '', _VALUE_ARRAY[3] || '',],
                    [2, 1, 1],
                    [{ align: 'left', },
                    { align: 'center', },
                    { align: 'center', },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Ambos apoyos continuos', _VALUE_ARRAY[4] || '', _VALUE_ARRAY[5] || '',],
                    [2, 1, 1],
                    [{ align: 'left', },
                    { align: 'center', },
                    { align: 'center', },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Luz en voladizo', _VALUE_ARRAY[6] || '', _VALUE_ARRAY[7] || '',],
                    [2, 1, 1],
                    [{ align: 'left', },
                    { align: 'center', },
                    { align: 'center', },]
                )

                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['ELEMENTOS', 'Simpl. apoyo', `Un extre contin`, `Ambos Contin`, `Voladizo`, `Espesor escogido`,],
                    [3, 1, 1, 1, 1, 1],
                    [{ align: 'center', bold: true, pretty: true, },
                    { align: 'center', bold: true, pretty: true, },
                    { align: 'center', bold: true, pretty: true, },
                    { align: 'center', bold: true, pretty: true, },
                    { align: 'center', bold: true, pretty: true, },
                    { align: 'center', bold: true, pretty: true, },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Losas macizas en una dirección', `L/20 (m)\n${_VALUE_ARRAY[8] || ''}`, `L/24 (m)\n${_VALUE_ARRAY[9] || ''}`, `L/28 (m)\n${_VALUE_ARRAY[10] || ''}`, `L/10 (m)\n${_VALUE_ARRAY[11] || ''}`, `\n${_VALUE_ARRAY[12] ? _VALUE_ARRAY[12] + ' m' : ' '}`,],
                    [3, 1, 1, 1, 1, 1],
                    [{ align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Vigas o losas nervadas en una dirección', `L/12 (m)\n${_VALUE_ARRAY[13] || ''}`, `L/16 (m)\n${_VALUE_ARRAY[14] || ''}`, `L/18.5 (m)\n${_VALUE_ARRAY[15] || ''}`, `L/21 (m)\n${_VALUE_ARRAY[16] || ''}`, `\n${_VALUE_ARRAY[17] ? _VALUE_ARRAY[17] + ' m' : ' '}`,],
                    [3, 1, 1, 1, 1, 1],
                    [{ align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },]
                )

                doc.text('\n');
            }

            if (SUBCATEGORIES[3] == '1') {
                _VALUE_ARRAY = _GET_STEP_TYPE('s4322', 'value');
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 2: Evaluación de las solicitudes definitivas: Se revisan las cargas presentadas en la edificacion debido a los pesos propios de la estructura y los tipos de uso de la misma, con los requisitos del Título B del reglamento`,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`ANÁLISIS DE CARGAS`,],
                    [1],
                    [{ align: 'left', bold: true, }],
                    { draw: false }
                )
                doc.text('\n');
                const caclLight = [
                    'Altura total placa H:',
                    'Separacion nervios C:',
                    'Loseta superior D1:',
                    'Loseta inferior D3:',
                    'Alto Casetón D2:',
                    'Ancho Vigueta B:',
                    'Riostra cada:',
                ]
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['CALCULO LOSA ALIGERADA'],
                    [1,],
                    [{ align: 'center', bold: true, pretty: true },],
                    { width: 300 }
                )
                for (let i = 0; i < caclLight.length; i++) {
                    const element = caclLight[i];
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [element, `${_VALUE_ARRAY[i * 2] || ''}`, `${_VALUE_ARRAY[i * 2 + 1] || ''}`,],
                        [2, 1, 1,],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },],
                        { width: 300 }
                    )
                }

                if (CATEGORY == '3') {
                    _VALUE_ARRAY = _GET_STEP_TYPE('steel_deck', 'value');
                    _CHECK_ARRAY = _GET_STEP_TYPE('steel_deck', 'check');

                    if (_CHECK_ARRAY[0]) {
                        pdfSupport.table(doc,
                            [
                                { coord: [0, 0], w: 60, h: 1, text: 'STEEL DECK', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro' } },

                                { coord: [0, 1], w: 15, h: 1, text: "hcresta (m)", config: { align: 'center', valign: true, } },
                                { coord: [15, 1], w: 15, h: 1, text: _VALUE_ARRAY[0], config: { align: 'center', valign: true, } },

                                { coord: [0, 2], w: 15, h: 1, text: "htotal (m)", config: { align: 'center', valign: true, } },
                                { coord: [15, 2], w: 15, h: 1, text: _VALUE_ARRAY[1], config: { align: 'center', valign: true, } },

                                { coord: [0, 3], w: 15, h: 1, text: "wcresta (m)", config: { align: 'center', valign: true, } },
                                { coord: [15, 3], w: 15, h: 1, text: _VALUE_ARRAY[2], config: { align: 'center', valign: true, } },

                                { coord: [0, 4], w: 15, h: 1, text: "wvalle (m)", config: { align: 'center', valign: true, } },
                                { coord: [15, 4], w: 15, h: 1, text: _VALUE_ARRAY[3], config: { align: 'center', valign: true, } },

                                { coord: [0, 5], w: 15, h: 1, text: "dcresta (m)", config: { align: 'center', valign: true, } },
                                { coord: [15, 5], w: 15, h: 1, text: _VALUE_ARRAY[4], config: { align: 'center', valign: true, } },

                                { coord: [30, 1], w: 15, h: 1, text: "Wplaca (kN/m2", config: { align: 'center', valign: true, } },
                                { coord: [45, 1], w: 15, h: 1, text: _VALUE_ARRAY[5], config: { align: 'center', valign: true, } },

                                { coord: [30, 2], w: 15, h: 1, text: "Wmetaldeck (kN/m2)", config: { align: 'center', valign: true, } },
                                { coord: [45, 2], w: 15, h: 1, text: _VALUE_ARRAY[6], config: { align: 'center', valign: true, } },

                                { coord: [30, 3], w: 15, h: 1, text: "Wconc (kN/m2)", config: { align: 'center', valign: true, } },
                                { coord: [45, 3], w: 15, h: 1, text: _VALUE_ARRAY[7], config: { align: 'center', valign: true, } },

                                { coord: [30, 4], w: 15, h: 1, text: "Wtotal (kN/m2)", config: { align: 'center', valign: true, } },
                                { coord: [45, 4], w: 15, h: 1, text: _VALUE_ARRAY[8], config: { align: 'center', valign: true, } },

                            ],
                            [doc.x, doc.y], [60, 6], { lineHeight: -1 })
                    }

                }



                if (CATEGORY == '1') {
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['CARGA MUERTA', 'CARGA VIVA'],
                        [17, 9],
                        [{ align: 'center', bold: true, pretty: true },
                        { align: 'center', bold: true, pretty: true },],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['', `Parqueadero`, `Pisos tipo`, `Cubierta`, 'Otro', ` `],
                        [10, 6, 6, 6, 6, 18],
                        [{ align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        {}],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Elementos', `(kN/m2)`, `(kN/m2)`, `(kN/m2)`, `${_VALUE_ARRAY[38] || ''}`, 'USO', `(kN/m2)`,],
                        [10, 6, 6, 6, 6, 9, 9],
                        [{ align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },],
                    )

                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Viguetas', `${_VALUE_ARRAY[14] || ''}`, `${_VALUE_ARRAY[15] || ''}`, `${_VALUE_ARRAY[16] || ''}`, `${_VALUE_ARRAY[39] || ''}`, 'Cuartos', `${_VALUE_ARRAY[32] || ''}`,],
                        [10, 6, 6, 6, 6, 9, 9],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Placas', `${_VALUE_ARRAY[17] || ''}`, `${_VALUE_ARRAY[18] || ''}`, `${_VALUE_ARRAY[19] || ''}`, `${_VALUE_ARRAY[40] || ''}`, 'Balcones', `${_VALUE_ARRAY[33] || ''}`,],
                        [10, 6, 6, 6, 6, 9, 9],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Aligerante', `${_VALUE_ARRAY[20] || ''}`, `${_VALUE_ARRAY[21] || ''}`, `${_VALUE_ARRAY[22] || ''}`, `${_VALUE_ARRAY[41] || ''}`, 'Escaleras', `${_VALUE_ARRAY[34] || ''}`,],
                        [10, 6, 6, 6, 6, 9, 9],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Muros divisorios', `${_VALUE_ARRAY[23] || ''}`, `${_VALUE_ARRAY[24] || ''}`, `${_VALUE_ARRAY[25] || ''}`, `${_VALUE_ARRAY[42] || ''}`, 'Parqueaderos', `${_VALUE_ARRAY[35] || ''}`,],
                        [10, 6, 6, 6, 6, 9, 9],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Pisos y acabados', `${_VALUE_ARRAY[26] || ''}`, `${_VALUE_ARRAY[27] || ''}`, `${_VALUE_ARRAY[28] || ''}`, `${_VALUE_ARRAY[43] || ''}`, 'Cubierta', `${_VALUE_ARRAY[36] || ''}`,],
                        [10, 6, 6, 6, 6, 9, 9],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Total', `${_VALUE_ARRAY[29] || ''}`, `${_VALUE_ARRAY[30] || ''}`, `${_VALUE_ARRAY[31] || ''}`, `${_VALUE_ARRAY[44] || ''}`, ``,],
                        [10, 6, 6, 6, 6, 18],
                        [{ align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', },],
                    )
                }

                if (CATEGORY == '3') {

                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['CARGA MUERTA'],
                        [17],
                        [{ align: 'center', bold: true, pretty: true },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['', `Parqueadero`, `Pisos tipo`, `Cubierta`, 'Otro'],
                        [10, 6, 6, 6, 6],
                        [{ align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Elementos', `(kN/m2)`, `(kN/m2)`, `(kN/m2)`, `${_VALUE_ARRAY[38] || ''}`,],
                        [10, 6, 6, 6, 6],
                        [{ align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        ],
                    )

                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Viguetas', `${_VALUE_ARRAY[14] || ''}`, `${_VALUE_ARRAY[15] || ''}`, `${_VALUE_ARRAY[16] || ''}`, `${_VALUE_ARRAY[39] || ''}`],
                        [10, 6, 6, 6, 6],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Placas', `${_VALUE_ARRAY[17] || ''}`, `${_VALUE_ARRAY[18] || ''}`, `${_VALUE_ARRAY[19] || ''}`, `${_VALUE_ARRAY[40] || ''}`,],
                        [10, 6, 6, 6, 6],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Aligerante', `${_VALUE_ARRAY[20] || ''}`, `${_VALUE_ARRAY[21] || ''}`, `${_VALUE_ARRAY[22] || ''}`, `${_VALUE_ARRAY[41] || ''}`,],
                        [10, 6, 6, 6, 6,],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Muros divisorios', `${_VALUE_ARRAY[23] || ''}`, `${_VALUE_ARRAY[24] || ''}`, `${_VALUE_ARRAY[25] || ''}`, `${_VALUE_ARRAY[42] || ''}`,],
                        [10, 6, 6, 6, 6,],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Pisos y acabados', `${_VALUE_ARRAY[26] || ''}`, `${_VALUE_ARRAY[27] || ''}`, `${_VALUE_ARRAY[28] || ''}`, `${_VALUE_ARRAY[43] || ''}`,],
                        [10, 6, 6, 6, 6,],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        ['Total', `${_VALUE_ARRAY[29] || ''}`, `${_VALUE_ARRAY[30] || ''}`, `${_VALUE_ARRAY[31] || ''}`, `${_VALUE_ARRAY[44] || ''}`,],
                        [10, 6, 6, 6, 6],
                        [{ align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        { align: 'center', bold: true, },
                        ],
                    )

                    _VALUE_ARRAY = _GET_STEP_TYPE('carga_vida_use', 'value');

                    let usos_item_1 = _VALUE_ARRAY[0] > 0 ? CARGA_VIVA_USOS.find(item => item.i == _VALUE_ARRAY[0]) : null;
                    let title_1 = usos_item_1 ? usos_item_1.name : CARGA_VIVA_USOS.find(item => item.i == 0).name;
                    let use_1 = usos_item_1 ? _GET_STEP_TYPE('carga_vida_0', 'value').length ? _GET_STEP_TYPE('carga_vida_0', 'value') : usos_item_1.usos.map(item => item.default) : [];

                    let column_1 = usos_item_1 ? [
                        { coord: [0, 0], w: 20, h: 1, text: title_1, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro' } },
                        { coord: [0, 1], w: 10, h: 1, text: 'USO', config: { align: 'center', bold: true, valign: true, } },
                        { coord: [10, 1], w: 10, h: 1, text: '(kN/m2)', config: { align: 'center', bold: true, valign: true, } },
                        ...use_1.map((uso, i) =>
                            ({ coord: [0, i + 2], w: 10, h: 1, text: usos_item_1.usos.find(item => item.i == i).name, config: { align: 'center', valign: true, } })
                        ),
                        ...use_1.map((uso, i) =>
                            ({ coord: [10, i + 2], w: 10, h: 1, text: uso, config: { align: 'center', valign: true, } })
                        )
                    ] : [];

                    let usos_item_2 = _VALUE_ARRAY[1] > 0 ? CARGA_VIVA_USOS.find(item => item.i == _VALUE_ARRAY[1]) : null;
                    let title_2 = usos_item_2 ? usos_item_2.name : CARGA_VIVA_USOS.find(item => item.i == 0).name;
                    let use_2 = usos_item_2 ? _GET_STEP_TYPE('carga_vida_1', 'value').length ? _GET_STEP_TYPE('carga_vida_1', 'value') : usos_item_2.usos.map(item => item.default) : [];

                    let column_2 = usos_item_2 ? [
                        { coord: [20, 0], w: 20, h: 1, text: title_2, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro' } },
                        { coord: [20, 1], w: 10, h: 1, text: 'USO', config: { align: 'center', bold: true, valign: true, } },
                        { coord: [30, 1], w: 10, h: 1, text: '(kN/m2)', config: { align: 'center', bold: true, valign: true, } },
                        ...use_2.map((uso, i) =>
                            ({ coord: [20, i + 2], w: 10, h: 1, text: usos_item_2.usos.find(item => item.i == i).name, config: { align: 'center', valign: true, } })
                        ),
                        ...use_2.map((uso, i) =>
                            ({ coord: [30, i + 2], w: 10, h: 1, text: uso, config: { align: 'center', valign: true, } })
                        )
                    ] : [];

                    let usos_item_3 = _VALUE_ARRAY[2] > 0 ? CARGA_VIVA_USOS.find(item => item.i == _VALUE_ARRAY[2]) : null;
                    let title_3 = usos_item_3 ? usos_item_3.name : CARGA_VIVA_USOS.find(item => item.i == 0).name;
                    let use_3 = usos_item_3 ? _GET_STEP_TYPE('carga_vida_2', 'value').length ? _GET_STEP_TYPE('carga_vida_2', 'value') : usos_item_3.usos.map(item => item.default) : [];

                    let column_3 = usos_item_3 ? [
                        { coord: [40, 0], w: 20, h: 1, text: title_3, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro' } },
                        { coord: [40, 1], w: 10, h: 1, text: 'USO', config: { align: 'center', bold: true, valign: true, } },
                        { coord: [50, 1], w: 10, h: 1, text: '(kN/m2)', config: { align: 'center', bold: true, valign: true, } },
                        ...use_3.map((uso, i) =>
                            ({ coord: [40, i + 2], w: 10, h: 1, text: usos_item_3.usos.find(item => item.i == i).name, config: { align: 'center', valign: true, } })
                        ),
                        ...use_3.map((uso, i) =>
                            ({ coord: [50, i + 2], w: 10, h: 1, text: uso, config: { align: 'center', valign: true, } })
                        )
                    ] : [];


                    if (usos_item_1 || usos_item_2 || usos_item_3) {
                        pdfSupport.rowConfCols2(doc, doc.y,
                            ['CARGA VIVA'],
                            [17],
                            [{ align: 'center', bold: true, pretty: true },
                            ],
                        )

                        pdfSupport.table(doc,
                            [
                                ...column_3,
                                ...column_2,
                                ...column_1,
                            ],
                            [doc.x, doc.y], [60, 9], { lineHeight: 32 })
                    }
                }


            }

            if (SUBCATEGORIES[4] == '1') {
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 3: Obtención del nivel de amenaza sísmica y valores de Aa y Av. Consiste en ubicar el lugar de la edificación dentro de los mapas de zonificación sísmica, (Cap. A-2), y determinar los valores de Aa y Av para determinar la amenaza sísmica, según sea (Alta, intermedia y baja).`,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )
                _VALUE_ARRAY = _GET_STEP_TYPE('s4233', 'value');
                _CHECK_ARRAY = _GET_STEP_TYPE('s4233', 'check');
                doc.text('\n');
                doc.font('Helvetica-Bold');
                doc.text('CARACTERÍSTICA SÍSMICAS');
                doc.font('Helvetica');
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Aa Acele. pico efectiva (A.2.2)', `${_VALUE_ARRAY[0] || ''}`, 'Av Velocidad pico efectiva', `${_VALUE_ARRAY[1] || ''}`, `${validateCheck(_CHECK_ARRAY[0])}`],
                    [5, 4, 5, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Zona amenaza sísmica (A.2.3)', `${_VALUE_ARRAY[2] || ''}`, 'Ae Vel reducida (A.10.3)', `${_VALUE_ARRAY[3] || ''}`, `${validateCheck(_CHECK_ARRAY[1])}`],
                    [5, 4, 5, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [``, 'Ad Vel umbral daño (A.12.2)', `${_VALUE_ARRAY[4] || ''}`, `${validateCheck(_CHECK_ARRAY[2])}`],
                    [9, 5, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
            }

            if (SUBCATEGORIES[5] == '1') {
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 4: Movimiento sísmicos de diseño. Debe tomarse en cuenta, la amenaza sísmica para el lugar determinado, parámetros Aa y Av, las características de la estratificación del suelo coeficientes Fa y Fv., la importancia del edificio para la recuperación por la comunidad con posterioridad a la ocurrencia de un sismo, Coeficiente de importancia.`,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )

                _VALUE_ARRAY = _GET_STEP_TYPE('s4234', 'value');
                _CHECK_ARRAY = _GET_STEP_TYPE('s4234', 'check');
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Uso edificio (A.2.5):', `${_VALUE_ARRAY[0] || ''}`, `${validateCheck(_CHECK_ARRAY[0])}`],
                    [14, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Grupo de Uso:', `${_VALUE_ARRAY[1] || ''}`, `${validateCheck(_CHECK_ARRAY[1])}`],
                    [14, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Coeficiente de importancia:', `${_VALUE_ARRAY[2] || ''}`, `${validateCheck(_CHECK_ARRAY[2])}`],
                    [14, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['(A.3.1.3) Capacidad de disipación energía mínima requerida.', `${_VALUE_ARRAY[3] || ''}`, `${validateCheck(_CHECK_ARRAY[3])}`],
                    [14, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
            }

            if (SUBCATEGORIES[6] == '1') {
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 5: Características de la estructuración y del material estructural empleado. `,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )

                _VALUE_ARRAY = _GET_STEP_TYPE('s4235', 'value');
                _CHECK_ARRAY = _GET_STEP_TYPE('s4235', 'check');
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Sistema estructural usado (A.3.2)', `${_VALUE_ARRAY[0] || ''}`, `${validateCheck(_CHECK_ARRAY[0])}`],
                    [9, 9, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Material estructural empleado:', `${_VALUE_ARRAY[1] || ''}`, ``],
                    [9, 9, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
            }

            if (SUBCATEGORIES[7] == '1') {
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 6, Grado de irregularidad de la estructura y procedimiento de análisis. Se realiza la revisión de los factores de irregularidad para determinar el método de análisis sísmico.`,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )

                _VALUE_ARRAY = _GET_STEP_TYPE('s4236', 'value');
                _CHECK_ARRAY = _GET_STEP_TYPE('s4236', 'check');

                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Coeficiente de capacidad de disipación de energía básico (R0)', `${_VALUE_ARRAY[0] || ''}`, `${validateCheck(_CHECK_ARRAY[0])}`],
                    [14, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['(A.3.3) Verificación irregularidades', `TIPO`, ``],
                    [10, 4, 7],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['(A.3.3.4) Configuración en planta.', `${_VALUE_ARRAY[1] || ''}`, `${_VALUE_ARRAY[2] || ''}`, `${validateCheck(_CHECK_ARRAY[1])}`],
                    [10, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['(A.3.3.5) Configuración en la altura', `${_VALUE_ARRAY[3] || ''}`, `${_VALUE_ARRAY[4] || ''}`, `${validateCheck(_CHECK_ARRAY[2])}`],
                    [10, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['(A.3.3.8) Ausencia de redundancia. (x)', `${_VALUE_ARRAY[5] || ''}`, `${_VALUE_ARRAY[6] || ''}`, `${validateCheck(_CHECK_ARRAY[3])}`],
                    [10, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['(A.3.3.8) Ausencia de redundancia. (y)', `${_VALUE_ARRAY[7] || ''}`, `${_VALUE_ARRAY[8] || ''}`, `${validateCheck(_CHECK_ARRAY[4])}`],
                    [10, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Coeficiente de capacidad de disipación de energía de diseño (R) (x)', `${_VALUE_ARRAY[9] || ''}`, ``],
                    [14, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Coeficiente de capacidad de disipación de energía de diseño (R) (y)', `${_VALUE_ARRAY[10] || ''}`, ``],
                    [14, 4, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['METODO DE ANALISIS SISMICO (A.3.4)', `${_VALUE_ARRAY[11] || ''}`, `${validateCheck(_CHECK_ARRAY[5])}`],
                    [10, 8, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )

                const newList = analSismic[_VALUE_ARRAY[11] ? _VALUE_ARRAY[11] : 'No'];

                pdfSupport.listText(doc, doc.y, newList.join('\n'));
            }

            if (SUBCATEGORIES[8] == '1') {
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 7, Determinación de las fuerzas sísmicas. El valor de las fuerzas sísmicas, en base a los parámetros sísmicos del paso 4.`,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`(A,4,2) PERIODO FUNDAMENTAL DE LA EDIFICACION`,],
                    [1],
                    [{ align: 'left', bold: true, }],
                    { draw: false }
                )
                doc.text('\n');

                _VALUE_ARRAY = _GET_STEP_TYPE('s4237', 'value');
                _CHECK_ARRAY = _GET_STEP_TYPE('s4237', 'check');

                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Valor Ct', `${_VALUE_ARRAY[0] || ''}`, ``, `${validateCheck(_CHECK_ARRAY[0])}`],
                    [5, 5, 8, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Valor de a', `${_VALUE_ARRAY[1] || ''}`, ``, `${validateCheck(_CHECK_ARRAY[1])}`],
                    [5, 5, 8, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Altura edificio', `${_VALUE_ARRAY[2] || ''}`, ``, `${validateCheck(_CHECK_ARRAY[2])}`],
                    [5, 5, 8, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Número de pisos', `${_VALUE_ARRAY[3] || ''}`, ``, `${validateCheck(_CHECK_ARRAY[3])}`],
                    [5, 5, 8, 3],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Periodo fundamental Aprox Ta = Ct x h^a', '(A.4.2-3)', `${_VALUE_ARRAY[4] || ''}`, `${validateCheck(_CHECK_ARRAY[4])}`],
                    [10, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Calculo de Cu = 1.75-1.2 x Av x Fv', '(A.4.2-2)', `${_VALUE_ARRAY[5] || ''}`, ``],
                    [10, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Pero Cu no puede ser menor de 1.20', 'Cu = ', `${_VALUE_ARRAY[6] || ''}`, ``],
                    [10, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['El valor de T no debe exceder a Cu*Ta', ' Tmax = Cu*Ta', '(A.4.2.1)', `${_VALUE_ARRAY[7] || ''}`, `${validateCheck(_CHECK_ARRAY[5])}`],
                    [5, 5, 4, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['', 'Ta Usado = ', `${_VALUE_ARRAY[8] || ''}`, `${validateCheck(_CHECK_ARRAY[6])}`],
                    [5, 9, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['', 'Periodo Funda. aprox.Ta = 0.1*N', `${_VALUE_ARRAY[9] || ''}`, `${validateCheck(_CHECK_ARRAY[7])}`],
                    [5, 9, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )

                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`ESPECTRO DE DISEÑO (A.2.6)`,],
                    [1],
                    [{ align: 'left', bold: true, }],
                    { draw: false }
                )
                doc.text('\n');

                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Periodo menores de Tc (A.2.6-6)', 'To = 0.1 x Av x Fv / (Aa x Fa)', `${_VALUE_ARRAY[10] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Espectro de diseño (A.2.6-7)', 'Sa = 2.5 x Aa x Fa x I x (0.4 + 0.6*T/To)', `${_VALUE_ARRAY[11] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Periodo vibración < Tc (A.2.6-2)', 'Tc = (0.48 x Av x Fv) / (Aa x Fa)', `${_VALUE_ARRAY[12] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Espectro de aceleraciones (A.2.6-3)', 'Sa = 2.5 x Aa x Fa x I', `${_VALUE_ARRAY[13] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Periodo de vibración < TL (A.2.6-4) ', 'TL = 2.4 x Fv', `${_VALUE_ARRAY[14] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Espectro de aceleraciones (A.2.6-5)', 'Sa = (1.2 x Av x Fv x I) / T', `${_VALUE_ARRAY[15] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Periodo de vibración > TL (A.2.6-4)', 'TL = 2.4 x Fv', `${_VALUE_ARRAY[16] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Espectro de aceleraciones (A.2.6-5)', 'Sa = (1.2 x Av x Fv x TL x I) / T^2', `${_VALUE_ARRAY[17] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Periodo Fundamental (A.2.6)', 'Ta =', `${_VALUE_ARRAY[18] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Espectro de aceleraciones (A.2.6.1)', `Sa = ${_VALUE_ARRAY[19] || ''}`, `${_VALUE_ARRAY[20] || ''}`, ``],
                    [7, 7, 4, 3],
                    [{ align: 'left' },
                    { align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },]
                )

                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`ESPECIFICACIONES DE MATERIALES`,],
                    [1],
                    [{ align: 'left', bold: true, }],
                    { draw: false }
                )
                doc.text('\n');

                _VALUE_ARRAY = _GET_STEP_TYPE('s423m', 'value');
                let condition;


                condition = _VALUE_ARRAY[0] || _VALUE_ARRAY[1] || _VALUE_ARRAY[2] || _VALUE_ARRAY[3]
                if (condition) {
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`ESTRUCTURAS EN CONCRETO`,],
                        [1],
                        [{ align: 'center', bold: true, pretty: true }],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`Fundaciones`, `f'c`, `${_VALUE_ARRAY[0] || ''}`, `MPa`, `Placas y vigas`, `f'c`, `${_VALUE_ARRAY[1] || ''}`, `MPa`,],
                        [2, 1, 1, 1, 2, 1, 1, 1,],
                        [{ align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`Columnas`, `f'c`, `${_VALUE_ARRAY[1] || ''}`, `MPa`, `Muros estructurales`, `f'c`, `${_VALUE_ARRAY[2] || ''}`, `MPa`,],
                        [2, 1, 1, 1, 2, 1, 1, 1,],
                        [{ align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        ],
                    )
                }
                condition = _VALUE_ARRAY[4] || _VALUE_ARRAY[5]
                if (condition) {
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`REFUERZO`,],
                        [1],
                        [{ align: 'center', bold: true, pretty: true }],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`Longitudinal >= 3/8"`, `f'y`, `${_VALUE_ARRAY[4] || ''}`, `MPa`, `Secundario (Estri/temp)`, `f'yt`, `${_VALUE_ARRAY[5] || ''}`, `MPa`,],
                        [2, 1, 1, 1, 2, 1, 1, 1,],
                        [{ align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        ],
                    )
                }

                condition = _VALUE_ARRAY[6] || _VALUE_ARRAY[7] || _VALUE_ARRAY[8] || _VALUE_ARRAY[9]
                if (condition) {
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`MUROS EN MAMPOSTERIA`,],
                        [1],
                        [{ align: 'center', bold: true, pretty: true }],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`A compresión `, `f'm`, `${_VALUE_ARRAY[6] || ''}`, `MPa`, `A compresión unitaria`, `f'yt`, `${_VALUE_ARRAY[7] || ''}`, `MPa`,],
                        [2, 1, 1, 1, 2, 1, 1, 1,],
                        [{ align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`Mortero de pega`, `f'cp`, `${_VALUE_ARRAY[8] || ''}`, `MPa`, `Mortero de relleno`, `f'cp`, `${_VALUE_ARRAY[9] || ''}`, `MPa`,],
                        [2, 1, 1, 1, 2, 1, 1, 1,],
                        [{ align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        ],
                    )
                }

                condition = _VALUE_ARRAY[10] || _VALUE_ARRAY[11] || _VALUE_ARRAY[12] || _VALUE_ARRAY[13];
                if (condition) {
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`ESTRUCTURAS METALICAS`,],
                        [1],
                        [{ align: 'center', bold: true, pretty: true }],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`Platinas `, `ASTM`, `${_VALUE_ARRAY[10] || ''}`, `Perfiles`, `ASTM`, `${_VALUE_ARRAY[11] || ''}`,],
                        [2, 1, 2, 2, 1, 2,],
                        [{ align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        ],
                    )
                    pdfSupport.rowConfCols2(doc, doc.y,
                        [`Pernos `, `ASTM`, `${_VALUE_ARRAY[12] || ''}`, `Soldaduras`, `ASTM`, `${_VALUE_ARRAY[13] || ''}`,],
                        [2, 1, 2, 2, 1, 2,],
                        [{ align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'left', bold: true },
                        { align: 'center' },
                        { align: 'center' },
                        ],
                    )
                }
            }
            if (SUBCATEGORIES[9] == '1') {
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 8, Análisis sísmico de la estructura. Aplicación de los movimientos sísmicos de diseño (Cap. A.3) este análisis se realiza sin ser dividido por el coeficiente de capacidad de disipación de energía, R, según los resultados del paso 6, se determinan los desplazamientos máximos de diseño y las fuerzas internas que se derivan de ellos. Desplazamiento máximo corresponde al 1% de la altura de entrepisos.`,],
                    [1],
                    [{ align: 'left', bold: true, },]
                )

                record_eng_sis = record_eng_sis.sort((a, b) => b.pos - a.pos);

                pdfSupport.rowConfCols2(doc, doc.y,
                    [`EVALUACIÓN DE CARGAS VERTICALES EN ENTREPISOS`,],
                    [1],
                    [{ align: 'center', bold: true, pretty: true }],
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Descripción `, `Nivel j\n[m]`, `h Piso\n[m]`, `Área plac\n[m2]`, `Den/Plac\n[kN/m2]`, `Peso/Plac\n[kN]`, `Col/Pan\n[kN]`, `Viga\n[kN]`, `Esca\n[kN]`, `peso tot\n[kN]`,],
                    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [{ align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    ],
                )

                let wc = _GET_STEP_TYPE('sis_wc', 'value') ? _GET_STEP_TYPE('sis_wc', 'value')[0] ? _GET_STEP_TYPE('sis_wc', 'value')[0] : 24 : 24;

                let _GET_DENPLAC_VALUE = (_value) => {
                    let _VALUE_ARRAY = _GET_STEP_TYPE('s4322', 'value');
                    if (!_value) return 0;
                    let value = _value.toLowerCase();
                    if (value.includes('piso') && !value.includes('1')) return _VALUE_ARRAY[30] || 0
                    if (value.includes('cubierta')) return _VALUE_ARRAY[31] || 0
                    return 0;
                }
                let _GET_PESOPLAC_VALUE = (row) => {
                    if (!row.denplac) return '0.00';
                    let area = row.area;
                    let denplac = row.denplac;
                    return Number(area * denplac).toFixed(2);
                }
                let _get_COLPAN_VALUE = (row) => {
                    let column;
                    column = JSON.parse(row.column);
                    column = JSON.parse(column);
                    if (!column) column = { n: 9, c1: 0.3, c2: 0.3 }
                    return Number(row.height * column.c1 * column.c2 * column.n * wc).toFixed(2);
                }
                let _get_VIGA = (row) => {
                    let column;
                    column = JSON.parse(row.column);
                    column = JSON.parse(column);
                    if (!column) column = { n: 9, c1: 0.3, c2: 0.3 }
                    return Number(row.height * column.c1 * column.c2 * column.n * wc * 0.85).toFixed(2);
                }
                let _get_TOT = (row) => {
                    let pesoplac = _GET_PESOPLAC_VALUE(row);
                    let column;
                    column = JSON.parse(row.column);
                    column = JSON.parse(column);
                    if (!column) column = { n: 9, c1: 0.3, c2: 0.3 }
                    let colpan = Number(row.height * column.c1 * column.c2 * column.n * wc).toFixed(2);
                    let viga = Number(row.height * column.c1 * column.c2 * column.n * wc * 0.85).toFixed(2);
                    let esca = row.esca;
                    let sum = Number(pesoplac) + Number(colpan) + Number(viga) + Number(esca);
                    return sum
                }

                _VALUE_ARRAY = _GET_STEP_TYPE('s4237', 'value');

                let get_d233 = () => {
                    let d232 = _VALUE_ARRAY[18] || 0
                    d232 = Number(d232);
                    let op = 0;
                    if (d232 < 0.5) op = 1;
                    else if (d232 < 2.5) op = 0.75 + 0.5 * d232;
                    else op = 2;

                    op = Number(op).toFixed(2)
                    return op;
                }
                let _get_WIHIK = (row, _array, _at, _object) => {
                    var k = get_d233();
                    //var hi = Math.abs(_get_SUMLEVEL(_array, row.id, row.name, true));
                    var hi = Number(row.height)
                    var wi = _get_TOT(row);
                    let op = wi * Math.pow(hi, k);
                    op = Number(op).toFixed(2)
                    return op;
                }
                record_eng_sis.map((value, i) => {
                    let column;
                    column = JSON.parse(value.column);
                    column = JSON.parse(column);
                    if (!column) column = { n: 9, c1: 0.3, c2: 0.3 }
                    return pdfSupport.rowConfCols2(doc, doc.y,
                        [`${value.name}`,
                        `${_get_SUMLEVEL(record_eng_sis, value.id, value.name)}`,
                        `${Number(value.height).toFixed(2)}`,
                        `${Number(value.area).toFixed(2)}`,
                        `${Number(value.denplac).toFixed(2)}`,
                        `${_GET_PESOPLAC_VALUE(value)}`,
                        `${Number(value.height * column.c1 * column.c2 * column.n * wc).toFixed(2)}`,
                        `${Number(value.height * column.c1 * column.c2 * column.n * wc * 0.85).toFixed(2)}`,
                        `${Number(value.esca).toFixed(2)}`,
                        `${_get_TOT(value).toFixed(2)}`,],
                        [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                        [{ align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        { align: 'center', },
                        ],
                    )
                }

                )

                var _TOTALES = {
                    height: 0,
                    pesoplac: 0,
                    colpan: 0,
                    viga: 0,
                    esca: 0,
                    wihik: 0,
                    cvi: 0,
                    f_x: 0,
                    f_y: 0,
                    tot: 0,
                }
                record_eng_sis.map((value, i) => {
                    let condition = value.pos == 1
                    if (condition) return;
                    let floor = value.name ? value.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
                    let con_down = (floor).includes('sotano') || (floor).includes('semisotano');

                    _TOTALES.height += Number(con_down ? 0 : value.height);
                    _TOTALES.pesoplac += Number(_GET_PESOPLAC_VALUE(value));
                    _TOTALES.colpan += Number(_get_COLPAN_VALUE(value));
                    _TOTALES.viga += Number(_get_VIGA(value));
                    _TOTALES.esca += Number(value.esca);
                    _TOTALES.tot += Number(_get_TOT(value));

                    _TOTALES.wihik += Number(_get_WIHIK(value, record_eng_sis, i, 'height'));

                })
                let get_d236 = () => {
                    let d231 = _VALUE_ARRAY[20] || 1
                    let op = d231 * _TOTALES.tot;
                    op = Number(op).toFixed(2)
                    return op;
                }
                let get_d237 = () => {
                    let d236 = get_d236();
                    let op = d236 / 10;
                    op = Number(op).toFixed(2)
                    return op;
                }
                let _get_CVI = (row, i) => {
                    var wihik = _get_WIHIK(row, record_eng_sis, i, 'height');
                    var wihik_total = _TOTALES.wihik;
                    let op = wihik / wihik_total;
                    op = Number(op).toFixed(3)
                    return op;
                }
                let _get_F_x = (row, i) => {
                    var cvi = _get_CVI(row, i);
                    let d236 = get_d236() ? get_d236() : 1;
                    let op = cvi * d236;
                    op = Number(op).toFixed(2)
                    return op;
                }
                let _get_F_y = (row, i) => {
                    var f_x = _get_F_x(row, i);
                    let op = f_x * 0.3;
                    op = Number(op).toFixed(2)
                    return op;
                }

                record_eng_sis.map((value, i) => {
                    let condition = value.pos == 1
                    if (condition) return;
                    _TOTALES.cvi += Number(_get_CVI(value, i));
                    _TOTALES.f_x += Number(_get_F_x(value, i));
                    _TOTALES.f_y += Number(_get_F_y(value, i));
                })
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`TOTALES: `,
                        ``,
                        `${(_TOTALES.height).toFixed(2)}`,
                        ``,
                        ``,
                        `${(_TOTALES.pesoplac.toFixed(2))}`,
                        `${(_TOTALES.colpan.toFixed(2))}`,
                        `${(_TOTALES.viga.toFixed(2))}`,
                        `${(_TOTALES.esca.toFixed(2))}`,
                        `${(_TOTALES.tot).toFixed(2)}`,],
                    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [{ align: 'right', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    ],
                )


                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`VSax = Say  `, `${_VALUE_ARRAY[20] || ''}`, `T < 0.5 K= 1.0`,],
                    [2, 1, 3,],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    ],
                    { width: 272.73 }
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Tf = `, `${_VALUE_ARRAY[18] || ''}`, `T(0.5 y 2.5) K=0.75+0.5T`,],
                    [2, 1, 3,],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    ],
                    { width: 272.73 }
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`K =`, `${get_d233()}`, `T > 2.5 K= 2.0`,],
                    [2, 1, 3,],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    ],
                    { width: 272.73 }
                )



                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Cortante sísmico basal    (Vs=Sa*g*M)     (Vs=Sa*W)`,],
                    [2,],
                    [{ align: 'left' },
                    ],
                    { width: 272.73 }
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Vs = `, `${get_d236()}`, `kN`,],
                    [2, 1, 3,],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    ],
                    { width: 272.73 }
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Vs  = `, `${get_d237()}`, `TON`,],
                    [2, 1, 3,],
                    [{ align: 'left' },
                    { align: 'center', bold: true },
                    { align: 'left' },
                    ],
                    { width: 272.73 }
                )


                _VALUE_ARRAY = _GET_STEP_TYPE('s4236', 'value');
                if (CATEGORY == '3' && _VALUE_ARRAY[11] == 'Análisis dinámico elástico') {

                    _VALUE_ARRAY = _GET_STEP_TYPE('elastic_sismi', 'value');
                    doc.text('\n');
                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 40, h: 1, text: 'ANÁLISIS SÍSMICO DINAMICO ELASTICO', config: { align: 'center', bold: true, valign: true, } },

                            { coord: [0, 1], w: 10, h: 1, text: `Tx modal`, config: { align: 'center', valign: true, } },
                            { coord: [10, 1], w: 10, h: 1, text: `${_VALUE_ARRAY[0]}`, config: { align: 'center', valign: true, } },
                            { coord: [0, 2], w: 10, h: 1, text: `Tajuste x`, config: { align: 'center', valign: true, } },
                            { coord: [10, 2], w: 10, h: 1, text: `${_VALUE_ARRAY[1]}`, config: { align: 'center', valign: true, } },
                            { coord: [0, 3], w: 10, h: 1, text: `SaX(g)`, config: { align: 'center', valign: true, } },
                            { coord: [10, 3], w: 10, h: 1, text: `${_VALUE_ARRAY[2]}`, config: { align: 'center', valign: true, } },
                            { coord: [0, 4], w: 10, h: 1, text: `VsX ton`, config: { align: 'center', valign: true, } },
                            { coord: [10, 4], w: 10, h: 1, text: `${_VALUE_ARRAY[3]}`, config: { align: 'center', valign: true, } },
                            { coord: [0, 5], w: 10, h: 1, text: `VsY * g`, config: { align: 'center', valign: true, } },
                            { coord: [10, 5], w: 10, h: 1, text: `${_VALUE_ARRAY[4]}`, config: { align: 'center', valign: true, } },
                            { coord: [0, 6], w: 10, h: 1, text: `90ntaX%`, config: { align: 'center', valign: true, } },
                            { coord: [10, 6], w: 10, h: 1, text: `${_VALUE_ARRAY[5]}`, config: { align: 'center', valign: true, } },
                            { coord: [0, 7], w: 10, h: 1, text: `90ntaX% * g`, config: { align: 'center', valign: true, } },
                            { coord: [10, 7], w: 10, h: 1, text: `${_VALUE_ARRAY[6]}`, config: { align: 'center', valign: true, } },

                            { coord: [20, 1], w: 10, h: 1, text: `Ty modal`, config: { align: 'center', valign: true, } },
                            { coord: [30, 1], w: 10, h: 1, text: `${_VALUE_ARRAY[7]}`, config: { align: 'center', valign: true, } },
                            { coord: [20, 2], w: 10, h: 1, text: `Tajuste y`, config: { align: 'center', valign: true, } },
                            { coord: [30, 2], w: 10, h: 1, text: `${_VALUE_ARRAY[8]}`, config: { align: 'center', valign: true, } },
                            { coord: [20, 3], w: 10, h: 1, text: `SaY(g)`, config: { align: 'center', valign: true, } },
                            { coord: [30, 3], w: 10, h: 1, text: `${_VALUE_ARRAY[9]}`, config: { align: 'center', valign: true, } },
                            { coord: [20, 4], w: 10, h: 1, text: `VsY`, config: { align: 'center', valign: true, } },
                            { coord: [30, 4], w: 10, h: 1, text: `${_VALUE_ARRAY[10]}`, config: { align: 'center', valign: true, } },
                            { coord: [20, 5], w: 10, h: 1, text: `VsY * g`, config: { align: 'center', valign: true, } },
                            { coord: [30, 5], w: 10, h: 1, text: `${_VALUE_ARRAY[11]}`, config: { align: 'center', valign: true, } },
                            { coord: [20, 6], w: 10, h: 1, text: `90ntaY%`, config: { align: 'center', valign: true, } },
                            { coord: [30, 6], w: 10, h: 1, text: `${_VALUE_ARRAY[12]}`, config: { align: 'center', valign: true, } },
                            { coord: [20, 7], w: 10, h: 1, text: `90ntaY% * g`, config: { align: 'center', valign: true, } },
                            { coord: [30, 7], w: 10, h: 1, text: `${_VALUE_ARRAY[13]}`, config: { align: 'center', valign: true, } },

                            { coord: [40, 0], w: 20, h: 1, text: 'ANÁLISIS MODAL ESPECTRAL', config: { align: 'center', bold: true, valign: true, } },

                            { coord: [40, 1], w: 10, h: 1, text: `Tx modal`, config: { align: 'center', valign: true, } },
                            { coord: [50, 1], w: 10, h: 1, text: `${_VALUE_ARRAY[14]}`, config: { align: 'center', valign: true, } },
                            { coord: [40, 2], w: 10, h: 1, text: `SaX modal (g)`, config: { align: 'center', valign: true, } },
                            { coord: [50, 2], w: 10, h: 1, text: `${_VALUE_ARRAY[15]}`, config: { align: 'center', valign: true, } },
                            { coord: [40, 3], w: 10, h: 1, text: `Ty modal`, config: { align: 'center', valign: true, } },
                            { coord: [50, 3], w: 10, h: 1, text: `${_VALUE_ARRAY[16]}`, config: { align: 'center', valign: true, } },
                            { coord: [40, 4], w: 10, h: 1, text: `SaY modal (g)`, config: { align: 'center', valign: true, } },
                            { coord: [50, 4], w: 10, h: 1, text: `${_VALUE_ARRAY[17]}`, config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [60, 8], { lineHeight: -1 });

                    doc.text('\n');

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 60, h: 1, text: 'AJUSTE DE RESULTADOS PARA REVISIÓN DE CORTANTE BASAL (A.5.4.5 NSR-10) CORTANTE BASAL CON EL MODELO INICIAL', config: { align: 'center', bold: true, valign: true, } },
                        ],
                        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 15, h: 1, text: `VS`, config: { align: 'center', valign: true, } },
                            { coord: [15, 0], w: 15, h: 1, text: `F1`, config: { align: 'center', valign: true, } },
                            { coord: [30, 0], w: 15, h: 1, text: `F2`, config: { align: 'center', valign: true, } },
                            { coord: [45, 0], w: 15, h: 1, text: `TOTAL`, config: { align: 'center', valign: true, } },

                            { coord: [0, 1], w: 15, h: 1, text: `Vs(x)`, config: { align: 'center', valign: true, } },
                            { coord: [15, 1], w: 15, h: 1, text: `${_VALUE_ARRAY[18]}`, config: { align: 'center', valign: true, } },
                            { coord: [30, 1], w: 15, h: 1, text: `${_VALUE_ARRAY[19]}`, config: { align: 'center', valign: true, } },
                            { coord: [45, 1], w: 15, h: 1, text: `${_VALUE_ARRAY[20]}`, config: { align: 'center', valign: true, } },

                            { coord: [0, 2], w: 15, h: 1, text: `Vs(x)`, config: { align: 'center', valign: true, } },
                            { coord: [15, 2], w: 15, h: 1, text: `${_VALUE_ARRAY[21]}`, config: { align: 'center', valign: true, } },
                            { coord: [30, 2], w: 15, h: 1, text: `${_VALUE_ARRAY[22]}`, config: { align: 'center', valign: true, } },
                            { coord: [45, 2], w: 15, h: 1, text: `${_VALUE_ARRAY[23]}`, config: { align: 'center', valign: true, } },

                        ],
                        [doc.x, doc.y], [60, 3], { lineHeight: -1 });

                    doc.text('\n');

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 15, h: 1, text: `${_VALUE_ARRAY[24]}`, config: { align: 'center', bold: true, valign: true, } },
                            { coord: [15, 0], w: 45, h: 1, text: 'FACTOR COORRECCIÓN', config: { align: 'center', bold: true, valign: true, } },

                            { coord: [0, 1], w: 15, h: 1, text: `Ajuste X`, config: { align: 'center', valign: true, } },
                            { coord: [15, 1], w: 15, h: 1, text: `${_VALUE_ARRAY[25]}`, config: { align: 'center', valign: true, } },
                            { coord: [30, 1], w: 15, h: 1, text: `${_VALUE_ARRAY[26]}`, config: { align: 'center', valign: true, } },
                            { coord: [45, 1], w: 15, h: 1, text: `m/s2`, config: { align: 'center', valign: true, } },


                            { coord: [0, 2], w: 15, h: 1, text: `Ajuste Y`, config: { align: 'center', valign: true, } },
                            { coord: [15, 2], w: 15, h: 1, text: `${_VALUE_ARRAY[27]}`, config: { align: 'center', valign: true, } },
                            { coord: [30, 2], w: 15, h: 1, text: `${_VALUE_ARRAY[28]}`, config: { align: 'center', valign: true, } },
                            { coord: [45, 2], w: 15, h: 1, text: `m/s2`, config: { align: 'center', valign: true, } },

                        ],
                        [doc.x, doc.y], [60, 3], { lineHeight: -1 });
                }



                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`ANÁLISIS SÍSMICO     MÉTODO FHE.`,],
                    [1],
                    [{ align: 'center', bold: true, pretty: true }],
                )

                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Descripción `, `Nivel i\n[m]`, `Hi\n[m]`, `Wi\n[m2]`, `Wi*(hi)^k`, `Cvi`, `F_x\n[kN]`, `F_y\n[kN]`,],
                    [2, 1, 1, 1, 1, 1, 1, 1,],
                    [{ align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    { align: 'center', bold: true },
                    ],
                )

                record_eng_sis.map((value, i) => pdfSupport.rowConfCols2(doc, doc.y,
                    [`${value.name}`,
                    `${_get_SUMLEVEL(record_eng_sis, value.id, value.name)}`,
                    `${Number(value.height).toFixed(2)}`,
                    `${_get_TOT(value).toFixed(2)}`,
                    `${_get_WIHIK(value, record_eng_sis, i, 'height')}`,
                    `${_get_CVI(value, i)}`,
                    `${_get_F_x(value, i)}`,
                    `${_get_F_y(value, i)}`,],
                    [2, 1, 1, 1, 1, 1, 1, 1,],
                    [{ align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    { align: 'center', },
                    ],
                ))
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`TOTALES: `,
                        ``,
                        `${(_TOTALES.height).toFixed(2)}`,
                        `${(_TOTALES.tot.toFixed(2))}`,
                        `${(_TOTALES.wihik.toFixed(2))}`,
                        `${(_TOTALES.cvi.toFixed(2))}`,
                        `${(_TOTALES.f_x.toFixed(2))}`,
                        `${(_TOTALES.f_y.toFixed(2))}`,],
                    [2, 1, 1, 1, 1, 1, 1, 1],
                    [{ align: 'right', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    { align: 'center', bold: true, },
                    ],
                )

            }
            if (SUBCATEGORIES[10] == '1') {
                _CHECK_ARRAY = _GET_STEP_TYPE('s433', 'check');
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 9, Desplazamientos horizontales. Se evalúan los desplazamientos horizontales, incluyendo los efectos torsionales dela estructura, las derivas (desplazamiento entre niveles continuos), por medio de los procedimientos del (Cap. A.6), y con base en los desplazamientos obtenidos en el paso 8.`,
                        `${validateCheck(_CHECK_ARRAY[0])}`],
                    [8, 1],
                    [{ align: 'left', bold: true, },
                    { align: 'center', bold: true, },]
                )
            }

            if (SUBCATEGORIES[11] == '1' && CATEGORY == 3) {
                _CHECK_ARRAY = _GET_STEP_TYPE('s43310_21', 'check');
                _VALUE_ARRAY = _GET_STEP_TYPE('s43310_21', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 40, h: 1, text: `Deriva admisible (A.6.4 NSR-10)`, config: { align: 'left', valign: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[0]}m`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[0])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 40, h: 1, text: `Deriva máxima`, config: { align: 'left', valign: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[1]}cm`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[1])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 40, h: 1, text: `Nivel en el que se obtuvo`, config: { align: 'left', valign: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[2]}cm`, config: { align: 'center', valign: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

            }


            if (SUBCATEGORIES[11] == '1') {
                _CHECK_ARRAY = _GET_STEP_TYPE('s43310', 'check');
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso10: Verificación de las derivas. Comprobar que las derivas no excedan los límites del (Cap. A.6), si la estructura excede dichos límites, es obligatorio rigidizarla y llevar a cabo los pasos 8, 9 y 10, hasta que cumpla.`,
                        `${validateCheck(_CHECK_ARRAY[0])}`],
                    [8, 1],
                    [{ align: 'left', bold: true, },
                    { align: 'center', bold: true, },]
                )
            }

            if (SUBCATEGORIES[11] == '1' && CATEGORY == 3) {
                _CHECK_ARRAY = _GET_STEP_TYPE('s43310_22', 'check');
                // _VALUE_ARRAY = _GET_STEP_TYPE('s43310_21', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 50, h: 1, text: `Desplazamientos horizontales. Se evalúan los desplazamientos horizontales, incluyendo los efectos torsionales dela estructura, las derivas (desplazamiento entre niveles continuos), por medio de los procedimientos del (Cap. A.6), y con base en los desplazamientos obtenidos en el paso 8.`, config: { align: 'left', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[0])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
            }

            if (SUBCATEGORIES[12] == '1') {
                _CHECK_ARRAY = _GET_STEP_TYPE('s43311', 'check');
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 11, Combinación de las diferentes solicitudes. De la combinación de las diferentes solicitudes sale la obtención de las fuerzas internas de diseño de la estructura, (Cap. B.2), por el método de diseño propio de cada material estructural, cada una de las combinaciones de carga se multiplica por un coeficiente de carga prescrito para esta combinación, en los efectos del sismo de diseño, se tiene en cuenta la capacidad de disipación de energía lo cual se logra empleando unos efectos sísmicos reducidos de diseño, E, determinadas en el paso 7, por el coeficiente de capacidad de disipar energía, R(E = Fs/R). `,
                        `${validateCheck(_CHECK_ARRAY[0])}`],
                    [8, 1],
                    [{ align: 'left', bold: true, },
                    { align: 'center', bold: true, },]
                )
            }
            if (SUBCATEGORIES[13] == '1') {
                _CHECK_ARRAY = _GET_STEP_TYPE('s43312', 'check');
                doc.text('\n');
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`Paso 12, Diseño de los elementos estructurales. Se lleva a cabo de acuerdo con los requisitos del sistema de resistencia sísmica y del material estructural utilizado, los materiales deben diseñarse de acuerdo con el grado de disipación de energía, prescrito en el Cap. A según corresponda, lo cual permitirá a la estructura responder ante la ocurrencia de un sismo, en el rango inelástico de respuesta, y cumplir con los objetivos de la norma sismo resistente, este diseño debe efectuarse con los elementos más desfavorables, entre las combinaciones obtenidas en el paso 11, tal como lo prescribe el título B del reglamento.`,
                        `${validateCheck(_CHECK_ARRAY[0])}`],
                    [8, 1],
                    [{ align: 'left', bold: true, },
                    { align: 'center', bold: true, },]
                )


                // CHEQUEO DE VIGAS
                let use_1 = _GET_STEP_TYPE('use_estructural', 'check')[0]
                if (use_1) {
                    _CHECK_ARRAY = _GET_STEP_TYPE('estructural_p1', 'check');
                    _VALUE_ARRAY = _GET_STEP_TYPE('estructural_p1', 'value');

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 60, h: 1, text: `Paso 1. CHEQUEO DE VIGAS`, config: { align: 'left', valign: true, bold: true, } },
                        ],
                        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                    const ESTRUCTURAL_P1 = [
                        { i: 0, c: 0, name: "Longitud libre Ln>=4h", name2: "NSR 10 C.21.5.1.2", ext: "m", },
                        { i: 1, c: 1, name: "Altura", name2: "NSR 10 C.15.13.3.1", ext: "m", },
                        { i: 2, name: "d - Recubirmiento min=4cm", ext: "m", },
                        { i: 3, name: "Base", ext: "m", },
                        { i: 4, c: 2, name: "Base minima requerida 1", name2: "NSR 10 C.21.5.1.3", ext: "m", },
                        { i: 5, name: "Base minima requerida 2", ext: "m", },
                        { i: 6, c: 3, name: "Base máxima permitida 1", name2: "NSR 10 C.21.5.1.4 (a)", ext: "m", },
                        { i: 7, c: 4, name: "Base máxima permitida 2", name2: "NSR 10 C.21.5.1.4 (a)", ext: "m", },
                        { i: 8, c: 5, name: "Base máxima permitida 3", name2: "NSR 10 C.21.5.1.4 (b)", ext: "m", },
                        { i: 9, c: 6, name: "Base máxima permitida 4", name2: "NSR 10 C.21.5.1.4 (b)", ext: "m", },
                        { i: 10, c: 7, name: "C = 1  Dimension de Columna medida en dirección de la luz para la cual se determinan los momentos", name2: "NSR 10 C.21.6.1.1", ext: "m", },
                        { i: 11, name: "C = 2", name2: "NSR 10 C.21.6.1.2", ext: "m", },
                        { name: "Revision de cuantias", },
                        { i: 12, name: "diámetro de varilla 1", i2: 29, i3: 30, ext2: "mm2", },
                        { i: 13, name: "cantidad de verillas 1 ", },
                        { i: 14, name: "diámetro de varilla 2", i2: 31, i3: 32, ext2: "mm2", },
                        { i: 15, name: "cantidad de verillas 2", },
                        { i: 16, name: "Acero planteado", ext: "mm2", },
                        { i: 17, c: 8, name: "d (Distancia desde el centroide del refuerzo a la fibra superior a compresión)", name2: "NSR 10 C.10.5.1, si no cumple revisar C.10.5.3", ext: "m", },
                        { i: 18, c: 9, name: "p min Cuantia mínima", name2: "NSR 10 C.10.5.1", },
                        { i: 19, c: 10, name: "p Cuantia actual", },
                        { i: 20, c: 11, name: "p max Cuantia máxima", name2: "NSR 10 C.10.3.2", },
                        { name: "Acero transversal NSR 10 C.21.5.3", },
                        { name: "ZONA CONFINADA", },
                        { i: 33, name: "ESTRIBOS", },
                        { i: 21, name: "Longitud mínima de la zona confinada", ext: "m", },
                        { i: 22, name: "Separación de estribos en la zona confinada", name2: "NSR 10 C.21.5.3.2", ext: "mm", },
                        { i: 23, name: "Separación de estribos requerida en la zona confinada 1", ext: "mm", },
                        { i: 24, name: "Separación de estribos requerida en la zona confinada 2", ext: "mm", },
                        { i: 25, name: "Separación de estribos requerida en la zona confinada 3", ext: "mm", },
                        { i: 26, name: "Separación de estribos requerida en la zona confinada 4", ext: "mm", },
                        { name: "ZONA NO CONFINADA", },
                        { i: 27, name: "Separación de estribos en la zona no confinada", name2: "NSR 10 C.21.5.3.4", ext: "mm", },
                        { i: 28, name: "Separación de estribos requerida en la zona no confinada", ext: "mm", },
                    ]

                    ESTRUCTURAL_P1.map(item => {
                        let v = (item.i2 != null ? (_VALUE_ARRAY[item.i2] + " ") : " ") + (item.i != null ? _VALUE_ARRAY[item.i] : " ") + (item.ext || "");
                        if (item.i3) v += " " + (item.i3 != null ? _VALUE_ARRAY[item.i3] : "") + (item.ext2 || "");

                        pdfSupport.table(doc,
                            [
                                { coord: [0, 0], w: 25, h: 1, text: item.name, config: { align: 'left', valign: true, } },
                                { coord: [25, 0], w: 10, h: 1, text: v, config: { align: 'center', valign: true, } },
                                { coord: [35, 0], w: 15, h: 1, text: item.name2 || " ", config: { align: 'left', valign: true, } },
                                { coord: [50, 0], w: 10, h: 1, text: item.c != null ? validateCheck(_CHECK_ARRAY[item.c]) : " ", config: { align: 'center', valign: true, bold: true } },
                            ],
                            [doc.x, doc.y], [60, 1], { lineHeight: -1, equalizePages: true, forceNewPage: true })
                    })
                }
                // CHEQUEO DE COLUMNAS
                let use_2 = _GET_STEP_TYPE('use_estructural', 'check')[1]
                if (use_2) {
                    _CHECK_ARRAY = _GET_STEP_TYPE('estructural_p2', 'check');
                    _VALUE_ARRAY = _GET_STEP_TYPE('estructural_p2', 'value');

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 60, h: 1, text: `Paso 2. CHEQUEO DE COLUMNAS`, config: { align: 'left', valign: true, bold: true, } },
                        ],
                        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                    const ESTRUCTURAL_P2 = [
                        { name: "Requisitos geometricos (Articulo C.21 NSR10)", },
                        { i: 0, name: "Dimensión de columna c1", ext: "m", },
                        { i: 1, name: "Dimensión de columna c2", ext: "m", },
                        { i: 2, c: 0, name: "Dimensión de columna mínima requerida (m)", ext: "m", },
                        { i: 3, name: "Longitud de columna", ext: "m", },
                        { i: 4, c: 1, name: "Área grosa de columna (Ag)", },
                        { i: 5, c: 2, name: "Relación entre la dimensión menor y mayor de la columna", },
                        { name: "Revision de cuantias NSR 10 C.21.6.3", },
                        { i: 6, c: 3, name: "Espcaiamiento horizontal entre estribos (hx)", nam2: "NSR 10 C.21.6.4.2", },
                        { i: 7, name: "Área grosa de columna (Ag)", ext: "mm2", },
                        { i: 8, name: "diámetro de varilla 1", ext: "mm", },
                        { i: 9, name: "cantidad de verillas 1", },
                        { i: 10, name: "diámetro de varilla 2", ext: "mm", },
                        { i: 11, name: "cantidad de verillas 2", },
                        { i: 12, name: "Acero planteado", ext: "mm", },
                        { i: 13, c: 4, name: "p Cuantia actual", nam2: "NSR 10 C.21.6.3.1", },
                        { i: 14, c: 5, name: "p max Cuantia máxima", nam2: "NSR 10 C.21.6.3.1", },
                        { name: "Acero transversal NSR 10 C.21.6.4", },
                        { i: 15, name: "Longitud libre de columna", ext: "m", },
                        { i: 16, name: "N estribos", i2: 32, ext: "mm", },
                        { name: "ZONA CONFINADA", },
                        { i: 17, c: 6, name: "Longitud de la zona confinada planteada", name2: "NSR 10 C.21.6.4.1", ext: "m", },
                        { i: 18, name: "Longitud de la zona confinada 1", ext: "m", },
                        { i: 19, name: "Longitud de la zona confinada 2", ext: "m", },
                        { i: 20, name: "Longitud de la zona confinada 3", ext: "m", },
                        { i: 21, c: 7, name: "Separación de estribos en la zona confinada", name2: "NSR 10 C.21.6.4.3", },
                        { i: 22, name: "Separación de estribos requerida en la zona confinada 1", ext: "mm", },
                        { i: 23, name: "Separación de estribos requerida en la zona confinada 2", ext: "mm", },
                        { i: 24, name: "Separación de estribos requerida en la zona confinada 3", ext: "mm", },
                        { name: "Revision de cuantia volumétrica en columnas", },
                        { i: 25, name: "Area encerrada por el refuerzo transversal (Aoh)", ext: "mm2", },
                        { name: "Area total de refuerzo transversal 1 (Ash1)", },
                        { i: 26, name: "Sentido corto", ext: "mm2", },
                        { i: 27, name: "Sentido largo", ext: "mm2", },
                        { name: "Area total de refuerzo transversal 2 (Ash2)", },
                        { i: 28, name: "Sentido corto", ext: "mm2", },
                        { i: 29, name: "Sentido largo", ext: "mm2", },
                        { name: " NSR 10 C.21.", },
                        { i: 30, c: 8, name: "sentido corto", ext: "mm2", },
                        { i: 31, c: 9, name: "sentido largo", ext: "mm2", },
                    ]

                    ESTRUCTURAL_P2.map(item => {
                        let v = (item.i2 != null ? (_VALUE_ARRAY[item.i2] + " ") : " ") + (item.i != null ? _VALUE_ARRAY[item.i] : " ") + (item.ext || "");

                        pdfSupport.table(doc,
                            [
                                { coord: [0, 0], w: 25, h: 1, text: item.name, config: { align: 'left', valign: true, } },
                                { coord: [25, 0], w: 10, h: 1, text: v, config: { align: 'center', valign: true, } },
                                { coord: [35, 0], w: 15, h: 1, text: item.name2 || " ", config: { align: 'left', valign: true, } },
                                { coord: [50, 0], w: 10, h: 1, text: item.c != null ? validateCheck(_CHECK_ARRAY[item.c]) : " ", config: { align: 'center', valign: true, bold: true } },
                            ],
                            [doc.x, doc.y], [60, 1], { lineHeight: -1, equalizePages: true, forceNewPage: true })
                    })
                }

                // CHEQUEO DE MUROS
                let use_3 = _GET_STEP_TYPE('use_estructural', 'check')[2]
                if (use_3) {
                    _CHECK_ARRAY = _GET_STEP_TYPE('estructural_p3', 'check');
                    _VALUE_ARRAY = _GET_STEP_TYPE('estructural_p3', 'value');

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 60, h: 1, text: `Paso 3. CHEQUEO DE MUROS`, config: { align: 'left', valign: true, bold: true, } },
                        ],
                        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                    const ESTRUCTURAL_P3 = [
                        { i: 0, name: "t - espesor del muro", ext: "mm", },
                        { i: 1, name: "Lw - Longitud del muro)", ext: "mm", },
                        { i: 2, name: "b - ancho elemento de borde", ext: "mm", },
                        { i: 3, name: "hx - Separacion maxima entre estribos en elemento de borde", ext: "mm", },
                        { i: 4, name: "s - Separacion estribos elementos de borde", ext: "mm", },
                        { i: 5, name: "Av - Area resistente de estribos y ganchos en elemento de borde", ext: "mm2", },
                        { i: 6, name: "db - Diametro de barras longitudinales ne leemntos de borde", ext: "mm", },
                        { i: 7, name: "hw", ext: "mm", },
                        { i: 8, name: "wd", ext: "kN/m2", },
                        { i: 9, name: "Ec", ext: "Mpa", },
                        { i: 10, name: "Aplanta", ext: "mm2", },
                        { i: 11, name: "Lx", ext: "m", },
                        { i: 12, name: "Ly", ext: "m", },
                        { i: 13, name: "pwx", },
                        { i: 14, name: "pwy", },
                        { i: 15, name: "hs", ext: "mm", },
                        { i: 16, name: "hs/t - mayor a 20 se considera esbelto , lo ideal es que sea menor a 16 ", },
                        { i: 17, name: "hw/lw", },
                        { i: 18, name: "c - según el diseño estructural", ext: "mm", },
                        { name: "C.21.9.6.4", },
                        { i: 19, name: "& u/hw_x - C.21.4.4.1", ext: "%", },
                        { i: 20, name: "& u/hw_y - C.21.4.4.1", ext: "%", },
                        { i: 21, name: "Lw /(600*(δu/hw))_x", ext: "mm", },
                        { i: 22, name: "Lw /(600*(δu/hw))_y", ext: "mm", },
                        { i: 23, name: "requiere elemento de borde", },
                        { name: "Chequeo elementos de borde en muros ", },
                        { i: 24, name: "bmin1", ext: "mm", },
                        { i: 25, name: "bmin2", ext: "mm", },
                        { i: 26, c: 0, name: "bmin3", ext: "mm", },
                        { name: "Espaciamiento en elementos de borde ", },
                        { i: 27, name: "Sconfi1", ext: "mm", },
                        { i: 28, name: "Sconfi2", ext: "mm", },
                        { i: 29, c: 1, name: "Sconfi3", ext: "mm", },
                        { name: "Refuerzo tranversal en elemento de borde", },
                        { i: 30, c: 2, name: "Ash", ext: "mm2", },
                        { name: "Cuantia mínima transversal en el alma de muro ", },
                        { i: 31, name: "s - Seapracion de barras a a corte en alma de muro", ext: "mm", },
                        { i: 32, name: "db - diametro de barras efectivas a corte en centro de muro", ext: "mm", },
                        { i: 33, name: "Ab", ext: "mm2", },
                        { i: 34, name: "pt Cuantia de acero en el alma", },
                        { i: 35, c: 3, name: "smax", ext: "mm", },
                        { i: 36, c: 4, name: "Pt_min", },
                        { name: "Cuantia mínima longitudinal en el alma de muro", },
                        { i: 37, name: "s - Seapracion de barras a a corte en alma de muro", ext: "mm", },
                        { i: 38, name: "db - diametro de barras efectivas a corte en centro de muro", ext: "mm", },
                        { i: 39, name: "Ab", ext: "mm2", },
                        { i: 40, name: "pl Cuantia de acero en el alma", },
                        { i: 41, c: 5, name: "smax", ext: "mm", },
                        { i: 42, c: 6, name: "Pl_min", },
                    ]

                    ESTRUCTURAL_P3.map(item => {
                        let v = (item.i != null ? _VALUE_ARRAY[item.i] : " ") + (item.ext || "");

                        pdfSupport.table(doc,
                            [
                                { coord: [0, 0], w: 35, h: 1, text: item.name, config: { align: 'left', valign: true, } },
                                { coord: [35, 0], w: 15, h: 1, text: v, config: { align: 'center', valign: true, } },
                                { coord: [50, 0], w: 10, h: 1, text: item.c != null ? validateCheck(_CHECK_ARRAY[item.c]) : " ", config: { align: 'center', valign: true, bold: true } },
                            ],
                            [doc.x, doc.y], [60, 1], { lineHeight: -1, equalizePages: true, forceNewPage: true })
                    })

                }

                const S9 = [
                    'Memorias de diseño de elementos estructurales',
                    'Memorias de diseño de cimentación',
                    'Memorias de diseño de placas de entrepiso',
                    'Memorias de diseño de escaleras',
                    'Memorias de diseño de muros',
                    'Memorias de diseño de tanques',
                    'Memorias de diseño de estructuras metálicas',
                    'Memorias de otros diseños',
                ];

                S9.map((value, i) => {
                    if (_CHECK_ARRAY[1 + i] != '2') pdfSupport.rowConfCols2(doc, doc.y,
                        [`${value}`,
                        `${validateCheck(_CHECK_ARRAY[1 + i])}`],
                        [8, 1],
                        [{ align: 'left', },
                        { align: 'center', bold: true, },]
                    )
                })
            }
            if (SUBCATEGORIES[17] == '1') {
                _CHECK_ARRAY = _GET_STEP_TYPE('fuego_p1', 'check');
                _VALUE_ARRAY = _GET_STEP_TYPE('fuego_p1', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: `PROCEDIMIENTO DE DISEÑO DE RESISTENCIA AL FUEGO DE LOS ELEMENTOS ESTRUCTURALES`, config: { align: 'left', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                const FUEGO_1 = [
                    { i: 0, name: 'TIPO DE OCUPACIÓN', ext: null, },
                    { i: 1, name: 'CATEGORIA DE LA EDIFICACIÓN (J.3.3-1 Y J.2.5-4 NSR-10)', ext: null, },
                    { i: 2, name: 'RESISTENCIA AL FUEGO ESPERADA EN HORAS', ext: null, },
                    { i: 3, name: 'PROVISIONES ESPECIALES', ext: null, },
                ];

                FUEGO_1.map(item => {
                    let v = (item.i != null ? _VALUE_ARRAY[item.i] : " ") + (item.ext || "");

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 35, h: 1, text: item.name, config: { align: 'left', valign: true, } },
                            { coord: [35, 0], w: 15, h: 1, text: v, config: { align: 'center', valign: true, } },
                            { coord: [50, 0], w: 10, h: 1, text: item.c != null ? validateCheck(_CHECK_ARRAY[item.c]) : " ", config: { align: 'center', valign: true, bold: true } },
                        ],
                        [doc.x, doc.y], [60, 1], { lineHeight: -1, equalizePages: true, forceNewPage: true })
                })

                _CHECK_ARRAY = _GET_STEP_TYPE('fuego_p2', 'check');
                _VALUE_ARRAY = _GET_STEP_TYPE('fuego_p2', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: `Paso 1. ELEMENTOS DE CONCRETO`, config: { align: 'left', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                const FUEGO_2 = [
                    { name: 'Columnas', name2: 'NSR 10 J.3.5-1', title: true, c: 0, ext: null, },
                    { i: 0, name: 'Horas de resistencia requeridas', ext: " Horas", },
                    { i: 1, name: 'C1', ext: 'm', },
                    { i: 2, name: 'C2', ext: 'm', },
                    { i: 3, name: 'Tipo de agregado', ext: null, },
                    { i: 4, name: 'Cmin', ext: null, },
                    { name: 'Losas', name2: 'NSR 10 J.3.5-2, J.3.5-3, J.3.5-5', title: true, c: 1 },
                    { i: 5, name: 'Horas de resistencia requeridas', ext: " Horas", },
                    { i: 6, name: 'Altura total placa H:', ext: 'm', },
                    { i: 7, name: 'Separacion nervios C:', ext: 'm', },
                    { i: 8, name: 'Loseta superior D1: ', ext: 'm', },
                    { i: 9, name: 'Alto Casetón D2:', ext: 'm', },
                    { i: 10, name: 'Ancho Vigueta B:', ext: 'm', },
                    { i: 11, name: 'Altura equivalente:', ext: 'm', },
                    { i: 12, name: 'Tipo de agregado', ext: null, },
                    { i: 13, name: 'Altura equivalente min:', ext: 'mm', },
                    { i: 14, name: 'Recubrimiento min losas:', ext: 'mm', },
                    { name: 'Vigas', title: true, },
                    { i: 15, name: 'Horas de resistencia requeridas', ext: " Horas", },
                    { i: 16, name: 'bw', ext: 'mm', },
                    { i: 17, name: 'Recubrimiento', ext: 'mm', },
                    { name: 'Elementos de Acero', title: true, c: 2, ext: null, },
                    { i: 18, name: 'Horas de resistencia requeridas', ext: " Horas", },
                    { i: 19, name: 'R', ext: 'min', },
                    { i: 20, name: 'R0', ext: 'min', },
                    { i: 21, name: 'H', ext: '%', },
                    { i: 22, name: 'W', ext: 'N/m', },
                    { i: 23, name: 'P', ext: 'mm', },
                    { i: 24, name: 'e', ext: 'mm', },
                    { i: 25, name: 'Kc', ext: 'J/h/m/K', },
                    { i: 26, name: 'Ta', ext: 'J/h/m/K)', },
                    { i: 27, name: 'dc', ext: 'kg/m3', },
                    { i: 28, name: 'Cc', ext: 'J/NK', },
                    { i: 29, name: 'L', ext: 'mm', },
                    { name: 'Elementos llenos de concreto', name2: 'NSR-10 J.3.5.4.6', title: true, c: 3, ext: null, },
                    { i: 30, name: 'Horas de resistencia requeridas', ext: " Horas", },
                    { i: 31, name: 'Pu', ext: 'kN', },
                    { i: 32, name: 'Pr', ext: 'kN', },
                    { i: 33, name: 'Pu/Pr', ext: null, },
                ];

                FUEGO_2.map(item => {
                    let v = (item.i != null ? _VALUE_ARRAY[item.i] : " ") + (item.ext || "");

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 25, h: 1, text: item.name, config: { align: 'left', valign: true, bold: item.title } },
                            { coord: [25, 0], w: 25, h: 1, text: item.name2 ? item.name2 : v, config: { align: 'center', valign: true, } },
                            { coord: [50, 0], w: 10, h: 1, text: item.c != null ? validateCheck(_CHECK_ARRAY[item.c]) : " ", config: { align: 'center', valign: true, bold: true } },
                        ],
                        [doc.x, doc.y], [60, 1], { lineHeight: -1, equalizePages: true, forceNewPage: true })
                })


                _CHECK_ARRAY = _GET_STEP_TYPE('fuego_p3', 'check');
                //_VALUE_ARRAY = _GET_STEP_TYPE('fuego_p2', 'value');
                let fp3_name = "Diseño de los elementos estructrurales contra el fuego: Presenta recomendaciones respecto al diseño de los elementos estructurales y no estructurales para la resistencia al fuego, estas recomendaciones cumplen con los requerimientos minimos de resistencia al fuego (en horas) calculados según lo prescrito en el Capítulo J. con el objetivo de que la estructura presente un comportamiento adecuado ante la ocurrencia de un incendio, estas recomendaciones deben ser aprobadas por el director de obra."
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 50, h: 1, text: fp3_name, config: { align: 'left', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: _CHECK_ARRAY[0] != null ? validateCheck(_CHECK_ARRAY[0]) : " ", config: { align: 'center', valign: true, bold: true } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1, equalizePages: true, forceNewPage: true })



            }

            if (
                (SUBCATEGORIES[14] == '1' && CATEGORY == '1')
                || (SUBCATEGORIES[15] == '1' && CATEGORY == '3')
            ) {
                counter++;
                pdfSupport.rowConfCols2(doc, doc.y,
                    [`4.3.${counter} Planos Estructurales`,],
                    [1],
                    [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
                )

                const S43 = [
                    'Coherencia técnica con los planos arquitectónicos',
                    'Coherencia con las memorias de cálculo',
                    'Especificaciones de materiales',
                    'Plantas de cimentación, entrepisos y cubierta',
                    'Detalle de losas de entrepiso',
                    'Diseño de cimentación',
                    'Diseño de columnas y muros',
                    'Diseño de vigas',
                    'Diseño de viguetas',
                    'Detalles de cubierta (elementos de cubierta, conexiones)',
                    'Diseño de escaleras',
                    'Detalle y refuerzo de tanques',
                    'Detalle y refuerzo estructuras de contención',
                    'Diseños de elementos no estructurales',
                    'Firma del ingeniero geotecnista en plano de cimentación (H.1.1.2.1)',

                ]
                if (CATEGORY == '3') S43.push(
                    'Firma del profesional responsable en cada documento entregado',
                    'Firma del revisor independiente en todo lo relacionado con el componente estructural',
                    'Firma del director de obra en planos y memorias de elementos no estructurales (A.1.3.6.5)',
                    'Firma del director de obra en el informe de demolición',
                )

                _CHECK_ARRAY = _GET_STEP_TYPE('s433b', 'check');
                S43.map((value, i) => {
                    if (_CHECK_ARRAY[i] != '2') pdfSupport.rowConfCols2(doc, doc.y,
                        [`${value}`,
                        `${validateCheck(_CHECK_ARRAY[i])}`],
                        [8, 1],
                        [{ align: 'left', },
                        { align: 'center', bold: true, },]
                    )
                })
            }
            if (CATEGORY == '3' && SUBCATEGORIES[16] == '1') {
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: 'Edificaciones de Mamposterías Titulo E', config: { align: 'center', bold: true, valign: true, fill: "gainsboro" } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                _CHECK_ARRAY = _GET_STEP_TYPE('mamposteria_01', 'check');
                _VALUE_ARRAY = _GET_STEP_TYPE('mamposteria_01', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 17, h: 1, text: `Area de entrepiso o cubierta`, config: { align: 'left', valign: true, } },
                        { coord: [17, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[0]}m2`, config: { align: 'center', valign: true, } },
                        { coord: [25, 0], w: 17, h: 1, text: `e (espesor del muro) =`, config: { align: 'left', valign: true, } },
                        { coord: [42, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[3]}`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[0])}`, config: { align: 'center', valign: true, bold: true, } },

                        { coord: [0, 1], w: 17, h: 1, text: `es cubierta ligera?`, config: { align: 'left', valign: true, } },
                        { coord: [17, 1], w: 8, h: 1, text: `${_VALUE_ARRAY[1]}`, config: { align: 'center', valign: true, } },
                        { coord: [25, 1], w: 17, h: 1, text: `e (mín) =`, config: { align: 'left', valign: true, } },
                        { coord: [42, 1], w: 8, h: 1, text: `${_VALUE_ARRAY[4]}`, config: { align: 'center', valign: true, } },

                        { coord: [0, 2], w: 17, h: 1, text: `número de pisos`, config: { align: 'left', valign: true, } },
                        { coord: [17, 2], w: 8, h: 1, text: `${_VALUE_ARRAY[2]}`, config: { align: 'center', valign: true, } },
                        { coord: [25, 2], w: 17, h: 1, text: `Zona de amenaza=`, config: { align: 'left', valign: true, } },
                        { coord: [42, 2], w: 8, h: 1, text: `${_VALUE_ARRAY[5]}`, config: { align: 'center', valign: true, } },

                    ],
                    [doc.x, doc.y], [60, 3], { lineHeight: -1 });

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: 'Paso 1. Chequeo longitud mínima de muros en cada dirección de análisis', config: { align: 'left', bold: true, valign: true } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                _CHECK_ARRAY = _GET_STEP_TYPE('mamposteria_02_', 'check');
                _VALUE_ARRAY = _GET_STEP_TYPE('mamposteria_02', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 17, h: 1, text: `Coeficiente Mo (E.3.6-1)`, config: { align: 'left', valign: true, } },
                        { coord: [17, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[0]}`, config: { align: 'center', valign: true, } },
                        { coord: [25, 0], w: 17, h: 1, text: `Ap `, config: { align: 'left', valign: true, } },
                        { coord: [42, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[1]}m^2`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[0])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 17, h: 1, text: `espesor del muro (t)`, config: { align: 'left', valign: true, } },
                        { coord: [17, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[2]}mn`, config: { align: 'center', valign: true, } },
                        { coord: [25, 0], w: 17, h: 1, text: `Longitud minima de muro en ambas direcciones (E.3.6.4)`, config: { align: 'left', valign: true, } },
                        { coord: [42, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[3]}m`, config: { align: 'center', valign: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Dirección`, config: { align: 'center', valign: true, bold: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `X`, config: { align: 'center', valign: true, bold: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `Y`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Longitud de muros`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[4]}m`, config: { align: 'center', valign: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[5]}m`, config: { align: 'center', valign: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Cumple Longitud minima?`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[1])}`, config: { align: 'center', valign: true, bold: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[2])}`, config: { align: 'center', valign: true, bold: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[3])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Cuanto falta para cumplir con el criterio?`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[6]}m`, config: { align: 'center', valign: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[7]}m`, config: { align: 'center', valign: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: 'Paso 2. Chequeo distancia de confinamiento', config: { align: 'left', bold: true, valign: true } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                _CHECK_ARRAY = _GET_STEP_TYPE('mamposteria_p2_', 'check');
                _VALUE_ARRAY = _GET_STEP_TYPE('mamposteria_p2', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Altura de entrepiso o cubierta`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[0]}m`, config: { align: 'center', valign: true, } },
                        { coord: [38, 0], w: 4, h: 1, text: `D1`, config: { align: 'left', valign: true, } },
                        { coord: [42, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[3]}m`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[0])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Distancia minima de confinamiento (E.4.3.3)`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[1]}m`, config: { align: 'center', valign: true, } },
                        { coord: [38, 0], w: 4, h: 1, text: `D2`, config: { align: 'left', valign: true, } },
                        { coord: [42, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[4]}m`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: ``, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Distancia minima horizontal de confinamiento calculada`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[2]}m`, config: { align: 'center', valign: true, } },
                        { coord: [38, 0], w: 4, h: 1, text: `D3`, config: { align: 'left', valign: true, } },
                        { coord: [42, 0], w: 8, h: 1, text: `${_VALUE_ARRAY[5]}m`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: ``, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });


                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: 'Paso 3. Aberturas en los muroso', config: { align: 'left', bold: true, valign: true } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                _CHECK_ARRAY = _GET_STEP_TYPE('mamposteria_p3_', 'check');
                _VALUE_ARRAY = _GET_STEP_TYPE('mamposteria_p3', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Área de muro`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[0]}m^2`, config: { align: 'center', valign: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Área de abertura`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[0]}m^2`, config: { align: 'center', valign: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[4]}`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[0])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Dimensión mínima de la abertura (E.3.4.1)`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[2]}m`, config: { align: 'center', valign: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 30, h: 1, text: `Distancia mínima entre aberturas (E.3.4.2)`, config: { align: 'left', valign: true, } },
                        { coord: [30, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[3]}m`, config: { align: 'center', valign: true, } },
                        { coord: [40, 0], w: 10, h: 1, text: `${_VALUE_ARRAY[5]}`, config: { align: 'center', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[1])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: 'Paso 4.Distribución simetrica de muros', config: { align: 'left', bold: true, valign: true } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                _CHECK_ARRAY = _GET_STEP_TYPE('mamposteria_p4_', 'check');
                // _VALUE_ARRAY = _GET_STEP_TYPE('mamposteria_p4', 'value');

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 50, h: 1, text: `Se realizó el chequeo de distribución simetrica de muros según lo preescrito en E.3.6.6, cumpliendo con la ecuación E.3.6-2 siendo el resultado de este calculo menor a 0.15`, config: { align: 'left', valign: true, } },
                        { coord: [50, 0], w: 10, h: 1, text: `${validateCheck(_CHECK_ARRAY[0])}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

                doc.text('\n');

            }



            pdfSupport.rowConfCols2(doc, doc.y,
                ['4.4 Evaluación del Proyecto',],
                [1,],
                [{ align: 'left', bold: true, pretty: true },]
            )

            const S44 = [
                'Los documentos aportados están firmados por los profesionales responsables de su elaboración',
                'Los profesionales cumplen con la experiencia mínima establecida en la ley 400 de 1997',
                'El proyecto estructural coincide con el diseño arquitectónico',
                '¿La cimentación y propuesta estructural recogen las recomendaciones del estudio de suelos?',
                'El sistema estructural propuesto se enmarca dentro de los tipos admitidos por la NSR-10',
                '¿Los sótanos o estructuras de cimentación invaden el antejardín y/o predios vecinos?',
                '¿La información estructural es suficiente para entender y construir el proyecto?',
                '¿De acuerdo con las áreas de construcción y/o altura de la edificación se requiere instrumentación sísmica?',
                '¿De requerirse instrumentación sísmica, el proyecto ha dispuesto los espacios arquitectónicos requeridos?',
                '¿El proyecto tiene sótanos o requiere realizar excavaciones y/o movimientos de tierra que generen taludes?',
                '¿El proyecto cumple con la separación sísmica mínima requerida?',
                '¿El proyecto requiere supervisión técnica estructural?',
                '¿El proyecto requiere supervisión geotécnica?',
                '¿Durante el proceso de revisión hubo cambios frente al proyecto inicial en materia de geometría, uso, alturas, etc?',
                '¿Estos cambios fueron notificados al asesor arquitectónico y jurídico?',
                'Visualización de planos y detalles claros (no borrosos) para verificar su cumplimiento',
            ];
            _CHECK_ARRAY = _GET_STEP_TYPE('s44', 'check');
            S44.map((value, i) => {
                if (_CHECK_ARRAY[i] != '2') pdfSupport.rowConfCols2(doc, doc.y,
                    [`${value}`,
                    `${validateCheck(_CHECK_ARRAY[i], true)}`],
                    [8, 1],
                    [{ align: 'left', },
                    { align: 'center', bold: true, },]
                )
            })

        }
        pdfSupport.rowConfCols2(doc, doc.y,
            [`${_BODY5}`,],
            [1,],
            [{ align: 'justify', bold: false, pretty: false },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`${simple ? 'CONCLUSIONES Y OBSERVACIONES' : '4.5 Diagnóstico del Proyecto'}`,],
            [1,],
            [{ align: 'left', bold: true, pretty: true },]
        )

        var details = record_eng_review ? record_eng_review.detail_2 ? record_eng_review.detail_2 : 'NO HAY OBSERVACIONES' : 'NO HAY OBSERVACIONES';
        pdfSupport.listText(doc, doc.y, details);

        doc.text('\n');

        pdfSupport.rowConfCols2(doc, doc.y,
            ['EVALUACIÓN DE VIABILIDAD ESTRUCTURAL',],
            [1,],
            [{ align: 'left', bold: true, pretty: true },]
        )

        let color = _DATA.rew.r_pending ? 'blanchedalmond' : _DATA.rew.r_check == 'VIABLE' ? 'paleturquoise' : 'lightsalmon';
        let color2 = _DATA.rew.r_pending ? 'blanchedalmond' : _DATA.rew.r_check_2 == 'VIABLE' ? 'paleturquoise' : _DATA.rew.r_check_2 == 'NO APLICA' ? 'paleturquoise' : 'lightsalmon';

        doc.startPage = doc.bufferedPageRange().count - 1;
        doc.lastPage = doc.startPage;

        if (_DATA.omit_date) pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 11, h: 2, text: 'PROFESIONAL REVISOR:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [11, 0], w: 10, h: 2, text: `${_DATA.rew.r_worker}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

                { coord: [21, 0], w: 18, h: 1, text: `${_DATA.rew.r_check_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 0], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check}`, config: { align: 'center', bold: true, valign: true, fill: color } },

                { coord: [21, 1], w: 18, h: 1, text: `${_DATA.rew.r_check_2_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 1], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_2}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

            ],
            [doc.x, doc.y], [47, 2], { lineHeight: -1 })
        else pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 11, h: 2, text: 'PROFESIONAL REVISOR:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [11, 0], w: 10, h: 2, text: `${_DATA.rew.r_worker}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

                { coord: [21, 0], w: 18, h: 1, text: `${_DATA.rew.r_check_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 0], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check}`, config: { align: 'center', bold: true, valign: true, fill: color } },

                { coord: [21, 1], w: 18, h: 1, text: `${_DATA.rew.r_check_2_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 1], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_2}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

                { coord: [47, 0], w: 6, h: 2, text: 'FECHA:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [53, 0], w: 7, h: 2, text: `${_DATA.rew.r_date}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            ],
            [doc.x, doc.y], [60, 2], { lineHeight: -1 })


        /*
        if (_DATA.omit_date) pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 11, h: 3, text: 'PROFESIONAL REVISOR:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [11, 0], w: 10, h: 3, text: `${_DATA.rew.r_worker}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

                { coord: [21, 0], w: 18, h: 1, text: `${_DATA.rew.r_check_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 0], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check}`, config: { align: 'center', bold: true, valign: true, fill: color } },

                { coord: [21, 1], w: 18, h: 1, text: `${_DATA.rew.r_check_2_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 1], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_2}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

                { coord: [21, 2], w: 18, h: 1, text: `${_DATA.rew.r_check_3_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 2], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_3}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

            ],
            [doc.x, doc.y], [47, 3], { lineHeight: -1 })
        else pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 11, h: 3, text: 'PROFESIONAL REVISOR:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [11, 0], w: 10, h: 3, text: `${_DATA.rew.r_worker}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

                { coord: [21, 0], w: 18, h: 1, text: `${_DATA.rew.r_check_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 0], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check}`, config: { align: 'center', bold: true, valign: true, fill: color } },

                { coord: [21, 1], w: 18, h: 1, text: `${_DATA.rew.r_check_2_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 1], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_2}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

                { coord: [21, 2], w: 18, h: 1, text: `${_DATA.rew.r_check_3_c}`, config: { align: 'left', bold: true, valign: true, } },
                { coord: [39, 2], w: 8, h: 1, text: `${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check_3}`, config: { align: 'center', bold: true, valign: true, fill: color2 } },

                { coord: [47, 0], w: 6, h: 3, text: 'FECHA:', config: { align: 'center', bold: true, valign: true, } },

                { coord: [53, 0], w: 7, h: 3, text: `${_DATA.rew.r_date}`, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            ],
            [doc.x, doc.y], [60, 3], { lineHeight: -1 })
            */
    }
}

function getAditionIndex(_array, _at, _object) {
    var sum = 0;
    for (let i = 0; i < _array.length; i++) {
        const element = _array[i];
        if (i >= _at) {
            sum += Number(element[_object])
        }
    }
    return sum.toFixed(2);
}

function _get_SUMLEVEL(_array, _id, _floor, useP1) {
    let _CHILDREN = _array;

    let floor = _floor ? _floor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
    let con_up = (floor).includes('piso') || (floor).includes('nivel') || (floor).includes('planta') || (floor).includes('cubierta') || (floor).includes('atico');
    let con_down = (floor).includes('sotano') || (floor).includes('semisotano');
    let con_n = (floor).replace(/^\D+/g, '') == 1;

    if (con_up && con_n && !useP1) return 0;

    let index = -1;
    let sum = 0

    if (con_up) {
        _CHILDREN = _CHILDREN.filter(item => {
            let floor = item.name ? item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
            let con_floor = (floor).includes('piso') || (floor).includes('nivel') || (floor).includes('planta') || (floor).includes('cubierta') || (floor).includes('atico');
            return con_floor;
        })

        _CHILDREN.map((item, i) => { if (item.id == _id) index = i })

        _CHILDREN.map((item, i) => { if (i <= index) sum += Number(item.height) })

        return (sum).toFixed(2);

    }
    if (con_down) {
        _CHILDREN = _CHILDREN.filter(item => {
            let floor = item.name ? item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
            let con_floor = (floor).includes('sotano') || (floor).includes('semisotano');
            return con_floor;
        })

        _CHILDREN.reverse();

        _CHILDREN.map((item, i) => { if (item.id == _id) index = i })

        _CHILDREN.map((item, i) => { if (i <= index) sum -= Number(item.height) })

        return (sum).toFixed(2);

    }
}
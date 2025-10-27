const db = require("../models");

const RL = db.record_law;
const RR = db.record_law_review;
const R1L = db.record_law_11_liberty;
const R1T = db.record_law_11_tax;
const RLS = db.record_law_step;

const R_R = db.record_review;

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

const RG = db.record_law_gen;
const RD = db.record_law_doc;
const RLI = db.record_law_licence;
const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");
const curaduriaInfo = require('../config/curaduria.json')
const typeParse = require("../config/typeParse");
const funParser = require("../config/funCustomArrays");

// GET.
exports.findAll = (req, res) => {
    RL.findAll({
        include: [RG, RD, RD, RR, R1L, R1T, RLI],
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
exports.findSingle = (req, res) => {
    const _id = req.params.id;
    RL.findAll({
        include: [RG, RLS, RR, R1L, R1T, RLI],
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
// GET BY ID
exports.findOne = (req, res) => {
    res.json({ message: "NOT IMPLEMENTED, SORRY" });
};

// POST
exports.create = (req, res) => {
    var object = {
        id_public: (req.body.id_public ? req.body.id_public : null),
        version: (req.body.version ? req.body.version : null),
        fun0Id: (req.body.fun0Id ? req.body.fun0Id : res.send('NO A REAL ID PARENT')),
        worker_id: (req.body.worker_id ? req.body.worker_id : null),
        date_asign: (req.body.date_asign ? req.body.date_asign : null),
        worker_prev: (req.body.worker_prev ? req.body.worker_prev : null),
        worker_name: (req.body.worker_name ? req.body.worker_name : null),
    }
    RL.create(object)
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
exports.creategen = (req, res) => {
    var object = {
        recordLawId: (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT')),
        version: (req.body.version ? req.body.version : null),
        date: (req.body.date ? req.body.date : null),
        id_public: (req.body.id_public ? req.body.id_public : null),
        type: (req.body.type ? req.body.type : null),
        id_6: (req.body.id_6 ? req.body.id_6 : null),
        class: (req.body.class ? req.body.class : null),
    }
    RG.create(object)
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
exports.createdoc = (req, res) => {
    var object = {
        recordLawId: (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT')),
        version: (req.body.version ? req.body.version : null),
        docs: (req.body.docs ? req.body.docs : null),
        docs_id6: (req.body.docs_id6 ? req.body.docs_id6 : null),
        docs_14: (req.body.docs_14 ? req.body.docs_14 : null),
        docs_14_id6: (req.body.docs_14_id6 ? req.body.docs_14_id6 : null),
        docs_14_desc: (req.body.docs_14_desc ? req.body.docs_14_desc : null),
        docs_16: (req.body.docs_16 ? req.body.docs_16 : null),
        docs_16_id6: (req.body.docs_16_id6 ? req.body.docs_16_id6 : null),
        docs_16_desc: (req.body.docs_16_desc ? req.body.docs_16_desc : null),
        docs_23: (req.body.docs_23 ? req.body.docs_23 : null),
        docs_sign: (req.body.docs_sign ? req.body.docs_sign : null),
        corrections: (req.body.corrections ? req.body.corrections : null),
        doc_fun: (req.body.doc_fun ? req.body.doc_fun : null),
    }
    RD.create(object)
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
exports.createreview = (req, res) => {
    var object = {
        recordLawId: (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT')),
        version: (req.body.version ? req.body.version : null),
        detail: (req.body.detail ? req.body.detail : null),
        worker_id: (req.body.worker_id ? req.body.worker_id : null),
        worker_name: (req.body.worker_name ? req.body.worker_name : null),
        date: (req.body.date ? req.body.date : null),
        notify_name: (req.body.notify_name ? req.body.notify_name : null),
        notify_id: (req.body.notify_id ? req.body.notify_id : null),
        notify_date: (req.body.notify_date ? req.body.notify_date : null),
        check: (req.body.check ? req.body.check : null),
    }
    RR.create(object)
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
exports.create11liberty = (req, res) => {
    var object = {
        recordLawId: (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT')),
        id_public: (req.body.id_public ? req.body.id_public : null),
        date: (req.body.date ? req.body.date : null),
        address: (req.body.address ? req.body.address : null),
        boundary: (req.body.boundary ? req.body.boundary : null),
        lastnotify: (req.body.lastnotify ? req.body.lastnotify : null),
        specify: (req.body.specify ? req.body.specify : null),
        subject: (req.body.subject ? req.body.subject : null),
        subject_id: (req.body.subject_id ? req.body.subject_id : null),
        desc: (req.body.desc ? req.body.desc : null),
        active: (req.body.active ? req.body.active : null),
        predial: (req.body.predial ? req.body.predial : null),
        predial_2: (req.body.predial_2 ? req.body.predial_2 : null),
        id_6: (req.body.id_6 ? req.body.id_6 : null),
    }
    R1L.create(object)
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
exports.create11tax = (req, res) => {
    var object = {
        recordLawId: (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT')),
        id_public: (req.body.id_public ? req.body.id_public : null),
        date: (req.body.date ? req.body.date : null),
        address: (req.body.address ? req.body.address : null),
        predial: (req.body.predial ? req.body.predial : null),
        predial_2: (req.body.predial_2 ? req.body.predial_2 : null),
        strata: (req.body.strata ? req.body.strata : null),
        destiny: (req.body.destiny ? req.body.destiny : null),
        active: (req.body.active ? req.body.active : null),
        id_6: (req.body.id_6 ? req.body.id_6 : null),
        type: (req.body.type ? req.body.type : null),
    }
    R1T.create(object)
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
exports.createlicence = (req, res) => {
    var object = {
        recordLawId: (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT')),
        id_public: (req.body.id_public ? req.body.id_public : null),
        date_a: (req.body.date_a ? req.body.date_a : null),
        date_b: (req.body.date_b ? req.body.date_b : null),
        type: (req.body.type ? req.body.type : null),
        category: (req.body.category ? req.body.category : null),
        id_6: (req.body.id_6 ? req.body.id_6 : null),
        check: (req.body.check ? req.body.check : null),
        active: 1,
    }
    RLI.create(object)
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
exports.createStep = (req, res) => {
    var object = {
        recordLawId: (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT')),
        version: (req.body.version ? req.body.version : null),
        id_public: (req.body.id_public ? req.body.id_public : null),
        check: (req.body.check ? req.body.check : null),
        value: (req.body.value ? req.body.value : null),
        json: (req.body.json ? req.body.json : null),
    }
    RLS.create(object)
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

exports.newrecord = (req, res) => {
    var recordLawId = (req.body.recordLawId ? req.body.recordLawId : res.send('NO A REAL ID PARENT'));

    var object_law = {
        version: (req.body.version != 'null' ? req.body.version : 0),
    }

    var object_docs = {
        recordLawId: recordLawId,
        version: (req.body.version != 'null' ? req.body.version : null),
        docs: (req.body.docs != 'null' ? req.body.docs : null),
        docs_id6: (req.body.docs_id6 != 'null' ? req.body.docs_id6 : null),
        docs_14: (req.body.docs_14 != 'null' ? req.body.docs_14 : null),
        docs_14_id6: (req.body.docs_14_id6 != 'null' ? req.body.docs_14_id6 : null),
        docs_16: (req.body.docs_16 != 'null' ? req.body.docs_16 : null),
        docs_16_id6: (req.body.docs_16_id6 != 'null' ? req.body.docs_16_id6 : null),
        docs_21: (req.body.docs_21 != 'null' ? req.body.docs_21 : null),
        docs_21_id6: (req.body.docs_21_id6 != 'null' ? req.body.docs_21_id6 : null),
        docs_23: (req.body.docs_23 != 'null' ? req.body.docs_23 : null),
        docs_24: (req.body.docs_24 != 'null' ? req.body.docs_24 : null),
        docs_sign: (req.body.docs_sign != 'null' ? req.body.docs_sign : null),
        corrections: (req.body.corrections != 'null' ? req.body.corrections : null),
    }

    RL.update(object_law, {
        where: { id: recordLawId }
    }).then(num => {
        if (num == 1) {
            create_docs();
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })

    function create_docs() {
        RD.create(object_docs)
            .then(data => {
                res.send('OK');
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while executing CREATE."
                });
            });
    }

};
// PUT
exports.update = (req, res) => {
    const id = req.params.id;
    RL.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.updategen = (req, res) => {
    const id = req.params.id;
    RG.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.updatedoc = (req, res) => {
    const id = req.params.id;
    RD.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.updatereview = (req, res) => {
    const id = req.params.id;
    RR.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.update11liberty = (req, res) => {
    const id = req.params.id;
    R1L.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.update11tax = (req, res) => {
    const id = req.params.id;
    R1T.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.updatelicence = (req, res) => {
    const id = req.params.id;
    RLI.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.updateStep = (req, res) => {
    const id = req.params.id;
    RLS.update(req.body, {
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
    res.json({ message: "NOT IMPLEMENTED, SORRY" });
};
exports.delete11liberty = (req, res) => {
    const id = req.params.id;
    R1L.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};
exports.delete11tax = (req, res) => {
    const id = req.params.id;
    R1T.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};
exports.deletegen = (req, res) => {
    const id = req.params.id;
    RG.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};
exports.deletelicence = (req, res) => {
    const id = req.params.id;
    RLI.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};

exports.deleteAll = (req, res) => {
    res.json({ message: "NOT IMPLEMENTED, SORRY" });
};

exports.pdfgen = (req, res) => {
    var _DATA = {
        id: (req.body.id != 'null' ? req.body.id : 0),
        version: (req.body.version != 'null' ? req.body.version : 0),
        type_rev: req.body.type_rev ? req.body.type_rev : 1,
    }

    FUN_0.findOne({
        include:
            [R_R,
                {
                    model: RL, include:
                        [
                            RLS,
                            { model: RR, where: { version: 1 }, required: false, },
                            R1L,
                            R1T
                        ],
                    where: { version: 1 }, required: false,
                },
                { model: FUN_1, where: { version: 1 }, required: false, },
                { model: FUN_2 },
                { model: FUN_3 },
                { model: FUN_51 },
                { model: FUN_52 },
                { model: FUN_53, where: { version: 1 }, required: false, },
                { model: FUN_R, where: { version: 1 }, required: false, },
                { model: FUN_LAW },

            ],
        where: { id: _DATA.id, }
    })
        .then(data => {
            /*
            console.log('OBJECT TO DISPLAY')
            console.table(data)
            console.log(data)
            */
            let DATA = data;
            DATA.rew = {
                r_worker: req.body.r_worker ? req.body.r_worker : '',
                r_check: req.body.r_check ? req.body.r_check : 'NO VIABLE',
                r_date: req.body.r_date ? req.body.r_date : '',
                r_pending: req.body.r_law_pending === 'true' ? 1 : 0,
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
                res.send('OK');

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
    doc.pipe(fs.createWriteStream('./docs/public/output_recorwd_law_blank.pdf'));
    PDFGEN_LAW_RECORD(_DATA, doc);
    pdfSupport.setHeader(doc, { title: 'INFORME JURIDICO', size: 13, icon: true, id_public: _DATA ? _DATA.id_public : '', header: _DATA.header.use })
    doc.end();
    return true;
}

function _COMPONENT_DOC_CHECK(_FUN_R, _checks) {
    const FUN6JSON = require('../config/fun6DocsList.json')
    let _DOCS = _FUN_R.code;
    let _VALUE = _FUN_R.checked;
    let _REVIEW = _FUN_R.review;

    if (!_DOCS || !_VALUE) return [[0, '', 'NO', 'CUMPLE']];
    _DOCS = _DOCS.split(',');
    _VALUE = _VALUE.split(',');
    _REVIEW = _REVIEW ? _REVIEW.split(',') : [];

    let TABLE = [];

    for (let i = 0; i < _checks.length; i++) {
        const checks = _checks[i];
        var indexTocheck = _DOCS.indexOf(checks)
        var needDoc = _VALUE[indexTocheck]
        var newRow = [];
        var reviewDoc = 'NO CUMPLE'
        for (let j = 0; j < _REVIEW.length; j++) {
            const review = _REVIEW[j];
            if (review.includes(checks)) {
                var r = review.split('&');
                if (r[1] == 1) { reviewDoc = 'CUMPLE'; break; }
            }
        }

        newRow.push(checks);
        newRow.push(FUN6JSON[checks]);
        if (indexTocheck == -1) newRow.push('NO');
        if (needDoc == 0) newRow.push('NO');
        if (needDoc == 1) newRow.push('SI');
        if (needDoc == 2) newRow.push('N/A');

        newRow.push(reviewDoc);
        if (needDoc == 1 || needDoc == 0) TABLE.push(newRow)
    }

    return TABLE
}
function LOAD_STEP(_id_public, record_step, version) {
    var _CHILD = record_step;
    for (var i = 0; i < _CHILD.length; i++) {
        if (_CHILD[i].version == version && _CHILD[i].id_public == _id_public) return _CHILD[i]
    }
    return {}
}
function _GET_STEP_TYPE(_id_public, _type, record_step, version) {
    var STEP = LOAD_STEP(_id_public, record_step, version);
    if (!STEP.id) return [];
    var value = STEP[_type] ? STEP[_type] : []
    if (!value) return [];
    if (!value.length) return [];
    value = value.split(';');
    return value
}

exports.PDFGEN_LAW_RECORD_EXP = (_DATA, doc, simple) => {
    PDFGEN_LAW_RECORD(_DATA, doc, simple)
}
function PDFGEN_LAW_RECORD(_DATA, doc, simple) {
    const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
    const fun_2 = _DATA ? _DATA.fun_2 ? _DATA.fun_2 : {} : {};
    const fun_3 = _DATA ? _DATA.fun_3s : [];
    const fun_51 = _DATA ? _DATA.fun_51s : [];
    const fun_52 = _DATA ? _DATA.fun_52s : [];
    const fun_53 = _DATA ? _DATA.fun_53s ? _DATA.fun_53s.length > 0 ? _DATA.fun_53s[0] : false : false : false;
    const fun_law = _DATA ? _DATA.fun_law ? _DATA.fun_law : false : false;
    const fun_r = _DATA ? _DATA.fun_rs ? _DATA.fun_rs.length > 0 ? _DATA.fun_rs[0] : false : false : false;
    const fun_clocks = _DATA ? _DATA.fun_clocks : [];

    const record_law = _DATA ? _DATA.record_law : false;
    const record_law_steps = record_law ? record_law.record_law_steps ? record_law.record_law_steps : [] : [];
    const record_law_review = record_law ? record_law.record_law_reviews ? record_law.record_law_reviews[0] : false : false;
    const record_law_11_liberties = record_law ? record_law.record_law_11_liberties ? record_law.record_law_11_liberties.length > 0 ? record_law.record_law_11_liberties[0] : false : false : false;
    const record_law_11_taxes = record_law ? record_law.record_law_11_taxes ? record_law.record_law_11_taxes.length > 0 ? record_law.record_law_11_taxes[0] : false : false : false;

    const record_rev = _DATA ? _DATA.recorc_rev ? _DATA.recorc_rev : {} : {};

    const rules = _DATA.rules ? _DATA.rules.split(';') : [];

    const _BODY = `A continuación, se lista la documentación que sirve de base para la revisión del proyecto en función de la 
    actuación urbanística radicada y sobre la cual se pronunciará la asesora jurídica en los aspectos de calidad y pertinencia del 
    documento con el fin de establecer la titularidad de licencia y del predio.`.replace(/[\n\r]+ */g, ' ');

    const _fun_0_type = { '0': 'NC', 'i': 'I', 'ii': "II", 'iii': "III", 'iv': "IV", 'oa': "OA" }
    const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };

    const V = {
        0: 'NO',
        1: 'SI',
        2: 'NA',
    }

    const V2 = {
        0: 'SI',
        1: 'NO',
        2: 'NA',
    }

    const V3 = {
        0: 'NO CUMPLE',
        1: 'CUMPLE',
        2: 'NA',
    }

    const _checkV = (_v, _var) => {
        if (_v == null || _v == undefined) return _var[0]
        return _var[_v]
    }

    let _FIND_PROFESIOANL = (_role) => {
        for (var i = 0; i < fun_52.length; i++) {
            if (fun_52[i].role.includes(_role)) return fun_52[i];
        }
        return false;
    }

    let _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = fun_clocks;
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }


    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    let _prof = _FIND_PROFESIOANL('URBANIZADOR O CONSTRUCTOR RESPONSABLE');
    if (!_prof) _prof = _FIND_PROFESIOANL('DIRECTOR DE LA CONSTRUCCION');

    let prof = {
        name: fun_53 ? fun_53.name + ' ' + fun_53.surname : ' ',
        mat: fun_53 ? fun_53.id_number : ' ',
        number: fun_53 ? fun_53.number : ' ',
        email: fun_53 ? fun_53.email : ' ',
        mat_date: fun_53 ? fun_53.email : ' ',
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


    var _CHECK_ARRAY = _GET_STEP_TYPE('f53', 'check', record_law_steps, record_law.version);
    var poder = _CHECK_ARRAY[4] == 0 ? 'GENERAL' : _CHECK_ARRAY[4] == 1 ? 'ESPECIAL' : _CHECK_ARRAY[4] == 2 ? 'MANDATO' : ''

    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.startPage = undefined;
    doc.lastPage = undefined;

    if (!simple) {
        // TABLE HEADERSS
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 22, h: 1, text: 'II. REVISIÓN JURÍDICA', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
                { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 0], w: 10, h: 1, text: 'INFORME', config: { bold: true, fill: 'steelblue', color: 'white' } },
                { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [34, 0], w: 8, h: 1, text: 'OBSERVACIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
                { coord: [42, 0], w: 2, h: 1, text: _DATA.type_rev == 1 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
                { coord: [44, 0], w: 8, h: 1, text: 'CORRECCIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
                { coord: [52, 0], w: 2, h: 1, text: _DATA.type_rev == 2 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },

                { coord: [0, 1], w: 8, h: 1, text: 'Responsable solicitud', config: { align: 'left' } },
                { coord: [8, 1], w: 14, h: 1, text: prof.name, config: { align: 'left' } },
                { coord: [22, 1], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 1], w: 10, h: 1, text: 'Control Revisión', config: { align: 'center' } },
                { coord: [33, 1], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [0, 2], w: 8, h: 1, text: 'Número documento', config: { align: 'left' } },
                { coord: [8, 2], w: 14, h: 1, text: prof.mat, config: { align: 'left' } },
                { coord: [22, 2], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 2], w: 6, h: 1, text: 'Fecha Ingreso', config: { align: 'left' } },
                { coord: [29, 2], w: 4, h: 1, text: _GET_CLOCK_STATE(5).date_start, config: { align: 'center' } },
                { coord: [33, 2], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [34, 2], w: 20, h: 1, text: '', config: { hide: true } },

                { coord: [0, 3], w: 8, h: 1, text: 'Tipo poder', config: { align: 'left' } },
                { coord: [8, 3], w: 14, h: 1, text: poder, config: { align: 'left' } },
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
                //{ coord: [34, 4], w: 20, h: 1, text: '', config: { hide: true } },

                { coord: [0, 5], w: 8, h: 1, text: 'Teléfono', config: { align: 'left' } },
                { coord: [8, 5], w: 14, h: 1, text: prof.number, config: { align: 'left' } },
                { coord: [22, 5], w: 1, h: 1, text: '', config: { hide: true } },
                { coord: [23, 5], w: 6, h: 1, text: 'Fecha Desistir', config: { align: 'left' } },
                { coord: [29, 5], w: 4, h: 1, text: final_date, config: { align: 'center' } },
                { coord: [33, 5], w: 1, h: 1, text: '', config: { hide: true } },
                //{ coord: [34, 5], w: 20, h: 1, text: '', config: { hide: true } },

                { coord: [34, 1], w: 20, h: 5, text: typeParse.formsParser1(fun_1), config: { bold: true, fill: 'gold', align: 'center', valign: true } },

            ],
            [doc.x, doc.y],
            [54, 6],
            {})


        doc.fontSize(8);
        if (curaduriaInfo.id == 'cup1') doc.fontSize(10);

        doc.text('\n');


        pdfSupport.rowConfCols2(doc, doc.y,
            ['2.1 INVENTARIO DE  INFORMACION APORTADA',],
            [1,],
            [{ align: 'left', bold: true, pretty: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Revisión Documentos requeridos para la actuación urbanística solicitada.  A continuación, se lista la documentación que sirve de base para la revisión del proyecto en función de la actuación urbanística radicada y sobre la cual se pronunciará la asesora jurídica en los aspectos de calidad y pertinencia del documento.',],
            [1,],
            [{ align: 'justify' },]
        )
        // THIS PART IS DEPRECATED, MAY BE USED LATER
        /*
      pdfSupport.rowConfCols2(doc, doc.y,
          ['Código', 'Nombre del documento', 'Aportó', 'Cumple Requisito',],
          [1, 6, 1, 1],
          [{ align: 'center', bold: true },
          { align: 'center', bold: true },
          { align: 'center', bold: true },
          { align: 'center', bold: true },]
      )
    
      if (fun_r) {
          var DocsArray = ['511', '512', '513', '516', '517', '518', '519']
    
          if (fun_1 && fun_1.tipo.includes('A')) {
              if (fun_1.m_urb.includes('A')) DocsArray = DocsArray.concat(['621', '601a', '622', '602a'])
              if (fun_1.m_urb.includes('B')) DocsArray = DocsArray.concat(['623', '601b', '602b', '624', '625'])
              if (fun_1.m_urb.includes('C')) DocsArray = DocsArray.concat(['626', '627', '601c', '602c'])
          }
    
          if (fun_1 && fun_1.tipo.includes('B')) {
              DocsArray = DocsArray.concat(['631', '632', '633', '6023'])
              if (fun_1.m_urb.includes('B')) DocsArray = DocsArray.concat(['634', '635', '636'])
          }
    
          if (fun_1 && fun_1.tipo.includes('C')) {
              if (fun_1.m_sub.includes('A') || fun_1.m_sub.includes('B')) DocsArray = DocsArray.concat(['641'])
              if (fun_1.m_sub.includes('C')) DocsArray = DocsArray.concat(['642', '643'])
          }
    
          if (fun_1 && fun_1.tipo.includes('F')) {
              DocsArray = DocsArray.concat(['651', '652', '653'])
          }
    
          if (fun_1 && fun_1.tipo.includes('D')) {
              DocsArray = DocsArray.concat(['6601', '6602', '6603', '6604', '6605'])
              DocsArray = DocsArray.concat(['660a', '660b', '660c', '660d', '660e'])
              DocsArray = DocsArray.concat(['6607', '6608'])
              DocsArray = DocsArray.concat(['6609'])
              DocsArray = DocsArray.concat(['6610'])
              DocsArray = DocsArray.concat(['6611'])
              DocsArray = DocsArray.concat(['6612', '6613'])
              DocsArray = DocsArray.concat(['6614'])
              DocsArray = DocsArray.concat(['6615'])
              DocsArray = DocsArray.concat(['6616', '6617', '6618', '6619'])
          }
    
          if (fun_1 && fun_1.tipo.includes('E')) {
              DocsArray = DocsArray.concat(['671', '672'])
          }
    
          if (fun_1 && fun_1.tipo.includes('G')) {
              DocsArray = DocsArray.concat(['680'])
              DocsArray = DocsArray.concat(['681', '682', '683', '684', '685'])
              DocsArray = DocsArray.concat(['686'])
              DocsArray = DocsArray.concat(['687', '6862'])
              DocsArray = DocsArray.concat(['688', '689'])
          }
    
          var Table = _COMPONENT_DOC_CHECK(fun_r, DocsArray)
          for (let i = 0; i < Table.length; i++) {
              const table = Table[i];
              pdfSupport.rowConfCols2(doc, doc.y,
                  [table[0], table[1], table[2], table[3],],
                  [1, 6, 1, 1],
                  [{ align: 'center' },
                  { align: 'left' },
                  { align: 'center' },
                  { align: 'center', bold: true },]
              )
    
          }
      }
      */
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Análisis de la información',],
            [1,],
            [{ align: 'center', bold: true },]
        )
        _CHECK_ARRAY = _GET_STEP_TYPE('s1', 'check', record_law_steps, record_law.version);

        pdfSupport.rowConfCols2(doc, doc.y,
            ['01', 'La documentación aportada es la requerida para tramitar la actuación urbanística', _CHECK_ARRAY[0] == 1 ? 'CUMPLE' : 'NO CUMPLE',],
            [1, 7, 1],
            [{ align: 'center' },
            { align: 'left' },
            { align: 'center', bold: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['02', 'Al momento de esta evaluación  jurídica se ratifica la condición de la radicación', _CHECK_ARRAY[1] == 1 ? 'LEGAL Y DEBIDA FORMA' : 'INCOMPLETO',],
            [1, 6, 2],
            [{ align: 'center' },
            { align: 'left' },
            { align: 'center', bold: true },]
        )
        doc.text('\n');
        doc.text(_BODY, { align: 'justify' });

        doc.text('\n');
        doc.font('Helvetica-Bold');
        doc.text('2.2 FORMULARIO ÚNICO NACIONAL');
        doc.font('Helvetica');
        doc.text('\n');

        _CHECK_ARRAY = _GET_STEP_TYPE('s23', 'check', record_law_steps, record_law.version);
        var checkColor = _CHECK_ARRAY[0] == 1 ? 'paleturquoise' : 'lightsalmon';
        pdfSupport.rowConfCols2(doc, doc.y,
            ['El Formulario Único Nacional ESTÁ debidamente diligenciado y en debida forma.', _CHECK_ARRAY[0] == 1 ? 'SI' : 'NO',],
            [10, 2],
            [{ align: 'left', bold: true },
            { align: 'center', bold: true, pretty: true, color: checkColor },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['IDENTIFICACIÓN  DE LA SOLICITUD',],
            [1],
            [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
        )
        _VALUE_ARRAY = _GET_STEP_TYPE('s23', 'value', record_law_steps, record_law.version);
        _CHECK_ARRAY = _GET_STEP_TYPE('s23', 'check', record_law_steps, record_law.version);
        var table_fun_1 = [
            ['Tipo de Tramite', funParser._FUN_1_PARSER(fun_1.tipo), _VALUE_ARRAY[0], _CHECK_ARRAY[1]],
            ['Objeto', funParser._FUN_2_PARSER(fun_1.tramite), _VALUE_ARRAY[1], _CHECK_ARRAY[2]],
            ['Modalidad Licencia de Urbanización', funParser._FUN_2_PARSER(fun_1.m_urb), _VALUE_ARRAY[2], _CHECK_ARRAY[3]],
            ['Modalidad Licencia de Subdivisión', funParser._FUN_4_PARSER(fun_1.m_sub), _VALUE_ARRAY[3], _CHECK_ARRAY[4]],
            ['Modalidad Licencia de Construcción', funParser._FUN_5_PARSER(fun_1.m_lic), _VALUE_ARRAY[4], _CHECK_ARRAY[5]],
            ['Usos', funParser._FUN_6_PARSER(fun_1.usos), _VALUE_ARRAY[5], _CHECK_ARRAY[6]],
            ['Área Construida', funParser._FUN_7_PARSER(fun_1.area), _VALUE_ARRAY[6], _CHECK_ARRAY[7]],
            ['Tipo de Vivienda', funParser._FUN_8_PARSER(fun_1.vivienda), _VALUE_ARRAY[7], _CHECK_ARRAY[8]],
            ['Bien de Interés Cultural', funParser._FUN_9_PARSER(fun_1.cultural), _VALUE_ARRAY[8], _CHECK_ARRAY[9], true],
            ['Declaración sobre medidas de construcción sostenible', funParser._FUN_101_PARSER(fun_1.regla_1), _VALUE_ARRAY[9], _CHECK_ARRAY[10]],
            ['Zónificacion Climática', funParser._FUN_102_PARSER(fun_1.regla_2), _VALUE_ARRAY[10], _CHECK_ARRAY[11]],
        ]
        _VALUE_ARRAY = _GET_STEP_TYPE('s24', 'value', record_law_steps, record_law.version);
        _CHECK_ARRAY = _GET_STEP_TYPE('s24', 'check', record_law_steps, record_law.version);
        var table_fun_2 = [
            ['Dirección o nomenclatura', fun_2.direccion, _VALUE_ARRAY[0], _CHECK_ARRAY[0]],
            ['Dirección o nomenclatura anterior', fun_2.direccion_ant, _VALUE_ARRAY[1], _CHECK_ARRAY[1]],
            ['Matrícula inmobiliaria', fun_2.matricula, _VALUE_ARRAY[2], _CHECK_ARRAY[2]],
            ['Identificación catastral', fun_2.catastral, _VALUE_ARRAY[3], _CHECK_ARRAY[3]],
            ['Clasificación del suelo', funParser._FUN_24_PARSER(fun_2.suelo), _VALUE_ARRAY[4], _CHECK_ARRAY[4]],
            ['Planimetría del lote', funParser._FUN_25_PARSER(fun_2.lote_pla), _VALUE_ARRAY[5], _CHECK_ARRAY[5]],
            ['Ubicación', '', _VALUE_ARRAY[6], _CHECK_ARRAY[6]],
        ]
        pdfSupport.rowConfCols2(doc, doc.y,
            ['DATOS FORMULARIO', 'VERIFICACIÓN', 'EVALUACIÓN'],
            [8, 2, 2],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },
            { align: 'center', bold: true },]
        )

        for (let i = 0; i < table_fun_1.length; i++) {
            const table = table_fun_1[i];
            if (_DATA.model != 2021 && i >= 9) continue;
            if (table[2] == 'NA' || table[2] == 'NO APLICA' || table[3] == 2) continue;
            pdfSupport.rowConfCols2(doc, doc.y,
                [table[0], table[1], table[2], !table[4] ? _checkV(table[3], V3) : '',],
                [3, 5, 2, 2],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left' },]
            )
        }
        pdfSupport.rowConfCols2(doc, doc.y,
            ['INFORMACION SOBRE EL PREDIO',],
            [1],
            [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['DATOS FORMULARIO', 'VERIFICACIÓN', 'EVALUACIÓN'],
            [8, 2, 2],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },
            { align: 'center', bold: true },]
        )
        for (let i = 0; i < table_fun_2.length; i++) {
            const table = table_fun_2[i];
            if (table[2] == 'NA' || table[2] == 'NO APLICA') continue;
            pdfSupport.rowConfCols2(doc, doc.y,
                [table[0], table[1], table[2], _checkV(table[3], V3),],
                [3, 5, 2, 2],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left' },]
            )
        }
        doc.fontSize(7);
        if (curaduriaInfo.id == 'cup1') doc.fontSize(9);
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Barrio', fun_2.barrio ? fun_2.barrio : '',
                'Comuna', fun_2.comuna ? fun_2.comuna : '',
                'Estrato', fun_2.estrato ? fun_2.estrato : '',
                'Manzana No.', fun_2.manzana ? fun_2.manzana : '',
            ],
            [2, 3, 2, 3, 2, 3, 2, 3],
            [
                { align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left', bold: true },
            ]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Vereda', fun_2.vereda ? fun_2.vereda : '',
                'Sector', fun_2.sector ? fun_2.sector : '',
                'Corregimiento', fun_2.corregimiento ? fun_2.corregimiento : '',
                'Lote No.', fun_2.lote ? fun_2.lote : '',
            ],
            [2, 3, 2, 3, 2, 3, 2, 3],
            [
                { align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'left', bold: true },
            ]
        )
        doc.fontSize(8);
        if (curaduriaInfo.id == 'cup1') doc.fontSize(10);
        _CHECK_ARRAY = _GET_STEP_TYPE('s24', 'check', record_law_steps, record_law.version);
        checkColor = _CHECK_ARRAY[0] == 1 ? 'paleturquoise' : 'lightsalmon';
        /*
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Campos del formulario diligenciados en debida forma.', _CHECK_ARRAY[0] == 1 ? 'CUMPLE' : 'NO CUMPLE',],
            [10, 2],
            [{ align: 'left' },
            { align: 'center', bold: true, pretty: true, color: checkColor },]
        )
        */



        let val = 0;
        _CHECK_ARRAY = _GET_STEP_TYPE('f51', 'check', record_law_steps, record_law.version);
        pdfSupport.rowConfCols2(doc, doc.y,
            ['TITULARES DE LA LICENCIA',],
            [1,],
            [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['DATOS FORMULARIO', 'VERIFICACION CURADURIA URBANA'],
            [6, 6],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },]
        )

        for (let i = 0; i < fun_51.length; i++) {
            const f51 = fun_51[i];
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Titular No. ' + (i + 1)],
                [1],
                [{ align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Nombre', f51.name + ' ' + f51.surname, 'Certificado de Tradición. Titular del dominio', _CHECK_ARRAY[val] == 1 ? 'SI' : 'NO'],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            val++;
            pdfSupport.rowConfCols2(doc, doc.y,
                ['CC / NIT', f51.id_number, 'Coincide el número de cedula con certificado de tradición', _CHECK_ARRAY[val] == 1 ? 'SI' : 'NO'],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            val++;
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Teléfono', f51.nunber, 'Aporto copia de la cedula de ciudadanía', _CHECK_ARRAY[val] == 1 ? 'SI' : 'NO'],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            val++;
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Correo', f51.email, 'Firma original en el FUN', _CHECK_ARRAY[val] == 1 ? 'SI' : 'NO'],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            val++;
            checkColor = _CHECK_ARRAY[val] == 1 ? 'paleturquoise' : 'lightsalmon';
            pdfSupport.rowConfCols2(doc, doc.y,
                ['En Calidad de:', f51.role, '¿Quien firma esta legitimado para ello?', _CHECK_ARRAY[val] == 1 ? 'SI' : 'NO'],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left', },
                { align: 'center', bold: true },]
            )
            val++;
            if (f51.rep_name) {
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['Representante Legal:', f51.rep_name, ''],
                    [2, 4, 6],
                    [{ align: 'left' },
                    { align: 'left', bold: true },
                    {},]
                )
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['CC. Representante Legal:', f51.rep_id_number, ''],
                    [2, 4, 6],
                    [{ align: 'left' },
                    { align: 'left', bold: true },
                    {},]
                )
            }

        }

        pdfSupport.rowConfCols2(doc, doc.y,
            ['PROFESIONALES RESPONSABLES',],
            [1,],
            [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['DATOS FORMULARIO', 'VERIFICACION CURADURIA URBANA'],
            [6, 6],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },]
        )

        val = 0;
        _CHECK_ARRAY = _GET_STEP_TYPE('f52', 'check', record_law_steps, record_law.version);

        var sortedF52 = fun_52.map((f52, i) => {
            let matpro = V[_CHECK_ARRAY[val]] || 'NO';
            val++;
            let signature = V[_CHECK_ARRAY[val]] || 'NO';
            val++;
            let credits = V[_CHECK_ARRAY[val]] || 'NO';
            val++;
            let newF52 = f52;
            newF52.docs = f52.docs ? f52.docs.split(',') : [0, 0, 0, 0, 0];
            newF52.matpro = matpro;
            newF52.signature = signature;
            newF52.credits = credits;
            return newF52
        }
        );
        let f52SortArray = {
            'URBANIZADOR/PARCELADOR': 0,
            'URBANIZADOR O CONSTRUCTOR RESPONSABLE': 1,
            'DIRECTOR DE LA CONSTRUCCION': 1,
            'ARQUITECTO PROYECTISTA': 2,
            'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL': 3,
            'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES': 4,
            'INGENIERO CIVIL GEOTECNISTA': 5,
            'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO': 6,
            'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES': 7,
            'OTROS PROFESIONALES ESPECIALISTAS': 8,
        };
        sortedF52.sort((a, b) => f52SortArray[a.role] - f52SortArray[b.role]);

        sortedF52.map((f52, i) => {
            let docsValues = f52.docs;
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Profesional No. ' + (i + 1)],
                [1],
                [{ align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Responsabilidad: ' + f52.role],
                [1],
                [{ align: 'center', bold: true, pretty: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Nombre', f52.name + ' ' + f52.surname, 'Cédula', docsValues[0] >= 1 || docsValues[0] == -1 ? 'SI APORTO' : 'NO APORTO'],
                [2, 4, 4, 2],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Matrícula', `${f52.registration} Expedida: ${f52.registration_date}`, 'Matricula', docsValues[1] >= 1 || docsValues[1] == -1 ? 'SI APORTO' : 'NO APORTO'],
                [2, 4, 4, 2],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Cédula', `${f52.id_number}`, 'Certificado de Vigencia', docsValues[2] >= 1 || docsValues[2] == -1 ? 'SI APORTO' : 'NO APORTO'],
                [2, 4, 4, 2],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Correo', `${f52.email}`, 'Hoja de vida y Certificados', docsValues[3] >= 1 || docsValues[3] == -1 ? 'SI APORTO' : 'NO APORTO'],
                [2, 4, 4, 2],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                // ['Teléfono', `${(f52.number)}`, 'Matricula profesional vigente - sin sanciones', V[_CHECK_ARRAY[val]] || 'NO'],
                ['Teléfono', `${(f52.number)}`, 'Estudios de postgrado', docsValues[4] >= 1 || docsValues[4] == -1 ? 'SI APORTO' : 'NO APORTO'],
                [2, 4, 4, 2],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Experiencia', `${Math.trunc(f52.expirience / 12)} Año(s)`, 'Acreditó experiencia y/o postgrado', f52.credits],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
            checkColor = _CHECK_ARRAY[val] == 1 ? 'paleturquoise' : 'lightsalmon';
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Sanciones', `${f52.sanction ? 'SI' : 'NO'}`, 'Firma original en el FUN', f52.signature],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
        })


        _CHECK_ARRAY = _GET_STEP_TYPE('f53', 'check', record_law_steps, record_law.version);
        _VAL_ARRAY = _GET_STEP_TYPE('f53', 'value', record_law_steps, record_law.version);
        docsValues = fun_53.docs ? fun_53.docs.split(',') : [0, 0];
        let f531_array = ['GENERAL', 'ESPECIAL', 'MANDATO', 'NO APLICA']

        pdfSupport.rowConfCols2(doc, doc.y,
            ['RESPONSABLE DE LA SOLICITUD',],
            [1,],
            [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['DATOS FORMULARIO', 'VERIFICACION CURADURIA URBANA'],
            [6, 6],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Nombre', `${fun_53 ? fun_53.name : ''} ${fun_53 ? fun_53.surname : ''}`, 'El poder está Debidamente notariado',],
            [2, 4, 6],
            [{ align: 'left' },
            { align: 'left', bold: true },
            { align: 'left', bold: true, },
            { align: 'center', bold: true, },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['En Calidad de:', `${fun_53 ? fun_53.role : ''}`, 'Con nota de presentación personal', V[_CHECK_ARRAY[0]] || 'NO'],
            [2, 4, 5, 1],
            [{ align: 'left' },
            { align: 'left', bold: true },
            { align: 'left', },
            { align: 'center', bold: true, }
            ]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Cédula', `${fun_53 ? fun_53.id_number : ''}`, 'Señala el mandato', V[_CHECK_ARRAY[6]] || V[_CHECK_ARRAY[0]] || 'NO'],
            [2, 4, 5, 1],
            [{ align: 'left' },
            { align: 'left', bold: true },
            { align: 'left', },
            { align: 'center', bold: true, },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Dirección correspondencia', `${fun_53 ? fun_53.address : ''}`, 'Firmadopor el poderdante y el apoderado', V[_CHECK_ARRAY[7]] || V[_CHECK_ARRAY[0]] || 'NO'],
            [2, 4, 5, 1],
            [{ align: 'left' },
            { align: 'left', bold: true },
            { align: 'left', },
            { align: 'center', bold: true, },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Correo electrónico', `${fun_53 ? fun_53.email : ''}`, 'Tipo de Poder', f531_array[_CHECK_ARRAY[4] ? _CHECK_ARRAY[4] : 3]],
            [2, 4, 4, 2],
            [{ align: 'left' },
            { align: 'left', bold: true },
            { align: 'left', },
            { align: 'center', bold: true, },]
        )

        pdfSupport.rowConfCols2(doc, doc.y,
            ['1. Doc. de Identidad', `${docsValues[0] != 0 ? 'APORTO' : 'NO APORTO'}`, '(Cuando tipo de poder es GENERAL) Aporta certificado de vigencia, fecha de expedición inferior a un mes', V[_CHECK_ARRAY[5]] || 'NO'],
            [2, 4, 5, 1],
            [{ align: 'left' },
            { align: 'left', bold: true },
            { align: 'left', },
            { align: 'center', bold: true, },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['2. Poder, mandato o autorización', `${docsValues[1] != 0 ? 'APORTO' : 'NO APORTO'}`, 'Firma original en el FUN', V[_CHECK_ARRAY[1]] || 'NO'],
            [2, 4, 5, 1],
            [{ align: 'left' },
            { align: 'left', bold: true },
            { align: 'left', },
            { align: 'center', bold: true, },]
        )

        pdfSupport.rowConfCols2(doc, doc.y,
            [' ', '¿Quien firma esta legitimado para ello?', V[_CHECK_ARRAY[2]] || 'NO'],
            [6, 5, 1],
            [{ align: 'left' },
            { align: 'left', },
            { align: 'center', bold: true, },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [' ', 'Autorizó notificación electrónica', V[_CHECK_ARRAY[3]] || 'NO'],
            [6, 5, 1],
            [{ align: 'left' },
            { align: 'left', },
            { align: 'center', bold: true, },]
        )


        pdfSupport.rowConfCols2(doc, doc.y,
            ['CERTIFICADOS',],
            [1],
            [{ align: 'left', bold: true, pretty: true },]
        )


        _CHECK_ARRAY = _GET_STEP_TYPE('sc1', 'check', record_law_steps, record_law.version);
        var rl11l_areas = record_law_11_liberties.boundary ? record_law_11_liberties.boundary.split(',') : [];
        var table_fun_2_certificate_1 = [
            ['Matricula', record_law_11_liberties.id_public, '1. Cumple tiempo solicitado en el Decreto 1077 de 2015.', _checkV(_CHECK_ARRAY[0], V)],
            ['Fecha  expedición', record_law_11_liberties.date, '2. Presenta anotación sobre: Bien de interés cultural BIC', _checkV(_CHECK_ARRAY[1], V2)],
            ['Código catastral', record_law_11_liberties.predial, '(2. = SI) 2.1 Presenta anteproyecto e la entidad competente', _checkV(_CHECK_ARRAY[9], V)],
            ['Dirección', record_law_11_liberties.address, '3. Presenta anotación sobre: Utilidad pública', _checkV(_CHECK_ARRAY[2], V2)],
        ]
        pdfSupport.rowConfCols2(doc, doc.y,
            [`DATOS CERTIFICADO  ${record_law_11_liberties.id_public ? record_law_11_liberties.id_public : ''}`, 'VERIFICACION CURADURIA URBANA'],
            [6, 6],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },]
        )
        for (let i = 0; i < table_fun_2_certificate_1.length; i++) {
            const table = table_fun_2_certificate_1[i];
            pdfSupport.rowConfCols2(doc, doc.y,
                [table[0], table[1], table[2], table[3],],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
        }
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Cabida y linderos (m2)', '4. Presenta anotación sobre: Algún litigio', _checkV(_CHECK_ARRAY[3], V2),],
            [6, 5, 1],
            [{ align: 'center', bold: true, },
            { align: 'left' },
            { align: 'center', bold: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['Metros', 'Norte', 'Sur', 'Ori.', 'Occ.', '5. Presenta anotación sobre: Prohibición y/o restricción urbana', _checkV(_CHECK_ARRAY[4], V2),],
            [6, 6, 6, 6, 6, 25, 5],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },
            { align: 'center', bold: true },
            { align: 'center', bold: true },
            { align: 'center', bold: true },
            { align: 'left' },
            { align: 'center', bold: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [rl11l_areas[4], rl11l_areas[0], rl11l_areas[1], rl11l_areas[2], rl11l_areas[3], '7. Presenta Anotación de reglamento de P.H.', _checkV(_CHECK_ARRAY[6], V),],
            [6, 6, 6, 6, 6, 25, 5],
            [
                { align: 'center' },
                { align: 'center', },
                { align: 'center', },
                { align: 'center', },
                { align: 'center', },
                { align: 'left' },
                { align: 'center', bold: true },
            ]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['6. El área y los linderos están debidamente descritos en el certificado y/o el titulo de propiedad aportado (escritura, sentencia, etc)',
                _checkV(_CHECK_ARRAY[5], V),
                '7.1 Presenta escritura publica de la constitución, reformas y/o adicionales del reglamento',
                _checkV(_CHECK_ARRAY[12], V),],
            [5, 1, 5, 1],
            [{ align: 'left' },
            { align: 'center', bold: true },
            { align: 'left' },
            { align: 'center', bold: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['(6. = NO) 6.1 El área puede calcularse de la operación aritmética de los linderos',
                _checkV(_CHECK_ARRAY[10], V2),
                '7.2 Presenta acta del máximo órgano de administración (asamblea, consejo o administrador)',
                _checkV(_CHECK_ARRAY[13], V),],
            [5, 1, 5, 1],
            [{ align: 'left' },
            { align: 'center', bold: true },
            { align: 'left' },
            { align: 'center', bold: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['(6. = NO) 6.2 Del area y los linderos se evidencia que requiere adelantar tramite ante el AMB de aclaración y/o rectificación',
                _checkV(_CHECK_ARRAY[11], V),
                '8. Señala limitación para la actuación urbanística.',
                _checkV(_CHECK_ARRAY[7], V2),],
            [5, 1, 5, 1],
            [{ align: 'left' },
            { align: 'center', bold: true },
            { align: 'left' },
            { align: 'center', bold: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['9. Con la información del área y linderos es posible adelantar la actuación urbanística', _checkV(_CHECK_ARRAY[8], V), 'Titular(es) derecho(s) real(es)',],
            [5, 1, 6],
            [{ align: 'left' },
            { align: 'center', bold: true },
            { align: 'left' },
            ]
        )
        checkColor = _CHECK_ARRAY[7] == 1 ? 'paleturquoise' : 'lightsalmon';
        var str_subjects = record_law_11_liberties.subject ? record_law_11_liberties.subject.split(',') : [];
        var str_subjects_ids = record_law_11_liberties.subject_id ? record_law_11_liberties.subject_id.split(',') : [];
        for (let i = 0; i < str_subjects.length; i++) {
            const subject = str_subjects[i];
            pdfSupport.rowConfCols2(doc, doc.y,
                ['', subject, str_subjects_ids[i]],
                [6, 3, 3],
                [{},
                { align: 'left', },
                { align: 'left', },
                ]
            )
        }

        _CHECK_ARRAY = _GET_STEP_TYPE('sc2', 'check', record_law_steps, record_law.version);
        var table_fun_2_certificate_2 = [
            ['Número y fecha', `${record_law_11_taxes.id_public ? record_law_11_taxes.id_public + ' de ' + record_law_11_taxes.date : ''}`, 'Cumple tiempo solicitado en el Decreto 1077 de 2015', _CHECK_ARRAY[0]],
            ['Dirección', record_law_11_taxes.address, 'Es clara la nomenclatura', _CHECK_ARRAY[1]],
            ['Predio', record_law_11_taxes.predial, ' Es coherente con lo consignado en los demás documentos (FUN, certificados LyTd, escritura, planos, etc)', _CHECK_ARRAY[2]],
        ]
        pdfSupport.rowConfCols2(doc, doc.y,
            [String(record_law_11_taxes.type ? record_law_11_taxes.type : 'DOCUMENTO SIN NOMBRE').toUpperCase(),],
            [1],
            [{ align: 'left', bold: true, pretty: true },]
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            ['DATOS DOCUMENTO ', 'VERIFICACION CURADURIA URBANA'],
            [6, 6],
            [{ align: 'center', bold: true },
            { align: 'center', bold: true },]
        )
        for (let i = 0; i < table_fun_2_certificate_2.length; i++) {
            const table = table_fun_2_certificate_2[i];
            pdfSupport.rowConfCols2(doc, doc.y,
                [table[0], table[1], table[2], table[3] == 1 ? 'SI' : 'NO',],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left' },
                { align: 'center', bold: true },]
            )
        }

        if (rules[0] != 1) {
            doc.text('\n');
            doc.font('Helvetica-Bold');
            doc.text('2.3 ACCIONES DE PUBLICIDAD DEL PROCESO');
            doc.font('Helvetica');
            doc.text('\n');


            _CHECK_ARRAY = _GET_STEP_TYPE('flaw', 'check', record_law_steps, record_law.version);
            docsValues = fun_law ? fun_law.sign ? fun_law.sign.split(',') : [0, ''] : [0, ''];
            pdfSupport.rowConfCols2(doc, doc.y,
                ['VALLA INFORMATIVA',],
                [1,],
                [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['DATOS FORMULARIO', 'VERIFICACION CURADURIA URBANA'],
                [6, 6],
                [{ align: 'center', bold: true },
                { align: 'center', bold: true },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Fecha Radicacion', `${docsValues[1]}`, 'El registro fotográfico fue radicado en los 5 días siguientes a la radicación', V[_CHECK_ARRAY[0] || 0]],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left', },
                { align: 'center', bold: true, },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['Foto', `${docsValues[0] != 0 ? 'APORTADA' : 'NO APORTO'}`, 'La valla contiene la información requerida (número y fecha de radicación, datos curaduria, uso, características básicas)', V[_CHECK_ARRAY[1] || 0]],
                [2, 4, 5, 1],
                [{ align: 'left' },
                { align: 'left', bold: true },
                { align: 'left', },
                { align: 'center', bold: true, },]
            )
            pdfSupport.rowConfCols2(doc, doc.y,
                ['', 'Con la fotografia puede verificarse su visibilidad desde el espacio publico', V[_CHECK_ARRAY[2] || 0]],
                [6, 5, 1],
                [{ align: 'left', },
                { align: 'left', },
                { align: 'center', bold: true, },]
            )
        }


        // THIS PART IS DEPRECIATED, MAY BE USED LATER
        /*
        pdfSupport.rowConfCols2(doc, doc.y,
            ['VECINOS COLINDANTES',],
            [1,],
            [{ align: 'left', bold: true, pretty: true, color: 'lightblue' },]
        )
        doc.fontSize(7);
        pdfSupport.rowConfCols2(doc, doc.y,
            ['DIRECCION DEL PREDIO', 'DIRECCION DE CORRESPONDENCIA', 'ESTADO CITACIÓN', 'DOCUMENTO DE CITACIÓN', 'GUIA DE CONFIRMACIÓN', 'FECHA RECIBIDO'],
            [1, 1, 1, 1, 1, 1],
            [{ align: 'center', bold: true, pretty: true },
            { align: 'center', bold: true, pretty: true },
            { align: 'center', bold: true, pretty: true },
            { align: 'center', bold: true, pretty: true },
            { align: 'center', bold: true, pretty: true },
            { align: 'center', bold: true, pretty: true },]
        )
        doc.fontSize(8);
        for (let i = 0; i < fun_3.length; i++) {
            const f3 = fun_3[i];
            var citation = (_state) => {
                if (!_state) return 'PENDIENTE'
                else if (_state == 1) return 'CITACION POSITIVA'
                else if (_state == 2) return 'CITACION NEGATIVA'
            }
            pdfSupport.rowConfCols2(doc, doc.y,
                [f3.direccion_1, f3.direccion_2, citation(f3.state), f3.id_cub, f3.id_alerted == "-1" ? "" : f3.id_alerted, f3.state == 1 ? f3.alerted : ""],
                [1, 1, 1, 1, 1, 1],
                [{ align: 'left' },
                { align: 'left' },
                { align: 'center' },
                { align: 'center', },
                { align: 'center', },
                { align: 'center', },]
            )
        }
        */
    }
    if (curaduriaInfo.id == 'cup1') doc.fontSize(11);
    if (simple) {
        pdfSupport.rowConfCols2(doc, doc.y,
            ['CONCLUSIONES Y OBSERVACIONES',],
            [1,],
            [{ align: 'left', bold: true, pretty: true, },]
        )
    } else {
        doc.text('\n');
        doc.font('Helvetica-Bold');
        doc.text('2.4 CONCLUSIONES Y OBSERVACIONES');
        doc.font('Helvetica');
        doc.text('\n');
    }

    let values_1 = _GET_STEP_TYPE('s1', 'value', record_law_steps, record_law.version);
    let values_f53 = _GET_STEP_TYPE('f53', 'value', record_law_steps, record_law.version);
    let values_law = _GET_STEP_TYPE('flaw', 'value', record_law_steps, record_law.version);

   
    let correciotns = '';
    if (values_1[0]) correciotns += `${values_1[0]}\n`;
    if (values_f53[0]) correciotns += `${values_f53[0]}\n`;
    if (values_law[0] && rules[0] != 1) correciotns += `${values_law[0]}\n`;
    if (record_law_review && record_law_review.detail) correciotns += `${record_law_review.detail}`;
    if (correciotns.length == 0) correciotns = 'NO HAY OBSERVACIONES'
    pdfSupport.listText(doc, doc.y, correciotns);

    // doc.text('\n');
    if (simple) {
        pdfSupport.rowConfCols2(doc, doc.y,
            ['EVALUACIÓN DE VIABILIDAD JURIDICA',],
            [1,],
            [{ align: 'left', bold: true, pretty: true, },]
        )
    } else {
        doc.font('Helvetica-Bold');
        doc.text('2.5 EVALUACIÓN DE VIABILIDAD JURIDICA');
        doc.font('Helvetica');
        doc.text('\n');
    }



    let color = _DATA.rew.r_pending ? 'blanchedalmond' : _DATA.rew.r_check == 'VIABLE' ? 'paleturquoise' : 'lightsalmon';

    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.startPage;

    if (_DATA.omit_date) pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 12, h: 1, text: '\nPROFESIONAL REVISOR:\n ', config: { align: 'center', bold: true, valign: true, } },

            { coord: [12, 0], w: 19, h: 1, text: `\n${_DATA.rew.r_worker} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

            { coord: [31, 0], w: 8, h: 1, text: '\nRESULTADO:\n ', config: { align: 'center', bold: true, valign: true, } },

            { coord: [39, 0], w: 8, h: 1, text: `\n${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check} \n `, config: { align: 'center', bold: true, valign: true, fill: color } },
        ],
        [doc.x, doc.y], [47, 1], { lineHeight: -1 })
    else pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 11, h: 1, text: '\nPROFESIONAL REVISOR:\n ', config: { align: 'center', bold: true, valign: true, } },

            { coord: [11, 0], w: 17, h: 1, text: `\n${_DATA.rew.r_worker} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

            { coord: [28, 0], w: 10, h: 1, text: '\nRESULTADO:\n ', config: { align: 'center', bold: true, valign: true, } },

            { coord: [38, 0], w: 8, h: 1, text: `\n${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check} \n `, config: { align: 'center', bold: true, valign: true, fill: color } },

            { coord: [46, 0], w: 6, h: 1, text: '\nFECHA:\n ', config: { align: 'center', bold: true, valign: true, } },

            { coord: [52, 0], w: 8, h: 1, text: `\n${_DATA.rew.r_date} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
}

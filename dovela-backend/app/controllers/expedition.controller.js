const db = require("../models");

const EXP = db.expedition;
const EA = db.exp_area;

const RL = db.record_law;

const RR = db.record_law_review;
const R1L = db.record_law_11_liberty;
const R1T = db.record_law_11_tax;

const RLS = db.record_law_step;

const FUN_0 = db.fun_0;
const FUN_1 = db.fun_1;
const FUN_2 = db.fun_2;
const FUN_3 = db.fun_3;
const FUN_51 = db.fun_51;
const FUN_52 = db.fun_52;
const FUN_53 = db.fun_53;
const FUN_R = db.fun_r;
const FUN_LAW = db.fun_law;
const FUN_C = db.fun_c;

const RG = db.record_law_gen;
const RD = db.record_law_doc;
const RLI = db.record_law_licence;

const RA = db.record_arc;
const RA_33A = db.record_arc_33_area;
const RA_34G = db.record_arc_34_gens;
const RA_34K = db.record_arc_34_k;
const RA_35P = db.record_arc_35_parking;
const RA_35L = db.record_arc_35_location;
const RA_36I = db.record_arc_36_info;
const RA_38 = db.record_arc_38;

const RAS = db.record_arc_step;

const ENG = db.record_eng;
const RES = db.record_eng_step;
const SIS = db.record_eng_sismic;
const REW = db.record_eng_review;


const Op = db.Sequelize.Op;
const Queries = require('../config/generalQueries')
const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");
const curaduriaInfo = require('../config/curaduria.json');
const moment = require('moment');
const { fill } = require("pdfkit");
const { _FUN_1_PARSER, _FUN_4_PARSER, _FUN_8_PARSER, _FUN_6_PARSER, _FUN_5_PARSER } = require("../config/funCustomArrays");
const dbConfig = require("../config/db.config");
const { type } = require("os");

// POST
exports.create = (req, res) => {
    var object = {
        id_public: (req.body.id_public ? req.body.id_public : null),
        fun0Id: (req.body.fun0Id ? req.body.fun0Id : res.send('NO A REAL ID PARENT')),

        date: (req.body.date ? req.body.date : null),
        tmp: (req.body.tmp ? req.body.tmp : null),
        taxes: (req.body.taxes ? req.body.taxes : null),
        cub1: (req.body.cub1 ? req.body.cub1 : null),
        model: (req.body.model ? req.body.model : null),
    }

    EXP.create(object)
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

exports.create_exp_area = (req, res) => {
    var object = {
        expeditionId: (req.body.expeditionId ? req.body.expeditionId : res.send('NO A REAL ID PARENT')),

        area: (req.body.area ? req.body.area : null),
        charge: (req.body.charge ? req.body.charge : null),
        desc: (req.body.desc ? req.body.desc : null),
        payment: (req.body.payment ? req.body.payment : null),
        use: (req.body.use ? req.body.use : null),
        units: (req.body.units ? req.body.units : null),
    }

    EA.create(object)
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
    EXP.findAll({ include: EA })
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
    EXP.findAll({
        where: { fun0Id: _id },
        include: EA
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
    EXP.findByPk(id, { include: EA })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving DATA with ID=" + id
            });
        });
};

// PUT
exports.update = (req, res) => {
    const new_cub = (req.body.cub1);
    const prev_cub = (req.body.prev_cub1);

    const new_cub2 = (req.body.cub2);
    const prev_cub2 = (req.body.prev_cub2);

    const new_cub3 = (req.body.cub3);
    const prev_cub3 = (req.body.prev_cub3);

    const new_id_public = (req.body.id_public);
    const prev_id_public = (req.body.prev_id_public);

    const { QueryTypes } = require('sequelize');
    var query = Queries.validateLastCUBQuery(new_cub, prev_cub);
    var quer2 = Queries.validateLastCUBQuery(new_cub2, prev_cub2);
    var querc3 = Queries.validateLastCUBQuery(new_cub3, prev_cub3);
    var quer3 = Queries.validateLastPublicRes(new_id_public, prev_id_public);

    if (new_cub) {
        db.sequelize.query(query, { type: QueryTypes.SELECT })
            .then(data => {
                if (data.length > 0) return res.send('ERROR_DUPLICATE');
                else _continue_();
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving ALL DATA."
                });
            });
    } else {
        if (prev_cub) req.body.cub1 = '';
        _continue_();
    }
    function _continue_() {
        if (new_cub2) {
            db.sequelize.query(quer2, { type: QueryTypes.SELECT })
                .then(data => {
                    if (data.length > 0) return res.send('ERROR_DUPLICATE');
                    else _continue2_();
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving ALL DATA."
                    });
                });
        } else {
            if (prev_id_public) req.body.cub2 = '';
            _continue2_();
        }
    }

    function _continue2_() {
        if (new_id_public) {
            db.sequelize.query(quer3, { type: QueryTypes.SELECT })
                .then(data => {
                    if (data.length > 0) _continue3_();
                    else _continue3_();
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving ALL DATA."
                    });
                });
        } else {
            if (prev_cub2) req.body.id_public = '';
            _continue3_();
        }
    }

    function _continue3_() {
        if (new_cub3) {
            db.sequelize.query(querc3, { type: QueryTypes.SELECT })
                .then(data => {
                    if (data.length > 0) return res.send('ERROR_DUPLICATE');
                    else update();
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving ALL DATA."
                    });
                });
        } else {
            if (prev_cub3) req.body.cub3 = '';
            update();
        }
    }

    function update() {
        const id = req.params.id;
        EXP.update(req.body, {
            where: { id: id }
        }).then(num => {
            if ((num) == 1) {
                res.send('OK');
            } else {
                res.send('ERROR_2'); // NO MATCHING ID
            }
        }).catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving ALL DATA."
            });
        });
    }

};

exports.update_exp_area = (req, res) => {
    const id = req.params.id;
    EA.update(req.body, {
        where: { id: id }
    }).then(num => {
        if ((num) == 1) {
            res.send('OK');
        } else {
            res.send('ERROR_2'); // NO MATCHING ID
        }
    })
};

// DELETE BY ID
exports.delete = (req, res) => {
    res.json({ message: "NOT IMPLEMENTED" });
};

exports.delete_exp_area = (req, res) => {
    const id = req.params.id;
    EA.destroy({
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


exports.gen_doc_1 = (req, res) => {
    var _DATA = {
        date: (req.body.date ? req.body.date : ' '),
        cub: (req.body.cub ? req.body.cub : ' '),
        id_public: (req.body.id_public ? req.body.id_public : ' '),
        name: (req.body.name ? req.body.name : ' '),
        addressn: (req.body.addressn ? req.body.addressn : ' '),
        address: (req.body.address ? req.body.address : ' '),
        type: (req.body.type ? req.body.type : ' '),
        city: (req.body.city ? req.body.city : ' '),

        type_not: (req.body.type_not ? req.body.type_not : 0),
        type_not_name: (req.body.type_not_name ? req.body.type_not_name : ''),

    }
    if (curaduriaInfo.id == "cup1") _PDFGEN_DOC1_CUP1(_DATA);
    else _PDFGEN_DOC1(_DATA);

    res.send('OK');
};

exports.gen_doc_2 = (req, res) => {
    var _DATA = {
        type: (req.body.type ? req.body.type : ' '),
        id_public: (req.body.id_public ? req.body.id_public : ' '),
        destination: (req.body.destination ? req.body.destination : ' '),
        catastral: (req.body.catastral ? req.body.catastral : ' '),
        address: (req.body.address ? req.body.address : ' '),
        strata: (req.body.strata ? req.body.strata : ' '),
        name: (req.body.name ? req.body.name : ' '),
        nameid: (req.body.nameid ? req.body.nameid : ' '),

        areas: (req.body.areas ? req.body.areas : []),
        uses: (req.body.uses ? req.body.uses : []),
        charges: (req.body.charges ? req.body.charges : []),
        descs: (req.body.descs ? req.body.descs : []),

        total: (req.body.total ? req.body.total : ' '),
        iva: (req.body.iva ? req.body.iva : ' '),
        subtotal: (req.body.subtotal ? req.body.subtotal : ' '),

    }
    if (curaduriaInfo.id == "cub1") _PDFGEN_DOC2(_DATA);
    else if (curaduriaInfo.id == "fld2") _PDFGEN_DOC2_fld2(_DATA);
    else _PDFGEN_DOC2(_DATA);

    res.send('OK');
};

exports.gen_doc_3 = (req, res) => {
    var _DATA = {
        type: (req.body.type ? req.body.type : ' '),
        id_public: (req.body.id_public ? req.body.id_public : ' '),
        destination: (req.body.destination ? req.body.destination : ' '),
        catastral: (req.body.catastral ? req.body.catastral : ' '),
        address: (req.body.address ? req.body.address : ' '),
        strata: (req.body.strata ? req.body.strata : ' '),
        name: (req.body.name ? req.body.name : ' '),
        nameid: (req.body.nameid ? req.body.nameid : ' '),

        areas: (req.body.areas ? req.body.areas : []),
        uses: (req.body.uses ? req.body.uses : []),
        descs: (req.body.descs ? req.body.descs : []),

        destinatio: (req.body.destinatio ? req.body.destinatio : ' '),
        treatment: (req.body.treatment ? req.body.treatment : ' '),
        zone: (req.body.zone ? req.body.zone : ' '),
        axis: (req.body.axis ? req.body.axis : ' '),

        cod1: ('002'),
        cod2: ('007'),
        cod3: ('601'),
        account1: (req.body.account1 ? req.body.account1 : ' '),
        account2: (req.body.account2 ? req.body.account2 : ' '),
        account3: (req.body.account3 ? req.body.account3 : ' '),
        tax1: (req.body.tax1 ? req.body.tax1 : ' '),
        tax2: (req.body.tax2 ? req.body.tax2 : ' '),
        tax3: (req.body.tax3 ? req.body.tax3 : ' '),

        total: (req.body.total ? req.body.total : ' '),

    }

    _PDFGEN_DOC3(_DATA);
    res.send('OK');
};

exports.gen_doc_4 = (req, res) => {
    var _DATA = {
        type: (req.body.type ? req.body.type : ' '),
        id_public: (req.body.id_public ? req.body.id_public : ' '),
        destination: (req.body.destination ? req.body.destination : ' '),
        catastral: (req.body.catastral ? req.body.catastral : ' '),
        address: (req.body.address ? req.body.address : ' '),
        strata: (req.body.strata ? req.body.strata : ' '),
        name: (req.body.name ? req.body.name : ' '),
        nameid: (req.body.nameid ? req.body.nameid : ' '),

        uis1: (req.body.uis1 ? req.body.uis1 : ' '),
        uis2: (req.body.uis2 ? req.body.uis2 : ' '),
        uis2_p: (req.body.uis2_p ? req.body.uis2_p : ' '),
        uis2_v: (req.body.uis2_v ? req.body.uis2_v : ' '),
        uis2_t: (req.body.uis2_t ? req.body.uis2_t : ' '),
    }
    if (curaduriaInfo.id == 'cup1') _PDFGEN_DOC4_CUP1(_DATA);
    else _PDFGEN_DOC4(_DATA);
    res.send('OK');
};

exports.gen_doc_5 = (req, res) => {
    var _DATA = {
        type: (req.body.type ? req.body.type : ' '),
        id_public: (req.body.id_public ? req.body.id_public : ' '),
        destination: (req.body.destination ? req.body.destination : ' '),
        catastral: (req.body.catastral ? req.body.catastral : ' '),
        matricula: (req.body.matricula ? req.body.matricula : ' '),
        address: (req.body.address ? req.body.address : ' '),
        strata: (req.body.strata ? req.body.strata : ' '),
        name: (req.body.name ? req.body.name : ' '),
        nameid: (req.body.nameid ? req.body.nameid : ' '),
        treatment: (req.body.treatment ? req.body.treatment : ' '),


        date: (req.body.date ? req.body.date : ' '),
        cub: (req.body.cub ? req.body.cub : ' '),

        units: (req.body.units ? req.body.units : ' '),
        comerce: (req.body.comerce ? req.body.comerce : ' '),
        charge: (req.body.charge ? req.body.charge : ' '),
        zgu: (req.body.zgu ? req.body.zgu : ' '),

        v11: (req.body.v11 ? req.body.v11 : false),
        v12: (req.body.v12 ? req.body.v12 : false),
        v13: (req.body.v13 ? req.body.v13 : false),
        v14: (req.body.v14 ? req.body.v14 : false),

        v21: (req.body.v21 ? req.body.v21 : false),
        v22: (req.body.v22 ? req.body.v22 : false),
        v23: (req.body.v23 ? req.body.v23 : false),
        v24: (req.body.v24 ? req.body.v24 : false),

        totalw: (req.body.totalw ? req.body.totalw : ' '),
        totaln: (req.body.totaln ? req.body.totaln : ' '),

        city: (req.body.city ? req.body.city : ' '),

    }
    _PDFGEN_DOC5(_DATA);
    res.send('OK');
};

exports.gen_doc_6 = (req, res) => {
    var _DATA = {
        type: (req.body.type ? req.body.type : ' '),
        id_public: (req.body.id_public ? req.body.id_public : ' '),
        destination: (req.body.destination ? req.body.destination : ' '),
        catastral: (req.body.catastral ? req.body.catastral : ' '),
        matricula: (req.body.matricula ? req.body.matricula : ' '),
        address: (req.body.address ? req.body.address : ' '),
        strata: (req.body.strata ? req.body.strata : ' '),
        name: (req.body.name ? req.body.name : ' '),
        nameid: (req.body.nameid ? req.body.nameid : ' '),

        area: (req.body.area ? req.body.area : ''), // FPR FLD2
        areas: (req.body.areas ? req.body.areas : ''),
        uses: (req.body.uses ? req.body.uses : []),
        sum: (req.body.sum ? req.body.sum : ''),
        charges: (req.body.charges ? req.body.charges : ''),
        descs: (req.body.descs ? req.body.descs : ''),

        total: (req.body.total ? req.body.total : ' '),

    }
    if (curaduriaInfo.id == "cub1") _PDFGEN_DOC6(_DATA);
    if (curaduriaInfo.id == "cup1") _PDFGEN_DOC6(_DATA);
    if (curaduriaInfo.id == "fld2") _PDFGEN_DOC6_fld2(_DATA);
    else _PDFGEN_DOC6(_DATA);

    res.send('OK');
};

exports.gen_doc_7 = (req, res) => {
    var _DATA = {
        type: (req.body.type ? req.body.type : ' '),
        id_public: (req.body.id_public ? req.body.id_public : ' '),
        destination: (req.body.destination ? req.body.destination : ' '),
        catastral: (req.body.catastral ? req.body.catastral : ' '),
        address: (req.body.address ? req.body.address : ' '),
        strata: (req.body.strata ? req.body.strata : ' '),
        name: (req.body.name ? req.body.name : ' '),
        nameid: (req.body.nameid ? req.body.nameid : ' '),

        areas: (req.body.areas ? req.body.areas : ''),
        uses: (req.body.uses ? req.body.uses : ''),
        sum: (req.body.sum ? req.body.sum : ''),
        charges: (req.body.charges ? req.body.charges : ''),
        descs: (req.body.descs ? req.body.descs : ''),

        fix: (req.body.fix ? req.body.fix : ' '),
        subtotal: (req.body.subtotal ? req.body.subtotal : ' '),
        subtotal_2: (req.body.subtotal_2 ? req.body.subtotal_2 : ' '),
        iva: (req.body.iva ? req.body.iva : ' '),
        total: (req.body.total ? req.body.total : ' '),

    }

    _PDFGEN_DOC7(_DATA);
    res.send('OK');
};


exports.gen_doc_res = (req, res) => {

    const _version = req.body.record_version ? req.body.record_version : res.send('NOT A REAL VERSION');
    const _id = req.body.id ? req.body.id : res.send('NOT A REAL ID');

    let _arc_id;
    let _law_id;
    let _eng_id;

    var oject = {
        type_not: (req.body.type_not ? req.body.type_not : 0),
        version: _version,
        id: _id,
        reso: req.body,
        r_simple: req.body.r_simple === 'true' ? 1 : 0,
        r_simple_name: req.body.r_simple_name ? req.body.r_simple_name : '',
        r_signs: req.body.r_signs === 'true' ? 1 : 0,
        r_pagesi: req.body.r_pagesi === 'true' ? 1 : 0,
        r_pagesn: req.body.r_pagesn === 'true' ? 1 : 0,
        r_pagesx: req.body.r_pagesx === 'true' ? 1 : 0,
        r_sign_align: req.body.r_sign_align ? req.body.r_sign_align : 'center',
        r_logo: req.body.logo ? req.body.logo : 'no',
        r_pages: req.body.r_pages ? req.body.r_pages : 1,
        header_text: req.body.header_text ? req.body.header_text : 1,
        fun: null,
        fun_1s: null,
        fun_2: null,
        fun_51s: null,
        fun_52s: null,
        fun_53s: null,
        fun_cs: null,
        record_arc: null,
        record_law: null,
        record_eng: null,
        margins: {
            m_top: req.body.m_top ? req.body.m_top : 2.5,
            m_bot: req.body.m_bot ? req.body.m_bot : 2.5,
            m_left: req.body.m_left ? req.body.m_left : 1.7,
            m_right: req.body.m_right ? req.body.m_right : 1.7,
        }
    }

    FUN_0.findOne({
        include:
            [
                { model: FUN_1, where: { version: _version }, required: false, },
                { model: FUN_2 },
                //{ model: FUN_3 },
                { model: FUN_51 },
                { model: FUN_52 },
                { model: FUN_53, where: { version: _version }, required: false, },
                { model: FUN_C, where: { version: _version }, required: false, },
                //{ model: FUN_R, where: { version: _DATA.version }, required: false, },
                //{ model: FUN_LAW },

            ],
        where: { id: _id, }
    })
        .then(data => {
            oject.fun = {
                state: data.state,
                id_public: data.id_public,
                id_payment: data.id_payment,
                type: data.type,
                model: data.model,
                tags: data.tags,
            }
            oject.fun_1s = data.fun_1s;
            oject.fun_2 = data.fun_2;
            oject.fun_51s = data.fun_51s;
            oject.fun_52s = data.fun_52s;
            oject.fun_53s = data.fun_53s;
            oject.fun_cs = data.fun_cs;
            _continue_();
        })
        .catch(err => {
            res.status(500).send({
                message: err.message
            });
        });

    function _continue_() {
        FUN_0.findOne({
            include:
                [

                    {
                        model: RA,
                        where: { version: _version }, required: false,
                    },
                ],
            where: { id: _id, }
        })
            .then(data => {

                _arc_id = data.record_arc.id;
                oject.record_arc = data.record_arc;
                _continue_RAS_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    }

    function _continue_RAS_() {
        RA.findOne({
            include: [RAS,],
            where: { id: _arc_id, }
        })
            .then(data => {
                //console.log('OBJECT_ID', data)
                oject.record_arc.record_arc_steps = data.record_arc_steps;
                _continue_RA33A_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA33A_() {
        RA.findOne({
            include: [RA_33A,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_33_areas = data.record_arc_33_areas;
                _continue_RA34K_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA34K_() {
        RA.findOne({
            include: [RA_34K,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_34_ks = data.record_arc_34_ks;
                _continue_RA34G_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA34G_() {
        RA.findOne({
            include: [RA_34G,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_34_gens = data.record_arc_34_gens;
                _continue_RA35P_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA35P_() {
        RA.findOne({
            include: [RA_35P,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_35_parkings = data.record_arc_35_parkings;
                _continue_RA36I_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA36I_() {
        RA.findOne({
            include: [RA_36I,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_36_infos = data.record_arc_36_infos;
                _continue2_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue2_() {
        FUN_0.findOne({
            include:
                [

                    {
                        model: RL,
                        where: { version: _version }, required: false,
                    },
                    {
                        model: ENG,
                        include:
                            [
                                RES,
                                REW,
                            ],
                        where: { version: _version }, required: false,
                    },
                ],
            where: { id: _id, }
        })
            .then(data => {


                oject.record_law = data.record_law;
                oject.record_eng = data.record_eng;

                /**
                 * 
                 *  console.log('OBJECT TO DISPLAY')
                console.table(oject)
                console.log(oject)
                 * 
                 */
                let result = _PDFGEN_DOC_RES(oject);

                if (typeof result !== "object" || result === null) {
                    result = { message: result };
                }

                result.status = "OK";

                res.send(result);

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    }
};

exports.gen_doc_eje = (req, res) => {

    const _version = req.body.record_version ? req.body.record_version : res.send('NOT A REAL VERSION');
    const _id = req.body.id ? req.body.id : res.send('NOT A REAL ID');

    let _arc_id;
    let _law_id;
    let _eng_id;

    var oject = {
        type_not: (req.body.type_not ? req.body.type_not : 0),
        version: _version,
        id: _id,
        reso: req.body,
        r_simple: req.body.r_simple === 'true' ? 1 : 0,
        r_simple_name: req.body.r_simple_name ? req.body.r_simple_name : '',
        r_signs: req.body.r_signs === 'true' ? 1 : 0,
        r_pagesi: req.body.r_pagesi === 'true' ? 1 : 0,
        r_pagesn: req.body.r_pagesn === 'true' ? 1 : 0,
        r_pagesx: req.body.r_pagesx === 'true' ? 1 : 0,
        r_sign_align: req.body.r_sign_align ? req.body.r_sign_align : 'center',
        r_logo: req.body.logo ? req.body.logo : 'no',
        fun: null,
        fun_1s: null,
        fun_2: null,
        fun_51s: null,
        fun_52s: null,
        fun_53s: null,
        fun_cs: null,
        record_arc: null,
        record_law: null,
        record_eng: null,
        margins: {
            m_top: req.body.m_top ? req.body.m_top : 2.5,
            m_bot: req.body.m_bot ? req.body.m_bot : 2.5,
            m_left: req.body.m_left ? req.body.m_left : 1.7,
            m_right: req.body.m_right ? req.body.m_right : 1.7,
        }
    }

    FUN_0.findOne({
        include:
            [
                { model: FUN_1, where: { version: _version }, required: false, },
                { model: FUN_2 },
                //{ model: FUN_3 },
                { model: FUN_51 },
                { model: FUN_52 },
                { model: FUN_53, where: { version: _version }, required: false, },
                { model: FUN_C, where: { version: _version }, required: false, },
                //{ model: FUN_R, where: { version: _DATA.version }, required: false, },
                //{ model: FUN_LAW },

            ],
        where: { id: _id, }
    })
        .then(data => {
            oject.fun = {
                state: data.state,
                id_public: data.id_public,
                id_payment: data.id_payment,
                type: data.type,
                model: data.model,
                tags: data.tags,
            }
            oject.fun_1s = data.fun_1s;
            oject.fun_2 = data.fun_2;
            oject.fun_51s = data.fun_51s;
            oject.fun_52s = data.fun_52s;
            oject.fun_53s = data.fun_53s;
            oject.fun_cs = data.fun_cs;
            _continue_();
        })
        .catch(err => {
            res.status(500).send({
                message: err.message
            });
        });

    function _continue_() {
        FUN_0.findOne({
            include:
                [

                    {
                        model: RA,
                        where: { version: _version }, required: false,
                    },
                ],
            where: { id: _id, }
        })
            .then(data => {

                _arc_id = data.record_arc.id;
                oject.record_arc = data.record_arc;
                _continue_RAS_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    }

    function _continue_RAS_() {
        RA.findOne({
            include: [RAS,],
            where: { id: _arc_id, }
        })
            .then(data => {
                //console.log('OBJECT_ID', data)
                oject.record_arc.record_arc_steps = data.record_arc_steps;
                _continue_RA33A_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA33A_() {
        RA.findOne({
            include: [RA_33A,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_33_areas = data.record_arc_33_areas;
                _continue_RA34K_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA34K_() {
        RA.findOne({
            include: [RA_34K,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_34_ks = data.record_arc_34_ks;
                _continue_RA34G_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA34G_() {
        RA.findOne({
            include: [RA_34G,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_34_gens = data.record_arc_34_gens;
                _continue_RA35P_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA35P_() {
        RA.findOne({
            include: [RA_35P,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_35_parkings = data.record_arc_35_parkings;
                _continue_RA36I_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue_RA36I_() {
        RA.findOne({
            include: [RA_36I,],
            where: { id: _arc_id, }
        })
            .then(data => {
                oject.record_arc.record_arc_36_infos = data.record_arc_36_infos;
                _continue2_();

            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    }

    function _continue2_() {
        FUN_0.findOne({
            include:
                [

                    {
                        model: RL,
                        where: { version: _version }, required: false,
                    },
                    {
                        model: ENG,
                        include:
                            [
                                RES,
                                REW,
                            ],
                        where: { version: _version }, required: false,
                    },
                ],
            where: { id: _id, }
        })
            .then(data => {


                oject.record_law = data.record_law;
                oject.record_eng = data.record_eng;

                /**
                 * 
                 *  console.log('OBJECT TO DISPLAY')
                console.table(oject)
                console.log(oject)
                 * 
                 */
                let result = _PDFGEN_DOC_EJE(oject);

                if (typeof result !== "object" || result === null) {
                    result = { message: result };
                }

                result.status = "OK";

                res.send(result);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    }
};

exports.gen_doc_final_not = (req, res) => {

    var _DATA = {
        res_id: (req.body.res_id != 'null' ? req.body.res_id : ""),
        res_date: (req.body.res_date != 'null' ? req.body.res_date : ""),
        date_doc: (req.body.date_doc != 'null' ? req.body.date_doc : ""),
        id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
        cub: (req.body.cub ? req.body.cub : ''),

        name: (req.body.name != 'null' ? req.body.name : ""),
        city: (req.body.city != 'null' ? req.body.city : ""),
        email: (req.body.email != 'null' ? req.body.email : ""),
        address: (req.body.address != 'null' ? req.body.address : ""),

        digital_firm: (req.body.digital_firm == 'true' ? true : false),

    }
    if (curaduriaInfo.id == "cup1") _PDFGEN_DOC_FINAL_NOT_CUP1(_DATA);
    else _PDFGEN_DOC_FINAL_NOT(_DATA);
    res.send('OK');
};

function _PDFGEN_DOC1(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });

    let isSub = _DATA.type.includes('LICENCIA DE SUBDIVISION');

    const _BODY = `De acuerdo a lo establecido en el artículo 2.2.6.1.2.3.1 del Decreto 1077 de 2015, atentamente me permito 
    comunicarle, que a su solicitud número ${_DATA.id_public}, es viable concederle la respectiva licencia de ${_DATA.type}.`.replace(/[\n\r]+ */g, ' ');

    const _BODY2 = `Para lo cual, le solicito aportar los pagos correspondientes a impuestos y estampillas asociados a la 
    expedición de licencias, de acuerdo con el artículo 2.2.6.6.8.2 del decreto 1077 de 2015, los cuales deberán 
    ser presentados en el término máximo de treinta (30) días, contados a partir del recibo de la presente comunicación, 
    al igual que la cancelación de las expensas correspondientes.`.replace(/[\n\r]+ */g, ' ');

    const _BODY3 = `Cualquier aclaración o información complementaria sobre los aspectos aquí contemplados, con gusto 
    atenderemos y resolveremos sus inquietudes.`.replace(/[\n\r]+ */g, ' ');




    doc.pipe(fs.createWriteStream('./docs/public/expdoc1.pdf'));

    if (_DATA.type_not == 2 || _DATA.type_not == 3) {
        var _main_body = "";
        if (_DATA.type_not == 2) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; informándose además que contra dicho acto administrativo no se proceden recursos.`;
        if (_DATA.type_not == 3) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; Informándose además que contra dicho acto administrativo proceden los recursos de reposición ante ${curaduriaInfo.pronoum} ${curaduriaInfo.job} que lo expidió y de apelación ante la Oficina Asesora de Planeación, para que lo aclare, modifique o revoque. El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días hábiles siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011.`;

        const _BODIES_NOTS = [
            `ASUNTO: NOTIFICACIÓN ELECTRÓNICA RADICADO N° ${_DATA.id_public} DEL ${dateParser(_DATA.date).toUpperCase()} CON CONSECUTIVO ${_DATA.cub}`,
            `Por medo del presente está siendo notificado electrónicamente del Acto de tramite de viabilidad contenido en el Radicado N° ${_DATA.id_public} del ${dateParser(_DATA.date)} expedida por ${curaduriaInfo.pronoum} ${curaduriaInfo.job}. El acto administrativo objeto de notificación se encuentra adjunto a la presente comunicación.`,
            _main_body,
            `De conformidad con el inciso 5 del artículo 56 de la Ley 1437 de 2011, la notificación quedará surtida a partir de la fecha y hora en el que usted acceda a la misma, hecho que deberá ser certificado por esta Curaduría y/o a partir del momento en que acuse recibo respondiendo de este correo.`,
            `Si requiere de información adicional puede comunicarse al número telefónico ${curaduriaInfo.tel} - ${curaduriaInfo.cel}  o al correo electrónico: ${curaduriaInfo.email}.`
        ];

        doc.fontSize(11);
        doc.text('\n\n\n');
        doc.font('Helvetica-Bold');
        doc.font('Helvetica');
        doc.text('Señor(es)');
        doc.font('Helvetica-Bold');

        doc.text(_DATA.name);
        doc.text(_DATA.addressn);

        doc.moveDown();
        doc.text(_BODIES_NOTS[0], { align: 'justify' });
        doc.moveDown();
        doc.moveDown();
        doc.font('Helvetica');
        doc.text(_BODIES_NOTS[1], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[2], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[3], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[4], { align: 'justify' });
        doc.moveDown();
        pdfSupport.setSign(doc)
        not_page = doc.bufferedPageRange().count;

        doc.addPage();
        doc.y = doc.page.margins.top;
        doc.x = doc.page.margins.left;

    }

    doc.fontSize(10);
    doc.font('Helvetica')
    doc.text(_DATA.city + ', ' + dateParser(_DATA.date), { continued: true });
    doc.font('Helvetica-Bold')
    doc.text(_DATA.id_public, { align: 'right' });
    doc.text(_DATA.cub, { align: 'right' });
    doc.font('Helvetica');
    doc.text("\n");
    doc.text('Señor(a)');
    doc.font('Helvetica-Bold')
    doc.text((_DATA.name || '').replace('\r', ''));
    doc.text(_DATA.addressn);
    doc.font('Helvetica');
    doc.text("\n");
    doc.text('Referencia: Viabilidad de Licencia');
    doc.text(`Tipo de Solicitud: ${_DATA.type}`);
    doc.text(`Dirección del predio: ${_DATA.address}`);
    doc.text("\n\n");
    doc.text('Respetado(a) Señor(a):');
    doc.text("\n");
    doc.text(_BODY, { align: 'justify' });
    if (!isSub) {
        doc.text("\n\n");
        doc.text(_BODY2, { align: 'justify' });
    }
    doc.text("\n");
    doc.text(_BODY3, { align: 'justify' });
    doc.text("\n");
    doc.text("Agradezco de antemano la atención brindada a la presente.");
    doc.text("\n");
    doc.text("Muy atentamente:");
    doc.text('\n\n\n\n\n');
    doc.font('Helvetica-Bold')
    doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    doc.text(curaduriaInfo.job);

    if (_DATA.type_not == 1) {
        doc.fontSize(8).text('\n');
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'NOTIFICACIÓN PERSONAL', config: { align: 'center', bold: true, valign: true } },
            ],
            [doc.x, doc.y],
            [60, 1],
            { lineHeight: -1 })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'NOMBRE DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
                { coord: [15, 0], w: 15, h: 1, text: 'DOCUMENTO DE IDENTIDAD', config: { align: 'center', bold: true, valign: true } },
                { coord: [30, 0], w: 15, h: 1, text: 'FECHA Y HORA DE NOTIFICACIÓN', config: { align: 'center', bold: true, valign: true } },
                { coord: [45, 0], w: 15, h: 1, text: 'FIRMA DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
            ],
            [doc.x, doc.y],
            [60, 1],
            { lineHeight: -1 })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [15, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [30, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [45, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },

            ],
            [doc.x, doc.y],
            [60, 2],
            { lineHeight: -1 })
    }

    pdfSupport.setHeader(doc, { title: 'Acto de tramite de viabilidad licencia', size: 13, icon: true })

    doc.end();
    return true;
}

function _PDFGEN_DOC1_CUP1(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });

    let isSub = _DATA.type.includes('LICENCIA DE SUBDIVISION');

    const _BODY = `Por medio de la presente, le comunico que en mi calidad de Curadora Urbana N° 1 de Piedecuesta, con fundamento en el artículo 2.2.6.1.2.3.1 y el 
    artículo 2.2.6.6.8.2 del Decreto 1077 de 2015 y sus modificaciones, declaro viable la solicitud de ${_DATA.type} radicada bajo el 
    expediente N.º${_DATA.id_public}.`.replace(/[\n\r]+ */g, ' ');

    const _BODY2 = `Con base en lo anterior, me permito requerirle a efectos de que realice el pago de expensas, impuestos, gravámenes, tasas, participaciones y 
    contribuciones causadas por el trámite de la referencia. Para tal efecto, se adjuntan los siguientes documentos:  `.replace(/[\n\r]+ */g, ' ');

    const _LIST_1 = ['Liquidación por concepto de cargo variable a cancelar a la suscrita Curadora Urbana.',
        'Liquidación indicativa por las obligaciones tributarias y demás conceptos asociados a la expedición de la licencia.']

    const _BODY3 = `Se aclara que en la parte inferior de los mencionados documentos se encuentra la información de los diferentes medios y modalidades de pago 
    habilitados para tal efecto.`.replace(/[\n\r]+ */g, ' ');

    const _BODY4_1 = `El pago deberá efectuarse dentro de los `.replace(/[\n\r]+ */g, ' ');
    const _BODY4_2 = ` siguientes a la fecha de la presente comunicación, término dentro del cual también deberá aportar en ventanilla única, los comprobantes de 
    pago que permitan verificar el cumplimiento de dichas obligaciones.`.replace(/[\n\r]+ */g, ' ');

    const _BODY5 = `Si no atiende dentro del plazo este requerimiento, su solicitud se entenderá como desistida, y, en consecuencia, se procederá a archivar el 
    expediente. En tal caso, deberá iniciar un nuevo trámite si desea continuar con el proyecto..`.replace(/[\n\r]+ */g, ' ');

    const _BODY6_1 = `Sin otro particular, se advierte que el acto administrativo que concede la solicitud urbanística, solo podrá expedirse cuando acredite el pago 
    de las mencionadas obligaciones. Por lo tanto, se procederá a la mencionada expedición dentro de los `.replace(/[\n\r]+ */g, ' ');
    const _BODY6_2 = ` contados a partir de la entrega de los comprobantes de pago.`.replace(/[\n\r]+ */g, ' ');

    const _BODY7 = `Para consultas o aclaraciones, puede contactarnos a través del correo electrónico ${curaduriaInfo.email}, el celular y/o 
    WhatsApp ${curaduriaInfo.cel}, el teléfono fijo ${curaduriaInfo.tel} o de forma presencial en el ${curaduriaInfo.dir}`.replace(/[\n\r]+ */g, ' ');


    const _BODY8_SUB_1 = `Por lo tanto, se procederá a la mencionada expedición del acto administrativo dentro de los `.replace(/[\n\r]+ */g, ' ');
    const _BODY8_SUB_2 = ` siguientes`.replace(/[\n\r]+ */g, ' ');

    function LIST(array, config = {}) {
        let _config = {
            ident: config.ident || 0,
            jump: config.jump === false ? config.jump : true,
            useNum: config.useNum === false ? config.useNum : true,
            startAt: config.startAt || 0,
            root: config.root || '',
            useLetters: config.useLetters || false,
            startAtl: config.startAtl || 'a',
            bold: config.bold === false ? config.bold : true,
        }

        let start_letter = _config.startAtl;

        array.map((d, i) => {
            let prev_string = "-";
            if (_config.useNum) prev_string = (Number(i) + (_config.startAt ? Number(_config.startAt) : 1)) + '.';
            if (_config.useLetters) prev_string = start_letter + '.';
            if (_config.root) prev_string = _config.root + '.' + prev_string
            let prev = prev_string;
            start_letter = nextLetter(start_letter);
            if (d) pdfSupport.table(doc,
                [
                    { coord: [_config.ident, 0], w: 3, h: 1, text: prev, config: { align: 'left', bold: true, hide: true } },
                    { coord: [3 + _config.ident, 0], w: 57 - _config.ident, h: 1, text: d, config: { align: 'justify', hide: true, bold: _config.bold } },
                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true })
        })
        if (_config.jump) doc.moveDown();
    }

    doc.pipe(fs.createWriteStream('./docs/public/expdoc1.pdf'));

    if (_DATA.type_not == 2 || _DATA.type_not == 3) {
        var _main_body = "";
        if (_DATA.type_not == 2) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; informándose además que contra dicho acto administrativo no se proceden recursos.`;
        if (_DATA.type_not == 3) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; Informándose además que contra dicho acto administrativo proceden los recursos de reposición ante el/la Curador/a Urbano/a que lo expidió y de apelación ante la Oficina Asesora de Planeación, para que lo aclare, modifique o revoque. El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días hábiles siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011.`;

        const _BODIES_NOTS = [
            `ASUNTO: NOTIFICACIÓN ELECTRÓNICA RADICADO N° ${_DATA.id_public} DEL ${dateParser(_DATA.date).toUpperCase()}`,
            `Por medo del presente está siendo notificado electrónicamente del Acto Declaración en Legal y Debida forma contenido en el Radicado N° ${_DATA.id_public} del ${dateParser(_DATA.date)} expedida por ${curaduriaInfo.pronoum} ${curaduriaInfo.job}. El acto administrativo objeto de notificación se encuentra adjunto a la presente comunicación.`,
            _main_body,
            `De conformidad con el inciso 5 del artículo 56 de la Ley 1437 de 2011, la notificación quedará surtida a partir de la fecha y hora en el que usted acceda a la misma, hecho que deberá ser certificado por esta Curaduría y/o a partir del momento en que acuse recibo respondiendo de este correo.`,
            `Si requiere de información adicional puede comunicarse al número telefónico ${curaduriaInfo.tel} - ${curaduriaInfo.cel}  o al correo electrónico: ${curaduriaInfo.email}.`
        ];
        doc.fontSize(11);
        doc.text('\n\n\n');
        doc.font('Helvetica-Bold');
        doc.font('Helvetica');
        doc.text('Señor(es)');
        doc.font('Helvetica-Bold');

        doc.text(`${_DATA.name}`);
        if (_DATA.email) doc.text(_DATA.email);
        if (_DATA.address) doc.text(_DATA.address);

        doc.moveDown();
        doc.text(_BODIES_NOTS[0], { align: 'justify' });
        doc.moveDown();
        doc.moveDown();
        doc.font('Helvetica');
        doc.text(_BODIES_NOTS[1], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[2], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[3], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[4], { align: 'justify' });
        doc.moveDown();
        pdfSupport.setSign(doc)
        not_page = doc.bufferedPageRange().count;

        doc.addPage();
        doc.y = doc.page.margins.top;
        doc.x = doc.page.margins.left;
    }


    doc.fontSize(10);
    doc.font('Helvetica')
    doc.text(_DATA.city + ', ' + dateParser(_DATA.date), { continued: true });

    doc.font('Helvetica');
    doc.text("\n");
    doc.text('Señor(a)');
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.name}\n${_DATA.addressn}\nE.S.M.`);
    doc.font('Helvetica-Bold');
    doc.text("\n");
    doc.fontSize(10).text(`Referencia: `, { continued: true });
    doc.font('Helvetica')
    doc.fontSize(10).text(`Comunicación de Viabilidad – Requerimiento de Pago. Expediente Radicado N.° ${_DATA.id_public}.\n\n`, { align: 'justify' });
    doc.font('Helvetica-Bold')
    doc.fontSize(10).text(`Cordial saludo,\n\n`);
    doc.font('Helvetica')
    doc.text(_BODY, { align: 'justify' });
    doc.text('\n');
    if (isSub) {
        doc.font('Helvetica')
        doc.text(_BODY8_SUB_1, { continued: true, align: 'justify' });
        doc.font('Helvetica-Bold')
        doc.text(' cinco (5) días hábiles ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY8_SUB_2);
        doc.text('\n');
    } else {
        doc.text(_BODY2, { align: 'justify' });
        doc.text('\n');
        LIST(_LIST_1, { bold: false })
        doc.text(_BODY3, { align: 'justify' });
        doc.text('\n');
        doc.font('Helvetica-Bold')
        LIST(['Plazo'], { useNum: false })
        doc.font('Helvetica')
        doc.text(_BODY4_1, { continued: true, align: 'justify' });
        doc.font('Helvetica-Bold')
        doc.text(' treinta (30) días hábiles ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY4_2);
        doc.text('\n');
        doc.font('Helvetica-Bold')
        LIST(['Consecuencias del incumplimiento '], { useNum: false })
        doc.font('Helvetica')
        doc.text(_BODY5, { align: 'justify' });
        doc.text('\n');
        doc.font('Helvetica-Bold')
        LIST(['Condición y plazo para la expedición del Acto Administrativo  '], { useNum: false })
        doc.font('Helvetica')
        doc.text(_BODY6_1, { continued: true, align: 'justify' });
        doc.font('Helvetica-Bold')
        doc.text(' cinco (5) días hábiles ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY6_2);
        doc.text('\n');
    }

    doc.font('Helvetica-Bold')
    LIST(['Información de Contacto'], { useNum: false })
    doc.font('Helvetica')
    doc.text(_BODY7, { align: 'justify' });
    doc.text('\n\n');
    doc.font('Helvetica-Bold')
    doc.text(' Atentamente, ');

    pdfSupport.setSign(doc);

    if (_DATA.type_not == 1) {
        doc.fontSize(8).text('\n');
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'NOTIFICACIÓN PERSONAL', config: { align: 'center', bold: true, valign: true } },
            ],
            [doc.x, doc.y],
            [60, 1],
            { lineHeight: -1 })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'NOMBRE DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
                { coord: [15, 0], w: 15, h: 1, text: 'DOCUMENTO DE IDENTIDAD', config: { align: 'center', bold: true, valign: true } },
                { coord: [30, 0], w: 15, h: 1, text: 'FECHA Y HORA DE NOTIFICACIÓN', config: { align: 'center', bold: true, valign: true } },
                { coord: [45, 0], w: 15, h: 1, text: 'FIRMA DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
            ],
            [doc.x, doc.y],
            [60, 1],
            { lineHeight: -1 })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [15, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [30, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [45, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },

            ],
            [doc.x, doc.y],
            [60, 2],
            { lineHeight: -1 })
    }
    else if (_DATA.type_not == 4) {
        pdfSupport.table(doc,
            [{ coord: [0, 0], w: 60, h: 1, text: 'COMUNICACIÓN AL USUARIO ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
            [doc.x, doc.y], [60, 1], {})
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 30, h: 1, text: `Fecha de Comunicación\n\n\n\n${dateParser(_DATA.type_not_name)}`, config: { align: 'center' } },
                { coord: [30, 0], w: 30, h: 1, text: `Firma del Recibido\n\n\n\n${_DATA.name}`, config: { align: 'center' } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    }

    pdfSupport.setHeader(doc, { title: 'Acto de Trámite de Viabilidad — Requerimiento de Pago', size: 13, icon: true, id_public: _DATA.cub });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC2(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });


    doc.pipe(fs.createWriteStream('./docs/public/expdoc2.pdf'));
    pdfSupport.setWaterMark(doc, 'PAGAR EN LA CURADURIA', { angle: -60 })

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y,
        ['1. INFORMACIÓN GENERAL',],
        [1],
        { align: 'center', draw: false },
    )
    doc.text("\n");
    doc.font('Helvetica')
    doc.fontSize(9);
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Modalidad:', _DATA.type, 'Solicitud N°:', _DATA.id_public],
        [2, 5, 2, 2],
        [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Direccion Predio:', _DATA.address, 'Predio N°:', _DATA.catastral],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Destinación:', _DATA.destination, 'Estrato:', _DATA.strata],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Titular(es):', _DATA.name, 'Cedula(s) o NIT(s):', _DATA.nameid],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    doc.text("\n");
    doc.font('Helvetica-Bold')
    doc.fontSize(10);
    pdfSupport.rowConfCols(doc, doc.y,
        ['2. INFORMACIÓN LIQUIDACION',],
        [1],
        { align: 'center', pretty: true, width: 440, X: 86 },
    )
    pdfSupport.rowConfCols(doc, doc.y,
        ['Tipo de Actuación', 'Uso', 'Área de intervención m2', 'Cargo Variable',],
        [1, 1, 1, 1], { align: 'center', width: 440, X: 86 }
    )
    doc.font('Helvetica')
    let _areas = _DATA.areas.length ? _DATA.areas.split(';') : [];
    let _uses = _DATA.uses.length ? _DATA.uses.split(';') : [];
    let _charges = _DATA.charges.length ? _DATA.charges.split(';') : [];
    let _descs = _DATA.descs.length ? _DATA.descs.split(';') : [];
    for (var i = 0; i < _areas.length; i++) {
        pdfSupport.rowConfCols(doc, doc.y,
            [_descs[i], _uses[i], _areas[i], `$${_charges[i]}`,],
            [1, 1, 1, 1], { align: 'center', width: 440, X: 86 }
        )
    }
    pdfSupport.rowConfCols2(doc, doc.y,
        ['SUBTOTAL', `$${_DATA.subtotal}`,],
        [3, 1], [{ align: 'right', bold: true }, {}], { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['IVA (19%)', `$${_DATA.iva}`,],
        [3, 1], [{ align: 'right', bold: true }, {}], { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['TOTAL A PAGAR', `$${_DATA.total}`,],
        [3, 1], [{ align: 'right', bold: true }, {}], { width: 440, X: 86 }
    )

    doc.font('Helvetica-Bold')
    doc.text("V°B° CURADOR URBANO", doc.x, doc.page.height - 150, { align: 'right' });
    doc.font('Helvetica')
    doc.fontSize(9);
    doc.text("\nPodrá realizar el pago en el Banco Caja Social o Corresponsal, convenio No. 15912614 y Referencia (cédula del titular). Para más información podrá consultar los canales disponibles de contacto en la página web (curaduria1bucaramanga.com)", { align: 'justify' });

    pdfSupport.setHeader(doc, { title: 'Liquidacion de Expensas', size: 13, icon: true })



    doc.end();
    return true;
}

function _PDFGEN_DOC2_fld2(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });


    doc.pipe(fs.createWriteStream('./docs/public/expdoc2.pdf'));
    pdfSupport.setWaterMark(doc, 'PAGAR EN LA CURADURIA', { angle: -60 })

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y,
        ['1. INFORMACIÓN GENERAL',],
        [1],
        { align: 'center', draw: false },
    )
    doc.text("\n");
    doc.font('Helvetica')
    doc.fontSize(9);
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Modalidad:', _DATA.type, 'Solicitud N°:', _DATA.id_public],
        [2, 5, 2, 2],
        [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Direccion Predio:', _DATA.address, 'Predio N°:', _DATA.catastral],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Destinación:', _DATA.destination, 'Estrato:', _DATA.strata],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Titular(es):', _DATA.name, 'Cedula(s) o NIT(s):', _DATA.nameid],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    doc.text("\n");
    doc.font('Helvetica-Bold')
    doc.fontSize(10);
    pdfSupport.rowConfCols(doc, doc.y,
        ['2. INFORMACIÓN LIQUIDACION',],
        [1],
        { align: 'center', pretty: true, width: 440, X: 86 },
    )
    pdfSupport.rowConfCols(doc, doc.y,
        ['Tipo de Actuación', 'Uso', 'Área de intervención m2', 'Cargo Variable',],
        [1, 1, 1, 1], { align: 'center', width: 440, X: 86 }
    )
    doc.font('Helvetica')
    let _areas = _DATA.areas.length ? _DATA.areas.split(';') : [];
    let _uses = _DATA.uses.length ? _DATA.uses.split(';') : [];
    let _charges = _DATA.charges.length ? _DATA.charges.split(';') : [];
    let _descs = _DATA.descs.length ? _DATA.descs.split(';') : [];
    for (var i = 0; i < _areas.length; i++) {
        pdfSupport.rowConfCols(doc, doc.y,
            [_descs[i], _uses[i], _areas[i], `$${_charges[i]}`,],
            [1, 1, 1, 1], { align: 'center', width: 440, X: 86 }
        )
    }
    pdfSupport.rowConfCols2(doc, doc.y,
        ['SUBTOTAL', `$${_DATA.subtotal}`,],
        [3, 1], [{ align: 'right', bold: true }, {}], { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['IVA (19%)', `$${_DATA.iva}`,],
        [3, 1], [{ align: 'right', bold: true }, {}], { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['TOTAL A PAGAR', `$${_DATA.total}`,],
        [3, 1], [{ align: 'right', bold: true }, {}], { width: 440, X: 86 }
    )

    pdfSupport.setSign(doc);
    doc.text("\nPodrá realizar transferencia o consignación en Bancolombia cuenta de ahorros 726-000043-57 o en nuestra oficina con código QR  o a través de datáfono Redeban.", { align: 'justify' });
    pdfSupport.setHeader(doc, { title: 'Liquidacion de Expensas', size: 13, icon: true });
    pdfSupport.setBottom(doc, false, true);
    doc.end();
    return true;
}

function _PDFGEN_DOC3(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 86,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });


    doc.pipe(fs.createWriteStream('./docs/public/expdoc3.pdf'));
    //pdfSupport.setWaterMark(doc, 'PAGAR EN LA ALCALDIA', { angle: -60 })

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    doc.text(`Enviado de: ${curaduriaInfo.name} - ${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    doc.font('Helvetica')
    doc.text('\n');
    doc.text('Señores');
    doc.text('SECRETARIA DE HACIENDA');
    doc.text(curaduriaInfo.city);
    doc.text('\n');
    doc.font('Helvetica-Bold')
    doc.text('Referencia: Pre-Liquidación Impuestos Proyectos de Licencia');
    doc.font('Helvetica')

    doc.font('Helvetica-Bold')
    doc.text("\n");
    pdfSupport.rowConfCols(doc, doc.y,
        ['1. INFORMACIÓN GENERAL',],
        [1],
        { align: 'center', draw: false },
    )
    doc.text("\n");
    doc.font('Helvetica')
    doc.fontSize(9);
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Modalidad:', _DATA.type, 'Solicitud N°:', _DATA.id_public],
        [2, 5, 2, 2],
        [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Direccion Predio:', _DATA.address, 'Predio N°:', _DATA.catastral],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        [' ', ' ', 'Estrato:', _DATA.strata],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Titular(es):', _DATA.name, 'Cedula(s) o NIT(s):', _DATA.nameid],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        [' ', ' ', 'Zona:', _DATA.zone],
        [2, 5, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    doc.text("\n");
    doc.font('Helvetica-Bold')
    doc.fontSize(10);
    pdfSupport.rowConfCols(doc, doc.y,
        ['2. INFORMACIÓN ÁREAS',],
        [1],
        { align: 'center', pretty: true, width: 440, X: 86 },
    )
    pdfSupport.rowConfCols(doc, doc.y,
        ['Tipo de Actuación', 'Uso', 'Área m2',],
        [1, 1, 1], { align: 'center', width: 440, X: 86 }
    )
    doc.font('Helvetica')

    let _areas = _DATA.areas.length ? _DATA.areas.split(';') : [];
    let _uses = _DATA.uses.length ? _DATA.uses.split(';') : [];
    //let _charges = _DATA.charges.length ? _DATA.charges.split(';') : [];
    let _descs = _DATA.descs.length ? _DATA.descs.split(';') : [];

    for (var i = 0; i < _areas.length; i++) {
        pdfSupport.rowConfCols(doc, doc.y,
            [_descs[i], _uses[i], _areas[i],],
            [1, 1, 1], { align: 'center', width: 440, X: 86 }
        )
    }
    doc.text("\n");
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Tratamiento:', _DATA.treatment],
        [1, 3], [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )
    doc.text("\n");
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y,
        ['3. LIQUIDACIÓN DE IMPUESTOS (Conceptos)',],
        [1],
        { align: 'center', width: 440, X: 86, draw: false },
    )
    let names = _DATA.name.replace(/\r?\n|\r/g, ', ');
    //names = names.join(', ')
    doc.font('Helvetica')
    doc.text("\n");
    doc.text(`Sirvase recibir del señor(a) ${names}, los siguientes conceptos:`);
    doc.text("\n");
    doc.font('Helvetica-Bold')

    pdfSupport.rowConfCols(doc, doc.y,
        ['CODIGO', 'CUENTA', 'VALOR'],
        [1, 4, 1],
        { align: 'center', width: 440, X: 86 },
    )
    doc.font('Helvetica')
    pdfSupport.rowConfCols2(doc, doc.y,
        [_DATA.cod1, _DATA.account1, `$${_DATA.tax1}`],
        [1, 4, 1],
        [{ align: 'center' },
        { align: 'left' },
        { align: 'right' },],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        [_DATA.cod2, _DATA.account2, `$${_DATA.tax2}`],
        [1, 4, 1],
        [{ align: 'center' },
        { align: 'left' },
        { align: 'right' },],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        [_DATA.cod3, _DATA.account3, `$${_DATA.tax3}`],
        [1, 4, 1],
        [{ align: 'center' },
        { align: 'left' },
        { align: 'right' },],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['TOTAL A PAGAR', `$${_DATA.total}`,],
        [5, 1], [{ align: 'right', bold: true }, { align: 'right', bold: true }], { width: 440, X: 86 }
    )

    doc.font('Helvetica-Bold')
    doc.text("\n\n\n\n");
    doc.text("V°B° CURADOR URBANO", { align: 'right' });
    doc.font('Helvetica')
    doc.fontSize(9);
    doc.text("\nSobre los valores de este documento, NO SE DEBE HACER RETENCIÓN, por tratarse de Estampillas e Impuestos.", { align: 'justify' });

    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC4(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });

    const _BODY = `Atentamente me permito suministrar la información necesaria para liquidar el valor de la estampilla 
    PRO-UIS, por ceoncepto de licencia de construcción de algunas(s) de sus modalidades: Construcción nueva, ampliación 
    modificación, adecuación demolición, restauración y reforzamiento estructural asi:`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/expdoc4.pdf'));
    pdfSupport.setWaterMark(doc, 'PAGAR A FAVOR DE LA GOBERNACION \n CASA DEL LIBRO', { angle: -60 })

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    doc.text('Señores');
    doc.text('TESORERIA DEPARTAMENTAL');
    doc.text(curaduriaInfo.city);
    doc.text('\n\n');
    doc.text('Referencia: Pre-Liquidación estampilla PRO-UIS para licencias de construcción');
    doc.text('\n\n');
    doc.font('Helvetica');
    doc.text('Apreciados Señores:');
    doc.text('\n\n');
    doc.text(_BODY, { align: 'justify' });
    doc.text('\n\n');

    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y,
        ['INFORMACIÓN',],
        [1],
        { align: 'LEFT', draw: false, width: 440, X: 86 },
    )
    doc.font('Helvetica');
    doc.text('\n');
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Solicitud de licencia:', _DATA.id_public],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Predio N°:', _DATA.catastral],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Tipo de Licencia:', _DATA.type],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Nombre(s):', _DATA.name],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Cédula(s) o NIT(s):', _DATA.nameid],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Dirección Predio:', _DATA.address],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Destinación:', _DATA.destination],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Estrato:', _DATA.strata],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Área Intervención:', `${_DATA.uis1} m2`],
        [1, 3],
        [{ align: 'left' },
        { align: 'left', bold: true }],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['VALOR ESTAMPILLA PRO-UIS:', ` $${_DATA.uis2_t}`],
        [3, 1],
        [{ align: 'right', bold: true },
        { align: 'right', bold: true }],
        { draw: false, width: 440, X: 86 }
    )

    if (curaduriaInfo.id == "fld2") pdfSupport.setSign(doc);

    pdfSupport.setHeader(doc, { title: 'Estampilla PRO-UIS', size: 13, icon: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC4_CUP1(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 72,
            right: 72
        },
        bufferPages: true,
    });

    const _BODY = `ESTE FORMATO ES SOLO DE CONTROL INTERNO - VÁLIDO PARA GENERAR EL
    RECIBO OFICIAL EN EL BANCO REPONSABLE, SU VALOR PUEDE CAMBIAR
    RESPECTO AL SOFTWARE DE LA GOBERNACION. HORARIO DE LUNES A
    VIERNES DE 8AM A 12M Y 2PM A 4:30PM`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/expdoc4.pdf'));

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    doc.text('Señores');
    doc.text('Departamento PROUIS Secretaría de Hacienda');
    doc.text(`${curaduriaInfo.statelc}`);
    doc.text('\n\n');
    doc.text('ESTAMPILLA PROUIS ORDENANZA 022 DE 2016', { align: 'center' });
    doc.font('Helvetica');
    doc.text('Liquidación indicativa: De conformidad con el artículo 2.2.6.6.8.2 del Decreto 1077 de 2015', { align: 'center' });
    doc.text('\n\n');

    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 11, h: 1, text: 'Contribuyente:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [11, 0], w: 19, h: 1, text: _DATA.name, config: { hide: true, align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: 'Nit o Cédula:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [40, 0], w: 20, h: 1, text: _DATA.nameid, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 11, h: 1, text: 'Solicitud No:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [11, 0], w: 19, h: 1, text: _DATA.id_public, config: { hide: true, align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: 'Predio No.:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [40, 0], w: 20, h: 1, text: _DATA.catastral, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], {})

    doc.text('\n');

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 10, h: 1, text: 'ESTRATO', config: { bold: true, align: 'center' } },
            { coord: [10, 0], w: 30, h: 1, text: 'CONCEPTO', config: { bold: true, align: 'center' } },
            { coord: [40, 0], w: 10, h: 1, text: 'CANTIDAD M2', config: { bold: true, align: 'center' } },
            { coord: [50, 0], w: 10, h: 1, text: 'VALOR TOTAL', config: { bold: true, align: 'center' } },

            { coord: [0, 1], w: 10, h: 1, text: _DATA.strata, config: { align: 'center' } },
            { coord: [10, 1], w: 30, h: 1, text: 'Estampilla PROUIS', config: { align: 'left' } },
            { coord: [40, 1], w: 10, h: 1, text: _DATA.uis1, config: { align: 'center' } },
            { coord: [50, 1], w: 10, h: 1, text: '$' + _DATA.uis2, config: { align: 'center' } },

            { coord: [0, 2], w: 10, h: 1, text: ' ', config: { align: 'center' } },
            { coord: [10, 2], w: 30, h: 1, text: `Estampilla PROUIS (${_DATA.uis2_p})`, config: { align: 'left' } },
            { coord: [40, 2], w: 10, h: 1, text: ' ', config: { align: 'center' } },
            { coord: [50, 2], w: 10, h: 1, text: '$' + _DATA.uis2_v, config: { align: 'center' } },

            { coord: [0, 3], w: 50, h: 1, text: 'TOTAL PROUIS: ', config: { align: 'right', color: 'blue', bold: true, } },
            { coord: [50, 3], w: 10, h: 1, text: '$' + _DATA.uis2_t, config: { align: 'center', color: 'blue', bold: true, } },
        ],
        [doc.x, doc.y], [60, 4], { lineHeight: 13 })

    doc.text('\n');
    doc.fontSize(9);
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 40, h: 1, text: _BODY, config: { align: 'justify' } },

            { coord: [41, 0], w: 19, h: 1, text: `\n\nAUX CONTABLE CURADURIA. ${curaduriaInfo.w_spp_1}`, config: { align: 'center', valign: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })


    pdfSupport.setHeader(doc, { title: 'Estampilla PRO-UIS', size: 13, icon: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC5(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 86,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });

    const _BODY = `Con ocasión al proceso de solicitud de ${_DATA.type} del predio ubicado en ${_DATA.address} identificado con 
    el N°predial ${_DATA.catastral} y matricula inmobiliaria ${_DATA.matricula} me permito modificarle de la obligación establecida 
    por el Municipio de ${curaduriaInfo.city} en el Acuerdo 011 del 28 de Mayo de 2014, Plan de Ordenamiento Territorial de 
    Segunda Generaición.`.replace(/[\n\r]+ */g, ' ');

    const _BODY2 = `Que el titular de la ${_DATA.type} deberá cancelar los Deberes Urbanísticos establecidos mediante el Acuerdo 
    011 de 2014, artículo 192 Deberes Urbanísticos para provisión de espacio público, es el porcentaje de suelo útil 
    que el constructor debe ceder y entregar al municipio como contra prestación por el otorgamiento de edificabilidad en 
    una Licencia Urbanística, y cuyo destino es la generación y/o rehabilitación del espacio público que contribuya a reducir 
    el déficit, mejorar el espacio público existente o generar recursos para adelantar procesos de adquisición, confinación, 
    diseño, construcción, mantenimiento, generación, rehabilitación, y/o adecuación de espacio público.`.replace(/[\n\r]+ */g, ' ');

    const _BODY3 = `Aplica por el tratamiento, estrato, y por ser Comercial: sin embargo esta compensación se aplica por 
    metro cuadrado, por m2 a razón de <<${_DATA.charge}>>, lo cual: ${_DATA.totalw} ($${_DATA.totaln}) liquidados 
    con el valor de la ZGU ${_DATA.zgu} del plano geoeconómico de 2014, en caso de ser actualizado se debe ajustar 
    el valor.`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/expdoc5.pdf'));

    //pdfSupport.setWaterMark(doc, 'PAGAR EN LA ALCALDIA', { angle: -60 })

    doc.fontSize(10);
    doc.font('Helvetica')
    doc.text(_DATA.city + ', ' + dateParser(_DATA.date), { continued: true });
    doc.font('Helvetica-Bold')
    doc.text(_DATA.id_public, { align: 'right' });
    doc.text(_DATA.cub, { align: 'right' });
    doc.font('Helvetica');
    doc.text("\n");
    doc.text("Doctora");
    doc.font('Helvetica-Bold')
    doc.text("Dra. LYDA XIMENA RODRIGUEZ ACEVEDO");
    doc.font('Helvetica');
    doc.text("Secretaria de Planeación Municipal");
    doc.text("Municipio de " + curaduriaInfo.city);
    doc.text("E.S.M");
    doc.text("\n");
    doc.text('Señor(a)');
    doc.font('Helvetica-Bold')
    doc.text((_DATA.name || '').replace(/[\n\r]+ */g, ', '));
    doc.text((_DATA.addressn || '').replace(/[\n\r]+ */g, ', '));
    doc.font('Helvetica');
    doc.text("\n");
    doc.font('Helvetica-Bold')
    doc.text(`Asunto: Liquidación de Deberes Urbanísticos ${_DATA.type} N° ${_DATA.id_public}`, { align: 'justify' });
    doc.font('Helvetica');
    doc.text("\n\n");
    doc.text(_BODY, { align: 'justify' });
    doc.text("\n");
    doc.text(_BODY2, { align: 'justify' });
    doc.text("\n");
    doc.text(_BODY3, { align: 'justify' });

    doc.addPage();

    pdfSupport.setWaterMark(doc, 'PAGAR EN LA ALCALDIA', { angle: -60 })
    doc.fontSize(8);
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y,
        ['PAGO COMPENSATORIO DE LOS DEBERES URBANISTICOS\n PARA PROVISION DE ESPACIO PUBLICO',],
        [1],
        { align: 'center', pretty: true, width: 440, X: 86 },
    )
    doc.font('Helvetica');
    pdfSupport.rowConfCols2(doc, doc.y,
        ['CODIGO:', ' '],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['CODIGO PRESUPUESTAL:', ' '],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['FECHA:', _DATA.date],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['NUMERO PREDIAL:', _DATA.catastral],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['DIRECCION:', _DATA.address],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['TITULAR(ES) DE LA LICENCIA Y/O ACTUACION:', _DATA.name],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['TIPO DE LICENCIA Y/O ACTUACION', _DATA.type],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['NUMERO DE LICENCIA Y/O ACTUACION', _DATA.id_public],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['TRATAMIENTO URBANO:', _DATA.treatment],
        [1, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['ESTRATO SOCIECONOMICO:', _DATA.strata],
        [2, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['ZONA GEOECONOMICA FISICA', `CODIGO: ${_DATA.zgu}`],
        [2, 1],
        [{ align: 'right' },
        { align: 'left', bold: true }],
        { width: 440, X: 86 }
    )

    doc.text("\n");
    if (_DATA.v11) {
        doc.font('Helvetica-Bold')
        pdfSupport.rowConfCols(doc, doc.y,
            [`LIQUIDACION DE PROYECTOS DE VIVIENDA\n ${_DATA.v11 == 4 ? '(Estrato 3 y 4)' : '(Estrato 5 y 6)'}`,],
            [1],
            { align: 'center', pretty: true, width: 440, X: 86 },
        )
        doc.font('Helvetica-Bold')
        pdfSupport.rowConfCols(doc, doc.y,
            [`FORMULA: V = ${_DATA.v11} x U x V1`,],
            [1],
            { align: 'left', width: 440, X: 86 },
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`${_DATA.v11}`,
            `Equivalente por unidad de vivienda segun estrado: ${_DATA.v11 == 4 ? '3 y 4' : '5 y 6'}`,
                'm2 por Viv.',
            `${_DATA.v11}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`U`,
                `Número de unidades de vivienda del proyecto.`,
                'Numero',
                `${_DATA.v12}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`V1`,
                `Precio por metro de cuadrado del suelo según el valor catastral.`,
                'Pesos (COP)',
                `${_DATA.v13}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`V`,
                `Valor a consignar en el fondo para el espacio público.`,
                'Valor (COP)',
                `${_DATA.v14}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        doc.text("\n");
    }

    if (_DATA.v21) {
        doc.font('Helvetica-Bold')
        pdfSupport.rowConfCols(doc, doc.y,
            ['LIQUIDACION PARA USOS DE COMERCIO - SERVICIO - INDUSTRIAL - DOTACIONAL\n (Estrato 3, 4, 5 y 6)',],
            [1],
            { align: 'center', pretty: true, width: 440, X: 86 },
        )
        doc.font('Helvetica-Bold')
        pdfSupport.rowConfCols(doc, doc.y,
            [`FORMULA: V = 6/100 x A x V1`,],
            [1],
            { align: 'left', width: 440, X: 86 },
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`6/100`,
                `Equivalente 6 m2 por cada 100 m2 construidos como deber.`,
                '6m2 * 100m2',
                `${_DATA.v21}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`A`,
                `Área construida del proyecto, se excluyen sótanos y semisótanos.`,
                'm2',
                `${_DATA.v22}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`V1`,
                `Precio por metro de cuadrado del suelo según el valor catastral.`,
                'Pesos (COP)',
                `${_DATA.v23}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        pdfSupport.rowConfCols2(doc, doc.y,
            [`V`,
                `Valor a consignar en el fondo para el espacio público.`,
                'Valor (COP)',
                `${_DATA.v24}`],
            [1, 5, 1, 1],
            [{ align: 'center', bold: true },
            { align: 'left' },
            { align: 'right' },
            { align: 'center', bold: true }],
            { width: 440, X: 86 }
        )
        doc.text("\n");
    }
    doc.text("\n");
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y,
        [`SON: ${_DATA.totalw}`,],
        [1],
        { align: 'left', width: 440, X: 86 },
    );
    doc.text("\n");
    doc.text("(Cuadro Tomado del Decreto 0200/2015)");
    doc.text("\n\n");
    doc.text("NOTA:");
    doc.text(`- La presente Liquidación deberá ser presentada en la secretaria de planeación de ${curaduriaInfo.city}.`, { align: 'justify' });
    doc.text("- Cualquier aclaración o información complementaria sobre los aspectos aqui contemplados, con gusto atenderemos y resolveremos sus inquietudes.", { align: 'justify' });
    doc.text("\n\n");
    doc.text("Agradezco de antemano la atención brindada a la presente.");
    doc.text('\n\n\n\n\n\n');
    doc.font('Helvetica-Bold')
    doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    doc.text(curaduriaInfo.job);
    pdfSupport.setBottom(doc, true, false);

    doc.end();
    return true;
}

function _PDFGEN_DOC6(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 72,
            right: 72
        },
        bufferPages: true,
    });

    const _BODY = `ESTE FORMATO ES SOLO DE CONTROL INTERNO - VÁLIDO PARA GENERAR EL
    RECIBO OFICIAL EN LA SECRETARIA DE HACIENDA Y REALIZAR PAGO EN EL
    BANCO CAJA SOCIAL SEGUNDO PISO CENTRO COMERCIAL DE LA CUESTA EN
    HORARIO DE LUNES A VIERNES DE 8AM A 4PM JORNADA CONTINUA`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/expdoc6.pdf'));

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    doc.text('Señores');
    doc.text('Secretaría de Hacienda');
    doc.text(`${curaduriaInfo.city}`);
    doc.text('\n\n');
    doc.text('IMPUESTO DELINEACION URBANA SEGUN ACUERDO MUNICIPAL 009 DE 2018', { align: 'center' });
    doc.font('Helvetica');
    doc.text('Liquidación indicativa: De conformidad con el artículo 2.2.6.6.8.2 del Decreto 1077 de 2015', { align: 'center' });
    doc.text('\n\n');

    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 11, h: 1, text: 'Contribuyente:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [11, 0], w: 19, h: 1, text: _DATA.name, config: { hide: true, align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: 'Nit o Cédula:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [40, 0], w: 20, h: 1, text: _DATA.nameid, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 11, h: 1, text: 'Solicitud No:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [11, 0], w: 19, h: 1, text: _DATA.id_public, config: { hide: true, align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: 'Predio No.:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [40, 0], w: 20, h: 1, text: _DATA.catastral, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], {})

    doc.text('\n');

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 30, h: 1, text: 'DESCRIPCIÓN', config: { bold: true, align: 'center' } },
            { coord: [30, 0], w: 10, h: 1, text: 'VALOR M2', config: { bold: true, align: 'center' } },
            { coord: [40, 0], w: 10, h: 1, text: 'CANTIDAD M2', config: { bold: true, align: 'center' } },
            { coord: [50, 0], w: 10, h: 1, text: 'VALOR TOTAL', config: { bold: true, align: 'center' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: 13 })

    let descs = _DATA.descs.split(';');
    let sum = _DATA.sum.split(';');
    let areas = _DATA.areas.split(';');
    let charges = _DATA.charges.split(';');

    descs.map((item, i) => pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 30, h: 1, text: item, config: { align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: charges[i], config: { align: 'center', valign: true, } },
            { coord: [40, 0], w: 10, h: 1, text: areas[i], config: { align: 'center', valign: true, } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + sum[i], config: { align: 'center', valign: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 }))

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 50, h: 1, text: 'TOTAL: ', config: { align: 'right', color: 'blue', bold: true, } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + _DATA.total, config: { align: 'center', color: 'blue', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: 13 })

    doc.text('\n');
    doc.fontSize(9);
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 40, h: 1, text: _BODY, config: { align: 'justify' } },

            { coord: [41, 0], w: 19, h: 1, text: `\n\nAUX CONTABLE CURADURIA. ${curaduriaInfo.w_spp_1}`, config: { align: 'center', valign: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })


    pdfSupport.setHeader(doc, { title: 'Impuesto Delineación Urbana', size: 13, icon: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC6_fld2(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 72,
            right: 72
        },
        bufferPages: true,
    });

    const _BODY = `ESTE FORMATO ES SOLO DE CONTROL INTERNO - VÁLIDO PARA GENERAR EL
    RECIBO OFICIAL EN LA SECRETARIA DE HACIENDA Y REALIZAR PAGO EN EL
    BANCO CAJA SOCIAL SEGUNDO PISO CENTRO COMERCIAL DE LA CUESTA EN
    HORARIO DE LUNES A VIERNES DE 8AM A 4PM JORNADA CONTINUA`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/expdoc6.pdf'));

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    doc.text("Señores");
    doc.text("Secretaria de Hacienda");
    doc.text("Floridablanca");
    doc.text("\n");
    doc.text("Referencia: Certificación para Liquidación de Impuesto de Delineación Urbana", { align: 'center' });
    doc.text("\n");
    doc.font('Helvetica')
    doc.text("Respetados señores:");
    doc.text("Me permite remitir la infomación correspondiente para adelantar la liquidación del impuesto de delineación urbana asociada al proyecto que se describ a continuación.");
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y,
        ['1. INFORMACIÓN GENERAL',],
        [1],
        { align: 'center', draw: false },
    )
    doc.text("\n");
    doc.font('Helvetica')
    doc.fontSize(9);
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Expediente N°:', _DATA.id_public],
        [2, 6],
        [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Modalidad:', _DATA.type],
        [2, 6],
        [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Usos:', _DATA.destination],
        [2, 6],
        [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Direccion Predio:', _DATA.address],
        [2, 6],
        [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Código Catastral:', _DATA.catastral],
        [2, 6],
        [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Matricula:', _DATA.matricula],
        [2, 6],
        [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )
    pdfSupport.rowConfCols2(doc, doc.y,
        ['Área del predio:', `${_DATA.area} m2`],
        [2, 6],
        [{ align: 'left' },
        { align: 'left', bold: true },],
        { draw: false, width: 440, X: 86 }
    )

    pdfSupport.rowConfCols2(doc, doc.y,
        ['Titular(es):', _DATA.name, 'Cedula(s) o NIT(s):', _DATA.nameid],
        [2, 2, 2, 2], [{ align: 'left' },
        { align: 'left', bold: true },
        { align: 'left' },
        { align: 'center', bold: true }],
        { draw: false, width: 440, X: 86 }
    )

    doc.text("\n");
    doc.font('Helvetica-Bold')
    doc.fontSize(10);
    pdfSupport.rowConfCols(doc, doc.y,
        ['2. INFORMACIÓN DE ÁREAS',],
        [1],
        { align: 'center', pretty: true, width: 440, X: 86 },
    )
    pdfSupport.rowConfCols(doc, doc.y,
        ['Tipo de Actuación', 'Uso', 'Área de intervención m2', 'Impuesto',],
        [1, 1, 1, 1], { align: 'center', width: 440, X: 86 }
    )
    doc.font('Helvetica')
    let _areas = _DATA.areas.length ? _DATA.areas.split(';') : [];
    let _uses = _DATA.uses.length ? _DATA.uses.split(';') : [];
    let _charges = _DATA.charges.length ? _DATA.charges.split(';') : [];
    let _descs = _DATA.descs.length ? _DATA.descs.split(';') : [];
    for (var i = 0; i < _areas.length; i++) {
        pdfSupport.rowConfCols(doc, doc.y,
            [_descs[i], _uses[i], _areas[i], `$${_charges[i]}`,],
            [1, 1, 1, 1], { align: 'center', width: 440, X: 86 }
        )
    }
    pdfSupport.rowConfCols2(doc, doc.y,
        ['TOTAL A PAGAR', `$${_DATA.total}`,],
        [3, 1], [{ align: 'right', bold: true }, {}], { width: 440, X: 86 }
    )

    pdfSupport.setSign(doc, false, 12);
    pdfSupport.setHeader(doc, { title: 'Impuesto Delineación Urbana', size: 13, icon: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC7(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 128,
            bottom: 86,
            left: 72,
            right: 72
        },
        bufferPages: true,
    });

    const _BODY = `FORMAS DE PAGO: 1. Pago por transferencia cuenta corriente Banco Caja Social No. 21003537229 o cuenta ahorros Bancolombia No.
    79300000283 - CC- 37.754.281, a nombre SILVIA CAMARGO GUTIERREZ ; 2. Pago con tarjeta débito o crédito en recepción de la
    Curaduría.`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/expdoc7.pdf'));

    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    doc.text('\n\n');
    doc.text('Liquidación Expensas Proyectos de Licencia (Decreto 1077/2015)', { align: 'center' });
    doc.text('\n\n');
    doc.text('1. INFORMACION GENERAL');
    doc.text('\n');
    doc.font('Helvetica');
    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 13, h: 1, text: 'Solicitud No:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [13, 0], w: 17, h: 1, text: _DATA.id_public, config: { hide: true, align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: 'Predio No.:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [40, 0], w: 20, h: 1, text: _DATA.catastral, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 13, h: 1, text: 'Tipo de Solicitud:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [13, 0], w: 47, h: 1, text: _DATA.type, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 13, h: 1, text: 'Propietario:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [13, 0], w: 17, h: 1, text: _DATA.name, config: { hide: true, align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: 'Nit o Cédula:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [40, 0], w: 20, h: 1, text: _DATA.nameid, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 13, h: 1, text: 'Dirección predio:', config: { hide: true, bold: true, align: 'left' } },
            { coord: [13, 0], w: 17, h: 1, text: _DATA.address, config: { hide: true, align: 'left' } },
            { coord: [30, 0], w: 10, h: 1, text: 'Estrato:', config: { hide: true, align: 'left', bold: true, } },
            { coord: [40, 0], w: 20, h: 1, text: _DATA.strata, config: { hide: true, align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    doc.text('\n');
    doc.fontSize(9);

    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 30, h: 1, text: 'DESCRIPCION', config: { bold: true, align: 'center', valign: true, } },
            { coord: [30, 0], w: 10, h: 1, text: 'DESTINO', config: { bold: true, align: 'center', valign: true, } },
            { coord: [40, 0], w: 10, h: 1, text: 'ÁREAS DE\nINTERVENCION', config: { bold: true, align: 'center', valign: true, } },
            { coord: [50, 0], w: 10, h: 1, text: 'CARGO VARIABLE', config: { bold: true, align: 'center', valign: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    let descs = _DATA.descs.split(';');
    let areas = _DATA.areas.split(';');
    let uses = _DATA.uses.split(';');
    let sum = _DATA.sum.split(';');

    descs.map((item, i) => pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 30, h: 1, text: item, config: { align: 'left', valign: true, } },
            { coord: [30, 0], w: 10, h: 1, text: uses[i], config: { align: 'center', valign: true, } },
            { coord: [40, 0], w: 10, h: 1, text: areas[i], config: { align: 'center', valign: true, } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + sum[i], config: { align: 'center', valign: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 }))

    doc.text('\n');
    doc.fontSize(10);
    doc.font('Helvetica-Bold')
    doc.text('2. LIQUIDACION');
    doc.font('Helvetica');
    doc.text('\n');

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 50, h: 1, text: 'AJUSTE CARGO FIJO: ', config: { align: 'left', } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + _DATA.fix, config: { align: 'center', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: 13 })
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 50, h: 1, text: 'CARGO VARIABLE (Valor x Area): ', config: { align: 'left', } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + _DATA.subtotal, config: { align: 'center', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: 13 })
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 50, h: 1, text: 'TOTAL EXPENSAS: ', config: { align: 'left', } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + _DATA.subtotal_2, config: { align: 'center', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: 13 })
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 50, h: 1, text: 'IVA: ', config: { align: 'left', } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + _DATA.iva, config: { align: 'center', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: 13 })
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 50, h: 1, text: 'TOTAL A PAGAR: ', config: { align: 'left', bold: true, fill: 'silver', } },
            { coord: [50, 0], w: 10, h: 1, text: '$' + _DATA.total, config: { align: 'center', bold: true, fill: 'silver', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: 13 })

    doc.text('\n\n\n\n\n');

    doc.font('Helvetica-Bold')
    doc.text('VºBº CURADURIA URBANA', { align: 'center' });

    doc.text('\n');
    doc.fontSize(9);
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: _BODY, config: { align: 'justify' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    doc.text('\n');
    doc.fontSize(8);

    doc.text('Este documento NO ES VALIDO COMO FACTURA, esta se expide por la Curaduría en el momento de su cancelación');


    pdfSupport.setHeader(doc, { title: 'Liquidación de Expensas', size: 13, icon: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC_RES(_DATA) {
    const PDFDocument = require('pdfkit');
    var maringConverter = 28.346456693 //   THIS IS 1 cm
    let top_offset = 90;
    if (_DATA.reso.header_text) top_offset += 16

    var doc = new PDFDocument({
        size: 'FOLIO',
        margins: {
            top: _DATA.margins.m_top * maringConverter + top_offset,
            bottom: _DATA.margins.m_bot * maringConverter,
            left: _DATA.margins.m_left * maringConverter,
            right: _DATA.margins.m_right * maringConverter,
        },
        bufferPages: true,
    });

    var _VALUE_ARRAY;
    var _CHECK_ARRAY;
    var _JSON_STEP;
    var _areas_table = {};
    const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
    const fun_2 = _DATA ? _DATA.fun_2 ? _DATA.fun_2 : false : false;
    const record_arc = _DATA ? _DATA.record_arc : false;
    const record_arc_33_areas = record_arc ? record_arc.record_arc_33_areas ? record_arc.record_arc_33_areas : [] : [];
    const record_arc_36_infos = record_arc ? record_arc.record_arc_36_infos ? record_arc.record_arc_36_infos : [] : [];
    const record_arc_35_parkings = record_arc ? record_arc.record_arc_35_parkings ? record_arc.record_arc_35_parkings : [] : [];
    const fun_c = _DATA ? _DATA.fun_cs ? _DATA.fun_cs.length > 0 ? _DATA.fun_cs[0] : false : false : false;
    // AREA TABLES
    let _GET_CHILD_33_AREAS = () => {
        var _CHILD = record_arc_33_areas;
        var _AREAS = [];
        if (_CHILD) {
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].type == "area") {
                    _AREAS.push(_CHILD[i])
                }
            }
        }
        return _AREAS;
    }
    let _GET_CHILD_33_AREAS_BLUEPRINTS = () => {
        var _LIST = _GET_CHILD_33_AREAS();
        var _AREAS = [];
        if (_LIST) {
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].type == "blueprint") {
                    _AREAS.push(_LIST[i])
                }
            }
        }
        return _AREAS;
    }
    let _GET_UNITS_A_TOTAL = (filter = false) => {
        let sum_a = 0;
        let areas = _GET_CHILD_33_AREAS();
        areas.map(area => {
            if (filter) {
                let use = String(area.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let units = _GET_ARRAY_A(area.units_a, ';');
                    units.map(unit => sum_a += Number(unit))
                }
            }
            else {
                let units = _GET_ARRAY_A(area.units_a, ';');
                units.map(unit => sum_a += Number(unit))
            }

        })

        return (sum_a).toFixed(2);
    }
    let _GET_UNITS_U_TOTAL = (filter = false) => {
        let sum_a = 0;
        let areas = _GET_CHILD_33_AREAS();
        areas.map(area => {
            if (filter) {
                let use = String(area.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let units = _GET_ARRAY_A(area.units, ';');
                    units.map(unit => sum_a += Number(unit))
                }
            }
            else {
                let units = _GET_ARRAY_A(area.units, ';');
                units.map(unit => sum_a += Number(unit))
            }

        })

        return (sum_a).toFixed(2);
    }
    let _GET_COMMON_A_TOTAL = (filter = false) => {
        let sum_a = 0;
        let areas = _GET_CHILD_33_AREAS();
        areas.map(area => {
            if (filter) {
                let use = String(area.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let units = _GET_ARRAY_A(area.build, ',');
                    units.map(unit => sum_a += Number(unit))
                }
            } else {
                let units = _GET_ARRAY_A(area.build, ',');
                units.map(unit => sum_a += Number(unit))
            }

        })

        return (sum_a).toFixed(2);
    }
    let _GET_TOTAL_AREA_SUM = (areas) => {
        let sum = 0;
        areas.map(area => sum += Number(_GET_TOTAL_AREA(area.build, area.historic_areas)))
        return sum.toFixed(2)
    }
    let _GET_TOTAL_DESTROY = (_destroy) => {
        if (!_destroy) return 0;
        var destroy = _destroy ? _destroy.split(",") : [];
        let sum = destroy.reduce((p, n) => Number(p) + Number(n))
        return (sum).toFixed(2);
    }
    let _GET_HISTORIC = (_historic) => {
        let STEP = LOAD_STEP('a_config', 'arc');
        let json = STEP ? STEP.json ? STEP.json : {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        var historic = _historic ? _historic.split(';') : [];
        let reduced = historic.filter((_h, i) => {
            if (!tagsH[i]) return false
            let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return tag.includes('historic');
        })
        let sum = 0;
        reduced.map((r) => sum += Number(r))
        return sum;
    }
    let _GET_AJUSTES = (_historic) => {
        let STEP = LOAD_STEP('a_config', 'arc');
        let json = STEP ? STEP.json ? STEP.json : {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        var historic = _historic ? _historic.split(';') : [];
        let reduced = historic.filter((_h, i) => {
            if (!tagsH[i]) return false
            let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return tag.includes('ajuste');
        })
        let sum = 0;
        reduced.map((r) => sum += Number(r))
        return sum;
    }
    let _GET_NET_INDEX = (_build, _destroy, _historic) => {
        if (!_build) return 0;
        var destroy = Number(_ADD_AREAS(_destroy));
        var areaToBuild = _GET_TOTAL_AREA(_build, _historic);
        var _NET_IDEX = Number(areaToBuild) - Number(destroy);
        return (_NET_IDEX).toFixed(2);
    }
    let _GET_ARRAY_A = (_var, ss) => {
        if (_var) return _var.split(ss);
        else return [];
    }
    let _GET_TOTAL_AREA = (_build, _historic) => {
        if (!_build) return 0;
        var build = _build.split(",");
        var area_1 = 0;
        var area_5 = 0
        var historic = _GET_HISTORIC(_historic)
        var ajustes = _GET_AJUSTES(_historic)
        if (build[0] > 0) area_1 += Number(build[0]);
        if (build[1] > 0) area_1 += Number(build[1]);
        if (build[10] > 0) area_1 += Number(build[10]);
        //if (build[6] > 0) area_5 = Number(build[6]);
        if (build[7] > 0) area_5 += Number(build[7]);
        var _TOTAL_AREA = Number(historic) + Number(ajustes) + area_1 - area_5;
        return (_TOTAL_AREA).toFixed(2);
    }
    let _ADD_AREAS = (_array) => {
        if (!_array) return 0;
        var areas = _array.split(",");
        var sum = 0;
        for (var i = 0; i < areas.length; i++) {
            sum += Number(areas[i])
        }
        return sum.toFixed(2);
    }
    let _ADD_AREAS_H = (_areas, key, i, filter) => {
        let sum = 0;
        _areas.map(areas => {
            let value = areas[key] ? areas[key].split(';') : [];
            if (!filter) {
                let area = value[i] ? value[i] : 0;
                sum += Number(area)
            }
            if (filter) {
                let use = String(areas.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let area = value[i] ? value[i] : 0;
                    sum += Number(area)
                }
            }
        })

        return sum.toFixed(2);
    }
    let _ADD_AREAS_I = (_array, i, filter) => {
        if (!_array) return 0;
        let sum = 0;

        _array.map(areas => {
            if (!filter) {
                var area = areas.build ? areas.build.split(",") : 0;
                sum += Number(area[i]) || 0
            }
            if (filter) {
                let use = String(areas.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    var area = areas.build ? areas.build.split(",") : 0;
                    sum += Number(area[i]) || 0
                }
            }

        })

        return sum.toFixed(2);
    }
    // ************************
    let _GET_CHILD_34_K = () => {
        var _CHILD = _DATA.record_arc.record_arc_34_ks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _GET_CHILD_36_INFO = () => {
        var _CHILD = _DATA.record_arc.record_arc_36_infos;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _GET_CHILD_35_PARKING = () => {
        var _CHILD = _DATA.record_arc.record_arc_35_parkings;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _GET_CHILD_2 = () => {
        var _CHILD = _DATA.fun_2;
        var _CHILD_VARS = {
            direccion: _CHILD ? _CHILD.direccion : '',
            direccion_ant: _CHILD ? _CHILD.direccion_ant : '',
            matricula: _CHILD ? _CHILD.matricula : '',
            catastral: _CHILD ? _CHILD.catastral : '',
            suelo: _CHILD ? _CHILD.suelo : '',
            lote_pla: _CHILD ? _CHILD.lote_pla : '',
            barrio: _CHILD ? _CHILD.barrio : '',
            vereda: _CHILD ? _CHILD.vereda : '',
            comuna: _CHILD ? _CHILD.comuna : '',
            sector: _CHILD ? _CHILD.sector : '',
            corregimiento: _CHILD ? _CHILD.corregimiento : '',
            lote: _CHILD ? _CHILD.lote : '',
            estrato: _CHILD ? _CHILD.estrato : '',
            manzana: _CHILD ? _CHILD.manzana : '',
        }
        return _CHILD_VARS;
    }

    let _GET_CHILD_53 = () => {
        var _CHILD = _DATA.fun_53s;
        var _CURRENT_VERSION = (_DATA.version || 1) - 1;
        if (!_CHILD) return {
            item_5311: '',
            item_5312: '',
            item_532: '',
            item_533: '',
        };
        if (!_CHILD[_CURRENT_VERSION] || !_CHILD) return {
            item_5311: '',
            item_5312: '',
            item_532: '',
            item_533: '',
        };
        var _CHILD_VARS = {
            item_5311: _CHILD[_CURRENT_VERSION].name || '',
            item_5312: _CHILD[_CURRENT_VERSION].surname || '',
            item_532: _CHILD[_CURRENT_VERSION].id_number || '',
            item_533: _CHILD[_CURRENT_VERSION].role || '',
            item_534: _CHILD[_CURRENT_VERSION].number || '',
            item_535: _CHILD[_CURRENT_VERSION].email || '',
            item_536: _CHILD[_CURRENT_VERSION].address || '',
            docs: _CHILD[_CURRENT_VERSION].docs || '',
        }
        return _CHILD_VARS;
    }

    const fun = _DATA.fun;
    const f2 = _GET_CHILD_2();
    const f51 = _DATA.fun_51s
    const f52 = _DATA.fun_52s
    const f53 = _GET_CHILD_53();
    const rer = _DATA.record_eng ? _DATA.record_eng.record_eng_reviews ? _DATA.record_eng.record_eng_reviews[0] : {} : {};

    function _FIND_F5(fun5, role) {
        if (!fun5) return {};
        for (let i = 0; i < fun5.length; i++) {
            const f5 = fun5[i];
            if (f5.role == role) {
                return f5;
            }
        }
        return {};
    }

    const ra33b = _GET_CHILD_33_AREAS_BLUEPRINTS()

    function LOAD_STEP(_id_public, record) {
        var _CHILD = [];
        if (record == 'eng') _CHILD = _DATA.record_eng.record_eng_steps;
        if (record == 'arc') _CHILD = _DATA.record_arc.record_arc_steps;
        if (record == 'law') _CHILD = _DATA.record_law.record_law_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == _DATA.version && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }

    function _GET_STEP_TYPE(_id_public, _type, record) {
        var STEP = LOAD_STEP(_id_public, record);
        if (!STEP) return [];
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (!value.length) return [];
        value = value.split(';');
        return value
    }

    function _GET_STEP_TYPE_JSON(_id_public, _type, record) {
        var STEP = LOAD_STEP(_id_public, record);
        if (!STEP) return {};
        var value = STEP[_type] ? STEP[_type] : {}
        if (!value) return {};
        return value
    }

    let segundo_cb = _DATA.reso.segundo_cb;
    segundo_cb = segundo_cb ? segundo_cb.split(',') : [];

    let cuarto = _DATA.reso.cuarto_cb;

    let quinto = _DATA.reso.quinto;

    let sexto_v = _DATA.reso.sexto_v;
    sexto_v = sexto_v ? sexto_v.split(';') : [];

    let sexto_v_cb = _DATA.reso.sexto_v_cb;
    sexto_v_cb = sexto_v_cb ? sexto_v_cb.split(',') : [1, 1, 1];

    let septimo_cb = _DATA.reso.septimo_cb;
    septimo_cb = septimo_cb ? septimo_cb.split(',') : [];

    let arts_cb = _DATA.reso.arts_cb;
    arts_cb = arts_cb ? arts_cb.split(',') : [];

    let action_word = _DATA.reso.reso_state;
    if (curaduriaInfo.id == 'cub1' && action_word == 'OTORGADA') action_word = 'CONCEDE';

    const _BODY = `El ${curaduriaInfo.job} ${(curaduriaInfo.master).toUpperCase()} en uso de sus facultades legales, derivadas de los actos de posesión y nombramiento y de las 
    facultades legales conferidas por las leyes: Ley 9 de 1989; Ley 388 de 1997; Ley 400 de 1997, Ley 810 de 2003, Ley 1796 de 2016; los decretos nacionales: Decreto 1077 de 
    2015 y sus decretos modificatorios que reglamenta el sector de vivienda, ciudad y territorio y en particular aquellos que establecen las condiciones para el estudio y expedición 
    de la licencias urbanísticas; Decreto 926 de 2010 y sus decretos modificatorios del Reglamento Colombiano de Construcción Sismorresistente NSR-10 y el Acuerdo Municipal 
    ${curaduriaInfo.pot.n} de ${curaduriaInfo.pot.yy} mediante el cual se adoptó el ${curaduriaInfo.pot.pot} del municipio de ${_DATA.reso.ciudad}, ${action_word}: ${_DATA.reso.tipo}, decisión soportada en los siguientes elementos:`.replace(/[\n\r]+ */g, ' ');

    const _BODY_PRIMERO_A = `Acuerdo 11 de 2014 que aprobó el Plan de Ordenaminto Territorial del municipio de ${_DATA.reso.ciudad}`;

    const _BODY_PRIMERO = _DATA.reso.primero || `Que la solicitud fue presentada en vigencia del ${_BODY_PRIMERO_A} y radicada 
    con el número ${_DATA.fun.id_public} el ${dateParser(fun_c.legal_date)} de conformidad con lo dispuesto en los artículos 
    2.2.6.4.2.2 y 2.2.6.1.2.1.7 del Decreto 1077 de 2015; habiendo 
    presentado los titulares todos los documentos exigibles para la presente actuación urbanística, para el inmueble 
    identificado con el numero predial 
    ${f2.catastral}, matrícula inmobiliaria  ${f2.matricula} y nomenclatura  ${f2.direccion} 
    ${f2.barrio ? 'barrio ' + f2.barrio + ' ' : ''}del municipio de  ${_DATA.reso.ciudad}.`.replace(/[\n\r]+ */g, ' ');
    // const _BODY_PRIMERO_a = `Que ${_BODY_PRIMERO_A} presentada por ${_DATA.reso.pimero_1}  con número de identificación ${_DATA.reso.pimero_7} en calidad
    // de ${_DATA.reso.pimero_8}, presentó solicitud de ${_DATA.reso.tipo}, para el predio localizado en la ${_DATA.reso.pimero_5} ${_DATA.reso.pimero_6 ? 'barrio ' + _DATA.reso.pimero_6 + ' ' : ''} del 
    // Municipio de ${_DATA.reso.ciudad}, con folio de matrícula
    // inmobiliaria ${_DATA.reso.pimero_4} de la oficina de Instrumentos Públicos de ${_DATA.reso.ciudad} y número predial ${_DATA.reso.pimero_3}.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_PRIMERO_a = `Que el ${dateParser(fun_c.legal_date)}, ${_DATA.reso.pimero_1}  con número de identificación ${_DATA.reso.pimero_7} en calidad
    de ${_DATA.reso.pimero_8}, presentó solicitud de ${_DATA.reso.tipo}, para el predio localizado en la ${_DATA.reso.pimero_5} ${_DATA.reso.pimero_6 ? 'barrio ' + _DATA.reso.pimero_6 + ' ' : ''} del 
    Municipio de ${_DATA.reso.ciudad}, con folio de matrícula
    inmobiliaria ${_DATA.reso.pimero_4} de la oficina de Instrumentos Públicos de ${_DATA.reso.ciudad} y número predial ${_DATA.reso.pimero_3}.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_PRIMERO_SUB = `Que el señor(a) ${f53.item_5311 + ' ' + f53.item_5312}, con cédula o NIT (según) ${f53.item_532}, 
    en su calidad de propietario o apoderado/ mandatario (según), del predio con dirección 
    de inmueble en ${f2.direccion} barrio ${f2.barrio} del Municipio de ${_DATA.reso.ciudad}, con folio de Matrícula Inmobiliaria 
    N°  ${f2.matricula} de la Oficina de Instrumentos 
    Públicos de ${_DATA.reso.ciudad}, y número catastral ${f2.catastral}, ha solicitado ${_FUN_1_PARSER(fun_1.tipo, true)} en la modalidad de ${_FUN_4_PARSER(fun_1.m_sub, true)}.`.replace(/[\n\r]+ */g, ' ');

    const _MAIN_USE = _DATA.reso.pimero_5 || '';

    const _BODY_SEGUNDO = `Que el proyecto objeto de la solicitud fue revisado y aprobado de acuerdo con la normatividad vigente, 
    desde el punto de vista técnico, jurídico, estructural, urbanístico y arquitectónico por el equipo técnico y Jurídico 
    ${curaduriaInfo.pronoum} ${curaduriaInfo.job} de ${curaduriaInfo.city}, según constan en el acta de observaciones y 
    correcciones y el concepto de viabilidad, que dan cuenta del trámite previsto en las normas que regulan presente 
    actuación urbanística; de acuerdo con estos documentos se encontró que: `.replace(/[\n\r]+ */g, ' ');
    const _BODY_SEGUNDO_SUB = `Que la solicitud de licencia a que se refiere el numeral anterior, ha sido presentada de conformidad con 
    los requisitos exigidos por el artículo 2.2.6.1.2.1.7 del Decreto 1077 de 2015 y la Resolución 1026 de 2021, dándosele el trámite previsto en las normas que regulan la expedición de licencias de 
    subdivisión. `.replace(/[\n\r]+ */g, ' ');

    const _SEGUNDO_ARRAY = [
        _DATA.reso.segundo_a || `El titular de la solicitud urbanística ostenta la calidad de propietario, poseedor, fideicomiso o de fideicomitente de los inmuebles sujetos a este procedimiento, por tanto, se ajusta al requerimiento establecido en el
        artículo 2.2.6.1.2.1.5 del Decreto 1077 de 2015.`.replace(/[\n\r]+ */g, ' '),
        `La solicitud de la actuación urbanística presentó la documentación requerida en la resolución 463 de 2017 del ministerio de vivienda ciudad y territorio, y la resolución
        que la modifique, adicione o sustituya, ajustándose en todo al marco normativo establecido.`.replace(/[\n\r]+ */g, ' '),
        `Se verificó que el predio y/o el inmueble a reconocer no se encuentra incurso en ninguna de las situaciones que impiden el acto administrativo solicitado, las cuales se
        encuentran enumeradas en el artículo 2.2.6.4.1.2 del Decreto 1077 de 2015.`.replace(/[\n\r]+ */g, ' '),
        `Se verificó que el inmueble objeto de la solicitud cumpliera con el uso del suelo y que sus desarrollos arquitectónicos hayan culminado como mínimo cinco (5) años
        antes de la entrada en vigencia de la Ley 1848 de 2017; estos requisitos de procedibilidad establecidos en el artículo 2.2.6.4.1.1 del Decreto 1077 de 2015 fueron
        corroborados para el primer elemento a través de la consulta de la norma urbana y del segundo a través de la ${_DATA.reso.segundo_1}, la cual se entiende cierta y 
        emitida bajo la gravedad de juramento, ${_DATA.reso.segundo_2}.`.replace(/[\n\r]+ */g, ' '),
        `Dando cumplimiento al artículo 13° Distancias de seguridad de la Resolución 90708 de 2013 del Ministerio de Minas y Energía, los constructores y el titular de la
        solicitud presentaron a la curaduría urbana manifestación por escrito que los proyectos que solicitan dicho trámite cumplen a cabalidad con las distancias mínimas de
        seguridad establecidas en el RETIE.`.replace(/[\n\r]+ */g, ' '),
    ]

    const _BODY_TERCERO = `Que atendiendo el contenido del parágrafo 1° del artículo 2.2.6.4.1.1. del Decreto 1077 de 2015 el municipio de ${curaduriaInfo.city} reglamentó mediante el ${curaduriaInfo.pot.pot}
    o en su defecto el alcalde municipal, lo relativo a las normas urbanísticas que se deben cumplir en los actos de reconocimiento de edificaciones existentes 
    y de acuerdo este artículo se procedió a:`.replace(/[\n\r]+ */g, ' ');
    const _BODY_TERCERO_SUB = `Que el artículo 14 del Decreto 1783 del 2021 que modifica el artículo 2.2.6.1.2.1.5 del Decreto 1077 
    del 2015, establece que podrán ser titulares de las licencias de urbanización, parcelación, subdivisión y construcción quienes 
    ostenten la calidad de propietarios de los inmuebles objeto de la solicitud, los fideicomisos, y los fideicomitentes de los 
    mismos fideicomisos si así lo certifica la sociedad fiduciaria; entre otros. Los propietarios comuneros podrán ser titulares 
    de las licencias de que trata el precitado artículo, siempre y cuando dentro del procedimiento se convoque a los demás 
    copropietarios o comuneros de la forma prevista para la citación a vecinos con el fin de que se hagan parte y hagan valer sus 
    derechos.  En los casos de proyectos bifamiliares, será titular de la licencia de construcción el propietario o poseedor de la 
    unidad para la cual se haya hecho la solicitud, sin que se requiera que el propietario o poseedor de la otra unidad concurra o 
    autorice para radicar la respectiva solicitud. En todo caso, este último deberá ser convocado de la forma prevista para la 
    citación a vecinos. Los poseedores sólo podrán ser titulares de las licencias de construcción y de los actos de reconocimiento 
    de la existencia de edificaciones.`.replace(/[\n\r]+ */g, ' ');

    const _TERCERO_ARRAY = [
        `${(_DATA.reso.tercero_3 || ' ').replace(/[\n\r]+ */g, ' ')}`,
        `${(_DATA.reso.tercero_2 || ' ').replace(/[\n\r]+ */g, ' ')}`,
        `Constatar que el inmueble no esté invadiendo el espacio público; así mismo en los planos arquitectónicos se dejó 
        señalado para futuras intervenciones de ampliación los elementos constitutivos del espacio público y las 
        dimensiones del perfil vial establecidos en POT, los cuales son de obligatorio cumplimiento en ese evento de 
        ampliación y/o de adecuación. Así mismo se constató que el diseño del espacio público presentado con los planos 
        arquitectónicos estuviese conforme al manual de espacio público del municipio de ${curaduriaInfo.city}.`.replace(/[\n\r]+ */g, ' '),
        `Que el proyecto de construcción contempló en su diseño las condiciones que garantizan la accesibilidad y desplazamiento 
        de las personas con movilidad reducida, sea esta temporal o permanente, de conformidad con las normas establecidas en la Ley 
        361 de 1997, el Decreto 1538 de 2005, el Decreto 1077 de 2015 y Normas Técnicas Colombianas que tratan la accesibilidad a 
        medios físicos emitidas por el ICONTEC. Estas condiciones deben ser respetadas en obra y en todo caso, de ser necesario, 
        la misma debe ajustarse para garantizar la accesibilidad.`.replace(/[\n\r]+ */g, ' '),
    ]

    const _BODY_CUARTO = `Que previo a la expedición del presente acto administrativo se verificó el cumplimiento de la publicidad efectiva, permitiendo la participación de los vecinos
    colindantes y la intervención de terceros, para lo cual el solicitante de la actuación urbanística instaló una valla en un lugar 
    visible en la cual se advirtió a terceros sobre la
    iniciación de trámite administrativo, allegando al expediente una fotografía de la misma dentro del término establecido, 
    así mismo ${curaduriaInfo.pronoum} ${curaduriaInfo.job} citó a los vecinos
    colindantes del predio objeto de la solicitud, para que tuvieran la oportunidad de hacerse parte y pudieran hacer valer sus 
    derechos, ${_DATA.reso.cuarto_1}`.replace(/[\n\r]+ */g, ' ');
    const _BODY_CUARTO_SUB = `Que de conformidad con el artículo 2.2.6.1.2.3.3 del Decreto 1077 de 2015, el otorgamiento de la 
    licencia determinará la adquisición de los derechos de construcción y desarrollo, ya sea parcelando, urbanizando o construyendo 
    en los predios objeto de la misma en los términos y condiciones expresados en la respectiva licencia. La expedición de 
    licencias no conlleva pronunciamiento alguno acerca de la titularidad de derechos reales ni de la posesión sobre el inmueble 
    o inmuebles objeto de ella. Las licencias recaen sobre uno o más predios y/o inmuebles y producen todos sus efectos aun cuando 
    sean enajenados.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_QUINTO = `Que la expedición del reconocimiento no conlleva pronunciamiento alguno acerca de la titularidad de derechos reales ni de la posesión sobre el inmueble o inmuebles
    objeto del mismo. El reconocimiento de edificación recae sobre el inmueble o inmuebles objeto de solicitud y produce todos sus efectos aun cuando sean enajenados. El titular
    del reconocimiento será el responsable de todas las obligaciones urbanísticas y arquitectónicas adquiridas con ocasión de su expedición y extracontractualmente por los
    perjuicios que se causaren a terceros en desarrollo de la misma.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_QUINTO_SUB = `Que el proyecto objeto de la solicitud fue revisado y aprobado de acuerdo con la normatividad vigente, 
    por la División Técnica y Jurídica de esta Curaduría.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_SEXTO = `Que el titular de la solicitud de la presente actuación urbanística cumplió con los siguientes obligaciones y deberes previos a la expedición de este acto administrativo:`.replace(/[\n\r]+ */g, ' ');
    const _BODY_SEXTO_SUB = `Que la licencia de subdivisión debe realizarse de acuerdo con los planos aprobados, teniendo en cuenta las siguientes CONSIDERACIONES TÉCNICAS:`.replace(/[\n\r]+ */g, ' ');
    const _SEXTO_ARRAY_SUB = [
        `La licencia de subdivisión no autoriza la ejecución de obras de infraestructura o  de construcción, ni la delimitación de espacios públicos y privados.`.replace(/[\n\r]+ */g, ' '),
        `Las subdivisiones en suelo urbano, se sujetarán al cumplimiento de las dimensiones de áreas y frentes mínimos establecidos en los actos administrativos correspondientes. Los predios resultantes de la subdivisión y/o reloteo deberán contar con frente sobre vía pública vehicular o peatonal y no podrán accederse por zonas verdes y/o comunales.`.replace(/[\n\r]+ */g, ' '),
        `La incorporación a la cartografía oficial de tales subdivisiones no implica autorización alguna para urbanizar, parcelar o construir sobre los lotes resultantes, para cuyo efecto, el interesado, en todos los casos, deberá adelantar el trámite de solicitud de licencia de parcelación, urbanización o construcción ante el curador urbano o la autoridad municipal o distrital competente para el estudio, trámite y expedición de las licencias urbanísticas, en los términos de que trata el Decreto 1077 de 2015 y demás normas concordantes.`.replace(/[\n\r]+ */g, ' '),
        `La demarcación de los linderos debe efectuarse dentro de los límites del predio sobre el cual actúa la presente licencia.`.replace(/[\n\r]+ */g, ' '),
    ]


    const _SEXTO_ARRAY = [
        `Deberes urbanísticos para la provisión de espacio público, los cuales compensó en dinero para lo cual aportó el
        recibo número ${sexto_v[0]} del ${dateParser(sexto_v[1])} por la suma de $ ${addDecimalPoints(sexto_v[2])}`.replace(/[\n\r]+ */g, ' '),
        `Deber de provisión de cupos de parqueo.  ${_DATA.reso.sexto_b}`.replace(/[\n\r]+ */g, ' '),
        `Canceló las siguientes obligaciones:`.replace(/[\n\r]+ */g, ' '),
    ]

    var _SEXTO_PAY_ARRAY = [];
    if (sexto_v_cb[0] == 1) _SEXTO_PAY_ARRAY.push(`Expensas fijas y variables mediante las facturas N° ${sexto_v[3]} y ${sexto_v[4]}`.replace(/[\n\r]+ */g, ' '))
    if (sexto_v_cb[1] == 1) _SEXTO_PAY_ARRAY.push(`Impuesto de delineación y urbanismo por la suma de $${sexto_v[5]} según recibo N° ${sexto_v[6]}`.replace(/[\n\r]+ */g, ' '))
    if (sexto_v_cb[2] == 1) _SEXTO_PAY_ARRAY.push(`Estampilla PROUIS por la suma de $${sexto_v[7]} según recibo N° ${sexto_v[8]}.`.replace(/[\n\r]+ */g, ' '))

    const _BODY_SEPTIMO_SUB = `Que el incumplimiento de las obligaciones previstas en la presente resolución, y demás disposiciones 
    urbanísticas vigentes acarreará para el titular la aplicación de las sanciones previstas en la Ley 388 de 1997 y la Ley 810 de 
    2003, sin perjuicio de las sanciones aplicables al responsable del proyecto.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_OCTAVO_SUB = `Que el artículo 44 de la Ley 160 de 1994 indica que “Salvo las excepciones que se señalan en el 
    artículo siguiente, los predios rurales no podrán fraccionarse por debajo de la extensión determinada por el INCORA como 
    Unidad Agrícola Familiar para el respectivo municipio o zona. En consecuencia, so pena de nulidad absoluta del acto o 
    contrato, no podrá llevarse a cabo actuación o negocio alguno del cual resulte la división de un inmueble rural cuyas 
    superficies sean inferiores a la señalada como Unidad Agrícola Familiar para el correspondiente municipio por el INCORA.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_NOVENO_SUB = `Así mismo el artículo 45 ibídem, exceptúa lo dispuesto en el artículo anterior, así:`.replace(/[\n\r]+ */g, ' ');
    const _NOVENO_ARRAY_SUB = [
        `a) Las donaciones que el propietario de un predio de mayor extensión haga con destino a habitaciones campesinas y pequeñas explotaciones anexas;`.replace(/[\n\r]+ */g, ' '),
        `b) Los actos o contratos por virtud de los cuales se constituyen propiedades de superficie menor a la señalada para un fin principal distinto a la explotación agrícola;`.replace(/[\n\r]+ */g, ' '),
        `c) Los que constituyan propiedades que por sus condiciones especiales sea el caso de considerar, a pesar de su reducida extensión, como "Unidades Agrícolas Familiares", conforme a la definición contenida en esta Ley;`.replace(/[\n\r]+ */g, ' '),
        `d) Las sentencias que declaren la prescripción adquisitiva de dominio por virtud de una posesión iniciada antes del 29 de diciembre de 1961, y las que reconozcan otro derecho igualmente nacido con anterioridad a dicha fecha.`.replace(/[\n\r]+ */g, ' '),
        `La existencia de cualquiera de las circunstancias constitutivas de excepción conforme a este artículo no podrá ser impugnada en relación con un contrato si en la respectiva escritura pública se dejó constancias de ellas, siempre que:`.replace(/[\n\r]+ */g, ' '),
        `1. En el caso del literal b) se haya dado efectivamente al terreno en cuestión el destino que el contrato señala.`.replace(/[\n\r]+ */g, ' '),
        `2. En el caso del literal c), se haya efectuado la aclaración en la escritura respectiva, según el proyecto general de fraccionamiento en el cual se hubiere originado.`.replace(/[\n\r]+ */g, ' '),
    ]
    const _BODY_DECIMO_SUB = `Que para el predio rural objeto de la presente subdivisión, el titular de la licencia realiza la 
    subdivisión según lo establecido en el artículo 45 literal b) de la Ley 160 de 1994, por lo cual los predios resultantes de la 
    subdivisión serán destinados para uso principal ${_MAIN_USE}`.replace(/[\n\r]+ */g, ' ');


    const _BODY_ART_1 = `Concede un/a  ${_DATA.reso.tipo} para el predio identificado así:`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_1_SUB = `Concede una licencia de ${_FUN_1_PARSER(fun_1.tipo, true)} en la modalidad de ${_FUN_4_PARSER(fun_1.m_sub, true)}, 
    en el predio con dirección  
    de inmueble en ${f2.direccion} barrio ${f2.barrio}  del Municipio de Piedecuesta, con folio de Matrícula Inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos 
    Públicos de ${_DATA.reso.ciudad} o en su defecto el alcalde municiapl, y número catastral ${f2.catastral}, a nombre del señor ${f53.item_5311 + ' ' + f53.item_5312},  
    en su calidad de propietario o apoderado/ mandatario (según), para que ${_DATA.special_rule_1} efectúe las obras de conformidad con los planos, documentos técnicos aprobados y disposiciones urbanísticas y 
    ambientales vigentes en el Municipio de ${_DATA.reso.ciudad}.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_1p = _DATA.reso.art_1p;

    // ----
    const _BODY_ART_1_a = `Declarar DESISTIDA la solicitud de ${_DATA.reso.tipo} presentada por ${_DATA.reso.pimero_1} 
    con número de identificación ${_DATA.reso.pimero_7} en calidad
    de ${_DATA.reso.pimero_8}, para la obra que se desarrollaría en el predio ubicado en la ${_DATA.reso.pimero_5} 
    barrio ${_DATA.reso.pimero_6} del Municipio de ${_DATA.reso.ciudad}, identificado con folio de matrícula inmobiliaria ${_DATA.reso.pimero_4} 
    de la oficina de Instrumentos Públicos de ${curaduriaInfo.city} y número predial ${_DATA.reso.pimero_3}.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_1_2 = _DATA.reso.art_1_txt || `Parágrafo. El área del predio fue tomada del cálculo de los linderos consignados en el certificado de libertad y tradición y/o títulos de propiedad; los trámites concernientes a la inscripción, aclaración y/o corrección de área y linderos del predio con fines registrales, deberá adelantarlos ante el Área Metropolitana de ${curaduriaInfo.city} (gestor catastral), mediante los procedimientos establecidos en la resolución conjunta IGAC No. 1101 SNR No. 11344 del 31 de Diciembre de 2020. Por lo anterior, se sugiere antes de radicar cualquier otra actuación, realizar la inscripción del área conforme a lo antes indicado, para asegurar un trámite notarial y registral exitoso.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_2 = `Reconocer como titulares del acto de ${_DATA.reso.tipo} a las siguientes personas`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_2_SUB = `Los planos que contienen la distribución de la subdivisión, han sido debidamente aprobados por la 
    Curaduría Urbana  ${curaduriaInfo.number} de ${curaduriaInfo.city} y hacen parte integral de la presente resolución.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_2_a = `Notificar el contenido de la presente resolución al solicitante y a cualquier persona que se haya 
    hecho parte, en los términos del Decreto 1077 de 2015 y Ley 1437 de 2011.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_2_a_2 = `Parágrafo: Podrá notificarse por medio electrónico de existir autorización de conformidad con el artículo 67 de la ley 1437 de 2011- CPACA.
    De lo contrario se realizará conforme el procedimiento previsto en los artículos 67 y ss. de la Ley 1437 de 2011, es decir
    mediante citación para notificación personal y de no poder hacer la notificación personal al cabo de cinco (5) días del envío de la citación, se notificará por
    aviso de conformidad con el Art 69 ss. y concordantes de la ley ibídem.`.replace(/[\n\r]+ */g, ' ');


    const _BODY_ART_3_a = `Contra este acto administrativo procede el recurso de reposición ante el Curador Urbano que lo expidió para que lo aclare, modifique o
    revoque, dentro de los diez (10) días siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.1 del Decreto 1077 de 2015 del Ministerio
    de Vivienda, Ciudad y Territorio, y los artículos 74 y siguientes de la Ley 1437 de 2011 - Código de Procedimiento Administrativo y de lo Contencioso
    Administrativo.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_3 = `Reconoce a los profesionales responsables del proyecto, de los estudios y de los documentos técnicos presentados, a quienes firman en el formulario único
    para la solicitud de licencias urbanísticas, los cuales, con ella declaran que conocen las disposiciones vigentes que rigen la materia y las sanciones establecidas.`.replace(/[\n\r]+ */g, ' ');
    let topo = _FIND_F5(f52, 'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO')
    const _BODY_ART_3_SUB = `Reconocer al profesional responsable de  los estudios y documentos presentados, quien con la firma en el formulario único para la solicitud de licencias urbanísticas, declara que conocen las disposiciones vigentes que rigen la materia y las sanciones establecidas, así:`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_3_SUB_a = `Al Topógrafo ${topo.name + ' ' + topo.surname}, con matricula Licencia Profesional ${topo.registration}, como 
    responsable legalmente de los diseños contenidos en los planos de la subdivisión.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_4_a = `El solicitante cuenta con treinta (30) días calendario, contados a partir de la fecha en que quede en firme el presente acto administrativo,
    para retirar los documentos que reposan en el expediente o para solicitar su traslado a otro en el evento que se radique una nueva solicitud ante el suscrito
    curador urbano.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_4_SUB = `Notificar personalmente a los titulares, del contenido de la presente resolución en los términos del 
    artículo 2.2.6.1.2.3.7 del Decreto 1077 de 2015 y lo estipulado en el artículo 66 y siguientes de la ley 1437 de 2011. 
    Si no se pudiere hacer la notificación personal al cabo de cinco (5) días del envío de la citación, se notificará por aviso, 
    tal como lo ordena el Artículo 69 de la Ley 1437 de 2011, Código de Procedimiento Administrativo y de lo Contencioso 
    Administrativo.`.replace(/[\n\r]+ */g, ' ');

    const _ARRAY_DESC = [
        (rer ? rer.desc ? rer.desc : ' ' : ' ').replace(/[\n\r]+ */g, ' '),
        `Licencia de construcción en las modalidades de demolición parcial correspondiente a la demolición de una parte de la edificación en el primer y segundo piso para
        generar el aislamiento posterior normativo exigido en el Artículo 471 de Plan de Ordenamiento Territorial, / Modificaciones internas en algunos espacios de los pisos
        1 y 2 entre las actividades planteadas está adecuar baños con las dimensiones requeridas para personas con movilidad reducida, modificaciones de muros internos
        y la ubicación de dos cupos de parqueaderos vehiculares.`.replace(/[\n\r]+ */g, ' '),
        `En conclusión se aprueba: Una edificación de dos pisos de altura culminada en una cubierta inclinada liviana con un área total construida de 470.94m2,
        destinado a comercio y/o servicio la cual tiene tres locales identificados como local N°1, N°2 y N°3, cuyas unidades de usos se encuentran descritas en los planos
        arquitectónicos y en el numeral 3.X de esta resolución, cuenta en el sitio con dos (2) cupos de parqueaderos vehiculares y para cumplir con las demandas del uso
        del suelo debe compensar un cupo adicional para un total de 3 cupos que es la cantidad requerida en función del área generadora para este tipo de comercio, esto
        conforme al literal b del punto sexto de la parte resolutiva. Las actuaciones urbanísticas siguen las recomendaciones del Reglamento Colombiano de Construcción Sismo Resistente NSR-10, clasificándose en el grupo de
        uso I (Estructuras de ocupación Normal) cumpliendo con los requisitos de Disipación Especial de Energía (DES) acuerde con la ubicación dentro de una zona de
        amenaza sísmica ALTA.`.replace(/[\n\r]+ */g, ' '),
    ]

    const _BODY_ART_5 = `Reconocer como parte integral de este acto administrativo los documentos legales y técnicos presentados por los titulares de la solicitud urbanística 
    y los profesionales reconocidos en esta solicitud, quienes son responsables por su contenido; también hace parte de este acto los documentos expedidos por 
     ${curaduriaInfo.pronoum} ${curaduriaInfo.job}. A continuación, se relacionan: 
    ${_DATA.reso.art_5}.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_5_SUB = `La licencia de subdivisión tendrá una vigencia improrrogable de doce (12) meses, contados a partir 
    de la fecha en la que quede en firme el acto administrativo que otorga la respectiva licencia, para adelantar actuaciones de 
    autorización y registro a que se refieren los artículos 7° de la Ley 810 de 2003 y 108 de la Ley 812 de 2003 o las normas que 
    los adicionen, modifiquen o sustituyan, así como para la incorporación de estas subdivisiones en la cartografía oficial de los 
    municipios. `.replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_5P = `Parágrafo. El numeral A.1.5.2 del capítulo A.1 de la NSR-10 señala que los planos arquitectónicos, 
    estructurales y de elementos no estructurales, que se presenten para la obtención de la licencia de construcción deben ser 
    iguales a los utilizados en la construcción de la obra; este mandato es concordante con lo estipulado en el artículo 
    2.2.6.1.2.3.6  del Decreto 1077 de 2015 que señala que se debe mantener en la obra la licencia y los planos aprobados, y 
    exhibirlos cuando sean requeridos por la autoridad competente.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_5_a = `Archivar el expediente de acuerdo a lo establecido en el artículo 2.2.6.1.2.3.1 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad
    y Territorio, dando cumplimiento a lo dispuesto en el parágrafo 2 del artículo 8 del Acuerdo 009 del 19 de diciembre de 2018, expedido por el Consejo
    Directivo del Archivo General de la Nación Jorge Palacios Preciado “Los expedientes de los trámites desistidos no serán remitidos al archivo y permanecerán
    en los archivos de gestión durante treinta (30) días calendario, contados a partir de la fecha en que quede en firme el acto administrativo en que se declare el
    desistimiento y se notifique la situación al solicitante. Luego de este tiempo, serán devueltos al mismo, de acuerdo a lo estipulado en el artículo 17 de la ley
    1755 de 2017. De no ser reclamados en este periodo, estos expedientes podrán ser eliminados, dejando constancia por medio de acta de eliminación de
    documentos”.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_6 = `Obligaciones de profesionales y titulares responsables de las actuaciones urbanísticas`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_6_SUB = `Contra éste acto administrativo proceden los recursos de reposición ante el Curador Urbano que lo 
    expidió y de apelación ante la Oficina de Planeación o en su defecto ante el Alcalde Municipal, para que lo aclare, modifique o 
    revoque; El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) 
    días siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los 
    artículos 74 y siguientes de la Ley 1437 de 2011, Código de Procedimiento Administrativo y de lo Contencioso 
    Administrativo.`.replace(/[\n\r]+ */g, ' ');

    const _ARRAY_ART_6 = [
        `Ley 388 de 1997. Artículo 99° numeral 5. El urbanizador, el constructor, los arquitectos que firman los planos urbanísticos y arquitectónicos y los ingenieros que suscriban los planos técnicos y memorias son responsables de cualquier contravención y violación a las normas urbanísticas, sin perjuicio de la responsabilidad administrativa que se deriven para los funcionarios y curadores urbanos que expidan las licencias sin concordancia o en contravención o violación de las normas correspondientes.`.replace(/[\n\r]+ */g, ' '),
        `Parágrafo del artículo 2.2.6.1.1.15 Decreto 1077/2015. Cuando los profesionales que suscriben el formulario único nacional para la solicitud de licencias se desvinculen de la ejecución de los diseños o de la ejecución de la obra, deberán informar de este hecho al curador urbano o a la autoridad municipal o distrital encargada de expedir las licencias, según corresponda, quien de inmediato procederá a requerir al titular de la licencia para que informe de su reemplazo en un término máximo de 15 días hábiles. 
        El profesional que se desvincule del proceso será responsable de las labores adelantadas bajo su gestión hasta tanto se designe uno nuevo.  En caso de que el curador urbano que otorgó la licencia ya no estuviere en ejercicio, se deberá informar a la autoridad municipal o distrital encargada de la preservación, manejo y custodia del expediente de la licencia urbanística otorgada.
        `.replace(/[\n\r]+ */g, ' '),
        `A.1.5.1- Diseñador Responsable. Capitulo A.1 NSR-10. La responsabilidad de los diseños de los diferentes elementos que componen la edificación recae en los profesionales bajo cuya dirección se elaboran los diferentes diseños particulares. Se presume que cuando un elemento figure en un plano o memoria de diseño, es porque se han tomado todas las medidas para cumplir con el propósito del reglamento y por lo tanto el profesional que forma o rotula el plano es responsable del diseño correspondiente.`.replace(/[\n\r]+ */g, ' '),
    ]

    const _BODY_ART_6_a = `La presente resolución rige a partir de su fecha de ejecutoria.`.replace(/[\n\r]+ */g, ' ');

    let duty_2 = _DATA.reso.duty_2 || ' ';
    let duty_6 = _DATA.reso.duty_6 || ' ';
    let duty_9 = _DATA.reso.duty_9 || ' ';
    let duty_10 = _DATA.reso.duty_10 || ' ';
    let duty_17 = _DATA.reso.duty_17 || ' ';
    let duty_18 = _DATA.reso.duty_18 || ' ';
    let duty_19 = _DATA.reso.duty_19 || ' ';
    let duty_20 = _DATA.reso.duty_20 || ' ';
    let duty_21 = _DATA.reso.duty_21 || ' ';

    const _BODY_DUTY = `Decreto 1077 de 2015 artículo 2.2.6.1.2.3.6 Obligaciones del titular de la licencia. (Decreto 1469 de 2010, art. 39) Decreto 1783 de 2021. El titular, el cumplimiento de las obligaciones que le son aplicables de la relación contenida en el artículo ibidem:`.replace(/[\n\r]+ */g, ' ');
    const _DUTY_ARRAY = [
        `Ejecutar las obras de forma tal que se garantice la salubridad y seguridad de las personas, así como la estabilidad de los terrenos y edificaciones vecinas y de los elementos constitutivos del espacio público.`.replace(/[\n\r]+ */g, ' '),
        duty_2.replace(/[\n\r]+ */g, ' '),
        `Mantener en la obra la licencia y los planos aprobados, y exhibirlos cuando sean requeridos por la autoridad competente.`.replace(/[\n\r]+ */g, ' '),
        `Cumplir con el programa de manejo ambiental de materiales y elementos a los que hace referencia la Resolución 541 de 1994 del Ministerio del Medio Ambiente, o el acto que la modifique o sustituya, para aquellos proyectos que no requieren licencia ambiental, o planes de manejo, recuperación o restauración ambiental, de conformidad con el decreto único del sector ambiente y desarrollo sostenible en materia de licenciamiento ambiental.`.replace(/[\n\r]+ */g, ' '),
        `Cuando se trate de licencias de construcción, solicitar la Autorización de Ocupación de Inmuebles al concluir las obras de edificación en los términos que establece el artículo 2.2.6.1.4.1 del presente decreto.`.replace(/[\n\r]+ */g, ' '),
        duty_6.replace(/[\n\r]+ */g, ' '),
        `Garantizar durante el desarrollo de la obra la participación del diseñador estructural del proyecto y del ingeniero geotecnista responsables de los planos y estudios aprobados, con el fin de que atiendan las consultas y aclaraciones que solicite el constructor y/o supervisor técnico independiente. Las consultas y aclaraciones deberán incorporarse en la bitácora del proyecto y/o en las actas de supervisión.`.replace(/[\n\r]+ */g, ' '),
        `Designar en un término máximo de 15 días hábiles al profesional que remplazará a aquel que se desvinculó de la ejecución de los diseños o de la ejecución de la obra. Hasta tanto se designe el nuevo profesional, el que asumirá la obligación del profesional saliente será el titular de la licencia.`.replace(/[\n\r]+ */g, ' '),
        duty_9.replace(/[\n\r]+ */g, ' '),
        duty_10.replace(/[\n\r]+ */g, ' '),
        `Realizar los controles de calidad para los diferentes materiales y elementos que señalen las normas de construcción Sismo Resistentes.`.replace(/[\n\r]+ */g, ' '),
        `Instalar los equipos, sistemas e implementos de bajo consumo de agua, establecidos en la Ley 373 de 1997 o la norma que la adicione, modifique o sustituya.`.replace(/[\n\r]+ */g, ' '),
        `Cumplir con las normas vigentes de carácter nacional, municipal o distrital sobre eliminación de barreras arquitectónicas para personas en situación de discapacidad.`.replace(/[\n\r]+ */g, ' '),
        `Cumplir con las disposiciones contenidas en las normas de construcción sismo resistente vigente.`.replace(/[\n\r]+ */g, ' '),
        `Dar cumplimiento a las disposiciones sobre construcción sostenible que adopte el Ministerio de Vivienda, Ciudad y Territorio o los municipios o distritos en ejercicio de sus competencias.`.replace(/[\n\r]+ */g, ' '),
        `Realizar la publicación establecida en el artículo 2.2.6.1.2.3.8 del presente decreto en un diario de amplia circulación en el municipio o distrito donde se encuentren ubicados los inmuebles.`.replace(/[\n\r]+ */g, ' '),
        duty_17.replace(/[\n\r]+ */g, ' '),
        duty_18,
        duty_19,
        duty_20,
    ]
    const _BODY_DUTY_2 = `Adicionalmente para el caso del reconocimiento debe dar alcance al contenido del numeral 2 del artículo 2.2.6.1.4.1 del Decreto 1077 de 2015 que reza: Las obras de adecuación a las normas de sismo resistencia y/o a las normas urbanísticas y arquitectónicas contempladas en el acto de reconocimiento de la edificación, en los términos de que trata el presente decreto. Para este efecto, la autoridad competente realizará una inspección al sitio donde se desarrolló el proyecto, dejando constancia de la misma mediante acta, en la que se describirán las obras ejecutadas. Si estas se adelantaron de conformidad con lo aprobado en la licencia, la autoridad expedirá la Autorización de Ocupación de Inmuebles`.replace(/[\n\r]+ */g, ' ');
    const _BODY_DUTY_3 = `Así mismo, se recalca que el titular de la licencia será el responsable de todas las obligaciones urbanísticas y arquitectónicas adquiridas con ocasión de su expedición y extracontractualmente por los perjuicios que se causaren a terceros en desarrollo de la misma.`.replace(/[\n\r]+ */g, ' ');

    const _DUTY_ARRAY_2 = [
        `${duty_21 || ' '}`.replace(/[\n\r]+ */g, ' '),
        `Resolución 190708 de 2013 por medio de la cual se expide el Reglamento Técnico de Instalaciones Eléctricas –RETIE.  El titular de la actuación urbanística y el constructor deben dar cumplimiento integral a este reglamento y en particular guardar las distancias de aislamiento a las redes eléctricas según su capacidad y atender las responsabilidades contenidas para los diseñadores y los constructores.
        `.replace(/[\n\r]+ */g, ' '),
    ]

    const _ARRAY_ART_7 = [
        `Notificar personalmente a los titulares, del contenido de la presente resolución en los términos del Decreto 1077 de 2015 y Ley 1437 de 2011.
        `.replace(/[\n\r]+ */g, ' '),
        `Notificar personalmente a cualquier persona que se hubiere hecho parte dentro del trámite, en los términos del Decreto ibidem 
        `.replace(/[\n\r]+ */g, ' '),
        `${_DATA.reso.art_7 || ''}`.replace(/[\n\r]+ */g, ' '),
    ]
    const _ARRAY_ART_7_SUB = `La presente resolución rige a partir de su ejecutoria.`.replace(/[\n\r]+ */g, ' ');
    const _BODY_ART_7P = `Parágrafo Común: Si no se pudiere hacer la notificación personal al cabo de cinco (5) días del envío de la citación, se notificará por aviso de conformidad con el Art 69 ss. y concordantes de la Ley 1437 de 2011`.replace(/[\n\r]+ */g, ' ')

    let art_8 = _DATA.reso.art_8 || '';
    let art_8p = _DATA.reso.art_8p || '';
    let art_8p1 = _DATA.reso.art_8p1 || '';
    let art_9 = _DATA.reso.art_9 || '';

    const _BODY_ART_8 = (art_8 || ` `).replace(/[\n\r]+ */g, ' ');

    const _BODY_ART_8P1 = (art_8p1 || `La ejecución de las obras autorizadas en la licencia de construcción otorgada junto al acto de reconocimiento, correspondientes a la demolición parcial y modificación que permitan el cumplimiento del art 471 del POT, es de obligatorio cumplimiento, pues el reconocimiento sólo se declara junto a esta licencia, en el entendido que cumplirá con la precitada norma.`).replace(/[\n\r]+ */g, ' ')

    const _BODY_ART_8P2 = `${art_8p || ' '}`.replace(/[\n\r]+ */g, ' ')

    const _BODY_ART_9 = `Ordénese publicar el contenido resolutorio del presente acto administrativo en la página web corporativa 
    de la Curaduría Urbana N. º ${curaduriaInfo.number} de ${curaduriaInfo.city} ${curaduriaInfo.page}, con el objeto de darse a conocer a terceros 
    que no hayan intervenido en la actuación. ${art_9}`.replace(/[\n\r]+ */g, ' ')

    const _BODY_ART_10 = `Contra éste acto administrativo proceden los recursos de reposición ante ${curaduriaInfo.pronoum} ${curaduriaInfo.job} que lo expidió y de apelación ante la Secretaría de Planeación, para que lo aclare, modifique o revoque; El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011.
    `.replace(/[\n\r]+ */g, ' ')

    let record_law = _DATA.record_law || {};
    let record_eng = _DATA.record_eng || {};

    let _ARRAY_PROFESIONAL = [
        `\n\n\n\n\n${(record_law.worker_name || '').toUpperCase()}\nAbogado(a) Revisor(a)`,
        `\n\n\n\n\n${(record_arc.worker_name || '').toUpperCase()}\nArquitecto(a) Revisor(a)`,
        `\n\n\n\n\n${(record_eng.worker_name || '').toUpperCase()}\nIngeniero(a) Civil Revisor(a)`,
    ]

    const LIST_BLUEPRINT_ENGT = [
        { title: 'Memorias elementos estructurales' },
        { title: 'Memorias elementos NO estructurales' },
        { title: 'PLanos estructurales' },
        { title: 'Estudios de suelo' },
        { title: 'Memorias segunda revisor' },
        { title: 'Peritaje' },
        { title: 'Movimiento de tierras' },
        { title: 'PLanos NO estructurales' },
    ]

    const CON_ORDER = ['PRIMERO: ', 'SEGUNDO: ', 'TERCERO: ', 'CUARTO: ', 'QUINTO: ', 'SEXTO: ', 'SETPTIMO: ', 'OCTAVO: ', 'NOVENO: ', 'DECIMO: '];
    var CON_ORDER_i = 0;

    const CHECK = { 0: 'NO', 1: 'SI', 2: 'NA' }
    const CHECK2 = { 0: 'SI', 1: 'NO', 2: 'NA' }
    const CATEGORY = { 'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV' }

    const titlesShorts = {
        'URBANIZADOR/PARCELADOR': 'URBANIZADOR/PARCELADOR',
        'DIRECTOR DE LA CONSTRUCCION': 'DIRECTOR CONSTRUCCION',
        'URBANIZADOR O CONSTRUCTOR RESPONSABLE': 'URBANIZADOR/CONSTRUCTOR RESPONSABLE',
        'ARQUITECTO PROYECTISTA': 'ARQ. PROYECTISTA',
        'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL': 'ING. CIVIL DISEÑADOR EST.',
        'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES': 'DISEÑADOR DE ELEMENTOS NO EST.',
        'INGENIERO CIVIL GEOTECNISTA': 'ING. CIVIL GEOTECNISTA',
        'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO': 'ING. TOPOGRAFO Y/O TOPÓGRAFO',
        'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES': 'REVISOR INDEPENDIENTE DE DISEÑOS EST.',
        'OTROS PROFESIONALES ESPECIALISTAS': 'OTROS PROFESIONALES ESPECIALISTAS',
    }
    const VV = (val, df) => {
        if (val === 'NO') return '';
        if (val) return val;
        if (df) return df;
        return ''
    }
    const CV = (val, dv) => {
        if (val == '0') return 'NO';
        if (val == '1') return 'SI';
        if (val == '2') return 'NA';
        if (dv != undefined || dv != null) {
            if (dv == '0') return 'NO';
            if (dv == '1') return 'SI';
            if (dv == '2') return 'NA';
        }
        return '';
    }

    const CV3 = (val,) => {
        if (val == '0') return 'CON R.';
        if (val == '1') return 'SIN R.';
        return '';
    }

    const CV2 = val => {
        if (val == 0) return 'NO CUMPLE';
        if (val == 1) return 'CUMPLE';
        if (val == 2) return 'NO APLICA';
        return ''
    }

    function TABLE_F2(hide = false, area = false, useState = false) {
        doc.moveDown();
        let ADDRESS_LABLE = 'Dirección';
        let BARRIOR_LABEL = 'Barrio';
        let cl_wd = area ? 10.8 : 13.5;

        let tail_columns_hd = area ? [
            //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: 'Municipio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
            { coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: 'Área predio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },

        ] :
            [
                //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: 'Municipio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },

            ];
        let tail_columns_bd = area ? [
            //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: curaduriaInfo.city, config: { align: 'center', hide: hide, } },
            { coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: area + 'm2', config: { align: 'center', hide: hide, } },

        ] :
            [
                //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: curaduriaInfo.city, config: { align: 'center', hide: hide, } },

            ];

        if (curaduriaInfo.id == 'cup1') {
            ADDRESS_LABLE = 'Nomenclatura / Dirección / Denominación';
            if (useState) BARRIOR_LABEL = 'Municipio';
        }

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 6, h: 1, text: 'Predio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 0 + 6, 0], w: cl_wd, h: 1, text: 'Número predial', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 1 + 6, 0], w: cl_wd, h: 1, text: 'Matricula inmobiliaria', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 2 + 6, 0], w: cl_wd, h: 1, text: ADDRESS_LABLE, config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 3 + 6, 0], w: cl_wd, h: 1, text: BARRIOR_LABEL, config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                ...tail_columns_hd,
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1, });

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 6, h: 1, text: '1', config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 0 + 6, 0], w: cl_wd, h: 1, text: _DATA.reso.pimero_3 || fun_2.catastral, config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 1 + 6, 0], w: cl_wd, h: 1, text: _DATA.reso.pimero_4 || fun_2.matricula, config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 2 + 6, 0], w: cl_wd, h: 1, text: _DATA.reso.pimero_5 || fun_2.direccion, config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 3 + 6, 0], w: cl_wd, h: 1, text: curaduriaInfo.id == 'cup1' && useState ? "Piedecuesta" : fun_2.barrio, config: { align: 'center', hide: hide, } },
                ...tail_columns_bd,
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        doc.moveDown();
    }

    function TABLE_F51(ROLE, hide = false, ROLE_EXCLUDE = false) {
        doc.moveDown();
        let NAME_LABLE = 'Nombre';
        if (curaduriaInfo.id == 'cup1') NAME_LABLE = 'Nombre y Apellidos / (Razon social)';
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'Actúa en calidad', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [15, 0], w: 30, h: 1, text: NAME_LABLE, config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [45, 0], w: 15, h: 1, text: 'Documento de identidad', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        f51.map(value => {
            let name51 = (value.name + ' ' + value.surname).toUpperCase();
            let id51 = value.id_number;
            if (ROLE) {
                if (!String(value.role).includes(ROLE)) return;
            }

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 15, h: 1, text: value.role, config: { align: 'center', hide: hide, } },
                    { coord: [15, 0], w: 30, h: 1, text: name51, config: { align: 'center', hide: hide, } },
                    { coord: [45, 0], w: 15, h: 1, text: id51, config: { align: 'center', hide: hide, } },
                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1 });


            if (value.type == 'PERSONA JURIDICA' && !ROLE_EXCLUDE) {
                let rName51 = (value.rep_name).toUpperCase();
                let rId51 = (value.rep_id_number).toUpperCase();

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 15, h: 1, text: 'REPRESENTANTE LEGAL', config: { align: 'center', hide: hide, } },
                        { coord: [15, 0], w: 30, h: 1, text: rName51, config: { align: 'center', hide: hide, } },
                        { coord: [45, 0], w: 15, h: 1, text: rId51, config: { align: 'center', hide: hide, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
            }
        })
        doc.moveDown();
    }

    function TABLE_F52(hide = false) {
        doc.moveDown();
        let NAME_LABLE = 'Nombre';
        if (curaduriaInfo.id == 'cup1') NAME_LABLE = 'Nombre y Apellidos';
        let prof_shorts_names = {
            'URBANIZADOR/PARCELADOR': 'URBANIZADOR/PARCELADOR',
            'URBANIZADOR O CONSTRUCTOR RESPONSABLE': 'URBANIZADOR/CONSTRUCTOR RESPONSABLE',
            'DIRECTOR DE LA CONSTRUCCION': 'DIRECTOR DE LA CONSTRUCCIÓN',
            'ARQUITECTO PROYECTISTA': 'ARQUITECTO PROYECTISTA',
            'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL': 'INGENIERO CIVIL ESTRUCTURAL',
            'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES': 'DISEÑADOR ELEMENTOS NO ESTRUCT.',
            'INGENIERO CIVIL GEOTECNISTA': 'INGENIERO CIVIL GEOTECNISTA',
            'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO': 'INGENIERO TOPÓGRAFO Y/O TOPÓGR.',
            'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES': 'REVISOR INDEPENDIENTE ESTRUCTURAL',
            'OTROS PROFESIONALES ESPECIALISTAS': 'OTROS PROFESIONALES ESPECIALISTAS',
        }
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 22, h: 1, text: 'Actúa en calidad', config: { align: 'center', bold: true, fill: 'silver', hide: hide, } },
                { coord: [22, 0], w: 23, h: 1, text: NAME_LABLE, config: { align: 'center', bold: true, fill: 'silver', hide: hide, } },
                { coord: [45, 0], w: 15, h: 1, text: 'Matrícula Profesional', config: { align: 'center', bold: true, fill: 'silver', hide: hide, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        f52.map(value => {
            let name = (value.name + ' ' + value.surname).toUpperCase();
            let idN = value.registration;

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 22, h: 1, text: prof_shorts_names[value.role] || value.role, config: { align: 'center', hide: hide, } },
                    { coord: [22, 0], w: 23, h: 1, text: name, config: { align: 'center', hide: hide, } },
                    { coord: [45, 0], w: 15, h: 1, text: idN, config: { align: 'center', hide: hide, } },
                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        })
        doc.moveDown();
    }

    let art = 1;

    function ARTICLE(CONTENT, jump = true) {
        doc.font('Helvetica-Bold')
        doc.text(`ARTÍCULO ${art}º.- `, { continued: true });
        doc.font('Helvetica')
        doc.text(CONTENT, { align: 'justify' });
        art++;
        if (jump) doc.moveDown();
    }

    function PARAGRAPH(CONTENT, n, jump = true) {
        doc.font('Helvetica-Bold')
        doc.text(`Parágrafo ${n || ''}. `, { continued: true });
        doc.font('Helvetica')
        doc.text(CONTENT, { align: 'justify' });
        if (jump) doc.moveDown();
    }

    function LIST(array, config = {}) {
        let _config = {
            ident: config.ident || 0,
            jump: config.jump === false ? config.jump : true,
            useNum: config.useNum === false ? config.useNum : true,
            startAt: config.startAt || 0,
            root: config.root || '',
            useLetters: config.useLetters || false,
            startAtl: config.startAtl || 'a',
        }

        let start_letter = _config.startAtl;

        array.map((d, i) => {
            let prev_string = "-";
            if (_config.useNum) prev_string = (Number(i) + (_config.startAt ? Number(_config.startAt) : 1)) + '.';
            if (_config.useLetters) prev_string = start_letter + '.';
            if (_config.root) prev_string = _config.root + '.' + prev_string
            let prev = prev_string;
            start_letter = nextLetter(start_letter);
            if (d) pdfSupport.table(doc,
                [
                    { coord: [_config.ident, 0], w: 3, h: 1, text: prev, config: { align: 'left', bold: true, hide: true } },
                    { coord: [3 + _config.ident, 0], w: 57 - _config.ident, h: 1, text: d, config: { align: 'justify', hide: true } },
                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true })
        })
        if (_config.jump) doc.moveDown();
    }

    function RESUELVE(docFontZise) {
        doc.text(`En mérito de lo expuesto en la parte considerativa, ${curaduriaInfo.pronoum} ${curaduriaInfo.job}`);
        doc.moveDown();

        doc.fontSize(13);
        doc.font('Helvetica-Bold')
        doc.text('RESUELVE', { align: 'center' });
        doc.font('Helvetica')
        doc.fontSize(docFontZise);
        doc.moveDown();
    }

    function TEXT_JUMP(n) {
        for (let i = 0; i < n; i++) doc.text('\n');
        if (n == 0) doc.text('', doc.page.margins.left, doc.y);
    }

    doc.pipe(fs.createWriteStream('./docs/public/expdocres.pdf'));



    // DIGITAL NOTIFICATION
    let not_page = 0;
    if (_DATA.type_not == 2 || _DATA.type_not == 3) {
        var _main_body = "";
        if (_DATA.type_not == 2) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; informándose además que contra dicho acto administrativo no se proceden recursos.`;
        if (_DATA.type_not == 3) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; Informándose además que contra dicho acto administrativo proceden los recursos de reposición ante ${curaduriaInfo.pronoum} ${curaduriaInfo.job} que lo expidió y de apelación ante la Oficina Asesora de Planeación, para que lo aclare, modifique o revoque. El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días hábiles siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011.`;

        const _BODIES_NOTS = [
            `ASUNTO: NOTIFICACIÓN ELECTRÓNICA RESOLUCIÓN N° ${_DATA.reso.reso_id} DEL ${dateParser(_DATA.reso.reso_date).toUpperCase()} CON RADICADO ${fun.id_public}`,
            `Por medo del presente está siendo notificado eltrónicamente del Acto Administrativo contestino en la Resolucion N° ${_DATA.reso.reso_id} del ${dateParser(_DATA.reso.reso_date)} expedida dentro del radicado interno ${fun.id_public} expedida por ${curaduriaInfo.pronoum} ${curaduriaInfo.job}. El acto administrativo objeto de notificación se encuentra adjunto a la presente comunicación.`,
            _main_body,
            `De conformidad con el inciso 5 del artículo 56 de la Ley 1437 de 2011, la notificación quedará surtida a partir de la fecha y hora en el que usted acceda a la misma, hecho que deberá ser certificado por esta Curaduría y/o a partir del momento en que acuse recibo respondiendo de este correo.`,
            `Si requiere de información adicioal puede comunicarse al número telefónico ${curaduriaInfo.tel} - ${curaduriaInfo.cel}  o al correo eltrónico: ${curaduriaInfo.email}.`
        ];
        doc.fontSize(11);
        doc.font('Helvetica-Bold');
        doc.font('Helvetica');
        doc.text('Señor(es)');
        doc.font('Helvetica-Bold');
        doc.text(`${f53.item_5311} ${f53.item_5312}`);
        doc.text(`${f53.item_535}`);
        doc.moveDown();
        doc.text(_BODIES_NOTS[0], { align: 'justify' });
        doc.moveDown();
        doc.moveDown();
        doc.font('Helvetica');
        doc.text(_BODIES_NOTS[1], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[2], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[3], { align: 'justify' });
        doc.moveDown();
        doc.text(_BODIES_NOTS[4], { align: 'justify' });
        doc.moveDown();
        pdfSupport.setSign(doc)
        not_page = doc.bufferedPageRange().count;

        doc.addPage();
        doc.y = doc.page.margins.top;
        doc.x = doc.page.margins.left;
    }

    doc.fontSize(13);
    doc.text(`\n`);
    doc.font('Helvetica-Bold')
    doc.text(`${(curaduriaInfo.job)}`, { align: 'center' });
    doc.fontSize(12);
    doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`, { align: 'center' });
    doc.fontSize(7);
    doc.text(curaduriaInfo.call, { align: 'center' });
    doc.text(`\n\n`);

    let docFontZise = 9;
    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

    doc.fontSize(9);
    doc.font('Helvetica')

    if (_DATA.reso.model == 'open') {
        doc.text(_BODY, { align: 'justify' });

        doc.fontSize(10);
        doc.font('Helvetica-Bold')
        doc.text('\nPARTE CONSIDERATIVA\n\n', { align: 'center' });
        doc.fontSize(9);
        let isSub = fun_1.tipo.includes('C');

        if (isSub) {
            let _width = doc.page.width - doc.page.margins.left - doc.page.margins.right - 64
            doc.font('Helvetica-Bold') // PRIMERO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_PRIMERO_SUB);
            doc.text('\n');
            CON_ORDER_i++;

            doc.font('Helvetica-Bold') // SEGUNDO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_SEGUNDO_SUB);
            doc.text('\n');
            CON_ORDER_i++;


            doc.font('Helvetica-Bold') // TERCERO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_TERCERO_SUB);
            doc.text('\n');
            CON_ORDER_i++;


            doc.font('Helvetica-Bold') // CUARTO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_CUARTO_SUB);
            doc.text('\n');
            CON_ORDER_i++;


            doc.font('Helvetica-Bold') // QUINTO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_QUINTO_SUB);
            doc.text('\n');
            CON_ORDER_i++;


            doc.font('Helvetica-Bold') // SEXTO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_SEXTO_SUB);
            doc.text('\n');
            CON_ORDER_i++;


            _SEXTO_ARRAY_SUB.map(a => {
                doc.text(` - ${a}`, 72, doc.y, { align: 'justify', width: _width });
            })

            doc.text('\n', 48, doc.y);
            doc.font('Helvetica-Bold') // SEPTIMO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_SEPTIMO_SUB);
            doc.text('\n');
            CON_ORDER_i++;

            doc.font('Helvetica-Bold') // OCTAVO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_OCTAVO_SUB);
            doc.text('\n');
            CON_ORDER_i++;

            doc.font('Helvetica-Bold') // NOVENO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_NOVENO_SUB);
            doc.text('\n');
            CON_ORDER_i++;

            _NOVENO_ARRAY_SUB.map(a => {
                doc.text(`${a}`, 72, doc.y, { align: 'justify', width: _width });
            })

            doc.text('\n', 48, doc.y);
            doc.font('Helvetica-Bold') // DECIMO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_DECIMO_SUB);
            doc.text('\n');
            CON_ORDER_i++;

            doc.fontSize(10);
            doc.font('Helvetica-Bold')
            doc.text('\nPARTE RESOLUTIVA\n\n', { align: 'center' });
            doc.fontSize(8);

            doc.font('Helvetica-Bold')
            doc.text('ARTICULO 1: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_1_SUB);
            doc.text('\n');

            doc.font('Helvetica-Bold')
            doc.text('PARÁGRAFO: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_DATA.reso.art_1p);
            doc.text('\n');

            doc.font('Helvetica-Bold')
            doc.text('ARTICULO 2: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_2_SUB);
            doc.text('\n');

            doc.font('Helvetica-Bold')
            doc.text('ARTICULO 3: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_3_SUB);
            doc.text('\n');

            doc.text(`- ${_BODY_ART_3_SUB_a}`, 72, doc.y, { align: 'justify', width: _width });
            doc.text('\n', 48, doc.y);

            doc.font('Helvetica-Bold')
            doc.text('ARTICULO 4: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_4_SUB);
            doc.text('\n');

            doc.font('Helvetica-Bold')
            doc.text('ARTICULO 5: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_5_SUB);
            doc.text('\n');

            doc.font('Helvetica-Bold')
            doc.text('ARTICULO 6: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_6_SUB);
            doc.text('\n');

            doc.font('Helvetica-Bold')
            doc.text('ARTICULO 7: ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_ARRAY_ART_7_SUB);
            doc.text('\n');

        }
        else {
            doc.font('Helvetica-Bold') // PRIMERO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_PRIMERO);

            TEXT_JUMP(_DATA.r_pages)
            CON_ORDER_i++;

            doc.font('Helvetica-Bold') // SEGUNDO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_SEGUNDO);
            CON_ORDER_i++;
            var _SEGUNDO_ARRAY_C = _SEGUNDO_ARRAY.filter((arr, i) => segundo_cb[i] == 'true')
            //doc.on('pageAdded', () => { return false });
            LIST(_SEGUNDO_ARRAY_C, { jump: false, useLetters: true });
            //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
            //pdfSupport.listText(doc, doc.y, _SEGUNDO_ARRAY_C.join('\n'), { counters: true, draw: false })
            TEXT_JUMP(_DATA.r_pages)

            doc.x = doc.page.margins.left;

            let f1_tipo = _DATA.fun_1s[0].tipo;
            let tercero_cb = _DATA.reso.tercero_cb;
            tercero_cb = tercero_cb ? tercero_cb.split(',') : []
            if (tercero_cb[0] == 'true') {
                doc.font('Helvetica-Bold') // TERCERO
                doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_BODY_TERCERO);
                CON_ORDER_i++;

                tercero_cb.shift();
                let new_tercero_array = [];
                new_tercero_array = _TERCERO_ARRAY.filter((value, i) => (tercero_cb[i] == 'true'))
                //doc.on('pageAdded', () => { return false });
                LIST(new_tercero_array, { jump: false, useLetters: true });
                //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
                //pdfSupport.listText(doc, doc.y, new_tercero_array.join('\n'), { counters: true, draw: false })
                //doc.x = doc.page.margins.left;
                doc.text('\n');
            }
            TEXT_JUMP(_DATA.r_pages)

            if (cuarto == 'true') {
                doc.font('Helvetica-Bold') // CUARTO
                doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_BODY_CUARTO);
                TEXT_JUMP(_DATA.r_pages)
                CON_ORDER_i++;
            }


            if (quinto == 'true') {
                doc.font('Helvetica-Bold') // QUINTO
                doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_BODY_QUINTO);
                doc.text('\n');
                CON_ORDER_i++;
            }


            doc.font('Helvetica-Bold')  // SEXTO
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_SEXTO, { align: 'justify' });
            CON_ORDER_i++;

            let sexto_cb = _DATA.reso.sexto_cb;
            sexto_cb = sexto_cb ? sexto_cb.split(',') : []
            let new_sexto_array = [];
            sexto_cb.map((value, i) => { if (value === 'true') new_sexto_array.push(_SEXTO_ARRAY[i]) })

            //pdfSupport.listText(doc, doc.y, new_sexto_array.join('\n'), { counters: true, draw: false })
            //if (sexto_cb[2] == 'true') pdfSupport.listText(doc, doc.y, _SEXTO_PAY_ARRAY.join('\n'), { counters: false, draw: false })

            //doc.on('pageAdded', () => { return false });
            let start_root = 'c'
            if (new_sexto_array.length == 2) start_root = 'b'
            if (new_sexto_array.length == 1) start_root = 'a'
            LIST(new_sexto_array, { ident: 1, jump: false, useLetters: true });
            if (sexto_cb[2] == 'true') LIST(_SEXTO_PAY_ARRAY, { ident: 1, root: start_root });
            //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

            TEXT_JUMP(_DATA.r_pages)

            let open_cb = _DATA.reso.open_cb;
            open_cb = open_cb ? open_cb.split(',') : [0, 0, 0];
            if (open_cb[0] == 'true') {
                doc.font('Helvetica-Bold')  // OPEN 1
                doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_DATA.reso.open_1);
                doc.text('\n');
                CON_ORDER_i++;
            }

            if (open_cb[1] == 'true') {
                doc.font('Helvetica-Bold')  // OPEN 2
                doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_DATA.reso.open_2);
                doc.text('\n');
                CON_ORDER_i++;
            }

            if (open_cb[2] == 'true') {
                doc.font('Helvetica-Bold')  // OPEN 3
                doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_DATA.reso.open_3);
                doc.text('\n');
                CON_ORDER_i++;
            }


            doc.fontSize(10);
            doc.font('Helvetica-Bold')
            doc.text('\nPARTE RESOLUTIVA\n\n', { align: 'center' });
            doc.font('Helvetica')
            doc.fontSize(9);
            doc.text(`En mérito de lo expuesto en la parte considerativa, ${curaduriaInfo.pronoum} ${curaduriaInfo.job} resuelve:`);
            doc.text('\n');

            doc.font('Helvetica-Bold')
            doc.text('ARTÍCULO 1°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_1);

            doc.text('\n');
            doc.text('Información Documental');

            let ACONF = LOAD_STEP('s34', 'arc');
            let ac_json = ACONF ? ACONF.json ? ACONF.json : {} : {};
            ac_json = getJSON_Simple(ac_json);
            let area = ac_json.m2

            //doc.on('pageAdded', () => { return false });
            if (_DATA.reso.art_1_cb_tb == 'true') {
                F2_TABLE_MANUAL(doc, _DATA.reso.art_1_txt_tb);
            } else TABLE_F2(true, area);
            //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

            let art_1_cb = _DATA.reso.art_1_cb;
            art_1_cb = art_1_cb ? art_1_cb.split(',') : [];

            if (art_1_cb[0] === 'true') {
                doc.text(_BODY_ART_1_2, { align: 'justify' });

                //pdfSupport.listText(doc, doc.y, _BODY_ART_1_2, { draw: false, counterh: true })
            }

            _VALUE_ARRAY = _GET_STEP_TYPE('geo', 'value', 'arc');
            if (curaduriaInfo.id == 'cub1') {
                _DATA.info_geo_arq = _VALUE_ARRAY
                doc.moveDown();
                doc.text('Información geográfica. Coordenadas');
                //doc.on('pageAdded', () => { return false });
                pdfSupport.rowConfCols2(doc, doc.y,
                    ['1', `Norte: ${_VALUE_ARRAY[0]}`, `Este: ${_VALUE_ARRAY[1]}`, 'Artículo 365 del POT Sistema de coordenadas en MAGNASIRGAS',],
                    [1, 4, 4, 4],
                    [
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                        { align: 'center' },
                    ], { draw: false });
                //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
            }
            TEXT_JUMP(_DATA.r_pages)

            doc.font('Helvetica-Bold')
            doc.text('ARTÍCULO 2°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_2);
            //doc.fontSize(7);

            //doc.on('pageAdded', () => { return false });
            TABLE_F51(false, true, true);
            //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

            TEXT_JUMP(_DATA.r_pages)
            doc.fontSize(9);
            doc.font('Helvetica-Bold')
            doc.text('ARTÍCULO 3°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_3);
            doc.text('\n');
            doc.fontSize(8);

            //doc.on('pageAdded', () => { return false });
            TABLE_F52(true);
            //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
            TEXT_JUMP(_DATA.r_pages)
            doc.fontSize(9);
            doc.font('Helvetica-Bold')
            doc.text('ARTÍCULO 4°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text('Autorizar las obras e intervenciones urbanísticas que a continuación se describen:');
            TEXT_JUMP(_DATA.r_pages)

            _VALUE_ARRAY = _GET_STEP_TYPE('s33', 'value', 'arc');

            if (arts_cb[0] == 'true') {
                doc.font('Helvetica-Bold')
                doc.text('1.   Antecedentes: ', { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_DATA.reso.art_4_1 ? String(_DATA.reso.art_4_1) : 'No se presentaron antecedentes urbanísticos.');
                TEXT_JUMP(_DATA.r_pages)
            }

            if (arts_cb[1] == 'true') {
                doc.font('Helvetica-Bold')
                doc.text('2.   Descripción del proyecto a licenciar: ', { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(_DATA.reso.art_4_2 ? String(_DATA.reso.art_4_2) : 'No se presentó descripción.');
                TEXT_JUMP(_DATA.r_pages)
            }

            if (curaduriaInfo.id == 'cub1') {
                doc.font('Helvetica-Bold');
                doc.text('3.   Características y normas aplicables al proyecto:');
                doc.font('Helvetica');
                doc.fontSize(7);

                //doc.startPage = doc.bufferedPageRange().count - 1;
                //doc.lastPage = doc.bufferedPageRange().count - 1;
                doc.startPage = doc.startPage - 1;
                doc.lastPage = doc.lastPage - 1;
                //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
                doc.on('pageAdded', () => { return false });

                // AREAS TABLE
                let STEP = LOAD_STEP('a_config', 'arc');
                let json = STEP ? STEP.json ? STEP.json : {} : {};
                json = getJSON_Simple(json);
                let tagsH = json.tagh ? json.tagh.split(';') : [];
                let tagsE = json.tage ? json.tage.split(';') : [];
                let lic = fun_1.m_lic ? fun_1.m_lic : [];
                let rec = fun_1.tipo ? fun_1.tipo : [];

                var json_var = _GET_STEP_TYPE_JSON('s34', 'json', 'arc');
                json_var = getJSON_Simple(json_var);
                let mainuse = json_var.mainuse ? json_var.mainuse : ' ';
                let tipo = json_var.tipo ? json_var.tipo : ' ';
                const value34 = _GET_STEP_TYPE('s34', 'value', 'arc');
                const check34 = _GET_STEP_TYPE('s34', 'check', 'arc');

                // ----------------------- RESUME TABLE ------------------- //

                let dinmanicHeaders = (conf) => {
                    let _h = conf ? conf.h ? conf.h : 1 : 1;
                    let headers = [];
                    tagsH.map((tag, i) => {
                        let tag_hd = tag.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        tag_hd = tag_hd.replace('Historico', 'Antecedente');
                        tag_hd = tag_hd.replace('historico', 'Antecedente');
                        headers.push({ coord: [0, 0], w: 1, h: 1, text: tag_hd, config: { align: 'center', bold: true, valign: true, } })
                    })
                    tagsE.map((tag, i) => {
                        headers.push({ coord: [0, 0], w: 1, h: 1, text: 'Empate:\n' + tag, config: { align: 'center', bold: true } })
                    })


                    if (lic.includes('G')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Dem. Total', config: { align: 'center', bold: true, valign: true, } })
                    if (lic.includes('g')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Dem. Parcial', config: { align: 'center', bold: true, valign: true, } })

                    if (lic.includes('A')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Obra Nueva', config: { align: 'center', bold: true, valign: true, } })
                    if (rec.includes('F')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Reconocida', config: { align: 'center', bold: true, valign: true, } })

                    if (lic.includes('B')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Ampliada', config: { align: 'center', bold: true, valign: true, } })
                    if (lic.includes('C')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Adecuada', config: { align: 'center', bold: true, valign: true, } })
                    if (lic.includes('D')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Modificada', config: { align: 'center', bold: true, valign: true, } })
                    if (lic.includes('E')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Restaurada', config: { align: 'center', bold: true, valign: true, } })
                    if (lic.includes('F')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Reforzada', config: { align: 'center', bold: true, valign: true, } })
                    if (lic.includes('H')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Reconstruida', config: { align: 'center', bold: true, valign: true, } })
                    if (lic.includes('I')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Cerrada', config: { align: 'center', bold: true, valign: true, } })
                    return headers;
                }
                    ;
                let dinamicTotal = (areas, filter) => {
                    let cells = [];
                    let _i = 0;

                    tagsH.map((tag, i) => {
                        if (tag) {
                            cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_H(areas, 'historic_areas', i, filter), config: { align: 'center', valign: true, } })
                            _i++;
                        }
                    })
                    tagsE.map((tag, i) => {
                        if (tag) {
                            cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_H(areas, 'empate_h', i, filter), config: { align: 'center', valign: true, } })
                            _i++;
                        }
                    })

                    if (lic.includes('G')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 6, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }

                    if (lic.includes('g')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 7, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }

                    if (lic.includes('A')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 0, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    if (rec.includes('F')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 10, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }

                    if (lic.includes('B')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 1, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    if (lic.includes('C')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 2, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    if (lic.includes('D')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 3, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    if (lic.includes('E')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 4, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    if (lic.includes('F')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 5, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    if (lic.includes('H')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 8, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    if (lic.includes('I')) {
                        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 9, filter), config: { align: 'center', valign: true, } })
                        _i++;
                    }
                    return cells;

                }

                let tableHeaders = [
                    { coord: [0, 0], w: 1, h: 1, text: 'Uso\nPrincipal', config: { align: 'center', bold: true, valign: true, } },
                    { coord: [0, 0], w: 1, h: 1, text: 'Tipo', config: { align: 'center', bold: true, valign: true, } },
                    { coord: [0, 0], w: 1, h: 1, text: 'Escala\nUrbana', config: { align: 'center', bold: true, valign: true, } },
                    // HERE ADD THE DIMANIC AREAS
                    ...dinmanicHeaders(),
                    // END HERE
                    { coord: [0, 0], w: 1, h: 1, text: 'Descontada', config: { align: 'center', bold: true, valign: true, } },
                    { coord: [0, 0], w: 1, h: 1, text: 'Total\nConstruida', config: { align: 'center', bold: true, valign: true, } },
                    { coord: [0, 0], w: 1, h: 1, text: 'Total\nintervenida', config: { align: 'center', bold: true, valign: true, } },

                    { coord: [0, 0], w: 1, h: 1, text: 'Cantidad', config: { align: 'center', bold: true, valign: true, } },
                    { coord: [0, 0], w: 1, h: 1, text: 'Área\nunidades', config: { align: 'center', bold: true, valign: true, } },
                    //{ coord: [0, 0], w: 1, h: 1, text: 'Área\ncomún', config: { align: 'center', bold: true, valign: true, } },
                ];

                let tbWidth = 60 / tableHeaders.length;
                let tbWidthA = tbWidth * (tableHeaders.length - 2)
                let tbWidthU = tbWidth * 2;
                let _i = 0;
                //doc.fontSize(6);
                tableHeaders.map((th, i) => { th.coord[0] += tbWidth * i; th.w = tbWidth; })

                pdfSupport.table(doc,
                    [
                        { coord: [tbWidth * 3, 0], w: tbWidthA - (tbWidth * 3), h: 1, text: '3.1 Áreas totales m2', config: { align: 'center', bold: true, } },
                        { coord: [tbWidthA, 0], w: tbWidthU, h: 1, text: '3.2 Unidades Nuevas', config: { align: 'center', bold: true, } },

                    ],
                    [doc.x, doc.y],
                    [60, 1],
                    {})
                pdfSupport.table(doc,
                    tableHeaders,
                    [doc.x, doc.y],
                    [60, 1],
                    { lineHeight: -1 })



                let areas = _GET_CHILD_33_AREAS();
                let totals = dinamicTotal(areas);
                let uses = [];
                let rowUses = [];
                let rowAreasTotal = [];
                let sumArea = 0;
                let sumIndex = 0;
                let sumDestroy = 0;

                areas.map((area, i) => {
                    let use = String(area.use).toLowerCase();
                    if (!use) use = 'otro';
                    if (!uses.includes(use)) uses.push(use);


                    let obj = JSON.stringify(area);
                    let iDe = obj.indexOf("destroy");
                    let iDes = obj.indexOf('":"', iDe);
                    let iDef = obj.indexOf('","', iDe);
                    let iDet = obj.slice(iDes + 3, iDef);
                    let destroy_areas = iDet ? iDet : [];
                    sumArea += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
                    sumIndex += Number(_GET_NET_INDEX(area.build, destroy_areas, area.historic_areas));
                    sumDestroy += Number(_GET_TOTAL_DESTROY(destroy_areas));
                })

                uses.map((use, k) => {
                    let areasRow = [];
                    let totalAreasUseLocal = dinamicTotal(areas, use);
                    areasRow.push(...totalAreasUseLocal);
                    localArea = 0;
                    localIndex = 0;
                    localDestroy = 0;

                    areas.map(area => {
                        let obj = JSON.stringify(area);
                        let iDe = obj.indexOf("destroy");
                        let iDes = obj.indexOf('":"', iDe);
                        let iDef = obj.indexOf('","', iDe);
                        let iDet = obj.slice(iDes + 3, iDef);
                        let destroy_areas = iDet ? iDet : [];

                        let _use = String(area.use).toLowerCase();
                        if (!_use) _use = 'otro';
                        if (_use == use) {
                            localArea += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
                            localIndex += Number(_GET_NET_INDEX(area.build, destroy_areas, area.historic_areas));
                            localDestroy += Number(_GET_TOTAL_DESTROY(destroy_areas));
                        }

                    })


                    let __i = totalAreasUseLocal.length;
                    areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(localDestroy).toFixed(2), config: { align: 'center', valign: true, } })
                    __i++
                    areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(localArea).toFixed(2), config: { align: 'center', valign: true, } })
                    __i++
                    areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(_GET_COMMON_A_TOTAL([use])).toFixed(2), config: { align: 'center', valign: true, } })

                    areas.map((area, j) => {
                        let _use = String(area.use).toLowerCase();
                        if (!_use) _use = 'otro';
                        let hasValue = _GET_UNITS_A_TOTAL([_use]) > 0 || Number(_GET_UNITS_U_TOTAL([_use])) > 0 || areasRow.some(a => Number(a.text) > 0)
                        let conScala = String(_use).trim() == 'vivienda' || String(_use).trim() == 'Vivienda' || String(_use).trim() == 'residencial' || String(_use).trim() == 'Residencial';
                        if (_use == use && hasValue) {
                            rowUses[k] = [
                                { coord: [tbWidth * 0, 0], w: tbWidth, h: 1, text: cfl(_use), config: { align: 'center', valign: true, } },
                                { coord: [tbWidth * 1, 0], w: tbWidth, h: 1, text: tipo, config: { align: 'center', valign: true, } },
                                { coord: [tbWidth * 2, 0], w: tbWidth, h: 1, text: conScala ? 'NA' : VV(value34[5]), config: { align: 'center', valign: true, } },
                                ...areasRow,
                                { coord: [tbWidthA + tbWidth * 0, 0], w: tbWidth, h: 1, text: Number(_GET_UNITS_U_TOTAL([_use])).toFixed(0), config: { align: 'center', valign: true, } },
                                { coord: [tbWidthA + tbWidth * 1, 0], w: tbWidth, h: 1, text: _GET_UNITS_A_TOTAL([_use]), config: { align: 'center', valign: true, } },
                            ];
                        }
                    })
                })

                rowUses.map(rows => pdfSupport.table(doc, [...rows], [doc.x, doc.y], [60, 1], { lineHeight: -1 }))

                rowAreasTotal.push(...totals);
                __i = totals.length;
                rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(sumDestroy).toFixed(2), config: { align: 'center', valign: true, } })
                __i++;
                rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(sumArea).toFixed(2), config: { align: 'center', valign: true, } })
                __i++;
                rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(_GET_COMMON_A_TOTAL()).toFixed(2), config: { align: 'center', valign: true, } })

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: tbWidth * 3, h: 1, text: 'Totales:', config: { align: 'right', bold: true, } },
                        ...rowAreasTotal,
                        { coord: [tbWidthA, 0], w: tbWidth, h: 1, text: Number(_GET_UNITS_U_TOTAL()).toFixed(0), config: { align: 'center', valign: true, } },
                        { coord: [tbWidthA + tbWidth, 0], w: tbWidth, h: 1, text: _GET_UNITS_A_TOTAL(), config: { align: 'center', valign: true, } },
                        //{ coord: [tbWidthA + tbWidth * 2, 0], w: tbWidth, h: 2, text: Number(_GET_COMMON_A_TOTAL()).toFixed(2), config: { align: 'center', valign: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], {})

                if (_DATA.reso.art_4_p) pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 60, h: 1, text: _DATA.reso.art_4_p, config: { align: 'left', bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], {})

                // arreglo original de usos (por si necesitas identificar por grupo)
                let totalRowContent = [
                    { coord: [0, 0], w: tbWidth * 3, h: 1, text: 'Totales:', config: { align: 'right', bold: true, } },
                    ...rowAreasTotal,
                    { coord: [tbWidthA, 0], w: tbWidth, h: 1, text: Number(_GET_UNITS_U_TOTAL()).toFixed(0), config: { align: 'center', valign: true, } },
                    { coord: [tbWidthA + tbWidth, 0], w: tbWidth, h: 1, text: _GET_UNITS_A_TOTAL(), config: { align: 'center', valign: true, } },
                ];
                let finalParagraph = _DATA.reso.art_4_p
                    ? [{ coord: [0, 0], w: 60, h: 1, text: _DATA.reso.art_4_p, config: { align: 'left', bold: true } }]
                    : [];

                _JSON_STEP = _GET_STEP_TYPE_JSON('s34', 'json', 'arc');
                _JSON_STEP = getJSON_Simple(_JSON_STEP);

                _areas_table = {
                    "STEP": STEP,
                    "json": json,
                    "tagsH": tagsH,
                    "tagsE": tagsE,
                    "lic": lic,
                    "rec": rec,
                    "json_var": json_var,
                    "mainuse": mainuse,
                    "tipo": tipo,
                    "value34": value34,
                    "check34": check34,
                    "tableHeaders": tableHeaders,
                    "dinmanicHeaders": dinmanicHeaders(),
                    "table_use_rows": rowUses,
                    "table_total_rows": totalRowContent,
                    "table_final_paragraph": finalParagraph,
                    "_JSON_STEP": _JSON_STEP,
                };


                // -------------------------------------------------------- //
                // -------------------------------------------------------- //
                // -------------------------------------------------------- //

                const ALLOW_REVIEWS = record_arc ? record_arc.subcategory ? record_arc.subcategory.split(',') : [0, 0, 0, 0] : [0, 0, 0, 0];
                _areas_table.ALLOW_REVIEWS = ALLOW_REVIEWS;
                if (ALLOW_REVIEWS[0] == 1) {
                    doc.fontSize(8);
                    doc.text('\n');

                    _JSON_STEP = _GET_STEP_TYPE_JSON('s34', 'json', 'arc');
                    _JSON_STEP = getJSON_Simple(_JSON_STEP);
                    _VALUE_ARRAY = _GET_STEP_TYPE('s34', 'value', 'arc');
                    _CHECK_ARRAY = _GET_STEP_TYPE('s34', 'check', 'arc');

                    const start_y = doc.y;
                    const page_start = doc.bufferedPageRange().count - 1;

                    const table_33 = {
                        "_JSON_STEP": _JSON_STEP,
                        "_VALUE_ARRAY": _VALUE_ARRAY,
                        "_CHECK_ARRAY": _CHECK_ARRAY,
                    }

                    _areas_table.table_3_3 = table_33;

                    // 3.3 

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 30, h: 1, text: '3.3 Determinantes del predio', config: { align: 'center', bold: true } },

                            { coord: [0, 1], w: 15, h: 1, text: '3.3.1 Norma Urbana', config: { align: 'left', bold: true, fill: 'silver' } },
                            { coord: [15, 1], w: 15, h: 1, text: '3.3.2 Socioeconómico', config: { align: 'left', bold: true, fill: 'silver' } },

                            { coord: [0, 2], w: 9, h: 1, text: 'Ficha normativa', config: { align: 'left', } },
                            { coord: [9, 2], w: 6, h: 1, text: _JSON_STEP.ficha, config: { align: 'center', } },
                            { coord: [15, 2], w: 9, h: 1, text: 'Estrato', config: { align: 'left', } },
                            { coord: [24, 2], w: 6, h: 1, text: f2.estrato, config: { align: 'center', } },

                            { coord: [0, 3], w: 9, h: 1, text: 'Sector', config: { align: 'left', } },
                            { coord: [9, 3], w: 6, h: 1, text: _JSON_STEP.sector, config: { align: 'center', } },
                            { coord: [15, 3], w: 9, h: 1, text: 'ZGU N°', config: { align: 'left', } },
                            { coord: [24, 3], w: 6, h: 1, text: _JSON_STEP.zgu, config: { align: 'center', } },

                            { coord: [0, 4], w: 9, h: 1, text: 'Subsector ', config: { align: 'left', } },
                            { coord: [9, 4], w: 6, h: 1, text: _JSON_STEP.subsector, config: { align: 'center', } },
                            { coord: [15, 4], w: 9, h: 1, text: '$m2 ZGU', config: { align: 'left', } },
                            { coord: [24, 4], w: 6, h: 1, text: _JSON_STEP.zugm, config: { align: 'center', } },

                        ],
                        [doc.x, doc.y], [61, 5], {})

                    doc.text('\n');

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 30, h: 1, text: '3.3.3 Restricciones/limitaciones', config: { align: 'left', bold: true, fill: 'silver' } },
                        ],
                        [doc.x, doc.y], [61, 1], {})

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 24, h: 1, text: 'Zona de restricción: ' + VV(_VALUE_ARRAY[6]), config: { align: 'left', } },
                            { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[6]), config: { align: 'center', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 24, h: 1, text: 'Amenaza y Riesgo: ' + VV(_VALUE_ARRAY[8]), config: { align: 'left', } },
                            { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[8]), config: { align: 'center', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (VV(_VALUE_ARRAY[7]) != 'NA') pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 24, h: 1, text: 'Utilidad Pública: ' + VV(_VALUE_ARRAY[7]), config: { align: 'left', } },
                            { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[7]), config: { align: 'center', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })
                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 24, h: 1, text: VV(_VALUE_ARRAY[9]), config: { align: 'left', } },
                            { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[9]), config: { align: 'center', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    doc.text('\n');

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 30, h: 1, text: '3.3.4 Suelo', config: { align: 'left', bold: true, fill: 'silver' } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 11, h: 1, text: 'Clase Suelo', config: { align: 'left', } },
                            { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[0]), config: { align: 'left', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 11, h: 1, text: 'Tratamiento urbanístico', config: { align: 'left', } },
                            { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[2]), config: { align: 'left', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 11, h: 1, text: 'Área de actividad', config: { align: 'left', } },
                            { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[4]), config: { align: 'left', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 11, h: 1, text: 'Unidad de uso', config: { align: 'left', } },
                            { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[3]), config: { align: 'left', } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    doc.text('\n');

                    // 3.3.5 PERFIL VIAL

                    let perfiles = [];
                    let perfiles_headers = [];
                    record_arc_36_infos.map(perfil => {
                        if (!perfiles_headers.includes(perfil.address)) perfiles_headers.push(perfil.address)
                    })



                    let p_witdh = 22 / perfiles_headers.length;
                    let sub_p_width = p_witdh / 2;

                    let row_headers = [];
                    perfiles_headers.map((p, i) => {
                        row_headers.push({ coord: [8 + i * p_witdh, 1], w: sub_p_width, h: 1, text: 'N', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } })
                        row_headers.push({ coord: [8 + i * p_witdh + sub_p_width, 1], w: sub_p_width, h: 1, text: 'P', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } })
                    })


                    record_arc_36_infos.map((perfil, k) => {
                        let names = perfil.name ? perfil.name.split(';') : [];

                        names.map((name, j) => {
                            if (perfiles.some(p => p.name == name)) {
                                perfiles.map((p, i) => {
                                    if (p.name == name) {
                                        if (p.address.some(a => a == perfil.address)) {
                                            address.map((a, l) => {
                                                if (a == perfil.address) {
                                                    perfiles[i].norm[l] = perfil.norm ? perfil.norm.split(';')[j] : 0;
                                                    perfiles[i].project[l] = perfil.project ? perfil.project.split(';')[j] : 0;
                                                }
                                            })
                                        } else {
                                            perfiles[i].norm[k] = perfil.norm ? perfil.norm.split(';')[j] : 0;
                                            perfiles[i].project[k] = perfil.project ? perfil.project.split(';')[j] : 0;
                                            perfiles[i].address[k] = perfil.address;
                                        }
                                    }
                                })
                            } else {
                                let norms = [];
                                let projects = [];
                                let address = [];

                                norms[k] = perfil.norm ? perfil.norm.split(';')[j] : 0;
                                projects[k] = perfil.project ? perfil.project.split(';')[j] : 0;
                                address[k] = perfil.address;

                                perfiles.push({
                                    name: name,
                                    address: address,
                                    norm: norms,
                                    project: projects,
                                })

                            }
                        })

                    })


                    if (record_arc_36_infos.length > 0) pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 30, h: 1, text: '3.3.5 Perfil via', config: { align: 'left', bold: true, fill: 'silver' } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })


                    if (record_arc_36_infos.length > 0) pdfSupport.table(doc,
                        [
                            { coord: [0, 0], w: 8, h: 2, text: 'Perfil', config: { align: 'center', bold: true, valign: true, fill: 'silver', } },
                            // HERE GOES THE DIMANIC TABLES
                            ...perfiles_headers.map((p, i) => {
                                return { coord: [8 + i * p_witdh, 0], w: p_witdh, h: 1, text: p, config: { align: 'center', bold: true, valign: true, fill: 'silver', } }
                            }),
                            ...row_headers,
                        ],
                        [doc.x, doc.y], [61, 2], {})


                    if (record_arc_36_infos.length > 0) perfiles.map((perfil, i) => {
                        let row_p = []
                        perfiles_headers.map((ph, j) => {
                            let isStreet = true
                            let norm = isStreet ? perfil.norm[j] : '';
                            let project = isStreet ? perfil.project[j] : '';


                            row_p.push({ coord: [8 + p_witdh * j, 0], w: sub_p_width, h: 1, text: norm, config: { align: 'center', valign: true, } });
                            row_p.push({ coord: [8 + p_witdh * j + sub_p_width, 0], w: sub_p_width, h: 1, text: project, config: { align: 'center', valign: true, } });
                        });
                        let p = [
                            { coord: [0, 0], w: 8, h: 1, text: perfil.name, config: { align: 'center', valign: true, bold: true } },

                            ...row_p,
                        ]
                        pdfSupport.table(doc,
                            [
                                ...p
                            ],
                            [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    })

                    // 2) armar perfiles con norm/project alineados
                    const perfilesMap = new Map();
                    record_arc_36_infos.forEach(info => {
                        const names = (info.name || '').split(';');
                        const norms = (info.norm || '').split(';');
                        const projects = (info.project || '').split(';');
                        const addrIdx = perfiles_headers.findIndex(a => a === info.address);

                        names.forEach((name, i) => {
                            if (!perfilesMap.has(name)) {
                                perfilesMap.set(name, {
                                    name,
                                    norm: Array(perfiles_headers.length).fill('0'),
                                    project: Array(perfiles_headers.length).fill('0')
                                });
                            }
                            const perfil = perfilesMap.get(name);
                            perfil.norm[addrIdx] = norms[i] || '0';
                            perfil.project[addrIdx] = projects[i] || '0';
                        });
                    });

                    const perfilVial = {
                        headers: perfiles_headers,
                        perfiles: Array.from(perfilesMap.values())
                    };

                    _areas_table.table_3_5 = perfilVial//datos

                    doc.text('\n');

                    const end_y = doc.y;
                    const end_page = doc.bufferedPageRange().count - 1;

                    _VALUE_ARRAY = _GET_STEP_TYPE('s_34_te', 'value', 'arc');
                    _CHECK_ARRAY = _GET_STEP_TYPE('s_34_te', 'check', 'arc');

                    doc.switchToPage(page_start);
                    doc.y = start_y;

                    // 3.4 Edificabilidad y volumetría

                    let excs = {
                        'Empate Volumetrico': 'EV',
                        'Hasta 3 pisos': "3P",
                        'Bien de Interest Culural': 'BIC',
                        'Plan especial de manejor de patrimonio': 'PEMP',
                        'Indice licencia previa': 'LP',
                        'Historico': 'HIS',
                        'Bonificación': 'BON',
                        'Orden judicial': 'OJ',
                        'Art. 305° Prgf. 1': 'A305P1',
                        'Art. 313° - Plan parcial': 'PP',
                        'Art. 313° - TRA-3': 'TRA3',
                        'Art. 313° - M2': 'M2',
                        'Art. 313° - Prgf. 2': 'A313P2',
                        'Art. 313° M2, comercio, piso 1 á 3': 'M2C13',
                        'Art. 471° Reconocimiento': 'REC',
                        'Causa: Plazas/plazoletas en predio esquinero': 'PLAE',
                        'Causa: Plazas/plazoletas en predio medianero': 'PLAM',
                        'Causa: Pasaje comercial': 'COM',
                        'Causa: Construción de espacio público por cosatdo manzana': 'PUB'
                    };

                    let con_edif = _CHECK_ARRAY[1] != '2' || _CHECK_ARRAY[2] != '2';

                    pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 30, h: 1, text: '3.4 Edificabilidad y volumetría', config: { align: 'center', bold: true } },
                        ],
                        [doc.x, doc.y], [61, 1], {})

                    if (con_edif) pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: '3.4.1 Índices ', config: { align: 'left', bold: true, fill: 'silver' } },
                            { coord: [38, 0], w: 6, h: 1, text: 'Dato', config: { align: 'center', bold: true, fill: 'silver' } },
                            { coord: [44, 0], w: 6, h: 1, text: 'Norma', config: { align: 'center', bold: true, fill: 'silver' } },
                            { coord: [50, 0], w: 6, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, fill: 'silver' } },
                            { coord: [56, 0], w: 5, h: 1, text: 'Eva/Excp', config: { align: 'center', bold: true, fill: 'silver' } },
                        ],
                        [doc.x, doc.y], [61, 1], {})

                    if (_CHECK_ARRAY[1] != '2') pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: 'Ocupacion', config: { align: 'left', valign: true, } },
                            { coord: [38, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[6]), config: { align: 'center', valign: true, } },
                            { coord: [44, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[3]), config: { align: 'center', valign: true, } },
                            { coord: [50, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[4]), config: { align: 'center', valign: true, } },
                            { coord: [56, 0], w: 5, h: 1, text: _VALUE_ARRAY[5] == 'NO' ? CV2(_CHECK_ARRAY[1]) : (excs[_VALUE_ARRAY[5]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[2] != '2') pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: 'Construcción', config: { align: 'left', valign: true, } },
                            { coord: [38, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[10]), config: { align: 'center', valign: true, } },
                            { coord: [44, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[7]), config: { align: 'center', valign: true, } },
                            { coord: [50, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[8]), config: { align: 'center', valign: true, } },
                            { coord: [56, 0], w: 5, h: 1, text: _VALUE_ARRAY[9] == 'NO' ? CV2(_CHECK_ARRAY[2]) : (excs[_VALUE_ARRAY[9]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (con_edif) doc.text('\n');

                    // 3.4.2 Volumen

                    let con_volumen = _CHECK_ARRAY[0] != '2' || _CHECK_ARRAY[3] != '2' || _CHECK_ARRAY[4] != '2' || _CHECK_ARRAY[5] != '2';

                    if (con_volumen) pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: '3.4.2 Volumen', config: { align: 'left', bold: true, fill: 'silver' } },
                            { coord: [38, 0], w: 8, h: 1, text: 'Norma', config: { align: 'center', bold: true, fill: 'silver' } },
                            { coord: [46, 0], w: 8, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, fill: 'silver' } },
                            { coord: [54, 0], w: 7, h: 1, text: 'Eval. / Excep.', config: { align: 'center', bold: true, fill: 'silver' } },
                        ],
                        [doc.x, doc.y], [61, 1], {})

                    if (_CHECK_ARRAY[0] != '2') pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: 'Tip. edific.', config: { align: 'left', valign: true, } },
                            { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[0]), config: { align: 'center', valign: true, } },
                            { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[1]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[2] == 'NO' ? CV2(_CHECK_ARRAY[0]) : (excs[_VALUE_ARRAY[2]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[3] != '2') pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: 'Nr. de pisos', config: { align: 'left', valign: true, } },
                            { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[11]), config: { align: 'center', valign: true, } },
                            { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[12]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[13] == 'NO' ? CV2(_CHECK_ARRAY[3]) : (excs[_VALUE_ARRAY[13]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[4] != '2') pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: 'Semisótano', config: { align: 'left', valign: true, } },
                            { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[18]), config: { align: 'center', valign: true, } },
                            { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[19]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[4]), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[5] != '2') pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: 'Sótanos', config: { align: 'left', valign: true, } },
                            { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[22]), config: { align: 'center', valign: true, } },
                            { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[23]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[5]), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (con_volumen) doc.text('\n');

                    // 3.4.3 Aislam

                    let any_check = _CHECK_ARRAY[6] != '2' || _CHECK_ARRAY[7] != '2' || _CHECK_ARRAY[8] != '2' || _CHECK_ARRAY[9] != '2' || _CHECK_ARRAY[11] != '2' || _CHECK_ARRAY[12] != '2' || _CHECK_ARRAY[13] != '2' || _CHECK_ARRAY[14] != '2';

                    if (any_check) pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 11, h: 1, text: '3.4.3 Aislamientos', config: { align: 'left', bold: true, fill: 'silver' } },
                            { coord: [42, 0], w: 6, h: 1, text: 'Norma', config: { align: 'center', bold: true, fill: 'silver' } },
                            { coord: [48, 0], w: 6, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, fill: 'silver' } },
                            { coord: [54, 0], w: 7, h: 1, text: 'Eval. / Excep.', config: { align: 'center', bold: true, fill: 'silver' } },
                        ],
                        [doc.x, doc.y], [61, 1], {})

                    if (_CHECK_ARRAY[6] != '2') pdfSupport.table(doc, // 'Frontal 1'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[69])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[26]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[27]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[62] == 'NO' ? CV2(_CHECK_ARRAY[6]) : (excs[_VALUE_ARRAY[62]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[7] != '2') pdfSupport.table(doc, // 'Frontal 2'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[70])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[30]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[31]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[63] == 'NO' ? CV2(_CHECK_ARRAY[7]) : (excs[_VALUE_ARRAY[63]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })


                    if (_CHECK_ARRAY[8] != '2') pdfSupport.table(doc, // 'Lateral 1'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[71])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[34]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[35]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[64] == 'NO' ? CV2(_CHECK_ARRAY[8]) : (excs[_VALUE_ARRAY[64]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })


                    if (_CHECK_ARRAY[9] != '2') pdfSupport.table(doc,  // 'Lateral 2'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[72])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[38]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[39]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[65] == 'NO' ? CV2(_CHECK_ARRAY[9]) : (excs[_VALUE_ARRAY[65]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (false) pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: 'Lateral', config: { align: 'left', valign: true, } },
                            { coord: [38, 0], w: 5, h: 1, text: VV(_VALUE_ARRAY[42]), config: { align: 'center', valign: true, } },
                            { coord: [43, 0], w: 5, h: 1, text: VV(_VALUE_ARRAY[43]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 13, h: 1, text: VV(_VALUE_ARRAY[66]), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[11] != '2') pdfSupport.table(doc,  // 'Posterior'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[74])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[46]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[47]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[66] == 'NO' ? CV2(_CHECK_ARRAY[11]) : (excs[_VALUE_ARRAY[66]] || 'Excep.'), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[12] != '2') pdfSupport.table(doc, // 'Antejardin 1'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[75])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[50]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[51]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[12]), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[13] != '2') pdfSupport.table(doc, // 'Antejardin 2'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[76])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[54]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[55]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[13]), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[14] != '2') pdfSupport.table(doc, // 'Antejardin 3'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[77])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[58]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[59]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[14]), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    if (_CHECK_ARRAY[15] != '2') pdfSupport.table(doc, // 'Antejardin 4'
                        [
                            { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[78])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                            { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[82]), config: { align: 'center', valign: true, } },
                            { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[79]), config: { align: 'center', valign: true, } },
                            { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[15]), config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })

                    doc.text('\n');

                    let excps_array = []
                    if (!excps_array.includes(_VALUE_ARRAY[5]) && _VALUE_ARRAY[5] != 'NO') excps_array.push(_VALUE_ARRAY[5]);
                    if (!excps_array.includes(_VALUE_ARRAY[9]) && _VALUE_ARRAY[9] != 'NO') excps_array.push(_VALUE_ARRAY[9]);
                    if (!excps_array.includes(_VALUE_ARRAY[2]) && _CHECK_ARRAY[0] != '2') excps_array.push(_VALUE_ARRAY[2]);
                    if (!excps_array.includes(_VALUE_ARRAY[13]) && _CHECK_ARRAY[3] != '2') excps_array.push(_VALUE_ARRAY[13]);
                    if (!excps_array.includes(_VALUE_ARRAY[62]) && _CHECK_ARRAY[6] != '2') excps_array.push(_VALUE_ARRAY[62]);
                    if (!excps_array.includes(_VALUE_ARRAY[63]) && _CHECK_ARRAY[7] != '2') excps_array.push(_VALUE_ARRAY[63]);
                    if (!excps_array.includes(_VALUE_ARRAY[64]) && _CHECK_ARRAY[8] != '2') excps_array.push(_VALUE_ARRAY[64]);
                    if (!excps_array.includes(_VALUE_ARRAY[65]) && _CHECK_ARRAY[9] != '2') excps_array.push(_VALUE_ARRAY[65]);
                    if (!excps_array.includes(_VALUE_ARRAY[66]) && _CHECK_ARRAY[10] != '2') excps_array.push(_VALUE_ARRAY[66]);


                    if (excps_array.some(exp => exp != 'NO')) {
                        pdfSupport.table(doc,
                            [
                                { coord: [31, 0], w: 30, h: 1, text: 'EXCEPCIONES', config: { align: 'left', bold: true, fill: 'silver' } },
                            ],
                            [doc.x, doc.y], [61, 1], {});

                        excps_array.map(ae => {
                            if (ae != 'NO') pdfSupport.table(doc,
                                [
                                    { coord: [31, 0], w: 5, h: 1, text: excs[ae], config: { align: 'center', valign: true, } },
                                    { coord: [36, 0], w: 25, h: 1, text: ae, config: { align: 'center', valign: true, } },
                                ],
                                [doc.x, doc.y], [61, 1], { lineHeight: -1 })
                        });

                        doc.text('\n');
                    }


                    let arc_35p = record_arc_35_parkings;

                    let parkings = [];
                    let parkingHeaders = {
                        'P.P': false,
                        'Residentes': false,
                        'Motocicletas': false,
                        'Bicicletas': false,
                        'Visitantes': false,
                        'Carga': false,
                    };

                    arc_35p.map(value => {
                        let useCheck = value.use;
                        let use = value.pos;
                        let old = false;
                        parkings.map(valueP => { if (valueP.name == useCheck) old = true })
                        if (!old) {
                            let newp = { name: useCheck, privates: 0, visitors: 0, ppv: 0, motobike: 0, bike: 0, load: 0, uu: use }
                            if (value.type.includes('P.P')) {
                                newp.ppv = Number(value.project);
                                parkingHeaders['P.P'] = true;
                            }
                            if (value.type.includes('Residentes')) {
                                newp.privates = Number(value.project);
                                parkingHeaders['Residentes'] = true;
                            }
                            if (value.type.includes('Motocicletas')) {
                                newp.motobike = Number(value.project);
                                parkingHeaders['Motocicletas'] = true;
                            }
                            if (value.type.includes('Bicicletas')) {
                                newp.bike = Number(value.project);
                                parkingHeaders['Bicicletas'] = true;
                            }
                            if (value.type.includes('Visitantes')) {
                                newp.visitors = Number(value.project);
                                parkingHeaders['Visitantes'] = true;
                            }
                            if (value.type.includes('Carga')) {
                                newp.load = Number(value.project);
                                parkingHeaders['Carga'] = true;
                            }
                            parkings.push(newp)
                        }
                        else {
                            parkings.map(valueP => {
                                if (valueP.name == useCheck) {
                                    if (value.type.includes('P.P')) valueP.ppv += Number(value.project)
                                    if (value.type.includes('Residentes')) valueP.privates += Number(value.project)
                                    if (value.type.includes('Motocicletas')) valueP.motobike += Number(value.project)
                                    if (value.type.includes('Bicicletas')) valueP.bike += Number(value.project)
                                    if (value.type.includes('Visitantes')) valueP.visitors += Number(value.project)
                                    if (value.type.includes('Carga')) valueP.load += Number(value.project)
                                }
                            })
                        }
                    })

                    // PARKING
                    let totalesParking = { privates: 0, visitors: 0, ppv: 0, motobike: 0, bike: 0, load: 0 }

                    parkings.map(value => {
                        totalesParking.privates += value.privates
                        totalesParking.visitors += value.visitors
                        totalesParking.ppv += value.ppv
                        totalesParking.motobike += value.motobike
                        totalesParking.bike += value.bike
                        totalesParking.load += value.load
                    })
                    let showTable = totalesParking.visitors > 0 || totalesParking.ppv > 0 || totalesParking.load > 0 || totalesParking.motobike > 0 || totalesParking.bike > 0

                    let dinamicParkingHeaders = () => {
                        let headers = [];
                        //if(parkingHeaders['Residentes ']) headers.push('Res.');
                        if (parkingHeaders['Visitantes']) headers.push('Visit');
                        if (parkingHeaders['P.P']) headers.push('PVV');
                        if (parkingHeaders['Carga']) headers.push('Carga');
                        if (parkingHeaders['Motocicletas']) headers.push('Motoc');
                        if (parkingHeaders['Bicicletas']) headers.push('Bicic');
                        return headers;
                    }

                    let dinamicWidth = 20 / dinamicParkingHeaders().length;
                    let dinamicX = 20 / dinamicParkingHeaders().length;

                    if (showTable) {
                        pdfSupport.table(doc,
                            [
                                { coord: [31, 0], w: 30, h: 1, text: '3.4.4 Parqueaderos', config: { align: 'left', bold: true, fill: 'silver' } },

                                { coord: [31, 1], w: 7, h: 1, text: 'Uso', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                                { coord: [38, 1], w: 3, h: 1, text: 'U.U.', config: { align: 'center', bold: true, fill: 'gainsboro' } },

                                ...dinamicParkingHeaders().map((dh, i) => { return { coord: [41 + dinamicX * i, 1], w: dinamicWidth, h: 1, text: dh, config: { align: 'center', bold: true, fill: 'gainsboro' } } })

                                //{ coord: [45, 1], w: 4, h: 1, text: 'PVV', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                                //{ coord: [49, 1], w: 4, h: 1, text: 'Carga', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                                //{ coord: [53, 1], w: 4, h: 1, text: 'Motoc.', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                                //{ coord: [57, 1], w: 4, h: 1, text: 'Bicic.', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                            ],
                            [doc.x, doc.y], [61, 2], {})

                        parkings.map(parking => {
                            let hasValue = parking.visitors > 0 || parking.ppv > 0 || parking.load > 0 || parking.motobike > 0 || parking.bike > 0
                            if (hasValue) pdfSupport.table(doc,
                                [
                                    { coord: [31, 0], w: 7, h: 1, text: parking.name, config: { align: 'left', valing: true, } },
                                    { coord: [38, 0], w: 3, h: 1, text: parking.uu || '0', config: { align: 'center', valing: true, } },

                                    ...dinamicParkingHeaders().map((dh, i) => {
                                        if (dh == ('Visit')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.visitors || '', config: { align: 'center', valing: true, } }
                                        if (dh == ('PVV')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.ppv || '', config: { align: 'center', valing: true, } }
                                        if (dh == ('Carga')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.load || '', config: { align: 'center', valing: true, } }
                                        if (dh == ('Motoc')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.motobike || '', config: { align: 'center', valing: true, } }
                                        if (dh == ('Bicic')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.bike || '', config: { align: 'center', valing: true, } }
                                    }),
                                    //{ coord: [41, 0], w: 4, h: 1, text: parking.visitors || '', config: { align: 'center', valing: true, } },
                                    //{ coord: [45, 0], w: 4, h: 1, text: parking.ppv || '', config: { align: 'center', valing: true, } },
                                    //{ coord: [49, 0], w: 4, h: 1, text: parking.load || '', config: { align: 'center', valing: true, } },
                                    //{ coord: [53, 0], w: 4, h: 1, text: parking.motobike || '', config: { align: 'center', valing: true, } },
                                    //{ coord: [57, 0], w: 4, h: 1, text: parking.bike || '', config: { align: 'center', valing: true, } },
                                ],
                                [doc.x, doc.y], [61, 1], { lineHeight: -1 })
                        }
                        )

                        pdfSupport.table(doc,
                            [
                                { coord: [31, 0], w: 10, h: 1, text: 'TOTALES: ', config: { align: 'right', bold: true, } },
                                //{ coord: [41, 0], w: 4, h: 1, text: totalesParking.privates || '', config: { align: 'center', } },
                                ...dinamicParkingHeaders().map((dh, i) => {
                                    if (dh == ('Visit')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.visitors || '', config: { align: 'center', valing: true, } }
                                    if (dh == ('PVV')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.ppv || '', config: { align: 'center', valing: true, } }
                                    if (dh == ('Carga')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.load || '', config: { align: 'center', valing: true, } }
                                    if (dh == ('Motoc')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.motobike || '', config: { align: 'center', valing: true, } }
                                    if (dh == ('Bicic')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.bike || '', config: { align: 'center', valing: true, } }
                                }),
                                //{ coord: [41, 0], w: 4, h: 1, text: totalesParking.visitors || '', config: { align: 'center', } },
                                //{ coord: [45, 0], w: 4, h: 1, text: totalesParking.ppv || '', config: { align: 'center', } },
                                //{ coord: [49, 0], w: 4, h: 1, text: totalesParking.load || '', config: { align: 'center', } },
                                //{ coord: [53, 0], w: 4, h: 1, text: totalesParking.motobike || '', config: { align: 'center', } },
                                //{ coord: [57, 0], w: 4, h: 1, text: totalesParking.bike || '', config: { align: 'center', } },
                            ],
                            [doc.x, doc.y], [61, 1], { lineHeight: -1 })


                        doc.fontSize(7);
                        doc.text('\nNOTA: Los parqueaderos cuantificados son todos los requeridos por la norma', doc.page.width / 2 + 5, doc.y);
                        doc.text('\nNOTA: U.U. = Unidad de uso', doc.page.width / 2 + 5, doc.y);
                    }

                    let table_341 = {
                        "_VALUE_ARRAY": _VALUE_ARRAY,
                        "_CHECK_ARRAY": _CHECK_ARRAY,
                        "excs": excs,
                        "con_edif": con_edif,
                        "con_volumen": con_volumen,
                        "any_check": any_check,
                        "excps_array": excps_array.some(exp => exp != 'NO'),
                        "showTable_parking": showTable
                    }

                    _areas_table.table_3_4 = table_341;


                    doc.fontSize(docFontZise);

                    doc.text('\n', doc.page.margins.left, doc.y);

                    const end_y_2 = doc.y;
                    const end_page_2 = end_y_2 > end_y ? doc.bufferedPageRange().count - 2 : doc.bufferedPageRange().count - 1;

                    doc.switchToPage(end_page);
                    doc.y = end_y;
                    if (end_page_2 > end_page) {
                        doc.switchToPage(end_page_2);
                        doc.y = end_y_2;

                    }
                    else if (end_page_2 == end_page) {
                        if (end_y_2 > end_y) doc.y = end_y_2;
                        else doc.y = end_y
                    } else {
                        if (end_y_2 > end_y) doc.y = end_y_2;
                        else doc.y = end_y
                    }
                }
            }

            doc.startPage = doc.bufferedPageRange().count - 1;
            doc.lastPage = doc.bufferedPageRange().count - 1;
            //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

            doc.fontSize(9);

            TEXT_JUMP(_DATA.r_pages)

            doc.font('Helvetica-Bold')
            doc.text('ARTÍCULO 5°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_5);

            // _VALUE_ARRAY = _GET_STEP_TYPE('s430', 'value', 'eng');



            let bluePrints = [];
            /*
              _CHECK_ARRAY = _GET_STEP_TYPE('s430', 'check', 'eng');
            ra33b.map(value => bluePrints.push(`Plano ${value.category} (${value.use})`))
            _CHECK_ARRAY.map((value, i) => { if (value == 1 && LIST_BLUEPRINT_ENGT[i]) bluePrints.push(LIST_BLUEPRINT_ENGT[i].title) })

            doc.font('Helvetica-Bold')
            pdfSupport.text(doc, `${bluePrints.join(', ')}`);
            doc.font('Helvetica')
          

            */

            TEXT_JUMP(_DATA.r_pages)
            doc.text(_BODY_ART_5P, { align: 'justify' })
            TEXT_JUMP(_DATA.r_pages)

            doc.font('Helvetica-Bold')
            doc.text('ARTÍCULO 6°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_BODY_ART_6,);
            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            doc.text('1.      Profesionales responsables del proyecto');
            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica')

            LIST(_ARRAY_ART_6, { useLetters: true });

            doc.x = doc.page.margins.left;
            //pdfSupport.listText(doc, doc.y, _ARRAY_ART_6.join('\n'), { counters: true, draw: false, number: true, numberi: 11, numbers: true })
            doc.font('Helvetica-Bold')
            doc.text('2.      Del titular de la licencia');
            TEXT_JUMP(_DATA.r_pages)

            doc.text(`2.1. ${_BODY_DUTY}`);
            doc.font('Helvetica')
            TEXT_JUMP(_DATA.r_pages)
            let duty_cb = _DATA.reso.duty_cb;
            duty_cb = duty_cb ? duty_cb.split(',') : []
            let new_duty_array = [];
            duty_cb.map((value, i) => { if (value === 'true' && _DUTY_ARRAY[i]) new_duty_array.push(_DUTY_ARRAY[i]) })

            LIST(new_duty_array, { useLetters: true });

            doc.x = doc.page.margins.left;
            if (duty_cb[17] == 'true') doc.text(`${_BODY_DUTY_2}`, { align: 'justify' });
            if (duty_cb[17] == 'true') TEXT_JUMP(_DATA.r_pages)
            doc.text(`${_BODY_DUTY_3}`, { align: 'justify' });
            TEXT_JUMP(_DATA.r_pages)

            new_duty_array = [];
            if (duty_cb[18] == 'true') new_duty_array.push(_DUTY_ARRAY_2[0] || '');
            if (duty_cb[19] == 'true') new_duty_array.push(_DUTY_ARRAY_2[1] || '');

            LIST(new_duty_array, { root: '2', startAt: 2 });

            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            //doc.startPage = undefined;
            doc.text('ARTÍCULO 7°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(' Librar las siguientes notificaciones personales.');
            pdfSupport.listText(doc, doc.y, _ARRAY_ART_7.filter((arr, i) => septimo_cb[i] == 'true').join('\n'), { counters: true, draw: false, number: false, numberi: 1 })
            TEXT_JUMP(_DATA.r_pages)
            doc.text(`${_BODY_ART_7P}`, { align: 'justify' });

            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            doc.text('ARTÍCULO 8°. ', { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(`${_BODY_ART_8}`);
            TEXT_JUMP(_DATA.r_pages)
            if (arts_cb[2] == 'true') doc.text(`${_BODY_ART_8P1}`, { align: 'justify' });
            if (arts_cb[2] == 'true') TEXT_JUMP(_DATA.r_pages)
            if (arts_cb[3] == 'true') doc.text(`${_BODY_ART_8P2}`, { align: 'justify' });
            if (arts_cb[3] == 'true') TEXT_JUMP(_DATA.r_pages)

            let artsOffset = 0;
            if (arts_cb[4] == 'true') {
                doc.font('Helvetica-Bold')
                doc.text('ARTÍCULO 9°. ', { continued: true, align: 'justify' });
                doc.font('Helvetica')
                doc.text(`${_BODY_ART_9}`);
                TEXT_JUMP(_DATA.r_pages)
                artsOffset++
            }


            doc.font('Helvetica-Bold')
            doc.text(`ARTÍCULO ${9 + artsOffset}. `, { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(`${_BODY_ART_10}`);
            TEXT_JUMP(_DATA.r_pages)

            doc.font('Helvetica-Bold')
            doc.text(`ARTÍCULO ${10 + artsOffset}. `, { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(`La presente resolución rige a partir de su fecha de ejecutoria.`);
            TEXT_JUMP(_DATA.r_pages)
        }

        doc.font('Helvetica-Bold')
        if (isSub) {
            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            doc.text('VIGENCIA: ', { continued: true, align: 'left' });
            doc.font('Helvetica')
            doc.text("doce (12) meses a partir de su ejecutoria.");
            TEXT_JUMP(_DATA.r_pages)
        }
    }

    if (_DATA.reso.model == 'des') {
        doc.text(_BODY, { align: 'justify' });

        doc.fontSize(10);
        doc.font('Helvetica-Bold')
        doc.text('\nPARTE CONSIDERATIVA\n\n', { align: 'center' });
        doc.fontSize(9);
        TEXT_JUMP(_DATA.r_pages)
        doc.font('Helvetica-Bold')
        doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY_PRIMERO_a, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)
        CON_ORDER_i++;

        if (_DATA.reso.segundo_1) {
            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_DATA.reso.segundo_1, { align: 'justify' });
            TEXT_JUMP(_DATA.r_pages)
            CON_ORDER_i++;
        }

        if (_DATA.reso.segundo_2) {
            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_DATA.reso.segundo_2, { align: 'justify' });
            TEXT_JUMP(_DATA.r_pages)
            CON_ORDER_i++;
        }

        if (_DATA.reso.tercero_1) {
            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_DATA.reso.tercero_1, { align: 'justify' });
            TEXT_JUMP(_DATA.r_pages)
            CON_ORDER_i++;
        }


        if (_DATA.reso.cuarto_1) {
            TEXT_JUMP(_DATA.r_pages)
            doc.font('Helvetica-Bold')
            doc.text(CON_ORDER[CON_ORDER_i], { continued: true, align: 'justify' });
            doc.font('Helvetica')
            doc.text(_DATA.reso.cuarto_1, { align: 'justify' });
            TEXT_JUMP(_DATA.r_pages)
            CON_ORDER_i++;
        }

        doc.fontSize(10);
        doc.font('Helvetica-Bold')
        doc.text('\nPARTE RESOLUTIVA\n\n', { align: 'center' });
        doc.fontSize(9);

        doc.font('Helvetica')
        doc.text(`En mérito de lo expuesto en la parte considerativa,  ${curaduriaInfo.pronoum} ${curaduriaInfo.job} resuelve:`, { align: 'left' });
        TEXT_JUMP(_DATA.r_pages)
        doc.font('Helvetica-Bold')
        doc.text('ARTICULO N° 1. ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY_ART_1_a, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)

        doc.font('Helvetica-Bold')
        doc.text('ARTICULO N° 2. ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY_ART_2_a, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)
        doc.text(_BODY_ART_2_a_2, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)

        doc.font('Helvetica-Bold')
        doc.text('ARTICULO N° 3. ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY_ART_3_a, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)

        doc.font('Helvetica-Bold')
        doc.text('ARTICULO N° 4. ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY_ART_4_a, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)

        doc.font('Helvetica-Bold')
        doc.text('ARTICULO N° 5. ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY_ART_5_a, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)

        doc.font('Helvetica-Bold')
        doc.text('ARTICULO N° 6. ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_BODY_ART_6_a, { align: 'justify' });
        TEXT_JUMP(_DATA.r_pages)


        doc.font('Helvetica-Bold')

        let negative_user = _DATA.reso.negative_user || '';
        doc.font('Helvetica')
        if (negative_user) doc.text(`\nRevisado por: Abg. ${negative_user}`, { align: 'left' });

    }

    if (_DATA.reso.model == 'neg') {

    }

    if (_DATA.reso.model != 'open' && _DATA.reso.model != 'des' && _DATA.reso.model != 'neg') {
        let f1_mod = fun_1.m_lic ? fun_1.m_lic.split(',') : [];
        f1_mod = _FUN_5_PARSER(f1_mod, true);
        let f1_sub = fun_1.m_sub ? fun_1.m_sub.split(',') : [];
        f1_sub = _FUN_4_PARSER(f1_sub, true)

        let f1_vivienda = fun_1.vivienda ? fun_1.vivienda.split(',') : [];
        f1_vivienda = _FUN_8_PARSER(f1_vivienda, true);

        let f1_usos = fun_1.usos ? fun_1.usos.split(',') : []
        f1_usos = _FUN_6_PARSER(f1_usos, true);

        let DESTINE = `${f1_usos} ${f1_usos.includes('VIVIENDA') ? f1_vivienda : ''}`;

        let parcon = _DATA.reso.parcon ? _DATA.reso.parcon.split('&&') : [];

        let PART_TYPE = 'UNA LICENCIA DE CONSTRUCCION EN LA MODALIDAD DE OBRA NUEVA';
        if (_DATA.reso.model == 'rec') PART_TYPE = `UN ACTO DE RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACIÓN Y LICENCIA DE CONSTRUCCION EN LA MODALIDAD DE ${f1_mod}`;
        if (_DATA.reso.model == 'reccon') PART_TYPE = `UN ACTO DE RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACIÓN`;
        if (_DATA.reso.model == 'parcon') PART_TYPE = `UNA LICENCIA DE PARCELACIÓN Y CONSTRUCCION EN LA MODALIDAD DE OBRA NUEVA`;
        if (_DATA.reso.model == 'sub') PART_TYPE = `UNA LICENCIA DE SUBDIVISIÓN EN LA MODALIDAD ${f1_sub}`;
        PART_TYPE = _DATA.reso.tipo;


        const PAR = `${curaduriaInfo.pronoum} ${curaduriaInfo.job} ${(curaduriaInfo.master).toUpperCase()} en uso de sus facultades legales, 
        conferidas en las Ley 388 de 1997; Ley 400 de 1997; Ley 810 de 2003; Ley 1796 de 2016; el Decreto 1077 de 2015 y sus 
        Decretos modificatorios; el Decreto 926 de 2010 y sus decretos modificatorios; el Reglamento Colombiano de Construcción 
        Sismo Resistente —NSR-10 y el Acuerdo  Municipal  ${curaduriaInfo.pot.n} de ${curaduriaInfo.pot.yy} mediante el cual se 
        adoptó el ${curaduriaInfo.pot.pot} del municipio de ${_DATA.reso.ciudad}, declara ${_DATA.reso.reso_state}: 
        ${PART_TYPE}, decisión soportada en las siguientes.`.replace(/[\n\r]+ */g, ' ');

        let PART_ARTS = 'el artículo 2.2.6.1.2.1.7';
        if (_DATA.reso.model == 'rec') PART_ARTS = `los artículos 2.2.6.1.2.1.7 y 2.2.6.4.2.2`;
        if (_DATA.reso.model == 'reccon') PART_ARTS = `Los artículos 2.2.6.1.2.1.7; 2.2.6.4.1.1; 2.2.6.4.2.2`;
        if (_DATA.reso.model == 'parcon') PART_ARTS = `El artículo 2.2.6.1.2.1.7`;

        let CONSIDERATIONS_ARRAY_0 = `Que ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532} en su calidad de ${f53.item_533}, 
        en adelante simplemente APODERADO, presentó ante ${String(curaduriaInfo.pronoum).toLocaleLowerCase()} 
        suscrito/a ${curaduriaInfo.job}, una solicitud de ${PART_TYPE} para el predio con nomenclatura o dirección o 
        denominación ${f2.direccion} del Municipio de 
        ${_DATA.reso.ciudad}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos 
        Públicos de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}; de conformidad con lo dispuesto en ${PART_ARTS} del 
        Decreto 1077 de 2015, y la Resolución 1025 y 1026 del 2021 del Ministerio de Vivienda, Ciudad y Territorio de Colombia.`.replace(/[\n\r]+ */g, ' ');

        if (_DATA.reso.model == 'neg5' && _DATA.reso.model == 'neg1')`Que ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532} en su calidad de ${f53.item_533}, 
        presentó ante ${String(curaduriaInfo.pronoum).toLocaleLowerCase()} 
        suscrito/a ${curaduriaInfo.job}, una solicitud de ${PART_TYPE} para el predio con nomenclatura o dirección o 
        denominación ${f2.direccion} del Municipio de 
        ${_DATA.reso.ciudad}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos 
        Públicos de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}; de conformidad con lo dispuesto en ${PART_ARTS} del 
        Decreto 1077 de 2015, y la Resolución 1025 y 1026 del 2021 del Ministerio de Vivienda, Ciudad y Territorio de Colombia.`.replace(/[\n\r]+ */g, ' ');

        var CONSIDERATIONS_APY = `Que el titular de la solicitud de la presente actuación urbanística en cumplimiento de los artículos 2.2.6.6.8.1 y 2.2.6.6.8.2, canceló las siguientes obligaciones, previos a la expedición de este acto administrativo:`
        if (_DATA.reso.model == 'rec' || _DATA.reso.model == 'reccon') CONSIDERATIONS_APY = `Que el titular de la solicitud de la presente actuación urbanística en cumplimiento de los artículos 2.2.6.6.8.1; 2.2.6.6.8.2; 2.2.6.6.8.12; y 2.2.6.6.8.14 canceló las siguientes obligaciones, previos a la expedición de este acto administrativo:`
        if (_DATA.reso.model == 'neg5') CONSIDERATIONS_APY = "Que a la fecha no se ha expedido acto administrativo por el cual se conceda o niegue el mencionado proyecto, por lo tanto se encuentra proceden acceder a su desistimiento."

        var CONSIDERATIONS_ARRAY = [
            CONSIDERATIONS_ARRAY_0,
            `Que en cumplimiento de lo establecido en el artículo 2.2.6.1.2.2.1 del Decreto 1077 de 2015, se citó a los vecinos colindantes del predio objeto de la solicitud de licencia, para que se hagan parte y puedan hacer valer sus derechos, de los cuales ${_DATA.reso.old_lic}`.replace(/[\n\r]+ */g, ' '),
            `Que en cumplimiento de lo preceptuado en el parágrafo 1 del artículo 2.2.6.1.2.2.1 y el artículo 2.2.6.1.2.2.2  del Decreto 1077 de 2015, el solicitante de la licencia instaló una valla en un lugar visible en la cual se advirtió a terceros sobre la iniciación de trámite administrativo, allegando al expediente las fotografías de la misma dentro del término establecido.`.replace(/[\n\r]+ */g, ' '),
            `Que de conformidad con el artículo 2.2.6.1.2.2.3 del Decreto 1077 de 2015, el proyecto objeto de la solicitud fue revisado de acuerdo con la normatividad vigente.`.replace(/[\n\r]+ */g, ' '),
            `Que según lo indicado por el artículo 2.2.6.1.2.2.4, efectuada la revisión técnica, jurídica, estructural, urbanística y arquitectónica del proyecto, se levantó y notificó al solicitante un acta de observaciones y correcciones, las cuales fueron subsanadas dentro del tiempo estipulado.`.replace(/[\n\r]+ */g, ' '),
            CONSIDERATIONS_APY,
        ]
        var CONSIDERATIONS_ARRAY_2 = [];

        if (_DATA.reso.model == 'ons' && _DATA.reso.old_lic) CONSIDERATIONS_ARRAY.splice(4, 0, `Que a la solicitud de licencia le antecede una Licencia ${_DATA.reso.old_lic}`)

        if (_DATA.reso.model == 'rec' || _DATA.reso.model == 'rdm' || _DATA.reso.model == 'reccon') {
            CONSIDERATIONS_ARRAY.splice(3, 1, `Que de conformidad con el artículo 2.2.6.1.2.2.3 del Decreto 1077 de 2015, el proyecto objeto de la solicitud fue revisado de acuerdo con la normatividad vigente. Así mismo se verificó que el predio y/o el inmueble a reconocer no se encuentra incurso en ninguna de las situaciones que impiden el acto administrativo solicitado, las cuales se encuentran enumeradas en el artículo 2.2.6.4.1.2 del Decreto 1077 de 2015. Se constató que el inmueble objeto de la solicitud cumpliera con el uso del suelo y que sus desarrollos arquitectónicos hayan culminado como mínimo cinco (5) años antes de la entrada en vigencia de la Ley 1848 de 2017; estos requisitos de procedibilidad establecidos en el artículo 2.2.6.4.1.1 del Decreto 1077 de 2015 fueron corroborados para el primer elemento a través de la consulta de la norma urbana y del segundo a través de la declaración de antigüedad prestada por el titular de la solicitud, la cual se entiende cierta y emitida bajo la gravedad de juramento, en cumplimiento de lo dispuesto por el Decreto 1077 ibídem y en aplicación a la presunción de la buena fe del particular.`)
            //CONSIDERATIONS_ARRAY.splice(4, 0, `El urbanizador, el constructor, los arquitectos que firman los planos urbanísticos y arquitectónicos y los ingenieros que suscriban los planos técnicos y memorias son responsables de cualquier contravención  y violación a las normas urbanísticas. (Ley 388 de 1997. Artículo 99° numeral 5.)`)
        }
        if (_DATA.reso.model == 'parcon' || _DATA.reso.model == 'par') {
            CONSIDERATIONS_ARRAY[1] = parcon[0]
            CONSIDERATIONS_ARRAY.splice(5, 1);
            CONSIDERATIONS_ARRAY.push(parcon[1])
            CONSIDERATIONS_ARRAY.push(parcon[2])
            CONSIDERATIONS_ARRAY.push(parcon[3])
            CONSIDERATIONS_ARRAY.push(parcon[4])
            CONSIDERATIONS_ARRAY.push(parcon[5])
            CONSIDERATIONS_ARRAY.push(parcon[6])
            CONSIDERATIONS_ARRAY.push(parcon[7])
            CONSIDERATIONS_ARRAY.push(parcon[8])
            CONSIDERATIONS_ARRAY.push(`Que el artículo 44 de la Ley 160 de 1994 indica que “Salvo las excepciones que se señalan en el artículo siguiente, los predios rurales no podrán fraccionarse por debajo de la extensión determinada por el INCORA como Unidad Agrícola Familiar para el respectivo municipio o zona. En consecuencia, so pena de nulidad absoluta del acto o contrato, no podrá llevarse a cabo actuación o negocio alguno del cual resulte la división de un inmueble rural cuyas superficies sean inferiores a la señalada como Unidad Agrícola Familiar para el correspondiente municipio por el INCORA.”`)
        }
        if (_DATA.reso.model == 'sub') {
            CONSIDERATIONS_ARRAY.splice(4, 1)
            CONSIDERATIONS_ARRAY.splice(0, 2)
            CONSIDERATIONS_ARRAY.splice(3, 0, 'Que el artículo 44 de la Ley 160 de 1994 indica que “Salvo las excepciones que se señalan en el artículo siguiente, los predios rurales no podrán fraccionarse por debajo de la extensión determinada por el INCORA como Unidad Agrícola Familiar para el respectivo municipio o zona. En consecuencia, so pena de nulidad absoluta del acto o contrato, no podrá llevarse a cabo actuación o negocio alguno del cual resulte la división de un inmueble rural cuyas superficies sean inferiores a la señalada como Unidad Agrícola Familiar para el correspondiente municipio por el INCORA.”')
        }
        if (_DATA.reso.model == 'upvigon' || _DATA.reso.model == 'upvigam') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que el numeral 6 del artículo 2.2.2.1.5.4.4 del Decreto 1077 dispone que “las modificaciones de licencias urbanísticas vigente se resolverán con fundamento en las normas urbanísticas y demás reglamentaciones que sirvieron de base para su expedición, por lo tanto no podrán hacerse exigibles obligaciones distintas a las contempladas en dichas normas.”`,
                `Que según el Artículo 2.2.6.1.1.1 del Decreto 1077 de 2015 se entiende por modificación de la licencia, la introducción de cambios urbanísticos, arquitectónicos o estructurales a un proyecto con licencia vigente, siempre y cuando cumplan con las normas urbanísticas, arquitectónicas y estructurales y no se afecten espacios de propiedad pública. Las modificaciones de licencias vigentes se resolverán con fundamento en las normas urbanísticas y demás reglamentaciones que sirvieron de base para su expedición. En los eventos en que haya cambio de dicha normatividad y se pretenda modificar una licencia vigente, se deberá mantener el uso o usos aprobados en la licencia respectiva. `,
                `Que de conformidad con el con el artículo 2.2.6.1.2.2.3 del Decreto Nacional 1077 de 2015 el proyecto objeto de la solicitud fue revisado de acuerdo con la normatividad vigente.`,
                `Que a la solicitud de modificación de licencia vigente le anteceden los siguientes actos administrativos:`,
            ]
        }
        if (_DATA.reso.model == 'neg1') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que la anterior solicitud fue radicada de forma incompleta el ${_DATA.reso.old_lic} ante la insistencia de la persona responsable de la solicitud, a quien se le entregó constancia sobre los documentos y requisitos pendientes, y se le informó que debía completarlos dentro de los treinta (30) días hábiles siguientes so pena de entenderse desistida.`,
                `Que debido a que no se completaron todos los documentos y requisitos faltantes dentro del término legal, la solicitud se entiende desistida, de conformidad con el artículo 2.2.6.1.2.1.2 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio.`,
            ]
        }
        if (_DATA.reso.model == 'neg3') {
            const CONSIDERATIONS_ARRAY_0 = `Que ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532} en su calidad de ${f53.item_533}, 
            realizó solicitud de ${PART_TYPE}, para el predio con nomenclatura o dirección o denominación ${f2.direccion} del Municipio de ${_DATA.reso.ciudad}, 
            con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.reso.ciudad}, número catastral 
            ${f2.catastral}; de conformidad con lo dispuesto en el artículo 2.2.6.1.2.1.7 del Decreto 1077 de 2015, 
            la Resolución 0462 de 2017, modificada por la Resolución 1025 de 2021, y la Resolución 463 de 2017, modificada por la 
            Resolución 1026 de 2021, del Ministerio de Vivienda, Ciudad y Territorio. `.replace(/[\n\r]+ */g, ' ');

            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que a la anterior solicitud, se  le dio trámite previsto en la Ley 388 de 1997, el Decreto 1077 de 2015 y demás normas concordantes, habiéndose sometido al estudio técnico y jurídico pertinente.`,
                `Que dando cumplimiento al artículo 2.2.6.1.2.2.4 del Decreto 1077 de 2015, se expidió un ACTA DE OBSERVACIONES Y CORRECCIONES, informando y comunicando al solicitante sobre las actualizaciones, correcciones o aclaraciones que debía realizar al proyecto y los documentos adicionales que debía aportar para decidir sobre la solicitud; no obstante, ante el vencimiento del término máximo con el que contaba el solicitante para dar respuesta al acta de observaciones, no se evidencia la presentación de la misma o que haya dado cumplimiento a los requerimientos exigidos, motivo por el cual la solicitud se entiende desistida.`,
            ]
        }
        if (_DATA.reso.model == 'neg4') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que a la anterior solicitud, se  le dio trámite previsto en la Ley 388 de 1997, la Ley 810 de 2003, la Ley 1796 de 2016, el Decreto 1077 de 2015 y demás normas concordantes, habiéndose sometido al estudio técnico y jurídico pertinente.`,
                `Que han transcurrido más de treinta (30) días hábiles desde la comunicación del acto de viabilidad y no se evidencia radicación de los recibos de pago de impuestos, gravámenes, tasas, participaciones y contribuciones asociadas a la expedición de licencias y/o pago de expensa de acuerdo con el artículo 2.2.6.6.8.2 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio y lo establecido en el Acuerdo Municipal 028 de 2003 mediante el cual se adoptó el PBOT del municipio de Piedecuesta. Así las cosas, de conformidad con el artículo 2.2.6.1.2.3.1 del mencionado Decreto 1077 de 2015, esta solicitud se entiende desistida. `,
            ]
        }
        if (_DATA.reso.model == 'neg5') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que a la anterior solicitud, se  le dio trámite previsto en la Ley 388 de 1997, el Decreto 1077 de 2015 y demás normas concordantes, habiéndose sometido al estudio técnico y jurídico pertinente.`,
                `Que el solicitante allega petición radicada bajo el radicado ${_DATA.reso.old_lic}, por medio de la cual manifiesta su intención de desistir de la solicitud de Resolución de ${_DATA.reso.reso_id}.`,
                `Que de conformidad con el artículo 2.2.6.1.2.3.4  del Decreto 1077 de 2015, el solicitante de una licencia urbanística cualquiera que sea su modalidad podrá desistir de la misma mientras no se haya expedido el acto administrativo mediante el cual se concede la licencia o se niegue la solicitud presentada.`,
                `Que a la fecha no se ha expedido acto administrativo por el cual se conceda o niegue la licencia objeto de estudio en el presente proyecto, cuyo desistimiento se ha solicitado por el titular de la misma, a través de su apoderada.`,
            ]
        }
        if (_DATA.reso.model == 'pro') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que la anterior licencia cuenta con ampliación de vigencia por un término de nueve (9) meses en virtud del parágrafo transitorio del artículo 2.2.6.1.2.4.1 del Decreto 1077 de 2015.`,
                `Que a la solicitud de prórroga también le anteceden los siguientes actos administrativos:`,
            ];
            CONSIDERATIONS_ARRAY_2 = [
                `Que la solicitud de prórroga ha sido presentada de conformidad con los requisitos exigidos por los artículos 2.2.6.1.2.4.3 y 2.2.6.1.2.1.7 del Decreto No. 1077 de 2015, y las Resoluciones N° 1025 y 1026 de 2021.`,
                `Que de acuerdo a lo establecido en el artículo 2.2.6.1.2.4.3 del Decreto 1077 de 2015, la solicitud de prórroga deberá formularse dentro de los treinta (30) días calendario, anteriores al vencimiento de la respectiva licencia, siempre que el urbanizador o constructor responsable certifique la iniciación de la obra; y deberá resolverse dentro del término de la vigencia de la licencia según el Parágrafo 4 del artículo 2.2.6.1.2.3.1 ibídem.`,
                `Que si al vencimiento de esta prórroga no ha finalizado la obra, deberá solicitarse una nueva licencia, ante la misma autoridad que la expidió, ajustándose a las normas urbanísticas vigentes al momento de la nueva solicitud. Sin embargo, el interesado podrá solicitar, por una sola vez, la revalidación de la licencia vencida, concediéndose una nueva licencia, con el fin de que se culminen las obras y actuaciones aprobadas en la licencia vencida, siempre y cuando el proyecto mantenga las condiciones originales con que fue aprobado inicialmente, que no haya transcurrido un término mayor de dos meses desde el vencimiento de la licencia que se pretende revalidar y que el constructor o el urbanizador manifieste bajo la gravedad de juramento, que el inmueble se encuentra en cualquiera de las situaciones consideradas en el artículo 2.2.6.1.2.4.3 del Decreto 1077 del 2015.`,
            ]
        }
        if (_DATA.reso.model == 'licup') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que a la Solicitud de la Revalidación le anteceden los siguientes Actos Administrativos: `,
            ];
            CONSIDERATIONS_ARRAY_2 = [
                `Que la solicitud de Revalidación a que se refiere el numeral anterior ha sido presentada de conformidad con los requisitos exigidos por los artículos 2.2.6.1.2.1.7  y 2.2.6.1.2.4.3 del Decreto No. 1077 de 2015.`,
                `Que de acuerdo a lo establecido en el artículo 2.2.6.1.1.1 del Decreto 1077 de 2015, las licencias urbanísticas y sus modalidades podrán ser objeto de prórrogas, revalidaciones y modificaciones.`,
                `Que de acuerdo a lo establecido en el artículo 2.2.6.1.2.4.3 del Decreto 1077 de 2015, cuando una licencia pierda su vigencia por vencimiento del plazo o de sus prórrogas, el interesado podrá solicitar ante la misma Curaduría Urbana o Autoridad que la expidió y por una sola vez, la revalidación de la licencia vencida, siempre y cuando no haya transcurrido un término mayor a dos (2) meses desde el vencimiento de la licencia que se pretende revalidar. Aunado a lo anterior, el Constructor o el Urbanizador debe presentar el cuadro de áreas en el que se identifique lo ejecutado durante la licencia vencida así cómo lo que se ejecutará durante la revalidación, y manifestar bajo la gravedad del juramento que el inmueble se encuentra en cualquiera de las siguientes situaciones:`,
            ]
        }
        if (_DATA.reso.model == 'clear') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que a la anterior solicitud, se  le dio trámite previsto en la Ley 388 de 1997, el Decreto 1077 de 2015 y demás normas concordantes, habiéndose sometido al estudio técnico y jurídico pertinente.`,
                parcon[0],
                parcon[1],
                `Que respecto a los errores simplemente formales el artículo 45 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo establece que: “En cualquier tiempo, de oficio o a petición de parte, se podrán corregir los errores simplemente formales contenidos en los actos administrativos, ya sean aritméticos, de digitación, de transcripción o de omisión de palabras. En ningún caso la corrección dará lugar a cambios en el sentido material de la decisión, ni revivirá los términos legales para demandar el acto (…)”.`,
                `Que de acuerdo al precedente jurisprudencial de la Corte Constitucional “El error aritmético se refiere a aquellas equivocaciones derivadas de una operación matemática que no altere los fundamentos ni las pruebas que sirvieron de base para adoptar la decisión.”`,
                `Que a la luz de la doctrina especializada, “los errores que dan lugar a esta corrección son los que se presentan en la parte resolutiva del acto, (…) y  se hará en otro acto administrativo, que se integra al que es objeto de corrección. Sus efectos en el tiempo son retroactivos.`,
                `Que la aclaración prevista en el presente acto administrativo cumple con los presupuestos, pues revisado el mencionado acto administrativo expedido por esta Curaduría Urbana, se observa un error simplemente formal que no afecta el contenido sustancial del acto a corregir. `,
            ];
        }
        if (_DATA.reso.model == 'rev') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que dentro de la solicitud ${PART_TYPE}, se aportaron todos los requisitos de acuerdo a lo establecido en el Decreto Nacional 1077 de 2015, para su expedición, en especial lo que corresponde a la Declaración de Antigüedad, presentada bajo la gravedad de juramento.`,
                `Que una vez revisada la solicitud y verificado el cumplimiento de todos los requisitos se procedió a expedir la Resolución ${_DATA.reso.reso_id} del ${dateParser(_DATA.reso.reso_date)}, por medio de la cual se concedió un ${PART_TYPE} para destinación ${DESTINE}, del  predio localizado en  ${f2.direccion} del Municipio de ${_DATA.reso.ciudad}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}, otorgado a ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532}, en su calidad de ${f53.item_533}.`,
                parcon[0],
            ];
        }
        if (_DATA.reso.model == 'rev0' || _DATA.reso.model == 'rev2') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que a la anterior solicitud, se  le dio trámite previsto en la Ley 388 de 1997, el Decreto 1077 de 2015 y demás normas concordantes, habiéndose sometido al estudio técnico y jurídico pertinente; aportando además lo que corresponde a la Declaración de Antigüedad, presentada bajo la gravedad de juramento.`,
                parcon[0],
                `Que la edificación reconocida en la resolución consta de: `,
            ];
        }
        if (_DATA.reso.model == 'update') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que a la anterior solicitud, se  le dio trámite previsto en la Ley 388 de 1997, el Decreto 1077 de 2015 y demás normas concordantes, habiéndose sometido al estudio técnico y jurídico pertinente.`,
                parcon[0],
                parcon[1],
                parcon[2],
                parcon[3],
                `Que el artículo 2.2.6.1.2.3.3 del Decreto 1077 de 2015 señala los efectos de las licencias urbanísticas, conforme a lo siguiente:`
            ];
        }
        if (_DATA.reso.model == 'cota') {
            CONSIDERATIONS_ARRAY = [
                CONSIDERATIONS_ARRAY_0,
                `Que de conformidad con el artículo 2.2.6.1.3.1 del Decreto 1077 de 2015 el ajuste de cotas de áreas es la autorización para incorporar en los planos urbanísticos previamente aprobados por el curador urbano o la autoridad municipal o distrital competente para expedir licencias, la corrección técnica de cotas y áreas de un predio o predios determinados cuya urbanización haya sido ejecutada en su totalidad.`,
                `Que el proyecto objeto de la solicitud fue revisado técnica y jurídicamente de acuerdo con la normatividad vigente.`,
                `Que a esta Resolución le anteceden los siguientes actos adminsitrativos:`
            ];
        }


        const CONSIDERATIONS_ARRAY_3 = [
            'En el caso de licencias de urbanización o parcelación, que las obras de la urbanización o parcelación se encuentran ejecutadas en por lo menos un cincuenta (50%) por ciento.',
            'En el caso de las licencias de construcción por unidades independientes estructuralmente, que por lo menos la mitad de las unidades construibles autorizadas, cuentan cómo mínimo con el cincuenta (50%) por ciento de la estructura portante o el elemento que haga sus veces.',
            'En el caso de las licencias de construcción de una edificación independiente estructuralmente, que se haya construido por lo menos el cincuenta por ciento (50%) de la estructura portante o el elemento que haga sus veces.',
            'Para las licencias de intervención y ocupación del espacio público, sólo se exige la presentación de la solicitud dentro del término señalado en el presente artículo.',
            'Cuando en un mismo acto se conceda licencia de urbanización en las modalidades de desarrollo o reurbanización, licencia de parcelación y licencia de construcción en modalidad distinta a la de cerramiento se deben cumplir las condiciones establecidas en el numeral 1, y según el sistema estructural con el que cuente el proyecto lo dispuesto en los numerales 2 o 3.',
        ];
        const CONSIDERATIONS_ARRAY_4 = [
            parcon[1],
            parcon[2],
            `Que sobre la revocatoria directa se tienen los siguientes fundamentos de derecho,`,
        ];
        const CONSIDERATIONS_ARRAY_5 = [
            parcon[3],
            parcon[4],
            parcon[5],
            `Que por no existir consentimiento previo, expreso y escrito de los titulares, el acto administrativo objeto de trámite de revocatoria directa, no podrá ser revocado, de conformidad con el artículo 97 de la Ley 1437 de 2011- CPACA y de considerarlo procedente en los términos del artículo 93 de la ley ibídem, la suscrita curadora urbana iniciará la demanda ante la jurisdicción de lo contencioso administrativo.`,
        ];
        const CONSIDERATIONS_ARRAY_6 = [
            parcon[2],
            parcon[3],
            parcon[4],
        ];

        const CONSIDERATIONS_ARRAY_i_1 = 'Que las revalidaciones se resolverán con fundamento en las normas urbanísticas y demás reglamentaciones que sirvieron de base para la expedición de la licencia objeto de la revalidación, tendrán el mismo término de su vigencia y podrán prorrogarse por una sola vez por el término de doce (12) meses.';

        const CONSIDERATIONS_PARCON_15 = `Así mismo el artículo 45 ibídem, exceptúa lo dispuesto en el artículo anterior, así:`.replace(/[\n\r]+ */g, ' ');
        const CONSIDERATIONS_PARCON_15_ARRAY = [
            `Las donaciones que el propietario de un predio de mayor extensión haga con destino a habitaciones campesinas y pequeñas explotaciones anexas;`.replace(/[\n\r]+ */g, ' '),
            `os actos o contratos por virtud de los cuales se constituyen propiedades de superficie menor a la señalada para un fin principal distinto a la explotación agrícola;`.replace(/[\n\r]+ */g, ' '),
            `Los que constituyan propiedades que por sus condiciones especiales sea el caso de considerar, a pesar de su reducida extensión, como "Unidades Agrícolas Familiares", conforme a la definición contenida en esta Ley;`.replace(/[\n\r]+ */g, ' '),
            `Las sentencias que declaren la prescripción adquisitiva de dominio por virtud de una posesión iniciada antes del 29 de diciembre de 1961, y las que reconozcan otro derecho igualmente nacido con anterioridad a dicha fecha`.replace(/[\n\r]+ */g, ' '),
        ]
        const CONSIDERATIONS_PARCON_15_2 = `La existencia de cualquiera de las circunstancias constitutivas de excepción conforme a este artículo no podrá ser impugnada en relación con un contrato si en la respectiva escritura pública se dejó constancias de ellas, siempre que:`;
        const CONSIDERATIONS_PARCON_15_2_ARRAY = [
            `En el caso del literal b) se haya dado efectivamente al terreno en cuestión el destino que el contrato señala.`,
            `En el caso del literal c), se haya efectuado la aclaración en la escritura respectiva, según el proyecto general de fraccionamiento en el cual se hubiere originado.`
        ]
        var CONSIDERATIONS_SUB_6 = ''
        if (_DATA.reso.model == 'sub') {
            let sub = _DATA.reso.sub ? _DATA.reso.sub.split('&&') : [];
            CONSIDERATIONS_SUB_6 = sub[0]
        }


        const CONSIDERATIONS_APY_ARRAY = [
            `Expensas fijas y variables mediante las facturas ${sexto_v[0]} y ${sexto_v[1]}.`.replace(/[\n\r]+ */g, ' '),
            `Impuesto de delineación y urbanismo por la suma de $${sexto_v[2]} según recibo N°  ${sexto_v[3]}.`.replace(/[\n\r]+ */g, ' '),
            `Estampilla PRO-UIS por la suma de  $${sexto_v[4]}  según recibo N° ${sexto_v[5]}.`.replace(/[\n\r]+ */g, ' '),
        ]
        if (_DATA.reso.model == 'reccon' || _DATA.reso.model == 'upvigon' || _DATA.reso.model == 'cota') {
            CONSIDERATIONS_APY_ARRAY.splice(1, 1);
            CONSIDERATIONS_APY_ARRAY.splice(1, 1);
        }
        if (_DATA.reso.model == 'sub') {
            CONSIDERATIONS_APY_ARRAY.splice(0, 3);
            CONSIDERATIONS_APY_ARRAY.push(`Expensas fijas mediante las facturas ${sexto_v[0]}.`.replace(/[\n\r]+ */g, ' '),)
        }

        let ARTICLE_1 = `Concede ${PART_TYPE}, para destinación ${DESTINE}, para el predio identificado así:`.replace(/[\n\r]+ */g, ' ');
        const ARTICLE_1_P = `La expedición de la licencia de construcción conlleva la autorización para el cerramiento temporal del predio durante la ejecución de las obras autorizadas. `
        if (_DATA.reso.model == 'neg1' || _DATA.reso.model == 'neg2' || _DATA.reso.model == 'neg3' || _DATA.reso.model == 'neg4' || _DATA.reso.model == 'neg5') ARTICLE_1 = `Declarar desistida la solicitud de ${_DATA.reso.tipo}, de acuerdo con los anteriores considerandos, para el predio idenetificado asi:`

        const ARTICLE_1_P_2 = parcon[0];
        const ARTICLE_1_P_3 = `El proyecto debe mantener las condiciones originales con que fue aprobado inicialmente, incluyendo las modificaciones de licencia si fuese el caso. La Revalidación no implica ninguna modificación a las condiciones técnicas y operativas definidas en la respectiva licencia.`
        const ARTICLE_1_P_4 = `La revalidación podrá ser objeto de modificaciones las cuales deberán contar con la aprobación previa de la Curaduría Urbana N° 1 de Piedecuesta; dado el caso que la modificación de la revalidación incluya el cambio o inclusión de nuevos usos, se deberá adelantar trámite de citación a vecinos colindantes.`

        let ARTICLE_2 = `Reconocer como titular(es) de ${PART_TYPE}, de conformidad con el artículo 2.2.6.1.2.1.5 del Decreto 1077 del 2015, a la(s) siguiente(s) persona(s):`.replace(/[\n\r]+ */g, ' ')
        if (_DATA.reso.model == 'rec' || _DATA.reso.model == 'reccon' || _DATA.reso.model == 'update') ARTICLE_2 = `Reconocer como titular(es) de ${PART_TYPE}, de conformidad con el artículo 2.2.6.1.2.1.5 y 2.2.6.4.2.1 del Decreto 1077 del 2015, a la(s) siguiente(s) persona(s):`.replace(/[\n\r]+ */g, ' ')
        if (_DATA.reso.model == 'neg1' || _DATA.reso.model == 'neg3' || _DATA.reso.model == 'neg4' || _DATA.reso.model == 'neg5') ARTICLE_2 = `Notificar a la solicitante el contenido de la presente resolución en los términos previstos en el artículo 2.2.6.1.2.3.7 del Decreto 1077 de 2015 en concordancia con el Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`.replace(/[\n\r]+ */g, ' ')

        let ARTICLE_2_p = `De acuerdo con el Artículo 2.2.6.1.2.3.3 del Decreto 1077 de 2015 la expedición de licencias no conlleva pronunciamiento alguno acerca de la titularidad de derechos reales ni de la posesión sobre el inmueble o inmuebles objeto de ella. Las licencias recaen sobre uno o más predios y/o inmuebles y producen todos sus efectos aun cuando sean enajenados. En el caso que el predio objeto de la licencia sea enajenado, no se requerirá adelantar ningún trámite de actualización del titular. `.replace(/[\n\r]+ */g, ' ')
        if (_DATA.reso.model == 'rec' || _DATA.reso.model == 'reccon' || _DATA.reso.model == 'rdm') ARTICLE_2_p = `En ningún caso el reconocimiento de la existencia de una edificación constituirá título o modo de tradición de la propiedad (parágrafo 4, artículo 2.2.6.4.2.5, Decreto 1077 de 2015).`.replace(/[\n\r]+ */g, ' ')
        let ARTICLE_2_p2 = `El proyecto debe mantener las condiciones originales con que fue aprobado inicialmente, incluyendo las modificaciones de licencia si fuese el caso.`;

        var ARTICLE_3 = `Reconocer a los profesionales responsables del proyecto, de los estudios y de los documentos técnicos presentados; quienes firman en el formulario único para la solicitud de licencias urbanísticas, los cuales, con ella declaran que conocen las disposiciones vigentes que rigen la materia y las sanciones establecidas: `.replace(/[\n\r]+ */g, ' ')
        ARTICLE_3 = `Reconocer a los profesionales responsables del proyecto, de los estudios y de los documentos técnicos presentados, quienes al firmar el formulario único para la solicitud de licencias urbanísticas, han declarado bajo la gravedad del juramento que se responsabilizan totalmente por los estudios y documentos presentados al igual que por la veracidad de los datos consignados. Así mismo, declaran que conocen las disposiciones vigentes que rigen la materia y las sanciones establecidas:`.replace(/[\n\r]+ */g, ' ')
        if (_DATA.reso.model == 'pro' || _DATA.reso.model == 'licup') ARTICLE_3 = `Reconocer al profesional responsable de la certificación del inicio de obra, así: `.replace(/[\n\r]+ */g, ' ')
        var ARTICLE_3_p = `El titular de la licencia y/o de la autorización será responsable de todas las obligaciones urbanísticas y arquitectónicas adquiridas con ocasión de su expedición y extracontractualmente por los perjuicios que se causaren a terceros en desarrollo de la misma.`.replace(/[\n\r]+ */g, ' ')

        const ARTICLE_4 = `Autorizar las obras de edificación e intervenciones urbanísticas que posee las características básicas que a continuación se describen: `.replace(/[\n\r]+ */g, ' ')
        let ARTICLE_4_p1 = `En todo caso el proyecto deberá cumplir con las normas del Plan Básico de Ordenamiento Territorial de ${_DATA.reso.ciudad} y demás normas urbanísticas de construcción, arquitectónicas y de sismo resistencia, vigentes. `.replace(/[\n\r]+ */g, ' ')
        if (_DATA.reso.model == 'ons') ARTICLE_4_p1 = `Se somete a Supervisión Técnica Independiente la ejecución de la edificación dado que en la revisión independiente de diseños estructurales se realizó el requerimiento; en tal medida, deberá realizarse en los términos que señalan las normas de construcción sismo resistentes, especialmente el Título I del Reglamento Colombiano de Construcción Sismorresistente (NSR) 10. Así mismo, antes de efectuarse la ocupación y/o transferencia de las nuevas edificaciones, tiene la obligación de obtener el Certificado Técnico de Ocupación emitido por el Supervisor Técnico Independiente siguiendo lo previsto en el Título I del Reglamento Colombiano de Construcción Sismo Resistente NSR-10, el cual deberá ser protocolizado y registrado en los términos y condiciones establecidos en el artículo 6° de la Ley 1796 de 2016, so pena de las sanciones de ley. No se requiere su protocolización en el reglamento de propiedad horizontal.`.replace(/[\n\r]+ */g, ' ')
        const ARTICLE_4_p2 = `Las ampliaciones y/o modificaciones que se presentaren durante el proceso constructivo del proyecto aprobado con esta Resolución, deberán contar con la aprobación previa de ${curaduriaInfo.pronoum} ${curaduriaInfo.job}`.replace(/[\n\r]+ */g, ' ')
        const ARTICLE_4_p3 = `En todo caso el proyecto deberá cumplir con las normas del Plan Básico de Ordenamiento Territorial de ${_DATA.reso.city}.`.replace(/[\n\r]+ */g, ' ')

        const ARTICLE_5 = `Reconocer como parte integral de este acto administrativo los documentos legales y técnicos presentados por los titulares de la solicitud urbanística y los profesionales reconocidos en los artículo N° 2 y 3, quienes son responsables por su contenido; también hacen parte de este acto los documentos expedidos por ${curaduriaInfo.pronoum} ${curaduriaInfo.job}.`.replace(/[\n\r]+ */g, ' ')
        const ARTICLE_5_PARCON = `La incorporación de áreas públicas se realizará siguiendo el procedimiento del artículo 2.2.6.1.4.6 del Decreto 1077 de 2015.`
        const ARTICLE_6 = `Obligaciones del titular de la licencia, en cumplimiento del Decreto 1077 de 2015 artículo 2.2.6.1.2.3.6:`.replace(/[\n\r]+ */g, ' ')
        const ARTICLE_6_ARRAY = [
            `Ejecutar las obras de forma tal que se garantice la salubridad y seguridad de las personas, así como la estabilidad de los terrenos y edificaciones vecinas y de los elementos constitutivos del espacio público.`.replace(/[\n\r]+ */g, ' '),
            `Mantener en la obra la licencia y los planos aprobados, y exhibirlos cuando sean requeridos por la autoridad competente.`.replace(/[\n\r]+ */g, ' '),
            `Cumplir con el programa de manejo ambiental de materiales y elementos a los que hace referencia la Resolución número 541 de 1994 del Ministerio del Medio Ambiente, o el acto que la modifique o sustituya, para aquellos proyectos que no requieren licencia ambiental, o planes de manejo, recuperación o restauración ambiental, de conformidad con el decreto único del sector ambiente y desarrollo sostenible en materia de licenciamiento ambiental.`.replace(/[\n\r]+ */g, ' '),
            `Autorización de Ocupación de Inmuebles: Deberá solicitarse al concluir las obras de edificación en los términos que establece el Artículo 2.2.6.1.4.1 del Decreto 1077 de 2015 (numeral 5 del artículo 2.2.6.1.2.3.6 del Decreto 1077 de 2015.).`.replace(/[\n\r]+ */g, ' '),
            `Garantizar durante el desarrollo de la obra la participación del diseñador estructural del proyecto y del ingeniero geotecnista responsables de los planos y estudios aprobados, con el fin de que atiendan las consultas y aclaraciones que solicite el constructor y/o supervisor técnico independiente. Las consultas y aclaraciones deberán incorporarse en la bitácora del proyecto y/o en las actas de supervisión.`.replace(/[\n\r]+ */g, ' '),
            `Designar en un término máximo de 15 días hábiles al profesional que reemplazará a aquel que se desvinculó de la ejecución de los diseños o de la ejecución de la obra. Hasta tanto se designe el nuevo profesional, el que asumirá la obligación del profesional saliente será el titular de la licencia.`.replace(/[\n\r]+ */g, ' '),
            `Realizar los controles de calidad para los diferentes materiales y elementos que señalen las normas de construcción sismorresistentes.`.replace(/[\n\r]+ */g, ' '),
            `Instalar los equipos, sistemas e implementos de bajo consumo de agua, establecidos en la Ley 373 de 1997 o la norma que la adicione, modifique o sustituya.`.replace(/[\n\r]+ */g, ' '),
            `Cumplir con las normas vigentes de carácter nacional, municipal o distrital sobre eliminación de barreras arquitectónicas para personas en situación de discapacidad Decreto Nacional 1538 de 2005.`.replace(/[\n\r]+ */g, ' '),
            `Cumplir con las disposiciones contenidas en las normas de construcción sismo-resistente vigente.`.replace(/[\n\r]+ */g, ' '),
            `Dar cumplimiento a las disposiciones sobre construcción sostenible que adopte el Ministerio de Vivienda, Ciudad y Territorio o los municipios o distritos en ejercicio de sus competencias.`.replace(/[\n\r]+ */g, ' '),
            `Realizar la publicación establecida en el artículo 2.2.6.1.2.3.8 del presente decreto en un diario de amplia circulación en el municipio o distrito donde se encuentren ubicados los inmuebles, cuando, a juicio del curador urbano o la autoridad municipal o distrital competente, la expedición del acto administrativo que resuelva la solicitud de licencia afecte en forma directa e inmediata a terceros que no hayan intervenido en la actuación.`.replace(/[\n\r]+ */g, ' '),
        ]
        if (_DATA.reso.model == 'ons') {
            ARTICLE_6_ARRAY.splice(3, 1);
            ARTICLE_6_ARRAY.splice(5, 0, 'Remitir copia de las actas de la supervisión técnica independiente que se expidan durante el desarrollo de la obra, así como el certificado técnico de ocupación, a las autoridades competentes para ejercer el control urbano en el municipio o distrito quienes remitirán copia a la entidad encargada de conservar el expediente del proyecto, y serán de público conocimiento. En los casos de patrimonios autónomos en los que el fideicomiso ostente la titularidad del predio y/o de la licencia de construcción, se deberá prever en el correspondiente contrato fiduciario quien es el responsable de esta obligación.');
            ARTICLE_6_ARRAY.splice(6, 0, 'Obtener el Certificado de Ocupación antes de efectuarse la transferencia de los bienes inmuebles resultantes y/o su ocupación.');
        }
        if (_DATA.reso.model == 'parcon') {
            ARTICLE_6_ARRAY.splice(1, 0, 'Cuando se trate de licencias de urbanización, ejecutar las obras de urbanización con sujeción a los proyectos técnicos aprobados y entregar y dotar las áreas públicas objeto de cesión gratuita con destino a vías locales, equipamientos colectivos y espacio público, de acuerdo con las especificaciones que la autoridad competente expida. ')
            ARTICLE_6_ARRAY.push('Solicitar en los términos establecidos en el artículo 2.2.6.1.4.7 del presente decreto la diligencia de inspección para la entrega material de las áreas de cesión. ')
        }
        if (_DATA.reso.model == 'par') {
            ARTICLE_6_ARRAY.splice(1, 0, 'Cuando se trate de licencias de urbanización, ejecutar las obras de urbanización con sujeción a los proyectos técnicos aprobados y entregar y dotar las áreas públicas objeto de cesión gratuita con destino a vías locales, equipamientos colectivos y espacio público, de acuerdo con las especificaciones que la autoridad competente expida. ')
            ARTICLE_6_ARRAY.splice(7, 5)
            ARTICLE_6_ARRAY.splice(4, 2)
            ARTICLE_6_ARRAY.push('Solicitar en los términos establecidos en el artículo 2.2.6.1.4.7 del presente decreto la diligencia de inspección para la entrega material de las áreas de cesión. ')
        }
        if (_DATA.reso.model == 'upvigon' || _DATA.reso.model == 'upvigam') {
            ARTICLE_6_ARRAY.splice(1, 0, 'Cuando se trate de licencias de urbanización, ejecutar las obras de urbanización con sujeción a los proyectos técnicos aprobados y entregar y dotar las áreas públicas objeto de cesión gratuita con destino a vías locales, equipamientos colectivos y espacio público, de acuerdo con las especificaciones que la autoridad competente expida. ')
        }
        if (_DATA.reso.model == 'rdm') ARTICLE_6_ARRAY.pop();

        const ARTICLE_5_ARRAY_SUB = [
            'La licencia de subdivisión no autoriza la ejecución de obras de infraestructura o  de construcción, ni la delimitación de espacios públicos y privados.',
            'Las subdivisiones en suelo urbano, se sujetarán al cumplimiento de las dimensiones de áreas y frentes mínimos establecidos en los actos administrativos correspondientes. Los predios resultantes de la subdivisión y/o reloteo deberán contar con frente sobre vía pública vehicular o peatonal y no podrán accederse por zonas verdes y/o comunales.',
            'La incorporación a la cartografía oficial de tales subdivisiones no implica autorización alguna para urbanizar, parcelar o construir sobre los lotes resultantes, para cuyo efecto, el interesado, en todos los casos, deberá adelantar el trámite de solicitud de licencia de parcelación, urbanización o construcción ante el curador urbano o la autoridad municipal o distrital competente para el estudio, trámite y expedición de las licencias urbanísticas, en los términos de que trata el Decreto 1077 de 2015 y demás normas concordantes.',
            'La demarcación de los linderos debe efectuarse dentro de los límites del predio sobre el cual actúa la presente licencia.'
        ]

        var ARTICLE_7_ARRAY = [
            `Concertar con la Oficina Asesora de planeación de ${_DATA.reso.city} el acabado y entrega del espacio público efectivo. `.replace(/[\n\r]+ */g, ' '),
            `Dar cumplimiento al Artículo 2.2.3.4.2.2 del Decreto 1077 de 2015 respecto a la accesibilidad a edificaciones para vivienda.`.replace(/[\n\r]+ */g, ' '),
            `Serán de obligatoria aplicación, en lo pertinente a la accesibilidad a edificaciones para vivienda, las Normas Técnicas Colombianas previstas en el parágrafo del artículo 2.2.3.4.2.1 del Decreto 1077 de 2015, para diseño, construcción o adecuación.`.replace(/[\n\r]+ */g, ' '),
            `El urbanizador, el constructor, los arquitectos que firman los planos urbanísticos  y arquitectónicos y los ingenieros que suscriban los planos técnicos y memorias son responsables de cualquier contravención y violación a las normas urbanísticas, sin perjuicio de la responsabilidad administrativa que se deriven para los funcionarios y curadores urbanos que expidan las licencias sin concordancia o en contravención o violación de las normas correspondientes. (Ley 388 de 1997. Artículo 99° numeral 5.)`.replace(/[\n\r]+ */g, ' '),
            `La responsabilidad de los diseños de los diferentes elementos que     componen la edificación recae en los profesionales bajo cuya dirección se elaboran los diferentes diseños particulares. Se presume que cuando un elemento figure en un plano o memoria de diseño, es porque se han tomado todas las medidas para cumplir con el propósito del reglamento y por lo tanto el profesional que forma o rotula el plano es responsable del diseño correspondiente. (A.1.5.1- Diseñador Responsable. Capitulo A.1 NSR-10)`.replace(/[\n\r]+ */g, ' '),
            `El Constructor será responsable si los inmuebles perecen o amenazan ruina, en todo o parte, por vicios de construcción o por vicios de suelo que el Constructor haya debido conocer, o por vicios de materiales, cuya garantía legal de acuerdo con las previsiones del artículo 8 de la Ley 1480 de 2011 es de estabilidad de la obra por diez (10) años, y para los acabados un (1) año.`.replace(/[\n\r]+ */g, ' '),
            `Se obliga al Director de la Construcción y/o promotor responsable a cumplir con las obligaciones establecidas en la Resolución 472 de 2017 del Ministerio de Ambiente y Desarrollo Sostenible “Por la cual se reglamenta la gestión integral de los residuos generados en las actividades de Construcción y Demolición (RCD) y se dictan otras disposiciones”.`.replace(/[\n\r]+ */g, ' '),
            `Cumplir con las disposiciones contenidas en la Resolución N° 4262 de 2013 de la Comisión de Regulación de Comunicaciones – CRC “por medio de la cual se expidió el Reglamento Técnico para las Redes Internas de Telecomunicaciones – RITEL”, así como las Resoluciones 5050 de 2016 y 5405 del 16 de junio de 2018. `.replace(/[\n\r]+ */g, ' '),
            `Se recalca que el titular de la licencia será el responsable de todas las obligaciones urbanísticas y arquitectónicas adquiridas con ocasión de su expedición y extracontractualmente por los perjuicios que se causaren a terceros en desarrollo de la misma.`.replace(/[\n\r]+ */g, ' '),
            `De conformidad con el parágrafo 2 del Artículo 2.2.6.1.4.1 del Decreto 1077 de 2015 y el artículo 19 de la Ley 400 de 1997 modificado por el artículo 5 de la Ley 1796 de 2016, para las obras que no requirieren supervisión técnica independiente la responsabilidad frente al cumplimiento de las normas sismo resistentes en la ejecución de la obra, recae exclusivamente sobre el Titular de la licencia urbanística y el Constructor responsable del proyecto. `.replace(/[\n\r]+ */g, ' '),
            `El Titular de la actuación urbanística y el Constructor deben dar cumplimiento integral a la Resolución 190708 de 2013 por medio de la cual se expide el Reglamento Técnico de Instalaciones Eléctricas – RETIE – y en particular guardar las distancias de aislamiento a las redes eléctricas según su capacidad y atender las responsabilidades contenidas para los diseñadores y los constructores.`.replace(/[\n\r]+ */g, ' '),
            `El Titular deberá dar cumplimiento a lo dispuesto en el Decreto Nacional 1538 de 2005.`.replace(/[\n\r]+ */g, ' '),
            `El numeral A.1.5.2 del capítulo A.1 de la NSR-10 señala que los planos arquitectónicos, estructurales y de elementos  no estructurales, que se presenten para la obtención de la licencia de construcción deben ser iguales a los utilizados en la construcción de la obra; este mandato es concordante con lo estipulado en el artículo 2.2.6.1.2.3.6 del Decreto 1077 de 2015 que señala que se debe mantener en la obra la licencia y los planos aprobados, y exhibirlos cuando sean requeridos por la autoridad competente.`.replace(/[\n\r]+ */g, ' '),
            `El Titular se compromete al cumplimiento de las Normas Ambientales establecidas por la Corporación Autónoma Regional (CDMB) y el Acuerdo Municipal 028 de 2003 P.B.O.T. de Piedecuesta; e igualmente responder por las compensaciones y perjuicios ambientales que causare la ejecución de la obra al entorno. El incumplimiento de las obligaciones y lineamientos ambientales establecidos para este proyecto implicará la aplicación de sanciones incluyendo la suspensión de la obra por parte de las entidades responsables.`.replace(/[\n\r]+ */g, ' '),
            `Esta Licencia no autoriza intervención del espacio público, para lo cual se debe consultar a la autoridad competente; para ello se deberá tener en cuenta el numeral 5 del artículo 2.2.6.1.1.2  del Decreto 1077 de 2015, el Código de Policía (Manejo de Escombros) y el plan de gestión integral de residuos sólidos PGIRS del Municipio de Piedecuesta.`.replace(/[\n\r]+ */g, ' '),
            `Esta Licencia no autoriza la tala de árboles, para tal efecto se debe consultar con la autoridad competente y obtener los permisos requeridos.`.replace(/[\n\r]+ */g, ' '),
            `Cumplir las obligaciones señaladas en literal D del artículo 135 de la Ley 1801 de 2016.`.replace(/[\n\r]+ */g, ' '),
            `El Titular de la licencia, tal como lo establece el artículo 2.2.6.1.4.9 del Decreto 1077 de 2015, debe instalar un aviso durante el término de ejecución de las obras, cuya dimensión mínima será de un metro (1.00 m) por setenta (70) centímetros, localizado en lugar visible desde la vía pública más importante sobre la cual tenga frente o límite la construcción que haya sido objeto de la licencia. En caso de obras que se desarrollen en edificios o conjunto sometidos al régimen de propiedad horizontal se instalará un aviso en la cartelera principal del edificio o conjunto, o en un lugar de amplia circulación que determine la administración. En caso de obras menores se instalará un aviso de treinta (30) centímetros por cincuenta (50) centímetros. La valla o aviso deberá indicar al menos:`.replace(/[\n\r]+ */g, ' '),
        ]

        if (_DATA.reso.model == 'ons') ARTICLE_7_ARRAY.splice(9, 1)
        if (_DATA.reso.model == 'parcon' || _DATA.reso.model == 'upvigon' || _DATA.reso.model == 'upvigam') ARTICLE_7_ARRAY.splice(11, 1)
        if (_DATA.reso.model == 'par') {
            ARTICLE_7_ARRAY.splice(10, 2)
            ARTICLE_7_ARRAY.splice(5, 3)
            ARTICLE_7_ARRAY.splice(1, 2)
        }

        const ARTICLE_7_18_ARRAY = [
            `La clase y número de identificación de la licencia, y la autoridad que la expidió.`.replace(/[\n\r]+ */g, ' '),
            `El nombre o razón social del titular de la licencia.`.replace(/[\n\r]+ */g, ' '),
            `La dirección del inmueble.`.replace(/[\n\r]+ */g, ' '),
            `Vigencia de la licencia.`.replace(/[\n\r]+ */g, ' '),
            `Descripción del tipo de obra que se adelanta, haciendo referencia especialmente al uso o usos autorizados, metros de construcción, altura total de las edificaciones, número de estacionamientos y número de unidades habitacionales, comerciales o de otros usos; según corresponda. `.replace(/[\n\r]+ */g, ' '),
        ]

        const ARTICLE_7_P = `La valla o aviso se instalará antes de la iniciación de cualquier tipo de obra, emplazamiento de campamentos o maquinaria, entre otros, y deberá permanecer instalado durante todo el tiempo de la ejecución de la obra.`.replace(/[\n\r]+ */g, ' ');


        var ARTICLE_8_ARRAY = [
            `Se deben colocar mallas o cortinas protectoras hacia los predios colindantes y el espacio público para evitar que la caída de escombros pueda ocasionar accidentes a las personas o daños materiales a los inmuebles vecinos.`.replace(/[\n\r]+ */g, ' '),
            `Los muros que demarcan los linderos deben levantarse dentro de los límites del predio sobre el cual actúa la presente licencia, éstos deben ser independientes y no podrá existir servidumbre de vista hacia los predios vecinos.`.replace(/[\n\r]+ */g, ' '),
        ]
        if (_DATA.reso.model == 'parcon') {
            ARTICLE_8_ARRAY.push(`Ejecutar en el globo de terreno a que se refiere esta resolución y determinado en el plano del proyecto general de la Parcelación como lo establece el P.B.O.T. de ${_DATA.reso.ciudad}.`)
            ARTICLE_8_ARRAY.push(`Cuando el predio este ubicado en zonas de amenaza y/o riesgo alto, medio o bajo de origen sísmico geotécnico o hidrológico, se deberán adjuntar los estudios técnicos y ambientales que señalen las medidas de mitigación de estos riesgos, debidamente avalados por la C.D.M.B.`)
            ARTICLE_8_ARRAY.push(`Solicitar a las empresas de servicios públicos la interventoría para que las obras se ejecuten con sujeción a las normas técnicas de tales entidades. Las empresas de servicios públicos, para efectos de revisión, reparación y mantenimiento de redes tendrán libre acceso a los terrenos y bienes de propiedad privada y comunal por los cuales crucen dichas redes.`)
            ARTICLE_8_ARRAY.push(`Presentar los documentos con las debidas autorizaciones que sustenten la forma en que se autoprestarán los servicios de energía, agua y manejo de vertimientos y residuos sólidos, en el caso de zonas no cubiertas por las empresas de servicios.`)
            ARTICLE_8_ARRAY.push(`Presentar los planos y/o especificaciones técnicas y autorizaciones de las empresas prestadoras de servicios, en zonas donde las mismas tengan cobertura.`)
            ARTICLE_8_ARRAY.push(`El urbanizador construirá las vías vehiculares y peatonales según las especificaciones suministradas por la Oficina de Planeación Municipal de Piedecuesta.`)
        }
        if (_DATA.reso.model == 'demon' || _DATA.reso.model == 'rdm') ARTICLE_8_ARRAY.unshift(`Durante la demolición, deben apuntalarse los muros colindantes de los predios vecinos y protegerse de aguas lluvias, para evitar el deterioro o caída de estos muros y prevenir daños a predios vecinos o terceros.`)
        if (_DATA.reso.model == 'sub') {
            ARTICLE_8_ARRAY = [
                'La licencia de subdivisión no autoriza la ejecución de obras de infraestructura o  de construcción, ni la delimitación de espacios públicos y privados.',
                'Las subdivisiones en suelo urbano, se sujetarán al cumplimiento de las dimensiones de áreas y frentes mínimos establecidos en los actos administrativos correspondientes. Los predios resultantes de la subdivisión y/o reloteo deberán contar con frente sobre vía pública vehicular o peatonal y no podrán accederse por zonas verdes y/o comunales.',
                'La incorporación a la cartografía oficial de tales subdivisiones no implica autorización alguna para urbanizar, parcelar o construir sobre los lotes resultantes, para cuyo efecto, el interesado, en todos los casos, deberá adelantar el trámite de solicitud de licencia de parcelación, urbanización o construcción ante el curador urbano o la autoridad municipal o distrital competente para el estudio, trámite y expedición de las licencias urbanísticas, en los términos de que trata el Decreto 1077 de 2015 y demás normas concordantes.',
                'La demarcación de los linderos debe efectuarse dentro de los límites del predio sobre el cual actúa la presente licencia.'
            ]
        }
        if (_DATA.reso.model == 'upvigon' || _DATA.reso.model == 'upvigam') {
            ARTICLE_8_ARRAY = [
                `Se deben colocar mallas o cortinas protectoras hacia los predios colindantes y el espacio público para evitar que la caída de escombros pueda ocasionar accidentes a las personas o daños materiales a los inmuebles vecinos.`,
                `Los muros que demarcan los linderos deben levantarse dentro de los límites del predio sobre el cual actúa la presente licencia, éstos deben ser independientes y no podrá existir servidumbre de vista hacia los predios vecinos.`,
                `El urbanizador construirá las vías vehiculares y peatonales según las especificaciones suministradas por la Oficina de Planeación Municipal de Piedecuesta.`,
                `Cuando el predio este ubicado en zonas de amenaza y/o riesgo alto, medio o bajo de origen sísmico geotécnico o hidrológico, se deberán adjuntar los estudios técnicos y ambientales que señalen las medidas de mitigación de estos riesgos, debidamente avalados por la C.D.M.B.`,
                `El urbanizador solicitará a las empresas de servicios públicos la interventoría para que las obras se ejecuten con sujeción a las normas técnicas de tales entidades. Las empresas de servicios públicos, para efectos de revisión, reparación y mantenimiento de redes tendrán libre acceso a los terrenos y bienes de propiedad privada y comunal por los cuales crucen dichas redes.`,
                `El urbanizador construirá la red de alumbrado público y de servicios domiciliarios, según los proyectos y especificaciones de la Electrificadora de Santander ESP.`,
                `Las redes de alcantarillado serán separadas en pluviales y sanitarias de acuerdo con la disponibilidad otorgada.`,
                `El urbanizador se compromete a cumplir en un todo con los planos y especificaciones aprobadas por la Piedecuesta de Servicios Públicos ESP.`,
            ]
        }


        let vig = _DATA.reso.record_eje != 0 && _DATA.reso.record_eje != 1 ? _DATA.reso.record_eje : 'VIGENCIA';

        let ARTICLE_9 = `Vigencia. Conceder, con fundamento en el artículo 2.2.6.1.2.4.1 del decreto 1077 de 2015, ${vig} para ${PART_TYPE}, contados a partir de la fecha en que quede en firme el presente acto administrativo.`.replace(/[\n\r]+ */g, ' ');
        if (_DATA.reso.model == 'rec') ARTICLE_9 = `Vigencia. Conceder, con fundamento en el parágrafo 2 del artículo 2.2.6.4.2.5 del Decreto 1077 de 2015, un plazo de ${vig} contados a partir de la ejecutoria del presente acto administrativo que resuelve conjuntamente la solicitud de ${PART_TYPE}, para que el interesado realice las obras.`
        if (_DATA.reso.model == 'reccon') ARTICLE_9 = `Vigencia. El presente reconocimiento de edificación existente, no contempla obras de reforzamiento de la estructura a los niveles adecuados de sismo resistente de acuerdo con la Ley 400 de 1997 y el Reglamento Colombiano de Construcción Sismoresistente-NSR-10, o adecuación a las normas vigentes. En éste contexto, el  presente acto de reconocimiento no tiene vigencia.`.replace(/[\n\r]+ */g, ' ');
        if (_DATA.reso.model == 'upvigon' || _DATA.reso.model == 'upvigam') ARTICLE_9 = `Vigencia. La modificación de la licencia urbanística vigente que por el presente acto se aprueba, mantiene el término de vigencia inicialmente otorgado. `.replace(/[\n\r]+ */g, ' ');
        if (_DATA.reso.model == 'pro') ARTICLE_9 = `Vigencia. La prórroga no implica ninguna modificación a las condiciones técnicas y operativas definidas en la respectiva licencia objeto de prórroga. Solo autoriza la continuación de las obras aprobadas en la licencia por un plazo adicional de ${vig}, contados a partir de la fecha en que quede en firme el presente acto administrativo, que corresponde a la fecha de vencimiento de la licencia prorrogada, de conformidad con lo establecido en el artículo 2.2.6.1.2.4.1 del Decreto 1077 de 2015.`.replace(/[\n\r]+ */g, ' ');
        if (_DATA.reso.model == 'licup') ARTICLE_9 = `Vigencia. Otorgar un plazo adicional de ${vig} contados a partir de la fecha de vencimiento de la licencia objeto de revalidación de conformidad con lo establecido en los artículos 2.2.6.1.2.4.1 y 2.2.6.1.2.4.3 del Decreto 1077 de 2015, para ejecutar el porcentaje pendiente de las obras y actuaciones aprobadas en la licencia vencida en concordancia con lo informado por el Urbanizador en el cuadro de áreas, avance de obra y en la declaración juramentada que adjuntó en el presente trámite.`.replace(/[\n\r]+ */g, ' ');
        if (_DATA.reso.model == 'cota') ARTICLE_9 = `Vigencia. La vigencia del ajuste de cotas de áreas no está limitada en el tiempo dado que no conlleva autorización de ejecución de obras sino la actualización, acreditación, conceptualización o certificación de situaciones urbanísticas. En éste contexto, el  presente acto administrativo no tiene vigencia.`.replace(/[\n\r]+ */g, ' ');

        const ARTICLE_9_p1 = `La licencia puede ser prorrogada por una sola vez por un plazo adicional de doce (12) meses, para ello el titular de la licencia debe radicar una solicitud con la correspondiente documentación a más tardar treinta (30) días hábiles antes del vencimiento de la respectiva licencia. La solicitud deberá acompañarse de la manifestación bajo la gravedad del juramento de la iniciación de obra por parte del constructor responsable.`.replace(/[\n\r]+ */g, ' ');
        const ARTICLE_9_p2 = `Tránsito de normas urbanísticas y revalidación de licencias. Cuando una licencia pierda su vigencia por vencimiento del plazo o de sus prórrogas, el interesado deberá solicitar una nueva licencia, ante la misma Curaduría Urbana o Autoridad que la expidió, ajustándose a las normas urbanísticas vigentes al momento de la nueva solicitud. Sin embargo, el interesado podrá solicitar, por una sola vez, la revalidación de la licencia vencida, siempre y cuando no haya transcurrido un término mayor a dos (2) meses desde el vencimiento de la licencia que se pretende revalidar, y el constructor o el urbanizador presente el cuadro de áreas en el que se identifique lo ejecutado durante la licencia vencida así como lo que se ejecutará durante la revalidación y manifieste bajo la gravedad del juramento que el inmueble se encuentra en cualquiera de las situaciones que contempla el artículo 2.2.6.1.2.4.3 del Decreto 1077 de 2015.`.replace(/[\n\r]+ */g, ' ');
        const ARTICLE_9_p3 = `La vigencia de la presente licencia es improrrogable, por lo tanto, dentro del término legal concedido deben realizarse las actuaciones de autorización y registro a que se refieren los artículos 7° de la ley 810 de 2003 y 108 de la ley 812 de 2003 o las normas que los adicionen, modifiquen o sustituyan, así como para la incorporación de estas subdivisiones en la cartografía oficial de los municipios.`.replace(/[\n\r]+ */g, ' ');

        var ARTICLE_10 = `Notificar al titular y/o el apoderado el contenido de la presente resolución en los términos previstos en el artículo 2.2.6.1.2.3.7 del Decreto 1077 de 2015 en concordancia con el Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`.replace(/[\n\r]+ */g, ' ');
        if (_DATA.reso.model == 'reccon') ARTICLE_10 = `Notificar al titular y/o el apoderado el contenido de la presente resolución en los términos previstos en el artículo 2.2.6.1.2.3.7 del Decreto 1077 de 2015 en concordancia con el Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`
        if (_DATA.reso.model == 'rev2') ARTICLE_10 = `Notificar al titular y/o el apoderado el contenido de la presente resolución en los términos de la Ley 1437 de 2011. Si no pudiere realizarse la notificación personal al cabo de cinco (5) días del envío de la citación, se notificará por aviso de conformidad con el Art 69 ss., y concordantes de la precitada ley.`
        if (_DATA.reso.model == 'cota') ARTICLE_10 = `Notificar al titular y/o el apoderado el contenido de la presente resolución en los términos previstos en los artículos 67 y siguientes de la Ley 1437 de 2011 –CPACA-.`

        const ARTICLE_10_ARRAY = [
            'Notificar al solicitante el contenido de la presente resolución.'.replace(/[\n\r]+ */g, ' '),
            'Notificar a cualquier persona y/o autoridad que se hubiere hecho parte dentro del trámite.'.replace(/[\n\r]+ */g, ' '),
        ]
        if (_DATA.reso.model == 'sub' || _DATA.reso.model == 'neg5') ARTICLE_10_ARRAY.splice(0, 1)
        if (_DATA.reso.model == 'upvigon') ARTICLE_10_ARRAY.pop();
        const ARTICLE_10_p = `Podrá notificarse por medio electrónico, siempre que el solicitante haya aceptado este último medio de notificación, de conformidad con el artículo 56 y el inciso 5° del artículo 67 de la Ley 1437 de 2011 – CPACA así como las demás normas que reglamenten los procedimientos por medios electrónicos; de no poder hacerse de esta forma se realizará conforme el procedimiento previsto en los artículos 67 y ss., de la Ley 1437 de 2011, es decir mediante citación para notificación personal y de no poder hacer la notificación personal al cabo de cinco (5) días del envío de la citación, se notificará por aviso de conformidad con el Art 69 ss., y concordantes de la ley ibídem.`.replace(/[\n\r]+ */g, ' ');
        var ARTICLE_11 = `Contra éste acto administrativo proceden los recursos de reposición ante el/la Curador(a) Urbano(a) que lo expidió y de apelación ante la Oficina Asesora de Planeación, para que lo aclare, modifique o revoque. El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011.`.replace(/[\n\r]+ */g, ' ');
        if (_DATA.reso.model == 'neg1' || _DATA.reso.model == 'neg3' || _DATA.reso.model == 'neg4' || _DATA.reso.model == 'neg5') ARTICLE_11 = `Contra éste acto administrativo procede el recurso de reposición ante la Curadora Urbana que la expidió conforme a lo establecido en los artículos 2.2.6.1.2.3.4 y 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011, Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`
        if (_DATA.reso.model == 'clear' || _DATA.reso.model == 'update') ARTICLE_11 = `Contra éste acto administrativo no proceden recursos, de conformidad con el artículo 75 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`
        if (_DATA.reso.model == 'rev' || _DATA.reso.model == 'rev0') ARTICLE_11 = `Contra éste acto administrativo no proceden recursos, de conformidad con el artículo 95 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`
        if (_DATA.reso.model == 'rev2') ARTICLE_11 = `Contra el presente acto administrativo no procede ningún recurso.`
        if (_DATA.reso.model == 'cota') ARTICLE_11 = `Contra éste acto administrativo proceden los recursos en la vía administrativa señalados en el artículo 74 de la Ley 1437 de 2011 –CPACA-. El recurso de reposición ante la suscrita Curadora Urbana Uno de Piedecuesta y el de apelación para ante la Oficina Asesora de Planeación, para que aclare, modifique o revoque. Este último, podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días hábiles siguientes a la fecha de surtida la notificación correspondiente.`


        const ARTICLE_12 = `La presente resolución rige a partir de su fecha de ejecutoria. `.replace(/[\n\r]+ */g, ' ');
        const ARTICLE_12_b = `Ordénese publicar la parte resolutoria del presente acto administrativo con el objeto de darse a conocer a terceros que no hayan intervenido en la actuación de conformidad con lo establecido en el Artículo 2.2.6.1.2.3.8 del Decreto 1077 de 2015, según el cual: “De conformidad con el artículo 73 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo, cuando, a juicio del curador urbano o la autoridad municipal o distrital competente, la expedición del acto administrativo que resuelva la solicitud de licencia afecte en forma directa e inmediata a terceros que no hayan intervenido en la actuación, se ordenará la publicación de la parte resolutiva de la licencia en un periódico de amplia circulación en el municipio o distrito donde se encuentren ubicados los inmuebles y en la página electrónica de la oficina que haya expedido la licencia, si cuentan con ella.” `.replace(/[\n\r]+ */g, ' ');
        const ARTICLE_13 = `Publíquese la parte resolutoria del presente acto administrativo con el objeto de darse a conocer a terceros que no hayan intervenido en la actuación de conformidad con lo establecido en el Artículo 2.2.6.1.2.3.8 del Decreto 1077 de 2015, según el cual: “De conformidad con el artículo 73 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo, cuando, a juicio del curador urbano o la autoridad municipal o distrital competente, la expedición del acto administrativo que resuelva la solicitud de licencia afecte en forma directa e inmediata a terceros que no hayan intervenido en la actuación, se ordenará la publicación de la parte resolutiva de la licencia en un periódico de amplia circulación en el municipio o distrito donde se encuentren ubicados los inmuebles y en la página electrónica de la oficina que haya expedido la licencia, si cuentan con ella.”`.replace(/[\n\r]+ */g, ' ');;

        const ARTICLE_14 = `Archivar el expediente de acuerdo a lo establecido en el artículo 2.2.6.1.2.3.1 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio, dando cumplimiento a lo dispuesto en el parágrafo 2 del artículo 8 del Acuerdo 009 del 19 de diciembre de 2018, expedido por el Consejo Directivo del Archivo General de la Nación Jorge Palacios Preciado, según el cual: “Los expedientes de los trámites desistidos no serán remitidos al archivo y permanecerán en los archivos de gestión durante treinta (30) días calendario, contados a partir de la fecha en que quede en firme el acto administrativo en que se declare el desistimiento y se notifique la situación al solicitante. Luego de este tiempo, serán devueltos al mismo, de acuerdo a lo estipulado en el artículo 17 de la ley 1755 de 2017. De no ser reclamados en este periodo, estos expedientes podrán ser eliminados, dejando constancia por medio de acta de eliminación de documentos”. Lo anterior, sin perjuicio de que la solicitud desistida pueda ser nuevamente presentada con el lleno de los requisitos legales o solicite su traslado a otro expediente, en el evento que se radique una nueva solicitud ante la misma Curadora Urbana.`;

        const ARTICLE_15 = `El titular de la prórroga de licencia deberá dar cumplimiento de las obligaciones, establecidas en el artículo 2.2.6.1.2.3.6 del Decreto 1077 de 2015, que hacen parte del acto administrativo inicial.`;
        const ARTICLE_16 = `El titular de la prórroga de licencia deberá dar cumplimiento de las obligaciones, establecidas en el artículo 2.2.6.1.2.3.6 del Decreto 1077 de 2015.`;

        const ARTICLE_17 = `El titular de la revalidación de licencia deberá dar cumplimiento de las obligaciones, establecidas en el artículo 2.2.6.1.2.3.6 del Decreto 1077 de 2015, que hacen parte del acto administrativo inicial.`;
        const ARTICLE_18 = `El titular de la licencia será el responsable de todas las obligaciones urbanísticas y arquitectónicas adquiridas con ocasión de su expedición y extracontractualmente por los perjuicios que se causaren a terceros en desarrollo de la misma.`;
        const ARTICLE_19 = `uando los profesionales que suscriben el formulario único nacional para la solicitud de licencias se desvinculen de la ejecución de los diseños o de la ejecución de la obra, deberán informar de este hecho a la Curadora Urbana que expidió la licencia o la autoridad municipal encargada de expedir las licencias, según corresponda, quien de inmediato procederá a requerir al titular de la licencia para que informe de su reemplazo en un término máximo de 15 días hábiles, de acuerdo con lo establecido en el artículo 2.2.6.1.1.15 del Decreto 1077 de 2015, modificado por el artículo 5 del Decreto 1203 de 2017.`;

        const ARTICLE_20 = `En ningún caso la corrección y/o aclaración dará lugar a cambios en el sentido material de la decisión, ni revivirá términos legales para demandar el acto y/o para interponer recursos comoquiera que ya se encuentra ejecutoriada. En tal sentido, debe entenderse que las demás disposiciones continúan sin modificación alguna y por consiguiente tienen plenos efectos.`;

        const ARTICLE_21 = `Comunicar el presente acto administrativo a cualquier persona que se haya hecho parte en el trámite de reconocimiento.`;
        const ARTICLE_22 = `Publicar en la página institucional de la Curaduría el contenido del presente acto administrativo a fin de que los terceros que eventualmente puedan resultar afectados, se hagan parte y hagan valer sus derechos.`;
        const ARTICLE_23 = `Conceder el término de 10 días hábiles contados a partir de la notificación o comunicación a los convocados, para que de considerarlo necesario, se pronuncien; en especial los titulares del reconocimiento, a quienes se advierten desde ya, que en caso de no expresar su consentimiento, la suscrita acudirá al juez administrativo a fin de que se declare la nulidad del acto.`;

        const ARTICLE_24 = `En ningún caso la actualización del titular de la licencia dará lugar a cambios en el sentido material de la decisión, ni revivirá términos legales para demandar el acto y/o para interponer recursos comoquiera que ya se encuentra ejecutoriada. En tal sentido, debe entenderse que las demás disposiciones continúan sin modificación alguna y por consiguiente tienen plenos efectos.`;


        let VALUE = _GET_STEP_TYPE('s33', 'value', 'arc');
        const ARC_DATA = VALUE[1] || ' ';
        const ENG_DATA = rer ? rer.desc ? rer.desc : ' ' : ' ';

        var OLD_LICS = _DATA.reso.old_lic ? _DATA.reso.old_lic.replace(/[\n\r]+ */g, ' ') : '';
        OLD_LICS = OLD_LICS.split(';').map(lc => String(lc).trim());



        doc.fontSize(docFontZise);
        function START() {
            doc.text(PAR, { align: 'justify' });

            doc.fontSize(13);
            doc.font('Helvetica-Bold')
            doc.text('\nCONSIDERACIONES\n\n', { align: 'center' });
            doc.font('Helvetica')
            doc.fontSize(docFontZise);
        }


        doc.startPage = doc.bufferedPageRange().count - 1;
        doc.lastPage = doc.bufferedPageRange().count - 1;
        doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

        switch (_DATA.reso.model) {
            case 'onn':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2(false, false, true);
                PARAGRAPH(ARTICLE_1_P, false)
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false)
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, 1);
                PARAGRAPH(ARTICLE_4_p2, 2);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'ons':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, 1)
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, 1);
                PARAGRAPH(ARTICLE_4_p2, 2);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_13);
                ARTICLE(ARTICLE_12);
                break;
            case 'demon':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2(false, false, true);
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false)
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, 1);
                PARAGRAPH(ARTICLE_4_p2, 2);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'rec':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                PARAGRAPH(ARTICLE_1_P, false);
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, 1);
                PARAGRAPH(ARTICLE_4_p2, 2);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'reccon':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, 1);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_9); // VIGENCIA
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, 1);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'rdm':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, 1);
                PARAGRAPH(ARTICLE_4_p2, 2);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'parcon':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST([CONSIDERATIONS_PARCON_15], { startAt: 15 })
                LIST(CONSIDERATIONS_PARCON_15_ARRAY, { ident: 2 })
                doc.text(CONSIDERATIONS_PARCON_15_2, { align: 'justify' });
                LIST(CONSIDERATIONS_PARCON_15_2_ARRAY, { ident: 2 })
                LIST([CONSIDERATIONS_APY], { startAt: 16 })
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, 1);
                PARAGRAPH(ARTICLE_4_p2, 2);
                ARTICLE(ARTICLE_5_PARCON);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                LIST(ARTICLE_10_ARRAY);
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_13);
                ARTICLE(ARTICLE_12);
                break;
            case 'par':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST([CONSIDERATIONS_PARCON_15], { startAt: 15 })
                LIST(CONSIDERATIONS_PARCON_15_ARRAY, { ident: 2 })
                doc.text(CONSIDERATIONS_PARCON_15_2, { align: 'justify' });
                LIST(CONSIDERATIONS_PARCON_15_2_ARRAY, { ident: 2 })
                LIST([CONSIDERATIONS_APY], { startAt: 16 })
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, 1);
                ARTICLE(ARTICLE_5_PARCON);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_13);
                ARTICLE(ARTICLE_12);
                break;
            case 'sub':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST([CONSIDERATIONS_PARCON_15], { startAt: 5 })
                LIST(CONSIDERATIONS_PARCON_15_ARRAY, { ident: 2 })
                doc.text(CONSIDERATIONS_PARCON_15_2, { align: 'justify' });
                LIST(CONSIDERATIONS_PARCON_15_2_ARRAY, { ident: 2 })
                LIST([CONSIDERATIONS_SUB_6], { startAt: 6 })
                LIST([CONSIDERATIONS_APY], { startAt: 7 })
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 })
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p1, false);
                ARTICLE(ARTICLE_5);
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p3, false);
                ARTICLE(ARTICLE_10);   // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'upvigon':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(OLD_LICS, { ident: 2 });
                LIST([CONSIDERATIONS_APY], { startAt: 6 });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p2, false);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                LIST(ARTICLE_10_ARRAY);
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'upvigam':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(OLD_LICS, { ident: 2 });
                LIST([CONSIDERATIONS_APY], { startAt: 6 });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                doc.startPage = doc.bufferedPageRange().count - 1; // THIS IS A LITLE HOT FIX
                doc.lastPage = doc.bufferedPageRange().count - 1; // THIS IS A LITLE HOT FIX
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto estructural: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ENG_DATA);
                doc.moveDown();
                PARAGRAPH(ARTICLE_4_p2, false);
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR
                LIST(ARTICLE_6_ARRAY);
                ARTICLE('Obligaciones Adicionales:');
                LIST(ARTICLE_7_ARRAY, { jump: false });
                LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });
                doc.text(ARTICLE_7_P);
                doc.moveDown();
                ARTICLE('Aspectos Técnicos');
                LIST(ARTICLE_8_ARRAY);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p1, 1);
                PARAGRAPH(ARTICLE_9_p2, 2);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'neg1':
                START()
                LIST(CONSIDERATIONS_ARRAY);
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2(false, false, true);
                ARTICLE(ARTICLE_2);
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_14);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'neg3':
                START()
                LIST(CONSIDERATIONS_ARRAY);
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2(false, false, true);
                ARTICLE(ARTICLE_2);
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_14);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'neg4':
                START()
                LIST(CONSIDERATIONS_ARRAY);
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2(false, false, true);
                ARTICLE(ARTICLE_2);
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_14);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'neg5':
                START()
                LIST(CONSIDERATIONS_ARRAY);
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2(false, false, true);
                ARTICLE(ARTICLE_2);
                LIST(ARTICLE_10_ARRAY);
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_14);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'pro':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(OLD_LICS, { ident: 2, jump: false });
                LIST(CONSIDERATIONS_ARRAY_2, { startAt: 4 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, 1);
                PARAGRAPH(ARTICLE_2_p2, 2);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_15);
                ARTICLE(ARTICLE_4_p2);
                ARTICLE(ARTICLE_16);
                ARTICLE(ARTICLE_9); // VIGENCIA
                PARAGRAPH(ARTICLE_9_p2, false);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'licup':
                START()
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                LIST(OLD_LICS, { ident: 2, jump: false });
                LIST(CONSIDERATIONS_ARRAY_2, { jump: false, startAt: 3 });
                LIST(CONSIDERATIONS_ARRAY_3, { ident: 2, jump: false });
                LIST([CONSIDERATIONS_ARRAY_i_1], { startAt: 6 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                PARAGRAPH(ARTICLE_1_P_2, 1);
                PARAGRAPH(ARTICLE_1_P_3, 2);
                PARAGRAPH(ARTICLE_1_P_4, 2);
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                PARAGRAPH(ARTICLE_2_p, false);
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                ARTICLE(ARTICLE_17);
                ARTICLE(ARTICLE_18);
                ARTICLE(ARTICLE_19);
                ARTICLE(ARTICLE_9); // VIGENCIA
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            case 'eje':
                const BODY_1 = `${curaduriaInfo.pronoum} ${curaduriaInfo.job} ${(curaduriaInfo.master).toUpperCase()} en uso de sus facultades legales, CERTIFICA:`
                const BODY_2 = `Que el ${dateParser(_DATA.reso.reso_date)} se expidió la Resolución N° ${_DATA.reso.reso_id} por la cual se resuelve expedir una ${_DATA.reso.tipo} dentro del radicado N° ${fun.id_public} a ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532}, en su calidad de ${f53.item_533} para el predio con nomenclatura o dirección o denominación ${f2.direccion} del Municipio de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.reso.ciudad}.`;

                doc.moveDown();
                doc.text(BODY_1, { align: 'justify' });
                doc.moveDown();
                doc.text(BODY_2, { align: 'justify' });
                doc.moveDown();
                doc.text(parcon[0], { align: 'justify' });
                doc.moveDown();
                break;
            case 'clear':
                START()
                LIST(CONSIDERATIONS_ARRAY);
                RESUELVE(docFontZise);
                ARTICLE(parcon[2]);
                LIST([parcon[3]], { useNum: false, ident: 2 });
                ARTICLE(ARTICLE_20);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                break;
            case 'rev':
                let c7_0 = `Al acto administrativo que otorga la respectiva licencia le son aplicables las disposiciones sobre revocatoria directa establecidas en el Código de Procedimiento Administrativo y de lo Contencioso Administrativo con las precisiones señaladas en el presente artículo:`;
                let c7_a = [
                    `Son competentes para adelantar la revocatoria directa de las licencias, el mismo curador que expidió el acto o quien haya sido designado como tal mediante acto administrativo de manera provisional o definitiva, o el alcalde municipal o distrital o su delegado.`,
                    `Podrán solicitar la revocatoria directa de las licencias los solicitantes de las mismas, los vecinos colindantes del predio objeto de la solicitud así como los terceros y las autoridades administrativas competentes que se hayan hecho parte en el trámite.`,
                    `Durante el trámite de revocatoria directa el expediente quedará a disposición de las partes para su consulta y expedición de copias y se deberá convocar al interesado, y a los terceros que puedan resultar afectados con la decisión, con el fin de que se hagan parte y hagan valer sus derechos. Para el efecto, desde el inicio de la actuación, se pondrán en conocimiento, mediante oficio que será comunicado a las personas indicadas anteriormente, los motivos que fundamentan el trámite. Se concederá un término de diez (10) días hábiles para que se pronuncien sobre ellos y se solicite la práctica de pruebas.”`,
                ];
                let c7_1 = `En igual sentido, la ley 1437 de 2011 - Código de Procedimiento Administrativo y de lo Contencioso Administrativo CPACA reza,`;
                let c7_a2 = [
                    `“ARTÍCULO 93. CAUSALES DE REVOCACIÓN. Los actos administrativos deberán ser revocados por las mismas autoridades que los hayan expedido o por sus inmediatos superiores jerárquicos o funcionales, de oficio o a solicitud de parte, en cualquiera de los siguientes casos:
                    1. Cuando sea manifiesta su oposición a la Constitución Política o a la ley.
                    2. Cuando no estén conformes con el interés público o social, o atenten contra él.
                    3. Cuando con ellos se cause agravio injustificado a una persona.`,
                    `(…) ARTÍCULO 97. REVOCACIÓN DE ACTOS DE CARÁCTER PARTICULAR Y CONCRETO. Salvo las excepciones establecidas en la ley, cuando un acto administrativo, bien sea expreso o ficto, haya creado o modificado una situación jurídica de carácter particular y concreto o reconocido un derecho de igual categoría, no podrá ser revocado sin el consentimiento previo, expreso y escrito del respectivo titular.`,
                    `Si el titular niega su consentimiento y la autoridad considera que el acto es contrario a la Constitución o a la ley, deberá demandarlo ante la Jurisdicción de lo Contencioso Administrativo.`,
                    `Si la Administración considera que el acto ocurrió por medios ilegales o fraudulentos lo demandará sin acudir al procedimiento previo de conciliación y solicitará al juez su suspensión provisional.`,
                    `PARÁGRAFO. En el trámite de la revocación directa se garantizarán los derechos de audiencia y defensa (…)`,
                ];
                let a1 = `NO REVOCAR TOTAL NI PARCIALMENTE la Resolución ${_DATA.reso.reso_id} del ${_DATA.reso.reso_date}, por medio de la cual se concedió un ${PART_TYPE} para destinación ${DESTINE}, del  predio localizado en ${f2.direccion} del Municipio de ${_DATA.reso.ciudad}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}, otorgado a ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532}, por los argumentos expuestos en la parte considerativa.`;


                START();
                LIST(CONSIDERATIONS_ARRAY);
                LIST([parcon[0]], { useNum: false, ident: 2 });
                LIST(CONSIDERATIONS_ARRAY_4, { startAt: 5 });
                doc.moveDown();
                doc.text(`El artículo 2.2.6.1.2.3.10 del Decreto 1077 de 2015 dispone que: `, { align: 'justify' });
                doc.moveDown();
                LIST([c7_0], { useNum: false, ident: 2 });
                LIST(c7_a, { ident: 2 });
                doc.moveDown();
                doc.text(c7_1, { align: 'justify' });
                doc.moveDown();
                LIST(c7_a2, { useNum: false, ident: 2 });
                LIST(CONSIDERATIONS_ARRAY_5, { startAt: 8 });
                ARTICLE(a1);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                break;
            case 'rev0':
                let rev0_a1 = `NICIAR EL TRÁMITE DE REVOCATORIA DIRECTA  la Resolución ${_DATA.reso.reso_id} del ${_DATA.reso.reso_date}, por medio de la cual se concedió un ${PART_TYPE} para destinación ${DESTINE}, del  predio localizado en ${f2.direccion} del Municipio de ${_DATA.reso.ciudad}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}, otorgado a ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532}, por los argumentos expuestos en la parte considerativa.`;
                let rev0_a2 = `Notificar a la titular del reconocimiento, a fin de que exprese por escrito su consentimiento para expedir la REVOCATORIA la Resolución ${_DATA.reso.reso_id} del ${_DATA.reso.reso_date}, por medio de la cual se concedió un ${PART_TYPE} para destinación ${DESTINE}, del  predio localizado en ${f2.direccion} del Municipio de ${_DATA.reso.ciudad}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}, otorgado a ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532}, por los argumentos expuestos en la parte considerativa.`;

                START();
                LIST(CONSIDERATIONS_ARRAY);
                LIST([parcon[1]], { useNum: false, ident: 2 });
                LIST(CONSIDERATIONS_ARRAY_6, { startAt: 5 });
                RESUELVE(docFontZise);
                ARTICLE(rev0_a1);
                ARTICLE(rev0_a2);
                ARTICLE(ARTICLE_21);
                ARTICLE(ARTICLE_22);
                ARTICLE(ARTICLE_23);
                ARTICLE(ARTICLE_11);
                break;
            case 'rev2':
                let rev2_c1 = [
                    parcon[2],
                    `Que sobre la revocatoria directa se tienen los siguientes fundamentos de derecho:`,
                ];
                let rev2_c7_0 = `Al acto administrativo que otorga la respectiva licencia le son aplicables las disposiciones sobre revocatoria directa establecidas en el Código de Procedimiento Administrativo y de lo Contencioso Administrativo con las precisiones señaladas en el presente artículo:`;
                let rev_2c7_a = [
                    `Son competentes para adelantar la revocatoria directa de las licencias, el mismo curador que expidió el acto o quien haya sido designado como tal mediante acto administrativo de manera provisional o definitiva, o el alcalde municipal o distrital o su delegado.`,
                    `Podrán solicitar la revocatoria directa de las licencias los solicitantes de las mismas, los vecinos colindantes del predio objeto de la solicitud así como los terceros y las autoridades administrativas competentes que se hayan hecho parte en el trámite.`,
                    `Durante el trámite de revocatoria directa el expediente quedará a disposición de las partes para su consulta y expedición de copias y se deberá convocar al interesado, y a los terceros que puedan resultar afectados con la decisión, con el fin de que se hagan parte y hagan valer sus derechos. Para el efecto, desde el inicio de la actuación, se pondrán en conocimiento, mediante oficio que será comunicado a las personas indicadas anteriormente, los motivos que fundamentan el trámite. Se concederá un término de diez (10) días hábiles para que se pronuncien sobre ellos y se solicite la práctica de pruebas.”`,
                ];
                let rev_2c7_1 = `En igual sentido, la ley 1437 de 2011 - Código de Procedimiento Administrativo y de lo Contencioso Administrativo CPACA reza,`;
                let rev_2c7_a2 = [
                    `“ARTÍCULO 93. CAUSALES DE REVOCACIÓN. Los actos administrativos deberán ser revocados por las mismas autoridades que los hayan expedido o por sus inmediatos superiores jerárquicos o funcionales, de oficio o a solicitud de parte, en cualquiera de los siguientes casos:
                    1. Cuando sea manifiesta su oposición a la Constitución Política o a la ley.
                    2. Cuando no estén conformes con el interés público o social, o atenten contra él.
                    3. Cuando con ellos se cause agravio injustificado a una persona.`,
                    `(…) ARTÍCULO 97. REVOCACIÓN DE ACTOS DE CARÁCTER PARTICULAR Y CONCRETO. Salvo las excepciones establecidas en la ley, cuando un acto administrativo, bien sea expreso o ficto, haya creado o modificado una situación jurídica de carácter particular y concreto o reconocido un derecho de igual categoría, no podrá ser revocado sin el consentimiento previo, expreso y escrito del respectivo titular.`,
                    `Si el titular niega su consentimiento y la autoridad considera que el acto es contrario a la Constitución o a la ley, deberá demandarlo ante la Jurisdicción de lo Contencioso Administrativo.`,
                    `Si la Administración considera que el acto ocurrió por medios ilegales o fraudulentos lo demandará sin acudir al procedimiento previo de conciliación y solicitará al juez su suspensión provisional.`,
                    `PARÁGRAFO. En el trámite de la revocación directa se garantizarán los derechos de audiencia y defensa (…)`,
                    `Si el titular niega su consentimiento y la autoridad considera que el acto es contrario a la Constitución o a la ley, deberá demandarlo ante la Jurisdicción de lo Contencioso Administrativo.`,
                    `Si la Administración considera que el acto ocurrió por medios ilegales o fraudulentos lo demandará sin acudir al procedimiento previo de conciliación y solicitará al juez su suspensión provisional.`,
                    `PARÁGRAFO. En el trámite de la revocación directa se garantizarán los derechos de audiencia y defensa (…)”`,
                ];
                let rev_2_c2 = [
                    parcon[3],
                    parcon[4],
                    parcon[5],
                    parcon[6],
                ];
                let rev2_a1 = `REVOCAR TOTALMENTE la Resolución ${_DATA.reso.reso_id} del ${_DATA.reso.reso_date}, por medio de la cual se concedió un ${PART_TYPE} para destinación ${DESTINE}, del  predio localizado en ${f2.direccion} del Municipio de ${_DATA.reso.ciudad}, con folio de matrícula inmobiliaria N° ${f2.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.reso.ciudad}, número catastral ${f2.catastral}, otorgado a ${f53.item_5311 + ' ' + f53.item_5312}, con documento de identificación No. ${f53.item_532}, por los argumentos expuestos en la parte considerativa.`;

                START();
                LIST(CONSIDERATIONS_ARRAY);
                LIST([parcon[1]], { useNum: false, ident: 2 });
                LIST(rev2_c1, { startAt: 5 });
                LIST(['El artículo 2.2.6.1.2.3.10 del Decreto 1077 de 2015, dispone que: '], { useNum: false, ident: 2 });
                LIST([rev2_c7_0], { useNum: false, ident: 2 });
                LIST(rev_2c7_a, { ident: 2 });
                LIST([rev_2c7_1], { useNum: false, ident: 2 });
                LIST(rev_2c7_a2, { useNum: false, ident: 2 });
                LIST(rev_2_c2, { startAt: 7 });
                RESUELVE(docFontZise);
                ARTICLE(rev2_a1);
                ARTICLE(ARTICLE_10);
                ARTICLE(ARTICLE_11);
                break;
            case 'update':
                let update_c7a = [
                    `“De conformidad con lo dispuesto en el literal a) del artículo 5° del Decreto-ley 151 de 1998, el otorgamiento de la licencia determinará la adquisición de los derechos de construcción y desarrollo, ya sea parcelando, urbanizando o construyendo en los predios objeto de la misma en los términos y condiciones expresados en la respectiva licencia.`,
                    `La expedición de licencias no conlleva pronunciamiento alguno acerca de la titularidad de derechos reales ni de la posesión sobre el inmueble o inmuebles objeto de ella. Las licencias recaen sobre uno o más predios y/o inmuebles y producen todos sus efectos aún cuando sean enajenados. Para el efecto, se tendrá por titular de la licencia, a quien esté registrado como propietario en el certificado de tradición y libertad del predio o inmueble, o al poseedor solicitante en los casos de licencia de construcción.`,
                    `En el caso que el predio objeto de la licencia sea enajenado, no se requerirá adelantar ningún trámite de actualización del titular. No obstante, si el nuevo propietario así lo solicitare, dicha actuación no generará expensa a favor del curador urbano. (…)”`,
                ];
                let udate_ca = [
                    `Que de acuerdo a la normatividad vigente, las licencias urbanísticas producen todos sus efectos, aún cuando los predios sobre los cuales recaen sean enajenados. Ello en consideración a que la expedición de las licencias no conlleva pronunciamiento alguno acerca de la titularidad de los derechos reales o de posesión de los inmuebles. En ese sentido, en el caso en que el predio objeto de la licencia sea enajenado, no se requiere adelantar ningún trámite de actualización del titular, a menos que el nuevo titular así lo solicite, por lo que conforme a lo dispuesto en artículo citado, se tendrá por titular de la licencia a quien esté registrado como propietario en el certificado de tradición  libertad del predio o inmueble.`,
                    `Que sin perjuicio de lo anterior, la actualización del titular de la licencia proceden cuando así lo solicite el nuevo propietario del predio o inmueble, tal como sucede en el presente caso, motivo por el cual se encuentra pertinente y procedente expedir el presente acto administrativo.`,
                ]

                START();
                LIST(CONSIDERATIONS_ARRAY);
                LIST(update_c7a, { useNum: false, ident: 2 });
                LIST(udate_ca, { startAt: 8 });
                RESUELVE(docFontZise);
                ARTICLE(parcon[4]);
                ARTICLE(ARTICLE_2, false);
                TABLE_F51('PROPIETARIO');
                ARTICLE(ARTICLE_24);
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                break;
            case 'res':
                const RES_A = `ARTÍCULO 2.2.6.4.1.1 Ámbito de aplicación. El reconocimiento de edificaciones por parte del curador urbano o la autoridad municipal o distrital competente para expedir licencias de construcción, procederá respecto de desarrollos arquitectónicos que se ejecutaron sin obtener la respectiva licencia. El reconocimiento de la existencia de edificaciones se podrá adelantar (i) siempre que se cumpla con el uso previsto por las normas urbanísticas vigentes y, (ii) que la edificación se haya concluido como mínimo cinco (5) años antes de la entrada en vigencia de la Ley 1848 de 2017. Este término no aplicará en aquellos casos en que el solicitante deba obtener el reconocimiento por orden judicial o administrativa.`;
                const RES_P1 = `En los planes de ordenamiento territorial o los instrumentos que lo desarrollen y complementen se podrán definir las zonas del municipio o distrito en las cuales los actos de reconocimiento deban cumplir, además de las condiciones señaladas en el inciso anterior, con las normas urbanísticas que para cada caso se determine en el respectivo plan.`;
                const RES_P2 = `En los actos de reconocimiento se establecerá, si es del caso, la autorización para el reforzamiento estructural de la edificación a las normas de sismo resistencia que les sean aplicables en los términos de la Ley 400 de 1997 y el Reglamento Colombiano de Construcción Sismo Resisten-te -NSR- 10, o las normas que los adicionen, modifiquen o sustituyan.`;
                const RES_P3 = `Las construcciones declaradas Monumentos Nacionales y los bienes de interés cultural del ámbito municipal, distrital, departamental o nacional, se entenderán reconocidos con la expedición del acto administrativo que haga su declaratoria. En estos casos, el trámite de las solicitudes de licencias urbanísticas se sujetará a lo dispuesto en el presente decreto.`;
                const RES_P4 = `Los municipios, distritos y el Departamento Archipiélago de San Andrés, Providencia y Santa Catalina establecerán las condiciones para el reconocimiento de las edificaciones públicas con uso dotacional ubicadas en zonas de cesión pública obligatoria, que se destinen a servicios de salud, educación, bienestar social, deportivos y recreativos, abastecimiento de alimentos, seguridad ciudadana y defensa y justicia de las entidades del nivel central o descentralizado de la Rama Ejecutiva del orden nacional, departamental , municipal y distrital. Estas normas también se aplicarán para el reconocimiento de equipamientos destinados a la práctica de los diferentes cultos y a los equipamientos de congregaciones religiosas.`;
                const RES_P5 = `En los municipios y distritos que cuenten con la figura del curador urbano, la solicitud de apoyo técnico y el trámite de las solicitudes de reconocimiento de las viviendas de interés social que se ubiquen en asentamientos que hayan sido objeto de legalización urbanística, se tramitarán ante la oficina de planeación o la dependencia que determine el alcalde mediante acto administrativo, según lo previsto en la sección 3 del presente capítulo.`;

                let res_a1 = [
                    'Que el proyecto arquitectónico, estructural y jurídico fue revisado de acuerdo a las normas legales vigentes, por los funcionarios de esta Curaduría.',
                    `Que dentro de los documentos aportados que conforman el expediente de solicitud de ${PART_TYPE}, se encuentran:`
                ];
                let res_a2 = [
                    parcon[0],
                    parcon[1],
                    parcon[2],
                    `Que la Ley 1437 de 2011 (Código de Procedimiento Administrativo y de lo Contencioso Administrativo) en sus artículos 74 y siguientes, regula el procedimiento, la oportunidad, los requisitos, la procedibilidad y el trámite de los recursos en contra de los actos administrativos. Asimismo, el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio, establece los recursos que proceden en contra de los actos administrativos que concedan o nieguen las solicitudes de licencias.`,
                    `Que, de conformidad con lo anterior, procederá este Despacho a verificar el cumplimiento de las disposiciones exigidas por la Ley 1437 de 2011 (Código de Procedimiento Administrativo y de lo Contencioso Administrativo) y el Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio y demás normas concordantes, para la presentación de los recursos, en cuanto a su oportunidad, cumplimiento de requisitos, procedibilidad y trámite; y de haber superado los requisitos, se pronunciará sobre las consideraciones expuestas por el recurrente.`,
                ];

                let res_body = [
                    `Los recursos de reposición y de apelación en contra de los actos administrativos en cuanto al procedimiento, oportunidad, requisitos y procedibilidad, se regulan por la Ley 1437 de 2011 - Código de Procedimiento Administrativo y de lo Contencioso Administrativo (en adelante CPACA), cuyos artículos 74 a 82 son los que de forma particular resultan aplicables al caso en estudio.`,
                    `El artículo 74 del CPACA establece los recursos que proceden en contra los actos administrativos:`,
                    `1. El de reposición, ante quien expidió la decisión para que la aclare, modifique, adicione o revoque.
                    2. El de apelación, para ante el inmediato superior administrativo o funcional con el mismo propósito.
                    No habrá apelación de las decisiones de los Ministros, Directores de Departamento Administrativo, superintendentes y representantes legales de las entidades descentralizadas ni de los directores u organismos superiores de los órganos constitucionales autónomos.`,
                    `Tampoco serán apelables aquellas decisiones proferidas por los representantes legales y jefes superiores de las entidades y organismos del nivel territorial.`,
                    `3. El de queja, cuando se rechace el de apelación.`,
                    `El recurso de queja es facultativo y podrá interponerse directamente ante el superior del funcionario que dictó la decisión, mediante escrito al que deberá acompañarse copia de la providencia que haya negado el recurso.`,
                    `De este recurso se podrá hacer uso dentro de los cinco (5) días siguientes a la notificación de la decisión.
                    Recibido el escrito, el superior ordenará inmediatamente la remisión del expediente, y decidirá lo que sea del caso.`,
                    `Ahora bien, el artículo 76 del CPACA establece la oportunidad y presentación para la presentación de los recursos:`,
                    `Los recursos de reposición y apelación deberán interponerse por escrito en la diligencia de notificación personal, o dentro de los diez (10) días siguientes a ella, o a la notificación por aviso, o al vencimiento del término de publicación, según el caso. Los recursos contra los actos presuntos podrán interponerse en cualquier tiempo, salvo en el evento en que se haya acudido ante el juez.`,
                    `Los recursos se presentarán ante el funcionario que dictó la decisión, salvo lo dispuesto para el de queja, y si quien fuere competente no quisiere recibirlos podrán presentarse ante el procurador regional o ante el personero municipal, para que ordene recibirlos y tramitarlos, e imponga las sanciones correspondientes, si a ello hubiere lugar.`,
                    `El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición y cuando proceda será obligatorio para acceder a la jurisdicción.`,
                    `Los recursos de reposición y de queja no serán obligatorios.`,
                    `A su vez, el artículo 77 establece los requisitos,`,
                    `Por regla general los recursos se interpondrán por escrito que no requiere de presentación personal si quien lo presenta ha sido reconocido en la actuación. Igualmente, podrán presentarse por medios electrónicos.`,
                    `Los recursos deberán reunir, además, los siguientes requisitos:`,
                    `1. Interponerse dentro del plazo legal, por el interesado o su representante o apoderado debidamente constituido.\n2. Sustentarse con expresión concreta de los motivos de inconformidad.\n3. Solicitar y aportar las pruebas que se pretende hacer valer.\n4. Indicar el nombre y la dirección del recurrente, así como la dirección electrónica si desea ser notificado por este medio.`,
                    `Sólo los abogados en ejercicio podrán ser apoderados. Si el recurrente obra como agente oficioso, deberá acreditar la calidad de abogado en ejercicio, y prestar la caución que se le señale para garantizar que la persona por quien obra ratificará su actuación dentro del término de dos (2) meses.`,
                    `Si no hay ratificación se hará efectiva la caución y se archivará el expediente.
                    Para el trámite del recurso el recurrente no está en la obligación de pagar la suma que el acto recurrido le exija. Con todo, podrá pagar lo que reconoce deber.`,
                    `Finalmente, el ARTÍCULO 78 contempla los casos que en debe rechazarse el recurso, así:`,
                    `Si el escrito con el cual se formula el recurso no se presenta con los requisitos previstos en los numerales 1, 2 y 4 del artículo anterior, el funcionario competente deberá rechazarlo. Contra el rechazo del recurso de apelación procederá el de queja.`,
                    `El acto administrativo sobre el cual recae el recurso de reposición en subsidio el de apelación propuesto, corresponde a una resolución mediante la cual se concede un derecho de orden particular al titular de la licencia, presentados dentro del límite temporal adecuado y ante la autoridad competente para ello, esto es, ante la Curaduría Urbana No. 1 de Piedecuesta.`,
                    `El suscrito leyó con atención los argumentos contenidos en el escrito de recurso en conjunto con sus anexos. Es de resaltar que el mismo fue presentado en término.`,
                    parcon[3],
                    `Por lo anterior, se concluye que no se evidencia poder debidamente otorgado ante la autoridad competente con la correspondiente presentación personal ni en el expediente ni en el escrito con el cual se interpone el recurso, es decir, no se presenta con los requisitos del artículo 77 de la ley 1437 de 2011, correspondiente a interponerse por representante o apoderado debidamente constituido, por lo cual el suscrito no realizará pronunciamiento de fondo sobre los hechos y pretensiones que componen el mismo.`,


                ]

                const RES_A1 = `RECHAZAR EL RECURSO de reposición y en subsidio de apelación interpuesto en contra de la Resolución No. 0279 del veintiocho (28) de julio de 2022 “por la cual se niega una solicitud de reconocimiento de edificación y licencia de construcción en la modalidad de modificación-demolición parcial – reforzamiento estructural”.`;
                const RES_A2 = `CONFIRMAR el contenido de la Resolución No. 0279 del  veintiocho (28) de julio de 2022 “por la cual se niega una solicitud de reconocimiento de edificación y licencia de construcción en la modalidad de modificación – demolición parcial y reforzamiento estructural”.`;
                const RES_A3 = `NOTIFICAR personalmente al recurrente del contenido de la presente resolución. Si no se pudiere hacer la notificación personal al cabo de cinco (5) días del envío de la citación, se notificará por aviso de conformidad con el Art 69 ss., y concordantes de la Ley 1437 de 2011.`;
                const RES_A4 = `Contra el presente acto administrativo procede el recurso de queja de conformidad con lo contemplado en el artículo 245 de la ley 1437 de 2011 (Código de Procedimiento Administrativo y de lo Contencioso Administrativo).`;
                const RES_A5 = `La presente resolución rige a partir de su fecha de ejecutoria.`;


                START();
                LIST([CONSIDERATIONS_ARRAY_0, `Que el trámite de Reconocimiento de Edificación se encuentra determinada en el artículo No 2.2.6.4.1.1 del Decreto Nacional 1077 de 2015, así:`]);
                doc.moveDown();
                doc.text(RES_A, { align: 'justify' });
                doc.moveDown();
                PARAGRAPH(RES_P1, 1);
                PARAGRAPH(RES_P2, 2);
                PARAGRAPH(RES_P3, 3);
                PARAGRAPH(RES_P4, 4);
                PARAGRAPH(RES_P5, 5);
                LIST(res_a1, { startAt: 3 });
                LIST(OLD_LICS, { useNum: false, ident: 2 });
                LIST(res_a2, { startAt: 5 });
                doc.fontSize(13);
                doc.font('Helvetica-Bold')
                doc.text('\nCREQUISITOS DE PROCEDIBILIDAD DEL RECURSO DE REPOSICIÓN y APELACIÓN.\n', { align: 'center' });
                doc.font('Helvetica')
                doc.fontSize(docFontZise);
                doc.moveDown();
                res_body.map(b => {
                    doc.text(String(b), { align: 'justify' });
                    doc.moveDown();
                })
                RESUELVE(docFontZise);
                ARTICLE(RES_A1);
                ARTICLE(RES_A2);
                ARTICLE(RES_A3);
                ARTICLE(RES_A4);
                ARTICLE(RES_A5);
                break;
            case 'cota':
                let cota_text = `Que el titular de la solicitud de la presente actuación urbanística en cumplimiento del artículo 2.2.6.6.8.15., canceló las siguientes obligaciones, previos a la expedición de este acto administrativo:`;

                START();
                LIST(CONSIDERATIONS_ARRAY);
                LIST(OLD_LICS, { ident: 2 });
                LIST([cota_text], { startAt: 5 });
                LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                RESUELVE(docFontZise);
                ARTICLE(ARTICLE_1, false);
                TABLE_F2();
                ARTICLE(ARTICLE_2, false);
                TABLE_F51();
                ARTICLE(ARTICLE_3, false);
                TABLE_F52();
                PARAGRAPH(ARTICLE_3_p, false);
                ARTICLE(ARTICLE_4, false);
                doc.moveDown();
                doc.font('Helvetica-Bold')
                doc.text('Proyecto arquitectónico: ', { continued: true, align: 'justify' });
                doc.font('Helvetica');
                doc.text(ARC_DATA);
                doc.moveDown();
                ARTICLE(ARTICLE_5);
                ARTICLE(ARTICLE_9); // VIGENCIA
                ARTICLE(ARTICLE_10); // LIBRAR NOTS
                PARAGRAPH(ARTICLE_10_p, false);
                ARTICLE(ARTICLE_11);
                ARTICLE(ARTICLE_12);
                break;
            default:
                LIST(CONSIDERATIONS_ARRAY, { jump: false });
                if (_DATA.reso.model != 'parcon' || _DATA.reso.model != 'par' || _DATA.reso.model != 'sub') {
                    LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 });
                }
                if (_DATA.reso.model == 'parcon' || _DATA.reso.model == 'par' || _DATA.reso.model == 'sub') {
                    var start = _DATA.reso.model == 'parcon' || _DATA.reso.model == 'par' ? 15 : 5
                    var start2 = _DATA.reso.model == 'parcon' || _DATA.reso.model == 'par' ? 16 : 7

                    LIST([CONSIDERATIONS_PARCON_15], { startAt: start })
                    LIST(CONSIDERATIONS_PARCON_15_ARRAY, { ident: 2 })
                    doc.text(CONSIDERATIONS_PARCON_15_2, { align: 'justify' });
                    LIST(CONSIDERATIONS_PARCON_15_2_ARRAY, { ident: 2 })
                    if (_DATA.reso.model == 'sub') LIST([CONSIDERATIONS_SUB_6], { startAt: 6 })
                    LIST([CONSIDERATIONS_APY], { startAt: start2 })
                    LIST(CONSIDERATIONS_APY_ARRAY, { ident: 2 })
                }

                doc.text(`En mérito de lo expuesto en la parte considerativa, ${curaduriaInfo.pronoum} ${curaduriaInfo.job}`);
                doc.moveDown();

                doc.fontSize(13);
                doc.font('Helvetica-Bold')
                doc.text('RESUELVE', { align: 'center' });
                doc.font('Helvetica')
                doc.fontSize(docFontZise);
                doc.moveDown();

                ARTICLE(ARTICLE_1, false);

                TABLE_F2();

                ARTICLE(ARTICLE_2, false);

                TABLE_F51();

                PARAGRAPH(ARTICLE_2_p, 1)

                ARTICLE(ARTICLE_3, false);

                TABLE_F52();

                if (_DATA.reso.model == 'sub') {
                    ARTICLE('Autorizar la subdivisión con las características básicas que a continuación se describen:');

                    doc.font('Helvetica-Bold')
                    doc.text('Proyecto arquitectónico: ');
                    doc.text('Proyecto estructural: ');
                    doc.moveDown();

                    PARAGRAPH(ARTICLE_4_p3, 1)
                } else {
                    ARTICLE(ARTICLE_4);

                    doc.font('Helvetica-Bold')
                    doc.text('Proyecto arquitectónico: ');
                    doc.text('Proyecto estructural: ');
                    doc.moveDown();

                    PARAGRAPH(ARTICLE_4_p1, 1)
                    PARAGRAPH(ARTICLE_4_p2, 2)
                }

                if (_DATA.reso.model == 'parcon' || _DATA.reso.model == 'par') ARTICLE(ARTICLE_5_PARCON)

                ARTICLE(ARTICLE_5);

                if (_DATA.reso.model == 'reccon') {

                } else if (_DATA.reso.model == 'sub') {
                    ARTICLE('Aspectos técnicos:');
                    LIST(ARTICLE_5_ARRAY_SUB);
                }
                else {

                    ARTICLE(ARTICLE_6); // OBLIGACIONES TITUTLAR

                    LIST(ARTICLE_6_ARRAY);

                    ARTICLE('Obligaciones Adicionales:');

                    LIST(ARTICLE_7_ARRAY, { jump: false });
                    LIST(ARTICLE_7_18_ARRAY, { ident: 3, useNum: false });

                    doc.text(ARTICLE_7_P, { align: 'justify' });
                    doc.moveDown();

                    if (_DATA.reso.model != 'par') {
                        ARTICLE('Aspectos Técnicos');

                        LIST(ARTICLE_8_ARRAY);
                    }

                }


                ARTICLE(ARTICLE_9); // VIGENCIA

                if (_DATA.reso.model == 'reccon') { }
                else if (_DATA.reso.model == 'sub') PARAGRAPH(ARTICLE_9_p3, 1)
                else {
                    PARAGRAPH(ARTICLE_9_p1, 1)
                    PARAGRAPH(ARTICLE_9_p2, 2)
                }


                ARTICLE(ARTICLE_10); // LIBRAR NOTS

                LIST(ARTICLE_10_ARRAY);

                PARAGRAPH(ARTICLE_10_p, 1)

                ARTICLE(ARTICLE_11);


                if (_DATA.reso.model == 'onn') ARTICLE(ARTICLE_12);

                if (_DATA.reso.model == 'ons' || _DATA.reso.model == 'rec' || _DATA.reso.model == 'parcon' || _DATA.reso.model == 'par') { ARTICLE(ARTICLE_12_b); }
                if (_DATA.reso.model == 'ons' || _DATA.reso.model == 'rec' || _DATA.reso.model == 'reccon' || _DATA.reso.model == 'parcon' || _DATA.reso.model == 'par' || _DATA.reso.model == 'sub') ARTICLE(ARTICLE_12);

        }


    }

    let size1 = doc.heightOfString(`Expedida en ${_DATA.reso.ciudad} el ${dateParser(_DATA.reso.date)}`);
    let size2 = doc.heightOfString(`\n\n\n\n\n${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}\nNOTIFÍQUESE Y CÚMPLASE,`);
    if (doc.y + size1 + size2 > doc.page.height - doc.page.margins.bottom) { doc.addPage(); doc.y = doc.page.margins.top }

    doc.text(`Expedida en ${_DATA.reso.ciudad} el ${dateParser(_DATA.reso.reso_date)}`);
    doc.text(`\n`);
    doc.font('Helvetica-Bold')
    doc.text(`NOTIFÍQUESE Y CÚMPLASE,`);

    doc.fontSize(11);
    doc.font('Helvetica-Bold')
    doc.text(`\n\n\n\n\n${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`, { align: _DATA.r_sign_align });
    doc.text(curaduriaInfo.job, { align: _DATA.r_sign_align });

    if (_DATA.r_signs) pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: _ARRAY_PROFESIONAL[0], config: { align: 'center', bold: true, hide: true } },
            { coord: [20, 0], w: 20, h: 1, text: _ARRAY_PROFESIONAL[1], config: { align: 'center', bold: true, hide: true } },
            { coord: [40, 0], w: 20, h: 1, text: _ARRAY_PROFESIONAL[2], config: { align: 'center', bold: true, hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true })


    if (_DATA.r_simple) {
        doc.text(`\n`);
        doc.fontSize(8);
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'Revisó y protectó: ' + _DATA.r_simple_name, config: { align: 'left', bold: true, hide: true } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true })
    }

    // THIS IS ACTUALY THE EJECUTORIA
    if (_DATA.reso.record_eje != '0') {
        let vigencia = _DATA.reso.record_eje != '1' ? `VIGENCIA: ${_DATA.reso.record_eje} A PARTIR DE SU EJECUTORIA\n\n` : '\n'
        let ej_text = `\nEJECUTORIADA EL ______________________\n${vigencia}`
        doc.text(`\n`);
        doc.fontSize(10);
        pdfSupport.table(doc,
            [
                { coord: [10, 0], w: 40, h: 1, text: ej_text, config: { align: 'center', bold: true } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true })
    }

    // NOTIFICATION
    if (_DATA.type_not == 1) {
        doc.fontSize(8).text('\n');
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'NOTIFICACIÓN PERSONAL', config: { align: 'center', bold: true, valign: true } },
            ],
            [doc.x, doc.y],
            [60, 1],
            { lineHeight: -1 })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'NOMBRE DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
                { coord: [15, 0], w: 15, h: 1, text: 'DOCUMENTO DE IDENTIDAD', config: { align: 'center', bold: true, valign: true } },
                { coord: [30, 0], w: 15, h: 1, text: 'FECHA Y HORA DE NOTIFICACIÓN', config: { align: 'center', bold: true, valign: true } },
                { coord: [45, 0], w: 15, h: 1, text: 'FIRMA DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
            ],
            [doc.x, doc.y],
            [60, 1],
            { lineHeight: -1 })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [15, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [30, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                { coord: [45, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },

            ],
            [doc.x, doc.y],
            [60, 2],
            { lineHeight: -1 })
    }

    // PAGINATION AND FOOTER
    doc.fontSize(8);
    if (_DATA.r_pagesx) {
        pdfSupport.setBottom(doc, _DATA.r_pagesn, _DATA.r_pagesi, doc.page.height - 62, doc.page.width - doc.page.margins.right - 90);
        doc.x = doc.page.margins.left;
    }
    else pdfSupport.setBottom(doc, _DATA.r_pagesn, _DATA.r_pagesi, 64);

    // HEADER
    const range = doc.bufferedPageRange();
    doc.switchToPage(0);
    doc.fontSize(10);
    for (var i = range.start + not_page; i < range.count; i++) {
        doc.switchToPage(i);
        let originalMargins = doc.page.margins;
        doc.page.margins = {
            top: 0,
            bottom: doc.page.margins.bottom,
            left: doc.page.margins.left,
            right: doc.page.margins.right
        };
        doc.y = _DATA.margins.m_top * maringConverter

        let header_starts = [0, 20, 40];
        let header_widths = [20, 20, 40];

        if (_DATA.r_logo == 'right' || _DATA.r_logo == 'right2') header_starts = [0, 18, 36];
        if (_DATA.r_logo == 'left' || _DATA.r_logo == 'left2') header_starts = [14, 32, 50]
        if (_DATA.r_logo != 'no') header_widths = [10, 18, 36];

        doc.fontSize(8);
        pdfSupport.table(doc,
            [
                { coord: [header_starts[0], 0], w: header_widths[2], h: 1, text: 'Tipo y modalidad de licencia urbanística', config: { align: 'center' } },
                { coord: [header_starts[2], 0], w: header_widths[0], h: 1, text: 'Estado', config: { align: 'center' } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })
        doc.fontSize(10);
        pdfSupport.table(doc,
            [
                { coord: [header_starts[0], 0], w: header_widths[2], h: 1, text: `${_DATA.reso.tipo}`, config: { align: 'center', fill: 'steelblue', color: 'white', valign: true, bold: true, } },
                { coord: [header_starts[2], 0], w: header_widths[0], h: 1, text: `${_DATA.reso.reso_state}`, config: { align: 'center', valign: true, bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        let date = `Fecha Radicación ${fun_c.legal_date}`;
        let reso_id = _DATA.reso.reso_id ? _DATA.reso.reso_id.includes('-') ? _DATA.reso.reso_id.split('-')[1] : _DATA.reso.reso_id : '';
        let txt_res = `RESOLUCIÓN\n${reso_id} DEL ${dateParser(_DATA.reso.reso_date).toUpperCase()}`;
        if (_DATA.reso.model == 'eje') txt_res = `CERTIFICACIÓN DE EJECUTORIA`
        doc.fontSize(8);
        pdfSupport.table(doc,
            [
                { coord: [header_starts[0], 0], w: header_widths[1], h: 1, text: txt_res, config: { align: 'center', valign: true, bold: true, } },
                { coord: [header_starts[1], 0], w: header_widths[1], h: 1, text: `ID ${fun.id_public}\n${date}`, config: { align: 'center', valign: true, bold: true, } },
                { coord: [header_starts[2], 0], w: header_widths[0], h: 1, text: `Conforme al ${curaduriaInfo.pot.pot}\n Acuerdo ${_DATA.reso.reso_pot}`, config: { align: 'center', valign: true, bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        // HEADER TEXT
        if (_DATA.reso.header_text) pdfSupport.table(doc,
            [
                { coord: [header_starts[0], 0], w: 60, h: 1, text: _DATA.reso.header_text, config: { align: 'center' } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        doc.fontSize(10);




        doc.y = 80
        if (_DATA.r_logo == 'left2' || _DATA.r_logo == 'right2') {
            if (i % 2 != 0 && _DATA.r_logo == 'left2') doc.image('docs/public/logo192.png', doc.page.margins.left + 30, doc.y, { width: 60, height: 60 })
            if (i % 2 != 0 && _DATA.r_logo == 'right2') doc.image('docs/public/logo192.png', 460, doc.y, { width: 60, height: 60 })
        }
        else if (_DATA.r_logo == 'left' || _DATA.r_logo == 'right') {
            if (_DATA.r_logo == 'left') doc.image('docs/public/logo192.png', doc.page.margins.left + 30, doc.y, { width: 60, height: 60 })
            if (_DATA.r_logo == 'right') doc.image('docs/public/logo192.png', 460, doc.y, { width: 60, height: 60 })
        }

    }
    doc.end();

    const serializeData = (data) => {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            return typeof value === "function" ? undefined : value;
        }));
    };

    result_doc_info = {
        "_areas_table": serializeData(_areas_table),
        "_DATA": serializeData(_DATA),
        // Argumentos de funcionalidad
        "type_not": _DATA.type_not,
        "reso": _DATA.reso,
        "isSub_1": fun_1.tipo.includes('C'),
        "curaduriaInfo": curaduriaInfo,
        "fun_1": fun_1,
        "fun_2": fun_2,
        "record_arc": record_arc,
        "record_arc_33_areas": record_arc_33_areas,
        "record_arc_36_infos": record_arc_36_infos,
        "record_arc_35_parkings": record_arc_35_parkings,
        "fun_c": fun_c,
        // AREA TABLES
        /*"_GET_CHILD_33_AREAS":_GET_CHILD_33_AREAS,
        "_GET_CHILD_33_AREAS_BLUEPRINTS":_GET_CHILD_33_AREAS_BLUEPRINTS,
        "_GET_UNITS_A_TOTAL":_GET_UNITS_A_TOTAL,
        "_GET_UNITS_U_TOTAL":_GET_UNITS_U_TOTAL,
        "_GET_COMMON_A_TOTAL":_GET_COMMON_A_TOTAL,*/
        // "_GET_TOTAL_AREA_SUM":_GET_TOTAL_AREA_SUM,
        /*"_GET_TOTAL_DESTROY":_GET_TOTAL_DESTROY,
        "_GET_HISTORIC":_GET_HISTORIC,
        "_GET_AJUSTES":_GET_AJUSTES,
        "_GET_NET_INDEX":_GET_NET_INDEX,
        "_GET_ARRAY_A":_GET_ARRAY_A,
        "_GET_TOTAL_AREA":_GET_TOTAL_AREA,
        "_ADD_AREAS":_ADD_AREAS,
        "_ADD_AREAS_H":_ADD_AREAS_H,
        "_ADD_AREAS_I":_ADD_AREAS_I,*/
        //"_GET_CHILD_34_K":_GET_CHILD_34_K,
        //"_GET_CHILD_36_INFO":_GET_CHILD_36_INFO,
        //"_GET_CHILD_35_PARKING":_GET_CHILD_35_PARKING,
        /*"_GET_CHILD_2":_GET_CHILD_2,
        "_GET_CHILD_53":_GET_CHILD_53,*/
        "fun": fun,
        "f2": f2,
        "f51": f51,
        "f52": f52,
        "f53": f53,
        "rer": rer,
        /*"_FIND_F5":_FIND_F5,*/
        "ra33b": ra33b,
        /*"LOAD_STEP":LOAD_STEP,
        "_GET_STEP_TYPE":_GET_STEP_TYPE,
        "_GET_STEP_TYPE_JSON":_GET_STEP_TYPE_JSON,*/
        "segundo_cb": segundo_cb,
        "cuarto": cuarto,
        "quinto": quinto,
        "sexto_v": sexto_v,
        "sexto_v_cb": sexto_v_cb,
        "septimo_cb": septimo_cb,
        "arts_cb": arts_cb,
        "action_word": action_word,
        "_BODY": _BODY,
        "_BODY_PRIMERO_A": _BODY_PRIMERO_A,
        "_BODY_PRIMERO": _BODY_PRIMERO,
        "_BODY_PRIMERO_a": _BODY_PRIMERO_a,
        "_BODY_PRIMERO_SUB": _BODY_PRIMERO_SUB,
        "_MAIN_USE": _MAIN_USE,
        "_BODY_SEGUNDO": _BODY_SEGUNDO,
        "_BODY_SEGUNDO_SUB": _BODY_SEGUNDO_SUB,
        "_SEGUNDO_ARRAY": _SEGUNDO_ARRAY,
        "_BODY_TERCERO": _BODY_TERCERO,
        "_BODY_TERCERO_SUB": _BODY_TERCERO_SUB,
        "_TERCERO_ARRAY": _TERCERO_ARRAY,
        "_BODY_CUARTO": _BODY_CUARTO,
        "_BODY_CUARTO_SUB": _BODY_CUARTO_SUB,
        "_BODY_QUINTO": _BODY_QUINTO,
        "_BODY_QUINTO_SUB": _BODY_QUINTO_SUB,
        "_BODY_SEXTO": _BODY_SEXTO,
        "_BODY_SEXTO_SUB": _BODY_SEXTO_SUB,
        "_SEXTO_ARRAY_SUB": _SEXTO_ARRAY_SUB,
        "_SEXTO_ARRAY": _SEXTO_ARRAY,
        "_SEXTO_PAY_ARRAY": _SEXTO_PAY_ARRAY,
        "_BODY_SEPTIMO_SUB": _BODY_SEPTIMO_SUB,
        "_BODY_OCTAVO_SUB": _BODY_OCTAVO_SUB,
        "_BODY_NOVENO_SUB": _BODY_NOVENO_SUB,
        "_NOVENO_ARRAY_SUB": _NOVENO_ARRAY_SUB,
        "_BODY_DECIMO_SUB": _BODY_DECIMO_SUB,
        "_BODY_ART_1": _BODY_ART_1,
        "_BODY_ART_1_SUB": _BODY_ART_1_SUB,
        "_BODY_ART_1p": _BODY_ART_1p,
        "_BODY_ART_1_a": _BODY_ART_1_a,
        "_BODY_ART_1_2": _BODY_ART_1_2,
        "_BODY_ART_2": _BODY_ART_2,
        "_BODY_ART_2_SUB": _BODY_ART_2_SUB,
        "_BODY_ART_2_a": _BODY_ART_2_a,
        "_BODY_ART_2_a_2": _BODY_ART_2_a_2,
        "_BODY_ART_3_a": _BODY_ART_3_a,
        "_BODY_ART_3": _BODY_ART_3,
        "topo": topo,
        "_BODY_ART_3_SUB": _BODY_ART_3_SUB,
        "_BODY_ART_3_SUB_a": _BODY_ART_3_SUB_a,
        "_BODY_ART_4_a": _BODY_ART_4_a,
        "_BODY_ART_4_SUB": _BODY_ART_4_SUB,
        "_ARRAY_DESC": _ARRAY_DESC,
        "_BODY_ART_5": _BODY_ART_5,
        "_BODY_ART_5_SUB": _BODY_ART_5_SUB,
        "_BODY_ART_5P": _BODY_ART_5P,
        "_BODY_ART_5_a": _BODY_ART_5_a,
        "_BODY_ART_6": _BODY_ART_6,
        "_BODY_ART_6_SUB": _BODY_ART_6_SUB,
        "_ARRAY_ART_6": _ARRAY_ART_6,
        "_BODY_ART_6_a": _BODY_ART_6_a,
        "duty_2": duty_2,
        "duty_6": duty_6,
        "duty_9": duty_9,
        "duty_10": duty_10,
        "duty_17": duty_17,
        "duty_18": duty_18,
        "duty_19": duty_19,
        "duty_20": duty_20,
        "duty_21": duty_21,
        "_BODY_DUTY": _BODY_DUTY,
        "_DUTY_ARRAY": _DUTY_ARRAY,
        "_BODY_DUTY_2": _BODY_DUTY_2,
        "_BODY_DUTY_3": _BODY_DUTY_3,
        "_DUTY_ARRAY_2": _DUTY_ARRAY_2,
        "_ARRAY_ART_7": _ARRAY_ART_7,
        "_ARRAY_ART_7_SUB": _ARRAY_ART_7_SUB,
        "_BODY_ART_7P": _BODY_ART_7P,
        "art_8": art_8,
        "art_8p": art_8p,
        "art_8p1": art_8p1,
        "art_9": art_9,
        "_BODY_ART_8": _BODY_ART_8,
        "_BODY_ART_8P1": _BODY_ART_8P1,
        "_BODY_ART_8P2": _BODY_ART_8P2,
        "_BODY_ART_9": _BODY_ART_9,
        "_BODY_ART_10": _BODY_ART_10,
        "record_law": record_law,
        "record_eng": record_eng,
        "_ARRAY_PROFESIONAL": _ARRAY_PROFESIONAL,
        "LIST_BLUEPRINT_ENGT": LIST_BLUEPRINT_ENGT,
        "CON_ORDER": CON_ORDER,
        "CON_ORDER_i": CON_ORDER_i,
        "CHECK": CHECK,
        "CHECK2": CHECK2,
        "CATEGORY": CATEGORY,
        "titlesShorts": titlesShorts,
        /*"VV":VV,
        "CV":CV,
        "CV3":CV3,
        "CV2":CV2,*/
        // Special tables with DOC
        /*"TABLE_F2":TABLE_F2,
        "TABLE_F51":TABLE_F51,
        "TABLE_F52":TABLE_F52,*/
        "art": art, //Not in group
        /*"ARTICLE":ARTICLE,
        "PARAGRAPH":PARAGRAPH,
        "LIST":LIST,
        "RESUELVE":RESUELVE,
        "TEXT_JUMP":TEXT_JUMP,*/
        "not_page": not_page,
    }

    return result_doc_info;
}
function _PDFGEN_DOC_FINAL_NOT(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 86,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });

    const _BODY = `Por el presente medio me permito citarlo(a) para que en un término máximo de cinco (5) días hábiles, contados 
    a partir de la fecha de recibo de esta comunicación, comparezca ante esta Curaduría Urbana, con el objeto de notificarle 
    personalmente del contenido de la Resolución No. ${_DATA.res_id}, del ${dateParser(_DATA.res_date)} emitida dentro del 
    trámite con Radicado No. ${_DATA.id_public}.`.replace(/[\n\r]+ */g, ' ');

    const _BODY2 = `Transcurrido el término anterior, se procederá a la notificación mediante aviso, de conformidad con 
    lo establecido en el artículo 69 de la Ley 1437 de 2011 -CPACA-.`.replace(/[\n\r]+ */g, ' ');

    const _BODY_CUP1 = `Dado lo anterior, podrá presentarse en la oficina de la suscrita Curadora Urbana N° 1 de Piedecuesta ubicada en la Carrera 15 No. 3AN – 10 “Centro Comercial De la Cuesta” en el Local 321, `.replace(/[\n\r]+ */g, ' ');
    const _BODY_CUP1_2 = `de lunes a viernes en el horario de 2:00 P.M.  a  5:00 P.M.`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/exp_final_not.pdf'));

    doc.font('Helvetica')
    doc.fontSize(10)
    doc.text('\n\n\n');
    doc.text(_DATA.city + ", " + dateParser(_DATA.date_doc));
    doc.text('\n\n');
    doc.text('Señore(s)');
    doc.font('Helvetica-Bold')
    doc.text(_DATA.name);
    if (_DATA.email) doc.text(_DATA.email);
    if (_DATA.address) doc.text(_DATA.address);
    doc.font('Helvetica')
    doc.text('\n');
    doc.text(`Asunto: Citación para notificación personal, Actuación `, { continued: true });
    doc.font('Helvetica-Bold')
    doc.text(_DATA.id_public,);
    doc.font('Helvetica')
    doc.text('\n');
    doc.text('Cordial Saludo,');
    doc.text('\n');
    doc.text(_BODY, { align: 'justify' });
    doc.text('\n');
    if (curaduriaInfo.id == 'cup1') {
        doc.text(_BODY_CUP1, { align: 'justify', continued: true });
        doc.font('Helvetica-Bold')
        doc.text(_BODY_CUP1_2);
        doc.text('\n');
    }
    doc.text(_BODY2, { align: 'justify' });
    doc.text('\n');
    doc.font('Helvetica-Bold')
    doc.text('Atentamente,');
    doc.font('Helvetica')

    pdfSupport.setSign(doc)
    pdfSupport.setHeader(doc, { title: 'CITACIÓN PARA NOTIFICACIÓN DE RESOLUCIÓN', id_public: _DATA.cub, icon: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC_FINAL_NOT_CUP1(_DATA) {
    const PDFDocument = require('pdfkit');
    var doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 86,
            bottom: 86,
            left: 86,
            right: 86
        },
        bufferPages: true,
    });

    const BODY = `De acuerdo con lo ordenado en Resolución No. ${_DATA.res_id}, del ${dateParser(_DATA.res_date)} emitida 
    dentro del trámite con el número de radicado de
    la referencia, y en cumplimiento a lo dispuesto en el artículo 68 de la Ley 1437 de 2011 -CPACA-,
    sírvase comparecer a la Oficina de la suscrita Curadora Urbana N° 1 de Piedecuesta ubicada en
    el Local 321 del “Centro Comercial Delacuesta” ubicado en la Carrera 15 No. 3AN - 10, dentro
    de los cinco (5) días hábiles siguientes al recibo de la presente comunicación en el `.replace(/[\n\r]+ */g, ' ');
    const BODY_a = `, de lunes a viernes, con el fin de surtir la notificación personal del mencionado
    acto administrativo.`.replace(/[\n\r]+ */g, ' ');
    const BODY_2 = `Si no pudiere hacerse la notificación personal al cabo de los cinco (5) días del envío de la
    presente citación, esta se hará por medio de AVISO, de conformidad con lo establecido en el
    artículo 69 de la Ley 1437 de 2011 -CPACA-.`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/exp_final_not.pdf'));

    doc.font('Helvetica')
    doc.fontSize(10)
    doc.text('\n\n\n');
    doc.text(_DATA.city + ", " + dateParser(_DATA.date_doc));
    doc.text('\n\n');
    doc.text('Señor(a)');
    doc.font('Helvetica-Bold')
    doc.text(_DATA.name);
    if (_DATA.email) doc.text(_DATA.email);
    if (_DATA.address) doc.text(_DATA.address);
    doc.text('E.S.M');
    doc.font('Helvetica')
    doc.text('\n\n');
    doc.text(`Ref. Citación para notificación personal Radicado `, { continued: true });
    doc.font('Helvetica-Bold')
    doc.text(_DATA.id_public)
    doc.text('\n\n\n');
    doc.font('Helvetica-Bold')
    doc.text('Cordial Saludo,');
    doc.font('Helvetica')
    doc.text('\n');
    doc.text(BODY, { align: 'justify', continued: true, });
    doc.font('Helvetica-Bold')
    doc.text(`horario de Lunes a Viernes de 2:00 P.M. a 4:00 P.M.`, { align: 'justify', continued: true, });
    doc.font('Helvetica')
    doc.text(BODY_a, { align: 'justify' });
    doc.text('\n');
    doc.text(BODY_2, { align: 'justify' });
    doc.text('\n');
    doc.font('Helvetica-Bold')
    doc.text('Atentamente,');
    doc.font('Helvetica')

    pdfSupport.setSign(doc)
    pdfSupport.setHeader(doc, { title: 'CITACIÓN PARA NOTIFICACIÓN DE RESOLUCIÓN', id_public: _DATA.cub, icon: true, bold_id: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function _PDFGEN_DOC_EJE(_DATA) {
    const PDFDocument = require('pdfkit');
    var maringConverter = 28.346456693 //   THIS IS 1 cm
    var doc = new PDFDocument({
        size: 'FOLIO',
        margins: {
            top: _DATA.margins.m_top * maringConverter + 85,
            bottom: _DATA.margins.m_bot * maringConverter,
            left: _DATA.margins.m_left * maringConverter,
            right: _DATA.margins.m_right * maringConverter,
        },
        bufferPages: true,
    });

    var _VALUE_ARRAY;
    var _CHECK_ARRAY;
    var _JSON_STEP;

    const fun = _DATA.fun;
    const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
    const fun_2 = _DATA ? _DATA.fun_2 ? _DATA.fun_2 : false : false;
    const record_arc = _DATA ? _DATA.record_arc : false;
    const record_arc_33_areas = record_arc ? record_arc.record_arc_33_areas ? record_arc.record_arc_33_areas : [] : [];
    const record_arc_36_infos = record_arc ? record_arc.record_arc_36_infos ? record_arc.record_arc_36_infos : [] : [];
    const record_arc_35_parkings = record_arc ? record_arc.record_arc_35_parkings ? record_arc.record_arc_35_parkings : [] : [];
    const fun_c = _DATA ? _DATA.fun_cs ? _DATA.fun_cs.length > 0 ? _DATA.fun_cs[0] : false : false : false;


    // ---------------------------------
    // --------------- BODUES OF DOCUMENT
    // ---------------------------------

    // AREA TABLES
    let _GET_CHILD_33_AREAS = () => {
        var _CHILD = record_arc_33_areas;
        var _AREAS = [];
        if (_CHILD) {
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].type == "area") {
                    _AREAS.push(_CHILD[i])
                }
            }
        }
        return _AREAS;
    }
    let _GET_CHILD_33_AREAS_BLUEPRINTS = () => {
        var _LIST = _GET_CHILD_33_AREAS();
        var _AREAS = [];
        if (_LIST) {
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].type == "blueprint") {
                    _AREAS.push(_LIST[i])
                }
            }
        }
        return _AREAS;
    }
    let _GET_UNITS_A_TOTAL = (filter = false) => {
        let sum_a = 0;
        let areas = _GET_CHILD_33_AREAS();
        areas.map(area => {
            if (filter) {
                let use = String(area.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let units = _GET_ARRAY_A(area.units_a, ';');
                    units.map(unit => sum_a += Number(unit))
                }
            }
            else {
                let units = _GET_ARRAY_A(area.units_a, ';');
                units.map(unit => sum_a += Number(unit))
            }

        })

        return (sum_a).toFixed(2);
    }
    let _GET_UNITS_U_TOTAL = (filter = false) => {
        let sum_a = 0;
        let areas = _GET_CHILD_33_AREAS();
        areas.map(area => {
            if (filter) {
                let use = String(area.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let units = _GET_ARRAY_A(area.units, ';');
                    units.map(unit => sum_a += Number(unit))
                }
            }
            else {
                let units = _GET_ARRAY_A(area.units, ';');
                units.map(unit => sum_a += Number(unit))
            }

        })

        return (sum_a).toFixed(2);
    }
    let _GET_COMMON_A_TOTAL = (filter = false) => {
        let sum_a = 0;
        let areas = _GET_CHILD_33_AREAS();
        areas.map(area => {
            if (filter) {
                let use = String(area.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let units = _GET_ARRAY_A(area.build, ',');
                    units.map(unit => sum_a += Number(unit))
                }
            } else {
                let units = _GET_ARRAY_A(area.build, ',');
                units.map(unit => sum_a += Number(unit))
            }

        })

        return (sum_a).toFixed(2);
    }
    let _GET_TOTAL_AREA_SUM = (areas) => {
        let sum = 0;
        areas.map(area => sum += Number(_GET_TOTAL_AREA(area.build, area.historic_areas)))
        return sum.toFixed(2)
    }
    let _GET_TOTAL_DESTROY = (_destroy) => {
        if (!_destroy) return 0;
        var destroy = _destroy ? _destroy.split(",") : [];
        let sum = destroy.reduce((p, n) => Number(p) + Number(n))
        return (sum).toFixed(2);
    }
    let _GET_HISTORIC = (_historic) => {
        let STEP = LOAD_STEP('a_config', 'arc');
        let json = STEP ? STEP.json ? STEP.json : {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        var historic = _historic ? _historic.split(';') : [];
        let reduced = historic.filter((_h, i) => {
            if (!tagsH[i]) return false
            let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return tag.includes('historic');
        })
        let sum = 0;
        reduced.map((r) => sum += Number(r))
        return sum;
    }
    let _GET_AJUSTES = (_historic) => {
        let STEP = LOAD_STEP('a_config', 'arc');
        let json = STEP ? STEP.json ? STEP.json : {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        var historic = _historic ? _historic.split(';') : [];
        let reduced = historic.filter((_h, i) => {
            if (!tagsH[i]) return false
            let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return tag.includes('ajuste');
        })
        let sum = 0;
        reduced.map((r) => sum += Number(r))
        return sum;
    }

    let _GET_NET_INDEX = (_build, _destroy, _historic) => {
        if (!_build) return 0;
        var destroy = Number(_ADD_AREAS(_destroy));
        var areaToBuild = _GET_TOTAL_AREA(_build, _historic);
        var _NET_IDEX = Number(areaToBuild) - Number(destroy);
        return (_NET_IDEX).toFixed(2);
    }
    let _GET_ARRAY_A = (_var, ss) => {
        if (_var) return _var.split(ss);
        else return [];
    }
    let _GET_TOTAL_AREA = (_build, _historic) => {
        if (!_build) return 0;
        var build = _build.split(",");
        var area_1 = 0;
        var area_5 = 0
        var historic = _GET_HISTORIC(_historic)
        var ajustes = _GET_AJUSTES(_historic)
        if (build[0] > 0) area_1 += Number(build[0]);
        if (build[1] > 0) area_1 += Number(build[1]);
        if (build[10] > 0) area_1 += Number(build[10]);
        //if (build[6] > 0) area_5 = Number(build[6]);
        if (build[7] > 0) area_5 += Number(build[7]);
        var _TOTAL_AREA = Number(historic) + Number(ajustes) + area_1 - area_5;
        return (_TOTAL_AREA).toFixed(2);
    }
    let _ADD_AREAS = (_array) => {
        if (!_array) return 0;
        var areas = _array.split(",");
        var sum = 0;
        for (var i = 0; i < areas.length; i++) {
            sum += Number(areas[i])
        }
        return sum.toFixed(2);
    }
    let _ADD_AREAS_H = (_areas, key, i, filter) => {
        let sum = 0;
        _areas.map(areas => {
            let value = areas[key] ? areas[key].split(';') : [];
            if (!filter) {
                let area = value[i] ? value[i] : 0;
                sum += Number(area)
            }
            if (filter) {
                let use = String(areas.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let area = value[i] ? value[i] : 0;
                    sum += Number(area)
                }
            }
        })

        return sum.toFixed(2);
    }

    let _ADD_AREAS_I = (_array, i, filter) => {
        if (!_array) return 0;
        let sum = 0;

        _array.map(areas => {
            if (!filter) {
                var area = areas.build ? areas.build.split(",") : 0;
                sum += Number(area[i]) || 0
            }
            if (filter) {
                let use = String(areas.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    var area = areas.build ? areas.build.split(",") : 0;
                    sum += Number(area[i]) || 0
                }
            }

        })

        return sum.toFixed(2);
    }
    // ************************
    let _GET_CHILD_34_K = () => {
        var _CHILD = _DATA.record_arc.record_arc_34_ks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _GET_CHILD_36_INFO = () => {
        var _CHILD = _DATA.record_arc.record_arc_36_infos;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _GET_CHILD_35_PARKING = () => {
        var _CHILD = _DATA.record_arc.record_arc_35_parkings;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _GET_CHILD_2 = () => {
        var _CHILD = _DATA.fun_2;
        var _CHILD_VARS = {
            direccion: _CHILD ? _CHILD.direccion : '',
            direccion_ant: _CHILD ? _CHILD.direccion_ant : '',
            matricula: _CHILD ? _CHILD.matricula : '',
            catastral: _CHILD ? _CHILD.catastral : '',
            suelo: _CHILD ? _CHILD.suelo : '',
            lote_pla: _CHILD ? _CHILD.lote_pla : '',
            barrio: _CHILD ? _CHILD.barrio : '',
            vereda: _CHILD ? _CHILD.vereda : '',
            comuna: _CHILD ? _CHILD.comuna : '',
            sector: _CHILD ? _CHILD.sector : '',
            corregimiento: _CHILD ? _CHILD.corregimiento : '',
            lote: _CHILD ? _CHILD.lote : '',
            estrato: _CHILD ? _CHILD.estrato : '',
            manzana: _CHILD ? _CHILD.manzana : '',
        }
        return _CHILD_VARS;
    }

    let _GET_CHILD_53 = () => {
        var _CHILD = _DATA.fun_53s;
        var _CURRENT_VERSION = (_DATA.version || 1) - 1;
        if (!_CHILD) return {
            item_5311: '',
            item_5312: '',
            item_532: '',
            item_533: '',
        };
        if (!_CHILD[_CURRENT_VERSION] || !_CHILD) return {
            item_5311: '',
            item_5312: '',
            item_532: '',
            item_533: '',
        };
        var _CHILD_VARS = {
            item_5311: _CHILD[_CURRENT_VERSION].name || '',
            item_5312: _CHILD[_CURRENT_VERSION].surname || '',
            item_532: _CHILD[_CURRENT_VERSION].id_number || '',
            item_533: _CHILD[_CURRENT_VERSION].role || '',
            item_534: _CHILD[_CURRENT_VERSION].number || '',
            item_535: _CHILD[_CURRENT_VERSION].email || '',
            item_536: _CHILD[_CURRENT_VERSION].address || '',
            docs: _CHILD[_CURRENT_VERSION].docs || '',
        }
        return _CHILD_VARS;
    }

    const f2 = _GET_CHILD_2();
    const f51 = _DATA.fun_51s
    const f52 = _DATA.fun_52s
    const f53 = _GET_CHILD_53();
    const rer = _DATA.record_eng ? _DATA.record_eng.record_eng_reviews ? _DATA.record_eng.record_eng_reviews[0] : {} : {};

    function _FIND_F5(fun5, role) {
        if (!fun5) return {};
        for (let i = 0; i < fun5.length; i++) {
            const f5 = fun5[i];
            if (f5.role == role) {
                return f5;
            }
        }
        return {};
    }

    const ra33b = _GET_CHILD_33_AREAS_BLUEPRINTS()

    function LOAD_STEP(_id_public, record) {
        var _CHILD = [];
        if (record == 'eng') _CHILD = _DATA.record_eng.record_eng_steps;
        if (record == 'arc') _CHILD = _DATA.record_arc.record_arc_steps;
        if (record == 'law') _CHILD = _DATA.record_law.record_law_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == _DATA.version && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }

    function _GET_STEP_TYPE(_id_public, _type, record) {
        var STEP = LOAD_STEP(_id_public, record);
        if (!STEP) return [];
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (!value.length) return [];
        value = value.split(';');
        return value
    }

    function _GET_STEP_TYPE_JSON(_id_public, _type, record) {
        var STEP = LOAD_STEP(_id_public, record);
        if (!STEP) return {};
        var value = STEP[_type] ? STEP[_type] : {}
        if (!value) return {};
        return value
    }
    function TABLE_F2(hide = false, area) {
        doc.moveDown();
        let ADDRESS_LABLE = 'Dirección';
        let cl_wd = area ? 10.8 : 13.5;

        let tail_columns_hd = area ? [
            //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: 'Municipio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
            { coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: 'Área predio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },

        ] :
            [
                //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: 'Municipio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },

            ];
        let tail_columns_bd = area ? [
            //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: curaduriaInfo.city, config: { align: 'center', hide: hide, } },
            { coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: area + 'm2', config: { align: 'center', hide: hide, } },

        ] :
            [
                //{ coord: [cl_wd * 4 + 6, 0], w: cl_wd, h: 1, text: curaduriaInfo.city, config: { align: 'center', hide: hide, } },

            ];

        if (curaduriaInfo.id == 'cup1') ADDRESS_LABLE = 'Nomenclatura / Dirección / Denominación';

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 6, h: 1, text: 'Predio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 0 + 6, 0], w: cl_wd, h: 1, text: 'Número predial', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 1 + 6, 0], w: cl_wd, h: 1, text: 'Matricula inmobiliaria', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 2 + 6, 0], w: cl_wd, h: 1, text: ADDRESS_LABLE, config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [cl_wd * 3 + 6, 0], w: cl_wd, h: 1, text: 'Barrio', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                ...tail_columns_hd,
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1, });

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 6, h: 1, text: '1', config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 0 + 6, 0], w: cl_wd, h: 1, text: _DATA.reso.pimero_3 || fun_2.catastral, config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 1 + 6, 0], w: cl_wd, h: 1, text: _DATA.reso.pimero_4 || fun_2.matricula, config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 2 + 6, 0], w: cl_wd, h: 1, text: _DATA.reso.pimero_5 || fun_2.direccion, config: { align: 'center', hide: hide, } },
                { coord: [cl_wd * 3 + 6, 0], w: cl_wd, h: 1, text: fun_2.barrio, config: { align: 'center', hide: hide, } },
                ...tail_columns_bd,
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        doc.moveDown();
    }

    function TABLE_F51(ROLE, hide = false, ROLE_EXCLUDE = false) {
        doc.moveDown();
        let NAME_LABLE = 'Nombre';
        if (curaduriaInfo.id == 'cup1') NAME_LABLE = 'Nombre y Apellidos / (Razon social)';
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'Actúa en calidad', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [15, 0], w: 30, h: 1, text: NAME_LABLE, config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
                { coord: [45, 0], w: 15, h: 1, text: 'Documento de identidad', config: { align: 'center', bold: true, fill: 'silver', valign: true, hide: hide, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        f51.map(value => {
            let name51 = (value.name + ' ' + value.surname).toUpperCase();
            let id51 = value.id_number;
            if (ROLE) {
                if (!String(value.role).includes(ROLE)) return;
            }

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 15, h: 1, text: value.role, config: { align: 'center', hide: hide, } },
                    { coord: [15, 0], w: 30, h: 1, text: name51, config: { align: 'center', hide: hide, } },
                    { coord: [45, 0], w: 15, h: 1, text: id51, config: { align: 'center', hide: hide, } },
                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1 });


            if (value.type == 'PERSONA JURIDICA' && !ROLE_EXCLUDE) {
                let rName51 = (value.rep_name).toUpperCase();
                let rId51 = (value.rep_id_number).toUpperCase();

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 15, h: 1, text: 'REPRESENTANTE LEGAL', config: { align: 'center', hide: hide, } },
                        { coord: [15, 0], w: 30, h: 1, text: rName51, config: { align: 'center', hide: hide, } },
                        { coord: [45, 0], w: 15, h: 1, text: rId51, config: { align: 'center', hide: hide, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
            }
        })
        doc.moveDown();
    }

    function TABLE_F52(hide = false) {
        doc.moveDown();
        let NAME_LABLE = 'Nombre';
        if (curaduriaInfo.id == 'cup1') NAME_LABLE = 'Nombre y Apellidos';
        let prof_shorts_names = {
            'URBANIZADOR/PARCELADOR': 'URBANIZADOR/PARCELADOR',
            'URBANIZADOR O CONSTRUCTOR RESPONSABLE': 'URBANIZADOR/CONSTRUCTOR RESPONSABLE',
            'DIRECTOR DE LA CONSTRUCCION': 'DIRECTOR DE LA CONSTRUCCIÓN',
            'ARQUITECTO PROYECTISTA': 'ARQUITECTO PROYECTISTA',
            'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL': 'INGENIERO CIVIL ESTRUCTURAL',
            'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES': 'DISEÑADOR ELEMENTOS NO ESTRUCT.',
            'INGENIERO CIVIL GEOTECNISTA': 'INGENIERO CIVIL GEOTECNISTA',
            'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO': 'INGENIERO TOPÓGRAFO Y/O TOPÓGR.',
            'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES': 'REVISOR INDEPENDIENTE ESTRUCTURAL',
            'OTROS PROFESIONALES ESPECIALISTAS': 'OTROS PROFESIONALES ESPECIALISTAS',
        }
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 22, h: 1, text: 'Actúa en calidad', config: { align: 'center', bold: true, fill: 'silver', hide: hide, } },
                { coord: [22, 0], w: 23, h: 1, text: NAME_LABLE, config: { align: 'center', bold: true, fill: 'silver', hide: hide, } },
                { coord: [45, 0], w: 15, h: 1, text: 'Matrícula Profesional', config: { align: 'center', bold: true, fill: 'silver', hide: hide, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        f52.map(value => {
            let name = (value.name + ' ' + value.surname).toUpperCase();
            let idN = value.registration;

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 22, h: 1, text: prof_shorts_names[value.role] || value.role, config: { align: 'center', hide: hide, } },
                    { coord: [22, 0], w: 23, h: 1, text: name, config: { align: 'center', hide: hide, } },
                    { coord: [45, 0], w: 15, h: 1, text: idN, config: { align: 'center', hide: hide, } },
                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        })
        doc.moveDown();
    }

    let art = 1;

    // BODIES
    let reso_id = _DATA.reso.reso_id ? _DATA.reso.reso_id.includes('-') ? _DATA.reso.reso_id.split('-')[1] : _DATA.reso.reso_id : '';
    let txt_res = `RESOLUCIÓN\n${reso_id} DEL ${dateParser(_DATA.reso.reso_date).toUpperCase()}`;
    let txt_vig = [
        ' INVALID VALUE',
        ' al haber concluido los términos de ley sin haberse interpuesto ningún recurso',
        ' al haber renunciado expresamente a los términos de ley para interponer los recursos',
        '',
    ]

    let action_word = _DATA.reso.reso_state;
    if (curaduriaInfo.id == 'cub1' && action_word == 'OTORGADA') action_word = 'CONCEDE';


    const _BODY = `El ${curaduriaInfo.job} ${(curaduriaInfo.master).toUpperCase()} en uso de sus facultades legales, derivadas de los actos de posesión y nombramiento y de las 
    facultades legales conferidas por las leyes: Ley 9 de 1989; Ley 388 de 1997; Ley 400 de 1997, Ley 810 de 2003, Ley 1796 de 2016; los decretos nacionales: Decreto 1077 de 
    2015 y sus decretos modificatorios que reglamenta el sector de vivienda, ciudad y territorio y en particular aquellos que establecen las condiciones para el estudio y expedición 
    de la licencias urbanísticas; Decreto 926 de 2010 y sus decretos modificatorios del Reglamento Colombiano de Construcción Sismorresistente NSR-10 y el Acuerdo Municipal 
    ${curaduriaInfo.pot.n} de ${curaduriaInfo.pot.yy} mediante el cual se adoptó el ${curaduriaInfo.pot.pot} del municipio de ${_DATA.reso.ciudad}, CERTIFICA QUE LA ${txt_res} 
    por medio de la cual se concede un/a ${_DATA.reso.tipo}, se encuentra EJECUTORIADA${txt_vig[_DATA.reso.p1]}. 
    El contenido de la licenai se encuentran en la precitada resolución en su estado OTORGADA, sin embargo, se procede a resaltar los datos 
    de identificación de la misma y a consignar de forma expresa la fecha de la vigencia,`.replace(/[\n\r]+ */g, ' ');

    const _BODY_2 = `El ${curaduriaInfo.job} ${(curaduriaInfo.master).toUpperCase()} en uso de sus facultades legales, derivadas de los actos de posesión y nombramiento y de las 
    facultades legales conferidas por las leyes: Ley 9 de 1989; Ley 388 de 1997; Ley 400 de 1997, Ley 810 de 2003, Ley 1796 de 2016; los decretos nacionales: Decreto 1077 de 
    2015 y sus decretos modificatorios que reglamenta el sector de vivienda, ciudad y territorio y en particular aquellos que establecen las condiciones para el estudio y expedición 
    de la licencias urbanísticas; Decreto 926 de 2010 y sus decretos modificatorios del Reglamento Colombiano de Construcción Sismorresistente NSR-10 y el Acuerdo Municipal 
    ${curaduriaInfo.pot.n} de ${curaduriaInfo.pot.yy} mediante el cual se adoptó el ${curaduriaInfo.pot.pot} del municipio de ${_DATA.reso.ciudad}, ${action_word}: ${_DATA.reso.tipo}, decisión soportada en los siguientes elementos:`.replace(/[\n\r]+ */g, ' ');

    const _PARAGRAFO_1 = `El área del predio fue tomada del cálculo de los linderos consignados en el certificado de libertad y tradición y/o títulos de propiedad; los trámites concernientes a la inscripción, aclaración y/o corrección de área y linderos del predio con fines registrales, deberá adelantarlos ante el Área Metropolitana de Bucaramanga (gestor catastral), mediante los procedimientos establecidos en la resolución conjunta IGAC No. 1101 SNR No. 11344 del 31 de Diciembre de 2020. Por lo anterior, se sugiere antes de radicar cualquier otra actuación, realizar la inscripción del área conforme a lo antes indicado, para asegurar un trámite notarial y registral exitoso.`;

    let txt_vigs = [
        'INVALID VALUE',
        `Conceder, con fundamento en el artículo 2.2.6.1.4.1 y 2.2.6.4.2.5 del decreto 1077 de 2015, una vigencia de ${_DATA.reso.vn} para ejecutar las obras autorizadas en la licencia de construcción en la(s) precitada(s) modalidad(es). Los cuales vas desde el ${dateParser(_DATA.reso.date).toUpperCase()} HASTA ${dateParser(addDate(_DATA.reso.date, _DATA.reso.dante)).toUpperCase()}.`,
        `La modificación de licencia vigente no amplía la vigencia establecida en la licencia de construcción inicial objeto de modificación.`
    ]
    const VIGENCIA = `La licencia puede ser prorrogada por una sola vez por un plazo adicional de (12) meses, para ello el titular de la licencia debe radicar una solicitud con la correspondiente documentación a mas tardar treinta (30) días hábiles antes del vencimiento de la respectiva licencia. La solicitud deberá acompañarse de la manifestación bajo la gravedad del juramento de la iniciación de obra por parte de urbanizador o constructor responsable.
    Cuando la licencia pierda su vigencia por vencimiento de plazo o de sus prórrogas, el interesado deberá solicitar una nueva licencia, ante la misma autoridad que la expidió, ajustándose a las normas urbanísticas vigentes al momento de la nueva solicitud. Sin embargo, el interesado podrá solicitar, por una sola vez la revalidación de la licencia vencida, siempre y cuando no haya transcurrido un término mayor a dos (2) meses desde el vencimiento de la licencia que se pretende revalidar, que el constructor o el urbanizador presente el cuadro de áreas en el que se identifique lo ejecutado durante la licencia vencida así como lo que se ejecutará durante la revalidación y manifieste bajo la gravedad del juramento que el inmueble se encuentra en cualquiera de las siuaciones contempladas en el artículo 2.2.6.1.2.4.3 del decreto 1077 de 2015.`

    let arts_cb = _DATA.reso.arts_cb;
    arts_cb = arts_cb ? arts_cb.split(',') : [];


    const VV = (val, df) => {
        if (val === 'NO') return '';
        if (val) return val;
        if (df) return df;
        return ''
    }

    const CV3 = (val,) => {
        if (val == '0') return 'CON R.';
        if (val == '1') return 'SIN R.';
        return '';
    }

    const CV2 = val => {
        if (val == 0) return 'NO CUMPLE';
        if (val == 1) return 'CUMPLE';
        if (val == 2) return 'NO APLICA';
        return ''
    }

    // ---------------------------------
    // --------------- CPMFIG OF DOCUMENT
    // ---------------------------------

    doc.pipe(fs.createWriteStream('./docs/public/expdoceje.pdf'));

    doc.fontSize(13);
    doc.text(`\n`);
    doc.font('Helvetica-Bold')
    doc.text(`${(curaduriaInfo.job)}`, { align: 'center' });
    doc.fontSize(12);
    doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`, { align: 'center' });
    doc.fontSize(7);
    doc.text(curaduriaInfo.call, { align: 'center' });
    doc.text(`\n\n`);

    let docFontZise = 8;
    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });


    doc.fontSize(docFontZise);
    doc.font('Helvetica')
    // ---------------------------------
    // --------------- START OF DOCUMENT
    // ---------------------------------

    doc.text(`\n`);
    doc.text(_BODY, { align: 'justify' });
    doc.text(`\n`);
    doc.text('Información Documental');

    let ACONF = LOAD_STEP('s34', 'arc');
    let ac_json = ACONF ? ACONF.json ? ACONF.json : {} : {};
    ac_json = getJSON_Simple(ac_json);
    let area = ac_json.m2
    TABLE_F2(true, area);
    doc.text(`\n`);
    doc.font('Helvetica-Bold');
    doc.text('Parágrafo: ', { continued: true, align: 'justify' });
    doc.font('Helvetica');
    doc.text(_PARAGRAFO_1);
    doc.text(`\n`);



    _VALUE_ARRAY = _GET_STEP_TYPE('geo', 'value', 'arc');
    if (curaduriaInfo.id == 'cub1') {
        _DATA.info_geo_arq = _VALUE_ARRAY
        doc.text(`\n`);
        doc.text('Información geográfica. Coordenadas, ');
        doc.text(`\n`);
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: `Norte: ${_VALUE_ARRAY[0]}`, config: { align: 'center', hide: true } },
                { coord: [15, 0], w: 15, h: 1, text: `Este: ${_VALUE_ARRAY[1]}`, config: { align: 'center', hide: true } },
                { coord: [30, 0], w: 30, h: 1, text: 'Artículo 365 del POT Sistema de coordenadas en MAGNASIRGAS', config: { align: 'center', hide: true } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })
        doc.text(`\n`);
    }

    doc.font('Helvetica-Bold')
    doc.text('Los titulares de la siguiente actuación a las siguientes personas, ', { continued: true, align: 'justify' });
    doc.font('Helvetica')
    doc.text(`\n`);
    TABLE_F51(false, true);


    doc.text(`\n`);
    doc.font('Helvetica-Bold')
    doc.text('Los profesionales del proyecto son, ', { continued: true, align: 'justify' });
    doc.font('Helvetica')
    doc.text(`\n`);
    TABLE_F52(true);
    doc.text(`\n`);

    doc.font('Helvetica-Bold')
    doc.text('Las obras e intervenciones urbanística autizadas son, ', { continued: true, align: 'justify' });
    doc.font('Helvetica')
    doc.text(`\n`);

    _VALUE_ARRAY = _GET_STEP_TYPE('s33', 'value', 'arc');

    if (arts_cb[0] == '1') {
        doc.font('Helvetica-Bold')
        doc.text('1.   Antecedentes: ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_DATA.reso.art_4_1 ? String(_DATA.reso.art_4_1) : 'No se presentaron antecedentes urbanísticos.');
        doc.text('\n');
    }

    if (arts_cb[1] == '1') {
        doc.font('Helvetica-Bold')
        doc.text('2.   Descripción del proyecto a licenciar: ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(_DATA.reso.art_4_2 ? String(_DATA.reso.art_4_2) : 'No se presentó descripción.');
        doc.text('\n');
    }

    if (curaduriaInfo.id == 'cub1') {
        doc.font('Helvetica-Bold');
        doc.text('3.   Características y normas aplicables al proyecto:');
        doc.font('Helvetica');
        doc.fontSize(7);

        //doc.startPage = doc.bufferedPageRange().count - 1;
        //doc.lastPage = doc.bufferedPageRange().count - 1;
        doc.startPage = doc.startPage - 1;
        doc.lastPage = doc.lastPage - 1;
        //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
        doc.on('pageAdded', () => { return false });

        // AREAS TABLE
        let STEP = LOAD_STEP('a_config', 'arc');
        let json = STEP ? STEP.json ? STEP.json : {} : {};
        json = getJSON_Simple(json);
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        let tagsE = json.tage ? json.tage.split(';') : [];
        let lic = fun_1.m_lic ? fun_1.m_lic : [];
        let rec = fun_1.tipo ? fun_1.tipo : [];

        var json_var = _GET_STEP_TYPE_JSON('s34', 'json', 'arc');
        json_var = getJSON_Simple(json_var);
        let mainuse = json_var.mainuse ? json_var.mainuse : ' ';
        let tipo = json_var.tipo ? json_var.tipo : ' ';
        const value34 = _GET_STEP_TYPE('s34', 'value', 'arc');
        const check34 = _GET_STEP_TYPE('s34', 'check', 'arc');

        // ----------------------- RESUME TABLE ------------------- //

        let dinmanicHeaders = (conf) => {
            let _h = conf ? conf.h ? conf.h : 1 : 1;
            let headers = [];
            tagsH.map((tag, i) => {
                let tag_hd = tag.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                tag_hd = tag_hd.replace('Historico', 'Antecedente');
                tag_hd = tag_hd.replace('historico', 'Antecedente');
                headers.push({ coord: [0, 0], w: 1, h: 1, text: tag_hd, config: { align: 'center', bold: true, valign: true, } })
            })
            tagsE.map((tag, i) => {
                headers.push({ coord: [0, 0], w: 1, h: 1, text: 'Empate:\n' + tag, config: { align: 'center', bold: true } })
            })


            if (lic.includes('G')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Dem. Total', config: { align: 'center', bold: true, valign: true, } })
            if (lic.includes('g')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Dem. Parcial', config: { align: 'center', bold: true, valign: true, } })

            if (lic.includes('A')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Obra Nueva', config: { align: 'center', bold: true, valign: true, } })
            if (rec.includes('F')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Reconocida', config: { align: 'center', bold: true, valign: true, } })

            if (lic.includes('B')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Ampliada', config: { align: 'center', bold: true, valign: true, } })
            if (lic.includes('C')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Adecuada', config: { align: 'center', bold: true, valign: true, } })
            if (lic.includes('D')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Modificada', config: { align: 'center', bold: true, valign: true, } })
            if (lic.includes('E')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Restaurada', config: { align: 'center', bold: true, valign: true, } })
            if (lic.includes('F')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Reforzada', config: { align: 'center', bold: true, valign: true, } })
            if (lic.includes('H')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Reconstruida', config: { align: 'center', bold: true, valign: true, } })
            if (lic.includes('I')) headers.push({ coord: [0, 0], w: 1, h: _h, text: 'Cerrada', config: { align: 'center', bold: true, valign: true, } })
            return headers;
        }
            ;
        let dinamicTotal = (areas, filter) => {
            let cells = [];
            let _i = 0;

            tagsH.map((tag, i) => {
                if (tag) {
                    cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_H(areas, 'historic_areas', i, filter), config: { align: 'center', valign: true, } })
                    _i++;
                }
            })
            tagsE.map((tag, i) => {
                if (tag) {
                    cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_H(areas, 'empate_h', i, filter), config: { align: 'center', valign: true, } })
                    _i++;
                }
            })

            if (lic.includes('G')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 6, filter), config: { align: 'center', valign: true, } })
                _i++;
            }

            if (lic.includes('g')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 7, filter), config: { align: 'center', valign: true, } })
                _i++;
            }

            if (lic.includes('A')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 0, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            if (rec.includes('F')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 10, filter), config: { align: 'center', valign: true, } })
                _i++;
            }

            if (lic.includes('B')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 1, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            if (lic.includes('C')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 2, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            if (lic.includes('D')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 3, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            if (lic.includes('E')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 4, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            if (lic.includes('F')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 5, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            if (lic.includes('H')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 8, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            if (lic.includes('I')) {
                cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 9, filter), config: { align: 'center', valign: true, } })
                _i++;
            }
            return cells;

        }

        let tableHeaders = [
            { coord: [0, 0], w: 1, h: 1, text: 'Uso\nPrincipal', config: { align: 'center', bold: true, valign: true, } },
            { coord: [0, 0], w: 1, h: 1, text: 'Tipo', config: { align: 'center', bold: true, valign: true, } },
            { coord: [0, 0], w: 1, h: 1, text: 'Escala\nUrbana', config: { align: 'center', bold: true, valign: true, } },
            // HERE ADD THE DIMANIC AREAS
            ...dinmanicHeaders(),
            // END HERE
            { coord: [0, 0], w: 1, h: 1, text: 'Descontada', config: { align: 'center', bold: true, valign: true, } },
            { coord: [0, 0], w: 1, h: 1, text: 'Total\nconstruida', config: { align: 'center', bold: true, valign: true, } },
            { coord: [0, 0], w: 1, h: 1, text: 'Total\nintervenida', config: { align: 'center', bold: true, valign: true, } },

            { coord: [0, 0], w: 1, h: 1, text: 'Cantidad', config: { align: 'center', bold: true, valign: true, } },
            { coord: [0, 0], w: 1, h: 1, text: 'Área\nunidades', config: { align: 'center', bold: true, valign: true, } },
            //{ coord: [0, 0], w: 1, h: 1, text: 'Área\ncomún', config: { align: 'center', bold: true, valign: true, } },
        ];

        let tbWidth = 60 / tableHeaders.length;
        let tbWidthA = tbWidth * (tableHeaders.length - 2)
        let tbWidthU = tbWidth * 2;
        let _i = 0;
        //doc.fontSize(6);
        tableHeaders.map((th, i) => { th.coord[0] += tbWidth * i; th.w = tbWidth; })

        pdfSupport.table(doc,
            [
                { coord: [tbWidth * 3, 0], w: tbWidthA - (tbWidth * 3), h: 1, text: '3.1 Áreas totales m2', config: { align: 'center', bold: true, } },
                { coord: [tbWidthA, 0], w: tbWidthU, h: 1, text: '3.2 Unidades Nuevas', config: { align: 'center', bold: true, } },

            ],
            [doc.x, doc.y],
            [60, 1],
            {})
        pdfSupport.table(doc,
            tableHeaders,
            [doc.x, doc.y],
            [60, 1],
            { lineHeight: -1 })



        let areas = _GET_CHILD_33_AREAS();
        let totals = dinamicTotal(areas);
        let uses = [];
        let rowUses = [];
        let rowAreasTotal = [];
        let sumArea = 0;
        let sumIndex = 0;
        let sumDestroy = 0;

        areas.map((area, i) => {
            let use = String(area.use).toLowerCase();
            if (!use) use = 'otro';
            if (!uses.includes(use)) uses.push(use);


            let obj = JSON.stringify(area);
            let iDe = obj.indexOf("destroy");
            let iDes = obj.indexOf('":"', iDe);
            let iDef = obj.indexOf('","', iDe);
            let iDet = obj.slice(iDes + 3, iDef);
            let destroy_areas = iDet ? iDet : [];
            sumArea += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
            sumIndex += Number(_GET_NET_INDEX(area.build, destroy_areas, area.historic_areas));
            sumDestroy += Number(_GET_TOTAL_DESTROY(destroy_areas));
        })

        uses.map((use, k) => {
            let areasRow = [];
            let totalAreasUseLocal = dinamicTotal(areas, use);
            areasRow.push(...totalAreasUseLocal);
            localArea = 0;
            localIndex = 0;
            localDestroy = 0;

            areas.map(area => {
                let obj = JSON.stringify(area);
                let iDe = obj.indexOf("destroy");
                let iDes = obj.indexOf('":"', iDe);
                let iDef = obj.indexOf('","', iDe);
                let iDet = obj.slice(iDes + 3, iDef);
                let destroy_areas = iDet ? iDet : [];

                let _use = String(area.use).toLowerCase();
                if (!_use) _use = 'otro';
                if (_use == use) {
                    localArea += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
                    localIndex += Number(_GET_NET_INDEX(area.build, destroy_areas, area.historic_areas));
                    localDestroy += Number(_GET_TOTAL_DESTROY(destroy_areas));
                }

            })


            let __i = totalAreasUseLocal.length;
            areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(localDestroy).toFixed(2), config: { align: 'center', valign: true, } })
            __i++
            areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(localArea).toFixed(2), config: { align: 'center', valign: true, } })
            __i++
            areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(_GET_COMMON_A_TOTAL([use])).toFixed(2), config: { align: 'center', valign: true, } })

            areas.map((area, j) => {
                let _use = String(area.use).toLowerCase();
                if (!_use) _use = 'otro';
                let hasValue = _GET_UNITS_A_TOTAL([_use]) > 0 || Number(_GET_UNITS_U_TOTAL([_use])) > 0 || areasRow.some(a => Number(a.text) > 0)
                let conScala = String(_use).trim() == 'vivienda' || String(_use).trim() == 'Vivienda' || String(_use).trim() == 'residencial' || String(_use).trim() == 'Residencial';
                if (_use == use && hasValue) {
                    rowUses[k] = [
                        { coord: [tbWidth * 0, 0], w: tbWidth, h: 1, text: cfl(_use), config: { align: 'center', valign: true, } },
                        { coord: [tbWidth * 1, 0], w: tbWidth, h: 1, text: tipo, config: { align: 'center', valign: true, } },
                        { coord: [tbWidth * 2, 0], w: tbWidth, h: 1, text: conScala ? 'NA' : VV(value34[5]), config: { align: 'center', valign: true, } },
                        ...areasRow,
                        { coord: [tbWidthA + tbWidth * 0, 0], w: tbWidth, h: 1, text: Number(_GET_UNITS_U_TOTAL([_use])).toFixed(0), config: { align: 'center', valign: true, } },
                        { coord: [tbWidthA + tbWidth * 1, 0], w: tbWidth, h: 1, text: _GET_UNITS_A_TOTAL([_use]), config: { align: 'center', valign: true, } },
                    ];
                }
            })
        })

        rowUses.map(rows => pdfSupport.table(doc, [...rows], [doc.x, doc.y], [60, 1], { lineHeight: -1 }))

        rowAreasTotal.push(...totals);
        __i = totals.length;
        rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(sumDestroy).toFixed(2), config: { align: 'center', valign: true, } })
        __i++;
        rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(sumArea).toFixed(2), config: { align: 'center', valign: true, } })
        __i++;
        rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(_GET_COMMON_A_TOTAL()).toFixed(2), config: { align: 'center', valign: true, } })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: tbWidth * 3, h: 1, text: 'Totales:', config: { align: 'right', bold: true, } },
                ...rowAreasTotal,
                { coord: [tbWidthA, 0], w: tbWidth, h: 1, text: Number(_GET_UNITS_U_TOTAL()).toFixed(0), config: { align: 'center', valign: true, } },
                { coord: [tbWidthA + tbWidth, 0], w: tbWidth, h: 1, text: _GET_UNITS_A_TOTAL(), config: { align: 'center', valign: true, } },
                //{ coord: [tbWidthA + tbWidth * 2, 0], w: tbWidth, h: 2, text: Number(_GET_COMMON_A_TOTAL()).toFixed(2), config: { align: 'center', valign: true, } },
            ],
            [doc.x, doc.y], [60, 1], {})

        if (_DATA.reso.art_4_p) pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: _DATA.reso.art_4_p, config: { align: 'left', bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], {})

        // -------------------------------------------------------- //
        // -------------------------------------------------------- //
        // -------------------------------------------------------- //

        const ALLOW_REVIEWS = record_arc ? record_arc.subcategory ? record_arc.subcategory.split(',') : [0, 0, 0, 0] : [0, 0, 0, 0];
        if (ALLOW_REVIEWS[0] == 1) {
            doc.fontSize(8);
            doc.text('\n');

            _JSON_STEP = _GET_STEP_TYPE_JSON('s34', 'json', 'arc');
            _JSON_STEP = getJSON_Simple(_JSON_STEP);
            _VALUE_ARRAY = _GET_STEP_TYPE('s34', 'value', 'arc');
            _CHECK_ARRAY = _GET_STEP_TYPE('s34', 'check', 'arc');

            const start_y = doc.y;
            const page_start = doc.bufferedPageRange().count - 1;

            // 3.3 

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 30, h: 1, text: '3.3 Determinantes del predio', config: { align: 'center', bold: true } },

                    { coord: [0, 1], w: 15, h: 1, text: '3.3.1 Norma Urbana', config: { align: 'left', bold: true, fill: 'silver' } },
                    { coord: [15, 1], w: 15, h: 1, text: '3.3.2 Socioeconómico', config: { align: 'left', bold: true, fill: 'silver' } },

                    { coord: [0, 2], w: 9, h: 1, text: 'Ficha normativa', config: { align: 'left', } },
                    { coord: [9, 2], w: 6, h: 1, text: _JSON_STEP.ficha, config: { align: 'center', } },
                    { coord: [15, 2], w: 9, h: 1, text: 'Estrato', config: { align: 'left', } },
                    { coord: [24, 2], w: 6, h: 1, text: f2.estrato, config: { align: 'center', } },

                    { coord: [0, 3], w: 9, h: 1, text: 'Sector', config: { align: 'left', } },
                    { coord: [9, 3], w: 6, h: 1, text: _JSON_STEP.sector, config: { align: 'center', } },
                    { coord: [15, 3], w: 9, h: 1, text: 'ZGU N°', config: { align: 'left', } },
                    { coord: [24, 3], w: 6, h: 1, text: _JSON_STEP.zgu, config: { align: 'center', } },

                    { coord: [0, 4], w: 9, h: 1, text: 'Subsector ', config: { align: 'left', } },
                    { coord: [9, 4], w: 6, h: 1, text: _JSON_STEP.subsector, config: { align: 'center', } },
                    { coord: [15, 4], w: 9, h: 1, text: '$m2 ZGU', config: { align: 'left', } },
                    { coord: [24, 4], w: 6, h: 1, text: _JSON_STEP.zugm, config: { align: 'center', } },

                ],
                [doc.x, doc.y], [61, 5], {})

            doc.text('\n');

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 30, h: 1, text: '3.3.3 Restricciones/limitaciones', config: { align: 'left', bold: true, fill: 'silver' } },
                ],
                [doc.x, doc.y], [61, 1], {})

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 24, h: 1, text: 'Zona de restricción: ' + VV(_VALUE_ARRAY[6]), config: { align: 'left', } },
                    { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[6]), config: { align: 'center', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 24, h: 1, text: 'Amenaza y Riesgo: ' + VV(_VALUE_ARRAY[8]), config: { align: 'left', } },
                    { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[8]), config: { align: 'center', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (VV(_VALUE_ARRAY[7]) != 'NA') pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 24, h: 1, text: 'Utilidad Pública: ' + VV(_VALUE_ARRAY[7]), config: { align: 'left', } },
                    { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[7]), config: { align: 'center', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })
            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 24, h: 1, text: VV(_VALUE_ARRAY[9]), config: { align: 'left', } },
                    { coord: [24, 0], w: 6, h: 1, text: CV3(_CHECK_ARRAY[9]), config: { align: 'center', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            doc.text('\n');

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 30, h: 1, text: '3.3.4 Suelo', config: { align: 'left', bold: true, fill: 'silver' } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 11, h: 1, text: 'Clase Suelo', config: { align: 'left', } },
                    { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[0]), config: { align: 'left', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 11, h: 1, text: 'Tratamiento urbanístico', config: { align: 'left', } },
                    { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[2]), config: { align: 'left', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 11, h: 1, text: 'Área de actividad', config: { align: 'left', } },
                    { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[4]), config: { align: 'left', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 11, h: 1, text: 'Unidad de uso', config: { align: 'left', } },
                    { coord: [11, 0], w: 19, h: 1, text: VV(_VALUE_ARRAY[3]), config: { align: 'left', } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            doc.text('\n');

            // 3.3.5 PERFIL VIAL

            let perfiles = [];
            let perfiles_headers = [];
            record_arc_36_infos.map(perfil => {
                if (!perfiles_headers.includes(perfil.address)) perfiles_headers.push(perfil.address)
            })



            let p_witdh = 22 / perfiles_headers.length;
            let sub_p_width = p_witdh / 2;

            let row_headers = [];
            perfiles_headers.map((p, i) => {
                row_headers.push({ coord: [8 + i * p_witdh, 1], w: sub_p_width, h: 1, text: 'N', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } })
                row_headers.push({ coord: [8 + i * p_witdh + sub_p_width, 1], w: sub_p_width, h: 1, text: 'P', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } })
            })


            record_arc_36_infos.map((perfil, k) => {
                let names = perfil.name ? perfil.name.split(';') : [];

                names.map((name, j) => {
                    if (perfiles.some(p => p.name == name)) {
                        perfiles.map((p, i) => {
                            if (p.name == name) {
                                if (p.address.some(a => a == perfil.address)) {
                                    address.map((a, l) => {
                                        if (a == perfil.address) {
                                            perfiles[i].norm[l] = perfil.norm ? perfil.norm.split(';')[j] : 0;
                                            perfiles[i].project[l] = perfil.project ? perfil.project.split(';')[j] : 0;
                                        }
                                    })
                                } else {
                                    perfiles[i].norm[k] = perfil.norm ? perfil.norm.split(';')[j] : 0;
                                    perfiles[i].project[k] = perfil.project ? perfil.project.split(';')[j] : 0;
                                    perfiles[i].address[k] = perfil.address;
                                }
                            }
                        })
                    } else {
                        let norms = [];
                        let projects = [];
                        let address = [];

                        norms[k] = perfil.norm ? perfil.norm.split(';')[j] : 0;
                        projects[k] = perfil.project ? perfil.project.split(';')[j] : 0;
                        address[k] = perfil.address;

                        perfiles.push({
                            name: name,
                            address: address,
                            norm: norms,
                            project: projects,
                        })

                    }
                })

            })


            if (record_arc_36_infos.length > 0) pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 30, h: 1, text: '3.3.5 Perfil via', config: { align: 'left', bold: true, fill: 'silver' } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })


            if (record_arc_36_infos.length > 0) pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 8, h: 2, text: 'Perfil', config: { align: 'center', bold: true, valign: true, fill: 'silver', } },
                    // HERE GOES THE DIMANIC TABLES
                    ...perfiles_headers.map((p, i) => {
                        return { coord: [8 + i * p_witdh, 0], w: p_witdh, h: 1, text: p, config: { align: 'center', bold: true, valign: true, fill: 'silver', } }
                    }),
                    ...row_headers,
                ],
                [doc.x, doc.y], [61, 2], {})


            if (record_arc_36_infos.length > 0) perfiles.map((perfil, i) => {
                let row_p = []
                perfiles_headers.map((ph, j) => {
                    let isStreet = true
                    let norm = isStreet ? perfil.norm[j] : '';
                    let project = isStreet ? perfil.project[j] : '';


                    row_p.push({ coord: [8 + p_witdh * j, 0], w: sub_p_width, h: 1, text: norm, config: { align: 'center', valign: true, } });
                    row_p.push({ coord: [8 + p_witdh * j + sub_p_width, 0], w: sub_p_width, h: 1, text: project, config: { align: 'center', valign: true, } });
                });
                let p = [
                    { coord: [0, 0], w: 8, h: 1, text: perfil.name, config: { align: 'center', valign: true, bold: true } },

                    ...row_p,
                ]
                pdfSupport.table(doc,
                    [
                        ...p
                    ],
                    [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            })

            doc.text('\n');

            const end_y = doc.y;
            const end_page = doc.bufferedPageRange().count - 1;

            _VALUE_ARRAY = _GET_STEP_TYPE('s_34_te', 'value', 'arc');
            _CHECK_ARRAY = _GET_STEP_TYPE('s_34_te', 'check', 'arc');

            doc.switchToPage(page_start);
            doc.y = start_y;

            // 3.4 Edificabilidad y volumetría

            let excs = {
                'Empate Volumetrico': 'EV',
                'Hasta 3 pisos': "3P",
                'Bien de Interest Culural': 'BIC',
                'Plan especial de manejor de patrimonio': 'PEMP',
                'Indice licencia previa': 'LP',
                'Historico': 'HIS',
                'Bonificación': 'BON',
                'Orden judicial': 'OJ',
                'Art. 305° Prgf. 1': 'A305P1',
                'Art. 313° - Plan parcial': 'PP',
                'Art. 313° - TRA-3': 'TRA3',
                'Art. 313° - M2': 'M2',
                'Art. 313° - Prgf. 2': 'A313P2',
                'Art. 313° M2, comercio, piso 1 á 3': 'M2C13',
                'Art. 471° Reconocimiento': 'REC',
                'Causa: Plazas/plazoletas en predio esquinero': 'PLAE',
                'Causa: Plazas/plazoletas en predio medianero': 'PLAM',
                'Causa: Pasaje comercial': 'COM',
                'Causa: Construción de espacio público por cosatdo manzana': 'PUB'
            };
            let con_edif = _CHECK_ARRAY[1] != '2' || _CHECK_ARRAY[2] != '2';


            pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 30, h: 1, text: '3.4 Edificabilidad y volumetría', config: { align: 'center', bold: true } },
                ],
                [doc.x, doc.y], [61, 1], {})

            if (con_edif) pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: '3.4.1 Índices ', config: { align: 'left', bold: true, fill: 'silver' } },
                    { coord: [38, 0], w: 6, h: 1, text: 'Dato', config: { align: 'center', bold: true, fill: 'silver' } },
                    { coord: [44, 0], w: 6, h: 1, text: 'Norma', config: { align: 'center', bold: true, fill: 'silver' } },
                    { coord: [50, 0], w: 6, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, fill: 'silver' } },
                    { coord: [56, 0], w: 5, h: 1, text: 'Eva/Excp', config: { align: 'center', bold: true, fill: 'silver' } },
                ],
                [doc.x, doc.y], [61, 1], {})

            if (_CHECK_ARRAY[1] != '2') pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: 'Ocupacion', config: { align: 'left', valign: true, } },
                    { coord: [38, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[6]), config: { align: 'center', valign: true, } },
                    { coord: [44, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[3]), config: { align: 'center', valign: true, } },
                    { coord: [50, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[4]), config: { align: 'center', valign: true, } },
                    { coord: [56, 0], w: 5, h: 1, text: _VALUE_ARRAY[5] == 'NO' ? CV2(_CHECK_ARRAY[1]) : (excs[_VALUE_ARRAY[5]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[2] != '2') pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: 'Construcción', config: { align: 'left', valign: true, } },
                    { coord: [38, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[10]), config: { align: 'center', valign: true, } },
                    { coord: [44, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[7]), config: { align: 'center', valign: true, } },
                    { coord: [50, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[8]), config: { align: 'center', valign: true, } },
                    { coord: [56, 0], w: 5, h: 1, text: _VALUE_ARRAY[9] == 'NO' ? CV2(_CHECK_ARRAY[2]) : (excs[_VALUE_ARRAY[9]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (con_edif) doc.text('\n');

            // 3.4.2 Volumen

            let con_volumen = _CHECK_ARRAY[0] != '2' || _CHECK_ARRAY[3] != '2' || _CHECK_ARRAY[4] != '2' || _CHECK_ARRAY[5] != '2';

            if (con_volumen) pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: '3.4.2 Volumen', config: { align: 'left', bold: true, fill: 'silver' } },
                    { coord: [38, 0], w: 8, h: 1, text: 'Norma', config: { align: 'center', bold: true, fill: 'silver' } },
                    { coord: [46, 0], w: 8, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, fill: 'silver' } },
                    { coord: [54, 0], w: 7, h: 1, text: 'Eval. / Excep.', config: { align: 'center', bold: true, fill: 'silver' } },
                ],
                [doc.x, doc.y], [61, 1], {})

            if (_CHECK_ARRAY[0] != '2') pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: 'Tip. edific.', config: { align: 'left', valign: true, } },
                    { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[0]), config: { align: 'center', valign: true, } },
                    { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[1]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[2] == 'NO' ? CV2(_CHECK_ARRAY[0]) : (excs[_VALUE_ARRAY[2]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[3] != '2') pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: 'Nr. de pisos', config: { align: 'left', valign: true, } },
                    { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[11]), config: { align: 'center', valign: true, } },
                    { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[12]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[13] == 'NO' ? CV2(_CHECK_ARRAY[3]) : (excs[_VALUE_ARRAY[13]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[4] != '2') pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: 'Semisótano', config: { align: 'left', valign: true, } },
                    { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[18]), config: { align: 'center', valign: true, } },
                    { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[19]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[4]), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[5] != '2') pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: 'Sótanos', config: { align: 'left', valign: true, } },
                    { coord: [38, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[22]), config: { align: 'center', valign: true, } },
                    { coord: [46, 0], w: 8, h: 1, text: VV(_VALUE_ARRAY[23]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[5]), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (con_volumen) doc.text('\n');

            // 3.4.3 Aislam

            let any_check = _CHECK_ARRAY[6] != '2' || _CHECK_ARRAY[7] != '2' || _CHECK_ARRAY[8] != '2' || _CHECK_ARRAY[9] != '2' || _CHECK_ARRAY[11] != '2' || _CHECK_ARRAY[12] != '2' || _CHECK_ARRAY[13] != '2' || _CHECK_ARRAY[14] != '2';

            if (any_check) pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 11, h: 1, text: '3.4.3 Aislamientos', config: { align: 'left', bold: true, fill: 'silver' } },
                    { coord: [42, 0], w: 6, h: 1, text: 'Norma', config: { align: 'center', bold: true, fill: 'silver' } },
                    { coord: [48, 0], w: 6, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, fill: 'silver' } },
                    { coord: [54, 0], w: 7, h: 1, text: 'Eval. / Excep.', config: { align: 'center', bold: true, fill: 'silver' } },
                ],
                [doc.x, doc.y], [61, 1], {})

            if (_CHECK_ARRAY[6] != '2') pdfSupport.table(doc, // 'Frontal 1'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[69])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[26]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[27]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[62] == 'NO' ? CV2(_CHECK_ARRAY[6]) : (excs[_VALUE_ARRAY[62]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[7] != '2') pdfSupport.table(doc, // 'Frontal 2'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[70])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[30]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[31]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[63] == 'NO' ? CV2(_CHECK_ARRAY[7]) : (excs[_VALUE_ARRAY[63]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })


            if (_CHECK_ARRAY[8] != '2') pdfSupport.table(doc, // 'Lateral 1'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[71])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[34]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[35]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[64] == 'NO' ? CV2(_CHECK_ARRAY[8]) : (excs[_VALUE_ARRAY[64]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })


            if (_CHECK_ARRAY[9] != '2') pdfSupport.table(doc,  // 'Lateral 2'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[72])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[38]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[39]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[65] == 'NO' ? CV2(_CHECK_ARRAY[9]) : (excs[_VALUE_ARRAY[65]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (false) pdfSupport.table(doc,
                [
                    { coord: [31, 0], w: 7, h: 1, text: 'Lateral', config: { align: 'left', valign: true, } },
                    { coord: [38, 0], w: 5, h: 1, text: VV(_VALUE_ARRAY[42]), config: { align: 'center', valign: true, } },
                    { coord: [43, 0], w: 5, h: 1, text: VV(_VALUE_ARRAY[43]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 13, h: 1, text: VV(_VALUE_ARRAY[66]), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[11] != '2') pdfSupport.table(doc,  // 'Posterior'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[74])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[46]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[47]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: _VALUE_ARRAY[66] == 'NO' ? CV2(_CHECK_ARRAY[11]) : (excs[_VALUE_ARRAY[66]] || 'Excep.'), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[12] != '2') pdfSupport.table(doc, // 'Antejardin 1'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[75])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[50]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[51]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[12]), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[13] != '2') pdfSupport.table(doc, // 'Antejardin 2'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[76])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[54]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[55]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[13]), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[14] != '2') pdfSupport.table(doc, // 'Antejardin 3'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[77])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[58]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[59]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[14]), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            if (_CHECK_ARRAY[15] != '2') pdfSupport.table(doc, // 'Antejardin 4'
                [
                    { coord: [31, 0], w: 11, h: 1, text: String(VV(_VALUE_ARRAY[78])).replace('Aislamiento ', ''), config: { align: 'left', valign: true, } },
                    { coord: [42, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[82]), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: 1, text: VV(_VALUE_ARRAY[79]), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 7, h: 1, text: CV2(_CHECK_ARRAY[15]), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [61, 1], { lineHeight: -1 })

            doc.text('\n');

            let excps_array = []
            if (!excps_array.includes(_VALUE_ARRAY[5]) && _VALUE_ARRAY[5] != 'NO') excps_array.push(_VALUE_ARRAY[5]);
            if (!excps_array.includes(_VALUE_ARRAY[9]) && _VALUE_ARRAY[9] != 'NO') excps_array.push(_VALUE_ARRAY[9]);
            if (!excps_array.includes(_VALUE_ARRAY[2]) && _CHECK_ARRAY[0] != '2') excps_array.push(_VALUE_ARRAY[2]);
            if (!excps_array.includes(_VALUE_ARRAY[13]) && _CHECK_ARRAY[3] != '2') excps_array.push(_VALUE_ARRAY[13]);
            if (!excps_array.includes(_VALUE_ARRAY[62]) && _CHECK_ARRAY[6] != '2') excps_array.push(_VALUE_ARRAY[62]);
            if (!excps_array.includes(_VALUE_ARRAY[63]) && _CHECK_ARRAY[7] != '2') excps_array.push(_VALUE_ARRAY[63]);
            if (!excps_array.includes(_VALUE_ARRAY[64]) && _CHECK_ARRAY[8] != '2') excps_array.push(_VALUE_ARRAY[64]);
            if (!excps_array.includes(_VALUE_ARRAY[65]) && _CHECK_ARRAY[9] != '2') excps_array.push(_VALUE_ARRAY[65]);
            if (!excps_array.includes(_VALUE_ARRAY[66]) && _CHECK_ARRAY[10] != '2') excps_array.push(_VALUE_ARRAY[66]);


            if (excps_array.some(exp => exp != 'NO')) {
                pdfSupport.table(doc,
                    [
                        { coord: [31, 0], w: 30, h: 1, text: 'EXCEPCIONES', config: { align: 'left', bold: true, fill: 'silver' } },
                    ],
                    [doc.x, doc.y], [61, 1], {});

                excps_array.map(ae => {
                    if (ae != 'NO') pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 5, h: 1, text: excs[ae], config: { align: 'center', valign: true, } },
                            { coord: [36, 0], w: 25, h: 1, text: ae, config: { align: 'center', valign: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })
                });

                doc.text('\n');
            }


            let arc_35p = record_arc_35_parkings;

            let parkings = [];
            let parkingHeaders = {
                'P.P': false,
                'Residentes': false,
                'Motocicletas': false,
                'Bicicletas': false,
                'Visitantes': false,
                'Carga': false,
            };

            arc_35p.map(value => {
                let useCheck = value.use;
                let use = value.pos;
                let old = false;
                parkings.map(valueP => { if (valueP.name == useCheck) old = true })
                if (!old) {
                    let newp = { name: useCheck, privates: 0, visitors: 0, ppv: 0, motobike: 0, bike: 0, load: 0, uu: use }
                    if (value.type.includes('P.P')) {
                        newp.ppv = Number(value.project);
                        parkingHeaders['P.P'] = true;
                    }
                    if (value.type.includes('Residentes')) {
                        newp.privates = Number(value.project);
                        parkingHeaders['Residentes'] = true;
                    }
                    if (value.type.includes('Motocicletas')) {
                        newp.motobike = Number(value.project);
                        parkingHeaders['Motocicletas'] = true;
                    }
                    if (value.type.includes('Bicicletas')) {
                        newp.bike = Number(value.project);
                        parkingHeaders['Bicicletas'] = true;
                    }
                    if (value.type.includes('Visitantes')) {
                        newp.visitors = Number(value.project);
                        parkingHeaders['Visitantes'] = true;
                    }
                    if (value.type.includes('Carga')) {
                        newp.load = Number(value.project);
                        parkingHeaders['Carga'] = true;
                    }
                    parkings.push(newp)
                }
                else {
                    parkings.map(valueP => {
                        if (valueP.name == useCheck) {
                            if (value.type.includes('P.P')) valueP.ppv += Number(value.project)
                            if (value.type.includes('Residentes')) valueP.privates += Number(value.project)
                            if (value.type.includes('Motocicletas')) valueP.motobike += Number(value.project)
                            if (value.type.includes('Bicicletas')) valueP.bike += Number(value.project)
                            if (value.type.includes('Visitantes')) valueP.visitors += Number(value.project)
                            if (value.type.includes('Carga')) valueP.load += Number(value.project)
                        }
                    })
                }
            })

            // PARKING
            let totalesParking = { privates: 0, visitors: 0, ppv: 0, motobike: 0, bike: 0, load: 0 }
            parkings.map(value => {
                totalesParking.privates += value.privates
                totalesParking.visitors += value.visitors
                totalesParking.ppv += value.ppv
                totalesParking.motobike += value.motobike
                totalesParking.bike += value.bike
                totalesParking.load += value.load
            })

            let showTable = totalesParking.visitors > 0 || totalesParking.ppv > 0 || totalesParking.load > 0 || totalesParking.motobike > 0 || totalesParking.bike > 0


            let dinamicParkingHeaders = () => {
                let headers = [];
                //if(parkingHeaders['Residentes ']) headers.push('Res.');
                if (parkingHeaders['Visitantes']) headers.push('Visit');
                if (parkingHeaders['P.P']) headers.push('PVV');
                if (parkingHeaders['Carga']) headers.push('Carga');
                if (parkingHeaders['Motocicletas']) headers.push('Motoc');
                if (parkingHeaders['Bicicletas']) headers.push('Bicic');
                return headers;
            }

            let dinamicWidth = 20 / dinamicParkingHeaders().length;
            let dinamicX = 20 / dinamicParkingHeaders().length;

            if (showTable) {
                pdfSupport.table(doc,
                    [
                        { coord: [31, 0], w: 30, h: 1, text: '3.4.4 Parqueaderos', config: { align: 'left', bold: true, fill: 'silver' } },

                        { coord: [31, 1], w: 7, h: 1, text: 'Uso', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                        { coord: [38, 1], w: 3, h: 1, text: 'U.U.', config: { align: 'center', bold: true, fill: 'gainsboro' } },

                        ...dinamicParkingHeaders().map((dh, i) => { return { coord: [41 + dinamicX * i, 1], w: dinamicWidth, h: 1, text: dh, config: { align: 'center', bold: true, fill: 'gainsboro' } } })

                        //{ coord: [45, 1], w: 4, h: 1, text: 'PVV', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                        //{ coord: [49, 1], w: 4, h: 1, text: 'Carga', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                        //{ coord: [53, 1], w: 4, h: 1, text: 'Motoc.', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                        //{ coord: [57, 1], w: 4, h: 1, text: 'Bicic.', config: { align: 'center', bold: true, fill: 'gainsboro' } },
                    ],
                    [doc.x, doc.y], [61, 2], {})

                parkings.map(parking => {
                    pdfSupport.table(doc,
                        [
                            { coord: [31, 0], w: 7, h: 1, text: parking.name, config: { align: 'left', valing: true, } },
                            { coord: [38, 0], w: 3, h: 1, text: parking.uu || '0', config: { align: 'center', valing: true, } },

                            ...dinamicParkingHeaders().map((dh, i) => {
                                if (dh == ('Visit')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.visitors || '', config: { align: 'center', valing: true, } }
                                if (dh == ('PVV')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.ppv || '', config: { align: 'center', valing: true, } }
                                if (dh == ('Carga')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.load || '', config: { align: 'center', valing: true, } }
                                if (dh == ('Motoc')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.motobike || '', config: { align: 'center', valing: true, } }
                                if (dh == ('Bicic')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: parking.bike || '', config: { align: 'center', valing: true, } }
                            }),
                            //{ coord: [41, 0], w: 4, h: 1, text: parking.visitors || '', config: { align: 'center', valing: true, } },
                            //{ coord: [45, 0], w: 4, h: 1, text: parking.ppv || '', config: { align: 'center', valing: true, } },
                            //{ coord: [49, 0], w: 4, h: 1, text: parking.load || '', config: { align: 'center', valing: true, } },
                            //{ coord: [53, 0], w: 4, h: 1, text: parking.motobike || '', config: { align: 'center', valing: true, } },
                            //{ coord: [57, 0], w: 4, h: 1, text: parking.bike || '', config: { align: 'center', valing: true, } },
                        ],
                        [doc.x, doc.y], [61, 1], { lineHeight: -1 })
                }
                )

                pdfSupport.table(doc,
                    [
                        { coord: [31, 0], w: 10, h: 1, text: 'TOTALES: ', config: { align: 'right', bold: true, } },
                        //{ coord: [41, 0], w: 4, h: 1, text: totalesParking.privates || '', config: { align: 'center', } },
                        ...dinamicParkingHeaders().map((dh, i) => {
                            if (dh == ('Visit')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.visitors || '', config: { align: 'center', valing: true, } }
                            if (dh == ('PVV')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.ppv || '', config: { align: 'center', valing: true, } }
                            if (dh == ('Carga')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.load || '', config: { align: 'center', valing: true, } }
                            if (dh == ('Motoc')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.motobike || '', config: { align: 'center', valing: true, } }
                            if (dh == ('Bicic')) return { coord: [41 + dinamicX * i, 0], w: dinamicWidth, h: 1, text: totalesParking.bike || '', config: { align: 'center', valing: true, } }
                        }),
                        //{ coord: [41, 0], w: 4, h: 1, text: totalesParking.visitors || '', config: { align: 'center', } },
                        //{ coord: [45, 0], w: 4, h: 1, text: totalesParking.ppv || '', config: { align: 'center', } },
                        //{ coord: [49, 0], w: 4, h: 1, text: totalesParking.load || '', config: { align: 'center', } },
                        //{ coord: [53, 0], w: 4, h: 1, text: totalesParking.motobike || '', config: { align: 'center', } },
                        //{ coord: [57, 0], w: 4, h: 1, text: totalesParking.bike || '', config: { align: 'center', } },
                    ],
                    [doc.x, doc.y], [61, 1], { lineHeight: -1 })


                doc.fontSize(7);
                doc.text('\nNOTA: Los parqueaderos cuantificados son todos los requeridos por la norma', doc.page.width / 2 + 5, doc.y);
                doc.text('\nNOTA: U.U. = Unidad de uso', doc.page.width / 2 + 5, doc.y);
            }

            doc.fontSize(docFontZise);

            doc.text('\n', doc.page.margins.left, doc.y);

            const end_y_2 = doc.y;
            const end_page_2 = end_y_2 > end_y ? doc.bufferedPageRange().count - 2 : doc.bufferedPageRange().count - 1;

            doc.switchToPage(end_page);
            doc.y = end_y;
            if (end_page_2 > end_page) {
                doc.switchToPage(end_page_2);
                doc.y = end_y_2;

            }
            else if (end_page_2 == end_page) {
                if (end_y_2 > end_y) doc.y = end_y_2;
                else doc.y = end_y
            } else doc.y = end_y
        }
    }


    if (_DATA.reso.dante > 0) {
        doc.font('Helvetica-Bold')
        doc.text('VIGENCIAS, ', { continued: true, align: 'justify' });
        doc.font('Helvetica')
        doc.text(txt_vigs[_DATA.reso.vp]);
        //doc.text(VIGENCIA, { align: 'justify' });
        doc.text(`\n`);
    }


    let final_date = addDate(_DATA.reso.date, _DATA.reso.dante);

    if (false) pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'Fecha Vigencia:', config: { align: 'left', hide: true } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.reso.date, config: { align: 'left', hide: true, bold: true } },
            { coord: [30, 0], w: 15, h: 1, text: 'Fecha Vencimiento:', config: { align: 'left', hide: true } },
            { coord: [45, 0], w: 15, h: 1, text: final_date, config: { align: 'left', hide: true, bold: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });
    if (false) pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'Fecha Revalidación:', config: { align: 'left', hide: true } },
            { coord: [15, 0], w: 15, h: 1, text: addDate(_DATA.reso.date, 2), config: { align: 'left', hide: true, bold: true } },
            { coord: [30, 0], w: 15, h: 1, text: 'Fecha Prórroga:', config: { align: 'left', hide: true } },
            { coord: [45, 0], w: 15, h: 1, text: dateParser_finalDate(final_date, -30), config: { align: 'left', hide: true, bold: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    doc.text(`\n`);

    // ---------------------------------
    // ------------------END OF DOCUMENT
    // ---------------------------------

    doc.fontSize(docFontZise);
    let size1 = doc.heightOfString(`Expedida en ${_DATA.reso.ciudad} el ${dateParser(_DATA.reso.date)}`);
    let size2 = doc.heightOfString(`\n\n\n\n\n${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    if (doc.y + size1 + size2 > doc.page.height - doc.page.margins.bottom) { doc.addPage(); doc.y = doc.page.margins.top }

    doc.text(`Expedida en ${_DATA.reso.ciudad} el ${dateParser(_DATA.reso.date)}`);
    doc.font('Helvetica-Bold')

    doc.fontSize(docFontZise);
    doc.font('Helvetica-Bold')
    doc.text(`\n\n\n\n\n${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`, { align: _DATA.r_sign_align });
    doc.text(curaduriaInfo.job, { align: _DATA.r_sign_align });

    if (_DATA.r_signs) pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: _ARRAY_PROFESIONAL[0], config: { align: 'center', bold: true, hide: true } },
            { coord: [20, 0], w: 20, h: 1, text: _ARRAY_PROFESIONAL[1], config: { align: 'center', bold: true, hide: true } },
            { coord: [40, 0], w: 20, h: 1, text: _ARRAY_PROFESIONAL[2], config: { align: 'center', bold: true, hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true })


    if (_DATA.r_simple) {
        doc.text(`\n`);
        doc.fontSize(8);
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'Revisó y protectó: ' + _DATA.r_simple_name, config: { align: 'left', bold: true, hide: true } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true })
    }


    // PAGINATION AND FOOTER
    doc.fontSize(8);
    if (_DATA.r_pagesx) {
        pdfSupport.setBottom(doc, _DATA.r_pagesn, _DATA.r_pagesi, doc.page.height - 62, doc.page.width - doc.page.margins.right - 100);
        doc.x = doc.page.margins.left;
    }
    else pdfSupport.setBottom(doc, _DATA.r_pagesn, _DATA.r_pagesi, 64);

    // HEADER
    const range = doc.bufferedPageRange();
    doc.switchToPage(0);
    doc.fontSize(10);
    for (var i = range.start; i < range.count; i++) {
        doc.switchToPage(i);
        let originalMargins = doc.page.margins;
        doc.page.margins = {
            top: 0,
            bottom: doc.page.margins.bottom,
            left: doc.page.margins.left,
            right: doc.page.margins.right
        };
        doc.y = _DATA.margins.m_top * maringConverter

        // POST PROCESSING
        let header_starts = [0, 20, 40];
        let header_widths = [20, 20, 40];

        if (_DATA.r_logo == 'right' || _DATA.r_logo == 'right2') header_starts = [0, 18, 36];
        if (_DATA.r_logo == 'left' || _DATA.r_logo == 'left2') header_starts = [14, 32, 50]
        if (_DATA.r_logo != 'no') header_widths = [10, 18, 36];

        doc.fontSize(8);
        pdfSupport.table(doc,
            [
                { coord: [header_starts[0], 0], w: header_widths[2], h: 1, text: 'Tipo y modalidad de licencia urbanística', config: { align: 'center' } },
                { coord: [header_starts[2], 0], w: header_widths[0], h: 1, text: 'Estado', config: { align: 'center' } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })
        doc.fontSize(10);
        pdfSupport.table(doc,
            [
                { coord: [header_starts[0], 0], w: header_widths[2], h: 1, text: `${_DATA.reso.tipo}`, config: { align: 'center', fill: 'steelblue', color: 'white', valign: true, bold: true, } },
                { coord: [header_starts[2], 0], w: header_widths[0], h: 1, text: `${_DATA.reso.reso_state}`, config: { align: 'center', valign: true, bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        let date = `Fecha Radicación ${_DATA.reso.lic_date}`;

        if (_DATA.reso.model == 'eje') txt_res = `CERTIFICACIÓN DE EJECUTORIA`
        doc.fontSize(7);
        pdfSupport.table(doc,
            [
                { coord: [header_starts[0], 0], w: header_widths[1], h: 1, text: txt_res, config: { align: 'center', valign: true, bold: true, } },
                { coord: [header_starts[1], 0], w: header_widths[1], h: 1, text: `ID ${fun.id_public}\n${date}`, config: { align: 'center', valign: true, bold: true, } },
                { coord: [header_starts[2], 0], w: header_widths[0], h: 1, text: `Conforme al ${curaduriaInfo.pot.pot}\n Acuerdo ${_DATA.reso.reso_pot}`, config: { align: 'center', valign: true, bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })
        doc.fontSize(10);
        doc.y = 80
        if (_DATA.r_logo == 'left2' || _DATA.r_logo == 'right2') {
            if (i % 2 != 0 && _DATA.r_logo == 'left2') doc.image('docs/public/logo192.png', doc.page.margins.left + 30, doc.y, { width: 60, height: 60 })
            if (i % 2 != 0 && _DATA.r_logo == 'right2') doc.image('docs/public/logo192.png', 460, doc.y, { width: 60, height: 60 })
        }
        else if (_DATA.r_logo == 'left' || _DATA.r_logo == 'right') {
            if (_DATA.r_logo == 'left') doc.image('docs/public/logo192.png', doc.page.margins.left + 30, doc.y, { width: 60, height: 60 })
            if (_DATA.r_logo == 'right') doc.image('docs/public/logo192.png', 460, doc.y, { width: 60, height: 60 })
        }

    }
    doc.end();

    const serializeData = (data) => {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            return typeof value === "function" ? undefined : value;
        }));
    };

    let result_doc_info = {
        "_DATA": serializeData(_DATA),
        "type_not": _DATA.type_not,
        "reso": _DATA.reso,
        "curaduriaInfo": curaduriaInfo,
        "_BODY":_BODY_2,
    }
    return result_doc_info;
}


function dateParser(date) {
    const moment = require('moment');
    let esLocale = require('moment/locale/es');
    var momentLocale = moment(date, 'YYYY-MM-DD').locale('es', esLocale);
    return momentLocale.format("LL")
}

function addDate(date, months) {
    const moment = require('moment');
    let newDate = moment(date).add(months, 'M').format('YYYY-MM-DD');
    return newDate;
}

function dateParser_finalDate(startDate, time) {
    let con1 = time === false || time === null || time === undefined || time === '';
    let con2 = startDate === false || startDate === null || startDate === undefined || startDate === '';
    if (con1 || con2) return ""
    let momentB = require('moment-business-days');
    let moment = require('moment');
    const holydays = require("../config/holydays.json")
    momentB.updateLocale('co', holydays);
    let endate = momentB(startDate, 'YYYY-MM-DD').businessAdd(time)._d;
    return moment(endate).format('YYYY-MM-DD');
}

function addDecimalPoints(num) {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getJSON_Simple(objec) {
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

function nextLetter(s) {
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
        var c = a.charCodeAt(0);
        switch (c) {
            case 90: return 'A';
            case 122: return 'a';
            default: return String.fromCharCode(++c);
        }
    });
}

function F2_TABLE_MANUAL(doc, text) {
    doc.moveDown();
    let rows = text.split('\n');
    let max_columns = 0;
    rows.map(r => {
        let cl = r.split('|').length;
        if (cl > max_columns) max_columns = cl;
    })
    let cell_size = 56 / (max_columns - 1);
    rows.map(row => {
        let cells = row.split('|');
        let cfg = String(row[0]).trim() == "#" ? { align: 'center', hide: true, bold: true, valign: true, } : { align: 'center', hide: true, valign: true, };
        let cell_text = (cell) => String(cell).trim() == "#" ? 'Predio' : String(cell).trim();
        pdfSupport.table(doc,
            [
                ...cells.map((cell, i) => ({
                    coord: [i > 0 ? cell_size * (i - 1) + 4 : 0, 0], w: i > 0 ? cell_size : 4, h: 1, text: cell_text(cell), config: cfg
                }))

            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
    })
    doc.moveDown();
}


// Capitalize First Letter
function cfl(string) {
    return string.trim().charAt(0).toUpperCase() + string.slice(1);
}
const db = require("../models");
const PH = db.record_ph;
const PH_BP = db.record_ph_blueprint;
const PH_FL = db.record_ph_floor;
const PH_BD = db.record_ph_building;
const STEP = db.record_ph_step;

const FUN_0 = db.fun_0;
const FUN_1 = db.fun_1;
const FUN_2 = db.fun_2;
const FUN_4 = db.fun_4;
const FUN_51 = db.fun_51;
const FUN_52 = db.fun_52;
const FUN_53 = db.fun_53;
const Op = db.Sequelize.Op;
const moment = require('moment');
const fs = require('fs');
const curaduriaInfo = require('../config/curaduria.json');
const { validateLastOA, validateLastCUBQuery } = require("../config/generalQueries");
const pdfSupport = require("../config/pdfSupport.js");
const { _FUN_6_PARSER, _FUN_8_PARSER } = require("../config/funCustomArrays");

// POST
exports.create = (req, res) => {
    var object = {
        id_public: (req.body.id_public ? req.body.id_public : null),
        version: (req.body.version ? req.body.version : null),
        fun0Id: (req.body.fun0Id ? req.body.fun0Id : res.send('NO A REAL ID PARENT')),

        worker_asign_arc_name: (req.body.worker_asign_arc_name ? req.body.worker_asign_arc_name : null),
        worker_asign_arc_id: (req.body.worker_asign_arc_id ? req.body.worker_asign_arc_id : null),
        date_asign_arc: (req.body.date_asign_arc ? req.body.date_asign_arc : null),
        worker_asign_arc_prev: (req.body.worker_asign_arc_prev ? req.body.worker_asign_arc_prev : null),

        worker_asign_law_name: (req.body.worker_asign_law_name ? req.body.worker_asign_law_name : null),
        worker_asign_law_id: (req.body.worker_asign_law_id ? req.body.worker_asign_law_id : null),
        date_asign_law: (req.body.date_asign_law ? req.body.date_asign_law : null),
        worker_asign_law_prev: (req.body.worker_asign_law_prev ? req.body.worker_asign_law_prev : null),
    }

    PH.create(object)
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
exports.create_blueprint = (req, res) => {
    recordPhId = (req.body.recordPhId ? req.body.recordPhId : res.send('NO A REAL ID PARENT'));

    var object = {
        recordPhId: recordPhId,
        id_public: (req.body.id_public ? req.body.id_public : null),
        floor: (req.body.floor ? req.body.floor : null),
        units: (req.body.units ? req.body.units : null),
        area: (req.body.area ? req.body.area : null),
        units_other: (req.body.units_other ? req.body.units_other : null),
    }

    PH_BP.create(object)
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
exports.create_floor = (req, res) => {
    recordPhId = (req.body.recordPhId ? req.body.recordPhId : res.send('NO A REAL ID PARENT'));

    var object = {
        recordPhId: recordPhId,
        division: (req.body.division ? req.body.division : null),
        floor: (req.body.floor ? req.body.floor : null),
        common: (req.body.common ? req.body.common : null),
        division_build: (req.body.division_build ? req.body.division_build : null),
        division_free: (req.body.division_free ? req.body.division_free : null),
    }

    PH_FL.create(object)
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
exports.create_building = (req, res) => {
    recordPhId = (req.body.recordPhId ? req.body.recordPhId : res.send('NO A REAL ID PARENT'));

    var object = {
        recordPhId: recordPhId,
        number: (req.body.number ? req.body.number : null),
        predial: (req.body.predial ? req.body.predial : null),
        matricula: (req.body.matricula ? req.body.matricula : null),
        nomenclature: (req.body.nomenclature ? req.body.nomenclature : null),
        area: (req.body.area ? req.body.area : null),
    }

    PH_BD.create(object)
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
    const recordPhId = (req.body.recordPhId ? req.body.recordPhId : res.send('NOT A REAL ID'));

    const object = {
        recordPhId: recordPhId,
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

// GET.
exports.findAll = (req, res) => {
    PH.findAll()
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
    PH.findAll({
        include: [PH_BP, PH_FL, PH_BD, STEP],
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
    const id = req.params.id;
    PH.findByPk(id, { include: [PH_BP, PH_FL, PH_BD] })
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
    const id = req.params.id;

    const new_id = (req.body.new_id);
    const prev_id = (req.body.prev_id);

    const new_cub = (req.body.new_cub);
    const prev_cub = (req.body.prev_cub);

    if (new_id) {
        req.body.id_public = new_id;

        const { QueryTypes } = require('sequelize');
        var query = validateLastOA(new_id, prev_id)

        db.sequelize.query(query, { type: QueryTypes.SELECT })
            .then(data => {
                if (data.length) return res.send("ERROR_DUPLICATE");
            })
            .catch(err => {
                return res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving ALL DATA."
                });
            });
    } else if (prev_id) req.body.id_public = '';

    if (new_cub) {
        req.body.cub = new_cub;

        const { QueryTypes } = require('sequelize');
        var query = validateLastCUBQuery(new_cub, prev_cub)

        db.sequelize.query(query, { type: QueryTypes.SELECT })
            .then(data => {
                if (data.length) return res.send("ERROR_DUPLICATE");
            })
            .catch(err => {
                return res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving ALL DATA."
                });
            });
    } else if (prev_cub) req.body.cub = '';



    PH.update(req.body, {
        where: { id: id }
    }).then(num => {
        if ((num) == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};

exports.update_blueprint = (req, res) => {
    const id = req.params.id;

    PH_BP.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.update_floor = (req, res) => {
    const id = req.params.id;

    PH_FL.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};
exports.update_building = (req, res) => {
    const id = req.params.id;

    PH_BD.update(req.body, {
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

// DELETE BY ID
exports.delete = (req, res) => {
    res.json({ message: "NOT IMPLEMENTED" });
};

exports.delete_blueprint = (req, res) => {
    const id = req.params.id;
    PH_BP.destroy({
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
exports.delete_floor = (req, res) => {
    const id = req.params.id;
    PH_FL.destroy({
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
exports.delete_building = (req, res) => {
    const id = req.params.id;
    PH_BD.destroy({
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

// DELETE ALL
exports.deleteAll = (req, res) => {
    res.json({ message: "NOT IMPLEMENTED" });
};



exports.gendoc_ph = (req, res) => {
    var altId = req.body.altId != 'null' ? req.body.altId : "";
    var _DATA = {
        id: (req.body.id != 'null' ? req.body.id : ""),
        type_not: (req.body.type_not ? req.body.type_not : 0),
        //r_signs: req.body.r_signs === 'true' ? 1 : 0,
        r_pagesi: req.body.r_pagesi === 'true' ? 1 : 0,
        r_pagesn: req.body.r_pagesn === 'true' ? 1 : 0,
        r_vig: (req.body.r_vig ? req.body.r_vig : 0),
        r_logo: (req.body.logo ? req.body.logo : 'no'),
        margins: {
            m_top: req.body.m_top ? req.body.m_top : 2.5,
            m_bot: req.body.m_bot ? req.body.m_bot : 2.5,
            m_left: req.body.m_left ? req.body.m_left : 1.7,
            m_right: req.body.m_right ? req.body.m_right : 1.7,
        }

    }

    FUN_0.findByPk(_DATA.id, { include: [{ model: PH, include: [PH_BP, PH_FL, PH_BD, STEP] }, FUN_51, FUN_52, FUN_53, FUN_4, FUN_2, FUN_1] })
        .then(data => {
            var maringConverter = 28.346456693 //   THIS IS 1 cm
            const PDFDocument = require('pdfkit');
            var doc = new PDFDocument({
                size: 'LEGAL',
                margins: {
                    top: _DATA.margins.m_top * maringConverter + 75,
                    bottom: _DATA.margins.m_bot * maringConverter,
                    left: _DATA.margins.m_left * maringConverter,
                    right: _DATA.margins.m_right * maringConverter,
                },
                bufferPages: true,
            });
            doc.pipe(fs.createWriteStream('./docs/public/output_record_ph.pdf'));

            doc.startPage = doc.bufferedPageRange().count - 1;
            doc.lastPage = doc.bufferedPageRange().count - 1;

            const record_ph = data ? data.record_ph : false;
            let _GET_CHILD_53 = () => {
                var _CHILD = data.fun_53s;
                var _CURRENT_VERSION = (data.version || 1) - 1;
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
            const f53 = _GET_CHILD_53();
            // DIGITAL NOTIFICATION
            let not_page = 0;
            if (_DATA.type_not == 2 || _DATA.type_not == 3) {
                var _main_body = "";
                if (_DATA.type_not == 2) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; informándose además que contra dicho acto administrativo no se proceden recursos.`;
                if (_DATA.type_not == 3) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; Informándose además que contra dicho acto administrativo proceden los recursos de reposición ante el/la Curador/a Urbano/a que lo expidió y de apelación ante la Oficina Asesora de Planeación, para que lo aclare, modifique o revoque. El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días hábiles siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011.`;

                const _BODIES_NOTS = [
                    `ASUNTO: NOTIFICACIÓN ELECTRÓNICA RESOLUCIÓN N° ${record_ph.id_public} DEL ${dateParser(record_ph.date).toUpperCase()} CON RADICADO ${_DATA.id_public}`,
                    `Por medo del presente está siendo notificado eltrónicamente del Acto Administrativo contestino en la Resolucion N° ${record_ph.id_public} del ${dateParser(record_ph.date)} expedida dentro del radicado interno ${_DATA.id_public} expedida por el/la ${curaduriaInfo.job}. El acto administrativo objeto de notificación se encuentra adjunto a la presente comunicación.`,
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


            // DOCUMENT
            if (curaduriaInfo.id == 'cub1') _PDFGEN_PH({ ...data, altId: altId, confg: _DATA }, doc);
            else _PDFGEN_PH_ATL({ ...data, altId: altId, confg: _DATA }, doc);

            // SIGN
            let aprovedText2 = "";
            if (data.record_ph.check == 1) aprovedText2 = `\nEste presente acto administrativo queda en firme.\nse expide en ${curaduriaInfo.city}, el ${dateParser(data.record_ph.date_arc_review)}`;
            doc.text(aprovedText2);
            pdfSupport.setSign(doc)

            // EJE
            if (_DATA.r_vig != '0') {
                let vigencia = _DATA.V != '1' ? `VIGENCIA: ${_DATA.r_vig} A PARTIR DE SU EJECUTORIA\n\n` : '\n'
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
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 15, h: 1, text: 'NOMBRE DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
                        { coord: [15, 0], w: 15, h: 1, text: 'DOCUMENTO DE IDENTIDAD', config: { align: 'center', bold: true, valign: true } },
                        { coord: [30, 0], w: 15, h: 1, text: 'FECHA Y HORA DE NOTIFICACIÓN', config: { align: 'center', bold: true, valign: true } },
                        { coord: [45, 0], w: 15, h: 1, text: 'FIRMA DEL NOTIFICADO', config: { align: 'center', bold: true, valign: true } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                        { coord: [15, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                        { coord: [30, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },
                        { coord: [45, 0], w: 15, h: 2, text: ' ', config: { align: 'center', bold: true } },

                    ],
                    [doc.x, doc.y], [60, 2], { lineHeight: -1 })
            }


            // PAGINATION AND FOOTER
            doc.fontSize(11);
            pdfSupport.setBottom(doc, _DATA.r_pagesn, _DATA.r_pagesi, _DATA.margins.m_bot * maringConverter);

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

                let header_starts = [0, 30, 0];
                let header_widths = [30, 30, 60];

                if (_DATA.r_logo == 'right' || _DATA.r_logo == 'right2') header_starts = [0, 25, 0];
                if (_DATA.r_logo == 'left' || _DATA.r_logo == 'left2') header_starts = [10, 35, 10]
                if (_DATA.r_logo != 'no') header_widths = [25, 25, 50];


                pdfSupport.table(doc,
                    [
                        { coord: [header_starts[0], 0], w: header_widths[2], h: 1, text: 'Tipo de Actuación', config: { align: 'center' } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

                pdfSupport.table(doc,
                    [
                        { coord: [header_starts[0], 0], w: header_widths[2], h: 1, text: `APROBACIÓN DE PLANOS DE PROPIEDAD HORIZONTAL`, config: { align: 'center', fill: 'steelblue', color: 'white', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

                let date = `Fecha Radicación ${data.date}`;
                pdfSupport.table(doc,
                    [
                        { coord: [header_starts[0], 0], w: header_widths[1], h: 1, text: `RESOLUCIÓN\n${record_ph.id_public} DEL ${dateParser(record_ph.date_arc_review).toUpperCase()}`, config: { align: 'center', valign: true, bold: true, } },
                        { coord: [header_starts[1], 0], w: header_widths[1], h: 1, text: `${data.id_public}\n${date}`, config: { align: 'center', valign: true, bold: true, } },
                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

                doc.y = 75
                if (_DATA.r_logo == 'left2' || _DATA.r_logo == 'right2') {
                    if (i % 2 != 0 && _DATA.r_logo == 'left2') doc.image('docs/public/logo192.png', doc.page.margins.left, doc.y, { width: 60, height: 60 })
                    if (i % 2 != 0 && _DATA.r_logo == 'right2') doc.image('docs/public/logo192.png', doc.page.width - doc.page.margins.right - 60, doc.y, { width: 60, height: 60 })
                }
                else if (_DATA.r_logo == 'left' || _DATA.r_logo == 'right') {
                    if (_DATA.r_logo == 'left') doc.image('docs/public/logo192.png', doc.page.margins.left, doc.y, { width: 60, height: 60 })
                    if (_DATA.r_logo == 'right') doc.image('docs/public/logo192.png', doc.page.width - doc.page.margins.right - 60, doc.y, { width: 60, height: 60 })
                }
            }

            doc.end();

            res.send('OK');
        })
        .catch(err => {
            res.status(500).send({
                message: err.message
            });
        });
};

exports.gendoc_not = (req, res) => {
    var _DATA = {
        ph_id: (req.body.res_id != 'null' ? req.body.ph_id : ""),
        ph_date: (req.body.res_date != 'null' ? req.body.ph_date : ""),
        date_doc: (req.body.date_doc != 'null' ? req.body.date_doc : ""),
        id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
        cub: (req.body.cub ? req.body.cub : ''),

        name: (req.body.name != 'null' ? req.body.name : ""),
        city: (req.body.city != 'null' ? req.body.city : ""),
        email: (req.body.email != 'null' ? req.body.email : ""),
        address: (req.body.address != 'null' ? req.body.address : ""),


    }
    _PDFGEN_DOC_FINAL_NOT(_DATA);
    res.send('OK');
};


function _PDFGEN_PH(_DATA, doc) {

    let docWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.fontSize(10);
    doc.text('\n');
    doc.font('Helvetica-BoldOblique');
    doc.font('Helvetica-Bold')
    doc.text(`El suscrito ${(curaduriaInfo.job).toUpperCase()},`, { align: 'center' });
    doc.text(`en uso de las faultades de le confiera la Ley 9 de 1989, Ley 388 de 1997, el Decreto 1077 de 2005, la Ley 675 de 2001, el Decreto 070 del 4 de junio de 2021 y de acuerdo con la solicitud elevada por los propietarios,`, { align: 'center' });
    doc.text('\n');
    rowConfCols(doc, doc.y, [`APROBACIÓN DE PLANOS DE PROPIEDAD HORIZONTAL`], [1], true, docWidth);
    rowConfCols(doc, doc.y, [`${_DATA.altId}`, `${_DATA.record_ph.id_public ? _DATA.record_ph.id_public : ''}`,], [1, 1], false, docWidth);
    doc.font('Helvetica-Bold')
    doc.text('\n');
    doc.fontSize(8);
    rowConfCols(doc, doc.y, [`I. INFORMACIÓN GENERAL`], [1], true, docWidth, 'left');
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`DATOS DE PREDIOS(S)`], [1], false, docWidth);
    rowConfCols(doc, doc.y, [`Predio N°`, 'Numero Predial', 'Matrícula', 'Nomenclatura', 'Área'], [1, 4, 3, 4, 2], false, docWidth);
    doc.font('Helvetica')
    var _buildings = _DATA.record_ph.record_ph_buildings ? _DATA.record_ph.record_ph_buildings : [];
    for (var i = 0; i < _buildings.length; i++) {
        rowConfCols(doc, doc.y, [_buildings[i].number, _buildings[i].predial, _buildings[i].matricula, _buildings[i].nomenclature, `${_buildings[i].area} m2`], [1, 4, 3, 4, 2], false, docWidth);
    }
    // 0 => AREA Y LINDEROS DE PREDIO(S)

    // 1 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> NUMERO
    // 2 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> EXPEDIDA
    // 3 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> VIGENTE
    // 4 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> DELCARACION
    // 5 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> DOCUMENTO -> NOT NECESARY HERE

    // 6 => DATOS GENERALES DE LA LICENCIA -> AREA
    // 7 => DATOS GENERALES DE LA LICENCIA -> DESTINACION
    // 8 => DATOS GENERALES DE LA LICENCIA -> USO DEL SUELO
    // 9 => DATOS GENERALES DE LA LICENCIA -> TRATAMIENTO
    // 10 => DATOS GENERALES DE LA LICENCIA -> LICENCIA DUTY
    // 11 => DATOS GENERALES DE LA LICENCIA -> VALOR
    // 12 => DATOS GENERALES DE LA LICENCIA -> RECIPE NUMBER
    // 13 => DATOS GENERALES DE LA LICENCIA -> DOCUMENTO -> NOT NECESARY HERE

    // 14 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTA -> LICENCIA
    var _LIST_GEN = [];
    if (_DATA.record_ph.review_gen) {
        _LIST_GEN = _DATA.record_ph.review_gen.split(';');
    }
    var lindero = _LIST_GEN[0] ? _LIST_GEN[0] : "";
    rowConfCols(doc, doc.y, ['Áreas y Linderos del Predio(s): ', lindero], [5, 9], false, docWidth);

    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`PROPIETARIOS(S)`], [1], false, docWidth);
    rowConfCols(doc, doc.y, [`Nombre`, 'Documento Identidad',], [5, 5], false, docWidth);
    doc.font('Helvetica')
    var _fun_51 = _DATA.fun_51s ? _DATA.fun_51s : [];
    for (var i = 0; i < _fun_51.length; i++) {
        if (_fun_51[i].role) {
            if ((_fun_51[i].role).includes('PROPIETARIO')) rowConfCols(doc, doc.y, [`${_fun_51[i].name} ${_fun_51[i].surname}`, _fun_51[i].id_number],
                [5, 5], false, docWidth);
        }
    }

    // SETTING THE GEN OBJECT
    var type = " ";
    if (_LIST_GEN[14] == 1) type = "LICENCIA DE CONSTRUCCIÓN"
    if (_LIST_GEN[14] == 2) type = "LICENCIA DE PARCELACION"
    if (_LIST_GEN[14] == 3) type = "LICENCIA DE URBANISMO"
    if (_LIST_GEN[14] == 4) type = "ACTO DE RECONOCIMIENTO"
    var declaratio = "";
    if (_LIST_GEN[4] == 0) declaratio = "NO APORTA"
    if (_LIST_GEN[4] == 1) declaratio = "APORTA"
    if (_LIST_GEN[4] == 2) declaratio = "NO APLICA"


    table(doc, [
        ['ACTUACIÓN URBANÍSTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL'],
        ['Tipo de Actuación:', 'Número:', 'Expedida:', 'Vigente:', 'Declaración de obra terminada:'],
        [type + ' ', _LIST_GEN[1] + ' ', _LIST_GEN[2] + ' ', _LIST_GEN[3] + ' ', declaratio]
    ],
        [5, 4, 5],
        [{ align: 'left', columns: 1, width: 0, bold: true, valign: true, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false },
        { align: 'center', columns: 1, width: 0, bold: true }],
        doc.x, doc.y, docWidth)

    table(doc, [
        ['DATOS GENERALES DE LA LICENCIA'],
        ['Área Total Construida: ', 'Destinación:', 'Uso del Suelo:', 'Tratamiento:', 'Es sujeto de deberes Urbanísticos acorde con el articul 192 del POT Acuerdo 011 de 20', ' Licencia señala deber:', 'Valor (COP)', 'Recibo de pago número: '],
        [`${_LIST_GEN[6]} m2`, _LIST_GEN[7] + ' ', _LIST_GEN[8] + ' ', _LIST_GEN[9] + ' ', '\n', _LIST_GEN[10], numberWithCommas(_LIST_GEN[11]) + ' ', _LIST_GEN[12] + ' ']
    ],
        [5, 4, 5],
        [{ align: 'left', columns: 1, width: 0, bold: true, valign: true, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false, extendRow: 4, extend: 5 },
        { align: 'center', columns: 1, width: 0, bold: true, ignoreRow: 4 }],
        doc.x, doc.y, docWidth)

    doc.fontSize(8);
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`II. DESCRIPCIÓN DEL PROYECTO DE VISTO BUENO DE PROPIEDAD HORIZONTAL`], [1], true, docWidth, 'left');

    var _LIST_CHECK = [];
    if (_DATA.record_ph.review_check) {
        _LIST_CHECK = _DATA.record_ph.review_check.split(';');
    }
    // 0 => VIGENTE PROFESIONAL
    // 1 => 1.1 Área construida
    // 2 => 1.2 Unidades Privada
    // 3 =>  1.3 Espacios Comunes
    // 4 =>  1.4 Área del Predio
    // 5 =>  2.1 Diferenciados con color/áreas
    // 6 =>  2.2 Presentan alineamiento
    // 7 =>  3.1 Piso por piso
    // 8 =>  3.2 Total construida
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`PROFESIONAL RESPONSABLE DE LOS PLANOS`], [1], false, docWidth);
    rowConfCols(doc, doc.y, [`Nombre`, 'Matrícula', 'Certificación Vigente', 'Reporta Sanción'], [6, 3, 3, 2], false, docWidth);
    doc.font('Helvetica')
    var _fun_52 = _DATA.fun_52s ? _DATA.fun_52s : [];
    for (var i = 0; i < _fun_52.length; i++) {
        if (_fun_52[i].role) {
            if ((_fun_52[i].role).includes('ARQUITECTO PROYECTISTA')) rowConfCols(doc, doc.y, [`${_fun_52[i].name} ${_fun_52[i].surname}`, _fun_52[i].registration, _LIST_CHECK[0] == '1' ? 'SI' : 'NO', _fun_52[i].sanction ? "SI" : 'NO'], [6, 3, 3, 2], false, docWidth);
        }
    }
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`RELACIÓN DE PLANOS PRESENTADOS`], [1], false, docWidth);
    rowConfCols(doc, doc.y, ['', `Número de unidades privadas`, 'Bienes comunes (espacios)'], [3, 6, 4], false, docWidth);
    doc.fontSize(7);
    rowConfCols(doc, doc.y, [`ID Plano`, 'Sótano / Piso', 'Área total construida m2', 'Vivienda / Aptos.', 'Locales / Lockers', 'Parcelas / Lotes', 'Parqueos', 'Oficinas', 'Bodegas', 'Numero Parqueos', 'Descripción otros bienes (espacios)'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3], false, docWidth);
    doc.fontSize(8);
    doc.font('Helvetica')
    var _bluprints = _DATA.record_ph.record_ph_blueprints ? _DATA.record_ph.record_ph_blueprints : [];
    var _totales_blueprints = [0, 0, 0, 0, 0, 0, 0, 0]
    for (var i = 0; i < _bluprints.length; i++) {
        var _units = _bluprints[i].units.split(';');
        rowConfCols(doc, doc.y, [_bluprints[i].id_public, _bluprints[i].floor, Number(_bluprints[i].area).toFixed(2), _units[0], _units[1], _units[2], _units[3], _units[4], _units[5], _units[6], _bluprints[i].units_other], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3], false, docWidth);
        _totales_blueprints[0] += Number(_bluprints[i].area);
        _totales_blueprints[1] += Number(_units[0]) ? Number(_units[0]) : 0;
        _totales_blueprints[2] += Number(_units[1]) ? Number(_units[1]) : 0;
        _totales_blueprints[3] += Number(_units[2]) ? Number(_units[2]) : 0;
        _totales_blueprints[4] += Number(_units[3]) ? Number(_units[3]) : 0;
        _totales_blueprints[5] += Number(_units[4]) ? Number(_units[4]) : 0;
        _totales_blueprints[6] += Number(_units[5]) ? Number(_units[5]) : 0;
        _totales_blueprints[7] += Number(_units[6]) ? Number(_units[6]) : 0;
    }
    rowConfCols(doc, doc.y, ['Total construido', (_totales_blueprints[0]).toFixed(2), (_totales_blueprints[1]), (_totales_blueprints[2]), (_totales_blueprints[3]), (_totales_blueprints[4]), _totales_blueprints[5], _totales_blueprints[6], _totales_blueprints[7], ''], [2, 1, 1, 1, 1, 1, 1, 1, 1, 3], false, docWidth);
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`OBSERVACIONES A LA INFORMACIÓN PLANIMÉTRICA`], [1], false, docWidth);
    doc.font('Helvetica')

    table(doc, [
        ['01'],
        ['Los PLANOS para visto bueno concuerdan con los planos aprobados en la licencia urbanística.'],
        ['Área construida', 'Unidades Privada', 'Espacios Comunes ', 'Área del Predio'],
        [_LIST_CHECK[1] == '1' ? 'SI' : 'NO', _LIST_CHECK[2] == '1' ? 'SI' : 'NO', _LIST_CHECK[3] == '1' ? 'SI' : 'NO', _LIST_CHECK[4] == '1' ? 'SI' : 'NO'],
    ],
        [1, 7, 3, 1],
        [{ align: 'center', columns: 1, width: 0, bold: false, valign: true, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false, valign: true, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false },
        { align: 'center', columns: 1, width: 0, bold: true }],
        doc.x, doc.y, docWidth)

    table(doc, [
        ['02'],
        ['Los PLANOS para visto bueno presentados identifican con claridad los tipos de bienes: Privados y Comunes.'],
        ['Diferenciados con color/áreas', 'Presentan alineamiento'],
        [_LIST_CHECK[5] == '1' ? 'SI' : 'NO', _LIST_CHECK[6] == '1' ? 'SI' : 'NO'],
    ],
        [1, 7, 3, 1],
        [{ align: 'center', columns: 1, width: 0, bold: false, valign: true, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false },
        { align: 'center', columns: 1, width: 0, bold: true }],
        doc.x, doc.y, docWidth)


    table(doc, [
        ['03'],
        ['La suma de los bienes privados y comunes coincide con el área total construida  por:'],
        ['Piso por piso', 'Total construida '],
        [_LIST_CHECK[7] == '1' ? 'SI' : 'NO', _LIST_CHECK[8] == '1' ? 'SI' : 'NO'],
    ],
        [1, 7, 3, 1],
        [{ align: 'center', columns: 1, width: 0, bold: false, valign: true, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false, fillColum: true },
        { align: 'left', columns: 1, width: 0, bold: false },
        { align: 'center', columns: 1, width: 0, bold: true }],
        doc.x, doc.y, docWidth)

    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`DETALLES`], [1], false, docWidth);
    doc.font('Helvetica')
    infotext(doc, doc.y, `${_DATA.record_ph.detail}`, true, docWidth, 'justify');

    // IF THIS TABLE WHERE TO BE AT 3/4 OF THE TABLE, IS GOING TO PLACE IT IN THE NEXT PAGE TO PREVENT IT FROM BEING SPLIT IN BETWEEN 2 PAGES
    /*
    if (doc.y >= (doc.page.height - doc.page.margins.bottom) * 3 / 4) {
        doc.addPage();
        doc.text('', doc.x, doc.page.margins.top);
    }
    */
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`RELACIÓN DE ÁREAS`], [1], false, docWidth);
    var _floors = _DATA.record_ph.record_ph_floors ? _DATA.record_ph.record_ph_floors : [];
    genTablePH(doc, _floors);

    /**
     * rowConfCols(doc, doc.y, ['', `Área Privada m2`, 'Área Común m2', ''], [2, 3, 5, 1]);
    doc.fontSize(7);
    rowConfCols(doc, doc.y, [`Piso`, 'Unidad', 'Construida', 'Libre', 'Total Área Privada', 'Construida Común', 'Libre Común', 'Construida Exclusiva', 'Libre Exclusiva', 'Área total Común Construida', 'Área total Visto Bueno'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    rowConfCols(doc, doc.y, [`Operaciones`, '1', '2', '3=(1+2)', '4', '5', '6', '7', '8=(4+6)', '9=(1+8)'], [2, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    doc.font('Helvetica')
    doc.fontSize(8);
   
    var _totales_floors = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (var i = 0; i < _floors.length; i++) {
        var _total_private = [];
        var _total_build_private = 0;

        var _common = _floors[i].common.split(';');
        var _fixed = _floors[i].fixed ? _floors[i].fixed.split(';') : [];
        var _division = _floors[i].division ? _floors[i].division.split(';') : [];
        var _private_build = _floors[i].division_build ? _floors[i].division_build.split(';') : 0.00;
        var _private_free = _floors[i].division_free ? _floors[i].division_free.split(';') : 0.00;

        for (var j = 0; j < _division.length; j++) {
            _total_private.push((Number(_private_build[j] ? _private_build[j] : 0) + Number(_private_free[j] ? _private_free[j] : 0)).toFixed(2));
            _total_build_private += Number(_private_build[j] ? _private_build[j] : 0);
            _totales_floors[0] += Number(_private_build[j] ? _private_build[j] : 0);
            _totales_floors[1] += Number(_private_free[j] ? _private_free[j] : 0);
            _totales_floors[2] += Number(_private_build[j] ? _private_build[j] : 0) + Number(_private_free[j] ? _private_free[j] : 0);
        }
        _totales_floors[3] += Number(_common[0]);
        _totales_floors[4] += Number(_common[1]);
        _totales_floors[5] += Number(_common[2]);
        _totales_floors[6] += Number(_common[3]);
        _totales_floors[7] += Number(_common[0]) + Number(_common[2]);
        _totales_floors[8] += Number(_common[0]) + Number(_common[2]) + Number(_total_build_private);


        if (_fixed[0] == '&&') {
            rowConfCols(doc, doc.y,
                [_floors[i].floor,
                (_division.join('\n')),
                `Estas áreas no se modifican y se mantienen segun escritura ${_fixed[1]} del ${dateParser(_fixed[2])} de la Notaria ${_fixed[3]} de ${_fixed[4]}.`,
                (Number(_common[0]) + Number(_common[2]) + Number(_total_build_private)).toFixed(2)],
                [1, 1, 8, 1]);
        } else {
            rowConfCols(doc, doc.y,
                [_floors[i].floor,
                (_division.join('\n')),
                (_private_build.length > 1 ? _private_build.join('\n') : Number(_private_build).toFixed(2)),
                (_private_free.length > 1 ? _private_free.join('\n') : Number(_private_free).toFixed(2)),
                (_total_private).join('\n'),
                Number(_common[0]).toFixed(2),
                Number(_common[1]).toFixed(2),
                Number(_common[2]).toFixed(2),
                Number(_common[3]).toFixed(2),
                (Number(_common[0]) + Number(_common[2])).toFixed(2),
                (Number(_common[0]) + Number(_common[2]) + Number(_total_build_private)).toFixed(2)],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        }
    }
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, ['Totales', _totales_floors[0].toFixed(2), _totales_floors[1].toFixed(2), _totales_floors[2].toFixed(2), _totales_floors[3].toFixed(2), _totales_floors[4].toFixed(2), _totales_floors[5].toFixed(2), _totales_floors[6].toFixed(2), _totales_floors[7].toFixed(2), _totales_floors[8].toFixed(2)], [2, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    //rowConfCols(doc, doc.y, ['', 'Total Área construida', _totales_floors[8].toFixed(2), ''], [8, 2, 1]);
     * 
     */


    doc.fontSize(8);
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`III. OBSERVACIÓNES`], [1], true, docWidth, 'left');
    doc.font('Helvetica')
    doc.fontSize(8);
    var _BODY = `El presente acto aprueba los planos de alineamiento y el cuadro de área de propiedad horizontal, de acuerdo con  lo exigido en la ley 
    675 de 2001.`.replace(/[\n\r]+ */g, ' ');
    var _BODY_2 = `El presente visto bueno se expide de acuerdo con los planos de propiedad horizontal presentando con la  solicitud, los cuales 
    corresponden a los planos arquitectónicos aprobados en: `.replace(/[\n\r]+ */g, ' ');


    infotext(doc, doc.y, `${_BODY}\n${_BODY_2} ${_DATA.record_ph.detail_3 ? _DATA.record_ph.detail_3 : ""}`, true, docWidth, 'justify');

    doc.fontSize(8);
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [`IV. NOTAS TECNICAS Y JURIDICAS`], [1], true, docWidth, 'left');
    doc.font('Helvetica')
    doc.fontSize(8);

    var _BODY_3 = `Debe mantenerse las condiciones aprobadas para dar cumplimiento a los título J y K de la norma
    sismorresistente, en particular la carga de ocupación. El reglamento de propiedad horizontal debe incluir las condiciones 
    apropiadas acerca de los procedimientos a seguir por parte de los residentes ante la activación de alarmas contra incendio.
    (En caso de haberlas).`.replace(/[\n\r]+ */g, ' ');
    var _BODY_4 = `El presente visto bueno se expide únicamente para propiedad horizontal, por lo tanto, no reemplaza ni modifica 
    la licencia de construcción respectiva. En este sentido no autirza la ejecución de ningún tipo de obra; por tanto, en caso de 
    requerirse estas deberán ser autorizadas mediante la respectiva licencia de construcción.`.replace(/[\n\r]+ */g, ' ');


    infotext(doc, doc.y, `${_BODY_3}\n${_BODY_4}`, true, docWidth, 'justify');

    let aprovedText = 'V. APROBACIÓN: ';
    if (_DATA.record_ph.check == 1) aprovedText += "CUMPLE";
    else aprovedText += "NO CUMPLE, ESTE DOCUMENTO SE ENTIENDE COMO ACTA DE OBSERVACIONES";

    doc.fontSize(8);
    doc.font('Helvetica-Bold')
    rowConfCols(doc, doc.y, [aprovedText], [1], true, docWidth, 'left');
    doc.font('Helvetica')
    doc.fontSize(8);

    if (!_DATA.record_ph.check == 1) infotext(doc, doc.y, `${_DATA.record_ph.detail_2}`, false, docWidth, 'justify');

    doc.fontSize(8);
    /*
    rowConfCols(doc, doc.y, ['Revisión Juridica: ', `${_DATA.record_ph.worker_law_name}`, 'Fecha de Revisión: ', `${dateParser(_DATA.record_ph.date_law_review)}`], [2, 3, 2, 3]);
    rowConfCols(doc, doc.y, ['Revisión Arquitectonica: ', `${_DATA.record_ph.worker_arc_name}`, 'Fecha de Revisión: ', `${dateParser(_DATA.record_ph.date_arc_review)}`], [2, 3, 2, 3]);
    rowConfCols(doc, doc.y, ['\nRESULTADO:\n\n', `\n${_DATA.record_ph.check == '1' ? 'APROBADO' : 'NO APROBADO'}\n\n`], [1, 1]);
    */
    doc.font('Helvetica')
    doc.fontSize(8);

}

function _PDFGEN_PH_ATL(_DATA, doc) {

    const record_ph = _DATA ? _DATA.record_ph : false;
    const record_ph_steps = record_ph ? record_ph.record_ph_steps ? record_ph.record_ph_steps : [] : [];
    const record_ph_bp = record_ph ? record_ph.record_ph_blueprints ? record_ph.record_ph_blueprints : [] : [];
    const _floors = record_ph ? record_ph.record_ph_floors ? record_ph.record_ph_floors : [] : [];
    const f53 = _GET_CHILD_53(_DATA);
    const f2 = _GET_CHILD_2(_DATA);
    const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
    const fun_4 = _DATA.fun_4s ? _DATA.fun_4s : [];
    const f52 = _DATA.fun_52s

    function LOAD_STEP(_id_public) {
        var _CHILD = record_ph_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].id_public == _id_public) return _CHILD[i]
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
    var CON_MASTER = 'ph'
    function print_revview(_VALUES, _CHECKS, _TYPES) {
        if (!_TYPES) return;
        if (!_TYPES.some(ty => ty.includes(CON_MASTER))) return;
        let _PARENT = _VALUES[0];
        _PARENT == 'false' ? _PARENT = '' : _PARENT = _PARENT;
        let _CHILDREN_V = _VALUES;
        let _CHILDREN_C = _CHECKS;
        _CHILDREN_V.shift();
        _CHILDREN_C.shift();

        let limit = 0;
        let manuali = 0

        _CHILDREN_V.map((_child) => {
            console.log(_child)
            if (_child) limit++;
        })

        let _CELLS = [];
        if (_PARENT) _CELLS.push({ coord: [0, 0], w: 10, h: limit, text: _PARENT, config: { bold: true, align: 'center', valign: true } },)

        _CHILDREN_V.map((_child, i) => {
            if (_child) {
                let pOffSet = _PARENT ? 0 : 10;
                _CELLS.push({ coord: [10 - pOffSet, manuali], w: 44 + pOffSet, h: 1, text: _child, config: { align: 'left', } },)
                _CELLS.push({ coord: [54, manuali], w: 6, h: 1, text: CV2(_CHILDREN_C[i], 'CUMPLE'), config: { bold: true, align: 'center', fill: 'gainsboro', } },)
                manuali++;
            }
        })

        let lineHeight = undefined
        if (_VALUES[0].includes('BIENES DE INTERÉS CULTURAL (BIC)')) lineHeight = -1;

        pdfSupport.table(doc,
            [
                ..._CELLS
            ],
            [doc.x, doc.y], [60, limit], { lineHeight: lineHeight })
    }

    const CV2 = (val, df) => {
        if (val == 0) return 'NO CUMPLE';
        if (val == 1) return 'CUMPLE';
        if (val == 2) return 'NO APLICA';
        if (df) return df;
        return ''
    }

    const BLUEPRINTS_HELPER = [
        'Viviendas/ Apartamentos',
        'Locales / Lockers',
        'Parcelas / Lotes',
        'Parqueos',
        'Oficinas',
        'Bodegas'
    ]

    const BODY_1 = `${curaduriaInfo.pronoum} ${curaduriaInfo.job}, ${(curaduriaInfo.master).toUpperCase()}, en uso de sus facultades legales, conferidas en la Ley 9 de 1989; Ley 388 de 1997; Ley 400 de 1997; Ley 675 de 2001 o la norma que la adicione, modifique o sustituya; Ley 810 de 2003; Ley 1796 de 2016; el Decreto 1077 de 2015 y sus Decretos modificatorios; el Decreto 926 de 2010 y sus decretos modificatorios; el Reglamento Colombiano de Construcción Sismo Resistente — NSR-10 y el Acuerdo Municipal N° ${curaduriaInfo.pot.n} de ${curaduriaInfo.pot.yy} mediante el cual se adoptó el ${curaduriaInfo.pot.pot} del Municipio de ${curaduriaInfo.city}, otorga una APROBACIÓN DE LOS PLANOS DE PROPIEDAD HORIZONTAL, decisión soportada en las siguientes,`
    const BODY_2 = `Que de conformidad con el artículo 2.2.6.1.3.1 del Decreto 1077 de 2015 se entiende por otras actuaciones relacionadas con la expedición de las licencias, aquellas vinculadas con el desarrollo de proyectos urbanísticos o arquitectónicos, que se pueden ejecutar independientemente o con ocasión de la expedición de una licencia dentro de las cuales se puede enunciar la aprobación de los Planos de Propiedad Horizontal consagrada en el numeral 5 ibídem, como la aprobación que otorga el curador urbano competente para el estudio, trámite y expedición de las licencias, a los planos de alinderamiento, cuadros de áreas o al proyecto de división entre bienes privados y bienes comunes de la propiedad horizontal exigidos por la Ley 675 de 2001 o la norma que la adicione, modifique o sustituya, los cuales deben corresponder fielmente al proyecto de parcelación, urbanización o construcción aprobado mediante licencias urbanísticas o el aprobado por la autoridad competente cuando se trate de bienes de interés cultural. Estos deben señalar la localización, linderos, nomenclatura, áreas de cada una de las unidades privadas y las áreas y bienes de uso común. `;
    const BODY_3 = `Revisado el expediente se evidencia que el solicitante dio cumplimiento a los requisitos exigidos por las Resoluciones 0462 de 2017, 1025 y 1026 de 2021 del Ministerio de Vivienda, Ciudad y Territorio; asimismo los planos presentados se encuentran ajustados a lo establecido en la Ley 675 de 2001 y por tanto se considera viable otorgar el visto bueno a los mismos, para ser sometidos al Régimen de Propiedad Horizontal.`;
    const BODY_4 = `En mérito de lo expuesto en la parte considerativa, ${curaduriaInfo.pronoum} ${curaduriaInfo.job} de ${curaduriaInfo.city},`

    const ART_1 = `Aprobar los planos de propiedad horizontal y el cuadro de áreas para el sometimiento al régimen de propiedad horizontal, en los términos señalados en la Ley 675 de 2001, a la edificación identificada en el numeral primero del acápite de considerandos del presente acto administrativo.`;
    const PAR_1_1 = `Las áreas comunes y privadas del proyecto, para su constitución en Propiedad Horizontal están contenidas en la siguiente descripción del visto bueno a los planos para propiedad horizontal:`;
    const PAR_1_2 = `Se aprueba en razón a que el área construida aprobada en el reconocimiento coincide con las presentadas en el V.º B.º  de propiedad horizontal. Presenta cuadro de alineamiento.`;

    const ART_2 = `Los planos arquitectónicos, hacen parte integral de la presente resolución.`;
    const ART_3 = `Por razones de seguridad, el original de la presente resolución y los planos aprobados mediante la misma, llevarán el sello seco distintivo de ${curaduriaInfo.pronoum} ${curaduriaInfo.job} de ${curaduriaInfo.city}.`;
    const ART_4 = `Notificar al solicitante el contenido de la presente resolución en los términos previstos en los artículos 67 y siguientes de la Ley 1437 de 2011 –CPACA-.`
    const PAR_4_1 = `Podrá notificarse por medio electrónico, siempre que el solicitante haya aceptado este último medio de notificación, de conformidad con lo estipulado en el artículo 56 y el numeral 1 del artículo 67 de la ley 1437 de 2011; así como las demás normas que reglamenten los procedimientos por medios electrónicos; de no poder hacerse de esta forma se realizará conforme el procedimiento previsto en los artículos 67 y ss., de la Ley 1437 de 2011, es decir mediante citación para notificación personal y de no poder hacer la notificación personal al cabo de cinco (5) días del envío de la citación, se notificará por aviso de conformidad con el Art 69 ss., y concordantes de la ley ibídem.`;
    const ART_5 = `Contra la presente resolución proceden los recursos en la vía administrativa señalados en el Artículo 74 de la Ley 1437 de 2011 –CPACA-, como son el de reposición ante ${curaduriaInfo.pronoum} ${curaduriaInfo.job} de ${curaduriaInfo.city}, y el de apelación, para ante la Oficina Asesora de Planeación de ${curaduriaInfo.city}, dentro de los diez (10) días hábiles siguientes a la fecha de la notificación correspondiente.`
    const ART_6 = `La presente resolución rige a partir de su fecha de ejecutoria.`;

    let ph_details = _GET_STEP_TYPE('ph_details', 'value');
    let USO = _FUN_6_PARSER(fun_1.usos ? fun_1.usos.split(',') : [], true);
    let V_TIPO = '';
    if (fun_1.usos) {
        if (fun_1.usos.includes('A')) V_TIPO = _FUN_8_PARSER(fun_1.vivienda ? fun_1.vivienda.split(',') : [], true);
        if (V_TIPO) USO += ` (${V_TIPO})`
    }

    let prof = _FIND_F5(f52, 'DIRECTOR DE LA CONSTRUCCION');
    if (!prof) prof = _FIND_F5(f52, 'URBANIZADOR O CONSTRUCTOR RESPONSABLE');
    if (!prof) prof = {};

    doc.fontSize(13);
    doc.font('Helvetica-Bold')
    doc.text(`${(curaduriaInfo.job)}`, { align: 'center' });
    doc.fontSize(12);
    doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`, { align: 'center' });
    doc.fontSize(7);
    doc.text(curaduriaInfo.call, { align: 'center' });
    doc.text(`\n\n`);


    doc.fontSize(11);
    doc.font('Helvetica')

    doc.text(BODY_1, { align: 'justify' });
    doc.moveDown();

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: 'I. CONSIDERACIONES', config: { align: 'center', bold: true, fill: 'steelblue', color: 'white' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    doc.moveDown();

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: '1. INFORMACION GENERAL', config: { align: 'left', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'NOMBRE DEL TITULAR', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: f53.item_5311 + ' ' + f53.item_5312, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'CÉDULA DEL PROPIETARIO', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: f53.item_532, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'MATRÍCULA INMOBILIARIA', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: f2.matricula, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'NÚMERO PREDIAL O CATASTRAL N°', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: f2.catastral_2 || f2.catastral, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'NOMENCLATURA', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: f2.direccion, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'LOCALIZACIÓN', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: curaduriaInfo.city, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'LINDEROS', config: { align: 'left', } },
            {
                coord: [20, 0], w: 40, h: 1, text: fun_4.map(f4 => {
                    return `${f4.coord}: ${f4.colinda} - ${f4.longitud} m`
                }).join('\n'), config: { align: 'left', bold: true, }
            },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'ÁREA DEL PREDIO', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: (ph_details[0] || '') + ' m2', config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'ÁREA TOTAL CONSTRUIDA', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: `${record_ph_bp.reduce((sum, prev) => sum += Number(prev.area), 0)} m2`, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'USO AUTORIZADO', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: USO, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    if (ph_details[1]) pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'ACTOS ADMINISTRATIVOS QUE ANTECEDEN Y/O LICENCIA(S) DE GESTIÓN', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: ph_details[1], config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'PROFESIONAL RESPONSABLE', config: { align: 'left', } },
            { coord: [20, 0], w: 40, h: 1, text: `- Arquitecto(a)/Ingeniero(a): ${prof.name} ${prof.surname}\n- Mat. Prof. N°: ${prof.registration}`, config: { align: 'left', bold: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 20, h: 1, text: 'PLANOS PRESENTADOS V.º B.º', config: { align: 'left', } },
            {
                coord: [20, 0], w: 40, h: 1, text: record_ph_bp.map(bp => {
                    let units = bp.units ? bp.units.split(';') : [];
                    let text = [];
                    BLUEPRINTS_HELPER.map((helper, i) => {
                        if (units[i] > 0) text.push(units[i] + ' ' + helper);

                    });
                    if (bp.units_other) text.push(bp.units_other);
                    return bp.id_public + ': ' + text.join(', ') + '.';
                }).join('\n\n'), config: { align: 'left', }
            },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    doc.moveDown();

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: '2. FUNDAMENTOS DE LA APROBACIÓN', config: { align: 'left', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 3, h: 1, text: '2.1', config: { align: 'left', bold: true, hide: true, } },
            { coord: [3, 0], w: 54, h: 1, text: BODY_2, config: { align: 'justify', hide: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 3, h: 1, text: '2.2', config: { align: 'left', bold: true, hide: true, } },
            { coord: [3, 0], w: 54, h: 1, text: BODY_3, config: { align: 'justify', hide: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [3, 0], w: 54, h: 1, text: BODY_4, config: { align: 'justify', hide: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    doc.moveDown();

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: 'II. RESUELVE', config: { align: 'center', bold: true, fill: 'steelblue', color: 'white' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 });

    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`ARTÍCULO PRIMERO: `, { continued: true });
    doc.font('Helvetica');
    doc.text(ART_1, { align: 'justify' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`PARÁGRAFO 1. `, { continued: true });
    doc.font('Helvetica');
    doc.text(PAR_1_1, { align: 'justify' });
    doc.moveDown();

    // TABLE
    doc.fontSize(7);
    doc.font('Helvetica-Bold');
    genTablePH(doc, _floors);

    // END TABLE

    doc.fontSize(11);
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`PARÁGRAFO 2. `, { continued: true });
    doc.font('Helvetica');
    doc.text(PAR_1_2, { align: 'justify' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`ARTÍCULO SEGUNDO: `, { continued: true });
    doc.font('Helvetica');
    doc.text(ART_2, { align: 'justify' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`ARTÍCULO TERCERO: `, { continued: true });
    doc.font('Helvetica');
    doc.text(ART_3, { align: 'justify' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`ARTÍCULO CUARTO: `, { continued: true });
    doc.font('Helvetica');
    doc.text(ART_4, { align: 'justify' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`PARÁGRAFO 1. `, { continued: true });
    doc.font('Helvetica');
    doc.text(PAR_4_1, { align: 'justify' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`ARTÍCULO QUINTO: `, { continued: true });
    doc.font('Helvetica');
    doc.text(ART_5, { align: 'justify' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text(`ARTÍCULO SEXTO: `, { continued: true });
    doc.font('Helvetica');
    doc.text(ART_6, { align: 'justify' });
    doc.moveDown();

    doc.text(`Expedida en ${curaduriaInfo.city}, el ${dateParser(record_ph.date_arc_review)}.`, { align: 'left' });
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text('NOTIFÍQUESE Y CÚMPLASE,', { align: 'left' });
    doc.moveDown();

}

// CREATES ROW WITH EACH COLUMNS HAVING A FIXED WIDTH EQUALS TO THE PROPORTION IN _cols SIMILAR TO THE BOOTSTRAP MODEL
// THAT MEANS THAT IT WILL DIVIVED THE WIDTH IN THE LENGTH OF _cols SEGMENTS AND GIVE EACH COLUMN A WIDTH BASED ON HOW MANY _cols[i] IS GIVEN
// SO _cols[1,2,3] IS GOING TO CREATED 3 COLUMNS, THE FIRST ONLY 1 SEGMEN WIDTH, THE SECOND WITH 2 SEGMENT WIDTH AND THE THIRD WITH
// 3 SEGMENT WIDTH
// _data AND _cols MUST BE OF THE SAME LENGTH, OTHER WISE IS GOING TO IGNORE ANYTHING PASS THE LENGTH OF _cols
function rowConfCols(doc, Y, _data, _cols, pretty_cell = false, _width = 500, _align = 'center', X = 56) {
    var cells_width = [];
    var _X = doc.page.margins.left;
    const cols = _cols.length
    var total = 0;
    for (var i = 0; i < cols; i++) {
        total += _cols[i];
    }
    for (var i = 0; i < cols; i++) {
        cells_width.push((((_cols[i]) / (total)) * _width))
    }
    var cell_heigh = 0;
    var _Y = Y

    for (var i = 0; i < cols; i++) {
        var i_heigh = doc.heightOfString(_data[i], {
            align: _align,
            columns: 1,
            width: cells_width[i] - 5,
        });
        if (i_heigh > cell_heigh) cell_heigh = i_heigh;
    }
    _Y = checkForPageJump(doc, cell_heigh, _Y);

    for (var i = 0; i < cols; i++) {
        if (pretty_cell) {
            doc.lineJoin('miter')
                .lineWidth(0.6)
                .rect(_X + getXforCol(_width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
                .fill("silver", 0.3)
                .stroke();
        }
        doc.lineJoin('miter')
            .lineWidth(0.6)
            .rect(_X + getXforCol(_width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
            .fillColor("black", 1)
            .strokeColor("black", 1)
            .stroke()
    }

    for (var i = 0; i < cols; i++) {
        doc.text(_data[i], _X + getXforCol(_width, _cols, i) + 3, _Y + 5, {
            align: _align,
            columns: 1,
            width: cells_width[i] - 5,
        });
    }

    doc.text('', _X, _Y + cell_heigh + 5);
    return doc
}

// 
function table(doc, _DATA, _cols, _colsStyle = [], X, Y, _width = 500) {
    var cells_width = [];
    const cols = _cols.length
    var total = 0;
    var colsStyle = _colsStyle;
    for (var i = 0; i < cols; i++) {
        total += _cols[i];
    }
    for (var i = 0; i < cols; i++) {
        cells_width.push((((_cols[i]) / (total)) * _width))
    }
    for (var i = 0; i < cells_width.length; i++) {
        if (!_colsStyle) colsStyle.push({ align: 'left', columns: 1, width: cells_width[i] - 5, bold: false })
        else colsStyle[i].width = cells_width[i] - 5
    }

    var max_height = 0;
    var _Y = Y
    var cells_height = []
    var cells_y = []
    for (var i = 0; i < _DATA.length; i++) {
        let i_height = 0;
        var _columns_data = _DATA[i];
        cells_height.push([0]);
        cells_y.push([])
        for (var j = 0; j < _columns_data.length; j++) {
            let configs = colsStyle[i]
            doc.font('Helvetica-Bold')
            if (configs.extendRow == j) configs.width = configs.width * configs.extend - 5
            let j_height = doc.heightOfString(_columns_data[j], configs) + 5;
            doc.font('Helvetica')
            i_height += j_height
            cells_height[i].push(i_height)
            cells_y[i].push(j_height)
            if (i_height > max_height) max_height = i_height;
        }
    }
    // REDISTRIBUITE CELLS
    let extra_h = cells_y[2][2] - cells_y[1][2]
    if (extra_h > 0) {
        cells_y[1][2] = cells_y[2][2]
        for (var j = 3; j < cells_height[1].length; j++) {
            cells_height[1][j] += extra_h;

        }
    }

    extra_h = cells_y[2][3] - cells_y[1][3]
    if (extra_h > 0) {
        cells_y[1][3] = cells_y[2][3]
        for (var j = 4; j < cells_height[1].length; j++) {
            cells_height[1][j] += extra_h;

        }
    }


    //

    _Y = checkForPageJump(doc, max_height, _Y);

    for (var i = 0; i < _DATA.length; i++) {
        var _columns_data = _DATA[i];
        for (var j = 0; j < _columns_data.length; j++) {

            let cell_h = 0;
            let align_center = cells_height[i][j] + 5;
            let cell_width = cells_width[i]
            let configs = colsStyle[i]

            if (configs.fillColum) {
                cell_h = max_height
            } else {
                cell_h = cells_y[i][j];
            }
            if (configs.extendRow == j) cell_width = cell_width + ((configs.extend) / (total) * _width)

            if (configs.ignoreRow != j) {
                doc.lineJoin('miter')
                    .lineWidth(0.5)
                    .rect(X + getXforCol(_width, _cols, i), _Y + cells_height[i][j], cell_width, cell_h)
                    .fillColor("black", 1)
                    .strokeColor("black", 1)
                    .stroke()
            }

            if (colsStyle[i].valign) { align_center = cell_h / 2 - cells_y[i][j] / 2 }
            if (colsStyle[i].bold) doc.font('Helvetica-Bold')
            doc.text(_columns_data[j], X + getXforCol(_width, _cols, i) + 3, _Y + align_center, configs);
            doc.font('Helvetica')
        }

    }
    doc.text('', X, _Y + max_height);
    return doc
}

// TAKES A TEXT STRING AS ELEMENT AND CREATES A TEXT BOX CONSEQUENLY FORMATED
// IF useCounters, THE TEXT IS GOING TO BE SEPARATED AT EACH \n AND THEN GIVE THEIR OWN NUMBERATION
// THAT USES LOWER CASE LETTER, IF NOT, IS SIMPLY GOING TO USE A -
function infotext(doc, Y, text, useCounters = false, _width = 500, _align = 'left', X = 56) {
    var cell_heigh = 0;
    var _Y = Y
    var _X = doc.page.margins.left;

    var i_heigh = doc.heightOfString(text, {
        align: _align,
        columns: 1,
        width: _width - 40,
    });
    if (i_heigh > cell_heigh) cell_heigh = i_heigh;
    _Y = checkForPageJump(doc, cell_heigh, _Y);

    let _data = text.split('\n')
    let initial = 'a'
    let _delta_y = [0];
    let _delta = 0;

    for (var i = 0; i < _data.length; i++) {
        var i_heigh = doc.heightOfString(_data[i] + "\n\n", {
            align: _align,
            columns: 1,
            width: _width - 40,
        });
        _delta += i_heigh
        _delta_y.push(_delta)
    }
    _Y = checkForPageJump(doc, _delta, _Y);

    for (var i = 0; i < _data.length; i++) {
        if (useCounters) {
            doc.text(initial + ".", _X + 6, _Y + _delta_y[i] + 10);
            initial = nextLetter(initial);
            doc.text(_data[i] + "\n\n", _X + 20, _Y + _delta_y[i] + 10, {
                align: _align,
                columns: 1,
                width: _width - 40,
            });
        }
        else {
            doc.text(" - ", _X + 6, _Y + _delta_y[i] + 10);
            doc.text(_data[i], _X + 20, _Y + _delta_y[i] + 10, {
                align: _align,
                columns: 1,
                width: _width - 40,
            });
        }

    }


    doc.lineJoin('miter')
        .rect(_X, _Y, _width, _delta + 10)
        .lineWidth(0.5)
        .stroke()

    doc.text('', _X, _Y + _delta + 10);
}


// SUPPORTING FUNCTIONS FOR infotext
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

// THERE IS A BUG IN PDFKIT THAT MAKES THE DOCUMENT DO VARIOUS PAGE JUMPS WHEN PRINTING COLUMSN NEAR THE END OF THE PAGE
// THIS BASICALLy CHECKS THAT CASE EDGE AND PRINTS THE COLUMN CORRECTLY
function checkForPageJump(doc, _height, _Y) {
    if (_Y + _height + 10 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        return doc.page.margins.top;
    }
    return doc.y
}

// SUPPORTING FUNCTIONS FOR row12Cols
function getXforCol(_width, _cols, index) {
    var X = 0;
    const cols = _cols.length
    var total = 0;
    for (var i = 0; i < cols; i++) {
        total += _cols[i];
    }
    for (var i = 0; i < cols; i++) {
        if (i == index) return X
        X += (((_cols[i]) / (total)) * _width)
    }
    return X
}

function dateParser(date) {
    const moment = require('moment');
    let esLocale = require('moment/locale/es');
    var momentLocale = moment(date, 'YYYY-MM-DD').locale('es', esLocale);
    return momentLocale.format("LL")
}

function numberWithCommas(x) {
    let _newX = x;
    if (!x) _newX = '';
    return _newX.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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

    const _BODY = `Por el presente medio me permito cirtarlo(a) para que en un término máximo de cinco (5) días hábiles, contados 
    a partir de la fecha de recibo de esta comunicación, comparezca ante esta Curaduría Urbana, con el objeto de notificarle 
    personalmente del contenido de la Resolución No. ${_DATA.ph_id}, del ${dateParser(_DATA.ph_date)} emitida dentro del 
    trámite con Radicado No. ${_DATA.id_public}.`.replace(/[\n\r]+ */g, ' ');

    const _BODY2 = `Transcurrido el término anterior, se procederá a la notificación mediante aviso, de conformidad con 
    lo establecido en el artículo 69 de la Ley 1437 de 2011 -CPACA-.`.replace(/[\n\r]+ */g, ' ');

    doc.pipe(fs.createWriteStream('./docs/public/ph_not.pdf'));

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

let _GET_CHILD_53 = (_DATA) => {
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
let _GET_CHILD_2 = (_DATA) => {
    var _CHILD = _DATA.fun_2;
    var _CHILD_VARS = {
        direccion: _CHILD ? _CHILD.direccion : '',
        direccion_ant: _CHILD ? _CHILD.direccion_ant : '',
        matricula: _CHILD ? _CHILD.matricula : '',
        catastral: _CHILD ? _CHILD.catastral : '',
        catastral_2: _CHILD ? _CHILD.catastral_2 : '',
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
function _FIND_F5(fun5, role) {
    if (!fun5) return false;
    for (let i = 0; i < fun5.length; i++) {
        const f5 = fun5[i];
        if (f5.role == role) {
            return f5;
        }
    }
    return false;
}

function genTablePH(doc, _floors) {

    pdfSupport.table(doc,
        [
            { coord: [12, 0], w: 18, h: 1, text: 'Área Privada m2', config: { align: 'center', bold: true, fill: 'silver', } },
            { coord: [30, 0], w: 30, h: 1, text: 'Área Común m2', config: { align: 'center', bold: true, fill: 'silver', } },
        ],
        [doc.x, doc.y], [66, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 6, h: 1, text: 'Piso', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            { coord: [6, 0], w: 6, h: 1, text: 'Unidad', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

            { coord: [12, 0], w: 6, h: 1, text: 'Construida', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            { coord: [18, 0], w: 6, h: 1, text: 'Libre', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            { coord: [24, 0], w: 6, h: 1, text: 'Total Área Privada', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

            { coord: [30, 0], w: 6, h: 1, text: 'Construida Común', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            { coord: [36, 0], w: 6, h: 1, text: 'Libre Común', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            { coord: [42, 0], w: 6, h: 1, text: 'Construida Exclusiva', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            { coord: [48, 0], w: 6, h: 1, text: 'Libre Exclusiva', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
            { coord: [54, 0], w: 6, h: 1, text: 'Área total Común Construida', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

            { coord: [60, 0], w: 6, h: 1, text: 'Área total Visto Bueno', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [66, 1], { lineHeight: -1 });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 12, h: 1, text: 'Operaciones', config: { align: 'center', bold: true, } },

            { coord: [12, 0], w: 6, h: 1, text: '1', config: { align: 'center', bold: true, } },
            { coord: [18, 0], w: 6, h: 1, text: '2', config: { align: 'center', bold: true, } },
            { coord: [24, 0], w: 6, h: 1, text: '3=(1+2)', config: { align: 'center', bold: true, } },

            { coord: [30, 0], w: 6, h: 1, text: '4', config: { align: 'center', bold: true, } },
            { coord: [36, 0], w: 6, h: 1, text: '5', config: { align: 'center', bold: true, } },
            { coord: [42, 0], w: 6, h: 1, text: '6', config: { align: 'center', bold: true, } },
            { coord: [48, 0], w: 6, h: 1, text: '7', config: { align: 'center', bold: true, } },
            { coord: [54, 0], w: 6, h: 1, text: '8=(4+6)', config: { align: 'center', bold: true, } },

            { coord: [60, 0], w: 6, h: 1, text: '9=(1+8)', config: { align: 'center', bold: true, } },
        ],
        [doc.x, doc.y], [66, 1], { lineHeight: -1 });


    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
    //doc.on('pageAdded', () => { doc.startPage = doc.startPage + 1 });
    var _totales_floors = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (var i = 0; i < _floors.length; i++) {
        var _total_private = [];
        var _total_build_private = 0;

        var _common = _floors[i].common.split(';');
        var _fixed = _floors[i].fixed ? _floors[i].fixed.split(';') : [];
        var _division = _floors[i].division ? _floors[i].division.split(';') : [' '];
        var _private_build = _floors[i].division_build ? _floors[i].division_build.split(';') : 0.00;
        var _private_free = _floors[i].division_free ? _floors[i].division_free.split(';') : 0.00;

        for (var j = 0; j < _division.length; j++) {
            _total_private.push((Number(_private_build[j] ? _private_build[j] : 0) + Number(_private_free[j] ? _private_free[j] : 0)).toFixed(2));
            _total_build_private += Number(_private_build[j] ? _private_build[j] : 0);
            _totales_floors[0] += Number(_private_build[j] ? _private_build[j] : 0);
            _totales_floors[1] += Number(_private_free[j] ? _private_free[j] : 0);
            _totales_floors[2] += Number(_private_build[j] ? _private_build[j] : 0) + Number(_private_free[j] ? _private_free[j] : 0);
        }
        _totales_floors[3] += Number(_common[0]);
        _totales_floors[4] += Number(_common[1]);
        _totales_floors[5] += Number(_common[2]);
        _totales_floors[6] += Number(_common[3]);
        _totales_floors[7] += Number(_common[0]) + Number(_common[2]);
        _totales_floors[8] += Number(_common[0]) + Number(_common[2]) + Number(_total_build_private);


        if (_fixed[0] == '&&') {
            let total = (Number(_common[0]) + Number(_common[2]) + Number(_total_build_private)).toFixed(2);
            let fixed = `Estas áreas no se modifican y se mantienen segun escritura ${_fixed[1]} del ${dateParser(_fixed[2])} de la Notaria ${_fixed[3]} de ${_fixed[4]}.`;
            let h = _division.length;
            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 6, h: h, text: _floors[i].floor, config: { align: 'center', valign: true } },

                    ..._division.map((d, i) => {
                        return { coord: [6, i], w: 6, h: 1, text: d, config: { align: 'center', valign: true } };
                    }),

                    { coord: [12, 0], w: 48, h: h, text: fixed, config: { align: 'left', valign: true } },

                    { coord: [60, 0], w: 6, h: h, text: total, config: { align: 'center', valign: true } },
                ],
                [doc.x, doc.y], [66, h], { lineHeight: -1, adjustPageBreak: true});

        } else {
            let h = _division.length;
            let _w = _division.length == 1 && _division[0] === ' ' ? 12 : 6;
            pdfSupport.table(doc,
                [

                    ..._division.map((d, i) => {
                        return { coord: [6, i], w: 6, h: 1, text: d, config: { align: 'center', valign: true } };
                    }),

                    { coord: [0, 0], w: _w, h: h, text: _floors[i].floor, config: { align: 'center', valign: true, } },

                    ..._division.map((d, i) => {
                        let value = _private_build.length > 1 ? _private_build[i] : Number(_private_build).toFixed(2);
                        return { coord: [12, i], w: 6, h: 1, text: value, config: { align: 'center', valign: true, } };
                    }),
                    ..._division.map((d, i) => {
                        let value = _private_free.length > 1 ? _private_free[i] : Number(_private_free).toFixed(2);
                        return { coord: [18, i], w: 6, h: 1, text: value, config: { align: 'center', valign: true, } };
                    }),
                    ..._division.map((d, i) => {
                        let value = _total_private[i];
                        return { coord: [24, i], w: 6, h: 1, text: value, config: { align: 'center', valign: true, } };
                    }),

                    { coord: [30, 0], w: 6, h: h, text: Number(_common[0]).toFixed(2), config: { align: 'center', valign: true, } },
                    { coord: [36, 0], w: 6, h: h, text: Number(_common[1]).toFixed(2), config: { align: 'center', valign: true, } },
                    { coord: [42, 0], w: 6, h: h, text: Number(_common[2]).toFixed(2), config: { align: 'center', valign: true, } },
                    { coord: [48, 0], w: 6, h: h, text: Number(_common[3]).toFixed(2), config: { align: 'center', valign: true, } },
                    { coord: [54, 0], w: 6, h: h, text: (Number(_common[0]) + Number(_common[2])).toFixed(2), config: { align: 'center', valign: true, } },

                    { coord: [60, 0], w: 6, h: h, text: (Number(_common[0]) + Number(_common[2]) + Number(_total_build_private)).toFixed(2), config: { align: 'center', valign: true, } },
                ],
                [doc.x, doc.y], [66, h], { lineHeight: -1, adjustPageBreak: true });
        }
    }
    //doc.on('pageAdded', () => { doc.startPage = doc.startPage });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 12, h: 1, text: 'Totales', config: { align: 'center', bold: true, } },

            { coord: [12, 0], w: 6, h: 1, text: _totales_floors[0].toFixed(2), config: { align: 'center', bold: true, } },
            { coord: [18, 0], w: 6, h: 1, text: _totales_floors[1].toFixed(2), config: { align: 'center', bold: true, } },
            { coord: [24, 0], w: 6, h: 1, text: _totales_floors[2].toFixed(2), config: { align: 'center', bold: true, } },

            { coord: [30, 0], w: 6, h: 1, text: _totales_floors[3].toFixed(2), config: { align: 'center', bold: true, } },
            { coord: [36, 0], w: 6, h: 1, text: _totales_floors[4].toFixed(2), config: { align: 'center', bold: true, } },
            { coord: [42, 0], w: 6, h: 1, text: _totales_floors[5].toFixed(2), config: { align: 'center', bold: true, } },
            { coord: [48, 0], w: 6, h: 1, text: _totales_floors[6].toFixed(2), config: { align: 'center', bold: true, } },
            { coord: [54, 0], w: 6, h: 1, text: _totales_floors[7].toFixed(2), config: { align: 'center', bold: true, } },

            { coord: [60, 0], w: 6, h: 1, text: _totales_floors[8].toFixed(2), config: { align: 'center', bold: true, } },
        ],
        [doc.x, doc.y], [66, 1], { lineHeight: -1 });
}
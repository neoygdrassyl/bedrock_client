const db = require("../models");
const NORM = db.norm;
const NORM_PREDIO = db.norm_predio;
const NORM_NEIGHBOR = db.norm_neighbor;
const NORM_PERFIL = db.norm_perfil;
const NORM_PERFIL_ELEMENT = db.norm_perfil_element;

const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");
const NORMAS = require("../config/norms.json");
var QRCode = require('qrcode')

const ELEMENTS = [
    { value: "fc", name: "FC" },
    { value: "fa", name: "FA" },
    { value: "peatonal", name: "Peatonal" },
    { value: "bike", name: "Cicloruta" },
    { value: "bay", name: "Bahia" },
    { value: "parking", name: "Bolsa de Parqueadero" },
    { value: "parallel", name: "Paralela" },
    { value: "s_lat", name: "S. Lateral" },
    { value: "road", name: "Calzada" },
    { value: "s_central", name: "S. Central" },
];

// NORM CONTROLLERS
exports.findAll_norm = (req, res) => {
    NORM.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving ALL DATA." });
        });
};
exports.findById_norm = (req, res) => {
    const id = req.params.id;

    NORM.findOne({
        where: { id: id },
        include: [NORM_PREDIO, NORM_NEIGHBOR, NORM_PERFIL]
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
exports.create_norm = (req, res) => {
    // Create
    var object = {
        ...req.body
    }

    NORM.create(object)
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
exports.update_norm = (req, res) => {
    const id = req.params.id;

    const file = req.files[0];
    if (file) {
        // DELETE CURRENT FILE
        if (req.body.fun6id != "null" && req.body.fun6id) {
            fs.unlink(req.body.fun6id, (err) => {
                console.log('FILE FOR ATTACH NORM, DETELED! THIS IS FOR EDIT', id);
                if (err) return res.send(err);
            });
        }

        // UPDATE PATH FILE
        var mimetype = file.mimetype;
        if (mimetype != 'image/jpeg' && mimetype != 'image/png') {
            fs.unlink(file.path, (err) => {
                console.log('FILE NOT COMPATIBLE, DETELED!');
                if (err) return res.send(err);
            });
        }
        req.body.fun6id = file.path;
    }


    NORM.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num > 0) {
            res.send('OK');
        } else {
            res.send(`ERROR_2 : ` + num); // NO MATCHING ID
        }
    })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occurred while UPDATING." });
        });
};
exports.delete_norm = (req, res) => {
    const id = req.params.id;

    NORM.findOne({
        where: { id: id }
    }).then(item => {
        if (item.fun6id != "null" && item.fun6id) {
            fs.unlink(item.fun6id, (err) => {
                console.log('FILE FOR ATTACH NORM, DETELED! THIS IS FOR EDIT', id);
                if (err) console.log(res.send(err));
            });
        }
        deleteItem()
    })


    function deleteItem() {
        NORM.destroy({
            where: { id: id }
        })
            .then(num => {
                if (num > 0) {
                    res.send('OK');
                } else {
                    res.send(`ERROR_2`); // NO MATCHING ID
                }
            })
    }

};

exports.get_norm_img = (req, res) => {
    const fileAtr = req.params.url.split('_');
    const directoryPath = __basedir + "/docs/norms/" + fileAtr[1] + "/" + fileAtr[2] + "/";
    const fileName = req.params.url;

    res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        } else {
            console.log('DOWNLOAD REQUESTED, GIVEN: ', fileName)
        }
    });
};

// PREDIO CONTROLLERS
exports.findAll_predio = (req, res) => {
    const id = req.params.id;
    NORM_PREDIO.findAll(
        {
            where: { normId: id }
        }
    )
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving ALL DATA." });
        });
};
exports.findById_predio = (req, res) => {
    const id = req.params.id;

    NORM_PREDIO.findOne({
        where: { id: id }
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
exports.create_predio = (req, res) => {
    // Create
    var object = {
        ...req.body
    }

    NORM_PREDIO.create(object)
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
exports.update_predio = (req, res) => {
    const id = req.params.id;
    NORM_PREDIO.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num > 0) {
            res.send('OK');
        } else {
            res.send(`ERROR_2 : ` + num); // NO MATCHING ID
        }
    })
};
exports.delete_predio = (req, res) => {
    const id = req.params.id;
    NORM_PREDIO.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num > 0) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};

// NEIGHBOR CONTROLLERS
exports.findAll_neighbor = (req, res) => {
    const id = req.params.id;
    NORM_NEIGHBOR.findAll({
        where: { normId: id }
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving ALL DATA." });
        });
};
exports.findById_neighbor = (req, res) => {
    const id = req.params.id;

    NORM_NEIGHBOR.findOne({
        where: { id: id }
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
exports.create_neighbor = (req, res) => {
    // Create

    const file = req.files[0];
    if (file) {
        req.body.fun6id = file.path;
    }

    var object = {
        ...req.body
    }

    NORM_NEIGHBOR.create(object)
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
exports.update_neighbor = (req, res) => {
    const id = req.params.id;

    const file = req.files[0];
    if (file) {
        // DELETE CURRENT FILE
        if (req.body.fun6id != "null" && req.body.fun6id) {
            fs.unlink(req.body.fun6id, (err) => {
                console.log('FILE FOR ATTACH NORM, DETELED! THIS IS FOR EDIT', id);
                if (err) return res.send(err);
            });
        }

        // UPDATE PATH FILE
        var mimetype = file.mimetype;
        if (mimetype != 'image/jpeg' && mimetype != 'image/png') {
            fs.unlink(file.path, (err) => {
                console.log('FILE NOT COMPATIBLE, DETELED!');
                if (err) return res.send(err);
            });
        }
        req.body.fun6id = file.path;
    }

    NORM_NEIGHBOR.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num > 0) {
            res.send('OK');
        } else {
            res.send(`ERROR_2 : ` + num); // NO MATCHING ID
        }
    })
};
exports.delete_neighbor = (req, res) => {
    const id = req.params.id;

    NORM_NEIGHBOR.findOne({
        where: { id: id }
    }).then(item => {
        if (item.fun6id != "null" && item.fun6id) {
            fs.unlink(item.fun6id, (err) => {
                console.log('FILE FOR ATTACH NORM, DETELED! THIS IS FOR EDIT', id);
                if (err) console.log(res.send(err));
            });
        }
        deleteItem()
    })

    function deleteItem() {
        NORM_NEIGHBOR.destroy({
            where: { id: id }
        })
            .then(num => {
                if (num > 0) {
                    res.send('OK');
                } else {
                    res.send(`ERROR_2`); // NO MATCHING ID
                }
            })
    }

};

// PERFIL CONTROLLERS
exports.findAll_perfil = (req, res) => {
    const id = req.params.id;
    NORM_PERFIL.findAll({
        where: { normId: id }
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving ALL DATA." });
        });
};
exports.findById_perfil = (req, res) => {
    const id = req.params.id;

    NORM_PERFIL.findOne({
        where: { id: id },
        include: [NORM_PERFIL_ELEMENT]
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
exports.create_perfil = (req, res) => {
    // Create
    var object = {
        ...req.body
    }

    NORM_PERFIL.create(object)
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
exports.update_perfil = (req, res) => {
    const id = req.params.id;
    NORM_PERFIL.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num > 0) {
            res.send('OK');
        } else {
            res.send(`ERROR_2 : ` + num); // NO MATCHING ID
        }
    })
};
exports.delete_perfil = (req, res) => {
    const id = req.params.id;
    NORM_PERFIL.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num > 0) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};

// PERFIL ELEMENT CONTROLLERS
exports.findAll_perfil_element = (req, res) => {
    const id = req.params.id;
    NORM_PERFIL_ELEMENT.findAll({
        where: { normPerfilId: id }
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving ALL DATA." });
        });
};
exports.findById_perfil_element = (req, res) => {
    const id = req.params.id;

    NORM_PERFIL_ELEMENT.findOne({
        where: { id: id },
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
exports.create_perfil_element = (req, res) => {
    // Create
    var object = {
        ...req.body
    }

    NORM_PERFIL_ELEMENT.create(object)
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
exports.update_perfil_element = (req, res) => {
    const id = req.params.id;
    NORM_PERFIL_ELEMENT.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num > 0) {
            res.send('OK');
        } else {
            res.send(`ERROR_2 : ` + num); // NO MATCHING ID
        }
    })
};
exports.delete_perfil_element = (req, res) => {
    const id = req.params.id;
    NORM_PERFIL_ELEMENT.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num > 0) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};

// PDF GENERATION
exports.pdfgen_norm = (req, res) => {
    let id = req.body.id != 'null' ? req.body.id : "";
    let FICHA = req.body.ficha != 'null' ? req.body.ficha : "";
    FICHA = JSON.parse(FICHA)
    NORM.findOne({
        where: { id: id },
        include: [NORM_PREDIO, NORM_NEIGHBOR, { model: NORM_PERFIL, include: NORM_PERFIL_ELEMENT }]
    })
        .then(data => {
            PDFGEN_NORM(data, FICHA);
            res.send('OK');
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving ALL DATA."
            });
        });



};

function PDFGEN_NORM(_DATA, FICHA) {
    const PDFDocument = require('pdfkit');

    var doc = new PDFDocument({
        size: 'LEGAL', margins: {
            top: 112,
            bottom: 56,
            left: 32,
            right: 32
        },
        bufferPages: true,
    });

    doc.pipe(fs.createWriteStream('./docs/public/output_norm.pdf'));


    doc.fontSize(8);
    doc.font('Helvetica-Bold');
    doc.font('Helvetica');
    doc.startPage = doc.bufferedPageRange().count - 1;
    doc.lastPage = doc.bufferedPageRange().count - 1;
    doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 30, h: 1, text: 'CONCEPTO DE NORMA URBANISTICA N°', config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [30, 0], w: 15, h: 1, text: _DATA.id_in, config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [45, 0], w: 15, h: 1, text: _DATA.id_out, config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 30, h: 1, text: '1. DATOS GENERALES', config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [30, 0], w: 30, h: 1, text: 'UBICACIÓN FICHA NORMATIVA', config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'SOLICITANTE', config: { align: 'left', } },
            { coord: [15, 0], w: 45, h: 1, text: _DATA.solicitor, config: { align: 'left', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })




    pdfSupport.table(doc,
        [
            //{ coord: [0, 0], w: 15, h: 1, text: 'DEBERES URBANOS', config: { align: 'left', } },
            //{ coord: [15, 0], w: 15, h: 1, text: _DATA.urban_duties ? 'APLICA' : 'NO APLICA', config: { align: 'left', } },

            { coord: [0, 0], w: 15, h: 1, text: 'NUMERO CATASTRAL', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.norm_predios.length ? _DATA.norm_predios[0].predial : '', config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'N: ' + _DATA.geo_n, config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: 'E: ' + _DATA.geo_e, config: { align: 'left', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        let start_y_img = doc.y

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'DIRECCIÓN', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.norm_predios.length ? _DATA.norm_predios[0].dir : '', config: { align: 'left', } },

            { coord: [0, 1], w: 15, h: 1, text: 'COMUNA', config: { align: 'left', } },
            { coord: [15, 1], w: 15, h: 1, text: _DATA.comuna, config: { align: 'left', } },

            { coord: [0, 2], w: 15, h: 1, text: 'BARRIO', config: { align: 'left', } },
            { coord: [15, 2], w: 15, h: 1, text: _DATA.barrio, config: { align: 'left', } },

            { coord: [0, 3], w: 15, h: 1, text: 'ESTRATO', config: { align: 'left', } },
            { coord: [15, 3], w: 15, h: 1, text: _DATA.estrato, config: { align: 'left', } },

            { coord: [0, 4], w: 15, h: 1, text: 'AREA LOTE', config: { align: 'left', } },
            { coord: [15, 4], w: 15, h: 1, text: _DATA.norm_predios.reduce((sum, next) => sum += Number(next.area), 0) + ' m2', config: { align: 'left', } },

            { coord: [0, 5], w: 15, h: 1, text: 'FRENTE LOTE', config: { align: 'left', } },
            { coord: [15, 5], w: 15, h: 1, text: _DATA.norm_predios.reduce((sum, next) => sum += Number(next.front), 0) + ' m', config: { align: 'left', } },

            { coord: [0, 6], w: 15, h: 1, text: 'UTILIDAD PUBLICA', config: { align: 'left', } },
            { coord: [15, 6], w: 15, h: 1, text: _DATA.public_utility, config: { align: 'left', } },
        ],
        [doc.x, doc.y], [60, 7], { lineHeight: -1 })


    let end_y_img = doc.y
    let rect_width = doc.page.width / 2 - doc.page.margins.left - doc.page.margins.right
    let rect_height = end_y_img - start_y_img

    const IMG_PATH = _DATA.fun6id
    const IMG_X = doc.page.width / 2 + doc.page.margins.left
    const IMG_Y = start_y_img
    const IMG_CONF = { fit: [rect_width, rect_height - 10], align: 'center', valign: 'center' }

    doc.lineJoin('miter')
        .lineWidth(0.5)
        .rect(doc.page.width / 2, IMG_Y, doc.page.width / 2 - doc.page.margins.right, rect_height)
        .fillColor('black', 1)
        .strokeColor('black', 1)
        .stroke()

    if (IMG_PATH) doc.image(IMG_PATH, IMG_X, IMG_Y + 5, IMG_CONF)



    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 30, h: 1, text: '2. ATRIBUTOS DEL PREDIO', config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [30, 0], w: 30, h: 1, text: '3. EDIFICABILIDAD', config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })



    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'CLASIFICACIÓN DEL SUELO:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.cla_suelo, config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'ZONA NORMATIVA:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: _DATA.zon_norm, config: { align: 'left', } },


        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'ÁREA DE ACTIVIDAD:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.area_act, config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'SECTOR:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: _DATA.sector, config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'TRATAMIENTO URBANÍSTICO:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.trat_urb, config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'SUBSECTOR:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: _DATA.subsector, config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'ZONIF. RESTR. OCUPACIÓN:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.zon_rest, config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'FRENTE NORMATIVO:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: FICHA.front, config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'AMENAZA Y RIESGO:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.amenaza, config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'INDICE DE OCUPACIÓN:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: FICHA.ind_ocu, config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    let bics = _DATA.norm_predios.filter(pred => pred.bic_pred != "NO").map(pred => pred.bic_pred).join(', ')
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'BIEN INTERÉS CULTURAL (BIC):', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: bics || 'NO', config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'INDICE DE CONSTRUCCIÓN:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: FICHA.ind_con, config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'ÁREA DE INFLUENCIA DE BIC:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.norm_predios.some((predio) => predio.bic_area) ? 'SI' : 'NO', config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'ALTURA MÁXIMA PERMITIDA:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: isNaN(FICHA.height) ? FICHA.height : Number(FICHA.height).toFixed(2), config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'COMPENSACIÓN ART 192:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.norm_predios.some((predio) => predio.art_192) ? 'SI' : 'NO', config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'TIPOLOGÍA EDIFICATORIA:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: FICHA.tipology || '', config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: 'EJE DEL PREDIO:', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: _DATA.eje, config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'AISLAMIENTO. POSTERIOR:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: FICHA.ais_pos || '', config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 15, h: 1, text: '', config: { align: 'left', } },
            { coord: [15, 0], w: 15, h: 1, text: '', config: { align: 'left', } },

            { coord: [30, 0], w: 15, h: 1, text: 'AISLAMIENTO. LATERAL:', config: { align: 'left', } },
            { coord: [45, 0], w: 15, h: 1, text: FICHA.ais_lat || '', config: { align: 'left', } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: '4. CATEGORÍAS DE USOS Y UNIDADES DE USO PERMITIDAS', config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    if (_DATA.usos && _DATA.usos.includes('COMERCIO')) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 15, h: 3, text: 'COMERCIO', config: { align: 'center', valign: 'true' } },

            { coord: [15, 0], w: 15, h: 1, text: 'Principal', config: { align: 'center', valign: true, } },
            { coord: [30, 0], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].comercio.principal : ' ', config: { align: 'center', } },

            { coord: [15, 1], w: 15, h: 1, text: 'Complementario', config: { align: 'center', valign: true, } },
            { coord: [30, 1], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].comercio.complementario : ' ', config: { align: 'center', } },

            { coord: [15, 2], w: 15, h: 1, text: 'Restringido', config: { align: 'center', valign: true, } },
            { coord: [30, 2], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].comercio.restringido : ' ', config: { align: 'center', } },

        ],
        [doc.x, doc.y], [60, 3], { lineHeight: -1 })

    if (_DATA.usos && _DATA.usos.includes('SERIVCIO')) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 15, h: 3, text: 'SERVICIOS', config: { align: 'center', valign: 'true' } },

            { coord: [15, 0], w: 15, h: 1, text: 'Principal', config: { align: 'center', valign: true, } },
            { coord: [30, 0], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].servicios.principal : ' ', config: { align: 'center', } },

            { coord: [15, 1], w: 15, h: 1, text: 'Complementario', config: { align: 'center', valign: true, } },
            { coord: [30, 1], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].servicios.complementario : ' ', config: { align: 'center', } },

            { coord: [15, 2], w: 15, h: 1, text: 'Restringido', config: { align: 'center', valign: true, } },
            { coord: [30, 2], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].servicios.restringido : ' ', config: { align: 'center', } },

        ],
        [doc.x, doc.y], [60, 3], { lineHeight: -1 })

    if (_DATA.usos && _DATA.usos.includes('DOTACIONAL')) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 15, h: 3, text: 'DOTACIONAL', config: { align: 'center', valign: 'true' } },

            { coord: [15, 0], w: 15, h: 1, text: 'Principal', config: { align: 'center', valign: true, } },
            { coord: [30, 0], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].dotacional.principal : ' ', config: { align: 'center', } },

            { coord: [15, 1], w: 15, h: 1, text: 'Complementario', config: { align: 'center', valign: true, } },
            { coord: [30, 1], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].dotacional.complementario : ' ', config: { align: 'center', } },

            { coord: [15, 2], w: 15, h: 1, text: 'Restringido', config: { align: 'center', valign: true, } },
            { coord: [30, 2], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].dotacional.restringido : ' ', config: { align: 'center', } },

        ],
        [doc.x, doc.y], [60, 3], { lineHeight: -1 })

    if (_DATA.usos && _DATA.usos.includes('INDUSTRIAL')) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 15, h: 3, text: 'INDUSTRIAL', config: { align: 'center', valign: 'true' } },

            { coord: [15, 0], w: 15, h: 1, text: 'Principal', config: { align: 'center', valign: true, } },
            { coord: [30, 0], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].industrial.principal : ' ', config: { align: 'center', } },

            { coord: [15, 1], w: 15, h: 1, text: 'Complementario', config: { align: 'center', valign: true, } },
            { coord: [30, 1], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].industrial.complementario : ' ', config: { align: 'center', } },

            { coord: [15, 2], w: 15, h: 1, text: 'Restringido', config: { align: 'center', valign: true, } },
            { coord: [30, 2], w: 30, h: 1, text: UU_VAR[_DATA.area_act] ? UU_VAR[_DATA.area_act].industrial.restringido : ' ', config: { align: 'center', } },

        ],
        [doc.x, doc.y], [60, 3], { lineHeight: -1 })


    //doc.addPage();
    //let newLastPage = doc.bufferedPageRange().count - 1;
    //doc.switchToPage(newLastPage);
    //doc.lastPage = newLastPage;

    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: '5. PERFIL VIAL', config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    _DATA.norm_perfils.map(perfil => {


        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'CODIGO', config: { align: 'left', } },
                { coord: [15, 0], w: 15, h: 1, text: perfil.code, config: { align: 'left', bold: true, } },

                { coord: [30, 0], w: 15, h: 1, text: 'TIPO DE PERFIL', config: { align: 'left', } },
                { coord: [45, 0], w: 15, h: 1, text: perfil.perfil, config: { align: 'left', bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })



        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'ELEMENTO (m)', config: { bold: true, align: 'center', fill: 'gainsboro', } },
                { coord: [15, 0], w: 15, h: 1, text: 'NORMA (m)', config: { bold: true, align: 'center', fill: 'gainsboro', } },
                { coord: [30, 0], w: 15, h: 1, text: 'EN SITIO (m)', config: { bold: true, align: 'center', fill: 'gainsboro', } },
                { coord: [45, 0], w: 15, h: 1, text: 'RETROCESO EXIGIDO (m)', config: { bold: true, align: 'center', fill: 'gainsboro', } },

            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        perfil.norm_perfil_elements.map(element => {
            let column_name = ELEMENTS.find(ele => ele.value == element.element) ? ELEMENTS.find(ele => ele.value == element.element).name : 'OTRO ELEMENTO'
            pdfSupport.table(doc,
                [
                    { coord: [0, 0], w: 15, h: 1, text: column_name, config: { align: 'center', } },
                    { coord: [15, 0], w: 15, h: 1, text: element.dimension_n, config: { align: 'center', } },
                    { coord: [30, 0], w: 15, h: 1, text: element.dimension_p, config: { align: 'center', } },
                    { coord: [45, 0], w: 15, h: 1, text: (Number(element.dimension_n) - Number(element.dimension_p)).toFixed(2), config: { align: 'center', } },

                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1 })
        })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 15, h: 1, text: 'Antejardin', config: { align: 'center', } },
                { coord: [15, 0], w: 15, h: 1, text: perfil.antejardin_n, config: { align: 'center', } },
                { coord: [30, 0], w: 15, h: 1, text: perfil.antejardin_p, config: { align: 'center', } },
                { coord: [45, 0], w: 15, h: 1, text: (Number(perfil.antejardin_n) - Number(perfil.antejardin_p)).toFixed(2), config: { align: 'center', } },

            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })



        const VOLADIZO = (ele) => {
            let vol = perfil.norm_perfil_elements.find(element => (element.element == ele))

            if (vol) {
                let name = 'Voladizo ' + (ELEMENTS.find(element => element.value == ele) ? ELEMENTS.find(element => element.value == ele).name : ' Otro elemento')

                pdfSupport.table(doc,
                    [
                        { coord: [0, 0], w: 15, h: 1, text: name, config: { align: 'center', } },
                        { coord: [15, 0], w: 15, h: 1, text: GET_VOLADIZO(ele, vol.dimension_n, perfil.antejardin_n), config: { align: 'center', } },
                        { coord: [30, 0], w: 15, h: 1, text: GET_VOLADIZO(ele, vol.dimension_p, perfil.antejardin_p), config: { align: 'center', } },
                        { coord: [45, 0], w: 15, h: 1, text: '', config: { align: 'center', } },

                    ],
                    [doc.x, doc.y], [60, 1], { lineHeight: -1 })
            }
        }

        VOLADIZO('peatonal')
        VOLADIZO('road')


        const IMG_HEIGHT = 150
        if (doc.y + IMG_HEIGHT > (doc.page.height - doc.page.margins.bottom)) {
            doc.addPage();
        }

        const IMG_PERFIL_Y_START = doc.y
        const END = doc.y + IMG_HEIGHT + 10;
        const URL_PATH = "docs/public/perfiles/" + perfil.perfil + ".png";
        const IMG_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right
        const IMG_PERFIL_X_START = doc.page.margins.left
        doc.image(URL_PATH, IMG_PERFIL_X_START, IMG_PERFIL_Y_START + 5, { fit: [IMG_WIDTH, IMG_HEIGHT], align: 'center', valign: false })

        doc.y = END
    })

    /* 
     doc.addPage();
    pdfSupport.table(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: 'NORMAS URBANÍSTICAS COMUNES A TODOS LOS TRATAMIENTOS ACUERDO 011 DE 2014 ', config: { align: 'center', bold: true, fill: 'gainsboro', } },
            { coord: [0, 1], w: 10, h: 1, text: 'TEMA', config: { align: 'center', bold: true, } },
            { coord: [10, 1], w: 7, h: 1, text: 'ARTICULO', config: { align: 'center', bold: true, } },
            { coord: [17, 1], w: 43, h: 1, text: 'DESCRIPCIÓN', config: { align: 'center', bold: true, } },

        ],
        [doc.x, doc.y], [60, 2], { lineHeight: -1 })


    NORMAS.map(norm => {
        pdfSupport.table2(doc,
            [
                { coord: [0, 0], w: 10, h: norm.arts.length, text: norm.tema, config: { align: 'center', valign: true } },
                ...norm.arts.map((art, i) => ({ coord: [10, i], w: 7, h: 1, text: art.name, config: { align: 'center', valign: true } })),
                ...norm.arts.map((art, i) => ({ coord: [17, i], w: 43, h: 1, text: art.desc, config: { align: 'left', valign: true } })),
            ],
            [doc.x, doc.y], [60, norm.arts.length], { lineHeight: -1 })
    })

    */

    const SELECETED_AREA = AREAS_OCUPADAS[_DATA.zon_rest]

    if (SELECETED_AREA) {
        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'RESTRICCIÓN A LA OCUPACIÓN', config: { align: 'center', bold: true, fill: 'gainsboro', } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'AREAS OCUPADAS' + (SELECETED_AREA.nocupada.length == 0 ? ' Y AREAS NO OCUPADAS' : ''), config: { align: 'center', bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        SELECETED_AREA.ocupada.map(value => pdfSupport.table2(doc,
            [
                { coord: [0, 0], w: 10, h: value.texts.length, text: value.title, config: { align: 'center', valign: true } },
                ...value.texts.map((_v, i) => ({ coord: [10, i], w: 50, h: 1, text: _v, config: { align: 'justify', valign: true } })),
            ],
            [doc.x, doc.y], [60, value.texts.length], { lineHeight: -1 })
        )

        if (SELECETED_AREA.nocupada.length) pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'AREAS NO OCUPADAS', config: { align: 'center', bold: true, } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        SELECETED_AREA.nocupada.map(value => pdfSupport.table2(doc,
            [
                { coord: [0, 0], w: 10, h: value.texts.length, text: value.title, config: { align: 'center', valign: true } },
                ...value.texts.map((_v, i) => ({ coord: [10, i], w: 50, h: 1, text: _v, config: { align: 'justify', valign: true } })),
            ],
            [doc.x, doc.y], [60, value.texts.length], { lineHeight: -1 })
        )

        if (SELECETED_AREA.notes) pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: SELECETED_AREA.notes, config: { align: 'left', } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    }

    const REQUIRED_PARKINGS = UU_VAR[_DATA.area_act];

    if (REQUIRED_PARKINGS) {

        pdfSupport.table(doc,
            [
                { coord: [0, 0], w: 60, h: 1, text: 'CUOTAS DE PARQUEOS', config: { align: 'center', bold: true, fill: 'gainsboro', } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })


        if (
            REQUIRED_PARKINGS.comercio.principal.includes('Vivienda') ||
            REQUIRED_PARKINGS.comercio.complementario.includes('Vivienda')
        ) {
            pdfSupport.table2(doc,
                [
                    { coord: [0, 0], w: 35, h: 1, text: 'USO', config: { align: 'center', valign: true, bold: true, } },
                    { coord: [35, 0], w: 15, h: 1, text: 'CATEGORÍA', config: { align: 'center', valign: true, bold: true, } },
                    { coord: [50, 0], w: 10, h: 1, text: 'PARQUEADERO', config: { align: 'center', valign: true, bold: true, } },

                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1 })

            pdfSupport.table2(doc,
                [
                    { coord: [0, 0], w: 35, h: 4, text: 'VIVIENDA', config: { align: 'left', valign: true, bold: false, } },
                    ...REQ_PARKINGS_VIV.map((parq, i) => ({ coord: [35, i], w: 15, h: 1, text: parq.title, config: { align: 'center', valign: true, bold: false, } })),
                    ...REQ_PARKINGS_VIV.map((parq, i) => ({ coord: [50, i], w: 10, h: 1, text: parq.strata[_DATA.estrato - 1] || 'FALTA ESTRATO', config: { align: 'center', valign: true, bold: false, } })),
                ],
                [doc.x, doc.y], [60, 4], { lineHeight: -1 })
        }

        pdfSupport.table2(doc,
            [
                { coord: [0, 0], w: 35, h: 1, text: 'USO', config: { align: 'center', valign: true, bold: true, } },
                { coord: [35, 0], w: 15, h: 1, text: 'UNIDAD', config: { align: 'center', valign: true, bold: true, } },
                { coord: [50, 0], w: 10, h: 1, text: 'PARQUEADERO', config: { align: 'center', valign: true, bold: true, } },

            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        REQ_PARKINGS.map(parking => {

            const MATCH = parking.uses.split(',').some(use => {
                return (

                    (_DATA.usos && _DATA.usos.includes('COMERCIO') && (
                        REQUIRED_PARKINGS.comercio.principal.split(',').includes(use) ||
                        REQUIRED_PARKINGS.comercio.complementario.split(',').includes(use) ||
                        REQUIRED_PARKINGS.comercio.restringido.split(',').includes(use))
                    )

                    ||

                    (_DATA.usos && _DATA.usos.includes('SERIVCIO') && (
                        REQUIRED_PARKINGS.servicios.principal.split(',').includes(use) ||
                        REQUIRED_PARKINGS.servicios.complementario.split(',').includes(use) ||
                        REQUIRED_PARKINGS.servicios.restringido.split(',').includes(use))
                    )

                    ||

                    (_DATA.usos && _DATA.usos.includes('INDUSTRIAL') && (
                        REQUIRED_PARKINGS.industrial.principal.split(',').includes(use) ||
                        REQUIRED_PARKINGS.industrial.complementario.split(',').includes(use) ||
                        REQUIRED_PARKINGS.industrial.restringido.split(',').includes(use))
                    )

                    ||

                    (_DATA.usos && _DATA.usos.includes('DOTACIONAL') && (
                        REQUIRED_PARKINGS.dotacional.principal.split(',').includes(use) ||
                        REQUIRED_PARKINGS.dotacional.complementario.split(',').includes(use) ||
                        REQUIRED_PARKINGS.dotacional.restringido.split(',').includes(use))
                    )
                )
            })

            if (MATCH) pdfSupport.table2(doc,
                [
                    { coord: [0, 0], w: 35, h: 1, text: parking.title, config: { align: 'left', valign: true } },
                    { coord: [35, 0], w: 15, h: 1, text: parking.uses, config: { align: 'center', valign: true } },
                    { coord: [50, 0], w: 10, h: 1, text: parking.strata[_DATA.estrato - 1] || 'FALTA ESTRATO', config: { align: 'center', valign: true } },

                ],
                [doc.x, doc.y], [60, 1], { lineHeight: -1 })

        })

    }

    if (_DATA.usos.length) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 60, h: 1, text: 'OBSERVACIONES PARA CUPOS DE PARQUEO SEGÚN USO Y ACTIVIDAD', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    if (_DATA.usos.includes('VIVIENDA')) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 10, h: 1, text: 'VIVIENDA', config: { align: 'center', valign: true } },
            { coord: [10, 0], w: 50, h: 1, text: NOTES_VIV, config: { align: 'justify', valign: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })


    if (_DATA.usos.includes('COMERCIO') || _DATA.usos.includes('SERIVCIO') || _DATA.usos.includes('DOTACIONAL')) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 10, h: 1, text: 'COMERCIO SERIVCIO DOTACIONAL', config: { align: 'center', valign: true } },
            { coord: [10, 0], w: 50, h: 1, text: NOTES_COM, config: { align: 'justify', valign: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })


    if (_DATA.usos.includes('INDUSTRIAL')) pdfSupport.table2(doc,
        [
            { coord: [0, 0], w: 10, h: 1, text: 'INDUSTRIAL', config: { align: 'center', valign: true } },
            { coord: [10, 0], w: 50, h: 1, text: NOTES_IND, config: { align: 'justify', valign: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    //  NOTAS

    let NOTAS_1 = `1. Las determinantes para poner en funcionamiento de estacionamientos en el municipio de Bucaramanga deben desarrollarse de conformidad con los parámetros 
    establecidos en el acuerdo 065 de 2006 y los Decretos 2007 y 073 de 1985 o las normas que los modifiquen, adiciones o sustituyan.`.replace(/[\n\r]+ */g, ' ');

    let NOTAS_2 = `2. Debe consultar y verificar en el decreto 0069 de 2015 "Por el cual se definen y reglamentan los procedimientos para el estudio y 
    aprobación de los planes de implantación en el municipio de Bucaramanga" si el proyecto a diseñar requiere dicho estuidio aprobado por la secretaria de 
    Planeación Munucipal de radicar la solicitud de licencia de construcción.`.replace(/[\n\r]+ */g, ' ');

    let NOTAS_3 = `3. Se advierte que si los linderos y/o áreas del predio no se llegan a encontrar consignados en el certificado de libertad y tradición y/o 
    títulos de propiedad; los trámites concernientes a la inscripción, aclaración y/o corrección de área y linderos del predio con fines registrales, deberá 
    adelantarlos ante el área metropolitana de Bucaramanga (gestor catastral), mediante los procedimientos establecidos en la resolución conjunta IGAC No. 1101 SNR No. 
    11344 de 31 de diciembre de 2020. Por lo anterior, se sugiere antes de radicar cualquier otra actuación de licencia de construcción, realizar la inscripción de los 
    linderos y/o área lote conforme a lo antes indicado, para poder realizar un trámite notarial y registral exitoso.`.replace(/[\n\r]+ */g, ' ');

    let NOTAS_4 = `4. Verifique a qué zonificación de restricción a la ocupación pertenece el predio, con el que pueda establecer si requiere presentar estudios adicionales 
    al momento de la solicitud de licencia de construcción, como son los estudio de vulnerabilidad y riesgo o Estudio de estabilidad taludes.`.replace(/[\n\r]+ */g, ' ');

    let NOTAS_5 = `...`.replace(/[\n\r]+ */g, ' ');

    let NOTAS_P = `Este concepto emitido no tiene carácter vinculante, "Los conceptos desempañan una función orientadora y didáctica que debe realizar la autoridad bajo 
    el cumplimiento de los supuestos exigidos por la Constitución y las leyes. El contenido mismo del concepto, sin embargo, no comprometerá la responsabilidad de las 
    entidades que lo emiten ni será tampoco de obligatorio cumplimiento. Se entiende, mas bien, como una manera de mantener fluida la comunicación entre el pueblo y la 
    administración para absolver de manera eficiente y de acuerdo con los principios de economía, celeridad, eficacia e imparcialidad, las dudas que puedan tener los 
    ciudadanos y el pueblo en general sobre asuntos relacionados con la administración que pueda afectarlos" 
    (sentencia de la Corte Constitucional C-542 del 24 de mayo de 2005).`.replace(/[\n\r]+ */g, ' ');

    doc.font('Helvetica-Bold');
    doc.text(`\n\n`);
    doc.text(`NOTAS:`);
    doc.font('Helvetica');
    doc.text(`\n`);

    doc.text(NOTAS_1, { align: 'justify' });
    doc.text(`\n`);
    doc.text(NOTAS_2, { align: 'justify' });
    doc.text(`\n`);
    doc.text(NOTAS_3, { align: 'justify' });
    doc.text(`\n`);
    doc.text(NOTAS_4, { align: 'justify' });
    doc.text(`\n`);

    doc.text(NOTAS_P, { align: 'justify' });
    doc.font('Helvetica-Bold');

    const BASE_PATH = 'https://curaduria1bucaramanga.com/public_docs/OTHERS/norma/';
    const DOC_1_PATH = BASE_PATH + 'NORMAS_GENERALES.pdf';
    const DOC_2_PATH = BASE_PATH + 'UNIDADES_DE_USO.pdf';
    const DOC_3_PATH = BASE_PATH + 'REQUISITOS_NORMA_URBANA.pdf';

    const qrcode_url_1 = 'docs/public/qrcode_1.png';
    const qrcode_url_2 = 'docs/public/qrcode_2.png';
    const qrcode_url_3 = 'docs/public/qrcode_3.png';

    doc.text(`\n`);
    doc.text("MAS INFORMACIÓN:");

    const QR_X = doc.x;
    const QR_Y = doc.y;
    gen_qrcode_1()


    function gen_qrcode_1() {
        QRCode.toFile(qrcode_url_1, DOC_1_PATH, {
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (err) {
            if (err) throw err
            doc.image(qrcode_url_1, QR_X, QR_Y + 5, { width: 100, height: 100 })
            doc.text("NORMAS GENERALES", QR_X + 5, QR_Y + 110)
            gen_qrcode_2()
        })
    }

    function gen_qrcode_2() {
        QRCode.toFile(qrcode_url_2, DOC_2_PATH, {
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (err) {
            if (err) throw err
            doc.image(qrcode_url_2, QR_X + 150, QR_Y + 5, { width: 100, height: 100 })
            doc.text("DETALLES DE USO", QR_X + 150 + 10, QR_Y + 110)
            gen_qrcode_3()
        })
    }

    function gen_qrcode_3() {
        QRCode.toFile(qrcode_url_3, DOC_3_PATH, {
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (err) {
            if (err) throw err
            doc.image(qrcode_url_3, QR_X + 300, QR_Y + 5, { width: 100, height: 100 })
            doc.text("REQUISITOS NORMA URBANA", QR_X + 300 - 10, QR_Y + 110)
            end_doc()

        })
    }

    function end_doc() {
        pdfSupport.setHeader(doc, { title: 'NORMA URBANA', id_public: _DATA.id_in, icon: true });
        doc.end();
        return true;
    }



}


const UU_VAR = {
    "Residencial - R1 - Residencial meta": {
        "name": "Residencial - R1 - Residencial meta ",
        "comercio": {
            "principal": "Vivienda",
            "complementario": "1",
            "restringido": ""
        },
        "servicios": {
            "principal": "",
            "complementario": "14,20",
            "restringido": ""
        },
        "dotacional": {
            "principal": "",
            "complementario": "77,81",
            "restringido": ""
        },
        "industrial": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        }
    },
    "Residencial - R2 - Residencial con comercio y servicio localizado": {
        "name": "Residencial - R2 - Residencial con comercio y servicio localizado",
        "comercio": {
            "principal": "Vivienda",
            "complementario": "1,2,3",
            "restringido": ""
        },
        "servicios": {
            "principal": "",
            "complementario": "14,15,16,17,18,20,21,25,27,31,37,43,48",
            "restringido": ""
        },
        "dotacional": {
            "principal": "",
            "complementario": "58,61,62,65,66,72,77,81",
            "restringido": "53,54,57,64"
        },
        "industrial": {
            "principal": "",
            "complementario": "107",
            "restringido": ""
        }
    },
    "Residencial - R2 - Sin eje comercial": {
        "name": "Residencial - R2 - Sin eje comercial",
        "comercio": {
            "principal": "Vivienda",
            "complementario": "1 (Condición 29 solo escala local A)",
            "restringido": ""
        },
        "servicios": {
            "principal": "",
            "complementario": "14,17 ( Decreto 007 de 2015) y 20 (Condición 29 solo escala local A)",
            "restringido": ""
        },
        "dotacional": {
            "principal": "",
            "complementario": "77",
            "restringido": ""
        },
        "industrial": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        }
    },
    "Residencial - R3 - Residencial mixta - vivienda, comercio y servicio": {
        "name": "Residencial - R3 - Residencial mixta - vivienda, comercio y servicio",
        "comercio": {
            "principal": "Vivienda",
            "complementario": "1,2,3",
            "restringido": ""
        },
        "servicios": {
            "principal": "43",
            "complementario": "14,15,16,17,18,20,21,24,25,27,31,36,37,48,49",
            "restringido": ""
        },
        "dotacional": {
            "principal": "",
            "complementario": "58,62,63,65,66,77,81",
            "restringido": "53,54,55,56,57,68,69,72"
        },
        "industrial": {
            "principal": "",
            "complementario": "107",
            "restringido": ""
        }
    },
    "Residencial - R4 - Residencial con actividad económica": {
        "name": "Residencial - R4 - Residencial con actividad económica",
        "comercio": {
            "principal": "Vivienda",
            "complementario": "1,2,3,4,5",
            "restringido": ""
        },
        "servicios": {
            "principal": "14,15,16,22,25,28,43",
            "complementario": "15,16,17,18,20,21,24,27,31,33,36,37,48,49",
            "restringido": ""
        },
        "dotacional": {
            "principal": "79",
            "complementario": "53,54,55,56,57,58,61,62,63,64,65,66,68,69,70,71,72,73,77,78,80,81,84,92",
            "restringido": "53,54,55,56,57,68,69,72"
        },
        "industrial": {
            "principal": "96,97,98,102,107,110,118,122",
            "complementario": "99,103,112,115,117,119",
            "restringido": ""
        }
    },
    "Comercial y de Servicios - C1 - Comercial y de servicios empresariales": {
        "name": "Comercial y de Servicios - C1 - Comercial y de servicios empresariales",
        "comercio": {
            "principal": "3",
            "complementario": "1,2 y vivienda",
            "restringido": ""
        },
        "servicios": {
            "principal": "14,17,20,23,27,28,43,48",
            "complementario": "15,20,31,37",
            "restringido": ""
        },
        "dotacional": {
            "principal": "58,65,66",
            "complementario": "77,81",
            "restringido": ""
        },
        "industrial": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        }
    },
    "Comercial y de Servicios - C2 - Comercial y de servicios livianos o al por mayor": {
        "name": "Comercial y de Servicios - C2 - Comercial y de servicios livianos o al por mayor",
        "comercio": {
            "principal": "3,4,5,6,12,13",
            "complementario": "1,2,7,8,9 y vivienda",
            "restringido": ""
        },
        "servicios": {
            "principal": "14,21,32,45",
            "complementario": "15,16,17,18,19,20,22,23,24,25,26,27,28,31,33,34,35,36,37,38,39,43, 44, 46,48,49",
            "restringido": "40"
        },
        "dotacional": {
            "principal": "61,62,64,86",
            "complementario": "53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,71,72,75,77,78,79,80,81,82,86,90,94",
            "restringido": "70"
        },
        "industrial": {
            "principal": "",
            "complementario": "96,97,98,99,103,107,110,115",
            "restringido": "102,118"
        }
    },
    "Comercial y de Servicios - C3 - Comercial y de servicios pesados": {
        "name": "Comercial y de Servicios - C3 - Comercial y de servicios pesados",
        "comercio": {
            "principal": "6,8,10,11,12,13",
            "complementario": "1,2,3,4,5,7,9, Vivienda",
            "restringido": ""
        },
        "servicios": {
            "principal": "14,21,29,32,41,42,45,47,51",
            "complementario": "15,16,17,18,19,20,22,23,24,25,26,27,28,31,33,34,35,36,37,38,39, 43,44, 46,48,49,50",
            "restringido": "40"
        },
        "dotacional": {
            "principal": "61,64,84,86,89",
            "complementario": "53,54,55,56,57,58,59,60,62,63,65,66,67,68,69,70,71,72,74,75,77,78,79,80,81,82,90,94",
            "restringido": "70"
        },
        "industrial": {
            "principal": "96,97,98,99,100,102,105,109,110,111,112,113,115,118,119,122,123",
            "complementario": "101,103,104,106,107,116,117,120,122",
            "restringido": ""
        }
    },
    "Comercial y de Servicios - CE - Comercial de eje en Area de Actividades R-2": {
        "name": "Comercial y de Servicios - CE - Comercial de eje en Area de Actividades R-2",
        "comercio": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        },
        "servicios": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        },
        "dotacional": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        },
        "industrial": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        }
    },
    "Dotacional - D - Dotacional": {
        "name": "Dotacional - D - Dotacional",
        "comercio": {
            "principal": "",
            "complementario": "1,2",
            "restringido": "3"
        },
        "servicios": {
            "principal": "14",
            "complementario": "",
            "restringido": "15,16,31,48"
        },
        "dotacional": {
            "principal": "53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95",
            "complementario": "",
            "restringido": ""
        },
        "industrial": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        }
    },
    "Dotacional - D - Dotacional Recreativo": {
        "name": "Dotacional - D - Dotacional Recreativo",
        "comercio": {
            "principal": "",
            "complementario": "1,2",
            "restringido": "3"
        },
        "servicios": {
            "principal": "14",
            "complementario": "",
            "restringido": "15,16,31,48"
        },
        "dotacional": {
            "principal": "53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95",
            "complementario": "",
            "restringido": ""
        },
        "industrial": {
            "principal": "",
            "complementario": "",
            "restringido": ""
        }
    },
    "Industrial - I - Industria": {
        "name": "Industrial - I - Industria",
        "comercio": {
            "principal": "6,7,8,10,11,13",
            "complementario": "1,2,3,4,5,9,12,13",
            "restringido": "3"
        },
        "servicios": {
            "principal": "14,28,29,30,37,38,39,41,42,47",
            "complementario": "15,16,17,18,19,20,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,43,44,45,46,48,49,50,51",
            "restringido": "40"
        },
        "dotacional": {
            "principal": "74,83,84,85,86,87,88,89,90,91,92",
            "complementario": "53,54,56,57,58,63,66,68,69,70,71,72,73,75,76,77,78,79,80,81,82,84,86,94,95",
            "restringido": "70"
        },
        "industrial": {
            "principal": "96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123",
            "complementario": "96,97,98,99,100,101,102,105,106,107,110,111,112,115,117,120,122,123",
            "restringido": ""
        }
    },
    "Multiple - M1 - Multiple centralidad": {
        "name": "Multiple - M1 - Multiple centralidad",
        "comercio": {
            "principal": "1,2,3,6,9,12,13",
            "complementario": "2,4,5,7,8,10,11,13 y Vivienda",
            "restringido": ""
        },
        "servicios": {
            "principal": "14,15,16,17,18,19,20,22,23,27,28,32,33,34,35,37,49,50,51",
            "complementario": "15,16,20,21,24,25,26,28,31,36,37,38,39,41,43,44,45,46,47,48,49",
            "restringido": "40"
        },
        "dotacional": {
            "principal": "58,59,75,78,82,86,94",
            "complementario": "58,60,65,66,67,68,69,71,72,73,74,77,79,80,81,84,90",
            "restringido": "70"
        },
        "industrial": {
            "principal": "107,115",
            "complementario": "96,97,98,99,102,103,110,118,119,122",
            "restringido": ""
        }
    },
    "Multiple - M2 - Multiple grandes establecimientos": {
        "name": "Multiple - M2 - Multiple grandes establecimientos",
        "comercio": {
            "principal": "6,7,8,10,11,13",
            "complementario": "1,2,3,4,5,9,12,13, Vivienda",
            "restringido": "VIP - VIS"
        },
        "servicios": {
            "principal": "14,21,22,28,29,30,32,35,38,39,41,42,47,48,49,52",
            "complementario": "15,16,17,18,19,20,23,24,25,26,27,28,31,33,34,36,37,43,44,45,46,50,51",
            "restringido": "40"
        },
        "dotacional": {
            "principal": "71,72,73,74,83,84,85,86,87,88,89,90,91,93,94,95",
            "complementario": "58,59,60,63,65,66,67,68,69,75,76,77,78,79,80,81,82,84,94",
            "restringido": "70"
        },
        "industrial": {
            "principal": "96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123",
            "complementario": "96,97,98,99,100,101,102,103,106,107,110,111,112,115,117,120,123",
            "restringido": ""
        }
    }
}

const AREAS_OCUPADAS = {
    '1. Occidente, escarpe de Malpaso y otros escarpes': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano de protection'] },
            { title: 'Ocupación', texts: ['No se permiten nuevas areas construidas.o ampliación de as existentes. Los sectores ocupados con edificaciones deben ser objeto de estudios detallados de amenaza, vulnerabilidad y riesgo para determinar su viabilidad o reubicación. Los predios o areas en que existan construcciones que se deban reubicar, se consideran suelos de protección y tendrán manejo de zonas verdes no ocupables y/o parques cuya interventión. recuperación y sostenibilidad debe desarrollarse de acuerdo con la priorización clan establecida en el Plan Municipal de gestión del Riesgo de Desastres'] },
            { title: 'Estudios técnicos específicos', texts: ['Estudios detallados de amenaza, vulnerabilidad y riesgo para zonas, coordinados por el municipio y con la participación de la autoridad ambiental y las empresas prestadoras de servicio pUblico de alcantarillado, de acuerdo con lo establecido en el Articulo 51° "Priorización de acciones para la gestión del riesgo" del presente Plan, y en concordancia con el Plan Municipal de Gestión del Riesgo de Desastres.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización del terreno*',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambienta'
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano de protection'] },
            { title: 'Ocupación', texts: ['No se permite'] },
            { title: 'Acciones a desarrollar', texts: ['Las acciones determinadas para el suelo de protección'] },
            { title: 'Acciones de mitigación', texts: ['Obras de estabilización local para prevenir aumento en In criticidad*'] },
        ],
        notes: ' * Corresponde a implementación de acciones a cargo del municipio, la autoridad ambiental las empresas prestadoras de servicio publico de alcantarillado cuando se trate de zonas publicas, y a los propietarios de predios privados cuando se localice en predios de su propiedad'
    },
    '2. Norte la Esperanza': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['No se permiten nuevas areas construidas o ampliación de as existentes. Los sectores ocupados con edificaciones deben ser objeto de estudios detallados de amenaza, vulnerabilidad y riesgo para determinar su viabilidad o reubicación. Los predios o areas en que existan construcciones que se deban reubicar, y los señalados en los estudios de riesgo realizados para el sector noroccidental del barrio Villa Rosa y el barrio Villa Helena I, se consideran suelos de protección y tendrán manejo de zonas verdes no ocupables y/o parques cuya intervención, recuperación y sostenibilidad debe desarrollarse de acuerdo con la priorización establecida en el Plan Municipal de Gestión del Riesgo de Desastres.'] },
            { title: 'Estudios técnicos específicos', texts: ['Estudios detallados de amenaza, vulnerabilidad y riesgo por zones, coordinados por el municipio y con la participación de la autoridad ambiental y las empresas prestadoras de servicio pUblico de alcantarillado, de acuerdo con lo establecido en el Articulo 51° "Priorización de acciones para la gestión del riesgo" del presente Plan, y en concordancia con el Plan Municipal de Gestión del Riesgo de Desastres.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización local *',
                    'Obras de mejoramiento integral en zonas pUblicas y privadas de acuerdo con lo establecido en el parágrafo 2 del Articulo 221° Definición de tratamiento de mejoramiento integral y modalidades del presente Plan',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                ]

            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },

        ],
        nocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano de protection'] },
            { title: 'Ocupación', texts: ['No se permite'] },
            { title: 'Acciones a desarrollar', texts: ['Por tener colindancia con zonas del Distrito Regional de Manejo Integrado de Bucaramanga, se deben observer las actividades establecidas en este o la categoria de area protegida que le sea asignada, asi corns las determinadas por el presente Plan de Ordenamiento Territorial'] },
            { title: 'Acciones de mitigación', texts: ['Obras de estabilización local para prevenir aumento en In criticidad *'] },
        ],
        notes: ' * Corresponde a implementación de acciones a cargo del municipio, la autoridad ambiental las empresas prestadoras de servicio publico de alcantarillado cuando se trate de zonas publicas, y a los propietarios de predios privados cuando se localice en predios de su propiedad'
    },
    '3. Morrorico': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['No se permiten nuevas áreas construidas o ampliación de las existentes en aquellas zonas donde los estudios detallados de amenaza, vulnerabilidad y riesgo y los planes estratégicos de intervención para el mejoramiento integral del hábitat para la comuna 14 determinen su reubicación. Los predios o áreas en que existan construcciones que sé deban reubicar, se consideran suelos de protección y tendrán manejo de zonas verdes no ocupables y/o parques cuya Intervención, recuperación y sostenibilidad debe desarrollarse de acuerdo con la priorización establecida en el Plan Municipal de Gestión del Riesgo de Desastres. Los predios que los mencionados estudios identifiquen como aptos para ocupación y construcción podrán desarrollarse Según lo establecido en los respectivos planes estratégicos'] },
            {
                title: 'Estudios técnicos específicos', texts: [
                    'Estudios detallados de amenaza, vulnerabilidad y riesgo para zonas, coordinados por el municipio y con la participación de la autoridad ambiental y las empresas prestadoras de servicio pUblico de alcantarillado, de acuerdo con lo establecido en el Articulo 51° "Priorización de acciones para la gestión del riesgo" del presente Plan, y en concordancia con el Plan Municipal de Gestión del Riesgo de Desastres.',
                    'Planes estratégicos de intervención para el mejoramiento integral del hábitat, coordinados por el municipio y con la Participación de la autoridad ambiental, de acuerdo con lo establecido en el Artículo 51° "Priorización de acciones para la gestión del riesgo" del presente Plan y en concordancia con el Plan Municipal de Gestión del Riesgo de Desastres',
                ]
            },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización local *',
                    'Obras de mejoramiento integral en zonas pUblicas y privadas de acuerdo con lo establecido en el parágrafo 2 del Articulo 221° Definición de tratamiento de mejoramiento integral y modalidades del presente Plan',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano de protection'] },
            { title: 'Ocupación', texts: ['No se permite'] },
            { title: 'Acciones a desarrollar', texts: ['Las acciones determinadas para los suelos de protección.'] },
            { title: 'Acciones de mitigación', texts: ['Obras de estabilización local para prevenir aumento en In criticidad *'] },
        ],
        notes: ' * Corresponde a implementación de acciones a cargo del municipio, la autoridad ambiental las empresas prestadoras de servicio publico de alcantarillado cuando se trate de zonas publicas, y a los propietarios de predios privados cuando se localice en predios de su propiedad'
    },
    '4. Oriental': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['Según lo definido por las fichas normativas, no obstante, en los estudios técnicos específicos que se elaboren, se podrán definir restricciones de ocupación y construcción adicionales.'] },
            { title: 'Estudios técnicos específicos', texts: ['Para edificaciones mayores a ocho (8) pisos deben efectuarse estudios sísmicos particulares de sitio (alcance y Metodología según título A.2.10 de Ia NSR-10) y estudios de estabilidad de taludes (alcance de metodología del capítulo H.5 de la NSR-10) que deben formar parte de los estudios de suelos que se presentan para solicitudes de licencias urbanísticas, estos estudios de suelo también deben ajustarse a las exigencias de la NSR-10 0 la norma que lo modifique, adicione o sustituya'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estatización de taludes que se ejecutaran por parte de los propietarios o poseedores cuando se localice en predios de propiedad privada, o por el municipio y la autoridad ambiental cuando se trate de zonas públicas si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven Ia desestabilización o afectación de otros predios u otras zonas Públicas.',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                    'Por tener colindancia con zonas del Distrito Regional de Manejo Integrado de Bucaramanga (DRMI), se deben observar las acciones establecidas en este o la categoría de área protegida que le sea asignada, as como las determinadas por el presente Plan de Ordenamiento Territorial.',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },

        ],
        nocupada: [],
        notes: null,
    },
    '5. Rio de Oro, Suratá  Quebrada la Iglesia': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['No pueden existir edificaciones en el área correspondiente a la zona inundable* y ronda de protección hídrica, las cuales tendrán que recuperarse por ser suelo de protección y tendrán manejo de zonas verdes no ocupables yfo parques cuya intervención, recuperación y sostenibilidad debe desarrollarse de acuerdo con la priorización establecida en el Plan Municipal de Gesten del Riesgo de Desastres. No se permiten nuevas áreas construidas o ampliación de las existentes'] },
            { title: 'Estudios técnicos específicos', texts: ['Para modificación de la línea de inundación se deben realizar nuevos estudios de amenaza por inundación a partir de las obras de mitigación que se propongan par parte del interesado. Una vez ejecutadas las obras de mitigaciones, a partir de la nueva línea de inundación, se deben implementar la rondo hídrica en la zona de manejo del espacio público determinado en este Plan y en las porciones de terreno desafectadas, Ia edificabilidad corresponderá a la señalada en la respectiva ficha narrativa. Estudios específicos y diseños de las obras para los asentamientos en la zona, en especial los incluidos en el Artículo 51° Priorización de acciones para la gestión del riesgo del presente Plan.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización local para prevenir aumento en la criticidad, tomando como insumo los estudios existentes **',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [
            { title: 'Categoría del suelo', texts: ['Protección'] },
            { title: 'Ocupación', texts: ['No se permite'] },
            { title: 'Acciones de mitigación', texts: ['Obras de estabilización local para prevenir aumento en la criticidad, tomando coma insumo los estudios existentes **'] },
        ],
        notes: '* Estudio de actualización de amenazas por inundación del Rio de Oro, sector Bahondo hasta la confluencia con del Rio Suratá (tramo Municipio de Bucaramanga) Corporación Autónoma Regional para la Defensa de la Meseta de Bucaramanga 2010.\n** Corresponde a implementación de acciones a cargo del municipio, la autoridad ambiental, las empresas prestadoras de servicio público de alcantarillado cuando se trate de zonas públicas, y a los propietarios de predios privados cuando se localice en predios de su proipiedad',
    },
    '6. Áreas de drenaje': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['No se permiten nuevas areas construidas o ampliación de as existentes. Los sectores ocupados con edificaciones deben ser objeto de estudios detallados de amenaza, vulnerabilidad y riesgo para determinar su viabilidad o reubicación. Los predios o areas en que existan construcciones que se deban reubicar, y los señalados en los estudios de riesgo realizados para el sector noroccidental del barrio Villa Rosa y el barrio Villa Helena I, se consideran suelos de protección y tendrán manejo de zonas verdes no ocupables y/o parques cuya intervención, recuperación y sostenibilidad debe desarrollarse de acuerdo con la priorización establecida en el Plan Municipal de Gestión del Riesgo de Desastres.'] },
            { title: 'Estudios técnicos específicos', texts: ['Estudios detallados de amenaza, vulnerabilidad y riesgo para zonas, coordinados por el municipio y con la participación de la autoridad ambiental y las empresas prestadoras de servicio pUblico de alcantarillado, de acuerdo con lo establecido en el Articulo 51° "Priorización de acciones para la gestión del riesgo" del presente Plan, y en concordancia con el Plan Municipal de Gestión del Riesgo de Desastres.',] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización del terreno para control de cauces *',
                    'Obras de mejoramiento integral fuera de los cauces y rondas hídricas *',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },

        ],
        nocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano de protección'] },
            { title: 'Ocupación', texts: ['No se permite'] },
        ],
        notes: ' * Corresponde a implementación de acciones a cargo del municipio, la autoridad ambiental las empresas prestadoras de servicio publico de alcantarillado cuando se trate de zonas publicas, y a los propietarios de predios privados cuando se localice en predios de su propiedad'
    },
    '7. Área de amortiguación 1 de los Escarpes': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['No se permiten edificaciones nuevas ni ampliación de las existentes en el área correspondiente a la zona de aislamiento de talud, aplicando as normas geotécnicas vigentes expedidas por la autoridad ambiental correspondiente. Además, los estudios técnicos específicos que se elaboren, podrán definir restricciones de ocupación y construcciones adicionales o no previstas en las fichas  normativas'] },
            { title: 'Estudios técnicos específicos', texts: ['Estudios de estabilidad de taludes (alcance y metodología del capítulo H.5 de la NSR-10) que deben formar parte de los estudios de suelos que se presentan pare solicitudes de licencias urbanísticas, estos estudios de suelo también deben ajustarse a las exigencias de la NSR-10 0 la norma que lo modifique, adicione o sustituya. No se permite construcciones mayores a dos (2) pisos por las condiciones de grietas sísmicas que se van evidenciando en la zona.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estatización de taludes que se ejecutaran por parte de los propietarios o poseedores cuando se localice en predios de propiedad privada, o por el municipio y la autoridad ambiental cuando se trate de zonas públicas si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven Ia desestabilización o afectación de otros predios u otras zonas Públicas.',
                    'Obras de mejoramiento integral en zonas pUblicas y privadas de acuerdo con lo establecido en el parágrafo 2 del Articulo 221° Definición de tratamiento de mejoramiento integral y modalidades del presente Plan',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                    'Por tener colindancia con zonas del Distrito Regional de Manejo Integrado de Bucaramanga (DRMI), se deben observar las acciones establecidas en este o la categoría de área protegida que le sea asignada, as como las determinadas por el presente Plan de Ordenamiento Territorial.',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [
            { title: 'Categoría del suelo', texts: ['Protección, espacio público para la conformación del parque lineal de la escarpa'] },
            { title: 'Ocupación', texts: ['No se permite'] },
            { title: 'Acciones de mitigación', texts: ['Obras de estatización de taludes que se ejecutaran por parte de los propietarios o poseedores cuando se localice en predios de propiedad privada, o por el municipio y la autoridad ambiental cuando se trate de zonas públicas si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven Ia desestabilización o afectación de otros predios u otras zonas Públicas.'] },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        notes: null,
    },
    '8. Zona norte occidental': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['Según lo definido por las fichas normativas, no obstante en los estudios técnicos específicos que se elaboren, se podrán definir restricciones de ocupación adicionales.'] },
            { title: 'Estudios técnicos específicos', texts: ['Estudios de estabilidad que deben formar parte de los estudios de suelos que se presentan pare solicitudes de licencias urbanísticas, estos estudios de suelo también deben ajustarse a las exigencias de la NSR-10 o la norma que lo modifique; adicione o sustituya.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estatización de taludes que se ejecutaran por parte de los propietarios o poseedores cuando se localice en predios de propiedad privada, o por el municipio y la autoridad ambiental cuando se trate de zonas públicas si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven Ia desestabilización o afectación de otros predios u otras zonas Públicas.',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [],
        notes: null,
    },
    '9. El Pablón': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['Según lo definido en las fichas normativas, para las zonas aptas, según él estudió de vulnerabilidad de riesgo'] },
            { title: 'Estudios técnicos específicos', texts: ['Consultar el estudio de vulnerabilidad y riesgo elaborado por la UIS para la zona en 2001-2008 y acogido por el presente Plan de Ordenamiento Territorial.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización local para prevenir aumento en la criticidad y de taludes que se ejecutaran por parte de los propietarios o poseedores cuando se localice en predios de propiedad privada a por el municipio y la autoridad ambiental cuando se trate de zonas públicas si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven la desestabilización o afectación de otros predios u otras zonas públicas.',
                    'Obras de mejoramiento integral en los sectores permitidos de acuerdo con los resultados de los estudios de vulnerabilidad y riesgos ya realizados.',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [
            { title: 'Categoría del suelo', texts: ['Protección'] },
            { title: 'Ocupación', texts: ['No se permite'] },
            { title: 'Acciones de mitigación', texts: ['Obras de estabilización local para prevenir aumento en la criticidad y de taludes que se ejecutaran por par/e de Ios propietarios o poseedores cuando se localice en predios he propiedad privada, o por el municipio y la autoridad ambiental cuando se trate de zonas públicas Si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven la desestabilización o afectación de otros predios u otras zonas públicas.'] },
        ],
        notes: null,
    },
    '10. Zona via Palenque - Café Madrid y algunas terrazas': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['Según lo definido por las fichas normativas y el estudio de estructuración urbanística para la zona de Chimita. En los estudios técnicos específicos que se elaboren, se podrán definir restricciones de ocupación no previstas en las fichas.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras he estabilización de taludes. Control de cauces y manejo adecuados de aguas Lluvias, que se ejecutaran por parte de los propietarios o poseedores cuando se localice en predios he propiedad privada, o por el municipio, la autoridad ambiental y las empresas prestadoras de servicio público de alcantarillado, cuando se trate de zonas públicas, si es del caso. En ninguno de los casos se permite que los estudios o acciones propuestas conlleven la desestabilización o afectación de otros predios u otras zonas públicas.',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                    'Por tener colindancia con zonas del Distrito Regional de Manejo Integrado de Bucaramanga (DRMI), se deben observar las acciones establecidas en este o la categoría de área protegida que le sea asignada, as como las determinadas por el presente Plan de Ordenamiento Territorial.',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [],
        notes: null,
    },
    '11. Zona llenos': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['Según lo definido por las fichas normativas y el estudio de estructuración urbanística para la zona de Chimita. En los estudios técnicos específicos que se elaboren, se podrán definir restricciones de ocupación no previstas en las fichas.'] },
            { title: 'Estudios técnicos específicos', texts: ['Para edificaciones mayores a tres (3) pisos deben efectuarse estudios sísmicos particulares de sitio (alcance y metodología seguir título A.2.10 de la NSR-10) que deben formar parte de los estudios de suelos que se presentan pare solicitudes de licencias urbanísticas, estos estudios de suelo también deben ajustarse a las exigencias de la NSR-10 o la norma que lo modifique, adicione o sustituya. No se permite construcciones mayores a ocho (8) pisos.'] },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización de taludes y manejo adecuados de aguas lluvias. En ninguno de los casos se permite que los estudios o acciones propuestas conlleven la desestabilización o afectación de otros predios u otras zonas públicas.',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },

        ],
        nocupada: [],
        notes: ' * Corresponde a implementación de acciones a cargo del municipio, la autoridad ambiental las empresas prestadoras de servicio publico de alcantarillado cuando se trate de zonas publicas, y a los propietarios de predios privados cuando se localice en predios de su propiedad'
    },
    '12. Meseta de Bucaramanga': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano y protección'] },
            { title: 'Ocupación', texts: ['Según lo definido por las fichas normativas En los estudios técnicos específicos que se elaboren, se podrán definir restricciones de ocupación no previstas en las fichas normativas'] },
            {
                title: 'Estudios técnicos específicos', texts: [
                    'Para edificaciones mayores de ocho (8) torsos deben efectuarse estudios sísmicos particulares de sitio (alcance y metodología según título A 2.10 de la NSR-10) que deben formar parte de los estudios de suelos que se presentan para solicitudes de licencias de construcción, estos estudios de suelo también deben ajustarse a las exigencias de la NSR-10 o la norma que lo modifique, lo adicione o sustituya',
                ]
            },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización de taludes y manejo adecuados de aguas lluvias que se ejecutaran por parte de los propietarios o poseedores cuando se localice en predios de propiedad privada, o por el municipio, la autoridad ambiental y/o las empresas prestadoras de servicio público de alcantarillado cuando se trate de zonas públicas si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven la desestabilización o afectación de otros predios u otras zonas públicas',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [],
        notes: null,
    },
    '13. Área de amortiguación 2 de los Escarpes': {
        ocupada: [
            { title: 'Categoría del suelo', texts: ['Urbano'] },
            { title: 'Ocupación', texts: ['Según lo definido por las fichas normativas En los estudios técnicos específicos que se elaboren, se podrán definir restricciones de ocupación no previstas en las fichas normativas *'] },
            {
                title: 'Estudios técnicos específicos', texts: [
                    'Estudios de estabilidad de taludes (alcance y metodología del capítulo H.5 de la N -16) que deben formar parte de los estudios de suelos que se presentan para solicitudes de licencias urbanísticas, estos estudios de suelo también deben ajustarse a las exigencias de la NSR-10 o la norma que lo modifique, adicione o sustituya. No se permite construcciones mayores a tres (3) pisos por las condiciones de grietas sísmicas que se han evidenciado en la zona ',
                ]
            },
            {
                title: 'Acciones de prevención, mitigación y control', texts: [
                    'Obras de estabilización local para prevenir aumento en la criticidad, que se ejecutan por parte he los propietarios o poseedores cuando se localice en predios, he propiedad privada, o por el municipio, la autoridad ambiental y/o las empresas prestadoras de servicio público de alcantarillado cuando se trate de zonas públicas si es del caso. En ninguno de los dos casos se permite que los estudios o acciones propuestas conlleven la desestabilización o afectación de otros predios u otras zonas públicas',
                    'Acciones de educación y participación social para la gestión del riesgo de desastres según lo establecido en el Plan Municipal de Gestión del Riesgo y los Planes de Acción de is autoridad ambiental',
                ]
            },
            { title: 'Directrices especificas', texts: ['Se deben aplicar las Normas Geotérmicas para aislamientos mínimos en taludes y cauces, entre otros de acuerdo con la Resolución 1294 de 2009 de la CDMB o Is norma que la modifique, adicione o sustituya, y lo contemplado en la NSR-10 o is norma que la modifique. adicione o sustituya. Para estos aislamientos se debe aplicar la norma mas restrictiva de las antes mencionadas '] },
        ],
        nocupada: [],
        notes: '* Según los estudios adelantados por la Administración Municipal en conjunto con la CDMB y UIS sobre vulnerabilidad y riesgo en el barrio Porvenir que incluye un sector de esta zona o los demás estudios que se realicen',
    },
}

const REQ_PARKINGS = [
    {
        title: 'Uso domestico',
        uses: '1,2',
        strata: ['1x110 m2', '1x110 m2', '1x110 m2', '1x70 m2', '1x70 m2', '1x70 m2',]
    },
    {
        title: 'Comercio general',
        uses: '3,4,5',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Comercio y servicios a los vehiculos',
        uses: '6,7,8',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Comercio de licores',
        uses: '9',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Al por mayor',
        uses: '10,11',
        strata: ["1x80 m2", "1x80 m2", "1x80 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Uso y consumo personal',
        uses: '12',
        strata: ["1x80 m2", "1x80 m2", "1x80 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Grandes Superficies',
        uses: '13',
        strata: ["1x80 m2", "1x80 m2", "1x80 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Cafeterias, restaurantes',
        uses: '15,16,17,18',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Otras actividades de serviios',
        uses: '20,21,22,23,24',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Servicios veterinarios',
        uses: '25,26',
        strata: ["1x80 m2", "1x80 m2", "1x80 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Actividades de agenias de viajes',
        uses: '27',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Alojamiento y Hoteles (NTSG 006)',
        uses: '28,29,30',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x70 m2", "1x70 m2", "1x70 m2"],
    },
    {
        title: 'Entretenimiento',
        uses: '31,32,33,34,35',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x70 m2", "1x70 m2", "1x70 m2"],
    },
    {
        title: 'Correo y Telecomunicaciones',
        uses: '36,37,38,39,40',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Mantenimiento y reparacion de vehiculos partes piezas y maquinaria y equipo pesado',
        uses: '41, 42',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x50 m2", "1x50 m2", "1x50 m2"],
    },
    {
        title: 'Especializados, profesionales tecnicos (Oficinas)',
        uses: '43,44,45,46,47',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x70 m2", "1x70 m2", "1x70 m2"],
    },
    {
        title: 'Intermediacion financiera',
        uses: '48,49',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x60 m2", "1x60 m2", "1x60 m2"],
    },
    {
        title: 'Actividades de esparcimiento',
        uses: '50,51',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x60 m2", "1x60 m2", "1x60 m2"],
    },
    {
        title: 'Servicios de impacto urbano',
        uses: '52',
        strata: ["1x70 m2", "1x70 m2", "1x70 m2", "1x60 m2", "1x60 m2", "1x60 m2"],
    },
    {
        title: 'Educacion',
        uses: '53,54,55,56,57',
        strata: ["1x170 m2", "1x170 m2", "1x170 m2", "1x110 m2", "1x110 m2", "1x110 m2"],
    },
    {
        title: 'Servicios de salud',
        uses: '58,59,60',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x90 m2", "1x90 m2", "1x90 m2"],
    },
    {
        title: 'Servicios sociales',
        uses: '61,62,63,64',
        strata: ["1x180 m2", "1x180 m2", "1x180 m2", "1x140 m2", "1x140 m2", "1x140 m2"],
    },
    {
        title: 'Actividades de esparcimiento, actividades culturales',
        uses: '65,66,67',
        strata: ["1x200 m2", "1x200 m2", "1x200 m2", "1x150 m2", "1x150 m2", "1x150 m2"],
    },
    {
        title: 'Centros de culto',
        uses: '68,69,70',
        strata: ["1x130 m2", "1x130 m2", "1x130 m2", "1x100 m2", "1x100 m2", "1x100 m2"],
    },
    {
        title: 'Actividades deportivas',
        uses: '71,72,73,74',
        strata: ["1x130 m2", "1x130 m2", "1x130 m2", "1x100 m2", "1x100 m2", "1x100 m2"],
    },
    {
        title: 'Servicios a la comunidad',
        uses: '75,76,77,78,79,80,81,82',
        strata: ["1x140 m2", "1x140 m2", "1x140 m2", "1x100 m2", "1x100 m2", "1x100 m2"],
    },
    {
        title: 'Abastecimients de alimentos',
        uses: '83,84',
        strata: ["1x140 m2", "1x140 m2", "1x140 m2", "1x100 m2", "1x100 m2", "1x100 m2"],
    },
    {
        title: 'Actividades funerarios y pompas funebres',
        uses: '85,86,87',
        strata: ["1x160 m2", "1x160 m2", "1x160 m2", "1x130 m2", "1x130 m2", "1x130 m2"],
    },
    {
        title: 'Transporte',
        uses: '88,89',
        strata: ["1x140 m2", "1x140 m2", "1x140 m2", "1x100 m2", "1x100 m2", "1x100 m2"],
    },
    {
        title: 'Eliminacion de desperdicios y aguas residuales, saneamiento y actividades similares',
        uses: '90',
        strata: ["1x190 m2", "1x190 m2", "1x190 m2", "1x140 m2", "1x140 m2", "1x140 m2"],
    },
    {
        title: 'Suministro de electricidad, gas, agua, comunicaciones y demas servicios publicos o de particularess',
        uses: '91,92,93',
        strata: ["1x180 m2", "1x180 m2", "1x180 m2", "1x140 m2", "1x140 m2", "1x140 m2"],
    },
    {
        title: 'Otras actividades empresarialess',
        uses: '94,95',
        strata: ["1x90 m2", "1x90 m2", "1x90 m2", "1x70 m2", "1x70 m2", "1x70 m2"],
    },
    {
        title: 'Hoteles, apartahoteles (Apartamentos con servicios hoteleros)',
        uses: 'Vivienda',
        strata: ["1x225 m2", "1x225 m2", "1x150 m2", "1x113 m2", "1x90 m2", "1x90 m2"],
    },
    {
        title: 'Hostales (Renta de camas con servicios compartidos mayor a 1 dia)',
        uses: 'Vivienda',
        strata: ["1x225 m2", "1x225 m2", "1x225 m2", "1x150 m2", "1x150 m2", "1x150 m2"],
    },
    {
        title: 'Residencias, hoteles, amoblados (Servicios por horas)',
        uses: 'Vivienda',
        strata: ["1x225 m2", "1x225 m2", "1x225 m2", "1x150 m2", "1x150 m2", "1x150 m2"],
    },
    {
        title: 'Salas de velacion',
        uses: 'Vivienda',
        strata: ["1", "2", "3", "6", "8", "10"],
    },
    {
        title: 'Industria transformadora [Local A (P.P)]',
        uses: 'Vivienda',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x100 m2", "1x100 m2", "1x100 m2"],
    },
    {
        title: 'Industria transformadora [Local (P.P)]',
        uses: 'Vivienda',
        strata: ["1x100 m2", "1x100 m2", "1x100 m2", "1x100 m2", "1x100 m2", "1x100 m2"],
    },
    {
        title: 'Industria transformadora [Local (V)]',
        uses: 'Vivienda',
        strata: ["1x250 m2", "1x250 m2", "1x250 m2", "1x250 m2", "1x250 m2", "1x250 m2"],
    },
    {
        title: 'Industria transformadora [Zonal (P.P)]',
        uses: 'Vivienda',
        strata: ["1x150 m2", "1x150 m2", "1x150 m2", "1x150 m2", "1x150 m2", "1x150 m2"],
    },
    {
        title: 'Industria transformadora [Zonal (V)]',
        uses: 'Vivienda',
        strata: ["1x300 m2", "1x300 m2", "1x300 m2", "1x300 m2", "1x300 m2", "1x300 m2"],
    },
    {
        title: 'Industria transformadora [Metropolitana (P.P)]',
        uses: 'Vivienda',
        strata: ["1x300 m2", "1x300 m2", "1x300 m2", "1x300 m2", "1x300 m2", "1x300 m2"],
    },
    {
        title: 'Industria transformadora Metropolitana (V)]',
        uses: 'Vivienda',
        strata: ["1x500 m2", "1x500 m2", "1x500 m2", "1x500 m2", "1x500 m2", "1x500 m2"],
    },
    {
        title: 'Industria transformadora Metropolitana (V)]',
        uses: 'Vivienda',
        strata: ["1x500 m2", "1x500 m2", "1x500 m2", "1x500 m2", "1x500 m2", "1x500 m2"],
    },

]

const REQ_PARKINGS_VIV = [
    {
        title: 'Residentes (R)',
        strata: ['1x7 viv', '1x5 viv', '1x3 viv', '1x1 viv', '1.5x1 viv', '2x1 viv',]
    },
    {
        title: 'Visitantes (V)',
        strata: ['1x12 viv', '1x12 viv', '1x8 viv', '1x6 viv', '1x5 viv', '1x4 viv',]
    },
    {
        title: 'Motocicletas (M)',
        strata: ['3x7 R', '3x5 R', '3x3 R', '3x3 V', '1x5 V', '1x5 V',]
    },
    {
        title: 'Bicicletas (B)',
        strata: ['1x12 viv', '1x12 viv', '1x8 viv', '1x6 viv', '1x5 viv', '1x4 viv',]
    },
]

const NOTES_VIV = `Los cupos de parqueo para motos deben calcularse a partir del número de cupos de parqueo de vehículos para visitantes. Los 1.5 cupos por unidad de vivienda estrato cinco (5) se calculan para la  totalidad de las viviendas del proyecto, de modo que algunas pueden contar con dos unidades de parqueo y otras con una. Ejemplo para diez (10) unidades de vivienda se deben proveer en total quince (15) cupos de parqueo para residentes o propietarios de los inmuebles.`
const NOTES_COM = `Todas las edificaciones deben cumplir
con la exigencia de parqueaderos para
motocicletas y bicicletas, que resulta de
proveer como mínimo un (1) cupo de
estacionamiento para moto y un (1)
estacionamiento para bicicleta, por cada
cinco (5) cupos de parqueo de vehículos
(automóviles o camionetas). Para estos
cupos también rigen las aproximaciones
establecidas en el Artículo 358o “Cuota
mínima de parqueo asociada a los usos”
del presente plan. (Servicios,
dotacional,) En unidades de uso de
escalas zonal y metropolitana, adicional
a las cuotas establecidas según el uso,
debe proveerse un (1) parqueadero para
cargue y descargue por cada
cuatrocientos metros cuadrados (400
m2) de área generadora de
parqueaderos.(servicios dotacional) *
Para la descripción de unidades de uso
consultar los cuadros anexos N° 1, 2 y
3. * ** Cuando las unidades de uso del
grupo Alojamiento y Hoteles tengan
salones de reuniones, conferencias y/o
eventos, se debe proveer
adicionalmente un cupo de parqueo por
cada diez metros cuadrados (10 m2)
construidos de estos usos o áreas.
Cuando se licencien locales o espacios
con “uso” comercio y/o servicios, y /o
dotacional debe quedar establecido en
la licencia de construcción el “grupo de
uso y escala” a partir de los cuales se
calculan los cupos de parqueo exigidos
para dichas áreas. Las unidades de uso
o los usos específicos que pueden
desarrollarse en las áreas para
comercio y/o servicios, estarán
determinados por el número de
parqueos que se provean y el área de la
cuota mínima de parqueo exigida según
el área generadora determinada en este
Cuadro. Las unidades de uso de
escala “LOCAL A” deben proveer un
cupo de parqueo si su área supera los
cincuenta metros cuadrados (50 m2) de
área generadora.`.replace(/[\n\r]+ */g, ' ');
const NOTES_IND = `Todas las edificaciones deben cumplir
con la exigencia de parqueaderos para
motocicletas y bicicletas, que resulta de
proveer como mínimo un (1) cupo de
estacionamiento para moto y un (1)
estacionamiento para bicicleta, por cada
cinco (5) cupos de parqueo de vehículos
(automóviles o camionetas sumando
P.P + V). Para estos cupos también
rigen las aproximaciones establecidas
en el Artículo 358o “Cuota mínima de
parqueo asociada a los usos” del
presente plan.
Por lo menos la mitad de los cupos de
parqueo privados deben tener las
dimensiones establecidas para parqueo
de cargue y descargue: Ancho: Tres
metros con cincuenta (3.50 m) y largo:
siete metros (7.00 m).`.replace(/[\n\r]+ */g, ' ');
function GET_VOLADIZO(ele, value, antejardin) {
    if (ele == 'peatonal' && value <= 9 && antejardin > 0) return 'No';
    if (ele == 'peatonal' && value <= 9 && antejardin == 0) return 'No';

    if (ele == 'peatonal' && value > 9 && antejardin > 0) return '0.6';
    if (ele == 'peatonal' && value > 9 && antejardin == 0) return 'No';

    if (ele == 'road' && value <= 9.6 && antejardin > 0) return '0.6';
    if (ele == 'road' && value <= 9.6 && antejardin == 0) return 'No';

    if (ele == 'road' && value > 9.6 && value < 16 && antejardin > 0) return '1';
    if (ele == 'road' && value > 9.6 && value < 16 && antejardin == 0) return '0.6';

    if (ele == 'road' && value >= 16 && value < 21 && antejardin > 0) return '1.2';
    if (ele == 'road' && value >= 16 && value < 21 && antejardin == 0) return '0.8';

    if (ele == 'road' && value >= 21 && antejardin > 0) return '1.5';
    if (ele == 'road' && value >= 21 && antejardin == 0) return '1';

    return ''
}
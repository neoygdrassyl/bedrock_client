const db = require("../models");
const CERT = db.certification;
const moment = require('moment');
const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");

exports.findAll = (req, res) => {
    CERT.findAll()
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

exports.findByOc = (req, res) => {
    const id_public = req.params.id_public;

    CERT.findAll({
        id_public: { id_public: id_public }
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

exports.findById = (req, res) => {
    const id = req.params.id;

    CERT.findAll({
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

exports.findByRelated = (req, res) => {
    const id_related = req.params.id_related;
    const related = req.params.related;

    CERT.findAll({
        where: { id_related: id_related, related: related }
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

exports.create = (req, res) => {
    var object = {
        id_public: 'OC ' + moment().format('YY-MMDDHHmmss'),
        description: req.body.description ? req.body.description : null,
        content: req.body.content ? req.body.content : null,
        id_related: req.body.id_related ? req.body.id_related : null,
        related: req.body.related ? req.body.related : null,
    }

    CERT.create(object)
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

exports.update = (req, res) => {
    return res.json({ message: "HA! GO'TEM!" });
    const id = req.params.id;
    CERT.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};

exports.delete = (req, res) => {
    res.json({ message: "HA! GO'TEM!" });
};


exports.gendoc_cert_fun = (req, res) => {
    // Create
    var _DATA = {
        id_oc: (req.body.id_oc != 'null' ? req.body.id_oc : ""),
        date_doc: (req.body.date_doc != 'null' ? req.body.date_doc : ""),
        id_public: (req.body.id_public != 'null' ? req.body.id_public : " "),
        state: (req.body.state != 'null' ? req.body.state : ""),
        type: (req.body.type != 'null' ? req.body.type : ""),
        city: (req.body.city != 'null' ? req.body.city : ""),
        county: (req.body.county != 'null' ? req.body.county : ""),
        name: (req.body.name != 'null' ? req.body.name : " "),
        id_number: (req.body.id_number != 'null' ? req.body.id_number : " "),
        address: (req.body.address != 'null' ? req.body.address : " "),
        role: (req.body.role != 'null' ? req.body.role : " "),
        address2: (req.body.address2 != 'null' ? req.body.address2 : " "),
        matricula: (req.body.matricula != 'null' ? req.body.matricula : " "),
        predial: (req.body.predial != 'null' ? req.body.predial : " "),
      
    }
    _PDFGEN_FUN(_DATA);
    res.send('OK');
};

function _PDFGEN_FUN(_DATA) {
    const PDFDocument = require('pdfkit');

    var doc = new PDFDocument({
        size: 'LETTER', margins: {
            top: 124,
            bottom: 85,
            left: 85,
            right: 56
        },
        bufferPages: true,
    });


    const _BODY = `Que el/la señor(a) ${_DATA.name} con cédula de ciudadanía N° ${_DATA.id_number} en calidad de ${_DATA.role}, 
    se encuentra tramitando la solicitud con radicado N° ${_DATA.id_public} de ${_DATA.type} en el predio ubicado en el/la ${_DATA.address2} del Municipio de ${_DATA.city} 
    según folio de Matrícula Inmobiliaria N° ${_DATA.matricula} de la Oficina de Instrumentos Públicos de ${_DATA.city} o según la entidad responsable, 
    con número catastral N° ${_DATA.predial}, la cual se encuentra en ${_DATA.state}.`.replace(/[\n\r]+ */g, ' ');


    doc.pipe(fs.createWriteStream('./docs/public/cert_fun.pdf'));

    doc.fontSize(14)
    doc.font('Helvetica-Bold')
    doc.text('\n\n\n');
    doc.text('CERTIFICA', {align: 'center'});
    doc.text('\n\n');
    doc.font('Helvetica')
    doc.fontSize(12)
    doc.text(_BODY, { align: 'justify' });

    doc.text('\n');
    doc.text(`Dada en ${_DATA.city} el ${dateParser(_DATA.date_doc)}`);

    pdfSupport.setSign(doc);
    pdfSupport.setHeader(doc, { title: 'CERTIFICACIÓN DE ACTUACIÓN URBANÍSTICA', id_public: _DATA.id_oc, icon: true });
    pdfSupport.setBottom(doc, false, true);

    doc.end();
    return true;
}

function dateParser(date) {
    const moment = require('moment');
    let esLocale = require('moment/locale/es');
    var momentLocale = moment(date, 'YYYY-MM-DD').locale('es', esLocale);
    return momentLocale.format("LL")
  }
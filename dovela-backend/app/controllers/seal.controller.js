const db = require("../models");
const Seals = db.seals;
const FUN_0 = db.fun_0;
const FUN_1 = db.fun_1;
const Op = db.Sequelize.Op;
const moment = require('moment');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const curaduriaInfo = require('../config/curaduria.json')
// POST
exports.create = (req, res) => {
  const object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    area: (req.body.area ? req.body.area : null),
    blueprints: (req.body.blueprints ? req.body.blueprints : null),
    drives: (req.body.drives ? req.body.drives : null),
    folders: (req.body.folders ? req.body.folders : null),
    id_public: (req.body.id_public ? req.body.id_public : ""),
  };

  // Create
  Seals.create(object)
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
  Seals.findAll({ include: [FUN_0] })
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
  Seals.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving DATA with ID=" + id
      });
    });
};

// GET BY ID
// FINDS A FUN_0 ONJECT GIVE THE ID PUBLIC, THIS IS DONE TO GIVE THE SEAL A PARENT FROM WICH GET SOME OF ITS NEEDED DATA
exports.findSeal = (req, res) => {
  const _id_public = req.params.id_public;
  FUN_0.findAll({ include: [FUN_1, Seals], 
    where :{ id_public:  _id_public},}
    )
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving DATA with ID=" + id
      });
    });
};

exports.findSearch = (req, res) => {
  const _field = req.params.field;
  const _string = req.params.string;
  
  console.log("CONSULT REQUESTED, FOR FIELD CODE & STRING VALUE: ", _field, _string);

  if (_field == 1){
    Seals.findAll({
      include: [FUN_0],
      where : {
        '$fun_0.id_public$': _string
      },
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
  }

  if (_field == 2){
    Seals.findAll({
      include: [FUN_0],
      where : {
        id_public: _string
      },
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
  }

};

// GENERATE PDF
exports.generate = (req, res) => {
  const object = {
    id_request: (req.body.id_request ? req.body.id_request : "ERROR"),
    mode: (req.body.mode ? req.body.mode : "ERROR"),
    area: (req.body.area ? req.body.area : "ERROR"),
    date: (req.body.date ? req.body.date : "ERROR"),
    type: (req.body.type ? req.body.type : "ERROR"),
    blueprints: (req.body.blueprints ? req.body.blueprints : "0"),
    drives: (req.body.drives ? req.body.drives : "0"),
    folders: (req.body.folders ? req.body.folders : "0"),
    id_public: (req.body.id_public ? req.body.id_public : "ERROR"),
    custom: (req.body.custom ? req.body.custom :false),
    fun_id: (req.body.fun_id ? req.body.fun_id : "ERROR"),
  };

    // SET HTML TO PDF TEMPLATE
    const titulo = `${curaduriaInfo.job} ${curaduriaInfo.title} ${curaduriaInfo.master}`.toUpperCase();
    const code = object.id_request;
    const contenido_col1 = "\n" + object.mode + "\n\nAREA TOTAL DE INTERVENCION\n" + object.area + "\n\nFECHA DE EXPEDICION\n" + moment(object.date, 'YYYY-MM-DD').format('DD-MM-YYYY');
    const contenido_col2 = "\n\n\n\n\n\n\n\n\n"+ object.type + "\n\n\n\n\n\n\n\nCURADOR";
    const contenido_foot = "SELLO N°. " + object.id_public;
    var footer = 'Con este sello se aprueban (' + object.blueprints + ') plano(s), (' + object.drives + ') memoria(s) y (' + object.folders + ') estudio(s).\n Si este sello se rompe pierde su validez.';
    if(object.custom) footer = `${object.custom}`;
    const content_config = {
      columns: 2,
      columnGap: 15,
      height: 140,
      width: 275,
      align: 'center',
    }
    // CONFIG FOR PDF
    console.log('CREATING PDF');
    const doc = new PDFDocument({ size: 'A6', margin: 5 });
    doc.pipe(fs.createWriteStream('./docs/public/output.pdf'));
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titulo, 40, 10, { align: 'center' })
      .text(object.fun_id, 60, 40, { align: 'left' })
      .fontSize(7)
      .text(code, 5, 60, {...content_config, width: 295})
      .fontSize(7)
      .text(contenido_col1, 10, 70, content_config)
      .fontSize(12)
      .text(contenido_col2, 10, 40, content_config)
      .fontSize(7)
      .text(contenido_foot, 10, 170, { align: 'center' })
      .fontSize(6)
      .text(footer, 10, 180, { align: 'center' })
      .fontSize(10)

      .text(titulo, 40, 230, { align: 'center' })
      .text(object.fun_id, 60, 260, { align: 'left' })
      .fontSize(7)
      .text(code, 5, 275, {...content_config, width: 295})
      .fontSize(7)
      .text(contenido_col1, 10, 285, content_config)
      .fontSize(12)
      .text(contenido_col2, 10, 260, content_config)
      .fontSize(7)
      .text(contenido_foot, 10, 390, { align: 'center' })
      .fontSize(6)
      .text(footer, 10, 400, { align: 'center' })
      .stroke();

    doc
      .image('docs/public/logo192.png', 10, 10, { width: 38, height: 38 })
      .image('docs/public/logo192.png', 10, 230, { width: 38, height: 38 })
      .rect(150, 60, 140, 80)
      .stroke()
      .rect(150, 280, 140, 80)
      .stroke();

    doc.end();
    console.log('SEAL PDF CREATED SUCCESSFULLY!');
    res.send("OK")
  

};

// GET SEAL PDF
exports.seal = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
    res.download( directoryPath + "/docs/public/output.pdf", fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      } else {
        console.log('DOWNLOAD FOR SEAL REQUESTED, GIVEN: ', fileName)
      }
    });

};

// PUT
exports.update = (req, res) => {
  const id = req.params.id;
  Seals.update(req.body, {
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
  res.json({ message: "This is ROLES DELETE BY ID!" });
};

// DELETE ALL
exports.deleteAll = (req, res) => {
  res.json({ message: "This is ROLES DELETE ALL!" });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  res.json({ message: "This is ROLES FIND PUBLISHED!" });
};
/*
// create a document and pipe to a blob
var doc = new PDFDocument({ size: 'LETTER',  margins: {
    top: 85,
    bottom: 85,
    left: 85,
    right: 56
  }});
var stream = doc.pipe(blobStream());

// draw some text
doc.font('Helvetica')
doc.fontSize(11).text('Bucaramanga, XXXXXXXXX, XXXXXX 2017');
doc.font('Helvetica-Bold')
doc.fontSize(11).text('68001-1-15-01336', {align: 'right'});
doc.fontSize(11).text('\n\n\n');
doc.font('Helvetica')
doc.fontSize(11).text('Senor(a)');
doc.font('Helvetica-Bold')
doc.fontSize(11).text('HERNAND DORIGS  NNNNNNN');
doc.font('Helvetica')
doc.fontSize(11).text('CALLE 21 N 164');
doc.fontSize(11).text('Ciudad');
doc.fontSize(11).text('\n\n\n');
doc.fontSize(11).text('Referencia: viavilidad de licencia');
doc.fontSize(11).text('Tipo de solicitud: RECONSTRUCION, DE EDIFICIO, AOMPLACIO, REMODELACION', 145);
doc.fontSize(11).text('Direccion del predio: Calle 102245 n°45-544', 145);
*/
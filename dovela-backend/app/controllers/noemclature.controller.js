const db = require("../models");
const Nomenclature = db.nomenclature;
const Nomen_doc = db.nomen_docs;
const Op = db.Sequelize.Op;
const moment = require('moment');
const fs = require('fs');
const curaduriaInfo = require('../config/curaduria.json')
const pdfSupport = require("../config/pdfSupport.js");
// POST
exports.create = (req, res) => {

  const id_public = (req.body.id_public ? req.body.id_public : res.send('NOT A REAL ID'));

  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT nomenclatures.id_public
  FROM nomenclatures
  WHERE nomenclatures.id_public LIKE '${id_public}'
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      if (data.length) res.send("ERROR_DUPLICATE");
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });

  const object = {
    id_public: id_public,
    name: (req.body.name ? req.body.name : null),
    surname: (req.body.surname ? req.body.surname : null),
    number_id: (req.body.number_id ? req.body.number_id : null),
    predial: (req.body.predial ? req.body.predial : null),
    matricula: (req.body.matricula ? req.body.matricula : null),
    address: (req.body.address ? req.body.address : null),
    neighbour: (req.body.neighbour ? req.body.neighbour : null),
    type: (req.body.type ? req.body.type : null),
    date_start: (req.body.date_start ? req.body.date_start : null),
    date_end: (req.body.date_end ? req.body.date_end : null),
    details: (req.body.details ? req.body.details : null),
    number: (req.body.number ? req.body.number : null),
    note: (req.body.note ? req.body.note : null),
    recipe_office_id: (req.body.recipe_office_id ? req.body.recipe_office_id : null),
    recipe_office_date: (req.body.recipe_office_date ? req.body.recipe_office_date : null),
    recipe_county_id: (req.body.recipe_county_id ? req.body.recipe_county_id : null),
    recipe_county_date: (req.body.recipe_county_date ? req.body.recipe_county_date : null),
    use: (req.body.use ? req.body.use : null),
  };

  // Create
  Nomenclature.create(object)
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
exports.create_anex = (req, res) => {

  const nomenclatureId = (req.body.nomenclatureId ? req.body.nomenclatureId : res.send('NOT A REAL ID'));
  const file = req.files[0];

  var mimetype = file.mimetype;
  if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
    fs.unlink(file.path, (err) => {
      console.log('FILE NOT COMPATIBLE, DETELED!');
      if (err) res.send(err);
    });
    res.send('ERROR_2')
  }

  const object = {
    nomenclatureId: nomenclatureId,
    pages: (req.body.pages ? req.body.pages : null),
    id_public: (req.body.id_public ? req.body.id_public : null),
    filename: file.filename,
    path: file.path.substring(0, file.path.lastIndexOf('/'))
  };

  // Create
  Nomen_doc.create(object)
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
  Nomenclature.findAll({ include: [Nomen_doc] })
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
exports.findAll_public = (req, res) => {
  const id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT nomenclatures.id_public, nomenclatures.type, nomenclatures.date_end, nome_docs.path, nome_docs.filename
  FROM nomenclatures
  INNER JOIN nome_docs ON nome_docs.nomenclatureId = nomenclatures.id
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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
  Nomenclature.findByPk(id, { include: [Nomen_doc] })
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

  console.log("CONSULT REQUESTED, FOR NOMENCLATURE, FOR FIELD CODE & STRING VALUE: ", _field, _string);

  if (_field == 1) {
    Nomenclature.findAll({
      include: [Nomen_doc],
      where: {
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

  if (_field == 2) {
    Nomenclature.findAll({
      include: [Nomen_doc],
      where: {
        matricula: _string
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

  if (_field == 3) {
    Nomenclature.findAll({
      include: [Nomen_doc],
      where: {
        predial: _string
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

  if (_field == 4) {
    Nomenclature.findAll({
      include: [Nomen_doc],
      where: {
        address: { [Op.like]: `%` + _string + `%` }
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

  if (_field == 5) {
    Nomenclature.findAll({
      include: [Nomen_doc],
      where: {
        number_id: { [Op.like]: `%` + _string + `%` }
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

  if (_field == 6) {
    Nomenclature.findAll({
      include: [Nomen_doc],
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%` + _string + `%` } },
          { surname: { [Op.like]: `%` + _string + `%` } },
        ]

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

exports.findExcelData = (req, res) => {
  const _start_date = req.params.start_date;
  const _end_date = req.params.end_date;

  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT nomenclatures.predial, nomenclatures.id_public, nomenclatures.address, nomenclatures.number, nomenclatures.date_start, nomenclatures.date_end, nomenclatures.details, 
  nomenclatures.use
  FROM nomenclatures
  WHERE nomenclatures.date_end BETWEEN '${_start_date}' AND '${_end_date}'
`;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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


exports.findLastID = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT nomenclatures.id_public 
  FROM nomenclatures
  WHERE nomenclatures.id_public LIKE  CONCAT('${curaduriaInfo.serials.nomen}', DATE_FORMAT(CURRENT_DATE(), '%y'), '%')
  ORDER BY id_public 
  DESC LIMIT 1
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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
  const id_public = (req.body.id_public ? req.body.id_public : res.send('NOT A REAL ID_PUBLIC'));

  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT nomenclatures.id_public
  FROM nomenclatures
  WHERE nomenclatures.id_public LIKE '${id_public}'
  AND nomenclatures.id NOT LIKE '${id}'
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      if (data.length) res.send("ERROR_DUPLICATE");
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });

  Nomenclature.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update_anex = (req, res) => {
  const id = req.params.id;
  const new_file = req.files[0];

  if (new_file) {
    Nomen_doc.findAll({
      where: { id: id },
      attributes: ['path', 'filename'],
    }).then(data => {
      fs.unlink(data[0].path + '/' + data[0].filename, (err) => {
        console.log('FILE FOR ATTACH NOMENCLATURE, DETELED! THIS IS FOR EDIT', id);
        req.body.filename = new_file.filename,
          req.body.path = new_file.path.substring(0, new_file.path.lastIndexOf('/'))
        update();
        if (err) res.send(err);
      });
    })
  } else {
    update();
  }


  function update() {
    Nomen_doc.update(req.body, {
      where: { id: id }
    }).then(num => {
      if (num == 1) {
        res.send('OK');
      } else {
        res.send(`ERROR_2`); // NO MATCHING ID
      }
    })
  }
};

// DELETE BY ID
exports.delete = (req, res) => {
  const id = req.params.id;
  Nomenclature.destroy({
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


exports.gendoc_nomenclature = (req, res) => {
  // Create
  var _DATA = {
    date: (req.body.date != 'null' ? req.body.date : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
    type: (req.body.type != 'null' ? req.body.type : ""),
    predial: (req.body.predial != 'null' ? req.body.predial : ""),
    matricula: (req.body.matricula != 'null' ? req.body.matricula : ""),
    neighbour: (req.body.neighbour != 'null' ? req.body.neighbour : ""),
    name: (req.body.name != 'null' ? req.body.name : ""),
    surname: (req.body.surname != 'null' ? req.body.surname : ""),
    number_id: (req.body.number_id != 'null' ? req.body.number_id : ""),
    details: (req.body.details != 'null' ? req.body.details : ""),
    note: (req.body.note != 'null' ? req.body.note : ""),
    use: (req.body.use != 'null' ? req.body.use : ""),
    fontSize: (req.body.fontSize != 'null' ? req.body.fontSize : 12),
    city: (req.body.city != 'null' ? req.body.city : 12),
    date_start: (req.body.date_start != 'null' ? req.body.date_start : ""),
    date_end: (req.body.date_end != 'null' ? req.body.date_end : ""),
  }
  if (curaduriaInfo.id == "cub1") _PDFGEN_NOMENCLATURE(_DATA);
  else if (curaduriaInfo.id == "fld2") _PDFGEN_NOMENCLATURE_FLD2(_DATA);
  else _PDFGEN_NOMENCLATURE(_DATA);
  res.send('OK');
};

function _PDFGEN_NOMENCLATURE(_DATA) {
  const PDFDocument = require('pdfkit');
  var doc = new PDFDocument({
    size: 'LEGAL', margins: {
      top: 100,
      bottom: 56,
      left: 56,
      right: 56
    },
    bufferPages: true,
  });
  const _BODY = `en uso de las facultades que le confiere la Ley 9 de 1989, Ley 388 de 1997, el Decreto No 
  1469 de 2010, la Ley 675 de 2001, la Decreto 0070 del 4 junio de 2021 y de acuerdo con 
  la solicitud elevada por los propietarios, CONCEDE:`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_nomenclature.pdf'));

  doc.font('Helvetica-BoldOblique');
  doc.image('docs/public/logo192.png', doc.x, 75, { width: 45, height: 45 })
  doc.fontSize(12).text(curaduriaInfo.name, doc.x, 75, { align: 'center' });
  doc.fontSize(12).text(`${(curaduriaInfo.title)} ${(curaduriaInfo.master)}`, doc.x, 88, { align: 'center' });

  doc.fontSize(16);
  doc.text('\n', 56, doc.y);
  doc.font('Helvetica-BoldOblique');
  doc.text(`** ${_DATA.id_public} **`, { align: 'center' });
  doc.text('\n');

  doc.fontSize(12);
  doc.font('Helvetica');
  doc.text('El suscrito:  ', doc.x + 86, doc.y, { continued: true });
  doc.font('Helvetica-Bold');
  doc.text(`${curaduriaInfo.pronoum} ${curaduriaInfo.job}`);
  doc.font('Helvetica');
  doc.text(_BODY, 56, doc.y, { align: 'center' });
  doc.text('\n\n');

  doc.fontSize(14);
  doc.font('Helvetica-BoldOblique');
  cell(doc, doc.y, _DATA.type, 500, 'center');

  doc.text('\n\n');
  doc.fontSize(12);
  let neighbour = _DATA.neighbour ? _DATA.neighbour.split(";") : [" ", " "]
  rowpair(doc, doc.y, ['Nº PREDIAL:', _DATA.predial])
  doc.text('\n');
  rowpair(doc, doc.y, ['Barrio / Urbanización:', neighbour[0]])
  doc.text('\n');
  rowpair(doc, doc.y, ['Propietario / Solicitante:', _DATA.name + " " + _DATA.surname])
  doc.text('\n');
  doc.font('Helvetica');
  doc.font('Helvetica-Bold');
  doc.text('\n');

  doc.fontSize(_DATA.fontSize);

  var _DETAILS = _DATA.details;
  var _TEXT = [];
  var box_config = calculateBlock_text(doc, _DETAILS);
  var _DETAILS_ARRAY = _DETAILS.split('\n');
  _TEXT.push(_DETAILS_ARRAY.slice(0, box_config[0] + 1));
  _TEXT.push(_DETAILS_ARRAY.slice(box_config[0], _DETAILS_ARRAY.length + 1));

  var _TEXT_0 = _TEXT[0].join('\n');
  var _TEXT_1 = _TEXT[1].join('\n');


  inteligenBlock(doc, doc.y, _TEXT_0, box_config[1], box_config[2]);
  if (_TEXT_1.length) {
    doc.addPage({ size: 'LEGAL' })
    var box_config = calculateBlock_text(doc, _TEXT_1, 800);
    inteligenBlock(doc, doc.y, _TEXT_1, box_config[1], box_config[2]);
  }

  doc.fontSize(8)

  doc.text('\n\n');
  doc.font('Helvetica-Bold');
  doc.text('Destino: Trámites Notariales, Oficina de Registro, Acueducto de Bucaramanga, IGAC, Electrificadora de Santander, Telebucaramanga, C.D.M.B, Gasoriente, EMPAS', { align: 'center' });
  doc.text('\n');
  doc.text(_DATA.note, { align: 'center' });
  doc.text('\n');

  doc.lineWidth(1)
    .moveTo(doc.x, doc.y)
    .lineJoin('miter')
    .lineTo(556, doc.y)
    .stroke()

  doc.text('\n');
  doc.font('Helvetica-BoldOblique');
  doc.text('*** El presente Boletín de Nomenclatura, NO CERTIFICA PROPIEDAD sobre el predio y/o inmueble ***', { align: 'center' });
  doc.text('\n');
  doc.text('*** La información de este documento puede ser verificada y consultada en la pagina web www.curaduria1bucaramanga.com ***', { align: 'center' });

  doc.fontSize(12);
  doc.font('Helvetica');
  doc.text('\n\n');
  doc.text(`Se expide en ${_DATA.city}, ${dateParser(_DATA.date)}.`);
  doc.fontSize(11).text('\n\n\n\n');
  doc.font('Helvetica-Bold')
  doc.fontSize(13).text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
  doc.fontSize(11).text(curaduriaInfo.job);

  const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
  doc.switchToPage(0);
  doc.page.margins = {
    top: 85,
    bottom: 0,
    left: 56,
    right: 56
  },
    doc.fontSize(8);
  doc.font('Helvetica');
  doc.text(`${curaduriaInfo.dir}`, doc.x, 950, { align: 'center' });
  doc.text(`Tel: ${curaduriaInfo.tel} Cel: ${curaduriaInfo.cel}    Email: ${curaduriaInfo.email}`, { align: 'center' });
  doc.text(`Pagina Web: ${curaduriaInfo.page}`, { align: 'center' });
  for (var i = range.start + 1; i < range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins = {
      top: 85,
      bottom: 0,
      left: 56,
      right: 56
    };

    doc.fontSize(11);
    doc.font('Helvetica-BoldOblique');
    doc.image('docs/public/logo192.png', doc.x, 30, { width: 35, height: 35 })
    doc.fontSize(10).text(curaduriaInfo.name, doc.x, 35, { align: 'center' });
    doc.fontSize(10).text(`${(curaduriaInfo.title)} ${(curaduriaInfo.master)}`, doc.x, 45, { align: 'center' });

    doc.fontSize(8);
    doc.font('Helvetica');
    doc.text(`${curaduriaInfo.dir}`, doc.x, 950, { align: 'center' });
    doc.text(`Tel: ${curaduriaInfo.tel} Cel: ${curaduriaInfo.cel}    Email: ${curaduriaInfo.email}`, { align: 'center' });
    doc.text(`Pagina Web: ${curaduriaInfo.page}`, { align: 'center' });
  }



  doc.addPage({ size: 'LEGAL' })
  doc.page.margins = {
    top: 100,
    bottom: 56,
    left: 56,
    right: 56
  },
    doc.font('Helvetica-BoldOblique');
  doc.fontSize(12).text(curaduriaInfo.name, 80, 75, { align: 'center' });
  doc.fontSize(12).text(`${(curaduriaInfo.title)} ${(curaduriaInfo.master)}`, 80, 88, { align: 'center' });

  doc.fontSize(16);
  doc.text('\n');
  doc.font('Helvetica-BoldOblique');
  doc.text(`** ${_DATA.id_public} **`, { align: 'center' });
  doc.text('\n', doc.x, doc.y);

  doc.fontSize(12);
  doc.font('Helvetica');
  doc.text('El suscrito ', doc.x + 56, doc.y, { continued: true });
  doc.font('Helvetica-Bold');
  doc.text(curaduriaInfo.name + ',');
  doc.font('Helvetica');
  doc.text(_BODY, 56, doc.y, { align: 'center' });
  doc.text('\n\n');

  doc.fontSize(14);
  doc.font('Helvetica-BoldOblique');
  cell(doc, doc.y, _DATA.type, 500, 'center');

  doc.text('\n\n');
  doc.fontSize(12);

  neighbour = _DATA.neighbour ? _DATA.neighbour.split(";") : [" ", " "]
  rowpair(doc, doc.y, ['Nº PREDIAL:', _DATA.predial])
  doc.text('\n');
  rowpair(doc, doc.y, ['Barrio / Urbanización:', neighbour[0]])
  doc.text('\n');
  rowpair(doc, doc.y, ['Propietario / Solicitante:', _DATA.name + " " + _DATA.surname])
  doc.text('\n');
  doc.font('Helvetica');
  doc.font('Helvetica-Bold');
  doc.text('\n');

  doc.fontSize(_DATA.fontSize);
  inteligenBlock(doc, doc.y, _TEXT_0, box_config[1], box_config[2]);

  if (_TEXT_1.length) {
    doc.addPage({ size: 'LEGAL' })
    var box_config = calculateBlock_text(doc, _TEXT_1, 800);
    inteligenBlock(doc, doc.y, _TEXT_1, box_config[1], box_config[2]);
  }

  doc.fontSize(8)
  doc.text('\n\n');
  doc.font('Helvetica-Bold');
  doc.text('Destino: Trámites Notariales, Oficina de Registro, Acueducto de Bucaramanga, IGAC, Electrificadora de Santander, Telebucaramanga, C.D.M.B, Gasoriente, EMPAS', { align: 'center' });
  doc.text('\n');
  doc.text(_DATA.note, { align: 'center' });
  doc.text('\n');

  doc.lineWidth(1)
    .moveTo(doc.x, doc.y)
    .lineJoin('miter')
    .lineTo(556, doc.y)
    .stroke()

  doc.text('\n');
  doc.font('Helvetica-BoldOblique');
  doc.text('*** El presente Boletín de Nomenclatura, NO CERTIFICA PROPIEDAD sobre el predio y/o inmueble ***', { align: 'center' });
  doc.text('\n');
  doc.text('*** La información de este documento puede ser verificada y consultada en la pagina web www.curaduria1bucaramanga.com ***', { align: 'center' });

  doc.fontSize(12);
  doc.font('Helvetica');
  doc.text('\n\n');
  doc.text(`Se expide en ${_DATA.city}, ${dateParser(_DATA.date)}.`);
  doc.fontSize(11).text('\n\n\n\n');
  doc.font('Helvetica-Bold')
  doc.fontSize(13).text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
  doc.fontSize(11).text(curaduriaInfo.job);

  doc.end();
  return true;
}

function _PDFGEN_NOMENCLATURE_FLD2(_DATA) {
  const PDFDocument = require('pdfkit');
  var doc = new PDFDocument({
    size: 'LEGAL', margins: {
      top: 100,
      bottom: 56,
      left: 56,
      right: 56
    },
    bufferPages: true,
  });
  let neighbour = _DATA.neighbour ? _DATA.neighbour.split(";") : [" ", " "]

  doc.pipe(fs.createWriteStream('./docs/public/output_nomenclature.pdf'));

  doc.fontSize(9);
  doc.font('Helvetica');

  doc.text('\n\n');

  doc.text(`${curaduriaInfo.pronoum} ${curaduriaInfo.job}, ${curaduriaInfo.title.toUpperCase()} ${curaduriaInfo.master.toUpperCase()}, en uso de sus facultades legales, especialmente las conferidas por la Ley 388 de 1997, el Decreto N° 1077 de 2015, el Decreto municipal N° 0068 de 2016 y demás disposiciones legales vigentes expide:`, { align: 'center' })

  let fill_color = '#fcc8f6'
  doc.text('\n');
  doc.fontSize(12);
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 35, h: 1, text: 'BOLETÍN DE NOMENCLATURA ', config: { align: 'right', bold: true, hide: true, } },
      { coord: [35, 0], w: 60, h: 1, text: ' ', config: { align: 'left', hide: true, fill: fill_color } },
      { coord: [35, 0], w: 25, h: 1, text: _DATA.id_public, config: { align: 'left', bold: true, hide: true, fill: fill_color } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  doc.text('\n');
  pdfSupport.table(doc,
    [
      { coord: [-10, 0], w: 80, h: 1, text: ' ', config: { align: 'left', hide: true, fill: fill_color } },
      { coord: [0, 0], w: 60, h: 1, text: _DATA.type, config: { align: 'center', bold: true, hide: true, fill: fill_color } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  doc.text('\n');
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'PREDIO N°', config: { align: 'left', hide: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.predial || ' ', config: { align: 'left', bold: true, hide: true, } },
    ],
    [doc.x, doc.y], [60, 2], { lineHeight: -1 })

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'BARRIO:', config: { align: 'left', hide: true, } },
      { coord: [20, 0], w: 40, h: 1, text: neighbour[0] || ' ', config: { align: 'left', bold: true, hide: true, } },
    ],
    [doc.x, doc.y], [60, 2], { lineHeight: -1 })

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'SOLICITANTE:', config: { align: 'left', hide: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.name + ' ' + _DATA.surname, config: { align: 'left', bold: true, hide: true, } },
    ],
    [doc.x, doc.y], [60, 2], { lineHeight: -1 })

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: 'NOMENCLATURA', config: { align: 'center', hide: true, bold: true } },
    ],
    [doc.x, doc.y], [60, 2], { lineHeight: -1 })

  doc.fontSize(10);
  doc.font('Helvetica')
  let _DETAILS_ARRAY = _DATA.details.split('\n');

  if (_DETAILS_ARRAY.length < 10) _DETAILS_ARRAY.map(detail => pdfSupport.table(doc,
    [
      { coord: [-10, 0], w: 80, h: 1, text: ' ', config: { align: 'left', hide: true, fill: fill_color } },
      { coord: [0, 0], w: 60, h: 1, text: detail, config: { align: 'center', hide: true, fill: fill_color } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 }))

  if (_DETAILS_ARRAY.length >= 10 && _DETAILS_ARRAY.length < 20) {
    let _DETAILS_ARRAY_2 = [];
    let array_sp = []

    _DETAILS_ARRAY.map((detail, i) => {
      if (i % 2 == 0) array_sp.push(detail)
      else {
        array_sp.push(detail)
        _DETAILS_ARRAY_2.push(array_sp)
        array_sp = []
      }
      if (i == _DETAILS_ARRAY.length - 1 && i % 2 == 0) {
        _DETAILS_ARRAY_2.push(array_sp)
      }
    })

    _DETAILS_ARRAY_2.map(detail => pdfSupport.table(doc,
      [
        { coord: [-10, 0], w: 80, h: 1, text: ' ', config: { align: 'left', hide: true, fill: fill_color } },
        { coord: [0, 0], w: 30, h: 1, text: detail[0], config: { align: 'center', hide: true, fill: fill_color, } },
        { coord: [30, 0], w: 30, h: 1, text: detail[1], config: { align: 'center', hide: true, fill: fill_color, } },
      ],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 }))
  }

  if (_DETAILS_ARRAY.length >= 20) {
    let _DETAILS_ARRAY_3 = [];
    let array_sp = []

    _DETAILS_ARRAY.map((detail, i) => {
      let index = i + 1;
      array_sp.push(detail)
      if (index % 3 == 0) {
        _DETAILS_ARRAY_3.push(array_sp)
        array_sp = []
      }
    })
    _DETAILS_ARRAY_3.push(array_sp)

    _DETAILS_ARRAY_3.map(detail => pdfSupport.table(doc,
      [
        { coord: [-10, 0], w: 80, h: 1, text: ' ', config: { align: 'left', hide: true, fill: fill_color, } },
        { coord: [0, 0], w: 20, h: 1, text: detail[0], config: { align: 'center', hide: true, fill: fill_color, } },
        { coord: [20, 0], w: 20, h: 1, text: detail[1], config: { align: 'center', hide: true, fill: fill_color, } },
        { coord: [40, 0], w: 20, h: 1, text: detail[2], config: { align: 'center', hide: true, fill: fill_color, } },
      ],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 }))
  }
  
  doc.text('\n');
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'DESTINO:', config: { align: 'left', hide: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.use, config: { align: 'left', bold: true, hide: true, } },
    ],
    [doc.x, doc.y], [60, 2], { lineHeight: -1 })

  doc.fontSize(8);
  doc.font('Helvetica');
  doc.text('Notas: ', { align: "left" });
  let note_i = 0;
  if (_DATA.note) {
    note_i++
    doc.text(`${note_i}. ${_DATA.note}`, { align: 'left' });
  }

  note_i++
  doc.text(`${note_i}. Esta certificación no legaliza ningún tipo de construcción, ni reemplaza la licencia de construcción en ninguna de sus modalidades.`, { align: "left" });

  note_i++
  doc.text(`${note_i}. Las empresas de servicios públicos, ante cualquier trámite deben tener en cuenta el original del presente documento con su respetivo sello seco y su destinación.`, { align: "left" });

  doc.fontSize(10);
  doc.text('\n');
  doc.font('Helvetica-Bold')
  doc.text('Atentamente,');
  doc.text('\n');
  pdfSupport.setSign(doc)
  pdfSupport.setHeader(doc, { title: 'BOLETIN DE NOMENCLATURA', id_public: _DATA.cub, icon: true });
  pdfSupport.setBottom(doc, true, true);


  doc.end();
  return true;
}

// THE SAME AS BEFORE BUT IS A RECURSIVE FUNCTION THAT WILL RETURN ITSEL UNTIL IT CAN PRINT THE DATA IN A TOTAL OF 
// 3 COLUMNS, UP UNTIL A LIMIT OF A 3 COLUMNS & 1000 UNITS OF HEIGH
function inteligenBlock(doc, Y, _data, _columns, _height) {
  var X = 56;
  var _Y = Y

  var c_heigh = doc.heightOfString(_data, {
    align: 'center',
    columns: _columns,
    height: _height,
    width: 500 - 10,
    lineBreak: true,
  });
  var box_height = Math.ceil(c_heigh / _columns)
  doc.text(_data, X + 3, _Y + 5, {
    align: 'center',
    columns: _columns,
    height: _height,
    width: 500 - 10,
    lineBreak: true,
  });

  doc.lineJoin('miter')
    .rect(X, _Y, 500, box_height + 5)
    .stroke()

  doc.text('', X, _Y + box_height + 5);
  return doc
}

// SEPARATE BLOCK TEXT
function calculateBlock_text(doc, _data, _height = 450, _columns = 1) {
  var _height_limit = _height;
  var c_heigh = doc.heightOfString(_data, {
    align: 'center',
    columns: _columns,
    height: _height,
    width: 500 - 10,
    lineBreak: true,
  });
  var box_height = Math.ceil(c_heigh / _columns)
  if (box_height < _height_limit) return [_data.split('\n').length, _columns, box_height];
  else if (box_height > _height_limit && _columns < 3) return calculateBlock_text(doc, _data, _height_limit, _columns + 1);
  else if (box_height > _height_limit && _columns >= 3) {
    var new_data = _data.split('\n');
    new_data.pop();
    return calculateBlock_text(doc, new_data.join('\n'), _height_limit, _columns);
  }

}

// WORKS IN A SIMILAR WAY OF row BUT WILL CREATE ONLY A 2 COLUMN ROW, THE SECOND COLUMN WILL HAVE BOLD TEXT AND HAVE 2/3 OF THE TOTAL WIDTH
// IF A _data SET WIT MORE TAN 2 LENGTH IS GIVE, IS GOING TO IGNORE THE REST, WILL ONLY TAKE THE FIRST TWO VALUES OF THE ARRAY
function rowpair(doc, Y, _data, _width = 500, _align = 'left', X = 56) {
  var cell_width = Math.trunc(_width / 3);
  var cell_heigh = 0;
  var _Y = Y
  var currentPage = doc.bufferedPageRange().count;


  var i_heigh = doc.heightOfString(_data[0], {
    align: _align,
    columns: 1,
    width: cell_width - 10,
  });
  if (i_heigh > cell_heigh) cell_heigh = i_heigh;

  _Y = checkForPageJump(doc, currentPage);

  i_heigh = doc.heightOfString(_data[1], {
    align: _align,
    columns: 1,
    width: cell_width * 2 - 10,
  });
  if (i_heigh > cell_heigh) cell_heigh = i_heigh;

  _Y = checkForPageJump(doc, currentPage);

  doc.font('Helvetica');
  doc.text(_data[0], X + 3, _Y + 5, {
    align: _align,
    columns: 1,
    width: cell_width - 10,
  });

  doc.font('Helvetica-Bold');
  doc.text(_data[1], X + cell_width + 3, _Y + 5, {
    align: _align,
    columns: 1,
    width: cell_width * 2 - 10,
  });

  /*
  doc.lineJoin('miter')
    .rect(X, _Y, cell_width, cell_heigh + 5)
    .stroke()
  doc.lineJoin('miter')
    .rect(X + cell_width, _Y, cell_width * 2, cell_heigh + 5)
    .stroke()
*/

  doc.text('', X, _Y + cell_heigh + 5);
  return doc
}

// MAKE A SIMPLE CELL WITH A STRING TEXT INSIDE
function cell(doc, Y, text, _width = 500, _align = 'left', X = 56) {
  var cell_heigh = 0;
  var _Y = Y
  var currentPage = doc.bufferedPageRange().count;
  var i_heigh = doc.heightOfString(text, {
    align: _align,
    columns: 1,
    width: _width - 10,
  });
  if (i_heigh > cell_heigh) cell_heigh = i_heigh;

  _Y = checkForPageJump(doc, currentPage);

  doc.text(text, X + 3, _Y + 5, {
    align: _align,
    columns: 1,
    width: _width - 10,
  });


  doc.lineJoin('miter')
    .rect(X, _Y, _width, cell_heigh + 5)
    .stroke()

  doc.text('', X, _Y + cell_heigh + 5);

}

// THERE IS A BUG IN PDKIT THAT MAKES THE DOCUMENT DO VARIOUS PAGE JUMPS WHEN PRINTING COLUMSN NEAR THE END OF THE PAGE
// THIS BASICALL CHECKS THAT CASE EDGE AND PRINTS THE COLUMN CORRECTLY
function checkForPageJump(doc, currentPage) {
  var pageIndex = doc.bufferedPageRange().count;
  if (pageIndex > currentPage) {
    doc.addPage();
    return doc.page.margins.top;
  }
  return doc.y
}

function dateParser(date) {
  const moment = require('moment');
  let esLocale = require('moment/locale/es');
  var momentLocale = moment(date, 'YYYY-MM-DD').locale('es', esLocale);
  return momentLocale.format("LL")
}
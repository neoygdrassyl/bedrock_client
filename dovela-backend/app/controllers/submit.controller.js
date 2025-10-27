const db = require("../models");
const Submit = db.submit;
const Solicitors = db.solicitors;
const SubmitSolicitor = db.submitSolicitor;
const Sub_List = db.sub_list;
const Sub_Doc = db.sub_docs;
const FUN_0 = db.fun_0;
const Op = db.Sequelize.Op;
const moment = require('moment');
const fs = require('fs');
const { getLastVRQuery, validateNewVR, validateLastVR } = require("../config/generalQueries");


// POST
exports.create = (req, res) => {

  const id_public = (req.body.id_public ? req.body.id_public : res.send('NOT A REAL ID'));
  const id_related = req.body.id_related ? req.body.id_related : '';
  const object = {
    id_public: id_public,
    id_related: (req.body.id_related ? req.body.id_related : null),
    type: (req.body.type ? req.body.type : null),
    date: (req.body.date ? req.body.date : null),
    time: (req.body.time ? req.body.time : null),
    owner: (req.body.owner ? req.body.owner : null),
    worker_reciever: (req.body.worker_reciever ? req.body.worker_reciever : null),
    worker_id: (req.body.worker_id ? req.body.worker_id : null),
    name_retriever: (req.body.name_retriever ? req.body.name_retriever : null),
    id_number_retriever: (req.body.id_number_retriever ? req.body.id_number_retriever : null),
    details: (req.body.details ? req.body.details : null),
    list_type: (req.body.list_type ? req.body.list_type : null),
    list_type_str: (req.body.list_type_str ? req.body.list_type_str : null),
  };

  let payment = req.body.id_payment;

  const { QueryTypes } = require('sequelize');
  var query = validateNewVR(id_public)

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      if (data.length) res.send("ERROR_DUPLICATE");
      else nextStep()
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });

  function nextStep() {
    if (payment) createFUN()
    else createSubmit()
  }


  function createFUN() {
    const { QueryTypes } = require('sequelize');
    var query = `
    SELECT fun_0s.id_public
    FROM fun_0s
    WHERE fun_0s.id_public LIKE '${id_related}'
    `;

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length) res.send("ERROR_DUPLICATE");
        else create_FUN_0()
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving ALL DATA."
        });
      });
  }

  function create_FUN_0() {
    // Create
    var new_fun = {
      version: 1,
      state: 1,
      id_public: (req.body.id_related ? req.body.id_related : null),
      date: (req.body.date ? req.body.date : moment().format('YYYY-MM-DD')),
      id_payment: (req.body.id_payment ? req.body.id_payment : null),
      model: moment().format('YYYY')
    }

    FUN_0.create(new_fun)
      .then(data => {
        createSubmit()
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function createSubmit() {
    // Create
    Submit.create(object)
      .then(data => {
        createSubmitSolicitors(data.id, object.id_number_retriever)
        res.send('OK');
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });

  }
  //Relation with solicitors
  async function createSubmitSolicitors(submitId, solicitorId) {
    const submit_Id = submitId
    try {
      // Get solicitor id pk
      const solicitor = await Solicitors.findOne({
        where: {
          id_doc: solicitorId
        }
      });
      if (!solicitor) return res.status(400).send({ message: 'Solicitor not found' });
      const object = {
        solicitorId: solicitor.id,
        submitId: submit_Id
      }
      SubmitSolicitor.create(object)
        .then(data => {
          res.send('OK');
        })
    } catch (error) {

    }
  }
};
exports.create_list = (req, res) => {
  const submitId = (req.body.submitId ? req.body.submitId : res.send('NOT A REAL ID'));

  const object = {
    submitId: submitId,
    list_name: (req.body.list_name ? req.body.list_name : ""),
    list_category: (req.body.list_category ? req.body.list_category : ""),
    list_code: (req.body.list_code ? req.body.list_code : ""),
    list_pages: (req.body.list_pages ? req.body.list_pages : ""),
    list_review: (req.body.list_review ? req.body.list_review : ""),
    list_title: (req.body.list_title ? req.body.list_title : ""),
  };

  // Create
  Sub_List.create(object)
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

  const submitId = (req.body.submitId ? req.body.submitId : res.send('NOT A REAL ID'));
  const file = req.files[0];

  var mimetype = file.mimetype;
  if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
    fs.unlink(file.path, (err) => {
      console.log('FILE NOT COMPATIBLE, DETELED!');
      if (err) res.send(err);
    });
    res.send('ERROR_FILE')
  }

  const object = {
    submitId: submitId,
    pages: (req.body.pages ? req.body.pages : null),
    id_public: (req.body.id_public ? req.body.id_public : null),
    filename: file.filename,
    path: file.path.substring(0, file.path.lastIndexOf('/'))
  };

  // Create
  Sub_Doc.create(object)
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
  Submit.findAll({ include: [Sub_Doc, {
    model: Sub_List,
    require: false,
    attributes: ["list_pages"]
  }] })
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
  const _id_related = req.params.id_related;
  Submit.findAll({
    include: [Sub_List, Sub_Doc],
    where: {
      id_related: _id_related
    },
  })
    .then(data => {
      const sortedOptions = data.sort((a, b) => {
        const [vrA, numA] = a.id_public.match(/\d+/g).map(Number); // Extract numbers
        const [vrB, numB] = b.id_public.match(/\d+/g).map(Number);
      
        if (vrA === vrB) {
          return numA - numB; // Sort by second number if VR numbers are equal
        }
        return vrA - vrB; // Sort by VR number
      });

      res.send(sortedOptions);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
};

// GET BY ID
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    Submit.findByPk(id, {
      include: [Sub_List, Sub_Doc, {
        model: SubmitSolicitor,
        include: Solicitors // Incluir los solicitantes asociados
      }]
    }).then(data => {
      res.send(data)
    }
    )
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving DATA with ID=" + id
    });
  }
};




exports.findSearch = (req, res) => {
  const _field = req.params.field;
  const _string = req.params.string;

  console.log("CONSULT REQUESTED, FOR NOMENCLATURE, FOR FIELD CODE & STRING VALUE: ", _field, _string);

  if (_field == 1) {
    Submit.findAll({
      where: {
        id_public: _string
      },
      include: [Sub_Doc, {
        model: SubmitSolicitor,
        include: Solicitors // Incluir los solicitantes asociados
      }]
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
    Submit.findAll({
      where: {
        id_related: _string
      },
      include: [Sub_Doc]
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
    Submit.findAll({
      where: {
        owner: { [Op.like]: `%` + _string + `%` }
      },
      include: [Sub_Doc]
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
    Submit.findAll({
      where: {
        name_retriever: { [Op.like]: `%` + _string + `%` }
      },
      include: [Sub_Doc]
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
    Submit.findAll({
      where: {
        id_number_retriever: { [Op.like]: `%` + _string + `%` }
      },
      include: [Sub_Doc]
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

exports.findLastID = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = getLastVRQuery;

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

exports.verifyRelatedId = (req, res) => {
  const _id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT fun_0s.id_public AS id_public
  FROM fun_0s
  WHERE fun_0s.id_public LIKE '${_id}'
  
  UNION
  
  SELECT pqrs_masters.id_publico
  FROM pqrs_masters
  WHERE pqrs_masters.id_publico LIKE '${_id}'
  
  UNION
  
  SELECT nomenclatures.id_public 
  FROM nomenclatures
  WHERE nomenclatures.id_public LIKE '${_id}'
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

  const new_id = (req.body.new_id);
  const prev_id = (req.body.prev_id);

  if (new_id) {
    req.body.id_public = new_id;

    const { QueryTypes } = require('sequelize');
    var query = validateLastVR(new_id, prev_id)

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
  }
  Submit.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update_list = (req, res) => {
  const id = req.params.id;

  Sub_List.update(req.body, {
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
    Sub_Doc.findAll({
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
    Sub_Doc.update(req.body, {
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
  Submit.destroy({
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
exports.delete_list = (req, res) => {
  const id = req.params.id;
  Sub_List.destroy({
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



exports.gendoc_submit = (req, res) => {
  // Create
  var _DATA = {
    id: (req.body.id != 'null' ? req.body.id : ""),
  }

  Submit.findByPk(_DATA.id, { include: [Sub_List, Sub_Doc] })
    .then(data => {
      _PDFGEN_NOMENCLATURE(data);
      res.send('OK');
    })
    .catch(err => {
      res.status(500).send({
        message: err
      });
    });
};


function _PDFGEN_NOMENCLATURE(_DATA) {
  const PDFDocument = require('pdfkit');
  const pdfSupport = require("../config/pdfSupport.js");
  const curaduriaInfo = require('../config/curaduria.json')
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 56,
      left: 56,
      right: 56
    },
    bufferPages: true,
  });

  let type_sumbit = ['OTRO', 'RADICACIÓN', 'ASESORÍA TÉCNICA', 'CORRECCIONES SOLICITUD']

  doc.pipe(fs.createWriteStream('./docs/public/output_submit.pdf'));

  doc.font('Helvetica-BoldOblique');
  doc.image('docs/public/logo192.png', doc.x + 25, 50, { width: 45, height: 45 })
  doc.fontSize(12).text(curaduriaInfo.name, doc.x, 55, { align: 'center' });
  doc.fontSize(12).text(`${(curaduriaInfo.title)} ${(curaduriaInfo.master)}`, doc.x, 68, { align: 'center' });

  doc.fontSize(14);
  doc.text('\n\n', 56, doc.y);
  doc.font('Helvetica-BoldOblique');
  doc.text(`CONTROL DE INGRESO DE DOCUMENTOS A LOS EXPEDIENTES`, { align: 'center' });
  doc.text(`GESTIÓN DOCUMENTAL`, { align: 'center' });

  doc.fontSize(10);
  doc.text('\n');
  rowpair(doc, doc.y, ['CONSECUTIVO RADICACIÓN: ', _DATA.id_public])
  rowpair(doc, doc.y, ['SOLICITUD N°: ', _DATA.id_related])
  rowpair(doc, doc.y, ['TIPO DE ACTUACIÓN: ', _DATA.type])
  rowpair(doc, doc.y, ['TIPO DE RADICACIÓN: ', `${type_sumbit[_DATA.list_type] || ""}`])
  rowpair(doc, doc.y, ['ESTADO: ', `${_DATA.list_type_str ? _DATA.list_type_str : ""}`])
  rowpair(doc, doc.y, ['FECHA INGRESO: ', `${_DATA.date} ${_DATA.time ? _DATA.time : ""}`])
  rowpair(doc, doc.y, ['PROPIETARIO(S): ', `${_DATA.owner || ''}`])
  doc.page

  var _LIST = _DATA.sub_lists;
  doc.fontSize(8);
  doc.text('\n');
  for (var i = 0; i < _LIST.length; i++) {
    doc.font('Helvetica-Bold')
    row12Cols(doc, doc.y, ['NOMENCLATURA', 'COD', _LIST[i].list_title, 'SI/NO', '# DE FOLIOS / PLANOS'], [1, 1, 6, 1, 1], false, true);
    //row(doc, doc.y, ['NOMENCLATURA', 'COD', _LIST[i].list_title, 'SI/NO', '# DE FOLIOS / PLANOS']);
    doc.font('Helvetica');

    let name = _LIST[i].list_name.split(";")
    let category = _LIST[i].list_category.split(",")
    let code = _LIST[i].list_code.split(",")
    let page = _LIST[i].list_pages.split(",")
    let review = _LIST[i].list_review.split(",")

    let items = name.length;
    for (var j = 0; j < items; j++) {
      if (review[j] == "SI") row12Cols(doc, doc.y, [category[j], code[j], name[j], review[j], page[j]], [1, 1, 6, 1, 1], true);
      //row(doc, doc.y, [category[j], code[j], name[j], review[j], page[j]]);
    }
    doc.text('\n', 56, doc.y);
  }
  if (_DATA.details) {
    row12Cols(doc, doc.y, ['DETALLES'], [10], false, true,);
    row12Cols(doc, doc.y, [_DATA.details], [10], false, false, 450, 'left');
  }

  if (String(_DATA.list_type_str).toUpperCase() == 'DESISTIDO' || String(_DATA.list_type_str).toUpperCase() == 'DESISTIDA') {
    let TEXT_NEG = `NOTA: Se advierte que la solicitud para la cual se está radicando se encuentra desistida. Se sugirió inicialmente revisar si se encuentra en el término para interponer el recurso de reposición (10 días hábiles desde la notificación) y en esos términos radicar. La sugerencia anterior no es recibida, por lo cual, ante la insistencia de quien radica, se recibe la documentación, pero esta no se gestionará para el proyecto desistido, quedando dentro de los documentos que conforman el expediente y que deberán ser retirados durante treinta (30) días calendario, contados a partir de la fecha en que quede en firme el acto administrativo, so pena de su eliminación.`;
    doc.font('Helvetica');
    doc.fontSize(8)
    row12Cols(doc, doc.y, [TEXT_NEG], [10], false, false, 450, 'justify');
  }




  doc.text('\n', 56, doc.y);
  const signature_y = doc.y
  rowpair(doc, doc.y, ['FUNCIONARIO QUE RECIBE: ', _DATA.worker_reciever], 300)
  rowpair(doc, doc.y, ['PERSONA QUE ENTREGA: ', _DATA.name_retriever], 300)
  rowpair(doc, doc.y, ['CEDULA DE CIUDADANIA: ', _DATA.id_number_retriever], 300)

  var text = '\n\n\n\nFirma'
  doc.text(text, 396, signature_y, {
    align: 'center',
    columns: 1,
    width: 140 - 10,
  });
  var signature_heigh = doc.heightOfString(text, {
    align: 'center',
    columns: 1,
    width: 140 - 10
  });
  doc.lineJoin('miter')
    .rect(396, signature_y, 140, signature_heigh + 3)
    .stroke()


  pdfSupport.setBottom(doc, false, true)


  doc.end();
  return true;
}

// CREATES ROW WITH EACH COLUMNS HAVING A FIXED WIDTH EQUALS TO THE PROPORTION IN _cols BASED ON THE BOOTSTRAP MODEL
// THAT MEANS THAT IT WILL DIVIVED THE WIDTH IN 10 SEGMENTS AND GIVE EACH COLUMN A WIDTH BASED ON HOW MANY _cols[i] IS GIVEN
// SO _cols[1,2,3] IS GOING TO CREATED 3 COLUMNS, THE FIRST ONLY 1 SEGMEN WIDTH, THE SECOND WITH 2 SEGMENT WIDTH AND THE THIRD WITH
// 3 SEGMENT WIDTH
// _data AND _cols MUST BE OF THE SAME LENGTH, OTHER WISE IS GOING TO IGNORE ANYTHING PASS THE LENGTH OF _cols
function row12Cols(doc, Y, _data, _cols, edge_case = false, pretty_cell = false, _width = 450, _align = 'center', X = 85) {
  var cells_width = [];
  var cols = _cols.length;
  for (var i = 0; i < cols; i++) {
    cells_width.push(Math.trunc(_width / 10 * _cols[i]))
  }
  var cell_heigh = 0;
  var _Y = Y

  for (var i = 0; i < cols; i++) {
    var i_heigh = doc.heightOfString(_data[i], {
      align: edge_case && i == 2 ? 'left' : _align,
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
        .rect(X + getXforCol(_width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
        .fill("silver", 0.3)
        .stroke();
    }
    doc.lineJoin('miter')
      .lineWidth(0.6)
      .rect(X + getXforCol(_width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
      .fillColor("black", 1)
      .strokeColor("black", 1)
      .stroke()
  }

  for (var i = 0; i < cols; i++) {
    doc.text(_data[i], X + getXforCol(_width, _cols, i) + 3, _Y + 5, {
      align: edge_case && i == 2 ? 'left' : _align,
      columns: 1,
      width: cells_width[i] - 5,
    });
  }

  doc.text('', X, _Y + cell_heigh + 5);
  return doc
}

// WORKS IN A SIMILAR WAY OF row BUT WILL CREATE ONLY A 2 COLUMN ROW, THE SECOND COLUMN WILL HAVE BOLD TEXT AND HAVE 2/3 OF THE TOTAL WIDTH
// IF A _data SET WIT MORE TAN 2 LENGTH IS GIVE, IS GOING TO IGNORE THE REST, WILL ONLY TAKE THE FIRST TWO VALUES OF THE ARRAY
function rowpair(doc, Y, _data, _width = 450, _align = 'left', X = 85) {
  var cell_width = Math.trunc(_width / 3);
  var cell_heigh = 0;
  var _Y = Y

  var i_heigh = doc.heightOfString(_data[0], {
    align: _align,
    columns: 1,
    width: cell_width - 10,
  });
  if (i_heigh > cell_heigh) cell_heigh = i_heigh;

  _Y = checkForPageJump(doc, cell_heigh, _Y);

  i_heigh = doc.heightOfString(_data[1], {
    align: _align,
    columns: 1,
    width: cell_width * 2 - 10,
  });
  if (i_heigh > cell_heigh) cell_heigh = i_heigh;

  _Y = checkForPageJump(doc, cell_heigh);

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

  doc.lineJoin('miter')
    .lineWidth(0.6)
    .rect(X, _Y, cell_width, cell_heigh + 5)
    .stroke()
  doc.lineJoin('miter')
    .lineWidth(0.6)
    .rect(X + cell_width, _Y, cell_width * 2, cell_heigh + 5)
    .stroke()

  doc.text('', X, _Y + cell_heigh + 5);
  return doc
}

// THERE IS A BUG IN PDFKIT THAT MAKES THE DOCUMENT DO VARIOUS PAGE JUMPS WHEN PRINTING COLUMSN NEAR THE END OF THE PAGE
// THIS BASICALLy CHECKS THAT CASE EDGE AND PRINTS THE COLUMN CORRECTLY
function checkForPageJump(doc, cell_heigh, _Y) {
  if (_Y + cell_heigh + 5 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    return doc.page.margins.top;
  }
  return doc.y
}


// SUPPORTING FUNCTIONS FOR row12Cols
function getXforCol(_width, _cols, index) {
  var X = 0;
  var cols = _cols.length;
  for (var i = 0; i < cols; i++) {
    if (i == index) return X
    X += Math.trunc(_width / 10 * _cols[i])
  }
  return X
}
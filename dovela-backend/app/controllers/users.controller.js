const db = require("../models");
const Users = db.users;
const Roles = db.roles;
const Cert = db.certification;
const Op = db.Sequelize.Op;
const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");
const moment = require('moment');
const { profHistory } = require("../config/generalQueries");
const curaduriaInfo = require('../config/curaduria.json')
// POST
exports.create = (req, res) => {
  res.json({ message: "This is USERS CREATE!" });
};

// GET.
exports.findAll = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT users.name, users.surname, users.email, users.id, users.roleId, roles.name AS role_name, users.active
  FROM users 
  INNER JOIN roles ON roles.id = users.roleId
  ORDER BY users.surname ASC
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
  let _attributes = ['name', 'surname', 'active', 'roleId'];
  const id = req.params.id;
  Users.findByPk(id, { attributes: _attributes })
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
  res.json({ message: "This is USERS PUT!" });
};

// DELETE BY ID
exports.delete = (req, res) => {
  res.json({ message: "This is USERS DELETE BY ID!" });
};

// DELETE ALL
exports.deleteAll = (req, res) => {
  res.json({ message: "This is USERS DELETE ALL!" });
};

// Find all published Entries
exports.findAllPublished = (req, res) => {
  res.json({ message: "This is USERS FIND PUBLISHED!" });
};

// User Login Verification
exports.appLogin = (req, res) => {
  const _email = req.body.email;
  const _pass = req.body.password;

  Users.findAll({
    where: { email: _email, password: _pass, active: 1 },
    attributes: ['id', 'name', 'surname', 'name_2', 'surname_2', 'active', 'roleId'],
    include: [{ model: Roles, attributes: ['name', 'desc', 'short'], required: true }],
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving DATA for LOGIN: " + err
      });
    });
};

// RETURN A DAMM JSON LIST
exports.getRepositoryList = (req, res) => {
  const repositoryList = require('../../docs/public/repositoryList.json')

  res.send(repositoryList);
};

exports.loadWorkers = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT
  users.id,
  users.name,
  users.name_2,
  users.surname,
  users.surname_2,
  users.active,
  GROUP_CONCAT(roles.name SEPARATOR ';') AS rolesNames

  FROM users

  INNER JOIN roles ON roles.id = users.roleId

  WHERE (
    roles.id = 4
    OR roles.id = 5
    OR roles.id = 6
    OR roles.id = 2
    )

  GROUP BY users.id
  `;
  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred." });
    });
};

exports.loadAppointments = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT
  users.id,
  users.name,
  users.name_2,
  users.surname,
  users.surname_2,
  GROUP_CONCAT(roles.name SEPARATOR ';') AS rolesNames

  FROM users

  INNER JOIN roles ON roles.id = users.roleId

  WHERE (
    roles.id = 4
    OR roles.id = 5
    OR roles.id = 6
    OR roles.id = 2
    )

    AND users.active = 1
    AND users.appoinments = 1

  GROUP BY users.id
  `;
  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred." });
    });
};

exports.loadCertificate = (req, res) => {
  // 1096200598  1.095.801.860 1095801860 1022923768
  const _id_number = req.params.id_number;
  const _password = req.params.password;
  let _DATA;
  if (_password == 1) createCert();
  if (_password == 2) validateCert();

  function validateCert() {
    const { QueryTypes } = require('sequelize');
    var query = `
  SELECT certifications.description, certifications.content 
  FROM certifications
  WHERE certifications.id_public LIKE 'OC ${_id_number}'
  `;
    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length == 0) res.send('NO2');
        res.send(data[0]);
      })
      .catch(err => {
        res.status(500).send({ message: err.message || "Some error occurred." });
      });
  }

  function createCert() {
    const { QueryTypes } = require('sequelize');
    var query = profHistory(_id_number);
    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length == 0) res.send('NO2');
        _DATA = data;
        _PDFGEN_CERTIFICATE_CUB1(_DATA, res);
        res.send('OK');
      })
      .catch(err => {
        res.status(500).send({ message: err.message || "Some error occurred." });
      });
  }

};

exports.loadCertificateData = (req, res) => {
  // 1096200598  1.095.801.860 1095801860 1022923768
  const _id_number = req.params.id_number;

  const { QueryTypes } = require('sequelize');
  var query = profHistory(_id_number);
  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      if (data.length == 0) res.send('NO');
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred." });
    });

};

exports.loadCertificateDataPDF = (req, res) => {
  const _id_number = req.params.id_number;
  const { QueryTypes } = require('sequelize');
  var query = profHistory(_id_number);
  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      if (data.length == 0) res.send('NO2');
      _DATA = data;
      _PDFGEN_CERTIFICATE(_DATA, res);
      res.send('OK');
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred." });
    });
}

function _PDFGEN_CERTIFICATE_CUB1(_DATA, res) {
  let esLocale = require('moment/locale/es');
  var id_public = 'OC ' + moment().format('YY-MMDDHHmmss');
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


  var name = "";
  var id_number = "";
  var registration = "";
  for (let i = 0; i < 1; i++) {
    const element = _DATA[i];
    name = (element.name + " " + element.surname).toUpperCase();
    id_number = element.id_number;
    registration = element.registration;
  }

  create_cert(id_public, `CERTIFICACION DE PROFESIONAL: ${name}`, JSON.stringify(_DATA), res);

  const BODY = `En uso de sus facultades legales otorgadas por el Decreto Municipal No. 0070 del 4 de Junio de 2021 y el
  Acta de Posesión No 0125 del 7 de Junio de 2021, ley 400 de 1997, el Decreto 1077 de 2015 del
  Ministerio de Vivienda, Ciudad y Territorio y La Resolución número 0015 de 15 de octubre de 2015 de la
  Comisión Asesora Permanente del régimen de construcciones Sismo resistentes,`.replace(/[\n\r]+ */g, ' ');

  const BODY2 = `Consultada la base de datos de la Curaduría urbana uno de Bucaramanga el señor ${name}
  identificado con la cédula de ciudadanía número ${id_number}, en su calidad de arquitecto/ingeniero con matrícula profesional ${registration}, 
  figura como profesional en la(s) siguiente(s) solicitud(es) de actuacion(es) urbanística(s),`.replace(/[\n\r]+ */g, ' ');

  const BODY3 = `El alcance de esta certificación corresponde a señalar que el profesional participó en el proceso de licenciamiento urbanístico y
  su nombre, matricula profesional y firma está consignada en el formulario único nacional con el cual se tramitó la solicitud y es el
  responsable de los documentos técnicos propios de la calidad en que actúa y de la información contenido en ellos.`.replace(/[\n\r]+ */g, ' ');

  const BODY4 = `Se advierte que la presente certificación no crea ningún tipo de obligación laboral o civil frente al profesional, 
  ni frente a terceros, por parte del suscrito.`.replace(/[\n\r]+ */g, ' ');

  const BODY5 = `Se advierte que la presente certificación no desborda el alcance ya descrito, no crea ningún tipo de obligación 
  laboral o civil frente al profesional, ni frente a terceros, por parte del suscrito; tampoco señala, acredita o valida la 
  experiencia profesional que según la precitada normatividad, es competencia de los Consejos nacionales profesionales de 
  Ingeniera (COPNIA) y de Arquitectura (CPNAA) la respectiva validación.`.replace(/[\n\r]+ */g, ' ');


  doc.pipe(fs.createWriteStream('./docs/public/certificate.pdf'));

  doc.fontSize(10);
  doc.font('Helvetica-Bold')
  doc.text('EL CURADOR URBANO UNO DE BUCARAMANGA', { align: 'center' });
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(BODY, { align: 'justify' });
  doc.font('Helvetica-Bold')
  doc.text('\nCERTIFICA QUE:\n\n', { align: 'center' });
  doc.font('Helvetica')
  doc.text(BODY2, { align: 'justify' });

  doc.font('Helvetica-Bold')
  doc.text('\n');
  doc.fontSize(7);
  pdfSupport.rowConfCols(doc, doc.y,
    ['Solicitud', 'Actuación Urbanistica', 'Fecha Radicación', 'Fecha Expedición', 'En calidad de:'],
    [2, 3, 1, 1, 3],
    { align: 'center', pretty: true, width: 440, X: 86 },
  )
  doc.font('Helvetica')

  for (let i = 0; i < _DATA.length; i++) {
    const element = _DATA[i];
    var type = element.fun_1 ? element.fun_1.split('&') : [];
    var suType = type[type.length - 1] ? type[type.length - 1].split(';') : [];
    var typeObject = {
      tipo: suType[0],
      tramite: suType[1],
      m_urb: suType[2],
      m_sub: suType[3],
      m_lic: suType[4]
    }

    var state = element.states ? element.states.split(',') : [];
    var date = element.dates ? element.dates.split(',') : [];
    var date_start = '';
    var date_end = '';
    var active = true;
    if (state.length) {
      if (state.includes('-1')) {
        var indexOf = state.indexOf('-1');
        date_start = date[indexOf];
      }
      if (state.includes('3')) {
        var indexOf = state.indexOf('3');
        date_start = date[indexOf];
      }
      if (state.includes('5')) {
        var indexOf = state.indexOf('5');
        date_start = date[indexOf];
      }
      if (state.includes('99')) {
        var indexOf = state.indexOf('99');
        date_end = date[indexOf]
        active = false;
      }
    }

    pdfSupport.rowConfCols2(doc, doc.y,
      [element.id_public, formsParser1(typeObject), date_start, date_end ? date_end : 'ACTIVO', element.roles,],
      [2, 3, 1, 1, 3],
      [{ align: 'center', bold: true },
      { align: 'left' },
      { align: 'center' },
      { align: 'center' },
      { align: 'left' }],
      { draw: true, width: 440, X: 86 }
    )
  }
  doc.fontSize(10);
  doc.text('\n');
  doc.text(BODY3, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY4, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY5, { align: 'justify' })
  doc.text('\n');
  doc.text(`Dada en Bucaramanga a la ${moment().format('D')} días del mes de ${moment().locale('es', esLocale).format('MMMM')} del año ${moment().format('yyyy')}.`);
  doc.text('\n');
  doc.font('Helvetica-Bold')
  doc.image('docs/public/user_signatures/' + 'luis_parra.png', { width: 180, height: 60 })
  doc.text(`ARQ. LUIS CARLOS PARRA SALAZAR`);
  doc.text('Curador Urbano Uno de Bucaramanga');
  doc.fontSize(6);
  doc.text('\n');
  doc.font('Helvetica-Oblique')
  doc.text('Podrá verificar la integridad e inalterabilidad de la presente certificación consultando en el sitio web www.curaduria1bucaramanga.com/certificacion indicando el número de certificado que se encuentra en la esquina superior derecha de este documento.');



  pdfSupport.setHeader(doc, { title: 'CERTIFICACIÓN', size: 13, icon: true, id_public: id_public })

  doc.end();
  return true;
}

function _PDFGEN_CERTIFICATE(_DATA, res) {
  let esLocale = require('moment/locale/es');
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


  var name = "";
  var id_number = "";
  var registration = "";
  for (let i = 0; i < 1; i++) {
    const element = _DATA[i];
    name = (element.name + " " + element.surname).toUpperCase();
    id_number = element.id_number;
    registration = element.registration;
  }

  const BODY = `A solicitud del interesado Ing./Arq. ${name}, identificado con matrícula profesional no. ${registration}. 
   ${curaduriaInfo.pronoum} ${curaduriaInfo.job}, verifica en la base de datos y se entrega el siguiente reporte de los proyectos tramitados y aprobados, 
   donde ha participado el profesional anteriormente mencionado.`.replace(/[\n\r]+ */g, ' ');

  const BODY2 = `El presente documento no constituye una certificación de experiencia profesional, de conformidad con lo establecido en el numeral 2. 'Calidades de los profesionales' de la Resolución 0017 del 4 de diciembre de 2017.`


  doc.pipe(fs.createWriteStream('./docs/public/prof_history.pdf'));

  doc.fontSize(12);
  doc.font('Helvetica')
  doc.text(`${curaduriaInfo.city}, ${moment().locale('es', esLocale).format('LL')}`, { align: 'left' });
  doc.text('\n');
  doc.fontSize(14);
  doc.font('Helvetica-Bold')
  doc.text('\n');
  doc.text(`${curaduriaInfo.pronoum} ${curaduriaInfo.job}`.toUpperCase(), { align: 'center' });
  doc.text(`${curaduriaInfo.master}`.toUpperCase(), { align: 'center' });
  doc.text('\n');
  doc.text(`EXPIDE:`, { align: 'center' });
  doc.fontSize(12);
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(BODY, { align: 'justify' });
  doc.text('\n');

  doc.fontSize(8);
  
  doc.startPage = doc.bufferedPageRange().count - 1;
  doc.lastPage = doc.bufferedPageRange().count - 1;
  doc.onActive = true;
  doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

  pdfSupport.table(doc, [
    { coord: [0, 0], w: 10, h: 1, text: 'SOLICITUD', config: { align: 'center', valign: true, bold: true, fiil: 'gainsboro', } },
    { coord: [10, 0], w: 20, h: 1, text: 'ACTUACIÓN URBANÍSTICA', config: { align: 'center', valign: true, bold: true,fiil: 'gainsboro', } },
    { coord: [30, 0], w: 10, h: 1, text: 'FECHA RADICACIÓN', config: { align: 'center', valign: true, bold: true,fiil: 'gainsboro', } },
    { coord: [40, 0], w: 10, h: 1, text: 'FECHA EXPEDICIÓN', config: { align: 'center', valign: true, bold: true,fiil: 'gainsboro', } },
    { coord: [50, 0], w: 10, h: 1, text: 'EN CALIDAD DE:', config: { align: 'center', valign: true, bold: true, fiil: 'gainsboro',} },
  ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  for (let i = 0; i < _DATA.length; i++) {
    const element = _DATA[i];
    var type = element.fun_1 ? element.fun_1.split('&') : [];
    var suType = type[type.length - 1] ? type[type.length - 1].split(';') : [];
    var typeObject = {
      tipo: suType[0],
      tramite: suType[1],
      m_urb: suType[2],
      m_sub: suType[3],
      m_lic: suType[4]
    }

    var state = element.states ? element.states.split(',') : [];
    var date = element.dates ? element.dates.split(',') : [];
    var date_start = '';
    var date_end = '';
    var active = true;
    if (state.length) {
      if (state.includes('-1')) {
        var indexOf = state.indexOf('-1');
        date_start = date[indexOf];
      }
      if (state.includes('3')) {
        var indexOf = state.indexOf('3');
        date_start = date[indexOf];
      }
      if (state.includes('5')) {
        var indexOf = state.indexOf('5');
        date_start = date[indexOf];
      }
      if (state.includes('99')) {
        var indexOf = state.indexOf('99');
        date_end = date[indexOf]
        active = false;
      }
    }

    pdfSupport.table(doc, [
      { coord: [0, 0], w: 10, h: 1, text: element.id_public, config: { align: 'center', valign: true } },
      { coord: [10, 0], w: 20, h: 1, text: formsParser1(typeObject), config: { align: 'center', valign: true } },
      { coord: [30, 0], w: 10, h: 1, text: date_start, config: { align: 'center', valign: true } },
      { coord: [40, 0], w: 10, h: 1, text: date_end ? date_end : 'ACTIVO', config: { align: 'center', valign: true } },
      { coord: [50, 0], w: 10, h: 1, text: element.roles, config: { align: 'center', valign: true } },
    ],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  }

  doc.fontSize(12);
  doc.text('\n');
  doc.text(BODY2, { align: 'justify' });
  doc.text('\n');
  doc.text('Atentamente,', { align: 'justify' });
  doc.text('\n');

  pdfSupport.setSign(doc)
  pdfSupport.setHeader(doc, { title: 'HISTORIAL PROFESIONAL', size: 13, icon: true, id_public: false })

  doc.end();
  return true;
}

function formsParser1(object) {
  if (!object) return "";
  let f_11 = object.tipo ? object.tipo : "";
  let f_12 = object.tramite ? object.tramite : "";
  let f_13 = object.m_urb ? object.m_urb : "";
  let f_14 = object.m_sub ? object.m_sub : "";
  let f_15 = object.m_lic ? object.m_lic : "";

  let textToParse = [];
  let arrayHelper = null;
  let arrayHelper2 = null;
  let defaultValue = null;

  // 1.1 CAN BE MULTIPLE
  defaultValue = f_11
  arrayHelper = ['LICENCIA DE URBANIZACION',
    'LICENCIA DE PARCELACION',
    'LICENCIA DE SUBDIVICION',
    'LICENCIA DE CONSTRUCCION',
    'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
    'RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION',
    'OTRAS ACTUACIONES'];
  arrayHelper2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  for (var i = 0; i < defaultValue.length; i++) {
    for (var j = 0; j < arrayHelper2.length; j++) {
      if (arrayHelper2[j] == defaultValue[i]) {
        textToParse.push(arrayHelper[j]);
      }
    }
  }

  // 1.2 CAN HAVE OTHER OPTIONS
  arrayHelper = ['INICIAL',
    'PRORROGA',
    'MODIFICACION DE LICENCIA VIGENTE',
    'REVALIDACION'];
  arrayHelper2 = ['A', 'B', 'C', 'D'];
  defaultValue = f_12;
  for (var i = 0; i < arrayHelper2.length; i++) {
    if (arrayHelper2[i] == defaultValue) {
      defaultValue = arrayHelper[i];
      break;
    }
  }
  if (defaultValue) {
    textToParse.push(defaultValue);
  }


  // 1.3 CAN BE NULL
  defaultValue = f_13
  if (defaultValue != "" && defaultValue != null) {
    arrayHelper = ['DESARROLLO',
      'SANEAMIENTO',
      'RECUPERACION'];
    arrayHelper2 = ['A', 'B', 'C'];
    for (var i = 0; i < arrayHelper2.length; i++) {
      if (arrayHelper2[i] == defaultValue) {
        textToParse.push(arrayHelper[i]);
        break;
      }
    }
  }

  // 1.4 CAN BE NULL
  defaultValue = f_14
  if (defaultValue != "" && defaultValue != null) {
    arrayHelper = ['SUBDIVISION RURAL',
      'SUBDIVISION URBANA',
      'RELOTEO'];
    arrayHelper2 = ['A', 'B', 'C'];
    for (var i = 0; i < arrayHelper2.length; i++) {
      if (arrayHelper2[i] == defaultValue) {
        textToParse.push(arrayHelper[i]);
        break;
      }
    }
  }

  // 1.5 CAN BE NULL && CAN BE MULTILPLE
  defaultValue = f_15
  if (defaultValue != "" && defaultValue != null) {
    arrayHelper = ['OBRA NUEVA',
      'AMPLIACION',
      'ADECUACION',
      'MODIFICACION',
      'RESTAURACION',
      'REFORZAMIENTO ESTRUCTURAL',
      'DEMOLICION TOTAL',
      'DEMOLICION PARCIAL',
      'RECONSTRUCCION',
      'CERRAMIENTO'];
    arrayHelper2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'g', 'H', 'I'];
    for (var i = 0; i < defaultValue.length; i++) {
      for (var j = 0; j < arrayHelper2.length; j++) {
        if (arrayHelper2[j] == defaultValue[i]) {
          textToParse.push(arrayHelper[j]);
        }
      }
    }
  }
  var striing = textToParse.join()
  return striing.replace(/,/g, ", ");
}

function create_cert(_id_public, _description, _content, res) {
  var object = {
    id_public: _id_public,
    description: _description,
    content: _content,
  }
  Cert.create(object)
    .then(data => {
      res.send('OK');
    }).catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred." });
    });
}
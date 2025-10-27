const db = require("../models");
const FUN_0 = db.fun_0;
const FUN_1 = db.fun_1;
const FUN_2 = db.fun_2;
const FUN_3 = db.fun_3;
const FUN_4 = db.fun_4;
const FUN_51 = db.fun_51;
const FUN_52 = db.fun_52;
const FUN_53 = db.fun_53;
const FUN_6 = db.fun_6;
const FUN_6_H = db.fun_6_h;
const FUN_C = db.fun_c;
const FUN_R = db.fun_r
const FUN_LAW = db.fun_law;
const FUN_CLOCK = db.fun_clock;
const FUN_ARCH = db.fun_archive;

const PH = db.record_ph;

const ARC = db.record_arc;
const ARCR = db.record_arc_38;
const ARC_STEP = db.record_arc_step;

const LAW = db.record_law;
const LAWR = db.record_law_review;
const LAW_STEP = db.record_law_step;

const ENG = db.record_eng;
const ENGR = db.record_eng_review;
const ENG_STEP = db.record_eng_step;

const RR = db.record_review;

const EXP = db.expedition;

const VR = db.submit;

const Op = db.Sequelize.Op;
const fs = require('fs');
const momentB = require('moment-business-days');
const moment = require('moment');
const nodemailer = require("nodemailer");
const mailerConfig = require("../config/mailer.config");
const Queries = require('../config/generalQueries');
const curaduriaInfo = require('../config/curaduria.json')
const pdfSupport = require("../config/pdfSupport.js");

// THIS IS THE MAIN FUNCTION TO ADVANVE THE FUN IN BETWEEN THE DIFFERENT STATE PRESENT
// THIS CLASS ONLY FOLLOWS SOME SET OF RULES, WHILE MOST OF THE LOGIC OF TRANSITION 
// IS CONTROLLED IN THE FRONT END, THIS IS MEAN TO BE GENERIC FOR THE DIFFERENT
// REASONS WHY THIS FUNCTION IS GOING TO BE CALLED.
exports.setState = (req, res) => {
  const id = req.params.id;
  FUN_0.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })

};

// POST
exports.create = (req, res) => {

  const id_public = (req.body.id_public ? req.body.id_public : res.send('NOT A REAL ID'));

  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT fun_0s.id_public
  FROM fun_0s
  WHERE fun_0s.id_public LIKE '${id_public}'
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      if (data.length) { return res.send("ERROR_DUPLICATE"); }
      else nextV()
    })
    .catch(err => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });

  function nextV() {
    query = Queries.validateCopyVR(id_public)

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length) { return res.send("ERROR_DUPLICATE"); }
        else create()
      })
      .catch(err => {
        return res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving ALL DATA."
        });
      });
  }


  // Create
  function create() {
    var object = {
      version: 1,
      state: 1,
      id_public: id_public,
      date: (req.body.date ? req.body.date : moment().format('YYYY-MM-DD'))
    }

    FUN_0.create(object)
      .then(data => {
        return res.send('OK');
      })
      .catch(err => {
        return res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

};

exports.create_version = (req, res) => {
  const _fun0Id = (req.body.fun0Id != 'null' ? req.body.fun0Id : res.send('NOT A REAL PARENT ID, fun0'));
  const _version = (req.body.version ? req.body.version : -1);
  const _law_id = (req.body.law_id != null ? req.body.law_id : false);
  const _fun2Id = (req.body.fun2Id != 'null' ? req.body.fun2Id : res.send('NOT A REAL PARENT ID, fun2'));
  // Create

  var object_fun0 = {
    version: _version,
    state: req.body.state,
  }

  var object_fun1 = {
    fun0Id: _fun0Id,
    version: _version,
    tipo: (req.body.tipo != 'null' ? req.body.tipo : ""),
    tramite: (req.body.tramite != 'null' ? req.body.tramite : ""),
    m_urb: (req.body.m_urb != 'null' ? req.body.m_urb : ""),
    m_sub: (req.body.m_sub != 'null' ? req.body.m_sub : ""),
    m_lic: (req.body.m_lic != 'null' ? req.body.m_lic : ""),
    usos: (req.body.usos != 'null' ? req.body.usos : ""),
    area: (req.body.area != 'null' ? req.body.area : ""),
    vivienda: (req.body.vivienda != 'null' ? req.body.vivienda : ""),
    cultural: (req.body.cultural != 'null' ? req.body.cultural : ""),
    regla_1: (req.body.regla_1 != 'null' ? req.body.regla_1 : ""),
    regla_2: (req.body.regla_2 != 'null' ? req.body.regla_2 : ""),
    description: (req.body.description != 'null' ? req.body.description : ""),
  }

  var object_fun2 = {
    fun0Id: _fun0Id,
    direccion: (req.body.direccion != 'null' ? req.body.direccion : ""),
    direccion_ant: (req.body.direccion_ant != 'null' ? req.body.direccion_ant : ""),
    matricula: (req.body.matricula != 'null' ? req.body.matricula : ""),
    catastral: (req.body.catastral != 'null' ? req.body.catastral : ""),
    suelo: (req.body.suelo != 'null' ? req.body.suelo : ""),
    lote_pla: (req.body.lote_pla != 'null' ? req.body.lote_pla : ""),
    barrio: (req.body.barrio != 'null' ? req.body.barrio : ""),
    vereda: (req.body.vereda != 'null' ? req.body.vereda : ""),
    comuna: (req.body.comuna != 'null' ? req.body.comuna : ""),
    sector: (req.body.sector != 'null' ? req.body.sector : ""),
    estrato: (req.body.estrato != 'null' ? req.body.estrato : ""),
    corregimiento: (req.body.corregimiento != 'null' ? req.body.corregimiento : ""),
    manzana: (req.body.manzana != 'null' ? req.body.manzana : ""),
    lote: (req.body.lote != 'null' ? req.body.lote : ""),
  }

  var object_fun53 = {
    fun0Id: _fun0Id,
    version: _version,
    name: (req.body.name != 'null' ? req.body.name : ""),
    surname: (req.body.surname != 'null' ? req.body.surname : ""),
    id_number: (req.body.id_number != 'null' ? req.body.id_number : ""),
    role: (req.body.role != 'null' ? req.body.role : ""),
    email: (req.body.email != 'null' ? req.body.email : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),
    number: (req.body.number != 'null' ? req.body.number : ""),
    docs: (req.body.docs != 'null' ? req.body.docs : ""),
    check: (req.body.check != 'null' ? req.body.check : ""),
  }

  var object_fun_c = {
    fun0Id: _fun0Id,
    version: _version,
    date: (req.body.date != 'null' ? req.body.date : null),
    worker: (req.body.worker != 'null' ? req.body.worker : null),
    condition: (req.body.condition != 'null' ? req.body.condition : null),
    reciever_name: (req.body.reciever_name != 'null' ? req.body.reciever_name : ""),
    reciever_date: (req.body.reciever_date != 'null' ? req.body.reciever_date : null),
    reciever_id: (req.body.reciever_id != 'null' ? req.body.reciever_id : ""),
    reciever_actor: (req.body.reciever_actor != 'null' ? req.body.reciever_actor : ""),
    details: (req.body.details ? req.body.details != 'null' : ""),
  }

  var object_fun_r = {
    fun0Id: _fun0Id,
    version: _version,
    checked: (req.body.checked != 'null' ? req.body.checked : null),
    code: (req.body.code != 'null' ? req.body.code : null),
  }

  FUN_0.update(object_fun0, {
    where: { id: _fun0Id }
  }).then(num => {
    if (num == 1) {
      create_version_fun_1();
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })

  console.log("CREATING NEW VERSION", _version)

  function create_version_fun_1() {
    FUN_1.create(object_fun1)
      .then(data => {
        console.log("CREATIN NEW FUN 1 VERSION");
        create_version_fun_2();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function create_version_fun_2() {
    FUN_2.update(object_fun2, {
      where: { id: _fun2Id }
    })
      .then(data => {
        console.log("UPDATING FUN 2 VERSION");
        create_version_fun_53();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function create_version_fun_53() {
    FUN_53.create(object_fun53)
      .then(data => {
        console.log("CREATIN NEW FUN 53 VERSION");
        create_version_fun_c();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function create_version_fun_c() {
    FUN_C.create(object_fun_c)
      .then(data => {
        console.log("CREATIN NEW FUN C VERSION");
        create_version_fun_r();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function create_version_fun_r() {
    FUN_R.create(object_fun_r)
      .then(data => {
        console.log("CREATIN NEW FUN R VERSION");
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

exports.create_fun1 = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    version: (req.body.version ? req.body.version : -1),
    tipo: (req.body.tipo ? req.body.tipo : ""),
    tramite: (req.body.tramite ? req.body.tramite : ""),
    m_urb: (req.body.m_urb ? req.body.m_urb : ""),
    m_sub: (req.body.m_sub ? req.body.m_sub : ""),
    m_lic: (req.body.m_lic ? req.body.m_lic : ""),
    usos: (req.body.usos ? req.body.usos : ""),
    area: (req.body.area ? req.body.area : ""),
    vivienda: (req.body.vivienda ? req.body.vivienda : ""),
    cultural: (req.body.cultural ? req.body.cultural : ""),
    regla_1: (req.body.regla_1 ? req.body.regla_1 : ""),
    regla_2: (req.body.regla_2 ? req.body.regla_2 : ""),
    description: (req.body.description ? req.body.description : ""),
    anex1: (req.body.anex1 ? req.body.anex1 : ""),
    anex2: (req.body.anex2 ? req.body.anex2 : ""),
    anex3: (req.body.anex3 ? req.body.anex3 : ""),
  }
  FUN_1.create(object)
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

exports.create_fun2 = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    direccion: (req.body.direccion ? req.body.direccion : ""),
    direccion_ant: (req.body.direccion_ant ? req.body.direccion_ant : ""),
    matricula: (req.body.matricula ? req.body.matricula : ""),
    catastral: (req.body.catastral ? req.body.catastral : ""),
    catastral_2: (req.body.catastral_2 ? req.body.catastral_2 : ""),
    suelo: (req.body.suelo ? req.body.suelo : ""),
    lote_pla: (req.body.lote_pla ? req.body.lote_pla : ""),
    barrio: (req.body.barrio ? req.body.barrio : ""),
    vereda: (req.body.vereda ? req.body.vereda : ""),
    comuna: (req.body.comuna ? req.body.comuna : ""),
    sector: (req.body.sector ? req.body.sector : ""),
    estrato: (req.body.estrato ? req.body.estrato : ""),
    corregimiento: (req.body.corregimiento ? req.body.corregimiento : ""),
    manzana: (req.body.manzana ? req.body.manzana : ""),
    lote: (req.body.lote ? req.body.lote : ""),
  }
  FUN_2.create(object)
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

exports.create_fun3 = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    direccion_1: (req.body.direccion_1 ? req.body.direccion_1 : ""),
    direccion_2: (req.body.direccion_2 ? req.body.direccion_2 : ""),
    extra: (req.body.extra ? req.body.extra : null),
    part: (req.body.part ? req.body.part : null),
    part_id: (req.body.part_id ? req.body.part_id : null),
    alters_info: (req.body.alters_info ? req.body.alters_info : null),
  }
  FUN_3.create(object)
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

exports.create_fun4 = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    coord: (req.body.coord ? req.body.coord : ""),
    longitud: (req.body.longitud ? req.body.longitud : ""),
    colinda: (req.body.colinda ? req.body.colinda : ""),
  }
  FUN_4.create(object)
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

exports.create_fun51 = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    name: (req.body.name ? req.body.name : ""),
    surname: (req.body.surname ? req.body.surname : ""),
    id_number: (req.body.id_number ? req.body.id_number : ""),
    nunber: (req.body.nunber ? req.body.nunber : ""),
    email: (req.body.email ? req.body.email : ""),
    active: 1,
    docs: (req.body.docs ? req.body.docs : ""),
    role: (req.body.role ? req.body.role : ""),
    type: (req.body.type ? req.body.type : ""),
    rep_name: (req.body.rep_name ? req.body.rep_name : ""),
    rep_id_number: (req.body.rep_id_number ? req.body.rep_id_number : ""),
  }
  FUN_51.create(object)
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

exports.create_fun52 = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    name: (req.body.name ? req.body.name : ""),
    surname: (req.body.surname ? req.body.surname : ""),
    id_number: (req.body.id_number ? req.body.id_number : ""),
    number: (req.body.number ? req.body.number : ""),
    email: (req.body.email ? req.body.email : ""),
    role: (req.body.role ? req.body.role : ""),
    registration: (req.body.registration ? req.body.registration : ""),
    registration_date: (req.body.registration_date ? req.body.registration_date : null),
    supervision: (req.body.supervision ? req.body.supervision : ""),
    active: 1,
    expirience: (req.body.expirience ? req.body.expirience : null),
    sanction: (req.body.sanction === '1' ? 1 : 0),
    docs: (req.body.docs ? req.body.docs : ""),
  }
  FUN_52.create(object)
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

exports.create_fun53 = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    version: (req.body.version ? req.body.version : -1),
    name: (req.body.name ? req.body.name : ""),
    surname: (req.body.surname ? req.body.surname : ""),
    id_number: (req.body.id_number ? req.body.id_number : ""),
    role: (req.body.role ? req.body.role : ""),
    email: (req.body.email ? req.body.email : ""),
    address: (req.body.address ? req.body.address : ""),
    number: (req.body.number ? req.body.number : ""),
    docs: (req.body.docs ? req.body.docs : ""),
  }
  FUN_53.create(object)
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

exports.create_fun6 = (req, res) => {
  // OBJECTS FOR FILES
  // THEY CAN BE FROM 0 TO MANY
  // THE FORM DOES NOT ADD THE FILES INTO A SINGLE FILE OBJECT, BUT RATHER ADD MANY FILE OBJECTS AS WAS NEEDED
  // THIS MEANS EACH FILE OBJECT IS IDENTIFIED IN THE FORMS OBJECT AS: file_i WHERE i IS EACH OF THE FILES...
  // GOING FROM 0 TO AS MANY AS NEEDED
  // IF THERE IS AT LEAST ONE FILE, ADD TO THE OBJECT IN A FOR CICLE
  // IF THERE IS NOT FILES, PROCEED TO NEXT AND IGNORE THIS STEP
  var attachs_array = [];
  let attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);

  let str_descriptions = (req.body.descriptions ? req.body.descriptions : "");
  let aray_descriptions = str_descriptions.split(",");
  let str_codes = (req.body.codes ? req.body.codes : "");
  let aray_codes = str_codes.split(",");
  let str_codes2 = (req.body.codes2 ? req.body.codes2 : "");
  let aray_codes2 = str_codes2.split(",");
  let str_pages = (req.body.pages ? req.body.pages : "");
  let aray_pages = str_pages.split(",");
  let str_dates = (req.body.dates ? req.body.dates : "");
  let aray_dates = str_dates.split(",");

  if (attachs_length) {
    for (var i = 0; i < attachs_length; i++) {

      var mimetype = req.files[i].mimetype;
      if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
        fs.unlink(req.files[i].path, (err) => {
          console.log('FILE NOT COMPATIBLE, DETELED!');
          if (err) res.send(err);
        });
        res.send('ERROR_2')
      } else {
        const object_attach = {
          fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
          active: 1,

          description: aray_descriptions[i],
          date: aray_dates[i],
          pages: aray_pages[i],
          id_public: aray_codes[i],
          id_replace: aray_codes2[i] || null,

          filename: req.files[i].filename,
          path: req.files[i].path.substring(0, req.files[i].path.lastIndexOf('/'))
        };
        attachs_array.push(object_attach);
      }
    }
  }
  FUN_6.bulkCreate(attachs_array)
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

exports.create_fun6_h = (req, res) => {
  const object = {
    fun6Id: (req.body.fun6Id != null ? req.body.fun6Id : res.send('NOT A REAL PARENT ID')),
    date: req.body.date ? req.body.date : null,
    state: req.body.state ? req.body.state : null,
    detail: req.body.detail ? req.body.detail : null,
  };
  FUN_6_H.create(object)
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

exports.create_func = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    version: (req.body.version ? req.body.version : 0),
    date: (req.body.date != 'null' ? req.body.date : null),
    worker: (req.body.worker ? req.body.worker : null),
    condition: (req.body.condition ? req.body.condition : null),
    reciever_name: (req.body.reciever_name ? req.body.reciever_name : ""),
    reciever_date: (req.body.reciever_date != 'null' ? req.body.reciever_date : null),
    reciever_id: (req.body.reciever_id ? req.body.reciever_id : ""),
    reciever_actor: (req.body.reciever_actor ? req.body.reciever_actor : ""),
    details: (req.body.details ? req.body.details : ""),
    legal_date: (req.body.legal_date ? req.body.legal_date : null),
  }

  FUN_C.create(object)
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

exports.create_funr = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    code: (req.body.code ? req.body.code : ""),
    checked: (req.body.checked ? req.body.checked : ""),
    version: (req.body.version ? req.body.version : ""),
  }
  FUN_R.create(object)
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

exports.create_law = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    sign: (req.body.sign ? req.body.sign : null),
    new_type: (req.body.new_type ? req.body.new_type : null),
    publish_neighbour: (req.body.publish_neighbour ? req.body.publish_neighbour : null),
    id6payment: (req.body.id6payment ? req.body.id6payment : null),
    planing_data: (req.body.planing_data ? req.body.planing_data : null),
    report_data: (req.body.report_data ? req.body.report_data : null),
    report_data_pdf: (req.body.report_data_pdf ? req.body.report_data_pdf : null),
    report_cub: null,
    cub_inc: null,
    cub_ldf: null,
    cub_act: null,
    cub_inc_json: (req.body.cub_inc_json ? req.body.cub_inc_json : null),
    cub_ldf_json: (req.body.cub_ldf_json ? req.body.cub_ldf_json : null),
    cub_act_json: (req.body.cub_act_json ? req.body.cub_act_json : null),
  }

  const aim_cub = req.body.aim_cub ? req.body.aim_cub : 'report_cub';
  const new_id = (req.body.new_id);
  const prev_id = (req.body.prev_id);

  if (new_id && new_id != 'false') {
    object[aim_cub] = new_id;
    const { QueryTypes } = require('sequelize');
    var query = Queries.validateLastCUBQuery(new_id, prev_id);

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length > 0) res.send("ERROR_DUPLICATE");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving ALL DATA."
        });
      });
  } else if (new_id === 'false') req.body[aim_cub] = "";

  FUN_LAW.create(object)
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

exports.create_sign = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    sign: (req.body.sign ? req.body.sign : null),
    new_type: (req.body.new_type ? req.body.new_type : null),
    publish_neighbour: (req.body.publish_neighbour ? req.body.publish_neighbour : null),
  }

  FUN_LAW.create(object)
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

exports.create_archive = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    date_1: (req.body.date_1 ? req.body.date_1 : null),
    date_2: (req.body.date_2 ? req.body.date_2 : null),
    resolution: (req.body.resolution ? req.body.resolution : null),
    folder: (req.body.folder ? req.body.folder : null),
    pages: (req.body.pages ? req.body.pages : null),
    box: (req.body.box ? req.body.box : null),
    row: (req.body.row ? req.body.row : null),
    column: (req.body.column ? req.body.column : null),
  }

  FUN_ARCH.create(object)
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

exports.update_sign = (req, res) => {
  const id = req.params.id;
  FUN_LAW.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })

};

exports.createclock = (req, res) => {
  // Create
  var object = {
    fun0Id: (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID')),
    version: (req.body.version ? req.body.version : 1),
    name: (req.body.name ? req.body.name : null),
    desc: (req.body.desc ? req.body.desc : null),
    date_start: (req.body.date_start ? req.body.date_start : null),
    state: req.body.state,
    resolver_id6: (req.body.resolver_id6 ? req.body.resolver_id6 : null),
    resolver_sattus: (req.body.resolver_sattus ? req.body.resolver_sattus : null),
    resolver_context: (req.body.resolver_context ? req.body.resolver_context : null),
  }

  FUN_CLOCK.create(object)
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

// GET
exports.findAll = (req, res) => {
  FUN_0.findAll({
    include: [FUN_1, FUN_2, FUN_3, FUN_4, FUN_51, FUN_52, FUN_53, FUN_6, FUN_C, FUN_R, FUN_LAW, FUN_CLOCK],
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

// GET
exports.findAll_c = (req, res) => {
  FUN_C.findAll()
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

exports.findAll_fun = (req, res) => {
  FUN_0.findAll({
    include: [FUN_1, FUN_CLOCK],
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

exports.findAll_fun_6_h = (req, res) => {
  const id = req.params.id;
  FUN_6_H.findAll({
    where: { fun6Id: id },
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

exports.findAll_fun_Curated = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT DISTINCT
  fun_0s.*, 
  fun_1s.tramite,
  fun_1s.tipo,
  fun_1s.m_urb,
  fun_1s.m_sub,
  fun_1s.m_lic,
  SUM(IF(fun_3s.state > 0, 1, 0)) as alerted,
  COUNT(fun_3s.id) as neighbours,
  fun_laws.report_data,
  fun_laws.report_cub,
  fun_laws.sign,
  seals.id as seal,

  clock_legal.date_start AS clock_date,
  clock_payment.date_start AS clock_payment,
  clock_exp.date_start AS clock_exp,
  clock_archive.date_start AS clock_archive,
  clock_close_1.date_start AS clock_close_1,
  clock_close_2.date_start AS clock_close_2,
  clock_close_3.date_start AS clock_close_3,
  clock_close_4.date_start AS clock_close_4,
  clock_close_5.date_start AS clock_close_5,
  clock_close_6.date_start AS clock_close_6,
  clock_pay2.date_start AS clock_pay2,
  clock_resolution.date_start AS clock_resolution,
  clock_license.date_start AS clock_license,

  clock_law_rew.resolver_context AS  clock_law_rew,
  clock_eng_rew.resolver_context AS  clock_eng_rew,
  clock_arc_rew.resolver_context AS  clock_arc_rew,

  record_law_reviews.check AS law_review, 
  record_eng_reviews.check AS eng_review,
  record_eng_reviews.check_2 AS eng_review_2,
  record_arc_38s.check AS arc_review,
  record_phs.check AS ph_review,

  record_reviews.check AS rec_review,
  record_reviews.check_2 AS rec_review_2
  
  FROM fun_0s
  
  LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id
  AND fun_1s.version = fun_0s.version
  
  LEFT JOIN fun_3s ON fun_3s.fun0Id = fun_0s.id
  
   LEFT JOIN fun_laws ON fun_laws.fun0Id = fun_0s.id
  
  LEFT JOIN fun_clocks AS clock_legal ON clock_legal.fun0Id = fun_0s.id
  AND clock_legal.state = 5
  
    LEFT JOIN fun_clocks AS clock_payment ON clock_payment.fun0Id = fun_0s.id
  AND clock_payment.state = 3

  LEFT JOIN fun_clocks AS clock_exp ON clock_exp.fun0Id = fun_0s.id
  AND clock_exp.state = 50

  LEFT JOIN fun_clocks AS clock_archive ON clock_archive.fun0Id = fun_0s.id
  AND clock_archive.state = 101

  LEFT JOIN fun_clocks AS clock_close_1 ON clock_close_1.fun0Id = fun_0s.id
  AND clock_close_1.state = -5 AND clock_close_1.version = -1

  LEFT JOIN fun_clocks AS clock_close_2 ON clock_close_2.fun0Id = fun_0s.id
  AND clock_close_2.state = -5 AND clock_close_2.version = -2

  LEFT JOIN fun_clocks AS clock_close_3 ON clock_close_3.fun0Id = fun_0s.id
  AND clock_close_3.state = -5 AND clock_close_3.version = -3

  LEFT JOIN fun_clocks AS clock_close_4 ON clock_close_4.fun0Id = fun_0s.id
  AND clock_close_4.state = -5 AND clock_close_4.version = -4

  LEFT JOIN fun_clocks AS clock_close_5 ON clock_close_5.fun0Id = fun_0s.id
  AND clock_close_5.state = -5 AND clock_close_5.version = -5

  LEFT JOIN fun_clocks AS clock_close_6 ON clock_close_6.fun0Id = fun_0s.id
  AND clock_close_6.state = -5 AND clock_close_6.version = -6

  # ------------ REVIEW CLOCKS -------------- #
  LEFT JOIN fun_clocks AS clock_law_rew ON clock_law_rew.fun0Id = fun_0s.id
  AND clock_law_rew.state = 11 AND clock_law_rew.version = 200

  LEFT JOIN fun_clocks AS clock_eng_rew ON clock_eng_rew.fun0Id = fun_0s.id
  AND clock_eng_rew.state = 12 AND clock_eng_rew.version = 200

  LEFT JOIN fun_clocks AS clock_arc_rew ON clock_arc_rew.fun0Id = fun_0s.id
  AND clock_arc_rew.state = 13 AND clock_arc_rew.version = 200
  # ----------------------------------------- #

  LEFT JOIN fun_clocks AS clock_pay2 ON clock_pay2.fun0Id = fun_0s.id
  AND clock_pay2.state = 61
  LEFT JOIN fun_clocks AS clock_resolution ON clock_resolution.fun0Id = fun_0s.id
  AND clock_resolution.state = 80
  LEFT JOIN fun_clocks AS clock_license ON clock_license.fun0Id = fun_0s.id
  AND clock_license.state = 99
  
  LEFT JOIN record_laws ON  record_laws.fun0Id = fun_0s.id
  LEFT JOIN record_law_reviews ON record_law_reviews.recordLawId = record_laws.id  
  AND record_law_reviews.version = record_laws.version
  
  LEFT JOIN record_engs ON  record_engs.fun0Id = fun_0s.id 
  LEFT JOIN record_eng_reviews ON record_eng_reviews.recordEngId = record_engs.id  
  AND record_engs.version = record_eng_reviews.version

  LEFT JOIN record_arcs ON  record_arcs.fun0Id = fun_0s.id
  LEFT JOIN record_arc_38s ON record_arc_38s.recordArcId = record_arcs.id  
  AND record_arcs.version = record_arc_38s.version

  LEFT JOIN record_phs ON  record_phs.fun0Id = fun_0s.id 

  LEFT JOIN record_reviews ON  record_reviews.fun0Id = fun_0s.id 

  LEFT JOIN seals ON seals.fun0Id = fun_0s.id
  
  GROUP BY fun_0s.id_public DESC
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

exports.findAll_clocks = (req, res) => {
  FUN_CLOCK.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving THE DATA."
      });
    });
};

exports.loadMacro = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = Queries.loadMacro(_date_sart, _date_end)

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      let newData = curatedMacroData(data)
      res.send(newData);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
};

exports.loadMacroSingle = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const _id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = Queries.loadMacro(null, null, _id, false, false, false)

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      let newData = curatedMacroData(data)
      res.send(newData);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
};

exports.loadMacroRange = (req, res) => {
  const _id1 = req.params.id1;
  const _id2 = req.params.id2;
  const { QueryTypes } = require('sequelize');
  var query = Queries.loadMacro(null, null, _id1, _id2, true, false)

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      let newData = curatedMacroData(data)
      return res.status(200).send(newData);
    })
    .catch(err => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });

};

exports.loadMacroAsings = (req, res) => {
  const _id1 = req.params.id1;
  const _id2 = req.params.id2;
  const { QueryTypes } = require('sequelize');
  var query = Queries.loadMacro(null, null, _id1, _id2, true, true)

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      let newData = curatedMacroData(data)
      res.send(newData);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
};

exports.loadMacroNegative = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT
  fun_0s.id as id_sistem, fun_0s.state, fun_0s.id_public, fun_0s.version, 
  
  fun_1s.tramite, fun_1s.tipo, fun_1s.m_urb, fun_1s.m_sub, fun_1s.m_lic, fun_1s.usos,
  
  clock_5.version AS clock_cause,
  clock_5.date_start AS clock_5,
  clock_6.date_start AS clock_6,
  clock_7.date_start AS clock_7,
  clock_8.date_start AS clock_8,
  clock_10.date_start AS clock_10,
  clock_11.date_start AS clock_11,
  clock_17.date_start AS clock_17,
  clock_18.date_start AS clock_18,
  clock_19.date_start AS clock_19,
  clock_20.date_start AS clock_20,
  clock_21.date_start AS clock_21,
  clock_22.date_start AS clock_22,
  clock_30.date_start AS clock_30
  
  FROM fun_0s
  
  INNER JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id
  AND fun_1s.version = fun_0s.version

  INNER JOIN fun_clocks AS clock_5 ON clock_5.fun0Id = fun_0s.id
  AND clock_5.state = -5
  
  LEFT JOIN fun_clocks AS clock_6 ON clock_6.fun0Id = fun_0s.id
  AND clock_6.state = -6
  AND clock_6.version = clock_5.version
  
  LEFT JOIN fun_clocks AS clock_7 ON clock_7.fun0Id = fun_0s.id
  AND clock_7.state = -7
   AND clock_7.version = clock_5.version
  
  LEFT JOIN fun_clocks AS clock_8 ON clock_8.fun0Id = fun_0s.id
  AND clock_8.state = -8
  AND clock_8.version = clock_5.version
  
  LEFT JOIN fun_clocks AS clock_10 ON clock_10.fun0Id = fun_0s.id
  AND clock_10.state = -10
  AND clock_10.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_11 ON clock_11.fun0Id = fun_0s.id
  AND clock_11.state = -11
  AND clock_11.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_17 ON clock_17.fun0Id = fun_0s.id
  AND clock_17.state = -17
  AND clock_17.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_18 ON clock_18.fun0Id = fun_0s.id
  AND clock_18.state = -18
  AND clock_18.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_19 ON clock_19.fun0Id = fun_0s.id
  AND clock_19.state = -19
   AND clock_19.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_20 ON clock_20.fun0Id = fun_0s.id
  AND clock_20.state = -20
   AND clock_20.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_21 ON clock_21.fun0Id = fun_0s.id
  AND clock_21.state = -21
   AND clock_21.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_22 ON clock_22.fun0Id = fun_0s.id
  AND clock_22.state = -22
   AND clock_22.version = clock_5.version
  
    LEFT JOIN fun_clocks AS clock_30 ON clock_30.fun0Id = fun_0s.id
  AND clock_30.state = -30
  AND clock_30.version = clock_5.version
    
  WHERE fun_0s.date BETWEEN '${_date_sart}' AND '${_date_end}'

  ORDER BY fun_0s.id_public DESC
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

exports.loadMacroClocksControl = (req, res) => {
  const _id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = ` 
  SELECT 
  fun_clocks.id, 
  fun_clocks.name, 
  fun_clocks.desc, 
  fun_clocks.state, 
  fun_clocks.date_start, 
  fun_clocks.version, 
  fun_clocks.resolver_sattus,
  fun_clocks.resolver_context

    FROM fun_clocks

    WHERE fun_clocks.fun0Id = '${_id}'
    AND  fun_clocks.version > 10
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

exports.loadAllClocks = (req, res) => {
  const _id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = ` 
  SELECT 
  fun_clocks.id, 
  fun_clocks.name, 
  fun_clocks.desc, 
  fun_clocks.state, 
  fun_clocks.date_start, 
  fun_clocks.version, 
  fun_clocks.resolver_sattus,
  fun_clocks.resolver_context

    FROM fun_clocks

    WHERE fun_clocks.fun0Id = '${_id}'
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

exports.loadSubmit = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = `
    SELECT DISTINCT fun_0s.id_public, fun_0s.id, submits.date, submits.time, 
    GROUP_CONCAT(sub_lists.list_code) AS codes, GROUP_CONCAT(sub_lists.list_review) AS review, GROUP_CONCAT(sub_lists.list_pages) AS pages, 
    GROUP_CONCAT(sub_lists.list_name SEPARATOR  ';') AS names 
    FROM fun_0s
    INNER JOIN submits ON submits.id_related = fun_0s.id_public
    INNER JOIN sub_lists ON sub_lists.submitId = submits.id
    WHERE sub_lists.id IS NOT null
    AND submits.date BETWEEN '${_date_sart}' AND '${_date_end}'
    GROUP BY fun_0s.id_public, submits.date DESC
    ORDER BY submits.date DESC, submits.time DESC
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

exports.loadSubmit2 = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT
  fun_0s.id,
  fun_0s.state,
  fun_0s.id_public,
  fun_0s.type,
  fun_0s.version,
  record_arcs.worker_id AS arc_id,
  record_engs.worker_id AS eng_id,
  record_laws.worker_id AS law_id,
  ph_law.worker_asign_law_id AS ph_law_id,
  ph_arc.worker_asign_arc_id AS ph_arc_id,
  record_arcs.date_asign AS arc_asign,
  record_engs.date_asign AS law_asign,
  record_laws.date_asign AS law_asign,
  ph_law.date_asign_law AS ph_law_asign,
  ph_arc.date_asign_arc AS ph_arc_asign,
  fun_1s.tipo,
  fun_1s.tramite,
  fun_1s.m_urb,
  fun_1s.m_sub,
  fun_1s.m_lic,
  fun_0s.version,
  submits.date,


  record_arc_38s.check AS review_arc,
  ph_arc.check AS reviewph_arc,

  record_eng_reviews.check AS review_eng,

  record_law_reviews.check AS review_law,
  ph_law.check_law AS reviewph_law,

  
  GROUP_CONCAT(
      sub_lists.list_code SEPARATOR ';'
  ) AS scodes,
  GROUP_CONCAT(
      sub_lists.list_review SEPARATOR ';'
  ) AS sreview,
  GROUP_CONCAT(
      sub_lists.list_pages SEPARATOR ';'
  ) AS spages,
  GROUP_CONCAT(
    DISTINCT  CONCAT(submits.date, " ", submits.time) SEPARATOR ';'
  )  AS screated,
  GROUP_CONCAT(
      sub_lists.list_name SEPARATOR '&&'
  ) AS snames,
  GROUP_CONCAT(DISTINCT  submits.id_public) AS vrs
FROM
    fun_0s
LEFT JOIN submits ON submits.id_related = fun_0s.id_public
LEFT JOIN sub_lists ON sub_lists.submitId = submits.id
LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN record_phs AS ph_law
ON
    ph_law.fun0Id = fun_0s.id
LEFT JOIN record_phs AS ph_arc
ON
    ph_arc.fun0Id = fun_0s.id
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id AND record_arcs.version = fun_0s.version
LEFT JOIN record_arc_38s ON record_arcs.id = record_arc_38s.recordArcId AND record_arc_38s.version = record_arcs.version
LEFT JOIN record_laws ON record_laws.fun0Id = fun_0s.id AND record_laws.version = fun_0s.version
LEFT JOIN record_law_reviews ON record_laws.id = record_law_reviews.recordLawId AND record_law_reviews.version = record_laws.version
LEFT JOIN record_engs ON record_engs.fun0Id = fun_0s.id AND record_engs.version = fun_0s.version
LEFT JOIN record_eng_reviews ON record_engs.id = record_eng_reviews.recordEngId AND record_eng_reviews.version = record_engs.version

WHERE submits.date BETWEEN '${_date_sart}' AND '${_date_end}'

GROUP BY fun_0s.id_public

ORDER BY screated DESC  
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

exports.loadAsign = (req, res) => {
  const _worker_id = req.params.worker_id;
  const _record_type = req.params.record_type;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT
  fun_0s.id,
  fun_0s.state,
  fun_0s.id_public,
  fun_0s.type,
  fun_0s.version,
  record_arcs.worker_id AS arc_id,
  record_engs.worker_id AS eng_id,
  record_laws.worker_id AS law_id,
  ph_law.worker_asign_law_id AS ph_law_id,
  ph_arc.worker_asign_arc_id AS ph_arc_id,
  record_arcs.date_asign AS arc_asign,
  record_engs.date_asign AS eng_asign,
  record_laws.date_asign AS law_asign,
  ph_law.date_asign_law AS ph_law_asign,
  ph_arc.date_asign_arc AS ph_arc_asign,
  fun_1s.tipo,
  fun_1s.tramite,
  fun_1s.m_urb,
  fun_1s.m_sub,
  fun_1s.m_lic,
  fun_0s.version,
  fun_0s.date,
  clock_extension.date_start AS clock_extension,
  record_reviews.check AS rec_rev,
  record_reviews.check_2 AS rec_rev_2,
  clock_not1.date_start AS clock_not1,
  clock_not2.date_start AS clock_not2,
  clock_date.date_start AS clock_date,


  ${_record_type == 'arc' ?
      `record_arc_38s.check AS review,
    ph_arc.check AS reviewph,
    ph_arc.date_arc_review AS dateph,
  `: ''}
  ${_record_type == 'eng' ?
      ` record_eng_reviews.check AS review,
      record_eng_reviews.check_2 AS review_2,
  `: ''}
  ${_record_type == 'law' ?
      `record_law_reviews.check AS review,
    ph_law.check_law AS reviewph,
    ph_arc.date_law_review AS dateph,
  `: ''}
  
  GROUP_CONCAT(
      sub_lists.list_code SEPARATOR ';'
  ) AS scodes,
  GROUP_CONCAT(
      sub_lists.list_review SEPARATOR ';'
  ) AS sreview,
  GROUP_CONCAT(
      sub_lists.list_pages SEPARATOR ';'
  ) AS spages,
  GROUP_CONCAT(
    DISTINCT  CONCAT(submits.date, " ", submits.time) SEPARATOR ';'
  )  AS screated,
  GROUP_CONCAT(
      sub_lists.list_name SEPARATOR '&&'
  ) AS snames,
  GROUP_CONCAT(DISTINCT  submits.id_public) AS vrs,


 (
  SELECT
  GROUP_CONCAT(c_id.id SEPARATOR ';')
FROM
  fun_clocks AS c_id
INNER JOIN fun_clocks AS c_id_map
ON
  c_id_map.id = c_id.id
WHERE
  c_id_map.fun0Id = fun_0s.id
) AS clocks_id,
(
SELECT
  GROUP_CONCAT(COALESCE(c_id.state, 'null') SEPARATOR ';')
FROM
  fun_clocks AS c_id
INNER JOIN fun_clocks AS c_id_map
ON
  c_id_map.id = c_id.id
WHERE
  c_id_map.fun0Id = fun_0s.id
) AS clocks_state,

(
SELECT
  GROUP_CONCAT(COALESCE(c_id.version, 'null') SEPARATOR ';')
FROM
  fun_clocks AS c_id
INNER JOIN fun_clocks AS c_id_map
ON
  c_id_map.id = c_id.id
WHERE
  c_id_map.fun0Id = fun_0s.id
) AS clocks_version,
(
SELECT
  GROUP_CONCAT(COALESCE(c_id.date_start, 'null') SEPARATOR '&&')
FROM
  fun_clocks AS c_id
INNER JOIN fun_clocks AS c_id_map
ON
  c_id_map.id = c_id.id
WHERE
  c_id_map.fun0Id = fun_0s.id
) AS clocks_date_start,

(
SELECT
  GROUP_CONCAT(COALESCE(c_id.resolver_context, 'null') SEPARATOR '&&')
FROM
  fun_clocks AS c_id
LEFT JOIN fun_clocks AS c_id_map
ON
  c_id_map.id = c_id.id
WHERE
  c_id_map.fun0Id = fun_0s.id
) AS clocks_dresolver_context

FROM
    fun_0s
LEFT JOIN submits ON submits.id_related = fun_0s.id_public
LEFT JOIN sub_lists ON sub_lists.submitId = submits.id
LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN record_phs AS ph_law
ON
    ph_law.fun0Id = fun_0s.id
LEFT JOIN record_phs AS ph_arc
ON
    ph_arc.fun0Id = fun_0s.id
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id AND record_arcs.version = fun_0s.version
LEFT JOIN record_arc_38s ON record_arcs.id = record_arc_38s.recordArcId AND record_arc_38s.version = record_arcs.version
LEFT JOIN record_laws ON record_laws.fun0Id = fun_0s.id AND record_laws.version = fun_0s.version
LEFT JOIN record_law_reviews ON record_laws.id = record_law_reviews.recordLawId AND record_law_reviews.version = record_laws.version
LEFT JOIN record_engs ON record_engs.fun0Id = fun_0s.id AND record_engs.version = fun_0s.version
LEFT JOIN record_eng_reviews ON record_engs.id = record_eng_reviews.recordEngId AND record_eng_reviews.version = record_engs.version
LEFT JOIN record_reviews ON record_reviews.fun0Id = fun_0s.id
LEFT JOIN fun_clocks AS clock_extension ON clock_extension.fun0Id = fun_0s.id AND clock_extension.state = 34
LEFT JOIN fun_clocks AS clock_not1 ON clock_not1.fun0Id = fun_0s.id AND clock_not1.state = 32
LEFT JOIN fun_clocks AS clock_not2 ON clock_not2.fun0Id = fun_0s.id AND clock_not2.state = 33
LEFT JOIN fun_clocks AS clock_date ON clock_date.fun0Id = fun_0s.id AND clock_date.state = 5
WHERE

  ${_record_type == 'arc' ?
      ` (record_arcs.worker_id = ${_worker_id} OR ph_arc.worker_asign_arc_id = ${_worker_id} )` : ''}

  ${_record_type == 'eng' ?
      `( record_engs.worker_id = ${_worker_id})` : ''}

  ${_record_type == 'law' ?
      `(record_laws.worker_id = ${_worker_id} OR ph_law.worker_asign_law_id = ${_worker_id})` : ''}


 

      AND sub_lists.id IS NOT NULL

GROUP BY fun_0s.id_public

ORDER BY screated DESC
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      let newData = curatedMacroData(data)
      res.send(newData);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
};
exports.check_statusNr = (req, res) => {
  const _id_public = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_0s.id_public,
    fun_0s.state,
    clock_payment.date_start AS clock_payment,
    clock_legal.date_start AS clock_legal,
    clock_record_p1.date_start AS clock_record_p1,
    clock_record_p2.date_start AS clock_record_p2,
    clock_pay2.date_start AS clock_pay2,
    clock_resolution.date_start AS clock_resolution,
    clock_resolution_not_1.date_start AS clock_resolution_not_1,
    clock_resolution_not_2.date_start AS clock_resolution_not_2,
    clock_resolution.resolver_context AS clock_resolution_c,
    clock_ejecutoria.date_start AS clock_ejecutoria,
    clock_license.date_start AS clock_license,
    
    record_laws.worker_name AS jur_worker,
    record_engs.worker_name AS eng_worker,
    record_arcs.worker_name AS arc_worker,
    
    record_phs.check AS ph_review,
    record_phs.worker_arc_name AS ph_worker_arc,
    record_phs.date_arc_review AS ph_date_arc,

    publications.pdf_path AS publication_path,
    publications.type AS publication_type,

    record_reviews.check AS rec_review,
    record_reviews.check_2 AS rec_review_2,

    record_reviews.check AS rec_review,
    record_reviews.check_2 AS rec_review_2,

    clock_law_asign.date_start AS clock_law_asign,
    clock_law_rev.date_start AS clock_law_rev,
    clock_law_rev.resolver_context AS clock_law_rev_c,
	clock_law_inf.date_start AS clock_law_inf,
    
    clock_eng_asign.date_start AS clock_eng_asign,
    clock_eng_rev.date_start AS clock_eng_rev,
    clock_eng_rev.resolver_context AS clock_eng_rev_c,
    clock_eng_rev.desc AS clock_eng_desc,
	clock_eng_inf.date_start AS clock_eng_inf,
    
    clock_arc_asign.date_start AS clock_arc_asign,
    clock_arc_rev.date_start AS clock_arc_rev,
    clock_arc_rev.resolver_context AS clock_arc_rev_c,
	clock_arc_inf.date_start AS clock_arc_inf,

  clock_not_0.date_start AS clock_not_0,
    clock_not_1.date_start AS clock_not_1,
    clock_not_2.date_start AS clock_not_2,
    clock_record_postpone.date_start AS clock_record_postpone,
    clock_corrections.date_start AS clock_corrections,

    clock_payments.date_start AS clock_payments

FROM
    fun_0s
LEFT JOIN record_phs ON record_phs.fun0Id = fun_0s.id
LEFT JOIN fun_clocks AS clock_payment
ON
    clock_payment.fun0Id = fun_0s.id AND clock_payment.state = 3
LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN fun_clocks AS clock_legal
ON
    clock_legal.fun0Id = fun_0s.id AND clock_legal.state = 5

    LEFT JOIN fun_clocks AS clock_law_asign ON clock_law_asign.fun0Id = fun_0s.id AND clock_law_asign.state = 11 AND clock_law_asign.version = 100
    LEFT JOIN fun_clocks AS clock_law_rev ON clock_law_rev.fun0Id = fun_0s.id AND clock_law_rev.state = 11 AND clock_law_rev.version = 200
    LEFT JOIN fun_clocks AS clock_law_inf ON clock_law_inf.fun0Id = fun_0s.id AND clock_law_inf.state = 11 AND clock_law_inf.version = 300     
    
    LEFT JOIN fun_clocks AS clock_eng_asign ON clock_eng_asign.fun0Id = fun_0s.id AND clock_eng_asign.state = 12 AND clock_eng_asign.version = 100
    LEFT JOIN fun_clocks AS clock_eng_rev ON clock_eng_rev.fun0Id = fun_0s.id AND clock_eng_rev.state = 12 AND clock_eng_rev.version = 200
    LEFT JOIN fun_clocks AS clock_eng_inf ON clock_eng_inf.fun0Id = fun_0s.id AND clock_eng_inf.state = 12 AND clock_eng_inf.version = 300     
    
    LEFT JOIN fun_clocks AS clock_arc_asign ON clock_arc_asign.fun0Id = fun_0s.id AND clock_arc_asign.state = 13 AND clock_arc_asign.version = 100
    LEFT JOIN fun_clocks AS clock_arc_rev ON clock_arc_rev.fun0Id = fun_0s.id AND clock_arc_rev.state = 13 AND clock_arc_rev.version = 200
    LEFT JOIN fun_clocks AS clock_arc_inf ON clock_arc_inf.fun0Id = fun_0s.id AND clock_arc_inf.state = 13 AND clock_arc_inf.version = 300  

LEFT JOIN fun_clocks AS clock_record_p1
ON
    clock_record_p1.fun0Id = fun_0s.id AND clock_record_p1.state = 30

    LEFT JOIN fun_clocks AS clock_not_0 ON clock_not_0.fun0Id = fun_0s.id AND clock_not_0.state = 31    
    LEFT JOIN fun_clocks AS clock_not_1 ON clock_not_1.fun0Id = fun_0s.id AND clock_not_1.state = 32   
    LEFT JOIN fun_clocks AS clock_not_2 ON clock_not_2.fun0Id = fun_0s.id AND clock_not_2.state = 33
    LEFT JOIN fun_clocks AS clock_record_postpone ON clock_record_postpone.fun0Id = fun_0s.id AND clock_record_postpone.state = 34  
    LEFT JOIN fun_clocks AS clock_corrections ON clock_corrections.fun0Id = fun_0s.id AND clock_corrections.state = 35 

LEFT JOIN fun_clocks AS clock_record_p2
ON
    clock_record_p2.fun0Id = fun_0s.id AND clock_record_p2.state = 49
LEFT JOIN fun_clocks AS clock_pay2
ON
    clock_pay2.fun0Id = fun_0s.id AND clock_pay2.state = 61

    LEFT JOIN fun_clocks AS clock_payments ON clock_payments.fun0Id = fun_0s.id AND clock_payments.state = 69 

LEFT JOIN fun_clocks AS clock_resolution
ON
    clock_resolution.fun0Id = fun_0s.id AND clock_resolution.state = 70
    LEFT JOIN fun_clocks AS clock_resolution_not_1
ON
clock_resolution_not_1.fun0Id = fun_0s.id AND clock_resolution_not_1.state = 72
    LEFT JOIN fun_clocks AS clock_resolution_not_2
ON
clock_resolution_not_2.fun0Id = fun_0s.id AND clock_resolution_not_2.state = 73
LEFT JOIN fun_clocks AS clock_ejecutoria
ON
    clock_ejecutoria.fun0Id = fun_0s.id AND clock_ejecutoria.state = 80
LEFT JOIN fun_clocks AS clock_license
ON
    clock_license.fun0Id = fun_0s.id AND clock_license.state = 99
LEFT JOIN record_laws ON record_laws.fun0Id = fun_0s.id AND record_laws.version = fun_0s.version
LEFT JOIN record_law_reviews ON record_law_reviews.recordLawId = record_laws.id AND record_law_reviews.version = record_laws.version
LEFT JOIN record_engs ON record_engs.fun0Id = fun_0s.id AND record_engs.version = fun_0s.version
LEFT JOIN record_eng_reviews ON record_eng_reviews.recordEngId = record_engs.id AND record_engs.version = record_eng_reviews.version
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id AND record_arcs.version = fun_0s.version
LEFT JOIN record_arc_38s ON record_arc_38s.recordArcId = record_arcs.id AND record_arc_38s.version = record_arcs.version

LEFT JOIN publications ON publications.id_publico = fun_0s.id_public

LEFT JOIN record_reviews ON  record_reviews.fun0Id = fun_0s.id 

WHERE
  fun_0s.id_public LIKE '${_id_public}'
  GROUP BY
    fun_0s.id_public
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


exports.loadPQRSxFUN = (req, res) => {
  const _fun0PublicId = req.params.fun0PublicId;
  const { QueryTypes } = require('sequelize');
  var query = Queries.PQRSxFUN(_fun0PublicId);;

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

exports.getLastOA = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = Queries.getLastOAQuery;

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

exports.getLastIdPublic = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT MAX(fun_0s.id_public) AS id
  FROM fun_0s 
  WHERE fun_0s.id_public LIKE '${curaduriaInfo.serials.process}%'
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

exports.getLastIdPublicRes = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT MAX(expeditions.id_public) AS id
  FROM expeditions
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

exports.reportsQuery = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = Queries.reportsQuery(_date_sart, _date_end);

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

exports.reportsQuery_2 = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = Queries.reportsResume(_date_sart, _date_end, -106, 210);

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

exports.reportsFinance = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = Queries.reportsFinance(_date_sart, _date_end);

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

exports.reportsResume = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = Queries.reportsResume(_date_sart, _date_end);

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

exports.reporstPublicQuery = (req, res) => {
  const _id_start = req.params.id_start;
  const _id_end = req.params.id_end;
  const { QueryTypes } = require('sequelize');
  var query = Queries.reportsPublicQuery(_id_start, _id_end);

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

// GET
exports.findSearch = (req, res) => {
  const _field = req.params.field;
  const _string = req.params.string;

  console.log("CONSULT REQUESTED, FOR FIELD CODE & STRING VALUE: ", _field, _string);

  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT DISTINCT
  fun_0s.*, 
  fun_1s.tramite,
  fun_1s.tipo,
  fun_1s.m_urb,
  fun_1s.m_sub,
  fun_1s.m_lic,
  SUM(IF(fun_3s.state > 0, 1, 0)) as alerted,
  COUNT(fun_3s.id) as neighbours,
  fun_laws.report_data,
  fun_laws.report_cub,
  fun_laws.sign,
  seals.id as seal,

  clock_legal.date_start AS clock_date,
  clock_payment.date_start AS clock_payment,
  clock_exp.date_start AS clock_exp,
  clock_archive.date_start AS clock_archive,
  clock_close_1.date_start AS clock_close_1,
  clock_close_2.date_start AS clock_close_2,
  clock_close_3.date_start AS clock_close_3,
  clock_close_4.date_start AS clock_close_4,
  clock_pay2.date_start AS clock_pay2,
  clock_resolution.date_start AS clock_resolution,
  clock_license.date_start AS clock_license,

  clock_law_rew.resolver_context AS  clock_law_rew,
  clock_eng_rew.resolver_context AS  clock_eng_rew,
  clock_arc_rew.resolver_context AS  clock_arc_rew,

  record_law_reviews.check AS law_review, 
  record_eng_reviews.check AS eng_review,
  record_eng_reviews.check_2 AS eng_review_2,
  record_arc_38s.check AS arc_review,
  record_phs.check AS ph_review,

  record_reviews.check AS rec_review,
  record_reviews.check_2 AS rec_review_2
  
  FROM fun_0s
  
  LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id
  AND fun_1s.version = fun_0s.version
  
  LEFT JOIN fun_3s ON fun_3s.fun0Id = fun_0s.id
  LEFT JOIN fun_2s ON fun_2s.fun0Id = fun_0s.id
  LEFT JOIN fun_51s ON fun_51s.fun0Id = fun_0s.id
  LEFT JOIN fun_52s ON fun_52s.fun0Id = fun_0s.id
  LEFT JOIN fun_53s ON fun_53s.fun0Id = fun_0s.id

   LEFT JOIN fun_laws ON fun_laws.fun0Id = fun_0s.id
  
  LEFT JOIN fun_clocks AS clock_legal ON clock_legal.fun0Id = fun_0s.id
  AND clock_legal.state = 5
  
    LEFT JOIN fun_clocks AS clock_payment ON clock_payment.fun0Id = fun_0s.id
  AND clock_payment.state = 3

  LEFT JOIN fun_clocks AS clock_exp ON clock_exp.fun0Id = fun_0s.id
  AND clock_exp.state = 50

  LEFT JOIN fun_clocks AS clock_archive ON clock_archive.fun0Id = fun_0s.id
  AND clock_archive.state = 101

  LEFT JOIN fun_clocks AS clock_close_1 ON clock_close_1.fun0Id = fun_0s.id
  AND clock_close_1.state = -5 AND clock_close_1.version = -1

  LEFT JOIN fun_clocks AS clock_close_2 ON clock_close_2.fun0Id = fun_0s.id
  AND clock_close_2.state = -5 AND clock_close_2.version = -2

  LEFT JOIN fun_clocks AS clock_close_3 ON clock_close_3.fun0Id = fun_0s.id
  AND clock_close_3.state = -5 AND clock_close_3.version = -3

  LEFT JOIN fun_clocks AS clock_close_4 ON clock_close_4.fun0Id = fun_0s.id
  AND clock_close_4.state = -5 AND clock_close_4.version = -4

  # ------------ REVIEW CLOCKS -------------- #
  LEFT JOIN fun_clocks AS clock_law_rew ON clock_law_rew.fun0Id = fun_0s.id
  AND clock_law_rew.state = 11 AND clock_law_rew.version = 200

  LEFT JOIN fun_clocks AS clock_eng_rew ON clock_eng_rew.fun0Id = fun_0s.id
  AND clock_eng_rew.state = 12 AND clock_eng_rew.version = 200

  LEFT JOIN fun_clocks AS clock_arc_rew ON clock_arc_rew.fun0Id = fun_0s.id
  AND clock_arc_rew.state = 13 AND clock_arc_rew.version = 200
  # ----------------------------------------- #

  LEFT JOIN fun_clocks AS clock_pay2 ON clock_pay2.fun0Id = fun_0s.id
  AND clock_pay2.state = 61
  LEFT JOIN fun_clocks AS clock_resolution ON clock_resolution.fun0Id = fun_0s.id
  AND clock_resolution.state = 80
  LEFT JOIN fun_clocks AS clock_license ON clock_license.fun0Id = fun_0s.id
  AND clock_license.state = 99
  
  LEFT JOIN record_laws ON  record_laws.fun0Id = fun_0s.id
  LEFT JOIN record_law_reviews ON record_law_reviews.recordLawId = record_laws.id  
  AND record_law_reviews.version = record_laws.version
  
  LEFT JOIN record_engs ON  record_engs.fun0Id = fun_0s.id 
  LEFT JOIN record_eng_reviews ON record_eng_reviews.recordEngId = record_engs.id  
  AND record_engs.version = record_eng_reviews.version

  LEFT JOIN record_arcs ON  record_arcs.fun0Id = fun_0s.id
  LEFT JOIN record_arc_38s ON record_arc_38s.recordArcId = record_arcs.id  
  AND record_arcs.version = record_arc_38s.version

  LEFT JOIN record_phs ON  record_phs.fun0Id = fun_0s.id 

  LEFT JOIN record_reviews ON  record_reviews.fun0Id = fun_0s.id 

  LEFT JOIN seals ON seals.fun0Id = fun_0s.id
  
  `;
  var _search_query_definer = ` `;

  if (_field == 1) _search_query_definer += `WHERE fun_0s.id_public LIKE '%${_string}%'`
  if (_field == 2) _search_query_definer += `WHERE fun_2s.matricula LIKE '%${_string}%'`
  if (_field == 3) _search_query_definer += `WHERE fun_2s.catastral LIKE '%${_string}%'`
  if (_field == 4) _search_query_definer += `WHERE fun_2s.direccion LIKE '%${_string}%'`
  if (_field == 5) {
    _search_query_definer += `WHERE fun_51s.id_number LIKE '%${_string}%'
      OR fun_52s.id_number LIKE '%${_string}%'
      OR fun_53s.id_number LIKE '%${_string}%'`;
  }
  if (_field == 6) {
    _search_query_definer += `WHERE `;
    _search_query_definer += `
      concat_ws(' ', fun_51s.name, fun_51s.surname) LIKE '%${_string}%'
      OR concat_ws(' ', fun_52s.name, fun_52s.surname) LIKE '%${_string}%'
      OR concat_ws(' ', fun_53s.name, fun_53s.surname) LIKE '%${_string}%'
      `;
  }
  _search_query_definer += ` GROUP BY fun_0s.id DESC `

  query += _search_query_definer;

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

exports.getsearch = (req, res) => {
  const _id = req.params.field;
  const _state = req.params.string;

  console.log("CONSULT FOR CLOCK: ", _id, _state);

  if (_field == 1) {
    FUN_CLOCK.findAll({
      where: {
        fun0Id: _id,
        state: _state
      },
    })
      .then(data => {
        console.log("FOUND CLOCK: ", _id, _state);
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

exports.getFun1 = (req, res) => {
  const _id_public = req.params.id_public;
  FUN_0.findAll({
    include: [FUN_1],
    where: { id_public: _id_public },
  }
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

exports.findOneIdPublic = (req, res) => {
  const _id_public = req.params.id_public;
  var object = {}

  get_FUN_0(_id_public);

  function get_FUN_0(id) {
    FUN_0.findAll({
      where: { id_public: id }, include: [PH, RR,
        { model: ARC, include: ARCR },
        { model: LAW, include: LAWR },
        { model: ENG, include: ENGR }]
    })
      .then(data => { object = data[0].dataValues; get_FUN_1(object['id']); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_0 with ID=" + id + ':' + err }); });
  }

  function get_FUN_1(id) {
    FUN_1.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_1s'] = data; get_FUN_2(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_1 with ID=" + id }); });
  }

  function get_FUN_2(id) {
    FUN_2.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_2'] = data[0]; get_FUN_3(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_2 with ID=" + id }); });
  }

  function get_FUN_3(id) {
    FUN_3.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_3s'] = data; get_FUN_4(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_3 with ID=" + id }); });
  }

  function get_FUN_4(id) {
    FUN_4.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_4s'] = data; get_FUN_51(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_4 with ID=" + id }); });
  }

  function get_FUN_51(id) {
    FUN_51.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_51s'] = data; get_FUN_52(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_51 with ID=" + id }); });
  }

  function get_FUN_52(id) {
    FUN_52.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_52s'] = data; get_FUN_53(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_52 with ID=" + id }); });
  }

  function get_FUN_53(id) {
    FUN_53.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_53s'] = data; get_FUN_6(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_53 with ID=" + id }); });
  }

  function get_FUN_6(id) {
    FUN_6.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_6s'] = data; get_FUN_C(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_6 with ID=" + id }); });
  }

  function get_FUN_C(id) {
    FUN_C.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_cs'] = data; get_FUN_R(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_C with ID=" + id }); });
  }

  function get_FUN_R(id) {
    FUN_R.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_rs'] = data; get_FUN_LAW(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_R with ID=" + id }); });
  }

  function get_FUN_LAW(id) {
    FUN_LAW.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_law'] = data[0]; get_FUN_CLOCK(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_LAW with ID=" + id }); });
  }

  function get_FUN_CLOCK(id) {
    FUN_CLOCK.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_clocks'] = data; callBack(object); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_CLOCK with ID=" + id }); });
  }

  function get_FUN_ARCH(id) {
    FUN_ARCH.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_archives'] = data; callBack(object); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_ARCH with ID=" + id + ' : ' + err }); });
  }

  function get_LAWR(object) {
    if (object.record_law.id) {
      LAWR.findAll({ where: { recordLawId: object.record_law.id } })
        .then(data => { object.record_law.record_law_reviews = data; get_ARCR(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving LAWR with ID=" + id }); });
    } else {
      get_ARCR(object)
    }
  }

  function get_ARCR(object) {
    if (object.record_arc.id) {
      ARCR.findAll({ where: { recordArcId: object.record_arc.id } })
        .then(data => { object.record_arc.record_arc_38s = data; get_ENGR(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving ARCR with ID=" + id }); });
    } else {
      get_ENGR(object)
    }
  }

  function get_ENGR(object) {
    if (object.record_eng.id) {
      ENGR.findAll({ where: { recordEngId: object.record_eng.id } })
        .then(data => { object.record_eng.record_eng_reviews = data; callBack(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving ENGR with ID=" + id }); });
    } else {
      callBack(object)
    }
  }

  function callBack(object) {
    console.log('RETRIEVEING: GEN FOR FUN ', _id_public)
    res.json(object);
  }
};

exports.getClockdata = (req, res) => {
  const id = req.params.id;
  FUN_0.findByPk(id, {
    include: [FUN_1, FUN_3, FUN_53, FUN_6, FUN_LAW, FUN_CLOCK, PH, { model: ARC, include: [ARCR] }, { model: LAW, include: [LAWR] }],
    order: [[{ model: FUN_CLOCK, as: 'fun_clocks' }, 'date_start', 'ASC'],
    [{ model: FUN_CLOCK, as: 'fun_clocks' }, 'state', 'DESC'],
    [{ model: FUN_1, as: 'fun_1s' }, 'version', 'ASC']],
  })
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
exports.findOne = (req, res) => {
  const id = req.params.id;
  var object = {}

  get_FUN_0(id);

  function get_FUN_0(id) {
    FUN_0.findAll({ where: { id: id }, include: [PH, RR, EXP, { model: ARC, include: ARCR }, { model: LAW, include: LAWR }, { model: ENG, include: ENGR }] })
      .then(data => { object = data[0].dataValues; get_FUN_1(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_0 with ID=" + id + ':' + err }); });
  }

  function get_FUN_1(id) {
    FUN_1.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_1s'] = data; get_FUN_2(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_1 with ID=" + id }); });
  }

  function get_FUN_2(id) {
    FUN_2.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_2'] = data[0]; get_FUN_3(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_2 with ID=" + id }); });
  }

  function get_FUN_3(id) {
    FUN_3.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_3s'] = data; get_FUN_4(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_3 with ID=" + id }); });
  }

  function get_FUN_4(id) {
    FUN_4.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_4s'] = data; get_FUN_51(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_4 with ID=" + id }); });
  }

  function get_FUN_51(id) {
    FUN_51.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_51s'] = data; get_FUN_52(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_51 with ID=" + id }); });
  }

  function get_FUN_52(id) {
    FUN_52.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_52s'] = data; get_FUN_53(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_52 with ID=" + id }); });
  }

  function get_FUN_53(id) {
    FUN_53.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_53s'] = data; get_FUN_6(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_53 with ID=" + id }); });
  }

  function get_FUN_6(id) {
    FUN_6.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_6s'] = data; get_FUN_C(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_6 with ID=" + id }); });
  }

  function get_FUN_C(id) {
    FUN_C.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_cs'] = data; get_FUN_R(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_C with ID=" + id }); });
  }

  function get_FUN_R(id) {
    FUN_R.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_rs'] = data; get_FUN_LAW(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_R with ID=" + id }); });
  }

  function get_FUN_LAW(id) {
    FUN_LAW.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_law'] = data[0]; get_FUN_CLOCK(id); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_LAW with ID=" + id }); });
  }

  function get_FUN_CLOCK(id) {
    FUN_CLOCK.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_clocks'] = data; get_ARC_STEP(object); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_CLOCK with ID=" + id }); });
  }

  function get_FUN_ARCH(id) {
    FUN_ARCH.findAll({ where: { fun0Id: id } })
      .then(data => { object['fun_archives'] = data; callBack(object); })
      .catch(err => { res.status(500).send({ message: "Error retrieving FUN_ARCH with ID=" + id }); });
  }

  function get_LAWR(object) {
    if (object.record_law.id) {
      LAWR.findAll({ where: { recordLawId: object.record_law.id } })
        .then(data => { object.record_law.record_law_reviews = data; get_ARCR(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving LAWR with ID=" + id }); });
    } else {
      get_ARCR(object)
    }
  }

  function get_ARCR(object) {
    if (object.record_arc.id) {
      ARCR.findAll({ where: { recordArcId: object.record_arc.id } })
        .then(data => { object.record_arc.record_arc_38s = data; get_ENGR(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving ARCR with ID=" + id }); });
    } else {
      get_ENGR(object)
    }
  }

  function get_ENGR(object) {
    if (object.record_eng.id) {
      ENGR.findAll({ where: { recordEngId: object.record_eng.id } })
        .then(data => { object.record_eng.record_eng_reviews = data; get_ARC_STEP(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving ENGR with ID=" + id }); });
    } else {
      get_ARC_STEP(object)
    }
  }


  function get_ARC_STEP(object) {
    if (object.record_arc) {
      ARC_STEP.findAll({ where: { recordArcId: object.record_arc.id } })
        .then(data => { object.record_arc_steps = data; get_LAW_STEP(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving ARC_STEPS with ID=" + object.record_arc.id + ' ' + err }); });
    } else {
      get_LAW_STEP(object)
    }
  }

  function get_LAW_STEP(object) {
    if (object.record_law) {
      LAW_STEP.findAll({ where: { recordLawId: object.record_law.id } })
        .then(data => { object.record_law_steps = data; get_ENG_STEP(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving LAW_STEPS with ID=" + object.record_law.id + ' ' + err }); });
    } else {
      get_ENG_STEP(object)
    }
  }

  function get_ENG_STEP(object) {
    if (object.record_eng) {
      ENG_STEP.findAll({ where: { recordEngId: object.record_eng.id } })
        .then(data => { object.record_eng_steps = data; callBack(object); })
        .catch(err => { res.status(500).send({ message: "Error retrieving ENG_STEPS with ID=" + object.record_eng.id + ' ' + err }); });
    } else {
      callBack(object)
    }
  }

  function callBack(object) {
    console.log('RETRIEVEING: GEN FOR FUN ', id)
    res.json(object);
  }
};

exports.findOneFun6 = (req, res) => {
  const id = req.params.id;
  FUN_6.findOne({ where: { id: id } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving DATA with ID=" + id
      });
    });

};

exports.findIncompleteDocs = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = Queries.loadIncDocs();

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

exports.FindVrxFun6 = (req, res) => {
  const fun_id = req.params.fun_id;
  const vr_id = req.params.vr_id;

  FUN_6.findAll({
    where: { id_replace: vr_id },
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

// SPECIFIC CONSULTS
exports.consult_1 = (req, res) => {
  const _field = req.params.field;
  const _string = req.params.string;

  console.log("CONSULT REQUESTED, FOR FIELD CODE & STRING VALUE: ", _field, _string);

  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT DISTINCT
  fun_0s.id_public , fun_1s.tipo, fun_1s.tramite, fun_1s.m_urb, fun_1s.m_sub, fun_1s.m_lic
  FROM fun_0s
  LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id
  INNER JOIN seals ON seals.fun0Id = fun_0s.id  
  ORDER BY fun_0s.id_public ASC
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
  FUN_0.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_version = (req, res) => {
  const _fun0Id = (req.body.fun0Id != null ? req.body.fun0Id : res.send('NOT A REAL PARENT ID'));
  const _version = (req.body.version ? req.body.version : -1);
  const _law_id = (req.body.law_id != null ? req.body.law_id : res.send('NOT A REAL PARENT ID'));
  const _fun1Id = (req.body.fun1Id != null ? req.body.fun1Id : res.send('NOT A REAL PARENT ID'));
  const _fun2Id = (req.body.fun2Id != null ? req.body.fun2Id : res.send('NOT A REAL PARENT ID'));
  const _fun53Id = (req.body.fun53Id != null ? req.body.fun53Id : res.send('NOT A REAL PARENT ID'));
  const _funcId = (req.body.funcId != null ? req.body.funcId : res.send('NOT A REAL PARENT ID'));
  const _funrId = (req.body.funrId != null ? req.body.funrId : res.send('NOT A REAL PARENT ID'));
  // Create
  var object_law = {
    fun0Id: _fun0Id,
    sign: (req.body.sign != 'null' ? req.body.sign : null),
    new_type: (req.body.new_type != 'null' ? req.body.new_type : null),
    publish_neighbour: (req.body.publish_neighbour != 'null' ? req.body.publish_neighbour : null),
  }

  var object_fun0 = {
    version: _version,
    state: (req.body.state ? req.body.state : 1),
  }

  var object_fun1 = {
    fun0Id: _fun0Id,
    version: _version,
    tipo: (req.body.tipo != 'null' ? req.body.tipo : ""),
    tramite: (req.body.tramite != 'null' ? req.body.tramite : ""),
    m_urb: (req.body.m_urb != 'null' ? req.body.m_urb : ""),
    m_sub: (req.body.m_sub != 'null' ? req.body.m_sub : ""),
    m_lic: (req.body.m_lic != 'null' ? req.body.m_lic : ""),
    usos: (req.body.usos != 'null' ? req.body.usos : ""),
    area: (req.body.area != 'null' ? req.body.area : ""),
    vivienda: (req.body.vivienda != 'null' ? req.body.vivienda : ""),
    cultural: (req.body.cultural != 'null' ? req.body.cultural : ""),
    regla_1: (req.body.regla_1 != 'null' ? req.body.regla_1 : ""),
    regla_2: (req.body.regla_2 != 'null' ? req.body.regla_2 : ""),
  }

  var object_fun2 = {
    fun0Id: _fun0Id,
    direccion: (req.body.direccion != 'null' ? req.body.direccion : ""),
    direccion_ant: (req.body.direccion_ant != 'null' ? req.body.direccion_ant : ""),
    matricula: (req.body.matricula != 'null' ? req.body.matricula : ""),
    catastral: (req.body.catastral != 'null' ? req.body.catastral : ""),
    suelo: (req.body.suelo != 'null' ? req.body.suelo : ""),
    lote_pla: (req.body.lote_pla != 'null' ? req.body.lote_pla : ""),
    barrio: (req.body.barrio != 'null' ? req.body.barrio : ""),
    vereda: (req.body.vereda != 'null' ? req.body.vereda : ""),
    comuna: (req.body.comuna != 'null' ? req.body.comuna : ""),
    sector: (req.body.sector != 'null' ? req.body.sector : ""),
    estrato: (req.body.estrato != 'null' ? req.body.estrato : ""),
    corregimiento: (req.body.corregimiento != 'null' ? req.body.corregimiento : ""),
    manzana: (req.body.manzana != 'null' ? req.body.manzana : ""),
    lote: (req.body.lote != 'null' ? req.body.lote : ""),
  }

  var object_fun53 = {
    fun0Id: _fun0Id,
    version: _version,
    name: (req.body.name != 'null' ? req.body.name : ""),
    surname: (req.body.surname != 'null' ? req.body.surname : ""),
    id_number: (req.body.id_number != 'null' ? req.body.id_number : ""),
    role: (req.body.role != 'null' ? req.body.role : ""),
    email: (req.body.email != 'null' ? req.body.email : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),
    number: (req.body.number != 'null' ? req.body.number : ""),
  }

  var object_fun_c = {
    fun0Id: _fun0Id,
    version: _version,
    date: (req.body.date != 'null' ? req.body.date : null),
    worker: (req.body.worker != 'null' ? req.body.worker : null),
    condition: (req.body.condition != 'null' ? req.body.condition : null),
    reciever_name: (req.body.reciever_name != 'null' ? req.body.reciever_name : ""),
    reciever_date: (req.body.reciever_date != 'null' ? req.body.reciever_date : null),
    reciever_id: (req.body.reciever_id != 'null' ? req.body.reciever_id : ""),
    reciever_actor: (req.body.reciever_actor != 'null' ? req.body.reciever_actor : ""),
    details: (req.body.details ? req.body.details != 'null' : ""),
  }

  var object_fun_r = {
    fun0Id: _fun0Id,
    version: _version,
    checked: (req.body.checked != 'null' ? req.body.checked : null),
    code: (req.body.code != 'null' ? req.body.code : null),
  }

  console.log("UPDATING VERSION", _version)

  FUN_0.update(object_fun0, {
    where: { id: _fun0Id }
  }).then(num => {
    if (num == 1) {
      create_version_fun_1();
    } else {
      res.send(`ERROR_2, fun0`); // NO MATCHING ID
    }
  })

  function create_version_fun_1() {
    FUN_1.update(object_fun1, {
      where: { id: _fun1Id }
    })
      .then(data => {
        console.log("UPDATING FUN 1 VERSION");
        create_version_fun_2();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function create_version_fun_2() {
    FUN_2.update(object_fun2, {
      where: { id: _fun2Id }
    })
      .then(data => {
        console.log("UPDATING FUN 2 VERSION");
        create_version_fun_53();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function create_version_fun_53() {
    FUN_53.update(object_fun53, {
      where: { id: _fun53Id }
    })
      .then(data => {
        console.log("UPDATING FUN 53 VERSION");
        create_version_fun_c();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }

  function create_version_fun_c() {
    FUN_C.update(object_fun_c, {
      where: { id: _funcId }
    })
      .then(data => {
        console.log("UPDATING FUN C VERSION");
        create_version_fun_r();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while executing CREATE."
        });
      });
  }


  function create_version_fun_r() {
    FUN_R.update(object_fun_r, {
      where: { id: _funrId }
    }).then(num => {
      if (num == 1) {
        console.log("UPDATING FUN R VERSION");
        udate_law();
      } else {
        res.send(`ERROR_2, funr`); // NO MATCHING ID
      }
    })
  }

  function udate_law() {
    FUN_LAW.update(object_law, {
      where: { id: _law_id }
    }).then(num => {
      if (num == 1) {
        console.log("UPDATING FUN LAW");
        res.send('OK');
      } else {
        res.send(`ERROR_2, funlaw`); // NO MATCHING ID
      }
    })
  }


};


// PUT
exports.update_1 = (req, res) => {
  const id = req.params.id;
  FUN_1.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_2 = (req, res) => {
  const id = req.params.id;
  FUN_2.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_3 = (req, res) => {
  const id = req.params.id;

  const new_id = (req.body.new_id);
  const prev_id = (req.body.prev_id);

  if (new_id && new_id != 'false') {
    req.body.id_cub = new_id;
    const { QueryTypes } = require('sequelize');
    var query = Queries.validateLastCUBQuery(new_id, prev_id);

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length > 0) res.send("ERROR_DUPLICATE");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving ALL DATA."
        });
      });
  } else if (new_id === 'false') req.body.id_cub = "";

  FUN_3.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_51 = (req, res) => {
  const id = req.params.id;
  FUN_51.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_52 = (req, res) => {
  const id = req.params.id;
  FUN_52.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_53 = (req, res) => {
  const id = req.params.id;
  FUN_53.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_6 = (req, res) => {
  const id = req.params.id;
  var attached = req.body.attached == 'true' ? true : false;

  if (attached) {
    FUN_6.findAll({
      where: { id: id },
      attributes: ['path', 'filename'],
    }).then(data => {
      fs.unlink(data[0].path + '/' + data[0].filename, (err) => {
        console.log('FILE FOR ATTACH, DETELED! THIS IS FOR EDIT', id);
        req.body.filename = req.files[0].filename,
          req.body.path = req.files[0].path.substring(0, req.files[0].path.lastIndexOf('/'))
        update();
        if (err) res.send(err);
      });
    })
  } else {
    update();
  }

  function update() {
    FUN_6.update(req.body, {
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

exports.update_6_h = (req, res) => {
  const id = req.params.id;
  FUN_6_H.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.update_c = (req, res) => {
  const id = req.params.id;
  FUN_C.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })

};


// PUT
exports.update_r = (req, res) => {
  const id = req.params.id;
  FUN_R.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.updateclock = (req, res) => {
  const id = req.params.id;
  FUN_CLOCK.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.updatelaw = (req, res) => {
  const id = req.params.id;

  const aim_cub = req.body.aim_cub ? req.body.aim_cub : 'report_cub';
  const new_id = (req.body.new_id);
  const prev_id = (req.body.prev_id);

  if (new_id && new_id !== 'false') {
    req.body[aim_cub] = new_id;
    const { QueryTypes } = require('sequelize');
    var query = Queries.validateLastCUBQuery(new_id, prev_id);

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length > 0) return res.send("ERROR_DUPLICATE");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving ALL DATA."
        });
      });
  } else if (new_id === 'false') req.body[aim_cub] = "";

  FUN_LAW.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.update_archive = (req, res) => {
  const id = req.params.id;
  FUN_ARCH.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// PUT
exports.perform_review_c = (req, res) => {
  const _fun0Id = req.params.id;

  var object_fun0 = {
    version: (req.body.version != 'null' ? req.body.version : null),
    state: (req.body.state != 'null' ? req.body.state : null),
  }

  console.log("PERFORMING REVIEW C FOR: ", _fun0Id);
  FUN_0.update(object_fun0, {
    where: { id: _fun0Id }
  }).then(num => {
    if (num == 1) {
      console.log("REVIEW C FOR FUN 0 DONE");
      res.send('OK');
    } else {
      res.send(`ERROR_2, fun0`); // NO MATCHING ID
    }
  })

};


// DELETE BY ID
exports.delete = (req, res) => {
  res.json({ message: "This is DELETE BY ID!" });
};

// DELETE BY ID
exports.delete_3 = (req, res) => {
  const id = req.params.id;
  FUN_3.destroy({
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

// DELETE BY ID
exports.delete_4 = (req, res) => {
  const id = req.params.id;
  FUN_4.destroy({
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

// DELETE BY ID
exports.delete_51 = (req, res) => {
  const id = req.params.id;
  FUN_51.destroy({
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

// DELETE BY ID
exports.delete_52 = (req, res) => {
  const id = req.params.id;
  FUN_52.destroy({
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

// DELETE BY ID
exports.delete_6 = (req, res) => {
  const id = req.params.id;

  FUN_6.findAll({
    where: { id: id },
    attributes: ['path', 'filename'],
  }).then(data => {
    fs.unlink(data[0].path + '/' + data[0].filename, (err) => {
      console.log('FILE FOR ATTACH, DETELED!', id);
      deleteObj();
      if (err) res.send(err);
    });
  })

  function deleteObj() {
    FUN_6.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send('OK');
        } else {
          res.send(`ERROR_2`); // NO MATCHING ID
        }
      })
  }
};

exports.delete_6_h = (req, res) => {
  const id = req.params.id;

  FUN_6_H.destroy({
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

exports.delete_clock = (req, res) => {
  const id = req.params.id;
  FUN_CLOCK.destroy({
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



// GEN DOCOS - CONFIRM
exports.gendoc_confirm = (req, res) => {
  // Create
  var _DATA = {
    date: (req.body.date != 'null' ? req.body.date : ""),
    pay_date: (req.body.pay_date != 'null' ? req.body.pay_date : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
    id_cub: (req.body.id_cub != 'null' ? req.body.id_cub : ""),
    name: (req.body.name != 'null' ? req.body.name : ""),
    id_number: (req.body.id_number != 'null' ? req.body.id_number : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),
    address_2: (req.body.address_2 != 'null' ? req.body.address_2 : ""),
    email: (req.body.email != 'null' ? req.body.email : ""),
    city: (req.body.city != 'null' ? req.body.city : ""),
    predial: (req.body.predial != 'null' ? req.body.predial : ""),
    matricula: (req.body.matricula != 'null' ? req.body.matricula : ""),
    type: (req.body.type != 'null' ? req.body.type : ""),
    date_doc: (req.body.date_doc != 'null' ? req.body.date_doc : ""),
    actor_name: (req.body.actor_name != 'null' ? req.body.actor_name : ""),
    digital_firm: (req.body.digital_firm == 'true' ? true : false),
    cub: (req.body.cub ? req.body.cub : ''),
    law_option: ((req.body.law_option ? req.body.law_option : 1)),
    type_not: (req.body.type_not ? req.body.type_not : 0),
    type_not_name: (req.body.type_not_name ? req.body.type_not_name : ''),
  }
  if (curaduriaInfo.id == "cup1") _PDFGEN_DOCCONFIRM_CUP1(_DATA);
  else _PDFGEN_DOCCONFIRM(_DATA);
  res.send('OK');
};

exports.gendoc_confirminc = (req, res) => {
  // Create
  var _DATA = {
    date: (req.body.date != 'null' ? req.body.date : ""),
    date_limit: (req.body.date_limit != 'null' ? req.body.date_limit : ""),
    date_doc: (req.body.date_doc != 'null' ? req.body.date_doc : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
    name: (req.body.name != 'null' ? req.body.name : ""),
    city: (req.body.city != 'null' ? req.body.city : ""),
    email: (req.body.email != 'null' ? req.body.email : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),
    type: (req.body.type != 'null' ? req.body.type : ""),
    missing: (req.body.missing != 'null' ? req.body.missing : ""),

    digital_firm: (req.body.digital_firm == 'true' ? true : false),
    cub: (req.body.cub ? req.body.cub : ''),
  }
  if (curaduriaInfo.id == "cup1") _PDFGEN_DOCCONFIRMINC_CUP1(_DATA);
  else _PDFGEN_DOCCONFIRMINC(_DATA);


  res.send('OK');
};

// GEN DOCOS - NEIGHBOUT - CONFIRM
exports.gendoc_nconfirm = (req, res) => {
  // Create
  var _DATA = {
    date: (req.body.date != 'null' ? req.body.date : ""),
    pay_date: (req.body.pay_date != 'null' ? req.body.pay_date : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
    id_cub: (req.body.id_cub != 'null' ? req.body.id_cub : ""),
    owner: (req.body.owner != 'null' ? req.body.owner : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),
    city: (req.body.city != 'null' ? req.body.city : ""),
    predial: (req.body.predial != 'null' ? req.body.predial : ""),
    matricula: (req.body.matricula != 'null' ? req.body.matricula : ""),
    type: (req.body.type != 'null' ? req.body.type : ""),
    list: (req.body.list == 'true' ? true : false),
    description: (req.body.description != 'null' ? req.body.description : ""),
    address_n: (req.body.address_n != 'null' ? req.body.address_n : ""),
    neighbour: (req.body.neighbour != 'null' ? req.body.neighbour : ""),
    address_multiple: (req.body.address_multiple != 'null' ? req.body.address_multiple.split(",") : []),
    address_multiple_cubs: (req.body.address_multiple_cubs != 'null' ? req.body.address_multiple_cubs.split(",") : []),
    digital_firm: (req.body.digital_firm == 'true' ? true : false),
    usos: (req.body.usos != 'null' ? req.body.usos : ""),
  }
  if (curaduriaInfo.id == "cup1") _PDFGEN_NEIGHBOUR_CONFIRM_CUP1(_DATA)
  else _PDFGEN_NEIGHBOUR_CONFIRM(_DATA);

  res.send('OK');
};

exports.gendoc_npublish = (req, res) => {
  // Create
  var _DATA = {
    date: (req.body.date != 'null' ? req.body.date : ""),
    pay_date: (req.body.pay_date != 'null' ? req.body.pay_date : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
    owner: (req.body.owner != 'null' ? req.body.owner : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),
    city: (req.body.city != 'null' ? req.body.city : ""),
    predial: (req.body.predial != 'null' ? req.body.predial : ""),
    matricula: (req.body.matricula != 'null' ? req.body.matricula : ""),
    type: (req.body.type != 'null' ? req.body.type : ""),
    list: (req.body.list == 'true' ? true : false),
    description: (req.body.description != 'null' ? req.body.description : ""),
    address_n: (req.body.address_n != 'null' ? req.body.address_n : ""),
    digital_firm: (req.body.digital_firm == 'true' ? true : false),
    usos: (req.body.usos != 'null' ? req.body.usos : ""),
  }
  if (curaduriaInfo.id == "cup1") _PDFGEN_NEIGHBOUR_PUBLISH_CUP1(_DATA)
  else _PDFGEN_NEIGHBOUR_PUBLISH(_DATA);
  res.send('OK');
};

exports.gendoc_planing = (req, res) => {
  // Create
  var _DATA = {
    date: (req.body.date != 'null' ? req.body.date : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
    id_cub: (req.body.id_cub != 'null' ? req.body.id_cub : ""),

    owner: (req.body.owner != 'null' ? req.body.owner : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),
    city: (req.body.city != 'null' ? req.body.city : ""),
    neighbour: (req.body.neighbour != 'null' ? req.body.neighbour : ""),
    catastral: (req.body.catastral != 'null' ? req.body.catastral : ""),
    responsable: (req.body.responsable != 'null' ? req.body.responsable : ""),
    number: (req.body.number != 'null' ? req.body.number : ""),
    type: (req.body.type != 'null' ? req.body.type : ""),

    notations: (req.body.notations != 'null' ? req.body.notations : ""),

    b1: (req.body.b1 != 'null' ? req.body.b1 : ""),
    b2: (req.body.b2 != 'null' ? req.body.b2 : ""),
    b3: (req.body.b3 != 'null' ? req.body.b3 : ""),
    b4: (req.body.b4 != 'null' ? req.body.b4 : ""),
    b5: (req.body.b5 != 'null' ? req.body.b5 : ""),
    b6: (req.body.b6 != 'null' ? req.body.b6 : ""),
    b7: (req.body.b7 != 'null' ? req.body.b7 : ""),
    b8: (req.body.b8 != 'null' ? req.body.b8 : ""),
    b9: (req.body.b9 != 'null' ? req.body.b9 : ""),
    b10: (req.body.b10 != 'null' ? req.body.b10 : ""),
  }
  _PDFGEN_PLANING_LETTER(_DATA);
  res.send('OK');
};

exports.gendoc_sign = (req, res) => {
  // Create
  var _DATA = {
    date: (req.body.date != 'null' ? req.body.date : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : " "),
    address: (req.body.address != 'null' ? req.body.address : " "),
    type: (req.body.type != 'null' ? req.body.type : " "),
    solicitor: (req.body.solicitor != 'null' ? req.body.solicitor : " "),
    height: (req.body.height != 'null' ? req.body.height : " "),
    size: (req.body.size != 'null' ? req.body.size : " "),
    use: (req.body.use != 'null' ? req.body.use : " "),
    color: (req.body.color != 'null' ? req.body.color : ""),
    text: (req.body.text != 'null' ? req.body.text : " "),
    daten: (req.body.daten != 'null' ? req.body.daten : false),

    res_id: (req.body.res_id != 'null' ? req.body.res_id : ''),
    res_date: (req.body.res_date != 'null' ? req.body.res_date : ''),
    res_exp_date_1: (req.body.res_exp_date_1 != 'null' ? req.body.res_exp_date_1 : ''),
    res_exp_date_2: (req.body.res_exp_date_2 != 'null' ? req.body.res_exp_date_2 : ''),
    area: (req.body.area != 'null' ? req.body.area : ''),
    parking: (req.body.parking != 'null' ? req.body.parking : ' '),
    otheruse: (req.body.otheruse != 'null' ? req.body.otheruse : ' '),
    sign_type: (req.body.sign_type != 'null' ? req.body.sign_type : 1),

    between_months: (req.body.between_months != 'null' ? req.body.between_months : ' '),
    writen_months: (req.body.writen_months != 'null' ? req.body.writen_months : ' '),
  }
  _PDFGEN_SIGN(_DATA);
  res.send('OK');
};

exports.gendoc_checkcontrol = (req, res) => {
  var _DATA = {
    title_doc: (req.body.title_doc != 'null' ? req.body.title_doc : ''),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ''),
    title_id: (req.body.title_id != 'null' ? req.body.title_id : ''),
    number_doc: (req.body.number_doc != 'null' ? req.body.number_doc : ''),
    name_doc: (req.body.name_doc != 'null' ? req.body.name_doc : ''),
    pages_doc: (req.body.pages_doc != 'null' ? req.body.pages_doc : ''),
    code_doc: (req.body.code_doc != 'null' ? req.body.code_doc : ''),
    select_doc: (req.body.select_doc != 'null' ? req.body.select_doc : ''),

    serie_cod: (req.body.serie_cod != 'null' ? req.body.serie_cod : ' '),
    serie_str: (req.body.serie_str != 'null' ? req.body.serie_str : ' '),
    subserie_cod: (req.body.subserie_cod != 'null' ? req.body.subserie_cod : ' '),
    subserie_str: (req.body.subserie_str != 'null' ? req.body.subserie_str : ' '),
  }
  _PDFGEN_CHECKCONTROL(_DATA);
  res.send('OK');
};
exports.gendoc_checkcontrol_2 = (req, res) => {
  var _DATA = getJSON_Simple(req.body.data)
  _PDFGEN_CHECKCONTROL_2(_DATA);
  res.send('OK');
};
exports.gendoc_stickerarchive = (req, res) => {
  // Create
  var _DATA = {
    serie_str: (req.body.serie_str ? req.body.serie_str : ' '),
    serie_cod: (req.body.serie_cod ? req.body.serie_cod : ' '),
    subserie_str: (req.body.subserie_str ? req.body.subserie_str : ' '),
    subserie_cod: (req.body.subserie_cod ? req.body.subserie_cod : ' '),
    id_public: (req.body.id_public ? req.body.id_public : ' '),
    resolution: (req.body.resolution ? req.body.resolution : ' '),
    titular: (req.body.titular ? req.body.titular : ' '),

    date_1: (req.body.date_1 ? req.body.date_1 : ' '),
    date_2: (req.body.date_2 ? req.body.date_2 : ' '),
    folder: (req.body.folder ? req.body.folder : ' '),
    pages: (req.body.pages ? req.body.pages : ' '),
    box: (req.body.box ? req.body.box : ' '),
    row: (req.body.row ? req.body.row : ' '),
    column: (req.body.column ? req.body.column : ' '),
  }
  _PDFGEN_STICKER_ARCHIVE(_DATA);
  res.send('OK');
};

exports.gendoc_abdicate = (req, res) => {
  // Create
  var _DATA = {
    date_string: (req.body.date_string ? req.body.date_string : ' '),
    date_year: (req.body.date_year ? req.body.date_year : ' '),
    time_string: (req.body.time_string ? req.body.time_string : ' '),
    time_hour: (req.body.time_hour ? req.body.time_hour : ' '),
    time_min: (req.body.time_min ? req.body.time_min : ' '),
    f51_name: (req.body.f51_name ? req.body.f51_name : ' '),
    f51_id_number: (req.body.f51_id_number ? req.body.f51_id_number : ' '),
    f51_role: (req.body.f51_role ? req.body.f51_role : ' '),
    id_res: (req.body.id_res ? req.body.id_res : ' '),
    id_public: (req.body.id_public ? req.body.id_public : ' '),
    date_string_2: (req.body.date_string_2 ? req.body.date_string_2 : ' '),
    date_year_2: (req.body.date_year_2 ? req.body.date_year_2 : ' '),
    cur_id: (req.body.cur_id ? req.body.cur_id : ''),
    adbdicate: (req.body.adbdicate === "true" ? true : false),
    resources: (req.body.resources ? req.body.resources.split(",") : [0, 0]),
    cur_id: (req.body.cur_id ? req.body.cur_id : ''),
    date_ll: (req.body.date_ll ? req.body.date_ll : ''),
    date_ll_2: (req.body.date_ll_2 ? req.body.date_ll_2 : ''),
    name_not: (req.body.name_not ? req.body.name_not : ''),
    role_not: (req.body.role_not ? req.body.role_not : ''),
  }
  if (curaduriaInfo.id == "cup1") _PDFGEN_ABDICATE_CP1(_DATA);
  else _PDFGEN_ABDICATE(_DATA);
  res.send('OK');
};

// GENERAL CONSULTS

exports.consult_cubDictionary = (req, res) => {

  console.log("CONSULT REQUESTED, FOR CUB DICTIONARY",);
  const id_related = req.params.id_related ? req.params.id_related : false;

  const { QueryTypes } = require('sequelize');
  var query = Queries.getCubDictionary1(id_related);
  console.log(query)

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

exports.consult_getCubDictionaryFiltrate = (req, res) => {

  console.log("CONSULT REQUESTED, FOR CUB DICTIONARY FILTRATE BY PARAMS",);
  const id_related = req.params.id_related ? req.params.id_related : false;
  const search = req.params.search ? req.params.search : false;
  const num = req.params.num ? req.params.num : false;

  const { QueryTypes } = require('sequelize');
  var query = Queries.getCubDictionaryFiltrate(search, num, id_related);

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

exports.consult_getCubDictionaryFiltrate = (req, res) => {

  console.log("CONSULT REQUESTED, FOR CUB DICTIONARY FILTRATE BY PARAMS",);
  const id_related = req.params.id_related ? req.params.id_related : false;
  const search = req.params.search ? req.params.search : false;
  const num = req.params.num ? req.params.num : false;

  const { QueryTypes } = require('sequelize');
  var query = Queries.getCubDictionaryFiltrate(search, num, id_related);

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

exports.consult_funDictionary = (req, res) => {

  console.log("CONSULT REQUESTED, FOR FUN DICTIONARY",);

  const { QueryTypes } = require('sequelize');
  var query = Queries.getFunDictionary;


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

exports.consult_vrDictionary = (req, res) => {

  console.log("CONSULT REQUESTED, FOR FUN DICTIONARY",);

  const { QueryTypes } = require('sequelize');
  var query = Queries.getVRDictionary;


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

exports.consult_Profesional = (req, res) => {
  const _name = req.params.name;
  console.log("CONSULT REQUESTED, SEARCH PROFESIONAL: ", _name);

  const { QueryTypes } = require('sequelize');
  var query = Queries.loadProfesional(_name);


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

exports.consult_Profesionals = (req, res) => {
  const _name = req.params.name;
  console.log("CONSULT REQUESTED, SEARCH ALL PROFESIONALS: ", _name);

  const { QueryTypes } = require('sequelize');
  var query = Queries.getProfDictionary;


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

exports.consult_OcDictionary = (req, res) => {

  console.log("CONSULT REQUESTED, FOR OC DICTIONARY",);

  const { QueryTypes } = require('sequelize');
  var query = Queries.getOcDictionary;


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

exports.consult_OutDictionary = (req, res) => {

  console.log("CONSULT REQUESTED, FOR OUT DICTIONARY",);

  const { QueryTypes } = require('sequelize');
  var query = Queries.getOutDictionary;


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

// EMAILS FOR NEGATIVE PROCESS 
exports.email_6 = (req, res) => {
  const email_body = (req.body.email_body ? req.body.email_body : res.send('NOT VALID EMAIL BODY'));
  const email_list = (req.body.email_list ? req.body.email_list : res.send('NOT VALID EMAIL LIST'));

  const attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);;

  // CREATES AN ARRAY WITH ALL THE ATTACHED FILES AND THEN ATTACHS THEM IN THE EMAIL.
  // IT DOES NOT SAVES THIS FILE, ALTHOUT IT MAY CHANGE IN THE FUTURE
  // AFTER IT SENDS THE EMAILS THE SYSTEM MUST DELETE THEM
  var attachEmailFilesPaths = [];
  var attachEmailFilesTypes = [];
  for (var i = 0; i < attachs_length; i++) {
    var mimetype = req.files[i].mimetype;
    if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
      fs.unlink(req.files[i].path, (err) => {
        console.log('FILE NOT COMPATIBLE, DETELED!');
        if (err) res.send(err);
      });
      res.send('ERROR_2 - FILE NOT COMPATIBLE')
    } else {
      attachEmailFilesPaths.push(req.files[i].path);
      attachEmailFilesTypes.push(req.files[i].filename.split('.').pop());
    }
  }


  console.log('ATTEMTING TO SEND AN EAIL TO:', email_list);

  let transporter = nodemailer.createTransport(
    mailerConfig.transporter
  );
  let mailOptions = mailerConfig.mailOptions.pqrs;
  mailOptions.from = 'Curaduria Urbana N° 1 de Bucaramanga <noreply@curaduria1bucaramanga.com>';
  mailOptions.to = email_list;
  mailOptions.subject = "CITACION PARA NOTIFICACION PERSONAL";
  mailOptions.cc = 'sentfun@curaduria1bucaramanga.com';
  mailOptions.html = email_body;
  mailOptions.dsn = {
    id: 'STATUS DELIVERY',
    return: 'headers',
    notify: ['failure', 'delay'],
    recipient: 'nodelivery@curaduria1bucaramanga.com'
  }

  if (attachEmailFilesPaths) {
    mailOptions.attachments = [];
  }
  for (var i = 0; i < attachEmailFilesPaths.length; i++) {
    const attach = {
      path: attachEmailFilesPaths[i],
      filename: "documento_anexo_" + i + 1 + "." + attachEmailFilesTypes[i],
    };
    mailOptions.attachments.push(attach);
  }

  transporter.sendMail(mailOptions, function (info, err) {
    if (info) {
      console.log("OK, Message Sent to: ", info);
    }
    if (err) {
      if (err.accepted) {
        console.log("Err, Message Sent to: ", err.accepted);
      } else if (err.rejected) {
        console.log("Err, Message could NOT be send: ", err.rejected);
      }
    }
    if (attachEmailFilesPaths.length) {
      deleteAttachForEmails();
    } else {
      res.send('OK');
    }
  });


  function deleteAttachForEmails() {
    console.log("EMAIL SENT, NOW DELETING ATTACHS");
    for (var i = 0; i < attachEmailFilesPaths.length; i++) {
      fs.unlink(attachEmailFilesPaths[i], (err) => {
        if (err) res.send(err);
      });
    }
    res.send('OK');
  }

};

// DELETE ALL
exports.deleteAll = (req, res) => {
  res.json({ message: "This is DELETE ALL!" });
};

function dateParser(date) {
  const moment = require('moment');
  let esLocale = require('moment/locale/es');
  var momentLocale = moment(date, 'YYYY-MM-DD').locale('es', esLocale);
  return momentLocale.format("LL")
}

function _PDFGEN_DOCCONFIRM(_DATA) {
  const PDFDocument = require('pdfkit');

  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 85,
      right: 56
    },
    bufferPages: true,
  });
  let JSON_actor = { A: "Titular", B: "Apoderado", C: "Mandatario" }

  const _BODY = `Que ${_DATA.name}  identificado(s) con la(s) cedula(s) ${_DATA.id_number} respectivamente. 
  ${JSON_actor[_DATA.actor_name]} de la solicitud del predio localizado en ${_DATA.address_2} del Municipio de ${_DATA.city}, 
  con número ${_DATA.predial} presento ante la ${curaduriaInfo.name2} ${_DATA.type}.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `Que la radicación de la solicitud de licencia, dio cumplimiento a todos los documentos y requisitos que se deben 
  aportar de acuerdo con el artículo 2.2.6.1.2.1.1 del Decreto 1077 de 2015, para su cumplimiento en legal y debida forma.`.replace(/[\n\r]+ */g, ' ');

  const _BODY3 = `Nota: Esta solicitud de licencia será sometida al proceso de revisión por parte del grupo interdiciplinario de esta 
  curaduria a fin de establecer su viabilidad.`.replace(/[\n\r]+ */g, ' ');



  doc.pipe(fs.createWriteStream('./docs/public/output_funconfirm.pdf'));

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

  doc.fontSize(11);
  doc.text('\n\n\n');
  doc.font('Helvetica-Bold');
  doc.font('Helvetica')
  doc.fontSize(11).text(_DATA.city + ", " + dateParser(_DATA.date_doc));
  doc.text('\n');
  doc.text('Señore(s)');
  doc.font('Helvetica-Bold')
  doc.text(_DATA.name);
  if (_DATA.email) doc.text(_DATA.email);
  if (_DATA.address) doc.text(_DATA.address);
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(`Asunto: Radicación en legal y debida forma radicado No. `, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(_DATA.id_public,);
  doc.font('Helvetica')
  doc.text('Respetado señor(a):');
  doc.text('\n');
  doc.font('Helvetica')
  doc.fontSize(11).text(_BODY, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY2, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY3, { align: 'justify' });
  doc.fontSize(11).text('\n\n\n');
  doc.fontSize(11).text("Se declara en legal y debida forma desde el día: " + dateParser(_DATA.date) + ".");
  doc.fontSize(11).text('\n\n\n\n\n\n');
  doc.font('Helvetica-Bold')
  _DATA.law_option === 1 ? doc.fontSize(13).text(curaduriaInfo.law) : doc.fontSize(13).text(curaduriaInfo.law_2);
  doc.fontSize(11).text(curaduriaInfo.lawt);

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

  pdfSupport.setHeader(doc, { title: 'DECLARACIÓN EN LEGAL Y DEBIDA FORMA', id_public: _DATA.cub, icon: true });

  doc.end();
  return true;
}

function _PDFGEN_DOCCONFIRM_CUP1(_DATA) {
  const PDFDocument = require('pdfkit');

  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 95,
      bottom: 85,
      left: 85,
      right: 56
    },
    bufferPages: true,
  });

  const _BODY = `Por medio de la presente, me permito comunicarle que su solicitud de ${_DATA.type} 
      con el número de radicación (${_DATA.id_public}) presentada ante la suscrita Curadora 
      Urbana el día ${_DATA.date} ha sido recibida en legal y debida forma, conforme a lo 
      dispuesto en el Artículo 2.2.6.1.2.1.1 del Decreto 1077 de 2015, sin perjuicio de que pueda estar sujeto 
      a posteriores correcciones.`.replace(/[\n\r]+ */g, ' ');



  const _BODY2 = `En relación con lo anterior, y de acuerdo con el Artículo 2.2.6.1.2.2.1 del mismo decreto, le informo 
      que, dentro de los cinco (5) días hábiles siguientes a la radicación, es decir, hasta el día ${dateParser_finalDate(_DATA.date, 5)}, 
      debe instalar una valla o aviso informativo que cumpla con las siguientes 
      especificaciones:`.replace(/[\n\r]+ */g, ' ');

  const _BODY3 = `En cuanto a las dimensiones y características, para proyectos de parcelación, urbanización o 
      construcción general, se requiere una valla de 1.00 metro de alto por 0.70 metros de ancho, con 
      fondo amarillo y letras negras, legible desde la vía pública. Si su proyecto corresponde a vivienda de 
      interés social, ampliación, adecuación, restauración, demolición o modificación en propiedad horizontal, 
      el aviso deberá medir 0.30 metros por 0.50 metros y estar ubicado en la cartelera principal del edificio 
      o en un lugar visible determinado por la administración.`.replace(/[\n\r]+ */g, ' ');

  const _BODY4 = `Respecto al contenido obligatorio, la valla o aviso debe incluir de manera clara: el número de 
      radicación, la fecha de radicación, el nombre de la autoridad ante la cual se tramita la solicitud, y una 
      breve descripción del uso y características básicas del proyecto.`.replace(/[\n\r]+ */g, ' ');

  const _BODY5 = `Adicionalmente, deberá adjuntar al expediente fotografías de la valla o aviso instalado, en las que 
      se evidencie tanto la legibilidad de la información desde el espacio público como la correcta ubicación 
      según el tipo de proyecto. Estas imágenes deben ser remitidas a esta entidad dentro del plazo establecido.`.replace(/[\n\r]+ */g, ' ');

  const _BODY6 = `Se advierte que, de no cumplir con este requisito dentro del plazo indicado, la solicitud se 
      entenderá desistida, tal como lo establece el parágrafo 1 del Artículo 2.2.6.1.2.2.1 del decreto citado. 
      Asimismo, la valla o aviso deberá permanecer instalado hasta que la solicitud sea resuelta, sin generar 
      pagos o permisos adicionales.`.replace(/[\n\r]+ */g, ' ');

  const _BODY7 = `Cabe destacar que este requerimiento no aplica para trámites de licencias de subdivisión, 
      reconstrucción, intervención u ocupación de espacio público, revalidaciones, o modificaciones de 
      licencia vigente que mantengan la volumetría y uso predominante aprobados.`.replace(/[\n\r]+ */g, ' ');

  const _BODY8 = `Para consultas o soporte técnico, puede contactarnos al teléfono 314 471 0505 o al correo electrónico 
      ${curaduriaInfo.email}.`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_funconfirm.pdf'));

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

  doc.fontSize(11);
  doc.text('\n\n\n');
  doc.font('Helvetica-Bold');
  doc.font('Helvetica')
  doc.fontSize(11).text(_DATA.city + ", " + dateParser(_DATA.date_doc));
  doc.text('\n');
  doc.text('Señore(s)');
  doc.font('Helvetica-Bold')
  doc.text(_DATA.name);
  if (_DATA.email) doc.text(_DATA.email);
  if (_DATA.address) doc.text(_DATA.address);
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(`Asunto: Comunicación de radicación en legal y debida forma y requerimiento de instalación de valla. `, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`Expediente N° ${_DATA.id_public}`);
  doc.text('\n');
  doc.text('Estimado(a) usuario(a):');
  doc.text('\n');
  doc.font('Helvetica')
  doc.fontSize(11).text(_BODY, { align: 'justify' });
  doc.text('\n\n');
  doc.font('Helvetica-Bold')
  doc.text('Requerimiento de instalación de valla o aviso informativo');
  doc.font('Helvetica')
  doc.text('\n\n');
  doc.text(_BODY2, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY3, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY4, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY5, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY6, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY7, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY8, { align: 'justify' });
  doc.fontSize(11).text('\n\n\n');
  doc.font('Helvetica-Bold')
  doc.fontSize(11).text("Atentamente,");
  doc.font('Helvetica')
  doc.fontSize(11).text('\n\n\n\n\n\n');
  doc.font('Helvetica-Bold')
  _DATA.law_option === 1 ? doc.fontSize(13).text(curaduriaInfo.law) : doc.fontSize(13).text(curaduriaInfo.law_2);
  doc.fontSize(11).text(curaduriaInfo.lawt);

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

  pdfSupport.setHeader(doc, { title: 'DECLARACIÓN EN LEGAL Y DEBIDA FORMA', id_public: _DATA.cub, icon: true });

  doc.end();
  return true;
}

function _PDFGEN_DOCCONFIRMINC(_DATA) {
  const PDFDocument = require('pdfkit');

  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 85,
      right: 56
    },
    bufferPages: true,
  });

  const _BODY = `La ${curaduriaInfo.name2}, se permite recordar que la solicitud de ${_DATA.type} ${_DATA.id_public} 
  fue radicada de forma incompleta el día ${dateParser(_DATA.date)}. De conformidad con el artículo 2.2.6.1.2.1.2 Decreto 1077 de 
  2015, usted cuenta con 30 días hábiles para allegar los documentos pendientes, contados desde la fecha de radicación, so 
  pena de que la solicitud se entienda desistida.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `De esta manera, el día ${dateParser(_DATA.date_limit)} se cumple el término para subsanar la radicación, en el caso que no se 
  alleguen los documentos requeridos, se adelantará el proceso de desistimiento y archivo de la solicitud, lo cual se hará mediante 
  acto administrativo que ordene su archivo y contra el que procederá el recurso de reposición ante la autoridad que lo expidió. Si 
  la radicación de la solicitud se subsana dentro del término, pasará a revisión por parte de este despacho una vez quede en legal y 
  debida forma.`.replace(/[\n\r]+ */g, ' ');



  doc.pipe(fs.createWriteStream('./docs/public/output_funconfirminc.pdf'));

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
  doc.text(`Asunto: Radicación incompleta radicado No. `, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(_DATA.id_public,);
  doc.font('Helvetica')
  doc.text('Respetado señor(a):');
  doc.text('\n');
  doc.text(_BODY, { align: 'justify' });
  doc.text('\n\n');
  doc.text(_BODY2, { align: 'justify' });
  doc.text('\n');
  doc.font('Helvetica-Bold')
  doc.text('Los documentos pendientes son:');
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(_DATA.missing);
  doc.text('\n');
  doc.text('Cordial saludo,');

  pdfSupport.setSign(doc)
  pdfSupport.setHeader(doc, { title: 'CARTA RADICACIÓN INCOMPLETA', id_public: _DATA.cub, icon: true });
  pdfSupport.setBottom(doc, false, true);


  doc.end();
  return true;
}

function _PDFGEN_DOCCONFIRMINC_CUP1(_DATA) {
  const PDFDocument = require('pdfkit');

  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 120,
      bottom: 85,
      left: 85,
      right: 56
    },
    bufferPages: true,
  });

  const BODY = `Por medio de la presente, me permito recordarle que la solicitud de ${_DATA.type} ${_DATA.id_public} , fue radicada de 
  forma incompleta el ${dateParser(_DATA.date)} y por lo tanto el ${dateParser(_DATA.date_limit, 30)} 
  se cumple el término máximo para completar la radicación en legal y debida forma, 
  no siendo procedente la ampliación o prórroga del plazo.`.replace(/[\n\r]+ */g, ' ');

  const BODY2 = `Lo anterior de acuerdo al artículo 2.2.6.1.2.1.2 del Decreto 1077 de 2015, según el cual, deberá allanarse a completar la solicitud en legal y debida forma dentro de los treinta (30) días hábiles siguientes so pena de entenderse desistida, lo cual se hará mediante acto administrativo que ordene su archivo y contra el que procederá el recurso de reposición ante la suscrita Curadora Urbana.`.replace(/[\n\r]+ */g, ' ');
  const BODY3 = `Por otra parte, si la radicación del proyecto objeto de la solicitud se completa en legal y debida forma dentro del término ya mencionado, se podrá iniciar a partir del día siguiente la respectiva revisión desde el punto de vista jurídico, urbanístico, arquitectónico y estructural; y empezarán a correr los términos para resolver la solicitud.`.replace(/[\n\r]+ */g, ' ');
  const BODY4 = `Cabe resaltar que, se entenderá que una solicitud de licencia o su modificación está “radicada en legal y debida forma” desde el día hábil en que se allega la información básica y la totalidad de los documentos exigidos en el Decreto 1077 de 2015 y en el Formato de Revisión e Información de Proyectos adoptado por el Ministerio de Vivienda, Ciudad y Territorio, aun cuando estén sujetos a posteriores correcciones.`.replace(/[\n\r]+ */g, ' ');

  const BODY5 = `Sin perjuicio de lo anterior, me permito informarle que desde el día siguiente a la fecha de radicación en legal y debida forma de la solicitud del proyecto, el peticionario de la licencia deberá INSTALAR UNA VALLA resistente a la intemperie de fondo amarillo y letras negras, con una dimensión mínima de un metro (1.00 m) por setenta (70) centímetros, en lugar visible y que la misma sea legible desde la vía pública, en la que se advierta a terceros sobre la iniciación del trámite administrativo tendiente a la expedición de la licencia urbanística, indicando el número de radicación, fecha de radicación, la autoridad ante la cual se tramita la solicitud, el uso y características básicas del proyecto. `.replace(/[\n\r]+ */g, ' ');
  const BODY6 = `No obstante, cuando se trate de solicitudes de licencia de construcción individual de vivienda de interés social -VIS-, se instalará un AVISO de treinta (30) centímetros por cincuenta (50) centímetros en lugar visible desde la vía pública.`.replace(/[\n\r]+ */g, ' ');
  const BODY7 = `Cuando se solicite licencia para el desarrollo de obras de construcción en las modalidades de ampliación, adecuación, restauración, demolición, o modificación en edificios o conjunto sometidos al Régimen de Propiedad Horizontal, se instalará un AVISO de treinta (30) centímetros por cincuenta (50) centímetros en la cartelera principal del edificio o conjunto, o en un lugar de amplia circulación que determine la administración.`.replace(/[\n\r]+ */g, ' ');
  const BODY8 = `Una vez realizado lo anterior, deberá aportar al expediente administrativo las FOTOGRAFÍAS en las que conste la instalación la valla o del aviso, según sea el caso, con la información indicada dentro de los cinco (5) días hábiles siguientes a la radicación de la solicitud, en las que pueda además verificarse su visibilidad desde el espacio público, so pena de entenderse desistida.`.replace(/[\n\r]+ */g, ' ');
  const BODY9 = `De conformidad con el artículo 2.2.6.1.2.2.1 del Decreto 1077 de 2015, la valla o aviso deberá permanecer en el sitio hasta tanto la solicitud sea resuelta.`.replace(/[\n\r]+ */g, ' ');
  const BODY10 = `Por último, es importante aclarar que no será necesaria la instalación de valla ni aviso para las solicitudes de licencia de subdivisión, de construcción en la modalidad de reconstrucción; las solicitudes de revalidación ni las solicitudes de modificación de licencia vigente siempre y cuando, en estas últimas, se trate de rediseños internos manteniendo la volumetría y el uso predominante aprobados en la licencia objeto de modificación.`.replace(/[\n\r]+ */g, ' ');


  doc.pipe(fs.createWriteStream('./docs/public/output_funconfirminc.pdf'));

  doc.font('Helvetica')
  doc.fontSize(10)
  doc.text(_DATA.city + ", " + dateParser(_DATA.date_doc));
  doc.text('\n\n');
  doc.text('Señore(s)');
  doc.font('Helvetica-Bold')
  doc.text(_DATA.name);
  if (_DATA.email) doc.text(_DATA.email);
  if (_DATA.address) doc.text(_DATA.address);
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(`Asunto: Radicación incompleta radicado No. `, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(_DATA.id_public,);
  doc.text('\n');
  doc.text('Cordial saludo,');
  doc.text('\n');
  doc.font('Helvetica')
  doc.text(BODY, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY2, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY3, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY4, { align: 'justify' });
  doc.text('\n');
  doc.text('En consecuencia, se deja constancia de los documentos pendientes que se relacionan a continuación:');
  doc.text('\n');
  doc.text((_DATA.missing|| '').replace(/[\r]+ */g, ''));
  doc.text('\n');

  doc.font('Helvetica-Bold')
  doc.text('INFORMACIÓN ADICIONAL SOBRE LA INSTALACIÓN DE LA VALLA O AVISO:');
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(BODY5, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY6, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY7, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY8, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY9, { align: 'justify' });
  doc.text('\n');
  doc.text(BODY10, { align: 'justify' });
  doc.text('\n');

  doc.font('Helvetica-Bold')
  doc.text('Atentamente,');
  doc.font('Helvetica')

  pdfSupport.setSign(doc)
  pdfSupport.setHeader(doc, { title: 'CARTA RADICACIÓN INCOMPLETA', id_public: _DATA.cub, icon: true });
  pdfSupport.setBottom(doc, true, false);


  doc.end();
  return true;
}

function _PDFGEN_NEIGHBOUR_CONFIRM(_DATA) {
  const PDFDocument = require('pdfkit');
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 85,
      right: 56
    },
    bufferPages: true,
  });
  const _BODY = `${curaduriaInfo.pronoum} ${curaduriaInfo.job}, en cumplimiento de lo ordenado en el artículo 2.2.6.1.2.2.1 del Decreto 1077 de 2015, se permite comunicarle(s), 
  que en esta Oficina se ha radicado un proyecto de solicitud de  ${_DATA.type}, ${_DATA.description}, sobre el(los) predio(s) ${_DATA.predial}, 
  ubicado(s) en ${_DATA.address} barrio ${_DATA.neighbour}, colindante con sus propiedades.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `Esta citación es con el objeto de que usted(es) como vecino(s) colindante(s) del inmueble, se haga(n) 
  parte y pueda(n) hacer valer sus derechos, desde la fecha de radicación de la solicitud hasta antes de la expedición del acto 
  administrativo que resuelve dicha solicitud.`.replace(/[\n\r]+ */g, ' ');

  const _BOD3 = `Parágrafo, artículo 2.2.6.1.2.2.2, Decreto 1077 de 2015 y decretos que lo modifiquen: Las objeciones y observaciones 
  se deberán presentar por escrito, acreditando la condición de tercero, individual y directamente interesado y presentar las pruebas 
  que pretenda hacer valer y deberán fundamentarse únicamente en la aplicación de las normas jurídicas, urbanísticas, de 
  edificabilidad o estructurales referentes a la solicitud, so pena de la responsabilidad extracontractual en la que podría incurrir 
  por los perjuicios que ocasionase con su conducta, Dichas observaciones se resolverán en el acto que decida sobre la solicitud.`.replace(/[\n\r]+ */g, ' ');

  const _BOD4 = `Si el proyecto se ajusta a las normas de Ley, se citarán las personas, que se hubieren hecho parte dentro del trámite, 
  para la notificación personal del acto administrativo que resuelve la solicitud.`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_nconfirm.pdf'));

  doc.font('Helvetica-BoldOblique');
  doc.image('docs/public/logo192.png', 120, 50, { width: 45, height: 45 })
  doc.fontSize(12).text(curaduriaInfo.job, 100, 55, { align: 'center' });
  doc.fontSize(12).text(curaduriaInfo.title + " " + curaduriaInfo.master, 100, 68, { align: 'center' });

  doc.fontSize(11).text('\n\n\n');
  doc.font('Helvetica-Bold');
  doc.fontSize(13).text("CITACION A VECINOS COLINDANTES", { align: 'center' });
  doc.fontSize(11).text('\n');
  doc.font('Helvetica')
  doc.fontSize(11).text(_DATA.city + " , " + dateParser(_DATA.date), { continued: true });
  doc.font('Helvetica-Bold')
  doc.fontSize(11).text(_DATA.id_public + " ", { align: 'right' });
  doc.font('Helvetica')
  doc.fontSize(11).text("Señor(a)", { continued: true });
  doc.font('Helvetica-Bold')
  if (!_DATA.list) doc.fontSize(11).text(_DATA.id_cub, { align: 'right' });
  doc.fontSize(11).text(" ");
  doc.fontSize(12).text("VECINO COLINDANTE");
  doc.font('Helvetica')
  if (!_DATA.list) doc.fontSize(11).text(`${_DATA.address_n}`);
  doc.fontSize(10).text('\n\n');
  doc.font('Helvetica-Bold')
  doc.fontSize(10).text(`Referencia: `, { continued: true });
  doc.font('Helvetica')
  doc.fontSize(10).text(`Citación.\n\n`, { align: 'justify' });
  doc.fontSize(10).text(`${_BODY}\n\n`, { align: 'justify' });
  /*
    doc.font('Helvetica-Bold')
    doc.fontSize(10).text(`DESCRIPCION DEL PROYECTO: `, { continued: true });
    doc.font('Helvetica')
    doc.fontSize(10).text(`${_DATA.description}\n\n`, { align: 'justify' });
  */
  doc.font('Helvetica-Bold')
  doc.fontSize(10).text(`PROPIETARIO DEL PREDIO: `, { continued: true });
  doc.font('Helvetica')
  doc.fontSize(11).text(`${_DATA.owner}\n\n`);
  doc.fontSize(10).text(`${_BODY2}\n\n`, { align: 'justify' });
  doc.fontSize(10).text(`${_BOD3}\n\n`, { align: 'justify' });
  doc.fontSize(10).text(`${_BOD4}`, { align: 'justify' });

  pdfSupport.setSign(doc, _DATA.digital_firm)
  pdfSupport.setBottom(doc, false, true);

  if (_DATA.list) {
    const offset = 220
    doc.addPage();
    doc.font('Helvetica-BoldOblique');
    doc.image('docs/public/logo192.png', 120, 50, { width: 45, height: 45 })
    doc.fontSize(12).text(curaduriaInfo.name, 100, 55, { align: 'center' });
    doc.fontSize(12).text(curaduriaInfo.title + " " + curaduriaInfo.master, 100, 68, { align: 'center' });
    doc.fontSize(11).text('\n\n\n\n\n');
    doc.font('Helvetica-Bold')
    doc.fontSize(13).text("CONTROL DE AVISOS DE VECINOS", { continued: true });
    doc.fontSize(11).text(_DATA.id_public + " ", { align: 'right' });
    doc.fontSize(10).text('\n');
    doc.fontSize(10).text(`Tipo de Solicitud: ${_DATA.type}\n`);
    doc.fontSize(10).text(`Direccion Predio: ${_DATA.address},  ${_DATA.neighbour}\n`);
    doc.fontSize(10).text(`Nombre Propietario: ${_DATA.owner}\n`);
    doc.fontSize(10).text('\n');
    pdfSupport.rowConfCols2(doc, doc.y,
      ['NOMBRE VECINO', `DIRECCION COLIDANTE`, 'CONSECUTIVO RELACIONADO',],
      [1, 1, 1],
      [{ align: 'center', bold: true, pretty: true },
      { align: 'center', bold: true, pretty: true },
      { align: 'center', bold: true, pretty: true },
      ]
    )
    doc.font('Helvetica')
    for (var i = 0; i < _DATA.address_multiple.length; i++) {
      pdfSupport.rowConfCols2(doc, doc.y,
        ['PROPIETARIO, POSEEDOR, \nTENEDOR O RESIDENTE', `${_DATA.address_multiple[i]},\n ${_DATA.neighbour}`, _DATA.address_multiple_cubs[i],],
        [1, 1, 1],
        [{ align: 'center', },
        { align: 'center', },
        { align: 'center', },
        ]
      )
    }
  }

  doc.end();
  return true;
}

function _PDFGEN_NEIGHBOUR_CONFIRM_CUP1(_DATA) {
  const PDFDocument = require('pdfkit');
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 128,
      bottom: 85,
      left: 85,
      right: 56
    },
    bufferPages: true,
  });
  const _BODY = `${curaduriaInfo.pronoum} ${curaduriaInfo.job}, en cumplimiento de lo ordenado en el artículo 2.2.6.1.2.2.1 del Decreto 1077 de 2015, se permite comunicarle(s), 
  que en esta Oficina se ha radicado un proyecto de solicitud de  ${_DATA.type}, ${_DATA.description}, conforme a la siguiente información:`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `Esta citación se remite con el fin de que usted, como vecino(a) colindante del inmueble objeto de la solicitud—entendiéndose como propietario(a), 
  poseedor(a), tenedor(a) o residente de un predio con lindero común—pueda pronunciarse, intervenir en el proceso si lo considera necesario, y hacer valer sus derechos 
  desde la fecha de radicación de la solicitud hasta antes de la expedición del acto administrativo que la resuelva.`.replace(/[\n\r]+ */g, ' ');

  const _BOD3 = `Las objeciones u observaciones deberán presentarse por escrito, acreditando la condición de tercero directamente interesado. Estas deben fundamentarse 
  únicamente en normas jurídicas, urbanísticas, de edificabilidad o estructurales referentes a la solicitud, y deben estar respaldadas con las pruebas pertinentes, 
  so pena de incurrir en responsabilidad extracontractual por perjuicios ocasionados.`.replace(/[\n\r]+ */g, ' ');

  const _BOD4 = `Esta citación será enviada por correo certificado, conforme a la información suministrada por el solicitante. En caso de no ser posible, se publicará 
  en la página web www.curaduria1piedecuesta.com o en un periódico de amplia circulación local. Asimismo, se dejará la constancia correspondiente en el expediente 
  administrativo.`.replace(/[\n\r]+ */g, ' ');

  const _BOD5 = `En caso de que el proyecto cumpla con las normas legales y reglamentarias, se citará a las personas que se hayan hecho parte del proceso para 
  la notificación personal del acto administrativo que resuelva la solicitud.`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_nconfirm.pdf'));

  doc.x = 85;
  doc.font('Helvetica')
  doc.fontSize(11).text(_DATA.city + " , " + dateParser(_DATA.date), { continued: true });
  doc.font('Helvetica')
  doc.fontSize(10).text('\n');
  doc.fontSize(11).text("Señor(a)", { continued: true });
  doc.font('Helvetica-Bold')
  if (!_DATA.list) doc.fontSize(11).text(_DATA.id_cub, { align: 'right' });
  doc.fontSize(11).text(" ");
  doc.fontSize(12).text("VECINO COLINDANTE");
  doc.font('Helvetica')
  if (!_DATA.list) doc.fontSize(11).text(`${_DATA.address_n}`);
  doc.fontSize(10).text('\n');
  doc.font('Helvetica-Bold')
  doc.fontSize(10).text(`Referencia: `, { continued: true });
  doc.font('Helvetica')
  doc.fontSize(10).text(`Comunicación de citación de vecino(a) colindante. Expediente Radicado N.° ${_DATA.id_public}.\n\n`, { align: 'justify' });
  doc.fontSize(10).text(`${_BODY}\n\n`, { align: 'justify' });
  // tabla

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 13, h: 1, text: 'SOLICITANTE(S).', config: { align: 'center', bold: true, fill: "gainsboro", valign: true, } },
      { coord: [13, 0], w: 17, h: 1, text: `${_DATA.owner}`, config: { align: 'center', valign: true, } },
      { coord: [30, 0], w: 13, h: 1, text: 'RADICACIÓN N°.', config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, } },
      { coord: [43, 0], w: 17, h: 1, text: `${_DATA.id_public}`, config: { align: 'center', valign: true, } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 13, h: 1, text: 'FECHA DE RADICACIÓN.', config: { align: 'center', bold: true, fill: "gainsboro", valign: true, } },
      { coord: [13, 0], w: 17, h: 1, text: `${_DATA.pay_date}`, config: { align: 'center', valign: true, } },
      { coord: [30, 0], w: 13, h: 1, text: 'TIPO DE SOLICITUD ', config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, } },
      { coord: [43, 0], w: 17, h: 1, text: `${_DATA.type}`, config: { align: 'center', valign: true, } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 13, h: 1, text: 'DIRECCIÓN DEL PROYECTO.', config: { align: 'center', bold: true, fill: "gainsboro", valign: true, } },
      { coord: [13, 0], w: 17, h: 1, text: `${_DATA.address}`, config: { align: 'center', valign: true, } },
      { coord: [30, 0], w: 13, h: 1, text: 'USO(S)', config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, } },
      { coord: [43, 0], w: 17, h: 1, text: `${_DATA.usos}`, config: { align: 'center', valign: true, } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  doc.font('Helvetica')
  doc.fontSize(11).text(`\n\n`);
  doc.fontSize(10).text(`${_BODY2}\n\n`, { align: 'justify' });
  doc.fontSize(10).text(`${_BOD3}\n\n`, { align: 'justify' });
  doc.fontSize(10).text(`${_BOD4}\n\n`, { align: 'justify' });
  doc.fontSize(10).text(`${_BOD5}\n\n\n\n`, { align: 'justify' });

  doc.font('Helvetica-Bold')
  doc.fontSize(13).text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
  doc.fontSize(11).text(curaduriaInfo.job);
  doc.font('Helvetica')

  pdfSupport.setHeader(doc, { title: 'CITACION A VECINOS COLINDANTES', size: 13, icon: true, id_public: _DATA.id_public });
  pdfSupport.setBottom(doc, false, true);


  if (_DATA.list) {
    const offset = 220
    doc.addPage();
    doc.font('Helvetica-BoldOblique');
    doc.image('docs/public/logo192.png', 120, 50, { width: 45, height: 45 })
    doc.fontSize(12).text(curaduriaInfo.name, 100, 55, { align: 'center' });
    doc.fontSize(12).text(curaduriaInfo.title + " " + curaduriaInfo.master, 100, 68, { align: 'center' });
    doc.fontSize(11).text('\n\n\n\n\n');
    doc.font('Helvetica-Bold')
    doc.fontSize(13).text("CONTROL DE AVISOS DE VECINOS", { continued: true });
    doc.fontSize(11).text(_DATA.id_public + " ", { align: 'right' });
    doc.fontSize(10).text('\n');
    doc.fontSize(10).text(`Tipo de Solicitud: ${_DATA.type}\n`);
    doc.fontSize(10).text(`Direccion Predio: ${_DATA.address},  ${_DATA.neighbour}\n`);
    doc.fontSize(10).text(`Nombre Propietario: ${_DATA.owner}\n`);
    doc.fontSize(10).text('\n');
    pdfSupport.rowConfCols2(doc, doc.y,
      ['NOMBRE VECINO', `DIRECCION COLIDANTE`, 'CONSECUTIVO RELACIONADO',],
      [1, 1, 1],
      [{ align: 'center', bold: true, pretty: true },
      { align: 'center', bold: true, pretty: true },
      { align: 'center', bold: true, pretty: true },
      ]
    )
    doc.font('Helvetica')
    for (var i = 0; i < _DATA.address_multiple.length; i++) {
      pdfSupport.rowConfCols2(doc, doc.y,
        ['PROPIETARIO, POSEEDOR, \nTENEDOR O RESIDENTE', `${_DATA.address_multiple[i]},\n ${_DATA.neighbour}`, _DATA.address_multiple_cubs[i],],
        [1, 1, 1],
        [{ align: 'center', },
        { align: 'center', },
        { align: 'center', },
        ]
      )
    }
  }

  doc.end();
  return true;
}

function _PDFGEN_NEIGHBOUR_PUBLISH(_DATA) {
  const PDFDocument = require('pdfkit');
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 85,
      right: 56
    },
    bufferPages: true,
  });
  const _BODY = `${curaduriaInfo.pronoum} ${curaduriaInfo.job} en cumplimiento de lo ordenado en el 
  artículo 2.2.6.1.2.2 del Decreto 1077 de 2015, CITA a los vecinos colindantes del inmueble o inmuebles objeto de la solicitud 
  para que hagan parte del proceso y puedan hacer valer sus derechos. Esta citación es con el objeto de informarle(s) que 
  ${_DATA.owner}, ha(n) solicitado: ${_DATA.type} radicada con el número  ${_DATA.id_public} y la fecha ${_DATA.pay_date}, sobre el(los) predio(s) No. 
  ${_DATA.predial}, número de Matricula  ${_DATA.matricula}, ubicado(s) en ${_DATA.address}, del Municipio de ${curaduriaInfo.city}${_DATA.description ? ' para: ' + _DATA.description : ''}. 
  La presente citación se hace por periódico dado que algunos inmuebles colindantes son lotes, se encuentran desocupados o 
  permanecen cerrados.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `De conformidad con el Parágrafo del artículo 2.2.6.1.2.2.2. ibidem Las objeciones y observaciones se deberán 
  enviar al correo electrónico ${curaduriaInfo.email}, acreditando la condición de tercero individual y directamente 
  interesado y presentar las pruebas que pretenda hacer valer y deberán fundamentarse únicamente en la aplicación de las normas 
  jurídicas, urbanísticas, de edificabilidad o estructurales referentes a la solicitud, so pena de la responsabilidad 
  extracontractual en la que podría incurrir por los perjuicios que ocasione con su conducta. Dichas observaciones se resolverán 
  en el acto que decida sobre la solicitud.`.replace(/[\n\r]+ */g, ' ');



  doc.pipe(fs.createWriteStream('./docs/public/output_nconfirm.pdf'));
  doc.fontSize(11).text('\n');
  doc.fontSize(11).text('\n');
  doc.font('Helvetica-Bold');
  doc.fontSize(14).text("FACTURA A NOMBRE DE:", { align: 'center' });
  doc.font('Helvetica-BoldOblique');
  doc.fontSize(12).text(curaduriaInfo.job, { align: 'center' });
  doc.fontSize(12).text(curaduriaInfo.title + " " + curaduriaInfo.master, { align: 'center' });
  doc.fontSize(14).text('\n');
  doc.font('Helvetica-Bold');
  doc.fontSize(12).text("DIRECCION DE ENVIO DEL PERIODICO Y CERTIFICACION:", { align: 'center' });
  doc.font('Helvetica');
  doc.fontSize(10).text(curaduriaInfo.dir, { align: 'center' });
  doc.fontSize(10).text(`Tel: ${curaduriaInfo.tel}            Correo: ${curaduriaInfo.email}`, { align: 'center' });
  doc.font('Helvetica-Bold')
  doc.fontSize(14).text('\n');
  doc.fontSize(14).text('\n');
  doc.font('Helvetica-Bold');
  doc.fontSize(12).text(`FECHA DE PUBLICACION: ${dateParser(_DATA.date)}`);
  doc.fontSize(14).text('\n');
  doc.fontSize(14).text('\n');
  doc.fontSize(12).text("TEXTO DE PUBLICACION:", { align: 'center' });
  doc.fontSize(14).text('\n');
  doc.font('Helvetica');
  doc.fontSize(12).text(`${_BODY}`, { align: 'justify' });
  doc.text('\n');
  doc.text(`${_BODY2}`, { align: 'justify' });

  doc.fontSize(11).text(_DATA.id_public, 100, 80, { align: 'right' });

  doc.end();
  return true;
}

function _PDFGEN_NEIGHBOUR_PUBLISH_CUP1(_DATA) {
  const PDFDocument = require('pdfkit');
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 56,
      right: 56
    },
    bufferPages: true,
  });
  const _BODY = `${curaduriaInfo.pronoum} ${curaduriaInfo.job}, en cumplimiento de lo dispuesto 
  en el artículo 2.2.6.1.2.2.1 del Decreto 1077 de 2015, comunica mediante este AVISO 
  DE CITACIÓN A VECINOS COLINDANTES que se ha iniciado el trámite administrativo 
  correspondiente a la solicitud urbanística radicada bajo el número ${_DATA.id_public} de 
  fecha ${dateParser(_DATA.pay_date)}, presentada por ${_DATA.owner} para 
  el(los) inmueble(s) ubicado(s) en ${_DATA.address} del municipio de ${curaduriaInfo.city}, 
  con el objeto de expedir un(a) ${_DATA.type} con uso(s) de 
  ${_DATA.usos}.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `Se invita a los propietarios, poseedores, tenedores o residentes de predios colindantes 
  —entendidos como aquellos que comparten lindero común con el inmueble objeto de 
  solicitud— a hacerse parte del proceso de trámite urbanístico en curso y ejercer sus derechos desde la fecha de 
  radicación hasta antes de la expedición del acto administrativo que lo resuelva.`.replace(/[\n\r]+ */g, ' ');

  const _BODY3 = `Las observaciones se resolverán en el acto que decida sobre la solicitud, no obstante, 
  deberán presentarse por escrito en la ventanilla única (${curaduriaInfo.dir}) o 
  al correo electrónico ${curaduriaInfo.email}, acreditando la condición de 
  vecino(a) colindante, y deberán fundamentarse únicamente en normas jurídicas, 
  urbanísticas, de edificabilidad o estructurales referentes a la solicitud y estar respaldadas 
  con las pruebas pertinentes, so pena de incurrir en responsabilidad extracontractual por 
  los perjuicios ocasionados. En caso de que el proyecto cumpla con las normas legales y 
  reglamentarias, se citará a las personas que se hayan hecho parte del proceso para la 
  notificación personal del acto administrativo que resuelva la solicitud.`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_nconfirm.pdf'));
  doc.fontSize(11).text(_DATA.id_public, 100, 80, { align: 'right' });
  doc.x = 85;
  doc.y = 85;
  doc.fontSize(11).text('\n');
  doc.fontSize(11).text('\n');
  doc.font('Helvetica-Bold');
  doc.fontSize(14).text("FACTURA A NOMBRE DE:", { align: 'center' });
  doc.font('Helvetica-BoldOblique');
  doc.fontSize(12).text(curaduriaInfo.job, { align: 'center' });
  doc.fontSize(12).text(curaduriaInfo.title + " " + curaduriaInfo.master, { align: 'center' });
  doc.fontSize(14).text('\n');
  doc.font('Helvetica-Bold');
  doc.fontSize(12).text("DIRECCION DE ENVIO DEL PERIODICO Y CERTIFICACION:", { align: 'center' });
  doc.font('Helvetica');
  doc.fontSize(10).text(curaduriaInfo.dir, { align: 'center' });
  doc.fontSize(10).text(`Tel: ${curaduriaInfo.tel}            Correo: ${curaduriaInfo.email}`, { align: 'center' });
  doc.font('Helvetica-Bold')
  doc.fontSize(14).text('\n');
  doc.fontSize(14).text('\n');
  doc.font('Helvetica-Bold');
  doc.fontSize(12).text(`FECHA DE PUBLICACION: ${dateParser(_DATA.date)}`);
  doc.fontSize(14).text('\n');
  doc.fontSize(14).text('\n');
  doc.fontSize(12).text("TEXTO DEL AVISO:", { align: 'center' });
  doc.fontSize(14).text('\n');
  doc.font('Helvetica');
  doc.fontSize(12).text(`${_BODY}`, { align: 'justify' });
  doc.text('\n');
  doc.text(`${_BODY2}`, { align: 'justify' });
  doc.text('\n');
  doc.text(`${_BODY3}`, { align: 'justify' });



  doc.end();
  return true;
}

function _PDFGEN_PLANING_LETTER(_DATA) {
  const pdfSupport = require("../config/pdfSupport.js");
  const PDFDocument = require('pdfkit');
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 56,
      right: 56
    },
    bufferPages: true,
  });
  const _BODY = `Por medio del presente escrito me permito informarle que en nuestra Curaduría se encuentra 
  radicada la solicitud de ${_DATA.type} No.${_DATA.id_public}, del predio ubicado en la ${_DATA.address} BARRIO ${_DATA.neighbour}. 
  Identificado con el No predial ${_DATA.catastral}, cuyo solicitante es/son ${_DATA.owner}, 
  propietario, tenedor o poseedor del inmueble.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_2 = `La notificación se realiza en virtud del numeral 1 del artículo 471 del Acuerdo Municipal 011 de 21 de Mayo de 2014, con el 
  objetivo de que se pronuncie de acuerdo con los literales (a),(b), (c), (d) y (e) del artículo ibídem. Con esta notificación también damos 
  alcance a lo establecido en el artículo 2.2.6.4.1.1 parágrafo 1 del Decreto 1077de 2015.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_3 = `Igualmente le indicamos que para hacerse parte dentro del trámite se debe tener en cuenta lo establecido por el articulo 
  No ARTÍCULO 2.2.6.1.2.2.2 Intervención de terceros del Decreto Nacional 1077 de 2015 (..).`.replace(/[\n\r]+ */g, ' ');

  const _BODY_4 = `La solicitud de constitución en parte deberán presentarse por escrito, bien sea de manera presencial o a través de 
  medios electrónicos, y deberá contener las objeciones y observaciones sobre la expedición de la licencia, acreditando la condición de 
  tercero individual y directamente interesado y presentar las pruebas que pretenda hacer valer y deberán fundamentarse únicamente en la 
  aplicación de las normas jurídicas, urbanísticas, de edificabilidad o estructurales referentes a la solicitud, so pena de la responsabilidad 
  extracontractual en la que podría incurrir por los perjuicios que ocasione con su conducta. Dichas observaciones se 
  resolverán en el acto que decida sobre la solicitud.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_CUP1 = `Por medio del presente escrito me permito bajo su conocimiento la solicitud de Reconocimiento 
  de edificación "${_DATA.type}" realizada ante nuestro despacho y que corresponde a la siguiente información: `.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_planing.pdf'));

  doc.fontSize(11);
  doc.text('\n', 56, doc.y);
  doc.font('Helvetica');
  doc.text(` ${_DATA.city}, ${dateParser(_DATA.date)}`, { continued: true });
  doc.font('Helvetica-Bold');
  if (curaduriaInfo.id == "cub1") doc.text(`${_DATA.id_cub}\nAl contestar citar este número`, { align: 'right' });
  else doc.text(`${_DATA.id_cub}`, { align: 'right' });
  doc.text('\n\n');

  if (curaduriaInfo.id == 'cub1' || curaduriaInfo.id == 'dev') {
    doc.font('Helvetica');
    doc.text('Señora');
    doc.text('Subsecretario(a) de Planeación Municipal de Bucaramanga');
    if (curaduriaInfo.id == "cub1") doc.text('Ing. ALIX JOHANNA ROJAS BORJA');
    else doc.text('Arq. ELSA LILIANA ARIAS CARREÑO');
    doc.text('Calle 35 No 10-43');
    doc.text('Bucaramanga');
    doc.text('\n\n');
    doc.font('Helvetica-Bold');
    doc.text(`Asunto: `, { continued: true });
    doc.font('Helvetica');
    doc.text(`Notificación Actuación Reconocimiento de Edificación Existente No. ${_DATA.id_public}`);
    doc.text('\n');
    doc.text(_BODY, { align: 'justify' });
    doc.text('\n');
    doc.text(_BODY_2, { align: 'justify' });
    doc.text('\n');
    doc.text(_BODY_3, { align: 'justify' });
    doc.text('\n');
    doc.text(_BODY_4, { align: 'justify' });
    doc.text('\n')
    doc.text('Agradecemos la atención prestada y quedamos atentos sus comentarios,')
    doc.text('\n')
    doc.text('Cordial Saludo.')
    doc.text('\n\n\n\n')
    doc.font('Helvetica-Bold')
    doc.fontSize(13).text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    doc.fontSize(11).text(`${curaduriaInfo.job}`);


    doc.addPage({
      size: 'LEGAL', margins: {
        top: 85,
        bottom: 85,
        left: 56,
        right: 56
      }
    })
    doc.text('\n')

    doc.fontSize(12);
    doc.text('\n\n');
    doc.font('Helvetica-Bold')
    doc.text("CONTROL DE DOCUMENTOS PLANEACIÓN", 56, doc.y, { align: 'center' });

    doc.fontSize(8);
    doc.text('\n\n');
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y, ['INVENTARIO'], [1], { pretty: true })
    doc.font('Helvetica');
    pdfSupport.rowConfCols(doc, doc.y, ['PROPIETARIO', _DATA.owner], [2, 3], { align: 'left' })
    pdfSupport.rowConfCols(doc, doc.y, ['RADICADO N°', _DATA.id_public], [2, 3], { align: 'left' })
    pdfSupport.rowConfCols(doc, doc.y, ['DIRECCIÓN', _DATA.address], [2, 3], { align: 'left' })
    pdfSupport.rowConfCols(doc, doc.y, ['BARRIO', _DATA.neighbour], [2, 3], { align: 'left' })
    pdfSupport.rowConfCols(doc, doc.y, ['ACTUACION', _DATA.type], [2, 3], { align: 'left' })
    pdfSupport.rowConfCols(doc, doc.y, ['RESPONSABLE', _DATA.responsable], [2, 3], { align: 'left' })
    pdfSupport.rowConfCols(doc, doc.y, ['CONTACTO', _DATA.number], [2, 3], { align: 'left' })
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y, ['DOCUMENTO', 'CONTENIDO PLANOS', 'CANTIDAD'], [1, 1, 1], { pretty: true });
    doc.font('Helvetica');
    pdfSupport.rowConfCols(doc, doc.y, ['PLANO ARQUITECTONICO', _DATA.b1, _DATA.b2], [1, 1, 1], { align: 'left' });
    pdfSupport.rowConfCols(doc, doc.y, ['PLANO ESTRUCTURAL', _DATA.b3, _DATA.b4], [1, 1, 1], { align: 'left' });
    pdfSupport.rowConfCols(doc, doc.y, ['PERITAJE ESTRUCTURAL', "", _DATA.b5], [1, 1, 1], { align: 'left' });
    pdfSupport.rowConfCols(doc, doc.y, ['MEMORIAS ESTRUCTURAL', "", _DATA.b6], [1, 1, 1], { align: 'left' });
    pdfSupport.rowConfCols(doc, doc.y, ['VIDEOS – IMÁGENES', "", _DATA.b7], [1, 1, 1], { align: 'left' });
    pdfSupport.rowConfCols(doc, doc.y, ['OTROS', "", _DATA.b8], [1, 1, 1], { align: 'left' });
    pdfSupport.rowConfCols(doc, doc.y, ['LICENCIA ANTERIOR', "", _DATA.b9], [1, 1, 1], { align: 'left' });
    pdfSupport.rowConfCols(doc, doc.y, ['PLANOS LICENCIA ANTERIOR', "", _DATA.b10], [1, 1, 1], { align: 'left' });
    doc.font('Helvetica-Bold')
    pdfSupport.rowConfCols(doc, doc.y, ['OBSERVACIONES'], [1], { pretty: true });
    pdfSupport.rowConfCols(doc, doc.y, [_DATA.notations + " "], [1], { align: 'left' });
  }

  if (curaduriaInfo.id == 'cup1') {
    doc.font('Helvetica-Bold');
    doc.text(_DATA.b1);
    doc.text(_DATA.b2);
    doc.text(_DATA.b3);
    doc.text(_DATA.b4);
    doc.text(_DATA.b5);
    doc.font('Helvetica');
    doc.text('\n\n');
    doc.text(`Asunto: Reconocimiento de Edificación No. ${_DATA.id_public}`);
    doc.text('\n');
    doc.text(`Cordial Saludo,`);
    doc.text('\n');
    doc.text(_BODY_CUP1, { align: 'justify' });

    doc.fontSize(8);
    pdfSupport.rowConfCols2(doc, doc.y,
      ['No. SOLICITUD', 'TIPO DE SOLICITUD', 'NOMBRE', 'DIR. BARRIO', 'No. PREDIO'],
      [1, 3, 1, 2, 1],
      [{ align: 'center', bold: true, pretty: true, },
      { align: 'center', bold: true, pretty: true, },
      { align: 'center', bold: true, pretty: true, },
      { align: 'center', bold: true, pretty: true, },
      { align: 'center', bold: true, pretty: true, },
      ])
    pdfSupport.rowConfCols2(doc, doc.y,
      [_DATA.id_public, _DATA.type, _DATA.responsable, _DATA.address + ' ' + _DATA.neighbour, _DATA.catastral],
      [1, 3, 1, 2, 1],
      [{ align: 'center', },
      { align: 'center', },
      { align: 'center', },
      { align: 'center', },
      { align: 'center', },
      ])
    doc.fontSize(11);
    doc.text(`Cordialmente,`);
    doc.text('\n\n\n\n\n');
    doc.font('Helvetica-Bold')
    doc.fontSize(13).text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    doc.fontSize(11).text(curaduriaInfo.job);
  }


  pdfSupport.setBottom(doc, false, true)
  pdfSupport.setHeader(doc, { icon: true })

  doc.end();
  return true;
}

function _PDFGEN_SIGN(_DATA) {
  const PDFDocument = require('pdfkit');

  let size = 'LETTER';
  let margin = 72;
  let fontSize = 20
  let smalF = 5;
  if (_DATA.size == '1') {
    size = [2834, 1984] // 1 m x 70 cm
    margin = 141 //5 cm
    fontSize = 50
    smalF = 8;
  }

  if (_DATA.size == '2') {
    size = [1417, 850] // 50 cm X 30 cm
    margin = 70 //2.5 cm
    fontSize = 25
  }
  var doc = new PDFDocument({
    size: size, margins: {
      top: margin,
      bottom: margin,
      left: margin,
      right: margin
    },
    bufferPages: true,
  });
  const _BODY = _DATA.text ? _DATA.text.replace(/[\n\r]+ */g, ' ') : '';

  const _BODY_2 = `Nota: En solicitudes de proyectos de Parcelación, Urbanización, y construcción en cualquiera de sus modalidades, el peticionario de la
  licencia deberá instalar una valla resistente a la intemperie de fondo amarillo y letras negras con una dimensión mínima de un metro
  (1.00 m) por setenta (70) centímetros. Tratándose de solicitudes de licencia de construcción individual de vivienda de interés
  social, se instalara un aviso de treinta (30) centímetros por (50) centímetros en lugar visible desde la vía pública.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_3 = `Cuando se solicite licencia para el desarrollo de obras de construcción en las modalidades de Ampliación, Adecuación, Restauración
  o demolición en edificios o conjunto sometidos al régimen de propiedad horizontal, se instalara un aviso de treinta (30) centímetros
  por cincuenta (50) centímetros en la cartelera principal del edificio o conjunto, o en lugar de amplia circulación que determine la
  administración.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_4 = `EN CUMPLIMIENTO A LA OBLIGACIÓN ESTABLECIDA EN EL ARTÍCULO 2.2.6.1.4.9 DEL DECRETO 1077 DE 2015, SE INSTALA EL PRESENTE AVISO CON LA SIGUIENTE IDENTIFICACIÓN DE LAS OBRAS:`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_sign.pdf'));
  doc.lineJoin('miter')
    .rect(0, 0, size[0], size[1])
    .fill(_DATA.color ? _DATA.color : 'gold')
    .stroke();

  doc.fillColor("black", 1)
    .strokeColor("black", 1)

  doc.fontSize(fontSize + 5);
  doc.font('Helvetica-Bold');
  doc.text(curaduriaInfo.job, { align: 'center' });
  doc.font('Helvetica');
  doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`, { align: 'center' });
  doc.fontSize(fontSize);

  if (_DATA.sign_type == '1') {
    doc.text('\n');
    doc.text('\n');
    doc.text('\n');
    let _Y = doc.y;
    let _X = doc.x;
    doc.font('Helvetica');
    doc.text(`N. DE RADICADO:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.id_public}`, size[0] / 3, _Y);
    if (_DATA.res_id) {
      doc.font('Helvetica');
      doc.text(`N. DE RESOLUCIÓN:`, size[0] * 3 / 5, _Y);
      doc.font('Helvetica-Bold');
      doc.text(`${_DATA.res_id}`, size[0] * 4 / 5, _Y);
    }
    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`SOLICITANTE:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.solicitor}\n`, size[0] / 3, _Y);
    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`ALTURA:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.height}\n`, size[0] / 3, _Y);
    if (_DATA.area) {
      doc.font('Helvetica');
      doc.text(`ÁREA:`, size[0] * 3 / 5, _Y);
      doc.font('Helvetica-Bold');
      doc.text(`${_DATA.area} m2`, size[0] * 4 / 5, _Y);
    }
    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`TIPO DE SOLICITUD:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.type}\n`, size[0] / 3, _Y);
    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`DIRECCION DEL PREDIO:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.address}\n`, size[0] / 3, _Y);
    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`USO:   `, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.use}\n`, size[0] / 3, _Y);
    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`FECHA DE RADICACION:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.date}`, size[0] / 3, _Y);
    doc.font('Helvetica');
    if (_DATA.daten == 1) {
      doc.text(`FECHA DE INSTALACION:   `, (size[0] / 2), _Y, { continued: true });
      doc.font('Helvetica-Bold');
      doc.text(`${_DATA.date ? moment(_DATA.date).add(1, 'days').format('YYYY-MM-DD') : ''}`);
      doc.font('Helvetica');
    } else if (_DATA.res_exp_date_1 && _DATA.res_exp_date_2) {
      doc.font('Helvetica');
      doc.text(`FECHA VIGENCIA:`, size[0] * 5 / 10, _Y);
      doc.font('Helvetica-Bold');
      doc.text(`${_DATA.res_exp_date_1} a ${_DATA.res_exp_date_2}`, size[0] * 7 / 10, _Y);
      doc.font('Helvetica');
    } else {
      doc.text('\n');
    }
    doc.text('\n', _X, doc.y);


    if (_BODY.length > 500) doc.fontSize(fontSize - smalF);
    else doc.text('\n');
    doc.text(_BODY, { align: 'justify' });
    if (_BODY.length < 500) doc.text('\n');
    doc.text('\n');
    doc.fontSize(fontSize - 5);
    doc.text(`INFORMES: ${curaduriaInfo.dir}`, { align: 'center' });
    doc.text(`TELEFONOS:  ${curaduriaInfo.tel} -  ${curaduriaInfo.cel} - CORREO:  ${curaduriaInfo.email}`, { align: 'center' });
    doc.text(`PAGINA:  ${curaduriaInfo.page}`, { align: 'center' });
    /*
      doc.addPage({
        size: 'A6', margins: {
          top: 36,
          bottom: 36,
          left: 18,
          right: 18
        }
      });
    
      doc.fontSize(12); 810 455
    
      doc.text(_BODY_2, { align: 'justify' });
      doc.text('\n');
      doc.text('\n');
      doc.text(_BODY_3, { align: 'justify' });
    */
  }
  if (_DATA.sign_type == '2') {
    if (_DATA.size == '2') fontSize = 23
    doc.fontSize(fontSize);

    let _X2 = size[0] / 2;
    doc.text('\n');
    doc.text(_BODY_4, { align: 'center' });
    doc.text('\n');
    let _Y = doc.y;
    let _X = doc.x;

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`CLASE DE LICENCIA:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.type || ' '}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`NÚMERO Y FECHA LICENCIA:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.res_id || ' '} DEL ${_DATA.res_date || ' '}  ${_DATA.id_public ? ' ID ' + _DATA.id_public : ''}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`NOMBRE O RAZÓN SOCIAL DEL TITULAR:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.solicitor || ' '}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`DIRECCIÓN:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.address || ' '}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`FECHA EJECUTORIA:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.res_exp_date_1}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`VIGENCIA DE LA LICENCIA:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.res_exp_date_1} HASTA ${_DATA.res_exp_date_2}`, _X2, _Y);

    _Y = doc.y;
    doc.text(`\nDESCRIPCIÓN DE LA OBRA:`, _X, _Y, { align: 'center' });
    doc.text('\n');

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`USO AUTORIZADO:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.use || ' '}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`METROS DE CONSTRUCCIÓN:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.area || ' '} m2`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`ALTURA TOTAL DE LA(S) EDIFICACION(ES):`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.height || ' '}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`NÚMERO DE ESTACIONAMIENTOS:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(`${_DATA.parking || ' '}`, _X2, _Y);

    _Y = doc.y;
    doc.font('Helvetica');
    doc.text(`NÚMERO DE UNIDADES:`, _X, _Y);
    doc.font('Helvetica-Bold');
    doc.text(` ${_DATA.otheruse || ' '}`, _X2, _Y);

    _Y = doc.y;
    doc.text('\n', _X, doc.y);

    doc.fontSize(fontSize - 5);
    doc.text(`INFORMES: ${curaduriaInfo.dir}`, { align: 'center' });
    doc.text(`TELEFONOS:  ${curaduriaInfo.tel} -  ${curaduriaInfo.cel} - CORREO:  ${curaduriaInfo.email}`, { align: 'center' });
    doc.text(`PAGINA:  ${curaduriaInfo.page}`, { align: 'center' });
  }
  doc.end();
  return true;
}

function _PDFGEN_CHECKCONTROL(_DATA) {
  const PDFDocument = require('pdfkit');
  var pdfSupport = require("../config/pdfSupport.js");
  var doc = new PDFDocument({
    size: 'LEGAL',
    margins: {
      top: 56,
      bottom: 56,
      left: 56,
      right: 56
    },
    bufferPages: true,
  });


  doc.pipe(fs.createWriteStream('./docs/public/output_control_check.pdf'));

  const _BODY = `Los documentos de cada subserie documental se ordenarán dentro de cada unidad de 
conservación (carpetas individuales) de manera que al revisar el expediente, los documentos se 
encuentren ordenados atendiendo la secuencia propia de su producción.`.replace(/[\n\r]+ */g, ' ');

  doc.fontSize(10);
  let config_for_head = { align: 'center', X: 150, width: 612 - 150 - 56 };

  doc.font('Helvetica-Bold')
  let start = doc.y
  pdfSupport.rowConfCols(doc, doc.y, [`ADMINISTRACION GESTION DOCUMENTAL`, 'CODIGOS'], [5, 3], config_for_head);
  pdfSupport.rowConfCols(doc, doc.y, [`HOJA DE CONTROL SERIE DOCUMENTAL\n${_DATA.serie_str}`, `${_DATA.serie_cod}`], [5, 3], config_for_head);
  pdfSupport.rowConfCols(doc, doc.y, [`SUBSERIE DOCUMENTAL\n${_DATA.subserie_str}`, `${_DATA.subserie_cod}`], [5, 3], config_for_head);
  pdfSupport.rowConfCols(doc, doc.y, [`NUMERO DE RADICACIÓN`, _DATA.id_public], [5, 3], config_for_head);
  let end = doc.y;

  doc.lineJoin('miter')
    .lineWidth(0.5)
    .rect(56, start, 150 - 56, end - 56)
    .fillColor("black", 1)
    .strokeColor("black", 1)
    .stroke();

  doc.image('docs/public/logo192.png', 56 + 21, end / 2, { width: 50, height: 50 })

  doc.font('Helvetica')
  pdfSupport.rowConfCols(doc, doc.y, [`${_BODY}`], [1], { align: 'justify' });
  doc.fontSize(9)
  doc.font('Helvetica-Bold')
  pdfSupport.rowConfCols(doc, doc.y,
    [
      '#',
      'Nombre Tipología Documental',
      'CODIGO',
      'FOLIOS',
      'ESTADO',
    ],
    [1, 7, 1, 1, 1],
    { align: 'center' },
  )

  let _array_titles = _DATA.title_doc.split(';');
  let _array_titles_id = _DATA.title_id.split(';');

  let _array_doc = _DATA.name_doc.split(';');
  let _array_page = _DATA.pages_doc.split(';');
  let _array_val = _DATA.select_doc.split(';');
  let _array_code = _DATA.code_doc.split(';');

  let CICLE_N = _array_doc.length;
  var order_n = 0;
  var pages = 0;
  for (var i = 0; i < CICLE_N; i++) {

    if (_array_titles_id.includes(String(i))) {
      let index_n = _array_titles_id.indexOf(String(i));
      doc.font('Helvetica-Bold')
      pdfSupport.rowConfCols(doc, doc.y, ['', `${_array_titles[index_n]}`, ''], [1, 8, 2]);
      doc.font('Helvetica')
    }

    if (_array_val[i] != 2) {
      order_n++;
      pages += Number(_array_page[i]);
      pdfSupport.tableConf(doc, doc.y,
        [
          [`${order_n}`],
          [`${_array_doc[i]}`],
          [`${_array_code[i]}`],
          [`${_array_page[i]}`],
          [`${_array_val[i] == 1 ? 'SI' : 'NO'}`],

        ],
        [1, 7, 1, 1, 1],
        [
          { align: 'center', columns: 1, width: 0, fillColum: true },
          { align: 'left', columns: 1, width: 0 },
          { align: 'center', columns: 1, width: 0, bold: true, fillColum: true },
          { align: 'center', columns: 1, width: 0, bold: true, fillColum: true },
          { align: 'center', columns: 1, width: 0, bold: true, fillColum: true },
        ],
      );
    }

  }

  pdfSupport.tableConf(doc, doc.y,
    [
      [`NUMERO TOTAL DE FOLIOS`],
      [`${pages}`],
      [``],
    ],
    [9, 1, 1],
    [
      { align: 'right', columns: 1, width: 0, bold: true },
      { align: 'center', columns: 1, width: 0, bold: true, fillColum: true },
      { align: 'center', columns: 1, width: 0, bold: true, fillColum: true },
    ],
  );
  doc.text('\n\n\n\n\n');
  doc.text('Nombre Responsable Archivo', { continued: true });
  doc.text('Firma Responsable Archivo', { align: 'right' });

  pdfSupport.setBottom(doc, true)
  doc.end();

  return true;
}

function _PDFGEN_CHECKCONTROL_2(_DATA) {
  const PDFDocument = require('pdfkit');
  var pdfSupport = require("../config/pdfSupport.js");
  var doc = new PDFDocument({
    size: 'LEGAL',
    margins: {
      top: 102,
      bottom: 56,
      left: 56,
      right: 56
    },
    bufferPages: true,
  });

  doc.pipe(fs.createWriteStream('./docs/public/output_control_check_2.pdf'));

  doc.fontSize(10);
  doc.font('Helvetica-Bold')
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: 'DATOS GENERALES', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  doc.font('Helvetica')
  doc.text('\n');
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'RADICADO Nr', config: { align: 'left', bold: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.id, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'MODALIDAD DE LICENCIA', config: { align: 'left', bold: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.type, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'PROPIETARIO', config: { align: 'left', bold: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.owner, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'ARQUITECTO', config: { align: 'left', bold: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.arc, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'INGENIERO', config: { align: 'left', bold: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.eng, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 20, h: 1, text: 'DIRECTOR DE LA CONSTRUCCIÓN', config: { align: 'left', bold: true, } },
      { coord: [20, 0], w: 40, h: 1, text: _DATA.sup, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 40, h: 1, text: 'DOCUMENTOS', config: { align: 'center', bold: true, } },
      { coord: [40, 0], w: 20, h: 1, text: 'CANTIDAD', config: { align: 'center', bold: true, } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

  _DATA.items.map(i => pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 30, h: 1, text: i.name, config: { align: 'left', bold: true, } },
      { coord: [30, 0], w: 10, h: 1, text: i.date, config: { align: 'left', } },
      { coord: [40, 0], w: 20, h: 1, text: i.n + ' ' + (i.label || ' '), config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 }))

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 15, h: 1, text: 'FECHA DE ELABORACIÓN:', config: { align: 'left', bold: true, } },
      { coord: [15, 0], w: 15, h: 1, text: _DATA.date_create, config: { align: 'left', } },
      { coord: [30, 0], w: 15, h: 1, text: 'PERSONA QUE ARCHIVA:', config: { align: 'left', bold: true, } },
      { coord: [45, 0], w: 15, h: 1, text: _DATA.user_archive, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 15, h: 1, text: 'FECHA DE RECIBO:', config: { align: 'left', bold: true, } },
      { coord: [15, 0], w: 15, h: 1, text: _DATA.date_retrieve, config: { align: 'left', } },
      { coord: [30, 0], w: 15, h: 1, text: 'PERSONA QUE RECIBE:', config: { align: 'left', bold: true, } },
      { coord: [45, 0], w: 15, h: 1, text: _DATA.user_retrieve, config: { align: 'left', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });


  pdfSupport.setHeader(doc, { title: ' ', id_public: false, icon: true });
  doc.end();

  return true;
}

function _PDFGEN_STICKER_ARCHIVE(_DATA) {
  const PDFDocument = require('pdfkit');

  let size = [792, 612];
  let margin = 5;

  var doc = new PDFDocument({
    size: size, margins: {
      top: margin,
      bottom: margin,
      left: margin,
      right: margin
    },
    bufferPages: true,
  });
  doc.pipe(fs.createWriteStream('./docs/public/output_sticker_archive.pdf'));

  const stickerDimentions = [320, 227];


  drawSticker(doc, _DATA, 38, 40, stickerDimentions)
  //drawSticker(doc, _DATA, 38, 339, stickerDimentions)
  //drawSticker(doc, _DATA, 428, 40, stickerDimentions)
  //drawSticker(doc, _DATA, 428, 339, stickerDimentions)

  doc.end();

  return true;
}

function _PDFGEN_ABDICATE(_DATA) {
  const PDFDocument = require('pdfkit');
  var pdfSupport = require("../config/pdfSupport.js");
  var doc = new PDFDocument({
    size: 'LEGAL',
    margins: {
      top: 102,
      bottom: 86,
      left: 86,
      right: 102
    },
    bufferPages: true,
  });


  doc.pipe(fs.createWriteStream('./docs/public/res_addiate.pdf'));




  const _BODY = `Hoy ${_DATA.date_string} (${_DATA.date_year}), siendo las ${_DATA.time_string} (${_DATA.time_hour}:${_DATA.time_min}), 
  se presentó en la Oficina de la ${curaduriaInfo.name}, ubicada en ${curaduriaInfo.dir}, 
  ${_DATA.f51_name}, identificado(a) con cédula de ciudadanía N° ${_DATA.f51_id_number} en calidad de ${_DATA.f51_role}, 
  con el fin de notificarse del contenido de la Resolución No. ${_DATA.id_res} emitida dentro del Radicado No. ${_DATA.id_public} 
  expedida por ${curaduriaInfo.name}, de fecha ${_DATA.date_string_2} (${_DATA.date_year_2}).`.replace(/[\n\r]+ */g, ' ');

  const _BODY_2 = `En consecuencia se le hace presente el contenido de la Resolución que se notifica y se le entrega un ejemplar 
  autentico, íntegro y gratuito de la misma; informándosele que contra dicho acto administrativo proceden los recursos de 
  reposición ante la Curadora Urbana que lo expidió y de apelación ante la Oficina Asesora de Planeación de Piedecuesta o en su 
  defecto ante el Alcalde Municipal, para que lo aclare, modifique o revoque, dentro de los diez (10) días siguientes a la presente 
  notificación, de acuerdo con lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015, y el artículo 76 de la Ley 1437 
  de 2011 Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_3 = `Con base en numeral 3 del artículo 87 del CPACCA - Ley 1437 de 2011, el notificado manifiesta de manera libre y 
  voluntaria que renuncia a los términos de ejecutoria del acto y que se encuentra conforme a lo estipulado en el mismo, por lo cual 
  no interpone recurso alguno.`.replace(/[\n\r]+ */g, ' ');

  doc.fontSize(11);

  doc.text('\n\n\n\n\n');
  doc.font('Helvetica-Bold');
  doc.text(`${curaduriaInfo.pronoum} suscrita ${curaduriaInfo.job}, le extiende la presente`, { align: 'center' });
  doc.text('\n\n\n');
  pdfSupport.table(doc,
    [
      { coord: [10, 0], w: 40, h: 1, text: 'NOTIFICACIÓN PERSONAL', config: { align: 'center', bold: true, fill: 'gainsboro' } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true });

  doc.font('Helvetica');
  doc.text('\n\n\n');
  doc.text(_BODY, { align: 'justify' });
  doc.text('\n');
  doc.text(_BODY_2, { align: 'justify' });
  doc.text('\n');
  doc.text(_BODY_3, { align: 'justify' });
  doc.text('\n');
  doc.text('En constancia firman');
  doc.text('\n');
  doc.font('Helvetica-Bold');
  doc.text(`NOTIFICADO(A),
  
  
  
FIRMA: ______________________________________
NOMBRE:
C.C. 



NOTIFICADOR(A)




FIRMA: ______________________________________
NOMBRE:
C.C. `, { align: 'justify' });

  doc.end();

  return true;
}

function _PDFGEN_ABDICATE_CP1(_DATA) {
  const PDFDocument = require('pdfkit');
  var pdfSupport = require("../config/pdfSupport.js");
  var doc = new PDFDocument({
    size: 'LEGAL',
    margins: {
      top: 102,
      bottom: 86,
      left: 72,
      right: 72
    },
    bufferPages: true,
  });

  const bottom_text = "* El artículo 71 del CPACA establece lo siguiente: “AUTORIZACIÓN PARA RECIBIR LA NOTIFICACIÓN. (…) El autorizado solo estará facultado para recibir la notificación y, por tanto, cualquier manifestación que haga en relación con el acto administrativo se tendrá, de pleno derecho, por no realizada.” "

  doc.pipe(fs.createWriteStream('./docs/public/res_addiate.pdf'));

  doc.fontSize(11);

  doc.text('\n\n');
  doc.font('Helvetica-Bold');
  doc.text(`${curaduriaInfo.pronoum} suscrita ${curaduriaInfo.job}, le extiende la presente`, { align: 'center' });
  doc.text('\n\n\n');
  doc.fontSize(10);
  pdfSupport.table(doc,
    [
      { coord: [10, 0], w: 40, h: 1, text: 'NOTIFICACIÓN PERSONAL', config: { align: 'center', bold: true, fill: 'gainsboro' } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true });

  doc.font('Helvetica');
  doc.text('\n\n\n');
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'FECHA', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: _DATA.date_ll.toUpperCase(), config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'HORA', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `${_DATA.time_hour}:${_DATA.time_min}`, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'LUGAR', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: curaduriaInfo.name, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'SOLICITUD RADICADO N°', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `${_DATA.id_public}`, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'SE NOTIFICA LA RESOLUCÍON N°', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `${_DATA.id_res} DEL ${_DATA.date_ll_2.toUpperCase()}`, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'A LA PERSONA CON LOS SIGUIENTES NOMBRES Y APELLIDOS', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `${_DATA.f51_name}`, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'DOCUMENTO DE IDENTIFICACIÓN', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `${_DATA.f51_id_number}`, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'CALIDAD DE QUIEN SE NOTIFICA', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `${_DATA.f51_role}`, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });


  let RESOURCES = "NO PROCEDEN RECURSOS";
  if (_DATA.resources.some((e) => e == 1)) {
    RESOURCES = "";

    if (_DATA.resources[0] == 1) RESOURCES += "-  REPOSICIÓN ANTE LA CURADORA URBANA N° 1 DE PIEDECUESTA"
    if (_DATA.resources[1] == 1 && _DATA.resources[0] == 1) RESOURCES += "\n\n"
    if (_DATA.resources[1] == 1) RESOURCES += "-  APELACIÓN ANTE LA OFICINA ASESORA DE PLANEACIÓN DE PIEDECUESTA O EN SU DEFECTO ANTE EL ALCALDE MUNICIPAL "
  }


  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'RECURSOS QUE PROCEDEN DENTRO DE LOS DIEZ (10) DÍAS SIGUIENTES A LA PRESENTE NOTIFICACIÓN', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: RESOURCES, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

  let ABIDACATE = "    SI:               NO:   X      ";
  if (_DATA.adbdicate) ABIDACATE = "    SI:    X          NO:         ";

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'RENUNCIA A TÉRMINOS DE EJECUTORIA Y A LA INTERPOSICIÓN DE RECURSOS', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: ABIDACATE, config: { align: 'center', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: 'EN LA PRESENTE DILIGENCIA DE NOTIFICACIÓN SE ENTREGA A LA PERSONA INTERESADA COPIA ÍNTEGRA, AUTÉNTICA Y GRATUITA DEL ACTO ADMINISTRATIVO QUE SE NOTIFICA.', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'FIRMA NOTIFICADO(A)', config: { align: 'left', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `\n\n\n\n\n${_DATA.f51_name}\n${_DATA.f51_role}`, config: { align: 'center', valign: "bottom" } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 25, h: 1, text: 'FIRMA Y CARGO NOTIFICADOR(A) OFICINA CURADORA UNO DE PIEDECUESTA', config: { align: 'left', bold: true, fill: 'gainsboro', valign: true } },
      { coord: [25, 0], w: 35, h: 1, text: `\n\n\n\n\n${_DATA.name_not}\n${_DATA.role_not}`, config: { align: 'center', valign: "bottom" } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 });

  doc.text('\n\n');
  doc.text(bottom_text, { align: "justify" });

  pdfSupport.setHeader(doc, { title: ' ', id_public: false, icon: true });

  doc.end();

  return true;
}

function drawSticker(doc, _DATA, x, y, stickerDimentions) {

  doc.image('docs/public/logo192.png', x + 5, y + 5, { width: 45, height: 45 })
  doc.fontSize(10);

  let yi = y;
  doc.font('Helvetica-Bold')
  doc.text(`CURADURIA URBABA N° ${curaduriaInfo.number} DE`, x, y + 10, { width: stickerDimentions[0] - 10, align: 'center' });
  doc.text(`${curaduriaInfo.city}`, { width: stickerDimentions[0] - 10, align: 'center' });

  doc.fontSize(9);
  const col_1_ratio = 2 / 3
  const col_2_ratio = 1 / 3
  doc.font('Helvetica');
  doc.text(`SERIE: `, x + 5, y + stickerDimentions[1] / 3, { width: stickerDimentions[0] * col_1_ratio - 10, align: 'left', continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.serie_str}`);
  doc.font('Helvetica');
  doc.text(`SUBSERIE: `, { width: stickerDimentions[0] * col_1_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.subserie_str}`);
  doc.font('Helvetica');
  doc.text(`RADICADO N° `, { width: stickerDimentions[0] * col_1_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.id_public}`);
  doc.font('Helvetica');
  doc.text(`TITULAR: `, { width: stickerDimentions[0] * col_1_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.titular}`);
  doc.font('Helvetica');
  doc.text(`FECHAS EXTREMAS: `, { width: stickerDimentions[0] * col_1_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.date_1} a ${_DATA.date_2}`);
  doc.font('Helvetica');
  let _y = doc.y

  doc.text(`CÓDIGO: `, x + stickerDimentions[0] * col_1_ratio, y + stickerDimentions[1] / 3, { width: stickerDimentions[0] * col_2_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.serie_cod}`);
  doc.font('Helvetica');
  doc.text(`CÓDIGO: `, x + stickerDimentions[0] * col_1_ratio, doc.y, { width: stickerDimentions[0] * col_2_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.subserie_cod}`);
  doc.font('Helvetica');
  doc.text(`RES. N° `, x + stickerDimentions[0] * col_1_ratio, doc.y, { width: stickerDimentions[0] * col_2_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.resolution}`);
  doc.font('Helvetica');

  doc.text(`CARPETA N°: `, x + 5, _y, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.folder}`);
  doc.font('Helvetica');
  doc.text(`POSICIÓN: `, x + stickerDimentions[0] * 1 / 4 + 20, _y);
  doc.text(`FOLIOS: `, x + stickerDimentions[0] * 2 / 4 + 20, _y, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.pages}`);
  doc.font('Helvetica');
  doc.text(`CAJA N°: `, x + stickerDimentions[0] * 3 / 4 + 10, _y, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.box}`);
  doc.font('Helvetica');
  doc.text(`UBICACIÓN`, x + 5, doc.y);
  _y = doc.y;
  doc.text(`ESTANTE: `, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.row}`);
  doc.font('Helvetica');
  doc.text(`ENTREPAÑO: `, x + stickerDimentions[0] * col_1_ratio, _y, { width: stickerDimentions[0] * col_2_ratio - 10, continued: true });
  doc.font('Helvetica-Bold')
  doc.text(`${_DATA.column}`);
  doc.font('Helvetica');
  doc.text(``);
  let yf = doc.y;

  let height = yf - yi + 8;
  doc.lineJoin('miter')
    .lineWidth(2)
    .rect(x, y, stickerDimentions[0], height)
    .fillColor("black", 1)
    .strokeColor("black", 1)
    .stroke()

  doc.lineJoin('miter')
    .lineWidth(0.5)
    .rect(x - 3, y - 3, stickerDimentions[0] + 6, height + 6)
    .fillColor("black", 1)
    .strokeColor("black", 1)
    .stroke()
}

function curatedMacroData(_data) {
  let data = [];
  console.error(_data)
  _data.map(value => {
    let clocks_id = value.clocks_id ? value.clocks_id.split(';') : [];
    let clocks_state = value.clocks_state ? value.clocks_state.split(';') : [];
    let clocks_version = value.clocks_version ? value.clocks_version.split(';') : [];
    let clocks_date_start = value.clocks_date_start ? value.clocks_date_start.split('&&') : [];
    let resolver_context = value.clocks_dresolver_context ? value.clocks_dresolver_context.split('&&') : [];

    let getClocks = () => {
      if (clocks_id.length == 0) return null;
      let clocks = [];
      clocks_id.map(clockId => {
        let index = clocks_id.indexOf(clockId);
        clocks.push({
          id: clocks_id[index],
          state: clocks_state[index] === 'null' ? null : clocks_state[index],
          version: clocks_version[index] === 'null' ? null : clocks_version[index],
          resolver_context: resolver_context[index] === 'null' ? null : resolver_context[index],
          date_start: clocks_date_start[index] === 'null' ? null : clocks_date_start[index],
        })
      })
      return clocks;
    }

    let getClock = (_state, field, _version = false) => {
      let clocks = getClocks();
      if (!clocks) return null;
      for (let i = 0; i < clocks.length; i++) {
        const _clock = clocks[i];
        if (_version) {
          if (_clock.state == _state && _clock.version == _version) return _clock[field]
        } else {
          if (_clock.state == _state) return _clock[field]
        }
      }
      return null
    }

    let entry = value;
    entry.clock_date = getClock('5', 'date_start'); // 5
    entry.clock_payment = getClock(3, 'date_start'); // 3
    entry.clock_prorroga = getClock(4, 'date_start'); // 4

    entry.clock_not_0 = getClock(31, 'date_start'); // 31
    entry.clock_not_1 = getClock(32, 'date_start'); // 32
    entry.clock_not_2 = getClock(33, 'date_start'); // 33
    entry.clock_record_postpone = getClock(34, 'date_start'); // 34
    entry.clock_corrections = getClock(35, 'date_start'); // 35
    entry.clock_record_p1 = getClock(30, 'date_start'); // 30
    entry.clock_record_p2 = getClock(49, 'date_start'); // 49

    entry.clock_pay2 = getClock(61, 'date_start'); // 61
    entry.clock_pay_not_1 = getClock(56, 'date_start'); // 56
    entry.clock_pay_not_2 = getClock(57, 'date_start'); // 57
    entry.clock_pay_62 = getClock(62, 'date_start'); // 62
    entry.clock_pay_63 = getClock(63, 'date_start'); // 63
    entry.clock_pay_64 = getClock(64, 'date_start'); // 64
    entry.clock_pay_65 = getClock(65, 'date_start'); // 65

    entry.clock_pay_62_c = getClock(62, 'resolver_context'); // 62
    entry.clock_pay_63_c = getClock(63, 'resolver_context'); // 63
    entry.clock_pay_64_c = getClock(64, 'resolver_context'); // 64
    entry.clock_pay_65_c = getClock(65, 'resolver_context'); // 65

    entry.clock_pay_69 = getClock(69, 'date_start'); // 69

    entry.clock_resolution = getClock(70, 'date_start'); // 70
    entry.clock_resolution_c = getClock(70, 'resolver_context'); // 70_c
    entry.clock_not_1_res = getClock(72, 'date_start'); // 72
    entry.clock_not_2_res = getClock(73, 'date_start'); // 73
    entry.clock_not_3_res = getClock(731, 'date_start'); // 731
    entry.clock_forgave_terms = getClock(730, 'date_start'); // 730
    entry.clock_resource = getClock(74, 'date_start'); // 74
    entry.clock_resource_solve = getClock(75, 'date_start'); // 75
    entry.clock_publication = getClock(85, 'date_start'); // 85
    entry.clock_license_2 = getClock(98, 'date_start'); // 98
    entry.clock_license = getClock(99, 'date_start'); // 99
    entry.clock_archive = getClock(101, 'date_start'); // 101


    entry.clock_asign_law = getClock(11, 'date_start', 100); // 11 v 100
    entry.clock_asign_arc = getClock(13, 'date_start', 100); // 13 v 100
    entry.clock_asign_eng = getClock(12, 'date_start', 100); // 12 v 100

    entry.clock_review_law = getClock(11, 'date_start', 200); // 11 v 200
    entry.clock_review_arc = getClock(13, 'date_start', 200); // 13 v 200
    entry.clock_review_eng = getClock(12, 'date_start', 200); // 12 v 200

    entry.clock_inform_law = getClock(11, 'date_start', 300); // 11 v 300
    entry.clock_inform_arc = getClock(13, 'date_start', 300); // 13 v 300
    entry.clock_inform_eng = getClock(12, 'date_start', 300); // 12 v 300

    entry.clock_review_law_c = getClock(11, 'resolver_context', 200); // 11 v 200 c
    entry.clock_review_arc_c = getClock(13, 'resolver_context', 200); // 13 v 200 c
    entry.clock_review_eng_c = getClock(12, 'resolver_context', 200); // 12 v 200 c

    // VR DOCUMENTS

    let docs = value.submit_dates ? value.submit_dates.split(';') : [];
    let type = value.submit_types ? value.submit_types.split(';') : [];
    let codes = value.scodes ? value.scodes.split('-#') : [];
    let rvws = value.sreview ? value.sreview.split('-#') : [];
    let vrDocs = [];

    docs.map((doc, i) => {
      let vr = {};
      vr['date'] = doc;
      vr['type'] = type[i];
      vr['codes'] = [];

      codes.map((codej, j) => {
        let rvw = rvws[j] ? rvws[j].split('#-') : [];
        let code = codes[j] ? codes[j].split('#-') : [];
        if (rvw.length == 0) return;

        let id = code[0]
        let codesId = code[1] ? code[1].split(',') : [];
        let rewId = rvw[1] ? rvw[1].split(',') : [];
        if (doc == id) codesId.map((codek, k) => {
          if (rewId[k] == 'SI') vr['codes'].push(codek)
        })
      })
      vrDocs.push(vr)

    })


    entry.vrdocs = vrDocs;

    data.push(entry)
  })

  return data;
}

function capitalize(word) {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
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
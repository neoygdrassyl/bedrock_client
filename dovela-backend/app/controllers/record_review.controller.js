const db = require("../models");
const RR = db.record_review;

const FUN_0 = db.fun_0;
const FUN_1 = db.fun_1;
const FUN_2 = db.fun_2;
const FUN_3 = db.fun_3;
const FUN_4 = db.fun_4;
const FUN_51 = db.fun_51;
const FUN_52 = db.fun_52;
const FUN_53 = db.fun_53;
const FUN_R = db.fun_r;
const FUN_CLOCK = db.fun_clock;
const FUN_LAW = db.fun_law;

const RA = db.record_arc;
const RA_33A = db.record_arc_33_area;
const RA_34G = db.record_arc_34_gens;
const RA_34K = db.record_arc_34_k;
const RA_35P = db.record_arc_35_parking;
const RA_35L = db.record_arc_35_location;
const RA_36I = db.record_arc_36_info;
const RA_37 = db.record_arc_37;
const RA_38 = db.record_arc_38;
const STEP_A = db.record_arc_step;


const RL = db.record_law;
const R1L = db.record_law_11_liberty;
const R1T = db.record_law_11_tax;
const RLS = db.record_law_step; 7
const RLR = db.record_law_review;

const ENG = db.record_eng;
const STEP_E = db.record_eng_step;
const SIS = db.record_eng_sismic;
const REW = db.record_eng_review;

const EXP = db.expedition;

const USERS = db.users;

const moment = require('moment');
let esLocale = require('moment/locale/es');
const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");
const curaduriaInfo = require('../config/curaduria.json')
const typeParse = require("../config/typeParse");
const Queries = require('../config/generalQueries')

// POST
exports.create = (req, res) => {
  var object = {
    id_public: (req.body.id_public ? req.body.id_public : null),
    fun0Id: (req.body.fun0Id ? req.body.fun0Id : res.send('NO A REAL ID PARENT')),

    check: (req.body.check ? req.body.check : null),
    date: (req.body.date ? req.body.date : null),
    check_2: (req.body.check_2 ? req.body.check_2 : null),
    date_2: (req.body.date_2 ? req.body.date_2 : null),
  }

  const new_cub = (req.body.new_cub);
  const prev_cub = (req.body.prev_cub);

  const { QueryTypes } = require('sequelize');
  var query = Queries.validateLastCUBQuery(new_cub, prev_cub);

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
    if (prev_cub) object.id_public = '';
    _continue_();
  }

  function _continue_() {
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
  }


};

// GET.
exports.findAll = (req, res) => {
  RR.findAll()
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
  RR.findAll({
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
  RR.findByPk(id)
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

  const new_cub = (req.body.new_cub);
  const prev_cub = (req.body.prev_cub);

  const { QueryTypes } = require('sequelize');
  var query = Queries.validateLastCUBQuery(new_cub, prev_cub);

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
    if (prev_cub) req.body.id_public = '';
    _continue_();
  }

  function _continue_() {
    RR.update(req.body, {
      where: { id: id }
    }).then(num => {
      if ((num) == 1) {
        res.send('OK');
      } else {
        res.send('ERROR_2'); // NO MATCHING ID
      }
    })
  }

};

// DELETE BY ID
exports.delete = (req, res) => {
  res.json({ message: "NOT IMPLEMENTED" });
};

// CREATE NEW REVIEW
exports.createVersion = (req, res) => {
  const _fun0Id = req.body.fun0Id ? req.body.fun0Id : 0;
  const _version = req.body.version ? req.body.version : 0;
  const _lawId = req.body.lawId ? req.body.lawId : 0;
  const _engId = req.body.engId ? req.body.engId : 0;
  const _arcId = req.body.arcId ? req.body.arcId : 0;
  var new_version = Number(_version) + 1;
  const { QueryTypes } = require('sequelize');
  var query = `
    INSERT IGNORE INTO fun_1s
	    (tipo, tramite, m_urb, m_sub, m_lic, usos, area, vivienda, cultural, regla_1, regla_2, fun0Id, description, version)
    SELECT 
        tipo, tramite, m_urb, m_sub, m_lic, usos, area, vivienda, cultural, regla_1, regla_2, fun0Id, description, version +1 AS version
    FROM 
        fun_1s
    WHERE 
        fun0Id = ${_fun0Id}
    AND
        version = ${_version};

   INSERT IGNORE INTO fun_53s
	    (name, id_number, role, email, address, number, fun0Id, surname, docs, ${'`check`'}, version)
    SELECT 
        name, id_number, role, email, address, number, fun0Id, surname, docs,  ${'`check`'}, version + 1 AS version
    FROM 
        fun_53s
    WHERE 
        fun0Id = ${_fun0Id}
    AND
        version = ${_version};

   
   INSERT IGNORE INTO fun_cs
	    (${'`date`'}, ${'`condition`'}, worker, fun0Id, reciever_name, reciever_date, reciever_id ,reciever_actor, details, version)
    SELECT 
        ${'`date`'}, ${'`condition`'}, worker, fun0Id, reciever_name, reciever_date, reciever_id ,reciever_actor, details, version +1 AS version
    FROM 
        fun_cs
    WHERE 
        fun0Id = ${_fun0Id}
    AND
        version = ${_version};

     INSERT IGNORE INTO fun_rs
	    (checked, code ,fun0Id ,review, id6, check_control, check_control_pages , version)
    SELECT 
        checked, code ,fun0Id ,review, id6, check_control, check_control_pages , version +1 AS version
    FROM 
        fun_rs
    WHERE 
        fun0Id = ${_fun0Id}
    AND
        version = ${_version};
    
    UPDATE fun_0s SET version = ${new_version}
        WHERE fun_0s.id = ${_fun0Id};

    UPDATE record_arcs SET version = ${new_version}
        WHERE record_arcs.fun0Id = ${_fun0Id};

    UPDATE record_engs SET version = ${new_version}
        WHERE record_engs.fun0Id = ${_fun0Id};

    UPDATE record_laws SET version = ${new_version}
        WHERE record_laws.fun0Id = ${_fun0Id};

    INSERT IGNORE INTO record_eng_steps
	    (id_public,  ${'`check`'},  ${'`value`'}, recordEngId, version)
    SELECT 
        id_public,  ${'`check`'},  ${'`value`'}, recordEngId, version +1 AS version
    FROM 
        record_eng_steps
    WHERE 
        recordEngId = ${_engId}
    AND
        version = ${_version}; 

        INSERT IGNORE INTO record_arc_steps
	    (id_public,  ${'`check`'}, ${'`value`'}, json, recordArcId, version)
    SELECT 
        id_public,  ${'`check`'},  ${'`value`'}, json, recordArcId, version +1 AS version
    FROM 
        record_arc_steps
    WHERE 
        recordArcId = ${_arcId}
    AND
        version = ${_version}; 


    INSERT IGNORE INTO record_arc_38s
	    (detail,  ${'`check`'}, worker_id, worker_name, ${'`date`'}, recordArcId, version)
    SELECT 
         detail,  ${'`check`'}, worker_id, worker_name, ${'`date`'}, recordArcId, version +1 AS version
    FROM 
        record_arc_38s
    WHERE 
        recordArcId = ${_arcId}
    AND
        version = ${_version}; 

    INSERT IGNORE INTO record_law_reviews
	    (detail,  ${'`check`'}, worker_id, worker_name, ${'`date`'}, recordLawId, version)
    SELECT 
         detail,  ${'`check`'}, worker_id, worker_name, ${'`date`'}, recordLawId, version +1 AS version
    FROM 
        record_law_reviews
    WHERE 
        recordLawId = ${_lawId}
    AND
        version = ${_version}; 

    INSERT IGNORE INTO record_eng_reviews
	    (detail,  detail_2,  ${'`desc`'}, ${'`check`'}, check_2, worker_id, worker_name, ${'`date`'}, check_context, check_2_cotext, recordEngId, version)
    SELECT 
         detail,  detail_2,  ${'`desc`'}, ${'`check`'}, check_2, worker_id, worker_name, ${'`date`'}, check_context, check_2_cotext, recordEngId, version +1 AS version
    FROM 
        record_eng_reviews
    WHERE 
        recordEngId = ${_engId}
    AND
        version = ${_version}; 
    `.replace(/[\n\r]+ */g, ' ').replace(/[\t\r]+ */g, ' ');

  db.sequelize.query(query, { type: QueryTypes.RAW })
    .then(data => {
      res.send('OK');
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
};

exports.pdfgen = (req, res) => {

  const _version = req.body.version ? req.body.version : res.send('NOT A REAL VERSION');
  const _id = req.body.id ? req.body.id : res.send('NOT A REAL ID');
  const _type_rev = req.body.type_rev ? req.body.type_rev : 1;
  const _date = req.body.record_date ? req.body.record_date : ' ';

  let _arc_id;
  let _law_id;
  let _eng_id;

  var oject = {
    type_not: (req.body.type_not ? req.body.type_not : 0),
    type_not_name: (req.body.type_not_name ? req.body.type_not_name : ''),
    type_not_email: (req.body.type_not_email ? req.body.type_not_email : ''),
    version: _version,
    r_simple: req.body.r_simple === 'true' ? 1 : 0,
    r_pagination: req.body.r_pagination === 'true' ? 1 : 0,
    r_footer: req.body.r_footer === 'true' ? 1 : 0,
    r_eng_diagnostic: req.body.r_eng_diagnostic === 'true' ? 1 : 0,
    r_notdig: {
      not: req.body.r_notdig === 'true' ? 1 : 0,
      pro: req.body.r_notdig_pro ? req.body.r_notdig_pro : '',
      names: req.body.r_notdig_names ? req.body.r_notdig_names : '',
    },
    type_rev: _type_rev,
    date: _date,
    rew_arc: {
      r_worker: req.body.r_worker_arc ? req.body.r_worker_arc : '',
      r_check: req.body.r_check_arc ? req.body.r_check_arc : 'NO VIABLE',
      r_date: req.body.r_date_arc ? req.body.r_date_arc : '',
      r_pending: req.body.r_arc_pending === 'true' ? 1 : 0,

    },
    rew_law: {
      r_worker: req.body.r_worker_law ? req.body.r_worker_law : '',
      r_check: req.body.r_check_law ? req.body.r_check_law : 'NO VIABLE',
      r_date: req.body.r_date_law ? req.body.r_date_law : '',
      r_pending: req.body.r_law_pending === 'true' ? 1 : 0,
    },
    rew_eng: {
      r_worker: req.body.r_worker_eng ? req.body.r_worker_eng : '',
      r_date: req.body.r_date_eng ? req.body.r_date_eng : '',
      r_pending: req.body.r_engc_pending === 'true' ? 1 : 0,

      r_check: req.body.r_check_eng ? req.body.r_check_eng : 'NO VIABLE',
      r_check_2: req.body.r_check_2_eng ? req.body.r_check_2_eng : 'NO VIABLE',
      r_check_3: req.body.r_check_3_eng ? req.body.r_check_3_eng : 'NO VIABLE',

      r_check_c: req.body.r_check_c_eng ? req.body.r_check_c_eng : '',
      r_check_2_c: req.body.r_check_2_c_eng ? req.body.r_check_2_c_eng : '',
      r_check_3_c: req.body.r_check_3_c_eng ? req.body.r_check_3_c_eng : '',
    },
    id: _id,
    fun: null,
    fun_1s: null,
    fun_2: null,
    fun_3s: null,
    fun_51s: null,
    fun_52s: null,
    fun_53s: null,
    fun_clocks: null,
    record_arc: null,
    record_law: null,
    record_eng: null,
    recorc_rev: null,
  }

  _continue_();

  function _continue_() {
    FUN_0.findOne({
      include:
        [RA, RR,
          { model: FUN_1, where: { version: _version }, required: false, },
          { model: FUN_2 },
          //{ model: FUN_3 },
          { model: FUN_51 },
          { model: FUN_52 },
          { model: FUN_LAW },
          //{ model: FUN_53, where: { version: _DATA.version }, required: false, },
          //{ model: FUN_R, where: { version: _DATA.version }, required: false, },
          //{ model: FUN_ARC },

        ],
      where: { id: _id, }
    })
      .then(data => {
        oject.id_public = data.id_public;
        oject.fun_1s = data.fun_1s;
        oject.fun_2 = data.fun_2;
        oject.fun_law = data.fun_law;
        oject.fun_51s = data.fun_51s;
        oject.fun_52s = data.fun_52s;
        _arc_id = data.record_arc.id;
        oject.record_arc = data.record_arc;
        oject.recorc_rev = data.record_review;
        _continue_funClock();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });

  }

  function _continue_funClock() {
    FUN_CLOCK.findAll({
      where: { fun0Id: _id, }
    })
      .then(data => {
        oject.fun_clocks = data
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
      include: [STEP_A,],
      where: { id: _arc_id, }
    })
      .then(data => {
        //console.log('OBJECT_ID', data)
        oject.record_arc_steps = data.record_arc_steps;
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
        _continue_RA35L_();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }
  function _continue_RA35L_() {
    RA.findOne({
      include: [RA_35L,],
      where: { id: _arc_id, }
    })
      .then(data => {
        oject.record_arc.record_arc_35_locations = data.record_arc_35_locations;
        _continue_RA37_();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }
  function _continue_RA37_() {
    RA.findOne({
      include: [RA_37],
      where: { id: _arc_id, }
    })
      .then(data => {
        oject.record_arc.record_arc_37s = data.record_arc_37s;
        _continue_RA38_();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }
  function _continue_RA38_() {
    RA.findOne({
      include: [RA_38,],
      where: { id: _arc_id, }
    })
      .then(data => {
        oject.record_arc.record_arc_38s = data.record_arc_38s;
        _continue_R_LAW_();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }

  function _continue_R_LAW_() {
    FUN_0.findOne({
      include:
        [
          {
            model: RL, include:
              [
                RLS,
                R1L,
                R1T,
                RLR
              ],
            where: { version: oject.version }, required: false,
          },
          { model: FUN_3 },
          { model: FUN_53, where: { version: oject.version }, required: false, },
          { model: FUN_R, where: { version: oject.version }, required: false, },

        ],
      where: { id: oject.id, }
    })
      .then(data => {
        oject.fun_3s = data.fun_3s;
        oject.fun_53s = data.fun_53s;
        oject.record_law = data.record_law;

        _continue_R_ENG_(oject);
      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }

  function _continue_R_ENG_() {
    FUN_0.findOne({
      include:
        [
          {
            model: ENG, include: [
              { model: SIS, required: false, },
              { model: STEP_E, where: { version: oject.version }, required: false, },
              { model: REW, where: { version: oject.version }, required: false, },
            ],
            where: { version: oject.version },
            required: false,
          },
        ],
      where: { id: oject.id, }
    })
      .then(data => {
        oject.record_eng = data.record_eng;

        _continue_EXP_(oject);
      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }

  function _continue_EXP_() {
    EXP.findOne({
      where: { fun0Id: _id, }
    })
      .then(data => {
        oject.exp = data;
        _continue_to_pdf_();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }

  function _continue_to_pdf_() {
    pdfCreate(oject);
    res.send('OK');
  }
};

exports.gendoc_confirmact = (req, res) => {
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

    digital_firm: (req.body.digital_firm == 'true' ? true : false),
    cub: (req.body.cub ? req.body.cub : ''),
  }
  _PDFGEN_DOCCONFIRM_ACT(_DATA);
  res.send('OK');
};

exports.gendoc_confirmact_2 = (req, res) => {
  // Create
  var _DATA = {
    date_limit_2: (req.body.date_limit_2 != 'null' ? req.body.date_limit_2 : ""),
    date_limit: (req.body.date_limit != 'null' ? req.body.date_limit : ""),
    date_doc: (req.body.date_doc != 'null' ? req.body.date_doc : ""),
    id_public: (req.body.id_public != 'null' ? req.body.id_public : ""),
    name: (req.body.name != 'null' ? req.body.name : ""),
    city: (req.body.city != 'null' ? req.body.city : ""),
    email: (req.body.email != 'null' ? req.body.email : ""),
    address: (req.body.address != 'null' ? req.body.address : ""),

    digital_firm: (req.body.digital_firm == 'true' ? true : false),
    cub: (req.body.cub ? req.body.cub : ''),
  }
  _PDFGEN_DOCCONFIRM_ACT_2(_DATA);
  res.send('OK');
};

async function find_user_registration(name, surname) {
  return USERS.findOne({
    where: { name: name, surname: surname }
  }).then(data => {
    return data.registration || ''
  })
    .catch(err => {
      return ''
    });

}

async function pdfCreate(_DATA) {
  const PDFDocument = require('pdfkit');
  const RR_ARC = require('./record_arc.controller.js');
  const RR_LAW = require('./record_law.controller.js');
  const RR_ENG = require('./record_eng.controller.js');
  var doc = new PDFDocument({
    size: 'LEGAL',
    margins: {
      top: 128,
      bottom: 56,
      left: 32,
      right: 32
    },
    bufferPages: true,
  });

  const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
  const fun_2 = _DATA ? _DATA.fun_2 ? _DATA.fun_2 : {} : {};
  const fun_53 = _DATA ? _DATA.fun_53s ? _DATA.fun_53s.length > 0 ? _DATA.fun_53s[0] : false : false : false;

  const _BODY = `Es importante recordar lo dispuesto en el Artículo 2.2.6.1.2.2.4 de Decreto 1077 de 2015, que dice: 
  El solicitante contará con un plazo de treinta (30) días hábiles para dar respuesta al requerimiento. 
  Este plazo podrá ser ampliado, a solicitud de parte, hasta por un término adicional de quince (15) días hábiles. 
  Durante este periodo se suspenderá el término para el acto administrativo, vencido este plazo se declara desistida la solicitud 
  de la actuación urbanística, acto contra el cual se puede interponer recurso de reposición.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `Si considera necesario alguna aclaración sobre los aspectos aquí contemplados, favor acercarse a 
  nuestras oficinas donde el equipo de profesionales con gusto atenderá sus inquietudes y sugerencias. Una vez resueltas 
  las observaciones anotadas en la presente acta, el trámite de expedición de licencia culminará favorablemente.`.replace(/[\n\r]+ */g, ' ');


  const _BODY3 = `En cumplimiento de las normas urbanísticas establecidas en el ${curaduriaInfo.pot.pot} del municipio, la norma
  sismo resistente NSR-10 y el Decreto 1077 de 2015, me permito informarle que el proyecto debe
  dar cumplimiento a las siguientes actualizaciones, correcciones o aclaraciones y adjuntar los
  documentos solicitados, así:`.replace(/[\n\r]+ */g, ' ');

  const _BODY4 = `En caso de que la documentación e información requerida en la presente acta ya haya sido radicada en la 
  Ventanilla Única de esta Curaduría Urbana, favor hacer caso omiso a la observación inmediatamente anterior y en su lugar, 
  sírvase presentar únicamente lo pendiente.`.replace(/[\n\r]+ */g, ' ');


  const _BODY_II = `De conformidad con lo establecido en el artículo 2.2.6.1.2.2.4 del Decreto 1077 de 2015, este documento tiene como objetivo informar y 
  comunicar las observaciones, correcciones o documentos adicionales que deberá realizar o entregar para garantizar el cumplimiento de los requisitos técnicos, 
  jurídicos y normativos aplicables a su proyecto, y así continuar con el trámite de su solicitud.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_IV = `Si no atiende el requerimiento, omitiendo las correcciones y/o la entrega de documentos dentro del plazo establecido, su 
  solicitud se entenderá como desistida, procediéndose al archivo del expediente mediante acto administrativo. En tal caso, deberá iniciar un nuevo trámite 
  si desea continuar con el proyecto.`.replace(/[\n\r]+ */g, ' ');

  const _BODY_V = `A continuación, se detallan las actualizaciones, correcciones o aclaraciones que deberá realizar en cada componente del proyecto, 
  así como los documentos adicionales que debe aportar para la evaluación y decisión de la solicitud: `.replace(/[\n\r]+ */g, ' ');

  const _BODY_VI = `Para consultas o aclaraciones, puede contactarnos a través del correo electrónico ${curaduriaInfo.email}, el celular 314-471-0505, 
  el teléfono (607) 6552000 o sírvase comparecer a la Oficina ubicada en el Local 321 del “Centro Comercial Delacuesta”, Carrera 15 No. 3AN - 10. 
  No se aceptan respuestas  o envíos de documentos vía WhatsApp, ni a correos personales.`.replace(/[\n\r]+ */g, ' ');


  doc.pipe(fs.createWriteStream('./docs/public/output_recorwd_rew.pdf'));

  if (_DATA.type_not == 2 || _DATA.type_not == 3) {
    var _main_body = "";
    if (_DATA.type_not == 2) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; informándose además que contra dicho acto administrativo no se proceden recursos.`;
    if (_DATA.type_not == 3) _main_body = `En consecuencia, se le hace presente el contenido de la Resolución que se notifica; Informándose además que contra dicho acto administrativo proceden los recursos de reposición ante el/la Curador/a Urbano/a que lo expidió y de apelación ante la Oficina Asesora de Planeación, para que lo aclare, modifique o revoque. El recurso de apelación podrá interponerse directamente, o como subsidiario del de reposición, dentro de los diez (10) días hábiles siguientes a la notificación, conforme a lo establecido en el artículo 2.2.6.1.2.3.9 del Decreto 1077 de 2015 y los artículos 74 y siguientes de la Ley 1437 de 2011.`;

    const _BODIES_NOTS = [
      `ASUNTO: NOTIFICACIÓN ELECTRÓNICA RADICADO N° ${_DATA.id_public} DEL ${dateParser(_DATA.date).toUpperCase()}`,
      `Por medo del presente está siendo notificado electrónicamente del Acta de Observaciones y Correcciones contenido en el Radicado N° ${_DATA.id_public} del ${dateParser(_DATA.date)} expedida por ${curaduriaInfo.pronoum} ${curaduriaInfo.job}. El acto administrativo objeto de notificación se encuentra adjunto a la presente comunicación.`,
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

    doc.text(`${_DATA.type_not_name}`);
    doc.text(_DATA.type_not_email);

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

  doc.fontSize(9);
  if (curaduriaInfo.id == 'cup1') doc.fontSize(12);
  let date = _DATA.date;


  if (_DATA.r_notdig.not) {
    doc.text(`${curaduriaInfo.city}, ${moment(date).locale('es', esLocale).format('LL')} `);
    doc.text('\n');
    doc.font('Helvetica')
    doc.text(_DATA.r_notdig.pro);
    let names = _DATA.r_notdig.names ? _DATA.r_notdig.names.split(',') : [];
    doc.font('Helvetica-Bold')
    names.map(name => doc.text(name))
    doc.text('\n');
  }
  doc.fontSize(8);
  if (curaduriaInfo.id == 'cup1') doc.fontSize(11);

  const simple = _DATA.r_simple == '1' ? true : false;
  if (simple) {
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 28, h: 1, text: '1. INFORMACIÓN GENERAL', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
        { coord: [28, 0], w: 11, h: 1, text: 'OBSERVACIONES:', config: { bold: true, fill: 'gold', color: 'black', align: 'left' } },
        { coord: [39, 0], w: 2, h: 1, text: _DATA.type_rev == 1 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
        { coord: [41, 0], w: 11, h: 1, text: 'CORRECCIONES:', config: { bold: true, fill: 'gold', color: 'black', align: 'left' } },
        { coord: [52, 0], w: 2, h: 1, text: _DATA.type_rev == 2 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
      ],
      [doc.x, doc.y], [54, 1], { lineHeight: -1 })



    if (curaduriaInfo.id == 'cup1') {
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: `FECHA DE ELABORACIÓN`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [10, 0], w: 20, h: 1, text: `${date}`, config: { align: 'center', valign: true, } },

          { coord: [30, 0], w: 10, h: 1, text: `CONSECUTIVO DE LA COMUNICACIÓN`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [40, 0], w: 20, h: 1, text: `${_DATA.recorc_rev.id_public || ''}`, config: { align: 'left', valign: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: `RADICACIÓN N°`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [10, 0], w: 20, h: 1, text: `${_DATA.id_public}`, config: { align: 'center', valign: true, } },

          { coord: [30, 0], w: 10, h: 1, text: `TIPO DE SOLICITUD`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [40, 0], w: 20, h: 1, text: `${typeParse.formsParser1(fun_1)}`, config: { align: 'left', valign: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: `DIRECCIÓN DEL PROYECTO`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [10, 0], w: 20, h: 1, text: `${_ADDRESS_SET_FULL(fun_2)}`, config: { align: 'center', valign: true, } },

          { coord: [30, 0], w: 10, h: 1, text: `RESPONSABLE DE LA SOLICITUD`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [40, 0], w: 20, h: 1, text: `${fun_53 ? fun_53.name + ' ' + fun_53.surname : ' '}`, config: { align: 'left', valign: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [{ coord: [0, 0], w: 60, h: 1, text: '2. OBJETIVO', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: '', config: { align: 'justify', hide: true, } },
          { coord: [1, 0], w: 58, h: 1, text: _BODY_II, config: { align: 'justify', hide: true, } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [{ coord: [0, 0], w: 60, h: 1, text: '3. PLAZOS', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

      doc.font('Helvetica-Bold');
      doc.text('\n');
      doc.text('3.1. Plazo inicial: ', { continued: true });
      doc.font('Helvetica');
      doc.text('Usted cuenta con un plazo de ', { continued: true });
      doc.font('Helvetica-Bold');
      doc.text('treinta (30) días hábiles', { continued: true });
      doc.font('Helvetica');
      doc.text(', contados a partir de la notificación del presente acta, para realizar las correcciones, actualizaciones o entregar los documentos adicionales requeridos.', { continued: true });
      doc.text('\n');

      doc.font('Helvetica-Bold');
      doc.text('3.2. Ampliación del plazo: ', { continued: true });
      doc.font('Helvetica');
      doc.text('Si requiere más tiempo, podrá solicitar la ampliación del plazo por un término adicional de quince (15) días hábiles, radicando la solicitud antes del vencimiento del plazo inicial, ya sea en ventanilla única o a través del correo electrónico ', { continued: true });
      doc.font('Helvetica-Bold');
      doc.text('curaduria1piedecuesta@gmail.com', { continued: true });
      doc.font('Helvetica');
      doc.text(', y será respondida por escrito la suscrita Curadora Urbana, informándole el nuevo término y la fecha de vencimiento correspondiente.', { continued: true });
      doc.text('\n');

      doc.font('Helvetica-Bold');
      doc.text('3.3 Renuncia al plazo restante: ', { continued: true });
      doc.font('Helvetica');
      doc.text('En caso de que atienda las observaciones y correcciones antes del vencimiento del plazo inicial o su ampliación, podrá ', { continued: true });
      doc.font('Helvetica-Bold');
      doc.text('renunciar expresamente ', { continued: true });
      doc.font('Helvetica');
      doc.text('al término restante, para que se reanude el trámite.', { continued: true });
      doc.text('\n');

      doc.font('Helvetica-Bold');
      doc.text('3.4 Suspensión del plazo para decidir:', { continued: true });
      doc.font('Helvetica');
      doc.text('Durante el término dispuesto para dar respuesta al presente acta, el plazo para el estudio y trámite de la licencia se entenderá ', { continued: true });
      doc.font('Helvetica-Bold');
      doc.text('suspendido. ', { continued: true });
      doc.font('Helvetica');
      doc.text('Este plazo se reanudará el día hábil siguiente al vencimiento del término máximo para subsanar las observaciones.', { continued: true });
      doc.text('\n');
      doc.text('\n');


      pdfSupport.table(doc,
        [{ coord: [0, 0], w: 60, h: 1, text: '4. CONSECUENCIAS DEL INCUMPLIMIENTO ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: '', config: { align: 'justify', hide: true, } },
          { coord: [1, 0], w: 58, h: 1, text: _BODY_IV, config: { align: 'justify', hide: true } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [{ coord: [0, 0], w: 60, h: 1, text: '5. OBSERVACIONES DETALLADAS ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: '', config: { align: 'justify', hide: true, } },
          { coord: [1, 0], w: 58, h: 1, text: _BODY_V, config: { align: 'justify', hide: true } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

    } else {
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: `TIPO DE LICENCIA`, config: { align: 'left', bold: true, valign: true } },
          { coord: [10, 0], w: 50, h: 1, text: `${typeParse.formsParser1(fun_1)}`, config: { align: 'left' } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: `N° RADICACIÓN`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [10, 0], w: 20, h: 1, text: `${_DATA.id_public}`, config: { align: 'center', valign: true, } },

          { coord: [30, 0], w: 10, h: 1, text: `DIRECCIÓN PREDIO`, config: { align: 'left', bold: true, valign: true, } },
          { coord: [40, 0], w: 20, h: 1, text: `${_ADDRESS_SET_FULL(fun_2)}`, config: { align: 'left', valign: true, } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: '', config: { align: 'justify', } },
          { coord: [2, 0], w: 56, h: 1, text: _BODY3, config: { align: 'justify', hide: true } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
    }

    doc.text('\n\n');
  }




  if (simple) {
    doc.fontSize(8);
    if (curaduriaInfo.id == 'cup1') doc.fontSize(11);
    if (curaduriaInfo.id == 'cup1') pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: '5.1. REVISIÓN JURÍDICA', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
    else pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: 'II. REVISIÓN JURÍDICA', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  }

  if (curaduriaInfo.id == 'cup1') _DATA.omit_date = true;
  _DATA.rew = _DATA.rew_law;
  RR_LAW.PDFGEN_LAW_RECORD_EXP(_DATA, doc, simple);

  if (!simple) doc.addPage();
  if (!simple) doc.switchToPage(doc.bufferedPageRange().count - 1);
  if (simple) doc.text('\n\n');
  if (simple) {
    doc.fontSize(8);
    if (curaduriaInfo.id == 'cup1') doc.fontSize(11);
    if (curaduriaInfo.id == 'cup1') pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: '5.2. REVISIÓN ARQUITECTÓNICA', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
    else pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: 'III. REVISIÓN ARQUITECTÓNICA', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  }
  doc.x = doc.page.margins.left;

  _DATA.rew = _DATA.rew_arc;
  RR_ARC.PDFGEN_ARC_RECORD_EXP(_DATA, doc, simple);

  if (!simple) doc.addPage();
  if (!simple) doc.switchToPage(doc.bufferedPageRange().count - 1);
  if (simple) doc.text('\n\n');

  if (simple) {
    doc.fontSize(8);
    if (curaduriaInfo.id == 'cup1') doc.fontSize(11);
    if (curaduriaInfo.id == 'cup1') pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: '5.3. REVISIÓN ESTRUCTURAL ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
    else pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: 'IV. REVISIÓN ESTRUCTURAL ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  }

  doc.startPage = doc.bufferedPageRange().count - 1;
  doc.lastPage = doc.bufferedPageRange().count - 1;
  doc.x = doc.page.margins.left;

  _DATA.rew = _DATA.rew_eng;
  RR_ENG.PDFGEN_ENG_RECORD_EXP(_DATA, doc, simple);


  doc.fontSize(8);
  if (curaduriaInfo.id == 'cup1') doc.fontSize(11);
  if (_DATA.type_rev == 1 && (_DATA.recorc_rev ? _DATA.recorc_rev.check == 0 : true) && curaduriaInfo.id != 'cup1') {
    if (doc.y > 700) { doc.addPage(); doc.y = doc.page.margins.top }
    doc.text('\n');
    doc.text(`${_BODY}`, { align: 'justify' });
    doc.text('\n');
    doc.text(`${_BODY2}`, { align: 'justify' });
    doc.text('\n');
    doc.text(`${_BODY4}`, { align: 'justify' });
  }

  let signLimiteTolerance = 90
  if (_DATA.type_not == 1) signLimiteTolerance = 165
  let JumpAtY = doc.page.height - doc.page.margins.bottom
  JumpAtY -= signLimiteTolerance
  if (doc.y > JumpAtY) { doc.addPage(); doc.y = doc.page.margins.top }

  if (curaduriaInfo.id == 'cup1') {
    doc.text('\n');
    pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: '6. INFORMACIÓN DE CONTACTO ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: '', config: { align: 'justify', hide: true, } },
        { coord: [1, 0], w: 58, h: 1, text: _BODY_VI, config: { align: 'justify', hide: true } },

      ],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
    pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: '7. FIRMA AUTORIZADA ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
    doc.text('\n');
    doc.text(`Se expide a los ${moment(date).format('DD')} día(s) del mes de ${moment(date).locale('es', esLocale).format('MMMM')} del ${moment(date).format('YYYY')}`, { align: 'justify' });
    doc.text('\n');

  }

  if (curaduriaInfo.id == 'cup1') {
    doc.fontSize(11);
    const sign = `Cordialmente\n\n\n\n\n${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}\n${curaduriaInfo.job}`
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: sign, config: { align: 'left', hide: true, bold: true } },
      ],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  } else {
    doc.text('\n');
    doc.text(`Cordialmente`, { align: 'justify' });
    doc.text('\n\n\n\n\n');
    doc.font('Helvetica-Bold')
    doc.fontSize(9);
    doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    doc.fontSize(8);
    doc.text(curaduriaInfo.job);
  }

  doc.text('\n');
  doc.fontSize(7);
  if (curaduriaInfo.id == 'cup1') doc.fontSize(11);

  if (curaduriaInfo.id == 'cup1' && _DATA.type_not == 4) {
    pdfSupport.table(doc,
      [{ coord: [0, 0], w: 60, h: 1, text: '8. COMUNICACIÓN AL USUARIO ', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },],
      [doc.x, doc.y], [60, 1], {})
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 30, h: 1, text: `Fecha de Comunicación\n\n\n\n${dateParser(_DATA.type_not_name)}`, config: { align: 'center' } },
        { coord: [30, 0], w: 30, h: 1, text: `Firma del Recibido\n\n\n\n${fun_53 ? fun_53.name + ' ' + fun_53.surname : ' '}`, config: { align: 'center' } },
      ],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  }

  if (_DATA.type_not == 1) {
    if (curaduriaInfo.id !== 'cup1') {
      doc.text(`Se expide a los ${moment(date).format('DD')} día(s) del mes de ${moment(date).locale('es', esLocale).format('MMMM')} del ${moment(date).format('YYYY')}`, { align: 'justify' });
      doc.text('\n');
    }

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: 'NOTIFICACIÓN PERSONAL', config: { align: 'center', bold: true } },
      ],
      [doc.x, doc.y],
      [60, 1],
      { lineHeight: -1 })
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 15, h: 1, text: 'NOMBRE DEL NOTIFICADO', config: { align: 'center', bold: true } },
        { coord: [15, 0], w: 15, h: 1, text: 'DOCUMENTO DE IDENTIDAD', config: { align: 'center', bold: true } },
        { coord: [30, 0], w: 15, h: 1, text: 'FECHA Y HORA DE NOTIFICACIÓN', config: { align: 'center', bold: true } },
        { coord: [45, 0], w: 15, h: 1, text: 'FIRMA DEL NOTIFICADO', config: { align: 'center', bold: true } },
      ],
      [doc.x, doc.y],
      [60, 1],
      { lineHeight: -1 })
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 15, h: 1, text: '\n\n\n\n', config: { align: 'center', bold: true } },
        { coord: [15, 0], w: 15, h: 1, text: '\n\n\n\n', config: { align: 'center', bold: true } },
        { coord: [30, 0], w: 15, h: 1, text: '\n\n\n\n', config: { align: 'center', bold: true } },
        { coord: [45, 0], w: 15, h: 1, text: '\n\n\n\n', config: { align: 'center', bold: true } },

      ],
      [doc.x, doc.y],
      [60, 1],
      { lineHeight: -1 })
  }


  let SERIAL = _DATA ? _DATA.id_public : '';
  if (_DATA && _DATA.recorc_rev && _DATA.id_public) {
    let f_id = _DATA.id_public;
    let r_id = _DATA.recorc_rev.id_public;
    if (r_id && f_id != r_id) {
      SERIAL += ' \n' + _DATA.recorc_rev.id_public;
    }
  }


  pdfSupport.setHeader(doc, { title: 'ACTA OBSERVACIONES Y CORRECCIONES', size: 13, icon: true, id_public: SERIAL });
  pdfSupport.setBottom(doc, _DATA.r_pagination, _DATA.r_footer);

  if (_DATA.r_eng_diagnostic) await _ENG_DIAGNOSTIC(doc, _DATA)

  doc.end();
  return true;

}

async function _ENG_DIAGNOSTIC(doc, _DATA) {
  const worker = _DATA.rew_eng.r_worker ? _DATA.rew_eng.r_worker : '';
  const worker_name = worker.split(' ')[0] || false;
  const worker_surname = worker.split(' ')[1] || false;
  let worker_registration = ''
  if (worker_name && worker_surname) worker_registration = await find_user_registration(worker_name, worker_surname)

  const fun_52 = _DATA ? _DATA.fun_52s : [];
  let _FIND_PROFESIOANL = (_role) => {
    for (var i = 0; i < fun_52.length; i++) {
      if (fun_52[i].role.includes(_role)) return fun_52[i];
    }
    return false;
  }



  const P_1 = `El o Los suscrito(s) revisores de oficio de los diseños estructurales, de los diseños sismicos de los
  elementos no estructurales y del estudio geoténico del proyecto, hacemos constar que se entregó
  una realación de deficiencias en los documentos mencionado,las cuales quedaron consignadas en
  la respectiva Acta de Observaciones y correciones.`.replace(/[\n\r]+ */g, ' ');
  const P_2 = `Una vez atendidas las observaciones, concluimos que el proyecto CUMPLE con los requisitos del
  Reglamento Colombiano de Construcciones Sismo resistente NSR-10, con respecto al alcance
  establecido en las secciones 3.6.2, 3.7.2, 3.8.2 de la Resolución 017 de 2017, expedida por la
  Comisión Asesora Permanente para el Régimen de Construcciones Sismo Resistentes.`.replace(/[\n\r]+ */g, ' ');
  const P_3 = `Que el diseñador estructural cumplió con el alcance de los trabajos de diseño estructural
  establecido en la sección 3.3 resolución 017 de 2017.`.replace(/[\n\r]+ */g, ' ');
  const P_4 = `El estudio de suelos da el cumplimiento del Reglamento NSR‐10 según el alcance dado en 3.4.2
  resolución 017 de 2017.`.replace(/[\n\r]+ */g, ' ');
  const P_5 = `Se cumple el alcance del diseño de los elementos no estructurales dados en 3.5.2 y los documentos
  entregados según 3.5.3 resolución 017 de 2017.`.replace(/[\n\r]+ */g, ' ');
  const P_6 = `Igualmente, manifestamos bajo la gravedad de Juramento no encontrarnos en ninguna de las
  incompatibilidades previstas en el articulo 17 de la Ley 1796 de 2016.`.replace(/[\n\r]+ */g, ' ');

  doc.addPage()
  doc.fontSize(14);
  doc.font('Helvetica-Bold')
  doc.text('DIAGNÓSTICO FINAL DE LA REVISION DE OFICIO', { align: 'center' });
  doc.text('\n');
  doc.fontSize(12);
  doc.font('Helvetica')
  doc.text(`Por medio del cual se certifica el cumplimiento de la NSR-10, para el proyecto que se describe a contiuación y elaborado por:`, { align: 'center' });
  doc.text('\n');

  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'No. RADICACION', config: { bold: false, align: 'left' } },
    { coord: [40, 0], w: 20, h: 1, text: _DATA.id_public, config: { bold: false, align: 'left' } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  const PROF_1 = _FIND_PROFESIOANL('INGENIERO CIVIL DISEÑADOR ESTRUCTURAL')
  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Diseñador Estructural', config: { bold: false, align: 'left' } },
    { coord: [40, 0], w: 20, h: 1, text: PROF_1 ? PROF_1.name + " " + PROF_1.surname : '', config: { bold: false, align: 'left' } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })


  const PROF_2 = _FIND_PROFESIOANL('INGENIERO CIVIL GEOTECNISTA')
  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Ing. Civil Geotecnista', config: { bold: false, align: 'left' } },
    { coord: [40, 0], w: 20, h: 1, text: PROF_2 ? PROF_2.name + " " + PROF_2.surname : '', config: { bold: false, align: 'left' } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })


  const PROF_3 = _FIND_PROFESIOANL('DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES')
  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Diseñador Elementos no estructurales', config: { bold: false, align: 'left' } },
    { coord: [40, 0], w: 20, h: 1, text: PROF_3 ? PROF_3.name + " " + PROF_3.surname : '', config: { bold: false, align: 'left' } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })


  const PROF_4 = _FIND_PROFESIOANL('REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES')
  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Revisor Independiente del diseño Estructural (en caso de aplicar)', config: { bold: false, align: 'left' } },
    { coord: [40, 0], w: 20, h: 1, text: PROF_4 ? PROF_4.name + " " + PROF_4.surname : '', config: { bold: false, align: 'left' } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  doc.text('\n');
  doc.text(P_1, { align: 'justify' });
  doc.text('\n');
  doc.text(P_2, { align: 'justify' });
  doc.text('\n');
  doc.text(P_3, { align: 'justify' });
  doc.text(P_4, { align: 'justify' });
  doc.text(P_5, { align: 'justify' });
  doc.text('\n');
  doc.text(P_6, { align: 'justify' });
  doc.text('\n');

  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Fecha de suscripción del presente Diagnostico', config: { bold: false, align: 'left' } },
    { coord: [40, 0], w: 20, h: 1, text: _DATA.date ? _DATA.date : '', config: { bold: false, align: 'left' } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: '\nFIRMA', config: { bold: false, align: 'left' } },
    { coord: [40, 0], w: 20, h: 1, text: '', config: { bold: false, align: 'left' } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Nombre Revisor de Oficio', config: { bold: false, align: 'left', fill: 'gainsboro', } },
    { coord: [40, 0], w: 20, h: 1, text: worker, config: { bold: false, align: 'left', fill: 'gainsboro', } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Ing. Civil - Especialista', config: { bold: false, align: 'left', fill: 'gainsboro', } },
    { coord: [40, 0], w: 20, h: 1, text: '', config: { bold: false, align: 'left', fill: 'gainsboro', } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  pdfSupport.table(doc,
    [{ coord: [0, 0], w: 40, h: 1, text: 'Matricula profesional', config: { bold: false, align: 'left', fill: 'gainsboro', } },
    { coord: [40, 0], w: 20, h: 1, text: worker_registration, config: { bold: false, align: 'left', fill: 'gainsboro', } },],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })


}

function _ADDRESS_SET_FULL(_FUN2) {
  let newAddress = [];
  newAddress.push(_FUN2.direccion);
  if (_FUN2.manzana) newAddress.push('manzana No. ' + _FUN2.manzana);
  if (_FUN2.sector) newAddress.push('sector ' + _FUN2.sector);
  if (_FUN2.lote) newAddress.push('lote n° ' + _FUN2.lote);
  if (_FUN2.barrio) newAddress.push('barrio ' + _FUN2.barrio);
  if (_FUN2.comuna) newAddress.push('comuna ' + _FUN2.comuna);
  if (_FUN2.corregimiento) newAddress.push('corregimiento ' + _FUN2.corregimiento);
  if (_FUN2.vereda) newAddress.push('vereda ' + _FUN2.vereda);

  return newAddress.join(', ');
}

function _PDFGEN_DOCCONFIRM_ACT(_DATA) {
  const PDFDocument = require('pdfkit');

  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 85,
      right: 56
    }
  });

  const _BODY = `De manera respetuosa y atenta, me permito informar que el término inicial de 30 días hábiles para dar respuesta a 
  los requerimientos jurídicos, arquitectónicos y estructurales, contemplados en el acta de observaciones, se cumple 
  el día ${dateParser(_DATA.date_limit)}, por lo cual en dicha fecha deberá radicar las correcciones con las cuales da 
  respuesta a la misma o en su lugar y en caso de requerirlo, radicar la solicitud de prórroga contemplada en el 
  artículo 2.2.6.1.2.2.4 del decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y territorio, con la cual se 
  concederá un término adicional de quince (15) días hábiles.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `Finalmente se recuerda que no dar respuesta a los requerimientos exigidos en el acta de observaciones y 
  correcciones, en los términos señalados, dará lugar al desistimiento de la solicitud, así mismo se aclara que la precitada 
  prórroga sólo se otorga a solicitud de parte (artículo 2.2.6.1.2.3.4 del decreto ibídem).`.replace(/[\n\r]+ */g, ' ');

  const _BODY3 = `Agradezco la atención prestada y el cumplimiento de los deberes como solicitante, recordándole que la
   suscrita junto al equipo interdisiciplinario y de apoyo está atento a sus comentarios, deseando en todo caso que el 
   proceso de licenciamiento llegue a feliz término.`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_funconfirmact.pdf'));

  doc.font('Helvetica')
  doc.fontSize(10)
  doc.text('\n\n\n');
  doc.text(_DATA.city + ", " + dateParser(_DATA.date_doc));
  doc.text('\n\n');
  doc.text('Señores');
  doc.font('Helvetica-Bold')
  doc.text(_DATA.name);
  doc.text(_DATA.email);
  doc.text('RESPONSABLE DE LA SOLICITUD');
  doc.text('E.S.M. ');
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(`Asunto: URGENTE – AVISO TÉRMINO PARA DAR RESPUESTA AL ACTA OBSERVACIONES  DENTRO DE LA SOLICITUD N° `, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(_DATA.id_public,);
  doc.text('\n');
  doc.text('Cordial Saludo,');
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(_BODY, { align: 'justify' });
  doc.text('\n');
  doc.text(_BODY2, { align: 'justify' });
  doc.text('\n');
  doc.text(_BODY3, { align: 'justify' });
  doc.text('\n');

  pdfSupport.setSign(doc)
  pdfSupport.setHeader(doc, { title: 'CARTA RADICACIÓN INCOMPLETA', id_public: _DATA.cub, icon: true });
  pdfSupport.setBottom(doc, false, true);


  doc.end();
  return true;
}

function _PDFGEN_DOCCONFIRM_ACT_2(_DATA) {
  const PDFDocument = require('pdfkit');

  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 85,
      bottom: 85,
      left: 85,
      right: 56
    }
  });

  const _BODY = `En atención a su solicitud, por el presente medio me permito informarle que de acuerdo a lo dispuesto en el 
  artículo 2.2.6.1.2.2.4 del Decreto 1077 de 2015, se encuentra procedente ampliar el término de treinta (30) días hábiles con el que 
  usted cuenta para realizar las actualizaciones, correcciones o aclaraciones requeridas mediante 
  ACTA DE OBSERVACIONES Y CORRECCIONES emitida dentro del proyecto con radicado N° ${_DATA.id_public}, e igualmente, aportar los 
  documentos adicionales para decidir sobre la solicitud.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `En tal sentido, se le concede el término adicional de quince (15) días hábiles que menciona la norma, 
  que para el presente caso serán contados desde el ${_DATA.date_limit} hasta el ${_DATA.date_limit_2}.`.replace(/[\n\r]+ */g, ' ');

  const _BODY3 = `Se advierte que durante dicho plazo se suspende el término para la expedición de la licencia, el cual, 
  salvo renuncia expresa, se reanudará el día hábil siguiente al vencimiento del término máximo con el que cuenta el 
  solicitante para dar respuesta al acta de observaciones. No obstante, el lapso de tiempo entre la expedición del 
  Acta de observaciones y la comunicación de la misma, no será contabilizado dentro del término que la suscrita Curadora 
  tiene para pronunciarse.`.replace(/[\n\r]+ */g, ' ');

  doc.pipe(fs.createWriteStream('./docs/public/output_funconfirmact_2.pdf'));

  doc.font('Helvetica')
  doc.fontSize(10)
  doc.text('\n\n\n');
  doc.text(_DATA.city + ", " + dateParser(_DATA.date_doc));
  doc.text('\n\n');
  doc.text('Señores');
  doc.font('Helvetica-Bold')
  doc.text(_DATA.name);
  doc.text(_DATA.email);
  doc.text('RESPONSABLE DE LA SOLICITUD');
  doc.text('E.S.M. ');
  doc.font('Helvetica')
  doc.text('\n');
  doc.text(`Asunto: Respuesta a su solicitud de ampliación de término para cumplimiento de acta de observaciones. Radicado `, { continued: true });
  doc.font('Helvetica-Bold')
  doc.text(_DATA.id_public,);
  doc.text('\n');
  doc.text('Cordial Saludo,');
  doc.text('\n');
  doc.font('Helvetica')
  doc.text(_BODY, { align: 'justify' });
  doc.text('\n');
  doc.text(_BODY2, { align: 'justify' });
  doc.text('\n');
  doc.text(_BODY3, { align: 'justify' });
  doc.text('\n');
  doc.font('Helvetica-Bold')
  doc.text('Atentamente,');
  doc.text('\n');

  pdfSupport.setSign(doc)
  pdfSupport.setHeader(doc, { title: 'CARTA AMPLIACIÓN DE TERMINOS', id_public: _DATA.cub, icon: true });
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
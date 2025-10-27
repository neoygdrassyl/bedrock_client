
const db = require("../models");

const FUN_0 = db.fun_0;
const FUN_1 = db.fun_1;
const FUN_2 = db.fun_2;
const FUN_3 = db.fun_3;
const FUN_4 = db.fun_4;
const FUN_51 = db.fun_51;
const FUN_52 = db.fun_52;
const FUN_53 = db.fun_53;
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

const EXP = db.expedition;

const RR = db.record_review;

const STEP = db.record_arc_step;
const moment = require('moment');
const fs = require('fs');
const pdfSupport = require("../config/pdfSupport.js");
const curaduriaInfo = require('../config/curaduria.json')
const typeParse = require("../config/typeParse");

// GET.
exports.findAll = (req, res) => {
  RA.findAll()
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
  let _arc_id = null;
  var oject = {
    record_arc: {
      record_arc_steps: [],
    }
  };

  _continue_();

  function _continue_() {
    FUN_0.findOne({
      include: [RA],
      where: { id: _id, }
    })
      .then(data => {
        if (!data.record_arc) res.send([]);
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
      include: [STEP,],
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
        oject.record_arc_33_areas = data.record_arc_33_areas;
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
        oject.record_arc_34_ks = data.record_arc_34_ks;
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
        oject.record_arc_34_gens = data.record_arc_34_gens;
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
        oject.record_arc_35_parkings = data.record_arc_35_parkings;
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
        oject.record_arc_36_infos = data.record_arc_36_infos;
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
        oject.record_arc_35_locations = data.record_arc_35_locations;
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
        oject.record_arc_37s = data.record_arc_37s;
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
        oject.record_arc_38s = data.record_arc_38s;
        _continue2_();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }

  function _continue2_() {
    res.send(oject);
  }
};
exports.getsteps = (req, res) => {
  const _id = req.params.id;
  let _arc_id = null;
  var oject = {
    record_arc: {
      record_arc_steps: [],
    }
  };

  _continue_();

  function _continue_() {
    FUN_0.findOne({
      include: [RA],
      where: { id: _id, }
    })
      .then(data => {
        if (!data.record_arc) res.send({ record_arc_steps: [] });
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
      include: [STEP,],
      where: { id: _arc_id, }
    })
      .then(data => {
        //console.log('OBJECT_ID', data)
        oject.record_arc_steps = data.record_arc_steps;
        _continue2_();

      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      });
  }

  function _continue2_() {
    res.send(oject);
  }
};
// GET BY ID
exports.findOne = (req, res) => {
  res.json({ message: "NOT IMPLEMENTED, SORRY" });
};

// POST
exports.create = (req, res) => {
  var object = {
    id_public: (req.body.id_public ? req.body.id_public : null),
    version: (req.body.version ? req.body.version : null),
    fun0Id: (req.body.fun0Id ? req.body.fun0Id : res.send('NO A REAL ID PARENT')),
    worker_id: (req.body.worker_id ? req.body.worker_id : null),
    date_asign: (req.body.date_asign ? req.body.date_asign : null),
    worker_prev: (req.body.worker_prev ? req.body.worker_prev : null),
    worker_name: (req.body.worker_name ? req.body.worker_name : null),
  }
  RA.create(object)
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

exports.create33area = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    active: (req.body.active === "1" ? 1 : 0),
    type: (req.body.type ? req.body.type : null),
    id_public: (req.body.id_public ? req.body.id_public : null),
    floor: (req.body.floor ? req.body.floor : null),
    level: (req.body.level ? req.body.level : null),
    scale: (req.body.scale ? req.body.scale : null),
    use: (req.body.use ? req.body.use : null),
    category: (req.body.category ? req.body.category : null),
    build: (req.body.build ? req.body.build : null),
    id6_blueprint: (req.body.id6_blueprint ? req.body.id6_blueprint : null),
    historic: (req.body.historic ? req.body.historic : null),
    units: (req.body.units ? req.body.units : null),
    units_a: (req.body.units_a ? req.body.units_a : null),
    destroy: (req.body.destroy ? req.body.destroy : null),
    use_desc: (req.body.use_desc ? req.body.use_desc : null),
    pos: (req.body.pos ? req.body.pos : null),
    historic_areas: (req.body.historic_areas ? req.body.historic_areas : null),
    empate: (req.body.empate ? req.body.empate : null),
    empate_h: (req.body.empate_h ? req.body.empate_h : null),
  }
  RA_33A.create(object)
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
exports.create34gen = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    active: (req.body.active === "1" ? 1 : 0),
    norm: (req.body.norm ? req.body.norm : null),
    desc: (req.body.desc ? req.body.desc : null),
    date: (req.body.date ? req.body.date : null),
  }
  RA_34G.create(object)
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
exports.create34k = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    active: (req.body.active === "1" ? 1 : 0),

    name: (req.body.name ? req.body.name : null),
    index: (req.body.index ? req.body.index : null),
    norm: (req.body.norm ? req.body.norm : null),
    proyect: (req.body.proyect ? req.body.proyect : null),
    check: (req.body.check ? req.body.check : null),
    type: (req.body.type ? req.body.type : null),
    exception: (req.body.exception ? req.body.exception : null),
  }
  RA_34K.create(object)
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
exports.create35parking = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    active: (req.body.active === "1" ? 1 : 0),
    use: (req.body.use ? req.body.use : null),
    name: (req.body.name ? req.body.name : null),
    type: (req.body.type ? req.body.type : null),
    norm: (req.body.norm ? req.body.norm : null),
    norm_value: (req.body.norm_value ? req.body.norm_value : null),
    project: (req.body.project ? req.body.project : null),
    check: (req.body.check ? req.body.check : null),
    pos: (req.body.pos ? req.body.pos : null),
  }
  RA_35P.create(object)
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
exports.create35location = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    active: (req.body.active === "1" ? 1 : 0),
    floor: (req.body.floor ? req.body.floor : null),
    diensions: (req.body.diensions ? req.body.diensions : null),
    check: (req.body.check ? req.body.check : null),
    active: (req.body.active ? req.body.active : null),
    pos: (req.body.pos ? req.body.pos : null),
  }
  RA_35L.create(object)
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
exports.create36Info = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    active: (req.body.active === "1" ? 1 : 0),
    name: (req.body.name ? req.body.name : null),
    parent: (req.body.parent ? req.body.parent : null),
    norm: (req.body.norm ? req.body.norm : null),
    project: (req.body.project ? req.body.project : null),
    check: (req.body.check ? req.body.check : null),
    address: (req.body.address ? req.body.address : null),
    side: (req.body.side ? req.body.side : null),
  }
  RA_36I.create(object)
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
exports.create37 = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    name: (req.body.name ? req.body.name : null),
    main_group: (req.body.main_group ? req.body.main_group : null),
    sub_group: (req.body.sub_group ? req.body.sub_group : null),
    index: (req.body.index ? req.body.index : null),
    anet: (req.body.anet ? req.body.anet : null),
    real: (req.body.real ? req.body.real : null),
    check: (req.body.check ? req.body.check : null),
  }
  RA_37.create(object)
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
exports.create38 = (req, res) => {
  var object = {
    recordArcId: (req.body.recordArcId ? req.body.recordArcId : res.send('NO A REAL ID PARENT')),
    version: (req.body.version ? req.body.version : null),
    detail: (req.body.detail ? req.body.detail : null),
    worker_id: (req.body.worker_id ? req.body.worker_id : null),
    worker_name: (req.body.worker_name ? req.body.worker_name : null),
    check: (req.body.check ? req.body.check : null),
    date: (req.body.date ? req.body.date : null),
    notify_name: (req.body.notify_name ? req.body.notify_name : null),
    notify_id: (req.body.notify_id ? req.body.notify_id : null),
    notify_date: (req.body.notify_date ? req.body.notify_date : null),
  }
  RA_38.create(object)
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
  const recordArcId = (req.body.recordArcId ? req.body.recordArcId : res.send('NOT A REAL ID'));

  const object = {
    recordArcId: recordArcId,
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

// X CRETIONS
exports.create_xbp = (req, res) => {
  const recordArcId = (req.body.recordArcId ? req.body.recordArcId : res.send('NOT A REAL ID'));
  const type = (req.body.type ? req.body.type : res.send('MISSING TYPE'));
  const pos = (req.body.pos ? req.body.pos : res.send('NOT pos'));
  const x = (req.body.x ? req.body.x : res.send('NOT x'));
  const op = (req.body.op ? req.body.op : res.send('NOT op'));
  const sort = (req.body.sort ? req.body.sort : res.send('NOT sort'));
  const copy = (req.body.copy == '1' ? true : false);

  RA_33A.findAll({
    where: { recordArcId: recordArcId, type: type },
    order: [['pos', sort]],
  }
  ).then(data => {
    var newData = data;

    var newSortedArray = [];
    for (let i = 0; i < newData.length; i++) {
      const element = newData[i];
      newSortedArray.push(element.pos)
    }
    const indexPos = newSortedArray.indexOf(Number(pos))
    const checkIndex = indexPos + 1 + Number(op);

    var y;
    if (copy) {
      let copyObject = newData[indexPos];
      if (op == '-1') {
        y = indexPos - x;
        if (y < 0) y = 0;
        for (let i = indexPos; i >= y; i--) {
          if (newData[i]) {
            newData[i].type = copyObject.type;
            newData[i].id_public = copyObject.id_public;
            newData[i].floor = copyObject.floor;
            newData[i].level = copyObject.level;
            newData[i].scale = copyObject.scale;
            newData[i].use = copyObject.use;
            newData[i].category = copyObject.category;
            newData[i].build = copyObject.build;
            newData[i].id6_blueprint = copyObject.id6_blueprint;
            newData[i].historic = copyObject.historic;
            newData[i]['´destroy´'] = copyObject.destroy;
            newData[i].use_desc = copyObject.use_desc;
            newData[i].historic_areas = copyObject.historic_areas;
            newData[i].empate = copyObject.empate;
            newData[i].empate_h = copyObject.empate_h;
            newData[i].active = copyObject.active;
          }
        }
      } else {
        y = indexPos + Number(x);
        if (y > newData.length) y = newData.length;
        for (let i = indexPos; i <= y; i++) {
          if (newData[i]) {
            newData[i].type = copyObject.type;
            newData[i].id_public = copyObject.id_public;
            newData[i].floor = copyObject.floor;
            newData[i].level = copyObject.level;
            newData[i].scale = copyObject.scale;
            newData[i].use = copyObject.use;
            newData[i].category = copyObject.category;
            newData[i].build = copyObject.build;
            newData[i].id6_blueprint = copyObject.id6_blueprint;
            newData[i].historic = copyObject.historic;
            newData[i]['´destroy´'] = copyObject.destroy;
            newData[i].use_desc = copyObject.use_desc;
            newData[i].historic_areas = copyObject.historic_areas;
            newData[i].empate = copyObject.empate;
            newData[i].empate_h = copyObject.empate_h;
            newData[i].active = copyObject.active;
          }
        }
      }
    } else {
      for (let i = 0; i < x; i++) {
        let newItem = { recordArcId: recordArcId, active: 1, type: type };
        if (checkIndex < 0) newData.push(newItem)
        else if (checkIndex > newData.length) newData.splice(-1, 0, newItem);
        else newData.splice(checkIndex, 0, newItem);
      }
    }

    for (let i = 0; i < newData.length; i++) {
      if (sort == 'DESC') newData[i]['pos'] = newData.length - Number(i);
      else newData[i]['pos'] = Number(i) + 1;
    }

    //res.send(newData);
    createAndUpdate(newData)
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });


  function createAndUpdate(objects) {
    for (let i = 0; i < objects.length; i++) {
      const element = objects[i];
      var object = {
        pos: Number(element.pos),
        type: element.type,
        id_public: element.id_public,
        floor: element.floor,
        level: element.level,
        scale: element.scale,
        use: element.use,
        category: element.category,
        build: element.build,
        id6_blueprint: element.id6_blueprint,
        historic: element.historic,
        '´destroy´': element.destroy,
        use_desc: element.use_desc,
        historic_areas: element.historic_areas,
        empate: element.empate,
        empate_h: element.empate_h,
      }
      if (element.id) RA_33A.update(object, { where: { id: element.id } }).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });

      else RA_33A.create(element).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });

    }
    //res.send(objects);
    res.send('OK');
  }




};

// PUT
exports.update = (req, res) => {
  const id = req.params.id;
  RA.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update33area = (req, res) => {
  const id = req.params.id;

  RA_33A.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update34gens = (req, res) => {
  const id = req.params.id;

  RA_34G.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update34k = (req, res) => {
  const id = req.params.id;

  RA_34K.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update35parking = (req, res) => {
  const id = req.params.id;

  RA_35P.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update35location = (req, res) => {
  const id = req.params.id;

  RA_35L.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update36Info = (req, res) => {
  const id = req.params.id;

  RA_36I.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update37 = (req, res) => {
  const id = req.params.id;

  RA_37.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
exports.update38 = (req, res) => {
  const id = req.params.id;

  RA_38.update(req.body, {
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
  }).catch(err => {
    res.status(500).send({
      message: err.message
    });
  });

};

// DELETE BY ID
exports.delete = (req, res) => {
  res.json({ message: "NOT IMPLEMENTED, SORRY" });
};
exports.delete33area = (req, res) => {
  const id = req.params.id;
  const sort = req.params.sort;
  const recordArcId = (req.params.recordArcId ? req.params.recordArcId : res.send('NOT A REAL ID'));
  const type = (req.params.type ? req.params.type : res.send('MISSING TYPE'));
  RA_33A.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        loadAllSorted();
      } else {
        res.send(`ERROR_2`); // NO MATCHING ID
      }
    })

  function loadAllSorted() {
    RA_33A.findAll({
      where: { recordArcId: recordArcId, type: type },
      order: [['pos', sort]],
    }
    ).then(data => {
      var newData = data;
      if (sort == 'DESC') {
        for (let i = 0; i < newData.length; i++) {
          newData[i]['pos'] = newData.length - Number(i);
        }
      } else {
        for (let i = 0; i < newData.length; i++) {
          newData[i]['pos'] = Number(i) + 1;
        }
      }

      //res.send(newData);
      createAndUpdate(newData)
    })
  }


  function createAndUpdate(objects) {
    for (let i = 0; i < objects.length; i++) {
      const element = objects[i];
      if (element.id) RA_33A.update({ pos: element.pos }, { where: { id: element.id } }).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });
      else RA_33A.create(element).catch(err => { res.status(500).send({ message: err.message || "Some error occurred while executing CREATE." }); });
    }
    res.send('OK');
  }
};
exports.delete33areabyId = (req, res) => {
  const id = req.params.id;
  RA_33A.destroy({
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
exports.delete34gens = (req, res) => {
  const id = req.params.id;
  RA_34G.destroy({
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

exports.delete34k = (req, res) => {
  const id = req.params.id;
  RA_34K.destroy({
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
exports.delete35parking = (req, res) => {
  const id = req.params.id;
  RA_35P.destroy({
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
exports.delete35location = (req, res) => {
  const id = req.params.id;
  RA_35L.destroy({
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
exports.delete36Info = (req, res) => {
  const id = req.params.id;
  RA_36I.destroy({
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
exports.delete37 = (req, res) => {
  const id = req.params.id;
  RA_37.destroy({
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
exports.deleteAll = (req, res) => {
  res.json({ message: "NOT IMPLEMENTED, SORRY" });
};



exports.pdfgen = (req, res) => {

  const _version = req.body.version ? req.body.version : res.send('NOT A REAL VERSION');
  const _id = req.body.id ? req.body.id : res.send('NOT A REAL ID');
  const _type_rev = req.body.type_rev ? req.body.type_rev : 1;
  const _r_arc_pending = req.body.r_arc_pending === 'true' ? 1 : 0;

  let _arc_id;
  let _law_id;
  let _eng_id;

  var oject = {
    version: _version,
    type_rev: _type_rev,
    rew: {
      r_worker: req.body.r_worker ? req.body.r_worker : '',
      r_check: req.body.r_check ? req.body.r_check : 'NO VIABLE',
      r_date: req.body.r_date ? req.body.r_date : '',
      r_pending: _r_arc_pending,
    },
    header: {
      use: (req.body.header === '1' ? true : req.body.header === '0' ? false : true),
    },
    id: _id,
    fun: null,
    fun_1s: null,
    fun_2: null,
    fun_51s: null,
    fun_52s: null,
    fun_clocks: null,
    record_arc: null,
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
      include: [STEP,],
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
        _continue_EXP_();

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



function pdfCreate(_DATA) {
  const PDFDocument = require('pdfkit');
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
  doc.pipe(fs.createWriteStream('./docs/public/output_recorwd_arc.pdf'));
  if (curaduriaInfo.id == 'cub1') PDFGEN_ARC_RECORD(_DATA, doc)
  else PDFGEN_ARC_RECORD_ALT(_DATA, doc)
  pdfSupport.setHeader(doc, { title: 'INFORME ARQUITECTONICO', size: 13, icon: true, id_public: _DATA ? _DATA.id_public : '', header: _DATA.header.use });
  doc.end();
  return true;

}

exports.PDFGEN_ARC_RECORD_EXP = (_DATA, doc, simple) => {
  if (curaduriaInfo.id == 'cub1') PDFGEN_ARC_RECORD(_DATA, doc, simple)
  else PDFGEN_ARC_RECORD_ALT(_DATA, doc, simple)
}
function PDFGEN_ARC_RECORD(_DATA, doc, simple) {
  const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
  const fun_2 = _DATA ? _DATA.fun_2 ? _DATA.fun_2 : {} : {};
  const fun_law = _DATA ? _DATA.fun_law ? _DATA.fun_law : {} : {};
  const fun_3 = _DATA ? _DATA.fun_3s : [];
  const fun_51 = _DATA ? _DATA.fun_51s : [];
  const fun_52 = _DATA ? _DATA.fun_52s : [];
  //const fun_53 = _DATA ? _DATA.fun_53s ? _DATA.fun_53s.length > 0 ? _DATA.fun_53s[0] : false : false : false;
  //const fun_law = _DATA ? _DATA.fun_law ? _DATA.fun_law : false : false;
  //const fun_r = _DATA ? _DATA.fun_rs ? _DATA.fun_rs.length > 0 ? _DATA.fun_rs[0] : false : false : false;
  const fun_clocks = _DATA ? _DATA.fun_clocks : [];

  const record_arc = _DATA ? _DATA.record_arc : false;
  const record_arc_steps = record_arc ? _DATA.record_arc_steps ? _DATA.record_arc_steps : [] : [];
  const record_arc_33_areas = record_arc ? record_arc.record_arc_33_areas ? record_arc.record_arc_33_areas : [] : [];
  const record_arc_34_ks = record_arc ? record_arc.record_arc_34_ks ? record_arc.record_arc_34_ks : [] : [];
  const record_arc_34_gens = record_arc ? record_arc.record_arc_34_gens ? record_arc.record_arc_34_gens : [] : [];
  const record_arc_35_parkings = record_arc ? record_arc.record_arc_35_parkings ? record_arc.record_arc_35_parkings : [] : [];
  const record_arc_35_locations = record_arc ? record_arc.record_arc_35_locations ? record_arc.record_arc_35_locations : [] : [];
  const record_arc_36_infos = record_arc ? record_arc.record_arc_36_infos ? record_arc.record_arc_36_infos : [] : [];
  const record_arc_37s = record_arc ? record_arc.record_arc_37s ? record_arc.record_arc_37s : [] : []
  const record_arc_38s = record_arc ? record_arc.record_arc_38s ? record_arc.record_arc_38s : [] : []

  const record_rev = _DATA.recorc_rev ? _DATA.recorc_rev : {};

  const exp = _DATA.exp ? _DATA.exp : {};

  const version = _DATA ? _DATA.version : 1;

  const checkValue = ['NO CUMPLE', 'CUMPLE', 'N/A'];
  const checkValueAlt = ['NO', 'SI', 'N/A'];

  const validateCheck = (check, alt = false) => {
    let validateString = [];
    if (alt) validateString = checkValueAlt;
    else validateString = checkValue;

    if (validateString[check]) return validateString[check];
    return validateString[1]
  }

  let _FIND_PROFESIOANL = (_role) => {
    for (var i = 0; i < fun_52.length; i++) {
      if (fun_52[i].role.includes(_role)) return fun_52[i];
    }
    return false;
  }
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
  let _GET_CHILD_33_BLUEPRINTS = () => {
    var _CHILD = record_arc_33_areas;
    var _AREAS = [];
    if (_CHILD) {
      for (var i = 0; i < _CHILD.length; i++) {
        if (_CHILD[i].type == "blueprint") {
          _AREAS.push(_CHILD[i])
        }
      }
    }
    return _AREAS;
  }
  function LOAD_STEP(_id_public) {
    var _CHILD = record_arc_steps;
    for (var i = 0; i < _CHILD.length; i++) {
      if (_CHILD[i].version == version && _CHILD[i].id_public == _id_public) return _CHILD[i]
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
  let _GET_STEP_TYPE_JSON = (_id_public, _index) => {
    var STEP = LOAD_STEP(_id_public);
    if (!STEP.id) return {};
    var value = STEP['json']
    if (!value) return {};
    value = getJSON_Simple(value);
    if (_index) {
      if (value[_index]) return value[_index]
      else return ''
    }
    return value
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
  let _GET_HISTORIC = (_historic) => {
    let STEP = LOAD_STEP('a_config');
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
  let _GET_TOTAL_AREA_SUM = (areas) => {
    let sum = 0;
    areas.map(area => sum += Number(_GET_TOTAL_AREA(area.build, area.historic_areas)))
    return sum.toFixed(2)
  }
  let _GET_ARRAY_A = (_var, ss) => {
    if (_var) return _var.split(ss);
    else return [];
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


  let _GET_TOTAL_DESTROY = (_destroy) => {
    if (!_destroy) return 0;
    var destroy = _destroy ? _destroy.split(",") : [];
    let sum = destroy.reduce((p, n) => Number(p) + Number(n))
    return (sum).toFixed(2);
  }
  let _GET_NET_INDEX = (_build, _destroy, _historic) => {
    if (!_build) return 0;
    var destroy = Number(_ADD_AREAS(_destroy));
    var areaToBuild = _GET_TOTAL_AREA(_build, _historic);
    var _NET_IDEX = Number(areaToBuild) - Number(destroy);
    return (_NET_IDEX).toFixed(2);
  }
  let _GET_TOTAL_AREAS = (_field, _index, ss) => {
    let areas = _GET_CHILD_33_AREAS();
    let sum = 0;
    areas.map(a => {
      if (!a[_field]) return;
      let items = a[_field].split(ss);
      sum += Number(items[_index])
    })
    return sum;
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


  let _GET_CLOCK_STATE = (_state) => {
    var _CLOCK = fun_clocks;
    if (_state == null) return false;
    for (var i = 0; i < _CLOCK.length; i++) {
      if (_CLOCK[i].state == _state) return _CLOCK[i];
    }
    return false;
  }
  let _GET_CHILD_34_K = () => {
    var _CHILD = record_arc_34_ks;
    var _LIST = [];
    if (_CHILD) {
      _LIST = _CHILD;
    }
    return _LIST;
  }
  let _GET_CHILD_35_BY_TYPE = (_type) => {
    var _CHILD = record_arc_35_parkings;
    for (let i = 0; i < _CHILD.length; i++) {
      const CHILD = _CHILD[i];
      if (CHILD.type.includes(_type)) return CHILD
    }
    return false;
  }

  const _fun_0_type = { '0': 'NC', 'i': 'I', 'ii': "II", 'iii': "III", 'iv': "IV", 'oa': "OA" }
  const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };

  const _BODY = `Conforme a lo consignado en los artículos 2.6.4.1.1 y 2.2.6.4.1.2 del decreto 1077 de 2015 para los elementos 
  arquitectónicos  la NRS-10. A continuación se lista la documentación que sirve de base para la revision del proyecto en función 
  de la actuación urbanística radicada y sobre la cual se pronunciara el evaluador arquitectónico en los aspectos de calidad  
  y pertinencia de los documentos.`.replace(/[\n\r]+ */g, ' ');

  const _BODY2 = `A.1.5.1 — DISEÑADOR RESPONSABLE — La responsabilidad de los diseños de los diferentes elementos que componen 
  la edificación recae en los profesionales bajo cuya dirección se elaboran los diferentes diseños particulares. Se presume, 
  que cuando un elemento figure en un plano o memoria de diseño, es porque se han tomado todas las medidas necesarias para cumplir 
  el  propósito del Reglamento y por lo tanto el profesional que firma o rotula el plano es el responsable del diseño 
  correspondiente.`.replace(/[\n\r]+ */g, ' ');

  const _BODY3 = `Es importante recordar lo dispuesto en el Artículo 32 de Decreto 1469 de 2010, que dice: El solicitante 
  contará con un plazo de treinta (30) días hábiles para dar respuesta al requerimiento. Este plazo podrá ser ampliado, a 
  solicitud de parte, hasta por un término adicional de quince (15) días hábiles. Durante este periodo se suspenderá el término 
  para el acto administrativo, vencido este plazo se declara desistida la solicitud de la actuación urbanística, acto contra el 
  cual se puede interponer recurso de reposición.`.replace(/[\n\r]+ */g, ' ');

  const _BODY4 = `Si considera necesario alguna aclaración sobre los aspectos aquí contemplados, favor acercarse a nuestras 
  oficinas donde el equipo de profesionales con gusto atenderá sus inquietudes y sugerencias. Una vez resueltas las observaciones 
  anotadas en la presente acta, el trámite de expedición de licencia culminará favorablemente.`.replace(/[\n\r]+ */g, ' ');


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

  const CV2 = (val, dv) => {
    if (val == 0) return 'NO CUMPLE';
    if (val == 1) return 'CUMPLE';
    if (val == 2) return 'NO APLICA';
    if (dv != undefined || dv != null) {
      if (dv == '0') return 'NO CUMPLE';
      if (dv == '1') return 'CUMPLE';
      if (dv == '2') return 'NO APLICA';
    }
    return ''
  }

  const CV3 = (val, dv) => {
    if (val == '0') return 'NO';
    if (val == '1') return 'SI';
    if (val == '2') return 'SIN DATO';
    return 'SIN DATO';
  }
  const CV4 = (val) => {
    if (val == '0') return 'NO APLICA';
    if (val == '1') return 'APLICA';
    if (val == '2') return 'NO APLICA';
  }

  const VV = (val, df) => {
    if (val != null || val != undefined || val != false || val !== "") return val;
    if (df) return df;
    return ''
  }

  const ALLOW_REVIEWS = record_arc ? record_arc.subcategory ? record_arc.subcategory.split(',') : [0, 0, 0, 0] : [0, 0, 0, 0];
  // [URBANAS, PARKING, PUBLIC SPACE, NSR10]

  doc.fontSize(7);
  doc.font('Helvetica-Bold');
  doc.startPage = doc.bufferedPageRange().count - 1;
  doc.lastPage = doc.bufferedPageRange().count - 1;
  doc.onActive = true;
  doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
  let _prof = _FIND_PROFESIOANL('ARQUITECTO PROYECTISTA');

  let prof = {
    name: _prof ? _prof.name + ' ' + _prof.surname : ' ',
    mat: _prof ? _prof.registration : ' ',
    number: _prof ? _prof.number : ' ',
    email: _prof ? _prof.email : ' ',
    mat_date: _prof ? _prof.registration_date : ' ',
  }

  let legal_date = _GET_CLOCK_STATE(5).date_start;
  let time_to_review = _fun_0_type_time[_DATA.type ? _DATA.type : 'iii']
  let final_date = '';
  if (legal_date) {
    let limite_date = _GET_CLOCK_STATE(32).date_start || _GET_CLOCK_STATE(33).date_start;
    if (limite_date) {
      let pro = _GET_CLOCK_STATE(34).date_start ? 45 : 30;
      final_date = typeParse.dateParser_finalDate(limite_date, pro);
    }
    else final_date = typeParse.dateParser_finalDate(legal_date, time_to_review);
  }

  if (!simple) {
    // TABLE HEADERSS
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 22, h: 1, text: 'III. REVISIÓN ARQUITECTÓNICA', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 10, h: 1, text: 'INFORME', config: { bold: true, fill: 'steelblue', color: 'white' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [34, 0], w: 8, h: 1, text: 'OBSERVACIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
        { coord: [42, 0], w: 2, h: 1, text: _DATA.type_rev == 1 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
        { coord: [44, 0], w: 8, h: 1, text: 'CORRECCIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
        { coord: [52, 0], w: 2, h: 1, text: _DATA.type_rev == 2 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
      ],
      [doc.x, doc.y], [54, 1], {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Profesional responsable', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.name, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 10, h: 1, text: 'Control Revisión', config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [34, 0], w: 20, h: 5, text: typeParse.formsParser1(fun_1), config: { bold: true, fill: 'gold', align: 'center', valign: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Matricula profesional', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.mat, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Ingreso', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: _GET_CLOCK_STATE(5).date_start, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        //{ coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Fecha matricula', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.mat_date, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Rev. 1', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: record_rev.date, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        //{ coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Email', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.email, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Rev. 2', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: record_rev.date_2, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        // { coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Teléfono', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.number, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Desistir', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: final_date, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        //{ coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 1, h: 1, text: 'REVISIÓN DE INFORMACIÓN APORTADA', config: { align: 'left', fill: 'silver', bold: true } },
        { coord: [0, 1], w: 1, h: 4, text: `\n${_BODY}`, config: { align: 'justify' } },
      ],
      [doc.x, doc.y],
      [1, 5],
      {})

    // AREAS TABLE
    let STEP = LOAD_STEP('a_config');
    let json = STEP ? STEP.json ? STEP.json : {} : {};
    json = getJSON_Simple(json);
    let tagsH = json.tagh ? json.tagh.split(';') : [];
    let tagsE = json.tage ? json.tage.split(';') : [];
    let lic = fun_1.m_lic ? fun_1.m_lic : [];
    let rec = fun_1.tipo ? fun_1.tipo : [];
    doc.text('\n');


    let dinmanicHeaders = (conf, omitExtras = false) => {
      let _h = conf ? conf.h ? conf.h : 1 : 1;
      let headers = [];
      if (!omitExtras) tagsH.map((tag, i) => {
        headers.push({ coord: [0, 0], w: 1, h: 1, text: tag, config: { align: 'center', bold: true, valign: true, } })
      })
      if (!omitExtras) tagsE.map((tag, i) => {
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


    doc.fontSize(6);

    let tableHeaders = [
      { coord: [0, 0], w: 1, h: 1, text: 'Id Plano', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Escala', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Sótano / Piso', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Nivel', config: { align: 'center', bold: true, valign: true, } },
      // HERE ADD THE DIMANIC AREAS
      ...dinmanicHeaders(),
      // { coord: [16, 0], w: 28, h: 1, text: 'AREAS', config: { align: 'center', bold: true, valign: true, } },
      // END HERE
      { coord: [0, 0], w: 1, h: 1, text: 'Área total construida', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Área\ndescontar', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Área\nneta', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Uso\nPrincipal', config: { align: 'center', bold: true, valign: true, } },
    ];

    let tbWidth = 60 / tableHeaders.length;
    tableHeaders.map((th, i) => { th.coord[0] += tbWidth * i; th.w = tbWidth; })

    pdfSupport.table(doc,
      tableHeaders,
      [doc.x, doc.y],
      [60, 1],
      { lineHeight: 24 })

    let dinamicColumns = (row) => {
      let cells = [];
      let build = row.build ? row.build.split(',') : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let historic = row.historic_areas ? row.historic_areas.split(';') : [];
      let empate = row.empate_h ? row.empate_h.split(';') : [];

      tagsH.map((tag, i) => {
        cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(historic[i] || 0).toFixed(2), config: { align: 'center', valign: true, } })
      })
      tagsE.map((tag, i) => {
        cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(empate[i] || 0).toFixed(2), config: { align: 'center', valign: true, } })
      })

      if (lic.includes('G')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[6] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (lic.includes('g')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[7] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })

      if (lic.includes('A')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[0] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (rec.includes('F')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[10] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })

      if (lic.includes('B')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[1] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (lic.includes('C')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[2] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (lic.includes('D')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[3] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (lic.includes('E')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[4] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (lic.includes('F')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[5] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (lic.includes('H')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[8] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })
      if (lic.includes('I')) cells.push({ coord: [0, 0], w: 1, h: 1, text: Number(build[9] || 0).toFixed(2), config: { align: 'center', valign: true, }, use: row.use, })


      _totals.push(cells)
      return cells;

    }
    let _totals = [];
    let _totalsRow = Array(dinmanicHeaders().length + 3).fill(0);
    let _totalsRowType = { trade: Array(dinmanicHeaders().length + 3).fill(0), home: Array(dinmanicHeaders().length + 3).fill(0) };
    let total_build = 0; // IM GOING TO USE THIS FOR LATER
    let total_build_trade = 0;
    let total_build_home = 0;

    // HERE CALCULATES ALL ROWS OF THE TABLE
    let tableRows = () => {
      let areas = _GET_CHILD_33_AREAS();
      let _array = [];
      areas.map(area => {
        // THIS IS THE MOT WEIRDES MOTHEFUCKER ERROR I'VE SEEM
        // APPARENTLY THE FUCKING NODEJS TAKE THE PROPERTY OF .destroy OR ANY VALUE AS A FUCNTION INTEAD OF WHAT IS SUPPOSED TO BE
        // A FUCKING VARIABLE
        // THIS SORT OF TRIES TO SOLVE THIS PROBLEM, THANKS JS, YOU ARE SO COOL!
        let obj = JSON.stringify(area);
        let iDe = obj.indexOf("destroy");
        let iDes = obj.indexOf('":"', iDe);
        let iDef = obj.indexOf('","', iDe);
        let iDet = obj.slice(iDes + 3, iDef);
        let destroy_areas = iDet ? iDet : [];

        let id_public = area.id_public ? area.id_public : '';
        let scale = area.scale ? area.scale : '';
        let floor = area.floor ? area.floor : '';
        let level = area.level ? (area.level).replace('&', ' ') : '';
        let use = area.use ? area.use : '';
        let row = [
          { coord: [0, 0], w: 1, h: 1, text: id_public, config: { align: 'center', valign: true, } },
          { coord: [0, 0], w: 1, h: 1, text: scale, config: { align: 'center', valign: true, } },
          { coord: [0, 0], w: 1, h: 1, text: floor, config: { align: 'center', valign: true, } },
          { coord: [0, 0], w: 1, h: 1, text: level, config: { align: 'center', valign: true, } },
          // HERE ADD THE DIMANIC AREAS
          ...dinamicColumns(area),
          // END HERE
          { coord: [0, 0], w: 1, h: 1, text: _GET_TOTAL_AREA(area.build, area.historic_areas), config: { align: 'center', valign: true, } },
          { coord: [0, 0], w: 1, h: 1, text: _GET_TOTAL_DESTROY(destroy_areas), config: { align: 'center', valign: true, } },
          { coord: [0, 0], w: 1, h: 1, text: _GET_NET_INDEX(area.build, destroy_areas, area.historic_areas), config: { align: 'center', valign: true, } },
          { coord: [0, 0], w: 1, h: 1, text: use, config: { align: 'center', valign: true, } },
        ]
        row.map((th, i) => { th.coord[0] += tbWidth * i; th.w = tbWidth; })
        _array.push(row)
      })

      let sortedArray = _array.sort(function (a, b) {
        let itemA = a[2];
        let itemB = b[2];
        let A = itemA.text ? itemA.text.split(' ') : '';
        let B = itemB.text ? itemB.text.split(' ') : '';
        let strPartA = A[0] ? A[0].toLowerCase() : '';
        let strPartB = B[0] ? B[0].toLowerCase() : '';
        let nunPartA = Number(A[1]) || Infinity;
        let nunPartB = Number(B[1]) || Infinity;

        let buildingPriority = {
          'terraza': 4,
          'cubierta': 4,
          'techo': 4,
          'piso': 3,
          'nivel': 3,
          'planta': 3,
          'semisotano': 2,
          'semisótano': 2,
          'sotano': 1,
          'sótano': 1,
        }

        let firstCheck = (buildingPriority[strPartB] ? buildingPriority[strPartB] : 0) - (buildingPriority[strPartA] ? buildingPriority[strPartA] : 0);
        if (firstCheck != 0) return firstCheck
        else {
          if (strPartA[0] && strPartA[0].toLowerCase() == 's') {
            if (nunPartA < nunPartB) { return -1; }
            if (nunPartA > nunPartB) { return 1; }
          } else {
            if (nunPartA < nunPartB) { return 1; }
            if (nunPartA > nunPartB) { return -1; }
          }
        }

        return 0;
      });



      let get_totals = () => {
        _totals.map((cells, i) => {
          cells.map((cell, j) => {
            _totalsRow[j] += Number(cell.text);

            let use = String(cell.use).toLocaleLowerCase();
            if (use.includes('comercio')) _totalsRowType.trade[j] += Number(cell.text);
            if (use.includes('vivienda') || use.includes('residencia')) _totalsRowType.home[j] += Number(cell.text);
          })
        })

        areas.map(area => {
          let obj = JSON.stringify(area);
          let iDe = obj.indexOf("destroy");
          let iDes = obj.indexOf('":"', iDe);
          let iDef = obj.indexOf('","', iDe);
          let iDet = obj.slice(iDes + 3, iDef);
          let destroy_areas = iDet ? iDet : [];

          let hdLength = dinmanicHeaders().length;

          total_build += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
          _totalsRow[hdLength] += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
          _totalsRow[hdLength + 1] += Number(_GET_TOTAL_DESTROY(destroy_areas));
          _totalsRow[hdLength + 2] += Number(_GET_NET_INDEX(area.build, destroy_areas, area.historic_areas));

          let use = String(area.use).toLocaleLowerCase();
          if (use.includes('comercio')) {
            total_build_trade += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
            _totalsRowType.trade[hdLength] += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
            _totalsRowType.trade[hdLength + 1] += Number(_GET_TOTAL_DESTROY(destroy_areas));
            _totalsRowType.trade[hdLength + 2] += Number(_GET_NET_INDEX(area.build, destroy_areas, area.historic_areas));
          }

          if (use.includes('vivienda') || use.includes('residencia')) {
            total_build_home += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
            _totalsRowType.home[hdLength] += Number(_GET_TOTAL_AREA(area.build, area.historic_areas));
            _totalsRowType.home[hdLength + 1] += Number(_GET_TOTAL_DESTROY(destroy_areas));
            _totalsRowType.home[hdLength + 2] += Number(_GET_NET_INDEX(area.build, destroy_areas, area.historic_areas));
          }
        })

        let totalAreas = _totalsRow.map((total, i) => {
          return { coord: [tbWidth * (i + 4), 0], w: tbWidth, h: 1, text: Number(total).toFixed(2), config: { align: 'center', bold: true, valign: true, } }
        });
        return totalAreas
      }

      let totals = get_totals()
      // ADD TOTALS ROW
      sortedArray.push([
        { coord: [0, 0], w: tbWidth * 4, h: 1, text: 'Totales: ', config: { align: 'right', bold: true, valign: true, } },
        // HERE ADD THE DIMANIC AREAS
        ...totals,
        { coord: [tbWidth * (totals.length + 4), 0], w: tbWidth, h: 1, text: ' ', config: { align: 'center', bold: true, valign: true, } },
      ])

      return sortedArray;

    }

    tableRows().map(row => {
      pdfSupport.table(doc,
        row,
        [doc.x, doc.y],
        [60, 1],
        { lineHeight: -1 })
    })
    // ENDS
    doc.text('\n');
    doc.fontSize(7);

    var _start_Y = doc.y;
    var _start_p_1 = doc.bufferedPageRange().count - 1;

    // BLUEPRINT TABLES
    let blueprints = _GET_CHILD_33_BLUEPRINTS();



    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 26, h: 1, text: 'Cortes y Fachadas', config: { align: 'center', valign: true, bold: true, fill: 'silver', } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 4, h: 1, text: 'Id', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
        { coord: [40, 0], w: 4, h: 1, text: 'Escala', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
        { coord: [44, 0], w: 18, h: 1, text: 'Nombre', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    blueprints.map(bp => {
      if (bp.category == 'cortes') pdfSupport.table(doc,
        [
          { coord: [36, 0], w: 4, h: 1, text: bp.id_public, config: { align: 'center', valign: true, } },
          { coord: [40, 0], w: 4, h: 1, text: bp.scale, config: { align: 'center', valign: true, } },
          { coord: [44, 0], w: 18, h: 1, text: bp.use, config: { align: 'center', valign: true, } },
        ],
        [doc.x, doc.y],
        [62, 1],
        { lineHeight: -1 })
    })

    if (blueprints.length == 0) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 26, h: 1, text: "No hay planos de cortes y fachadas", config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    doc.text('\n');

    var json_var = _GET_STEP_TYPE_JSON('s34');
    let jm1 = json_var.m1 ? json_var.m1 + ' m' : ' ';
    let jm2 = json_var.m2 ? json_var.m2 + ' m2' : ' ';
    let pred = fun_2.catastral ? (fun_2.catastral).replace(/-/g, '') : ' ';
    let direccion = fun_2.direccion ? fun_2.direccion : ' ';
    let mainuse = json_var.mainuse ? json_var.mainuse : ' ';
    let tipo = json_var.tipo ? json_var.tipo : ' ';
    const value34 = _GET_STEP_TYPE('s34', 'value');
    const check34 = _GET_STEP_TYPE('s34', 'check');

    pdfSupport.table(doc,
      [

        { coord: [36, 0], w: 13, h: 1, text: 'Área del predio', config: { align: 'center', valign: true, bold: true } },

        { coord: [49, 0], w: 13, h: 1, text: 'Frente del Predio', config: { align: 'center', valign: true, bold: true } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })
    STEP = _GET_STEP_TYPE('geo', 'value');

    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 8, h: 1, text: pred, config: { align: 'center', valign: true, } },
        { coord: [44, 0], w: 5, h: 1, text: jm2, config: { align: 'center', valign: true, } },

        { coord: [49, 0], w: 8, h: 1, text: direccion, config: { align: 'center', valign: true, } },
        { coord: [57, 0], w: 5, h: 1, text: jm1, config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    doc.text('\n');

    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 26, h: 1, text: 'Datos predio georreferenciado', config: { align: 'center', valign: true, bold: true } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 5, h: 1, text: 'Norte:', config: { align: 'center', valign: true, } },
        { coord: [41, 0], w: 8, h: 1, text: VV(STEP[0]), config: { align: 'center', valign: true, } },

        { coord: [49, 0], w: 5, h: 1, text: 'Este:', config: { align: 'center', valign: true, } },
        { coord: [54, 0], w: 8, h: 1, text: VV(STEP[1]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    /*
    
      blueprints.map(bp => {
        if (bp.category == 'NSR10 Seguridad Humana') pdfSupport.table(doc,
          [
            { coord: [36, 0], w: 4, h: 1, text: 'Seg. Hu.', config: { align: 'center', valign: true, } },
            { coord: [40, 0], w: 4, h: 1, text: bp.id_public, config: { align: 'center', valign: true, } },
            { coord: [44, 0], w: 4, h: 1, text: bp.scale, config: { align: 'center', valign: true, } },
            { coord: [48, 0], w: 14, h: 1, text: bp.use, config: { align: 'center', valign: true, } },
          ],
          [doc.x, doc.y],
          [62, 1],
          { lineHeight: -1 })
      })
    
    
      blueprints.map(bp => {
        if (bp.category == 'Urbanos') pdfSupport.table(doc,
          [
            { coord: [36, 0], w: 4, h: 1, text: 'Urb.', config: { align: 'center', valign: true, } },
            { coord: [40, 0], w: 4, h: 1, text: bp.id_public, config: { align: 'center', valign: true, } },
            { coord: [44, 0], w: 4, h: 1, text: bp.scale, config: { align: 'center', valign: true, } },
            { coord: [48, 0], w: 14, h: 1, text: bp.use, config: { align: 'center', valign: true, } },
          ],
          [doc.x, doc.y],
          [62, 1],
          { lineHeight: -1 })
      })
    
    
      blueprints.map(bp => {
        if (bp.category == 'Otros') pdfSupport.table(doc,
          [
            { coord: [36, 0], w: 4, h: 1, text: 'Otro', config: { align: 'center', valign: true, } },
            { coord: [40, 0], w: 4, h: 1, text: bp.id_public, config: { align: 'center', valign: true, } },
            { coord: [44, 0], w: 4, h: 1, text: bp.scale, config: { align: 'center', valign: true, } },
            { coord: [48, 0], w: 14, h: 1, text: bp.use, config: { align: 'center', valign: true, } },
          ],
          [doc.x, doc.y],
          [62, 1],
          { lineHeight: -1 })
      })
    
    */
    var _end_y = doc.y;

    doc.text('\n');

    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 26, h: 1, text: 'Número de planos aportados', config: { align: 'center', valign: true, bold: true, fill: 'silver', } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })
    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Tipo de Plano', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
        { coord: [50, 0], w: 6, h: 1, text: 'Cantidad', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
        { coord: [56, 0], w: 6, h: 1, text: 'CUMPLE', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })


    // TOTAL BLUE PRINTS
    let bp_totals = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let bp_checks = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    var CHECK_STEP = _GET_STEP_TYPE('blue_prints', 'check');
    var VALUE_STEP = _GET_STEP_TYPE('blue_prints', 'value');

    VALUE_STEP.map((step, i) => bp_totals[i] = step)
    CHECK_STEP.map((step, i) => bp_checks[i] = step)

    if (bp_checks[0] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Arquitectónicos', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[0], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[0]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[1] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Georreferenciado', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[1], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[1]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[2] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Loteo', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[2], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[2]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[3] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Parcelación', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[3], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[3]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[4] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Seguridad Humana', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[4], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[4]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[5] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Subdivisión', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[5], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[5]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[6] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Topográficos', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[6], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[6]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[7] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Urbanístico General', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[7], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[7]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_checks[8] != 2) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Urbanísticos', config: { align: 'left', valign: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals[8], config: { align: 'center', valign: true, } },
        { coord: [56, 0], w: 6, h: 1, text: CV(bp_checks[8]), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 14, h: 1, text: 'Total:', config: { align: 'right', valign: true, bold: true, } },
        { coord: [50, 0], w: 6, h: 1, text: bp_totals.reduce((p, n) => Number(p) + (isNaN(n) ? 0 : Number(n))), config: { align: 'center', valign: true, bold: true, } },
        { coord: [56, 0], w: 6, h: 1, text: bp_checks.some(bp => bp == 0) ? 'NO CUMPLE' : 'CUMPLE', config: { align: 'center', valign: true, bold: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    if (bp_totals[9]) pdfSupport.table(doc,
      [
        { coord: [36, 0], w: 6, h: 1, text: 'Nota:', config: { align: 'right', valign: true, bold: true, } },
        { coord: [42, 0], w: 20, h: 1, text: bp_totals[9], config: { align: 'left', valign: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    var _end_y_2 = doc.y;
    STEP = _GET_STEP_TYPE('s33', 'value');
    if (STEP[2]) {
      doc.y = _end_y;
      if (_end_y_2 > _end_y) doc.y = _end_y_2;

      doc.text('\n');

      /*
      pdfSupport.table(doc,
        [
          { coord: [36, 0], w: 26, h: 1, text: 'Observaciones generales', config: { align: 'left', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [62, 1],
        {})
      pdfSupport.table(doc,
        [
          { coord: [36, 0], w: 26, h: 1, text: STEP[2], config: { align: 'justify', } },
        ],
        [doc.x, doc.y],
        [62, 1],
        { lineHeight: -1 })
      */
    }

    // REVIEW 1
    STEP = _GET_STEP_TYPE('s33', 'check');

    doc.y = _start_Y;
    var _end_p_1 = doc.bufferedPageRange().count - 1;
    if (_start_p_1 != _end_p_1) {
      doc.switchToPage(_start_p_1);
      doc.startPage = doc.startPage - 1
    }
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 35, h: 1, text: 'Observaciones a la planimetria revisada. Formato de revisión e información de proyectos.', config: { align: 'center', bold: true, } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 35, h: 1, text: 'Planos arquitectónicos', config: { align: 'left', } },
      ],
      [doc.x, doc.y],
      [62, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 33, h: 1, text: 'Anteproyecto de intervención en BIENES DE INTERÉS CULTURAL (BIC) o en inmuebles colindantes o localizados dentro de su área de influencia', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[27]), config: { align: 'center', bold: true, fill: 'silver', valign: true } },
      ],
      [doc.x, doc.y],
      [62, 1],
      { lineHeight: -1 })

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 4, text: 'Rótulo', config: { align: 'center', valign: true, bold: true } },

        { coord: [8, 0], w: 25, h: 1, text: 'Dirección', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[0]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 1], w: 25, h: 1, text: 'Firma del arquitecto responsable (indispensable validez)', config: { align: 'left', } },
        { coord: [33, 1], w: 2, h: 1, text: CV(STEP[1]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 2], w: 25, h: 1, text: 'Número de matrícula del arquitecto', config: { align: 'left', } },
        { coord: [33, 2], w: 2, h: 1, text: CV(STEP[2]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 3], w: 25, h: 1, text: 'Escala', config: { align: 'left', } },
        { coord: [33, 3], w: 2, h: 1, text: CV(STEP[3]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 4], w: 25, h: 1, text: 'Modalidad de licencia', config: { align: 'left', } },
        { coord: [33, 4], w: 2, h: 1, text: CV(STEP[28]), config: { align: 'center', bold: true, fill: 'silver' } },
      ],
      [doc.x, doc.y],
      [62, 5],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 5, text: 'Caracteristicas del predio', config: { align: 'center', valign: true, bold: true } },

        { coord: [8, 0], w: 25, h: 1, text: 'Plano de localización e identificación (Georreferenciado art 365 POT)', config: { align: 'left', valign: true, } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[4]), config: { align: 'center', bold: true, fill: 'silver', valign: true } },

        { coord: [8, 1], w: 25, h: 1, text: 'Sección vial', config: { align: 'left', } },
        { coord: [33, 1], w: 2, h: 1, text: CV(STEP[5]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 2], w: 25, h: 1, text: 'Nomenclatura vial', config: { align: 'left', } },
        { coord: [33, 2], w: 2, h: 1, text: CV(STEP[6]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 3], w: 25, h: 1, text: 'Linderos del lote', config: { align: 'left', } },
        { coord: [33, 3], w: 2, h: 1, text: CV(STEP[7]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 4], w: 25, h: 1, text: 'Norte', config: { align: 'left', } },
        { coord: [33, 4], w: 2, h: 1, text: CV(STEP[8]), config: { align: 'center', bold: true, fill: 'silver' } },
      ],
      [doc.x, doc.y],
      [62, 5],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Cuadro de áreas', config: { align: 'center', valign: true, bold: true } },

        { coord: [8, 0], w: 25, h: 1, text: 'Cuadro general de áreas del proyecto arquitectónico', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[9]), config: { align: 'center', bold: true, fill: 'silver' } },

      ],
      [doc.x, doc.y],
      [62, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 7, text: 'Plantas arquitectónicas por piso, sótano o semisótano y cubiertas', config: { align: 'center', valign: true, bold: true } },

        { coord: [8, 0], w: 25, h: 1, text: 'Primera planta relacionada con el espacio público', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[10]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 1], w: 25, h: 1, text: 'Cotas totales y parciales del proyecto', config: { align: 'left', } },
        { coord: [33, 1], w: 2, h: 1, text: CV(STEP[11]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 2], w: 25, h: 1, text: 'Ejes y elementos estructurales proyectados (sistemas estructural)', config: { align: 'left', valign: true } },
        { coord: [33, 2], w: 2, h: 1, text: CV(STEP[12]), config: { align: 'center', bold: true, fill: 'silver', valign: true } },

        { coord: [8, 3], w: 25, h: 1, text: 'Niveles', config: { align: 'left', } },
        { coord: [33, 3], w: 2, h: 1, text: CV(STEP[13]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 4], w: 25, h: 1, text: 'Uso', config: { align: 'left', } },
        { coord: [33, 4], w: 2, h: 1, text: CV(STEP[14]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 5], w: 25, h: 1, text: 'Indicación cortes (longitud, transversal relacionados con E. Público)', config: { align: 'left', valign: true } },
        { coord: [33, 5], w: 2, h: 1, text: CV(STEP[15]), config: { align: 'center', bold: true, fill: 'silver', valign: true } },

        { coord: [8, 6], w: 25, h: 1, text: 'Planta de cubierta', config: { align: 'left', valign: true } },
        { coord: [33, 6], w: 2, h: 1, text: CV(STEP[26]), config: { align: 'center', bold: true, fill: 'silver', valign: true } },


      ],
      [doc.x, doc.y],
      [62, 7],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 6, text: 'Cortes', config: { align: 'center', valign: true, bold: true } },

        { coord: [8, 0], w: 25, h: 1, text: 'Relación con el espacio público y privado', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[16]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 1], w: 25, h: 1, text: 'Indicación de la pendiente del terreno', config: { align: 'left', } },
        { coord: [33, 1], w: 2, h: 1, text: CV(STEP[17]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 2], w: 25, h: 1, text: 'Niveles por piso', config: { align: 'left', } },
        { coord: [33, 2], w: 2, h: 1, text: CV(STEP[18]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 3], w: 25, h: 1, text: 'Cotas totales y parciales', config: { align: 'left', } },
        { coord: [33, 3], w: 2, h: 1, text: CV(STEP[19]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 4], w: 25, h: 1, text: 'Ejes estructurales', config: { align: 'left', } },
        { coord: [33, 4], w: 2, h: 1, text: CV(STEP[20]), config: { align: 'center', bold: true, fill: 'silver' } },

      ],
      [doc.x, doc.y],
      [62, 5],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 3, text: 'Fachadas', config: { align: 'center', valign: true, bold: true } },

        { coord: [8, 0], w: 25, h: 1, text: 'Indicación de la pendiente del terreno', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[21]), config: { align: 'center', bold: true, fill: 'silver', } },

        { coord: [8, 1], w: 25, h: 1, text: 'Niveles por piso', config: { align: 'left', } },
        { coord: [33, 1], w: 2, h: 1, text: CV(STEP[22]), config: { align: 'center', bold: true, fill: 'silver' } },

        { coord: [8, 2], w: 25, h: 2, text: 'Cotas totales y parciales', config: { align: 'left', } },
        { coord: [33, 2], w: 2, h: 2, text: CV(STEP[23]), config: { align: 'center', bold: true, fill: 'silver' } },

      ],
      [doc.x, doc.y],
      [62, 3],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 33, h: 1, text: 'Plantas, cortes y fachadas a la misma escala', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[24]), config: { align: 'center', bold: true, fill: 'silver', } },
      ],
      [doc.x, doc.y],
      [62, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 33, h: 1, text: 'Planos arquitectónicos para el reconocimiento de la existencia de edificaciones', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[25]), config: { align: 'center', bold: true, fill: 'silver', } },
      ],
      [doc.x, doc.y],
      [62, 1],
      {})

    STEP = _GET_STEP_TYPE('s33_2', 'check');

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 33, h: 1, text: 'Los planos permiten entender el proyecto y por tanto su construcción', config: { align: 'left', } },
        { coord: [33, 0], w: 2, h: 1, text: CV(STEP[0]), config: { align: 'center', bold: true, fill: 'silver', } },

        { coord: [0, 1], w: 33, h: 1, text: 'El proyecto tiene diseñado el espacio público', config: { align: 'left', } },
        { coord: [33, 1], w: 2, h: 1, text: CV(STEP[1]), config: { align: 'center', bold: true, fill: 'silver', } },

        { coord: [0, 2], w: 33, h: 1, text: 'La suma del cuadro de áreas es correcta por cada actuación urbanística solicitada', config: { align: 'left', } },
        { coord: [33, 2], w: 2, h: 1, text: CV(STEP[2]), config: { align: 'center', bold: true, fill: 'silver', } },

        { coord: [0, 3], w: 33, h: 1, text: 'La solicitud señalada es el FUN y la valla corresponder con lo revisado', config: { align: 'left', } },
        { coord: [33, 3], w: 2, h: 1, text: CV(STEP[3]), config: { align: 'center', bold: true, fill: 'silver', } },
      ],
      [doc.x, doc.y],
      [62, 4],
      {})

    doc.fontSize(7);

    var _end_p_2 = doc.bufferedPageRange().count - 1;

    var _end_y_3 = doc.y;
    doc.y = _end_y;

    if (_end_y_2 > _end_y) doc.y = _end_y_2;
    if (_end_y_3 > _end_y_2) doc.y = _end_y_3;

    if (_end_p_2 > _end_p_1) doc.y = _end_y_3;
    if (_end_p_1 > _end_p_2) doc.y = _end_y_2;
    STEP = _GET_STEP_TYPE('s33', 'value');
    doc.text('\n');


    // 2.0 DESCRIPCIÓN DE LA ACTUACIÓN URBANÍSTICA

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: '2.0 DESCRIPCIÓN DE LA ACTUACIÓN URBANÍSTICA', config: { align: 'left', bold: true, fill: 'silver' } },
      ],
      [doc.x, doc.y],
      [60, 1],
      {})
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: '2.1 Antecedentes', config: { align: 'left', bold: true, } },
      ],
      [doc.x, doc.y],
      [60, 1],
      {})
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: STEP[0] ? `\n${STEP[0]}\n ` : '\nNo cuenta con antecedentes\n', config: { align: 'left', valign: true } },
      ],
      [doc.x, doc.y],
      [60, 1],
      { lineHeight: -1 })
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: '2.2 Descripción de la actuacion urbanistica solicitada', config: { align: 'left', bold: true, } },
      ],
      [doc.x, doc.y],
      [60, 1],
      {})
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: STEP[1] ? `\n${STEP[1]}\n ` : '\nNo cuenta con descripción\n', config: { align: 'left', valign: true } },
      ],
      [doc.x, doc.y],
      [60, 1],
      { lineHeight: -1 })




    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: '2.3 Caracteristicas del proyecto', config: { align: 'left', bold: true, } },
      ],
      [doc.x, doc.y],
      [60, 1],
      {})
    doc.fontSize(6);


    // -------------------------------------------------------- //
    // ----------------------- RESUME TABLE ------------------- //
    // -------------------------------------------------------- //

    let areas = _GET_CHILD_33_AREAS();


    let dinamicTotal = (areas, filter) => {
      let cells = [];

      /*
      tagsH.map((tag, i) => {
        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: _ADD_AREAS_I(areas, 6), config: { align: 'center', valign: true, } })
        _i++;
      })
      tagsE.map((tag, i) => {
        cells.push({ coord: [tbWidth * (_i + 3), 0], w: tbWidth, h: 1, text: 'Empate:\n' + tag, config: { align: 'center', valign: true, } })
        _i++;
      })
      */

      let _i = 0;
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

    tableHeaders = [
      { coord: [0, 0], w: 1, h: 1, text: 'Uso\nPrincipal', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Tipo', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Escala\nUrbana', config: { align: 'center', bold: true, valign: true, } },
      // HERE ADD THE DIMANIC AREAS
      ...dinmanicHeaders(null, true),
      // END HERE
      { coord: [0, 0], w: 1, h: 1, text: 'Área total descontada', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Área total intervenida', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Área total construida', config: { align: 'center', bold: true, valign: true, } },

      { coord: [0, 0], w: 1, h: 1, text: 'Cantidad', config: { align: 'center', bold: true, valign: true, } },
      { coord: [0, 0], w: 1, h: 1, text: 'Área\nunidades', config: { align: 'center', bold: true, valign: true, } },
      //{ coord: [0, 0], w: 1, h: 1, text: 'Área\ncomún', config: { align: 'center', bold: true, valign: true, } },
    ];

    tbWidth = 60 / tableHeaders.length;
    let tbWidthA = tbWidth * (tableHeaders.length - 2)
    let tbWidthU = tbWidth * 2;
    tableHeaders.map((th, i) => { th.coord[0] += tbWidth * i; th.w = tbWidth; })

    pdfSupport.table(doc,
      [
        { coord: [tbWidth * 3, 0], w: tbWidthA - (tbWidth * 3), h: 1, text: 'Áreas totales m2', config: { align: 'center', bold: true, } },
        { coord: [tbWidthA, 0], w: tbWidthU, h: 1, text: 'Unidades Nuevas', config: { align: 'center', bold: true, } },

      ],
      [doc.x, doc.y],
      [60, 1],
      {})
    pdfSupport.table(doc,
      tableHeaders,
      [doc.x, doc.y],
      [60, 1],
      { lineHeight: -1 })

    //let areas = _GET_CHILD_33_AREAS();
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
      areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(_GET_COMMON_A_TOTAL([use])).toFixed(2), config: { align: 'center', valign: true, } })
      __i++
      areasRow.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(localArea).toFixed(2), config: { align: 'center', valign: true, } })


      areas.map((area, j) => {
        let _use = String(area.use).toLowerCase();
        if (!_use) _use = 'otro';
        if (_use == use) {
          let _escala = VV(value34[5]);
          if (_use.trim() == 'vivienda' || _use.trim() == 'residencia') _escala = "NA";

          rowUses[k] = [
            { coord: [tbWidth * 0, 0], w: tbWidth, h: 1, text: _use, config: { align: 'center', } },
            { coord: [tbWidth * 1, 0], w: tbWidth, h: 1, text: tipo, config: { align: 'center', } },
            { coord: [tbWidth * 2, 0], w: tbWidth, h: 1, text: _escala, config: { align: 'center', } },
            ...areasRow,
            { coord: [tbWidthA, 0], w: tbWidth, h: 1, text: Number(_GET_UNITS_U_TOTAL([_use])).toFixed(0), config: { align: 'center', valign: true, } },
            { coord: [tbWidthA + tbWidth, 0], w: tbWidth, h: 1, text: _GET_UNITS_A_TOTAL([_use]), config: { align: 'center', valign: true, } },
            //{ coord: [tbWidthA + tbWidth * 2, 0], w: tbWidth, h: 1, text: Number(localArea).toFixed(2), config: { align: 'center', valign: true, } },
          ];
        }
      })
    })


    rowUses.map(rows => {
      let sumAreas = rows.reduce((p, n) => Number(p) + (isNaN(n.text) ? 0 : Number(n.text)), 0)
      if (sumAreas > 0) pdfSupport.table(doc, [...rows], [doc.x, doc.y], [60, 1], {})
    })

    rowAreasTotal.push(...totals);
    __i = totals.length;
    rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(sumDestroy).toFixed(2), config: { align: 'center', valign: true, } })
    __i++;
    rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(_GET_COMMON_A_TOTAL()).toFixed(2), config: { align: 'center', valign: true, } })
    __i++;
    rowAreasTotal.push({ coord: [tbWidth * (__i + 3), 0], w: tbWidth, h: 1, text: Number(sumArea).toFixed(2), config: { align: 'center', valign: true, } })


    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: tbWidth * 3, h: 1, text: 'Totales:', config: { align: 'right', bold: true, } },
        ...rowAreasTotal,
        { coord: [tbWidthA, 0], w: tbWidth, h: 1, text: Number(_GET_UNITS_U_TOTAL()).toFixed(0), config: { align: 'center', valign: true, } },
        { coord: [tbWidthA + tbWidth, 0], w: tbWidth, h: 1, text: _GET_UNITS_A_TOTAL(), config: { align: 'center', valign: true, } },
        //{ coord: [tbWidthA + tbWidth * 2, 0], w: tbWidth, h: 1, text: Number(sumArea).toFixed(2), config: { align: 'center', valign: true, } },
      ],
      [doc.x, doc.y],
      [60, 1],
      {})


    // -------------------------------------------------------- //
    // -------------------------------------------------------- //
    // -------------------------------------------------------- //


    doc.fontSize(7);
    doc.text('\n');

    var VALUES;
    var CHECKS;

    let startY = doc.y;

    let ficha = json_var.ficha ? json_var.ficha : '';
    let sector = json_var.sector ? json_var.sector : '';
    let subsector = json_var.subsector ? json_var.subsector : '';
    let zugm = json_var.zugm ? json_var.zugm : '';
    let zgu = json_var.zgu ? json_var.zgu : '';

    // DETERMINANTES URBANA
    if (ALLOW_REVIEWS[0] == 1) {
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'DETERMINANTES URBANA', config: { align: 'left', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [60, 1],
        {})

      //doc.on('pageAdded', () => { doc.startPage = doc.startPage });
      doc.text('\n');

      _start_Y = doc.y;
      doc.startY = doc.y;
      let start_tables = Number(doc.bufferedPageRange().count - 1);
      //doc.startPage = Number(start_tables)

      doc.startPage = doc.bufferedPageRange().count - 1;
      //doc.lastPage = doc.startPage;

      // SECTOR NORMATIVO

      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: 'Sector Normativo', config: { align: 'center', bold: true, } },

          { coord: [0, 1], w: 7, h: 1, text: 'Ficha Normativa', config: { align: 'center', } },
          { coord: [7, 1], w: 3, h: 1, text: ficha, config: { align: 'center', } },

          { coord: [0, 2], w: 7, h: 1, text: 'Sector', config: { align: 'center', } },
          { coord: [7, 2], w: 3, h: 1, text: sector, config: { align: 'center', } },

          { coord: [0, 3], w: 7, h: 1, text: 'Subsector', config: { align: 'center', } },
          { coord: [7, 3], w: 3, h: 1, text: subsector, config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 4], {})

      doc.text('\n');

      // SOCIECONOMICO

      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: 'Socioeconómico', config: { align: 'center', bold: true, } },

          { coord: [0, 1], w: 6, h: 1, text: 'Estrato', config: { align: 'center', } },
          { coord: [6, 1], w: 4, h: 1, text: fun_2.estrato ? fun_2.estrato : '', config: { align: 'center', } },

          { coord: [0, 2], w: 6, h: 1, text: 'ZGU N°', config: { align: 'center', } },
          { coord: [6, 2], w: 4, h: 1, text: zgu, config: { align: 'center', } },

          { coord: [0, 3], w: 6, h: 1, text: '$M ZGU', config: { align: 'center', } },
          { coord: [6, 3], w: 4, h: 1, text: zugm, config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 4], {})

      _end_y = doc.y;

      doc.switchToPage(start_tables);
      if (doc.startPage != start_tables) doc.startPage = doc.startPage - 1

      doc.y = doc.startY;

      // RESTRICCIN / LIMITACION

      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 20, h: 1, text: 'Restricción / Limitación del predio', config: { align: 'center', bold: true, } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Zona de restricción', config: { align: 'left', } },
          { coord: [18, 0], w: 8, h: 1, text: value34[6], config: { align: 'left', } },
          { coord: [26, 0], w: 5, h: 1, text: check34[6] == 1 ? 'SIN REST.' : 'CON REST.', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Utilidad Pública', config: { align: 'left', } },
          { coord: [18, 0], w: 8, h: 1, text: value34[7], config: { align: 'left', } },
          { coord: [26, 0], w: 5, h: 1, text: check34[7] == 1 ? 'SIN REST.' : 'CON REST.', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Amenaza y Riesgo', config: { align: 'left', } },
          { coord: [18, 0], w: 8, h: 1, text: value34[8], config: { align: 'left', } },
          { coord: [26, 0], w: 5, h: 1, text: check34[8] == 1 ? 'SIN REST.' : 'CON REST.', config: { align: 'center', } },

        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })
      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 15, h: 1, text: value34[9], config: { align: 'left', } },
          { coord: [26, 0], w: 5, h: 1, text: check34[9] == 1 ? 'SIN REST.' : 'CON REST.', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1, })

      doc.text('\n');

      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 20, h: 1, text: 'Suelo', config: { align: 'center', bold: true, } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Clase de suelo', config: { align: 'left', } },
          { coord: [18, 0], w: 13, h: 1, text: value34[0], config: { align: 'left', } },
          //{ coord: [24, 0], w: 6, h: 1, text: check34[0] == 1 ? 'CUMPLE.' : 'NO CUMPLE', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Tratamiento', config: { align: 'left', } },
          { coord: [18, 0], w: 13, h: 1, text: value34[2], config: { align: 'left', } },
          //{ coord: [24, 0], w: 6, h: 1, text: check34[1] == 1 ? 'CUMPLE.' : 'NO CUMPLE', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Área de actividad', config: { align: 'left', } },
          { coord: [18, 0], w: 13, h: 1, text: value34[4], config: { align: 'left', } },
          //{ coord: [24, 0], w: 6, h: 1, text: check34[4] == 1 ? 'CUMPLE.' : 'NO CUMPLE', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Unidad de uso', config: { align: 'left', } },
          { coord: [18, 0], w: 13, h: 1, text: value34[3], config: { align: 'left', } },
          //{ coord: [24, 0], w: 6, h: 1, text: check34[3] == 1 ? 'CUMPLE.' : 'NO CUMPLE', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      pdfSupport.table(doc,
        [
          { coord: [11, 0], w: 7, h: 1, text: 'Escala urbana', config: { align: 'left', } },
          { coord: [18, 0], w: 13, h: 1, text: value34[5], config: { align: 'left', } },
          //{ coord: [24, 0], w: 6, h: 1, text: check34[5] == 1 ? 'CUMPLE.' : 'NO CUMPLE', config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      _end_y_2 = doc.y
      let _end_page_2 = doc.bufferedPageRange().count - 1;
      if (_end_y_2 > start_tables) _end_page_2 = 1;
      else _end_page_2 = 2;
      doc.switchToPage(start_tables);
      if (doc.startPage != start_tables) doc.startPage = doc.startPage - 1
      doc.y = doc.startY;

      // K TYPOLOGY
      VALUES = _GET_STEP_TYPE('s_34_te', 'value');
      CHECKS = _GET_STEP_TYPE('s_34_te', 'check');

      var EXCPS = [];

      if (VV(VALUES[5]) != 'NO') EXCPS.push({ exc: VALUES[5], name: 'Indice Ocupación' });
      if (VV(VALUES[9]) != 'NO') EXCPS.push({ exc: VALUES[9], name: 'Indice Construcción' });
      if (VV(VALUES[2]) != 'NO') EXCPS.push({ exc: VALUES[2], name: 'Tipologia Edificatoria' });
      if (VV(VALUES[13]) != 'NO') EXCPS.push({ exc: VALUES[13], name: 'Número de pisos' });
      if (VV(VALUES[62]) != 'NO') EXCPS.push({ exc: VALUES[62], name: VV(VALUES[69]) ? VV(VALUES[69]) : 'Aislamiento Frontal' });
      if (VV(VALUES[63]) != 'NO') EXCPS.push({ exc: VALUES[63], name: VV(VALUES[70]) ? VV(VALUES[70]) : 'Aislamiento Frontal' });
      if (VV(VALUES[64]) != 'NO') EXCPS.push({ exc: VALUES[64], name: VV(VALUES[71]) ? VV(VALUES[71]) : 'Aislamiento Lateral' });
      if (VV(VALUES[65]) != 'NO') EXCPS.push({ exc: VALUES[65], name: VV(VALUES[72]) ? VV(VALUES[72]) : 'Aislamiento Lateral' });

      if (CHECKS.some(c => c == 1 || c == 0)) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: 'Parámetros', config: { align: 'center', bold: true, } },
          { coord: [41, 0], w: 5, h: 1, text: 'Dato', config: { align: 'center', bold: true, } },
          { coord: [46, 0], w: 5, h: 1, text: 'Norma', config: { align: 'center', bold: true, } },
          { coord: [51, 0], w: 5, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, } },
          { coord: [56, 0], w: 6, h: 1, text: 'Evaluación', config: { align: 'center', bold: true, } },
        ],
        [doc.x, doc.y], [62, 1], {})

      if (CHECKS[1] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: 'Indice Ocupación', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[6]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[3]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[4]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[5]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[1]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], {})

      if (CHECKS[2] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: 'Indice Construcción', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[10]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[7]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[8]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[9]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[2]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], {})

      if (CHECKS[0] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: 'Tipologia Edificatoria', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: '', config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[0]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[1]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[2]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[0]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[3] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: 'Número de pisos', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[17]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[11]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[12]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[13]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[3]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], {})

      if (CHECKS[4] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: 'Semisótano', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[21]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[18]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[19]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[4]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], {})

      if (CHECKS[5] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: 'Sótanos', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[24]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[22]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[23]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[5]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], {})

      if (CHECKS[6] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[69]) ? VV(VALUES[69]) : 'Aislamiento Frontal', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[28]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[26]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[27]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[62]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[6]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[7] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[70]) ? VV(VALUES[70]) : 'Aislamiento Frontal', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[32]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[30]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[31]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[63]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[7]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[8] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[71]) ? VV(VALUES[71]) : 'Aislamiento Lateral', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[36]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[34]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[35]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[64]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[8]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[9] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[72]) ? VV(VALUES[72]) : 'Aislamiento Lateral', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[40]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[38]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[39]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: VV(VALUES[65]) != 'NO' ? 'EXCEPCIÓN' : CV2(CHECKS[9]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      // THIS ONE IS SUPPOSED TO BE LIKE IT IS SUPPOSED TO BE
      if (false) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 8, h: 1, text: 'Aislamiento Lateral', config: { align: 'left', } },
          { coord: [40, 0], w: 5, h: 1, text: VV(VALUES[43]), config: { align: 'center', } },
          { coord: [45, 0], w: 5, h: 1, text: VV(VALUES[42]), config: { align: 'center', } },
          { coord: [50, 0], w: 6, h: 1, text: VV(VALUES[45]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[10]), config: { align: 'center', } },

        ],
        [doc.x, doc.y], [62, 1], {})

      if (CHECKS[11] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[74]) ? VV(VALUES[74]) : 'Aislamiento Posterior', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[48]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[46]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[47]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[11]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[12] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[75]) ? VV(VALUES[75]) : 'Antejardin', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[52]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[50]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[51]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[12]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[13] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[76]) ? VV(VALUES[76]) : 'Antejardin', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[56]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[54]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[55]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[13]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[14] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[77]) ? VV(VALUES[77]) : 'Antejardin', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[60]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[58]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[59]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[14]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 })

      if (CHECKS[15] != 2) pdfSupport.table(doc,
        [
          { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[78]) ? VV(VALUES[78]) : 'Antejardin', config: { align: 'left', } },
          { coord: [41, 0], w: 5, h: 1, text: VV(VALUES[80]), config: { align: 'center', } },
          { coord: [46, 0], w: 5, h: 1, text: VV(VALUES[82]), config: { align: 'center', } },
          { coord: [51, 0], w: 5, h: 1, text: VV(VALUES[79]), config: { align: 'center', } },
          { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[15]), config: { align: 'center', } },
        ],
        [doc.x, doc.y], [62, 1], { lineHeight: -1 });


      if (EXCPS.length) {
        doc.text('\n');

        pdfSupport.table(doc,
          [
            { coord: [32, 0], w: 30, h: 1, text: 'Excepciones', config: { align: 'left', bold: true, } },
          ],
          [doc.x, doc.y], [62, 1], {})

        EXCPS.map(exc => pdfSupport.table(doc,
          [
            { coord: [32, 0], w: 10, h: 1, text: exc.name, config: { align: 'left', } },
            { coord: [42, 0], w: 20, h: 1, text: exc.exc, config: { align: 'left', } },
          ],
          [doc.x, doc.y], [62, 1], { lineHeight: -1 }))
      }

      VALUES = _GET_STEP_TYPE('s_34_vo', 'value');
      CHECKS = _GET_STEP_TYPE('s_34_vo', 'check');

      if (CHECKS.some(c => c == 1 || c == 0)) {
        doc.text('\n');

        pdfSupport.table(doc,
          [
            { coord: [32, 0], w: 9, h: 1, text: 'Voladizos', config: { align: 'center', bold: true, } },
            { coord: [41, 0], w: 7, h: 1, text: 'Perfil', config: { align: 'center', bold: true, } },
            { coord: [48, 0], w: 5, h: 1, text: 'Antejardin', config: { align: 'center', bold: true, } },
            { coord: [53, 0], w: 3, h: 1, text: 'Dato', config: { align: 'center', bold: true, } },
            { coord: [56, 0], w: 6, h: 1, text: 'Evaluación', config: { align: 'center', bold: true, } },
          ],
          [doc.x, doc.y], [62, 1], { lineHeight: -1 })

        if (CHECKS[0] != 2) pdfSupport.table(doc,
          [
            { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[3]) ? VV(VALUES[3]) : 'Voladizo', config: { align: 'left', } },
            { coord: [41, 0], w: 7, h: 1, text: VV(VALUES[0]), config: { align: 'center', } },
            { coord: [48, 0], w: 5, h: 1, text: VV(VALUES[1]), config: { align: 'center', } },
            { coord: [53, 0], w: 3, h: 1, text: VV(VALUES[2]), config: { align: 'center', } },
            { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[0]), config: { align: 'center', } },
          ],
          [doc.x, doc.y], [62, 1], { lineHeight: -1 })

        if (CHECKS[1] != 2) pdfSupport.table(doc,
          [
            { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[7]) ? VV(VALUES[7]) : 'Voladizo', config: { align: 'left', } },
            { coord: [41, 0], w: 7, h: 1, text: VV(VALUES[4]), config: { align: 'center', } },
            { coord: [48, 0], w: 5, h: 1, text: VV(VALUES[5]), config: { align: 'center', } },
            { coord: [53, 0], w: 3, h: 1, text: VV(VALUES[6]), config: { align: 'center', } },
            { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[1]), config: { align: 'center', } },
          ],
          [doc.x, doc.y], [62, 1], { lineHeight: -1 })

        if (CHECKS[2] != 2) pdfSupport.table(doc,
          [
            { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[11]) ? VV(VALUES[11]) : 'Voladizo', config: { align: 'left', } },
            { coord: [41, 0], w: 7, h: 1, text: VV(VALUES[8]), config: { align: 'center', } },
            { coord: [48, 0], w: 5, h: 1, text: VV(VALUES[9]), config: { align: 'center', } },
            { coord: [53, 0], w: 3, h: 1, text: VV(VALUES[10]), config: { align: 'center', } },
            { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[2]), config: { align: 'center', } },
          ],
          [doc.x, doc.y], [62, 1], { lineHeight: -1 })

        if (CHECKS[3] != 2) pdfSupport.table(doc,
          [
            { coord: [32, 0], w: 9, h: 1, text: VV(VALUES[15]) ? VV(VALUES[15]) : 'Voladizo', config: { align: 'left', } },
            { coord: [41, 0], w: 7, h: 1, text: VV(VALUES[12]), config: { align: 'center', } },
            { coord: [48, 0], w: 5, h: 1, text: VV(VALUES[13]), config: { align: 'center', } },
            { coord: [53, 0], w: 3, h: 1, text: VV(VALUES[14]), config: { align: 'center', } },
            { coord: [56, 0], w: 6, h: 1, text: CV2(CHECKS[3]), config: { align: 'center', } },
          ],
          [doc.x, doc.y], [62, 1], { lineHeight: -1 })
      }

      doc.text('\n');

      _end_y_3 = doc.y;
      let _end_page_3 = _end_y_3 < start_tables ? doc.bufferedPageRange().count - 1 : doc.bufferedPageRange().count - 2;
      if (_end_y_3 > start_tables) _end_page_3 = 1;
      else _end_page_3 = 2;

      doc.switchToPage(doc.bufferedPageRange().count - 1);

      if (_end_page_2 > _end_page_3) {
        doc.y = _end_y_2;
        doc.switchToPage(_end_page_2);
      }
      if (_end_page_3 > _end_page_2) doc.y = _end_y_3;

      if (_end_page_3 == _end_page_2) {
        if (_end_y_2 > _end_y_3) doc.y = _end_y_2;
        if (_end_y_3 > _end_y_2) doc.y = _end_y_3;
      }


      doc.startPage = doc.bufferedPageRange().count - 1;


      // DECRETO 1077
      let con_f = fun_1 ? fun_1.tipo ? fun_1.tipo.includes('F') : false : false;
      //let con_d = fun_1 ? fun_1.m_lic ? fun_1.m_lic.includes('D') : false : false;
      //doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });

      if (con_f) {

        VALUES = _GET_STEP_TYPE('s34u', 'value');
        CHECKS = _GET_STEP_TYPE('s34u', 'check');
        doc.text('\n');
        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 60, h: 1, text: 'DETERMINANTES RECONOCIMIENTO', config: { align: 'left', bold: true, fill: 'silver' } },
          ],
          [doc.x, doc.y], [60, 1], {});

        doc.text('\n');

        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 60, h: 1, text: 'CONSIDERACIONES DECRETO 1077 DE 2015 FRENTE A LA PROCEDIBILIDAD DEL RECONOCIMIENTO. OBLIGATORIO', config: { align: 'center', bold: true, fill: 'silver' } },
          ],
          [doc.x, doc.y], [60, 1], {})

        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 60, h: 1, text: 'Los actos de reconocimiento de edificación existen además de lo reglamentado por el Decreto 1077 de 2015 y en particular por el artículo 2.2.6.4.1.2 que determina las situaciones en que este no procede; que para el caso de edificio objeto de esta actuación urbanística no se tipifican. En efecto consultado el POT y en particular la ficha normativa donde encuentra el inmueble se encuentra que:', config: { align: 'justify', } },
          ],
          [doc.x, doc.y], [60, 1], { lineHeight: -1 })
        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 54, h: 1, text: 'En área de protección ambiental y el suelo clasificado como de protección o en los instrumentos que lo desarrollen o complementen', config: { align: 'justify', } },
            { coord: [54, 0], w: 6, h: 1, text: CHECKS[0] == '1' ? 'ESTA' : 'NO ESTA', config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 1], w: 54, h: 1, text: 'Está en las zonas declaradas como de alto riesgo no mitigable identificadas en el POT', config: { align: 'justify', } },
            { coord: [54, 1], w: 6, h: 1, text: CHECKS[1] == '1' ? 'ESTA' : 'NO ESTA', config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 2], w: 54, h: 1, text: 'Esta afectado por el artículo 37 de la ley 9 de 1989, o que ocupen total o parcialmente el espacio público', config: { align: 'justify', } },
            { coord: [54, 2], w: 6, h: 1, text: CHECKS[2] == '1' ? 'ESTA' : 'NO ESTA', config: { align: 'center', fill: 'gainsboro', bold: true, } },
          ],
          [doc.x, doc.y], [60, 3], {})
        doc.text('\n');

        // SECRETARIA DE PLANEACIÓN

        VALUES = _GET_STEP_TYPE('s35u', 'value');
        CHECKS = _GET_STEP_TYPE('s35u', 'check');
        let _GET_NOTIFY = (_VALUE) => {
          if (_VALUE == 0) return 'NO NOTIFICADO';
          if (_VALUE == 1) return 'NOTIFICADO';
          return ' ';
        }
        let REPORT_DATA = fun_law ? fun_law.report_data : false;
        let cub1 = fun_law ? fun_law.report_cub ? fun_law.report_cub : '' : ''
        let RD0 = REPORT_DATA ? REPORT_DATA.split(',')[0] : ' ';
        let RD1 = REPORT_DATA ? REPORT_DATA.split(',')[1] : ' ';
        let RD2 = REPORT_DATA ? REPORT_DATA.split(',')[2] : ' ';
        let RD3 = REPORT_DATA ? REPORT_DATA.split(',')[3] : ' ';
        let RD5 = REPORT_DATA ? REPORT_DATA.split(',')[5] : ' ';

        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 60, h: 1, text: 'INTERVENCIÓN DE LA SECRETARIA DE PLANEACIÓN MUNICIPAL. -SPM- INFORME VISITA AL PREDIO', config: { align: 'center', bold: true, fill: 'silver' } },
          ],
          [doc.x, doc.y], [60, 1], {})

        doc.text('\n');

        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 22, h: 1, text: 'CUB1 notifico reconocimiento a la –SPM-', config: { align: 'justify', } },
            { coord: [22, 0], w: 8, h: 1, text: _GET_NOTIFY(RD0), config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 1], w: 22, h: 1, text: 'Identificación del oficio', config: { align: 'justify', } },
            { coord: [22, 1], w: 8, h: 1, text: cub1, config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 2], w: 22, h: 1, text: 'Fecha de Radicación ante la SPM', config: { align: 'justify', } },
            { coord: [22, 2], w: 8, h: 1, text: RD2, config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [31, 0], w: 22, h: 1, text: 'Respuesta SPM radicación', config: { align: 'justify', } },
            { coord: [53, 0], w: 8, h: 1, text: RD3, config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [31, 1], w: 22, h: 1, text: 'Oficio de Planeacion', config: { align: 'justify', } },
            { coord: [53, 1], w: 8, h: 1, text: RD5, config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [31, 2], w: 22, h: 1, text: 'Fecha Limite (Fecha radicacion mas 10 dias hábiles)', config: { align: 'justify', } },
            { coord: [53, 2], w: 8, h: 1, text: typeParse.dateParser_finalDate(RD2, 10), config: { align: 'center', fill: 'gainsboro', bold: true, } },
          ],
          [doc.x, doc.y], [61, 3], {})

        doc.text('\n');
        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 60, h: 1, text: `El acto de reconocimiento de edificaciones existentes se rige en el municipio de Bucaramanga por el artículo 471 de Acuerdo 011 de 2014, en virtud de ello, el ente territorial se pronunció a través del oficio ${RD5} emitiendo el siguiente resultado de procedibilidad en los términos de los literales b), c), d) y e) del numeral 1 del artículo ibídem para el literal:`, config: { align: 'justify', } },
          ],
          [doc.x, doc.y], [60, 1], { lineHeight: -1 })


        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 54, h: 1, text: 'b) El levantamiento arquitectónico de la construcción coincide con lo construido en el sitio.', config: { align: 'justify', } },
            { coord: [54, 0], w: 6, h: 1, text: CV3(CHECKS[0], 'NO ESTA'), config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 1], w: 54, h: 1, text: 'c) La construcción ocupa total o parcialmente el espacio público: antejardín, componente del perfil vial', config: { align: 'justify', } },
            { coord: [54, 1], w: 6, h: 1, text: CV3(CHECKS[1], 'NO ESTA'), config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 2], w: 54, h: 1, text: 'd) Se desarrollan construcciones en el aislamiento posterior', config: { align: 'justify', } },
            { coord: [54, 2], w: 6, h: 1, text: CV3(CHECKS[2], 'NO ESTA'), config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 3], w: 54, h: 1, text: 'd) e) Cumple con el Decreto 1077 de 2015 (Uso del suelo)', config: { align: 'justify', } },
            { coord: [54, 3], w: 6, h: 1, text: CV3(CHECKS[3], 'NO ESTA'), config: { align: 'center', fill: 'gainsboro', bold: true, } },

            { coord: [0, 4], w: 60, h: 1, text: `Conclusiones: ${VALUES[0]}`, config: { align: 'justify', } },
          ],
          [doc.x, doc.y], [60, 5], {})
      }

      doc.text('\n');


      // REVIEW 2 - HABITABILIDAD

      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'HABITABILIDAD', config: { align: 'left', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [60, 1],
        {})

      doc.text('\n');

      VALUES = _GET_STEP_TYPE('s34_hs', 'value');
      CHECKS = _GET_STEP_TYPE('s34_hs', 'check');

      if (CHECKS[1] != 2 && CHECKS[1] != undefined) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 4, text: 'Condiciones mínimas iluminación y ventilación', config: { align: 'center', bold: true, valign: true } },

          { coord: [10, 0], w: 42, h: 2, text: 'Todos los espacios habitables, áreas sociales, baños, cocinas, alcobas pueden ventilarse e iluminarse directamente o a través de fachadas o patios', config: { align: 'justify', valign: true, } },
          { coord: [52, 0], w: 2, h: 2, text: VV(VALUES[1]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 2], w: 42, h: 1, text: 'Las áreas de servicio garajes, cuartos técnicos y depósitos están iluminados y ventilados artificialmente o por ductos o buitrones o por medios mecánicos', config: { align: 'justify', } },
          { coord: [52, 2], w: 2, h: 1, text: VV(VALUES[2]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 3], w: 42, h: 1, text: 'Vacíos interiores en función de la altura de la edificación', config: { align: 'justify', valign: true, } },
          { coord: [52, 3], w: 2, h: 1, text: VV(VALUES[3]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [54, 0], w: 6, h: 4, text: CV2(CHECKS[1]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },
        ],
        [doc.x, doc.y], [60, 4], {})

      if (CHECKS[0] != 2 && CHECKS[1] != undefined) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 1, text: 'Área mínima vivienda', config: { align: 'center', bold: true, valign: true } },

          { coord: [10, 0], w: 42, h: 1, text: 'VIS: La unidad de vivienda debe tener como mínimo zona social, una alcoba,un baño completo, cocina y zona para ropas', config: { align: 'justify', valign: true, } },
          { coord: [52, 0], w: 2, h: 1, text: VV(VALUES[0]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [54, 0], w: 6, h: 1, text: CV2(CHECKS[0]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1, equalizePages: true })

      if (CHECKS[2] != 2 && CHECKS[1] != undefined) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 4, text: 'Sótanos y semisótanos Art 273° POT', config: { align: 'center', bold: true, valign: true } },

          { coord: [10, 0], w: 42, h: 1, text: 'Presenta medios naturales y/o mecánicos para iluminación y/o ventilación', config: { align: 'justify', valign: true, } },
          { coord: [52, 0], w: 2, h: 1, text: VV(VALUES[4]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 1], w: 42, h: 1, text: 'Altura mínima de 2,40m', config: { align: 'justify', } },
          { coord: [52, 1], w: 2, h: 1, text: VV(VALUES[5]), config: { align: 'center', fill: 'gainsboro' } },

          { coord: [10, 2], w: 42, h: 1, text: 'Sótano o semisótano no se encuentra sobre antejardin', config: { align: 'justify', valign: true, } },
          { coord: [52, 2], w: 2, h: 1, text: VV(VALUES[6]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 3], w: 42, h: 1, text: 'Sótano o semisótano se encuentra construido en el retroceso frontal', config: { align: 'justify', valign: true, } },
          { coord: [52, 3], w: 2, h: 1, text: VV(VALUES[7]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [54, 0], w: 6, h: 4, text: CV2(CHECKS[2]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },
        ],
        [doc.x, doc.y], [60, 4], {})

      if (CHECKS[3] != 2 && CHECKS[1] != undefined) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 6, text: 'Volumetria y altura de la edificación Art 274° a 282° POT', config: { align: 'center', bold: true, valign: true } },

          { coord: [10, 0], w: 30, h: 1, text: 'Altura máxima para uso', config: { align: 'justify', valign: true, } },
          { coord: [40, 0], w: 6, h: 1, text: VV(VALUES[8]), config: { align: 'center', fill: 'gainsboro', valign: true, } },
          { coord: [46, 0], w: 6, h: 1, text: VV(VALUES[9]), config: { align: 'center', fill: 'gainsboro', valign: true, } },
          { coord: [52, 0], w: 2, h: 1, text: ' - ', config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 1], w: 12, h: 1, text: 'Número de frentes del predio', config: { align: 'justify', valign: true, } },
          { coord: [22, 1], w: 2, h: 1, text: VV(VALUES[10]), config: { align: 'center', fill: 'gainsboro', valign: true, } },
          { coord: [24, 1], w: 10, h: 1, text: 'Número de pisos por norma', config: { align: 'justify', valign: true, } },
          { coord: [34, 1], w: 2, h: 1, text: VV(VALUES[11]), config: { align: 'center', fill: 'gainsboro', valign: true, } },
          { coord: [36, 1], w: 14, h: 1, text: 'Nr. pisos por frente según proyecto ', config: { align: 'justify', valign: true, } },
          { coord: [50, 1], w: 2, h: 1, text: VV(VALUES[12]), config: { align: 'center', fill: 'gainsboro', valign: true, } },
          { coord: [52, 1], w: 2, h: 1, text: ' - ', config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 2], w: 42, h: 1, text: 'Volumetria resultante de la correcta aplicación de la norma', config: { align: 'justify', valign: true, } },
          { coord: [52, 2], w: 2, h: 1, text: VV(VALUES[13]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 3], w: 42, h: 2, text: 'Culatas se encuentran frisadas y pintadas o trasladadas con los mismos materiales y acabados de las fachadas / mural artístico', config: { align: 'justify', valign: true, } },
          { coord: [52, 3], w: 2, h: 2, text: VV(VALUES[14]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 5], w: 42, h: 1, text: 'Existe servidumbre de vista con los edificios vecinos y/o edificios del conjunto vecino', config: { align: 'justify', valign: true, } },
          { coord: [52, 5], w: 2, h: 1, text: VV(VALUES[15]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [54, 0], w: 6, h: 6, text: CV2(CHECKS[3]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },
        ],
        [doc.x, doc.y], [60, 6], {})

      if (CHECKS[4] != 2 && CHECKS[1] != undefined) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 10, h: 4, text: 'Equipos edificaciones e instalaciones Art 285° POT', config: { align: 'center', bold: true, valign: true } },

          { coord: [10, 0], w: 42, h: 1, text: 'El edificio tiene más de 5 pisos de altura', config: { align: 'justify', valign: true, } },
          { coord: [52, 0], w: 2, h: 1, text: VV(VALUES[16]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 1], w: 42, h: 1, text: 'Presenta ascensor', config: { align: 'justify', valign: true, } },
          { coord: [52, 1], w: 2, h: 1, text: VV(VALUES[17]), config: { align: 'center', fill: 'gainsboro', } },

          { coord: [10, 2], w: 42, h: 1, text: 'Número de ascensores por unidad construida', config: { align: 'justify', valign: true, } },
          { coord: [52, 2], w: 2, h: 1, text: VV(VALUES[18]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [10, 3], w: 42, h: 1, text: 'Planta eléctrica o de emergencia; Tiene espacio para estos equipos en el sótano', config: { align: 'justify', valign: true, } },
          { coord: [52, 3], w: 2, h: 1, text: VV(VALUES[19]), config: { align: 'center', fill: 'gainsboro', valign: true, } },

          { coord: [54, 0], w: 6, h: 4, text: CV2(CHECKS[4]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },
        ],
        [doc.x, doc.y], [60, 4], {})

      // SESSION B
      VALUES = _GET_STEP_TYPE('session_b', 'value');
      CHECKS = _GET_STEP_TYPE('session_b', 'check');

      if (CHECKS[3] == 1) {
        var value35 = _GET_STEP_TYPE('s35', 'value');
        var sumAreas = Number(value35[2] > 10 ? (VV(VALUES[1], 0) * 0.185) : 0) +
          Number(value35[0] > 1000 ? (VV(VALUES[2], 0) * 0.25) : 0) +
          Number(value35[0] > 1000 ? (VV(VALUES[3],) * 0.15) : 0);
        sumAreas = sumAreas.toFixed(2)

        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 10, h: 8, text: 'Área de cesión Tipo B', config: { align: 'center', bold: true, valign: true } },

            { coord: [10, 0], w: 11, h: 1, text: 'Presenta Zona Comunes', config: { align: 'left', valign: true, } },
            { coord: [21, 0], w: 2, h: 1, text: CV(CHECKS[0]), config: { align: 'center', fill: 'gainsboro', } },

            { coord: [23, 0], w: 13, h: 1, text: 'Unidades de vivienda > 10', config: { align: 'left', valign: true, } },
            { coord: [36, 0], w: 2, h: 1, text: CV(CHECKS[1]), config: { align: 'center', fill: 'gainsboro', } },

            { coord: [38, 0], w: 14, h: 1, text: 'Área construida otros usos > 1000 m2', config: { align: 'left', valign: true, } },
            { coord: [52, 0], w: 2, h: 1, text: CV(CHECKS[2]), config: { align: 'center', fill: 'gainsboro', } },

            { coord: [10, 1], w: 5, h: 3, text: 'Área Base Indice Construcción', config: { align: 'center', valign: true, bold: true, } },
            { coord: [10, 4], w: 5, h: 1, text: VV(value35[0], 0) + ' m2', config: { align: 'center', valign: true, } },
            { coord: [10, 5], w: 5, h: 2, text: 'Unidades de Vivienda', config: { align: 'center', valign: true, bold: true, } },
            { coord: [10, 7], w: 5, h: 1, text: VV(value35[2], 0) + ' unidades', config: { align: 'center', valign: true, } },

            { coord: [15, 1], w: 17, h: 1, text: 'm2 por Actividad', config: { align: 'center', valign: true, bold: true, } },
            { coord: [15, 2], w: 5, h: 1, text: 'Evaluacion', config: { align: 'center', valign: true, bold: true, } },
            { coord: [20, 3], w: 4, h: 1, text: 'Reside.', config: { align: 'center', valign: true, bold: true, } },
            { coord: [24, 4], w: 4, h: 1, text: 'Comcerc.', config: { align: 'center', valign: true, bold: true, } },
            { coord: [28, 5], w: 4, h: 1, text: 'Ind/Dot', config: { align: 'center', valign: true, bold: true, } },

            { coord: [15, 3], w: 5, h: 1, text: 'Área', config: { align: 'center', valign: true, bold: true, } },
            { coord: [20, 3], w: 4, h: 1, text: VV(VALUES[1], 0), config: { align: 'center', valign: true, } },
            { coord: [24, 3], w: 4, h: 1, text: VV(VALUES[2], 0), config: { align: 'center', valign: true, } },
            { coord: [28, 3], w: 4, h: 1, text: VV(VALUES[3], 0), config: { align: 'center', valign: true, } },

            { coord: [15, 4], w: 5, h: 1, text: '%', config: { align: 'center', valign: true, bold: true, } },
            { coord: [20, 4], w: 4, h: 1, text: '18.5%', config: { align: 'center', valign: true, } },
            { coord: [24, 4], w: 4, h: 1, text: '25%', config: { align: 'center', valign: true, } },
            { coord: [28, 4], w: 4, h: 1, text: '15%', config: { align: 'center', valign: true, } },

            { coord: [15, 5], w: 5, h: 1, text: 'Norma', config: { align: 'center', valign: true, bold: true, } },
            { coord: [20, 5], w: 4, h: 1, text: value35[2] > 10 ? (VV(VALUES[1], 0) * 0.185).toFixed(2) : 'NA', config: { align: 'center', valign: true, } },
            { coord: [24, 5], w: 4, h: 1, text: value35[0] > 1000 ? (VV(VALUES[2], 0) * 0.25).toFixed(2) : 'NA', config: { align: 'center', valign: true, } },
            { coord: [28, 5], w: 4, h: 1, text: value35[0] > 1000 ? (VV(VALUES[3], 0) * 0.15).toFixed(2) : 'NA', config: { align: 'center', valign: true, } },

            { coord: [15, 6], w: 5, h: 1, text: 'Proyecto', config: { align: 'center', valign: true, bold: true, } },
            { coord: [20, 6], w: 4, h: 1, text: VV(VALUES[4], 0), config: { align: 'center', valign: true, } },
            { coord: [24, 6], w: 4, h: 1, text: VV(VALUES[5], 0), config: { align: 'center', valign: true, } },
            { coord: [28, 6], w: 4, h: 1, text: VV(VALUES[0], 0), config: { align: 'center', valign: true, } },

            { coord: [15, 7], w: 5, h: 1, text: 'Cumple', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
            { coord: [20, 7], w: 4, h: 1, text: CV(CHECKS[5]), config: { align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [24, 7], w: 4, h: 1, text: CV(CHECKS[6]), config: { align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [28, 7], w: 4, h: 1, text: CV(CHECKS[7]), config: { align: 'center', valign: true, fill: 'gainsboro', } },

            { coord: [32, 1], w: 22, h: 1, text: 'Relación Area ', config: { align: 'center', valign: true, bold: true, } },
            { coord: [32, 2], w: 4, h: 3, text: 'Eval.', config: { align: 'center', valign: true, bold: true, } },
            { coord: [36, 2], w: 6, h: 2, text: 'Libre Minima', config: { align: 'center', valign: true, bold: true, } },
            { coord: [42, 2], w: 6, h: 2, text: 'Construida Maxima', config: { align: 'center', valign: true, bold: true, } },
            { coord: [48, 2], w: 6, h: 2, text: 'Parqueo adicional complemento', config: { align: 'center', valign: true, bold: true, } },

            { coord: [36, 4], w: 3, h: 1, text: 'Área', config: { align: 'center', valign: true, bold: true, } },
            { coord: [39, 4], w: 3, h: 1, text: '%', config: { align: 'center', valign: true, bold: true, } },
            { coord: [42, 4], w: 3, h: 1, text: 'Área', config: { align: 'center', valign: true, bold: true, } },
            { coord: [45, 4], w: 3, h: 1, text: '%', config: { align: 'center', valign: true, bold: true, } },
            { coord: [48, 4], w: 3, h: 1, text: 'Área', config: { align: 'center', valign: true, bold: true, } },
            { coord: [51, 4], w: 3, h: 1, text: '%', config: { align: 'center', valign: true, bold: true, } },

            { coord: [32, 5], w: 4, h: 1, text: 'Norma', config: { align: 'center', valign: true, bold: true, } },
            { coord: [36, 5], w: 3, h: 1, text: (sumAreas * 0.5).toFixed(2), config: { align: 'center', valign: true, } },
            { coord: [39, 5], w: 3, h: 1, text: '50%.', config: { align: 'center', valign: true, } },
            { coord: [42, 5], w: 3, h: 1, text: (sumAreas * 0.15).toFixed(2), config: { align: 'center', valign: true, } },
            { coord: [45, 5], w: 3, h: 1, text: '15%.', config: { align: 'center', valign: true, } },
            { coord: [48, 5], w: 3, h: 1, text: (sumAreas * 0.35).toFixed(2), config: { align: 'center', valign: true, } },
            { coord: [51, 5], w: 3, h: 1, text: '35%.', config: { align: 'center', valign: true, } },

            { coord: [32, 6], w: 4, h: 1, text: 'Proyecto', config: { align: 'center', valign: true, bold: true, } },
            { coord: [36, 6], w: 3, h: 1, text: VV(VALUES[6], 0), config: { align: 'center', valign: true, } },
            { coord: [39, 6], w: 3, h: 1, text: (VV(VALUES[6], 0) / sumAreas * 100).toFixed(1) + '%.', config: { align: 'center', valign: true, } },
            { coord: [42, 6], w: 3, h: 1, text: VV(VALUES[7], 0), config: { align: 'center', valign: true, } },
            { coord: [45, 6], w: 3, h: 1, text: (VV(VALUES[7], 0) / sumAreas * 100).toFixed(1) + '%.', config: { align: 'center', valign: true, } },
            { coord: [48, 6], w: 3, h: 1, text: VV(VALUES[8], 0), config: { align: 'center', valign: true, } },
            { coord: [51, 6], w: 3, h: 1, text: (VV(VALUES[8], 0) / sumAreas * 100).toFixed(1) + '%.', config: { align: 'center', valign: true, } },

            { coord: [32, 7], w: 4, h: 1, text: 'Cumple', config: { align: 'center', valign: true, bold: true, fill: 'gainsboro', } },
            { coord: [36, 7], w: 6, h: 1, text: CV(CHECKS[8]), config: { align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [42, 7], w: 6, h: 1, text: CV(CHECKS[9]), config: { align: 'center', valign: true, fill: 'gainsboro', } },
            { coord: [48, 7], w: 6, h: 1, text: CV(CHECKS[4]), config: { align: 'center', valign: true, fill: 'gainsboro', } },

            { coord: [54, 0], w: 6, h: 8, text: CV4(CHECKS[3]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },

          ],
          [doc.x, doc.y], [60, 8], {})

      }


      doc.text('\n');
    }

    // PARKINGS 1
    let _st = fun_2.estrato ? fun_2.estrato - 1 : 0;
    VALUES = _GET_STEP_TYPE('s35', 'value');
    CHECKS = _GET_STEP_TYPE('s35', 'check');
    if (ALLOW_REVIEWS[1] == 1) {
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 25, h: 3, text: 'PARQUEADEROS ASOCIADOS AL USO ART. 357° POT', config: { align: 'left', bold: true, fill: 'silver', valign: true } },

          { coord: [26, 0], w: 9, h: 1, text: 'Área Generadora', config: { align: 'left', valign: true, } },
          { coord: [35, 0], w: 6, h: 1, text: VV(VALUES[0]) + ' m2', config: { align: 'center', fill: 'gainsboro', bold: true } },

          { coord: [26, 1], w: 12, h: 1, text: 'N° de viviendas', config: { align: 'left', valign: true, } },
          { coord: [38, 1], w: 3, h: 1, text: VV(VALUES[2]), config: { align: 'center', fill: 'gainsboro', bold: true } },

          { coord: [26, 2], w: 12, h: 1, text: 'Estrato', config: { align: 'left', valign: true, } },
          { coord: [38, 2], w: 3, h: 1, text: _st + 1, config: { align: 'center', fill: 'gainsboro', bold: true } },

          { coord: [42, 0], w: 8, h: 3, text: 'Forma de Provisión de cupos de Parqueadero', config: { align: 'center', bold: true, valign: true } },

          { coord: [50, 0], w: 10, h: 1, text: 'En el sitio', config: { align: 'justify', valign: true, } },
          { coord: [60, 0], w: 2, h: 1, text: VV(VALUES[3]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true } },

          { coord: [50, 1], w: 8, h: 1, text: 'Compensación', config: { align: 'justify', valign: true, } },
          { coord: [58, 1], w: 2, h: 1, text: VV(VALUES[4]), config: { align: 'center', valign: true, fill: 'lightgray', bold: true } },
          { coord: [60, 1], w: 2, h: 1, text: CV(CHECKS[7]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true } },

          { coord: [50, 2], w: 8, h: 1, text: 'Gestión asociada', config: { align: 'justify', valign: true, } },
          { coord: [58, 2], w: 2, h: 1, text: VV(VALUES[5]), config: { align: 'center', valign: true, fill: 'lightgray', bold: true } },
          { coord: [60, 2], w: 2, h: 1, text: CV(VALUES[8]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true } },


        ],
        [doc.x, doc.y], [62, 3], {})

      doc.text('\n');



      let look_for_ppv = _GET_CHILD_35_BY_TYPE('P.P - V');

      let basic_ppv = ["1x100 m2", "1x100 m2", "1x100 m2", "1x70 m2", "1x70 m2", "1x70 m2"];
      let parkings_relations = {
        r: ["1x7 viv", "1x5 viv", "1x3 viv", "1x1 viv", "1.5x1 viv", "2x1 viv"],
        v: ["1x12 viv", "1x12 viv", "1x8 viv", "1x6 viv", "1x5 viv", "1x4 viv"],
        m: ["3x7 R", "3x5 R", "3x3 R", "3x3 V", "1x5 V", "1x4 V"],
        b: ["1x12 viv", "1x12 viv", "1x8 viv", "1x6 viv", "1x5 viv", "1x4 viv"],
        p: true ? look_for_ppv.name : basic_ppv[_st],
      }

      if (record_arc_35_parkings.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'Número de parqueaderos y dimensiones de las celdas de estacinamiento Art. 358° POT', config: { align: 'center', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [60, 1],
        {})

      if (record_arc_35_parkings.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 18, h: 1, text: 'Tipo de Parqueadero', config: { align: 'center', bold: true, } },
          { coord: [18, 0], w: 6, h: 1, text: 'Residentes R', config: { align: 'center', bold: true, } },
          { coord: [24, 0], w: 6, h: 1, text: 'Visitantes V', config: { align: 'center', bold: true, } },
          { coord: [30, 0], w: 6, h: 1, text: 'PVV', config: { align: 'center', bold: true, } },
          { coord: [36, 0], w: 6, h: 1, text: 'M. Reducida', config: { align: 'center', bold: true, } },
          { coord: [42, 0], w: 6, h: 1, text: 'Carga', config: { align: 'center', bold: true, } },
          { coord: [48, 0], w: 6, h: 1, text: 'Motos M', config: { align: 'center', bold: true, } },
          { coord: [54, 0], w: 6, h: 1, text: 'Bicicletas B', config: { align: 'center', bold: true, } },
        ],
        [doc.x, doc.y],
        [60, 1],
        {})

      if (record_arc_35_parkings.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 15, h: 2, text: 'Relación estrato', config: { align: 'center', valign: true, bold: true, } },
          { coord: [15, 0], w: 3, h: 2, text: 'U. Uso', config: { align: 'center', bold: true, valign: true, } },

          { coord: [18, 0], w: 6, h: 1, text: parkings_relations.r[_st], config: { align: 'center', bold: true, } },
          { coord: [24, 0], w: 6, h: 1, text: parkings_relations.v[_st], config: { align: 'center', bold: true, } },
          { coord: [30, 0], w: 6, h: 1, text: parkings_relations.p, config: { align: 'center', bold: true, } },
          { coord: [36, 0], w: 6, h: 1, text: '2%', config: { align: 'center', bold: true, } },
          { coord: [42, 0], w: 6, h: 1, text: '1x400 m2', config: { align: 'center', bold: true, } },
          { coord: [48, 0], w: 6, h: 1, text: parkings_relations.r[_st], config: { align: 'center', bold: true, } },
          { coord: [54, 0], w: 6, h: 1, text: parkings_relations.b[_st], config: { align: 'center', bold: true, } },

          { coord: [18, 1], w: 2, h: 1, text: 'N', config: { align: 'center', bold: true, } },
          { coord: [20, 1], w: 2, h: 1, text: 'P', config: { align: 'center', bold: true, } },
          { coord: [22, 1], w: 2, h: 1, text: 'C', config: { align: 'center', bold: true, fill: 'gainsboro', } },

          { coord: [24, 1], w: 2, h: 1, text: 'N', config: { align: 'center', bold: true, } },
          { coord: [26, 1], w: 2, h: 1, text: 'P', config: { align: 'center', bold: true, } },
          { coord: [28, 1], w: 2, h: 1, text: 'C', config: { align: 'center', bold: true, fill: 'gainsboro', } },

          { coord: [30, 1], w: 2, h: 1, text: 'N', config: { align: 'center', bold: true, } },
          { coord: [32, 1], w: 2, h: 1, text: 'P', config: { align: 'center', bold: true, } },
          { coord: [34, 1], w: 2, h: 1, text: 'C', config: { align: 'center', bold: true, fill: 'gainsboro', } },

          { coord: [36, 1], w: 2, h: 1, text: 'N', config: { align: 'center', bold: true, } },
          { coord: [38, 1], w: 2, h: 1, text: 'P', config: { align: 'center', bold: true, } },
          { coord: [40, 1], w: 2, h: 1, text: 'C', config: { align: 'center', bold: true, fill: 'gainsboro', } },

          { coord: [42, 1], w: 2, h: 1, text: 'N', config: { align: 'center', bold: true, } },
          { coord: [44, 1], w: 2, h: 1, text: 'P', config: { align: 'center', bold: true, } },
          { coord: [46, 1], w: 2, h: 1, text: 'C', config: { align: 'center', bold: true, fill: 'gainsboro', } },

          { coord: [48, 1], w: 2, h: 1, text: 'N', config: { align: 'center', bold: true, } },
          { coord: [50, 1], w: 2, h: 1, text: 'P', config: { align: 'center', bold: true, } },
          { coord: [52, 1], w: 2, h: 1, text: 'C', config: { align: 'center', bold: true, fill: 'gainsboro', } },

          { coord: [54, 1], w: 2, h: 1, text: 'N', config: { align: 'center', bold: true, } },
          { coord: [56, 1], w: 2, h: 1, text: 'P', config: { align: 'center', bold: true, } },
          { coord: [58, 1], w: 2, h: 1, text: 'C', config: { align: 'center', bold: true, fill: 'gainsboro', } },
        ],
        [doc.x, doc.y],
        [60, 2],
        {})



      let tableParking = [];
      record_arc_35_parkings.map(parking => {
        let pr = {};
        pr.n = 0;
        pr.p = 0;
        pr.e = null;
        let pv = {};
        pv.n = 0;
        pv.p = 0;
        pv.e = null;
        let pp = {};
        pp.n = 0;
        pp.p = 0;
        pp.e = null;
        let pm = {};
        pm.n = 0;
        pm.p = 0;
        pm.e = null;
        let pb = {};
        pb.n = 0;
        pb.p = 0;
        pb.e = null;
        let pd = {};
        pd.n = 0;
        pd.p = 0;
        pd.e = null;
        let pc = {};
        pc.n = 0;
        pc.p = 0;
        pc.e = null;

        if (parking.type.includes('Residente')) {
          pr.n = parking.norm != null ? parking.norm : 0;
          pr.p = parking.project != null ? parking.project : 0;
          pr.e = parking.check != null ? parking.check : 0;
        }
        if (parking.type.includes('Visitante') || parking.type.includes('(V)')) {
          pv.n = parking.norm != null ? parking.norm : 0;
          pv.p = parking.project != null ? parking.project : 0;
          pv.e = parking.check != null ? parking.check : 0;
        }
        if (parking.type.includes('Motocicleta')) {
          pm.n = parking.norm != null ? parking.norm : 0;
          pm.p = parking.project != null ? parking.project : 0;
          pm.e = parking.check != null ? parking.check : 0;
        }
        if (parking.type.includes('Bicicleta')) {
          pb.n = parking.norm != null ? parking.norm : 0;
          pb.p = parking.project != null ? parking.project : 0;
          pb.e = parking.check != null ? parking.check : 0;
        }
        if (parking.type.includes('P.P - V') || parking.type.includes('Estrato')) {
          pp.n = parking.norm != null ? parking.norm : 0;
          pp.p = parking.project != null ? parking.project : 0;
          pp.e = parking.check != null ? parking.check : 0;
        }
        if (parking.type.includes('M. Reducida')) {
          pd.n = parking.norm != null ? parking.norm : 0;
          pd.p = parking.project != null ? parking.project : 0;
          pd.e = parking.check != null ? parking.check : 0;
        }
        if (parking.type.includes('Carga')) {
          pc.n = parking.norm != null ? parking.norm : 0;
          pc.p = parking.project != null ? parking.project : 0;
          pc.e = parking.check != null ? parking.check : 0;
        }

        let isRepeated = tableParking.some(p => p.use == parking.use);
        if (isRepeated) {
          for (let i = 0; i < tableParking.length; i++) {
            const row = tableParking[i];
            if (row.use == parking.use) {
              tableParking[i].pp.n += Number((pp.n));
              tableParking[i].pp.p += Number((pp.p));
              tableParking[i].pb.n += Number((pb.n));
              tableParking[i].pb.p += Number((pb.p));
              tableParking[i].pm.n += Number((pm.n));
              tableParking[i].pm.p += Number((pm.p));
              tableParking[i].pr.n += Number((pr.n));
              tableParking[i].pr.p += Number((pr.p));
              tableParking[i].pv.n += Number((pv.n));
              tableParking[i].pv.p += Number((pv.p));
              tableParking[i].pd.n += Number((pd.n));
              tableParking[i].pd.p += Number((pd.p));
              tableParking[i].pc.n += Number((pc.n));
              tableParking[i].pc.p += Number((pc.p));

              if (parking.type.includes('Residente')) tableParking[i].pr.e = parking.check != null ? parking.check : 0;
              if (parking.type.includes('Visitante') || parking.type.includes('(V)')) tableParking[i].pv.e = parking.check != null ? parking.check : 0;
              if (parking.type.includes('Motocicleta')) tableParking[i].pm.e = parking.check != null ? parking.check : 0;
              if (parking.type.includes('Bicicleta')) tableParking[i].pb.e = parking.check != null ? parking.check : 0;
              if (parking.type.includes('P.P') || parking.type.includes('Estrato')) tableParking[i].pp.e = parking.check != null ? parking.check : 0;
              if (parking.type.includes('M. Reducida')) tableParking[i].pd.e = parking.check != null ? parking.check : 0;
              if (parking.type.includes('Carga')) tableParking[i].pc.e = parking.check != null ? parking.check : 0;
              break;
            }
          }
        } else {
          tableParking.push({
            use: parking.use,
            pos: parking.pos,
            pp: pp,
            pb: pb,
            pm: pm,
            pr: pr,
            pv: pv,
            pd: pd,
            pc: pc,
          })

        }
      })
      if (record_arc_35_parkings.length > 0) tableParking.map(parking => pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 15, h: 1, text: parking.use, config: { align: 'center', } },
          { coord: [15, 0], w: 3, h: 1, text: parking.pos, config: { align: 'center', } },

          { coord: [18, 0], w: 2, h: 1, text: parking.pr.n > 0 ? parking.pr.n : '', config: { align: 'center', } },
          { coord: [20, 0], w: 2, h: 1, text: parking.pr.p > 0 ? parking.pr.p : '', config: { align: 'center', } },
          { coord: [22, 0], w: 2, h: 1, text: CV(parking.pr.e), config: { align: 'center', fill: 'gainsboro', } },

          { coord: [24, 0], w: 2, h: 1, text: parking.pv.n > 0 ? parking.pv.n : '', config: { align: 'center', } },
          { coord: [26, 0], w: 2, h: 1, text: parking.pv.p > 0 ? parking.pv.p : '', config: { align: 'center', } },
          { coord: [28, 0], w: 2, h: 1, text: CV(parking.pv.e), config: { align: 'center', fill: 'gainsboro', } },

          { coord: [30, 0], w: 2, h: 1, text: parking.pp.n > 0 ? parking.pp.n : '', config: { align: 'center', } },
          { coord: [32, 0], w: 2, h: 1, text: parking.pp.p > 0 ? parking.pp.p : '', config: { align: 'center', } },
          { coord: [34, 0], w: 2, h: 1, text: CV(parking.pp.e), config: { align: 'center', fill: 'gainsboro', } },

          { coord: [36, 0], w: 2, h: 1, text: parking.pd.n > 0 ? parking.pd.n : '', config: { align: 'center', } },
          { coord: [38, 0], w: 2, h: 1, text: parking.pd.p > 0 ? parking.pd.p : '', config: { align: 'center', } },
          { coord: [40, 0], w: 2, h: 1, text: CV(parking.pd.e), config: { align: 'center', fill: 'gainsboro', } },

          { coord: [42, 0], w: 2, h: 1, text: parking.pc.n > 0 ? parking.pc.n : '', config: { align: 'center', } },
          { coord: [44, 0], w: 2, h: 1, text: parking.pc.p > 0 ? parking.pc.p : '', config: { align: 'center', } },
          { coord: [46, 0], w: 2, h: 1, text: CV(parking.pc.e), config: { align: 'center', fill: 'gainsboro', } },

          { coord: [48, 0], w: 2, h: 1, text: parking.pm.n > 0 ? parking.pm.n : '', config: { align: 'center', } },
          { coord: [50, 0], w: 2, h: 1, text: parking.pm.p > 0 ? parking.pm.p : '', config: { align: 'center', } },
          { coord: [52, 0], w: 2, h: 1, text: CV(parking.pm.e), config: { align: 'center', fill: 'gainsboro', } },

          { coord: [54, 0], w: 2, h: 1, text: parking.pb.n > 0 ? parking.pb.n : '', config: { align: 'center', } },
          { coord: [56, 0], w: 2, h: 1, text: parking.pb.p > 0 ? parking.pb.p : '', config: { align: 'center', } },
          { coord: [58, 0], w: 2, h: 1, text: CV(parking.pb.e), config: { align: 'center', fill: 'gainsboro', } },
        ],
        [doc.x, doc.y], [60, 1], {}))

      // PARKINGS 2
      if (record_arc_35_parkings.length > 0 && record_arc_35_locations.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'Dimensión (m) y cantidad de cupos de parqueaderos de dimensiones libres de estructura Art. 360° POT', config: { align: 'center', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [60, 1],
        {})
      if (record_arc_35_parkings.length > 0 && record_arc_35_locations.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 18, h: 2, text: 'Localización', config: { align: 'center', valign: true, bold: true } },

          { coord: [18, 0], w: 24, h: 1, text: 'Auto-camioneta en plano', config: { align: 'center', bold: true } },
          { coord: [18, 1], w: 6, h: 1, text: '2,20*4,50', config: { align: 'center', bold: true } },
          { coord: [24, 1], w: 6, h: 1, text: '2,50*5,00', config: { align: 'center', bold: true } },
          { coord: [30, 1], w: 6, h: 1, text: '3,30*5,00', config: { align: 'center', bold: true } },
          { coord: [36, 1], w: 6, h: 1, text: 'Total', config: { align: 'center', bold: true } },

          { coord: [42, 0], w: 6, h: 1, text: 'Carga', config: { align: 'center', bold: true } },
          { coord: [42, 1], w: 6, h: 1, text: '3,50*7,00', config: { align: 'center', bold: true } },

          { coord: [48, 0], w: 6, h: 1, text: 'Motos', config: { align: 'center', bold: true } },
          { coord: [48, 1], w: 6, h: 1, text: '1,50*7,00', config: { align: 'center', bold: true } },

          { coord: [54, 0], w: 6, h: 1, text: 'Bicicleas', config: { align: 'center', bold: true } },
          { coord: [54, 1], w: 6, h: 1, text: '0,50*2,50', config: { align: 'center', bold: true } },
        ],
        [doc.x, doc.y],
        [60, 2],
        {})
      let locations = [];
      let loc_totale = {
        total: 0, a1: 0, a2: 0, a3: 0, at: 0, c: 0, m: 0, b: 0,
        totalp: 0, a1p: 0, a2p: 0, a3p: 0, atp: 0, cp: 0, mp: 0, bp: 0,
      }

      record_arc_35_locations.map(loc => {
        let dim = loc.diensions ? loc.diensions.split(',') : [0, 0, 0, 0, 0, 0];
        let total = dim.reduce((p, n) => Number(p) + Number(n));
        let totala = Number(dim[0]) + Number(dim[1]) + Number(dim[2]);
        let newLoc = {
          floor: loc.floor,
          total: total,
          a1: Number(dim[0]),
          a2: Number(dim[1]),
          a3: Number(dim[2]),
          at: totala,
          c: Number(dim[3]),
          m: Number(dim[4]),
          b: Number(dim[5]),
        }
        locations.push(newLoc);

        loc_totale.total += newLoc.total;
        loc_totale.a1 += newLoc.a1;
        loc_totale.a2 += newLoc.a2;
        loc_totale.a3 += newLoc.a3;
        loc_totale.at += newLoc.at;
        loc_totale.c += newLoc.c;
        loc_totale.m += newLoc.m;
        loc_totale.b += newLoc.b;

        loc_totale.totalp = (loc_totale.total / loc_totale.total * 100).toFixed(0) + '%';
        loc_totale.a1p = (loc_totale.a1 / loc_totale.at * 100).toFixed(1) + '%';
        loc_totale.a2p = (loc_totale.a2 / loc_totale.at * 100).toFixed(1) + '%';
        loc_totale.a3p = (loc_totale.a3 / loc_totale.at * 100).toFixed(1) + '%';
        loc_totale.atp = (loc_totale.at / loc_totale.at * 100).toFixed(0) + '%';
        loc_totale.cp = (loc_totale.c / loc_totale.total * 100).toFixed(1) + '%';
        loc_totale.mp = (loc_totale.m / loc_totale.total * 100).toFixed(1) + '%';
        loc_totale.bp = (loc_totale.b / loc_totale.total * 100).toFixed(1) + '%';
      })

      let sumtotala = 0;
      locations.map(loc => sumtotala += (loc.a1 + loc.a2 + loc.a3));
      if (sumtotala == 0) sumtotala = 1;

      locations.map(loc => {
        let total = loc_totale.total;
        let totala = Number(loc.a1) + Number(loc.a2) + Number(loc.a3);
        loc.totalp = (loc.total / total * 100).toFixed(1) + '%';
        loc.a1p = (loc.a1 / totala * 100).toFixed(1) + '%';
        loc.a2p = (loc.a2 / totala * 100).toFixed(1) + '%';
        loc.a3p = (loc.a3 / totala * 100).toFixed(1) + '%';
        loc.atp = (totala / sumtotala * 100).toFixed(1) + '%';
        loc.cp = (loc.c / total * 100).toFixed(1) + '%';
        loc.mp = (loc.m / total * 100).toFixed(1) + '%';
        loc.bp = (loc.b / total * 100).toFixed(1) + '%';
      })

      locations.sort(function (a, b) {
        let A = a.floor ? a.floor.split(' ') : '';
        let B = b.floor ? b.floor.split(' ') : '';
        let strPartA = A[0] ? A[0].toLowerCase() : '';
        let strPartB = B[0] ? B[0].toLowerCase() : '';
        let nunPartA = A[1] ? A[1] : Infinity;
        let nunPartB = B[1] ? B[1] : Infinity;

        let buildingPriority = {
          'terraza': 4,
          'cubierta': 4,
          'techo': 4,
          'piso': 3,
          'nivel': 3,
          'planta': 3,
          'semisotano': 2,
          'semisótano': 2,
          'sotano': 1,
          'sótano': 1,
        }

        let firstCheck = (buildingPriority[strPartB] ? buildingPriority[strPartB] : 0) - (buildingPriority[strPartA] ? buildingPriority[strPartA] : 0);
        if (firstCheck != 0) return firstCheck
        else {
          if (strPartA[0] && strPartA[0].toLowerCase() == 's') {
            if (nunPartA < nunPartB) { return -1; }
            if (nunPartA > nunPartB) { return 1; }
          } else {
            if (nunPartA < nunPartB) { return 1; }
            if (nunPartA > nunPartB) { return -1; }
          }
        }

        return 0;
      })


      if (record_arc_35_parkings.length > 0 && record_arc_35_locations.length > 0) locations.map(loc => pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 18, h: 1, text: loc.floor, config: { align: 'center', } },

          { coord: [18, 0], w: 3, h: 1, text: loc.a1, config: { align: 'center', } },
          { coord: [21, 0], w: 3, h: 1, text: loc.a1p, config: { align: 'center', } },

          { coord: [24, 0], w: 3, h: 1, text: loc.a2, config: { align: 'center', } },
          { coord: [27, 0], w: 3, h: 1, text: loc.a2p, config: { align: 'center', } },

          { coord: [30, 0], w: 3, h: 1, text: loc.a3, config: { align: 'center', } },
          { coord: [33, 0], w: 3, h: 1, text: loc.a3p, config: { align: 'center', } },

          { coord: [36, 0], w: 3, h: 1, text: loc.at, config: { align: 'center', } },
          { coord: [39, 0], w: 3, h: 1, text: loc.atp, config: { align: 'center', } },

          { coord: [42, 0], w: 3, h: 1, text: loc.c, config: { align: 'center', } },
          { coord: [45, 0], w: 3, h: 1, text: loc.cp, config: { align: 'center', } },

          { coord: [48, 0], w: 3, h: 1, text: loc.m, config: { align: 'center', } },
          { coord: [51, 0], w: 3, h: 1, text: loc.mp, config: { align: 'center', } },

          { coord: [54, 0], w: 3, h: 1, text: loc.b, config: { align: 'center', } },
          { coord: [57, 0], w: 3, h: 1, text: loc.bp, config: { align: 'center', } },

        ],
        [doc.x, doc.y],
        [60, 1],
        {}))

      if (record_arc_35_parkings.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 18, h: 1, text: 'TOTALES: ', config: { align: 'right', bold: true, } },

          { coord: [18, 0], w: 3, h: 1, text: loc_totale.a1, config: { align: 'center', bold: true, } },
          { coord: [21, 0], w: 3, h: 1, text: loc_totale.a1p, config: { align: 'center', bold: true, } },

          { coord: [24, 0], w: 3, h: 1, text: loc_totale.a2, config: { align: 'center', bold: true, } },
          { coord: [27, 0], w: 3, h: 1, text: loc_totale.a2p, config: { align: 'center', bold: true, } },

          { coord: [30, 0], w: 3, h: 1, text: loc_totale.a3, config: { align: 'center', bold: true, } },
          { coord: [33, 0], w: 3, h: 1, text: loc_totale.a3p, config: { align: 'center', bold: true, } },

          { coord: [36, 0], w: 3, h: 1, text: loc_totale.at, config: { align: 'center', bold: true, } },
          { coord: [39, 0], w: 3, h: 1, text: loc_totale.atp, config: { align: 'center', bold: true, } },

          { coord: [42, 0], w: 3, h: 1, text: loc_totale.c, config: { align: 'center', bold: true, } },
          { coord: [45, 0], w: 3, h: 1, text: loc_totale.cp, config: { align: 'center', bold: true, } },

          { coord: [48, 0], w: 3, h: 1, text: loc_totale.m, config: { align: 'center', bold: true, } },
          { coord: [51, 0], w: 3, h: 1, text: loc_totale.mp, config: { align: 'center', bold: true, } },

          { coord: [54, 0], w: 3, h: 1, text: loc_totale.b, config: { align: 'center', bold: true, } },
          { coord: [57, 0], w: 3, h: 1, text: loc_totale.bp, config: { align: 'center', bold: true, } },

        ],
        [doc.x, doc.y],
        [60, 1],
        {})

      doc.text('\n');

      // REVIEW 3

      let line_height = [
        CHECKS[0] == 2 ? 0 : 1,
        CHECKS[1] == 2 ? 0 : 1,
        CHECKS[2] == 2 ? 0 : 1,
        CHECKS[3] == 2 ? 0 : 1,
        CHECKS[4] == 2 ? 0 : 1,
        CHECKS[5] == 2 ? 0 : 1,
        CHECKS[6] == 2 ? 0 : 1,
      ];
      let ht = line_height.filter(lh => lh).length;
      let hr = (_i) => line_height.filter((lh, i) => lh && i < _i).length

      let line_height2 = [
        VALUES[10] == 'NA' ? 0 : 1,
        VALUES[11] == 'NA' ? 0 : 1,
        VALUES[12] == 'NA' ? 0 : 1,
        VALUES[13] == 'NA' ? 0 : 1,
        VALUES[14] == 'NA' ? 0 : 1,
        VALUES[15] == 'NA' ? 0 : 1,
        VALUES[16] == 'NA' ? 0 : 1,
        VALUES[17] == 'NA' ? 0 : 1,
      ];
      let ht2 = line_height2.filter(lh => lh).length;
      let hr2 = (_i) => line_height2.filter((lh, i) => lh && i < _i).length

      let hf = ht > ht2 ? ht : ht2;

      pdfSupport.table(doc,
        [
          { coord: [31, 0], w: 6, h: ht2, text: 'Rampas', config: { align: 'center', bold: true, valign: true } },

          { coord: [37, hr2(0)], w: 22, h: 1, text: 'Acceso a parqueaderos >= 5,00 / 3,00m en ingreso nivel', config: { align: 'justify', valign: true, ygap: true, ignore: VALUES[10] == 'NA', } },
          { coord: [59, hr2(0)], w: 2, h: 1, text: VV(VALUES[10]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[10] == 'NA', } },

          { coord: [37, hr2(1)], w: 22, h: 1, text: 'Vias internas del parqueadero 5,00m', config: { align: 'justify', valign: true, ygap: true, ignore: VALUES[11] == 'NA', } },
          { coord: [59, hr2(1)], w: 2, h: 1, text: VV(VALUES[11]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[11] == 'NA', } },

          { coord: [37, hr2(2)], w: 22, h: 1, text: 'Ancho de la rampa mínimo 5,00 y máximo 7,00m', config: { align: 'justify', valign: true, ygap: true, ignore: VALUES[12] == 'NA', } },
          { coord: [59, hr2(2)], w: 2, h: 1, text: VV(VALUES[12]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[12] == 'NA', } },

          { coord: [37, hr2(3)], w: 22, h: 1, text: 'Pendiente de rampa máximo 18%', config: { align: 'justify', valign: true, ygap: true, ignore: VALUES[13] == 'NA', } },
          { coord: [59, hr2(3)], w: 2, h: 1, text: VV(VALUES[13]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[13] == 'NA', } },

          { coord: [37, hr2(4)], w: 22, h: 1, text: 'Radio de giro interior de la rampa igual a 5,00m', config: { align: 'left', valign: true, ygap: true, ignore: VALUES[14] == 'NA', } },
          { coord: [59, hr2(4)], w: 2, h: 1, text: VV(VALUES[14]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[14] == 'NA', } },

          { coord: [37, hr2(5)], w: 22, h: 1, text: 'Rampa dentro del paramento de la construcción', config: { align: 'left', valign: true, ygap: true, ignore: VALUES[15] == 'NA', } },
          { coord: [59, hr2(5)], w: 2, h: 1, text: VV(VALUES[15]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[15] == 'NA', } },

          { coord: [37, hr2(6)], w: 22, h: 1, text: 'Rampa despues del antejardin', config: { align: 'left', valign: true, ygap: true, ignore: VALUES[16] == 'NA', } },
          { coord: [59, hr2(6)], w: 2, h: 1, text: VV(VALUES[16]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[16] == 'NA', } },

          { coord: [37, hr2(7)], w: 22, h: 1, text: 'Rampa en aislamiento lateral o posterior h <= 1,40m', config: { align: 'left', valign: true, ygap: true, ignore: VALUES[17] == 'NA', } },
          { coord: [59, hr2(7)], w: 2, h: 1, text: VV(VALUES[17]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: VALUES[17] == 'NA', } },


          { coord: [0, hr(0)], w: 24, h: 1, text: 'Se localizan dentro del paramento de construccion', config: { align: 'left', valign: true, ygap: true, ignore: CHECKS[0] == 2, } },
          { coord: [24, hr(0)], w: 6, h: 1, text: CV2(CHECKS[0]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: CHECKS[0] == 2, } },

          { coord: [0, hr(1)], w: 24, h: 1, text: 'Separados fisicamente de zona de actividad: C, D e I', config: { align: 'left', valign: true, ygap: true, ignore: CHECKS[1] == 2, } },
          { coord: [24, hr(1)], w: 6, h: 1, text: CV2(CHECKS[1]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: CHECKS[1] == 2, } },

          { coord: [0, hr(2)], w: 24, h: 1, text: 'Parqueo movilidad reducida (PMR) 2% del total de cupos', config: { align: 'left', valign: true, ygap: true, ignore: CHECKS[2] == 2, } },
          { coord: [24, hr(2)], w: 6, h: 1, text: CV2(CHECKS[2]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: CHECKS[2] == 2, } },

          { coord: [0, hr(3)], w: 24, h: 1, text: 'PMR esta señalizado y presenta dimensiones normativas', config: { align: 'left', valign: true, ygap: true, ignore: CHECKS[3] == 2, } },
          { coord: [24, hr(3)], w: 6, h: 1, text: CV2(CHECKS[3]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: CHECKS[3] == 2, } },

          { coord: [0, hr(4)], w: 24, h: 1, text: 'Parqueo sin servidumbre (Excepto vivienda estrato 6)', config: { align: 'left', valign: true, ygap: true, ignore: CHECKS[4] == 2, } },
          { coord: [24, hr(4)], w: 6, h: 1, text: CV2(CHECKS[4]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: CHECKS[4] == 2, } },

          { coord: [0, hr(5)], w: 24, h: 1, text: 'Parqueo indentificado como residente o visitante', config: { align: 'left', valign: true, ygap: true, ignore: CHECKS[5] == 2, } },
          { coord: [24, hr(5)], w: 6, h: 1, text: CV2(CHECKS[5]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: CHECKS[5] == 2, } },

          { coord: [0, hr(6)], w: 24, h: 1, text: 'Uso de equipos mecánico o hidraúlico plan de movilidad', config: { align: 'left', valign: true, ygap: true, ignore: CHECKS[6] == 2, } },
          { coord: [24, hr(6)], w: 6, h: 1, text: CV2(CHECKS[6]), config: { align: 'center', fill: 'gainsboro', bold: true, ygap: true, ignore: CHECKS[6] == 2, } },
        ],
        [doc.x, doc.y], [61, hf], { equalizePages: true, })

      doc.text('\n');

      let CHECK_NA = [
        VALUES[6],
        VALUES[7],
        VALUES[8],
        VALUES[9],
      ]

      line_height = [
        VALUES[6] == 'NA' && VALUES[8] == 'NA' ? 0 : 1,
        VALUES[7] == 'NA' && VALUES[9] == 'NA' ? 0 : 1,
      ];
      ht = line_height.filter(lh => lh).length

      if (CHECK_NA.some(c => c == 'SI' || c == 'NO')) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 12, h: ht, text: 'Excepciones exigencia cupos de parqueadero', config: { align: 'center', bold: true, valign: true } },

          { coord: [12, 0], w: 22, h: 1, text: 'Bien de interes cultural', config: { align: 'justify', valign: true, ignore: VALUES[6] == 'NA', } },
          { coord: [34, 0], w: 2, h: 1, text: VV(VALUES[6]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ignore: VALUES[6] == 'NA', } },

          { coord: [12, ht - 1], w: 22, h: 1, text: 'Predio uso residencial rodeado de vias peatonales', config: { align: 'justify', valign: true, ignore: VALUES[7] == 'NA', } },
          { coord: [34, ht - 1], w: 2, h: 1, text: VV(VALUES[7]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ignore: VALUES[7] == 'NA', } },


          { coord: [36, 0], w: 22, h: 1, text: 'VIP y VIS unifamiliar en predio individual estratos 1 y 2', config: { align: 'justify', valign: true, ignore: VALUES[8] == 'NA', } },
          { coord: [58, 0], w: 2, h: 1, text: VV(VALUES[8]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ignore: VALUES[8] == 'NA', } },

          { coord: [36, ht - 1], w: 22, h: 1, text: 'Acto de reconocimiento y licencia de modificación', config: { align: 'justify', valign: true, ignore: VALUES[9] == 'NA', } },
          { coord: [58, ht - 1], w: 2, h: 1, text: VV(VALUES[9]), config: { align: 'center', valign: true, fill: 'gainsboro', bold: true, ignore: VALUES[9] == 'NA', } },
        ],
        [doc.x, doc.y], [60, ht], {})

      doc.text('\n');
    }
    // ESPACIO PÚBLICO

    if (ALLOW_REVIEWS[2] == 1) {
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'ESPACIO PÚBLICO', config: { align: 'left', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [60, 1],
        {})

      doc.text('\n');

      const perfiles_titles = [
        'Sep. Central', 'Carill SITM', 'Calzada', 'Sep. Lateral', 'Bahia', 'Cicloruta', 'F.A', 'F.P', 'F.C', 'F.R'
      ]

      if (record_arc_36_infos.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'Elementos y dimensiones del perfial vial Art. 108° y 109° POT', config: { align: 'center', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [60, 1],
        {})


      let perfiles = [];
      let perfiles_headers = [];
      record_arc_36_infos.map(perfil => {
        let names = perfil.name ? perfil.name.split(';') : [];
        names.map(name => {
          if (!perfiles_headers.includes(name))
            perfiles_headers.push(name)
        })

      })

      perfiles_headers.sort((a, b) => {
        let customSortingArray = {
          'Sep. Central': 10,
          'Carill SITM': 9,
          'Calzada': 8,
          'Sep. Lateral': 7,
          'Bahia': 6,
          'Cicloruta': 5,
          'F.A': 4,
          'F.P': 3,
          'F.C': 2,
          'F.R': 1,
        }
        return customSortingArray[b] - customSortingArray[a];
      })

      let p_witdh = 44 / perfiles_headers.length;
      let sub_p_width = p_witdh / 3;

      let row_headers = [];
      perfiles_headers.map((p, i) => {
        row_headers.push({ coord: [16 + i * p_witdh, 1], w: sub_p_width, h: 1, text: 'N', config: { align: 'center', bold: true, valign: true, } })
        row_headers.push({ coord: [16 + i * p_witdh + sub_p_width, 1], w: sub_p_width, h: 1, text: 'P', config: { align: 'center', bold: true, valign: true, } })
        row_headers.push({ coord: [16 + i * p_witdh + sub_p_width * 2, 1], w: sub_p_width, h: 1, text: 'C', config: { align: 'center', bold: true, valign: true, fill: 'gainsboro' } })
      })
      if (record_arc_36_infos.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 16, h: 2, text: 'Perfil', config: { align: 'center', bold: true, valign: true, } },
          // HERE GOES THE DIMANIC TABLES
          ...perfiles_headers.map((p, i) => {
            return { coord: [16 + i * p_witdh, 0], w: p_witdh, h: 1, text: p, config: { align: 'center', bold: true, valign: true, } }
          }),
          ...row_headers,
        ],
        [doc.x, doc.y], [60, 2], {})

      record_arc_36_infos.map(perfil => {
        let children = [];
        let parents = perfil.parent ? perfil.parent.split(';') : [];

        parents.map(parent => {
          if (!children.some(child => child.type == parent)) {
            let rews = perfiles_headers.map((name, i) => {
              let _parent = perfil.parent ? perfil.parent.split(';') : [];
              let element = perfil.name ? perfil.name.split(';') : [];
              let indexElement = element.indexOf(name);

              if (_parent[indexElement] != parent) return {}

              let norm = perfil.norm ? perfil.norm.split(';') : [];
              let project = perfil.project ? perfil.project.split(';') : [];
              let check = perfil.check ? perfil.check.split(';') : [];

              return { norm: norm[indexElement], project: project[indexElement], check: check[indexElement] };
            })
            children.push({
              type: parent,
              rews: rews,
            })
          }
        })

        perfiles.push({
          address: perfil.address,
          children: children,
        })
      })

      if (record_arc_36_infos.length > 0) perfiles.map((perfil, i) => {
        let row_p = []
        perfil.children.map((p, j) => {
          let revies = [];
          p.rews.map((rew, k) => {
            revies.push(
              { coord: [16 + p_witdh * k, j], w: sub_p_width, h: 1, text: rew.norm || ' ', config: { align: 'center', valign: true, } },
              { coord: [16 + p_witdh * k + sub_p_width, j], w: sub_p_width, h: 1, text: rew.project || ' ', config: { align: 'center', valign: true, } },
              { coord: [16 + p_witdh * k + sub_p_width * 2, j], w: sub_p_width, h: 1, text: CV(rew.check) || ' ', config: { align: 'center', fill: 'gainsboro', valign: true, } },
            )
          })

          let curatedAddress = p.type ? p.type : '';
          curatedAddress = curatedAddress.replace('PERFIL - ', '');
          curatedAddress = curatedAddress.replace('PERFIL PEATONAL - ', 'PEAT. ')

          row_p.push(
            { coord: [6, j], w: 10, h: 1, text: curatedAddress, config: { align: 'center', valign: true, bold: true } },
            ...revies,
          )


        });


        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 6, h: perfil.children.length, text: perfil.address, config: { align: 'center', valign: true, bold: true } },
            //{ coord: [6, 0], w: 10, h: 1, text: perfil.name, config: { align: 'center', valign: true, bold: true } },
            ...row_p,
          ],
          [doc.x, doc.y], [60, perfil.children.length], {})

        doc.text('\n');
      })

      // REVIEW 4

      VALUES = _GET_STEP_TYPE('s36', 'value');
      CHECKS = _GET_STEP_TYPE('s36', 'check');

      if (CHECKS.some(c => c == 1 || c == 0)) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'Evaluación de Perfiles. Vías peatonales y andenes Art 164° al 169° POT', config: { align: 'center', bold: true, fill: 'silver' } },
        ],
        [doc.x, doc.y],
        [60, 1],
        { lineHeight: 12 });

      if (CHECKS.some(c => c == 1 || c == 0)) doc.text('\n');


      if (CHECKS[0] != 2) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 6, h: 3, text: 'Continuidad', config: { align: 'center', valign: true, bold: true } },

          { coord: [6, 0], w: 47, h: 1, text: 'La franja de circulación sigue la pendiente longitudinal de las calzadas', config: { align: 'left', valign: true, } },
          { coord: [53, 0], w: 2, h: 1, text: VV(VALUES[0]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [6, 1], w: 47, h: 1, text: 'Los accesos peatonales vehiculares a predios respetan continuidad y nivel de FC sn generar desniveles', config: { align: 'left', valign: true, } },
          { coord: [53, 1], w: 2, h: 1, text: VV(VALUES[1]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [6, 2], w: 47, h: 1, text: 'En vías con desniveles se proyecta soluciones con elementos de transición (Gradas, rampas en el caso aprobó SPM)', config: { align: 'left', valign: true, } },
          { coord: [53, 2], w: 2, h: 1, text: VV(VALUES[2]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [55, 0], w: 6, h: 3, text: CV2(CHECKS[0]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },
        ],
        [doc.x, doc.y], [61, 3], {})


      if (CHECKS[1] != 2) pdfSupport.table(doc,
        [

          { coord: [0, 0], w: 6, h: 3, text: 'Tratamiento', config: { align: 'center', valign: true, bold: true } },

          { coord: [6, 0], w: 47, h: 1, text: 'Superficie de FC dura, antideslizante y continua siguiendo el MEPB', config: { align: 'left', valign: true, } },
          { coord: [53, 0], w: 2, h: 1, text: VV(VALUES[3]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [6, 1], w: 47, h: 1, text: 'La franja ambienta o de amoblamiento -FA- tratada según área de actividad', config: { align: 'left', valign: true, } },
          { coord: [53, 1], w: 2, h: 1, text: VV(VALUES[4]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [6, 2], w: 47, h: 1, text: 'Cuando A.A + servidumbre via = 1,20m; arboriza 1 árbol c/u 5m de frente', config: { align: 'left', valign: true, } },
          { coord: [53, 2], w: 2, h: 1, text: VV(VALUES[5]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [55, 0], w: 6, h: 3, text: CV2(CHECKS[1]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },

        ],
        [doc.x, doc.y], [61, 3], {})


      if (CHECKS[2] != 2) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 6, h: 2, text: 'Accesibilidad', config: { align: 'center', valign: true, bold: true } },

          { coord: [6, 0], w: 47, h: 1, text: 'Los vados cumplen NTC 4143 (sin obstáculos), se encuentra en la esquina y/o lado', config: { align: 'left', valign: true, } },
          { coord: [53, 0], w: 2, h: 1, text: VV(VALUES[6]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [6, 1], w: 47, h: 1, text: 'FC con losetas señaladoras y táctil para guiar el desplazamiento de personas en baja visión e invidentes NTC 5616', config: { align: 'left', valign: true, } },
          { coord: [53, 1], w: 2, h: 1, text: VV(VALUES[7]), config: { align: 'center', fill: 'gainsboro', bold: true, valign: true, } },

          { coord: [55, 0], w: 6, h: 2, text: CV2(CHECKS[2]), config: { align: 'center', valign: true, fill: 'silver', bold: true } },

        ],
        [doc.x, doc.y], [61, 2], {})

      doc.text('\n');
      CHECKS = _GET_STEP_TYPE('s36_useduty', 'check');
      if (CHECKS == 1) {
        // URBAN DUTIES
        var nV = fun_2.estrato > 4 ? 6 : 4;
        let dutyClock = _GET_CLOCK_STATE(65).resolver_context || 'NO';
        let _GET_EXPEDITION_JSON = (field) => {
          let json = exp[field];
          if (!json) return {}
          let object = JSON.parse(JSON.parse(json))
          return object
        }
        VALUES = _GET_STEP_TYPE('s35', 'value');
        let shortTra = value34[2] ? value34[2].split('-')[1] : '';
        shortTra = shortTra || ''
        let value1 = Number((VALUES[2] || 0) * zugm * nV).toFixed(0);
        let value2 = Number((VALUES[0] || 0) * 0.06 * zugm).toFixed(0);
        let cols1 = [];
        let cols2 = [];

        let dutyHeight = 1;

        if (value1 > 0) dutyHeight = dutyHeight + 1;
        if (value1 > 0) cols1 = [
          { coord: [6, dutyHeight], w: 7, h: 1, text: 'Vivienda', config: { align: 'center', } },
          { coord: [13, dutyHeight], w: 6, h: 1, text: shortTra, config: { align: 'center', } },
          { coord: [19, dutyHeight], w: 7, h: 1, text: zgu + '/$' + zugm, config: { align: 'center', } },
          { coord: [26, dutyHeight], w: 4, h: 1, text: 'Unidad', config: { align: 'center', } },
          { coord: [30, dutyHeight], w: 4, h: 1, text: VALUES[2], config: { align: 'center', } },
          { coord: [34, dutyHeight], w: 6, h: 1, text: nV, config: { align: 'center', } },
          { coord: [40, dutyHeight], w: 7, h: 1, text: Number(VALUES[2] * nV) + ' m2', config: { align: 'center', } },
          { coord: [47, dutyHeight], w: 7, h: 1, text: '$' + value1, config: { align: 'center', } },
        ]

        if (value2 > 0) dutyHeight = dutyHeight + 1;
        if (value2 > 0) cols2 = [
          { coord: [6, dutyHeight], w: 7, h: 1, text: 'Distinto vivienda', config: { align: 'center', } },
          { coord: [13, dutyHeight], w: 6, h: 1, text: shortTra, config: { align: 'center', } },
          { coord: [19, dutyHeight], w: 7, h: 1, text: zgu + '/$' + zugm, config: { align: 'center', } },
          { coord: [26, dutyHeight], w: 4, h: 1, text: 'm2', config: { align: 'center', } },
          { coord: [30, dutyHeight], w: 4, h: 1, text: VALUES[0], config: { align: 'center', } },
          { coord: [34, dutyHeight], w: 6, h: 1, text: '6/100', config: { align: 'center', } },
          { coord: [40, dutyHeight], w: 7, h: 1, text: Number(VALUES[0] * 0.06).toFixed(2) + ' m2', config: { align: 'center', } },
          { coord: [47, dutyHeight], w: 7, h: 1, text: '$' + value2, config: { align: 'center', } },
        ]

        pdfSupport.table(doc,
          [
            { coord: [0, 0], w: 6, h: dutyHeight + 2, text: 'Deberes Urbanísticos At 192° POT', config: { align: 'center', valign: true, bold: true } },

            { coord: [6, 0], w: 6, h: 1, text: 'Consecutivo: ', config: { align: 'right', bold: true } },
            { coord: [12, 0], w: 6, h: 1, text: exp.cub2 || '', config: { align: 'left', fill: 'gainsboro' } },
            { coord: [18, 0], w: 7, h: 1, text: 'Valor Liquidado: ', config: { align: 'right', bold: true } },
            { coord: [25, 0], w: 5, h: 1, text: '$' + (Number(VALUES[0] * 0.06 * zugm) + Number(VALUES[2] * nV * zugm)).toFixed(0), config: { align: 'left', fill: 'gainsboro' } },
            { coord: [30, 0], w: 6, h: 1, text: 'N° Recibo: ', config: { align: 'right', bold: true } },
            { coord: [36, 0], w: 6, h: 1, text: _GET_EXPEDITION_JSON('taxes').id_payment_3 || '', config: { align: 'left', fill: 'gainsboro' } },
            { coord: [42, 0], w: 6, h: 1, text: 'Cancelado: ', config: { align: 'right', bold: true } },
            { coord: [48, 0], w: 6, h: 1, text: dutyClock, config: { align: 'left', fill: 'gainsboro' } },

            { coord: [6, 1], w: 7, h: 1, text: 'Uso', config: { align: 'center', bold: true } },
            { coord: [13, 1], w: 6, h: 1, text: 'Trata.', config: { align: 'center', bold: true } },
            { coord: [19, 1], w: 7, h: 1, text: 'ZGU', config: { align: 'center', bold: true } },
            { coord: [26, 1], w: 4, h: 1, text: 'Gen.', config: { align: 'center', bold: true } },
            { coord: [30, 1], w: 4, h: 1, text: 'Cant.', config: { align: 'center', bold: true } },
            { coord: [34, 1], w: 6, h: 1, text: 'm2*cant.', config: { align: 'center', bold: true } },
            { coord: [40, 1], w: 7, h: 1, text: 'm2*comp.', config: { align: 'center', bold: true } },
            { coord: [47, 1], w: 7, h: 1, text: 'Valor Comp.', config: { align: 'center', bold: true } },

            ...cols1,
            ...cols2,

            { coord: [6, dutyHeight + 1], w: 34, h: 1, text: 'TOTAL: ', config: { align: 'right', bold: true } },
            { coord: [40, dutyHeight + 1], w: 7, h: 1, text: (Number(VALUES[0] * 0.06) + Number(VALUES[2] * nV)).toFixed(2) + ' m2', config: { align: 'center', bold: true } },
            { coord: [47, dutyHeight + 1], w: 7, h: 1, text: '$' + (Number(value1) + Number(value2)).toFixed(0), config: { align: 'center', bold: true } },

            { coord: [54, 0], w: 6, h: dutyHeight + 2, text: dutyClock == 'PAGO' ? 'CUMPLE' : 'PENDIENTE', config: { align: 'center', valign: true, bold: true, fill: 'silver', } },
          ],
          [doc.x, doc.y], [60, dutyHeight + 2], {})


        doc.text('\n');
      }

    }
    // NRS-10

    VALUES = _GET_STEP_TYPE('s37', 'value');
    CHECKS = _GET_STEP_TYPE('s37', 'check');
    if (ALLOW_REVIEWS[3] == 1) {
      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: 'NRS-10', config: { align: 'left', bold: true, fill: 'silver' } },
        ], [doc.x, doc.y], [60, 1], {})

      doc.text('\n');


      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 6, h: 5, text: 'Separación sísmica', config: { align: 'center', valign: true, bold: true } },

          { coord: [6, 0], w: 18, h: 5, text: VV(VALUES[24]), config: { align: 'left', valign: true, } },
          //{ coord: [22, 0], w: 2, h: 5, text: VV(VALUES[20]), config: { align: 'center', valign: true, } },
          { coord: [24, 0], w: 6, h: 5, text: CV4(CHECKS[4], 0), config: { align: 'center', fill: 'silver', bold: true, valign: true, } },

          { coord: [31, 0], w: 6, h: 5, text: 'General. A.10.1.3.7', config: { align: 'center', valign: true, bold: true } },

          { coord: [37, 0], w: 18, h: 1, text: 'Clasificación de la edificación', config: { align: 'center', valign: true, bold: true, } },

          { coord: [37, 1], w: 9, h: 1, text: 'Edificación', config: { align: 'left', valign: true, } },
          { coord: [46, 1], w: 9, h: 1, text: VV(VALUES[20]), config: { align: 'center', valign: true, } },

          { coord: [37, 2], w: 9, h: 1, text: 'Altura (pisos) ', config: { align: 'left', valign: true, } },
          { coord: [46, 2], w: 9, h: 1, text: VV(VALUES[21]), config: { align: 'center', valign: true, } },

          { coord: [37, 3], w: 9, h: 1, text: 'Gran altura', config: { align: 'left', valign: true, } },
          { coord: [46, 3], w: 9, h: 1, text: VV(VALUES[22]), config: { align: 'center', valign: true, } },

          { coord: [37, 4], w: 9, h: 1, text: 'Categoría', config: { align: 'left', valign: true, } },
          { coord: [46, 4], w: 9, h: 1, text: VV(VALUES[23]), config: { align: 'center', valign: true, } },

          { coord: [55, 0], w: 6, h: 5, text: CV2(CHECKS[5], 0), config: { align: 'center', fill: 'silver', bold: true, valign: true, } },

        ],
        [doc.x, doc.y], [61, 5], {})


      doc.text('\n');

      if (record_arc_37s.length > 0) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 28, h: 1, text: 'Grupos y Subgrupos J.1.2; K.1; K.2', config: { align: 'center', bold: true, fill: 'silver', valign: true, } },
          { coord: [29, 0], w: 32, h: 1, text: 'Carga de Ocupación K.3.3.1; K.3.2.2', config: { align: 'center', bold: true, fill: 'silver', valign: true, } },
          //{ coord: [56, 0], w: 6, h: 3, text: 'Evaluacion', config: { align: 'center', bold: true, fill: 'silver', valign: true, } },

          { coord: [0, 1], w: 6, h: 2, text: 'Espacios', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },
          { coord: [6, 1], w: 7, h: 2, text: 'Grupos', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },
          { coord: [13, 1], w: 7, h: 2, text: 'Subgrupo', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },
          { coord: [20, 1], w: 8, h: 2, text: 'Área m2 espacio tipo', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },

          { coord: [29, 1], w: 8, h: 2, text: 'Área Neta m2 por ocupante', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },
          { coord: [37, 1], w: 8, h: 2, text: '# Ocupantes por piso', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },
          { coord: [45, 1], w: 8, h: 2, text: 'Ocupacion Real', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },
          { coord: [53, 1], w: 8, h: 2, text: 'Carga escogida por piso tipo', config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },

        ], [doc.x, doc.y], [61, 3], {})

      function arraySortNRS10(a, b) {
        let A;
        let B;

        A = a.name ? a.name.split(' ') : '';
        B = b.name ? b.name.split(' ') : '';

        let strPartA = A[0] ? A[0].toLowerCase() : '';
        let strPartB = B[0] ? B[0].toLowerCase() : '';
        let nunPartA = Number(A[1]) ? Number(A[1]) : Infinity;
        let nunPartB = Number(B[1]) ? Number(B[1]) : Infinity;


        if (strPartA < strPartB) { return -1; }
        if (strPartA > strPartB) { return 1; }

        if (strPartA[0] && strPartA[0].toLowerCase() == 's') {
          if (nunPartA < nunPartB) { return -1; }
          if (nunPartA > nunPartB) { return 1; }
        } else {
          if (nunPartA < nunPartB) { return 1; }
          if (nunPartA > nunPartB) { return -1; }
        }

        return 0;
      }

      record_arc_37s.sort((a, b) => arraySortNRS10(a, b)).map(it => {
        let name = it.name ? it.name : '';
        let main_group = it.main_group ? it.main_group.split(';') : [];
        let sub_group = it.sub_group ? it.sub_group.split(';') : [];
        let anet = it.anet ? it.anet.split(';') : [];
        let index = it.index ? it.index.split(';') : [];
        let real = it.real ? it.real.split(';') : [];

        let main_group2 = [];
        sub_group.map(it => {
          let sg = it ? it[0] : false;
          if (sg && !main_group2.some(mg => mg.group == sg)) main_group2.push({ group: sg, Alength: 1 })
          else if (main_group2.some(mg => mg.group == sg)) main_group2.find(mg => mg.group == sg).Alength++;
        })

        let controlVar = [];
        if (main_group.length > controlVar.length) controlVar = main_group;
        if (sub_group.length > controlVar.length) controlVar = sub_group;
        if (anet.length > controlVar.length) controlVar = anet;
        if (index.length > controlVar.length) controlVar = index;
        if (real.length > controlVar.length) controlVar = real;

        let subRows = [];

        controlVar.map((row, i) => {
          let numA = Number(real[i]);
          let numB = Number(anet[i] / index[i]);
          let comparatio = '';
          let _main_group = main_group[i] ? main_group[i][0] : '';
          let _sub_group = sub_group[i] ? sub_group[i].split(' ')[0] : '';
          if (numA > numB) comparatio = numA
          else comparatio = numB
          subRows.push(
            { coord: [6, i], w: 7, h: 1, text: _main_group, config: { align: 'center', valign: true, } },
            { coord: [13, i], w: 7, h: 1, text: _sub_group, config: { align: 'center', valign: true, } },
            { coord: [20, i], w: 8, h: 1, text: anet[i], config: { align: 'center', valign: true, } },

            { coord: [29, i], w: 8, h: 1, text: (Number(index[i])), config: { align: 'center', valign: true, } },
            { coord: [37, i], w: 8, h: 1, text: (Number(anet[i]) / Number(index[i])).toFixed(2), config: { align: 'center', valign: true, } },
            { coord: [45, i], w: 8, h: 1, text: (Number(real[i])), config: { align: 'center', valign: true, } },
            { coord: [53, i], w: 8, h: 1, text: Math.round(Number(comparatio)), config: { align: 'center', valign: true, } },
          );
        })

        pdfSupport.table(doc,
          [
            //{ coord: [56, 0], w: 6, h: controlVar.length, text: CV2(it.check, 0), config: { align: 'center', bold: true, fill: 'gainsboro', valign: true, } },

            { coord: [0, 0], w: 6, h: controlVar.length, text: name, config: { align: 'left', valign: true, } },

            ...subRows,
          ], [doc.x, doc.y], [61, controlVar.length], {})

      })

      doc.text('\n');

      // NRS-10 REVIEW 5

      line_height = [
        1,
        VALUES[0] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[1] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[2] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[3] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[4] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[5] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[6] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[7] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        VALUES[8] == 'NA' || CHECKS[0] == 2 ? 0 : 1,
        1,
        VALUES[18] == 'NA' || CHECKS[3] == 2 ? 0 : 1,
        VALUES[19] == 'NA' || CHECKS[3] == 2 ? 0 : 1,
      ];
      ht = line_height.filter(lh => lh).length;
      hr = (_i) => line_height.filter((lh, i) => lh && i < _i).length

      line_height2 = [
        1,
        VALUES[9] == 'NA' || CHECKS[1] == 2 ? 0 : 1,
        VALUES[10] == 'NA' || CHECKS[1] == 2 ? 0 : 1,
        VALUES[11] == 'NA' || CHECKS[1] == 2 ? 0 : 1,
        VALUES[12] == 'NA' || CHECKS[1] == 2 ? 0 : 1,
        VALUES[13] == 'NA' || CHECKS[1] == 2 ? 0 : 1,
        1,
        VALUES[14] == 'NA' || CHECKS[2] == 2 ? 0 : 1,
        VALUES[15] == 'NA' || CHECKS[2] == 2 ? 0 : 1,
        VALUES[16] == 'NA' || CHECKS[2] == 2 ? 0 : 1,
        VALUES[17] == 'NA' || CHECKS[2] == 2 ? 0 : 1,
      ];
      ht2 = line_height2.filter(lh => lh).length;
      hr2 = (_i) => line_height2.filter((lh, i) => lh && i < _i).length

      hf = ht > ht2 ? ht : ht2;

      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 6, h: ht, text: 'Medios de salida protegida', config: { align: 'center', valign: true, bold: true } },

          { coord: [6, hr(0)], w: 21, h: 1, text: 'Escaleras', config: { align: 'center', valign: true, bold: true } },
          { coord: [27, hr(0)], w: 6, h: 1, text: CV2(CHECKS[0], 0), config: { align: 'center', fill: 'silver', bold: true, valign: true, } },

          { coord: [6, hr(1)], w: 24, h: 1, text: 'Número de salidas por piso', config: { align: 'left', valign: true, ignore: VALUES[0] == 'NA' || CHECKS[0] == 2, } },
          { coord: [30, hr(1)], w: 3, h: 1, text: VV(VALUES[0]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[0] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(2)], w: 25, h: 1, text: 'Materiales antideslizantes y sin escalones calados', config: { align: 'left', valign: true, ignore: VALUES[1] == 'NA' || CHECKS[0] == 2, } },
          { coord: [31, hr(2)], w: 2, h: 1, text: VV(VALUES[1]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[1] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(3)], w: 25, h: 1, text: 'Ancho de la huella sin proyecciones = 0,28m', config: { align: 'left', valign: true, ignore: VALUES[2] == 'NA' || CHECKS[0] == 2, } },
          { coord: [31, hr(3)], w: 2, h: 1, text: VV(VALUES[2]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[2] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(4)], w: 25, h: 1, text: 'Diferencia entre al ancho entre tipo de huellas < 0,02m', config: { align: 'left', valign: true, ignore: VALUES[3] == 'NA' || CHECKS[0] == 2, } },
          { coord: [31, hr(4)], w: 2, h: 1, text: VV(VALUES[3]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[3] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(5)], w: 25, h: 1, text: 'Altura contrahuella entre 0,10m y 0,18m', config: { align: 'left', valign: true, ignore: VALUES[0] == 'NA' || CHECKS[0] == 2, } },
          { coord: [31, hr(5)], w: 2, h: 1, text: VV(VALUES[4]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[4] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(6)], w: 25, h: 1, text: 'Diferencia entre altura de contrahuellas < 0,02m', config: { align: 'left', valign: true, ignore: VALUES[5] == 'NA' || CHECKS[0] == 2, } },
          { coord: [31, hr(6)], w: 2, h: 1, text: VV(VALUES[5]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[5] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(7)], w: 25, h: 1, text: 'Suma de dos contrahuellas y una huella entre 0,60m y 0,64m', config: { align: 'left', valign: true, ignore: VALUES[6] == 'NA' || CHECKS[0] == 2, } },
          { coord: [31, hr(7)], w: 2, h: 1, text: VV(VALUES[6]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[6] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(8)], w: 24, h: 1, text: 'Ancho en todos lo puntos de la escalera', config: { align: 'left', valign: true, ignore: VALUES[7] == 'NA' || CHECKS[0] == 2, } },
          { coord: [30, hr(8)], w: 3, h: 1, text: VV(VALUES[7]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[7] == 'NA' || CHECKS[0] == 2, } },

          { coord: [6, hr(9)], w: 25, h: 1, text: 'Altura mínima 2,05m', config: { align: 'left', valign: true, ignore: VALUES[8] == 'NA' || CHECKS[0] == 2, } },
          { coord: [31, hr(9)], w: 2, h: 1, text: VV(VALUES[8]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[8] == 'NA' || CHECKS[0] == 2, } },

          //------------------------------------------------------------------------------------------//

          { coord: [6, hr(10)], w: 21, h: 1, text: 'Descarga de salida', config: { align: 'center', valign: true, bold: true } },
          { coord: [27, hr(10)], w: 6, h: 1, text: CV2(CHECKS[3], 0), config: { align: 'center', fill: 'silver', bold: true, valign: true, } },

          { coord: [6, hr(11)], w: 25, h: 1, text: 'Una de las 2 escaleras descarga directamente al espacio público', config: { align: 'left', valign: true, ignore: VALUES[18] == 'NA' || CHECKS[3] == 2, } },
          { coord: [31, hr(11)], w: 2, h: 1, text: VV(VALUES[18]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[18] == 'NA' || CHECKS[3] == 2, } },

          { coord: [6, hr(12)], w: 25, h: 1, text: 'Presenta rociadores el vestíbulo; requerido para las 2 escaleras.', config: { align: 'left', valign: true, ignore: VALUES[19] == 'NA' || CHECKS[3] == 2, } },
          { coord: [31, hr(12)], w: 2, h: 1, text: VV(VALUES[19]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[19] == 'NA' || CHECKS[3] == 2, } },

          //------------------------------------------------------------------------------------------//

          { coord: [34, hr2(0)], w: 21, h: 1, text: 'Pasamanos', config: { align: 'center', valign: true, bold: true } },
          { coord: [55, hr2(0)], w: 6, h: 1, text: CV2(CHECKS[1], 0), config: { align: 'center', fill: 'silver', bold: true, valign: true, } },

          { coord: [34, hr2(1)], w: 25, h: 1, text: 'Continúo incluido el descanso', config: { align: 'left', valign: true, ignore: VALUES[9] == 'NA' || CHECKS[1] == 2, } },
          { coord: [59, hr2(1)], w: 2, h: 1, text: VV(VALUES[9]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[9] == 'NA' || CHECKS[1] == 2, } },

          { coord: [34, hr2(2)], w: 25, h: 1, text: 'Prolongado 0,30 en los externos de la escalera', config: { align: 'left', valign: true, ignore: VALUES[10] == 'NA' || CHECKS[1] == 2, } },
          { coord: [59, hr2(2)], w: 2, h: 1, text: VV(VALUES[10]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[10] == 'NA' || CHECKS[1] == 2, } },

          { coord: [34, hr2(3)], w: 25, h: 1, text: 'Se encuentra entre 0,85 y 0,95m de altura', config: { align: 'left', valign: true, ignore: VALUES[11] == 'NA' || CHECKS[1] == 2, } },
          { coord: [59, hr2(3)], w: 2, h: 1, text: VV(VALUES[11]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[11] == 'NA' || CHECKS[1] == 2, } },

          { coord: [34, hr2(4)], w: 25, h: 1, text: 'Circular a con diámetro entre 0,032m y 0,050m', config: { align: 'left', valign: true, ignore: VALUES[12] == 'NA' || CHECKS[1] == 2, } },
          { coord: [59, hr2(4)], w: 2, h: 1, text: VV(VALUES[12]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[12] == 'NA' || CHECKS[1] == 2, } },

          { coord: [34, hr2(5)], w: 25, h: 1, text: 'Separado a una distancia >= 0,05m del muro', config: { align: 'left', valign: true, ignore: VALUES[13] == 'NA' || CHECKS[1] == 2, } },
          { coord: [59, hr2(5)], w: 2, h: 1, text: VV(VALUES[13]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[13] == 'NA' || CHECKS[1] == 2, } },

          //------------------------------------------------------------------------------------------//

          { coord: [34, hr2(6)], w: 21, h: 1, text: 'Puertas protegidas', config: { align: 'center', valign: true, bold: true } },
          { coord: [55, hr2(6)], w: 6, h: 1, text: CV2(CHECKS[2], 0), config: { align: 'center', fill: 'silver', bold: true, valign: true, } },

          { coord: [34, hr2(7)], w: 25, h: 1, text: 'Ancho de la puerta >= 0,90m', config: { align: 'left', valign: true, ignore: VALUES[14] == 'NA' || CHECKS[2] == 2, } },
          { coord: [59, hr2(7)], w: 2, h: 1, text: VV(VALUES[14]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[14] == 'NA' || CHECKS[2] == 2, } },

          { coord: [34, hr2(8)], w: 25, h: 1, text: 'Altura puerta >= 2,05m', config: { align: 'left', valign: true, ignore: VALUES[15] == 'NA' || CHECKS[2] == 2, } },
          { coord: [59, hr2(8)], w: 2, h: 1, text: VV(VALUES[15]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[15] == 'NA' || CHECKS[2] == 2, } },

          { coord: [34, hr2(9)], w: 25, h: 1, text: 'Secuencia de puertas seriadas distanciadas mínimo 2,10 ', config: { align: 'left', valign: true, ignore: VALUES[16] == 'NA' || CHECKS[2] == 2, } },
          { coord: [59, hr2(9)], w: 2, h: 1, text: VV(VALUES[16]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[16] == 'NA' || CHECKS[2] == 2, } },

          { coord: [34, hr2(10)], w: 25, h: 1, text: 'El constructor obligado a cumplir K.3.18.2.5 Medios de salida', config: { align: 'left', valign: true, ignore: VALUES[17] == 'NA' || CHECKS[2] == 2, } },
          { coord: [59, hr2(10)], w: 2, h: 1, text: VV(VALUES[17]), config: { align: 'center', valign: true, fill: 'gainsboro', ignore: VALUES[17] == 'NA' || CHECKS[2] == 2, } },

        ],
        [doc.x, doc.y], [61, hf], {})


      // END - DETAILS
      doc.text('\n');
    }


  }

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: 'CONCLUSIONES Y OBSERVACIONES', config: { align: 'left', bold: true, fill: 'silver' } },
    ],
    [doc.x, doc.y],
    [60, 1],
    {})



  VALUES = _GET_STEP_TYPE('s33', 'value');
  let ob33 = String(VALUES[2] || '').trim();

  VALUES = _GET_STEP_TYPE('s34', 'value');
  let ob34 = String(VALUES[10] || '').trim();

  VALUES = _GET_STEP_TYPE('s35', 'value');
  let ob35 = String(VALUES[1] || '').trim();

  VALUES = _GET_STEP_TYPE('s36', 'value');
  let ob36 = String(VALUES[8] || '').trim();

  let r38 = record_arc_38s ? record_arc_38s[0] : {};
  let ob38 = r38 ? r38.detail ? r38.detail.trim() : '' : '';

  if (!ob33 && !ob34 && !ob35 && !ob36 && !ob38) {
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 2, h: 1, text: '', config: { align: 'left', hide: true } },
        { coord: [2, 0], w: 58, h: 1, text: '\nNO HAY OBSERVACIONES\n', config: { align: 'left', hide: true } },
      ],
      [doc.x, doc.y], [60, 1], { lineHeight: -1 })
  } else {
    let obs = 1;

    if (ob33) {
      pdfSupport.table(doc,
        [
          { coord: [1, 0], w: 60, h: 1, text: `${obs}. GENERALES `, config: { align: 'left', hide: true, bold: true } },
        ],
        [doc.x, doc.y], [60, 1], {})
      pdfSupport.table(doc,
        [
          { coord: [2, 0], w: 58, h: 1, text: `${ob33}`, config: { align: 'left', hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      obs++;
    }
    if (ob34) {
      pdfSupport.table(doc,
        [
          { coord: [1, 0], w: 60, h: 1, text: `${obs}. DETERMINANTES URBANISTICAS Y HABITABILIDAD `, config: { align: 'left', hide: true, bold: true } },
        ],
        [doc.x, doc.y], [60, 1], {})
      pdfSupport.table(doc,
        [
          { coord: [2, 0], w: 58, h: 1, text: `${ob34}`, config: { align: 'left', hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      obs++;
    }

    if (ob35) {
      pdfSupport.table(doc,
        [
          { coord: [1, 0], w: 60, h: 1, text: `${obs}. PARQUEADEROS `, config: { align: 'left', hide: true, bold: true } },
        ],
        [doc.x, doc.y], [60, 1], {})
      pdfSupport.table(doc,
        [
          { coord: [2, 0], w: 58, h: 1, text: `${ob35}`, config: { align: 'left', hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      obs++;
    }

    if (ob36) {
      pdfSupport.table(doc,
        [
          { coord: [1, 0], w: 60, h: 1, text: `${obs}. ESPACIO PÚBLICO `, config: { align: 'left', hide: true, bold: true } },
        ],
        [doc.x, doc.y], [60, 1], {})
      pdfSupport.table(doc,
        [
          { coord: [2, 0], w: 58, h: 1, text: `${ob36}`, config: { align: 'left', hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      obs++;
    }


    if (ob38) {
      pdfSupport.table(doc,
        [
          { coord: [1, 0], w: 60, h: 1, text: `${obs}. OTROS `, config: { align: 'left', hide: true, bold: true } },
        ],
        [doc.x, doc.y], [60, 1], {})
      pdfSupport.table(doc,
        [
          { coord: [2, 0], w: 58, h: 1, text: `${ob38}`, config: { align: 'left', hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })
      obs++;
    }
  }


  doc.text('\n');

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: 'EVALUACIÓN DE VIABILIDAD ARQUITECTONICA', config: { align: 'left', bold: true, fill: 'silver' } },
    ],
    [doc.x, doc.y], [60, 1], {})
  let color = _DATA.rew.r_pending ? 'blanchedalmond' : _DATA.rew.r_check == 'VIABLE' ? 'paleturquoise' : 'lightsalmon';

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 11, h: 1, text: '\nPROFESIONAL REVISOR:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [11, 0], w: 21, h: 1, text: `\n${_DATA.rew.r_worker} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

      { coord: [32, 0], w: 7, h: 1, text: '\nRESULTADO:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [39, 0], w: 7, h: 1, text: `\n${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check} \n `, config: { align: 'center', bold: true, valign: true, fill: color } },

      { coord: [46, 0], w: 7, h: 1, text: '\nFECHA:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [53, 0], w: 7, h: 1, text: `\n${_DATA.rew.r_date} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

}
function PDFGEN_ARC_RECORD_ALT(_DATA, doc, simple) {
  const fun_1 = _DATA ? _DATA.fun_1s ? _DATA.fun_1s.length > 0 ? _DATA.fun_1s[0] : false : false : false;
  const fun_2 = _DATA ? _DATA.fun_2 ? _DATA.fun_2 : {} : {};
  const fun_law = _DATA ? _DATA.fun_law ? _DATA.fun_law : {} : {};
  const fun_3 = _DATA ? _DATA.fun_3s : [];
  const fun_51 = _DATA ? _DATA.fun_51s : [];
  const fun_52 = _DATA ? _DATA.fun_52s : [];
  //const fun_53 = _DATA ? _DATA.fun_53s ? _DATA.fun_53s.length > 0 ? _DATA.fun_53s[0] : false : false : false;
  //const fun_law = _DATA ? _DATA.fun_law ? _DATA.fun_law : false : false;
  //const fun_r = _DATA ? _DATA.fun_rs ? _DATA.fun_rs.length > 0 ? _DATA.fun_rs[0] : false : false : false;
  const fun_clocks = _DATA ? _DATA.fun_clocks : [];

  const record_arc = _DATA ? _DATA.record_arc : false;
  const record_arc_steps = record_arc ? _DATA.record_arc_steps ? _DATA.record_arc_steps : [] : [];
  const record_arc_33_areas = record_arc ? record_arc.record_arc_33_areas ? record_arc.record_arc_33_areas : [] : [];
  const record_arc_34_ks = record_arc ? record_arc.record_arc_34_ks ? record_arc.record_arc_34_ks : [] : [];
  const record_arc_34_gens = record_arc ? record_arc.record_arc_34_gens ? record_arc.record_arc_34_gens : [] : [];
  const record_arc_35_parkings = record_arc ? record_arc.record_arc_35_parkings ? record_arc.record_arc_35_parkings : [] : [];
  const record_arc_35_locations = record_arc ? record_arc.record_arc_35_locations ? record_arc.record_arc_35_locations : [] : [];
  const record_arc_36_infos = record_arc ? record_arc.record_arc_36_infos ? record_arc.record_arc_36_infos : [] : [];
  const record_arc_38s = record_arc ? record_arc.record_arc_38s ? record_arc.record_arc_38s : [] : []

  const record_rev = _DATA.recorc_rev ? _DATA.recorc_rev : {};

  const version = _DATA ? _DATA.version : 1;

  const checkValue = ['NO CUMPLE', 'CUMPLE', 'N/A'];
  const checkValueAlt = ['NO', 'SI', 'N/A'];

  const print_length = 17;
  const print_length_2 = 2;

  let _FIND_PROFESIOANL = (_role) => {
    for (var i = 0; i < fun_52.length; i++) {
      if (fun_52[i].role.includes(_role)) return fun_52[i];
    }
    return false;
  }

  function LOAD_STEP(_id_public) {
    var _CHILD = record_arc_steps;
    for (var i = 0; i < _CHILD.length; i++) {
      if (_CHILD[i].version == version && _CHILD[i].id_public == _id_public) return _CHILD[i]
    }
    return []
  }
  function _GET_STEP_TYPE_JSON(_id_public) {
    var STEP = LOAD_STEP(_id_public);
    if (!STEP.id) return {};
    var value = STEP['json']
    if (!value) return {};
    value = JSON.parse(JSON.parse(value));
    return value
  };
  function _GET_STEP_TYPE(_id_public, _type) {
    var STEP = LOAD_STEP(_id_public);
    if (!STEP) return [];
    if (!STEP.id) return [];
    var value = STEP[_type] ? STEP[_type] : []
    if (!value.length) return [];
    value = value.split(';');
    return value
  }





  let _GET_CLOCK_STATE = (_state) => {
    var _CLOCK = fun_clocks;
    if (_state == null) return false;
    for (var i = 0; i < _CLOCK.length; i++) {
      if (_CLOCK[i].state == _state) return _CLOCK[i];
    }
    return false;
  }


  const _fun_0_type = { '0': 'NC', 'i': 'I', 'ii': "II", 'iii': "III", 'iv': "IV", 'oa': "OA" }
  const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };



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

  const CV2 = (val, df) => {
    if (val == 0) return 'NO CUMPLE';
    if (val == 1) return 'CUMPLE';
    if (val == 2) return 'NO APLICA';
    if (df) return df;
    return ''
  }

  const CV3 = (val, dv) => {
    if (val == '0') return 'NO';
    if (val == '1') return 'SI';
    if (val == '2') return 'SIN DATO';
    return 'SIN DATO';
  }

  const VV = (val, df) => {
    if (val) return val;
    if (df) return df;
    return ''
  }


  doc.fontSize(7);
  if (curaduriaInfo.id == 'cup1') doc.fontSize(9);
  doc.font('Helvetica-Bold');
  doc.startPage = doc.bufferedPageRange().count - 1;
  doc.lastPage = doc.bufferedPageRange().count - 1;
  let _prof = _FIND_PROFESIOANL('URBANIZADOR O CONSTRUCTOR RESPONSABLE');
  if (!_prof) _prof = _FIND_PROFESIOANL('DIRECTOR DE LA CONSTRUCCION');

  let prof = {
    name: _prof ? _prof.name + ' ' + _prof.surname : ' ',
    mat: _prof ? _prof.registration : ' ',
    number: _prof ? _prof.number : ' ',
    email: _prof ? _prof.email : ' ',
    mat_date: _prof ? _prof.registration_date : ' ',
  }

  let legal_date = _GET_CLOCK_STATE(5).date_start;
  let time_to_review = _fun_0_type_time[_DATA.type ? _DATA.type : 'iii']
  let final_date = '';
  if (legal_date) {
    let limite_date = _GET_CLOCK_STATE(32).date_start || _GET_CLOCK_STATE(33).date_start;
    if (limite_date) {
      let pro = _GET_CLOCK_STATE(34).date_start ? 45 : 30;
      final_date = typeParse.dateParser_finalDate(limite_date, pro);
    }
    else final_date = typeParse.dateParser_finalDate(legal_date, time_to_review);
  }
  if (!simple) {
    doc.on('pageAdded', () => { doc.startPage++; doc.lastPage++ });
    // TABLE HEADERSS
    doc.fontSize(7);
    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 22, h: 1, text: 'III. REVISIÓN ARQUITECTÓNICA', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 10, h: 1, text: 'INFORME', config: { bold: true, fill: 'steelblue', color: 'white' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [34, 0], w: 8, h: 1, text: 'OBSERVACIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
        { coord: [42, 0], w: 2, h: 1, text: _DATA.type_rev == 1 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
        { coord: [44, 0], w: 8, h: 1, text: 'CORRECCIONES:', config: { bold: true, fill: 'steelblue', color: 'white', align: 'left' } },
        { coord: [52, 0], w: 2, h: 1, text: _DATA.type_rev == 2 ? 'X' : ' ', config: { fill: 'silver', color: 'black', align: 'center', } },
      ],
      [doc.x, doc.y], [54, 1], {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Profesional responsable', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.name, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 10, h: 1, text: 'Control Revisión', config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [34, 0], w: 20, h: 5, text: typeParse.formsParser1(fun_1), config: { bold: true, fill: 'gold', align: 'center', valign: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Matricula profesional', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.mat, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Ingreso', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: _GET_CLOCK_STATE(5).date_start, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        //{ coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Fecha matricula', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.mat_date, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Rev. 1', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: record_rev.date, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        //{ coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Email', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.email, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Rev. 2', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: record_rev.date_2, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        //{ coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 8, h: 1, text: 'Teléfono', config: { align: 'left' } },
        { coord: [8, 0], w: 14, h: 1, text: prof.number, config: { align: 'left' } },
        { coord: [22, 0], w: 1, h: 1, text: '', config: { hide: true } },
        { coord: [23, 0], w: 6, h: 1, text: 'Fecha Desistir', config: { align: 'left' } },
        { coord: [29, 0], w: 4, h: 1, text: final_date, config: { align: 'center' } },
        { coord: [33, 0], w: 1, h: 1, text: '', config: { hide: true } },
        //{ coord: [34, 0], w: 20, h: 1, text: '', config: { hide: true } },
      ],
      [doc.x, doc.y],
      [54, 1],
      {})

    doc.text('\n');



    pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: 'EVALUACIÓN', config: { align: 'left', bold: true, fill: 'silver' } },
      ],
      [doc.x, doc.y],
      [60, 1],
      {})

    var CON_MASTER = _GET_STEP_TYPE('rar_t', 'value');
    CON_MASTER = CON_MASTER[0] ? CON_MASTER[0] : 'ZERO';

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

      _CHILDREN_C.map((_child) => {
        if (_child == 1 || _child == 0) limit++;
      })

      let _CELLS = [];
      if (_PARENT && limit > 0) _CELLS.push({ coord: [0, 0], w: 10, h: limit, text: _PARENT, config: { bold: true, align: 'center', valign: true } },)

      _CHILDREN_C.map((_child, i) => {
        if (_child == 1 || _child == 0) {
          let pOffSet = _PARENT ? 0 : 10;
          _CELLS.push({ coord: [10 - pOffSet, manuali], w: 44 + pOffSet, h: 1, text: _CHILDREN_V[i], config: { align: 'left', } },)
          _CELLS.push({ coord: [54, manuali], w: 6, h: 1, text: CV2(_CHILDREN_C[i], 'CUMPLE'), config: { bold: true, align: 'center', fill: 'gainsboro', } },)
          manuali++;
        }
      })


      pdfSupport.table(doc,
        [
          ..._CELLS
        ],
        [doc.x, doc.y], [60, limit], {})
    }

    function print_revview_2(_VALUES, _CHECKS, JSONS, ID) {
      let _PARENT = _VALUES[0];

      _PARENT == 'false' ? _PARENT = '' : _PARENT = _PARENT;
      let _CHILDREN_V = _VALUES;
      let _CHILDREN_C = _CHECKS;
      _CHILDREN_V.shift();
      _CHILDREN_C.shift();

      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: _PARENT, config: { bold: true, align: 'center', valign: true, fill: 'gainsboro', } }
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })

      pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 21, h: 1, text: 'ITEM', config: { bold: true, align: 'center', valign: true, } },
          { coord: [21, 0], w: 6, h: 1, text: 'NORMA', config: { bold: true, align: 'center', valign: true, } },
          { coord: [27, 0], w: 6, h: 1, text: 'PROYECTO', config: { bold: true, align: 'center', valign: true, } },
          { coord: [33, 0], w: 6, h: 1, text: 'EVALUACION', config: { bold: true, align: 'center', valign: true, } },
          { coord: [39, 0], w: 21, h: 1, text: 'DETALLES / OBSERVACIONES', config: { bold: true, align: 'center', valign: true, } },

        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1 })


      _CHILDREN_C.map((_child, i) => {
        let _JSON = JSONS[ID + '_' + (i + 1)] || {}
        if (_child == 1 || _child == 0) {
          pdfSupport.table(doc,
            [
              { coord: [0, 0], w: 21, h: 1, text: _CHILDREN_V[i], config: { align: 'left', } },
              { coord: [21, 0], w: 6, h: 1, text: _JSON.norm || ' ', config: { align: 'center', } },
              { coord: [27, 0], w: 6, h: 1, text: _JSON.project || ' ', config: { align: 'center', } },
              { coord: [33, 0], w: 6, h: 1, text: CV2(_CHILDREN_C[i], 'CUMPLE'), config: { align: 'center' } },
              { coord: [39, 0], w: 21, h: 1, text: _JSON.detail || ' ', config: { align: 'left', } },
            ],
            [doc.x, doc.y], [60, 1], { lineHeight: -1 });
        }
      })

    };


    var VALUES;
    var CHECKS;
    var TYPES;
    var JSONS;

    for (let i = 0; i < print_length; i++) {
      VALUES = _GET_STEP_TYPE('rar_' + i, 'value');
      CHECKS = _GET_STEP_TYPE('rar_' + i, 'check');
      TYPES = _GET_STEP_TYPE('rar_' + i, 'json');

      print_revview(VALUES, CHECKS, TYPES);
    }

    doc.text('\n');

    let title_con = false;
    for (let i = 0; i < print_length_2; i++) {
      CHECKS = _GET_STEP_TYPE('rar2_' + i, 'check');
      if (CHECKS.includes('0') || CHECKS.includes('1') || CHECKS.includes(0) || CHECKS.includes(1)) title_con = true;
    }
    if (title_con) pdfSupport.table(doc,
      [
        { coord: [0, 0], w: 60, h: 1, text: 'ANALISIS DE PROFUNDIDAD', config: { bold: true, align: 'center', valign: true, fill: 'silver' } }
      ],
      [doc.x, doc.y], [60, 1], {});

    if (title_con) for (let i = 0; i < print_length_2; i++) {
      VALUES = _GET_STEP_TYPE('rar2_' + i, 'value');
      CHECKS = _GET_STEP_TYPE('rar2_' + i, 'check');
      JSONS = _GET_STEP_TYPE_JSON('rar2_' + i);

      print_revview_2(VALUES, CHECKS, JSONS, 'rar2_' + i);
    }


  }
  if (curaduriaInfo.id == 'cup1') doc.fontSize(11);
  // END - DETAILS
  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: 'CONCLUSIONES Y OBSERVACIONES', config: { align: 'left', bold: true, fill: 'silver' } },
    ],
    [doc.x, doc.y],
    [60, 1],
    { lineHeight: -1 })

  let r38 = record_arc_38s ? record_arc_38s[0] : {};
  let ob38 = r38 ? r38.detail ? r38.detail : '' : '';

  let _RESUME = ``;
  let nomen = 1;

  for (let i = 0; i < print_length; i++) {
    let _value = _GET_STEP_TYPE('rar_' + i, 'value');
    let _check = _GET_STEP_TYPE('rar_' + i, 'check');
    let _check2 = _GET_STEP_TYPE('rar_' + i, 'check');
    let _context = _GET_STEP_TYPE('rar_' + i + '_c', 'value');

    _check2.shift();

    if (_check2.includes('0')) {
      if (_value[0] != 'false') _RESUME += ` - ${_value[0]}\n`
      _check.map((c, i) => {
        {
          if (c == 0 && _context[i] && i != 0) {
            _RESUME += `${nomen}. ${_context[i]}\n`;
            nomen++;
          }
        }
      })
    }
  }

  let _RESUME_ARRAY = _RESUME.split('\n');

  if (curaduriaInfo.id == 'cup1') doc.fontSize(11);

  if (_RESUME_ARRAY.length) _RESUME_ARRAY.map(resume => {
    const items = resume.split('\n');
    items.map(i => {
      if (i) pdfSupport.table(doc,
        [
          { coord: [0, 0], w: 60, h: 1, text: ``, config: { align: 'left', hide: true } },
          { coord: [2, 0], w: 56, h: 1, text: `${i}`, config: { align: 'justify', hide: true } },
        ],
        [doc.x, doc.y], [60, 1], { lineHeight: -1, forceNewPage: true, equalizePages: true})
    })
  }
  )


  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: ``, config: { align: 'left', hide: true } },
      { coord: [2, 0], w: 56, h: 1, text: `\n${ob38}\n`, config: { align: 'justify', hide: true } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  doc.text('\n');

  pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 60, h: 1, text: 'EVALUACIÓN DE VIABILIDAD ARQUITECTONICA', config: { align: 'left', bold: true, fill: 'silver' } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

  let color = _DATA.rew.r_pending ? 'blanchedalmond' : _DATA.rew.r_check == 'VIABLE' ? 'paleturquoise' : 'lightsalmon';

  if (_DATA.omit_date) pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 11, h: 1, text: '\nPROFESIONAL REVISOR:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [11, 0], w: 20, h: 1, text: `\n${_DATA.rew.r_worker} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

      { coord: [31, 0], w: 8, h: 1, text: '\nRESULTADO:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [39, 0], w: 8, h: 1, text: `\n${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check} \n `, config: { align: 'center', bold: true, valign: true, fill: color } },
    ],
    [doc.x, doc.y], [47, 1], { lineHeight: -1 })
  else pdfSupport.table(doc,
    [
      { coord: [0, 0], w: 11, h: 1, text: '\nPROFESIONAL REVISOR:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [11, 0], w: 17, h: 1, text: `\n${_DATA.rew.r_worker} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },

      { coord: [28, 0], w: 10, h: 1, text: '\nRESULTADO:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [38, 0], w: 8, h: 1, text: `\n${_DATA.rew.r_pending ? 'PENDIENTE' : _DATA.rew.r_check} \n `, config: { align: 'center', bold: true, valign: true, fill: color } },

      { coord: [46, 0], w: 6, h: 1, text: '\nFECHA:\n ', config: { align: 'center', bold: true, valign: true, } },

      { coord: [52, 0], w: 8, h: 1, text: `\n${_DATA.rew.r_date} \n `, config: { align: 'center', bold: true, valign: true, fill: 'gainsboro', } },
    ],
    [doc.x, doc.y], [60, 1], { lineHeight: -1 })

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



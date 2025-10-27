const db = require("../models");
const Publications = db.publications;
const PQRS_Master = db.pqrs_masters;
const PQRS_Reply = db.pqrs_replies;
const Op = db.Sequelize.Op;
const nodemailer = require("nodemailer");
const mailerConfig = require("../config/mailer.config");
const fs = require('fs');

// POST
exports.create = (req, res) => {
  // SET OBJECT
  const object = {
    id_publico: (req.body.id_publico ? req.body.id_publico : 0),
    date: (req.body.date ? req.body.date : null),
    pdf_path: "",
    detail: (req.body.detail ? req.body.detail : null),
    subdetail: (req.body.subdetail ? req.body.subdetail : null),
    type: (req.body.type ? req.body.type : 0),
    subtype: (req.body.subtype ? req.body.subtype : null),
    publish: (req.body.publish === 'true' ? 1 : 0),
  };

  // SAVES FILE
  if (req.files[0]) {
    console.log('FILE DETECTED, CHECKING COMPATIBILITY');
    var mimetype = req.files[0].mimetype;
    if (mimetype != 'application/pdf') {
      fs.unlink(req.files[0].path, (err) => {
        console.log('FILE NOT COMPATIBLE, DETELED!');
        if (err) res.send(err);
      });
      res.send('ERROR_2')
    }
    let path = req.files[0].filename;
    path = path.substring(path.indexOf('_') + 1, path.length);
    path = path.substring(path.indexOf('_') + 1, path.length);
    object.pdf_path = path;
  }

  // CREATE OJECT
  Publications.create(object)
    .then(data => {
      console.log('PUBLICATION CREATED!');
      res.send('OK');
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR_5"
      });
    });

};

// GET.
exports.findAll = (req, res) => {
  let _attributes = ['id', 'id_publico', 'date', 'type', 'subtype', 'detail', 'subdetail', 'publish', 'pdf_path'];
  Publications.findAll()
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
  let _attributes = ['id', 'name', 'desc'];
  const id = req.params.id;
  Publications.findByPk(id)
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

  findObj()

  function findObj() {
    const id = req.params.id;
    Publications.findByPk(id)
      .then(data => {
        updateObj(data)
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving DATA with ID=" + id
        });
      });
  }

  function updateObj(data) {
    Publications.update(req.body, {
      where: { id: id }
    }).then(num => {
      if (num == 1) {
        if (data.type != req.body.type) {
          var oldPath = 'docs/publish/' + data.type + '/publish_' + String(data.type).toLocaleLowerCase() + '_' + data.pdf_path
          var newPath = 'docs/publish/' + req.body.type + '/publish_' + String(req.body.type).toLocaleLowerCase() + '_' + data.pdf_path
          
          if (!fs.existsSync('docs/publish/' + req.body.type)){
            fs.mkdirSync('docs/publish/' + req.body.type);
        }
          
          console.log('PUBLISH UPDATED MOVING FILE FROM&TO: ', oldPath, newPath)
          
          
          fs.rename(oldPath, newPath, function (err) {
            if (err) throw err
            console.log('SUCCESSFULLY MOVED')
          })
        }
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

  Publications.findOne({
    where: { id: id },
    attributes: ['pdf_path', 'type'],
  }).then(data => {
    if (!data) es.send(`ERROR NO MATCHING ID`); // NO MATCHING ID

    fs.unlink('docs/publish/' + data.type + '/publish_' + String(data.type).toLocaleLowerCase() + '_' + data.pdf_path, (err) => {
      console.log('FILE FOR ATTACH, DETELED!', id);
      deleteObj();
      if (err) return res.send(err);
    });
  })

  function deleteObj() {
    Publications.destroy({
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

// DELETE ALL
exports.deleteAll = (req, res) => {
  res.json({ message: "This is ROLES DELETE ALL!" });
};

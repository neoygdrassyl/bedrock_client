const db = require("../models");
const Roles = db.roles;
const Op = db.Sequelize.Op;

// POST
exports.create = (req, res) => {
    res.json({ message: "This is ROLES CREATE!" });
};

// GET.
exports.findAll = (req, res) => {
    let _attributes = ['id', 'name', 'desc'];
    Roles.findAll({ attributes: _attributes })
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
    Roles.findByPk(id,{ attributes: _attributes})
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
    res.json({ message: "This is ROLES PUT!" });
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

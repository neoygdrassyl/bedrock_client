const db = require("../models");
const FUN_0 = db.fun_0;
const BOX = db.fun_archive;
const PXA = db.process_x_arch;

const moment = require('moment');
const Queries = require('../config/generalQueries');
const curaduriaInfo = require('../config/curaduria.json');
const { QueryTypes } = require('sequelize');

exports.findAll = (req, res) => {
    BOX.findAll({ include: { model: PXA } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {res.status(500).send({message: err.message || "Some error occurred while retrieving ALL DATA."});
        });
};

exports.findByFun = (req, res) => {
    const id = req.params.id;

    PXA.findAll({
        include: [FUN_0, BOX],
        where: { fun0Id: id }
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

exports.findByBox = (req, res) => {
    const id = req.params.id;

    PXA.findAll({
        include: [BOX, FUN_0],
        where: { funArchiveId: id }
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

exports.search_x = (req, res) => {
    const _public_id = req.params.public_id;

    var query = Queries.LOADFUN1(_public_id)

    db.sequelize.query(query, { type: QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving ALL DATA for SEARCH_X"
            });
        });
};

exports.create_archive = (req, res) => {
    // Create
    var object = {
        box: (req.body.box ? req.body.box : null),
        row: (req.body.row ? req.body.row : null),
        column: (req.body.column ? req.body.column : null),
    }

    BOX.create(object)
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

exports.create_x = (req, res) => {
    let fun0Id = req.body.fun0Id ? req.body.fun0Id : res.send('NOT A REAL PARENT ID');
    let funArchiveId = req.body.funArchiveId ? req.body.funArchiveId : res.send('NOT A REAL PARENT ID');

    // Create
    var object = {
        fun0Id: fun0Id,
        funArchiveId: funArchiveId,
        folder: (req.body.folder ? req.body.folder : null),
        pages: (req.body.pages ? req.body.pages : null),
        json: (req.body.json ? req.body.json : null),
    }

    PXA.create(object)
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

exports.update_archive = (req, res) => {
    const id = req.params.id;
    BOX.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};

exports.update_x = (req, res) => {
    const idFun = req.params.idFun;
    const idBox = req.params.idBox;
    PXA.update(req.body, {
        where: { fun0Id: idFun, funArchiveId: idBox }
    }).then(num => {
        if (num > 0) {
            res.send('OK');
        } else {
            res.send(`ERROR_2 : `+num); // NO MATCHING ID
        }
    })
};

exports.delete = (req, res) => {
    const idFun = req.params.idFun;
    const idBox = req.params.idBox;
    const folder = req.params.folder;
    PXA.destroy({
        where: { fun0Id: idFun, funArchiveId: idBox, folder: folder }
    })
        .then(num => {
            if (num > 0) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};

exports.delete_box = (req, res) => {
    const idFun = req.params.idFun;
    BOX.destroy({
        where: { id: idFun }
    })
        .then(num => {
            if (num == 1) {
                res.send('OK');
            } else {
                res.send(`ERROR_2`); // NO MATCHING ID
            }
        })
};

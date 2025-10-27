const db = require("../models");
const CubXVr = db.cubXvr;

/**
 * Obtener registros por CUB
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.getByCUB = (req, res) => {
    const id = req.params.id;
    CubXVr.findAll(
        { where: { cub: id } }
    )
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving DATA by CUB:" + id
            });
        })
};

/**
 * Obtener registros por VR
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.getByVR = (req, res) => {
    const id = req.params.id;
    CubXVr.findAll(
        { where: { vr: id } }
    )
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving DATA by VR: " + id
            })
        })
};

/**
 * Obtener registros por FUN
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.getByFUN = (req, res) => {
    const id = req.params.id;
    CubXVr.findAll(
        { where: { fun: id } }
    )
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving DATA by FUN:" + id
            });
        })
};

/**
 * Obtener todos los registros de CubXVr
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.getAllCubXVr = (req, res) => {
    CubXVr.findAll()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving ALL DATA"
            });
        })
};

/**
 * Obtener registros por PQRS
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.getByPQRS = (req, res) => {
    const id = req.params.id;
    CubXVr.findAll({ where: { pqrs: id } })
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving DATA with ID =" + id
            });
        });
};

/**
 * Obtener registros por process
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.getByProcess = (req, res) => {
    const process = req.params.process;
    CubXVr.findAll({
        where: {
            process: process
        }
    })
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving DATA with process_id=" + process
            });
        });
};

/**
 * Crear un nuevo registro de CubXVr
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.createCUB_VR = async (req, res) => {
    const getByCUB = (cub) => {
        return CubXVr.findAll({ where: { cub } });
    };
    try {
        const duplicate = await getByCUB(req.body.cub);

        if (duplicate.length > 0) {
            return res.send('ERROR_DUPLICATE');
        }

        // Si no hay duplicado, intenta crear el registro
        const data = {
            cub: req.body.cub,
            vr: req.body.vr,
            fun: req.body.fun,
            pqrs: req.body.pqrs,
            process: req.body.process,
            desc: req.body.desc,
            date: req.body.date
        }
        CubXVr.create(data);
        res.status(200).send('OK');

    } catch (error) {
        console.error("Error en createCUB_VR:", error);
        res.status(500).send({
            message: error.message || "Some error occurred while executing CREATE."
        });
    }
};


/**
 * Actualizar un registro de CubXVr por ID
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
exports.updateCUB_VR = (req, res) => {
    const id = req.params.id;
    CubXVr.update(req.body, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.send('OK');
        } else {
            res.send(`ERROR_2`); // NO MATCHING ID
        }
    })
};


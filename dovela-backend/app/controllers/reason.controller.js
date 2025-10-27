const db = require("../models");
const Reason = db.reason;
const Solicitors = db.solicitors;

exports.create = async (req, res) => {
    try {
        if (!req.body.solicitorId) res.status(400).send({ message: 'ID IS NEEDED' });


        // Get solicitor id pk
        const solicitor = await Solicitors.findOne({
            where: {
                id_doc: req.body.solicitorId
            }
        });
        if (!solicitor) return res.status(400).send({ message: 'Solicitor not found' });

        // Crear el objeto Reason usando el solicitorId encontrado
        const object = {
            starterQuality: req.body.starterQuality ? req.body.starterQuality : null,
            actionType: req.body.actionType ? req.body.actionType : '',
            sub_ActionType: req.body.sub_ActionType ? req.body.sub_ActionType : '',
            comments: req.body.comments ? req.body.comments : '',
            solicitorId: solicitor.id
        };
        Reason.create(object)
            .then(data => {
                res.send('OK');
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving ALL DATA."
                });
            });

    } catch (err) {
        // Manejo de errores
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Reason."
        });
    }
};

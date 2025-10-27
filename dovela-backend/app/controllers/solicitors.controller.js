const db = require("../models");
const Solicitors = db.solicitors;
const SubmitSolicitor = db.submitSolicitor;
const Submit = db.submit;


exports.create = (req, res) => {
  //Get info 
  const object = {
    id_doc: (req.body.id_doc ? req.body.id_doc : res.send(400).send({ message: 'Id is neccessary' })),
    document_type: (req.body.document_type ? req.body.document_type : ''),
    name: (req.body.name ? req.body.name : ''),
    person_type: (req.body.person_type ? req.body.person_type : ''),
    role: (req.body.role ? req.body.role : 'Solicitor'),
    email: (req.body.email ? req.body.email : ''),
    phone: (req.body.phone ? req.body.phone : ''),
    department: (req.body.department ? req.body.department : ''),
    town: (req.body.town ? req.body.town : ''),
    neighborhood: (req.body.neighborhood ? req.body.neighborhood : ''),
    address: (req.body.address ? req.body.address : ''),
  }
  Solicitors.create(object)
    .then(data => {
      res.send('OK');
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
}
// Get All solicitors
exports.getAll = (req, res) => {
  Solicitors.findAll()
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
//Get by id num
exports.getById = (req, res) => {
  const id = req.params.id;
  Solicitors.findOne({
    where: {
      id_doc: id
    },
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
//Get VRs by id num
exports.getVRs = async (req, res) => {
  const id = req.params.id;
  try {
    // Get solicitor id pk
    const solicitor = await Solicitors.findOne({
      where: {
        id_doc: id
      },
    });
    if (!solicitor) return res.status(400).send({ message: 'Solicitor not found' });

    const submitSolicitors = await SubmitSolicitor.findAll({
      where: {
        solicitorId: solicitor.id
      },
      include: Submit // Incluir los Submit asociados
    });

    // Extraer y enviar solo la parte de submit por cada item
    const submits = submitSolicitors.map(submitSolicitor => submitSolicitor.submit);
    res.status(200).json(submits);
  } catch (error) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving ALL DATA."
    });
  }
}

//update
exports.update = (req, res) => {
  const id = req.params.id;
  Solicitors.update(req.body, {
    where: { id_doc: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};
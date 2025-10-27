const db = require("../models");
const Mailbox = db.mailbox;
const Op = db.Sequelize.Op;
const nodemailer = require("nodemailer");
const mailerConfig = require("../config/mailer.config");

// POST
exports.create = (req, res) => {
  const object = {
    name: (req.body.name ? req.body.name : 'ERROR'),
    email: (req.body.email ? req.body.email : 'No se compartio'),
    number: (req.body.number ? req.body.number: 'No se compartio'),
    subject: (req.body.subject ? req.body.subject: 'ERROR'),
    message: (req.body.message ?req.body.message : 'ERROR' ),
  };
  // Create
  Mailbox.create(object)
    .then(data => {
      //if(object.email != 'No se compartio'){
        //confirmMail()
      //}
      confirmMailWorker();
      res.send('OK');
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while executing CREATE."
      });
    });

    // SENDS MAIL OF CONFIRMATION
    /*
    async function confirmMail() {
      let transporter = nodemailer.createTransport(
        mailerConfig.transporter
      );
      let mailOptions = mailerConfig.mailOptions.mailbox;
      mailOptions.to = "tony.caprini@gmail.com" // TO ADD MORE, ADD  , AND THEN THE NEXT EMIAL 
      let info = await transporter.sendMail(mailOptions);
      console.log("Message sent to: ", info.accepted);
    }
    */

     // SENDS MAIL TO INFORM THE WORKER
    async function confirmMailWorker() { // Sends copy of the mesage to a worker
      let transporter = nodemailer.createTransport(
        mailerConfig.transporter
      );
      let mailOptions = mailerConfig.mailOptions.mailbox;
      mailOptions.to = "curaduriaurbana1@gmail.com" // TO ADD MORE, ADD  , AND THEN THE NEXT EMIAL 
      mailOptions.html = `
      <h3>Se ha hecho contrato de forma virtual con la curaduría a través de la página de Contacto</h3>
      <p>Los datos del contacto son: </p>
      <ul>
      <li><p>Nombre: `+ object.name +` </p></li>
      <li><p>Correro: `+ object.email +` </p></li>
      <li><p>Telefono Celular: `+ object.number +` </p></li>
      <li><p>Asunto: `+ object.subject +` </p></li>
      <li><p>Mensaje: `+ object.message +` </p></li>
      </ul>
      <hr />
      <p>Este es un mensaje automático expedido por el sistema interno de la Curaduría.</p>
      `;
      let info = await transporter.sendMail(mailOptions);
      console.log("Message sent to: ", info.accepted);
    }
};

// GET.
exports.findAll = (req, res) => {
    let _attributes = ['id', 'name', 'number', 'email', 'subject', 'message', 'createdAt'];
    Mailbox.findAll({ attributes: _attributes })
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
    let _attributes = ['id', 'name', 'number', 'email', 'subject', 'message', 'createdAt'];
    const id = req.params.id;
    Mailbox.findByPk(id,{ attributes: _attributes})
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
    res.json({ message: "This is PUT!" });
};

// DELETE BY ID
exports.delete = (req, res) => {
    res.json({ message: "This is DELETE BY ID!" });
};

// DELETE ALL
exports.deleteAll = (req, res) => {
    res.json({ message: "This is DELETE ALL!" });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
    res.json({ message: "This is FIND PUBLISHED!" });
};

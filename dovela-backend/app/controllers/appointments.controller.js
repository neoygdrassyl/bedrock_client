const db = require("../models");
const Appointments = db.appointments;
const Op = db.Sequelize.Op;
const nodemailer = require("nodemailer");
const mailerConfig = require("../config/mailer.config");
const variables = require('../config/variables.global')

// POST
exports.create = (req, res) => {
  const worker_id = (req.body.worker_id ? req.body.worker_id : 0);
  const worker_email =  variables.WORKERS_INFO[worker_id].email_work;
  const worker_email_2 =  variables.WORKERS_INFO[worker_id].email;
  const worker_name = variables.WORKERS_INFO[worker_id].name;
  //console.log("worker_id ", worker_id);
  //console.log("worer_email ", worker_email);
  const object = {
    name: (req.body.name ? req.body.name : 'ERROR'),
    type_id: (req.body.type_id ? req.body.type_id : 0 ), // intenger
    number_id: (req.body.number_id ? req.body.number_id: 'ERROR'), 
    profesional: (req.body.worker_name ? req.body.worker_name: 'ERROR'),
    profesional_id: worker_id, // intenger
    email: (req.body.email ?req.body.email : 'ERROR' ),
    number_mobile: (req.body.number_mobile ?req.body.number_mobile : 'ERROR' ),
    date: (req.body.date ? req.body.date :0 ), // intenger
    time: (req.body.time ? req.body.time : 'ERROR' ),
    motive: (req.body.motive ? req.body.motive : 'ERROR' ),
    content: (req.body.content ?req.body.content : 'ERROR' ),
    appointment_type: (req.body.appointment_type ? 1 : 0 ), // intenger
    accesibility: (req.body.accesibility ? 1 : 0 ), // 
  };
  // Create
  Appointments.create(object)
    .then(data => {
      // confirmMail();
      // confirmMailWorker();
      console.log("CREATED APPOINTMENT");
      res.send('OK');
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while executing CREATE."
      });
    });

    // SENDS MAIL OF CONFIRMATION
    async function confirmMail() {
      let transporter = nodemailer.createTransport(
        mailerConfig.transporter
      );
      let mailOptions = mailerConfig.mailOptions.mailbox;
      mailOptions.to = object.email // TO ADD MORE, ADD  , AND THEN THE NEXT EMIAL 
      mailOptions.html = ` 
      <h3>Este es un mensaje de la Curaduría  N°1 de Bucaramanga.</h3>
      <p>Se ha procesado su formulario de cita correctamente con los siguientes datos:</p>
      <ul>
      <li>Fecha: ` + object.date +`</li>
      <li>Hora: ` + object.time +`</li>
      <li>Formato: ` + (object.appointment_type ? 'Presencial': 'Virtual' ) +`</li>
      <li>Profesional: ` + object.profesional +`</li>
      <liTipo de Cita: ` + object.motive +`</li>
      <li>Motivo de la cita: ` + object.content +`</li>
      </ul>
      <p>La cita tendrá tener una duración de 20 minutos.</p>
      <p>Si su cita es Presencial, recuerde que la dirección de la Curaduría es: Calle 36 # 31-39 Centro Empresarial Chicamocha - Local 101 </p>
      <p>En caso de ser virtual, se usará sus datos de Correo y Número Celular para contactarlo.</p>
      <br/>
      <p>Este es un mensaje automático expedido por el sistema interno de la Curaduría.</p>
      `;
      console.log("ATTEMPTING TO SEND EMAIL TO: ", object.email);
      let info = await transporter.sendMail(mailOptions, function (info, err) {
        if (info) {
          console.log("OK, Message Sent to: ", info);
        }
        if (err) {
          if(err.accepted){
            console.log("Err, Message Sent to: ", err.accepted);
          }else if(err.rejected){
            console.log("Err, Message could NOT be send: ", err.rejected);
          }
        }

      });
    }

    // SENDS MAIL OF CONFIRMATION TO WORKER
    async function confirmMailWorker() {
      let transporter = nodemailer.createTransport(
        mailerConfig.transporter
      );
      let mailOptions = mailerConfig.mailOptions.mailbox;
      mailOptions.to = worker_email // TO ADD MORE, ADD  , AND THEN THE NEXT EMIAL 
      mailOptions.html = ` 
      <h3>Este es un mensaje de la Curaduría  N°1 de Bucaramanga.</h3>
      <p>Se ha agendado una cita a través de la página web.</p>
      <p>Detalles de la cita:</p>
      <ul>
      <li>Fecha: ` + object.date +`</li>
      <li>Hora: ` + object.time +`</li>
      <li>Formato: ` + (object.appointment_type ? 'Presencial': 'Virtual' ) +`</li>
      <li>Profesional: ` + object.profesional +`</li>
      <liTipo de Cita: ` + object.motive +`</li>
      <li>Motivo de la cita: ` + object.content +`</li>
      </ul>
      <p>Información del Solicitante:</p>
      <ul>
      <li>Nombre y Apellido(s): ` + object.name +`</li>
      <li>Tipo de Documento: ` + variables.PQRS_TYPE_ID_ARRAY[object.type_id] +`</li>
      <li>Número de Documento: ` + object.number_id +`</li>
      <li>Correo: ` + object.email +`</li>
      <li>Número de Contacto: ` + object.number_mobile +`</li>
      <br/>
      <p>Este es un mensaje automático expedido por el sistema interno de la Curaduría.</p>
      </ul>
      `;
      console.log("ATTEMPTING TO SEND EMAIL TO: " + worker_email);
      let info = await transporter.sendMail(mailOptions, function (info, err) {
        if (info) {
          console.log("OK, Message Sent to: ", info);
        }
        if (err) {
          if(err.accepted){
            console.log("Err, Message Sent to: ", err.accepted);
          }else if(err.rejected){
            console.log("Err, Message could NOT be send: ", err.rejected);
          }
        }

      });
    }
};

// GET.
exports.findAll = (req, res) => { 
  let _attributes = ['id', 'name', 'type_id', 'number_id', 'profesional', 'email', 'number_mobile', 'date', 'time', 'motive', 'content', 'appointment_type', 'details', 'accesibility'];
  Appointments.findAll({ attributes: _attributes })
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
    Appointments.findByPk(id)
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
exports.findaAviailAbleDate = (req, res) => {
  const _profesional = (req.body.profesional ? req.body.profesional : 0);
  const _date = (req.body.date ? req.body.date : "");
  const _time = (req.body.time ? req.body.time : "");

  Appointments.findAll({where : {
      profesional:   {[Op.like]: `%`+_profesional+`%`},
      date : _date,
      time: _time
  }
}).then(data => {
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
  Appointments.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// DELETE BY ID
exports.delete = (req, res) => {
    res.json({ message: "This is DELETE BY ID!" });
};

// DELETE ALL
exports.deleteAll = (req, res) => {
    res.json({ message: "This is DELETE ALL!" });
};

// CHECKS IF A DATE IS EMPTY FOR THE APPOINTMENT PAGE
exports.findAllPublished = (req, res) => {
  let _date = req.params.date;
  let _profesional_id = req.params.profesional_id;
  let _attributes = ['date', 'profesional_id'];
  Appointments.findAll({ attributes: _attributes, where: { date: _date, profesional_id: _profesional_id } })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving data."
    });
  });
};

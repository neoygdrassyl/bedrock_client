const db = require("../models");
const PQRS_Ma = db.pqrs_masters;
const PQRS_So = db.pqrs_solicitors;
const PQRS_At = db.pqrs_attachs;
const PQRS_Ct = db.pqrs_contacts;
const PQRS_Wk = db.pqrs_workers;
const PQRS_Fun = db.pqrs_fun;
const PQRS_Law = db.pqrs_law;
const PQRS_Tim = db.pqrs_time;
const PQRS_Inf = db.pqrs_info;
const PQRS_Step = db.pqrs_step;
const USERS = db.users;
const Op = db.Sequelize.Op;

const Users = db.users;

const fs = require('fs');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const nodemailer = require("nodemailer");
const mailerConfig = require("../config/mailer.config");
const Queries = require('../config/generalQueries')
const curaduriaInfo = require('../config/curaduria.json')
const { QueryTypes } = require('sequelize');

const ALLOWED_EXT = [
  'image/jpg', 'image/jpeg', 'image/png', 'application/pdf', 'application/pln', 'application/dwg', 'application/rvp',
]

exports.create = (req, res) => {
  //GET THE OBJECTS FRMO THE FORM TO ADD TO THE VARIOUS MODELS

  const id_public = (req.body.master_id_publico ? req.body.master_id_publico : '');
  const vr = (req.body.master_id_global ? req.body.master_id_global : '');;

  var pqrs_master_id;
  // OBJECT FOR PQRS MASTER
  const object_master = {
    id_publico: id_public,
    content: (req.body.master_content ? req.body.master_content : ''),
    type: (req.body.master_type ? req.body.master_type : ''),
    status: 0,
    keywords: (req.body.master_keywords ? req.body.master_keywords : ''),
    worker_creator: (req.body.worker_creator ? req.body.worker_creator : ''),
    id_global: (req.body.master_id_global ? req.body.master_id_global : ''),
    id_correspondency: (req.body.master_id_correspondency ? req.body.master_id_correspondency : ''),
  };

  // OBJECT FOR INFO
  const object_info = {
    radication_channel: (req.body.info_radication_chanel ? req.body.info_radication_chanel : ''),
    pqrsMasterId: "",
  };

  // OBJECT FOR TIME
  const object_time = {
    time: (req.body.time_time ? req.body.time_time : ''),
    creation: (req.body.time_creation ? req.body.time_creation : ''),
    legal: (req.body.time_legal ? req.body.time_legal : ''),
    pqrsMasterId: "",
  };

  // OBJECTS FOR SOLICITORS
  // THERE CAN BE AT LEAST 1 SOLICITOR AND MANY MORE
  // IT RECIEVES A STRING WITH ALL THE DIFFERENT VALUES OF SOLICITORS SEPARATED BY A ,
  // THEN IT GOES IN A FOR CICLE SEPARATING EACH VALUE BY THE , AND ADDING IT TO A ARRAY OBJECT TO LATER BE PUSH INTO THE DB
  var solicitors_array = [];
  let solicitors_length = (req.body.solicitors_length ? req.body.solicitors_length : 0);
  let str_solicitor_name = (req.body.solicitor_name ? req.body.solicitor_name : "");
  let str_solicitor_type = (req.body.solicitor_type ? req.body.solicitor_type : "");
  let str_solicitor_id_number = (req.body.solicitor_id_number ? req.body.solicitor_id_number : "");
  let str_solicitor_type_id = (req.body.solicitor_type_id ? req.body.solicitor_type_id : "");

  let aray_solicitor_name = str_solicitor_name.split(",");
  let aray_solicitor_type = str_solicitor_type.split(",");
  let aray_solicitor_id_number = str_solicitor_id_number.split(",");
  let aray_solicitor_type_id = str_solicitor_type_id.split(",");

  for (var i = 0; i < solicitors_length; i++) {
    var object_solicitor = {
      name: aray_solicitor_name[i],
      type: aray_solicitor_type[i],
      id_number: aray_solicitor_id_number[i],
      type_id: aray_solicitor_type_id[i],
      pqrsMasterId: "",
    };
    solicitors_array.push(object_solicitor);
  }

  // OBJECTS FOR CONTACTS
  // THERE CAN BE AT LEAST 1 CONTACT AND MANY MORE
  // IT RECIEVES A STRING WITH ALL THE DIFFERENT VALUES OF CONTACTS SEPARATED BY A ,
  // THEN IT GOES IN A FOR CICLE SEPARATING EACH VALUE BY THE , AND ADDING IT TO A ARRAY OBJECT TO LATER BE PUSH INTO THE DB
  var contacts_array = [];
  let contact_length = (req.body.contacts_length ? req.body.contacts_length : 0);
  let str_contact_address = (req.body.contact_address ? req.body.contact_address : "");
  let str_contact_neighbour = (req.body.contact_neighbour ? req.body.contact_neighbour : "");
  let str_contact_phone = (req.body.contact_phone ? req.body.contact_phone : "");
  let str_contact_state = (req.body.contact_state ? req.body.contact_state : "");
  let str_contact_county = (req.body.contact_county ? req.body.contact_county : "");
  let str_contact_email = (req.body.contact_email ? req.body.contact_email : "");
  let str_contact_check = (req.body.contact_check ? req.body.contact_check : "");

  let aray_contact_address = str_contact_address.split(",");
  let aray_contact_neighbour = str_contact_neighbour.split(",");
  let aray_sontact_phone = str_contact_phone.split(",");
  let aray_contact_state = str_contact_state.split(",");
  let aray_contact_county = str_contact_county.split(",");
  let aray_contact_email = str_contact_email.split(",");
  let aray_contact_check = str_contact_check.split(",");

  for (var i = 0; i < contact_length; i++) {
    var object_contact = {
      address: aray_contact_address[i],
      neighbour: aray_contact_neighbour[i],
      phone: aray_sontact_phone[i],
      email: aray_contact_email[i],
      state: aray_contact_state[i],
      county: aray_contact_county[i],
      notify: aray_contact_check[i] == 'true' ? 1 : 0,
      pqrsMasterId: "",
    };
    contacts_array.push(object_contact);
  }

  // OBJECT FOR FUN
  // IT CAN BE CHECKED OR NOT, IF NOT, PROCEED TO NEXT AND INGORE THIS SETP
  // IF CHECKED, THERE MUST BE AND OBJECT ADDED TO THE PILE
  var licence_check = (req.body.licence_check === "true" ? true : false);
  var object_fun = {};
  if (licence_check) {
    object_fun = {
      id_public: (req.body.fun_id_public ? req.body.fun_id_public : ''),
      person: (req.body.fun_person ? req.body.fun_person : ''),
      catastral: (req.body.fun_catastral ? req.body.fun_catastral : ''),
      pqrsMasterId: "",
    };
  }

  // OBJECTS FOR FILES
  // THEY CAN BE FROM 0 TO MANY
  // THE FORM DOES NOT ADD THE FILES INTO A SINGLE FILE OBJECT, BUT RATHER ADD MANY FILE OBJECTS AS WAS NEEDED
  // THIS MEANS EACH FILE OBJECT IS IDENTIFIED IN THE FORMS OBJECT AS: file_i WHERE i IS EACH OF THE FILES...
  // GOING FROM 0 TO AS MANY AS NEEDED
  // IF THERE IS AT LEAST ONE FILE, ADD TO THE OBJECT IN A FOR CICLE
  // IF THERE IS NOT FILES, PROCEED TO NEXT AND IGNORE THIS STEP
  var attachs_array = [];
  let attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);
  let str_public_names = (req.body.files_names ? req.body.files_names : "");
  let aray_public_names = str_public_names.split(",");
  if (attachs_length) {
    for (var i = 0; i < attachs_length; i++) {

      var mimetype = req.files[i].mimetype;
      if (!ALLOWED_EXT.includes(mimetype)) {
        fs.unlink(req.files[i].path, (err) => {
          console.log('FILE NOT COMPATIBLE, DETELED!');
          if (err) res.send(err);
        });
        res.send('ERROR_2')
      } else {
        const object_attach = {
          type: req.files[i].mimetype,
          name: req.files[i].filename,
          path: req.files[i].path,
          public_name: aray_public_names[i],
          class: 0, // 0 = ATTACH, 1 = EXIT DOCUMENT
          pqrsMasterId: "",
        };
        attachs_array.push(object_attach);
      }
    }
  }

  // OBJECT FOR LAW
  // CREATES AN EMPTY OJECT FOR THIS MODEL, THIS IS DONE SO LATER ON THE SYSTEM CAN USE IT FOR MANY PURPOSES
  var object_law = {
    extension: 0,
    sent_email_confirmation: 0,
    sent_email_reply: 0,
    pqrsMasterId: "",
  }

  checkID();

  function checkID() {
    if (id_public) {

      let query = `
      SELECT pqrs_masters.id_publico 
      FROM pqrs_masters
      WHERE pqrs_masters.id_publico LIKE '${id_public}'
      `;

      db.sequelize.query(query, { type: QueryTypes.SELECT })
        .then(data => {
          if (data.length > 0) return res.send("ERROR_DUPLICATE");
          else checkVR()
        })
        .catch(err => {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving ALL DATA."
          });
        });
    } else checkVR()
  }

  function checkVR() {
    if (vr) {
      let query = Queries.validateCopyVR(vr)

      db.sequelize.query(query, { type: QueryTypes.SELECT })
        .then(data => {
          if (data.length) return res.send("ERROR_DUPLICATE");
          else createPQRS()
        })
        .catch(err => {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving ALL DATA."
          });
        });
    } else createPQRS()
  }

  // CREATES THE PQRS MASTER
  // THIS NEEDS TO BE DONE IN ORDER TO OBTAIN THE ID OF THE INSERT SO THIS CAN BE USED LATER FOR THE OTHER OBJECTS.
  function createPQRS() {
    PQRS_Ma.create(object_master)
      .then(data => {
        console.log('CREATED NEW PQRS MASTER');
        findPqrsMasterID();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "ERROR_5"
        });
      });
  }

  async function findPqrsMasterID() {
    const { QueryTypes } = require('sequelize');
    var query = `
   SELECT MAX(pqrs_masters.id)  AS id
    FROM pqrs_masters
    `;

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        console.log('PQRS MASTER ID RETRIEVED', data[0].id);
        pqrs_master_id = data[0].id;
        createObjects();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving MASTER ID."
        });
      });
  }

  // ONCE THE PQRS MASTER IS CREATED, IF WILL PROCEED TO ADD THE ID TO THE OBJECTS AND ADD THE OBJECT TO THE DB
  // THIS IS DONE SEQUENTIALLY SO TO MAKE SURE ERYTHING IS ADD CORRECTLY
  // THIS IS DONDE CONSIDERING THE FUNCTION res.send(string) AUTOMATICALLY STOPS THE EXECUTION OF THE REST OF THE CODE
  // AND MAY PREVENT THE OTHER OBJECTS FROM BEING ADDED.
  function createObjects() {
    object_info.pqrsMasterId = pqrs_master_id;
    object_time.pqrsMasterId = pqrs_master_id;
    object_law.pqrsMasterId = pqrs_master_id;
    for (var i = 0; i < solicitors_array.length; i++) {
      solicitors_array[i].pqrsMasterId = pqrs_master_id;
    }
    for (var i = 0; i < contacts_array.length; i++) {
      contacts_array[i].pqrsMasterId = pqrs_master_id;
    }
    if (licence_check) {
      object_fun.pqrsMasterId = pqrs_master_id;
    }
    for (var i = 0; i < attachs_array.length; i++) {
      attachs_array[i].pqrsMasterId = pqrs_master_id;
    }
    createObject_info();
  }

  async function createObject_info() {
    PQRS_Inf.create(object_info)
      .then(data => {
        console.log('CREATED PQRS - INFO');
        createObject_time();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO INFO CREATED"
        });
      });
  }

  async function createObject_time() {
    PQRS_Tim.create(object_time)
      .then(data => {
        console.log('CREATED PQRS - TIME');
        createObject_solicitor();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO TIME CREATED"
        });
      });
  }

  async function createObject_solicitor() {
    PQRS_So.bulkCreate(solicitors_array)
      .then(data => {
        console.log('CREATED PQRS - SOLICITORS');
        createObject_contact();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO SOLICITORS CREATED"
        });
      });
  }

  async function createObject_contact() {
    PQRS_Ct.bulkCreate(contacts_array)
      .then(data => {
        console.log('CREATED PQRS - CONTACTS');
        createObject_fun();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO CONTACTS CREATED"
        });
      });


  }

  async function createObject_fun() {
    if (licence_check) {
      PQRS_Fun.create(object_fun)
        .then(data => {
          console.log('CREATED PQRS - FUN');
          createObject_doc();
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "NO FUN CREATED"
          });
        });
    } else {
      createObject_doc();
    }

  }

  async function createObject_doc() {
    PQRS_At.bulkCreate(attachs_array)
      .then(data => {
        console.log('CREATED PQRS - ATTACHS');
        createObject_law();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO ATTACHS CREATED"
        });
      });
  }

  async function createObject_law() {
    PQRS_Law.create(object_law)
      .then(data => {
        console.log('CREATED PQRS - LAW');
        console.log('CREATION OF PQRS -DONE-');
        res.send("OK");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO ATTACHS CREATED"
        });
      });
  }

};

exports.create_public = (req, res) => {
  var pqrs_master_id;

  // OBJECT FOR PQRS MASTER
  var object_master = {
    content: (req.body.master_content ? req.body.master_content : ''),
    status: 0,
    type: (req.body.master_type ? req.body.master_type : ''),
  };

  // OBJECT FOR INFO
  var object_info = {
    radication_channel: (req.body.info_radication_chanel ? req.body.info_radication_chanel : ''),
    pqrsMasterId: "",
  };

  // OBJECT FOR TIME
  var object_time = {
    time: (req.body.time_time ? req.body.time_time : ''),
    creation: (req.body.time_creation ? req.body.time_creation : ''),
    legal: (req.body.time_legal ? req.body.time_legal : ''),
    pqrsMasterId: "",
  };

  // OBJECTS FOR SOLICITORS
  // THERE CAN BE AT LEAST 1 SOLICITOR AND MANY MORE
  // IT RECIEVES A STRING WITH ALL THE DIFFERENT VALUES OF SOLICITORS SEPARATED BY A ,
  // THEN IT GOES IN A FOR CICLE SEPARATING EACH VALUE BY THE , AND ADDING IT TO A ARRAY OBJECT TO LATER BE PUSH INTO THE DB
  var solicitors_array = [];
  let solicitors_length = (req.body.solicitors_length ? req.body.solicitors_length : 0);
  let str_solicitor_name = (req.body.solicitor_name ? req.body.solicitor_name : "");
  let str_solicitor_type = (req.body.solicitor_type ? req.body.solicitor_type : "");
  let str_solicitor_id_number = (req.body.solicitor_id_number ? req.body.solicitor_id_number : "");
  let str_solicitor_type_id = (req.body.solicitor_type_id ? req.body.solicitor_type_id : "");

  let aray_solicitor_name = str_solicitor_name.split(",");
  let aray_solicitor_type = str_solicitor_type.split(",");
  let aray_solicitor_id_number = str_solicitor_id_number.split(",");
  let aray_solicitor_type_id = str_solicitor_type_id.split(",");

  for (var i = 0; i < solicitors_length; i++) {
    var object_solicitor = {
      name: aray_solicitor_name[i],
      type: aray_solicitor_type[i],
      id_number: aray_solicitor_id_number[i],
      type_id: aray_solicitor_type_id[i],
      pqrsMasterId: "",
    };
    solicitors_array.push(object_solicitor);
  }

  // OBJECTS FOR CONTACTS
  // THERE CAN BE AT LEAST 1 CONTACT AND MANY MORE
  // IT RECIEVES A STRING WITH ALL THE DIFFERENT VALUES OF CONTACTS SEPARATED BY A ,
  // THEN IT GOES IN A FOR CICLE SEPARATING EACH VALUE BY THE , AND ADDING IT TO A ARRAY OBJECT TO LATER BE PUSH INTO THE DB
  var contacts_array = [];
  let contact_length = (req.body.contacts_length ? req.body.contacts_length : 0);
  let str_contact_address = (req.body.contact_address ? req.body.contact_address : "");
  let str_contact_neighbour = (req.body.contact_neighbour ? req.body.contact_neighbour : "");
  let str_contact_phone = (req.body.contact_phone ? req.body.contact_phone : "");
  let str_contact_state = (req.body.contact_state ? req.body.contact_state : "");
  let str_contact_county = (req.body.contact_county ? req.body.contact_county : "");
  let str_contact_email = (req.body.contact_email ? req.body.contact_email : "");
  let str_contact_check = (req.body.contact_check ? req.body.contact_check : "");

  let aray_contact_address = str_contact_address.split(",");
  let aray_contact_neighbour = str_contact_neighbour.split(",");
  let aray_sontact_phone = str_contact_phone.split(",");
  let aray_contact_state = str_contact_state.split(",");
  let aray_contact_county = str_contact_county.split(",");
  let aray_contact_email = str_contact_email.split(",");
  let aray_contact_check = str_contact_check.split(",");

  for (var i = 0; i < contact_length; i++) {
    var object_contact = {
      address: aray_contact_address[i],
      neighbour: aray_contact_neighbour[i],
      phone: aray_sontact_phone[i],
      email: aray_contact_email[i],
      state: aray_contact_state[i],
      county: aray_contact_county[i],
      notify: aray_contact_check[i] == 'true' ? 1 : 0,
      pqrsMasterId: "",
    };
    contacts_array.push(object_contact);
  }

  // OBJECT FOR FUN
  // IT CAN BE CHECKED OR NOT, IF NOT, PROCEED TO NEXT AND INGORE THIS SETP
  // IF CHECKED, THERE MUST BE AND OBJECT ADDED TO THE PILE
  var object_fun = {};

  object_fun = {
    id_public: (req.body.fun_id_public ? req.body.fun_id_public : ""),
    person: (req.body.fun_person ? req.body.fun_person : ""),
    catastral: (req.body.fun_catastral ? req.body.fun_catastral : ""),
    pqrsMasterId: "",
  };

  // OBJECTS FOR FILES
  // THEY CAN BE FROM 0 TO MANY
  // THE FORM DOES NOT ADD THE FILES INTO A SINGLE FILE OBJECT, BUT RATHER ADD MANY FILE OBJECTS AS WAS NEEDED
  // THIS MEANS EACH FILE OBJECT IS IDENTIFIED IN THE FORMS OBJECT AS: file_i WHERE i IS EACH OF THE FILES...
  // GOING FROM 0 TO AS MANY AS NEEDED
  // IF THERE IS AT LEAST ONE FILE, ADD TO THE OBJECT IN A FOR CICLE
  // IF THERE IS NOT FILES, PROCEED TO NEXT AND IGNORE THIS STEP
  var attachs_array = [];
  let attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);
  let str_public_names = (req.body.files_names ? req.body.files_names : "");
  let aray_public_names = str_public_names.split(",");
  if (attachs_length) {
    for (var i = 0; i < attachs_length; i++) {

      var mimetype = req.files[i].mimetype;
      if (!ALLOWED_EXT.includes(mimetype)) {
        fs.unlink(req.files[i].path, (err) => {
          console.log('FILE NOT COMPATIBLE, DETELED!');
          if (err) res.send(err);
        });
        res.send('ERROR_2')
      } else {
        const object_attach = {
          type: req.files[i].mimetype,
          name: req.files[i].filename,
          path: req.files[i].path,
          public_name: aray_public_names[i],
          class: 0, // 0 = ATTACH, 1 = EXIT DOCUMENT
          pqrsMasterId: "",
        };
        attachs_array.push(object_attach);
      }
    }
  }

  // OBJECT FOR LAW
  // CREATES AN EMPTY OJECT FOR THIS MODEL, THIS IS DONE SO LATER ON THE SYSTEM CAN USE IT FOR MANY PURPOSES
  var object_law = {
    extension: 0,
    sent_email_confirmation: 0,
    sent_email_reply: 0,
    pqrsMasterId: "",
  }

  // CREATES THE PQRS MASTER
  // THIS NEEDS TO BE DONE IN ORDER TO OBTAIN THE ID OF THE INSERT SO THIS CAN BE USED LATER FOR THE OTHER OBJECTS.
  PQRS_Ma.create(object_master)
    .then(data => {
      console.log('CREATED NEW PQRS MASTER');
      findPqrsMasterID();
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR_5"
      });
    });

  async function findPqrsMasterID() {
    const { QueryTypes } = require('sequelize');
    var query = `
   SELECT MAX(pqrs_masters.id)  AS id
    FROM pqrs_masters
    `;

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        console.log('PQRS MASTER ID RETRIEVED', data[0].id);
        pqrs_master_id = data[0].id;
        createObjects();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving MASTER ID."
        });
      });
  }

  // ONCE THE PQRS MASTER IS CREATED, IF WILL PROCEED TO ADD THE ID TO THE OBJECTS AND ADD THE OBJECT TO THE DB
  // THIS IS DONE SEQUENTIALLY SO TO MAKE SURE ERYTHING IS ADD CORRECTLY
  // THIS IS DONDE CONSIDERING THE FUNCTION res.send(string) AUTOMATICALLY STOPS THE EXECUTION OF THE REST OF THE CODE
  // AND MAY PREVENT THE OTHER OBJECTS FROM BEING ADDED.
  function createObjects() {
    object_info.pqrsMasterId = pqrs_master_id;
    object_time.pqrsMasterId = pqrs_master_id;
    object_law.pqrsMasterId = pqrs_master_id;
    for (var i = 0; i < solicitors_array.length; i++) {
      solicitors_array[i].pqrsMasterId = pqrs_master_id;
    }
    for (var i = 0; i < contacts_array.length; i++) {
      contacts_array[i].pqrsMasterId = pqrs_master_id;
    }

    object_fun.pqrsMasterId = pqrs_master_id;

    for (var i = 0; i < attachs_array.length; i++) {
      attachs_array[i].pqrsMasterId = pqrs_master_id;
    }
    createObject_info();
  }

  async function createObject_info() {
    PQRS_Inf.create(object_info)
      .then(data => {
        console.log('CREATED PQRS - INFO');
        createObject_time();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO INFO CREATED"
        });
      });
  }

  async function createObject_time() {
    PQRS_Tim.create(object_time)
      .then(data => {
        console.log('CREATED PQRS - TIME');
        createObject_solicitor();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO TIME CREATED"
        });
      });
  }

  async function createObject_solicitor() {
    PQRS_So.bulkCreate(solicitors_array)
      .then(data => {
        console.log('CREATED PQRS - SOLICITORS');
        createObject_contact();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO SOLICITORS CREATED"
        });
      });
  }

  async function createObject_contact() {
    PQRS_Ct.bulkCreate(contacts_array)
      .then(data => {
        console.log('CREATED PQRS - CONTACTS');
        createObject_fun();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO CONTACTS CREATED"
        });
      });


  }

  async function createObject_fun() {
    PQRS_Fun.create(object_fun)
      .then(data => {
        console.log('CREATED PQRS - FUN');
        createObject_doc();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO FUN CREATED"
        });
      });
  }

  async function createObject_doc() {
    PQRS_At.bulkCreate(attachs_array)
      .then(data => {
        console.log('CREATED PQRS - ATTACHS');
        createObject_law();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO ATTACHS CREATED"
        });
      });
  }

  async function createObject_law() {
    PQRS_Law.create(object_law)
      .then(data => {
        console.log('CREATED PQRS - LAW');
        console.log('CREATION OF PQRS -DONE-');
        getEmailsToWorkers();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO ATTACHS CREATED"
        });
      });
  }

  // CREATION OF PQRS, INFORMING TO THE WORKERS VIA EMAIL
  function getEmailsToWorkers() {
    sendEmailToWorker(curaduriaInfo.pqrs_email);

  }

  function sendEmailToWorker(email_list) {
    if (email_list) {
      let email_body = `Funcionario de la Curaduría Urbana N°1 de Bucaramanga, Este es un mensaje automático del sistema 
      de la Curaduria Urbana N°1 de Bucaramanga, 
      informándole de la generación automática de una nueva Petición (PQRS) en el sistema, 
      actualmente esta petición se encuentra en el sistema lista para ser procesada.`.replace(/[\n\r]+ */g, ' ');


      console.log('ATTEMTING TO SEND AN EMAIL TO:', email_list);

      let transporter = nodemailer.createTransport(
        mailerConfig.transporter
      );
      let mailOptions = mailerConfig.mailOptions.pqrs;
      mailOptions.from = 'Curaduria Urbana N° 1 de Bucaramanga <noreply@curaduria1bucaramanga.com>';
      mailOptions.subject = "Curaduria 1 Bucaramanga - Nueva Peticion PQRS";
      mailOptions.to = email_list;
      mailOptions.cc = 'sentpqrs@curaduria1bucaramanga.com';
      mailOptions.html = email_body;

      mailOptions.dsn = {
        id: 'STATUS DELIVERY',
        return: 'headers',
        notify: ['failure', 'delay'],
        recipient: 'nodelivery@curaduria1bucaramanga.com'
      }

      transporter.sendMail(mailOptions, function (info, err) {
        if (info) {
          console.log("OK, Message Sent to: ", info);
        }
        if (err) {
          console.log("GENERAL ERROR SENDING EMAIL: ");
          console.log(err);
          if (err.messageId) console.log("Err, Message messageId: ", err.accepted);
          if (err.envelope) console.log("Err, Message envelope : ", err.accepted);
          if (err.accepted) console.log("Err, Message accepted: ", err.accepted);
          if (err.rejected) console.log("Err, Message rejected: ", err.rejected);
          if (err.pending) console.log("Err, Message pending: ", err.pending);
          if (err.response) console.log("Err, Message response, last response from server: ", err.rejected);
        }
      })
    }

    sendEmailToContacts();
  }

  function sendEmailToContacts() {
    let email_list = [];
    console.log("PRINTING CONTACT LIST: ", contacts_array)
    for (var i = 0; i < contacts_array.length; i++) {
      if (contacts_array[i].notify) email_list.push(contacts_array[i].email);
    }
    email_list = email_list.join(',');

    if (email_list.length) {
      let email_body = `
      La curaduría urbana uno de Bucaramanga, se permite acusar recibo de su correo electrónico. En
      el transcurso de 24 horas contado a partir de la recepción de este correo, se le comunica 
      el respectivo consecutivo del área jurídica. Una vez asignado el número de radicado 
      podrá acceder al seguimiento de la misma, en nuestra página web
      https://www.curaduria1bucaramanga.com/. Los correos electrónicos recibidos después de las 4:00 p.m. se radicarán
      al día hábil siguiente de su recepción y se tomará esa fecha para el inicio de términos.
    .`.replace(/[\n\r]+ */g, ' ');

      console.log('ATTEMTING TO SEND AN EAIL TO:', email_list);

      let transporter = nodemailer.createTransport(
        mailerConfig.transporter
      );
      let mailOptions = mailerConfig.mailOptions.pqrs;
      mailOptions.from = 'Curaduria Urbana N° 1 de Bucaramanga <noreply@curaduria1bucaramanga.com>';
      mailOptions.subject = "Confirmación de Recibido";
      mailOptions.to = email_list;
      mailOptions.cc = 'sentpqrs@curaduria1bucaramanga.com';
      mailOptions.html = email_body;

      mailOptions.dsn = {
        id: 'STATUS DELIVERY',
        return: 'headers',
        notify: ['failure', 'delay'],
        recipient: 'nodelivery@curaduria1bucaramanga.com'
      }

      transporter.sendMail(mailOptions, function (info, err) {
        if (info) {
          console.log("OK, Message Sent to: ", info);
        }
        if (err) {
          console.log("GENERAL ERROR SENDING EMAIL: ");
          //console.log(err);
          if (err.messageId) console.log("Err, Message messageId: ", err.accepted);
          if (err.envelope) console.log("Err, Message envelope : ", err.accepted);
          if (err.accepted) console.log("Err, Message accepted: ", err.accepted);
          if (err.rejected) console.log("Err, Message rejected: ", err.rejected);
          if (err.pending) console.log("Err, Message pending: ", err.pending);
          if (err.response) console.log("Err, Message response, last response from server: ", err.rejected);
        }
      })
      res.send("OK");

    } else {
      res.send("OK");
    }


  }

};

exports.createWorker = (req, res) => {

  const pqrsMasterId = (req.body.pqrsMasterId ? req.body.pqrsMasterId : res.send('NOT A REAL PARENT ID'));

  var object = {
    pqrsMasterId: pqrsMasterId,
    name: (req.body.name ? req.body.name : null),
    competence: (req.body.competence ? req.body.competence : null),
    asign: (req.body.asign ? req.body.asign : null),
    worker_id: (req.body.worker_id ? req.body.worker_id : null),
  }

  PQRS_Wk.create(object)
    .then(data => {
      res.send('OK')
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR_5 NO ABLE TO POST WORKER"
      });
    });

}
exports.create_solicitor = (req, res) => {
  object = {
    pqrsMasterId: (req.body.pqrsMasterId ? req.body.pqrsMasterId : res.send('NOT A REAL PARENT ID')),
    name: (req.body.name ? req.body.name : ''),
    type: (req.body.type ? req.body.type : ''),
    id_number: (req.body.id_number ? req.body.id_number : ''),
    type_id: (req.body.type_id ? req.body.type_id : ''),
  };

  PQRS_So.create(object)
    .then(data => {
      res.send('OK')
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR NO ABLE TO CREATE"
      });
    });

}
exports.create_contact = (req, res) => {
  object = {
    pqrsMasterId: (req.body.pqrsMasterId ? req.body.pqrsMasterId : res.send('NOT A REAL PARENT ID')),
    address: (req.body.address ? req.body.address : ''),
    neighbour: (req.body.neighbour ? req.body.neighbour : ''),
    phone: (req.body.phone ? req.body.phone : ''),
    email: (req.body.email ? req.body.email : ''),
    county: (req.body.county ? req.body.county : ''),
    state: (req.body.state ? req.body.state : ''),
    notify: (req.body.notify === 'true' ? 1 : 0),
  };

  PQRS_Ct.create(object)
    .then(data => {
      res.send('OK')
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR NO ABLE TO CREATE"
      });
    });

}
exports.create_fun = (req, res) => {
  object = {
    pqrsMasterId: (req.body.pqrsMasterId ? req.body.pqrsMasterId : res.send('NOT A REAL PARENT ID')),
    id_public: (req.body.id_public ? req.body.id_public : ''),
    person: (req.body.person ? req.body.person : ''),
    catastral: (req.body.catastral ? req.body.catastral : ''),
  };

  PQRS_Fun.create(object)
    .then(data => {
      res.send('OK')
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR NO ABLE TO CREATE"
      });
    });
}
exports.create_attach = (req, res) => {

  var mimetype = req.files[0].mimetype;
  if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
    fs.unlink(req.files[0].path, (err) => {
      console.log('FILE NOT COMPATIBLE, DETELED!');
      if (err) res.send(err);
    });
    res.send('ERROR_2')
  }

  const pqrsMasterId = (req.body.pqrsMasterId ? req.body.pqrsMasterId : res.send('NOT A REAL PARENT ID'));
  const object = {
    type: req.files[0].mimetype,
    name: req.files[0].filename,
    path: req.files[0].path,
    public_name: (req.body.public_name ? req.body.public_name : ''),
    class: 0, // 0 = ATTACH, 1 = EXIT DOCUMENT, 2 = OUTPUT FOR CLOSE
    pqrsMasterId: pqrsMasterId,
  };

  PQRS_At.create(object)
    .then(data => {
      console.log('UPDATED PQRS - ATTACHS FOR CLOSE OUTOUT');
      res.send("OK");
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "NO ATTACHS CREATED"
      });
    });
}

exports.findAll = (req, res) => {
  PQRS_Ma.findAll({
    include: [PQRS_Tim, PQRS_Inf, PQRS_Fun, PQRS_Law, PQRS_So, PQRS_Ct, PQRS_At, PQRS_Wk],
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

exports.findAll_pqrs = (req, res) => {
  PQRS_Ma.findAll({
    include: [PQRS_Tim, PQRS_Inf, PQRS_Wk, PQRS_Law],
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

exports.findPending_pqrs = (req, res) => {
  const query = `SELECT submits.id_public AS id_pending
  FROM submits 
  LEFT JOIN pqrs_masters ON submits.id_public = pqrs_masters.id_global
  WHERE submits.list_type = 5
  AND pqrs_masters.id_global IS NULL;`;
  const { QueryTypes } = require('sequelize');
  
  db.sequelize.query(query, { type: QueryTypes.SELECT })
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

exports.findAll_macro = (req, res) => {
  const _date_sart = req.params.date_sart;
  const _date_end = req.params.date_end;

  PQRS_Ma.findAll({
    include: [PQRS_Inf, PQRS_Wk, PQRS_Law, PQRS_So, PQRS_Ct, {
      model: PQRS_Tim,
      where: {
        'creation': {
          [Op.between]: [_date_sart, _date_end]
        }
      }
    }],
   
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

exports.search = (req, res) => {
  const _search_field = (req.body.search_field ? req.body.search_field : "");
  const _serach_str = (req.body.serach_str ? req.body.serach_str : "");

  if (_search_field == 1) {
    PQRS_Ma.findAll({
      include: [PQRS_Tim, PQRS_Inf, PQRS_Wk, PQRS_Law],
      where: {
        [Op.or]: {
          id_publico: { [Op.like]: `%` + _serach_str + `%` },
          id_global: { [Op.like]: `%` + _serach_str + `%` }
        }
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
  if (_search_field == 2) {
    PQRS_Ma.findAll({
      include: [PQRS_Tim, PQRS_Inf, PQRS_Wk, PQRS_Law],
      where: {
        id_reply: { [Op.like]: `%` + _serach_str + `%` }
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
  if (_search_field == 3) {
    PQRS_Ma.findAll({
      include: [PQRS_Tim, PQRS_Inf, PQRS_Fun, PQRS_Wk, PQRS_Law],
      where: {
        '$pqrs_fun.id_public$': { [Op.like]: `%` + _serach_str + `%` }
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
  if (_search_field == 4) {
    PQRS_Ma.findAll({
      include: [PQRS_Tim, PQRS_Inf, PQRS_So, PQRS_Wk, PQRS_Law],
      where: {
        '$pqrs_solocitors.name$': { [Op.like]: `%` + _serach_str + `%` }
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
  if (_search_field == 5) {
    PQRS_Ma.findAll({
      include: [PQRS_Tim, PQRS_Inf, PQRS_So, PQRS_Wk, PQRS_Law],
      where: {
        '$pqrs_solocitors.id_number$': _serach_str
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
  if (_search_field == 6) {
    PQRS_Ma.findAll({
      include: [PQRS_Tim, PQRS_Inf, PQRS_So, PQRS_Wk, PQRS_Law],
      where: {
        '$pqrs_workers.name$': { [Op.like]: `%` + _serach_str + `%` }
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
};

exports.findAllWorkers = (req, res) => {
  PQRS_Ma.findAll({
    include: [PQRS_Wk, PQRS_Tim],
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

exports.findOne = (req, res) => {
  const id = req.params.id;
  PQRS_Ma.findByPk(id, {
    include: [PQRS_Tim, PQRS_Inf, PQRS_Fun, PQRS_Law, PQRS_So, PQRS_Ct, PQRS_At, PQRS_Wk, PQRS_Step],
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


exports.findLastID = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT pqrs_masters.id_publico 
  FROM pqrs_masters
  WHERE pqrs_masters.id_publico LIKE  CONCAT('JUR', DATE_FORMAT(CURRENT_DATE(), '%y'), '%')
  ORDER BY id_publico 
  DESC LIMIT 1
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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

exports.findLastIDCub = (req, res) => {
  const { QueryTypes } = require('sequelize');
  var query = Queries.getLastCUBQuery;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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
exports.loadSubmit = (req, res) => {
  const _date_sart = req.params.date_start;
  const _date_end = req.params.date_end;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT DISTINCT pqrs_masters.id_publico, pqrs_masters.id, submits.date
  FROM pqrs_masters
  INNER JOIN submits ON submits.id_related = pqrs_masters.id_publico
  INNER JOIN sub_lists ON sub_lists.submitId = submits.id
  WHERE sub_lists.id IS NOT null
  AND submits.date BETWEEN '${_date_sart}' AND '${_date_end}'
  ORDER BY submits.date DESC
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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


// PUBLIC CHECK
exports.check_statusJur = (req, res) => {
  const id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT pqrs_masters.status, pqrs_times.time, pqrs_times.legal, pqrs_times.reply_formal,
  (
    SELECT GROUP_CONCAT(s.name SEPARATOR', ') 
    FROM pqrs_workers s 
    WHERE s.pqrsMasterId = pqrs_masters.id
    
) AS "worker_names"
  FROM pqrs_masters
  INNER JOIN pqrs_times ON pqrs_times.pqrsMasterId = pqrs_masters.id
  WHERE pqrs_masters.id_publico LIKE  '${id}' OR pqrs_masters.id_global LIKE  '${id}'
  LIMIT 1
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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

exports.check_statusNr = (req, res) => {
  const id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT nomenclatures.id_public, nomenclatures.type, nomenclatures.date_end, nome_docs.path, nome_docs.filename
  FROM nomenclatures
  LEFT JOIN nome_docs ON nome_docs.nomenclatureId = nomenclatures.id
  WHERE nomenclatures.id_public LIKE  '${id}'
  LIMIT 1
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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
exports.check_statusIdNumber = (req, res) => {
  const id = req.params.id;
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT fun_0s.id_public AS id_public

FROM fun_0s

LEFT JOIN fun_51s ON fun_51s.fun0Id = fun_0s.id
LEFT JOIN fun_53s ON fun_53s.fun0Id = fun_0s.id
LEFT JOIN fun_52s ON fun_52s.fun0Id = fun_0s.id

WHERE fun_51s.id_number LIKE '${id}'
OR fun_53s.id_number LIKE '${id}'
OR fun_52s.id_number LIKE '${id}'

UNION

SELECT pqrs_masters.id_publico AS id_public

FROM pqrs_masters

LEFT JOIN pqrs_solocitors ON pqrs_masters.id = pqrs_solocitors.pqrsMasterId
WHERE pqrs_solocitors.id_number LIKE '${id}'

UNION

SELECT nomenclatures.id_public AS id_public

FROM nomenclatures 

WHERE nomenclatures.number_id LIKE '${id}'
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
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
exports.check_statusIdVR = (req, res) => {
  const id = req.params.id;
  const { QueryTypes } = require('sequelize');
  let pqrs_query = (_id) => `SELECT pqrs_masters.status, pqrs_times.time, pqrs_times.legal, pqrs_times.reply_formal,
  (
    SELECT GROUP_CONCAT(s.name SEPARATOR', ') 
    FROM pqrs_workers s 
    WHERE s.pqrsMasterId = pqrs_masters.id
    
) AS "worker_names"
  FROM pqrs_masters
  INNER JOIN pqrs_times ON pqrs_times.pqrsMasterId = pqrs_masters.id
  WHERE pqrs_masters.id LIKE  '${_id}'
  LIMIT 1
  `;
  let fun_query = (_id) => `SELECT
  fun_1s.tramite,
  fun_1s.tipo,
  fun_1s.m_urb,
  fun_1s.m_sub,
  fun_1s.m_lic,
  fun_0s.id_public,
  fun_0s.state,
  clock_payment.date_start AS clock_payment,
  clock_legal.date_start AS clock_legal,
  clock_record_p1.date_start AS clock_record_p1,
  clock_record_p2.date_start AS clock_record_p2,
  clock_pay2.date_start AS clock_pay2,
  clock_resolution.date_start AS clock_resolution,
  clock_resolution_not_1.date_start AS clock_resolution_not_1,
  clock_resolution_not_2.date_start AS clock_resolution_not_2,
  clock_resolution.resolver_context AS clock_resolution_c,
  clock_ejecutoria.date_start AS clock_ejecutoria,
  clock_license.date_start AS clock_license,
  
  record_laws.worker_name AS jur_worker,
  record_engs.worker_name AS eng_worker,
  record_arcs.worker_name AS arc_worker,
  
  record_phs.check AS ph_review,
  record_phs.worker_arc_name AS ph_worker_arc,
  record_phs.date_arc_review AS ph_date_arc,

  publications.pdf_path AS publication_path,
  publications.type AS publication_type,

  record_reviews.check AS rec_review,
  record_reviews.check_2 AS rec_review_2

FROM
  fun_0s
LEFT JOIN record_phs ON record_phs.fun0Id = fun_0s.id
LEFT JOIN fun_clocks AS clock_payment
ON
  clock_payment.fun0Id = fun_0s.id AND clock_payment.state = 3
LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN fun_clocks AS clock_legal
ON
  clock_legal.fun0Id = fun_0s.id AND clock_legal.state = 5
LEFT JOIN fun_clocks AS clock_record_p1
ON
  clock_record_p1.fun0Id = fun_0s.id AND clock_record_p1.state = 30
LEFT JOIN fun_clocks AS clock_record_p2
ON
  clock_record_p2.fun0Id = fun_0s.id AND clock_record_p2.state = 49
LEFT JOIN fun_clocks AS clock_pay2
ON
  clock_pay2.fun0Id = fun_0s.id AND clock_pay2.state = 61
LEFT JOIN fun_clocks AS clock_resolution
ON
  clock_resolution.fun0Id = fun_0s.id AND clock_resolution.state = 70
  LEFT JOIN fun_clocks AS clock_resolution_not_1
ON
clock_resolution_not_1.fun0Id = fun_0s.id AND clock_resolution_not_1.state = 72
  LEFT JOIN fun_clocks AS clock_resolution_not_2
ON
clock_resolution_not_2.fun0Id = fun_0s.id AND clock_resolution_not_2.state = 73
LEFT JOIN fun_clocks AS clock_ejecutoria
ON
  clock_ejecutoria.fun0Id = fun_0s.id AND clock_ejecutoria.state = 80
LEFT JOIN fun_clocks AS clock_license
ON
  clock_license.fun0Id = fun_0s.id AND clock_license.state = 99
LEFT JOIN record_laws ON record_laws.fun0Id = fun_0s.id AND record_laws.version = fun_0s.version
LEFT JOIN record_law_reviews ON record_law_reviews.recordLawId = record_laws.id AND record_law_reviews.version = record_laws.version
LEFT JOIN record_engs ON record_engs.fun0Id = fun_0s.id AND record_engs.version = fun_0s.version
LEFT JOIN record_eng_reviews ON record_eng_reviews.recordEngId = record_engs.id AND record_engs.version = record_eng_reviews.version
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id AND record_arcs.version = fun_0s.version
LEFT JOIN record_arc_38s ON record_arc_38s.recordArcId = record_arcs.id AND record_arc_38s.version = record_arcs.version

LEFT JOIN publications ON publications.id_publico = fun_0s.id_public

LEFT JOIN record_reviews ON  record_reviews.fun0Id = fun_0s.id 

WHERE
fun_0s.id LIKE '${_id}'
  `;


  var query = `
  SELECT 'lic' AS 'type', fun_0s.id_public AS id_public, fun_0s.id AS id

    FROM fun_0s

    WHERE fun_0s.id_public LIKE '${id}'


    UNION

    SELECT  'jur'AS 'type', pqrs_masters.id_global AS id_public,  pqrs_masters.id AS id

    FROM pqrs_masters

    WHERE pqrs_masters.id_global LIKE '${id}'
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      (data.map(d => {
        let _id = d.id;
        if (d.type == 'lic') {
          db.sequelize.query(fun_query(_id), { type: QueryTypes.SELECT })
            .then(dataf => { res.send(dataf); })
        }
        if (d.type == 'jur') {
          db.sequelize.query(pqrs_query(_id), { type: QueryTypes.SELECT })
            .then(dataj => { res.send(dataj); })
        }
      }));
      if (!data.length) res.send([])
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });
};

// PUT
exports.update = (req, res) => {
  const id = req.params.id;

  if ('id_confirm' in req.body) {
    const newCub = req.body.id_confirm
    const oldCub = req.body.id_old

    const { QueryTypes } = require('sequelize');
    var query = Queries.validateLastCUBQuery(newCub, oldCub);

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length) res.send("ERROR_DUPLICATE");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving ALL DATA."
        });
      });
  }

  PQRS_Ma.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.close = (req, res) => {
  const id_master = (req.body.id_master ? req.body.id_master : res.send('NOT A REAL PARENT ID'));
  const id_time = (req.body.time_id ? req.body.time_id : res.send('NOT A REAL PARENT ID'));
  const object_master = {
    status: 1,
    id_reply: (req.body.id_reply ? req.body.id_reply : 0)
  }

  const object_time = {
    reply_formal: (req.body.reply_formal ? req.body.reply_formal : 0)
  }

  var attachs_array = [];
  let attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);
  let str_public_names = (req.body.files_names ? req.body.files_names : "");
  let aray_public_names = str_public_names.split(",");

  if (attachs_length) {
    for (var i = 0; i < attachs_length; i++) {

      var mimetype = req.files[i].mimetype;
      if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
        fs.unlink(req.files[i].path, (err) => {
          console.log('FILE NOT COMPATIBLE, DETELED!');
          if (err) res.send(err);
        });
        res.send('ERROR_2')
      } else {
        const object_attach = {
          type: req.files[i].mimetype,
          name: req.files[i].filename,
          path: req.files[i].path,
          public_name: aray_public_names[i],
          class: 2, // 0 = ATTACH, 1 = EXIT DOCUMENT, 2 = OUTPUT FOR CLOSE
          pqrsMasterId: id_master,
        };
        attachs_array.push(object_attach);
      }
    }
  }

  PQRS_Ma.update(object_master, {
    where: { id: id_master }
  }).then(num => {
    if (num == 1) {
      if (attachs_length) addAttachCloseDocument();
      else res.send("OK");
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })

  function updateTi() {
    PQRS_Tim.update(object_time, {
      where: { id: id_time }
    }).then(num => {
      if (num == 1) {
        if (attachs_length) addAttachCloseDocument();
        else res.send("OK");
      } else {
        res.send(`ERROR_2`); // NO MATCHING ID
      }
    })
  }

  function addAttachCloseDocument() {
    PQRS_At.bulkCreate(attachs_array)
      .then(data => {
        console.log('UPDATED PQRS - ATTACHS FOR CLOSE OUTOUT');
        res.send("OK");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO ATTACHS CREATED"
        });
      });
  }
};

exports.updateWoker = (req, res) => {
  const id = req.params.id;
  PQRS_Wk.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.update_solicitor = (req, res) => {
  const id = req.params.id;
  PQRS_So.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.update_contact = (req, res) => {
  const id = req.params.id;
  PQRS_Ct.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.update_attach = (req, res) => {
  const id = req.params.id;

  if (req.files.length) {
    PQRS_At.findAll({
      where: { id: id },
      attributes: ['path'],
    }).then(data => {
      fs.unlink(data[0].path);
      console.log('FILE FOR ATTACH, DETELED! OR AT LEAST TRIED', id);
      updateAt();
    })

    function updateAt() {

      var mimetype = req.files[0].mimetype;
      if (!ALLOWED_EXT.includes(mimetype)) {
        fs.unlink(req.files[0].path, (err) => {
          console.log('FILE NOT COMPATIBLE, DETELED!');
          if (err) res.send(err);
        });
        res.send('ERROR_2')
      }

      const object = {
        type: req.files[0].mimetype,
        name: req.files[0].filename,
        path: req.files[0].path,
        public_name: (req.body.public_name ? req.body.public_name : ''),
      };


      PQRS_At.update(object, {
        where: { id: id }
      }).then(num => {
        if (num == 1) {
          res.send('OK');
        } else {
          res.send(`ERROR_2`); // NO MATCHING ID
        }
      })
    }
  } else {
    PQRS_At.update(req.body, {
      where: { id: id }
    }).then(num => {
      if (num == 1) {
        res.send('OK');
      } else {
        res.send(`ERROR_2`); // NO MATCHING ID
      }
    })
  }

};

exports.update_fun = (req, res) => {
  const id = req.params.id;
  PQRS_Fun.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.update_main = (req, res) => {
  const pqrsMasterId = req.params.id;
  const InfoId = (req.body.InfoId ? req.body.InfoId : 0);
  const TimeId = (req.body.TimeId ? req.body.TimeId : 0);
  const LawId = (req.body.LawId ? req.body.LawId : 0);
  const id_public = (req.body.master_id_publico ? req.body.master_id_publico : '');

  if (id_public) {
    const { QueryTypes } = require('sequelize');
    var query = Queries.validateLastCUBQuery(id_public, pqrsMasterId);

    db.sequelize.query(query, { type: QueryTypes.SELECT })
      .then(data => {
        if (data.length) res.send("ERROR_DUPLICATE");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving ALL DATA."
        });
      });
  }


  const object_master = {
    id_publico: id_public,
    content: (req.body.master_content ? req.body.master_content : ''),
    type: (req.body.master_type ? req.body.master_type : ''),
    keywords: (req.body.master_keywords ? req.body.master_keywords : ''),
    id_global: (req.body.master_id_global ? req.body.master_id_global : ''),
    id_correspondency: (req.body.master_id_correspondency ? req.body.master_id_correspondency : ''),
  };

  // OBJECT FOR INFO
  const object_info = {
    radication_channel: (req.body.info_radication_chanel ? req.body.info_radication_chanel : ''),
    pqrsMasterId: pqrsMasterId,
  };

  // OBJECT FOR TIME
  const object_time = {
    time: (req.body.time_time ? req.body.time_time : ''),
    creation: (req.body.time_creation ? req.body.time_creation : ''),
    legal: (req.body.time_legal ? req.body.time_legal : ''),
    pqrsMasterId: pqrsMasterId,
  };

  // OBJECT FOR LAW
  const object_law = {
    extension: (req.body.extension == 'true' ? 1 : 0),
    extension_reason: (req.body.extension_reason ? req.body.extension_reason : ''),
    extension_date: (req.body.extension_date ? req.body.extension_date : null),
    pqrsMasterId: pqrsMasterId,
  };

  PQRS_Ma.update(object_master, {
    where: { id: pqrsMasterId }
  }).then(num => {
    if (num == 1) {
      updateTi();
    } else {
      res.send(`ERROR_2 master`); // NO MATCHING ID
    }
  })

  function updateTi() {
    if (TimeId == 0) {
      PQRS_Tim.create(object_time).then(num => {
        if (num) {
          updateInfo();
        }
        else {
          res.send(`ERROR_2 time ` + num); // NO MATCHING ID
        }
      }).catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while UPDATIND. " + err
        });
      });
    }
    else {
      PQRS_Tim.update(object_time, {
        where: { id: TimeId }
      }).then(num => {
        if (num == 1) {
          updateInfo();
        }
        else {
          res.send(`ERROR_2 time` + num); // NO MATCHING ID
        }
      }).catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while UPDATIND. " + err
        });
      });
    }
  }

  function updateInfo() {
    if (InfoId == 0) {
      PQRS_Inf.create(object_info)
        .then(num => {
          if (num) {
            updateLaw();
          } else {
            res.send(`ERROR_2 info` + res); // NO MATCHING ID
          }
        })
    }
    else {
      PQRS_Inf.update(object_info, {
        where: { id: InfoId }
      }).then(num => {
        if (num == 1) {
          updateLaw();
        } else {
          res.send(`ERROR_2 info` + res); // NO MATCHING ID
        }
      })
    }
  }

  function updateLaw() {
    if (LawId == 0) {
      PQRS_Law.create(object_law)
        .then(num => {
          if (num) {
            res.send('OK');
          } else {
            res.send(`ERROR_2 law` + res); // NO MATCHING ID
          }
        })
    }
    else {
      PQRS_Law.update(object_law, {
        where: { id: LawId }
      }).then(num => {
        if (num == 1) {
          res.send('OK');
        } else {
          res.send(`ERROR_2 law` + res); // NO MATCHING ID
        }
      })
    }
  }


};

exports.update_time = (req, res) => {
  const id = req.params.id;
  PQRS_Tim.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

// IT UPDATES TWO MODELS, TIMES IN REPLY TIME AND INFO IN REPLY
/*
*/
exports.formalReply = (req, res) => {
  const id_master = (req.body.id_master ? req.body.id_master : res.send('NOT A REAL PARENT ID'));
  const id_info = (req.body.info_id ? req.body.info_id : res.send('NOT A REAL PARENT ID'));
  const id_time = (req.body.time_id ? req.body.time_id : res.send('NOT A REAL PARENT ID'));

  const new_id = (req.body.new_id ? req.body.new_id : res.send('NOT A REAL PARENT ID'));
  const prev_id = (req.body.prev_id ? req.body.prev_id : res.send('NOT A REAL PARENT ID'));
  const { QueryTypes } = require('sequelize');
  var query = `
  SELECT (max_cub) AS cub FROM (
    
    SELECT (fun_laws.report_cub) AS max_cub
    FROM fun_laws
    WHERE fun_laws.report_cub LIKE  '${new_id}'
    AND fun_laws.report_cub NOT LIKE  '${prev_id}'
    AND fun_laws.report_cub IS NOT NULL
        
    UNION

    SELECT (pqrs_masters.id_reply) 
    FROM pqrs_masters 
    WHERE pqrs_masters.id_reply LIKE  '${new_id}'
    AND pqrs_masters.id_reply NOT LIKE  '${prev_id}'
    AND pqrs_masters.id_reply IS NOT NULL

    UNION

    SELECT (fun_3s.id_cub)
    FROM fun_3s
    WHERE fun_3s.id_cub LIKE  '${new_id}'
    AND fun_3s.id_cub NOT LIKE  '${prev_id}'
    AND fun_3s.id_cub IS NOT NULL
    
    ) AS max_cub
  `;

  db.sequelize.query(query, { type: QueryTypes.SELECT })
    .then(data => {
      if (data.length > 0) res.send("ERROR_DUPLICATE");
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ALL DATA."
      });
    });

  var object_master = {
    id_reply: new_id
  };

  var object_info = {
    reply: (req.body.info_reply ? req.body.info_reply : "")
  };

  var object_time = {
    reply_doc_date: (req.body.reply_doc_date ? req.body.reply_doc_date : null)
  };


  PQRS_Ma.update(object_master, {
    where: { id: id_master }
  }).then(num => {
    if (num == 1) {
      update_info();
    } else {
      res.send(`ERROR_2 FOR TIME`); // NO MATCHING ID
    }
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "ERROR ID MASTER"
    });
  });

  function update_info() {
    PQRS_Inf.update(object_info, {
      where: { id: id_info }
    }).then(num => {
      if (num == 1) {
        update_time();
      } else {
        res.send(`ERROR_2 FOR REPLY`); // NO MATCHING ID
      }
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR ID INFO"
      });
    });
  }

  function update_time() {
    PQRS_Tim.update(object_time, {
      where: { id: id_time }
    }).then(num => {
      if (num == 1) {
        res.send('OK');
      } else {
        res.send(`ERROR_2 FOR TIME`); // NO MATCHING ID
      }
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR ID TIME"
      });
    });
  }

};

// IT UPDATES THE WORKER MODEL AND MAY CREATE NEW ATTACHS
exports.informalReply = (req, res) => {
  const id_worker = (req.body.id ? req.body.id : res.send('NOT A REAL PARENT ID'));

  var object_worker = {
    reply: (req.body.reply ? req.body.reply : ""),
    date_reply: (req.body.date_reply ? req.body.date_reply : "")
  };

  // OBJECTS FOR FILES
  // THEY CAN BE FROM 0 TO MANY
  // THE FORM DOES NOT ADD THE FILES INTO A SINGLE FILE OBJECT, BUT RATHER ADD MANY FILE OBJECTS AS WAS NEEDED
  // THIS MEANS EACH FILE OBJECT IS IDENTIFIED IN THE FORMS OBJECT AS: file_i WHERE i IS EACH OF THE FILES...
  // GOING FROM 0 TO AS MANY AS NEEDED
  // IF THERE IS AT LEAST ONE FILE, ADD TO THE OBJECT IN A FOR CICLE
  // IF THERE IS NOT FILES, PROCEED TO NEXT AND IGNORE THIS STEP
  var attachs_array = [];
  let attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);
  let str_public_names = (req.body.files_names ? req.body.files_names : "");
  let aray_public_names = str_public_names.split(",");

  if (attachs_length) {
    for (var i = 0; i < attachs_length; i++) {

      var mimetype = req.files[i].mimetype;
      if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
        fs.unlink(req.files[i].path, (err) => {
          console.log('FILE NOT COMPATIBLE, DETELED!');
          if (err) res.send(err);
        });
        res.send('ERROR_2')
      } else {
        const object_attach = {
          type: req.files[i].mimetype,
          name: req.files[i].filename,
          path: req.files[i].path,
          public_name: aray_public_names[i],
          class: 1, // 0 = ATTACH, 1 = EXIT DOCUMENT
          pqrsMasterId: (req.body.id_master ? req.body.id_master : res.send('NOT A REAL PARENT ID')),
        };
        attachs_array.push(object_attach);
      }
    }
  }

  PQRS_Wk.update(object_worker, {
    where: { id: id_worker }
  }).then(num => {
    if (num == 1) {
      console.log('UPDATE PRQS - WORKER');
      if (attachs_length) {
        createObject_attach()
      } else {
        console.log('INFORMAL REPLY OF PQRS -DONE-');
        res.send('OK');
      }

    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })

  async function createObject_attach() {
    PQRS_At.bulkCreate(attachs_array)
      .then(data => {
        console.log('CREATED PQRS - ATTACHS FOR OUTPUT');
        console.log('INFORMAL REPLY OF PQRS -DONE-');
        res.send("OK");
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "NO ATTACHS CREATED"
        });
      });
  }

};

// ADDS TO THE ATTACHS MODEL NEW ENTRIES
exports.addAttachsClose = (req, res) => {
  const id_master = (req.body.id_master ? req.body.id_master : res.send('NOT A REAL PARENT ID'));

  // OBJECTS FOR FILES
  // THEY CAN BE FROM 0 TO MANY
  // GOING FROM 0 TO AS MANY AS NEEDED
  // IF THERE IS AT LEAST ONE FILE, ADD TO THE OBJECT IN A FOR CICLE
  // IF THERE IS NOT FILES, PROCEED TO NEXT AND IGNORE THIS STEP
  var attachs_array = [];
  let attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);

  let str_public_names = (req.body.files_names ? req.body.files_names : "");
  let aray_public_names = str_public_names.split(",");

  let str_public_class = (req.body.files_class ? req.body.files_class : "");
  let aray_public_class = str_public_class.split(",");

  if (attachs_length) {
    for (var i = 0; i < attachs_length; i++) {

      var mimetype = req.files[i].mimetype;
      if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
        fs.unlink(req.files[i].path, (err) => {
          console.log('FILE NOT COMPATIBLE, DETELED!');
          if (err) res.send(err);
        });
        res.send('ERROR_2')
      } else {
        const object_attach = {
          type: req.files[i].mimetype,
          name: req.files[i].filename,
          path: req.files[i].path,
          public_name: aray_public_names[i],
          class: aray_public_class[i] ? aray_public_class[i] : 2, // 0 = ATTACH, 1 = EXIT DOCUMENT, 2 = OUTPUT FOR CLOSE
          pqrsMasterId: id_master,
        };
        attachs_array.push(object_attach);
      }
    }
  }

  PQRS_At.bulkCreate(attachs_array)
    .then(data => {
      console.log('UPDATED PQRS - ATTACHS FOR CLOSE OUTOUT');
      res.send("OK");
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "NO ATTACHS CREATED"
      });
    });

};
// SEND EMAILS - REPLY
// THIS SEND A EMAIL TO 0 TO MANY EMAILS AND UPDATES A PQRS_LAW MODEL
exports.sendEmailReply = (req, res) => {
  const email_body = (req.body.email_body ? req.body.email_body : res.send('NOT VALID EMAIL BODY'));
  const email_list = (req.body.email_list ? req.body.email_list : res.send('NOT VALID EMAIL LIST'));

  const attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);

  const id_time = (req.body.id_time ? req.body.id_time : 0);
  var object_time = {
    reply_formal: (req.body.reply_formal ? req.body.reply_formal : "")
  }

  // CREATES AN ARRAY WITH ALL THE ATTACHED FILES AND THEN ATTACHS THEM IN THE EMAIL.
  // IT DOES NOT SAVES THIS FILE, ALTHOUT IT MAY CHANGE IN THE FUTURE
  // AFTER IT SENDS THE EMAILS THE SYSTEM MUST DELETE THEM
  var attachEmailFilesPaths = [];
  var attachEmailFilesTypes = [];
  for (var i = 0; i < attachs_length; i++) {
    var mimetype = req.files[i].mimetype;
    if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
      fs.unlink(req.files[i].path, (err) => {
        console.log('FILE NOT COMPATIBLE, DETELED!');
        if (err) res.send(err);
      });
      res.send('ERROR_2 - FILE NOT COMPATIBLE')
    } else {
      attachEmailFilesPaths.push(req.files[i].path);
      attachEmailFilesTypes.push(req.files[i].filename.split('.').pop());
    }
  }


  console.log('ATTEMTING TO SEND AN EAIL TO:', email_list);

  let transporter = nodemailer.createTransport(
    mailerConfig.transporter
  );
  let mailOptions = mailerConfig.mailOptions.pqrs;
  mailOptions.from = 'Curaduria Urbana N° 1 de Bucaramanga <nodelivery@curaduria1bucaramanga.com>';
  mailOptions.subject = "Respuesta a su Petición";
  mailOptions.to = email_list;
  mailOptions.cc = 'sentpqrs@curaduria1bucaramanga.com';
  mailOptions.html = email_body;
  mailOptions.dsn = {
    id: 'STATUS DELIVERY',
    return: 'headers',
    notify: ['failure', 'delay'],
    recipient: 'nodelivery@curaduria1bucaramanga.com'
  }

  mailOptions.attachments = [];

  for (var i = 0; i < attachEmailFilesPaths.length; i++) {
    const attach = {
      path: attachEmailFilesPaths[i],
      filename: "documento_anexo_" + i + 1 + "." + attachEmailFilesTypes[i],
    };
    mailOptions.attachments.push(attach);
  }

  transporter.sendMail(mailOptions, function (info, err) {
    if (info) {
      console.log("OK, Message Sent to: ", info);
    }
    if (err) {
      console.log("GENERAL ERROR SENDING EMAIL: ");
      console.log(err);
      if (err.messageId) console.log("Err, Message messageId: ", err.accepted);
      if (err.envelope) console.log("Err, Message envelope : ", err.accepted);
      if (err.accepted) console.log("Err, Message accepted: ", err.accepted);
      if (err.rejected) console.log("Err, Message rejected: ", err.rejected);
      if (err.pending) console.log("Err, Message pending: ", err.pending);
      if (err.response) console.log("Err, Message response, last response from server: ", err.rejected);
    }
    if (attachEmailFilesPaths.length) {
      deleteAttachForEmails();
    } else {
      update_time();
    }

  });


  function deleteAttachForEmails() {
    console.log("EMAIL SENT, NOW DELETING ATTACHS");
    for (var i = 0; i < attachEmailFilesPaths.length; i++) {
      fs.unlink(attachEmailFilesPaths[i], (err) => {
        if (err) res.send(err);
      });
    }
    update_time();
  }


  function update_time() {
    PQRS_Tim.update(object_time, {
      where: { id: id_time }
    }).then(num => {
      if (num == 1) {
        res.send('OK');
      } else {
        res.send(`ERROR_2 FOR REPLY`); // NO MATCHING ID
      }
    })
  }
};

exports.sendEmailNotification = (req, res) => {
  const email_body = (req.body.email_body ? req.body.email_body : res.send('NOT VALID EMAIL BODY'));
  const email_list = (req.body.email_list ? req.body.email_list : res.send('NOT VALID EMAIL LIST'));

  const attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);;

  // CREATES AN ARRAY WITH ALL THE ATTACHED FILES AND THEN ATTACHS THEM IN THE EMAIL.
  // IT DOES NOT SAVES THIS FILE, ALTHOUT IT MAY CHANGE IN THE FUTURE
  // AFTER IT SENDS THE EMAILS THE SYSTEM MUST DELETE THEM
  var attachEmailFilesPaths = [];
  var attachEmailFilesTypes = [];
  for (var i = 0; i < attachs_length; i++) {
    var mimetype = req.files[i].mimetype;
    if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
      fs.unlink(req.files[i].path, (err) => {
        console.log('FILE NOT COMPATIBLE, DETELED!');
        if (err) res.send(err);
      });
      res.send('ERROR_2 - FILE NOT COMPATIBLE')
    } else {
      attachEmailFilesPaths.push(req.files[i].path);
      attachEmailFilesTypes.push(req.files[i].filename.split('.').pop());
    }
  }


  console.log('ATTEMTING TO SEND AN EAIL TO:', email_list);

  let transporter = nodemailer.createTransport(
    mailerConfig.transporter
  );
  let mailOptions = mailerConfig.mailOptions.pqrs;
  mailOptions.from = 'Curaduria Urbana N° 1 de Bucaramanga <noreply@curaduria1bucaramanga.com>';
  mailOptions.to = email_list;
  mailOptions.subject = "Confirmación de Recibido";
  mailOptions.cc = 'sentpqrs@curaduria1bucaramanga.com';
  mailOptions.html = email_body;
  mailOptions.dsn = {
    id: 'STATUS DELIVERY',
    return: 'headers',
    notify: ['failure', 'delay'],
    recipient: 'nodelivery@curaduria1bucaramanga.com'
  }

  if (attachEmailFilesPaths) {
    mailOptions.attachments = [];
  }
  for (var i = 0; i < attachEmailFilesPaths.length; i++) {
    const attach = {
      path: attachEmailFilesPaths[i],
      filename: "documento_anexo_" + i + 1 + "." + attachEmailFilesTypes[i],
    };
    mailOptions.attachments.push(attach);
  }

  transporter.sendMail(mailOptions, function (info, err) {
    if (info) {
      console.log("OK, Message Sent to: ", info);
    }
    if (err) {
      console.log("GENERAL ERROR SENDING EMAIL: ");
      console.log(err);
      if (err.messageId) console.log("Err, Message messageId: ", err.accepted);
      if (err.envelope) console.log("Err, Message envelope : ", err.accepted);
      if (err.accepted) console.log("Err, Message accepted: ", err.accepted);
      if (err.rejected) console.log("Err, Message rejected: ", err.rejected);
      if (err.pending) console.log("Err, Message pending: ", err.pending);
      if (err.response) console.log("Err, Message response, last response from server: ", err.rejected);
    }
    if (attachEmailFilesPaths.length) {
      deleteAttachForEmails();
    } else {
      res.send('OK');
    }
  });


  function deleteAttachForEmails() {
    console.log("EMAIL SENT, NOW DELETING ATTACHS");
    for (var i = 0; i < attachEmailFilesPaths.length; i++) {
      fs.unlink(attachEmailFilesPaths[i], (err) => {
        if (err) res.send(err);
      });
    }
    res.send('OK');
  }

};

exports.emailworkernotification = (req, res) => {

  const email_body = (req.body.email_body ? req.body.email_body : res.send('NOT VALID EMAIL BODY'));
  const email_list = (req.body.email_list ? req.body.email_list : res.send('NOT VALID EMAIL LIST'));

  const id_worker = (req.body.id ? req.body.id : res.send('NOT A REAL ID'));

  const object = {
    sent_email_notify: (req.body.sent_email_notify ? req.body.sent_email_notify : null),
  }

  const attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);

  // CREATES AN ARRAY WITH ALL THE ATTACHED FILES AND THEN ATTACHS THEM IN THE EMAIL.
  // IT DOES NOT SAVES THIS FILE, ALTHOUT IT MAY CHANGE IN THE FUTURE
  // AFTER IT SENDS THE EMAILS THE SYSTEM MUST DELETE THEM
  var attachEmailFilesPaths = [];
  var attachEmailFilesTypes = [];
  for (var i = 0; i < attachs_length; i++) {
    var mimetype = req.files[i].mimetype;
    if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
      fs.unlink(req.files[i].path, (err) => {
        console.log('FILE NOT COMPATIBLE, DETELED!');
        if (err) res.send(err);
      });
      res.send('ERROR_2 - FILE NOT COMPATIBLE')
    } else {
      attachEmailFilesPaths.push(req.files[i].path);
      attachEmailFilesTypes.push(req.files[i].filename.split('.').pop());
    }
  }


  console.log('ATTEMTING TO SEND AN EAIL TO:', email_list);

  let transporter = nodemailer.createTransport(
    mailerConfig.transporter
  );
  let mailOptions = mailerConfig.mailOptions.pqrs;
  mailOptions.from = 'Curaduria Urbana N° 1 de Bucaramanga <noreply@curaduria1bucaramanga.com>',
    mailOptions.subject = "Curaduria Urbana 1 de Bucaramanga";
  mailOptions.to = email_list;
  mailOptions.cc = 'sentpqrs@curaduria1bucaramanga.com';
  mailOptions.html = email_body;

  mailOptions.dsn = {
    id: 'STATUS DELIVERY',
    return: 'headers',
    notify: ['failure', 'delay'],
    recipient: 'nodelivery@curaduria1bucaramanga.com'
  }

  mailOptions.attachments = [];

  for (var i = 0; i < attachEmailFilesPaths.length; i++) {
    const attach = {
      path: attachEmailFilesPaths[i],
      filename: "documento_anexo_" + i + 1 + "." + attachEmailFilesTypes[i],
    };
    mailOptions.attachments.push(attach);
  }


  transporter.sendMail(mailOptions, function (info, err) {
    if (info) {
      console.log("OK, Message Sent to: ", info);
    }
    if (err) {
      console.log("GENERAL ERROR SENDING EMAIL: ");
      console.log(err);
      if (err.messageId) console.log("Err, Message messageId: ", err.accepted);
      if (err.envelope) console.log("Err, Message envelope : ", err.accepted);
      if (err.accepted) console.log("Err, Message accepted: ", err.accepted);
      if (err.rejected) console.log("Err, Message rejected: ", err.rejected);
      if (err.pending) console.log("Err, Message pending: ", err.pending);
      if (err.response) console.log("Err, Message response, last response from server: ", err.rejected);
    }
    if (attachEmailFilesPaths.length) {
      deleteAttachForEmails();
    } else {
      update();
    }
  });

  function deleteAttachForEmails() {
    console.log("EMAIL SENT, NOW DELETING ATTACHS");
    for (var i = 0; i < attachEmailFilesPaths.length; i++) {
      fs.unlink(attachEmailFilesPaths[i], (err) => {
        if (err) res.send(err);
      });
    }
    update();
  }




  PQRS_Wk.update(object, {
    where: { id: id_worker }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.sendEmailExtension = (req, res) => {
  const email_body = (req.body.email_body ? req.body.email_body : res.send('NOT VALID EMAIL BODY'));
  const email_list = (req.body.email_list ? req.body.email_list : res.send('NOT VALID EMAIL LIST'));

  const attachs_length = (req.body.attachs_length ? req.body.attachs_length : 0);

  // CREATES AN ARRAY WITH ALL THE ATTACHED FILES AND THEN ATTACHS THEM IN THE EMAIL.
  // IT DOES NOT SAVES THIS FILE, ALTHOUT IT MAY CHANGE IN THE FUTURE
  // AFTER IT SENDS THE EMAILS THE SYSTEM MUST DELETE THEM
  var attachEmailFilesPaths = [];
  var attachEmailFilesTypes = [];
  for (var i = 0; i < attachs_length; i++) {
    var mimetype = req.files[i].mimetype;
    if (mimetype != 'image/jpeg' && mimetype != 'image/png' && mimetype != 'application/pdf') {
      fs.unlink(req.files[i].path, (err) => {
        console.log('FILE NOT COMPATIBLE, DETELED!');
        if (err) res.send(err);
      });
      res.send('ERROR_2 - FILE NOT COMPATIBLE')
    } else {
      attachEmailFilesPaths.push(req.files[i].path);
      attachEmailFilesTypes.push(req.files[i].filename.split('.').pop());
    }
  }

  console.log('ATTEMTING TO SEND AN EMAIL TO:', email_list);

  let transporter = nodemailer.createTransport(
    mailerConfig.transporter
  );
  let mailOptions = mailerConfig.mailOptions.pqrs;
  mailOptions.from = 'Curaduria Urbana N° 1 de Bucaramanga <noreply@curaduria1bucaramanga.com>';
  mailOptions.to = email_list;
  mailOptions.subject = "Prórroga de Petición";
  mailOptions.cc = 'sentpqrs@curaduria1bucaramanga.com';
  mailOptions.html = email_body;

  mailOptions.dsn = {
    id: 'STATUS DELIVERY',
    return: 'headers',
    notify: ['failure', 'delay'],
    recipient: 'nodelivery@curaduria1bucaramanga.com'
  }

  mailOptions.attachments = [];

  for (var i = 0; i < attachEmailFilesPaths.length; i++) {
    const attach = {
      path: attachEmailFilesPaths[i],
      filename: "documento_anexo_" + i + 1 + "." + attachEmailFilesTypes[i],
    };
    mailOptions.attachments.push(attach);
  }

  transporter.sendMail(mailOptions, function (info, err) {
    if (info) {
      console.log("OK, Message Sent to: ", info);
    }
    if (err) {
      console.log("GENERAL ERROR SENDING EMAIL: ");
      console.log(err);
      if (err.messageId) console.log("Err, Message messageId: ", err.accepted);
      if (err.envelope) console.log("Err, Message envelope : ", err.accepted);
      if (err.accepted) console.log("Err, Message accepted: ", err.accepted);
      if (err.rejected) console.log("Err, Message rejected: ", err.rejected);
      if (err.pending) console.log("Err, Message pending: ", err.pending);
      if (err.response) console.log("Err, Message response, last response from server: ", err.rejected);
    }
    if (attachEmailFilesPaths.length) {
      deleteAttachForEmails();
    } else {
      res.send('OK');
    }
  });

  function deleteAttachForEmails() {
    console.log("EMAIL SENT, NOW DELETING ATTACHS");
    for (var i = 0; i < attachEmailFilesPaths.length; i++) {
      fs.unlink(attachEmailFilesPaths[i], (err) => {
        if (err) res.send(err);
      });
    }
    res.send('OK');
  }


};


// DELETE BY ID
exports.delete = (req, res) => {
  res.json({ message: "This is DELETE BY ID!" });
};
exports.deleteAttach = (req, res) => {
  const id = req.params.id;

  PQRS_At.findAll({
    where: { id: id },
    attributes: ['path'],
  }).then(data => {
    fs.unlink(data[0].path, (err) => {
      console.log('FILE FOR ATTACH, DETELED!', id);
      deleteAt();
      if (err) res.send(err);
    });
  })

  function deleteAt() {
    PQRS_At.destroy({
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
exports.deleteWorker = (req, res) => {
  const id = req.params.id;

  PQRS_Wk.destroy({
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
exports.delete_solicitor = (req, res) => {
  const id = req.params.id;

  PQRS_So.destroy({
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
exports.delete_contact = (req, res) => {
  const id = req.params.id;

  PQRS_Ct.destroy({
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
  res.json({ message: "NOT IMPLEMENTED" });
};



//  REQUEST PDF REPLY
exports.request_pdfReply = (req, res) => {
  var _DATAOBJECT = {
    id_reply: (req.body.id_reply ? req.body.id_reply : ""),
    id_publico: (req.body.id_publico ? req.body.id_publico : ""),
    date: (req.body.date ? req.body.date : ""),
    body: (req.body.body ? req.body.body : ""),
    solicitors: (req.body.solicitors ? req.body.solicitors : ""),
    addresses: (req.body.addresses ? req.body.addresses : ""),
    emails: (req.body.emails ? req.body.emails : ""),
    workers_id: (req.body.workers_id ? req.body.workers_id : ""),
    workers_feedback: (req.body.workers_feedback ? req.body.workers_feedback : ""),
    title: (req.body.title ? req.body.title : ""),
    city: (req.body.city ? req.body.city : " "),
  }
  _PDFGEN_FORMALREPLY(_DATAOBJECT);
  setTimeout(() => { res.send('OK') }, 3000);;
};

//  REQUEST PDF CONFIRMATION
exports.request_pdfConfirmation = (req, res) => {
  var _DATAOBJECT = {
    id_public: (req.body.id_public ? req.body.id_public : " "),
    date: (req.body.date ? req.body.date : " "),
    starttime: (req.body.starttime ? req.body.starttime : " "),
    solicitors: (req.body.solicitors ? req.body.solicitors : " "),
    addresses: (req.body.addresses ? req.body.addresses : " "),
    emails: (req.body.emails ? req.body.emails : " "),
    body: (req.body.body ? req.body.body : " "),
    title: (req.body.title ? req.body.title : " "),
    city: (req.body.city ? req.body.city : " "),
  }
  _PDFGEN_CONFIRMATION(_DATAOBJECT);
  res.send('OK');
};

// GET PQRS REPLY PDF
exports.generate_pdf_reply = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_reply.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR SEAL REQUESTED, GIVEN: ', fileName)
    }
  });

};

// OTHER APIS 
exports.access_edit = (req, res) => {
  const _id = req.body.email;
  const _pass = req.body.password;

  let curatorEmail =  "curador@curaduria1bucaramanga.com";
  if (curaduriaInfo.id == 'cup1') curatorEmail =  "camargosilvia@gmail.com";
  if (curaduriaInfo.id == 'fld2') curatorEmail =  "marcisgarcia@hotmail.com";
  Users.findAll({
    where: {
      id: _id, password: _pass, active: 1,
      [Op.or]: [{ roleId: 5 }, { roleId: 1 }, { roleId: 3 }, { roleId: 2 }, {email : curatorEmail}]
    },
    attributes: ['id'],
  })
    .then(data => {
      if (data.length)
        res.send('OK');
      else res.send('NO ACCESS');
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving DATA for ACCESS: " + err
      });
    });
};


exports.history = (req, res) => {
  const _public_id = req.params.public_id;

  PQRS_Ma.findAll({
    include: {
      model: PQRS_Fun, where: {
        [Op.or]: {
          id_public: { [Op.like]: `%` + _public_id + `%` },
          catastral: { [Op.like]: `%` + _public_id + `%` }
        }
      }
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
};
//

function dateParser(date) {
  const moment = require('moment');
  let esLocale = require('moment/locale/es');
  var momentLocale = moment(date, 'YYYY-MM-DD').locale('es', esLocale);
  return momentLocale.format("LL")
}

// TODO
function _PDFGEN_FORMALREPLY(_DATA) {
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 128,
      bottom: 85,
      left: 85,
      right: 85
    }
  });

  doc.pipe(fs.createWriteStream('./docs/public/output_reply.pdf'));

  doc.fontSize(10);
  doc.font('Helvetica')
  doc.text(_DATA.city + ', ' + dateParser(_DATA.date));
  doc.text('\n\n\n');
  doc.font('Helvetica')
  doc.text(_DATA.title);
  doc.font('Helvetica-Bold')
  doc.text(_DATA.solicitors, { continued: true });
  doc.fontSize(11).text(_DATA.id_reply, { align: 'right' });
  doc.font('Helvetica')
  doc.text("Direccion(es) Fisica(s): ");
  doc.font('Helvetica-Bold')
  doc.text(_DATA.addresses);
  doc.font('Helvetica')
  doc.text("Direcciones(es) electronica(s): ");
  doc.font('Helvetica-Bold')
  doc.text(_DATA.emails);
  doc.text('\n');
  doc.text("Asunto: ", { continued: true });
  doc.font('Helvetica')
  doc.text(`Respuesta a su petición  ${_DATA.id_publico} ${_DATA.id_reply != 'NA' ? ' - ' + _DATA.id_reply : ' '}`);
  doc.font('Helvetica')
  doc.text('\n\n');
  doc.text(_DATA.body, { align: 'justify' });
  doc.text('\n\n');
  doc.text("Cordialmente,");
  doc.text('\n\n\n\n\n');
  doc.font('Helvetica-Bold')
  doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
  doc.text(curaduriaInfo.job);
  doc.text('\n');
  doc.text("Revisado por:");
  doc.text('\n\n');

  let workersIds = _DATA.workers_id.split(',');
  let workersFeedback = _DATA.workers_feedback.split(',');
  console.log("PASTING SIGNATURES ON PDF");
  console.log("FEEDBACK DATA: ->", workersFeedback, workersIds);
  doc.fontSize(8);

  addUsers();

  async function addUsers() {
    let x_offset = 100;
    let y_offeset = doc.y
    let counter = 0;
    for (var i = 0; i < workersIds.length; i++) {
      await USERS.findByPk(workersIds[i])
        .then(data => {

          let user_name = `${data.name} ${data.name_2} ${data.surname} ${data.surname_2}`;
          if (typeof workersFeedback[i] !== 'undefined' && workersFeedback[i] != '') {
            if (workersFeedback[i] == '1') {
              doc.text('\n\n');
              //doc.image('docs/public/user_signatures/' + data.signature_name, x_offset + 15, y_offeset, { width: 80, height: 40 })
              doc.text('\n');
              doc.text(user_name, x_offset, y_offeset + 50);

              counter++;
              if (counter == 3) {
                y_offeset = y_offeset + 80;
                x_offset = 100;
                counter = 0;
              } else {
                x_offset = x_offset + 160;
              }
            }
          }
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "NOT A REAL USER."
          });
        });
    }
    doc.end();
  }
}

// TODO FOLLOWING
function _PDFGEN_CONFIRMATION(_DATA) {
  var doc = new PDFDocument({
    size: 'LETTER', margins: {
      top: 128,
      bottom: 85,
      left: 85,
      right: 85
    }
  });

  doc.pipe(fs.createWriteStream('./docs/public/output_reply.pdf'));

  doc.fontSize(10);
  doc.font('Helvetica')
  doc.text(_DATA.city + ', ' + dateParser(_DATA.date));
  doc.font('Helvetica-Bold')
  doc.text('\n\n\n');
  doc.font('Helvetica')
  doc.text(_DATA.title);
  doc.font('Helvetica-Bold')
  doc.text(_DATA.solicitors, { continued: true });
  doc.text(_DATA.id_public, { align: 'right' });
  doc.font('Helvetica')
  doc.text("Dirección(es) Fisica(s): ");
  doc.font('Helvetica-Bold')
  doc.text(_DATA.addresses);
  doc.font('Helvetica')
  doc.text("Direcciónes(es) electronica(s): ");
  doc.font('Helvetica-Bold')
  doc.text(_DATA.emails);
  doc.text('\n');
  doc.text("Asunto: ", { continued: true });
  doc.font('Helvetica')
  doc.text("Confirmación de petición, número de radicado " + _DATA.id_public);
  doc.text('\n\n');
  doc.font('Helvetica')
  doc.text(_DATA.body, { align: 'justify' });
  doc.text('\n\n');
  doc.text("Cordialmente,");
  doc.text('\n\n\n\n\n\n');
  doc.font('Helvetica-Bold')
  doc.fontSize(13).text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
  doc.fontSize(11).text(curaduriaInfo.job);
  doc.fontSize(11).text('\n');
  doc.fontSize(8).text("Revisado por:");
  doc.end();
  return true;
}


// STEPS

exports.get_all_step = (req, res) => {
  const pqrsMasterId = req.params.id
  PQRS_Step.findAll({
    where: { 'pqrsMasterId': pqrsMasterId},
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

exports.create_step = (req, res) => {
  object = req.body

  PQRS_Step.create(object)
    .then(data => {
      res.send('OK')
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "ERROR NO ABLE TO CREATE"
      });
    });

}

exports.update_step = (req, res) => {
  const id = req.params.id;
  PQRS_Step.update(req.body, {
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send('OK');
    } else {
      res.send(`ERROR_2`); // NO MATCHING ID
    }
  })
};

exports.delete_step = (req, res) => {
  const id = req.params.id;

  PQRS_Step.destroy({
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

const express = require('express')
const cors = require('cors')
const app = express();
const mysql = require('mysql');
const multer = require('multer');
require('dotenv').config();

global.__basedir = __dirname;
const DIR_PQRS_IN = './docs/pqrs/input/';
const DIR_PQRS_OUT = './docs/pqrs/output/';
const DIR_PROCESS = './docs/process/';
const DIR_PUBLISH = './docs/publish/';
const DIR_NOMENCLATURE = './docs/nomenclature/';
const DIR_NORMS = './docs/norms/';
const DIR_SUBMIT = './docs/submit/';
const DIR_DEFAULT = './docs/unsorted/';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var origin_name = file.originalname.substring(0, file.originalname.indexOf('_'));
    var DIR = DIR_DEFAULT
    // VALIDATON FOR UPLOADING FILES
    if (origin_name == 'pqrs') DIR = DIR_PQRS_IN 
    else if (origin_name == 'pqrsout') DIR = DIR_PQRS_OUT
    else if (origin_name == 'publish') {
      DIR = DIR_PUBLISH;
      var _NAME = file.originalname.substring(file.originalname.indexOf('_') +1, file.originalname.length);
      var _TYPE = _NAME.substring(0, _NAME.indexOf('_'));
      DIR = DIR_PUBLISH + _TYPE + "/";
      console.log("Checking dirs if extist: ", DIR)
      var fs = require('fs');
      if (!fs.existsSync(DIR)) {
        console.log(DIR, "Does not exist, creating...")
        fs.mkdirSync(DIR);
      }
    }
    else if (origin_name == 'fun6') {
      // WHEN THIS, IT READS THEN THE CURRENT YEAR, AND THEN THE ID PUBLIC OF THE NAME, AND CREATED THE FOLDERS IT THEY DO NOT EXIST
      var _NAME = file.originalname.substring(file.originalname.indexOf('_') +1, file.originalname.length);
      var _CURRENTYEAR = _NAME.substring(0, _NAME.indexOf('_'));
      _NAME = _NAME.substring(_NAME.indexOf('_') +1 , _NAME.length);
      var _HOMEFOLDER = _NAME.substring(0, _NAME.indexOf('_'));

      DIR = DIR_PROCESS + _CURRENTYEAR + "/" + _HOMEFOLDER + "/" ;
      console.log("Checking dirs if extist: ", _CURRENTYEAR, _HOMEFOLDER)
      var fs = require('fs');
      if (!fs.existsSync(DIR_PROCESS + _CURRENTYEAR)) {
        console.log(_CURRENTYEAR, "Does not exist, creating...")
        fs.mkdirSync(DIR_PROCESS + _CURRENTYEAR);
      }
      if (!fs.existsSync(DIR)) {
        console.log(_HOMEFOLDER, "Does not exist, creating...")
        fs.mkdirSync(DIR);
      }
    }
    else if (origin_name == 'nomenclature') {
      // WHEN THIS, IT READS THEN THE CURRENT YEAR, AND THEN THE ID PUBLIC OF THE NAME, AND CREATED THE FOLDERS IT THEY DO NOT EXIST
      var _NAME = file.originalname.substring(file.originalname.indexOf('_') +1, file.originalname.length);
      var _CURRENTYEAR = _NAME.substring(0, _NAME.indexOf('_'));
      _NAME = _NAME.substring(_NAME.indexOf('_') +1 , _NAME.length);
      var _HOMEFOLDER = _NAME.substring(0, _NAME.indexOf('_'));

      DIR = DIR_NOMENCLATURE + _CURRENTYEAR + "/" + _HOMEFOLDER + "/" ;
      console.log("Checking dirs if extist: ", _CURRENTYEAR, _HOMEFOLDER)
      var fs = require('fs');
      if (!fs.existsSync(DIR_NOMENCLATURE + _CURRENTYEAR)) {
        console.log(_CURRENTYEAR, "Does not exist, creating...")
        fs.mkdirSync(DIR_NOMENCLATURE + _CURRENTYEAR);
      }
      if (!fs.existsSync(DIR)) {
        console.log(_HOMEFOLDER, "Does not exist, creating...")
        fs.mkdirSync(DIR);
      }
    }
    else if (origin_name == 'submit') {
      // WHEN THIS, IT READS THEN THE CURRENT YEAR, AND THEN THE ID PUBLIC OF THE NAME, AND CREATED THE FOLDERS IT THEY DO NOT EXIST
      var _NAME = file.originalname.substring(file.originalname.indexOf('_') +1, file.originalname.length);
      var _CURRENTYEAR = _NAME.substring(0, _NAME.indexOf('_'));
      _NAME = _NAME.substring(_NAME.indexOf('_') +1 , _NAME.length);
      var _HOMEFOLDER = _NAME.substring(0, _NAME.indexOf('_'));

      DIR = DIR_SUBMIT + _CURRENTYEAR + "/" + _HOMEFOLDER + "/" ;
      console.log("Checking dirs if extist: ", _CURRENTYEAR, _HOMEFOLDER)
      var fs = require('fs');
      if (!fs.existsSync(DIR_SUBMIT + _CURRENTYEAR)) {
        console.log(_CURRENTYEAR, "Does not exist, creating...")
        fs.mkdirSync(DIR_SUBMIT + _CURRENTYEAR);
      }
      if (!fs.existsSync(DIR)) {
        console.log(_HOMEFOLDER, "Does not exist, creating...")
        fs.mkdirSync(DIR);
      }
    }
    else if (origin_name == 'norm') {
      // WHEN THIS, IT READS THEN THE CURRENT YEAR, AND THEN THE ID PUBLIC OF THE NAME, AND CREATED THE FOLDERS IT THEY DO NOT EXIST
      var _NAME = file.originalname.substring(file.originalname.indexOf('_') +1, file.originalname.length);
      var _CURRENTYEAR = _NAME.substring(0, _NAME.indexOf('_'));
      _NAME = _NAME.substring(_NAME.indexOf('_') +1 , _NAME.length);
      var _HOMEFOLDER = _NAME.substring(0, _NAME.indexOf('_'));

      DIR = DIR_NORMS + _CURRENTYEAR + "/" + _HOMEFOLDER + "/" ;
      console.log("Checking dirs if extist: ", _CURRENTYEAR, _HOMEFOLDER)
      var fs = require('fs');
      if (!fs.existsSync(DIR_NORMS + _CURRENTYEAR)) {
        console.log(_CURRENTYEAR, "Does not exist, creating...")
        fs.mkdirSync(DIR_NORMS + _CURRENTYEAR);
      }
      if (!fs.existsSync(DIR)) {
        console.log(_HOMEFOLDER, "Does not exist, creating...")
        fs.mkdirSync(DIR);
      }
    }
    cb(null, DIR)
  },
  filename: function (req, file, cb) {
    var name = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
    var extension = file.originalname.split('.').pop();
    cb(null, name + '_' + Date.now() + '.' + extension);
  }
})

const upload = multer({ storage: storage })

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//  Allow form-data parsing
app.use(upload.any());

const db = require("./app/models");
// Santandar use
/* 
db.sequelize.sync(); 
*/ 
// Use this to ONLY UPDATE TABLES

db.sequelize.sync({ alter: true }).then(() => {
    console.error("Re-sync db.");
    console.error("DONE!");
  });


app.get('/', (req, res) => {
  res.json({ message: "Connection to Server OK!" });
});



// Ruotes
require("./app/routes/mailbox.routes")(app);
require("./app/routes/pqrs_main.routes")(app);
require("./app/routes/appointments.routes")(app);
require("./app/routes/publications.routes")(app);
require("./app/routes/roles.routes")(app);
require("./app/routes/users.routes")(app);
require("./app/routes/custom.routes")(app);
require("./app/routes/seal.routes")(app);
require("./app/routes/fun.routes")(app);
require("./app/routes/record_arc.routes")(app);
require("./app/routes/record_law.routes")(app);
require("./app/routes/record_eng.routes")(app);
require("./app/routes/record_ph.routes")(app);
require("./app/routes/record_review.routes")(app);
require("./app/routes/nomeclature.routes")(app);
require("./app/routes/submit.routes")(app);
require("./app/routes/expedition.routes")(app);
require("./app/routes/archives.routes")(app);
require("./app/routes/certificacionts.routes")(app);
require("./app/routes/norm.routes")(app);
require("./app/routes/solicitors.routes")(app);
require("./app/routes/cub_x_vr.routes")(app);
require("./app/routes/new_pqrs.routes")(app);
require("./app/routes/generate-docs.routes")(app);


// FOR DEV AND TESTING

const PORT = process.env.PORT || 3001;
const IP_ADRESS = process.env.IP_ADRESS || '127.0.0.1';

// FOR VPS TESTING
/*
const PORT = process.env.PORT || 3001;
const IP_ADRESS = process.env.IP_ADRESS || '153.92.2.25';
*/
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
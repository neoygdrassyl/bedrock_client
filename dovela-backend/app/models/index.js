const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  dialectOptions: {
    multipleStatements: true
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Separate from the SQL Model
db.templates = require("./templates.model.js")(sequelize, Sequelize);
db.uadits = require("./audits.model.js")(sequelize, Sequelize);
db.mailbox = require("./mailbox.model.js")(sequelize, Sequelize);
db.certification = require("./certification.model.js")(sequelize, Sequelize);
// PQRS
db.pqrs_masters = require("./pqrs/pqrs_masters.model.js")(sequelize, Sequelize);
db.pqrs_solicitors = require("./pqrs/pqrs_solicitor.model.js")(sequelize, Sequelize);
db.pqrs_attachs = require("./pqrs/pqrs_attach.model.js")(sequelize, Sequelize);
db.pqrs_contacts = require("./pqrs/pqrs_contact.model.js")(sequelize, Sequelize);
db.pqrs_fun = require("./pqrs/pqrs_fun.model.js")(sequelize, Sequelize);
db.pqrs_workers = require("./pqrs/pqrs_worker.model.js")(sequelize, Sequelize);
db.pqrs_location = require("./pqrs/pqrs_location.model.js")(sequelize, Sequelize);
db.pqrs_law = require("./pqrs/pqrs_law.model.js")(sequelize, Sequelize);
db.pqrs_time = require("./pqrs/pqrs_time.model.js")(sequelize, Sequelize);
db.pqrs_info = require("./pqrs/pqrs_info.model.js")(sequelize, Sequelize);
db.pqrs_step = require("./pqrs/pqrs_step.model.js")(sequelize, Sequelize);

// NEW PQRS

db.new_pqrs_master = require("./new_pqrs/pqrs_master.model.js")(sequelize, Sequelize);
db.new_pqrs_clasification = require("./new_pqrs/pqrs_clasification.model.js")(sequelize, Sequelize);
db.new_pqrs_control = require("./new_pqrs/pqrs_control.model.js")(sequelize, Sequelize);
db.new_pqrs_evaluation = require("./new_pqrs/pqrs_evaluation.model.js")(sequelize, Sequelize);
db.new_pqrs_petitioners = require("./new_pqrs/pqrs_petitioners.model.js")(sequelize, Sequelize);
db.new_pqrs_translation = require("./new_pqrs/pqrs_translation.model.js")(sequelize, Sequelize);
db.new_pqrs_responses = require("./new_pqrs/pqrs_response.model.js")(sequelize, Sequelize);
db.new_pqrs_times = require("./new_pqrs/pqrs_times.model.js")(sequelize, Sequelize);


// OTHER CLASSES
db.appointments = require("./appointments.model.js")(sequelize, Sequelize);
db.publications = require("./publications.model.js")(sequelize, Sequelize);
db.seals = require("./seal.model.js")(sequelize, Sequelize);
// USERS & ROLES
db.roles = require("./roles.model.js")(sequelize, Sequelize);
db.users = require("./users.model.js")(sequelize, Sequelize);

// FUN!
db.fun_0 = require("./fun/fun_0.model.js")(sequelize, Sequelize);
db.fun_1 = require("./fun/fun_1.model.js")(sequelize, Sequelize);
db.fun_2 = require("./fun/fun_2.model.js")(sequelize, Sequelize);
db.fun_3 = require("./fun/fun_3.model.js")(sequelize, Sequelize);
db.fun_4 = require("./fun/fun_4.model.js")(sequelize, Sequelize);
db.fun_51 = require("./fun/fun_51.model.js")(sequelize, Sequelize);
db.fun_52 = require("./fun/fun_52.model.js")(sequelize, Sequelize);
db.fun_53 = require("./fun/fun_53.model.js")(sequelize, Sequelize);
db.fun_6 = require("./fun/fun_6.model.js")(sequelize, Sequelize);
db.fun_6_h = require("./fun/fun_6_h.model.js")(sequelize, Sequelize);
db.fun_c = require("./fun/fun_c.model.js")(sequelize, Sequelize);
db.fun_r = require("./fun/fun_r.model.js")(sequelize, Sequelize);
db.fun_law = require("./fun/fun_law.model.js")(sequelize, Sequelize);
db.fun_clock = require("./fun/fun_clock.model.js")(sequelize, Sequelize);

// ARCHIVE
db.fun_archive = require("./fun/fun_archive.model.js")(sequelize, Sequelize);
db.process_x_arch = require("./fun/process_x_arch.model.js")(sequelize, Sequelize);

// RECORDS LAW
db.record_law = require("./record_law/record_law.model.js")(sequelize, Sequelize);
db.record_law_step = require("./record_law/record_law_step.model.js")(sequelize, Sequelize);
db.record_law_gen = require("./record_law/record_law_gen.model.js")(sequelize, Sequelize);
db.record_law_doc = require("./record_law/record_law_doc.model.js")(sequelize, Sequelize);
db.record_law_licence = require("./record_law/record_law_licence.model.js")(sequelize, Sequelize);
db.record_law_11_liberty = require("./record_law/record_law_11_liberty.model.js")(sequelize, Sequelize);
db.record_law_11_tax = require("./record_law/record_law_11_tax.model.js")(sequelize, Sequelize);
db.record_law_review = require("./record_law/record_law_review.model.js")(sequelize, Sequelize);

// RECORDS ENG
db.record_eng = require("./record_eng/record_eng.model.js")(sequelize, Sequelize);
db.record_eng_step = require("./record_eng/record_eng_step.model.js")(sequelize, Sequelize);
db.record_eng_sismic = require("./record_eng/record_eng_sismic.model.js")(sequelize, Sequelize);
db.record_eng_review = require("./record_eng/record_eng_review.model.js")(sequelize, Sequelize);

// RECORDS ARCHITECTURE
db.record_arc = require("./record_arc/record_arc.model.js")(sequelize, Sequelize);
db.record_arc_33_area = require("./record_arc/record_arc_33_area.model.js")(sequelize, Sequelize);
db.record_arc_34_gens = require("./record_arc/record_arc_34_gen.model.js")(sequelize, Sequelize);
db.record_arc_34_k = require("./record_arc/record_arc_34_k.model.js")(sequelize, Sequelize);
db.record_arc_35_parking = require("./record_arc/record_arc_35_parking.model.js")(sequelize, Sequelize);
db.record_arc_35_location = require("./record_arc/record_arc_35_location.model.js")(sequelize, Sequelize);
db.record_arc_35_location = require("./record_arc/record_arc_35_location.model.js")(sequelize, Sequelize);
db.record_arc_36_info = require("./record_arc/record_arc_36_info.model")(sequelize, Sequelize);
db.record_arc_37 = require("./record_arc/record_arc_37.model.js")(sequelize, Sequelize);
db.record_arc_step = require("./record_arc/record_arc_step.model.js")(sequelize, Sequelize);
db.record_arc_38 = require("./record_arc/record_arc_38.model.js")(sequelize, Sequelize);

// RECORDS PH
db.record_ph = require("./record_ph/record_ph.model.js")(sequelize, Sequelize);
db.record_ph_blueprint = require("./record_ph/record_ph_blueprint.model.js")(sequelize, Sequelize);
db.record_ph_floor = require("./record_ph/record_ph_floor.model.js")(sequelize, Sequelize);
db.record_ph_building = require("./record_ph/record_ph_building.model.js")(sequelize, Sequelize);
db.record_ph_step = require("./record_ph/record_ph_step.model.js")(sequelize, Sequelize);

// RECORD REVIEW
db.record_review = require("./record_review.model.js")(sequelize, Sequelize);

db.expedition = require("./expedition/expedition.model.js")(sequelize, Sequelize);
db.exp_area = require("./expedition/exp_area.model.js")(sequelize, Sequelize);

// NOMENCLATURES
db.nomenclature = require("./nomenclature/nomenclature.model.js")(sequelize, Sequelize);
db.nomen_docs = require("./nomenclature/nomedocs.model.js")(sequelize, Sequelize);
// NOMENCLATURRES RELATIONS
db.nomenclature.hasOne(db.nomen_docs);
db.nomen_docs.belongsTo(db.nomenclature);

// SUBMIT
db.submit = require("./submit/submit.model.js")(sequelize, Sequelize);
db.sub_list = require("./submit/sub_list.model.js")(sequelize, Sequelize);
db.sub_docs = require("./submit/submit_doc.model.js")(sequelize, Sequelize);

//SOLICITORS
db.solicitors = require("./solicitors.model.js")(sequelize, Sequelize);
db.reason = require("./reason.model.js")(sequelize, Sequelize);
//Injuction table
db.submitSolicitor = require("./submitSolicitor.model.js")(sequelize, Sequelize);

//CubXVR 
db.cubXvr =require("./cubXvr.model.js")(sequelize,Sequelize)


//Solicitors reason ONE -> Many
db.solicitors.hasMany(db.reason);
db.reason.belongsTo(db.solicitors);


//SOLICITORS MAY TO MAY  SOLICITOR -> Sumbits (VR'S)
// db.solicitors.belongsToMany(db.submit, { through: db.submitSolicitor });
// db.submit.belongsToMany(db.solicitors, { through: db.submitSolicitor });

// db.solicitors.hasMany(db.submitSolicitor)
db.submit.hasMany(db.submitSolicitor)
db.submitSolicitor.belongsTo(db.solicitors);
db.submitSolicitor.belongsTo(db.submit);


// SUBMIT RELATIONS
db.submit.hasMany(db.sub_list);
db.sub_list.belongsTo(db.submit);
db.submit.hasOne(db.sub_docs);
db.sub_docs.belongsTo(db.submit);


// NORM
db.norm = require("./norm/norm.model.js")(sequelize, Sequelize);
db.norm_predio = require("./norm/norm_predio.mode.js")(sequelize, Sequelize);
db.norm_neighbor = require("./norm/norm_neighbour.model.js")(sequelize, Sequelize);
db.norm_perfil = require("./norm/norm_perfil.model.js")(sequelize, Sequelize);
db.norm_perfil_element = require("./norm/norm_perfil_element.model.js")(sequelize, Sequelize);

// ONE TO MANY -> USERS - ROLES
db.roles.hasMany(db.users, { foreignKey: 'roleId' });
db.users.belongsTo(db.roles);

// ONE TO ONE -> PQRS
db.pqrs_masters.hasOne(db.pqrs_fun);
db.pqrs_fun.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasOne(db.pqrs_location);
db.pqrs_location.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasOne(db.pqrs_law);
db.pqrs_law.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasOne(db.pqrs_time);
db.pqrs_time.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasOne(db.pqrs_info);
db.pqrs_info.belongsTo(db.pqrs_masters);
// ONE TO MANY -> PQRS
db.pqrs_masters.hasMany(db.pqrs_solicitors);
db.pqrs_solicitors.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasMany(db.pqrs_attachs);
db.pqrs_attachs.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasMany(db.pqrs_contacts);
db.pqrs_contacts.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasMany(db.pqrs_workers);
db.pqrs_workers.belongsTo(db.pqrs_masters);
db.pqrs_masters.hasMany(db.pqrs_step);
db.pqrs_step.belongsTo(db.pqrs_masters);

// ONE TO MANY -> FUN!
db.fun_0.hasMany(db.fun_1);
db.fun_1.belongsTo(db.fun_0);
db.fun_0.hasMany(db.fun_51);
db.fun_51.belongsTo(db.fun_0);
db.fun_0.hasMany(db.fun_52);
db.fun_52.belongsTo(db.fun_0);
db.fun_0.hasMany(db.fun_53);
db.fun_53.belongsTo(db.fun_0);
db.fun_0.hasMany(db.fun_6);
db.fun_6.belongsTo(db.fun_0);
db.fun_6.hasMany(db.fun_6_h);
db.fun_6_h.belongsTo(db.fun_6);

db.fun_0.hasMany(db.fun_3);
db.fun_3.belongsTo(db.fun_0);
db.fun_0.hasMany(db.fun_4);
db.fun_4.belongsTo(db.fun_0);
// CHECK LIST INFO
db.fun_0.hasMany(db.fun_c);
db.fun_c.belongsTo(db.fun_0);
// CHECK LIST DOCUMENTOS
db.fun_0.hasMany(db.fun_r);
db.fun_r.belongsTo(db.fun_0);
// CLOCK
db.fun_0.hasMany(db.fun_clock);
db.fun_clock.belongsTo(db.fun_0);

// ONE TO ONE -> FUN!
db.fun_0.hasOne(db.fun_2);
db.fun_2.belongsTo(db.fun_0);
// TIME CONSTROL
db.fun_0.hasOne(db.fun_law);
db.fun_law.belongsTo(db.fun_0);

// ONE TO ONE -> FUN -> SEALS
db.fun_0.hasOne(db.seals);
db.seals.belongsTo(db.fun_0);


// RECORDS LAW
// FUN RECORD LAW RELATION
db.fun_0.hasOne(db.record_law);
db.record_law.belongsTo(db.fun_0);
// ONE TO MANY -  VERSION CONTROL
db.record_law.hasMany(db.record_law_gen);
db.record_law_gen.belongsTo(db.record_law);
db.record_law.hasMany(db.record_law_doc);
db.record_law_doc.belongsTo(db.record_law);
db.record_law.hasMany(db.record_law_review);
db.record_law_review.belongsTo(db.record_law);
db.record_law.hasMany(db.record_law_licence);
db.record_law_licence.belongsTo(db.record_law);
// ONE TO MANY - LIST CONTROL
db.record_law.hasMany(db.record_law_11_liberty);
db.record_law_11_liberty.belongsTo(db.record_law);
db.record_law.hasMany(db.record_law_11_tax);
db.record_law_11_tax.belongsTo(db.record_law);
db.record_law.hasMany(db.record_law_step);
db.record_law_step.belongsTo(db.record_law);


// RECORDS ENG
// FUN RECORD ENG RELATION
db.fun_0.hasOne(db.record_eng);
db.record_eng.belongsTo(db.fun_0);
// ONE TO MANY
db.record_eng.hasMany(db.record_eng_step);
db.record_eng_step.belongsTo(db.record_eng);
db.record_eng.hasMany(db.record_eng_sismic);
db.record_eng_sismic.belongsTo(db.record_eng);
db.record_eng.hasMany(db.record_eng_review);
db.record_eng_review.belongsTo(db.record_eng);

// RECORDS ARCHITECTURE
// FUN RECORD ARC RELATION
db.fun_0.hasOne(db.record_arc);
db.record_arc.belongsTo(db.fun_0)

// ONE TO MANY - LIST CONTROL
db.record_arc.hasMany(db.record_arc_33_area);
db.record_arc_33_area.belongsTo(db.record_arc);
db.record_arc.hasMany(db.record_arc_35_parking);
db.record_arc_35_parking.belongsTo(db.record_arc);
db.record_arc.hasMany(db.record_arc_35_location);
db.record_arc_35_location.belongsTo(db.record_arc);
db.record_arc.hasMany(db.record_arc_36_info);
db.record_arc_36_info.belongsTo(db.record_arc);
db.record_arc.hasMany(db.record_arc_37);
db.record_arc_37.belongsTo(db.record_arc);

db.record_arc.hasMany(db.record_arc_step);
db.record_arc_step.belongsTo(db.record_arc);
db.record_arc.hasMany(db.record_arc_38);
db.record_arc_38.belongsTo(db.record_arc);
db.record_arc.hasMany(db.record_arc_34_gens);
db.record_arc_34_gens.belongsTo(db.record_arc);
db.record_arc.hasMany(db.record_arc_34_k);
db.record_arc_34_k.belongsTo(db.record_arc_34_k);

// RECORDS PH
db.fun_0.hasOne(db.record_ph);
db.record_ph.belongsTo(db.fun_0);
db.record_ph.hasMany(db.record_ph_blueprint);
db.record_ph_blueprint.belongsTo(db.record_ph);
db.record_ph.hasMany(db.record_ph_floor);
db.record_ph_floor.belongsTo(db.record_ph);
db.record_ph.hasMany(db.record_ph_building);
db.record_ph_building.belongsTo(db.record_ph);
db.record_ph.hasMany(db.record_ph_step);
db.record_ph_step.belongsTo(db.record_ph);

// RECORD REVIEW
db.fun_0.hasOne(db.record_review);
db.record_review.belongsTo(db.fun_0);


db.fun_0.hasOne(db.expedition);
db.expedition.belongsTo(db.fun_0);
db.expedition.hasMany(db.exp_area);
db.exp_area.belongsTo(db.expedition);

// ARCHIVE
db.fun_0.hasMany(db.process_x_arch);
db.process_x_arch.belongsTo(db.fun_0);

db.fun_archive.hasMany(db.process_x_arch);
db.process_x_arch.belongsTo(db.fun_archive);

// NORM
db.norm.hasMany(db.norm_predio);
db.norm_predio.belongsTo(db.norm);
db.norm.hasMany(db.norm_neighbor);
db.norm_neighbor.belongsTo(db.norm);
db.norm.hasMany(db.norm_perfil);
db.norm_perfil.belongsTo(db.norm);
db.norm_perfil.hasMany(db.norm_perfil_element);
db.norm_perfil_element.belongsTo(db.norm_perfil);

//NEW PQRS
//ONE TO ONE
db.new_pqrs_master.hasOne(db.new_pqrs_evaluation);
db.new_pqrs_evaluation.belongsTo(db.new_pqrs_master);

db.new_pqrs_master.hasOne(db.new_pqrs_responses);
db.new_pqrs_responses.belongsTo(db.new_pqrs_master);

db.new_pqrs_master.hasOne(db.new_pqrs_clasification);
db.new_pqrs_clasification.belongsTo(db.new_pqrs_master);

//ONE TO MANY
db.new_pqrs_master.hasMany(db.new_pqrs_petitioners);
db.new_pqrs_petitioners.belongsTo(db.new_pqrs_master);
//
db.new_pqrs_master.hasMany(db.new_pqrs_control);
db.new_pqrs_control.belongsTo(db.new_pqrs_master);
//
db.new_pqrs_master.hasMany(db.new_pqrs_translation);
db.new_pqrs_translation.belongsTo(db.new_pqrs_master);
//

db.new_pqrs_master.hasMany(db.new_pqrs_times)
db.new_pqrs_times.belongsTo(db.new_pqrs_master)







module.exports = db;

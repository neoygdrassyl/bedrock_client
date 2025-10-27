module.exports = app => {
  const pqrs_main = require("../controllers/pqrs_main.controller.js");

  var router = require("express").Router();



  // Retrieve all entries
  router.get("/", pqrs_main.findAll);
  router.get("/pqrs/all", pqrs_main.findAll_pqrs);
  router.get("/pqrs/pending", pqrs_main.findPending_pqrs);
  router.get("/pqrs/macro/:date_sart&:date_end", pqrs_main.findAll_macro);
  router.get("/info/workers", pqrs_main.findAllWorkers);
  router.get("/:id", pqrs_main.findOne);
  router.get("/loadsubmit/:date_start&:date_end", pqrs_main.loadSubmit);

  router.get("/pqrs/lastid", pqrs_main.findLastID);
  router.get("/pqrs/lastcub", pqrs_main.findLastIDCub);

  // Create a new entry
  router.post("/", pqrs_main.create);
  router.post("/create_public", pqrs_main.create_public);
  router.post("/createWorker", pqrs_main.createWorker);
  router.post("/search/", pqrs_main.search);
  router.post("/process/informalreply", pqrs_main.informalReply);
  router.post("/process/formalreply", pqrs_main.formalReply);
  router.post("/process/addattachsclose", pqrs_main.addAttachsClose);
  router.post("/pdfgen/reply", pqrs_main.request_pdfReply);
  router.post("/pdfgen/confirmation", pqrs_main.request_pdfConfirmation);
  router.post("/process/close", pqrs_main.close);

  // EMAILS
  router.post("/process/emailreply", pqrs_main.sendEmailReply);
  router.post("/process/emailconfiration", pqrs_main.sendEmailNotification);
  router.post("/process/emailworkernotification", pqrs_main.emailworkernotification);
  router.post("/process/emailextension", pqrs_main.sendEmailExtension);


  router.post("/create_solicitor", pqrs_main.create_solicitor);
  router.post("/create_contact", pqrs_main.create_contact);
  router.post("/create_attach", pqrs_main.create_attach);
  router.post("/create_fun", pqrs_main.create_fun);

  // Update a entry with id
  router.put("/:id", pqrs_main.update);
  router.put("/process/worker/:id", pqrs_main.updateWoker);

  router.put("/update_solicito/:id", pqrs_main.update_solicitor);
  router.put("/update_contact/:id", pqrs_main.update_contact);
  router.put("/update_attach/:id", pqrs_main.update_attach);
  router.put("/update_fun/:id", pqrs_main.update_fun);
  router.put("/update_main/:id", pqrs_main.update_main);
  router.put("/update_time/:id", pqrs_main.update_time);

  // Delete a entry with id
  router.delete("/:id", pqrs_main.delete);
  router.delete("/process/deleteAttach/:id", pqrs_main.deleteAttach);
  router.delete("/process/deleteWorker/:id", pqrs_main.deleteWorker);
  router.delete("/", pqrs_main.deleteAll);


  router.delete("/delete_solicitor/:id", pqrs_main.delete_solicitor);
  router.delete("/delete_contact/:id", pqrs_main.delete_contact);

  // other apis
  router.post("/access/edit", pqrs_main.access_edit);
  router.get("/history/:public_id", pqrs_main.history);

  // STEPS 
  router.get("/step", pqrs_main.get_all_step);
  router.post("/step", pqrs_main.create_step);
  router.put("/step/:id", pqrs_main.update_step);
  router.delete("/step/:id", pqrs_main.delete_step);

  app.use('/api/pqrs_main', router);
};
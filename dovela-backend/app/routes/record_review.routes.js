module.exports = app => {
  const Record_RR = require("../controllers/record_review.controller.js")

  var router = require("express").Router();


  router.get("/", Record_RR.findAll);
  router.get("/:id", Record_RR.findOne);
  router.get("/findrecord/:id", Record_RR.findSingle);

  router.post("/gendoc/confirmact", Record_RR.gendoc_confirmact);
  router.post("/gendoc/confirmact2", Record_RR.gendoc_confirmact_2);
  router.post("/pdfgen/", Record_RR.pdfgen);

  // Create a new entry
  router.post("/", Record_RR.create);

  // Update a entry with id
  router.put("/:id", Record_RR.update);

  // Delete a entry with id
  router.delete("/:id", Record_RR.delete);

  // NEW VERSION
  router.post("/newVersion/", Record_RR.createVersion);

  // PDF GEN

  app.use('/api/recordr', router);
};
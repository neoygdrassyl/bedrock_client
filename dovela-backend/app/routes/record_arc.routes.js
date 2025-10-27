module.exports = app => {
  const Record_Arc = require("../controllers/record_arc.controller.js");

  var router = require("express").Router();


  router.get("/", Record_Arc.findAll);
  router.get("/:id", Record_Arc.findOne);
  router.get("/findrecord/:id", Record_Arc.findSingle);
  router.get("/getsteps/:id", Record_Arc.getsteps);
  router.post("/pdfgen/", Record_Arc.pdfgen);

  // Create a new entry
  router.post("/", Record_Arc.create);

  router.post("/create33area/", Record_Arc.create33area);
  router.post("/create34gen/", Record_Arc.create34gen);
  router.post("/create34k/", Record_Arc.create34k);
  router.post("/create35parking/", Record_Arc.create35parking);
  router.post("/create35location/", Record_Arc.create35location);
  router.post("/create36info/", Record_Arc.create36Info);
  router.post("/create37/", Record_Arc.create37);
  router.post("/create38/", Record_Arc.create38);
  router.post("/create_step/", Record_Arc.create_step);

  // XCREATES 
  router.post("/create_xbp/", Record_Arc.create_xbp);

  // Update a entry with id
  router.put("/:id", Record_Arc.update);
  router.put("/update33area/:id", Record_Arc.update33area);
  router.put("/update34gens/:id", Record_Arc.update34gens);
  router.put("/update34k/:id", Record_Arc.update34k);
  router.put("/update35parking/:id", Record_Arc.update35parking);
  router.put("/update35location/:id", Record_Arc.update35location);
  router.put("/update36info/:id", Record_Arc.update36Info);
  router.put("/update37/:id", Record_Arc.update37);
  router.put("/update38/:id", Record_Arc.update38);
  router.put("/update_step/:id", Record_Arc.update_step);

  // Delete a entry with id
  router.delete("/:id", Record_Arc.delete);
  router.delete("/delete33area/:id&:sort&:recordArcId&:type", Record_Arc.delete33area);
  router.delete("/delete33areabyId/:id", Record_Arc.delete33areabyId);
  router.delete("/delete34gens/:id", Record_Arc.delete34gens);
  router.delete("/delete34k/:id", Record_Arc.delete34k);
  router.delete("/delete35parking/:id", Record_Arc.delete35parking);
  router.delete("/delete35location/:id", Record_Arc.delete35location);
  router.delete("/delete36info/:id", Record_Arc.delete36Info);
  router.delete("/delete37/:id", Record_Arc.delete37);

  // Delete all entry
  router.delete("/", Record_Arc.deleteAll);

  app.use('/api/recordarc', router);
};
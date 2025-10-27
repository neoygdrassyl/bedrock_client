module.exports = app => {
  const Record_Ph = require("../controllers/record_ph.controller.js")

  var router = require("express").Router();


  router.get("/", Record_Ph.findAll);
  router.get("/:id", Record_Ph.findOne);
  router.get("/findrecord/:id", Record_Ph.findSingle);

  // Create a new entry
  router.post("/", Record_Ph.create);
  router.post("/createblueprint/", Record_Ph.create_blueprint);
  router.post("/createfloor/", Record_Ph.create_floor);
  router.post("/createbuilding/", Record_Ph.create_building);
  router.post("/create_step/", Record_Ph.create_step);

  // Update a entry with id
  router.put("/:id", Record_Ph.update);
  router.put("/updateblueprint/:id", Record_Ph.update_blueprint);
  router.put("/updatefloor/:id", Record_Ph.update_floor);
  router.put("/updatebuilding/:id", Record_Ph.update_building);
  router.put("/update_step/:id", Record_Ph.update_step);

  // Delete a entry with id
  router.delete("/:id", Record_Ph.delete);
  router.delete("/deleteblueprint/:id", Record_Ph.delete_blueprint);
  router.delete("/deletefloor/:id", Record_Ph.delete_floor);
  router.delete("/deletebuilding/:id", Record_Ph.delete_building);

  // PDF GEN
  router.post("/gendoc/ph", Record_Ph.gendoc_ph);
  router.post("/gendoc/not", Record_Ph.gendoc_not);

  // Delete all entry
  router.delete("/", Record_Ph.deleteAll);

  app.use('/api/recordph', router);
};
module.exports = app => {
  const Expedition = require("../controllers/expedition.controller.js")

  var router = require("express").Router();


  router.get("/", Expedition.findAll);
  router.get("/:id", Expedition.findOne);
  router.get("/findrecord/:id", Expedition.findSingle);

  // Create a new entry
  router.post("/", Expedition.create);
  router.post("/create_exp_area", Expedition.create_exp_area);

  // Update a entry with id
  router.put("/:id", Expedition.update);
  router.put("/update_exp_area/:id", Expedition.update_exp_area);

  // Delete a entry with id
  router.delete("/:id", Expedition.delete);
  router.delete("/delete_exp_area/:id", Expedition.delete_exp_area);

  // PDF GEN
  router.post("/gen_doc_1/", Expedition.gen_doc_1);
  router.post("/gen_doc_2/", Expedition.gen_doc_2);
  router.post("/gen_doc_3/", Expedition.gen_doc_3);
  router.post("/gen_doc_4/", Expedition.gen_doc_4);
  router.post("/gen_doc_5/", Expedition.gen_doc_5);
  router.post("/gen_doc_6/", Expedition.gen_doc_6);
  router.post("/gen_doc_7/", Expedition.gen_doc_7);
  router.post("/gen_doc_res/", Expedition.gen_doc_res);
  router.post("/gen_doc_eje/", Expedition.gen_doc_eje);
  router.post("/gen_doc_final_not/", Expedition.gen_doc_final_not);

  app.use('/api/expedition', router);

};
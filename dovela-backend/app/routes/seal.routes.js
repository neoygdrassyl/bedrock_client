module.exports = app => {
  const seals = require("../controllers/seal.controller.js");

  var router = require("express").Router();

  // Create a new entry
  router.post("/", seals.create);

  // Retrieve all entries
  router.get("/", seals.findAll);

  // Retrieve a single entry with id
  router.get("/findfamily/:id_public", seals.findSeal);

  // Retrieve all entries
  router.get("/getsearch/:field&:string", seals.findSearch);

  // Retrieve a single entry with id
  router.get("/:id", seals.findOne);

  // Update a entry with id
  router.put("/:id", seals.update);

  // Delete a entry with id
  router.delete("/:id", seals.delete);

  // Delete all entry
  router.delete("/", seals.deleteAll);

  app.use('/api/seals', router);
};
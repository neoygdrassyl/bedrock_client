module.exports = app => {
    const roles = require("../controllers/roles.controller.js");
  
    var router = require("express").Router();
  
    // Create a new entry
    router.post("/", roles.create);
  
    // Retrieve all entries
    router.get("/", roles.findAll);
  
    // Retrieve all published entries
    router.get("/published", roles.findAllPublished);
  
    // Retrieve a single entry with id
    router.get("/:id", roles.findOne);
  
    // Update a entry with id
    router.put("/:id", roles.update);
  
    // Delete a entry with id
    router.delete("/:id", roles.delete);
  
    // Delete all entry
    router.delete("/", roles.deleteAll);
  
    app.use('/api/roles', router);
  };
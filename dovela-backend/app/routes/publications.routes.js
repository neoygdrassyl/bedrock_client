module.exports = app => {
    const publications = require("../controllers/publications.controller.js");
  
    var router = require("express").Router();
  
    // Create a new entry
    router.post("/", publications.create);
  
    // Retrieve all entries
    router.get("/", publications.findAll);
  
    // Retrieve a single entry with id
    router.get("/:id", publications.findOne);
  
    // Update a entry with id
    router.put("/:id", publications.update);
  
    // Delete a entry with id
    router.delete("/:id", publications.delete);
  
    // Delete all entry
    router.delete("/", publications.deleteAll);
  
    app.use('/api/publications', router);
  };
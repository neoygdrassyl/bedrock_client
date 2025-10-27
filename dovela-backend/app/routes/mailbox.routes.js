module.exports = app => {
    const mailbox = require("../controllers/mailbox.controller.js");
  
    var router = require("express").Router();
  
    // Create a new entry
    router.post("/", mailbox.create);
  
    // Retrieve all entries
    router.get("/", mailbox.findAll);
  
    // Retrieve all published entries
    router.get("/published", mailbox.findAllPublished);
  
    // Retrieve a single entry with id
    router.get("/:id", mailbox.findOne);
  
    // Update a entry with id
    router.put("/:id", mailbox.update);
  
    // Delete a entry with id
    router.delete("/:id", mailbox.delete);
  
    // Delete all entry
    router.delete("/", mailbox.deleteAll);
  
    app.use('/api/mailbox', router);
  };
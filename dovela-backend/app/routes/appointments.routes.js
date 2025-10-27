module.exports = app => {
    const appointments = require("../controllers/appointments.controller.js");
  
    var router = require("express").Router();
  
    // Create a new entry
    router.post("/", appointments.create);

    // CHECKS THE AVAIABILIT OF A DATE
    router.post("/search/aviailabledate", appointments.findaAviailAbleDate);
  
    // Retrieve all entries
    router.get("/", appointments.findAll);
  
    // Retrieve a single entry with id
    router.get("/:id", appointments.findOne);
  
    // Update a entry with id
    router.put("/:id", appointments.update);
  
    // Delete a entry with id
    router.delete("/:id", appointments.delete);
  
    // Delete all entry
    router.delete("/", appointments.deleteAll);
  
    app.use('/api/appointments', router);
  };
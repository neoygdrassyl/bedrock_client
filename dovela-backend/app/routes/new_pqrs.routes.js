module.exports = app => {
    const new_pqrs = require("../controllers/new_pqrs.controller.js")
    var router = require("express").Router();
    
    // Retrieve all entries
    // router.get("/", new_pqrs.findAll);
  
    // Create a new entry
    router.post("/", new_pqrs.createPQRS);
    //Get all entries
    router.get("/", new_pqrs.getAllPQRS);
    //Get one
    router.get("/:id", new_pqrs.getById);
    //update
    router.put("/:id", new_pqrs.updatePQRS);

    //response pqrs
    router.put("/response/:id", new_pqrs.createResponse);


    app.use('/api/new_pqrs', router);
  };
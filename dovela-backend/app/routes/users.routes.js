module.exports = app => {
    const users = require("../controllers/users.controller.js");
  
    var router = require("express").Router();
  
    // Create a new entry
    router.post("/", users.create);
  
    // Retrieve all entries
    router.get("/", users.findAll);
  
    // Retrieve a single entry with id
    router.get("/:id", users.findOne);
  
    // Update a entry with id
    router.put("/:id", users.update);
  
    // Delete a entry with id
    router.delete("/:id", users.delete);
  
    // Delete all entry
    router.delete("/", users.deleteAll);

    router.get("/get/workers", users.loadWorkers);
    router.get("/get/appointments", users.loadAppointments);
    router.get("/get/certificate/:id_number&:password", users.loadCertificate);
    router.get("/get/certificate_data/:id_number", users.loadCertificateData);
    router.get("/get/certificate_data_pdf/:id_number", users.loadCertificateDataPDF);

    app.use('/api/users', router);
  };
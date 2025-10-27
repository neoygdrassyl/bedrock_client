module.exports = app => {
    const documentController = require("../controllers/generate-docs.controller.js");
  
    var router = require("express").Router();
  
    //router.post("/generate-docs/", documentController.generateDocx);
    router.post("/generate-pdf", documentController.generatePDF);
    
    app.use('/api/pdf-generate', router);
  };
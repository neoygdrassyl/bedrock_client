module.exports = app => {
    const CERT = require("../controllers/certifications.controller.js");
  
    var router = require("express").Router();

    router.get("/", CERT.findAll);
    router.get("/get/OC/:id_public", CERT.findByOc);
    router.get("/get/ID/:id", CERT.findById);
    router.get("/get/RE/:id_related&:related", CERT.findByRelated);

    router.post("/", CERT.create);
    
    router.put("/:id", CERT.update);

    router.delete("/:id", CERT.delete);

    router.post("/gendoc_cert_fun/", CERT.gendoc_cert_fun);
  
    app.use('/api/certification', router);
  };
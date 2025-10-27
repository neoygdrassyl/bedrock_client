module.exports = app => {
    const Record_Law = require("../controllers/record_law.controller.js");
  
    var router = require("express").Router();
  
  
    router.get("/", Record_Law.findAll);
    router.get("/:id", Record_Law.findOne);
    router.get("/findrecord/:id", Record_Law.findSingle);
    router.post("/pdfgen/", Record_Law.pdfgen);
  
    // Create a new entry
    router.post("/", Record_Law.create);
    router.post("/creategen/", Record_Law.creategen);
    router.post("/createdoc/", Record_Law.createdoc);
    router.post("/createreview/", Record_Law.createreview);
    router.post("/create11liberty/", Record_Law.create11liberty);
    router.post("/create11tax/", Record_Law.create11tax);
    router.post("/createlicence/", Record_Law.createlicence);
    router.post("/createStep/", Record_Law.createStep);
    router.post("/newrecord/", Record_Law.newrecord);

    // Update a entry with id
    router.put("/:id", Record_Law.update);
    router.put("/updategen/:id", Record_Law.updategen);
    router.put("/updatedoc/:id", Record_Law.updatedoc);
    router.put("/updatereview/:id", Record_Law.updatereview);
    router.put("/update11liberty/:id", Record_Law.update11liberty);
    router.put("/update11tax/:id", Record_Law.update11tax);
    router.put("/updatelicence/:id", Record_Law.updatelicence);
    router.put("/updateStep/:id", Record_Law.updateStep);
  
    // Delete a entry with id
    router.delete("/:id", Record_Law.delete);
    router.delete("/delete11liberty/:id", Record_Law.delete11liberty);
    router.delete("/delete11tax/:id", Record_Law.delete11tax);
    router.delete("/deletegen/:id", Record_Law.deletegen);
    router.delete("/deletelicence/:id", Record_Law.deletelicence);
  
    // Delete all entry
    router.delete("/", Record_Law.deleteAll);
  
    app.use('/api/recordlaw', router);
  };
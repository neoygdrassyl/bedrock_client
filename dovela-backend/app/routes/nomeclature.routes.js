module.exports = app => {
    const nocmeclature = require("../controllers/noemclature.controller.js");
  
    var router = require("express").Router();
  
    // Create a new entry
    router.post("/", nocmeclature.create);
    router.post("/anex", nocmeclature.create_anex);
  
    // Retrieve all entries
    router.get("/", nocmeclature.findAll);
  
    // Retrieve a single entry with id
    router.get("/:id", nocmeclature.findOne);
    router.get("/getsearch/:field&:string", nocmeclature.findSearch);
    router.get("/getexceldata/:start_date&:end_date", nocmeclature.findExcelData);
    router.get("/getid/lastid", nocmeclature.findLastID);
    router.get("/getall/public", nocmeclature.findAll_public);

    // Update a entry with id
    router.put("/:id", nocmeclature.update);
    router.put("/anex/:id", nocmeclature.update_anex);
  
    // Delete a entry with id
    router.delete("/:id", nocmeclature.delete);
  
    // Delete all entry
    router.delete("/", nocmeclature.deleteAll);

    // PDF GEN
    router.post("/gendoc/nomenclature", nocmeclature.gendoc_nomenclature);
  
    app.use('/api/nomenclature', router);
  };
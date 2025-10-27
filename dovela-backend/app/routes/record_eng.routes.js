module.exports = app => {
    const Record_Eng = require("../controllers/record_eng.controller.js");

    var router = require("express").Router();


    router.get("/", Record_Eng.findAll);
    router.get("/:id", Record_Eng.findOne);
    router.get("/findrecord/:id", Record_Eng.findSingle);
    router.get("/findIdRelated/:id", Record_Eng.findIdRelated);
    router.post("/pdfgen/", Record_Eng.pdfgen);

    // Create a new entry
    router.post("/", Record_Eng.create);
    router.post("/create_sis/", Record_Eng.create_sis);
    router.post("/create_xsis/", Record_Eng.create_xsis);
    router.post("/create_step/", Record_Eng.create_step);
    router.post("/create_review/", Record_Eng.create_review);

    // Update a entry with id
    router.put("/:id", Record_Eng.update);
    router.put("/update_step/:id", Record_Eng.update_step);
    router.put("/update_sis/:id", Record_Eng.update_sis);
    router.put("/update_review/:id", Record_Eng.update_review);

    // Delete a entry with id
    router.delete("/:id", Record_Eng.delete);
    router.delete("/delete_sis/:id&:sort&:recordEngId", Record_Eng.delete_sis);

    // Delete all entry
    router.delete("/", Record_Eng.deleteAll);

    app.use('/api/recordeng', router);
};
module.exports = app => {
    const submit = require("../controllers/submit.controller.js");
  
    var router = require("express").Router();
  
    // Create a new entry
    router.post("/", submit.create);
    router.post("/create_list", submit.create_list);
    router.post("/anex", submit.create_anex);
  
    // Retrieve all entries
    router.get("/", submit.findAll);  
  
    // Retrieve a single entry with id
    router.get("/:id", submit.findOne);
    router.get("/getsearch/:field&:string", submit.findSearch);
    router.get("/getid/lastid", submit.findLastID);
    router.get("/getid/verifyid/:id", submit.verifyRelatedId);
    router.get("/getlist/:id_related", submit.findIdRelated);

    // Update a entry with id
    router.put("/:id", submit.update);
    router.put("/update_list/:id", submit.update_list);
    router.put("/anex/:id", submit.update_anex);
  
    // Delete a entry with id
    router.delete("/:id", submit.delete);
    router.delete("/delete_list/:id", submit.delete_list);
  
    // Delete all entry
    router.delete("/", submit.deleteAll);

       // PDF GEN
   router.post("/gendoc/submit", submit.gendoc_submit);
  
    app.use('/api/submit', router);
  };
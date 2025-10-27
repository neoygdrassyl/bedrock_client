module.exports = app => {
    const ARCH = require("../controllers/archive.controller.js");
  
    var router = require("express").Router();

    router.get("/", ARCH.findAll);
    router.get("/get/fun/:id", ARCH.findByFun);
    router.get("/get/box/:id", ARCH.findByBox);
    router.get("/get/xlist/:public_id", ARCH.search_x);

    router.post("/", ARCH.create_archive);
    router.post("/x", ARCH.create_x);
    
    router.put("/:id", ARCH.update_archive);
    router.put("/x/:idFun&:idBox", ARCH.update_x);

    router.delete("/x/:idFun&:idBox&:folder", ARCH.delete);
    router.delete("/:idFun", ARCH.delete_box);
  
    app.use('/api/archive', router);
  };
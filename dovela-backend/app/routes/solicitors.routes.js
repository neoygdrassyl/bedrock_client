module.exports = app => {
    const solicitors = require("../controllers/solicitors.controller.js");
    const reason = require("../controllers/reason.controller.js")
    var router = require("express").Router();

    router.post("/create", solicitors.create);

    router.get("/getAll", solicitors.getAll);
    router.get("/getById/:id", solicitors.getById);
    router.get("/getVRs/:id",solicitors.getVRs);
    router.put("/update/:id", solicitors.update);
    
    router.post("/addReason", reason.create)


    app.use('/api/solicitors', router);

}
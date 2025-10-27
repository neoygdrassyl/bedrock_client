module.exports = app => {
    const NORM = require("../controllers/norm.controller.js");

    var router = require("express").Router();

    // NORM ROUTES
    router.get("/norm/", NORM.findAll_norm);
    router.get("/norm/:id", NORM.findById_norm);
    router.post("/norm/", NORM.create_norm);
    router.put("/norm/:id", NORM.update_norm);
    router.delete("/norm/:id", NORM.delete_norm);
    router.get("/norm/img/:url", NORM.get_norm_img);

    // PREDIO ROUTES
    router.get("/predio/all/:id", NORM.findAll_predio);
    router.get("/predio/one/:id", NORM.findById_predio);
    router.post("/predio/", NORM.create_predio);
    router.put("/predio/:id", NORM.update_predio);
    router.delete("/predio/:id", NORM.delete_predio);

    // NEIGHBOR ROUTES
    router.get("/neighbor/all/:id", NORM.findAll_neighbor);
    router.get("/neighbor/one/:id", NORM.findById_neighbor);
    router.post("/neighbor/", NORM.create_neighbor);
    router.put("/neighbor/:id", NORM.update_neighbor);
    router.delete("/neighbor/:id", NORM.delete_neighbor);

    // PERFIL ROUTES
    router.get("/prefil/all/:id", NORM.findAll_perfil);
    router.get("/prefil/one/:id", NORM.findById_perfil);
    router.post("/prefil/", NORM.create_perfil);
    router.put("/prefil/:id", NORM.update_perfil);
    router.delete("/prefil/:id", NORM.delete_perfil);

    // PERFIL ELEMENT ROUTES
    router.get("/element/all/:id", NORM.findAll_perfil_element);
    router.get("/element/one/:id", NORM.findById_perfil_element);
    router.post("/element/", NORM.create_perfil_element);
    router.put("/element/:id", NORM.update_perfil_element);
    router.delete("/element/:id", NORM.delete_perfil_element);

    // PDF GENERATION
    router.post("/pdf/norm", NORM.pdfgen_norm);

    app.use('/api/norms', router);
};
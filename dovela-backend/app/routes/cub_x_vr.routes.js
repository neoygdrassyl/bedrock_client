module.exports = app => {
    const cubXVrController = require('../controllers/cubXvr.controller.js');

    var router = require("express").Router();
    router.get('/getByCUB/:id', cubXVrController.getByCUB)
    router.get('/getByVR/:id', cubXVrController.getByVR)
    router.get('/getByFUN/:id', cubXVrController.getByFUN)
    router.get('/getByPQRS/:id', cubXVrController.getByPQRS)
    router.get('/getAllCubXvr', cubXVrController.getAllCubXVr);

    router.get('/getByProcess/:process', cubXVrController.getByProcess)   //where process = '' || '' || (just in case)

    router.post('/createCubXVr', cubXVrController.createCUB_VR)
    router.put('/updateCubVr/:id', cubXVrController.updateCUB_VR)

    app.use('/api/cubXvr', router);
};
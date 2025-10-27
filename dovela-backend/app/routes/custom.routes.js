module.exports = app => {
  const users = require("../controllers/users.controller.js");
  const appointments = require("../controllers/appointments.controller.js");
  const files = require("../controllers/file.controller.js");
  const seals = require("../controllers/seal.controller.js");
  const pqrs = require("../controllers/pqrs_main.controller.js");
  const fun = require("../controllers/fun.controller.js");

  var router = require("express").Router();

  // LOG INTO THE APP
  router.post("/login", users.appLogin);

  // SEARCH AVAIABLE DATE
  router.get("/searchdate/:date&:profesional_id", appointments.findAllPublished);

  // FILES REQUEST AND FILE DOWNLOADS
  router.get("/files", files.getListFiles);
  router.get("/files/publish/:type/:name", files.downloadPublish);
  router.get("/files/pqrs/:name", files.downloadPqrs);
  router.get("/files/pqrsa/:name", files.downloadPqrsAttach);
  router.get("/files/nomen/:year/:id/:name", files.downloadNomenAttach);
  router.get("/files/submit/:year/:id/:name", files.downloadSubmitAttach);
  router.get("/files/docs/:name", files.downloadPublic);
  // PROCESS
  router.get("/files/docs/process/:pathy/:pathn/:name", files.downloadProcess);

  // GENERATE SEALS
  router.post("/generate/seal", seals.generate);
  router.get("/seal/:name", seals.seal);

  // GENERATE PDFs
  router.get("/pdf/reply/:name", pqrs.generate_pdf_reply);
  router.get("/pdf/confirm/:name", files.donwloadFunConfirmationPDF);
  router.get("/pdf/confirminc/:name", files.donwloadFunIncompletePDF);
  router.get("/pdf/confirmact/:name", files.donwloadFunActPDF);
  router.get("/pdf/confirmact2/:name", files.donwloadFunActPDF_2);
  router.get("/pdf/nconfirm/:name", files.donwloadFunConfirmatioNeighbournPDF);
  router.get("/pdf/funform/:name", files.pdfFunForm);
  router.get("/pdf/planing/:name", files.donwloadPlaningnPDF);
  router.get("/pdf/sign/:name", files.donwloadSignPDF);
  router.get("/pdf/controlcheck/:name", files.donwloadControlCheckPDF);
  router.get("/pdf/controlcheck_2/:name", files.donwloadControlCheckPDF2);
  router.get("/pdf/stickerarvhive/:name", files.donwloadStickerArchivePDF);

  router.get("/pdf/nomenclaure/:name", files.donwloadNomenclaturePDF);

  router.get("/pdf/submit/:name", files.donwloadSubmitPDF);
  router.get("/pdf/funform2pg", files.funform2pg);

  router.get("/pdf/funflat", files.funflat);
  router.get("/pdf/funform2pgflat", files.funform2pgflat);
  router.get("/pdf/funflat2022", files.funflat2022);
  router.get("/pdf/funcheckflat", files.funcheckflat);
  router.get("/pdf/funcheckflat2022", files.funcheckflat2022);

  router.get("/pdf/recordlaw/:name", files.recordlaw);
  router.get("/pdf/recordeng/:name", files.recordeng);
  router.get("/pdf/recordarc/:name", files.recordarc);
  router.get("/pdf/recordph/:name", files.recordph);
  router.get("/pdf/recordphnot/:name", files.recordphnot);
  router.get("/pdf/recordrew/:name", files.recordrew);


  router.get("/pdf/recordlawextra/", files.recordlawextra);
  router.get("/pdf/recordengextra/", files.recordengextra);
  router.get("/pdf/recordarcextra/", files.recordarcextra);

  router.get("/pdf/recordlawextra2022/", files.recordlawextra2022);
  router.get("/pdf/recordengextra2022/", files.recordengextra2022);
  router.get("/pdf/recordarcextra2022/", files.recordarcextra2022);

  router.get("/pdf/expdoc1/:name", files.donwloadExpDoc1);
  router.get("/pdf/expdoc2/:name", files.donwloadExpDoc2);
  router.get("/pdf/expdoc3/:name", files.donwloadExpDoc3);
  router.get("/pdf/expdoc4/:name", files.donwloadExpDoc4);
  router.get("/pdf/expdoc5/:name", files.donwloadExpDoc5);
  router.get("/pdf/expdoc6/:name", files.donwloadExpDoc6);
  router.get("/pdf/expdoc7/:name", files.donwloadExpDoc7);
  router.get("/pdf/expdocres/:name", files.donwloadExpDocRes);
  router.get("/pdf/expdoceje/:name", files.donwloadExpDocEje);
  router.get("/pdf/expdocresabd/:name", files.donwloadExpDocResAbd);
  router.get("/pdf/expdocfinalnot/:name", files.donwloadExpDocFinalNot);

  router.get("/pdf/certificate/:name", files.donwloadCertificate);
  router.get("/pdf/certificate_data/:name", files.donwloadCertificateData);
  router.get("/pdf/cert/fun/:name", files.donwloadCertFun);

  router.get("/repository/list", users.getRepositoryList);

  // CHECK STATUS FOR PUBLIC FOR VARIOUS PROCESS
  router.get("/checkstatus/jur/:id", pqrs.check_statusJur);
  router.get("/checkstatus/nr/:id", pqrs.check_statusNr);
  router.get("/checkstatus/lc/:id", fun.check_statusNr);
  router.get("/checkstatus/in/:id", pqrs.check_statusIdNumber);
  router.get("/checkstatus/vr/:id", pqrs.check_statusIdVR);

  // CONSULTS FOR DICTIOARY
  router.get("/consult/consult_cubDictionary", fun.consult_cubDictionary);
  router.get("/consult/consult_cubDictionary/:id_related", fun.consult_cubDictionary);
  router.get("/consult/consult_vrDictionary", fun.consult_vrDictionary);
  router.get("/consult/consult_funDictionary", fun.consult_funDictionary);
  router.get("/consult/consult_Profesionals", fun.consult_Profesionals);
  router.get("/consult/consult_OcDictionary", fun.consult_OcDictionary);
  router.get("/consult/consult_OutDictionary", fun.consult_OutDictionary);
  router.get("/consult/getCubDictionaryFiltrate/:search/:num/:id_related?", fun.consult_getCubDictionaryFiltrate)
  router.get("/consult/getCubDictionaryFiltrate/:search/:num", fun.consult_getCubDictionaryFiltrate)

  // URBAN NORM

  router.get("/pdf/norm/:name", files.donwloadNorm);

  app.use('/api', router);
};
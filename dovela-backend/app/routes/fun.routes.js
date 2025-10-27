module.exports = app => {
  const FUN = require("../controllers/fun.controller.js");

  var router = require("express").Router();



  router.get("/", FUN.findAll);
  router.get("/get/idpublic/:id_public", FUN.findOneIdPublic);
  router.get("/get/fun1/:id_public", FUN.getFun1);
  router.get("/getall/c", FUN.findAll_c);
  router.get("/getall/fun", FUN.findAll_fun_Curated);
  router.get("/getall/fun6h/:id", FUN.findAll_fun_6_h);
  router.get("/getall/clocks", FUN.findAll_clocks);
  router.get("/getsearch/:field&:string", FUN.findSearch);
  router.get("/:id", FUN.findOne);
  router.get("/fun6/:id", FUN.findOneFun6);
  router.get("/getsearch/:id&:state", FUN.getsearch);
  router.get("/getlast/oa", FUN.getLastOA);
  router.get("/getlast/id", FUN.getLastIdPublic);
  router.get("/getlast/res", FUN.getLastIdPublicRes);
  router.get("/getclockdata/:id", FUN.getClockdata);

  // QUERIES 
  router.get("/loadsubmit/:date_start&:date_end", FUN.loadSubmit);
  router.get("/loadsubmit2/:date_start&:date_end", FUN.loadSubmit2);
  router.get("/loadasign/:worker_id&:record_type", FUN.loadAsign);
  router.get("/loadPQRSxFUN/:fun0PublicId", FUN.loadPQRSxFUN);

  router.get("/loadMacro/:date_start&:date_end", FUN.loadMacro);
  router.get("/loadMacroSingle/:date_start&:date_end&:id", FUN.loadMacroSingle);
  router.get("/loadMacroRange/:id1&:id2", FUN.loadMacroRange);
  router.get("/loadMacroAsigns/:id1&:id2", FUN.loadMacroAsings);
  router.get("/loadMacronegative/:date_start&:date_end", FUN.loadMacroNegative);
  router.get("/loadMacroClocksControl/:id", FUN.loadMacroClocksControl);
  router.get("/loadAllClocks/:id", FUN.loadAllClocks);
  router.get("/consult/consult_1", FUN.consult_1);
  router.get("/consult/consult_Profesional/:name", FUN.consult_Profesional);

  router.get("/reports/:date_start&:date_end", FUN.reportsQuery);
  router.get("/reports_2/:date_start&:date_end", FUN.reportsQuery_2);
  router.get("/reports_finance/:date_start&:date_end", FUN.reportsFinance);
  router.get("/reports_resume/:date_start&:date_end", FUN.reportsResume);
  router.get("/reports_public/:id_start&:id_end", FUN.reporstPublicQuery);

  router.get("/getall/incdocs", FUN.findIncompleteDocs);
  router.get("/vrxfun6/:fun_id&:vr_id", FUN.FindVrxFun6);

  // PDF GENERATION
  router.post("/gendoc/confirm", FUN.gendoc_confirm);
  router.post("/gendoc/confirminc", FUN.gendoc_confirminc);
  router.post("/gendoc/nconfirm", FUN.gendoc_nconfirm);
  router.post("/gendoc/npublish", FUN.gendoc_npublish);
  router.post("/gendoc/planing", FUN.gendoc_planing);
  router.post("/gendoc/sign", FUN.gendoc_sign);
  router.post("/gendoc/checkcontrol", FUN.gendoc_checkcontrol);
  router.post("/gendoc/checkcontrol_2", FUN.gendoc_checkcontrol_2);
  router.post("/gendoc/stickerarchive", FUN.gendoc_stickerarchive);
  router.post("/gendoc/abdicate", FUN.gendoc_abdicate);

  // Create a new entry
  router.post("/", FUN.create);
  router.post("/funversion", FUN.create_version);
  router.post("/fun1", FUN.create_fun1);
  router.post("/fun2", FUN.create_fun2);
  router.post("/fun3", FUN.create_fun3);
  router.post("/fun4", FUN.create_fun4);
  router.post("/fun51", FUN.create_fun51);
  router.post("/fun52", FUN.create_fun52);
  router.post("/fun53", FUN.create_fun53);
  router.post("/fun6", FUN.create_fun6);
  router.post("/fun6h", FUN.create_fun6_h);
  router.post("/func", FUN.create_func);
  router.post("/funr", FUN.create_funr);
  router.post("/law", FUN.create_law);
  router.post("/sign", FUN.create_sign);
  router.post("/createclock", FUN.createclock);
  router.post("/createarchive", FUN.create_archive);

  // Update a entry with id
  router.put("/:id", FUN.update);
  router.put("/funversionA/:id", FUN.update_version);
  router.put("/fun1A/:id", FUN.update_1);
  router.put("/fun2A/:id", FUN.update_2);
  router.put("/fun3A/:id", FUN.update_3);
  router.put("/fun51A/:id", FUN.update_51);
  router.put("/fun52A/:id", FUN.update_52);
  router.put("/fun53A/:id", FUN.update_53);
  router.put("/fun6A/:id", FUN.update_6);
  router.put("/fun6hA/:id", FUN.update_6_h);
  router.put("/funcA/:id", FUN.update_c);
  router.put("/funrA/:id", FUN.update_r);
  router.put("/perform_review_c/:id", FUN.perform_review_c);
  router.put("/signA/:id", FUN.update_sign);
  router.put("/updateclock/:id", FUN.updateclock);
  router.put("/updatelaw/:id", FUN.updatelaw);
  router.put("/updatearchive/:id", FUN.update_archive);

  // Delete a entry with id
  router.delete("/:id", FUN.delete);
  router.delete("/fun3d/:id", FUN.delete_3);
  router.delete("/fun4d/:id", FUN.delete_4);
  router.delete("/fun51d/:id", FUN.delete_51);
  router.delete("/fun52d/:id", FUN.delete_52);
  router.delete("/fun6d/:id", FUN.delete_6);
  router.delete("/fun6hd/:id", FUN.delete_6_h);
  router.delete("/clock/:id", FUN.delete_clock);
  router.delete("/", FUN.deleteAll);

  // EMAILS FOR NEGATIVE PROCESS 
  router.post("/process/email_6", FUN.email_6)


  app.use('/api/fun', router);
};
import http from "../../http-common";

const route = "fun"

class UserslDataService {
  getAll() {
    return http.get(`/${route}`);
  }
  getAll_c() {
    return http.get(`/${route}/getall/c`);
  }
  getAll_fun() {
    return http.get(`/${route}/getall/fun`);
  }
  getAll_fun_6_h(id) {
    return http.get(`/${route}/getall/fun6h/${id}`);
  }
  getAll_clocks() {
    return http.get(`/${route}/getall/clocks`);
  }
  getSearch(field, string) {
    return http.get(`/${route}/getsearch/${field}&${string}`);
  }
  getclock(id, state) {
    return http.get(`/${route}/getclock/${id}&${state}`);
  }
  getclockData(id) {
    return http.get(`/${route}/getclockdata/${id}`);
  }
  get(id) {
    return http.get(`/${route}/${id}`);
  }
  getFun6(id) {
    return http.get(`/${route}/fun6/${id}`);
  }
  get_fun1(id_public) {
    return http.get(`/${route}/get/fun1/${id_public}`);
  }
  get_fun_IdPublic(id_public) {
    return http.get(`/${route}/get/idpublic/${id_public}`);
  }
  loadMacro(date_start, date_end) {
    return http.get(`/${route}/loadMacro/${date_start}&${date_end}`);
  }
  loadMacroSingle(date_start, date_end, id) {
    return http.get(`/${route}/loadMacroSingle/${date_start}&${date_end}&${id}`);
  }
  loadMacroRange(id, id2) {
    return http.get(`/${route}/loadMacroRange/${id}&${id2}}`);
  }
  loadMacroAsigns(id, id2) {
    return http.get(`/${route}/loadMacroAsigns/${id}&${id2}}`);
  }
  loadMacronegative(date_start, date_end) {
    return http.get(`/${route}/loadMacronegative/${date_start}&${date_end}`);
  }
  loadMacroClocksControl(id) {
    return http.get(`/${route}/loadMacroClocksControl/${id}`);
  }
  loadAllClocks(id) {
    return http.get(`/${route}/loadAllClocks/${id}`);
  }
  loadSubmit(date_start, date_end) {
    return http.get(`/${route}/loadsubmit/${date_start}&${date_end}`);
  }
  loadSubmit2(date_start, date_end) {
    return http.get(`/${route}/loadsubmit2/${date_start}&${date_end}`);
  }
  loadasign(worker_id, type_record) {
    return http.get(`/${route}/loadasign/${worker_id}&${type_record}`);
  }
  loadPQRSxFUN(fun0PublicId) {
    return http.get(`/${route}/loadPQRSxFUN/${fun0PublicId}`);
  }
  getLastOA() {
    return http.get(`/${route}/getlast/oa`);
  }
  getLastIdPublic() {
    return http.get(`/${route}/getlast/id`);
  }
  getLastIdPublicRes() {
    return http.get(`/${route}/getlast/res`);
  }
  reportsData(date_start, date_end) {
    return http.get(`/${route}/reports/${date_start}&${date_end}`);
  }
  reportsPublicData(id_start, id_end) {
    return http.get(`/${route}/reports_public/${id_start}&${id_end}`);
  }
  consult_Profesional(name) {
    return http.get(`/${route}/consult/consult_Profesional/${name}`);
  }
  getAll_incDocs() {
    return http.get(`/${route}/getall/incdocs`);
  }


  create(data) {
    return http.post(`/${route}`, data);
  }
  gen_doc_confirm(data) {
    return http.post(`/${route}/gendoc/confirm`, data);
  }
  gen_doc_incomplete(data) {
    return http.post(`/${route}/gendoc/confirminc`, data);
  }
  gen_doc_nconfirm(data) {
    return http.post(`/${route}/gendoc/nconfirm`, data);
  }
  gen_doc_npublish(data) {
    return http.post(`/${route}/gendoc/npublish`, data);
  }
  gen_doc_planing(data) {
    return http.post(`/${route}/gendoc/planing`, data);
  }
  gen_doc_sign(data) {
    return http.post(`/${route}/gendoc/sign`, data);
  }
  gen_doc_checkcontrol(data) {
    return http.post(`/${route}/gendoc/checkcontrol`, data);
  }
  gen_doc_stickerarchive(data) {
    return http.post(`/${route}/gendoc/stickerarchive`, data);
  }
  gen_doc_abdicate(data) {
    return http.post(`/${route}/gendoc/abdicate`, data);
  }

  create_version(data) {
    return http.post(`/${route}/funversion`, data);
  }
  create_fun1(data) {
    return http.post(`/${route}/fun1`, data);
  }
  create_fun2(data) {
    return http.post(`/${route}/fun2`, data);
  }
  create_fun3(data) {
    return http.post(`/${route}/fun3`, data);
  }
  create_fun4(data) {
    return http.post(`/${route}/fun4`, data);
  }
  create_fun51(data) {
    return http.post(`/${route}/fun51`, data);
  }
  create_fun52(data) {
    return http.post(`/${route}/fun52`, data);
  }
  create_fun53(data) {
    return http.post(`/${route}/fun53`, data);
  }
  create_fun6(data) {
    return http.post(`/${route}/fun6`, data);
  }
  create_fun6_h(data) {
    return http.post(`/${route}/fun6h`, data);
  }
  create_func(data) {
    return http.post(`/${route}/func`, data);
  }
  create_funt(data) {
    return http.post(`/${route}/funt`, data);
  }
  create_funr(data) {
    return http.post(`/${route}/funr`, data);
  }
  create_law(data) {
    return http.post(`/${route}/law`, data);
  }
  create_bundle(data) {
    return http.post(`/${route}/bundle`, data);
  }
  create_sign(data) {
    return http.post(`/${route}/sign`, data);
  }
  create_clock(data) {
    return http.post(`/${route}/createclock`, data);
  }
  create_archive(data) {
    return http.post(`/${route}/createarchive`, data);
  }

  update_sign(id, data) {
    return http.put(`/${route}/signA/${id}`, data);
  }
  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }
  update_version(id, data) {
    return http.put(`/${route}/funversionA/${id}`, data);
  }
  update_1(id, data) {
    return http.put(`/${route}/fun1A/${id}`, data);
  }
  update_2(id, data) {
    return http.put(`/${route}/fun2A/${id}`, data);
  }
  update_3(id, data) {
    return http.put(`/${route}/fun3A/${id}`, data);
  }
  update_51(id, data) {
    return http.put(`/${route}/fun51A/${id}`, data);
  }
  update_52(id, data) {
    return http.put(`/${route}/fun52A/${id}`, data);
  }
  update_53(id, data) {
    return http.put(`/${route}/fun53A/${id}`, data);
  }
  update_6(id, data) {
    return http.put(`/${route}/fun6A/${id}`, data);
  }
  update_6_h(id, data) {
    return http.put(`/${route}/fun6hA/${id}`, data);
  }
  update_c(id, data) {
    return http.put(`/${route}/funcA/${id}`, data);
  }
  update_t(id, data) {
    return http.put(`/${route}/funtA/${id}`, data);
  }
  update_r(id, data) {
    return http.put(`/${route}/funrA/${id}`, data);
  }
  update_clock(id, data) {
    return http.put(`/${route}/updateclock/${id}`, data);
  }

  update_law(id, data) {
    return http.put(`/${route}/updatelaw/${id}`, data);
  }
  update_archive(id, data) {
    return http.put(`/${route}/updatearchive/${id}`, data);
  }


  perform_review_c(id, data) {
    return http.put(`/${route}/perform_review_c/${id}`, data);
  }
  perform_review_before_profesional(id, data) {
    return http.put(`/${route}/perform_review_before_profesional/${id}`, data);
  }

  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
  delete_3(id) {
    return http.delete(`/${route}/fun3d/${id}`);
  }
  delete_4(id) {
    return http.delete(`/${route}/fun4d/${id}`);
  }
  delete_51(id) {
    return http.delete(`/${route}/fun51d/${id}`);
  }
  delete_52(id) {
    return http.delete(`/${route}/fun52d/${id}`);
  }
  delete_6(id) {
    return http.delete(`/${route}/fun6d/${id}`);
  }
  delete_6_h(id) {
    return http.delete(`/${route}/fun6hd/${id}`);
  }
  delete_clock(id) {
    return http.delete(`/${route}/clock/${id}`);
  }

  deleteAll() {
    return http.delete(`/${route}`);
  }

  // EMAILS FOR NEGATIVE PROCESS 
  sendEmailNegative_6(data) {
    return http.post(`/${route}/process/email_6/`, data);
  }
}

export default new UserslDataService();
import http from "../../http-common";

const route = "pqrs_main"

class PqrsMainDataService {
  getAll() {
    return http.get(`/${route}`);
  }

  getAllWorker() {
    return http.get(`/${route}/info/workers`);
  }

  getAllPqrs() {
    return http.get(`/${route}/pqrs/all`);
  }

  getAllMacro(date_start, date_end) {
    return http.get(`/${route}/pqrs/macro/${date_start}&${date_end}`);
  }

  search(data) {
    return http.post(`/${route}/search`, data);
  }

  get(id) {
    return http.get(`/${route}/${id}`);
  }

  getlastid() {
    return http.get(`/${route}/pqrs/lastid`);
  }
  getlascub() {
    return http.get(`/${route}/pqrs/lastcub`);
  }
  gethistory(public_id){
    return http.get(`/${route}/history/${public_id}`)
  }
  loadSubmit(date_start, date_end) {
    return http.get(`/${route}/loadsubmit/${date_start}&${date_end}`);
  }


  create(data) {
    return http.post(`/${route}`, data);
  }
  create_public(data) {
    return http.post(`/${route}/create_public`, data);
  }
  createWorker(data) {
    return http.post(`/${route}/createWorker`, data);
  }

  create_solicitor(data) {
    return http.post(`/${route}/create_solicitor`, data);
  }
  create_contact(data) {
    return http.post(`/${route}/create_contact`, data);
  }
  create_attach(data) {
    return http.post(`/${route}/create_attach`, data);
  }
  create_fun(data) {
    return http.post(`/${route}/create_fun`, data);
  }
  login_access(data){
    return http.post(`/${route}/access/edit`,data);
  }


  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }

  updateWorker(id, data) {
    return http.put(`/${route}/process/worker/${id}`, data);
  }
  update_solicito(id, data) {
    return http.put(`/${route}/update_solicito/${id}`, data);
  }
  update_contact(id, data) {
    return http.put(`/${route}/update_contact/${id}`, data);
  }
  update_attach(id, data) {
    return http.put(`/${route}/update_attach/${id}`, data);
  }
  update_fun(id, data) {
    return http.put(`/${route}/update_fun/${id}`, data);
  }
  update_main(id, data) {
    return http.put(`/${route}/update_main/${id}`, data);
  }
  update_date_reply(id, data){
    return http.put(`/${route}/update_time/${id}`, data)
  }



  informalReply(data) {
    return http.post(`/${route}/process/informalreply/`, data);
  }

  addAttachsClose(data) {
    return http.post(`/${route}/process/addattachsclose/`, data);
  }

  formalReply(data) {
    return http.post(`/${route}/process/formalreply/`, data);
  }

  request_pdfReply(data) {
    return http.post(`/${route}/pdfgen/reply/`, data);
  }

  request_pdfConfirmation(data) {
    return http.post(`/${route}/pdfgen/confirmation/`, data);
  }

  close(data) {
    return http.post(`/${route}/process/close/`, data);
  }

  sendEmailReply(data) {
    return http.post(`/${route}/process/emailreply/`, data);
  }

  sendEmailConfirmation(data) {
    return http.post(`/${route}/process/emailconfiration/`, data);
  }

  sendEmailWorkerNotification(data) {
    return http.post(`/${route}/process/emailworkernotification/`, data);
  }

  sendEmailExtension(data) {
    return http.post(`/${route}/process/emailextension/`, data);
  }



  delete(id) {
    return http.delete(`/${route}/${id}`);
  }

  deleteAttach(id) {
    return http.delete(`/${route}/process/deleteAttach/${id}`);
  }

  deleteWorker(id) {
    return http.delete(`/${route}/process/deleteWorker/${id}`);
  }
  delete_solicitor(id) {
    return http.delete(`/${route}/delete_solicitor/${id}`);
  }
  delete_contact(id) {
    return http.delete(`/${route}/delete_contact/${id}`);
  }

  deleteAll() {
    return http.delete(`/${route}`);
  }

}

export default new PqrsMainDataService();
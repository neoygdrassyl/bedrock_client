import http from "../../http-common";

const route = "recordarc"

class RecordArcService {
  getAll() {
    return http.get(`/${route}`);
  }
  get(id) {
    return http.get(`/${route}/${id}`);
  }
  getRecord(id) {
    return http.get(`/${route}/findrecord/${id}`);
  }
  getSteps(id) {
    return http.get(`/${route}/getsteps/${id}`);
  }
  pdfgen(data) {
    return http.post(`/${route}/pdfgen`, data);
  }

  create(data) {
    return http.post(`/${route}`, data);
  }
  create_arc_31(data) {
    return http.post(`/${route}/create31`, data);
  }
  create_arc_33(data) {
    return http.post(`/${route}/create33`, data);
  }
  create_arc_33_area(data) {
    return http.post(`/${route}/create33area`, data);
  }
  create_arc_34(data) {
    return http.post(`/${route}/create34`, data);
  }
  create_arc_34_gen(data) {
    return http.post(`/${route}/create34gen`, data);
  }
  create_arc_34_k(data) {
    return http.post(`/${route}/create34k`, data);
  }
  create_arc_35(data) {
    return http.post(`/${route}/create35`, data);
  }
  create_arc_35_parking(data) {
    return http.post(`/${route}/create35parking`, data);
  }
  create_arc_35_location(data) {
    return http.post(`/${route}/create35location`, data);
  }
  create_arc_36(data) {
    return http.post(`/${route}/create36`, data);
  }
  create_arc_36_info(data) {
    return http.post(`/${route}/create36info`, data);
  }
  create_arc_36_house(data) {
    return http.post(`/${route}/create36house`, data);
  }
  create_arc_37(data) {
    return http.post(`/${route}/create37`, data);
  }
  create_arc_38(data) {
    return http.post(`/${route}/create38`, data);
  }
  create_arc_extra(data) {
    return http.post(`/${route}/createextra`, data);
  }
  new_record(data) {
    return http.post(`/${route}/newrecord`, data);
  }
  create_step(data) {
    return http.post(`/${route}/create_step`, data);
  }


  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }
  update_arc_31(id, data) {
    return http.put(`/${route}/update31/${id}`, data);
  }
  update_arc_33(id, data) {
    return http.put(`/${route}/update33/${id}`, data);
  }
  update_arc_33_area(id, data) {
    return http.put(`/${route}/update33area/${id}`, data);
  }
  update_arc_34(id, data) {
    return http.put(`/${route}/update34/${id}`, data);
  }
  update_arc_34_gen(id, data) {
    return http.put(`/${route}/update34gens/${id}`, data);
  }
  update_arc_34_k(id, data) {
    return http.put(`/${route}/update34k/${id}`, data);
  }
  update_arc_35(id, data) {
    return http.put(`/${route}/update35/${id}`, data);
  }
  update_arc_35_parking(id, data) {
    return http.put(`/${route}/update35parking/${id}`, data);
  }
  update_arc_35_location(id, data) {
    return http.put(`/${route}/update35location/${id}`, data);
  }
  update_arc_36(id, data) {
    return http.put(`/${route}/update36/${id}`, data);
  }
  update_arc_36_info(id, data) {
    return http.put(`/${route}/update36info/${id}`, data);
  }
  update_arc_37(id, data) {
    return http.put(`/${route}/update37/${id}`, data);
  }
  update_arc_36_house(id, data) {
    return http.put(`/${route}/update36house/${id}`, data);
  }
  update_arc_38(id, data) {
    return http.put(`/${route}/update38/${id}`, data);
  }
  update_arc_extra(id, data) {
    return http.put(`/${route}/updateextra/${id}`, data);
  }
  update_step(id, data) {
    return http.put(`/${route}/update_step/${id}`, data);
  }

  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
  delete_33_area(id, sort, recordEngId, type) {
    return http.delete(`/${route}/delete33area/${id}&${sort}&${recordEngId}&${type}`);
  }
  delete_33_area_byId(id) {
    return http.delete(`/${route}/delete33areabyId/${id}`);
  }
  delete_34_gen(id) {
    return http.delete(`/${route}/delete34gens/${id}`);
  }
  delete_34_k(id) {
    return http.delete(`/${route}/delete34k/${id}`);
  }
  delete_35_parking(id) {
    return http.delete(`/${route}/delete35parking/${id}`);
  }
  delete_35_location(id) {
    return http.delete(`/${route}/delete35location/${id}`);
  }
  delete_36_info(id) {
    return http.delete(`/${route}/delete36info/${id}`);
  }
  delete_36_house(id) {
    return http.delete(`/${route}/delete36house/${id}`);
  }
  delete_37(id) {
    return http.delete(`/${route}/delete37/${id}`);
  }

  create_xbp(data) {
    return http.post(`/${route}/create_xbp`, data);
  }
}

export default new RecordArcService();
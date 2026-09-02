import http from "../../http-common";
import { dedupeGet } from "./requestCache";

const route = "submit"

class Submit_Service {

  getAll(options = {}) {
    return http.get(options.summary ? `/${route}/summary` : `/${route}`);
  }
  /** Row count only — avoids downloading ~15MB just to read `.length`. */
  count() {
    return http.get(`/${route}/count`);
  }
  /**
   * One page of the ventanilla summary. The endpoint only switches to its
   * paginated envelope ({ data, total, page, size, totalPages }) when `page`
   * or `size` is present, so `getAll` above keeps returning the bare array.
   */
  getSummaryPage({ page = 1, size = 20, sort, order } = {}) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);
    return http.get(`/${route}/summary?${params.toString()}`);
  }
  get(id) {
    return http.get(`/${route}/${id}`);
  }
  getSearch(field, string) {
    return http.get(`/${route}/getsearch/${field}&${string}`);
  }
  getlastid() {
    return http.get(`/${route}/getid/lastid`);
  }
  verifyid(id) {
    return http.get(`/${route}/getid/verifyid/${id}`);
  }
  getIdRelated(id_related) {
    return dedupeGet(`${route}:getIdRelated:${id_related}`, () => http.get(`/${route}/getlist/${id_related}`));
  }

  create(data) {
    return http.post(`/${route}`, data);
  }
  create_list(data) {
    return http.post(`/${route}/create_list`, data);
  } 
  create_anex(data) {
    return http.post(`/${route}/anex/`, data);
  }

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }
  update_list(id, data) {
    return http.put(`/${route}/update_list/${id}`, data);
  }
  update_anex(id, data) {
    return http.put(`/${route}/anex/${id}`, data);
  }


  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
  delete_list(id) {
    return http.delete(`/${route}/delete_list/${id}`);
  }

  deleteAll() {
    return http.delete(`/${route}`);
  } 

  gen_doc_submit(data) {
    return http.post(`/${route}/gendoc/submit`, data);
  }

}

export default new Submit_Service();

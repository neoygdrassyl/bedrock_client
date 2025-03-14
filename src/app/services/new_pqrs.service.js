import http from "../../http-common";

const route = "new_pqrs"
class New_Pqrs_Service {

    create(data) {
        return http.post(`/${route}`, data);
    }
    getAll(){
        return http.get(`/${route}`,);
    }
    getById(id){
        return http.get(`/${route}/${id}`,);
    }
    update(id, data){
        return http.put(`/${route}/${id}`, data);
    }
    updateResponse(id, data){
        return http.put(`/${route}/response/${id}`, data);
    }
    getPending(user,response_field){
        return http.get(`/${route}/pqrs_pending/${user}/${response_field}`);
    }
}
export default new New_Pqrs_Service();
import http from "../../http-common";

const route = "new_pqrs"
class New_Pqrs_Service {

    create(data) {
        return http.post(`/${route}`, data);
    }
    getAll(){
        return http.get(`/${route}`,);
    }
}
export default new New_Pqrs_Service();
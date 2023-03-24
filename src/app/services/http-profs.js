import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_API_PROF_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});

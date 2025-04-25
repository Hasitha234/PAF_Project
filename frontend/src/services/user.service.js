import axios from "./axios-config";

const API_URL = "http://localhost:8080/api/test/";

class UserService {
  getPublicContent() {
    return axios.get(API_URL + "public");
  }
}

export default new UserService(); 
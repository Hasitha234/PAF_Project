import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api/posts/";

class WallService {
  getAllPosts() {
    return axios.get(API_URL, { headers: authHeader() });
  }

  getPostById(id) {
    return axios.get(API_URL + id, { headers: authHeader() });
  }

  createPost(formData) {
    return axios.post(API_URL, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data"
      }
    });
  }

  updatePost(id, data) {
    return axios.put(API_URL + id, data, { headers: authHeader() });
  }

  deletePost(id) {
    return axios.delete(API_URL + id, { headers: authHeader() });
  }

  likePost(id) {
    return axios.post(API_URL + id + "/like", {}, { headers: authHeader() });
  }

  unlikePost(id) {
    return axios.post(API_URL + id + "/unlike", {}, { headers: authHeader() });
  }

  addComment(postId, text) {
    return axios.post(
      API_URL + postId + "/comments",
      { text },
      { headers: authHeader() }
    );
  }

  getComments(postId) {
    return axios.get(API_URL + postId + "/comments", { headers: authHeader() });
  }
}

export default new WallService(); 
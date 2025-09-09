import axios from "axios";

const BASE_URL = "http://localhost:5092";

const api = axios.create({
  baseURL: BASE_URL,
});

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default api;

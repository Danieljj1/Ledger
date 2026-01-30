import axios from "axios";
import { getToken, logout } from "./authService";

// Use environment variable for API URL, fallback to localhost
const API_URL = "https://ledger-rppg.onrender.com/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor (handle expired tokens)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;

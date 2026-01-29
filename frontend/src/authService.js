import axios from "axios";

const API_URL = "http://localhost:8000/api/auth";

// Register a new user
export const register = async (email, username, password) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    username,
    password,
  });
  return response.data;
};

// Login user
export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await axios.post(`${API_URL}/token`, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // Save token to localStorage
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem("token");
};

// Check if user is logged in
export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Get axios instance with auth header
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

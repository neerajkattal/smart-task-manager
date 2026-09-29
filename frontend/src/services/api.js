import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://smart-task-backend-cerf.onrender.com/",
});

// Attach the saved token to every request, so callers don't repeat headers.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;

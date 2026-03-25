import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});


API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      console.log("Token expired → logging out");
      
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export default API;
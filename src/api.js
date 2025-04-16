import axios from "axios";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  headers: {
      "Content-Type": "application/json"
  }
});


api.interceptors.request.use(config =>{
  let token = localStorage.getItem("token");

  if(token){
    token = token.replace(/^Bearer\s*/, "");
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
}, error => {
  return Promise.reject(error);
});

export default api;

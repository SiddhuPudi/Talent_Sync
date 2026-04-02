import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:3000/api";
const api = axios.create({
  baseURL,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 429) {
      const config = error.config;
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 3) {
        config._retryCount += 1;
        const delay = Math.pow(2, config._retryCount) * 1000; // 2s, 4s, 8s backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return api.request(config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
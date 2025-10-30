import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Adjuntar automáticamente el token a todas las solicitudes
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default api;

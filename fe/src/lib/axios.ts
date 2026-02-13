import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  }
  return config;
});

export default api;
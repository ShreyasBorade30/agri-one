import axios from 'axios';

const newRequest = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

newRequest.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default newRequest;

import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedRequests = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequests.push({ resolve, reject });
        }).finally(() => {
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh tokens
        await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          {},
          { withCredentials: true }
        );
        // Retry all failed requests
        failedRequests.forEach((promise) => promise.resolve());
      } catch (refreshError) {
        // If refresh fails, clear user and redirect
        failedRequests.forEach((promise) => promise.reject(refreshError));
        window.location.href = "/login"; // Adjust based on your routing
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        failedRequests = [];
      }

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;

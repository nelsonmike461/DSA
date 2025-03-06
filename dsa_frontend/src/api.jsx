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

    // If error comes from the refresh endpoint, redirect to login.
    if (originalRequest.url.includes("/token/refresh/")) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // If 401 and not already retried, then try to refresh tokens.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Avoid refreshing if already on login or register pages.
      if (
        window.location.pathname === "/login" ||
        window.location.pathname === "/register"
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequests.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          {},
          { withCredentials: true }
        );
        failedRequests.forEach((promise) => promise.resolve());
        return api(originalRequest);
      } catch (refreshError) {
        failedRequests.forEach((promise) => promise.reject(refreshError));
        failedRequests = [];
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

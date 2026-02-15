/**
 * Axios API client with JWT interceptors.
 * All API requests go through this client.
 * @see TZ section 5.5
 */

import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

/** Configured axios instance for 1C24.PRO API */
export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/**
 * Request interceptor: attach JWT access token from localStorage.
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: handle 401 by attempting token refresh.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const isRetry = (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry;
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

    if (isUnauthorized && !isRetry && !isRefreshEndpoint) {
      (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
            `${API_BASE}/api/v1/auth/refresh`,
            { refresh_token: refreshToken },
          );
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth";
        }
      } else {
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  },
);

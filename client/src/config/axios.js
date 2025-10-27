import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests if needed
});

// Response interceptor for handling 401/403 errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle error responses
    if (error.response) {
      const status = error.response.status;

      // If token is invalid/expired (401) or forbidden (403)
      if (status === 401 || status === 403) {
        // Skip redirect if already on auth pages or if the request was to auth endpoints
        const currentPath = window.location.pathname;
        const requestUrl = error.config?.url || "";
        const isAuthPage = currentPath.startsWith("/app/auth");
        const isAuthEndpoint =
          requestUrl.includes("/auth/login") ||
          requestUrl.includes("/auth/register");

        // Only redirect if not on auth page and not an auth endpoint request
        if (!isAuthPage && !isAuthEndpoint) {
          window.location.href = "/app/auth/login";
        }
      }
    }

    // Return the error for component-level handling
    return Promise.reject(error);
  }
);

export const axiosInstanceWithoutApiPath = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
    : "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests if needed
});

// Add the same interceptor to axiosInstanceWithoutApiPath
axiosInstanceWithoutApiPath.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        // Skip redirect if already on auth pages or if the request was to auth endpoints
        const currentPath = window.location.pathname;
        const requestUrl = error.config?.url || "";
        const isAuthPage = currentPath.startsWith("/app/auth");
        const isAuthEndpoint =
          requestUrl.includes("/auth/login") ||
          requestUrl.includes("/auth/register");

        // Only redirect if not on auth page and not an auth endpoint request
        if (!isAuthPage && !isAuthEndpoint) {
          window.location.href = "/app/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
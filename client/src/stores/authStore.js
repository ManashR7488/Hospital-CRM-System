import { create } from "zustand";
import axiosInstance from "../config/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  login: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/login", formData);
      set({
        user: response.data.user,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      set({
        error: errorMessage,
        isAuthenticated: false,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/register", formData);
      set({
        user: response.data.user,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      set({
        error: errorMessage,
        isAuthenticated: false,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.get("/auth/profile");
      // console.log(response)
      set({
        user: response.data,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      // console.log(get())
    } catch (error) {
      const status = error.response?.status;
      // console.log(error)

      // Only clear auth state for 401/403 (authentication/authorization errors)
      if (status === 401 || status === 403) {
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
      } else {
        // For other errors (network, server errors), keep existing auth state
        set({
          isCheckingAuth: false,
        });
      }
    }
  },

  // Set user directly (used when updating profile from other stores)
  setUser: (user) => {
    set({
      user,
      isAuthenticated: true,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
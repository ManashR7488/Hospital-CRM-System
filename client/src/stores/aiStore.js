import { create } from "zustand";
import axiosInstance from "../config/axios";

const useAiStore = create((set, get) => ({
  messages: [
    { sender: "bot", text: "Hello! How can I assist you today?" },
    { sender: "user", text: "Hi! I need some help with my account." },
  ],
  isLoading: false,
  error: null,
  sendMessage: async (prompt) => {
    try {
      set((state) => ({
        isLoading: true,
        messages: [...state.messages, { sender: "user", text: prompt }],
      }));
      const response = await axiosInstance.post("/ai/chat", { prompt });
      set((state) => ({
        messages: [
          ...state.messages,
          { sender: "bot", text: response.data?.res },
        ],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  clearMessages: () => set({ message: [] }),
  makeCall: async (name, mobile_no) => {
    try {
      set({ isLoading: true });
      await axiosInstance.post("/ai/call", { name, mobile_no });
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useAiStore;

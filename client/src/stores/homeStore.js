import { create } from 'zustand';
import axiosInstance from '../config/axios';

const useHomeStore = create((set, get) => ({
  // State
  featuredDoctors: [],
  isLoading: false,
  error: null,

  // Fetch featured doctors for home page
  fetchFeaturedDoctors: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.department) params.append('department', filters.department);

      const queryString = params.toString();
      const url = `/admin/public/doctors${queryString ? `?${queryString}` : ''}`;

      const response = await axiosInstance.get(url);

      set({
        featuredDoctors: response.data.data || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        featuredDoctors: [],
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch featured doctors',
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Helper: Get doctors by specialization (client-side filter)
  getDoctorsBySpecialization: (specialization) => {
    const { featuredDoctors } = get();
    if (!specialization) return featuredDoctors;
    
    return featuredDoctors.filter((doctor) =>
      doctor.specialization?.includes(specialization)
    );
  },

  // Helper: Get doctors by department (client-side filter)
  getDoctorsByDepartment: (department) => {
    const { featuredDoctors } = get();
    if (!department) return featuredDoctors;
    
    return featuredDoctors.filter((doctor) => doctor.department === department);
  },

  // Reset store
  reset: () =>
    set({
      featuredDoctors: [],
      isLoading: false,
      error: null,
    }),
}));

export default useHomeStore;

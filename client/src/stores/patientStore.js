import {create} from 'zustand';
import axiosInstance from '../config/axios';

const usePatientStore = create((set, get) => ({
    // Dashboard data
    dashboardData: {
        patient: {},
        totalAppointments: 0,
        upcomingAppointments: 0,
        recentAppointments: [],
        nextAppointment: null,
    },

    // Appointments
    appointments: [],
    currentAppointment: null,
    appointmentFilters: {
        search: '',
        status: '',
        type: '',
        startDate: '',
        endDate: '',
        sortBy: 'appointmentDate',
        sortOrder: 'desc',
    },
    appointmentPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
    },

    // Doctors (for booking)
    doctors: [],
    currentDoctor: null,
    availableSlots: [],
    doctorFilters: {
        search: '',
        specialization: '',
        department: '',
        isAvailableForEmergency: null,
        sortBy: 'firstName',
        sortOrder: 'asc',
    },
    doctorPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
    },

    // Profile
    profileData: null,
    settings: {
        notifications: {
            email: true,
            sms: true,
            push: true,
            types: {
                appointmentReminders: true,
                healthUpdates: true,
                systemUpdates: true,
            },
        },
    },

    // Shared
    isLoadingDashboard: false,
    errorDashboard: null,
    isLoadingAppointments: false,
    errorAppointments: null,
    isLoadingDoctors: false,
    errorDoctors: null,
    isCheckingAvailability: false,
    errorAvailability: null,
    isLoadingProfile: false,
    errorProfile: null,

    // Fetch dashboard data
    fetchDashboard: async () => {
        set({isLoadingDashboard: true, errorDashboard: null});
        try {
            const response = await axiosInstance.get('/patient/dashboard');
            set({
                dashboardData: response.data.data,
                isLoadingDashboard: false,
                errorDashboard: null,
            });
        } catch (error) {
            set({
                errorDashboard: error.response?.data?.message || 'Failed to fetch dashboard data',
                isLoadingDashboard: false,
            });
        }
    },

    // Fetch appointments with filters
    fetchAppointments: async () => {
        set({isLoadingAppointments: true, errorAppointments: null});
        try {
            const {appointmentFilters, appointmentPagination} = get();
            const queryParams = new URLSearchParams({
                page: appointmentPagination.currentPage,
                limit: appointmentPagination.limit,
                sortBy: appointmentFilters.sortBy,
                sortOrder: appointmentFilters.sortOrder,
            });

            if (appointmentFilters.search) queryParams.append('search', appointmentFilters.search);
            if (appointmentFilters.status) queryParams.append('status', appointmentFilters.status);
            if (appointmentFilters.type) queryParams.append('type', appointmentFilters.type);
            if (appointmentFilters.startDate) queryParams.append('startDate', appointmentFilters.startDate);
            if (appointmentFilters.endDate) queryParams.append('endDate', appointmentFilters.endDate);

            const response = await axiosInstance.get(`/patient/appointments?${queryParams}`);
            const data = response.data.data;
            const paginationData = response.data.pagination;

            set({
                appointments: data,
                appointmentPagination: {
                    currentPage: paginationData.currentPage,
                    totalPages: paginationData.totalPages,
                    totalCount: paginationData.totalCount,
                    limit: paginationData.limit,
                },
                isLoadingAppointments: false,
                errorAppointments: null,
            });
        } catch (error) {
            set({
                errorAppointments: error.response?.data?.message || 'Failed to fetch appointments',
                isLoadingAppointments: false,
            });
        }
    },

    // Fetch single appointment by ID
    fetchAppointmentById: async (id) => {
        set({isLoadingAppointments: true, errorAppointments: null});
        try {
            const response = await axiosInstance.get(`/patient/appointments/${id}`);
            set({
                currentAppointment: response.data.data,
                isLoadingAppointments: false,
                errorAppointments: null,
            });
        } catch (error) {
            set({
                errorAppointments: error.response?.data?.message || 'Failed to fetch appointment details',
                isLoadingAppointments: false,
            });
        }
    },

    // Search doctors with filters
    searchDoctors: async () => {
        set({isLoadingDoctors: true, errorDoctors: null});
        try {
            const {doctorFilters, doctorPagination} = get();
            const queryParams = new URLSearchParams({
                page: doctorPagination.currentPage,
                limit: doctorPagination.limit,
                sortBy: doctorFilters.sortBy,
                sortOrder: doctorFilters.sortOrder,
            });

            if (doctorFilters.search) queryParams.append('search', doctorFilters.search);
            if (doctorFilters.specialization) queryParams.append('specialization', doctorFilters.specialization);
            if (doctorFilters.department) queryParams.append('department', doctorFilters.department);
            if (doctorFilters.isAvailableForEmergency !== null) {
                queryParams.append('isAvailableForEmergency', doctorFilters.isAvailableForEmergency);
            }

            const response = await axiosInstance.get(`/patient/doctors?${queryParams}`);
            const data = response.data.data;
            const paginationData = response.data.pagination;

            set({
                doctors: data,
                doctorPagination: {
                    currentPage: paginationData.currentPage,
                    totalPages: paginationData.totalPages,
                    totalCount: paginationData.totalCount,
                    limit: paginationData.limit,
                },
                isLoadingDoctors: false,
                errorDoctors: null,
            });
        } catch (error) {
            set({
                errorDoctors: error.response?.data?.message || 'Failed to search doctors',
                isLoadingDoctors: false,
            });
        }
    },

    // Fetch single doctor by ID
    fetchDoctorById: async (id) => {
        set({isLoadingDoctors: true, errorDoctors: null});
        try {
            const response = await axiosInstance.get(`/patient/doctors/${id}`);
            set({
                currentDoctor: response.data.data,
                isLoadingDoctors: false,
                errorDoctors: null,
            });
        } catch (error) {
            set({
                errorDoctors: error.response?.data?.message || 'Failed to fetch doctor details',
                isLoadingDoctors: false,
            });
        }
    },

    // Check doctor availability
    checkDoctorAvailability: async (doctorId, date, duration = 30) => {
        set({isCheckingAvailability: true, errorAvailability: null});
        try {
            const response = await axiosInstance.get(
                `/patient/doctors/availability/check?doctorId=${doctorId}&date=${date}&duration=${duration}`
            );
            const availabilityData = response.data;
            
            set({
                availableSlots: availabilityData.availableSlots || [],
                isCheckingAvailability: false,
                errorAvailability: null,
            });

            return availabilityData;
        } catch (error) {
            set({
                errorAvailability: error.response?.data?.message || 'Failed to check doctor availability',
                availableSlots: [],
                isCheckingAvailability: false,
            });
            return {available: false, availableSlots: []};
        }
    },

    // Book appointment
    bookAppointment: async (appointmentData) => {
        set({isLoadingAppointments: true, errorAppointments: null});
        try {
            const response = await axiosInstance.post('/patient/appointments', appointmentData);
            const newAppointment = response.data.data;

            set((state) => ({
                appointments: [newAppointment, ...state.appointments],
                dashboardData: {
                    ...state.dashboardData,
                    totalAppointments: state.dashboardData.totalAppointments + 1,
                    upcomingAppointments: state.dashboardData.upcomingAppointments + 1,
                },
                isLoadingAppointments: false,
                errorAppointments: null,
            }));

            return {success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to book appointment';
            set({
                errorAppointments: errorMessage,
                isLoadingAppointments: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Cancel appointment
    cancelAppointment: async (id, cancelReason) => {
        set({isLoadingAppointments: true, errorAppointments: null});
        try {
            const response = await axiosInstance.put(`/patient/appointments/${id}/cancel`, {
                cancelReason,
            });
            const updatedAppointment = response.data.data;

            set((state) => ({
                appointments: state.appointments.map((appt) =>
                    appt._id === id ? updatedAppointment : appt
                ),
                currentAppointment:
                    state.currentAppointment?._id === id
                        ? updatedAppointment
                        : state.currentAppointment,
                dashboardData: {
                    ...state.dashboardData,
                    upcomingAppointments: Math.max(0, state.dashboardData.upcomingAppointments - 1),
                },
                isLoadingAppointments: false,
                errorAppointments: null,
            }));

            return {success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to cancel appointment';
            set({
                errorAppointments: errorMessage,
                isLoadingAppointments: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Reschedule appointment
    rescheduleAppointment: async (id, newAppointmentDate, newStartTime, newEndTime) => {
        set({isLoadingAppointments: true, errorAppointments: null});
        try {
            const response = await axiosInstance.put(`/patient/appointments/${id}/reschedule`, {
                newAppointmentDate: newAppointmentDate,
                newStartTime: newStartTime,
                newEndTime: newEndTime,
            });
            const updatedAppointment = response.data.data;

            set((state) => ({
                appointments: state.appointments.map((appt) =>
                    appt._id === id ? updatedAppointment : appt
                ),
                currentAppointment:
                    state.currentAppointment?._id === id
                        ? updatedAppointment
                        : state.currentAppointment,
                isLoadingAppointments: false,
                errorAppointments: null,
            }));

            return {success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reschedule appointment';
            set({
                errorAppointments: errorMessage,
                isLoadingAppointments: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Set appointment filters
    setAppointmentFilters: (newFilters) => {
        set((state) => ({
            appointmentFilters: {
                ...state.appointmentFilters,
                ...newFilters,
            },
            appointmentPagination: {
                ...state.appointmentPagination,
                currentPage: 1,
            },
        }));
        get().fetchAppointments();
    },

    // Set appointment page
    setAppointmentPage: (page) => {
        set((state) => ({
            appointmentPagination: {
                ...state.appointmentPagination,
                currentPage: page,
            },
        }));
        get().fetchAppointments();
    },

    // Reset appointment filters
    resetAppointmentFilters: () => {
        set({
            appointmentFilters: {
                search: '',
                status: '',
                type: '',
                startDate: '',
                endDate: '',
                sortBy: 'appointmentDate',
                sortOrder: 'desc',
            },
            appointmentPagination: {
                ...get().appointmentPagination,
                currentPage: 1,
            },
        });
        get().fetchAppointments();
    },

    // Set doctor filters
    setDoctorFilters: (newFilters) => {
        set((state) => ({
            doctorFilters: {
                ...state.doctorFilters,
                ...newFilters,
            },
            doctorPagination: {
                ...state.doctorPagination,
                currentPage: 1,
            },
        }));
        get().searchDoctors();
    },

    // Set doctor page
    setDoctorPage: (page) => {
        set((state) => ({
            doctorPagination: {
                ...state.doctorPagination,
                currentPage: page,
            },
        }));
        get().searchDoctors();
    },

    // Clear errors (scoped)
    clearAppointmentsError: () => {
        set({errorAppointments: null});
    },

    clearDoctorsError: () => {
        set({errorDoctors: null});
    },

    clearDashboardError: () => {
        set({errorDashboard: null});
    },

    clearAvailabilityError: () => {
        set({errorAvailability: null});
    },

    // Profile Management Functions
    
    // Fetch patient profile
    fetchProfile: async () => {
        set({isLoadingProfile: true, errorProfile: null});
        try {
            const response = await axiosInstance.get('/patient/profile');
            set({
                profileData: response.data.data,
                isLoadingProfile: false,
                errorProfile: null,
            });
        } catch (error) {
            set({
                errorProfile: error.response?.data?.message || 'Failed to fetch profile',
                isLoadingProfile: false,
            });
        }
    },

    // Update patient profile
    updateProfile: async (profileData) => {
        set({isLoadingProfile: true, errorProfile: null});
        try {
            const response = await axiosInstance.put('/patient/profile', profileData);
            const updatedPatient = response.data.data;

            set({
                profileData: updatedPatient,
                isLoadingProfile: false,
                errorProfile: null,
            });

            // Update authStore to keep user data in sync
            try {
                const authStore = (await import('./authStore')).default;
                await authStore.getState().checkAuth();
            } catch (authError) {
                // Log but don't block - profile update succeeded
                console.warn('Auth refresh failed after profile update:', authError);
                // Optionally update auth store user fields directly from updatedPatient
                const authStore = (await import('./authStore')).default;
                authStore.setState((state) => ({
                    user: state.user ? { ...state.user, ...updatedPatient } : updatedPatient
                }));
            }

            return {success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            set({
                errorProfile: errorMessage,
                isLoadingProfile: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Add medical history entry
    addMedicalHistory: async (medicalHistoryEntry) => {
        set({isLoadingProfile: true, errorProfile: null});
        try {
            const response = await axiosInstance.post('/patient/profile/medical-history', medicalHistoryEntry);
            const updatedPatient = response.data.data;

            set((state) => ({
                profileData: updatedPatient,
                dashboardData: {
                    ...state.dashboardData,
                    patient: {
                        ...state.dashboardData.patient,
                        medicalHistory: updatedPatient.medicalHistory,
                    },
                },
                isLoadingProfile: false,
                errorProfile: null,
            }));

            return {success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add medical history';
            set({
                errorProfile: errorMessage,
                isLoadingProfile: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Add allergy entry
    addAllergy: async (allergyEntry) => {
        set({isLoadingProfile: true, errorProfile: null});
        try {
            const response = await axiosInstance.post('/patient/profile/allergies', allergyEntry);
            const updatedPatient = response.data.data;

            set((state) => ({
                profileData: updatedPatient,
                dashboardData: {
                    ...state.dashboardData,
                    patient: {
                        ...state.dashboardData.patient,
                        allergies: updatedPatient.allergies,
                    },
                },
                isLoadingProfile: false,
                errorProfile: null,
            }));

            return {success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add allergy';
            set({
                errorProfile: errorMessage,
                isLoadingProfile: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Add medication entry
    addMedication: async (medicationEntry) => {
        set({isLoadingProfile: true, errorProfile: null});
        try {
            const response = await axiosInstance.post('/patient/profile/medications', medicationEntry);
            const updatedPatient = response.data.data;

            set((state) => ({
                profileData: updatedPatient,
                dashboardData: {
                    ...state.dashboardData,
                    patient: {
                        ...state.dashboardData.patient,
                        currentMedications: updatedPatient.currentMedications,
                    },
                },
                isLoadingProfile: false,
                errorProfile: null,
            }));

            return {success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add medication';
            set({
                errorProfile: errorMessage,
                isLoadingProfile: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Change patient password
    changePatientPassword: async (passwordData) => {
        set({isLoadingProfile: true, errorProfile: null});
        try {
            await axiosInstance.put('/patient/settings/password', passwordData);
            set({
                isLoadingProfile: false,
                errorProfile: null,
            });
            return {success: true, message: 'Password changed successfully'};
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            set({
                errorProfile: errorMessage,
                isLoadingProfile: false,
            });
            return {success: false, error: errorMessage};
        }
    },

    // Update notification settings
    updateNotificationSettings: (notificationSettings) => {
        set((state) => ({
            settings: {
                ...state.settings,
                notifications: notificationSettings,
            },
        }));
        // TODO: Connect to backend API for persistent storage
        return {success: true};
    },

    // Get settings
    getSettings: () => {
        return get().settings;
    },

    // Clear profile error
    clearProfileError: () => {
        set({errorProfile: null});
    },
}));

export default usePatientStore;
    
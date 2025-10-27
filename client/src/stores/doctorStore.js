import {create} from 'zustand';
import axiosInstance from '../config/axios';
import useAuthStore from './authStore';

const useDoctorStore = create((set, get)=>({
    appointments: [],
    patients: [],
    currentPatient: null,
    currentAppointment: null,
    dashboardStats: {
        totalPatients: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        statusDistribution: [],
        recentAppointments: [],
    },
    filters: {
        search: '',
        bloodGroup: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
    },
    appointmentFilters: {
        search: '',
        status: '',
        type: '',
        department: '',
        startDate: '',
        endDate: '',
        patientId: '',
        sortBy: 'appointmentDate',
        sortOrder: 'asc',
    },
    appointmentPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
    },
    isLoadingAppointments: false,
    isLoadingPatients: false,
    isSavingSettings: false,
    error: null,
    settings: {
        notifications: {
            email: true,
            sms: true,
            push: true,
            types: {
                appointmentReminders: true,
                patientUpdates: true,
                systemUpdates: true,
            },
        },
    },

    // Fetch dashboard statistics
    fetchDashboardStats: async () => {
        set({ isLoadingAppointments: true, error: null });
        try {
            const response = await axiosInstance.get('/doctor/dashboard');
            const stats = response.data.data;
            set({ 
                dashboardStats: stats,
                isLoadingAppointments: false,
                error: null,
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch dashboard stats',
                isLoadingAppointments: false,
            });
        }
    },

    // Fetch all patients
    fetchPatients: async () => {
        set({ isLoadingPatients: true, error: null });
        try {
            const { filters, pagination } = get();
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            });

            if (filters.search) queryParams.append('search', filters.search);
            if (filters.bloodGroup) queryParams.append('bloodGroup', filters.bloodGroup);

            const response = await axiosInstance.get(`/doctor/patients?${queryParams}`);
            const data = response.data.data;
            const paginationData = response.data.pagination;

            set({ 
                patients: data,
                pagination: paginationData,
                isLoadingPatients: false,
                error: null,
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch patients',
                isLoadingPatients: false,
            });
        }
    },

    // Fetch single patient by ID
    fetchPatientById: async (id) => {
        set({ isLoadingPatients: true, error: null });
        try {
            const response = await axiosInstance.get(`/doctor/patients/${id}`);
            set({ 
                currentPatient: response.data.data,
                isLoadingPatients: false,
                error: null,
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch patient details',
                isLoadingPatients: false,
                currentPatient: null,
            });
        }
    },

    // Create new patient
    createPatient: async (patientData) => {
        set({ isLoadingPatients: true, error: null });
        try {
            const response = await axiosInstance.post('/doctor/patients', patientData);
            const newPatient = response.data.data;
            
            set(state => ({ 
                patients: [newPatient, ...state.patients],
                dashboardStats: {
                    ...state.dashboardStats,
                    totalPatients: state.dashboardStats.totalPatients + 1,
                },
                isLoadingPatients: false,
                error: null,
            }));
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create patient';
            set({ 
                error: errorMessage,
                isLoadingPatients: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Update patient
    updatePatient: async (id, patientData) => {
        set({ isLoadingPatients: true, error: null });
        try {
            const response = await axiosInstance.put(`/doctor/patients/${id}`, patientData);
            const updatedPatient = response.data.data;
            
            set(state => ({ 
                patients: state.patients.map(p => p._id === id ? updatedPatient : p),
                currentPatient: state.currentPatient?._id === id ? updatedPatient : state.currentPatient,
                isLoadingPatients: false,
                error: null,
            }));
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update patient';
            set({ 
                error: errorMessage,
                isLoadingPatients: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Delete patient
    deletePatient: async (id) => {
        set({ isLoadingPatients: true, error: null });
        try {
            await axiosInstance.delete(`/doctor/patients/${id}`);
            
            set(state => ({ 
                patients: state.patients.filter(p => p._id !== id),
                currentPatient: state.currentPatient?._id === id ? null : state.currentPatient,
                dashboardStats: {
                    ...state.dashboardStats,
                    totalPatients: Math.max(0, state.dashboardStats.totalPatients - 1),
                },
                isLoading: false,
                error: null,
            }));
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete patient';
            set({ 
                error: errorMessage,
                isLoading: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Fetch appointments with filters
    fetchAppointments: async () => {
        set({ isLoadingAppointments: true, error: null });
        try {
            const { appointmentFilters, appointmentPagination } = get();
            const queryParams = new URLSearchParams({
                page: appointmentPagination.currentPage,
                limit: appointmentPagination.limit,
                sortBy: appointmentFilters.sortBy,
                sortOrder: appointmentFilters.sortOrder,
            });

            if (appointmentFilters.search) queryParams.append('search', appointmentFilters.search);
            if (appointmentFilters.status) queryParams.append('status', appointmentFilters.status);
            if (appointmentFilters.type) queryParams.append('type', appointmentFilters.type);
            if (appointmentFilters.department) queryParams.append('department', appointmentFilters.department);
            if (appointmentFilters.startDate) queryParams.append('startDate', appointmentFilters.startDate);
            if (appointmentFilters.endDate) queryParams.append('endDate', appointmentFilters.endDate);
            if (appointmentFilters.patientId) queryParams.append('patientId', appointmentFilters.patientId);

            const response = await axiosInstance.get(`/doctor/appointments?${queryParams}`);
            const data = response.data.data;
            const paginationData = response.data.pagination;

            set({ 
                appointments: data,
                appointmentPagination: paginationData,
                isLoadingAppointments: false,
                error: null,
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch appointments',
                isLoadingAppointments: false,
            });
        }
    },

    // Fetch appointment by ID
    fetchAppointmentById: async (id) => {
        set({ isLoadingAppointments: true, error: null });
        try {
            const response = await axiosInstance.get(`/doctor/appointments/${id}`);
            set({ 
                currentAppointment: response.data.data,
                isLoadingAppointments: false,
                error: null,
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch appointment details',
                isLoadingAppointments: false,
                currentAppointment: null,
            });
        }
    },

    // Create new appointment
    createAppointment: async (appointmentData) => {
        set({ isLoadingAppointments: true, error: null });
        try {
            const response = await axiosInstance.post('/doctor/appointments', appointmentData);
            const newAppointment = response.data.data;
            const createdPatient = response.data.patient; // Backend may return newly created patient
            
            set(state => {
                const updates = {
                    appointments: [newAppointment, ...state.appointments],
                    dashboardStats: {
                        ...state.dashboardStats,
                        totalAppointments: state.dashboardStats.totalAppointments + 1,
                        ...(appointmentData.isRegistered === false && {
                            totalPatients: state.dashboardStats.totalPatients + 1,
                        }),
                    },
                    isLoadingAppointments: false,
                    error: null,
                };

                // If patient was created via appointment (not registered), add to patients list
                if (appointmentData.isRegistered === false && createdPatient) {
                    updates.patients = [createdPatient, ...state.patients];
                }

                return updates;
            });
            
            // Fallback: if new patient was created but API didn't return patient object, refresh patients list
            if (appointmentData.isRegistered === false && !createdPatient) {
                await get().fetchPatients();
            }
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create appointment';
            set({ 
                error: errorMessage,
                isLoadingAppointments: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Update appointment
    updateAppointment: async (id, appointmentData) => {
        set({ isLoadingAppointments: true, error: null });
        try {
            const response = await axiosInstance.put(`/doctor/appointments/${id}`, appointmentData);
            const updatedAppointment = response.data.data;
            
            set(state => {
                const oldAppointment = state.appointments.find(a => a._id === id);
                const updates = { 
                    appointments: state.appointments.map(a => a._id === id ? updatedAppointment : a),
                    currentAppointment: state.currentAppointment?._id === id ? updatedAppointment : state.currentAppointment,
                    isLoadingAppointments: false,
                    error: null,
                };

                // Update stats if status changed
                if (oldAppointment && appointmentData.status && oldAppointment.status !== appointmentData.status) {
                    const oldStatus = oldAppointment.status;
                    const newStatus = appointmentData.status;
                    const statsUpdates = { ...state.dashboardStats };

                    // Decrement old status count
                    if (oldStatus === 'completed') {
                        statsUpdates.completedAppointments = Math.max(0, statsUpdates.completedAppointments - 1);
                    } else if (oldStatus === 'cancelled') {
                        statsUpdates.cancelledAppointments = Math.max(0, statsUpdates.cancelledAppointments - 1);
                    }

                    // Increment new status count
                    if (newStatus === 'completed') {
                        statsUpdates.completedAppointments = statsUpdates.completedAppointments + 1;
                    } else if (newStatus === 'cancelled') {
                        statsUpdates.cancelledAppointments = statsUpdates.cancelledAppointments + 1;
                    }

                    updates.dashboardStats = statsUpdates;
                }

                return updates;
            });
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update appointment';
            set({ 
                error: errorMessage,
                isLoadingAppointments: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Delete appointment
    deleteAppointment: async (id) => {
        set({ isLoadingAppointments: true, error: null });
        try {
            await axiosInstance.delete(`/doctor/appointments/${id}`);
            
            set(state => ({ 
                appointments: state.appointments.filter(a => a._id !== id),
                currentAppointment: state.currentAppointment?._id === id ? null : state.currentAppointment,
                dashboardStats: {
                    ...state.dashboardStats,
                    totalAppointments: Math.max(0, state.dashboardStats.totalAppointments - 1),
                },
                isLoadingAppointments: false,
                error: null,
            }));
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete appointment';
            set({ 
                error: errorMessage,
                isLoadingAppointments: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Set appointment filters
    setAppointmentFilters: (newFilters) => {
        set(state => ({
            appointmentFilters: { ...state.appointmentFilters, ...newFilters },
            appointmentPagination: { ...state.appointmentPagination, currentPage: 1 },
        }));
        get().fetchAppointments();
    },

    // Set appointment page
    setAppointmentPage: (page) => {
        set(state => ({
            appointmentPagination: { ...state.appointmentPagination, currentPage: page },
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
                department: '',
                startDate: '',
                endDate: '',
                patientId: '',
                sortBy: 'appointmentDate',
                sortOrder: 'asc',
            },
            appointmentPagination: { ...get().appointmentPagination, currentPage: 1 },
        });
        get().fetchAppointments();
    },

    // Update appointment status (helper with validation)
    updateAppointmentStatus: async (id, newStatus) => {
        // Get current appointment to validate transition
        const { appointments, currentAppointment } = get();
        const appointment = currentAppointment?._id === id ? currentAppointment : appointments.find(a => a._id === id);
        
        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        const currentStatus = appointment.status;

        // Define allowed transitions
        const allowedTransitions = {
            scheduled: ['confirmed', 'cancelled'],
            confirmed: ['in_progress', 'cancelled'],
            in_progress: ['completed', 'no_show'],
            completed: ['scheduled'],
            cancelled: ['scheduled'],
            no_show: ['scheduled'],
        };

        // Validate transition
        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            return { 
                success: false, 
                error: `Cannot change status from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowed.join(', ')}` 
            };
        }

        return get().updateAppointment(id, { status: newStatus });
    },

    // Get appointments by date (helper)
    getAppointmentsByDate: (date) => {
        const { appointments } = get();
        // Convert input date to YYYY-MM-DD string format for comparison
        const targetDate = typeof date === 'string' ? date.slice(0, 10) : new Date(date).toISOString().slice(0, 10);
        
        return appointments.filter(apt => {
            // Compare raw appointmentDate string (YYYY-MM-DD format) to avoid timezone issues
            const aptDate = typeof apt.appointmentDate === 'string' 
                ? apt.appointmentDate.slice(0, 10) 
                : new Date(apt.appointmentDate).toISOString().slice(0, 10);
            return aptDate === targetDate;
        });
    },

    // Set filters
    setFilters: (newFilters) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, currentPage: 1 },
        }));
        get().fetchPatients();
    },

    // Set page
    setPage: (page) => {
        set(state => ({
            pagination: { ...state.pagination, currentPage: page },
        }));
        get().fetchPatients();
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Reset filters
    resetFilters: () => {
        set({
            filters: {
                search: '',
                bloodGroup: '',
                sortBy: 'createdAt',
                sortOrder: 'desc',
            },
            pagination: { ...get().pagination, currentPage: 1 },
        });
        get().fetchPatients();
    },

    // Update doctor profile (doctor-specific fields)
    updateDoctorProfile: async (profileData) => {
        set({ isSavingSettings: true, error: null });
        try {
            const response = await axiosInstance.put('/doctor/profile', profileData);
            const updatedDoctor = response.data.data;
            
            // Update authStore's user state directly from response
            useAuthStore.getState().setUser(updatedDoctor);
            
            set({ 
                error: null,
                isSavingSettings: false,
            });
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update doctor profile';
            set({ 
                error: errorMessage,
                isSavingSettings: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Update base profile (User fields)
    updateBaseProfile: async (profileData) => {
        set({ isSavingSettings: true, error: null });
        try {
            const response = await axiosInstance.put('/auth/profile', profileData);
            const updatedUser = response.data.data;
            
            // Update authStore's user state directly from response
            useAuthStore.getState().setUser(updatedUser);
            
            set({ 
                error: null,
                isSavingSettings: false,
            });
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            set({ 
                error: errorMessage,
                isSavingSettings: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Change password
    changeDoctorPassword: async (passwordData) => {
        set({ isSavingSettings: true, error: null });
        try {
            const response = await axiosInstance.put('/auth/password', passwordData);
            
            set({ 
                error: null,
                isSavingSettings: false,
            });
            
            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            set({ 
                error: errorMessage,
                isSavingSettings: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Update notification settings (local)
    updateNotificationSettings: (notificationSettings) => {
        set(state => ({
            settings: {
                ...state.settings,
                notifications: notificationSettings,
            },
        }));
        // TODO: Connect to backend API for persistent storage
        return { success: true };
    },

    // Get settings
    getSettings: () => {
        return get().settings;
    },

    // Validate availability
    validateAvailability: (availability) => {
        const errors = [];
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        const daysSeen = new Set();

        for (let i = 0; i < availability.length; i++) {
            const slot = availability[i];

            // Check valid day
            if (!validDays.includes(slot.day)) {
                errors.push(`Slot ${i + 1}: Invalid day "${slot.day}"`);
            }

            // Check duplicate days
            if (daysSeen.has(slot.day)) {
                errors.push(`Slot ${i + 1}: Duplicate availability for ${slot.day}`);
            }
            daysSeen.add(slot.day);

            // Check time format
            if (!timeRegex.test(slot.startTime)) {
                errors.push(`Slot ${i + 1}: Invalid start time format (use HH:MM)`);
            }
            if (!timeRegex.test(slot.endTime)) {
                errors.push(`Slot ${i + 1}: Invalid end time format (use HH:MM)`);
            }

            // Check endTime > startTime
            if (timeRegex.test(slot.startTime) && timeRegex.test(slot.endTime)) {
                const [startHour, startMin] = slot.startTime.split(':').map(Number);
                const [endHour, endMin] = slot.endTime.split(':').map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                
                if (endMinutes <= startMinutes) {
                    errors.push(`Slot ${i + 1}: End time must be after start time`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },
}));

export default useDoctorStore;

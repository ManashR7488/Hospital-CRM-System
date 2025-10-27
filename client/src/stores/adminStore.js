import {create} from 'zustand';
import axiosInstance from '../config/axios';
import useAuthStore from './authStore';

const useAdminStore = create((set, get)=>({
    users: [],
    doctors: [],
    currentUser: null,
    dashboardStats: { adminCount: 0, patientCount: 0, doctorCount: 0, totalUsers: 0 },
    filters: { search: '', role: '', isActive: null, sortBy: 'createdAt', sortOrder: 'desc' },
    pagination: { currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 },
    isLoading: false,
    error: null,
    settings: {
        notifications: {
            email: true,
            sms: true,
            push: true,
            types: {
                appointmentReminders: true,
                systemUpdates: true,
                newUserRegistrations: true,
                doctorRegistrations: true,
                criticalAlerts: true,
            },
        },
        system: {
            maintenanceMode: false,
            allowRegistration: true,
        },
    },

    // Fetch dashboard statistics
    fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
            // console.log("hii")
            const response = await axiosInstance.get('/admin/dashboard');
            const stats = response.data.data;
            const totalUsers = stats.patientCount + stats.doctorCount;
            set({ 
                dashboardStats: { ...stats, totalUsers }, 
                isLoading: false 
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch dashboard stats', 
                isLoading: false 
            });
        }
    },

    // Fetch all users (patients and doctors combined)
    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const [patientsRes, doctorsRes] = await Promise.all([
                axiosInstance.get('/admin/patients'),
                axiosInstance.get('/admin/doctors')
            ]);


            // console.log(patientsRes, doctorsRes)

            let allUsers = [
                ...patientsRes.data.data.map(p => ({ ...p, role: 'patient' })),
                ...doctorsRes.data.data.map(d => ({ ...d, role: 'doctor' }))
            ];

            // Apply filters
            const { search, role, isActive, sortBy, sortOrder } = get().filters;
            
            if (search) {
                const searchLower = search.toLowerCase();
                allUsers = allUsers.filter(user => {
                    // Base search fields for all users
                    const matchesBase = 
                        user.firstName?.toLowerCase().includes(searchLower) ||
                        user.lastName?.toLowerCase().includes(searchLower) ||
                        user.email?.toLowerCase().includes(searchLower) ||
                        user.phone?.includes(search);
                    
                    // Doctor-specific search fields
                    if (user.role === 'doctor') {
                        const matchesLicense = user.medicalLicenseNumber?.toLowerCase().includes(searchLower);
                        const matchesSpecialization = user.specialization?.some(spec => 
                            spec.toLowerCase().includes(searchLower)
                        );
                        return matchesBase || matchesLicense || matchesSpecialization;
                    }
                    
                    return matchesBase;
                });
            }

            if (role) {
                allUsers = allUsers.filter(user => user.role === role);
            }

            // Parse isActive filter explicitly to avoid string-to-boolean coercion issues
            if (isActive !== null && isActive !== undefined && isActive !== '') {
                let isActiveBoolean;
                if (isActive === 'true' || isActive === true) {
                    isActiveBoolean = true;
                } else if (isActive === 'false' || isActive === false) {
                    isActiveBoolean = false;
                }
                
                // Only filter if we have a valid boolean value
                if (typeof isActiveBoolean === 'boolean') {
                    allUsers = allUsers.filter(user => user.isActive === isActiveBoolean);
                }
            }

            // Apply sorting
            allUsers.sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];
                
                if (sortBy === 'createdAt') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }
                
                if (sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            // Apply pagination
            const { currentPage, limit } = get().pagination;
            const totalCount = allUsers.length;
            const totalPages = Math.ceil(totalCount / limit) || 1;
            
            // Clamp currentPage to valid range
            const clampedPage = Math.min(Math.max(1, currentPage), totalPages);
            const startIndex = (clampedPage - 1) * limit;
            const paginatedUsers = allUsers.slice(startIndex, startIndex + limit);

            set({ 
                users: paginatedUsers,
                pagination: { ...get().pagination, currentPage: clampedPage, totalCount, totalPages },
                isLoading: false 
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch users', 
                isLoading: false 
            });
        }
    },

    // Fetch single user by ID
    fetchUserById: async (id, role) => {
        set({ isLoading: true, error: null });
        try {
            let endpoint = role === 'patient' ? `/admin/patients/${id}` : `/admin/doctors/${id}`;
            let response;
            let actualRole = role;
            
            try {
                response = await axiosInstance.get(endpoint);
            } catch (err) {
                // If patient fetch fails with 404, try doctor
                if (err.response?.status === 404 && role === 'patient') {
                    endpoint = `/admin/doctors/${id}`;
                    response = await axiosInstance.get(endpoint);
                    actualRole = 'doctor';
                } else {
                    throw err;
                }
            }
            
            set({ 
                currentUser: { ...response.data.data, role: actualRole }, 
                isLoading: false 
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch user', 
                isLoading: false 
            });
        }
    },

    // fetch doctors
    fetchDoctors: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/admin/doctors');
            set({ doctors: response.data.data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch doctors', isLoading: false });
        }
    },

    // Create new user
    createUser: async (userData, role) => {
        set({ isLoading: true, error: null });
        try {
            // Guard against unsupported roles
            if (role !== 'patient' && role !== 'doctor') {
                const errorMsg = `Creating ${role} users is not supported. Only patient and doctor roles are allowed.`;
                set({ error: errorMsg, isLoading: false });
                return { success: false, error: errorMsg };
            }
            
            const endpoint = role === 'patient' ? '/admin/patients' : '/admin/doctors';
            const response = await axiosInstance.post(endpoint, userData);
            const newUser = response.data.data;

            // Update dashboard stats
            const stats = get().dashboardStats;
            if (role === 'patient') {
                stats.patientCount++;
            } else {
                stats.doctorCount++;
            }
            stats.totalUsers = stats.patientCount + stats.doctorCount;
            set({ dashboardStats: stats, isLoading: false });
            
            // Refetch users to apply current filters and pagination
            get().fetchUsers();

            return { success: true };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to create user', 
                isLoading: false 
            });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Update user
    updateUser: async (id, userData, role) => {
        set({ isLoading: true, error: null });
        try {
            const endpoint = role === 'patient' ? `/admin/patients/${id}` : `/admin/doctors/${id}`;
            const response = await axiosInstance.put(endpoint, userData);
            const updatedUser = response.data.data;

            // Update users array
            set(state => ({
                users: state.users.map(u => u._id === id ? { ...updatedUser, role } : u),
                currentUser: state.currentUser?._id === id ? { ...updatedUser, role } : state.currentUser,
                isLoading: false
            }));

            return { success: true };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to update user', 
                isLoading: false 
            });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Delete user
    deleteUser: async (id, role) => {
        set({ isLoading: true, error: null });
        try {
            const endpoint = role === 'patient' ? `/admin/patients/${id}` : `/admin/doctors/${id}`;
            await axiosInstance.delete(endpoint);

            // Update users array
            set(state => ({
                users: state.users.filter(u => u._id !== id),
                currentUser: state.currentUser?._id === id ? null : state.currentUser,
                isLoading: false
            }));

            // Update dashboard stats
            const stats = get().dashboardStats;
            if (role === 'patient') {
                stats.patientCount--;
            } else {
                stats.doctorCount--;
            }
            stats.totalUsers = stats.patientCount + stats.doctorCount;
            set({ dashboardStats: stats });

            return { success: true };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to delete user', 
                isLoading: false 
            });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Set filters
    setFilters: (newFilters) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, currentPage: 1 }
        }));
        get().fetchUsers();
    },

    // Set page
    setPage: (page) => {
        set(state => ({
            pagination: { ...state.pagination, currentPage: page }
        }));
        get().fetchUsers();
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Reset filters
    resetFilters: () => {
        set({
            filters: { search: '', role: '', isActive: null, sortBy: 'createdAt', sortOrder: 'desc' },
            pagination: { currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 }
        });
        get().fetchUsers();
    },

    // Update admin profile
    updateAdminProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.put('/auth/profile', profileData);
            
            // Refresh auth state from server to keep state canonical
            await useAuthStore.getState().checkAuth();
            
            set({ error: null, isLoading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Change admin password
    changeAdminPassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put('/auth/password', passwordData);
            set({ error: null, isLoading: false });
            return { success: true, message: response.data.message || 'Password changed successfully' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Update notification settings
    updateNotificationSettings: (notificationSettings) => {
        set(state => ({
            settings: {
                ...state.settings,
                notifications: notificationSettings
            }
        }));
        return { success: true };
    },

    // Update system settings
    updateSystemSettings: (systemSettings) => {
        // Placeholder: In production, this should call backend API
        set(state => ({
            settings: {
                ...state.settings,
                system: systemSettings
            }
        }));
        return { success: true };
    },

    // Get settings
    getSettings: () => {
        return get().settings;
    },
}));

export default useAdminStore;


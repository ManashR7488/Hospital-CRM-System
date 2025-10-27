import React, { useEffect } from "react";
import Home from "./pages/Home/Home";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageDoctors from "./pages/Admin/ManageDoctors";
import AdminSettings from "./pages/Admin/AdminSettings";
import ManagePatients from "./pages/Doctor/ManagePatients";
import ManageAppointments from "./pages/Doctor/ManageAppointments";
import DoctorSettings from "./pages/Doctor/DoctorSettings";
import UserDashboard from "./pages/Users/UserDashboard";
import UserAppointments from "./pages/Users/UserAppointments";
import UserProfile from "./pages/Users/UserProfile";
import UserSettings from "./pages/Users/UserSettings";
import NotFound from "./pages/NotFound/NotFound";
import Layout from "./pages/Layout/Layout";
import ManageUsersDetail from "./pages/Admin/ManageUsersDetail";
import ManageDoctorsDetail from "./pages/Admin/ManageDoctorsDetail";
import ManageAppointmentsDetail from "./pages/Doctor/ManageAppointmentsDetail";
import ManagePatientsDetail from "./pages/Doctor/ManagePatientsDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./stores/authStore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import { getDashboardPathByRole } from "./utils/auth";
import AiOverlay from "./components/AI/AiOverlay";

// Component to redirect authenticated users to their dashboard
const AuthRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  return <Navigate to="/app/auth/login" replace />;
};

const App = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* <ToastContainer limit={3} pauseOnFocusLoss={false} /> */}
      {/* {isShowChatBot && <AiCard />} */}
      <AiOverlay />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth */}

        <Route path="/app" element={<Layout />}>
          {/* Protected Routes */}
          
          {/* Redirect /app to role-based dashboard */}
          <Route index element={<AuthRedirect />} />

          {/* Auth routes */}

          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />


          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="user/:id" element={<ManageUsersDetail />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="doctor/:id" element={<ManageDoctorsDetail />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Doctor Routes */}
          <Route
            path="doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="patient/:id" element={<ManagePatientsDetail />} />
            <Route path="appointments" element={<ManageAppointments />} />
            <Route
              path="appointment/:id"
              element={<ManageAppointmentsDetail />}
            />
            <Route path="settings" element={<DoctorSettings />} />
          </Route>

          {/* User Routes */}
          <Route
            path="user"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="appointments" element={<UserAppointments />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;

import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { getDashboardPathByRole } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

  // Show loading spinner while checking authentication
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

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/app/auth/login" replace />;
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard based on their role
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  // User is authenticated and has the correct role
  return children;
};

export default ProtectedRoute;

/**
 * Get the dashboard path for a given user role
 * @param {string} role - The user's role ('admin', 'doctor', 'patient')
 * @returns {string} - The dashboard path for the role
 */
export const getDashboardPathByRole = (role) => {
  if (role === "admin") {
    return "/app/admin";
  } else if (role === "doctor") {
    return "/app/doctor";
  } else if (role === "patient") {
    return "/app/user";
  }
  // Default fallback
  return "/app/auth/login";
};

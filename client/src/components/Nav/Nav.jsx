import React, { useState } from "react";
import useAuthStore from "../../stores/authStore";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiHome, FiSettings, FiUsers, FiUser, FiCalendar } from "react-icons/fi";
import { FaUserMd, FaUserInjured, FaCalendarAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { APP_NAME } from "../../config/branding";

const Nav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    const role = user.role;

    if (role === "admin") {
      return [
        { name: "Dashboard", path: "/app/admin", icon: <MdDashboard size={20} /> },
        { name: "Manage Users", path: "/app/admin/users", icon: <FiUsers size={20} /> },
        { name: "Manage Doctors", path: "/app/admin/doctors", icon: <FaUserMd size={20} /> },
        { name: "Settings", path: "/app/admin/settings", icon: <FiSettings size={20} /> },
      ];
    }

    if (role === "doctor") {
      return [
        { name: "Dashboard", path: "/app/doctor", icon: <MdDashboard size={20} /> },
        { name: "Appointments", path: "/app/doctor/appointments", icon: <FaCalendarAlt size={20} /> },
        { name: "Patients", path: "/app/doctor/patients", icon: <FaUserInjured size={20} /> },
        { name: "Settings", path: "/app/doctor/settings", icon: <FiSettings size={20} /> },
      ];
    }

    if (role === "patient") {
      return [
        { name: "Dashboard", path: "/app/user", icon: <FiHome size={18} /> },
        { name: "Appointments", path: "/app/user/appointments", icon: <FiCalendar size={18} /> },
        { name: "Profile", path: "/app/user/profile", icon: <FiUser size={18} /> },
        { name: "Settings", path: "/app/user/settings", icon: <FiSettings size={18} /> },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div
      className={`h-screen relative z-[100] flex flex-col bg-white shadow-lg transition-width duration-300 ${
        collapsed ? "w-16" : "w-52"
      }`}
    >
      {/* Brand & Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        {!collapsed && (
          <Link
            to="/app"
            className="text-xl font-extrabold tracking-wide flex justify-center items-center gap-1"
          >
            <h1>{APP_NAME}</h1>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 cursor-pointer hover:bg-opacity-20 rounded-full transition-transform"
          style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0)" }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4">
        {navLinks.map(({ name, path, icon }) => (
          <NavLink key={path} to={path} title={collapsed ? name : undefined}>
            {({ isActive }) => (
              <div
                className={`flex items-center justify-start gap-4 px-4 py-1 mx-2 my-1 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-100 to-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`p-2 rounded-md transition-colors ${
                    isActive ? "bg-white shadow" : "bg-transparent"
                  }`}
                >
                  {icon}
                </div>
                {!collapsed && (
                  <span className="flex-1 text-nowrap text-xs">{name}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {/* <div className="p-4 mt-auto">
        <button
          className="w-full flex items-center justify-center gap-3 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-lg transition"
          title="Logout"
          onClick={logout}
        >
          <FiLogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="mt-4 text-xs text-gray-400 text-center">v1.0.0</div>
        )}
      </div> */}
    </div>
  );
};

export default Nav;

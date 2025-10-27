import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAdminStore from "../../stores/adminStore";
import {
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";
import { FaUserMd, FaUserInjured } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const { dashboardStats, isLoading, error, fetchDashboardStats } = useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Mock data for user growth chart
  const userGrowthData = [
    { month: "Jan", patients: 120, doctors: 15 },
    { month: "Feb", patients: 145, doctors: 18 },
    { month: "Mar", patients: 168, doctors: 20 },
    { month: "Apr", patients: 195, doctors: 22 },
    { month: "May", patients: 220, doctors: 25 },
    { month: "Jun", patients: 245, doctors: 28 },
  ];

  // User distribution data
  const userDistributionData = [
    { name: "Patients", value: dashboardStats.patientCount, color: "#3B82F6" },
    { name: "Doctors", value: dashboardStats.doctorCount, color: "#10B981" },
    { name: "Admins", value: dashboardStats.adminCount, color: "#F59E0B" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse mb-4"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => fetchDashboardStats()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your healthcare system</p>
        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
          <FiCalendar size={14} />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <Link
          to="/app/admin/users"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <FiUsers className="text-blue-600" size={32} />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <FiTrendingUp size={14} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
        </Link>

        {/* Total Doctors Card */}
        <Link
          to="/app/admin/doctors"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <FaUserMd className="text-green-600" size={32} />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Doctors</p>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.doctorCount}</p>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <FiTrendingUp size={14} className="mr-1" />
              <span>+5% from last month</span>
            </div>
          </div>
        </Link>

        {/* Total Patients Card */}
        <Link
          to="/app/admin/users"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-full p-4">
              <FaUserInjured className="text-purple-600" size={32} />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Patients</p>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.patientCount}</p>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <FiTrendingUp size={14} className="mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>
        </Link>

        {/* Total Admins Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-full p-4">
              <FiUserCheck className="text-orange-600" size={32} />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Administrators</p>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.adminCount}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>No change</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={2} name="Patients" />
              <Line type="monotone" dataKey="doctors" stroke="#10B981" strokeWidth={2} name="Doctors" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/app/admin/users?action=create"
            className="flex items-center justify-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
          >
            <FiUsers className="text-blue-600 mr-2" size={20} />
            <span className="font-medium text-blue-900">Add New User</span>
          </Link>
          <Link
            to="/app/admin/doctors?action=create"
            className="flex items-center justify-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-colors"
          >
            <FaUserMd className="text-green-600 mr-2" size={20} />
            <span className="font-medium text-green-900">Add New Doctor</span>
          </Link>
          <Link
            to="/app/admin/users"
            className="flex items-center justify-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors"
          >
            <FiActivity className="text-purple-600 mr-2" size={20} />
            <span className="font-medium text-purple-900">View All Users</span>
          </Link>
          <Link
            to="/app/admin/settings"
            className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <FiActivity className="text-gray-600 mr-2" size={20} />
            <span className="font-medium text-gray-900">System Settings</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-500 text-center py-8">Activity tracking coming soon</p>
      </div>
    </div>
  );
};

export default AdminDashboard;

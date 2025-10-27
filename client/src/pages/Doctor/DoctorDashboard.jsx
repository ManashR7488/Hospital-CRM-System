import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDoctorStore from '../../stores/doctorStore';
import {
  FiUsers,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { FaUserInjured, FaStethoscope, FaCalendarCheck } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DoctorDashboard = () => {
  const { dashboardStats, isLoading, error, fetchDashboardStats } = useDoctorStore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3B82F6',
      confirmed: '#10B981',
      completed: '#14B8A6',
      cancelled: '#EF4444',
      no_show: '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  // Transform status distribution data for pie chart
  const statusDistributionData = dashboardStats.statusDistribution?.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('_', ' '),
    value: item.count,
    color: getStatusColor(item._id),
  })) || [];

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-teal-100 text-teal-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || badges.scheduled;
  };

  // Get initial for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

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
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto flex gap-2">
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
        <h1 className="text-3xl font-bold text-blue-900">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your patients and appointments</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <FiCalendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Patients Card */}
        <Link
          to="/app/doctor/patients"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <FaUserInjured className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardStats.totalPatients || 0}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" />
                <span>View all patients</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Today's Appointments Card */}
        <Link
          to="/app/doctor/appointments?filter=today"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FiCalendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.todayAppointments || 0}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                <span>Scheduled for today</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Upcoming Appointments Card */}
        <Link
          to="/app/doctor/appointments?filter=upcoming"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaCalendarCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-green-600">{dashboardStats.upcomingAppointments || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
            </div>
          </div>
        </Link>

        {/* Completed Appointments Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-orange-600">{dashboardStats.completedAppointments || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardStats.totalAppointments > 0
                  ? `${Math.round((dashboardStats.completedAppointments / dashboardStats.totalAppointments) * 100)}% completion rate`
                  : 'No data'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Appointment Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Appointment Status Distribution</h2>
          {statusDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No appointment data available</p>
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-900">Recent Appointments</h2>
            <Link
              to="/app/doctor/appointments"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {dashboardStats.recentAppointments && dashboardStats.recentAppointments.length > 0 ? (
              dashboardStats.recentAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitial(appointment.patient?.firstName || 'P')}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/app/doctor/patient/${appointment.patient?._id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentDate)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <p>No recent appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{dashboardStats.cancelledAppointments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FiActivity className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-700">{dashboardStats.totalAppointments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaStethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Per Day</p>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardStats.totalAppointments > 0
                  ? Math.round(dashboardStats.totalAppointments / 30)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/app/doctor/patients?action=create"
            className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all"
          >
            <FaUserInjured className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-700">Add New Patient</span>
          </Link>

          <Link
            to="/app/doctor/patients"
            className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all"
          >
            <FiUsers className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-700">View All Patients</span>
          </Link>

          <Link
            to="/app/doctor/appointments"
            className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all"
          >
            <FiCalendar className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-700">Manage Appointments</span>
          </Link>

          <Link
            to="/app/doctor/settings"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <FiActivity className="w-6 h-6 text-gray-600" />
            <span className="font-medium text-gray-700">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
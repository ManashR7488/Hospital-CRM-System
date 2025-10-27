import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import usePatientStore from '../../stores/patientStore';
import useAuthStore from '../../stores/authStore';
import {
    FiCalendar,
    FiActivity,
    FiClock,
    FiPlus,
    FiUser,
    FiSettings,
} from 'react-icons/fi';
import {
    FaUserInjured,
    FaCalendarCheck,
    FaHeartbeat,
    FaNotesMedical,
    FaAllergies,
    FaPrescriptionBottleAlt,
    FaUserMd,
} from 'react-icons/fa';
import {AiOutlineLoading3Quarters} from 'react-icons/ai';

const UserDashboard = () => {
    const navigate = useNavigate();
    const {user} = useAuthStore();
    const {dashboardData, isLoadingDashboard, errorDashboard, fetchDashboard} = usePatientStore();

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const formatTimeRange = (startTime, endTime) => {
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            scheduled: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-green-100 text-green-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-teal-100 text-teal-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-gray-100 text-gray-800',
        };
        const statusLabels = {
            in_progress: 'In Progress',
            no_show: 'No Show',
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[status] || 'bg-gray-100 text-gray-800'
                }`}
            >
                {statusLabels[status] || status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // Loading state
    if (isLoadingDashboard) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                        >
                            <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                            <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (errorDashboard) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center">
                        <svg
                            className="w-6 h-6 text-red-600 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-900">
                                Error Loading Dashboard
                            </h3>
                            <p className="text-red-700 mt-1">{errorDashboard}</p>
                        </div>
                        <button
                            onClick={fetchDashboard}
                            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900">
                    Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600 mt-1">Your health dashboard</p>
                <p className="text-sm text-gray-500 flex items-center mt-2">
                    <FiCalendar className="mr-1" size={14} />
                    Last updated: {new Date().toLocaleString()}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Appointments */}
                <Link
                    to="/app/user/appointments"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">
                                Total Appointments
                            </p>
                            <p className="text-3xl font-bold text-blue-900 mt-2">
                                {dashboardData.totalAppointments}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">All time</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-full">
                            <FiCalendar className="text-blue-600" size={32} />
                        </div>
                    </div>
                </Link>

                {/* Upcoming Appointments */}
                <Link
                    to="/app/user/appointments?filter=upcoming"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">
                                Upcoming Appointments
                            </p>
                            <p className="text-3xl font-bold text-green-900 mt-2">
                                {dashboardData.upcomingAppointments}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-full">
                            <FaCalendarCheck className="text-green-600" size={32} />
                        </div>
                    </div>
                </Link>

                {/* Medical History Count */}
                <Link
                    to="/app/user/profile"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">
                                Medical Conditions
                            </p>
                            <p className="text-3xl font-bold text-purple-900 mt-2">
                                {dashboardData.patient?.medicalHistory?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Tracked conditions</p>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-full">
                            <FaNotesMedical className="text-purple-600" size={32} />
                        </div>
                    </div>
                </Link>

                {/* Active Medications */}
                <Link
                    to="/app/user/profile"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">
                                Active Medications
                            </p>
                            <p className="text-3xl font-bold text-orange-900 mt-2">
                                {dashboardData.patient?.currentMedications?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Current prescriptions
                            </p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-full">
                            <FaPrescriptionBottleAlt
                                className="text-orange-600"
                                size={32}
                            />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Appointments */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Next Appointment Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <FaCalendarCheck className="mr-2 text-green-600" size={24} />
                            Next Appointment
                        </h2>

                        {dashboardData.nextAppointment ? (
                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1">
                                        <p className="text-2xl font-bold text-blue-900">
                                            {formatDate(
                                                dashboardData.nextAppointment.appointmentDate
                                            )}
                                        </p>
                                        <p className="text-lg text-blue-700 flex items-center mt-1">
                                            <FiClock className="mr-1" size={18} />
                                            {formatTimeRange(
                                                dashboardData.nextAppointment.startTime,
                                                dashboardData.nextAppointment.endTime
                                            )}
                                        </p>

                                        <div className="flex items-center mt-4">
                                            <div className="bg-green-600 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg mr-3">
                                                {getInitial(
                                                    dashboardData.nextAppointment.doctor
                                                        ?.firstName
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Dr.{' '}
                                                    {
                                                        dashboardData.nextAppointment.doctor
                                                            ?.firstName
                                                    }{' '}
                                                    {
                                                        dashboardData.nextAppointment.doctor
                                                            ?.lastName
                                                    }
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    {dashboardData.nextAppointment.doctor
                                                        ?.specialization?.[0] && (
                                                        <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs rounded-full">
                                                            {dashboardData.nextAppointment.doctor.specialization[0]
                                                                .replace('_', ' ')
                                                                .replace(/\b\w/g, (l) =>
                                                                    l.toUpperCase()
                                                                )}
                                                        </span>
                                                    )}
                                                    {dashboardData.nextAppointment.department && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {dashboardData.nextAppointment.department
                                                                .replace('_', ' ')
                                                                .replace(/\b\w/g, (l) =>
                                                                    l.toUpperCase()
                                                                )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {dashboardData.nextAppointment.type && (
                                            <div className="mt-3">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                    {dashboardData.nextAppointment.type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        dashboardData.nextAppointment.type.slice(
                                                            1
                                                        )}
                                                </span>
                                            </div>
                                        )}

                                        {dashboardData.nextAppointment.reason && (
                                            <p className="text-gray-700 mt-3">
                                                <span className="font-medium">Reason:</span>{' '}
                                                {dashboardData.nextAppointment.reason}
                                            </p>
                                        )}

                                        <div className="mt-3">
                                            {getStatusBadge(
                                                dashboardData.nextAppointment.status
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-4">
                                        <Link
                                            to={`/app/user/appointments/${dashboardData.nextAppointment._id}`}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                                        >
                                            View Details
                                        </Link>
                                        <button 
                                            onClick={() => navigate('/app/user/appointments', { state: { cancelAppointmentId: dashboardData.nextAppointment._id } })}
                                            className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FiCalendar className="mx-auto text-gray-400" size={48} />
                                <p className="text-gray-600 mt-4">No upcoming appointments</p>
                                <Link
                                    to="/app/user/appointments?action=book"
                                    className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Book Appointment
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Appointments Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <FiCalendar className="mr-2 text-blue-600" size={24} />
                                Recent Appointments
                            </h2>
                            <Link
                                to="/app/user/appointments"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </Link>
                        </div>

                        {dashboardData.recentAppointments?.length > 0 ? (
                            <div className="space-y-3 max-h-[280px] overflow-y-auto">
                                {dashboardData.recentAppointments.map((appointment) => (
                                    <div
                                        key={appointment._id}
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center flex-1">
                                            <div className="bg-green-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold mr-3">
                                                {getInitial(appointment.doctor?.firstName)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    Dr. {appointment.doctor?.firstName}{' '}
                                                    {appointment.doctor?.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(appointment.appointmentDate)} •{' '}
                                                    {formatTime(appointment.startTime)}
                                                </p>
                                            </div>
                                        </div>
                                        <div>{getStatusBadge(appointment.status)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-center py-8">
                                No recent appointments
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column - Health Summary & Quick Actions */}
                <div className="space-y-6">
                    {/* Health Summary Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <FaHeartbeat className="mr-2 text-red-600" size={24} />
                            Health Summary
                        </h2>

                        <div className="space-y-4">
                            {/* Blood Group */}
                            {dashboardData.patient?.bloodGroup && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaHeartbeat className="text-red-600 mr-2" size={18} />
                                        <span className="text-gray-700">Blood Group</span>
                                    </div>
                                    <span className="px-3 py-1 bg-red-100 text-red-800 font-semibold rounded-full">
                                        {dashboardData.patient.bloodGroup}
                                    </span>
                                </div>
                            )}

                            {/* Height & Weight */}
                            {(dashboardData.patient?.height ||
                                dashboardData.patient?.weight) && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FiActivity className="text-blue-600 mr-2" size={18} />
                                        <span className="text-gray-700">Vitals</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">
                                        {dashboardData.patient.height || '--'} cm /{' '}
                                        {dashboardData.patient.weight || '--'} kg
                                    </span>
                                </div>
                            )}

                            {/* Allergies */}
                            <Link
                                to="/app/user/profile"
                                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                                <div className="flex items-center">
                                    <FaAllergies className="text-orange-600 mr-2" size={18} />
                                    <span className="text-gray-700">Allergies</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-medium">
                                        {dashboardData.patient?.allergies?.length || 0}
                                    </span>
                                    {dashboardData.patient?.allergies?.length > 0 && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                            !
                                        </span>
                                    )}
                                </div>
                            </Link>

                            {/* Medical Conditions */}
                            <Link
                                to="/app/user/profile"
                                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                                <div className="flex items-center">
                                    <FaNotesMedical
                                        className="text-purple-600 mr-2"
                                        size={18}
                                    />
                                    <span className="text-gray-700">Medical Conditions</span>
                                </div>
                                <span className="text-gray-900 font-medium">
                                    {dashboardData.patient?.medicalHistory?.length || 0}
                                </span>
                            </Link>

                            {/* Current Medications */}
                            <Link
                                to="/app/user/profile"
                                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                                <div className="flex items-center">
                                    <FaPrescriptionBottleAlt
                                        className="text-green-600 mr-2"
                                        size={18}
                                    />
                                    <span className="text-gray-700">Current Medications</span>
                                </div>
                                <span className="text-gray-900 font-medium">
                                    {dashboardData.patient?.currentMedications?.length || 0}
                                </span>
                            </Link>
                        </div>

                        <Link
                            to="/app/user/profile"
                            className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Update Health Info →
                        </Link>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Quick Actions
                        </h2>

                        <div className="space-y-3">
                            <Link
                                to="/app/user/appointments?action=book"
                                className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <FiPlus className="mr-2" size={20} />
                                Book Appointment
                            </Link>

                            <Link
                                to="/app/user/appointments"
                                className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                <FiCalendar className="mr-2" size={20} />
                                View All Appointments
                            </Link>

                            <Link
                                to="/app/user/profile"
                                className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                <FiUser className="mr-2" size={20} />
                                Update Profile
                            </Link>

                            <Link
                                to="/app/user/settings"
                                className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                <FiSettings className="mr-2" size={20} />
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
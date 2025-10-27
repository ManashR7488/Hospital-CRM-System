import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useDoctorStore from '../../stores/doctorStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FiArrowLeft,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiCheckCircle,
  FiActivity,
  FiAlertCircle,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import { FaUserInjured, FaCalendarCheck, FaStethoscope, FaHospital, FaHeartbeat } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ManageAppointmentsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentAppointment,
    isLoading,
    error,
    fetchAppointmentById,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus,
  } = useDoctorStore();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Fetch appointment on mount
  useEffect(() => {
    if (id) {
      fetchAppointmentById(id);
    }
  }, [id]);

  // Initialize edited data when entering edit mode
  useEffect(() => {
    if (isEditing && currentAppointment) {
      setEditedData({ ...currentAppointment });
    }
  }, [isEditing, currentAppointment]);

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: <FiClock className="inline mr-1" />, text: 'Scheduled' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="inline mr-1" />, text: 'Confirmed' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: <FiActivity className="inline mr-1" />, text: 'In Progress' },
      completed: { color: 'bg-teal-100 text-teal-800', icon: <FiCheckCircle className="inline mr-1" />, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <FiX className="inline mr-1" />, text: 'Cancelled' },
      no_show: { color: 'bg-gray-100 text-gray-800', icon: <FiAlertCircle className="inline mr-1" />, text: 'No Show' },
    };
    const badge = badges[status] || badges.scheduled;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      consultation: 'bg-blue-100 text-blue-800',
      follow_up: 'bg-green-100 text-green-800',
      emergency: 'bg-red-100 text-red-800',
      surgery: 'bg-orange-100 text-orange-800',
      checkup: 'bg-teal-100 text-teal-800',
    };
    const text = type?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {text}
      </span>
    );
  };

  const getDepartmentBadge = (department) => {
    if (!department) return null;
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        {department}
      </span>
    );
  };

  const getNextAllowedStatuses = (currentStatus) => {
    const transitions = {
      scheduled: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'no_show'],
      completed: ['scheduled'],
      cancelled: ['scheduled'],
      no_show: ['scheduled'],
    };
    return transitions[currentStatus] || [];
  };

  // Validation
  const validateAppointmentEditForm = () => {
    const errors = {};

    if (!editedData.appointmentDate) {
      errors.appointmentDate = 'Appointment date is required';
    }

    if (!editedData.startTime) {
      errors.startTime = 'Start time is required';
    }

    if (!editedData.endTime) {
      errors.endTime = 'End time is required';
    } else if (editedData.startTime && editedData.endTime <= editedData.startTime) {
      errors.endTime = 'End time must be after start time';
    }

    if (!editedData.type) {
      errors.type = 'Appointment type is required';
    }

    if (editedData.duration && editedData.duration <= 0) {
      errors.duration = 'Duration must be positive';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleSaveChanges = async () => {
    if (!validateAppointmentEditForm()) {
      return;
    }

    const result = await updateAppointment(id, editedData);

    if (result.success) {
      setIsEditing(false);
      setFormErrors({});
      fetchAppointmentById(id);
    }
  };

  const handleCancelEdit = () => {
    setEditedData(null);
    setFormErrors({});
    setIsEditing(false);
  };

  const handleDeleteAppointment = async () => {
    const result = await deleteAppointment(id);

    if (result.success) {
      navigate('/app/doctor/appointments');
    }
  };

  const handleStatusChange = async () => {
    const updateData = { status: newStatus };
    if (newStatus === 'cancelled' && cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    const result = await updateAppointmentStatus(id, newStatus);

    if (result.success) {
      setIsStatusChangeDialogOpen(false);
      setNewStatus('');
      setCancelReason('');
      fetchAppointmentById(id);
    }
  };

  const openStatusChangeDialog = (status) => {
    setNewStatus(status);
    setIsStatusChangeDialogOpen(true);
  };

  // Loading state
  if (isLoading && !currentAppointment) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentAppointment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => navigate('/app/doctor/appointments')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiArrowLeft className="inline mr-2" />
                Back to Appointments
              </button>
              <button
                onClick={() => fetchAppointmentById(id)}
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

  // Appointment not found
  if (!currentAppointment) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
              <p className="text-sm text-yellow-700">Appointment not found or not assigned to you</p>
            </div>
            <button
              onClick={() => navigate('/app/doctor/appointments')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <FiArrowLeft className="inline mr-2" />
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const appointment = isEditing ? editedData : currentAppointment;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/doctor/appointments')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <FiArrowLeft />
          Back to Appointments
        </button>

        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              <Link to="/app/doctor" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/app/doctor/appointments" className="hover:text-blue-600">Manage Appointments</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Appointment Details</span>
            </nav>
            <h1 className="text-3xl font-bold text-blue-900">
              Appointment with {appointment.patient?.firstName} {appointment.patient?.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {appointment.appointmentId || 'No ID'}
              </span>
              {getStatusBadge(appointment.status)}
              {getTypeBadge(appointment.type)}
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiEdit />
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <FiX />
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiSave />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Appointment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Details Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaCalendarCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <p className="text-gray-600">{appointment.appointmentId || 'No ID'}</p>
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FiCalendar />
                Date & Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Appointment Date</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().slice(0, 10) : ''}
                      onChange={(e) => setEditedData({ ...editedData, appointmentDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded ${formErrors.appointmentDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={appointment.startTime || ''}
                        onChange={(e) => setEditedData({ ...editedData, startTime: e.target.value })}
                        className={`flex-1 px-3 py-2 border rounded ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <input
                        type="time"
                        value={appointment.endTime || ''}
                        onChange={(e) => setEditedData({ ...editedData, endTime: e.target.value })}
                        className={`flex-1 px-3 py-2 border rounded ${formErrors.endTime ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900">{formatTimeRange(appointment.startTime, appointment.endTime)}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={appointment.duration || ''}
                      onChange={(e) => setEditedData({ ...editedData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{appointment.duration} minutes</p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Appointment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  {isEditing ? (
                    <select
                      value={appointment.type || ''}
                      onChange={(e) => setEditedData({ ...editedData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="emergency">Emergency</option>
                      <option value="surgery">Surgery</option>
                      <option value="checkup">Checkup</option>
                    </select>
                  ) : (
                    getTypeBadge(appointment.type)
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={appointment.department || ''}
                      onChange={(e) => setEditedData({ ...editedData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  ) : (
                    getDepartmentBadge(appointment.department) || <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>

              {(appointment.reason || isEditing) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  {isEditing ? (
                    <textarea
                      value={appointment.reason || ''}
                      onChange={(e) => setEditedData({ ...editedData, reason: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      rows="3"
                    />
                  ) : (
                    <p className="text-gray-900">{appointment.reason}</p>
                  )}
                </div>
              )}

              {(appointment.notes || isEditing) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  {isEditing ? (
                    <textarea
                      value={appointment.notes || ''}
                      onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      rows="3"
                    />
                  ) : (
                    <p className="text-gray-900">{appointment.notes}</p>
                  )}
                </div>
              )}
            </div>

            {/* Audit Information */}
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Audit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="text-gray-900">{formatDate(appointment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="text-gray-900">{formatDate(appointment.updatedAt)}</p>
                </div>
                {appointment.status === 'cancelled' && appointment.cancelReason && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Cancellation Reason</p>
                    <p className="text-red-700">{appointment.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FaUserInjured className="text-purple-600" />
              Patient Information
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {appointment.patient?.firstName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {appointment.patient?.firstName} {appointment.patient?.lastName}
                </h4>
                <p className="text-gray-600">{appointment.patient?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FiMail className="text-gray-400" />
                <span>{appointment.patient?.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-gray-400" />
                <span>{appointment.patient?.phone || '-'}</span>
              </div>
              {appointment.patient?.bloodGroup && (
                <div className="flex items-center gap-2">
                  <FaHeartbeat className="text-red-400" />
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {appointment.patient.bloodGroup}
                  </span>
                </div>
              )}
            </div>
            <Link
              to={`/app/doctor/patient/${appointment.patient?._id}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              View Full Profile →
            </Link>
          </div>

          {/* Status Timeline */}
          {!isEditing && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Status Timeline</h3>
              <div className="space-y-4">
                {/* Status progression visual */}
                <div className="flex items-center justify-between">
                  {['scheduled', 'confirmed', 'in_progress', 'completed'].map((status, index) => (
                    <div key={status} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        appointment.status === status ? 'bg-blue-600 text-white' :
                        ['scheduled', 'confirmed', 'in_progress', 'completed'].indexOf(appointment.status) > index ? 'bg-green-600 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {['scheduled', 'confirmed', 'in_progress', 'completed'].indexOf(appointment.status) > index ? (
                          <FiCheckCircle />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      {index < 3 && (
                        <div className={`flex-1 h-1 ${
                          ['scheduled', 'confirmed', 'in_progress', 'completed'].indexOf(appointment.status) > index ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Scheduled</span>
                  <span>Confirmed</span>
                  <span>In Progress</span>
                  <span>Completed</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2">
                {getNextAllowedStatuses(appointment.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => openStatusChangeDialog(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      status === 'confirmed' ? 'bg-green-600 hover:bg-green-700 text-white' :
                      status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                      status === 'completed' ? 'bg-teal-600 hover:bg-teal-700 text-white' :
                      status === 'cancelled' ? 'bg-red-600 hover:bg-red-700 text-white' :
                      status === 'no_show' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
                      'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {status === 'in_progress' ? 'Start Appointment' :
                     status === 'no_show' ? 'Mark as No Show' :
                     status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                disabled={isEditing}
              >
                <FiEdit />
                Edit Appointment
              </button>
              <Link
                to={`/app/doctor/patient/${appointment.patient?._id}`}
                className="w-full px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiUser />
                View Patient
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isStatusChangeDialogOpen}
        onClose={() => {
          setIsStatusChangeDialogOpen(false);
          setNewStatus('');
          setCancelReason('');
        }}
        onConfirm={handleStatusChange}
        title="Update Appointment Status"
        message={
          <div>
            <p className="mb-4">
              {newStatus === 'confirmed' && `Confirm this appointment with ${appointment.patient?.firstName} ${appointment.patient?.lastName}?`}
              {newStatus === 'in_progress' && `Start this appointment? The patient will be notified.`}
              {newStatus === 'completed' && `Mark this appointment as completed?`}
              {newStatus === 'cancelled' && `Cancel this appointment? Please provide a reason.`}
              {newStatus === 'no_show' && `Mark patient as no-show for this appointment?`}
              {newStatus === 'scheduled' && `Reopen this appointment?`}
            </p>
            {(newStatus === 'cancelled' || newStatus === 'no_show') && (
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="3"
              />
            )}
          </div>
        }
        variant={newStatus === 'cancelled' || newStatus === 'no_show' ? 'danger' : 'info'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAppointment}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone and will remove the appointment from both doctor and patient records."
        variant="danger"
      />
    </div>
  );
};

export default ManageAppointmentsDetail;
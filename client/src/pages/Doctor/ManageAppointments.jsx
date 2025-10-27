import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useDoctorStore from '../../stores/doctorStore';
import SearchBar from '../../components/SearchBar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, startOfDay, endOfDay, addDays } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import {
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiList,
  FiClock,
  FiUser,
  FiFilter,
  FiX,
  FiCheckCircle,
  FiActivity,
  FiAlertCircle,
} from 'react-icons/fi';
import { FaUserInjured, FaCalendarCheck, FaStethoscope, FaHeartbeat } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// Setup calendar localizer
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

const ManageAppointments = () => {
  const navigate = useNavigate();

  // Extract from doctorStore
  const {
    appointments,
    patients,
    isLoadingAppointments,
    isLoadingPatients,
    error,
    appointmentFilters,
    appointmentPagination,
    fetchAppointments,
    fetchPatients,
    createAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    setAppointmentFilters,
    setAppointmentPage,
    resetAppointmentFilters,
    clearError,
  } = useDoctorStore();

  // Local state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isQuickStatusModalOpen, setIsQuickStatusModalOpen] = useState(false);
  const [quickStatusAppointment, setQuickStatusAppointment] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    isRegistered: true,
    patientId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    username: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    duration: 30,
    type: 'consultation',
    reason: '',
    notes: '',
    department: '',
    status: 'scheduled',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatusFilter, setLocalStatusFilter] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  // Helper Functions
  const getStatusBadge = (status) => {
    const configs = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiClock className="mr-1" /> },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle className="mr-1" /> },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiActivity className="mr-1" /> },
      completed: { bg: 'bg-teal-100', text: 'text-teal-800', icon: <FiCheckCircle className="mr-1" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <FiX className="mr-1" /> },
      no_show: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FiAlertCircle className="mr-1" /> },
    };
    const config = configs[status] || configs.scheduled;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status?.replace('_', ' ').charAt(0).toUpperCase() + status?.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const configs = {
      consultation: { bg: 'bg-blue-100', text: 'text-blue-800' },
      follow_up: { bg: 'bg-green-100', text: 'text-green-800' },
      emergency: { bg: 'bg-red-100', text: 'text-red-800' },
      surgery: { bg: 'bg-orange-100', text: 'text-orange-800' },
      checkup: { bg: 'bg-teal-100', text: 'text-teal-800' },
    };
    const config = configs[type] || configs.consultation;
    const displayName = type?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {displayName}
      </span>
    );
  };

  const formatDateTime = (date, time) => {
    if (!date) return '-';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return time ? `${formattedDate} at ${formatTime(time)}` : formattedDate;
  };

  const formatTime = (time24) => {
    if (!time24) return '-';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3B82F6',
      confirmed: '#10B981',
      in_progress: '#F59E0B',
      completed: '#14B8A6',
      cancelled: '#EF4444',
      no_show: '#6B7280',
    };
    return colors[status] || colors.scheduled;
  };

  const isValidTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) > (startHour * 60 + startMin);
  };

  // Form Validation
  const validateAppointmentForm = () => {
    const errors = {};

    // Patient validation
    if (formData.isRegistered) {
      if (!formData.patientId) errors.patientId = 'Patient is required';
    } else {
      if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
      if (!formData.email?.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
      if (!formData.password?.trim()) errors.password = 'Password is required';
      else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
      if (!formData.username?.trim()) errors.username = 'Username is required';
      if (!formData.phone?.trim()) errors.phone = 'Phone is required';
      else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s-()]/g, ''))) errors.phone = 'Invalid phone format';
    }

    // Appointment validation
    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) errors.appointmentDate = 'Date must be today or in the future';
    }

    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && !isValidTimeRange(formData.startTime, formData.endTime)) {
      errors.endTime = 'End time must be after start time';
    }
    if (!formData.type) errors.type = 'Type is required';
    if (formData.duration && formData.duration <= 0) errors.duration = 'Duration must be positive';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!validateAppointmentForm()) return;

    setIsSubmitting(true);
    try {
      const appointmentData = {
        isRegistered: formData.isRegistered,
        ...(formData.isRegistered ? { patientId: formData.patientId } : {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          username: formData.username,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        }),
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
        type: formData.type,
        reason: formData.reason,
        notes: formData.notes,
        department: formData.department,
        status: formData.status,
      };

      const result = await createAppointment(appointmentData);
      if (result.success) {
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        setFormErrors({ submit: result.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      isRegistered: true,
      patientId: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      username: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      appointmentDate: '',
      startTime: '',
      endTime: '',
      duration: 30,
      type: 'consultation',
      reason: '',
      notes: '',
      department: '',
      status: 'scheduled',
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Delete Handler
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    const result = await deleteAppointment(selectedAppointment._id);
    if (result.success) {
      setIsDeleteDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  // Quick Status Handler
  const handleQuickStatusUpdate = async (newStatus) => {
    if (!quickStatusAppointment) return;
    const result = await updateAppointmentStatus(quickStatusAppointment._id, newStatus);
    if (result.success) {
      setIsQuickStatusModalOpen(false);
      setQuickStatusAppointment(null);
      fetchAppointments();
    }
  };

  // Calendar Events
  const calendarEvents = useMemo(() => {
    return appointments.map(apt => ({
      id: apt._id,
      title: `${apt.patient?.firstName || 'Unknown'} ${apt.patient?.lastName || ''} - ${apt.type}`,
      start: new Date(`${apt.appointmentDate}T${apt.startTime}`),
      end: new Date(`${apt.appointmentDate}T${apt.endTime}`),
      resource: apt,
      status: apt.status,
    }));
  }, [appointments]);

  // Calendar Event Styling
  const eventStyleGetter = (event) => {
    const backgroundColor = getStatusColor(event.status);
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Calendar Handlers
  const onSelectEvent = (event) => {
    navigate(`/app/doctor/appointment/${event.id}`);
  };

  const onSelectSlot = (slotInfo) => {
    const selectedDate = format(slotInfo.start, 'yyyy-MM-dd');
    const selectedTime = format(slotInfo.start, 'HH:mm');
    setFormData(prev => ({
      ...prev,
      appointmentDate: selectedDate,
      startTime: selectedTime,
    }));
    setIsCreateModalOpen(true);
  };

  const onNavigate = (date, view) => {
    // Compute visible start/end dates based on active view
    let startDate, endDate;

    switch (view) {
      case 'month':
        startDate = format(startOfMonth(date), 'yyyy-MM-dd');
        endDate = format(endOfMonth(date), 'yyyy-MM-dd');
        break;
      case 'week':
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        startDate = format(weekStart, 'yyyy-MM-dd');
        endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');
        break;
      case 'day':
        startDate = format(startOfDay(date), 'yyyy-MM-dd');
        endDate = format(endOfDay(date), 'yyyy-MM-dd');
        break;
      case 'agenda':
        // Agenda view typically shows 1 month ahead
        startDate = format(startOfDay(date), 'yyyy-MM-dd');
        endDate = format(endOfMonth(addDays(date, 30)), 'yyyy-MM-dd');
        break;
      default:
        startDate = format(startOfMonth(date), 'yyyy-MM-dd');
        endDate = format(endOfMonth(date), 'yyyy-MM-dd');
    }

    // Sync filters with calendar navigation
    setAppointmentFilters({
      startDate,
      endDate,
    });

    // Refresh appointments for new range
    fetchAppointments();
  };

  // DataTable Columns
  const columns = [
    {
      key: 'appointmentId',
      label: 'ID',
      render: (value, row) => (
        <div className="flex items-center text-sm text-gray-600">
          <FaCalendarCheck className="mr-2 text-blue-400" size={14} />
          <span className="font-mono">{row.appointmentId || row._id?.slice(-6) || '-'}</span>
        </div>
      ),
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
            {row.patient?.firstName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="font-medium text-gray-900">
            {row.patient?.firstName} {row.patient?.lastName}
          </div>
        </div>
      ),
    },
    {
      key: 'appointmentDate',
      label: 'Date & Time',
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{formatDateTime(row.appointmentDate)}</div>
          <div className="text-gray-500 flex items-center">
            <FiClock className="mr-1" size={12} />
            {formatTimeRange(row.startTime, row.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value, row) => getTypeBadge(row.type),
    },
    {
      key: 'department',
      label: 'Department',
      render: (value, row) => (
        row.department ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {row.department}
          </span>
        ) : <span className="text-gray-400">-</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => getStatusBadge(row.status),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value, row) => (
        <span className="text-sm text-gray-600" title={row.reason}>
          {row.reason ? (row.reason.length > 50 ? row.reason.slice(0, 50) + '...' : row.reason) : '-'}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value, row) => (
        <span className="text-sm text-gray-600">{row.duration || calculateDuration(row.startTime, row.endTime)} min</span>
      ),
    },
  ];

  // Auto-generate username from email
  useEffect(() => {
    if (!formData.isRegistered && formData.email && !formData.username) {
      const username = formData.email.split('@')[0];
      setFormData(prev => ({ ...prev, username }));
    }
  }, [formData.email, formData.isRegistered]);

  // Auto-calculate duration
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const duration = calculateDuration(formData.startTime, formData.endTime);
      if (duration > 0) {
        setFormData(prev => ({ ...prev, duration }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  // Handle status filter
  const handleStatusFilterChange = (status) => {
    const newFilter = localStatusFilter.includes(status)
      ? localStatusFilter.filter(s => s !== status)
      : [...localStatusFilter, status];
    setLocalStatusFilter(newFilter);
    setAppointmentFilters({ status: newFilter.join(',') });
  };

  // Quick date filters
  const setQuickFilter = (type) => {
    const today = new Date();
    let startDate, endDate;

    switch (type) {
      case 'today':
        startDate = endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'thisWeek':
        startDate = format(startOfWeek(today), 'yyyy-MM-dd');
        endDate = format(new Date(today.setDate(today.getDate() - today.getDay() + 6)), 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        startDate = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
        endDate = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd');
        break;
      case 'next7Days':
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(new Date(today.setDate(today.getDate() + 7)), 'yyyy-MM-dd');
        break;
      default:
        break;
    }

    setAppointmentFilters({ startDate, endDate });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Manage Appointments</h1>
            <p className="text-gray-600 mt-1">View and manage your appointment schedule</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus />
              Add Appointment
            </button>
            <div className="flex gap-1 border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiList />
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                  viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCalendar />
                Calendar View
              </button>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed flex items-center gap-2"
            >
              <FiDownload />
              Export
            </button>
            <button
              onClick={fetchAppointments}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className={isLoadingAppointments ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchAppointments}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
              <button
                onClick={clearError}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filters */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setQuickFilter('today')}
          className="px-3 py-1 text-sm rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => setQuickFilter('thisWeek')}
          className="px-3 py-1 text-sm rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          This Week
        </button>
        <button
          onClick={() => setQuickFilter('thisMonth')}
          className="px-3 py-1 text-sm rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          This Month
        </button>
        <button
          onClick={() => setQuickFilter('next7Days')}
          className="px-3 py-1 text-sm rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Next 7 Days
        </button>
        <button
          onClick={() => {
            setLocalStatusFilter(['scheduled', 'confirmed']);
            setAppointmentFilters({ status: 'scheduled,confirmed', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' });
          }}
          className="px-3 py-1 text-sm rounded-full border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
        >
          Upcoming
        </button>
        <button
          onClick={() => {
            setLocalStatusFilter(['completed']);
            setAppointmentFilters({ status: 'completed' });
          }}
          className="px-3 py-1 text-sm rounded-full border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors"
        >
          Completed
        </button>
        <button
          onClick={() => {
            setLocalStatusFilter(['cancelled']);
            setAppointmentFilters({ status: 'cancelled' });
          }}
          className="px-3 py-1 text-sm rounded-full border border-red-600 text-red-600 hover:bg-red-50 transition-colors"
        >
          Cancelled
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <FiFilter />
            Filters
          </h2>
          {(appointmentFilters.search || appointmentFilters.status || appointmentFilters.type || 
            appointmentFilters.department || appointmentFilters.startDate || appointmentFilters.patientId) && (
            <button
              onClick={() => {
                resetAppointmentFilters();
                setLocalStatusFilter([]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FiX />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search by appointment ID, reason, or notes..."
              value={appointmentFilters.search}
              onChange={(value) => setAppointmentFilters({ search: value })}
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={appointmentFilters.type}
              onChange={(e) => setAppointmentFilters({ type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="surgery">Surgery</option>
              <option value="checkup">Checkup</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={appointmentFilters.department}
              onChange={(e) => setAppointmentFilters({ department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={appointmentFilters.startDate}
              onChange={(e) => setAppointmentFilters({ startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={appointmentFilters.endDate}
              onChange={(e) => setAppointmentFilters({ endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Patient Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              value={appointmentFilters.patientId}
              onChange={(e) => setAppointmentFilters({ patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Patients</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={`${appointmentFilters.sortBy}-${appointmentFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setAppointmentFilters({ sortBy, sortOrder });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="appointmentDate-asc">Date (Earliest)</option>
              <option value="appointmentDate-desc">Date (Latest)</option>
              <option value="createdAt-desc">Created (Newest)</option>
              <option value="createdAt-asc">Created (Oldest)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Checkboxes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex flex-wrap gap-3">
            {['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localStatusFilter.includes(status)}
                  onChange={() => handleStatusFilterChange(status)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                {getStatusBadge(status)}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Content - List or Calendar View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <DataTable
            columns={columns}
            data={appointments}
            isLoading={isLoadingAppointments}
            emptyMessage="No appointments found. Try adjusting your filters or create a new appointment."
            viewPath="/app/doctor/appointment/:id"
            onEdit={(appointment) => navigate(`/app/doctor/appointment/${appointment._id}`)}
            onDelete={(appointment) => {
              setSelectedAppointment(appointment);
              setIsDeleteDialogOpen(true);
            }}
            showActions={true}
            customActions={(row) => (
              <button
                onClick={() => {
                  setQuickStatusAppointment(row);
                  setIsQuickStatusModalOpen(true);
                }}
                className="text-purple-600 hover:text-purple-900 transition-colors"
                title="Quick Status Update"
              >
                <FiActivity size={18} />
              </button>
            )}
            pagination={{
              currentPage: appointmentPagination.currentPage,
              totalPages: appointmentPagination.totalPages,
              totalCount: appointmentPagination.totalCount,
              onPageChange: setAppointmentPage,
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
            onNavigate={onNavigate}
            selectable
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
          />
        </div>
      )}

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Appointment"
        size="xl"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Patient Selection</h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="patientType"
                  checked={formData.isRegistered === true}
                  onChange={() => setFormData({ ...formData, isRegistered: true })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Existing Patient</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="patientType"
                  checked={formData.isRegistered === false}
                  onChange={() => setFormData({ ...formData, isRegistered: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>New Patient</span>
              </label>
            </div>

            {formData.isRegistered ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.patientId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName} ({patient.email})
                    </option>
                  ))}
                </select>
                {formErrors.patientId && <p className="text-red-600 text-sm mt-1">{formErrors.patientId}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.firstName && <p className="text-red-600 text-sm mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.lastName && <p className="text-red-600 text-sm mt-1">{formErrors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.username && <p className="text-red-600 text-sm mt-1">{formErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.appointmentDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.appointmentDate && <p className="text-red-600 text-sm mt-1">{formErrors.appointmentDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="surgery">Surgery</option>
                  <option value="checkup">Checkup</option>
                </select>
                {formErrors.type && <p className="text-red-600 text-sm mt-1">{formErrors.type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.startTime && <p className="text-red-600 text-sm mt-1">{formErrors.startTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.endTime ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.endTime && <p className="text-red-600 text-sm mt-1">{formErrors.endTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Cardiology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                  maxLength="500"
                  placeholder="Reason for appointment..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  maxLength="1000"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>

          {formErrors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{formErrors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <AiOutlineLoading3Quarters className="animate-spin" />}
              Create Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Status Modal */}
      <Modal
        isOpen={isQuickStatusModalOpen}
        onClose={() => {
          setIsQuickStatusModalOpen(false);
          setQuickStatusAppointment(null);
        }}
        title="Update Appointment Status"
        size="md"
      >
        {quickStatusAppointment && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Patient</p>
              <p className="font-semibold text-gray-900">
                {quickStatusAppointment.patient?.firstName} {quickStatusAppointment.patient?.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-2">Date & Time</p>
              <p className="font-semibold text-gray-900">
                {formatDateTime(quickStatusAppointment.appointmentDate, quickStatusAppointment.startTime)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Current Status</p>
              {getStatusBadge(quickStatusAppointment.status)}
            </div>

            <div className="flex flex-col gap-2">
              {quickStatusAppointment.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => handleQuickStatusUpdate('confirmed')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm Appointment
                  </button>
                  <button
                    onClick={() => handleQuickStatusUpdate('cancelled')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              {quickStatusAppointment.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => handleQuickStatusUpdate('in_progress')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Appointment
                  </button>
                  <button
                    onClick={() => handleQuickStatusUpdate('cancelled')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              {quickStatusAppointment.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => handleQuickStatusUpdate('completed')}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => handleQuickStatusUpdate('no_show')}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Mark as No Show
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleDeleteAppointment}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment${
          selectedAppointment ? ` with ${selectedAppointment.patient?.firstName} ${selectedAppointment.patient?.lastName}` : ''
        }? This action cannot be undone.`}
        variant="danger"
      />
    </div>
  );
};

export default ManageAppointments;
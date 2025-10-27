import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import usePatientStore from "../../stores/patientStore";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  FiPlus,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiUser,
  FiFilter,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  FaUserMd,
  FaCalendarCheck,
  FaStethoscope,
  FaHospital,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const UserAppointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    appointments,
    doctors,
    availableSlots,
    isLoadingAppointments,
    errorAppointments,
    isLoading,
    isLoadingDoctors,
    errorDoctors,
    isCheckingAvailability,
    errorAvailability,
    appointmentFilters,
    appointmentPagination,
    doctorFilters,
    doctorPagination,
    fetchAppointments,
    searchDoctors,
    checkDoctorAvailability,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    setAppointmentFilters,
    setAppointmentPage,
    setDoctorFilters,
    setDoctorPage,
    resetAppointmentFilters,
    clearAppointmentsError,
    clearDoctorsError,
    clearAvailabilityError,
    error,
  } = usePatientStore();

  // Modal states
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);

  // Form states
  const [bookingData, setBookingData] = useState({
    doctorId: "",
    selectedDoctor: null,
    doctorName: "",
    doctorDepartment: "",
    appointmentDate: "",
    startTime: "",
    endTime: "",
    duration: 30,
    type: "consultation",
    reason: "",
    notes: "",
    department: "",
  });

  const [rescheduleData, setRescheduleData] = useState({
    newAppointmentDate: "",
    newStartTime: "",
    newEndTime: "",
  });

  const [cancelReason, setCancelReason] = useState("");
  const [bookingErrors, setBookingErrors] = useState({});
  const [rescheduleErrors, setRescheduleErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatusFilter, setLocalStatusFilter] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Initialize data
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle navigation state for cancel action from dashboard
  useEffect(() => {
    if (location.state?.cancelAppointmentId) {
      const appointment = appointments.find(
        (apt) => apt._id === location.state.cancelAppointmentId
      );
      if (appointment) {
        handleOpenCancelDialog(appointment);
      }
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, appointments]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Scheduled",
      },
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Confirmed",
      },
      in_progress: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "In Progress",
      },
      completed: {
        bg: "bg-teal-100",
        text: "text-teal-800",
        label: "Completed",
      },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
      no_show: { bg: "bg-gray-100", text: "text-gray-800", label: "No Show" },
    };
    const config = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      consultation: { bg: "bg-blue-100", text: "text-blue-800" },
      "follow-up": { bg: "bg-green-100", text: "text-green-800" },
      emergency: { bg: "bg-red-100", text: "text-red-800" },
      surgery: { bg: "bg-orange-100", text: "text-orange-800" },
      checkup: { bg: "bg-teal-100", text: "text-teal-800" },
    };
    const config = typeConfig[type] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {type?.charAt(0).toUpperCase() + type?.slice(1)}
      </span>
    );
  };

  const formatSpecialization = (spec) => {
    if (!spec) return "";
    return spec.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString("en-IN") || 0}`;
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Validation functions
  const validateBooking = () => {
    const errors = {};

    if (bookingStep === 1) {
      if (!bookingData.doctorId) errors.doctor = "Please select a doctor";
    }

    if (bookingStep === 2) {
      if (!bookingData.appointmentDate)
        errors.appointmentDate = "Date is required";
      if (!bookingData.startTime) errors.startTime = "Time is required";
      if (!bookingData.endTime) errors.endTime = "End time is required";
      if (!bookingData.type) errors.type = "Appointment type is required";

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(bookingData.appointmentDate);
      if (selectedDate < today) {
        errors.appointmentDate = "Date must be today or in the future";
      }
    }

    return errors;
  };

  const validateReschedule = () => {
    const errors = {};

    if (!rescheduleData.newAppointmentDate) {
      errors.newAppointmentDate = "Date is required";
    }
    if (!rescheduleData.newStartTime) errors.newStartTime = "Time is required";
    if (!rescheduleData.newEndTime) errors.newEndTime = "End time is required";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(rescheduleData.newAppointmentDate);
    if (selectedDate < today) {
      errors.newAppointmentDate = "Date must be today or in the future";
    }

    return errors;
  };

  // Booking handlers
  const handleOpenBookModal = () => {
    setIsBookModalOpen(true);
    setBookingStep(1);
    searchDoctors();
  };

  const handleSelectDoctor = (doctor) => {
    setBookingData({
      ...bookingData,
      doctorId: doctor._id,
      selectedDoctor: doctor,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      doctorDepartment: formatSpecialization(doctor.department),
      department: doctor.department,
    });
    setBookingStep(2);
  };

  const handleDateChange = async (date) => {
    setBookingData({
      ...bookingData,
      appointmentDate: date,
      startTime: "",
      endTime: "",
    });

    if (bookingData.doctorId && date) {
      setIsCheckingAvailability(true);
      await checkDoctorAvailability(bookingData.doctorId, date);
      setIsCheckingAvailability(false);
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setBookingData({
      ...bookingData,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setBookingStep(3);
  };

  // Alias for modal usage
  const handleSelectSlot = handleTimeSlotSelect;

  const handleBookAppointment = async () => {
    const errors = validateBooking();
    if (Object.keys(errors).length > 0) {
      setBookingErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const result = await bookAppointment({
      doctorId: bookingData.doctorId,
      appointmentDate: bookingData.appointmentDate,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      duration: bookingData.duration,
      type: bookingData.type,
      reason: bookingData.reason,
      notes: bookingData.notes,
      department: bookingData.department,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsBookModalOpen(false);
      resetBookingForm();
      fetchAppointments();
      alert("Appointment booked successfully!");
    } else {
      setBookingErrors({ submit: result.error });
    }
  };

  // Alias for modal usage
  const handleConfirmBooking = handleBookAppointment;

  const resetBookingForm = () => {
    setBookingData({
      doctorId: "",
      selectedDoctor: null,
      doctorName: "",
      doctorDepartment: "",
      appointmentDate: "",
      startTime: "",
      endTime: "",
      duration: 30,
      type: "consultation",
      reason: "",
      notes: "",
      department: "",
    });
    setBookingStep(1);
    setBookingErrors({});
    setIsSubmitting(false);
  };

  const handleNextStep = () => {
    const errors = validateBooking();
    if (Object.keys(errors).length > 0) {
      setBookingErrors(errors);
      return;
    }
    setBookingStep(bookingStep + 1);
  };

  const handlePreviousStep = () => {
    setBookingStep(bookingStep - 1);
    setBookingErrors({});
  };

  const handleCloseBookModal = () => {
    setIsBookModalOpen(false);
    resetBookingForm();
  };

  // Cancel handlers
  const handleOpenCancelDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setIsCancelDialogOpen(false);
    setSelectedAppointment(null);
    setCancelReason("");
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    const result = await cancelAppointment(
      selectedAppointment._id,
      cancelReason
    );

    if (result.success) {
      setIsCancelDialogOpen(false);
      setSelectedAppointment(null);
      setCancelReason("");
      fetchAppointments();
      alert("Appointment cancelled successfully");
    }
  };

  // Alias for modal usage
  const handleConfirmCancel = handleCancelAppointment;

  // Reschedule handlers
  const handleOpenRescheduleModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
    setRescheduleData({
      newAppointmentDate: "",
      newStartTime: "",
      newEndTime: "",
    });
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedAppointment(null);
    setRescheduleData({
      newAppointmentDate: "",
      newStartTime: "",
      newEndTime: "",
    });
    setRescheduleErrors({});
  };

  const handleRescheduleDateChange = async (date) => {
    setRescheduleData({
      ...rescheduleData,
      newAppointmentDate: date,
      newStartTime: "",
      newEndTime: "",
    });

    if (selectedAppointment && date) {
      setIsCheckingAvailability(true);
      await checkDoctorAvailability(selectedAppointment.doctor._id, date);
      setIsCheckingAvailability(false);
    }
  };

  const handleRescheduleTimeSlotSelect = (slot) => {
    setRescheduleData({
      ...rescheduleData,
      newStartTime: slot.startTime,
      newEndTime: slot.endTime,
    });
  };

  // Alias for modal usage
  const handleSelectRescheduleSlot = handleRescheduleTimeSlotSelect;

  const handleRescheduleAppointment = async () => {
    const errors = validateReschedule();
    if (Object.keys(errors).length > 0) {
      setRescheduleErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const result = await rescheduleAppointment(
      selectedAppointment._id,
      rescheduleData.newAppointmentDate,
      rescheduleData.newStartTime,
      rescheduleData.newEndTime
    );

    setIsSubmitting(false);

    if (result.success) {
      setIsRescheduleModalOpen(false);
      setSelectedAppointment(null);
      setRescheduleData({
        newAppointmentDate: "",
        newStartTime: "",
        newEndTime: "",
      });
      fetchAppointments();
      alert("Appointment rescheduled successfully!");
    } else {
      setRescheduleErrors({ submit: result.error });
    }
  };

  // Alias for modal usage
  const handleConfirmReschedule = handleRescheduleAppointment;

  // Status filter handler
  const handleStatusFilterChange = (status) => {
    let newFilters = [...localStatusFilter];
    if (newFilters.includes(status)) {
      newFilters = newFilters.filter((s) => s !== status);
    } else {
      newFilters.push(status);
    }
    setLocalStatusFilter(newFilters);
    setAppointmentFilters({ status: newFilters.join(",") });
  };

  // DataTable columns
  const columns = [
    {
      key: "appointmentId",
      label: "ID",
      render: (value) => (
        <span className="font-mono text-xs flex items-center">
          <FaCalendarCheck className="mr-1 text-blue-600" />
          {value}
        </span>
      ),
    },
    {
      key: "doctor",
      label: "Doctor",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm mr-2">
            {getInitial(value?.firstName)}
          </div>
          <div>
            <p className="font-semibold text-sm">
              Dr. {value?.firstName} {value?.lastName}
            </p>
            {value?.specialization?.[0] && (
              <p className="text-xs text-gray-600">
                {formatSpecialization(value.specialization[0])}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "appointmentDate",
      label: "Date & Time",
      render: (value, row) => (
        <div className="flex items-start">
          <FiClock className="mr-1 mt-0.5 text-gray-600" size={14} />
          <div>
            <p className="text-sm font-medium">
              {new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-gray-600">
              {formatTimeRange(row.startTime, row.endTime)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => getTypeBadge(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "reason",
      label: "Reason",
      render: (value) => (
        <span className="text-sm text-gray-700" title={value}>
          {value?.length > 50 ? `${value.substring(0, 50)}...` : value || "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              My Appointments
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your healthcare appointments
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenBookModal}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              <FiPlus className="mr-2" size={20} />
              Book Appointment
            </button>
            <button
              onClick={fetchAppointments}
              disabled={isLoadingAppointments}
              className="flex items-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw
                className={`mr-2 ${
                  isLoadingAppointments ? "animate-spin" : ""
                }`}
                size={20}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorAppointments && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
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
              <span className="text-red-800">{errorAppointments}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchAppointments}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
              <button
                onClick={clearAppointmentsError}
                className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <SearchBar
              placeholder="Search by appointment ID or reason..."
              value={appointmentFilters.search}
              onChange={(value) => setAppointmentFilters({ search: value })}
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={appointmentFilters.type}
              onChange={(e) => setAppointmentFilters({ type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="surgery">Surgery</option>
              <option value="checkup">Checkup</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={`${appointmentFilters.sortBy}-${appointmentFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
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

        {/* Date Range Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={appointmentFilters.startDate || ""}
                onChange={(e) =>
                  setAppointmentFilters({ startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={appointmentFilters.endDate || ""}
                onChange={(e) =>
                  setAppointmentFilters({ endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setAppointmentFilters({ startDate: today, endDate: today });
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const startOfWeek = new Date(today);
                const dayOfWeek = today.getDay();
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                startOfWeek.setDate(today.getDate() + diff);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                setAppointmentFilters({
                  startDate: startOfWeek.toISOString().split("T")[0],
                  endDate: endOfWeek.toISOString().split("T")[0],
                });
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const startOfMonth = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  1
                );
                const endOfMonth = new Date(
                  today.getFullYear(),
                  today.getMonth() + 1,
                  0
                );
                setAppointmentFilters({
                  startDate: startOfMonth.toISOString().split("T")[0],
                  endDate: endOfMonth.toISOString().split("T")[0],
                });
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const next7Days = new Date(today);
                next7Days.setDate(today.getDate() + 7);
                setAppointmentFilters({
                  startDate: today.toISOString().split("T")[0],
                  endDate: next7Days.toISOString().split("T")[0],
                });
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Next 7 Days
            </button>
          </div>
        </div>

        {/* Status Filter Checkboxes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              "scheduled",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
              "no_show",
            ].map((status) => (
              <label key={status} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localStatusFilter.includes(status)}
                  onChange={() => handleStatusFilterChange(status)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                {getStatusBadge(status)}
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(appointmentFilters.search ||
          appointmentFilters.type ||
          appointmentFilters.status) && (
          <button
            onClick={resetAppointmentFilters}
            className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <FiX className="mr-1" size={16} />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <DataTable
        columns={columns}
        data={appointments}
        isLoading={isLoadingAppointments}
        emptyMessage="No appointments found. Book your first appointment to get started!"
        pagination={appointmentPagination}
        onPageChange={setAppointmentPage}
        onEdit={handleOpenRescheduleModal}
        onDelete={handleOpenCancelDialog}
        showActions={true}
        editLabel="Reschedule"
        deleteLabel="Cancel"
      />

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={handleCloseBookModal}
        title="Book Appointment"
        size="xl"
      >
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  bookingStep >= 1
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 ${
                  bookingStep >= 2 ? "bg-purple-600" : "bg-gray-200"
                }`}
              ></div>
            </div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  bookingStep >= 2
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <div
                className={`w-16 h-1 ${
                  bookingStep >= 3 ? "bg-purple-600" : "bg-gray-200"
                }`}
              ></div>
            </div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  bookingStep >= 3
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {/* Step 1: Select Doctor */}
          {bookingStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <SearchBar
                  value={doctorFilters.search}
                  onChange={(value) => setDoctorFilters({ search: value })}
                  placeholder="Search doctors by name..."
                  className="flex-1"
                />
                <select
                  value={doctorFilters.specialization}
                  onChange={(e) => setDoctorFilters({ specialization: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="general">General Medicine</option>
                </select>
                <select
                  value={doctorFilters.department}
                  onChange={(e) => setDoctorFilters({ department: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  <option value="emergency">Emergency</option>
                  <option value="outpatient">Outpatient</option>
                  <option value="inpatient">Inpatient</option>
                  <option value="surgery">Surgery</option>
                </select>
                <select
                  value={doctorFilters.sortBy}
                  onChange={(e) => setDoctorFilters({ sortBy: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="firstName">Name</option>
                  <option value="experience">Experience</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doctorFilters.isAvailableForEmergency === true}
                    onChange={(e) => setDoctorFilters({ isAvailableForEmergency: e.target.checked ? true : null })}
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Available for Emergency</span>
                </label>
              </div>

              {errorDoctors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{errorDoctors}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {isLoadingDoctors ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="mt-2 text-gray-600">Loading doctors...</p>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No doctors found matching your criteria.
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                            {getInitial(doctor.firstName || 'D')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doctor.specialization && doctor.specialization.length > 0 ? (
                              doctor.specialization.map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {formatSpecialization(spec)}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No specialization</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatSpecialization(doctor.department)}
                          </p>
                          {doctor.yearsOfExperience !== undefined && (
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-gray-500">
                                {doctor.yearsOfExperience} years exp.
                              </span>
                              {doctor.consultationFee && (
                                <span className="text-sm font-medium text-purple-600">
                                  ₹{doctor.consultationFee}
                                </span>
                              )}
                            </div>
                          )}
                          <button
                            onClick={() => handleSelectDoctor(doctor)}
                            className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            Select Doctor
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {doctorPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() =>
                      setDoctorPage(doctorPagination.currentPage - 1)
                    }
                    disabled={doctorPagination.currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {doctorPagination.currentPage} of{" "}
                    {doctorPagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setDoctorPage(doctorPagination.currentPage + 1)
                    }
                    disabled={
                      doctorPagination.currentPage ===
                      doctorPagination.totalPages
                    }
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {bookingStep === 2 && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {getInitial(bookingData.doctorName)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Dr. {bookingData.doctorName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {bookingData.doctorDepartment}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={bookingData.appointmentDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {bookingData.appointmentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  {isCheckingAvailability ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Checking availability...
                      </p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for this date. Please select another
                      date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectSlot(slot)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            bookingData.startTime === slot.startTime &&
                            bookingData.endTime === slot.endTime
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bookingErrors.dateTime && (
                <p className="text-sm text-red-600">
                  {bookingErrors.dateTime}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {bookingStep === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {getInitial(bookingData.doctorName)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Dr. {bookingData.doctorName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {bookingData.doctorDepartment}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(bookingData.appointmentDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
                      {formatTimeRange(
                        bookingData.startTime,
                        bookingData.endTime
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {bookingData.appointmentType}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(bookingData.consultationFee)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={bookingData.appointmentType}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      appointmentType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="check-up">Check-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookingData.reason}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, reason: e.target.value })
                  }
                  placeholder="Brief description of your symptoms or concern"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {bookingErrors.reason && (
                  <p className="text-sm text-red-600 mt-1">
                    {bookingErrors.reason}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Any additional information for the doctor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              {bookingStep > 1 && (
                <button
                  onClick={handlePreviousStep}
                  disabled={isLoadingAppointments}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseBookModal}
                disabled={isLoadingAppointments}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              {bookingStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={isLoadingAppointments}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleConfirmBooking}
                  disabled={isLoadingAppointments}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingAppointments ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirming...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        title="Reschedule Appointment"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Current Appointment
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium text-gray-900">
                    Dr. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(selectedAppointment.appointmentDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Time:</span>
                  <span className="font-medium text-gray-900">
                    {formatTimeRange(
                      selectedAppointment.startTime,
                      selectedAppointment.endTime
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Appointment Date
              </label>
              <input
                type="date"
                value={rescheduleData.newAppointmentDate}
                onChange={(e) => handleRescheduleDateChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {rescheduleData.newAppointmentDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                {isCheckingAvailability ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Checking availability...
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No available slots for this date. Please select another
                    date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectRescheduleSlot(slot)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          rescheduleData.newStartTime === slot.startTime &&
                          rescheduleData.newEndTime === slot.endTime
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {rescheduleErrors.reschedule && (
              <p className="text-sm text-red-600">
                {rescheduleErrors.reschedule}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseRescheduleModal}
                disabled={isLoadingAppointments}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={isLoadingAppointments}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingAppointments ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Rescheduling...
                  </>
                ) : (
                  "Confirm Reschedule"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Appointment Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Cancel Appointment"
        confirmVariant="danger"
        isLoading={isLoadingAppointments}
      >
        {selectedAppointment && (
          <div className="mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium text-gray-900">
                    Dr. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(selectedAppointment.appointmentDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">
                    {formatTimeRange(
                      selectedAppointment.startTime,
                      selectedAppointment.endTime
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Please provide a reason for cancellation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              ></textarea>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default UserAppointments;

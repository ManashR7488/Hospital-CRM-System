import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAdminStore from "../../stores/adminStore";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import DoctorForm from "../../components/DoctorForm";
import {
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiMapPin,
  FiPhone,
  FiAward,
  FiBriefcase,
} from "react-icons/fi";
import { FaStethoscope, FaHospital } from "react-icons/fa";
import { FaUserMd } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ManageDoctors = () => {
  const navigate = useNavigate();

  // Extract from adminStore
  const {
    users,
    doctors,
    isLoading,
    error,
    filters,
    pagination,
    fetchUsers,
    createUser,
    deleteUser,
    setFilters,
    setPage,
    resetFilters,
    clearError,
  } = useAdminStore();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Local filter states for doctor-specific fields
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [emergencyAvailabilityFilter, setEmergencyAvailabilityFilter] =
    useState("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    medicalLicenseNumber: "",
    department: "",
    role: "doctor",
    specialization: [],
    yearsOfExperience: "",
    consultationFee: "",
    isAvailableForEmergency: false,
    qualifications: [],
    availability: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic form section states
  const [currentQualification, setCurrentQualification] = useState({
    degree: "",
    institution: "",
    year: "",
    specialty: "",
  });

  const [currentAvailability, setCurrentAvailability] = useState({
    day: "",
    startTime: "",
    endTime: "",
    isAvailable: true,
  });

  // Fetch users on mount with doctor role filter
  useEffect(() => {
    setFilters({ role: "doctor" });
    fetchUsers();
  }, []);

  // Specialization enum values
  const specializationOptions = [
    "cardiology",
    "neurology",
    "orthopedics",
    "pediatrics",
    "psychiatry",
    "radiology",
    "surgery",
    "internal_medicine",
    "emergency_medicine",
    "anesthesiology",
    "pathology",
    "dermatology",
    "oncology",
    "gynecology",
    "urology",
    "ophthalmology",
    "ent",
    "general_practice",
  ];

  // Department enum values
  const departmentOptions = [
    "emergency",
    "icu",
    "surgery",
    "oncology",
    "cardiology",
    "neurology",
    "orthopedics",
    "pediatrics",
    "maternity",
    "radiology",
    "laboratory",
    "pharmacy",
    "outpatient",
    "inpatient",
  ];

  // Day options
  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Helper function to format enum values
  const formatEnumValue = (value) => {
    if (!value) return "";
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to get department badge color
  const getDepartmentBadge = (department) => {
    const colorMap = {
      emergency: "bg-red-100 text-red-800",
      icu: "bg-orange-100 text-orange-800",
      surgery: "bg-blue-100 text-blue-800",
      oncology: "bg-purple-100 text-purple-800",
      cardiology: "bg-pink-100 text-pink-800",
      neurology: "bg-indigo-100 text-indigo-800",
      orthopedics: "bg-cyan-100 text-cyan-800",
      pediatrics: "bg-yellow-100 text-yellow-800",
      maternity: "bg-rose-100 text-rose-800",
      radiology: "bg-violet-100 text-violet-800",
      laboratory: "bg-lime-100 text-lime-800",
      pharmacy: "bg-green-100 text-green-800",
      outpatient: "bg-teal-100 text-teal-800",
      inpatient: "bg-slate-100 text-slate-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colorMap[department] || "bg-gray-100 text-gray-800"
        }`}
      >
        {formatEnumValue(department)}
      </span>
    );
  };

  // Helper function to display specializations
  const getSpecializationDisplay = (specializations) => {
    if (!specializations || specializations.length === 0) return "-";
    const first = formatEnumValue(specializations[0]);
    const count = specializations.length - 1;
    return count > 0 ? `${first} +${count}` : first;
  };

  // Helper function to format experience
  const formatExperience = (years) => {
    if (!years) return "-";
    return `${years} ${years === 1 ? "year" : "years"}`;
  };

  // Helper function to format consultation fee
  const formatConsultationFee = (fee) => {
    if (!fee) return "-";
    return `₹${fee.toLocaleString("en-IN")}`;
  };

  // Filter doctors function (role filter now handled by store)
  const filterDoctors = (allUsers) => {
    let filtered = allUsers; // No need to filter by role since store handles it

    if (specializationFilter) {
      filtered = filtered.filter(
        (d) =>
          d.specialization && d.specialization.includes(specializationFilter)
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((d) => d.department === departmentFilter);
    }

    if (emergencyAvailabilityFilter === "available") {
      filtered = filtered.filter((d) => d.isAvailableForEmergency === true);
    } else if (emergencyAvailabilityFilter === "not_available") {
      filtered = filtered.filter((d) => d.isAvailableForEmergency === false);
    }

    return filtered;
  };

  // DataTable columns configuration
  const columns = [
    {
      key: "avatar",
      label: "",
      render: (value, row) => (
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
            {row.firstName?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <FaUserMd className="w-3 h-3 text-green-600" />
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div className="font-medium text-gray-900">
          Dr. {row.firstName} {row.lastName}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value, row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FiMail className="w-4 h-4" />
          <span className="text-sm">{row.email}</span>
        </div>
      ),
    },
    {
      key: "license",
      label: "License Number",
      render: (value, row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FiAward className="w-4 h-4" />
          <span className="text-sm font-mono">
            {row.medicalLicenseNumber || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (value, row) => getDepartmentBadge(row.department),
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (value, row) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
          {getSpecializationDisplay(row.specialization)}
        </span>
      ),
    },
    {
      key: "experience",
      label: "Experience",
      render: (value, row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FiBriefcase className="w-4 h-4" />
          <span className="text-sm">
            {formatExperience(row.yearsOfExperience)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created",
      label: "Created",
      render: (value, row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  // Validation function
  const validateDoctorForm = () => {
    const errors = {};

    // Base user validations
    if (!formData.firstName?.trim())
      errors.firstName = "First name is required";
    if (!formData.lastName?.trim()) errors.lastName = "Last name is required";
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-()\s]/g, ""))) {
      errors.phone = "Invalid phone number format";
    }
    if (!formData.gender) errors.gender = "Gender is required";

    // Doctor-specific validations
    if (!formData.medicalLicenseNumber?.trim()) {
      errors.medicalLicenseNumber = "Medical license number is required";
    }
    if (!formData.department) errors.department = "Department is required";

    // Optional field validations
    if (formData.yearsOfExperience) {
      const years = parseInt(formData.yearsOfExperience);
      if (isNaN(years) || years < 0 || years > 60) {
        errors.yearsOfExperience =
          "Years of experience must be between 0 and 60";
      }
    }

    if (formData.consultationFee) {
      const fee = parseFloat(formData.consultationFee);
      if (isNaN(fee) || fee < 0) {
        errors.consultationFee = "Consultation fee must be a positive number";
      }
    }

    // Qualifications validation
    if (formData.qualifications.length > 0) {
      formData.qualifications.forEach((qual, index) => {
        if (!qual.degree || !qual.institution) {
          errors[`qualification_${index}`] =
            "Degree and institution are required";
        }
      });
    }

    // Availability validation
    if (formData.availability.length > 0) {
      formData.availability.forEach((avail, index) => {
        if (!avail.day || !avail.startTime || !avail.endTime) {
          errors[`availability_${index}`] =
            "Day, start time, and end time are required";
        } else if (avail.endTime <= avail.startTime) {
          errors[`availability_${index}`] = "End time must be after start time";
        }
      });
    }

    return errors;
  };

  // Add qualification handler
  const handleAddQualification = () => {
    if (
      !currentQualification.degree ||
      !currentQualification.institution ||
      !currentQualification.year
    ) {
      setFormErrors({
        ...formErrors,
        qualification: "Degree, institution, and year are required",
      });
      return;
    }

    const year = parseInt(currentQualification.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      setFormErrors({
        ...formErrors,
        qualification: `Year must be between 1900 and ${currentYear}`,
      });
      return;
    }

    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, { ...currentQualification }],
    });

    setCurrentQualification({
      degree: "",
      institution: "",
      year: "",
      specialty: "",
    });
    setFormErrors({ ...formErrors, qualification: "" });
  };

  // Remove qualification handler
  const handleRemoveQualification = (index) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    });
  };

  // Validate time range
  const validateTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    return endTime > startTime;
  };

  // Add availability handler
  const handleAddAvailability = () => {
    if (
      !currentAvailability.day ||
      !currentAvailability.startTime ||
      !currentAvailability.endTime
    ) {
      setFormErrors({
        ...formErrors,
        availability: "Day, start time, and end time are required",
      });
      return;
    }

    if (
      !validateTimeRange(
        currentAvailability.startTime,
        currentAvailability.endTime
      )
    ) {
      setFormErrors({
        ...formErrors,
        availability: "End time must be after start time",
      });
      return;
    }

    // Check for duplicate days
    if (formData.availability.some((a) => a.day === currentAvailability.day)) {
      setFormErrors({
        ...formErrors,
        availability: "Availability for this day already exists",
      });
      return;
    }

    setFormData({
      ...formData,
      availability: [...formData.availability, { ...currentAvailability }],
    });

    setCurrentAvailability({
      day: "",
      startTime: "",
      endTime: "",
      isAvailable: true,
    });
    setFormErrors({ ...formErrors, availability: "" });
  };

  // Remove availability handler
  const handleRemoveAvailability = (index) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter((_, i) => i !== index),
    });
  };

  // Handle specialization toggle
  const handleSpecializationToggle = (spec) => {
    const current = formData.specialization || [];
    if (current.includes(spec)) {
      setFormData({
        ...formData,
        specialization: current.filter((s) => s !== spec),
      });
    } else {
      setFormData({
        ...formData,
        specialization: [...current, spec],
      });
    }
  };

  // Create doctor handler
  const handleCreateDoctor = async (e) => {
    e.preventDefault();

    const errors = validateDoctorForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Prepare user data
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        gender: formData.gender,
        role: "doctor",
        medicalLicenseNumber: formData.medicalLicenseNumber.trim(),
        department: formData.department,
      };

      // Add optional fields
      if (formData.dateOfBirth) userData.dateOfBirth = formData.dateOfBirth;
      if (formData.specialization.length > 0)
        userData.specialization = formData.specialization;
      if (formData.yearsOfExperience)
        userData.yearsOfExperience = parseInt(formData.yearsOfExperience);
      if (formData.consultationFee)
        userData.consultationFee = parseFloat(formData.consultationFee);
      userData.isAvailableForEmergency = formData.isAvailableForEmergency;

      // Add qualifications if any
      if (formData.qualifications.length > 0) {
        userData.qualifications = formData.qualifications.map((q) => ({
          degree: q.degree,
          institution: q.institution,
          year: parseInt(q.year),
          ...(q.specialty && { specialty: q.specialty }),
        }));
      }

      // Add availability if any
      if (formData.availability.length > 0) {
        userData.availability = formData.availability;
      }

      // Add address if any field has value
      if (
        formData.street ||
        formData.city ||
        formData.state ||
        formData.zipCode
      ) {
        userData.address = {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        };
      }

      await createUser(userData, "doctor");

      // Close modal and reset form
      setIsCreateModalOpen(false);
      resetDoctorForm();
      console.log("Doctor created successfully");
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to create doctor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form function
  const resetDoctorForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      medicalLicenseNumber: "",
      department: "",
      role: "doctor",
      specialization: [],
      yearsOfExperience: "",
      consultationFee: "",
      isAvailableForEmergency: false,
      qualifications: [],
      availability: [],
    });
    setCurrentQualification({
      degree: "",
      institution: "",
      year: "",
      specialty: "",
    });
    setCurrentAvailability({
      day: "",
      startTime: "",
      endTime: "",
      isAvailable: true,
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Delete doctor handler
  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      await deleteUser(selectedDoctor._id, "doctor");
      setIsDeleteDialogOpen(false);
      setSelectedDoctor(null);
      console.log("Doctor deleted successfully");
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    }
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.search ||
    (filters.isActive !== null && filters.isActive !== "") ||
    specializationFilter ||
    departmentFilter ||
    emergencyAvailabilityFilter;

  // Clear all filters (but keep role: 'doctor')
  const handleClearFilters = () => {
    resetFilters();
    setFilters({ role: "doctor" }); // Maintain doctor role filter
    setSpecializationFilter("");
    setDepartmentFilter("");
    setEmergencyAvailabilityFilter("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Manage Doctors</h1>
          <p className="text-gray-600 mt-1">
            View and manage all doctors in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add New Doctor</span>
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
          >
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => fetchUsers()}
                className="text-red-800 hover:text-red-900 font-medium text-sm"
              >
                Retry
              </button>
              <button
                onClick={clearError}
                className="text-red-800 hover:text-red-900 font-medium text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <SearchBar
              placeholder="Search by name, email, license number, or specialization..."
              value={filters.search}
              onChange={(value) => setFilters({ search: value })}
            />
          </div>

          {/* Specialization Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Specializations</option>
              {specializationOptions.map((spec) => (
                <option key={spec} value={spec}>
                  {formatEnumValue(spec)}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {formatEnumValue(dept)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters?.isActive ?? ""}
              onChange={(e) => setFilters({ isActive: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Emergency Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Availability
            </label>
            <select
              value={emergencyAvailabilityFilter}
              onChange={(e) => setEmergencyAvailabilityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters({ sortBy, sortOrder });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="firstName-asc">Name (A-Z)</option>
              <option value="firstName-desc">Name (Z-A)</option>
              <option value="yearsOfExperience-desc">
                Experience (High to Low)
              </option>
              <option value="yearsOfExperience-asc">
                Experience (Low to High)
              </option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filterDoctors(users)}
        isLoading={isLoading}
        emptyMessage="No doctors found. Try adjusting your filters or add a new doctor."
        viewPath="/app/admin/doctor/:id"
        onEdit={(doctor) => navigate(`/app/admin/doctor/${doctor._id}`)}
        onDelete={(doctor) => {
          setSelectedDoctor(doctor);
          setIsDeleteDialogOpen(true);
        }}
        showActions={true}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Create Doctor Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetDoctorForm();
        }}
        title="Add New Doctor"
        size="xl"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-6">
          {/* Doctor Form Component */}
          <DoctorForm
            formData={formData}
            onChange={setFormData}
            errors={formErrors}
            currentQualification={currentQualification}
            onQualificationChange={setCurrentQualification}
            onAddQualification={handleAddQualification}
            onRemoveQualification={handleRemoveQualification}
            currentAvailability={currentAvailability}
            onAvailabilityChange={setCurrentAvailability}
            onAddAvailability={handleAddAvailability}
            onRemoveAvailability={handleRemoveAvailability}
            onSpecializationToggle={handleSpecializationToggle}
            showPasswordField={true}
            readOnlyEmail={false}
          />

          {/* Form Error */}
          {formErrors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formErrors.submit}
            </div>
          )}

          {/* Form Buttons */}
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="John"
            />
            {formErrors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Doe"
            />
            {formErrors.lastName && (
              <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="doctor@example.com"
              />
            </div>
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="9876543210"
              />
            </div>
            {formErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Min 8 characters"
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.gender ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {formErrors.gender && (
              <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Section 2: Professional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FaStethoscope className="w-5 h-5" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Medical License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.medicalLicenseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalLicenseNumber: e.target.value,
                      })
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.medicalLicenseNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="MED2024001"
                  />
                </div>
                {formErrors.medicalLicenseNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.medicalLicenseNumber}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.department
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {formatEnumValue(dept)}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.department && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.department}
                  </p>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearsOfExperience: e.target.value,
                      })
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.yearsOfExperience
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="10"
                  />
                </div>
                {formErrors.yearsOfExperience && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.yearsOfExperience}
                  </p>
                )}
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee (INR)
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultationFee: e.target.value,
                      })
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.consultationFee
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="1000"
                  />
                </div>
                {formErrors.consultationFee && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.consultationFee}
                  </p>
                )}
              </div>

              {/* Emergency Availability */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailableForEmergency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailableForEmergency: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Available for emergency consultations
                  </span>
                </label>
              </div>
            </div>

            {/* Specialization (Multi-select) */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {specializationOptions.map((spec) => (
                  <label key={spec} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(spec)}
                      onChange={() => handleSpecializationToggle(spec)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formatEnumValue(spec)}
                    </span>
                  </label>
                ))}
              </div>
              {formData.specialization.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specialization.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs"
                    >
                      {formatEnumValue(spec)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Qualifications */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FiAward className="w-5 h-5" />
              Qualifications
            </h3>

            {/* Display added qualifications */}
            {formData.qualifications.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {formData.qualifications.map((qual, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded-lg p-3 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {qual.degree}
                      </p>
                      <p className="text-sm text-gray-700">
                        {qual.institution}
                      </p>
                      <p className="text-sm text-gray-600">{qual.year}</p>
                      {qual.specialty && (
                        <p className="text-sm text-gray-600">
                          {qual.specialty}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new qualification form */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Add Qualification
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Degree (e.g., MBBS, MD, MS)"
                  value={currentQualification.degree}
                  onChange={(e) =>
                    setCurrentQualification({
                      ...currentQualification,
                      degree: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={currentQualification.institution}
                  onChange={(e) =>
                    setCurrentQualification({
                      ...currentQualification,
                      institution: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={currentQualification.year}
                  onChange={(e) =>
                    setCurrentQualification({
                      ...currentQualification,
                      year: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Specialty (optional)"
                  value={currentQualification.specialty}
                  onChange={(e) =>
                    setCurrentQualification({
                      ...currentQualification,
                      specialty: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleAddQualification}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Qualification
              </button>
              {formErrors.qualification && (
                <p className="text-red-500 text-xs mt-2">
                  {formErrors.qualification}
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Availability Schedule */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              Availability Schedule
            </h3>

            {/* Display added availability */}
            {formData.availability.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.availability.map((avail, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">
                        {avail.day}
                      </span>
                      <span className="text-gray-600 ml-3">
                        {avail.startTime} - {avail.endTime}
                      </span>
                      {avail.isAvailable && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Available
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAvailability(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new availability form */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Add doctor's available consultation hours
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={currentAvailability.day}
                  onChange={(e) =>
                    setCurrentAvailability({
                      ...currentAvailability,
                      day: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Day</option>
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  placeholder="Start Time"
                  value={currentAvailability.startTime}
                  onChange={(e) =>
                    setCurrentAvailability({
                      ...currentAvailability,
                      startTime: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={currentAvailability.endTime}
                  onChange={(e) =>
                    setCurrentAvailability({
                      ...currentAvailability,
                      endTime: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleAddAvailability}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Availability
              </button>
              {formErrors.availability && (
                <p className="text-red-500 text-xs mt-2">
                  {formErrors.availability}
                </p>
              )}
            </div>
          </div>

          {/* Section 5: Address (Optional) */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FiMapPin className="w-5 h-5" />
              Address (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Form Error */}
          {formErrors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formErrors.submit}
            </div>
          )}

          {/* Form Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetDoctorForm();
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
              )}
              {isSubmitting ? "Creating..." : "Create Doctor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDoctor(null);
        }}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        message={
          selectedDoctor
            ? `Are you sure you want to delete Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}? This will also remove all associated appointments and patient assignments.`
            : ""
        }
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ManageDoctors;

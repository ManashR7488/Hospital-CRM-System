import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAdminStore  from '../../stores/adminStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FiArrowLeft,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiAward,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import { FaUserMd, FaStethoscope, FaHospital, FaUserInjured } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ManageDoctorsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser, isLoading, error, fetchUserById, updateUser, deleteUser } = useAdminStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Dynamic section states
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: '',
    specialty: '',
  });
  const [newAvailability, setNewAvailability] = useState({
    day: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
  });

  // Fetch doctor data on mount
  useEffect(() => {
    if (id) {
      fetchUserById(id, 'doctor');
    }
  }, [id, fetchUserById]);

  // Update editedData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditedData({ ...currentUser });
    }
  }, [currentUser]);

  // Specialization and Department options
  const specializationOptions = [
    'cardiology',
    'neurology',
    'orthopedics',
    'pediatrics',
    'psychiatry',
    'radiology',
    'surgery',
    'internal_medicine',
    'emergency_medicine',
    'anesthesiology',
    'pathology',
    'dermatology',
    'oncology',
    'gynecology',
    'urology',
    'ophthalmology',
    'ent',
    'general_practice',
  ];

  const departmentOptions = [
    'emergency',
    'icu',
    'surgery',
    'oncology',
    'cardiology',
    'neurology',
    'orthopedics',
    'pediatrics',
    'maternity',
    'radiology',
    'laboratory',
    'pharmacy',
    'outpatient',
    'inpatient',
  ];

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDayName = (dayEnum) => {
    if (!dayEnum) return '';
    return dayEnum.charAt(0).toUpperCase() + dayEnum.slice(1);
  };

  const formatEnumValue = (value) => {
    if (!value) return '';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDepartmentColor = (department) => {
    const colorMap = {
      emergency: 'bg-red-100 text-red-800',
      icu: 'bg-orange-100 text-orange-800',
      surgery: 'bg-blue-100 text-blue-800',
      oncology: 'bg-purple-100 text-purple-800',
      cardiology: 'bg-pink-100 text-pink-800',
      neurology: 'bg-indigo-100 text-indigo-800',
      orthopedics: 'bg-cyan-100 text-cyan-800',
      pediatrics: 'bg-yellow-100 text-yellow-800',
      maternity: 'bg-rose-100 text-rose-800',
      radiology: 'bg-violet-100 text-violet-800',
      laboratory: 'bg-lime-100 text-lime-800',
      pharmacy: 'bg-green-100 text-green-800',
      outpatient: 'bg-teal-100 text-teal-800',
      inpatient: 'bg-slate-100 text-slate-800',
    };
    return colorMap[department] || 'bg-gray-100 text-gray-800';
  };

  const getSpecializationColor = () => {
    return 'bg-teal-100 text-teal-800';
  };

  // Validation function for edit mode
  const validateDoctorEditForm = () => {
    const errors = {};

    if (!editedData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!editedData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!editedData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(editedData.phone.replace(/[-()\s]/g, ''))) {
      errors.phone = 'Invalid phone number format';
    }
    if (!editedData.medicalLicenseNumber?.trim()) {
      errors.medicalLicenseNumber = 'Medical license number is required';
    }
    if (!editedData.department) errors.department = 'Department is required';

    if (editedData.yearsOfExperience) {
      const years = parseInt(editedData.yearsOfExperience);
      if (isNaN(years) || years < 0 || years > 60) {
        errors.yearsOfExperience = 'Years of experience must be between 0 and 60';
      }
    }

    if (editedData.consultationFee) {
      const fee = parseFloat(editedData.consultationFee);
      if (isNaN(fee) || fee < 0) {
        errors.consultationFee = 'Consultation fee must be a positive number';
      }
    }

    if (editedData.qualifications && editedData.qualifications.length > 0) {
      editedData.qualifications.forEach((qual, index) => {
        if (!qual.degree || !qual.institution || !qual.year) {
          errors[`qualification_${index}`] = 'Degree, institution, and year are required';
        }
      });
    }

    if (editedData.availability && editedData.availability.length > 0) {
      editedData.availability.forEach((avail, index) => {
        if (!avail.day || !avail.startTime || !avail.endTime) {
          errors[`availability_${index}`] = 'Day, start time, and end time are required';
        } else if (avail.endTime <= avail.startTime) {
          errors[`availability_${index}`] = 'End time must be after start time';
        }
      });
    }

    return errors;
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    const errors = validateDoctorEditForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await updateUser(id, editedData, 'doctor');
      setIsEditing(false);
      setFormErrors({});
      console.log('Doctor updated successfully');
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to update doctor' });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedData({ ...currentUser });
    setFormErrors({});
    setIsEditing(false);
  };

  // Handle delete
  const handleDeleteDoctor = async () => {
    try {
      await deleteUser(id, 'doctor');
      navigate('/app/admin/doctors');
      console.log('Doctor deleted successfully');
    } catch (err) {
      console.error('Failed to delete doctor:', err);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle add qualification
  const handleAddQualification = () => {
    if (!newQualification.degree || !newQualification.institution || !newQualification.year) {
      setFormErrors({ ...formErrors, newQualification: 'Degree, institution, and year are required' });
      return;
    }

    const year = parseInt(newQualification.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      setFormErrors({ ...formErrors, newQualification: `Year must be between 1900 and ${currentYear}` });
      return;
    }

    setEditedData({
      ...editedData,
      qualifications: [...(editedData.qualifications || []), { ...newQualification, year }],
    });

    setNewQualification({ degree: '', institution: '', year: '', specialty: '' });
    setFormErrors({ ...formErrors, newQualification: '' });
  };

  // Handle remove qualification
  const handleRemoveQualification = (index) => {
    setEditedData({
      ...editedData,
      qualifications: editedData.qualifications.filter((_, i) => i !== index),
    });
  };

  // Handle add availability
  const handleAddAvailability = () => {
    if (!newAvailability.day || !newAvailability.startTime || !newAvailability.endTime) {
      setFormErrors({ ...formErrors, newAvailability: 'Day, start time, and end time are required' });
      return;
    }

    if (newAvailability.endTime <= newAvailability.startTime) {
      setFormErrors({ ...formErrors, newAvailability: 'End time must be after start time' });
      return;
    }

    // Check for duplicate days
    if (editedData.availability && editedData.availability.some((a) => a.day === newAvailability.day)) {
      setFormErrors({ ...formErrors, newAvailability: 'Availability for this day already exists' });
      return;
    }

    setEditedData({
      ...editedData,
      availability: [...(editedData.availability || []), { ...newAvailability }],
    });

    setNewAvailability({ day: '', startTime: '', endTime: '', isAvailable: true });
    setFormErrors({ ...formErrors, newAvailability: '' });
  };

  // Handle remove availability
  const handleRemoveAvailability = (index) => {
    setEditedData({
      ...editedData,
      availability: editedData.availability.filter((_, i) => i !== index),
    });
  };

  // Handle specialization toggle
  const handleSpecializationToggle = (spec) => {
    const current = editedData.specialization || [];
    if (current.includes(spec)) {
      setEditedData({
        ...editedData,
        specialization: current.filter((s) => s !== spec),
      });
    } else {
      setEditedData({
        ...editedData,
        specialization: [...current, spec],
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium">Error loading doctor</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/app/admin/doctors')}
                className="text-red-800 hover:text-red-900 font-medium text-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => fetchUserById(id, 'doctor')}
                className="text-red-800 hover:text-red-900 font-medium text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Doctor not found
  if (!currentUser) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-96">
        <FaUserMd className="w-24 h-24 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor not found</h2>
        <p className="text-gray-600 mb-4">The doctor you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/app/admin/doctors')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        {/* Back Button */}
        <button
          onClick={() => navigate('/app/admin/doctors')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Doctors</span>
        </button>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-2">
          <Link to="/app/admin" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link to="/app/admin/doctors" className="hover:text-blue-600">
            Manage Doctors
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Doctor Details</span>
        </div>

        {/* Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              Dr. {currentUser.firstName} {currentUser.lastName}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(currentUser.department)}`}>
                {formatEnumValue(currentUser.department)}
              </span>
              {currentUser.specialization &&
                currentUser.specialization.map((spec) => (
                  <span key={spec} className={`px-3 py-1 rounded-full text-sm font-medium ${getSpecializationColor()}`}>
                    {formatEnumValue(spec)}
                  </span>
                ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form Error */}
      {formErrors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {formErrors.submit}
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-6 pb-6 border-b">
              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold">
                {currentUser.firstName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  Dr. {currentUser.firstName} {currentUser.lastName}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <FiAward className="w-4 h-4" />
                  <span className="font-mono text-sm">{currentUser.medicalLicenseNumber}</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {currentUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                {/* Edit Mode - Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.firstName}
                        onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.lastName}
                        onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
                      <input
                        type="email"
                        value={editedData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={editedData.dateOfBirth ? editedData.dateOfBirth.split('T')[0] : ''}
                        onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={editedData.gender}
                        onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Edit Mode - Professional Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.medicalLicenseNumber}
                        onChange={(e) => setEditedData({ ...editedData, medicalLicenseNumber: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.medicalLicenseNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.medicalLicenseNumber && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.medicalLicenseNumber}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editedData.department}
                        onChange={(e) => setEditedData({ ...editedData, department: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.department ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {formatEnumValue(dept)}
                          </option>
                        ))}
                      </select>
                      {formErrors.department && <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={editedData.yearsOfExperience || ''}
                        onChange={(e) => setEditedData({ ...editedData, yearsOfExperience: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.yearsOfExperience && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.yearsOfExperience}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (INR)</label>
                      <input
                        type="number"
                        min="0"
                        value={editedData.consultationFee || ''}
                        onChange={(e) => setEditedData({ ...editedData, consultationFee: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.consultationFee ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.consultationFee && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.consultationFee}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedData.isAvailableForEmergency || false}
                          onChange={(e) => setEditedData({ ...editedData, isAvailableForEmergency: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Available for emergency consultations</span>
                      </label>
                    </div>
                  </div>

                  {/* Specialization Multi-select */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {specializationOptions.map((spec) => (
                        <label key={spec} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editedData.specialization?.includes(spec) || false}
                            onChange={() => handleSpecializationToggle(spec)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{formatEnumValue(spec)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit Mode - Address */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={editedData.address?.street || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: { ...editedData.address, street: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="City"
                      value={editedData.address?.city || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          address: { ...editedData.address, city: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={editedData.address?.state || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          address: { ...editedData.address, state: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={editedData.address?.zipCode || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          address: { ...editedData.address, zipCode: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={editedData.address?.country || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          address: { ...editedData.address, country: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Edit Mode - Status */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Account Status</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedData.isActive || false}
                      onChange={(e) => setEditedData({ ...editedData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* View Mode - Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <FiMail className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-gray-900">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-gray-900">{currentUser.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Mode - Professional Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <FaStethoscope className="w-5 h-5" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <FaHospital className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p>{getDepartmentColor(currentUser.department) && (
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(currentUser.department)}`}>
                            {formatEnumValue(currentUser.department)}
                          </span>
                        )}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaStethoscope className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Specializations</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {currentUser.specialization && currentUser.specialization.length > 0 ? (
                            currentUser.specialization.map((spec) => (
                              <span
                                key={spec}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getSpecializationColor()}`}
                              >
                                {formatEnumValue(spec)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiBriefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Years of Experience</p>
                        <p className="text-gray-900">{currentUser.yearsOfExperience || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiDollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Consultation Fee</p>
                        <p className="text-gray-900">{formatCurrency(currentUser.consultationFee)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Emergency Availability</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            currentUser.isAvailableForEmergency
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {currentUser.isAvailableForEmergency ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Mode - Personal Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="text-gray-900">
                          {formatDate(currentUser.dateOfBirth)}
                          {calculateAge(currentUser.dateOfBirth) && ` (${calculateAge(currentUser.dateOfBirth)} years)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="text-gray-900 capitalize">{currentUser.gender || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Mode - Address */}
                {currentUser.address && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <FiMapPin className="w-5 h-5" />
                      Address
                    </h3>
                    <div className="flex items-start gap-3">
                      <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-gray-900">
                          {[
                            currentUser.address.street,
                            currentUser.address.city,
                            currentUser.address.state,
                            currentUser.address.zipCode,
                            currentUser.address.country,
                          ]
                            .filter(Boolean)
                            .join(', ') || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Mode - Account Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="text-gray-900">{currentUser.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Verified</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          currentUser.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {currentUser.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-gray-900">{formatDate(currentUser.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-gray-900">{formatDate(currentUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Qualifications Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FiAward className="w-5 h-5" />
              Qualifications
            </h3>

            {isEditing ? (
              <div className="space-y-4">
                {/* Display existing qualifications */}
                {editedData.qualifications && editedData.qualifications.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {editedData.qualifications.map((qual, index) => (
                      <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold text-blue-900">{qual.degree}</p>
                          <p className="text-gray-700">{qual.institution}</p>
                          <p className="text-gray-600">{qual.year}</p>
                          {qual.specialty && <p className="text-gray-600">{qual.specialty}</p>}
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
                  <p className="text-sm font-medium text-gray-700 mb-3">Add Qualification</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Degree (e.g., MBBS, MD, MS)"
                      value={newQualification.degree}
                      onChange={(e) => setNewQualification({ ...newQualification, degree: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={newQualification.institution}
                      onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={newQualification.year}
                      onChange={(e) => setNewQualification({ ...newQualification, year: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Specialty (optional)"
                      value={newQualification.specialty}
                      onChange={(e) => setNewQualification({ ...newQualification, specialty: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Qualification
                  </button>
                  {formErrors.newQualification && (
                    <p className="text-red-500 text-xs mt-2">{formErrors.newQualification}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {currentUser.qualifications && currentUser.qualifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentUser.qualifications.map((qual, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <p className="text-lg font-semibold text-blue-900">{qual.degree}</p>
                        <p className="text-gray-700">{qual.institution}</p>
                        <p className="text-gray-600">{qual.year}</p>
                        {qual.specialty && <p className="text-gray-600 text-sm">{qual.specialty}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No qualifications added</p>
                )}
              </div>
            )}
          </div>

          {/* Availability Schedule Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              Availability Schedule
            </h3>

            {isEditing ? (
              <div className="space-y-4">
                {/* Display existing availability */}
                {editedData.availability && editedData.availability.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {editedData.availability.map((avail, index) => (
                      <div key={index} className="bg-white border border-gray-300 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-900">{avail.day}</span>
                          <span className="text-gray-600 ml-3">
                            {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                          </span>
                          {avail.isAvailable && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Available</span>
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
                  <p className="text-sm font-medium text-gray-700 mb-3">Add doctor's available consultation hours</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={newAvailability.day}
                      onChange={(e) => setNewAvailability({ ...newAvailability, day: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      value={newAvailability.startTime}
                      onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="time"
                      value={newAvailability.endTime}
                      onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAvailability}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Availability
                  </button>
                  {formErrors.newAvailability && (
                    <p className="text-red-500 text-xs mt-2">{formErrors.newAvailability}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {currentUser.availability && currentUser.availability.length > 0 ? (
                  <div className="space-y-2">
                    {dayOptions.map((day) => {
                      const schedule = currentUser.availability.find((a) => a.day === day);
                      return (
                        <div
                          key={day}
                          className={`p-3 rounded-lg ${schedule ? 'bg-blue-50' : 'bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">{day}</span>
                            {schedule ? (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">
                                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                </span>
                                {schedule.isAvailable && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Available</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">Not Available</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No availability schedule set</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Stats and Assigned Patients */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaUserInjured className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Patients</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{currentUser.patients?.length || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiCalendar className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-gray-600">Appointments</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{currentUser.appointments?.length || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiBriefcase className="w-6 h-6 text-purple-600" />
                  <span className="text-sm text-gray-600">Years Experience</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{currentUser.yearsOfExperience || 0}</p>
              </div>
            </div>
          </div>

          {/* Assigned Patients Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Assigned Patients</h3>
              {currentUser.patients && currentUser.patients.length > 0 && (
                <Link to="/app/admin/patients" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              )}
            </div>
            <div>
              {currentUser.patients && currentUser.patients.length > 0 ? (
                <div className="space-y-3">
                  {currentUser.patients.slice(0, 5).map((patient, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {patient.firstName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{patient._id}</p>
                      </div>
                    </div>
                  ))}
                  {currentUser.patients.length > 5 && (
                    <Link
                      to="/app/admin/patients"
                      className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
                    >
                      View All {currentUser.patients.length} Patients
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No patients assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${currentUser.firstName} ${currentUser.lastName}? This will remove the doctor from the system and unassign all patients. This action cannot be undone.`}
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ManageDoctorsDetail;
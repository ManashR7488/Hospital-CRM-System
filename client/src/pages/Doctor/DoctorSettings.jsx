import React, { useEffect, useState } from 'react';
import useDoctorStore from '../../stores/doctorStore';
import useAuthStore from '../../stores/authStore';
import AvailabilityScheduler from '../../components/AvailabilityScheduler';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiLock,
  FiShield,
  FiKey,
  FiAward,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiPlus,
  FiMinus,
  FiBell,
  FiSettings,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiEdit,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { FaUserMd, FaStethoscope, FaHospital } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const DoctorSettings = () => {
  // Extract from stores
  const { user } = useAuthStore();
  const {
    isSavingSettings,
    error,
    updateDoctorProfile,
    updateBaseProfile,
    changeDoctorPassword,
    updateNotificationSettings,
    getSettings,
    validateAvailability,
    clearError,
  } = useDoctorStore();

  // Tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Professional edit state
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [professionalData, setProfessionalData] = useState({
    specialization: [],
    department: '',
    yearsOfExperience: 0,
    consultationFee: 0,
    isAvailableForEmergency: false,
    qualifications: [],
    availability: [],
  });
  const [professionalErrors, setProfessionalErrors] = useState({});
  const [isSavingProfessional, setIsSavingProfessional] = useState(false);
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: '',
    specialty: '',
  });
  const [qualificationErrors, setQualificationErrors] = useState({});

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    types: {
      appointmentReminders: true,
      patientUpdates: true,
      systemUpdates: true,
    },
  });

  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? toDateInputValue(user.dateOfBirth) : '',
        gender: user.gender || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'India',
        },
      });

      setProfessionalData({
        specialization: user.specialization || [],
        department: user.department || '',
        yearsOfExperience: user.yearsOfExperience || 0,
        consultationFee: user.consultationFee || 0,
        isAvailableForEmergency: user.isAvailableForEmergency || false,
        qualifications: user.qualifications || [],
        availability: user.availability || [],
      });
    }

    // Load notification settings
    const settings = getSettings();
    if (settings?.notifications) {
      setNotificationSettings(settings.notifications);
    }
  }, [user, getSettings]);

  // Helper functions
  const toDateInputValue = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Not set';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatSpecialization = (spec) => {
    if (!spec) return '';
    return spec
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Profile validation
  const validateProfileForm = () => {
    const errors = {};

    if (!profileData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (profileData.firstName.trim().length > 50) {
      errors.firstName = 'First name must be 50 characters or less';
    }

    if (!profileData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (profileData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be 50 characters or less';
    }

    if (!profileData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s()-]+$/.test(profileData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (profileData.dateOfBirth) {
      const dob = new Date(profileData.dateOfBirth);
      if (dob > new Date()) {
        errors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    return errors;
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    const result = await updateBaseProfile(profileData);
    setIsSavingProfile(false);

    if (result.success) {
      setIsEditingProfile(false);
      setProfileErrors({});
      showSuccessMessage('Profile updated successfully');
    }
  };

  // Handle cancel profile edit
  const handleCancelProfileEdit = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? toDateInputValue(user.dateOfBirth) : '',
        gender: user.gender || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'India',
        },
      });
    }
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  // Professional validation
  const validateProfessionalForm = () => {
    const errors = {};

    if (!professionalData.department) {
      errors.department = 'Department is required';
    }

    if (professionalData.yearsOfExperience < 0 || professionalData.yearsOfExperience > 60) {
      errors.yearsOfExperience = 'Years of experience must be between 0 and 60';
    }

    if (professionalData.consultationFee < 0) {
      errors.consultationFee = 'Consultation fee must be 0 or greater';
    }

    // Validate qualifications
    const currentYear = new Date().getFullYear();
    professionalData.qualifications.forEach((qual, index) => {
      if (!qual.degree || !qual.institution) {
        errors[`qualification_${index}`] = 'Degree and institution are required';
      }
      if (qual.year && (qual.year < 1900 || qual.year > currentYear)) {
        errors[`qualification_${index}`] = `Year must be between 1900 and ${currentYear}`;
      }
    });

    return errors;
  };

  // Handle save professional
  const handleSaveProfessional = async () => {
    const errors = validateProfessionalForm();
    if (Object.keys(errors).length > 0) {
      setProfessionalErrors(errors);
      return;
    }

    // Validate availability using store's validation function
    const { valid, errors: availabilityErrors } = validateAvailability(professionalData.availability);
    if (!valid) {
      setProfessionalErrors({
        availability: availabilityErrors.join('; '),
      });
      return;
    }

    setIsSavingProfessional(true);
    const result = await updateDoctorProfile(professionalData);
    setIsSavingProfessional(false);

    if (result.success) {
      setIsEditingProfessional(false);
      setProfessionalErrors({});
      showSuccessMessage('Professional profile updated successfully');
    }
  };

  // Handle cancel professional edit
  const handleCancelProfessionalEdit = () => {
    if (user) {
      setProfessionalData({
        specialization: user.specialization || [],
        department: user.department || '',
        yearsOfExperience: user.yearsOfExperience || 0,
        consultationFee: user.consultationFee || 0,
        isAvailableForEmergency: user.isAvailableForEmergency || false,
        qualifications: user.qualifications || [],
        availability: user.availability || [],
      });
    }
    setProfessionalErrors({});
    setIsEditingProfessional(false);
  };

  // Qualification management
  const validateQualification = (qualification) => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!qualification.degree?.trim()) {
      errors.degree = 'Degree is required';
    }

    if (!qualification.institution?.trim()) {
      errors.institution = 'Institution is required';
    }

    if (qualification.year) {
      const year = parseInt(qualification.year, 10);
      if (year < 1900 || year > currentYear) {
        errors.year = `Year must be between 1900 and ${currentYear}`;
      }
    }

    return errors;
  };

  const handleAddQualification = () => {
    const errors = validateQualification(newQualification);
    if (Object.keys(errors).length > 0) {
      setQualificationErrors(errors);
      return;
    }

    setProfessionalData({
      ...professionalData,
      qualifications: [...professionalData.qualifications, newQualification],
    });

    setNewQualification({
      degree: '',
      institution: '',
      year: '',
      specialty: '',
    });
    setQualificationErrors({});
  };

  const handleRemoveQualification = (index) => {
    setProfessionalData({
      ...professionalData,
      qualifications: professionalData.qualifications.filter((_, i) => i !== index),
    });
  };

  // Password validation
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    return errors;
  };

  // Handle change password
  const handleChangePassword = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSavingPassword(true);
    const result = await changeDoctorPassword(passwordData);
    setIsSavingPassword(false);

    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      showSuccessMessage('Password changed successfully');
    } else {
      setPasswordErrors({ currentPassword: result.error });
    }
  };

  // Handle save notification settings
  const handleSaveNotificationSettings = () => {
    updateNotificationSettings(notificationSettings);
    showSuccessMessage('Notification preferences saved');
  };

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'professional', label: 'Professional', icon: FaUserMd },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  // Department options
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

  // Specialization options
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-blue-600">Settings</span>
        </div>
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your profile, professional credentials, and preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center text-green-800">
            <FiCheckCircle className="mr-2" size={20} />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
            <FiX size={20} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center text-red-800">
            <FiAlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="text-red-600 hover:text-red-800">
            <FiX size={20} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="mr-2" size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <FiUser className="mr-3 text-blue-600" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-600">Update your personal information</p>
                </div>
              </div>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit className="mr-2" size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSavingProfile ? (
                      <AiOutlineLoading3Quarters className="mr-2 animate-spin" size={16} />
                    ) : (
                      <FiSave className="mr-2" size={16} />
                    )}
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelProfileEdit}
                    disabled={isSavingProfile}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    <FiX className="mr-2" size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          profileErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John"
                      />
                      {profileErrors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{profileErrors.firstName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">{user?.firstName || '-'}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          profileErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Doe"
                      />
                      {profileErrors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{profileErrors.lastName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">{user?.lastName || '-'}</p>
                  )}
                </div>

                {/* Email (Display Only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center text-gray-900">
                    <FiMail className="mr-2 text-gray-400" size={16} />
                    {user?.email || '-'}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          profileErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+91 1234567890"
                      />
                      {profileErrors.phone && (
                        <p className="mt-1 text-xs text-red-600">{profileErrors.phone}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiPhone className="mr-2 text-gray-400" size={16} />
                      {user?.phone || '-'}
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          profileErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {profileErrors.dateOfBirth && (
                        <p className="mt-1 text-xs text-red-600">{profileErrors.dateOfBirth}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiCalendar className="mr-2 text-gray-400" size={16} />
                      {formatDate(user?.dateOfBirth)}
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  {isEditingProfile ? (
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{user?.gender?.replace('_', ' ') || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Street */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={profileData.address.street}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: { ...profileData.address, street: e.target.value },
                          })
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main Street"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900">{user?.address?.street || '-'}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.address.city}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: { ...profileData.address, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="New York"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.address?.city || '-'}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.address.state}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: { ...profileData.address, state: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Maharashtra"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.address?.state || '-'}</p>
                  )}
                </div>

                {/* ZIP Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.address.zipCode}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: { ...profileData.address, zipCode: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="400001"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.address?.zipCode || '-'}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.address.country}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: { ...profileData.address, country: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="India"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.address?.country || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROFESSIONAL TAB */}
        {activeTab === 'professional' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <FaUserMd className="mr-3 text-green-600" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
                  <p className="text-sm text-gray-600">Manage your credentials, qualifications, and availability</p>
                </div>
              </div>
              {!isEditingProfessional ? (
                <button
                  onClick={() => setIsEditingProfessional(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiEdit className="mr-2" size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfessional}
                    disabled={isSavingProfessional}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSavingProfessional ? (
                      <AiOutlineLoading3Quarters className="mr-2 animate-spin" size={16} />
                    ) : (
                      <FiSave className="mr-2" size={16} />
                    )}
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelProfessionalEdit}
                    disabled={isSavingProfessional}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    <FiX className="mr-2" size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Professional Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Medical License Number (Display Only) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical License Number
                  </label>
                  <div className="flex items-center text-gray-900">
                    <FiAward className="mr-2 text-blue-500" size={16} />
                    {user?.medicalLicenseNumber || '-'}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">License number cannot be changed</p>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  {isEditingProfessional ? (
                    <div className="relative">
                      <FaHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <select
                        value={professionalData.department}
                        onChange={(e) =>
                          setProfessionalData({ ...professionalData, department: e.target.value })
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          professionalErrors.department ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {formatSpecialization(dept)}
                          </option>
                        ))}
                      </select>
                      {professionalErrors.department && (
                        <p className="mt-1 text-xs text-red-600">{professionalErrors.department}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {formatSpecialization(user?.department || 'Not set')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  {isEditingProfessional ? (
                    <div className="relative">
                      <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={professionalData.yearsOfExperience}
                        onChange={(e) =>
                          setProfessionalData({
                            ...professionalData,
                            yearsOfExperience: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          professionalErrors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="5"
                      />
                      {professionalErrors.yearsOfExperience && (
                        <p className="mt-1 text-xs text-red-600">{professionalErrors.yearsOfExperience}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiBriefcase className="mr-2 text-gray-400" size={16} />
                      {user?.yearsOfExperience || 0} years
                    </div>
                  )}
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee
                  </label>
                  {isEditingProfessional ? (
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        min="0"
                        value={professionalData.consultationFee}
                        onChange={(e) =>
                          setProfessionalData({
                            ...professionalData,
                            consultationFee: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          professionalErrors.consultationFee ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1000"
                      />
                      <p className="mt-1 text-xs text-gray-500">Fee in INR (₹)</p>
                      {professionalErrors.consultationFee && (
                        <p className="mt-1 text-xs text-red-600">{professionalErrors.consultationFee}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiDollarSign className="mr-2 text-gray-400" size={16} />
                      {formatCurrency(user?.consultationFee)}
                    </div>
                  )}
                </div>

                {/* Emergency Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Availability
                  </label>
                  {isEditingProfessional ? (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={professionalData.isAvailableForEmergency}
                        onChange={(e) =>
                          setProfessionalData({
                            ...professionalData,
                            isAvailableForEmergency: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available for emergency consultations</span>
                    </label>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user?.isAvailableForEmergency
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user?.isAvailableForEmergency ? 'Available' : 'Not Available'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
              {isEditingProfessional ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specializationOptions.map((spec) => (
                    <label key={spec} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={professionalData.specialization.includes(spec)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfessionalData({
                              ...professionalData,
                              specialization: [...professionalData.specialization, spec],
                            });
                          } else {
                            setProfessionalData({
                              ...professionalData,
                              specialization: professionalData.specialization.filter((s) => s !== spec),
                            });
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{formatSpecialization(spec)}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.specialization && user.specialization.length > 0 ? (
                    user.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                      >
                        <FaStethoscope className="mr-1" size={12} />
                        {formatSpecialization(spec)}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No specializations added</p>
                  )}
                </div>
              )}
            </div>

            {/* Qualifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiAward className="mr-2 text-yellow-600" size={20} />
                Qualifications
              </h3>

              {/* Existing Qualifications */}
              {professionalData.qualifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {professionalData.qualifications.map((qual, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{qual.degree}</h4>
                          <p className="text-sm text-gray-600 mb-1">{qual.institution}</p>
                          <p className="text-xs text-gray-500">
                            {qual.year} {qual.specialty && `• ${qual.specialty}`}
                          </p>
                        </div>
                        {isEditingProfessional && (
                          <button
                            onClick={() => handleRemoveQualification(index)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <FiMinus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-4">No qualifications added</p>
              )}

              {/* Add Qualification Form */}
              {isEditingProfessional && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <FiPlus className="mr-2 text-blue-600" size={16} />
                    Add New Qualification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Degree */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newQualification.degree}
                        onChange={(e) =>
                          setNewQualification({ ...newQualification, degree: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          qualificationErrors.degree ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MBBS, MD, MS, DM, MCh"
                      />
                      {qualificationErrors.degree && (
                        <p className="mt-1 text-xs text-red-600">{qualificationErrors.degree}</p>
                      )}
                    </div>

                    {/* Institution */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newQualification.institution}
                        onChange={(e) =>
                          setNewQualification({ ...newQualification, institution: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          qualificationErrors.institution ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Medical College Name"
                      />
                      {qualificationErrors.institution && (
                        <p className="mt-1 text-xs text-red-600">{qualificationErrors.institution}</p>
                      )}
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={newQualification.year}
                        onChange={(e) =>
                          setNewQualification({ ...newQualification, year: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          qualificationErrors.year ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="2020"
                      />
                      {qualificationErrors.year && (
                        <p className="mt-1 text-xs text-red-600">{qualificationErrors.year}</p>
                      )}
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                      <input
                        type="text"
                        value={newQualification.specialty}
                        onChange={(e) =>
                          setNewQualification({ ...newQualification, specialty: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Cardiology (optional)"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddQualification}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="mr-2" size={16} />
                    Add Qualification
                  </button>
                </div>
              )}
            </div>

            {/* Availability Schedule */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiClock className="mr-2 text-blue-600" size={20} />
                Availability Schedule
              </h3>
              <AvailabilityScheduler
                availability={professionalData.availability}
                onChange={(updatedAvailability) =>
                  setProfessionalData({ ...professionalData, availability: updatedAvailability })
                }
                readOnly={!isEditingProfessional}
              />
              {professionalErrors.availability && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" size={16} />
                  {professionalErrors.availability}
                </p>
              )}
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center pb-4 border-b border-gray-200">
              <FiLock className="mr-3 text-red-600" size={24} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-600">Manage your password and security preferences</p>
              </div>
            </div>

            {/* Password Change Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="max-w-md space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Change Password Button */}
                <button
                  onClick={handleChangePassword}
                  disabled={isSavingPassword}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingPassword ? (
                    <AiOutlineLoading3Quarters className="mr-2 animate-spin" size={16} />
                  ) : (
                    <FiShield className="mr-2" size={16} />
                  )}
                  Change Password
                </button>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Username</span>
                  <span className="text-sm text-gray-900">{user?.username || user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Account Created</span>
                  <span className="text-sm text-gray-900">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Role</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaUserMd className="mr-1" size={12} />
                    Doctor
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Account Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FiCheckCircle className="mr-1" size={12} />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center pb-4 border-b border-gray-200">
              <FiBell className="mr-3 text-purple-600" size={24} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
              </div>
            </div>

            {/* Notification Channels */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-start">
                    <FiMail className="mr-3 text-blue-500 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-xs text-gray-600">Receive notifications via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        email: !notificationSettings.email,
                      })
                    }
                    className="relative"
                  >
                    {notificationSettings.email ? (
                      <FiToggleRight className="text-blue-600" size={36} />
                    ) : (
                      <FiToggleLeft className="text-gray-400" size={36} />
                    )}
                  </button>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-start">
                    <FiPhone className="mr-3 text-green-500 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-xs text-gray-600">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        sms: !notificationSettings.sms,
                      })
                    }
                    className="relative"
                  >
                    {notificationSettings.sms ? (
                      <FiToggleRight className="text-blue-600" size={36} />
                    ) : (
                      <FiToggleLeft className="text-gray-400" size={36} />
                    )}
                  </button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-start">
                    <FiBell className="mr-3 text-purple-500 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-xs text-gray-600">Receive browser push notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        push: !notificationSettings.push,
                      })
                    }
                    className="relative"
                  >
                    {notificationSettings.push ? (
                      <FiToggleRight className="text-blue-600" size={36} />
                    ) : (
                      <FiToggleLeft className="text-gray-400" size={36} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
              <div className="space-y-4">
                {/* Appointment Reminders */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-start">
                    <FiCalendar className="mr-3 text-blue-500 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Appointment Reminders</h4>
                      <p className="text-xs text-gray-600">Get notified about upcoming appointments</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        types: {
                          ...notificationSettings.types,
                          appointmentReminders: !notificationSettings.types.appointmentReminders,
                        },
                      })
                    }
                    className="relative"
                  >
                    {notificationSettings.types.appointmentReminders ? (
                      <FiToggleRight className="text-blue-600" size={36} />
                    ) : (
                      <FiToggleLeft className="text-gray-400" size={36} />
                    )}
                  </button>
                </div>

                {/* Patient Updates */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-start">
                    <FiUser className="mr-3 text-green-500 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Patient Updates</h4>
                      <p className="text-xs text-gray-600">
                        Notifications when patients update their information
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        types: {
                          ...notificationSettings.types,
                          patientUpdates: !notificationSettings.types.patientUpdates,
                        },
                      })
                    }
                    className="relative"
                  >
                    {notificationSettings.types.patientUpdates ? (
                      <FiToggleRight className="text-blue-600" size={36} />
                    ) : (
                      <FiToggleLeft className="text-gray-400" size={36} />
                    )}
                  </button>
                </div>

                {/* System Updates */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-start">
                    <FiSettings className="mr-3 text-gray-500 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">System Updates</h4>
                      <p className="text-xs text-gray-600">Important system announcements and updates</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        types: {
                          ...notificationSettings.types,
                          systemUpdates: !notificationSettings.types.systemUpdates,
                        },
                      })
                    }
                    className="relative"
                  >
                    {notificationSettings.types.systemUpdates ? (
                      <FiToggleRight className="text-blue-600" size={36} />
                    ) : (
                      <FiToggleLeft className="text-gray-400" size={36} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSaveNotificationSettings}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSave className="mr-2" size={18} />
                Save Notification Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSettings;
import React, { useEffect, useState } from 'react';
import useAdminStore from '../../stores/adminStore';
import useAuthStore from '../../stores/authStore';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiLock,
  FiShield,
  FiKey,
  FiBell,
  FiSettings,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiEdit,
  FiX,
  FiCheckCircle,
} from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const AdminSettings = () => {
  const { user } = useAuthStore();
  const {
    isLoading,
    error,
    updateAdminProfile,
    changeAdminPassword,
    updateNotificationSettings,
    updateSystemSettings,
    getSettings,
    clearError,
    dashboardStats,
  } = useAdminStore();

  // Tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
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

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    types: {
      appointmentReminders: true,
      systemUpdates: true,
      newUserRegistrations: true,
      doctorRegistrations: true,
      criticalAlerts: true,
    },
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
  });

  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Helper: Convert date to YYYY-MM-DD format for date input
  const toDateInputValue = (date) => {
    return date ? new Date(date).toISOString().slice(0, 10) : '';
  };

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: toDateInputValue(user.dateOfBirth),
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

    // Load settings
    const settings = getSettings();
    setNotificationSettings(settings.notifications);
    setSystemSettings(settings.system);
  }, [user, getSettings]);

  // Helper: Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Helper: Clear success message after timeout
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
      errors.firstName = 'First name must not exceed 50 characters';
    }

    if (!profileData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (profileData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must not exceed 50 characters';
    }

    if (profileData.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(profileData.phone.replace(/[\s-()]/g, ''))) {
        errors.phone = 'Invalid phone number format';
      }
    }

    if (profileData.dateOfBirth) {
      const dob = new Date(profileData.dateOfBirth);
      if (dob > new Date()) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Profile save handler
  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setIsSavingProfile(true);
    const result = await updateAdminProfile(profileData);
    setIsSavingProfile(false);

    if (result.success) {
      setIsEditingProfile(false);
      showSuccessMessage('Profile updated successfully');
      setProfileErrors({});
    }
  };

  // Profile cancel handler
  const handleCancelProfileEdit = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
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
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword && passwordData.newPassword && passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password change handler
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsSavingPassword(true);
    const result = await changeAdminPassword(passwordData);
    setIsSavingPassword(false);

    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      showSuccessMessage(result.message || 'Password changed successfully');
    }
  };

  // Notification settings handler
  const handleSaveNotificationSettings = () => {
    updateNotificationSettings(notificationSettings);
    showSuccessMessage('Notification preferences saved');
  };

  // System settings handler
  const handleSaveSystemSettings = () => {
    updateSystemSettings(systemSettings);
    showSuccessMessage('System settings saved');
  };

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'system', label: 'System', icon: FiSettings },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile, security, and system preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-800 hover:text-red-900 ml-4"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Profile Information
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Update your personal information</p>
                </div>
                <div className="flex gap-2">
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FiEdit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelProfileEdit}
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSavingProfile ? (
                          <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      First Name <span className="text-red-500">*</span>
                    </label>
                    {isEditingProfile ? (
                      <div>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            profileErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {profileErrors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{profileErrors.firstName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.firstName || '-'}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    {isEditingProfile ? (
                      <div>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            profileErrors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {profileErrors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{profileErrors.lastName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.lastName || '-'}</p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-gray-900 font-medium">{user?.email || '-'}</p>
                    <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiPhone className="w-4 h-4" />
                      Phone
                    </label>
                    {isEditingProfile ? (
                      <div>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            profileErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {profileErrors.phone && (
                          <p className="text-red-500 text-xs mt-1">{profileErrors.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.phone || '-'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      Date of Birth
                    </label>
                    {isEditingProfile ? (
                      <div>
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            profileErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {profileErrors.dateOfBirth && (
                          <p className="text-red-500 text-xs mt-1">{profileErrors.dateOfBirth}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{formatDate(profileData.dateOfBirth)}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Gender
                    </label>
                    {isEditingProfile ? (
                      <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium capitalize">{profileData.gender || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.address.street}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: { ...profileData.address, street: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.address.street || '-'}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.address.city || '-'}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.address.state || '-'}</p>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.address.zipCode || '-'}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.address.country || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <FiLock className="w-5 h-5" />
                  Security Settings
                </h2>
                <p className="text-gray-600 text-sm mt-1">Manage your password and security preferences</p>
              </div>

              {/* Password Change Form */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiKey className="w-4 h-4" />
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiLock className="w-4 h-4" />
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-gray-500 text-xs mt-1">Must be at least 8 characters</p>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiLock className="w-4 h-4" />
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Change Password Button */}
                  <button
                    onClick={handleChangePassword}
                    disabled={isSavingPassword}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPassword ? (
                      <>
                        <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <FiLock className="w-4 h-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Created</p>
                    <p className="text-gray-900 font-medium">{formatDate(user?.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="text-gray-900 font-medium">{formatDate(user?.lastLogin)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    {user?.isActive === undefined ? (
                      <p className="text-gray-900 font-medium">-</p>
                    ) : (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          user?.isActive === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user?.isActive === true ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <FiBell className="w-5 h-5" />
                  Notification Preferences
                </h2>
                <p className="text-gray-600 text-sm mt-1">Choose how you want to receive notifications</p>
              </div>

              {/* Notification Toggles */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        email: !notificationSettings.email,
                      })
                    }
                    className="ml-4"
                  >
                    {notificationSettings.email ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        sms: !notificationSettings.sms,
                      })
                    }
                    className="ml-4"
                  >
                    {notificationSettings.sms ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        push: !notificationSettings.push,
                      })
                    }
                    className="ml-4"
                  >
                    {notificationSettings.push ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Notification Types */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="text-md font-medium text-gray-700 mb-4">Notification Types</h3>
                
                {/* Appointment Reminders */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-600">Notifications about upcoming appointments</p>
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
                    className="ml-4"
                  >
                    {notificationSettings.types.appointmentReminders ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* System Updates */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">System Updates</h4>
                    <p className="text-sm text-gray-600">Notifications about platform updates and maintenance</p>
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
                    className="ml-4"
                  >
                    {notificationSettings.types.systemUpdates ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* New User Registrations */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">New User Registrations</h4>
                    <p className="text-sm text-gray-600">Alerts when new patients register</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        types: {
                          ...notificationSettings.types,
                          newUserRegistrations: !notificationSettings.types.newUserRegistrations,
                        },
                      })
                    }
                    className="ml-4"
                  >
                    {notificationSettings.types.newUserRegistrations ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Doctor Registrations */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Doctor Registrations</h4>
                    <p className="text-sm text-gray-600">Alerts when new doctors join the platform</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        types: {
                          ...notificationSettings.types,
                          doctorRegistrations: !notificationSettings.types.doctorRegistrations,
                        },
                      })
                    }
                    className="ml-4"
                  >
                    {notificationSettings.types.doctorRegistrations ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Critical Alerts */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Critical Alerts</h4>
                    <p className="text-sm text-gray-600">Important system alerts and security notifications</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        types: {
                          ...notificationSettings.types,
                          criticalAlerts: !notificationSettings.types.criticalAlerts,
                        },
                      })
                    }
                    className="ml-4"
                  >
                    {notificationSettings.types.criticalAlerts ? (
                      <FiToggleRight className="w-10 h-10 text-red-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveNotificationSettings}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Save Notification Preferences
              </button>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <FiSettings className="w-5 h-5" />
                  System Configuration
                </h2>
                <p className="text-gray-600 text-sm mt-1">Manage system-wide settings (Admin only)</p>
                <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Changes affect all users
                </div>
              </div>

              {/* System Settings Toggles */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-600">Enable maintenance mode to prevent user access</p>
                    <p className="text-xs text-red-600 mt-1">⚠️ Users will see a maintenance page when enabled</p>
                  </div>
                  <button
                    onClick={() =>
                      setSystemSettings({
                        ...systemSettings,
                        maintenanceMode: !systemSettings.maintenanceMode,
                      })
                    }
                    className="ml-4"
                  >
                    {systemSettings.maintenanceMode ? (
                      <FiToggleRight className="w-10 h-10 text-red-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Allow New Registrations */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Allow New Registrations</h4>
                    <p className="text-sm text-gray-600">Allow new users to register on the platform</p>
                  </div>
                  <button
                    onClick={() =>
                      setSystemSettings({
                        ...systemSettings,
                        allowRegistration: !systemSettings.allowRegistration,
                      })
                    }
                    className="ml-4"
                  >
                    {systemSettings.allowRegistration ? (
                      <FiToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalUsers || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Doctors</p>
                    <p className="text-2xl font-bold text-green-600">{dashboardStats.doctorCount || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-purple-600">{dashboardStats.patientCount || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Application Version</p>
                    <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Database Status</p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSystemSettings}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Save System Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
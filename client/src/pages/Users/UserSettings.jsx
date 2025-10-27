import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePatientStore from '../../stores/patientStore';
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
  FiSave,
  FiEdit,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';
import { FaUserInjured } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const UserSettings = () => {
  const { user } = useAuthStore();
  const {
    isLoadingProfile,
    errorProfile,
    updateProfile,
    changePatientPassword,
    updateNotificationSettings,
    getSettings,
    clearProfileError,
  } = usePatientStore();

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
    bloodGroup: '',
    height: '',
    weight: '',
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

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    types: {
      appointmentReminders: true,
      healthUpdates: true,
      systemUpdates: true,
    },
  });

  // Success message state
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bloodGroup: user.bloodGroup || '',
        height: user.height || '',
        weight: user.weight || '',
        address: user.address || { street: '', city: '', state: '', zipCode: '', country: 'India' },
      });
    }

    const settings = getSettings();
    if (settings?.notifications) {
      setNotificationSettings(settings.notifications);
    }
  }, [user]);

  // Helper functions
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toDateInputValue = (date) => {
    if (!date) return '';
    // If already in YYYY-MM-DD format, return as-is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // If ISO string, extract first 10 characters
    if (typeof date === 'string' && date.includes('T')) {
      return date.substring(0, 10);
    }
    // Otherwise convert Date object to YYYY-MM-DD
    return new Date(date).toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Validation functions
  const validateProfileForm = () => {
    const errors = {};
    if (!profileData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!profileData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!profileData.phone?.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(profileData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Invalid phone format';
    }
    if (profileData.dateOfBirth && new Date(profileData.dateOfBirth) > new Date()) {
      errors.dateOfBirth = 'Date of birth cannot be in future';
    }
    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
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
    if (passwordData.currentPassword && passwordData.newPassword && passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    return errors;
  };

  // Save handlers
  const handleSaveProfile = async () => {
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    const result = await updateProfile(profileData);
    setIsSavingProfile(false);

    if (result.success) {
      setIsEditingProfile(false);
      setProfileErrors({});
      showSuccessMessage('Profile updated successfully');
    }
  };

  const handleCancelProfile = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bloodGroup: user.bloodGroup || '',
        height: user.height || '',
        weight: user.weight || '',
        address: user.address || { street: '', city: '', state: '', zipCode: '', country: 'India' },
      });
    }
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  const handleChangePassword = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSavingPassword(true);
    const result = await changePatientPassword(passwordData);
    setIsSavingPassword(false);

    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      showSuccessMessage(result.message || 'Password changed successfully');
    } else {
      setPasswordErrors({ currentPassword: result.error || 'Failed to change password' });
    }
  };

  const handleSaveNotificationSettings = () => {
    updateNotificationSettings(notificationSettings);
    showSuccessMessage('Notification preferences saved');
  };

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/app/user/dashboard" className="hover:text-purple-600">
              Home
            </Link>
            <span>/</span>
            <span>Settings</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <FiCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorProfile && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <span className="text-red-800">{errorProfile}</span>
              </div>
              <button
                onClick={clearProfileError}
                className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex flex-col sm:flex-row border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FiUser className="text-blue-600" />
                    Profile Information
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
                </div>
                <div className="flex gap-2">
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FiEdit size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelProfile}
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <FiX size={16} />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSavingProfile ? (
                          <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                        ) : (
                          <FiSave size={16} />
                        )}
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>

                {!isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">First Name</p>
                        <p className="font-medium text-gray-900">{user?.firstName || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Name</p>
                        <p className="font-medium text-gray-900">{user?.lastName || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{user?.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-medium text-gray-900">{formatDate(user?.dateOfBirth)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {user?.gender?.replace('_', ' ') || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Blood Group</p>
                        <p className="font-medium text-gray-900">{user?.bloodGroup || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Height</p>
                        <p className="font-medium text-gray-900">
                          {user?.height ? `${user.height} cm` : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-medium text-gray-900">
                          {user?.weight ? `${user.weight} kg` : 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">
                        {user?.address?.street && `${user.address.street}, `}
                        {user?.address?.city && `${user.address.city}, `}
                        {user?.address?.state && `${user.address.state} `}
                        {user?.address?.zipCode && `${user.address.zipCode}, `}
                        {user?.address?.country || 'Not set'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {profileErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {profileErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.lastName}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {profileErrors.phone && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={toDateInputValue(profileData.dateOfBirth)}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {profileErrors.dateOfBirth && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.dateOfBirth}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <select
                        value={profileData.bloodGroup}
                        onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={profileData.height}
                        onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={profileData.weight}
                        onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-3 mt-4">Address</h4>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
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
                      {profileErrors.addressStreet && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.addressStreet}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
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
                      {profileErrors.addressCity && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.addressCity}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
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
                      {profileErrors.addressState && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.addressState}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
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
                      {profileErrors.addressZipCode && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.addressZipCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
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
                      {profileErrors.addressCountry && (
                        <p className="text-red-600 text-sm mt-1">{profileErrors.addressCountry}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FiLock className="text-blue-600" />
                  Security Settings
                </h2>
                <p className="text-sm text-gray-600 mt-1">Manage your password and account security</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                    {passwordErrors.newPassword && (
                      <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isSavingPassword}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSavingPassword ? (
                      <>
                        <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                        Changing...
                      </>
                    ) : (
                      <>
                        <FiKey size={16} />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Created</p>
                    <p className="font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <div className="flex items-center gap-2">
                      <FaUserInjured className="text-purple-600" />
                      <span className="font-medium text-gray-900">Patient</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Verified</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user?.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FiBell className="text-blue-600" />
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-600 mt-1">Choose how you want to receive notifications</p>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    {/* Email Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationSettings({ ...notificationSettings, email: !notificationSettings.email })
                        }
                        className="relative"
                      >
                        {notificationSettings.email ? (
                          <FiToggleRight className="text-blue-600" size={48} />
                        ) : (
                          <FiToggleLeft className="text-gray-400" size={48} />
                        )}
                      </button>
                    </div>

                    {/* SMS Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationSettings({ ...notificationSettings, sms: !notificationSettings.sms })
                        }
                        className="relative"
                      >
                        {notificationSettings.sms ? (
                          <FiToggleRight className="text-blue-600" size={48} />
                        ) : (
                          <FiToggleLeft className="text-gray-400" size={48} />
                        )}
                      </button>
                    </div>

                    {/* Push Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-600">Receive browser push notifications</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationSettings({ ...notificationSettings, push: !notificationSettings.push })
                        }
                        className="relative"
                      >
                        {notificationSettings.push ? (
                          <FiToggleRight className="text-blue-600" size={48} />
                        ) : (
                          <FiToggleLeft className="text-gray-400" size={48} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
                  <div className="space-y-4">
                    {/* Appointment Reminders */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Appointment Reminders</p>
                        <p className="text-sm text-gray-600">Get notified about upcoming appointments (24h and 1h before)</p>
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
                          <FiToggleRight className="text-blue-600" size={48} />
                        ) : (
                          <FiToggleLeft className="text-gray-400" size={48} />
                        )}
                      </button>
                    </div>

                    {/* Health Updates */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Health Updates</p>
                        <p className="text-sm text-gray-600">Notifications about your medical records and prescriptions</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            types: {
                              ...notificationSettings.types,
                              healthUpdates: !notificationSettings.types.healthUpdates,
                            },
                          })
                        }
                        className="relative"
                      >
                        {notificationSettings.types.healthUpdates ? (
                          <FiToggleRight className="text-blue-600" size={48} />
                        ) : (
                          <FiToggleLeft className="text-gray-400" size={48} />
                        )}
                      </button>
                    </div>

                    {/* System Updates */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">System Updates</p>
                        <p className="text-sm text-gray-600">Important system announcements and updates</p>
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
                          <FiToggleRight className="text-blue-600" size={48} />
                        ) : (
                          <FiToggleLeft className="text-gray-400" size={48} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveNotificationSettings}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiSave size={16} />
                  Save Notification Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings
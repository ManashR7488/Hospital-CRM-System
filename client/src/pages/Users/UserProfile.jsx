import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import usePatientStore from '../../stores/patientStore';
import useAuthStore from '../../stores/authStore';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiEdit,
  FiSave,
  FiX,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  FaUserInjured,
  FaHeartbeat,
  FaNotesMedical,
  FaAllergies,
  FaPrescriptionBottleAlt,
  FaShieldAlt,
  FaUserMd,
} from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    profileData,
    isLoadingProfile,
    errorProfile,
    fetchProfile,
    updateProfile,
    addMedicalHistory,
    addAllergy,
    addMedication,
    clearProfileError,
  } = usePatientStore();

  // Edit mode states
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingEmergencyContact, setIsEditingEmergencyContact] = useState(false);
  const [isEditingInsurance, setIsEditingInsurance] = useState(false);

  // Form data states
  const [basicInfoData, setBasicInfoData] = useState({
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

  const [emergencyContactData, setEmergencyContactData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });

  const [insuranceData, setInsuranceData] = useState({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    validUntil: '',
  });

  const [newMedicalHistory, setNewMedicalHistory] = useState({
    condition: '',
    diagnosedDate: '',
    status: 'active',
    notes: '',
  });

  const [newAllergy, setNewAllergy] = useState({
    allergen: '',
    severity: 'mild',
    reaction: '',
    notes: '',
  });

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    prescribedDate: new Date().toISOString().split('T')[0],
  });

  // Validation states
  const [basicInfoErrors, setBasicInfoErrors] = useState({});
  const [emergencyContactErrors, setEmergencyContactErrors] = useState({});
  const [insuranceErrors, setInsuranceErrors] = useState({});
  const [medicalHistoryErrors, setMedicalHistoryErrors] = useState({});
  const [allergyErrors, setAllergyErrors] = useState({});
  const [medicationErrors, setMedicationErrors] = useState({});

  // Loading states
  const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);
  const [isSavingEmergencyContact, setIsSavingEmergencyContact] = useState(false);
  const [isSavingInsurance, setIsSavingInsurance] = useState(false);
  const [isAddingMedicalHistory, setIsAddingMedicalHistory] = useState(false);
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);

  // Success message state
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize data
  useEffect(() => {
    fetchProfile();
  }, []);

  // Populate form data when profile loads
  useEffect(() => {
    if (profileData) {
      setBasicInfoData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        bloodGroup: profileData.bloodGroup || '',
        height: profileData.height || '',
        weight: profileData.weight || '',
        address: {
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          zipCode: profileData.address?.zipCode || '',
          country: profileData.address?.country || 'India',
        },
      });

      setEmergencyContactData({
        name: profileData.emergencyContact?.name || '',
        relationship: profileData.emergencyContact?.relationship || '',
        phone: profileData.emergencyContact?.phone || '',
        email: profileData.emergencyContact?.email || '',
      });

      setInsuranceData({
        provider: profileData.insuranceInfo?.provider || '',
        policyNumber: profileData.insuranceInfo?.policyNumber || '',
        groupNumber: profileData.insuranceInfo?.groupNumber || '',
        validUntil: profileData.insuranceInfo?.validUntil || '',
      });
    }
  }, [profileData]);

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    return { value: bmi.toFixed(1), category };
  };

  const formatBloodGroup = (bloodGroup) => {
    if (!bloodGroup) return { text: 'Not set', color: 'text-gray-400' };
    const criticalTypes = ['O-', 'AB+'];
    const isCritical = criticalTypes.includes(bloodGroup);
    return {
      text: bloodGroup,
      color: isCritical ? 'text-red-600' : 'text-blue-600',
    };
  };

  const getSeverityColor = (severity) => {
    const colors = {
      mild: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      moderate: 'bg-orange-100 text-orange-800 border-orange-300',
      severe: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[severity] || colors.mild;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      resolved: 'bg-gray-100 text-gray-800',
      chronic: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || colors.active;
  };

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

  // Validation Functions
  const validateBasicInfo = () => {
    const errors = {};
    if (!basicInfoData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!basicInfoData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!basicInfoData.phone?.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(basicInfoData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Invalid phone format';
    }
    if (basicInfoData.dateOfBirth && new Date(basicInfoData.dateOfBirth) > new Date()) {
      errors.dateOfBirth = 'Date of birth cannot be in future';
    }
    if (basicInfoData.height && (basicInfoData.height < 30 || basicInfoData.height > 300)) {
      errors.height = 'Height must be between 30-300 cm';
    }
    if (basicInfoData.weight && (basicInfoData.weight < 1 || basicInfoData.weight > 500)) {
      errors.weight = 'Weight must be between 1-500 kg';
    }
    return errors;
  };

  const validateEmergencyContact = () => {
    const errors = {};
    if (!emergencyContactData.name?.trim()) errors.name = 'Name is required';
    if (!emergencyContactData.relationship?.trim()) errors.relationship = 'Relationship is required';
    if (!emergencyContactData.phone?.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(emergencyContactData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Invalid phone format';
    }
    if (emergencyContactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emergencyContactData.email)) {
      errors.email = 'Invalid email format';
    }
    return errors;
  };

  const validateInsurance = () => {
    const errors = {};
    if (insuranceData.policyNumber && !insuranceData.provider) {
      errors.provider = 'Provider is required when policy number is provided';
    }
    if (insuranceData.validUntil && new Date(insuranceData.validUntil) < new Date()) {
      errors.validUntil = 'Valid until date must be in future';
    }
    return errors;
  };

  const validateMedicalHistory = () => {
    const errors = {};
    if (!newMedicalHistory.condition?.trim()) errors.condition = 'Condition is required';
    if (newMedicalHistory.diagnosedDate && new Date(newMedicalHistory.diagnosedDate) > new Date()) {
      errors.diagnosedDate = 'Diagnosed date cannot be in future';
    }
    return errors;
  };

  const validateAllergy = () => {
    const errors = {};
    if (!newAllergy.allergen?.trim()) errors.allergen = 'Allergen is required';
    return errors;
  };

  const validateMedication = () => {
    const errors = {};
    if (!newMedication.name?.trim()) errors.name = 'Medication name is required';
    if (!newMedication.dosage?.trim()) errors.dosage = 'Dosage is required';
    if (!newMedication.frequency?.trim()) errors.frequency = 'Frequency is required';
    if (newMedication.prescribedDate && new Date(newMedication.prescribedDate) > new Date()) {
      errors.prescribedDate = 'Prescribed date cannot be in future';
    }
    return errors;
  };

  // Save Handlers
  const handleSaveBasicInfo = async () => {
    const errors = validateBasicInfo();
    if (Object.keys(errors).length > 0) {
      setBasicInfoErrors(errors);
      return;
    }

    setIsSavingBasicInfo(true);
    const result = await updateProfile(basicInfoData);
    setIsSavingBasicInfo(false);

    if (result.success) {
      setIsEditingBasicInfo(false);
      setBasicInfoErrors({});
      showSuccessMessage('Profile updated successfully');
    }
  };

  const handleCancelBasicInfo = () => {
    if (profileData) {
      setBasicInfoData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        bloodGroup: profileData.bloodGroup || '',
        height: profileData.height || '',
        weight: profileData.weight || '',
        address: profileData.address || { street: '', city: '', state: '', zipCode: '', country: 'India' },
      });
    }
    setBasicInfoErrors({});
    setIsEditingBasicInfo(false);
  };

  const handleSaveEmergencyContact = async () => {
    const errors = validateEmergencyContact();
    if (Object.keys(errors).length > 0) {
      setEmergencyContactErrors(errors);
      return;
    }

    setIsSavingEmergencyContact(true);
    const result = await updateProfile({ emergencyContact: emergencyContactData });
    setIsSavingEmergencyContact(false);

    if (result.success) {
      setIsEditingEmergencyContact(false);
      setEmergencyContactErrors({});
      showSuccessMessage('Emergency contact updated successfully');
    }
  };

  const handleCancelEmergencyContact = () => {
    if (profileData?.emergencyContact) {
      setEmergencyContactData(profileData.emergencyContact);
    }
    setEmergencyContactErrors({});
    setIsEditingEmergencyContact(false);
  };

  const handleSaveInsurance = async () => {
    const errors = validateInsurance();
    if (Object.keys(errors).length > 0) {
      setInsuranceErrors(errors);
      return;
    }

    setIsSavingInsurance(true);
    const result = await updateProfile({ insuranceInfo: insuranceData });
    setIsSavingInsurance(false);

    if (result.success) {
      setIsEditingInsurance(false);
      setInsuranceErrors({});
      showSuccessMessage('Insurance information updated successfully');
    }
  };

  const handleCancelInsurance = () => {
    if (profileData?.insuranceInfo) {
      setInsuranceData(profileData.insuranceInfo);
    }
    setInsuranceErrors({});
    setIsEditingInsurance(false);
  };

  const handleAddMedicalHistory = async () => {
    const errors = validateMedicalHistory();
    if (Object.keys(errors).length > 0) {
      setMedicalHistoryErrors(errors);
      return;
    }

    setIsAddingMedicalHistory(true);
    const result = await addMedicalHistory(newMedicalHistory);
    setIsAddingMedicalHistory(false);

    if (result.success) {
      setNewMedicalHistory({ condition: '', diagnosedDate: '', status: 'active', notes: '' });
      setMedicalHistoryErrors({});
      showSuccessMessage('Medical history added successfully');
    }
  };

  const handleAddAllergy = async () => {
    const errors = validateAllergy();
    if (Object.keys(errors).length > 0) {
      setAllergyErrors(errors);
      return;
    }

    setIsAddingAllergy(true);
    const result = await addAllergy(newAllergy);
    setIsAddingAllergy(false);

    if (result.success) {
      setNewAllergy({ allergen: '', severity: 'mild', reaction: '', notes: '' });
      setAllergyErrors({});
      showSuccessMessage('Allergy added successfully');
    }
  };

  const handleAddMedication = async () => {
    const errors = validateMedication();
    if (Object.keys(errors).length > 0) {
      setMedicationErrors(errors);
      return;
    }

    setIsAddingMedication(true);
    const result = await addMedication(newMedication);
    setIsAddingMedication(false);

    if (result.success) {
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        prescribedDate: new Date().toISOString().split('T')[0],
      });
      setMedicationErrors({});
      showSuccessMessage('Medication added successfully');
    }
  };

  // Loading State
  if (isLoadingProfile && !profileData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Skeleton Header */}
          <div className="mb-6 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/app/user/dashboard" className="hover:text-purple-600">
              Home
            </Link>
            <span>/</span>
            <span>Profile</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal and medical information</p>
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
              <div className="flex gap-2">
                <button
                  onClick={fetchProfile}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
                <button
                  onClick={clearProfileError}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <FiUser className="text-blue-600" />
                  Personal Information
                </h2>
                <div className="flex gap-2">
                  {!isEditingBasicInfo ? (
                    <button
                      onClick={() => setIsEditingBasicInfo(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FiEdit size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelBasicInfo}
                        disabled={isSavingBasicInfo}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <FiX size={16} />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveBasicInfo}
                        disabled={isSavingBasicInfo}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSavingBasicInfo ? (
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

              {!isEditingBasicInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                      <FaUserInjured className="text-purple-600 text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {profileData?.firstName} {profileData?.lastName}
                      </h3>
                      <p className="text-gray-600">{profileData?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiPhone size={16} />
                        Phone
                      </p>
                      <p className="font-medium text-gray-900">{profileData?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiCalendar size={16} />
                        Date of Birth
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(profileData?.dateOfBirth)} ({calculateAge(profileData?.dateOfBirth)} years)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {profileData?.gender?.replace('_', ' ') || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className={`font-bold ${formatBloodGroup(profileData?.bloodGroup)?.color}`}>
                        {formatBloodGroup(profileData?.bloodGroup)?.text}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="font-medium text-gray-900">
                        {profileData?.height ? `${profileData.height} cm` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-medium text-gray-900">
                        {profileData?.weight ? `${profileData.weight} kg` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">BMI</p>
                      <p className="font-medium text-gray-900">
                        {(() => {
                          const bmiData = calculateBMI(profileData?.height, profileData?.weight);
                          if (!bmiData) return 'Not set';
                          return `${bmiData.value} (${bmiData.category})`;
                        })()}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiMapPin size={16} />
                        Address
                      </p>
                      <p className="font-medium text-gray-900">
                        {profileData?.address?.street && `${profileData.address.street}, `}
                        {profileData?.address?.city && `${profileData.address.city}, `}
                        {profileData?.address?.state && `${profileData.address.state} `}
                        {profileData?.address?.zipCode && `${profileData.address.zipCode}, `}
                        {profileData?.address?.country || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={basicInfoData.firstName}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {basicInfoErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{basicInfoErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={basicInfoData.lastName}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {basicInfoErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{basicInfoErrors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={basicInfoData.phone}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {basicInfoErrors.phone && (
                        <p className="text-red-600 text-sm mt-1">{basicInfoErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={toDateInputValue(basicInfoData.dateOfBirth)}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, dateOfBirth: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {basicInfoErrors.dateOfBirth && (
                        <p className="text-red-600 text-sm mt-1">{basicInfoErrors.dateOfBirth}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={basicInfoData.gender}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, gender: e.target.value })}
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
                        value={basicInfoData.bloodGroup}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, bloodGroup: e.target.value })}
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
                        value={basicInfoData.height}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, height: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={basicInfoData.weight}
                        onChange={(e) => setBasicInfoData({ ...basicInfoData, weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={basicInfoData.address.street}
                        onChange={(e) =>
                          setBasicInfoData({ ...basicInfoData, address: { ...basicInfoData.address, street: e.target.value } })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={basicInfoData.address.city}
                        onChange={(e) =>
                          setBasicInfoData({ ...basicInfoData, address: { ...basicInfoData.address, city: e.target.value } })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={basicInfoData.address.state}
                        onChange={(e) =>
                          setBasicInfoData({ ...basicInfoData, address: { ...basicInfoData.address, state: e.target.value } })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={basicInfoData.address.zipCode}
                        onChange={(e) =>
                          setBasicInfoData({ ...basicInfoData, address: { ...basicInfoData.address, zipCode: e.target.value } })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={basicInfoData.address.country}
                        onChange={(e) =>
                          setBasicInfoData({ ...basicInfoData, address: { ...basicInfoData.address, country: e.target.value } })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <FaShieldAlt className="text-red-600" />
                  Emergency Contact
                </h2>
                <div className="flex gap-2">
                  {!isEditingEmergencyContact ? (
                    <button
                      onClick={() => setIsEditingEmergencyContact(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FiEdit size={16} />
                      <span className="hidden sm:inline">
                        {profileData?.emergencyContact ? 'Edit' : 'Add'}
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelEmergencyContact}
                        disabled={isSavingEmergencyContact}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <FiX size={16} />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveEmergencyContact}
                        disabled={isSavingEmergencyContact}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSavingEmergencyContact ? (
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

              {!isEditingEmergencyContact ? (
                profileData?.emergencyContact ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{profileData.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Relationship</p>
                      <p className="font-medium text-gray-900">{profileData.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiPhone size={16} />
                        Phone
                      </p>
                      <p className="font-medium text-gray-900">{profileData.emergencyContact.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiMail size={16} />
                        Email
                      </p>
                      <p className="font-medium text-gray-900">{profileData.emergencyContact.email || 'Not set'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No emergency contact added</p>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactData.name}
                      onChange={(e) => setEmergencyContactData({ ...emergencyContactData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {emergencyContactErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{emergencyContactErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactData.relationship}
                      onChange={(e) => setEmergencyContactData({ ...emergencyContactData, relationship: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {emergencyContactErrors.relationship && (
                      <p className="text-red-600 text-sm mt-1">{emergencyContactErrors.relationship}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactData.phone}
                      onChange={(e) => setEmergencyContactData({ ...emergencyContactData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {emergencyContactErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">{emergencyContactErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={emergencyContactData.email}
                      onChange={(e) => setEmergencyContactData({ ...emergencyContactData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {emergencyContactErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{emergencyContactErrors.email}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Insurance Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <FaShieldAlt className="text-green-600" />
                  Insurance Information
                </h2>
                <div className="flex gap-2">
                  {!isEditingInsurance ? (
                    <button
                      onClick={() => setIsEditingInsurance(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FiEdit size={16} />
                      <span className="hidden sm:inline">
                        {profileData?.insuranceInfo ? 'Edit' : 'Add'}
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelInsurance}
                        disabled={isSavingInsurance}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <FiX size={16} />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveInsurance}
                        disabled={isSavingInsurance}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSavingInsurance ? (
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

              {!isEditingInsurance ? (
                profileData?.insuranceInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Provider</p>
                        <p className="font-medium text-gray-900">{profileData.insuranceInfo.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Policy Number</p>
                        <p className="font-medium text-gray-900">{profileData.insuranceInfo.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Group Number</p>
                        <p className="font-medium text-gray-900">{profileData.insuranceInfo.groupNumber || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valid Until</p>
                        <p className="font-medium text-gray-900">{formatDate(profileData.insuranceInfo.validUntil)}</p>
                      </div>
                    </div>
                    {profileData.insuranceInfo.validUntil &&
                      new Date(profileData.insuranceInfo.validUntil) < new Date() && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                          <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                          <p className="text-yellow-800 text-sm">Insurance has expired. Please update your information.</p>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No insurance information added</p>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={insuranceData.provider}
                      onChange={(e) => setInsuranceData({ ...insuranceData, provider: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {insuranceErrors.provider && (
                      <p className="text-red-600 text-sm mt-1">{insuranceErrors.provider}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={insuranceData.policyNumber}
                      onChange={(e) => setInsuranceData({ ...insuranceData, policyNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {insuranceErrors.policyNumber && (
                      <p className="text-red-600 text-sm mt-1">{insuranceErrors.policyNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
                    <input
                      type="text"
                      value={insuranceData.groupNumber}
                      onChange={(e) => setInsuranceData({ ...insuranceData, groupNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={toDateInputValue(insuranceData.validUntil)}
                      onChange={(e) => setInsuranceData({ ...insuranceData, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {insuranceErrors.validUntil && (
                      <p className="text-red-600 text-sm mt-1">{insuranceErrors.validUntil}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Medical History Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FaNotesMedical className="text-blue-600" />
                Medical History
              </h2>

              {profileData?.medicalHistory && profileData.medicalHistory.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {profileData.medicalHistory.map((history, index) => (
                    <div key={history._id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-blue-900">{history.condition}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Diagnosed: {formatDate(history.diagnosedDate)}
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              history.status
                            )}`}
                          >
                            {history.status?.charAt(0).toUpperCase() + history.status?.slice(1)}
                          </span>
                          {history.notes && <p className="text-gray-600 mt-2 text-sm">{history.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4 mb-6">No medical history recorded</p>
              )}

              {/* Add Medical History Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiPlus className="text-blue-600" />
                  Add Medical History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Diabetes Type 2"
                      value={newMedicalHistory.condition}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, condition: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {medicalHistoryErrors.condition && (
                      <p className="text-red-600 text-sm mt-1">{medicalHistoryErrors.condition}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosed Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={toDateInputValue(newMedicalHistory.diagnosedDate)}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, diagnosedDate: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {medicalHistoryErrors.diagnosedDate && (
                      <p className="text-red-600 text-sm mt-1">{medicalHistoryErrors.diagnosedDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newMedicalHistory.status}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="chronic">Chronic</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      placeholder="Additional details..."
                      value={newMedicalHistory.notes}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddMedicalHistory}
                  disabled={isAddingMedicalHistory}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isAddingMedicalHistory ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Add Medical History
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Allergies Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FaAllergies className="text-red-600" />
                Allergies
              </h2>

              {profileData?.allergies && profileData.allergies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {profileData.allergies.map((allergy, index) => (
                    <div key={allergy._id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-red-900">{allergy.allergen}</h4>
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                              allergy.severity
                            )}`}
                          >
                            {allergy.severity?.charAt(0).toUpperCase() + allergy.severity?.slice(1)}
                          </span>
                          {allergy.reaction && (
                            <p className="text-gray-700 mt-2 text-sm">
                              <span className="font-medium">Reaction:</span> {allergy.reaction}
                            </p>
                          )}
                          {allergy.notes && <p className="text-gray-600 mt-1 text-sm">{allergy.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4 mb-6">No allergies recorded</p>
              )}

              {/* Add Allergy Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiPlus className="text-red-600" />
                  Add Allergy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Penicillin"
                      value={newAllergy.allergen}
                      onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {allergyErrors.allergen && (
                      <p className="text-red-600 text-sm mt-1">{allergyErrors.allergen}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select
                      value={newAllergy.severity}
                      onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reaction</label>
                    <input
                      type="text"
                      placeholder="e.g., Rash, swelling"
                      value={newAllergy.reaction}
                      onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      placeholder="Additional details..."
                      value={newAllergy.notes}
                      onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddAllergy}
                  disabled={isAddingAllergy}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isAddingAllergy ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Add Allergy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Current Medications Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FaPrescriptionBottleAlt className="text-purple-600" />
                Current Medications
              </h2>

              {profileData?.currentMedications && profileData.currentMedications.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {profileData.currentMedications.map((medication, index) => (
                    <div key={medication._id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-purple-900">{medication.name}</h4>
                          <p className="text-gray-700 mt-1">
                            <span className="font-medium">Dosage:</span> {medication.dosage} • <span className="font-medium">Frequency:</span> {medication.frequency}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Prescribed: {formatDate(medication.prescribedDate)}
                            {medication.prescribedBy && ` by ${medication.prescribedBy}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4 mb-6">No current medications</p>
              )}

              {/* Add Medication Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiPlus className="text-purple-600" />
                  Add Medication
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Metformin"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {medicationErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{medicationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 500mg"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {medicationErrors.dosage && (
                      <p className="text-red-600 text-sm mt-1">{medicationErrors.dosage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Twice daily"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {medicationErrors.frequency && (
                      <p className="text-red-600 text-sm mt-1">{medicationErrors.frequency}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed Date</label>
                    <input
                      type="date"
                      value={toDateInputValue(newMedication.prescribedDate)}
                      onChange={(e) => setNewMedication({ ...newMedication, prescribedDate: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddMedication}
                  disabled={isAddingMedication}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isAddingMedication ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Add Medication
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats & Doctor */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-blue-600" />
                Quick Stats
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaNotesMedical className="text-blue-600" size={24} />
                    <span className="font-medium text-gray-900">Medical Conditions</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {profileData?.medicalHistory?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaAllergies className="text-red-600" size={24} />
                    <span className="font-medium text-gray-900">Allergies</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {profileData?.allergies?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaPrescriptionBottleAlt className="text-purple-600" size={24} />
                    <span className="font-medium text-gray-900">Medications</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {profileData?.currentMedications?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Doctor Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FaUserMd className="text-green-600" />
                Assigned Doctor
              </h2>

              {profileData?.assignedDoctor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <FaUserMd className="text-green-600 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {profileData.assignedDoctor.firstName} {profileData.assignedDoctor.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{profileData.assignedDoctor.specialization?.join(', ')}</p>
                      <p className="text-xs text-gray-500">{profileData.assignedDoctor.department}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMail size={16} />
                      <span>{profileData.assignedDoctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiPhone size={16} />
                      <span>{profileData.assignedDoctor.phone || 'Not available'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/app/user/appointments')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCalendar size={16} />
                    Book Appointment
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-4">No doctor assigned yet</p>
                  <button
                    onClick={() => navigate('/app/user/appointments')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find a Doctor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile
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
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiActivity,
  FiPlus,
  FiMinus,
  FiHeart,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  FaUserInjured,
  FaHeartbeat,
  FaPrescriptionBottleAlt,
  FaAllergies,
  FaNotesMedical,
  FaUserMd,
} from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ManagePatientsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    currentPatient,
    isLoading,
    error,
    fetchPatientById,
    updatePatient,
    deletePatient,
  } = useDoctorStore();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // New medical data state
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
    prescribedDate: new Date().toISOString().slice(0, 10),
  });

  // Fetch patient on mount
  useEffect(() => {
    if (id) {
      fetchPatientById(id);
    }
  }, [id]);

  // Initialize edited data when entering edit mode
  useEffect(() => {
    if (isEditing && currentPatient) {
      setEditedData({
        ...currentPatient,
        medicalHistory: currentPatient.medicalHistory || [],
        allergies: currentPatient.allergies || [],
        currentMedications: currentPatient.currentMedications || [],
      });
    }
  }, [isEditing, currentPatient]);

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getBloodGroupColor = (bloodGroup) => {
    const criticalTypes = ['O-', 'AB-', 'B-', 'A-'];
    return criticalTypes.includes(bloodGroup) ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      mild: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800',
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

  // Validation
  const validatePatientEditForm = () => {
    const errors = {};

    if (!editedData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!editedData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!editedData.phone?.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(editedData.phone.replace(/[\s-()]/g, ''))) {
      errors.phone = 'Invalid phone format';
    }

    if (editedData.height && (editedData.height < 30 || editedData.height > 300)) {
      errors.height = 'Height must be between 30 and 300 cm';
    }

    if (editedData.weight && (editedData.weight < 1 || editedData.weight > 500)) {
      errors.weight = 'Weight must be between 1 and 500 kg';
    }

    // Validate medical history
    editedData.medicalHistory?.forEach((history, index) => {
      if (!history.condition?.trim()) {
        errors[`medicalHistory_${index}`] = 'Condition is required';
      }
    });

    // Validate allergies
    editedData.allergies?.forEach((allergy, index) => {
      if (!allergy.allergen?.trim()) {
        errors[`allergy_${index}`] = 'Allergen is required';
      }
    });

    // Validate medications
    editedData.currentMedications?.forEach((med, index) => {
      if (!med.name?.trim() || !med.dosage?.trim() || !med.frequency?.trim()) {
        errors[`medication_${index}`] = 'Name, dosage, and frequency are required';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleSaveChanges = async () => {
    if (!validatePatientEditForm()) {
      return;
    }

    const result = await updatePatient(id, editedData);

    if (result.success) {
      setIsEditing(false);
      setFormErrors({});
      fetchPatientById(id); // Refresh data
    }
  };

  const handleCancelEdit = () => {
    setEditedData(null);
    setFormErrors({});
    setIsEditing(false);
  };

  const handleDeletePatient = async () => {
    const result = await deletePatient(id);

    if (result.success) {
      navigate('/app/doctor/patients');
    }
  };

  // Medical History Handlers
  const handleAddMedicalHistory = () => {
    if (!newMedicalHistory.condition.trim()) {
      setFormErrors({ ...formErrors, newMedicalHistory: 'Condition is required' });
      return;
    }

    setEditedData({
      ...editedData,
      medicalHistory: [
        ...(editedData.medicalHistory || []),
        { ...newMedicalHistory, _id: Date.now().toString() },
      ],
    });

    setNewMedicalHistory({
      condition: '',
      diagnosedDate: '',
      status: 'active',
      notes: '',
    });
    
    const { newMedicalHistory: _, ...rest } = formErrors;
    setFormErrors(rest);
  };

  const handleRemoveMedicalHistory = (index) => {
    setEditedData({
      ...editedData,
      medicalHistory: editedData.medicalHistory.filter((_, i) => i !== index),
    });
  };

  // Allergy Handlers
  const handleAddAllergy = () => {
    if (!newAllergy.allergen.trim()) {
      setFormErrors({ ...formErrors, newAllergy: 'Allergen is required' });
      return;
    }

    setEditedData({
      ...editedData,
      allergies: [
        ...(editedData.allergies || []),
        { ...newAllergy, _id: Date.now().toString() },
      ],
    });

    setNewAllergy({
      allergen: '',
      severity: 'mild',
      reaction: '',
      notes: '',
    });
    
    const { newAllergy: _, ...rest } = formErrors;
    setFormErrors(rest);
  };

  const handleRemoveAllergy = (index) => {
    setEditedData({
      ...editedData,
      allergies: editedData.allergies.filter((_, i) => i !== index),
    });
  };

  // Medication Handlers
  const handleAddMedication = () => {
    if (!newMedication.name.trim() || !newMedication.dosage.trim() || !newMedication.frequency.trim()) {
      setFormErrors({ ...formErrors, newMedication: 'Name, dosage, and frequency are required' });
      return;
    }

    setEditedData({
      ...editedData,
      currentMedications: [
        ...(editedData.currentMedications || []),
        { ...newMedication, _id: Date.now().toString() },
      ],
    });

    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      prescribedDate: new Date().toISOString().slice(0, 10),
    });
    
    const { newMedication: _, ...rest } = formErrors;
    setFormErrors(rest);
  };

  const handleRemoveMedication = (index) => {
    setEditedData({
      ...editedData,
      currentMedications: editedData.currentMedications.filter((_, i) => i !== index),
    });
  };

  // Loading state
  if (isLoading) {
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
  if (error) {
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
                onClick={() => navigate('/app/doctor/patients')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiArrowLeft className="inline mr-2" />
                Back to Patients
              </button>
              <button
                onClick={() => fetchPatientById(id)}
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

  // Patient not found
  if (!currentPatient) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
              <p className="text-sm text-yellow-700">Patient not found or not assigned to you</p>
            </div>
            <button
              onClick={() => navigate('/app/doctor/patients')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <FiArrowLeft className="inline mr-2" />
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  const patient = isEditing ? editedData : currentPatient;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/doctor/patients')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <FiArrowLeft />
          Back to Patients
        </button>

        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              <Link to="/app/doctor" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/app/doctor/patients" className="hover:text-blue-600">Manage Patients</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Patient Details</span>
            </nav>
            <h1 className="text-3xl font-bold text-blue-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {patient.isActive !== undefined && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
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
        {/* Left Column - Main Patient Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {patient.firstName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h2>
                {patient.isActive !== undefined && (
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{patient.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={patient.phone || ''}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        className={`px-2 py-1 border rounded ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{patient.phone || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : ''}
                        onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiUser className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    {isEditing ? (
                      <select
                        value={patient.gender || ''}
                        onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="font-medium text-gray-900 capitalize">{patient.gender || '-'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaHeartbeat className="text-red-400" />
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    {isEditing ? (
                      <select
                        value={patient.bloodGroup || ''}
                        onChange={(e) => setEditedData({ ...editedData, bloodGroup: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                        {patient.bloodGroup || '-'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiActivity className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Height & Weight</p>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={patient.height || ''}
                          onChange={(e) => setEditedData({ ...editedData, height: e.target.value })}
                          className={`w-20 px-2 py-1 border rounded ${
                            formErrors.height ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="cm"
                        />
                        <input
                          type="number"
                          value={patient.weight || ''}
                          onChange={(e) => setEditedData({ ...editedData, weight: e.target.value })}
                          className={`w-20 px-2 py-1 border rounded ${
                            formErrors.weight ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="kg"
                        />
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900">
                        {patient.height ? `${patient.height} cm` : '-'} / {patient.weight ? `${patient.weight} kg` : '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {(patient.address?.street || patient.address?.city || isEditing) && (
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FiMapPin />
                  Address
                </h3>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Street</label>
                      <input
                        type="text"
                        value={patient.address?.street || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: { ...(editedData.address || {}), street: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        value={patient.address?.city || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: { ...(editedData.address || {}), city: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">State</label>
                      <input
                        type="text"
                        value={patient.address?.state || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: { ...(editedData.address || {}), state: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={patient.address?.zipCode || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: { ...(editedData.address || {}), zipCode: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Country</label>
                      <input
                        type="text"
                        value={patient.address?.country || 'India'}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: { ...(editedData.address || {}), country: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">
                    {[
                      patient.address?.street,
                      patient.address?.city,
                      patient.address?.state,
                      patient.address?.zipCode,
                      patient.address?.country,
                    ]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Medical History Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FaNotesMedical className="text-blue-600" />
              Medical History
            </h3>

            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="space-y-3">
                {patient.medicalHistory.map((history, index) => (
                  <div key={history._id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-blue-900">{history.condition}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Diagnosed: {formatDate(history.diagnosedDate)}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)}`}>
                          {history.status?.charAt(0).toUpperCase() + history.status?.slice(1)}
                        </span>
                        {history.notes && (
                          <p className="text-gray-600 mt-2 text-sm">{history.notes}</p>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveMedicalHistory(index)}
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No medical history recorded</p>
            )}

            {/* Add Medical History Form */}
            {isEditing && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Add Medical History</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Condition *"
                      value={newMedicalHistory.condition}
                      onChange={(e) =>
                        setNewMedicalHistory({ ...newMedicalHistory, condition: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <input
                    type="date"
                    value={newMedicalHistory.diagnosedDate}
                    onChange={(e) =>
                      setNewMedicalHistory({ ...newMedicalHistory, diagnosedDate: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded"
                    placeholder="Diagnosed Date"
                  />
                  <select
                    value={newMedicalHistory.status}
                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="chronic">Chronic</option>
                  </select>
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Notes"
                      value={newMedicalHistory.notes}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      rows="2"
                    />
                  </div>
                </div>
                {formErrors.newMedicalHistory && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.newMedicalHistory}</p>
                )}
                <button
                  onClick={handleAddMedicalHistory}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiPlus />
                  Add Medical History
                </button>
              </div>
            )}
          </div>

          {/* Allergies Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FaAllergies className="text-red-600" />
              Allergies
            </h3>

            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.allergies.map((allergy, index) => (
                  <div key={allergy._id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-red-900">{allergy.allergen}</h4>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(allergy.severity)}`}>
                          {allergy.severity?.charAt(0).toUpperCase() + allergy.severity?.slice(1)}
                        </span>
                        {allergy.reaction && (
                          <p className="text-gray-700 mt-2 text-sm">Reaction: {allergy.reaction}</p>
                        )}
                        {allergy.notes && (
                          <p className="text-gray-600 mt-1 text-sm">{allergy.notes}</p>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveAllergy(index)}
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No allergies recorded</p>
            )}

            {/* Add Allergy Form */}
            {isEditing && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Add Allergy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Allergen *"
                      value={newAllergy.allergen}
                      onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <select
                    value={newAllergy.severity}
                    onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Reaction"
                    value={newAllergy.reaction}
                    onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Notes"
                      value={newAllergy.notes}
                      onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      rows="2"
                    />
                  </div>
                </div>
                {formErrors.newAllergy && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.newAllergy}</p>
                )}
                <button
                  onClick={handleAddAllergy}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiPlus />
                  Add Allergy
                </button>
              </div>
            )}
          </div>

          {/* Current Medications Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FaPrescriptionBottleAlt className="text-purple-600" />
              Current Medications
            </h3>

            {patient.currentMedications && patient.currentMedications.length > 0 ? (
              <div className="space-y-3">
                {patient.currentMedications.map((med, index) => (
                  <div key={med._id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-blue-900">{med.name}</h4>
                        <p className="text-gray-700 mt-1">
                          {med.dosage} - {med.frequency}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Prescribed: {formatDate(med.prescribedDate)}
                        </p>
                        {med.prescribedBy && (
                          <p className="text-sm text-gray-600">By: Dr. {med.prescribedBy}</p>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No current medications</p>
            )}

            {/* Add Medication Form */}
            {isEditing && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Add Medication</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Medication Name *"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Dosage * (e.g., 500mg)"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Frequency * (e.g., Twice daily)"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="date"
                    value={newMedication.prescribedDate}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, prescribedDate: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                {formErrors.newMedication && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.newMedication}</p>
                )}
                <button
                  onClick={handleAddMedication}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiPlus />
                  Add Medication
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    {patient.appointments?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaNotesMedical className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {patient.medicalHistory?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Medical History</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaAllergies className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">{patient.allergies?.length || 0}</p>
                  <p className="text-sm text-gray-600">Allergies</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaPrescriptionBottleAlt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">
                    {patient.currentMedications?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Current Medications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Doctor Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FaUserMd />
              Assigned Doctor
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {patient.assignedDoctor?.firstName?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Dr. {patient.assignedDoctor?.firstName} {patient.assignedDoctor?.lastName}
                </p>
                {patient.assignedDoctor?.specialization && (
                  <p className="text-sm text-gray-600">{patient.assignedDoctor.specialization}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete ${currentPatient?.firstName} ${currentPatient?.lastName}? This will remove the patient from your assigned list and all associated data. This action cannot be undone.`}
        variant="danger"
      />
    </div>
  );
};

export default ManagePatientsDetail;
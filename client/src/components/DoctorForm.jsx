import React from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiAward,
  FiBriefcase,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import { FaStethoscope, FaHospital } from 'react-icons/fa';

/**
 * Reusable Doctor Form Component
 * Used in both create and edit modes for doctor management
 */
const DoctorForm = ({
  formData,
  onChange,
  errors = {},
  currentQualification,
  onQualificationChange,
  onAddQualification,
  onRemoveQualification,
  currentAvailability,
  onAvailabilityChange,
  onAddAvailability,
  onRemoveAvailability,
  onSpecializationToggle,
  showPasswordField = true,
  readOnlyEmail = false,
}) => {
  // Enum options
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

  // Helper to format enum values
  const formatEnumValue = (value) => {
    if (!value) return '';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <FiUser className="w-5 h-5" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onChange({ ...formData, firstName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onChange({ ...formData, lastName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
              {readOnlyEmail && <span className="text-gray-500 text-xs ml-1">(Read-only)</span>}
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange({ ...formData, email: e.target.value })}
                disabled={readOnlyEmail}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  readOnlyEmail ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="doctor@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                onChange={(e) => onChange({ ...formData, phone: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="9876543210"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Password - only show in create mode */}
          {showPasswordField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => onChange({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Min 8 characters"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => onChange({ ...formData, gender: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                onChange={(e) => onChange({ ...formData, dateOfBirth: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
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
                onChange={(e) => onChange({ ...formData, medicalLicenseNumber: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.medicalLicenseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="MED2024001"
              />
            </div>
            {errors.medicalLicenseNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.medicalLicenseNumber}</p>
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
                onChange={(e) => onChange({ ...formData, department: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
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
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <div className="relative">
              <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                min="0"
                max="60"
                value={formData.yearsOfExperience || ''}
                onChange={(e) => onChange({ ...formData, yearsOfExperience: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="10"
              />
            </div>
            {errors.yearsOfExperience && (
              <p className="text-red-500 text-xs mt-1">{errors.yearsOfExperience}</p>
            )}
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (INR)</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                min="0"
                value={formData.consultationFee || ''}
                onChange={(e) => onChange({ ...formData, consultationFee: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.consultationFee ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1000"
              />
            </div>
            {errors.consultationFee && (
              <p className="text-red-500 text-xs mt-1">{errors.consultationFee}</p>
            )}
          </div>

          {/* Emergency Availability */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAvailableForEmergency || false}
                onChange={(e) => onChange({ ...formData, isAvailableForEmergency: e.target.checked })}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {specializationOptions.map((spec) => (
              <label key={spec} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.specialization?.includes(spec) || false}
                  onChange={() => onSpecializationToggle(spec)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{formatEnumValue(spec)}</span>
              </label>
            ))}
          </div>
          {formData.specialization && formData.specialization.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.specialization.map((spec) => (
                <span key={spec} className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
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
        {formData.qualifications && formData.qualifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {formData.qualifications.map((qual, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg p-3 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold text-gray-900">{qual.degree}</p>
                  <p className="text-sm text-gray-700">{qual.institution}</p>
                  <p className="text-sm text-gray-600">{qual.year}</p>
                  {qual.specialty && <p className="text-sm text-gray-600">{qual.specialty}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveQualification(index)}
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
              value={currentQualification.degree}
              onChange={(e) => onQualificationChange({ ...currentQualification, degree: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Institution"
              value={currentQualification.institution}
              onChange={(e) => onQualificationChange({ ...currentQualification, institution: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Year"
              min="1900"
              max={new Date().getFullYear()}
              value={currentQualification.year}
              onChange={(e) => onQualificationChange({ ...currentQualification, year: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Specialty (optional)"
              value={currentQualification.specialty}
              onChange={(e) => onQualificationChange({ ...currentQualification, specialty: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={onAddQualification}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Add Qualification
          </button>
          {errors.qualification && <p className="text-red-500 text-xs mt-2">{errors.qualification}</p>}
        </div>
      </div>

      {/* Section 4: Availability Schedule */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <FiClock className="w-5 h-5" />
          Availability Schedule
        </h3>

        {/* Display added availability */}
        {formData.availability && formData.availability.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.availability.map((avail, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold text-gray-900">{avail.day}</span>
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
                  onClick={() => onRemoveAvailability(index)}
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
              onChange={(e) => onAvailabilityChange({ ...currentAvailability, day: e.target.value })}
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
              onChange={(e) => onAvailabilityChange({ ...currentAvailability, startTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="time"
              placeholder="End Time"
              value={currentAvailability.endTime}
              onChange={(e) => onAvailabilityChange({ ...currentAvailability, endTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={onAddAvailability}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Add Availability
          </button>
          {errors.availability && <p className="text-red-500 text-xs mt-2">{errors.availability}</p>}
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
              value={formData.address?.street || formData.street || ''}
              onChange={(e) => {
                if (formData.address) {
                  onChange({ ...formData, address: { ...formData.address, street: e.target.value } });
                } else {
                  onChange({ ...formData, street: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="City"
            value={formData.address?.city || formData.city || ''}
            onChange={(e) => {
              if (formData.address) {
                onChange({ ...formData, address: { ...formData.address, city: e.target.value } });
              } else {
                onChange({ ...formData, city: e.target.value });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="State"
            value={formData.address?.state || formData.state || ''}
            onChange={(e) => {
              if (formData.address) {
                onChange({ ...formData, address: { ...formData.address, state: e.target.value } });
              } else {
                onChange({ ...formData, state: e.target.value });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={formData.address?.zipCode || formData.zipCode || ''}
            onChange={(e) => {
              if (formData.address) {
                onChange({ ...formData, address: { ...formData.address, zipCode: e.target.value } });
              } else {
                onChange({ ...formData, zipCode: e.target.value });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Country"
            value={formData.address?.country || formData.country || 'India'}
            onChange={(e) => {
              if (formData.address) {
                onChange({ ...formData, address: { ...formData.address, country: e.target.value } });
              } else {
                onChange({ ...formData, country: e.target.value });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorForm;

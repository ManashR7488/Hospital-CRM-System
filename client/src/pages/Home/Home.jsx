import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useHomeStore from '../../stores/homeStore';
import useAuthStore from '../../stores/authStore';
import { APP_NAME, TAGLINES, FEATURES, TRUST_INDICATORS } from '../../config/branding';
import {
  FaStethoscope,
  FaUserMd,
  FaHospital,
  FaHeartbeat,
  FaAmbulance,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaClock,
  FaShieldAlt,
  FaCalendarCheck,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaAward,
  FaBriefcase,
  FaDollarSign,
  FaLock,
  FaCheckCircle,
} from 'react-icons/fa';
import { RiRobot3Fill } from 'react-icons/ri';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { getDashboardPathByRole } from '../../utils/auth';

const Home = () => {
  const navigate = useNavigate();
  const { featuredDoctors, isLoading, error, fetchFeaturedDoctors, clearError } = useHomeStore();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);

  // Fetch featured doctors on mount
  useEffect(() => {
    fetchFeaturedDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to format enum values
  const formatEnumValue = (value) => {
    if (!value) return '';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get department badge color
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

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Contact for pricing';
    const numericAmount = Number(amount);
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  };

  // Helper function to get initials
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Handle CTA button clicks
  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      navigate(getDashboardPathByRole(user.role));
    } else {
      navigate('/app/auth/register');
    }
  };

  const handleBookAppointment = (doctorId) => {
    if (isAuthenticated) {
      navigate(`/app/user/appointments?doctor=${doctorId}`);
    } else {
      navigate('/app/auth/register', { state: { redirectTo: `/app/user/appointments?doctor=${doctorId}` } });
    }
  };

  // Get unique specializations from featured doctors
  const getUniqueSpecializations = () => {
    const specs = new Set();
    featuredDoctors.forEach((doctor) => {
      doctor.specialization?.forEach((spec) => specs.add(spec));
    });
    return Array.from(specs);
  };

  // Filter doctors by specialization
  const filteredDoctors = selectedSpecialization
    ? featuredDoctors.filter((doctor) => doctor.specialization?.includes(selectedSpecialization))
    : featuredDoctors;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
          <FaHeartbeat className="w-32 h-32 text-white opacity-5 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-white p-3 rounded-full">
                <FaStethoscope className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{APP_NAME}</h1>
            </div>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl font-semibold mb-4">{TAGLINES.main}</p>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-6 text-blue-100">
              AI-Enabled Healthcare Appointment Management System
            </p>

            {/* Description */}
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-blue-50 leading-relaxed">
              Connect with qualified healthcare professionals anytime, anywhere.
              Book appointments 24/7 with AI-powered reminders via SMS, Email, and WhatsApp.
              Experience secure, efficient, and patient-centered care.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/app/auth/register')}
                    className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    Get Started
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/app/auth/login')}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGetStarted}
                    className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    Go to Dashboard
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/app/user/appointments')}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
                  >
                    Book Appointment
                  </button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="w-5 h-5" />
                <span>{TRUST_INDICATORS.ssl}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaLock className="w-5 h-5" />
                <span>{TRUST_INDICATORS.hipaa}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose {APP_NAME}?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare management at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: 24/7 Appointment Booking */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaClock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                24/7 Appointment Booking
              </h3>
              <p className="text-gray-600 text-sm">
                Schedule appointments anytime, anywhere with our easy-to-use platform
              </p>
            </div>

            {/* Feature 2: AI-Powered Reminders */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <RiRobot3Fill className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Reminders
              </h3>
              <p className="text-gray-600 text-sm">
                Never miss an appointment with intelligent notifications via SMS, Email, and WhatsApp
              </p>
            </div>

            {/* Feature 3: Secure Patient Records */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure Patient Records
              </h3>
              <p className="text-gray-600 text-sm">
                Your medical data protected with industry-leading encryption and HIPAA compliance
              </p>
            </div>

            {/* Feature 4: Expert Medical Care */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaUserMd className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Expert Medical Care
              </h3>
              <p className="text-gray-600 text-sm">
                Access to qualified and experienced healthcare professionals across specializations
              </p>
            </div>

            {/* Feature 5: AI Voice Calling */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaPhoneAlt className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Voice Calling
              </h3>
              <p className="text-gray-600 text-sm">
                Automated appointment confirmations and reminders via intelligent voice calls
              </p>
            </div>

            {/* Feature 6: Google Calendar Sync */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaCalendarCheck className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Calendar Integration
              </h3>
              <p className="text-gray-600 text-sm">
                Seamlessly sync appointments with your Google Calendar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="featured-doctors" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Doctors
            </h2>
            <p className="text-xl text-gray-600">
              Qualified healthcare professionals ready to serve you
            </p>
          </div>

          {/* Specialization Filter (Optional) */}
          {featuredDoctors.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                onClick={() => setSelectedSpecialization(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSpecialization === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Specializations
              </button>
              {getUniqueSpecializations().slice(0, 6).map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedSpecialization === spec
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {formatEnumValue(spec)}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded max-w-2xl mx-auto">
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => fetchFeaturedDoctors()}
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

          {/* Empty State */}
          {!isLoading && !error && filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <FaUserMd className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No doctors available at the moment</p>
            </div>
          )}

          {/* Doctor Cards */}
          {!isLoading && !error && filteredDoctors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.slice(0, 6).map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 p-6"
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-3xl">
                        {getInitials(doctor.firstName, doctor.lastName)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md">
                        <FaUserMd className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>

                  {/* Specialization */}
                  {doctor.specialization && doctor.specialization.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {formatEnumValue(doctor.specialization[0])}
                      </span>
                      {doctor.specialization.length > 1 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{doctor.specialization.length - 1} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Department */}
                  {doctor.department && (
                    <div className="flex justify-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDepartmentColor(doctor.department)}`}>
                        <FaHospital className="w-3 h-3" />
                        {formatEnumValue(doctor.department)}
                      </span>
                    </div>
                  )}

                  {/* Experience and Fee */}
                  <div className="space-y-2 mb-4">
                    {doctor.yearsOfExperience !== null && doctor.yearsOfExperience !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaBriefcase className="w-4 h-4" />
                        <span>{doctor.yearsOfExperience} years of experience</span>
                      </div>
                    )}
                    {doctor.consultationFee !== null && doctor.consultationFee !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaDollarSign className="w-4 h-4" />
                        <span>{formatCurrency(doctor.consultationFee)}</span>
                      </div>
                    )}
                  </div>

                  {/* Qualifications */}
                  {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaAward className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Qualifications</span>
                      </div>
                      <div className="space-y-1">
                        {doctor.qualifications.slice(0, 2).map((qual, idx) => (
                          <p key={idx} className="text-xs text-gray-500">
                            {qual.degree} - {qual.institution}
                          </p>
                        ))}
                        {doctor.qualifications.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{doctor.qualifications.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Book Appointment Button */}
                  <button
                    onClick={() => handleBookAppointment(doctor._id)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    Book Appointment
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">10,000+</p>
              <p className="text-gray-600 font-medium">Patients</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {featuredDoctors.length * 2 || 50}+
              </p>
              <p className="text-gray-600 font-medium">Doctors</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">50,000+</p>
              <p className="text-gray-600 font-medium">Appointments</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">98%</p>
              <p className="text-gray-600 font-medium">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <FaUserMd className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Account</h3>
                <p className="text-gray-600">
                  Sign up in minutes and complete your profile
                </p>
              </div>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <FiArrowRight className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <FaStethoscope className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Doctor</h3>
                <p className="text-gray-600">
                  Browse specialists and select based on your needs
                </p>
              </div>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <FiArrowRight className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <FaCalendarCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book Appointment</h3>
              <p className="text-gray-600">
                Schedule at your convenience and receive confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      {featuredDoctors.length > 0 && getUniqueSpecializations().length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Specializations
              </h2>
              <p className="text-xl text-gray-600">
                Expert care across multiple medical fields
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {getUniqueSpecializations().map((spec) => (
                <button
                  key={spec}
                  onClick={() => {
                    setSelectedSpecialization(spec);
                    document.querySelector('#featured-doctors')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-br from-blue-50 to-teal-50 p-4 rounded-lg hover:shadow-md transition-all transform hover:-translate-y-1 text-center"
                >
                  <FaStethoscope className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{formatEnumValue(spec)}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of patients who trust {APP_NAME} for their healthcare needs
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/app/auth/register')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  Create Free Account
                  <FiArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
                >
                  Learn More
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/app/user/appointments')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  Book Your Appointment
                  <FiArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
                >
                  View Dashboard
                </button>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="w-6 h-6" />
              <span>{TRUST_INDICATORS.ssl}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaLock className="w-6 h-6" />
              <span>{TRUST_INDICATORS.hipaa}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="w-6 h-6" />
              <span>Verified Healthcare Professionals</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
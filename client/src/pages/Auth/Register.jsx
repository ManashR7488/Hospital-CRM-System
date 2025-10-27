import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCalendarCheck,
  FaFileMedical,
  FaUserMd,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaStethoscope,
  FaSignInAlt,
} from "react-icons/fa";
import { RiRobot3Fill } from "react-icons/ri";
import { getDashboardPathByRole } from "../../utils/auth";
import { APP_NAME, TAGLINES } from "../../config/branding";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [validFields, setValidFields] = useState({});

  const { register, isLoading, error, user, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      navigate(getDashboardPathByRole(user.role));
    }
  }, [user, isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(phone)) {
      errors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // Update field value
    if (field === "firstName") setFirstName(value);
    if (field === "middleName") setMiddleName(value);
    if (field === "lastName") setLastName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    if (field === "phone") setPhone(value);
    if (field === "profileImage") setProfileImage(value);

    // Clear validation error for the field being edited
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    // Validate individual field and mark as valid if it passes
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;
    let isValid = false;

    if (field === "firstName" && value.trim()) isValid = true;
    if (field === "lastName" && value.trim()) isValid = true;
    if (field === "email" && emailRegex.test(value)) isValid = true;
    if (field === "phone" && phoneRegex.test(value)) isValid = true;
    if (field === "password" && value.length >= 6) isValid = true;
    if (field === "confirmPassword" && value === password && value.length >= 6) isValid = true;

    setValidFields((prev) => ({
      ...prev,
      [field]: isValid,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register({
      firstName,
      middleName,
      lastName,
      email,
      password,
      phone,
      profileImage,
    });

    if (result.success) {
      const userRole = useAuthStore.getState().user?.role;
      navigate(getDashboardPathByRole(userRole));
    }
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { level: "weak", color: "red", text: "Weak", textClass: "text-red-600", bgClass: "bg-red-500" };
    if (password.length < 10) return { level: "medium", color: "yellow", text: "Medium", textClass: "text-yellow-600", bgClass: "bg-yellow-500" };
    return { level: "strong", color: "green", text: "Strong", textClass: "text-green-600", bgClass: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Left Column - Healthcare Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-600 via-blue-700 to-blue-600 p-12 flex-col justify-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo and Brand */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white p-3 rounded-xl shadow-lg">
                <FaStethoscope className="text-blue-600 text-3xl" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-bold">{APP_NAME}</h1>
                <p className="text-blue-100 text-sm">{TAGLINES.auth.register}</p>
              </div>
            </div>
          </div>

          {/* Registration Benefits */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start space-x-4 animate-slide-in">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaCalendarCheck className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Quick Appointment Booking</h3>
                <p className="text-blue-100 text-sm">Schedule appointments in just a few clicks</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 animate-slide-in delay-100">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaFileMedical className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Digital Health Records</h3>
                <p className="text-blue-100 text-sm">Access your medical history anytime, anywhere</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 animate-slide-in delay-200">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <RiRobot3Fill className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">AI Health Reminders</h3>
                <p className="text-blue-100 text-sm">Smart notifications for medications and checkups</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 animate-slide-in delay-300">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaUserMd className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">24/7 Access to Doctors</h3>
                <p className="text-blue-100 text-sm">Connect with healthcare professionals anytime</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white text-sm italic">
              "Join thousands of patients who trust us with their healthcare"
            </p>
            <div className="flex items-center mt-2 space-x-1 text-yellow-300">
              <span>★★★★★</span>
              <span className="text-white text-xs ml-2">(4.9/5 from 2000+ reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg">
          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 animate-fade-in">
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaUserPlus className="text-blue-600 text-3xl" />
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Create your patient account in minutes</p>
            </div>

            {/* Welcome Message */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-800 text-sm">
                <strong>Welcome to {APP_NAME}</strong> - {TAGLINES.auth.registerWelcome}
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {/* First and Last Name - Two column layout on larger screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400 text-sm" />
                        </div>
                        <input
                          id="first-name"
                          name="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={`appearance-none rounded-lg relative block w-full pl-12 ${
                            validFields.firstName ? "pr-12" : "pr-4"
                          } py-3 border ${
                            validationErrors.firstName
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : validFields.firstName
                              ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition duration-200`}
                          placeholder="Enter your first name"
                        />
                        {validFields.firstName && !validationErrors.firstName && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <FaCheckCircle className="text-green-500 text-lg" />
                          </div>
                        )}
                      </div>
                      {validationErrors.firstName && (
                        <div className="flex items-center mt-1 text-xs text-red-600">
                          <FaExclamationCircle className="mr-1" />
                          {validationErrors.firstName}
                        </div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400 text-sm" />
                        </div>
                        <input
                          id="last-name"
                          name="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={`appearance-none rounded-lg relative block w-full pl-12 ${
                            validFields.lastName ? "pr-12" : "pr-4"
                          } py-3 border ${
                            validationErrors.lastName
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : validFields.lastName
                              ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition duration-200`}
                          placeholder="Enter your last name"
                        />
                        {validFields.lastName && !validationErrors.lastName && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <FaCheckCircle className="text-green-500 text-lg" />
                          </div>
                        )}
                      </div>
                      {validationErrors.lastName && (
                        <div className="flex items-center mt-1 text-xs text-red-600">
                          <FaExclamationCircle className="mr-1" />
                          {validationErrors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Name - Full width */}
                  <div>
                    <label htmlFor="middle-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400 text-sm" />
                      </div>
                      <input
                        id="middle-name"
                        name="middleName"
                        type="text"
                        value={middleName}
                        onChange={(e) => handleInputChange("middleName", e.target.value)}
                        className="appearance-none rounded-lg relative block w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition duration-200"
                        placeholder="Enter your middle name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaEnvelope className="mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400 text-sm" />
                      </div>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`appearance-none rounded-lg relative block w-full pl-12 ${
                          validFields.email ? "pr-12" : "pr-4"
                        } py-3 border ${
                          validationErrors.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : validFields.email
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition duration-200`}
                        placeholder="Enter your email"
                      />
                      {validFields.email && !validationErrors.email && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <FaCheckCircle className="text-green-500 text-lg" />
                        </div>
                      )}
                    </div>
                    {validationErrors.email && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <FaExclamationCircle className="mr-1" />
                        {validationErrors.email}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400 text-sm" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`appearance-none rounded-lg relative block w-full pl-12 ${
                          validFields.phone ? "pr-12" : "pr-4"
                        } py-3 border ${
                          validationErrors.phone
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : validFields.phone
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition duration-200`}
                        placeholder="Enter your phone number"
                      />
                      {validFields.phone && !validationErrors.phone && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <FaCheckCircle className="text-green-500 text-lg" />
                        </div>
                      )}
                    </div>
                    {validationErrors.phone && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <FaExclamationCircle className="mr-1" />
                        {validationErrors.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaLock className="mr-2 text-blue-600" />
                  Security
                </h3>
                <div className="space-y-4">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400 text-sm" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`appearance-none rounded-lg relative block w-full pl-12 ${
                          validFields.password ? "pr-12" : "pr-4"
                        } py-3 border ${
                          validationErrors.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : validFields.password
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition duration-200`}
                        placeholder="Create a strong password"
                      />
                      {validFields.password && !validationErrors.password && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <FaCheckCircle className="text-green-500 text-lg" />
                        </div>
                      )}
                    </div>
                    {validationErrors.password && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <FaExclamationCircle className="mr-1" />
                        {validationErrors.password}
                      </div>
                    )}
                    {/* Password Strength Indicator */}
                    {passwordStrength && !validationErrors.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password Strength:</span>
                          <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${passwordStrength.bgClass} h-2 rounded-full transition-all duration-300`}
                            style={{
                              width:
                                passwordStrength.level === "weak"
                                  ? "33%"
                                  : passwordStrength.level === "medium"
                                  ? "66%"
                                  : "100%",
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {password.length < 6
                            ? "At least 6 characters required"
                            : password.length < 10
                            ? "Good! Consider making it longer"
                            : "Excellent password strength!"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400 text-sm" />
                      </div>
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`appearance-none rounded-lg relative block w-full pl-12 ${
                          validFields.confirmPassword ? "pr-12" : "pr-4"
                        } py-3 border ${
                          validationErrors.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : validFields.confirmPassword
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition duration-200`}
                        placeholder="Confirm your password"
                      />
                      {validFields.confirmPassword && !validationErrors.confirmPassword && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <FaCheckCircle className="text-green-500 text-lg" />
                        </div>
                      )}
                    </div>
                    {validationErrors.confirmPassword && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <FaExclamationCircle className="mr-1" />
                        {validationErrors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-4 animate-shake">
                  <div className="flex items-center">
                    <FaExclamationCircle className="text-red-400 mr-3 text-xl flex-shrink-0" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-3 px-6 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      Create Account
                    </>
                  )}
                </button>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center text-xs text-gray-500">
                <p>
                  By registering, you agree to our{" "}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Already part of our healthcare community?</span>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/app/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition duration-200 inline-flex items-center space-x-1"
                >
                  <FaSignInAlt />
                  <span>Login to your account</span>
                </Link>
              </div>
            </div>

            {/* Trust Elements */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <FaShieldAlt className="text-blue-600" />
                  <span>HIPAA Compliant & Secure</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <FaLock className="text-green-600" />
                  <span className="font-medium">Your information is encrypted and secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Trust Message */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-gray-600 text-sm">Join thousands of patients who trust us with their healthcare</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
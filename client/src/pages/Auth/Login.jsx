import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import {
  AiOutlineLoading3Quarters,
  AiFillMail,
} from "react-icons/ai";
import {
  FaStethoscope,
  FaHospital,
  FaHeartbeat,
  FaUserMd,
  FaShieldAlt,
  FaClock,
  FaLock,
  FaEnvelope,
  FaKey,
  FaExclamationCircle,
  FaQuestionCircle,
  FaSignInAlt,
} from "react-icons/fa";
import { RiRobot3Fill } from "react-icons/ri";
import { getDashboardPathByRole } from "../../utils/auth";
import { APP_NAME, TAGLINES, TRUST_INDICATORS } from "../../config/branding";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const { login, isLoading, error, user, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      navigate(getDashboardPathByRole(user.role));
    }
  }, [user, isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    // Clear validation error for the field being edited
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      // Redirect based on role
      const userRole = useAuthStore.getState().user?.role;
      navigate(getDashboardPathByRole(userRole));
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Left Column - Healthcare Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 p-12 flex-col justify-center relative overflow-hidden">
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
                <p className="text-blue-100 text-sm">
                  {TAGLINES.auth.login}
                </p>
              </div>
            </div>
            <p className="text-blue-100 text-lg italic">
              {TAGLINES.main}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start space-x-4 animate-slide-in">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaClock className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  24/7 Appointment Booking
                </h3>
                <p className="text-blue-100 text-sm">
                  Book appointments anytime, anywhere
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 animate-slide-in delay-100">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <RiRobot3Fill className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  AI-Powered Reminders
                </h3>
                <p className="text-blue-100 text-sm">
                  Never miss an appointment with smart notifications
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 animate-slide-in delay-200">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Secure Patient Records
                </h3>
                <p className="text-blue-100 text-sm">
                  Your data protected with industry-leading security
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 animate-slide-in delay-300">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaUserMd className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Expert Medical Care
                </h3>
                <p className="text-blue-100 text-sm">
                  Access to qualified healthcare professionals
                </p>
              </div>
            </div>
          </div>

          {/* Medical Illustration */}
          <div className="flex items-center space-x-2 text-blue-100">
            <FaHeartbeat className="text-2xl animate-pulse" />
            <FaHospital className="text-3xl" />
            <FaHeartbeat className="text-2xl animate-pulse delay-500" />
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 animate-fade-in">
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaStethoscope className="text-blue-600 text-3xl" />
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">Access your healthcare dashboard</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`appearance-none rounded-lg relative block w-full pl-12 pr-4 py-3 border ${
                      validationErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition duration-200`}
                    placeholder="Enter your email"
                  />
                </div>
                {validationErrors.email && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <FaExclamationCircle className="mr-1" />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaKey className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`appearance-none rounded-lg relative block w-full pl-12 pr-4 py-3 border ${
                      validationErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition duration-200`}
                    placeholder="Enter your password"
                  />
                </div>
                {validationErrors.password && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <FaExclamationCircle className="mr-1" />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link
                  to="/app/auth/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition duration-200"
                >
                  <FaQuestionCircle />
                  <span>Forgot Password?</span>
                </Link>
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
                      Logging in...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-2" />
                      Login to Dashboard
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Registration Link */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    New to our healthcare platform?
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/app/auth/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition duration-200 inline-flex items-center space-x-1"
                >
                  <span>Create your account</span>
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* Trust and Security Elements */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <FaLock className="text-green-600" />
                  <span className="font-medium">{TRUST_INDICATORS.ssl}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <FaShieldAlt className="text-blue-600" />
                  <span>Your data is protected under {TRUST_INDICATORS.hipaa}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Mobile Branding */}
          <div className="md:hidden mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Trusted by thousands of patients worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
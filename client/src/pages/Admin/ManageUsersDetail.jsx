import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import useAdminStore from "../../stores/adminStore";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  FiArrowLeft,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiMail,
  FiPhone,
  FiUser,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { FaUserMd, FaIdCard } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ManageUsersDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = window.location;
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentUser,
    isLoading,
    error,
    fetchUserById,
    updateUser,
    deleteUser,
    clearError,
  } = useAdminStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  
  // Get role from navigation state if available
  const roleFromState = window.history.state?.usr?.role;

  // Check if opened in edit mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "edit") {
      setIsEditing(true);
      // Remove the query param after setting edit mode
      searchParams.delete("mode");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    if (id) {
      // Use role from navigation state, or fallback to patient and let store try doctor if 404
      const role = roleFromState || "patient";
      fetchUserById(id, role);
    }
  }, [id, roleFromState]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        specialization: currentUser.specialization || "",
        licenseNumber: currentUser.licenseNumber || "",
        isActive: currentUser.isActive !== undefined ? currentUser.isActive : true,
      });
    }
  }, [currentUser]);

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName?.trim()) errors.firstName = "First name is required";
    if (!formData.lastName?.trim()) errors.lastName = "Last name is required";
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-()\s]/g, ""))) {
      errors.phone = "Phone must be 10 digits";
    }
    if (currentUser?.role === "doctor") {
      if (!formData.specialization?.trim()) {
        errors.specialization = "Specialization is required for doctors";
      }
      if (!formData.licenseNumber?.trim()) {
        errors.licenseNumber = "License number is required for doctors";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await updateUser(id, formData, currentUser.role);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to current user data
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        specialization: currentUser.specialization || "",
        licenseNumber: currentUser.licenseNumber || "",
        isActive: currentUser.isActive !== undefined ? currentUser.isActive : true,
      });
    }
    setFormErrors({});
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(id, currentUser.role);
      navigate("/app/admin/users");
    } catch (err) {
      console.error("Failed to delete user:", err);
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/app/admin/users")}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Users
        </button>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => fetchUserById(id, "patient")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No user found
  if (!currentUser) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/app/admin/users")}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Users
        </button>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-sm text-yellow-700">User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/app/admin/users")}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Users
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              {isEditing ? "Edit User" : "User Details"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? "Modify user information" : "View user information"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <FiEdit className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <FiTrash2 className="mr-2" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiX className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && !isLoading && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* User Information Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Role Badge */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                {currentUser.role === "doctor" ? (
                  <FaUserMd className="text-white" size={32} />
                ) : (
                  <FiUser className="text-white" size={32} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white mt-1">
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              {formData.isActive ? (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <FiCheckCircle className="mr-1" size={16} />
                  <span className="text-sm font-medium">Active</span>
                </div>
              ) : (
                <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  <FiXCircle className="mr-1" size={16} />
                  <span className="text-sm font-medium">Inactive</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="mr-2" />
                    First Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="mr-2" />
                    Last Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="mr-2" />
                    Phone
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser.phone || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor-specific Information */}
            {currentUser.role === "doctor" && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Specialization */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaUserMd className="mr-2" />
                      Specialization
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.specialization ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {formErrors.specialization && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.specialization}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {currentUser.specialization || "N/A"}
                      </p>
                    )}
                  </div>

                  {/* License Number */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaIdCard className="mr-2" />
                      License Number
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.licenseNumber ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {formErrors.licenseNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.licenseNumber}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {currentUser.licenseNumber || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Status */}
            {isEditing && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active Account
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Inactive accounts cannot log in to the system
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">User ID:</span>{" "}
                  <span className="text-gray-900 font-mono">{currentUser._id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>{" "}
                  <span className="text-gray-900">
                    {currentUser.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${currentUser.firstName} ${currentUser.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageUsersDetail;
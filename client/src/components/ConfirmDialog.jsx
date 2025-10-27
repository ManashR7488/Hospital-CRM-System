import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiX, FiInfo } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Variant configurations
  const variantConfig = {
    danger: {
      icon: FiAlertTriangle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      buttonBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: FiAlertTriangle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: FiInfo,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const dialogContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="dialog-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Dialog Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`${config.iconBg} rounded-full p-4`}>
                <Icon className={config.iconColor} size={32} />
              </div>
            </div>

            {/* Title */}
            <h3
              id="dialog-title"
              className="text-xl font-bold text-gray-900 text-center mb-2"
            >
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">{message}</p>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${config.buttonBg} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2`}
              >
                {isLoading && (
                  <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                )}
                <span>{confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};

export default ConfirmDialog;

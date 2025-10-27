import React, { useState, useEffect } from 'react';
import { FiPlus, FiMinus, FiClock, FiCheck, FiX, FiAlertCircle, FiEdit } from 'react-icons/fi';

// Days of week configuration
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const AvailabilityScheduler = ({ 
  availability = [], 
  onChange, 
  readOnly = false, 
  className = '' 
}) => {
  const [localAvailability, setLocalAvailability] = useState(availability);
  const [newSlot, setNewSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
  });
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);

  // Update local state when prop changes
  useEffect(() => {
    setLocalAvailability(availability);
  }, [availability]);

  // Format time to 12-hour format with AM/PM
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Check if time range is valid
  const isValidTimeRange = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  };

  // Validate slot
  const validateSlot = (slot) => {
    const newErrors = {};
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!slot.day) {
      newErrors.day = 'Day is required';
    } else if (!DAYS_OF_WEEK.includes(slot.day)) {
      newErrors.day = 'Invalid day';
    }

    if (!slot.startTime) {
      newErrors.startTime = 'Start time is required';
    } else if (!timeRegex.test(slot.startTime)) {
      newErrors.startTime = 'Invalid time format (use HH:MM)';
    }

    if (!slot.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (!timeRegex.test(slot.endTime)) {
      newErrors.endTime = 'Invalid time format (use HH:MM)';
    }

    if (slot.startTime && slot.endTime && timeRegex.test(slot.startTime) && timeRegex.test(slot.endTime)) {
      if (!isValidTimeRange(slot.startTime, slot.endTime)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    // Check for duplicate day (excluding currently editing slot)
    const existingDays = localAvailability
      .map((s, i) => (editingIndex !== null && i === editingIndex ? null : s.day))
      .filter(Boolean);
    
    if (slot.day && existingDays.includes(slot.day)) {
      newErrors.day = 'Availability for this day already exists';
    }

    return newErrors;
  };

  // Handle add slot
  const handleAddSlot = () => {
    const validationErrors = validateSlot(newSlot);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Sort by day of week order
    const updatedAvailability = [...localAvailability, newSlot].sort((a, b) => {
      return DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    });

    setLocalAvailability(updatedAvailability);
    onChange(updatedAvailability);
    
    // Reset form
    setNewSlot({
      day: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
    });
    setErrors({});
  };

  // Handle remove slot
  const handleRemoveSlot = (index) => {
    const updatedAvailability = localAvailability.filter((_, i) => i !== index);
    setLocalAvailability(updatedAvailability);
    onChange(updatedAvailability);
  };

  // Handle edit slot
  const handleEditSlot = (index) => {
    setEditingIndex(index);
    setNewSlot({ ...localAvailability[index] });
  };

  // Handle save edit
  const handleSaveEdit = () => {
    const validationErrors = validateSlot(newSlot);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedAvailability = [...localAvailability];
    updatedAvailability[editingIndex] = newSlot;
    
    // Sort by day of week order
    updatedAvailability.sort((a, b) => {
      return DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    });

    setLocalAvailability(updatedAvailability);
    onChange(updatedAvailability);
    
    // Reset
    setEditingIndex(null);
    setNewSlot({
      day: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
    });
    setErrors({});
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewSlot({
      day: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
    });
    setErrors({});
  };

  // Get available days for dropdown (exclude already used days)
  const getAvailableDays = () => {
    const usedDays = localAvailability
      .map((s, i) => (editingIndex !== null && i === editingIndex ? null : s.day))
      .filter(Boolean);
    return DAYS_OF_WEEK.filter(day => !usedDays.includes(day));
  };

  // VIEW MODE - Display as weekly schedule table
  if (readOnly) {
    return (
      <div className={`${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {DAYS_OF_WEEK.map((day) => {
                const slot = localAvailability.find(s => s.day === day);
                return (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {DAY_NAMES[day]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {slot ? (
                        <div className="flex items-center">
                          <FiClock className="mr-2 text-blue-500" size={14} />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {slot ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slot.isAvailable !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {slot.isAvailable !== false ? (
                            <>
                              <FiCheck className="mr-1" size={12} />
                              Available
                            </>
                          ) : (
                            <>
                              <FiX className="mr-1" size={12} />
                              Not Available
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Not Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // EDIT MODE - Interactive editor
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Existing Availability Slots */}
      {localAvailability.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Availability</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localAvailability.map((slot, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">
                      {DAY_NAMES[slot.day]}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FiClock className="mr-2 text-blue-500" size={14} />
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        slot.isAvailable !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slot.isAvailable !== false ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditSlot(index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <FiMinus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Slot Form */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
          {editingIndex !== null ? (
            <>
              <FiEdit className="mr-2 text-blue-600" size={18} />
              Edit Availability Slot
            </>
          ) : (
            <>
              <FiPlus className="mr-2 text-blue-600" size={18} />
              Add Availability Slot
            </>
          )}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Day Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day <span className="text-red-500">*</span>
            </label>
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.day ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select day</option>
              {(editingIndex !== null ? DAYS_OF_WEEK : getAvailableDays()).map((day) => (
                <option key={day} value={day}>
                  {DAY_NAMES[day]}
                </option>
              ))}
            </select>
            {errors.day && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" size={12} />
                {errors.day}
              </p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="09:00"
            />
            {errors.startTime && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" size={12} />
                {errors.startTime}
              </p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="17:00"
            />
            {errors.endTime && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" size={12} />
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Available Checkbox */}
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={newSlot.isAvailable !== false}
              onChange={(e) => setNewSlot({ ...newSlot, isAvailable: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Available for appointments</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {editingIndex !== null ? (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={!newSlot.day || !newSlot.startTime || !newSlot.endTime}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiCheck className="mr-2" size={16} />
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiX className="mr-2" size={16} />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddSlot}
              disabled={!newSlot.day || !newSlot.startTime || !newSlot.endTime}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiPlus className="mr-2" size={16} />
              Add Availability
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityScheduler;

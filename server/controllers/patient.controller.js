import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import bcrypt from "bcryptjs";

// Dashboard Analytics
export const getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.user._id;

    // Get patient details
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Count total appointments
    const totalAppointments = await Appointment.countDocuments({ patient: patientId });

    // Calculate upcoming appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingAppointments = await Appointment.countDocuments({
      patient: patientId,
      appointmentDate: { $gte: today },
      status: { $nin: ['completed', 'cancelled', 'no_show'] }
    });

    // Get recent appointments (last 5)
    const recentAppointments = await Appointment.find({ patient: patientId })
      .sort({ appointmentDate: -1 })
      .limit(5)
      .populate("doctor");

    // Get next appointment
    const nextAppointment = await Appointment.findOne({
      patient: patientId,
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .sort({ appointmentDate: 1 })
      .populate("doctor");

    res.status(200).json({
      data: {
        patient: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          bloodGroup: patient.bloodGroup,
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          currentMedications: patient.currentMedications
        },
        totalAppointments,
        upcomingAppointments,
        recentAppointments,
        nextAppointment
      },
      message: "Patient dashboard data fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching patient dashboard data",
      error: error.message
    });
  }
};

// Profile Management
export const getProfile = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      data: patient,
      message: "Profile fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const patientId = req.user._id;
    let updatedData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated
    delete updatedData.role;
    delete updatedData.patientId;
    delete updatedData.assignedDoctor;
    delete updatedData.password; // Password changes only through changePassword()
    delete updatedData.isVerified;
    delete updatedData.isActive;

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Remove password from response
    updatedPatient.password = undefined;

    res.status(200).json({
      data: updatedPatient,
      message: "Profile updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message
    });
  }
};

export const updateMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { condition, diagnosedDate, status, notes } = req.body;

    if (!condition) {
      return res.status(400).json({
        message: "Condition is required"
      });
    }

    const medicalHistoryEntry = {
      condition,
      diagnosedDate,
      status,
      notes
    };

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      { $push: { medicalHistory: medicalHistoryEntry } },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      data: updatedPatient,
      message: "Medical history updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating medical history",
      error: error.message
    });
  }
};

export const updateAllergies = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { allergen, severity, reaction, notes } = req.body;

    if (!allergen) {
      return res.status(400).json({
        message: "Allergen is required"
      });
    }

    const allergyEntry = {
      allergen,
      severity,
      reaction,
      notes
    };

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      { $push: { allergies: allergyEntry } },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      data: updatedPatient,
      message: "Allergy added successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding allergy",
      error: error.message
    });
  }
};

export const updateMedications = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { name, dosage, frequency, prescribedBy, prescribedDate } = req.body;

    if (!name || !dosage || !frequency) {
      return res.status(400).json({
        message: "Name, dosage, and frequency are required"
      });
    }

    const medicationEntry = {
      name,
      dosage,
      frequency,
      prescribedDate: prescribedDate || new Date(), // Default to now if not provided
      prescribedBy // ObjectId of doctor (optional)
    };

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      { $push: { currentMedications: medicationEntry } },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      data: updatedPatient,
      message: "Medication added successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding medication",
      error: error.message
    });
  }
};

// Doctor Discovery
export const searchDoctors = async (req, res) => {
  try {
    const {
      search,
      specialization,
      department,
      isAvailableForEmergency,
      sortBy = 'firstName',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Build dynamic filter - only show active doctors
    let filter = { isActive: true };

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by specialization (can be comma-separated)
    if (specialization) {
      const specializations = specialization
        .split(',')
        .map(s => s.trim().toLowerCase());
      filter.specialization = specializations.length > 1 ? { $in: specializations } : specializations[0];
    }

    // Filter by department
    if (department) {
      filter.department = department.trim().toLowerCase();
    }

    // Filter by emergency availability
    if (isAvailableForEmergency !== undefined) {
      filter.isAvailableForEmergency = isAvailableForEmergency === 'true';
    }

    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalCount = await Doctor.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    const doctors = await Doctor.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-password');

    res.status(200).json({
      data: doctors,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum
      },
      message: "Doctors fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching doctors",
      error: error.message
    });
  }
};

export const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id)
      .select('-password')
      .populate('patients', 'firstName lastName');

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      data: doctor,
      message: "Doctor details fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching doctor details",
      error: error.message
    });
  }
};

export const checkDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "Doctor ID and date are required"
      });
    }

    // Get doctor with availability schedule
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Get day of week from date
    const appointmentDate = new Date(date);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[appointmentDate.getDay()];

    // Find availability for this day
    const dayAvailability = doctor.availability?.find(
      avail => avail.day === dayOfWeek && avail.isAvailable
    );

    if (!dayAvailability) {
      return res.status(200).json({
        available: false,
        message: "Doctor not available on this day"
      });
    }

    // Get existing appointments for this doctor on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] }
    });

    const bookedSlots = existingAppointments.map(apt => ({
      startTime: apt.startTime,
      endTime: apt.endTime
    }));

    // Calculate discrete available slots
    const slotDuration = parseInt(req.query.duration) || 30; // Default 30 minutes
    const availableSlots = [];

    // Parse start and end times (format: "HH:mm")
    const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

    // Convert to minutes since midnight
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Generate time slots
    while (currentMinutes + slotDuration <= endMinutes) {
      const slotStartHour = Math.floor(currentMinutes / 60);
      const slotStartMin = currentMinutes % 60;
      const slotEndMinutes = currentMinutes + slotDuration;
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMin = slotEndMinutes % 60;

      const slotStart = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
      const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

      // Check if slot overlaps with any booked slot
      const isBooked = bookedSlots.some(booked => {
        return (slotStart < booked.endTime && slotEnd > booked.startTime);
      });

      if (!isBooked) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd
        });
      }

      currentMinutes += slotDuration;
    }

    res.status(200).json({
      available: true,
      availableHours: {
        startTime: dayAvailability.startTime,
        endTime: dayAvailability.endTime
      },
      availableSlots,
      bookedSlots,
      message: "Doctor availability checked successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error checking doctor availability",
      error: error.message
    });
  }
};

// Appointment Management
export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;
    const {
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      duration,
      type,
      reason,
      notes,
      department
    } = req.body;

    // Validation Step 1: Check required fields
    if (!doctorId || !appointmentDate || !startTime || !endTime) {
      return res.status(400).json({
        message: "Doctor ID, appointment date, start time, and end time are required"
      });
    }

    // Validation Step 2: Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (!doctor.isActive) {
      return res.status(400).json({ message: "Doctor is not currently active" });
    }

    // Validation Step 3: Check doctor availability
    const apptDate = new Date(appointmentDate);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[apptDate.getDay()];

    const dayAvailability = doctor.availability?.find(
      avail => avail.day === dayOfWeek && avail.isAvailable
    );

    if (!dayAvailability) {
      return res.status(400).json({
        message: "Doctor not available on this day"
      });
    }

    // Check if requested time falls within doctor's available hours
    if (startTime < dayAvailability.startTime || endTime > dayAvailability.endTime) {
      return res.status(400).json({
        message: `Doctor is only available from ${dayAvailability.startTime} to ${dayAvailability.endTime}`
      });
    }

    // Validation Step 4: Prevent double booking for patient
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const patientConflict = await Appointment.findOne({
      patient: patientId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] },
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (patientConflict) {
      return res.status(400).json({
        message: "You already have an appointment at this time"
      });
    }

    // Validation Step 5: Prevent double booking for doctor
    const doctorConflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] },
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (doctorConflict) {
      return res.status(400).json({
        message: "Doctor already has an appointment at this time"
      });
    }

    // Validation Step 6: Validate appointment is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (apptDate < today) {
      return res.status(400).json({
        message: "Appointment date must be in the future"
      });
    }

    // Validation Step 7: If appointment is today, check time is not in the past
    const now = new Date();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (apptDate.getTime() === todayDate.getTime()) {
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (startTime <= currentTime) {
        return res.status(400).json({
          message: "Cannot book an appointment in the past. Please select a future time."
        });
      }
    }

    // Create new appointment
    const newAppointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      startTime,
      endTime,
      duration,
      type,
      reason,
      notes,
      department,
      status: 'scheduled',
      createdBy: req.user._id
    });

    await newAppointment.save();

    // Update patient's appointments array
    await Patient.findByIdAndUpdate(patientId, {
      $addToSet: { appointments: newAppointment._id }
    });

    // Update doctor's appointments array
    await Doctor.findByIdAndUpdate(doctorId, {
      $addToSet: { appointments: newAppointment._id }
    });

    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate('doctor', '-password')
      .populate('patient', '-password');

    res.status(201).json({
      data: populatedAppointment,
      message: "Appointment booked successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error booking appointment",
      error: error.message
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    const {
      search,
      status,
      type,
      startDate,
      endDate,
      sortBy = 'appointmentDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build dynamic filter
    let filter = { patient: patientId };

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { appointmentId: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status (can be comma-separated)
    if (status) {
      const statuses = status.split(',');
      filter.status = statuses.length > 1 ? { $in: statuses } : status;
    }

    // Filter by type
    if (type) {
      filter.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) {
        filter.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.appointmentDate.$lte = new Date(endDate);
      }
    }

    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalCount = await Appointment.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    const appointments = await Appointment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('doctor', '-password')
      .populate('patient', '-password');

    res.status(200).json({
      data: appointments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum
      },
      message: "Appointments fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    const appointment = await Appointment.findOne({ _id: id, patient: patientId })
      .populate('doctor', '-password')
      .populate('patient', '-password');

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or does not belong to you"
      });
    }

    res.status(200).json({
      data: appointment,
      message: "Appointment fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointment",
      error: error.message
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    // Query appointment
    const appointment = await Appointment.findOne({ _id: id, patient: patientId });
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or does not belong to you"
      });
    }

    // Check if appointment can be updated
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(403).json({
        message: "Cannot update a completed or cancelled appointment"
      });
    }

    // Whitelist allowed fields - only reason, notes, and status (only if 'cancelled')
    const updatedData = {};
    
    if (req.body.reason !== undefined) {
      updatedData.reason = req.body.reason;
    }
    
    if (req.body.notes !== undefined) {
      updatedData.notes = req.body.notes;
    }

    // Handle status change - only allow 'cancelled'
    if (req.body.status !== undefined) {
      if (req.body.status === 'cancelled') {
        updatedData.status = 'cancelled';
        updatedData.cancelledBy = req.user._id;
        if (req.body.cancelReason) {
          updatedData.cancelReason = req.body.cancelReason;
        }
      } else {
        return res.status(400).json({
          message: "Patients can only change appointment status to 'cancelled'"
        });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    )
      .populate('doctor', '-password')
      .populate('patient', '-password');

    res.status(200).json({
      data: updatedAppointment,
      message: "Appointment updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating appointment",
      error: error.message
    });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;
    const { cancelReason } = req.body;

    // Query appointment
    const appointment = await Appointment.findOne({ _id: id, patient: patientId });
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or does not belong to you"
      });
    }

    // Check if appointment can be cancelled
    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot cancel an appointment with status: ${appointment.status}`
      });
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user._id;
    if (cancelReason) {
      appointment.cancelReason = cancelReason;
    }

    await appointment.save();

    res.status(200).json({
      data: appointment,
      message: "Appointment cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling appointment",
      error: error.message
    });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;
    const { newAppointmentDate, newStartTime, newEndTime } = req.body;

    // Validate required fields
    if (!newAppointmentDate || !newStartTime || !newEndTime) {
      return res.status(400).json({
        message: "New appointment date, start time, and end time are required"
      });
    }

    // Query appointment
    const appointment = await Appointment.findOne({ _id: id, patient: patientId });
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or does not belong to you"
      });
    }

    // Check if appointment can be rescheduled
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        message: "Cannot reschedule a completed or cancelled appointment"
      });
    }

    // Reuse validation logic from bookAppointment
    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check doctor availability for new date/time
    const apptDate = new Date(newAppointmentDate);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[apptDate.getDay()];

    const dayAvailability = doctor.availability?.find(
      avail => avail.day === dayOfWeek && avail.isAvailable
    );

    if (!dayAvailability) {
      return res.status(400).json({
        message: "Doctor not available on this day"
      });
    }

    if (newStartTime < dayAvailability.startTime || newEndTime > dayAvailability.endTime) {
      return res.status(400).json({
        message: `Doctor is only available from ${dayAvailability.startTime} to ${dayAvailability.endTime}`
      });
    }

    // Prevent double booking for patient at new time
    const startOfDay = new Date(newAppointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(newAppointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const patientConflict = await Appointment.findOne({
      _id: { $ne: id }, // Exclude current appointment
      patient: patientId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] },
      $or: [
        { startTime: { $lte: newStartTime }, endTime: { $gt: newStartTime } },
        { startTime: { $lt: newEndTime }, endTime: { $gte: newEndTime } },
        { startTime: { $gte: newStartTime }, endTime: { $lte: newEndTime } }
      ]
    });

    if (patientConflict) {
      return res.status(400).json({
        message: "You already have an appointment at this time"
      });
    }

    // Prevent double booking for doctor at new time
    const doctorConflict = await Appointment.findOne({
      _id: { $ne: id }, // Exclude current appointment
      doctor: appointment.doctor,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] },
      $or: [
        { startTime: { $lte: newStartTime }, endTime: { $gt: newStartTime } },
        { startTime: { $lt: newEndTime }, endTime: { $gte: newEndTime } },
        { startTime: { $gte: newStartTime }, endTime: { $lte: newEndTime } }
      ]
    });

    if (doctorConflict) {
      return res.status(400).json({
        message: "Doctor already has an appointment at this time"
      });
    }

    // Validate appointment is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (apptDate < today) {
      return res.status(400).json({
        message: "Appointment date must be in the future"
      });
    }

    // If rescheduling to today, check time is not in the past
    const now = new Date();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (apptDate.getTime() === todayDate.getTime()) {
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (newStartTime <= currentTime) {
        return res.status(400).json({
          message: "Cannot reschedule an appointment to a past time. Please select a future time."
        });
      }
    }

    // Update appointment with new date/time
    appointment.appointmentDate = newAppointmentDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.status = 'scheduled'; // Reset status to scheduled

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', '-password')
      .populate('patient', '-password');

    res.status(200).json({
      data: populatedAppointment,
      message: "Appointment rescheduled successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error rescheduling appointment",
      error: error.message
    });
  }
};

// Settings
export const getSettings = async (req, res) => {
  try {
    const patientId = req.user._id;

    const patient = await Patient.findById(patientId).select('email phone isActive isVerified');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      data: {
        email: patient.email,
        phone: patient.phone,
        isActive: patient.isActive,
        isVerified: patient.isVerified
      },
      message: "Settings fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching settings",
      error: error.message
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const patientId = req.user._id;

    // Whitelist user-editable settings - only phone for now
    const settingsData = {};
    
    if (req.body.phone !== undefined) {
      settingsData.phone = req.body.phone;
    }

    // Add notification preferences if they exist in the schema
    // if (req.body.notificationPreferences !== undefined) {
    //   settingsData.notificationPreferences = req.body.notificationPreferences;
    // }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      settingsData,
      { new: true, runValidators: true }
    ).select('email phone isActive isVerified');

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      data: updatedPatient,
      message: "Settings updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating settings",
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    // Get patient with password
    const patient = await Patient.findById(patientId).select('+password');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, patient.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    patient.password = hashedPassword;
    await patient.save();

    res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error changing password",
      error: error.message
    });
  }
};

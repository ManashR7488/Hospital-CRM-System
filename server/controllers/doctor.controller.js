import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import bcrypt  from "bcryptjs";

export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get doctor details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Count patients assigned to this doctor
    const totalPatients = await Patient.countDocuments({ assignedDoctor: doctorId });

    // Count total appointments for this doctor
    const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });

    // Calculate today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Upcoming appointments
    const upcomingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gt: today },
      status: { $nin: ['completed', 'cancelled', 'no_show'] }
    });

    // Completed appointments
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed'
    });

    // Cancelled appointments
    const cancelledAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'cancelled'
    });

    // Group appointments by status
    const statusDistribution = await Appointment.aggregate([
      { $match: { doctor: doctorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Get recent appointments (last 10)
    const recentAppointments = await Appointment.find({ doctor: doctorId })
      .sort({ appointmentDate: -1 })
      .limit(10)
      .populate("patient")
      .populate("doctor");

    res.status(200).json({
      data: {
        totalPatients,
        totalAppointments,
        todayAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        statusDistribution,
        recentAppointments
      },
      message: "Doctor dashboard data fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching doctor dashboard data",
      error: error.message
    });
  }
};

// patient management by doctor

export const getAllPatients = async (req, res) => {
  try {
    const { search, bloodGroup, assignedDoctor, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    // Build dynamic filter - always scope to logged-in doctor
    let filter = { assignedDoctor: req.user._id };

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by blood group
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    // Note: assignedDoctor from query is ignored since we scope to req.user._id

    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalCount = await Patient.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    const patients = await Patient.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    res.status(200).json({
      data: patients,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum
      },
      message: "All patients fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all patients",
      error: error.message,
    });
  }
};
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ _id: id, assignedDoctor: req.user._id });
    if (!patient) {
      return res.status(404).json({
        message: "Patient not found or not assigned to you",
      });
    }
    res.status(200).json({
      data: patient,
      message: "Patient fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching patient",
      error: error.message,
    });
  }
};
export const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      password,
      username,
      gender,
      phone,
      role = "patient",
    } = req.body;

    if (!firstName || !lastName || !email || !password || !username || !phone) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({
        message: "Patient with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({
      firstName,
      lastName,
      dateOfBirth,
      email,
      password: hashedPassword,
      username,
      gender,
      phone,
      role,
      assignedDoctor: req.user._id,
    });

    await newPatient.save();

    // Update doctor's patients array
    await Doctor.findByIdAndUpdate(req.user._id, {
      $addToSet: { patients: newPatient._id }
    });

    res.status(201).json({
      data: newPatient,
      message: "Patient created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating patient",
      error: error.message,
    });
  }
};
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const patient = await Patient.findOne({ _id: id, assignedDoctor: req.user._id });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found or not assigned to you",
      });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      data: updatedPatient,
      message: "Patient updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating patient",
      error: error.message,
    });
  }
};
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOneAndDelete({ _id: id, assignedDoctor: req.user._id });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found or not assigned to you",
      });
    }

    res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting patient",
      error: error.message,
    });
  }
};

// appointment management by doctor
export const getAllAppointments = async (req, res) => {
  try {
    const { search, status, type, department, startDate, endDate, patientId, sortBy = 'appointmentDate', sortOrder = 'asc', page = 1, limit = 10 } = req.query;
    
    // Build dynamic filter - always filter by logged-in doctor
    let filter = { doctor: req.user._id };

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

    // Filter by department
    if (department) {
      filter.department = department;
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

    // Filter by patient ID
    if (patientId) {
      filter.patient = patientId;
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
      .populate("patient")
      .populate("doctor");
      
    res.status(200).json({
      data: appointments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum
      },
      message: "All appointments fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, doctor: req.user._id })
      .populate("patient")
      .populate("doctor");
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or not assigned to you",
      });
    }
    res.status(200).json({
      data: appointment,
      message: "Appointment fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointment",
      error: error.message,
    });
  }
};

export const createAppointment = async (req, res) => {
  try {
    // if patient is already registered then use patient id else create a new patient.
    const { isRegistered } = req.body;

    if (isRegistered) {
      const {
        patientId,
        appointmentDate,
        startTime,
        endTime,
        duration,
        type,
        reason,
        notes,
        department,
        status,
      } = req.body;

      if (
        !patientId ||
        !appointmentDate ||
        !startTime ||
        !endTime
      ) {
        return res.status(400).json({
          message: "Please provide all required fields",
        });
      }

      const newAppointment = new Appointment({
        patient: patientId,
        doctor: req.user._id,
        appointmentDate,
        startTime,
        endTime,
        duration,
        type,
        reason,
        notes,
        department,
        status,
      });

      await newAppointment.save();

      res.status(201).json({
        data: newAppointment,
        message: "Appointment created successfully",
      });
    } else {
      const {
        firstName,
        lastName,
        dateOfBirth,
        email,
        password,
        username,
        gender,
        phone,
        role = "patient",
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !username ||
        !phone
      ) {
        return res.status(400).json({
          message: "Please provide all Patient fields",
        });
      }

      const existingPatient = await Patient.findOne({ email });
      if (existingPatient) {
        return res.status(400).json({
          message: "Patient with this email already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newPatient = new Patient({
        firstName,
        lastName,
        dateOfBirth,
        email,
        password: hashedPassword,
        username,
        gender,
        phone,
        role,
        assignedDoctor: req.user._id,
      });

      await newPatient.save();

      // Update doctor's patients array
      await Doctor.findByIdAndUpdate(req.user._id, {
        $addToSet: { patients: newPatient._id }
      });

      const {
        appointmentDate,
        startTime,
        endTime,
        duration,
        type,
        reason,
        notes,
        department,
        status,
      } = req.body;

      if (!appointmentDate || !startTime || !endTime) {
        return res.status(400).json({
          message: "Please provide all required fields",
        });
      }

      const newAppointment = new Appointment({
        patient: newPatient._id,
        doctor: req.user._id,
        appointmentDate,
        startTime,
        endTime,
        duration,
        type,
        reason,
        notes,
        department,
        status,
      });

      await newAppointment.save();

      res.status(201).json({
        data: [newAppointment, newPatient],
        message: "Appointment created successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error creating appointment",
      error: error.message,
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const appointment = await Appointment.findOne({ _id: id, doctor: req.user._id });
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or not assigned to you",
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    res.status(200).json({
      data: updatedAppointment,
      message: "Appointment updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating appointment",
      error: error.message,
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOneAndDelete({ _id: id, doctor: req.user._id });
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or not assigned to you",
      });
    }

    res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting appointment",
      error: error.message,
    });
  }
};

// Update doctor's own profile (doctor-specific fields)
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const {
      specialization,
      department,
      yearsOfExperience,
      qualifications,
      consultationFee,
      availability,
      isAvailableForEmergency,
    } = req.body;

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Validate specialization if provided
    if (specialization) {
      if (!Array.isArray(specialization)) {
        return res.status(400).json({
          success: false,
          message: 'Specialization must be an array of strings',
        });
      }
      const validSpecializations = [
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
      for (const spec of specialization) {
        if (!validSpecializations.includes(spec)) {
          return res.status(400).json({
            success: false,
            message: `Invalid specialization: ${spec}`,
          });
        }
      }
      doctor.specialization = specialization;
    }

    // Validate department if provided
    if (department) {
      const validDepartments = [
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
      if (!validDepartments.includes(department)) {
        return res.status(400).json({
          success: false,
          message: `Invalid department: ${department}`,
        });
      }
      doctor.department = department;
    }

    // Validate yearsOfExperience if provided
    if (yearsOfExperience !== undefined) {
      if (yearsOfExperience < 0 || yearsOfExperience > 60) {
        return res.status(400).json({
          success: false,
          message: 'Years of experience must be between 0 and 60',
        });
      }
      doctor.yearsOfExperience = yearsOfExperience;
    }

    // Validate consultationFee if provided
    if (consultationFee !== undefined) {
      if (consultationFee < 0) {
        return res.status(400).json({
          success: false,
          message: 'Consultation fee must be greater than or equal to 0',
        });
      }
      doctor.consultationFee = consultationFee;
    }

    // Validate qualifications if provided
    if (qualifications) {
      if (!Array.isArray(qualifications)) {
        return res.status(400).json({
          success: false,
          message: 'Qualifications must be an array',
        });
      }
      const currentYear = new Date().getFullYear();
      for (const qual of qualifications) {
        if (!qual.degree || !qual.institution) {
          return res.status(400).json({
            success: false,
            message: 'Each qualification must have degree and institution',
          });
        }
        if (qual.year && (qual.year < 1900 || qual.year > currentYear)) {
          return res.status(400).json({
            success: false,
            message: `Qualification year must be between 1900 and ${currentYear}`,
          });
        }
      }
      doctor.qualifications = qualifications;
    }

    // Validate availability if provided
    if (availability) {
      if (!Array.isArray(availability)) {
        return res.status(400).json({
          success: false,
          message: 'Availability must be an array',
        });
      }
      const validDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      const daysSeen = new Set();

      for (const slot of availability) {
        // Check slot has required properties
        if (!slot || !slot.day || !slot.startTime || !slot.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Each availability slot must have day, startTime, and endTime',
          });
        }

        // Check valid day
        if (!validDays.includes(slot.day)) {
          return res.status(400).json({
            success: false,
            message: `Invalid day: ${slot.day}`,
          });
        }

        // Check duplicate days
        if (daysSeen.has(slot.day)) {
          return res.status(400).json({
            success: false,
            message: `Duplicate availability for ${slot.day}`,
          });
        }
        daysSeen.add(slot.day);

        // Check time format
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          return res.status(400).json({
            success: false,
            message: 'Time must be in HH:MM format (24-hour)',
          });
        }

        // Check endTime > startTime
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        if (endMinutes <= startMinutes) {
          return res.status(400).json({
            success: false,
            message: 'End time must be after start time',
          });
        }
      }
      doctor.availability = availability;
    }

    // Update emergency availability if provided
    if (isAvailableForEmergency !== undefined) {
      doctor.isAvailableForEmergency = isAvailableForEmergency;
    }

    // Save updated doctor
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor,
      message: 'Doctor profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: error.message,
    });
  }
};

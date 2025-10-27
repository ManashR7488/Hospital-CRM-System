import Admin from "../models/admin.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import bcrypt from "bcryptjs";

export const getAdminDashboard = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();

    res.status(200).json({
      data: {
        adminCount,
        patientCount,
        doctorCount,
      },
      message: "Admin dashboard data fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admin dashboard data",
      error: error.message,
    });
  }
};
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json({
      data: patients,
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
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
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
    });

    await newPatient.save();

    // Remove password from response
    // newPatient.password = undefined;
    delete newPatient.password;

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

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
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

    const  patient = await Patient.findByIdAndDelete(id);
    
    if(!patient){
      return res.status(404).json({
        message: "Patient not found",
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

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json({
      data: doctors,
      message: "All doctors fetched successfully",
    });   
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all doctors",
      error: error.message,
    });
  }
};
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    res.status(200).json({
      data: doctor,
      message: "Doctor fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching doctor",
      error: error.message,
    });
  }
};
export const createDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      specialization,
      department,
      phone,
      role = "doctor",
    } = req.body;

    if (!firstName || !lastName || !email || !password || !specialization || !department || !phone) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new Doctor({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      specialization,
      department,
      phone,
      role,
    });

    await newDoctor.save();

    // Remove password from response
    // newDoctor.password = undefined;
    delete newDoctor.password;

    res.status(201).json({
      data: newDoctor,
      message: "Doctor created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating doctor",
      error: error.message,
    });
  }
};
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    } else {
      res.status(200).json({
        data: updatedDoctor,
        message: "Doctor updated successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating doctor",
      error: error.message,
    });
  }
};
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      data: doctor,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting doctor",
      error: error.message,
    });
  }
};

export const getAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }
    res.status(200).json({
      data: admin,
      message: "Admin fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admin",
      error: error.message,
    });
  }
};

export const getPublicDoctors = async (req, res) => {
  try {
    // Get query parameters for filtering and limiting
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const specialization = req.query.specialization;
    const department = req.query.department;

    // Build query filters
    const queryFilters = {
      isActive: true,
      isVerified: true,
    };

    if (specialization) {
      queryFilters.specialization = specialization;
    }

    if (department) {
      queryFilters.department = department;
    }

    // Fetch featured doctors with privacy-safe fields only
    const doctors = await Doctor.find(queryFilters)
      .select(
        "firstName lastName specialization department yearsOfExperience consultationFee qualifications.degree qualifications.institution qualifications.specialty"
      )
      .sort({ yearsOfExperience: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      data: doctors,
      count: doctors.length,
      message: "Featured doctors retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching featured doctors",
      error: error.message,
    });
  }
};

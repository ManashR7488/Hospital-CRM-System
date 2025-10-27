import express from "express";
import { protectRoute, isDoctor } from "../middlewares/auth.middleware.js";
import {
  getDoctorDashboard,
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateDoctorProfile,
} from "../controllers/doctor.controller.js";

const router = express.Router();

// Apply global middleware protection - all routes require authentication and doctor role
router.use(protectRoute, isDoctor);

// Dashboard route
router.get("/dashboard", getDoctorDashboard);

// Patient management routes
router.get("/patients", getAllPatients);
router.get("/patients/:id", getPatientById);
router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

// Appointment management routes
router.get("/appointments", getAllAppointments);
router.get("/appointments/:id", getAppointmentById);
router.post("/appointments", createAppointment);
router.put("/appointments/:id", updateAppointment);
router.delete("/appointments/:id", deleteAppointment);

// Doctor profile management route
router.put("/profile", updateDoctorProfile);

export default router;

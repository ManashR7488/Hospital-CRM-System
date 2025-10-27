import express from "express";
import { protectRoute, isPatient } from "../middlewares/auth.middleware.js";
import {
  getPatientDashboard,
  getProfile,
  updateProfile,
  updateMedicalHistory,
  updateAllergies,
  updateMedications,
  searchDoctors,
  getDoctorDetails,
  checkDoctorAvailability,
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getSettings,
  updateSettings,
  changePassword,
} from "../controllers/patient.controller.js";

const router = express.Router();

// Apply global middleware protection - all routes require authentication and patient role
router.use(protectRoute, isPatient);

// Dashboard route
router.get("/dashboard", getPatientDashboard);

// Profile management routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/medical-history", updateMedicalHistory);
router.post("/profile/allergies", updateAllergies);
router.post("/profile/medications", updateMedications);

// Doctor discovery routes
router.get("/doctors", searchDoctors);
router.get("/doctors/availability/check", checkDoctorAvailability);
router.get("/doctors/:id", getDoctorDetails);

// Appointment management routes
router.post("/appointments", bookAppointment);
router.get("/appointments", getMyAppointments);
router.get("/appointments/:id", getAppointmentById);
router.put("/appointments/:id", updateAppointment);
router.put("/appointments/:id/cancel", cancelAppointment);
router.put("/appointments/:id/reschedule", rescheduleAppointment);

// Settings routes
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.put("/settings/password", changePassword);

export default router;

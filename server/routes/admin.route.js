import express from "express";
import { isAdmin, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createDoctor,
  createPatient,
  deleteDoctor,
  deletePatient,
  getAdminDashboard,
  getAdminStatus,
  getAllDoctors,
  getAllPatients,
  getDoctorById,
  getPatientById,
  getPublicDoctors,
  updateDoctor,
  updatePatient,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/public/doctors", getPublicDoctors);

// Protected admin routes
router.use(protectRoute, isAdmin);

// Example admin route
router.get("/dashboard", getAdminDashboard);

// admin CRUD on patients
router.get("/patients", getAllPatients);
router.get("/patients/:id", getPatientById);
router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

// admin CRUD on doctors
router.get("/doctors", getAllDoctors);
router.get("/doctors/:id", getDoctorById);
router.post("/doctors", createDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

// admin stats
router.get("/status", getAdminStatus);

export default router;

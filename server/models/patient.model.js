// models/Patient.js
import mongoose from "mongoose";
import User from "./user.model.js";

const EmergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
  },
  { _id: false }
);

const InsuranceInfoSchema = new mongoose.Schema(
  {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    groupNumber: { type: String, trim: true },
    validUntil: { type: Date },
  },
  { _id: false }
);

const MedicalHistorySchema = new mongoose.Schema(
  {
    condition: { type: String, required: true, trim: true },
    diagnosedDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "resolved", "chronic"],
      default: "active",
    },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const MedicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    prescribedDate: { type: Date, default: Date.now },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
  },
  { _id: false }
);

const PatientSchema = new mongoose.Schema(
  {
    // patientId: { type: String,},
    emergencyContact: EmergencyContactSchema,
    insuranceInfo: InsuranceInfoSchema,
    medicalHistory: [MedicalHistorySchema],
    allergies: [
      {
        allergen: { type: String, required: true, trim: true },
        severity: {
          type: String,
          enum: ["mild", "moderate", "severe"],
          default: "mild",
        },
        reaction: { type: String, trim: true },
        notes: { type: String, trim: true },
      },
    ],
    currentMedications: [MedicationSchema],
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    height: { type: Number, min: 30, max: 300 },
    weight: { type: Number, min: 1, max: 500 },

    // Relations
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
    medicalRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord" }],
  },
  { timestamps: true }
);

// Indexes
// PatientSchema.index({ patientId: 1 });
PatientSchema.index({ assignedDoctor: 1 });
PatientSchema.index({ bloodGroup: 1 });

// Auto-generate patientId and permissions
// PatientSchema.pre("save", function (next) {
//   if (this.isNew && !this.patientId) {
//     this.patientId = `P${Date.now()}${Math.random()
//       .toString(36)
//       .substr(2, 4)
//       .toUpperCase()}`;
//   }
//   this.permissions = [
//     "view_own_profile",
//     "update_own_profile",
//     "book_appointments",
//     "view_own_appointments",
//     "cancel_appointments",
//     "view_own_medical_records",
//   ];
//   next();
// });

// module.exports = BaseUser.discriminator('patient', PatientSchema);

const Patient = User.discriminator("patient", PatientSchema);

export default Patient;

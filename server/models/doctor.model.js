// models/Doctor.js
import mongoose from "mongoose";
import User from "./user.model.js";

const AvailabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
    startTime: { type: String }, // "09:00"
    endTime: { type: String }, // "17:00"
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const QualificationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, min: 1900, max: new Date().getFullYear() },
    specialty: { type: String },
  },
  { _id: false }
);

const DoctorSchema = new mongoose.Schema(
  {
    medicalLicenseNumber: {
      type: String,
    //   required: true,
      unique: true,
      trim: true,
    },
    specialization: [
      {
        type: String,
        enum: [
          "cardiology",
          "neurology",
          "orthopedics",
          "pediatrics",
          "psychiatry",
          "radiology",
          "surgery",
          "internal_medicine",
          "emergency_medicine",
          "anesthesiology",
          "pathology",
          "dermatology",
          "oncology",
          "gynecology",
          "urology",
          "ophthalmology",
          "ent",
          "general_practice",
          
        ],
      },
    ],
    department: {
      type: String,
      required: true,
      enum: [
        "emergency",
        "icu",
        "surgery",
        "oncology",
        "cardiology",
        "neurology",
        "orthopedics",
        "pediatrics",
        "maternity",
        "radiology",
        "laboratory",
        "pharmacy",
        "outpatient",
        "inpatient",
      ],
    },
    yearsOfExperience: { type: Number, min: 0, max: 60 },
    qualifications: [QualificationSchema],
    consultationFee: { type: Number, min: 0 },
    availability: [AvailabilitySchema],
    isAvailableForEmergency: { type: Boolean, default: false },

    // Relations
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "patient" }],
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
  },
  { timestamps: true }
);

// Indexes
// DoctorSchema.index({ medicalLicenseNumber: 1 }, { unique: true });
// DoctorSchema.index({ department: 1 });
// DoctorSchema.index({ specialization: 1 });

// Default permission set for doctors
DoctorSchema.pre("save", function (next) {
  this.permissions = [
    "create_patients",
    "update_patients",
    "view_patient_records",
    "schedule_appointments",
    "view_calendar",
    "update_medical_records",
    "manage_own_profile",
    "prescribe_medications",
  ];
  next();
});

// module.exports = BaseUser.discriminator("doctor", DoctorSchema);
const Doctor = User.discriminator("doctor", DoctorSchema);

export default Doctor;

// models/Appointment.js
import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true, required: true },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },

    appointmentDate: { type: Date, required: true }, // date portion
    startTime: { type: String, required: true }, // "14:30"
    endTime: { type: String, required: true }, // "15:00"
    duration: { type: Number, default: 30 }, // minutes

    type: {
      type: String,
      enum: ["consultation", "follow_up", "emergency", "surgery", "checkup"],
      default: "consultation",
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "scheduled",
    },

    department: { type: String, trim: true },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },

    // Integrations
    googleCalendarEventId: { type: String, trim: true },

    // N8N workflow flags
    reminderSent: { type: Boolean, default: false },
    confirmationSent: { type: Boolean, default: false },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    cancelReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// ID generation
AppointmentSchema.pre("save", function (next) {
  if (this.isNew && !this.appointmentId) {
    this.appointmentId = `A${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;
  }
  next();
});

// Indexes
AppointmentSchema.index({ patient: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ department: 1 });

// module.exports = mongoose.model("Appointment", AppointmentSchema);

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;

// models/Admin.js
import mongoose from "mongoose";
import User from "./user.model.js";

const AdminSchema = new mongoose.Schema(
  {
    systemSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
    canManageUsers: { type: Boolean, default: true },
    canViewAuditLogs: { type: Boolean, default: true },
    canConfigureSystem: { type: Boolean, default: true },
    adminLevel: {
      type: String,
      enum: ["super_admin", "system_admin", "user_admin"],
      default: "system_admin",
    },
    departmentOverride: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Default permission set for admins
AdminSchema.pre("save", function (next) {
  this.permissions = [
    "manage_users",
    "manage_doctors",
    "manage_management",
    "manage_patients",
    "system_config",
    "view_audit_logs",
    "manage_departments",
    "manage_system_settings",
  ];
  next();
});

const Admin = User.discriminator("admin", AdminSchema);
export default Admin;

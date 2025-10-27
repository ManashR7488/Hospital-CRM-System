/**
 * Database Seeding Script
 *
 * This script populates the MongoDB database with test data for development and testing.
 *
 * Usage:
 *   node feed.js
 *
 * Note: This will clear all existing data before seeding.
 * Make sure MONGODB_URI is set in .env file.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import Patient from "./models/patient.model.js";
import Doctor from "./models/doctor.model.js";
import Appointment from "./models/appointment.model.js";
import connectDB from "./config/db.js";

dotenv.config();

// Helper Functions
const generateRandomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Sample Data
const adminData = [
  {
    username: "admin1",
    email: "admin1@hospital.com",
    password: "Admin@123",
    firstName: "Rajesh",
    lastName: "Kumar",
    phone: "+919876543210",
    role: "admin",
    gender: "male",
    dateOfBirth: new Date("1980-05-15"),
    address: {
      street: "123 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
    },
    isActive: true,
    isVerified: true,
  },
  {
    username: "superadmin",
    email: "superadmin@hospital.com",
    password: "Admin@123",
    firstName: "Priya",
    lastName: "Sharma",
    phone: "+919876543211",
    role: "admin",
    gender: "female",
    dateOfBirth: new Date("1975-11-20"),
    address: {
      street: "456 Park Street",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700016",
      country: "India",
    },
    isActive: true,
    isVerified: true,
  },
];

const doctorData = [
  {
    username: "dr.anil.gupta",
    email: "anil.gupta@hospital.com",
    password: "Doctor@123",
    firstName: "Anil",
    lastName: "Gupta",
    phone: "+919123456780",
    role: "doctor",
    gender: "male",
    dateOfBirth: new Date("1978-03-22"),
    address: {
      street: "101 Apollo Clinic",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India",
    },
    medicalLicenseNumber: "MED2024001",
    specialization: ["cardiology"],
    department: "cardiology",
    yearsOfExperience: 15,
    qualifications: [
      {
        degree: "MD",
        institution: "AIIMS, Delhi",
        year: 2005,
        specialty: "Cardiology",
      },
    ],
    consultationFee: 1500,
    availability: [
      {
        day: "monday",
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
    ],
    isAvailableForEmergency: true,
    isActive: true,
    isVerified: true,
  },
  {
    username: "dr.sunita.reddy",
    email: "sunita.reddy@hospital.com",
    password: "Doctor@123",
    firstName: "Sunita",
    lastName: "Reddy",
    phone: "+919123456781",
    role: "doctor",
    gender: "female",
    dateOfBirth: new Date("1982-07-10"),
    address: {
      street: "202 Fortis Hospital",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400012",
      country: "India",
    },
    medicalLicenseNumber: "MED2024002",
    specialization: ["neurology"],
    department: "neurology",
    yearsOfExperience: 12,
    qualifications: [
      {
        degree: "DM",
        institution: "PGIMER, Chandigarh",
        year: 2010,
        specialty: "Neurology",
      },
    ],
    consultationFee: 1800,
    availability: [
      {
        day: "tuesday",
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
    ],
    isAvailableForEmergency: false,
    isActive: true,
    isVerified: true,
  },
  {
    username: "dr.vikram.singh",
    email: "vikram.singh@hospital.com",
    password: "Doctor@123",
    firstName: "Vikram",
    lastName: "Singh",
    phone: "+919123456782",
    role: "doctor",
    gender: "male",
    dateOfBirth: new Date("1975-11-05"),
    address: {
      street: "303 Max Healthcare",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600004",
      country: "India",
    },
    medicalLicenseNumber: "MED2024003",
    specialization: ["orthopedics", "surgery"],
    department: "orthopedics",
    yearsOfExperience: 20,
    qualifications: [
      {
        degree: "MS",
        institution: "JIPMER, Puducherry",
        year: 2000,
        specialty: "Orthopedics",
      },
    ],
    consultationFee: 1200,
    availability: [
      {
        day: "wednesday",
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
    ],
    isAvailableForEmergency: true,
    isActive: true,
    isVerified: true,
  },
  {
    username: "dr.deepa.iyer",
    email: "deepa.iyer@hospital.com",
    password: "Doctor@123",
    firstName: "Deepa",
    lastName: "Iyer",
    phone: "+919123456783",
    role: "doctor",
    gender: "female",
    dateOfBirth: new Date("1985-01-30"),
    address: {
      street: "404 Manipal Hospital",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560017",
      country: "India",
    },
    medicalLicenseNumber: "MED2024004",
    specialization: ["pediatrics"],
    department: "pediatrics",
    yearsOfExperience: 10,
    qualifications: [
      {
        degree: "MD",
        institution: "KMC, Manipal",
        year: 2012,
        specialty: "Pediatrics",
      },
    ],
    consultationFee: 800,
    availability: [
      {
        day: "thursday",
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
    ],
    isAvailableForEmergency: false,
    isActive: true,
    isVerified: true,
  },
  {
    username: "dr.arjun.mehta",
    email: "arjun.mehta@hospital.com",
    password: "Doctor@123",
    firstName: "Arjun",
    lastName: "Mehta",
    phone: "+919123456784",
    role: "doctor",
    gender: "male",
    dateOfBirth: new Date("1980-09-12"),
    address: {
      street: "505 Medanta",
      city: "Gurugram",
      state: "Haryana",
      zipCode: "122001",
      country: "India",
    },
    medicalLicenseNumber: "MED2024005",
    specialization: ["dermatology"],
    department: "outpatient",
    yearsOfExperience: 14,
    qualifications: [
      {
        degree: "MD",
        institution: "MAMC, Delhi",
        year: 2008,
        specialty: "Dermatology",
      },
    ],
    consultationFee: 1000,
    availability: [
      {
        day: "friday",
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
    ],
    isActive: true,
    isVerified: true,
  },
  {
    username: "dr.neha.joshi",
    email: "neha.joshi@hospital.com",
    password: "Doctor@123",
    firstName: "Neha",
    lastName: "Joshi",
    phone: "+919123456785",
    role: "doctor",
    gender: "female",
    dateOfBirth: new Date("1988-06-25"),
    address: {
      street: "606 Artemis Hospital",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411007",
      country: "India",
    },
    medicalLicenseNumber: "MED2024006",
    specialization: ["gynecology"],
    department: "maternity",
    yearsOfExperience: 8,
    qualifications: [
      {
        degree: "MS",
        institution: "BJ Medical College, Pune",
        year: 2015,
        specialty: "Gynecology",
      },
    ],
    consultationFee: 900,
    availability: [
      {
        day: "saturday",
        startTime: "09:00",
        endTime: "15:00",
        isAvailable: true,
      },
    ],
    isActive: true,
    isVerified: true,
  },
  {
    username: "dr.rahul.verma",
    email: "rahul.verma@hospital.com",
    password: "Doctor@123",
    firstName: "Rahul",
    lastName: "Verma",
    phone: "+919123456786",
    role: "doctor",
    gender: "male",
    dateOfBirth: new Date("1972-04-18"),
    address: {
      street: "707 Columbia Asia",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700091",
      country: "India",
    },
    medicalLicenseNumber: "MED2024007",
    specialization: ["internal_medicine"],
    department: "outpatient",
    yearsOfExperience: 25,
    qualifications: [
      {
        degree: "MBBS",
        institution: "Calcutta Medical College",
        year: 1998,
        specialty: "General Practice",
      },
    ],
    consultationFee: 700,
    availability: [
      {
        day: "monday",
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
    ],
    isActive: true,
    isVerified: true,
  },
  {
    username: "dr.priya.patel",
    email: "priya.patel@hospital.com",
    password: "Doctor@123",
    firstName: "Priya",
    lastName: "Patel",
    phone: "+919123456787",
    role: "doctor",
    gender: "female",
    dateOfBirth: new Date("1983-12-01"),
    address: {
      street: "808 Sterling Hospital",
      city: "Ahmedabad",
      state: "Gujarat",
      zipCode: "380052",
      country: "India",
    },
    medicalLicenseNumber: "MED2024008",
    specialization: ["oncology"],
    department: "oncology",
    yearsOfExperience: 13,
    qualifications: [
      {
        degree: "DM",
        institution: "Gujarat Cancer & Research Institute",
        year: 2011,
        specialty: "Oncology",
      },
    ],
    consultationFee: 2000,
    availability: [
      {
        day: "tuesday",
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
    ],
    isActive: true,
    isVerified: true,
  },
];

const patientData = [
  {
    username: "amit.sharma",
    email: "amit.sharma@email.com",
    password: "Patient@123",
    firstName: "Amit",
    lastName: "Sharma",
    phone: "+918876543210",
    role: "patient",
    gender: "male",
    dateOfBirth: new Date("1990-08-25"),
    address: {
      street: "1 Green Park",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110016",
      country: "India",
    },
    emergencyContact: {
      name: "Sunita Sharma",
      relationship: "spouse",
      phone: "+918876543211",
      email: "sunita.sharma@email.com",
    },
    insuranceInfo: {
      provider: "Star Health",
      policyNumber: "SH123456",
      validUntil: new Date("2026-12-31"),
    },
    medicalHistory: [
      {
        condition: "Hypertension",
        diagnosedDate: new Date("2020-01-10"),
        status: "chronic",
      },
    ],
    allergies: [{ allergen: "Dust", severity: "mild", reaction: "Sneezing" }],
    currentMedications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        prescribedDate: new Date("2023-01-15"),
      },
    ],
    bloodGroup: "A+",
    height: 175,
    weight: 80,
    isActive: true,
    isVerified: true,
  },
  {
    username: "sneha.patil",
    email: "sneha.patil@email.com",
    password: "Patient@123",
    firstName: "Sneha",
    lastName: "Patil",
    phone: "+918876543212",
    role: "patient",
    gender: "female",
    dateOfBirth: new Date("1985-05-12"),
    address: {
      street: "2 Blue Ridge",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411057",
      country: "India",
    },
    emergencyContact: {
      name: "Rohan Patil",
      relationship: "sibling",
      phone: "+918876543213",
      email: "rohan.patil@email.com",
    },
    insuranceInfo: {
      provider: "ICICI Lombard",
      policyNumber: "IC987654",
      validUntil: new Date("2025-11-30"),
    },
    medicalHistory: [
      {
        condition: "Diabetes Type 2",
        diagnosedDate: new Date("2018-06-20"),
        status: "chronic",
      },
    ],
    currentMedications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        prescribedDate: new Date("2023-02-20"),
      },
    ],
    bloodGroup: "O+",
    height: 160,
    weight: 65,
    isActive: true,
    isVerified: true,
  },
  {
    username: "vijay.nair",
    email: "vijay.nair@email.com",
    password: "Patient@123",
    firstName: "Vijay",
    lastName: "Nair",
    phone: "+918876543214",
    role: "patient",
    gender: "male",
    dateOfBirth: new Date("1975-02-18"),
    address: {
      street: "3 Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560034",
      country: "India",
    },
    emergencyContact: {
      name: "Anjali Nair",
      relationship: "spouse",
      phone: "+918876543215",
      email: "anjali.nair@email.com",
    },
    insuranceInfo: {
      provider: "Max Bupa",
      policyNumber: "MB555666",
      validUntil: new Date("2027-01-15"),
    },
    medicalHistory: [
      {
        condition: "Asthma",
        diagnosedDate: new Date("2005-09-01"),
        status: "active",
      },
    ],
    allergies: [
      {
        allergen: "Pollen",
        severity: "moderate",
        reaction: "Breathing difficulty",
      },
    ],
    bloodGroup: "B+",
    height: 180,
    weight: 75,
    isActive: true,
    isVerified: true,
  },
  {
    username: "kavita.rao",
    email: "kavita.rao@email.com",
    password: "Patient@123",
    firstName: "Kavita",
    lastName: "Rao",
    phone: "+918876543216",
    role: "patient",
    gender: "female",
    dateOfBirth: new Date("2000-11-30"),
    address: {
      street: "4 Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500033",
      country: "India",
    },
    emergencyContact: {
      name: "Suresh Rao",
      relationship: "parent",
      phone: "+918876543217",
      email: "suresh.rao@email.com",
    },
    insuranceInfo: {
      provider: "Star Health",
      policyNumber: "SH789012",
      validUntil: new Date("2026-08-20"),
    },
    allergies: [
      { allergen: "Penicillin", severity: "severe", reaction: "Rash" },
    ],
    bloodGroup: "AB-",
    height: 165,
    weight: 55,
    isActive: true,
    isVerified: true,
  },
  // Add 11 more patients for a total of 15
  ...Array.from({ length: 11 }, (_, i) => ({
    username: `patient${i + 5}`,
    email: `patient${i + 5}@email.com`,
    password: "Patient@123",
    firstName: `First${i + 5}`,
    lastName: `Last${i + 5}`,
    phone: `+9188765433${20 + i}`,
    role: "patient",
    gender: i % 2 === 0 ? "male" : "female",
    dateOfBirth: new Date(1960 + i * 3, i % 12, 1 + i),
    address: {
      street: `${i + 5} Main St`,
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
    },
    emergencyContact: {
      name: `Emergency ${i + 5}`,
      relationship: "friend",
      phone: `+9188765434${20 + i}`,
    },
    insuranceInfo: {
      provider: "ICICI Lombard",
      policyNumber: `IC${1000 + i}`,
      validUntil: new Date("2025-12-31"),
    },
    bloodGroup: "O-",
    height: 170,
    weight: 70,
    isActive: true,
    isVerified: true,
  })),
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected...");

    console.warn("Clearing existing data...");
    await User.deleteMany({});
    await Appointment.deleteMany({});
    console.log("Existing data cleared.");

    // Hash passwords
    const hashedAdminData = await Promise.all(
      adminData.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password),
      }))
    );
    const hashedDoctorData = await Promise.all(
      doctorData.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password),
      }))
    );
    const hashedPatientData = await Promise.all(
      patientData.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password),
      }))
    );

    // Create Admins
    console.log("Creating admin users...");
    const createdAdmins = await User.insertMany(hashedAdminData);
    console.log(`${createdAdmins.length} admins created.`);

    // Create Doctors
    console.log("Creating doctors...");
    const createdDoctors = await Doctor.insertMany(hashedDoctorData);
    console.log(`${createdDoctors.length} doctors created.`);

    // Create Patients
    console.log("Creating patients...");
    const patientInsertData = hashedPatientData.map((patient) => {
      const randomDoctor =
        createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      patient.assignedDoctor = randomDoctor._id;
      if (patient.currentMedications && patient.currentMedications.length > 0) {
        patient.currentMedications.forEach((med) => {
          med.prescribedBy = randomDoctor._id;
        });
      }
      return patient;
    });
    const createdPatients = await Patient.insertMany(patientInsertData);
    console.log(`${createdPatients.length} patients created.`);

    // Update Doctor-Patient relationships
    console.log("Updating doctor-patient relationships...");
    for (const patient of createdPatients) {
      await Doctor.findByIdAndUpdate(patient.assignedDoctor, {
        $addToSet: { patients: patient._id },
      });
    }
    console.log("Doctor-patient relationships updated.");

    // Create Appointments
    console.log("Creating appointments...");
    const appointmentsData = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const randomPatient =
        createdPatients[Math.floor(Math.random() * createdPatients.length)];
      const assignedDoctor = createdDoctors.find((doc) =>
        doc._id.equals(randomPatient.assignedDoctor)
      );

      const dateOffset = Math.floor(Math.random() * 91) - 30; // -30 to +60 days from today
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + dateOffset);
      appointmentDate.setHours(
        Math.floor(Math.random() * 8) + 9,
        Math.random() > 0.5 ? 30 : 0,
        0,
        0
      ); // 9:00 - 16:30

      let status;
      if (dateOffset < 0) {
        status = Math.random() > 0.2 ? "completed" : "cancelled";
      } else if (dateOffset === 0) {
        status = Math.random() > 0.5 ? "confirmed" : "in_progress";
      } else {
        status = Math.random() > 0.5 ? "scheduled" : "confirmed";
      }

      const appointment = {
        patient: randomPatient._id,
        doctor: assignedDoctor._id,
        appointmentDate: appointmentDate,
        startTime: appointmentDate.toTimeString().substring(0, 5),
        endTime: addMinutes(appointmentDate, 30).toTimeString().substring(0, 5),
        duration: 30,
        type: ["consultation", "follow_up", "checkup", "emergency"][
          Math.floor(Math.random() * 4)
        ],
        status: status,
        department: assignedDoctor.department,
        reason: "Routine checkup",
        createdBy: createdAdmins[0]._id,
      };
      if (status === "cancelled") {
        appointment.cancelledBy = randomPatient._id;
        appointment.cancelReason = "Personal emergency";
      }
      appointmentsData.push(appointment);
    }
    const createdAppointments = await Appointment.insertMany(appointmentsData);
    console.log(`${createdAppointments.length} appointments created.`);

    // Update User-Appointment relationships
    console.log("Updating appointment relationships...");
    for (const appt of createdAppointments) {
      await Patient.findByIdAndUpdate(appt.patient, {
        $addToSet: { appointments: appt._id },
      });
      await Doctor.findByIdAndUpdate(appt.doctor, {
        $addToSet: { appointments: appt._id },
      });
    }
    console.log("Appointment relationships updated.");

    console.log(`
    ========================================
    Database Seeding Completed Successfully!
    ========================================
    Admins created: ${createdAdmins.length}
    Doctors created: ${createdDoctors.length}
    Patients created: ${createdPatients.length}
    Appointments created: ${createdAppointments.length}
    ========================================
    Sample Login Credentials:
    Admin: ${adminData[0].email} / Admin@123
    Doctor: ${doctorData[0].email} / Doctor@123
    Patient: ${patientData[0].email} / Patient@123
    ========================================
    `);

    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();

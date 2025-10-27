import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, token is required" });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res
        .status(401)
        .json({ message: "Not authorized, token is invalid" });
    }
    const user = await User.findById(decode.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    // ensure protectRoute ran and attached user
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user is required" });
    }

    // allow only users with role 'admin'
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }

    next();
  } catch (error) {
    console.log("Error in isAdmin middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isDoctor = (req, res, next) => {
  try {
    // ensure protectRoute ran and attached user
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user is required" });
    }

    // allow only users with role 'doctor'
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied, doctor only" });
    }

    next();
  } catch (error) {
    console.log("Error in isDoctor middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isPatient = (req, res, next) => {
  try {
    // ensure protectRoute ran and attached user
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user is required" });
    }

    // allow only users with role 'patient'
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Access denied, patient only" });
    }

    next();
  } catch (error) {
    console.log("Error in isPatient middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

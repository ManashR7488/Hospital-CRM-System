import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import { generateToken } from "./../utils/generateToke.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, phone, profileImage } =
      req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        message: "First name, last name, email, password and phone are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique username
    let username = email.split("@")[0];
    let usernameExists = await User.findOne({ username });
    let suffix = 1;
    while (usernameExists) {
      username = `${email.split("@")[0]}_${suffix}`;
      usernameExists = await User.findOne({ username });
      suffix++;
    }

    // Create new user
    const newUser = new User({
      firstName,
      middleName,
      lastName,
      profileImage,
      email,
      password: hashedPassword,
      phone,
      role: "patient",
      username,
    });

    await newUser.save();
    
    // Remove password from response
    newUser.password = undefined;
    
    res
      .status(201)
      .json({ user: newUser, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in register controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Check if user exists
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = await generateToken(existingUser._id, res);

    const user = {
      firstName: existingUser.firstName,
      middleName: existingUser.middleName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
    };

    res.status(200).json({ user, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, gender, address } = req.body;

    // Validation
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!lastName || !lastName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Last name is required",
      });
    }

    if (firstName.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "First name must not exceed 50 characters",
      });
    }

    if (lastName.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Last name must not exceed 50 characters",
      });
    }

    // Validate phone format if provided
    if (phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone.replace(/[\s-()]/g, ""))) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
      }
    }

    // Validate dateOfBirth is not in future if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (dob > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Date of birth cannot be in the future",
        });
      }
    }

    // Get current user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    if (phone) {
      // Normalize phone by stripping spaces, dashes, and parentheses
      const normalizedPhone = phone.replace(/[\s-()]/g, "");
      user.phone = normalizedPhone;
    }
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    
    // Update address if provided
    if (address) {
      user.address = {
        street: address.street || user.address?.street || "",
        city: address.city || user.address?.city || "",
        state: address.state || user.address?.state || "",
        zipCode: address.zipCode || user.address?.zipCode || "",
        country: address.country || user.address?.country || "India",
      };
    }

    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

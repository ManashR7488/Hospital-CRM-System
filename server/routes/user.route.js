import express from "express";
import { checkAuth, login, logout, register, updateProfile, changePassword } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/profile", protectRoute, checkAuth);

router.put("/profile", protectRoute, updateProfile);

router.put("/password", protectRoute, changePassword);

export default router;

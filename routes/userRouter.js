import express from "express";
import { registerUser, loginUser, adminLogin, getProfile, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// User routes
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);
router.get("/api/profile", authMiddleware, getProfile);
router.put("/api/update", authMiddleware, upload.single("profilePic"), updateProfile);

// Admin login
router.post("/admin/login", adminLogin);

export default router;

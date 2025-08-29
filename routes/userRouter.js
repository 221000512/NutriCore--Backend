import express from "express";
import { registerUser, loginUser, adminLogin, getProfile, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";
import multer from "multer";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/api/user/register", registerUser);
router.post("/api/user/login", loginUser);
router.post("/api/admin/login", adminLogin);
router.get("/api/user/profile", authMiddleware, getProfile);
router.put("/api/user/update", authMiddleware, upload.single("profilePic"), updateProfile);

export default router;

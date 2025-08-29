import express from "express";
import { registerUser, loginUser, adminLogin, getProfile, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";
import multer from "multer";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin", adminLogin);
router.get("/profile", authMiddleware, getProfile);
router.put("/update", authMiddleware, upload.single("profilePic"), updateProfile);

export default router;

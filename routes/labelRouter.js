// backend/routes/labelRouter.js
import express from "express";
import { analyzeLabel } from "../controllers/labelController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();
router.post("/analyze", authMiddleware, analyzeLabel);
export default router;

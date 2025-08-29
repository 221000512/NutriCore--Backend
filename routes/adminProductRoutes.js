// backend/routes/adminProductRoutes.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// (Optional) simple admin auth check – replace with real middleware later.
const requireAdmin = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
  // TODO: verify token & admin role
  next();
};

// POST /api/admin/products
router.post("/products", requireAdmin, async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.json({ success: true, product: p });
  } catch (e) {
    res.status(400).json({ success: false, message: "Create failed", error: e.message });
  }
});

// PUT /api/admin/products/:id
router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product: p });
  } catch (e) {
    res.status(400).json({ success: false, message: "Update failed" });
  }
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: "Delete failed" });
  }
});

// (Optional) product history – basic example
router.get("/products/history", requireAdmin, async (req, res) => {
  // For a real history, persist audit logs. For now, return latest items.
  try {
    const latest = await Product.find().sort({ updatedAt: -1 }).limit(20).select("name category updatedAt");
    const history = latest.map((p) => ({ name: p.name, category: p.category, date: p.updatedAt, action: "modified" }));
    res.json({ success: true, history });
  } catch (e) {
    res.status(500).json({ success: false, message: "History fetch failed" });
  }
});

export default router;

// backend/routes/admin.routes.js
import express from "express";
import jwt from "jsonwebtoken";
import Product from "../models/productModel.js";

const router = express.Router();

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.json({ success: true, token, admin: { email, role: "admin" } });
    }

    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * adminAuth middleware - validates token and verifies admin email
 * Exported so other modules can reuse it if needed.
 */
export const adminAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Ensure token includes email and matches ADMIN_EMAIL
    if (!decoded || decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    req.adminEmail = decoded.email;
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("adminAuth err:", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

/**
 * Create product
 * POST /api/admin/products
 * Body: product payload (expects at least name and image (array of URLs) )
 */
router.post("/products", adminAuth, async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.name || !payload.image || !Array.isArray(payload.image) || payload.image.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields: name and image (array of URLs)" });
    }

    const p = new Product({
      ...payload,
      history: [{ action: "Added", adminEmail: req.adminEmail, timestamp: new Date() }]
    });

    await p.save();
    return res.json({ success: true, product: p });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create product" });
  }
});

/**
 * Update product
 * PUT /api/admin/products/:id
 */
router.put("/products/:id", adminAuth, async (req, res) => {
  try {
    const updates = req.body || {};
    const id = req.params.id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Merge updates (shallow)
    Object.keys(updates).forEach((key) => {
      // don't allow overriding history directly from body
      if (key === "history") return;
      product[key] = updates[key];
    });

    product.history = product.history || [];
    product.history.push({ action: "Updated", adminEmail: req.adminEmail, timestamp: new Date() });

    const saved = await product.save();
    return res.json({ success: true, product: saved });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update product" });
  }
});

/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
router.delete("/products/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.history = product.history || [];
    product.history.push({ action: "Deleted", adminEmail: req.adminEmail, timestamp: new Date() });
    await product.save();

    await Product.findByIdAndDelete(id);
    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to delete product" });
  }
});

/**
 * List all products (admin view)
 * GET /api/admin/products
 */
router.get("/products", adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ success: true, products });
  } catch (err) {
    console.error("List products error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to list products" });
  }
});

/**
 * Simple history endpoint
 * GET /api/admin/products/history
 */
router.get("/products/history", adminAuth, async (req, res) => {
  try {
    // fetch last updated documents and flatten history
    const latest = await Product.find().sort({ updatedAt: -1 }).limit(50).select("name history updatedAt");
    const history = [];

    latest.forEach((p) => {
      (p.history || []).forEach((h) => {
        history.push({
          name: p.name,
          action: h.action,
          date: h.timestamp || h.date || p.updatedAt,
          adminEmail: h.adminEmail || null
        });
      });
    });

    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ success: true, history });
  } catch (err) {
    console.error("History fetch error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch history" });
  }
});

export default router;

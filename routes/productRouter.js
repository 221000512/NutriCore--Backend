// backend/routes/productRouter.js
import express from "express";
import multer from "multer";
import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp storage for uploaded files

// --- Get all products ---
router.get("/list", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load products" });
  }
});

// --- Get single product by ID ---
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product: p });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load product" });
  }
});

// --- Add new product ---
router.post("/admin/products", upload.array("images"), async (req, res) => {
  try {
    const { name, description, category, subCategory, labelData } = req.body;
    if (!name || !category) return res.status(400).json({ success: false, message: "Name and category are required" });

    // Upload images to Cloudinary
    const files = req.files || [];
    const imageUrls = await Promise.all(files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
      fs.unlinkSync(file.path);
      return result.secure_url;
    }));

    // Parse labelData
    let parsedLabel = {};
    try { parsedLabel = labelData ? JSON.parse(labelData) : {}; } 
    catch (err) { return res.status(400).json({ success: false, message: "Invalid labelData format" }); }

    const product = new Product({ name, description, category, subCategory, image: imageUrls, labelData });
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Update product ---
router.put("/admin/products/:id", upload.array("images"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, subCategory, labelData } = req.body;

    if (!name || !category) return res.status(400).json({ success: false, message: "Name and category are required" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Handle new uploaded images
    const files = req.files || [];
    let imageUrls = product.image || [];
    if (files.length > 0) {
      const uploaded = await Promise.all(files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
        fs.unlinkSync(file.path);
        return result.secure_url;
      }));
      imageUrls = [...imageUrls, ...uploaded];
    }

    // Parse labelData
    let parsedLabel = {};
    try { parsedLabel = typeof labelData === "string" ? JSON.parse(labelData) : labelData; }
    catch (err) { return res.status(400).json({ success: false, message: "Invalid labelData format" }); }

    product.name = name;
    product.description = description || "";
    product.category = category;
    product.subCategory = subCategory || "";
    product.image = imageUrls;
    product.labelData = parsedLabel;

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Delete product ---
router.delete("/admin/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

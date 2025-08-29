// backend/controllers/productController.js
import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, labelData } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const files = req.files || [];
    const imageUrls = await Promise.all(files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
      fs.unlinkSync(file.path); // delete local file
      return result.secure_url;
    }));

    let parsedLabel = {};
    try {
      parsedLabel = labelData ? JSON.parse(labelData) : {};
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid labelData format" });
    }

    const product = new Product({
      name,
      description,
      category,
      subCategory,
      image: imageUrls,
      labelData: parsedLabel,
      date: Date.now()
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, subCategory, labelData } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: "Name and category are required" });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Handle uploaded images if any
    let imageUrls = product.image || [];
    const files = req.files || [];
    if (files.length > 0) {
      const cloudinary = (await import("cloudinary")).v2;
      const fs = (await import("fs")).default;

      const uploaded = await Promise.all(files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
        fs.unlinkSync(file.path);
        return result.secure_url;
      }));
      imageUrls = [...imageUrls, ...uploaded];
    }

    // Parse labelData if sent as string
    let parsedLabel = {};
    try {
      parsedLabel = typeof labelData === "string" ? JSON.parse(labelData) : labelData;
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid labelData format" });
    }

    // Update fields
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
};



export const removeProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "ProductId required" });
    await Product.findByIdAndDelete(productId);
    res.json({ success: true, message: "Product removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

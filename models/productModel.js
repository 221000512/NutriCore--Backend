// backend/models/productModel.js
import mongoose from "mongoose";

// Nutrient sub-schema
const nutrientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String },
  color: { type: String, enum: ["red", "green", "orange", "gray"], default: "gray" },
  rda: { type: String, default: "" }
});

// Ingredient / Additive sub-schema
const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, enum: ["red", "green", "orange", "gray"], default: "gray" }
});

// LabelData
const labelDataSchema = new mongoose.Schema({
  rating: { type: Number, default: 0 },
  processing: { type: String, default: "" },
  nutrients: { type: [nutrientSchema], default: [] },
  ingredients: { type: [badgeSchema], default: [] },
  additives: { type: [badgeSchema], default: [] }
}, { _id: false });

// Main Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  image: { type: [String], default: [] }, 
  category: { type: String, default: "" },
  subCategory: { type: String, default: "" },
  bestseller: { type: Boolean, default: false },
  calories: { type: Number, default: 0 },
  labelData: { type: labelDataSchema, default: () => ({}) },
  history: [
    {
      action: { type: String },
      timestamp: { type: Date, default: Date.now },
      adminEmail: { type: String }
    }
  ]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;

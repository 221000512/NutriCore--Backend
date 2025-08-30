import User from "../models/userModel.js";

const badIngredients = [
  "sugar",
  "high fructose corn syrup",
  "monosodium glutamate",
  "trans fat",
  "artificial coloring",
];

const analyzeLabel = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ success: false, message: "No ingredients provided" });
    }

    // Convert to array
    const ingredientList = ingredients.split(",").map((i) => i.trim().toLowerCase());

    // Analyze each ingredient
    const analysis = ingredientList.map((item) => ({
      name: item,
      status: badIngredients.includes(item) ? "bad" : "good",
    }));

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { analyzeLabel };

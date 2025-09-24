const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: String,
  amount: String,
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructions: [String],
  ingredients: [ingredientSchema],
  area: String,
  tags: [String],
  categories: [String],
  diets: [String]
}, {collection: 'recipes'});

module.exports = mongoose.model("Recipe", recipeSchema);

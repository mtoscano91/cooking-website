const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  steps: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      quantity: Number,
      measure: {
        type: String,
        enum: ["g", "cups", "kg", "ml", "l", "unit", "spoon", "teaspoon"],
      },
      name: String,
    },
  ],
  imgName: String,
  imgPath: String,
  preparationTime: {
    type: Number,
    required: true,
  },
  difficulty: { type: Number, enum: [0, 1, 2, 3, 4, 5], required: true },
  tags: {
    type: [String],
    enum: [
      "vegan",
      "vegetarian",
      "gluten-free",
      "dairy-free",
      "keto",
      "macrobiotic",
      "healthy",
      "low-sugar",
    ],
  },
  servings: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    required: true,
  },
  rating: { type: Number },
  reviews: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
    },
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;

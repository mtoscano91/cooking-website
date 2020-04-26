const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  title: { type: String, required: true },
  recipe: { type: String, required: true },
  ingredients: [
    {
      quantity: Number,
      measure: {
        type: String,
        enum: ["g", "kg", "ml", "l", "unit", "spoon", "teaspoon"],
      },
      name: String,
    },
  ],
  recipeImg: String,
  duration: Number,
  difficulty: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  tags: {
    type: [String],
    enum: [
      "Vegan",
      "Vegetarian",
      "Gluten Free",
      "Lactose Free",
      "Keto",
      "Macrobiotic",
      "Fit diet",
    ],
  },
  rating: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  reviews: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
    },
  ],
  userThatLikes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;

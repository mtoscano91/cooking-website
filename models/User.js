const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  imgName: String,
  imgPath: {
    type: String,
    default:
      "https://image.shutterstock.com/z/stock-vector-woman-in-kitchen-cook-127186502.jpg",
  },
  tags: {
    type: [String],
    enum: [
      "Vegan",
      "Vegetarian",
      "Gluten Free",
      "Lactose Free",
      "Keto",
      "Macrobiotic",
      "Healthy",
      "Low sugar",
    ],
  },
  followers: {
    type: Number,
    default: 5,
  },
  following: {
    type: Number,
    default: 6,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;

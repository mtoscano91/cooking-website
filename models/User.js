const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
    // required: true,
  },
  imgName: String,
  imgPath: {
    type: String,
    default:
      "https://img.freepik.com/free-vector/small-chef-illustration_23-2147517820.jpg?size=338&ext=jpg",
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
  facebookId: String,
  shoppingList: [
    {
      recipeId: {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;

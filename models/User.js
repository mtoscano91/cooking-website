const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: String,
    password: String,
    email: String,
    userImg: String,
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
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");

/* GET home page */
router.get("/", (req, res, next) => {
  Recipe.find()
    .then((recipes) => {
      let sortedRecipes = recipes
        .sort(function (a, b) {
          return b.likes.length - a.likes.length;
        })
        .splice(0, 2);
      res.render("index", { recipes: sortedRecipes, user: req.user });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;

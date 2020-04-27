const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

const ensureLogin = require("connect-ensure-login");

router.get("/profile", ensureLogin.ensureLoggedIn("auth/login"), (req, res) => {
  res.render("profile", { user: req.user });
});

router.get(
  "/new-recipe",
  ensureLogin.ensureLoggedIn("auth/login"),
  (req, res) => {
    res.render("new-recipe", { user: req.user });
  }
);

router.get("/recipes", (req, res, next) => {
  console.log("Display some recipes");
  User.find()
    .then((usersFromDB) => {
      res.render("recipes", { users: usersFromDB, user: req.user });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/users", (req, res, next) => {
  console.log("Display some users");
  User.find()
    .then((usersFromDB) => {
      res.render("users", { users: usersFromDB, user: req.user });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/recipe/add", (req, res, next) => {
  console.log(req.user._id);
  const {
    title,
    recipe,
    recipeImg,
    duration,
    quantity,
    measure,
    name,
  } = req.body;
  const newRecipe = new Recipe({
    cook: req.user._id,
    title,
    recipe,
    ingredients: {
      $push: { quantity, measure, name },
    },
    // quantity,
    // measure,
    // name,
    recipeImg,
    duration,
  });
  newRecipe
    .save()
    .then((recipe) => {
      res.redirect("/recipes");
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/my-shopping-list", (req, res, next) => {
  User.find()
    .then((usersFromDB) => {
      res.render("shopping-list", { users: usersFromDB, user: req.user });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;

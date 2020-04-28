const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const uploader = require("../config/cloudinary.js");

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
  Recipe.find()
    .then((recipesFromDB) => {
      // console.log(recipesFromDB);
      res.render("recipes", { recipes: recipesFromDB, user: req.user });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/users", (req, res, next) => {
  console.log("Display some users");
  User.find()
    .then((usersFromDB) => {
      // console.log(usersFromDB);
      res.render("users", { users: usersFromDB, user: req.user });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/recipe/add", uploader.single("recipeImg"), (req, res, next) => {
  console.log(req.body);
  const {
    title,
    shortDescription,
    steps,
    preparationTime,
    difficulty,
    servings,
    quantity,
    measure,
    name,
    tags,
  } = req.body;
  let arrIngredients = [];
  for (let i = 0; i < name.length; i++) {
    arrIngredients.push({
      quantity: quantity[i],
      measure: measure[i],
      name: name[i],
    });
  }
  const imgPath = req.file.url;
  const imgName = req.file.originalname;
  if (typeof name === "string") {
    arrIngredients = [{ quantity, measure, name }];
  }
  console.log(req);
  console.log(tags);
  console.log(req.body);
  const newRecipe = new Recipe({
    user_id: req.user._id,
    title,
    steps,
    shortDescription,
    preparationTime,
    difficulty,
    servings,
    imgPath,
    imgName,
    ingredients: arrIngredients,
    tags,
  });
  newRecipe
    .save()
    .then((recipe) => {
      // console.log(recipe.ingredients);
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

router.get("/edit/profile", (req, res, next) => {
  const user = req.user;
  //console.log(req.user);
  res.render("edit/edit-profile", { user: user });
});

router.get("/recipe/:id", (req, res, next) => {
  const recipeId = req.params.id;
  Recipe.findById(recipeId)
    .populate("user_id")
    .then((recipe) => {
      console.log(recipe);
      res.render("selected-recipe", { recipe: recipe, user: req.user });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/user/:id", (req, res, next) => {
  console.log("route worked");
  const userId = req.params.id;
  Recipe.find({ user_id: userId })
    .populate("user_id")
    .then((recipes) => {
      console.log(recipes);
      if (recipes.length > 0)
        return res.render("selected-user", {
          recipes: recipes,
          user: req.user,
        });
      User.findById(userId).then((user) => {
        res.render("selected-user", { userProfile: user, user: req.user });
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/recipe/edit/:recipeId", (req, res) => {
  Recipe.findById(req.params.recipeId).then((recipe) => {
    console.log("dioni", recipe);
    res.render("recipeEdit", {
      recipe,
      recipeSting: JSON.stringify(recipe),
      user: req.user,
    });
  });
});

router.post("/recipes", (req, res, next) => {
  // it reaches here with req.body.tags, for
  let filteredTags = [];
  for (let i = 0; i < req.body.tags.length; i++) {
    filteredTags.push(req.body.tags[i]);
  }
  if (typeof req.body.tags === "string") {
    filteredTags = [req.body.tags];
  }

  let queries = [];
  filteredTags.forEach((query) => {
    queries.push({ tags: query });
  });

  Recipe.find({ $or: queries }).then((filteredRecipes) => {
    console.log(filteredRecipes);
    res.render("recipes", { recipes: filteredRecipes });
  });
});

router.post("/users", (req, res, next) => {
  // it reaches here with req.body.tags, for
  let filteredTags = [];
  for (let i = 0; i < req.body.tags.length; i++) {
    filteredTags.push(req.body.tags[i]);
  }
  if (typeof req.body.tags === "string") {
    filteredTags = [req.body.tags];
  }

  let queries = [];
  filteredTags.forEach((query) => {
    queries.push({ tags: query });
  });

  User.find({ $or: queries }).then((filteredUsers) => {
    console.log(filteredUsers);
    res.render("users", { users: filteredUsers });
  });
});

module.exports = router;

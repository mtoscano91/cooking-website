const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const uploader = require("../config/cloudinary.js");
const mongoose = require("mongoose");

// Bcrypt to encrypt passwords
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;

const ensureLogin = require("connect-ensure-login");

router.get(
  "/profile",
  ensureLogin.ensureLoggedIn("auth/signup"),
  (req, res) => {
    const userId = req.user._id;
    Recipe.find({ user_id: userId })
      .populate("user_id")
      .then((myRecipes) => {
        console.log(myRecipes);
        res.render("profile", { user: req.user, recipes: myRecipes });
      });
  }
);

router.get(
  "/new-recipe",
  ensureLogin.ensureLoggedIn("auth/signup"),
  (req, res) => {
    res.render("new-recipe", { user: req.user });
  }
);

router.get("/recipes", (req, res, next) => {
  console.log("get");
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
  // console.log(req.body);
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
  // console.log("name", name);
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
  // add a recipe
  // take the tags from the current recipe
  // we check if they are in the users tags
  // add the ones that are not there.
  let newRecipeSaved = newRecipe.save();
  let myUser = User.findById(req.user._id);
  Promise.all([newRecipeSaved, myUser])
    .then((response) => {
      // the response is an array with both promises. respose[0] => newRecipe.save(); response[1] => User.findById(req.user._id)
      console.log(response[0].tags);
      const recipeTags = response[0].tags;
      const userTags = response[1].tags; // this is an array
      const newTags = [
        ...userTags,
        ...recipeTags,
        ...recipeTags,
        ...recipeTags,
      ];
      const set = [...new Set(newTags)];
      // console.log("NEW  AND IMPROVED DIONI NOW GETS SPREAD OPERATOR", set);
      User.findByIdAndUpdate(req.user._id, { tags: set }, { new: true }).then(
        (updateUser) => {
          console.log(updateUser);
          res.redirect("/recipes");
        }
      );
      /*  req.user.tags.push(response[0].tags[0]);
      console.log(
        req.user.tags,
        //myUser.tags,
        //myUser.Query,
        response[0].tags,
        //User.findByIdAndUpdate(req.user._id)
        response[1].tags
      ); // IUpdate the user with the relevant tags -> missing one query => User.findByIdAndUpdate */
    })
    // newRecipe
    //   .save()
    //   .then((recipe) => {
    //     User.findById(req.user._id).then((userId) => {
    //       res.redirect("/recipes");
    //     });
    //     // console.log(recipe.ingredients);
    //   })
    .catch((error) => {
      console.log(error);
    });
});

router.get(
  "/shopping-list/:id",
  ensureLogin.ensureLoggedIn("../auth/signup"),
  (req, res, next) => {
    let isUser = false;
    const userId = req.params.id;
    if (userId == req.user._id) isUser = true;
    User.findById(userId)
      .populate("shoppingList.recipeId")
      .then((userFound) => {
        const shoppingList = userFound.shoppingList.map(({ recipeId }) => ({
          ...recipeId["_doc"],
        }));
        /// For each ingr, get name and quantity.
        // List of ingredients with their respetive measures (all added up -> if possible)
        const allIngredients = shoppingList
          .map(({ ingredients }) => ingredients)
          .flat()
          .reduce((acc, ingr) => {
            const currentIngr = acc[ingr.name];

            if (currentIngr) {
              if (currentIngr.measure === ingr.measure) {
                currentIngr.quantity += ingr.quantity;
                return { ...acc };
              } else {
                currentIngr.quantity2 = ingr.quantity;
                currentIngr.measure2 = ingr.measure;
                return { ...acc };
              }
            } else {
              return {
                ...acc,
                [ingr.name]: {
                  quantity: ingr.quantity,
                  measure: ingr.measure,
                  name: ingr.name,
                },
              };
            }
          }, {});

        //res.send(Object.values(allIngredients));
        //res.send(shoppingList);
        res.render("shopping-list", {
          userFound: userFound,
          user: req.user,
          shoppingList: shoppingList,
          ingredients: Object.values(allIngredients),
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.get("/edit/profile", (req, res, next) => {
  const user = req.user;
  //console.log(req.user);
  res.render("edit/edit-profile", { user: user });
});

router.get(
  "/recipe/:id",
  ensureLogin.ensureLoggedIn("../auth/signup"),
  (req, res, next) => {
    const recipeId = req.params.id;
    let isUser = false;
    let isLiked = false;
    let isSaved = false;
    Recipe.findById(recipeId)
      .populate("user_id")
      .then((recipe) => {
        const userId = recipe.user_id._id;
        const reqUserId = req.user._id;
        if (userId.equals(reqUserId)) isUser = true;
        console.log(recipe.user_id.shoppingList);
        for (let i = 0; i < recipe.likes.length; i++) {
          if (recipe.likes[i].user_id.equals(reqUserId)) isLiked = true;
        }
        for (let i = 0; i < recipe.user_id.shoppingList.length; i++) {
          if (recipe.user_id.shoppingList[i].recipeId.equals(recipeId))
            isSaved = true;
        }

        console.log(isLiked, isSaved);
        res.render("selected-recipe", {
          recipe: recipe,
          user: req.user,
          isUser,
          isSaved,
          isLiked,
          id: JSON.stringify(recipe),
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.get(
  "/user/:id",
  ensureLogin.ensureLoggedIn("../auth/signup"),
  (req, res, next) => {
    let isUser = false;
    const userId = req.params.id;
    if (userId == req.user._id) isUser = true;
    Recipe.find({ user_id: userId })
      .populate("user_id")
      .then((recipes) => {
        if (recipes.length > 0)
          return res.render("user-id", {
            recipes: recipes,
            user: req.user,
            isUser: isUser,
          });
        User.findById(userId).then((user) => {
          res.render("user-id", {
            userNoRecipes: user,
            user: req.user,
            isUser,
          });
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post("/userphoto/edit/:id", uploader.single("userImg"), (req, res) => {
  console.log(req.file.url);
  let imgPath = req.file.url;
  let imgName = req.file.originalname;
  User.findByIdAndUpdate(req.user._id, {
    imgPath,
    imgName,
  })
    .then(() => {
      res.redirect("/user/" + req.params.id);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/recipe/edit/:recipeId", (req, res) => {
  Recipe.findById(req.params.recipeId).then((recipe) => {
    // console.log("dioni", recipe);
    res.render("recipeEdit", {
      recipe,
      recipeSting: JSON.stringify(recipe),
      user: req.user,
    });
  });
});

router.get("/recipe/delete/:recipeId", (req, res) => {
  Recipe.deleteOne({ _id: req.params.recipeId })
    .then(() => {
      res.redirect("/recipes");
    })
    .catch((err) => {
      next(err);
    });
});

router.post(
  "/recipe/edit/:recipeId",
  uploader.single("recipeImg"),
  (req, res) => {
    console.log("req.body=", req.body);
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
    // console.log("name", recipe.ingredients);
    for (let i = 0; i < name.length; i++) {
      arrIngredients.push({
        quantity: quantity[i],
        measure: measure[i],
        name: name[i],
      });
    }

    let imgPath = req.body.imgPath;
    let imgName = req.body.imgName;
    if (req.file) {
      imgPath = req.file.url;
      imgName = req.file.originalname;
    }

    if (typeof name === "string") {
      arrIngredients = [{ quantity, measure, name }];
    }

    Recipe.findByIdAndUpdate(req.params.recipeId, {
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
    })
      .then((recipe) => {
        res.redirect("/recipes");
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post("/recipes", (req, res, next) => {
  console.log("console log de", req.body.text, "tillhere");
  if (req.body.text) {
    let dioni = req.body.text;
    console.log("buscando");
    Recipe.find({ title: { $regex: dioni, $options: "i" } }).then((text) => {
      console.log(text);
      res.render("recipes", { recipes: text, user: req.user });
    });
  }

  if (req.body.tags) {
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

    Recipe.find({ $or: queries })
      .then((filteredRecipes) => {
        // console.log(filteredRecipes);
        if (filteredRecipes == "") {
          ////This is not working
          Recipe.find().then((recipes) => {
            res.json({
              message: "Oops! No recipes were found",
              recipes: recipes,
              user: req.user,
            });
            res.redirect("/recipes");
            return;
          });
        }
        res.render("recipes", { recipes: filteredRecipes, user: req.user });
      })
      .catch((err) => {
        next(err);
      });
  }
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

router.get("/liked-recipes/:id", (req, res, next) => {
  let isUser = false;
  const userId = req.params.id;
  if (userId == req.user._id) isUser = true;
  // Recipe.find({ likes: { $in: { user_id: mongoose.Types.ObjectId(userId) } } })
  Recipe.find({})
    .populate("likes.user_id")
    .then((idRecipes) => {
      // console.log("idRecipes:", idRecipes);
      const myLikesRecipes = idRecipes.filter((el) => el.likes.length);
      const likesByMe = [];

      myLikesRecipes.forEach((recipe) => {
        recipe.likes.forEach((like) => {
          if (like.user_id.equals(userId)) {
            likesByMe.push(recipe);
          }
        });
      });
      User.findById(userId).then((foundUser) => {
        if (likesByMe.length > 0) {
          console.log(foundUser);
          return res.render("liked-recipes", {
            recipes: likesByMe,
            foundUser: foundUser,
            user: req.user,
            isUser: isUser,
          });
        }
        res.render("liked-recipes", {
          userNoRecipes: foundUser,
          user: req.user,
          isUser,
        });
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/update-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isSaved = false;
  User.findById(userId).then((userFound) => {
    console.log("user found", userFound);
    //Check if recipe is in list already and filter it
    let auxShoppingList = userFound.shoppingList;
    auxShoppingList = auxShoppingList.filter((el) => {
      return el.recipeId != recipeId;
    });
    let returnedShoppingList = userFound.shoppingList;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxShoppingList.length === userFound.shoppingList.length) {
      returnedShoppingList.push({ recipeId: recipeId });
      isSaved = true;
    } else {
      //If it was the same, then it was filtered
      returnedShoppingList = auxShoppingList;
    }
    //Update with new values
    User.findByIdAndUpdate(
      userId,
      {
        shoppingList: returnedShoppingList,
      },
      { new: true }
    )
      .then((userUpdated) => {
        console.log(userUpdated, isSaved);
        console.log("userUpdated:", userUpdated.shoppingList);
        res.json({ userUpdated, isSaved });
      })
      .catch((err) => {
        next(err);
      });
  });
});
//     .catch((err) => {
//       next(err);
//     });
// });

router.get("/like-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  console.log("LIIIIIIIIIIIIIIIIIIKED MOTHAFUCKA");
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isLiked = false;
  Recipe.findById(recipeId).then((recipeFound) => {
    //console.log("recipe found", recipeFound);
    //Check if recipe is in list already and filter it
    let auxLikedList = recipeFound.likes;
    auxLikedList = auxLikedList.filter((el) => {
      console.log("match", el.user_id, userId);
      return !el.user_id.equals(userId);
    });
    let returnedLikedList = recipeFound.likes;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxLikedList.length === recipeFound.likes.length) {
      returnedLikedList.push({ user_id: userId });
      isLiked = true;
    } else {
      //If it was the same, then it was filtered
      returnedLikedList = auxLikedList;
    }
    //Update with new values
    Recipe.findByIdAndUpdate(
      recipeId,
      {
        likes: returnedLikedList,
      },
      { new: true }
    )
      .then((recipeUpdated) => {
        console.log(isLiked);
        console.log("recipeUpdated:", recipeUpdated.likes);
        res.status(200).json({ recipeUpdated, isLiked });
      })
      .catch((err) => {
        next(err);
      });
  });
});
//       user: req.user,
//       isUser,
//     });
//   });
// })
// .catch((err) => {
//   next(err);
// });

router.get("/update-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isSaved = false;
  User.findById(userId).then((userFound) => {
    console.log("user found", userFound);
    //Check if recipe is in list already and filter it
    let auxShoppingList = userFound.shoppingList;
    auxShoppingList = auxShoppingList.filter((el) => {
      return el.recipeId != recipeId;
    });
    let returnedShoppingList = userFound.shoppingList;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxShoppingList.length === userFound.shoppingList.length) {
      returnedShoppingList.push({ recipeId: recipeId });
      isSaved = true;
    } else {
      //If it was the same, then it was filtered
      returnedShoppingList = auxShoppingList;
    }
    //Update with new values
    User.findByIdAndUpdate(
      userId,
      {
        shoppingList: returnedShoppingList,
      },
      { new: true }
    )
      .then((userUpdated) => {
        console.log(userUpdated, isSaved);
        console.log("userUpdated:", userUpdated.shoppingList);
        res.json({ userUpdated, isSaved });
      })
      .catch((err) => {
        next(err);
      });
  });
});
//     .catch((err) => {
//       next(err);
//     });
// });

router.get("/like-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isLiked = false;
  Recipe.findById(recipeId).then((recipeFound) => {
    //console.log("recipe found", recipeFound);
    //Check if recipe is in list already and filter it
    let auxLikedList = recipeFound.likes;
    auxLikedList = auxLikedList.filter((el) => {
      console.log("match", el.user_id, userId);
      return Object.toString(el.user_id) != Object.toString(userId);
    });
    let returnedLikedList = recipeFound.likes;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxLikedList.length === recipeFound.likes.length) {
      returnedLikedList.push({ user_id: userId });
      isLiked = true;
    } else {
      //If it was the same, then it was filtered
      returnedLikedList = auxLikedList;
    }
    //Update with new values
    Recipe.findByIdAndUpdate(
      recipeId,
      {
        likes: returnedLikedList,
      },
      { new: true }
    )
      .then((recipeUpdated) => {
        console.log(isLiked);
        console.log("recipeUpdated:", recipeUpdated.likes);
        res.status(200).json({ recipeUpdated, isLiked });
      })
      .catch((err) => {
        next(err);
      });
  });
});
//           user: req.user,
//           isUser,
//         });
//       });
//     })
//     .catch((err) => {
//       next(err);
//     });
// });

router.get("/update-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isSaved = false;
  User.findById(userId).then((userFound) => {
    console.log("user found", userFound);
    //Check if recipe is in list already and filter it
    let auxShoppingList = userFound.shoppingList;
    auxShoppingList = auxShoppingList.filter((el) => {
      return el.recipeId != recipeId;
    });
    let returnedShoppingList = userFound.shoppingList;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxShoppingList.length === userFound.shoppingList.length) {
      returnedShoppingList.push({ recipeId: recipeId });
      isSaved = true;
    } else {
      //If it was the same, then it was filtered
      returnedShoppingList = auxShoppingList;
    }
    //Update with new values
    User.findByIdAndUpdate(
      userId,
      {
        shoppingList: returnedShoppingList,
      },
      { new: true }
    )
      .then((userUpdated) => {
        console.log(userUpdated, isSaved);
        console.log("userUpdated:", userUpdated.shoppingList);
        res.json({ userUpdated, isSaved });
      })
      .catch((err) => {
        next(err);
      });
  });
});
//     .catch((err) => {
//       next(err);
//     });
// });

router.get("/like-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isLiked = false;
  Recipe.findById(recipeId).then((recipeFound) => {
    //console.log("recipe found", recipeFound);
    //Check if recipe is in list already and filter it
    let auxLikedList = recipeFound.likes;
    auxLikedList = auxLikedList.filter((el) => {
      console.log("match", el.user_id, userId);
      return Object.toString(el.user_id) != Object.toString(userId);
    });
    let returnedLikedList = recipeFound.likes;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxLikedList.length === recipeFound.likes.length) {
      returnedLikedList.push({ user_id: userId });
      isLiked = true;
    } else {
      //If it was the same, then it was filtered
      returnedLikedList = auxLikedList;
    }
    //Update with new values
    Recipe.findByIdAndUpdate(
      recipeId,
      {
        likes: returnedLikedList,
      },
      { new: true }
    )
      .then((recipeUpdated) => {
        console.log(isLiked);
        console.log("recipeUpdated:", recipeUpdated.likes);
        res.status(200).json({ recipeUpdated, isLiked });
      })
      .catch((err) => {
        next(err);
      });
  });
});
//           user: req.user,
//           isUser,
//         });
//       });
//     })
//     .catch((err) => {
//       next(err);
//     });
// });

router.get("/update-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isSaved = false;
  User.findById(userId).then((userFound) => {
    console.log("user found", userFound);
    //Check if recipe is in list already and filter it
    let auxShoppingList = userFound.shoppingList;
    auxShoppingList = auxShoppingList.filter((el) => {
      return el.recipeId != recipeId;
    });
    let returnedShoppingList = userFound.shoppingList;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxShoppingList.length === userFound.shoppingList.length) {
      returnedShoppingList.push({ recipeId: recipeId });
      isSaved = true;
    } else {
      //If it was the same, then it was filtered
      returnedShoppingList = auxShoppingList;
    }
    //Update with new values
    User.findByIdAndUpdate(
      userId,
      {
        shoppingList: returnedShoppingList,
      },
      { new: true }
    )
      .then((userUpdated) => {
        console.log(userUpdated, isSaved);
        console.log("userUpdated:", userUpdated.shoppingList);
        res.json({ userUpdated, isSaved });
      })
      .catch((err) => {
        next(err);
      });
  });
});
//     .catch((err) => {
//       next(err);
//     });
// });

router.get("/like-list/:id", (req, res, next) => {
  //console.log(req.params.id, req.user);
  const recipeId = req.params.id;
  const userId = req.user._id;
  let isLiked = false;
  Recipe.findById(recipeId).then((recipeFound) => {
    //console.log("recipe found", recipeFound);
    //Check if recipe is in list already and filter it
    let auxLikedList = recipeFound.likes;
    auxLikedList = auxLikedList.filter((el) => {
      console.log("match", el.user_id, userId);
      return Object.toString(el.user_id) != Object.toString(userId);
    });
    let returnedLikedList = recipeFound.likes;
    // If it wasnt the length are the same, so add it to the list. And set isSaved to true
    if (auxLikedList.length === recipeFound.likes.length) {
      returnedLikedList.push({ user_id: userId });
      isLiked = true;
    } else {
      //If it was the same, then it was filtered
      returnedLikedList = auxLikedList;
    }
    //Update with new values
    Recipe.findByIdAndUpdate(
      recipeId,
      {
        likes: returnedLikedList,
      },
      { new: true }
    )
      .then((recipeUpdated) => {
        console.log(isLiked);
        console.log("recipeUpdated:", recipeUpdated.likes);
        res.status(200).json({ recipeUpdated, isLiked });
      })
      .catch((err) => {
        next(err);
      });
  });
});

module.exports = router;

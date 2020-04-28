// console.log(recipeObj);

function fixTagInputsCheckbox() {
  let allTagInputs = document.querySelectorAll(".tag-input-checkbox");
  for (let i = 0; i < allTagInputs.length; i++) {
    recipeObj.tags.forEach((element) => {
      if (element == allTagInputs[i].value) {
        allTagInputs[i].checked = true;
      }
    });
  }
}
fixTagInputsCheckbox();

function fixdifficulty() {
  let allDificulty = document.querySelectorAll(".tag-input-difficulty");
  // console.log("boombb", allDificulty.length);
  for (let i = 0; i < allDificulty.length; i++) {
    if (recipeObj.difficulty == allDificulty[i].value) {
      allDificulty[i].selected = true;
    }
  }
}
fixdifficulty();

function fixservings() {
  let allServings = document.querySelectorAll(".tag-input-servings");
  // console.log("boombb", allDificulty.length);
  for (let i = 0; i < allServings.length; i++) {
    if (recipeObj.servings == allServings[i].value) {
      allServings[i].selected = true;
    }
  }
}
fixservings();

function fixmeasure() {
  let allMeasure = document.querySelectorAll("#measure");
  console.log(allMeasure);
  const allSelectArr = Array.from(allMeasure);
  console.log(allSelectArr);
  const addingToArrTheIndexes = allSelectArr.map((selectArr, index) => {
    // console.log(el);
    return Array.from(selectArr).map((option) => {
      if (option.innerText === recipeObj.ingredients[index].measure) {
        option.selected = true;
      }
      return option;
    });
  });
}
fixmeasure();

console.log(recipeObj);

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

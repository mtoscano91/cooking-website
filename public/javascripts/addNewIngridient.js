let copyOfTheingridientDiv = document
  .querySelector(".ingredients-in-form")
  .cloneNode(true);

document.querySelector("#add-recipie-in-form").onclick = function (event) {
  event.preventDefault();
  let newCopyOfTheingridientDiv = copyOfTheingridientDiv.cloneNode(true);
  deleteElement(newCopyOfTheingridientDiv);
  document
    .querySelector("#all-ingridients-form")
    .appendChild(newCopyOfTheingridientDiv);
};

deleteElement(document.querySelector(".ingredients-in-form"));

function deleteElement(element) {
  element.querySelector("#delete-recipie-in-form").onclick = function (event) {
    event.preventDefault();
    document.querySelector("#all-ingridients-form").removeChild(element);
  };
}

const spinner = document.getElementById("spinner");

export function toggleSpinner(value) {
  if (value === true) {
    spinner.style.display = "flex";
  } else {
    spinner.style.display = "none";
  }
}
